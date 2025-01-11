const InfluencerSearch = {
    template: `
<div class="influencer-search">
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
            <router-link to="/sponsor-dashboard/campaigns" class="btn btn-outline-light">View Campaigns</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/sponsor-dashboard/influencer-search" class="btn btn-light">Search Influencers</router-link>
          </li>
          <li class="nav-item">
          <button class="btn btn-outline-light" @click="exportCampaigns">Export Campaigns</button>
          </li>
        </ul>
      </div>
    </nav>
  <div class="container mt-5">
    <h2>Search Influencers</h2>
    <form class="form-inline mb-3">
      <input type="text" v-model="filters.name" placeholder="Name" class="form-control mr-2" />
      <input type="text" v-model="filters.username" placeholder="Username" class="form-control mr-2" />
      <input type="text" v-model="filters.niche" placeholder="Niche" class="form-control mr-2" />
      <input type="text" v-model="filters.category" placeholder="Category" class="form-control mr-2" />
      <input type="number" v-model="filters.reach" placeholder="Reach" class="form-control mr-2" />
    </form>

    <div v-if="influencers.length === 0" class="alert alert-warning">
      No influencers found.
    </div>
    <table v-else class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>Username</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="influencer in influencers" :key="influencer.id">
          <td>{{ influencer.name }}</td>
          <td>{{ influencer.username }}</td>
          <td>
            <button class="btn btn-info" @click="viewDetails(influencer)">View Details</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal for influencer details -->
    <div class="modal fade" id="influencerDetailsModal" tabindex="-1" role="dialog" aria-labelledby="influencerDetailsModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
        <div class="modal-header">
           <h5 class="modal-title" id="influencerDetailsModalLabel">{{ selectedInfluencer.name }}'s Details</h5>
         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
           </div>
          <div class="modal-body">
            <p><strong>Username:</strong> {{ selectedInfluencer.username }}</p>
            <p><strong>Email:</strong> {{ selectedInfluencer.email }}</p>
            <p><strong>Category:</strong> {{ selectedInfluencer.inf_category }}</p>
            <p><strong>Niche:</strong> {{ selectedInfluencer.inf_niche }}</p>
            <p><strong>Reach:</strong> {{ selectedInfluencer.inf_reach }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`,
    data() {
        return {
            filters: {
                name: '',
                username: '',
                niche: '',
                category: '',
                reach: ''
            },
            influencers: [],
            selectedInfluencer: {}
        };
    },
    watch: {
        filters: {
            handler: "searchInfluencers",
            deep: true 
        }
    },
    methods: {
        searchInfluencers: async function() {
            try {
                const params = new URLSearchParams(this.filters).toString();
                const response = await fetch(`/api/influencers?${params}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });
                if (response.ok) {
                    this.influencers = await response.json();
                } else {
                    console.error('Failed to fetch influencers', response.status);
                    this.influencers = [];
                }
            } catch (error) {
                console.error('Error fetching influencers:', error);
                this.influencers = [];
            }
        },
        viewDetails: function(influencer) {
            this.selectedInfluencer = influencer;
            $('#influencerDetailsModal').modal('show'); 
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
        this.searchInfluencers(); 
    }
};

export default InfluencerSearch;
