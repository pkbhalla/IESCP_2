const ViewCampaign = {
    template: `
    <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <router-link to="/sponsor-dashboard" class="navbar-brand">IESCP - Sponsor</router-link>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <button @click="logout" class="btn btn-outline-light">Logout</button>
          </li>
          <li class="nav-item">
            <router-link to="/sponsor-dashboard/campaigns" class="btn btn-light">View Campaigns</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/sponsor-dashboard/influencer-search" class="btn btn-outline-light">Search Influencers</router-link>
          </li>
          <li class="nav-item">
          <button class="btn btn-outline-light" @click="exportCampaigns">Export Campaigns</button>
          </li>
        </ul>
      </div>
    </nav>
        <div class="container mt-3">
            <h2>{{ campaign.name }}</h2>
            <div class="card mt-3">
                <div class="card-body">
                    <p>Start Date: {{ campaign.start_date }}</p>
                    <p>End Date: {{ campaign.end_date }}</p>
                    <p>Budget: {{ campaign.budget }}</p>
                    <p>Visibility: {{ campaign.visibility }}</p>
                    <p>Goals: {{ campaign.goals }}</p>
                </div>
            </div>

            <h2 class="mt-5">Ad Requests</h2>
            <div class="mt-3" v-if="adrequests.length === 0">
                <div class="alert alert-warning">No ad requests available.</div>
                
            </div>
            <table v-else class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Ad Request ID</th>
                        <th>Influencer ID</th>
                        <th>Messages</th>
                        <th>Requirements</th>
                        <th>Payment Amount</th>
                        <th>Status Adreq</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="adrequest in adrequests" :key="adrequest.id">
                        <td>{{ adrequest.id }}</td>
                        <td>{{ adrequest.influencer_id }}</td>
                        <td>{{ adrequest.messages }}</td>
                        <td>{{ adrequest.requirements }}</td>
                        <td>{{ adrequest.payment_amount }}</td>
                        <td>{{ adrequest.status_adreq }}</td>
                        <td>
                            <button @click="openEditModal(adrequest)" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editAdRequestModal">Edit</button>
                            <button @click="deleteAdRequest(adrequest)" class="btn btn-danger">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <router-link :to="'/sponsor-dashboard/campaigns/' + campaign.id + '/create-adrequest'" class="btn btn-primary">Create Ad Request</router-link>
        </div>

        <!-- Edit Modal -->
        <div class="modal fade" id="editAdRequestModal" tabindex="-1" aria-labelledby="editAdRequestModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editAdRequestModalLabel">Edit Ad Request</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="mb-3">
                                <label for="messages" class="form-label">Messages</label>
                                <textarea v-model="currentAdRequest.messages" class="form-control" id="messages"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="requirements" class="form-label">Requirements</label>
                                <textarea v-model="currentAdRequest.requirements" class="form-control" id="requirements"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="paymentAmount" class="form-label">Payment Amount</label>
                                <input type="number" v-model="currentAdRequest.payment_amount" class="form-control" id="paymentAmount" />
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="saveAdRequest">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            campaign: {},
            adrequests: [],
            currentAdRequest: {}, 
        };
    },
    methods: {
        openEditModal(adrequest) {
           
            this.currentAdRequest = { ...adrequest };
        },
        saveAdRequest() {
            const { id } = this.currentAdRequest;
            const campaignId = this.campaign.id;

            fetch(`/api/campaigns/${campaignId}/adrequests/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(this.currentAdRequest)
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw err; });
                    }
                    return response.json();
                })
                .then(data => {
                    
                    const index = this.adrequests.findIndex(ar => ar.id === id);
                    if (index !== -1) {
                        this.adrequests[index] = { ...this.currentAdRequest };
                    }
                    alert("Ad request updated successfully!");
                    
                    const modal = document.getElementById('editAdRequestModal');
                    const bootstrapModal = bootstrap.Modal.getInstance(modal);
                    bootstrapModal.hide();
                })
                .catch(error => {
                    console.error("Failed to update ad request:", error);
                    alert(`Failed to update ad request: ${error.message || JSON.stringify(error)}`);
                });
        },
        deleteAdRequest(adrequest) {
            fetch('/api/campaigns/' + this.campaign.id + '/adrequests/' + adrequest.id, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.adrequests = this.adrequests.filter(adreq => adreq.id !== adrequest.id);
                })
                .catch(error => console.error(error));
            alert("Ad request deleted successfully!");
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
        async exportCampaigns() {
            const token = localStorage.getItem("token"); 
            if (!token) {
              alert("You are not logged in. Please log in to export campaigns.");
              return;
            }
      
            try {
              const response = await fetch("/api/export_campaigns", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`, 
                },
              });
      
              if (response.ok) {
                const data = await response.json();
                alert(data.message);
              } else {
                const errorData = await response.json();
                alert(errorData.message || "Error occurred while exporting campaigns.");
              }
            } catch (error) {
              console.error("Error exporting campaigns:", error);
              alert("There was an issue exporting the campaigns.");
            }
          }
        
    },
    mounted() {
        const campaignId = this.$route.params.campaignId;

        
        fetch('/api/campaigns/' + campaignId, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch campaign details');
                return response.json();
            })
            .then(data => {
                this.campaign = data;
            })
            .catch(error => console.error(error));

        
        fetch('/api/campaigns/' + campaignId + '/adrequests', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch ad requests');
                return response.json();
            })
            .then(data => {
                this.adrequests = data;
            })
            .catch(error => console.error(error));
    }
};

export default ViewCampaign;
