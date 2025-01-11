const PublicCampaign = {
    template: `
    <div class="container-mt -3">
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <router-link to="/influencer-dashboard" class="navbar-brand">IESCP - Influencer</router-link>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <button @click="logout" class="btn btn-outline-light">Logout</button>
          </li>
          <li class="nav-item">
            <router-link to="/influencer-dashboard/public-campaigns" class="btn btn-light">Public Campaigns</router-link>
          </li>
        </ul>
      </div>
    </nav>
        <h2>Public Campaigns</h2>
        
        <div class="input-group mb-3">
            <input v-model="searchQuery" type="text" class="form-control" placeholder="Search campaigns by keyword">
            <input v-model="minBudget" type="number" class="form-control" placeholder="Min Budget">
            <input v-model="maxBudget" type="number" class="form-control" placeholder="Max Budget">
            <button @click="searchCampaigns" class="btn btn-primary">Search</button>
        </div>
        <table class="table table-striped table-bordered" v-if="campaigns.length > 0">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Budget</th>
                    <th>Goals</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="campaign in campaigns" :key="campaign.id">
                    <td>{{ campaign.name }}</td>
                    <td>{{ campaign.description }}</td>
                    <td>{{ campaign.start_date }}</td>
                    <td>{{ campaign.end_date }}</td>
                    <td>{{ campaign.budget }}</td>
                    <td>{{ campaign.goals }}</td>
                    <td>
                        <button @click="openCreateAdRequestModal(campaign)" class="btn btn-success">Create Ad Request</button>
                        <button @click="showAdRequests(campaign)" class="btn btn-secondary">Show Ad Requests</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-else>
            <div class="alert alert-warning">No public campaigns found.</div>
        </div>

        <!-- Modal for Showing Ad Requests -->
        <div class="modal fade" id="adRequestsModal" tabindex="-1" aria-labelledby="adRequestsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="adRequestsModalLabel">Ad Requests for {{ selectedCampaign.name }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="table table-striped table-bordered" v-if="adRequests.length > 0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Messages</th>
                                    <th>Requirements</th>
                                    <th>Payment Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="adreq in adRequests" :key="adreq.id">
                                    <td>{{ adreq.id }}</td>
                                    <td>{{ adreq.messages }}</td>
                                    <td>{{ adreq.requirements }}</td>
                                    <td>{{ adreq.payment_amount }}</td>
                                    <td>{{ adreq.status_adreq }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div v-else>
                            <div class="alert alert-info">No ad requests found for this campaign.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal for Creating Ad Request -->
        <div class="modal fade" id="createAdRequestModal" tabindex="-1" aria-labelledby="createAdRequestModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="createAdRequestModalLabel">Create Ad Request for {{ selectedCampaign.name }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitAdRequest">
                            <div class="mb-3">
                                <label for="messages" class="form-label">Messages</label>
                                <textarea v-model="newAdRequest.messages" id="messages" class="form-control" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="requirements" class="form-label">Requirements</label>
                                <textarea v-model="newAdRequest.requirements" id="requirements" class="form-control" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="payment_amount" class="form-label">Payment Amount</label>
                                <input v-model="newAdRequest.payment_amount" id="payment_amount" type="number" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            campaigns: [],
            adRequests: [],
            selectedCampaign: {},
            newAdRequest: {
                messages: '',
                requirements: '',
                payment_amount: null,
            },
            searchQuery: "",
            minBudget: null,
            maxBudget: null,
        };
    },
    methods: {
        fetchPublicCampaigns() {
            let url = '/api/campaigns/public';
            const params = [];
            if (this.searchQuery) params.push(`keyword=${this.searchQuery}`);
            if (this.minBudget) params.push(`min_budget=${this.minBudget}`);
            if (this.maxBudget) params.push(`max_budget=${this.maxBudget}`);
            if (params.length) url += `?${params.join('&')}`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to fetch public campaigns');
                    return response.json();
                })
                .then(data => {
                    this.campaigns = data.campaigns;
                })
                .catch(error => console.error(error));
        },
        openCreateAdRequestModal(campaign) {
            this.selectedCampaign = campaign;
            this.newAdRequest = { messages: '', requirements: '', payment_amount: null };
            const modal = new bootstrap.Modal(document.getElementById('createAdRequestModal'));
            modal.show();
        },
        submitAdRequest() {
            fetch(`/api/campaigns/${this.selectedCampaign.id}/adrequests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
                body: JSON.stringify(this.newAdRequest),
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to create ad request');
                    return response.json();
                })
                .then(data => {
                    alert('Ad request created successfully!');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createAdRequestModal'));
                    modal.hide();
                })
                .catch(error => console.error(error));
        },
        showAdRequests(campaign) {
            this.selectedCampaign = campaign;
            fetch(`/api/campaigns/${campaign.id}/adrequests`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to fetch ad requests');
                    return response.json();
                })
                .then(data => {
                    this.adRequests = data; 
                    const modal = new bootstrap.Modal(document.getElementById('adRequestsModal'));
                    modal.show();
                })
                .catch(error => console.error(error));
        },
        searchCampaigns() {
            this.fetchPublicCampaigns();
        },
        logout: async function(){
            const req = await fetch("/api/logout", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
            })
    
            const d = await req.json();
            if (req.ok) {
                localStorage.removeItem('token');
                alert("Logout Successful")
                this.$router.replace({ path: '/' })
            } else {
                alert(d.message)
            }
        
        },
    },
    mounted() {
        this.fetchPublicCampaigns();
    },
};


export default PublicCampaign