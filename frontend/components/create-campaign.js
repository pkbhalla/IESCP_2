const CreateCampaign = {
    template: `
<div class="create-campaign">
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
    <h2>Create Campaign</h2>
    <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="name" class="form-control">
    </div>
    <div class="form-group">
        <label for="description">Description:</label>
        <textarea id="description" v-model="description" class="form-control"></textarea>
    </div>
    <div class="form-group">
        <label for="end_date">End Date:</label>
        <input type="date" id="end_date" v-model="end_date" class="form-control">
    </div>
    <div class="form-group">
        <label for="budget">Budget:</label>
        <input type="number" id="budget" v-model="budget" class="form-control"></input>
    </div>
    <div class="form-group">
        <label for="visibility">Visibility:</label>
        <select id="visibility" v-model="visibility" class="form-control">
            <option value="public">Public</option>
            <option value="private">Private</option>
        </select>
    </div>
    <div class="form-group">
        <label for="goals">Goals:</label>
        <input type="text" id="goals" v-model="goals" class="form-control"></input>
    </div>
    <button @click="createCampaign" class="btn btn-primary">Create Campaign</button>
</div>
    `,
    data() {
        return {
            name: '',
            description: '',
            end_date: '',
            budget: 0,
            visibility: '',
            goals: 'I want to...'
        };
    },
    methods: {
        createCampaign() {
            const campaignData = {
                name: this.name,
                description: this.description,
                end_date: this.end_date,
                budget: this.budget, 
                visibility: this.visibility, 
                goals: this.goals 
            };

            fetch('/api/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(campaignData)
                
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    this.$router.push('/sponsor-dashboard/campaigns'); 
                })
        
                .catch(error => console.error(error));
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
        if (!localStorage.getItem('token')) {
            this.$router.push('/');    
        }
    }
}

export default CreateCampaign