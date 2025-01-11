const SponsorCampaigns ={
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
        <h2>Sponsor Campaigns</h2>
        <div>
            <div v-if="campaigns.length === 0" class="alert alert-warning">No campaigns available.
            </div>
            <div v-else class="d-flex flex-wrap justify-content-center">
                <div class="card m-2" v-for="campaign in campaigns" :key="campaign.id" style="width: 18rem;">
                    <div class="card-body">
                        <h5 class="card-title">{{ campaign.name }}</h5>
                        <p class="card-text">{{ campaign.description }}</p>
                        <p class="card-text">Start Date: {{ campaign.start_date }}</p>
                        <p class="card-text">End Date: {{ campaign.end_date }}</p>
                        <p class="card-text">Budget: {{ campaign.budget }}</p>
                        <p class="card-text">Visibility: {{ campaign.visibility }}</p>
                        <p class="card-text">Goals: {{ campaign.goals }}</p>
                        <router-link :to="'/sponsor-dashboard/campaigns/' + campaign.id" class="btn btn-primary">View</router-link>
                        <button class="btn btn-warning" @click="editCampaign(campaign)">Edit</button>
                        <button class="btn btn-danger" @click="deleteCampaign(campaign)">Delete</button>
                    </div>
                </div>
            </div>
            <router-link to="/sponsor-dashboard/campaigns/create-campaigns" class="btn btn-primary">Create Campaign</router-link>
        </div>
        <!-- Modal for editing campaign -->
        <div class="modal fade" id="editModal" tabindex="-1" role="dialog" aria-labelledby="editModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                         <div class="modal-header">
                            <h5 class="modal-title" id="editModalLabel">Edit Campaign</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
        
                    <div class="modal-body">
                        <form>
                            <div class="form-group">
                                <label for="editName">Name</label>
                                <input type="text" class="form-control" id="editName" v-model="editCampaignData.name">
                            </div>
                            <div class="form-group">
                                <label for="editDescription">Description</label>
                                <textarea class="form-control" id="editDescription" rows="3" v-model="editCampaignData.description"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="editEndDate">End Date</label>
                                <input type="date" class="form-control" id="editEndDate" v-model="editCampaignData.end_date">
                            </div>
                            <div class="form-group">
                                <label for="editBudget">Budget</label>
                                <input type="number" class="form-control" id="editBudget" v-model="editCampaignData.budget">
                            </div>
                            <div class="form-group">
                                <label for="editVisibility">Visibility</label>
                                <select class="form-control" id="editVisibility" v-model="editCampaignData.visibility">
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editGoals">Goals</label>
                                <textarea class="form-control" id="editGoals" rows="3" v-model="editCampaignData.goals"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="saveEditedCampaign">Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `, 
    data() {
        return {
            campaigns: [],
            editCampaignData: {
                name: "",
                description: "",
                end_date: "",
                budget: "",
                visibility: "",
                goals: "",
            }
        };
    },
    methods: {
        async fetchData() {
            try {
                const response = await fetch('/api/campaigns', {
                    method: "GET",
                    headers: {
                        'Content-type': "application/json",
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    this.campaigns = data || [];
                }
            } catch (error) {
                console.error(error);
            }
        },
        editCampaign(campaign) {
            this.editCampaignData = { ...campaign };
            $('#editModal').modal('show');
        },
        saveEditedCampaign() {
            fetch(`/api/campaigns/${this.editCampaignData.id}`, {
                method: "PUT",
                headers: {
                    'Content-type': "application/json",
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
                body: JSON.stringify(this.editCampaignData)
            })
            .then(response => {
                if (response.ok) {
                    this.fetchData();
                    $('#editModal').modal('hide');
                } else {
                    throw new Error('Failed to edit campaign');
                }
            })
            .catch(error => console.error(error));
        },
        deleteCampaign(campaign) {
            fetch(`/api/campaigns/${campaign.id}`, {
                method: "DELETE",
                headers: {
                    'Content-type': "application/json",
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                }
            })
            .then(response => {
                if (response.ok) {
                    this.fetchData();
                } else {
                    throw new Error('Failed to delete campaign');
                }
            })
            .catch(error => console.error(error));
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
       this.fetchData();
    },
    

}

export default SponsorCampaigns