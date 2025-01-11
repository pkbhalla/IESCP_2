// frontend/components/sponsor-dashboard.js

const SponsorDashboard = {
  template: `
  <div class="sponsor-dashboard">
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
            <router-link to="/sponsor-dashboard/influencer-search" class="btn btn-outline-light">Search Influencers</router-link>
          </li>
          <li class="nav-item">
          <button class="btn btn-outline-light" @click="exportCampaigns">Export Campaigns</button>
          </li>
        </ul>
      </div>
    </nav>
    <div class="container">
      <h2>Pending Requests</h2>
      <div>
      <div v-if="pendingRequests.length === 0" class="alert alert-warning">
        No pending requests available.
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
          <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in pendingRequests" :key="request.id">
            <td>{{ request.id }}</td>
            <td>{{ request.influencer_id }}</td>
            <td>{{ request.messages }}</td>
            <td>{{ request.requirements }}</td>
            <td>{{ request.payment_amount }}</td>
            <td>{{ request.created_by }}</td>
            <td>
              <button class="btn btn-success" @click="acceptAdRequest(request)">Accept</button>
              <button class="btn btn-danger" @click="rejectAdRequest(request)">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      <h2>Active Requests</h2>
    <div>
      <div v-if="activeRequests.length === 0" class="alert alert-warning">
        No active requests available.
      </div>
      <table v-else class="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Influencer ID</th>
            <th>Message</th>
            <th>Requirements</th>
            <th>Payment Amount</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in activeRequests" :key="request.id">
            <td>{{ request.id }}</td>
            <td>{{ request.influencer_id }}</td>
            <td>{{ request.messages }}</td>
            <td>{{ request.requirements }}</td>
            <td>{{ request.payment_amount }}</td>
            <td>{{ request.created_by }}</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
`,

  data() {
    return {
      pendingRequests: [],
      activeRequests: []
    }
  },
  mounted() {
    this.loadRequests();
  },
  methods: {
    loadRequests: async function () {
      try {
        const response = await fetch('/api/sponsor/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.pendingRequests = data.pending_adrequests;
          this.activeRequests = data.active_adrequests;
          this.errorMessage = "";
        } else {
          const data = await response.json();
          if (response.status === 404) {
           
            this.errorMessage = data.message || "No data available.";
          } else if (response.status === 403){
            
            this.errorMessage = data.message || "You are not authorized to view this page.";
            alert(this.errorMessage)
          } else {
            this.errorMessage = "Failed to load requests.";
          }
          this.pendingRequests = [];
          this.activeRequests = [];
        }
      } catch (error) {
        console.error('Error loading requests:', error);
        this.errorMessage = "An unexpected error occurred while loading requests.";
        this.pendingRequests = [];
        this.activeRequests = [];
      }
    },
    viewCampaigns: async function () {
      try {
        const response = await fetch('/api/campaigns', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        });
        if (response.ok) {
          const data = await response.json();
          this.$router.push({ name: 'Campaigns', params: { campaigns: data } });
        } else {
          console.error('Failed to load campaigns:', response.status);
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
      }
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
              this.loadRequests();
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
              this.loadRequests();
          })
          .catch(error => {
              console.error(error);
              alert("Failed to reject ad request.");
          });
  },
    logout: async function () {
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
  }
}

export default SponsorDashboard