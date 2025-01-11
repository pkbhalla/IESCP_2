const InfluencerDashboard = {
    template: `
    <div class="influencer-dashboard container-mt -3">
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
            <router-link to="/influencer-dashboard/public-campaigns" class="btn btn-outline-light">Public Campaigns</router-link>
          </li>
        </ul>
      </div>
    </nav>
        <div class="mt-4">
            <h3>Pending Ad Requests</h3>
            <div v-if="pendingAdRequests.length === 0">
                <div class="alert alert-warning">No pending ad requests available.</div>
            </div>
            <table v-else class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Campaign ID</th>
                        <th>Messages</th>
                        <th>Requirements</th>
                        <th>Payment Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="adrequest in pendingAdRequests" :key="adrequest.id">
                        <td>{{ adrequest.id }}</td>
                        <td>{{ adrequest.campaign_id }}</td>
                        <td>{{ adrequest.messages }}</td>
                        <td>{{ adrequest.requirements }}</td>
                        <td>{{ adrequest.payment_amount }}</td>
                        <td>
                            <button class="btn btn-success" @click="acceptAdRequest(adrequest)">Accept</button>
                            <button class="btn btn-danger" @click="rejectAdRequest(adrequest)">Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="mt-4">
            <h3>Active Ad Requests</h3>
            <div v-if="activeAdRequests.length === 0">
                <div class="alert alert-warning">No active ad requests available.</div>
            </div>
            <table v-else class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Campaign ID</th>
                        <th>Messages</th>
                        <th>Requirements</th>
                        <th>Payment Amount</th>
                        <th>Created By</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="adrequest in activeAdRequests" :key="adrequest.id">
                        <td>{{ adrequest.id }}</td>
                        <td>{{ adrequest.campaign_id }}</td>
                        <td>{{ adrequest.messages }}</td>
                        <td>{{ adrequest.requirements }}</td>
                        <td>{{ adrequest.payment_amount }}</td>
                        <td>{{ adrequest.created_by }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `,
    data() {
        return {
            pendingAdRequests: [],
            activeAdRequests: [],
        };
    },
    methods: {
        fetchAdRequests() {
            fetch('/api/influencer/dashboard', {
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
                    this.pendingAdRequests = data.pending_adrequests;
                    this.activeAdRequests = data.active_adrequests;
                })
                .catch(error => console.error(error));
        },
        acceptAdRequest(adrequest) {
            fetch(`/api/adrequests/${adrequest.id}/respond`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'accepted' })
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to accept ad request');
                    return response.json();
                })
                .then(data => {
                    alert("Ad request accepted successfully!");
                   
                    this.fetchAdRequests();
                })
                .catch(error => {
                    console.error(error);
                    alert("Failed to accept ad request.");
                });
        },
        rejectAdRequest(adrequest) {
            fetch(`/api/adrequests/${adrequest.id}/respond`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'rejected' })
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to reject ad request');
                    return response.json();
                })
                .then(data => {
                    alert("Ad request rejected successfully!");
                  
                    this.fetchAdRequests();
                })
                .catch(error => {
                    console.error(error);
                    alert("Failed to reject ad request.");
                });
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
        
        }    
    },
    mounted() {
        this.fetchAdRequests();
    }
};

export default InfluencerDashboard;
