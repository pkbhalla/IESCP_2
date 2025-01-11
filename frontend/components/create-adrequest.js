const CreateAdRequest = {
    template:`
<div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <router-link to="/sponsor-dashboard" class="navbar-brand">IESCP - Sponsor</router-link>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item">
                    <button @click="logout" class="btn btn-outline-light">Logout</button>
                </li>
                <li class="nav-item">
                    <router-link to="/sponsor-dashboard/campaigns" class="btn btn-light">View
                        Campaigns</router-link>
                </li>
                <li class="nav-item">
                    <router-link to="/sponsor-dashboard/influencer-search" class="btn btn-outline-light">Search
                        Influencers</router-link>
                </li>
                <li class="nav-item">
                    <button class="btn btn-outline-light" @click="exportCampaigns">Export Campaigns</button>
                </li>
            </ul>
        </div>
    </nav>
    <h2>Create Ad Request</h2>
    <div class="form-group">
        <label for="influencer-select">Select Influencer:</label>
        <select id="influencer-select" v-model="selectedInfluencerId" class="form-control">
            <option value="">Select Influencer</option>
            <option v-for="influencer in influencers" :value="influencer.id" :key="influencer.id">
                {{ influencer.name }}
            </option>
        </select>
    </div>
    <div class="form-group">
        <label for="ad-requirements">Ad Requirements:</label>
        <input type="text" id="ad-requirements" v-model="adRequestData.requirements" class="form-control">
    </div>
    <div class="form-group">
        <label for="ad-message">Ad Message:</label>
        <input type="text" id="ad-message" v-model="adRequestData.messages" class="form-control">
    </div>
    <div class="form-group">
        <label for="ad-payment_amount">Ad Cost:</label>
        <input type="number" id="ad-payment_amount" v-model="adRequestData.payment_amount" class="form-control">
    </div>
    <button @click="createAdRequest" class="btn btn-primary">Create Ad Request</button>
</div>
    `
    ,
    data() {
        return {
            influencers: [], 
            adRequestData: {
                influencer_id: null,  
                requirements: '',     
                messages: '',         
                payment_amount: ''    
            }
        };
    },
    methods: {
        fetchInfluencers() {
            fetch('/api/influencers', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to fetch influencers');
                    return response.json();
                })
                .then(data => {
                    this.influencers = data;
                })
                .catch(error => console.error(error));
        },
        createAdRequest() {
            const campaignId = this.$route.params.campaignId;
            const payload = { 
                influencer_id: this.selectedInfluencerId,
                requirements: this.adRequestData.requirements,
                messages: this.adRequestData.messages,
                payment_amount: this.adRequestData.payment_amount,
            };
            console.log(payload);
        
            fetch(`/api/campaigns/${campaignId}/adrequests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(payload) 
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; }); 
                }
                return response.json();
            })
            .then(data => {
                alert("Ad request created successfully!");
                this.$router.push(`/sponsor-dashboard/campaigns/${campaignId}`);
            })
            .catch(error => {
                console.error("Error:", error); 
                alert(`Failed to create ad request: ${error.message || JSON.stringify(error)}`);
            });
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
        this.fetchInfluencers();  
    }
}    

export default CreateAdRequest