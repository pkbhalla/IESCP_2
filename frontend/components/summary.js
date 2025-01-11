const Summary = {
    template:
  `
<nav class="navbar navbar-expand-lg navbar-dark bg-danger">
    <router-link to="/admin-dashboard" class="navbar-brand">IESCP - Admin</router-link>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item">
                <button @click="logout" class="btn btn-outline-light">Logout</button>
            </li>
            <li class="nav-item active">
                <router-link to="/admin-dashboard/summary" class="btn btn-light">Summary</router-link>
            </li>
        </ul>
    </div>
</nav>
<div>
    <h2>User Roles</h2>
    <div style="width: 500px; height: 400px; margin: auto;">
        <canvas class="container mt-3" id="userRolesChart"></canvas>
    </div>

    <h2>Ad Requests Status</h2>
    <div style="width: 500px; height: 400px; margin: auto;">
        <canvas class="container mt-3" id="adRequestStatusChart"></canvas>
    </div>
</div>
`
,
  data() {
    return {
      userRoles: null,
      adRequestStatuses: null,
    };
  },
  methods: {
    async fetchDashboardData() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in.");
        return;
      }

      try {
        const response = await fetch('/api/admin/dashboard-data', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        this.userRoles = data.user_roles;
        this.adRequestStatuses = data.ad_request_statuses;

        this.renderCharts();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    },
    renderCharts() {
      
      const userRolesCtx = document.getElementById("userRolesChart").getContext("2d");
      new Chart(userRolesCtx, {
        type: "pie",
        data: {
          labels: ["Sponsors", "Influencers", "Admins"],
          datasets: [{
            data: Object.values(this.userRoles),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
          }]
        },
      });

      
      const adRequestStatusCtx = document.getElementById("adRequestStatusChart").getContext("2d");
      new Chart(adRequestStatusCtx, {
        type: "bar",
        data: {
          labels: ["Pending", "Accepted", "Rejected"],
          datasets: [{
            label: "Ad Requests",
            data: Object.values(this.adRequestStatuses),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
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
    this.fetchDashboardData();
  }
};

export default Summary;
