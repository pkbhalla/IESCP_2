const AdminDashboard = {
    template: `
<div class="admin-dashboard">
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
                <li class="nav-item">
                    <button @click="showApprovalRequestsModal" class="btn btn-outline-light">Show Sponsor Approval
                        Requests</button>
                </li>
                <li class="nav-item">
                    <router-link to="/admin-dashboard/summary" class="btn btn-outline-light">Summary</router-link>
                </li>
            </ul>
        </div>
    </nav>
    <div class="modal fade" id="approvalRequestsModal" tabindex="-1" role="dialog"
        aria-labelledby="exampleModalCenterTitle" aria-hidden="false">
        <div class="modal-dialog modal-fullscreen" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalCenterTitle">Sponsor Approval Requests</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <table class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Username</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Industry</th>
                                <th>Budget</th>
                                <th>Approve</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="sponsor in unapprovedSponsors">
                                <td>{{ sponsor.id }}</td>
                                <td>{{ sponsor.username }}</td>
                                <td>{{ sponsor.name }}</td>
                                <td>{{ sponsor.email }}</td>
                                <td>{{ sponsor.sp_industry }}</td>
                                <td>{{ sponsor.sp_budget }}</td>
                                <td>
                                    <button @click="approveSponsor(sponsor.id)"
                                        class="btn btn-outline-success">Approve</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <h2>All Users</h2>
    <table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Is Admin</th>
                <th>Is Approved</th>
                <th>Is Sponsor</th>
                <th>Is Influencer</th>
                <th>Industry</th>
                <th>Category</th>
                <th>Niche</th>
                <th>Reach</th>
                <th>Budget</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in users">
                <td>{{ user.id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.is_admin }}</td>
                <td>{{ user.is_approved }}</td>
                <td>{{ user.is_sponsor }}</td>
                <td>{{ user.is_influencer }}</td>
                <td>{{ user.sp_industry }}</td>
                <td>{{ user.inf_category }}</td>
                <td>{{ user.inf_niche }}</td>
                <td>{{ user.inf_reach }}</td>
                <td>{{ user.sp_budget }}</td>
            </tr>
        </tbody>
    </table>
    <h2>Campaigns</h2>
    <div>
        <div v-if="campaigns.length === 0" class="alert alert-warning">
            No campaigns available.
        </div>
        <table v-else class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>Campaign ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Budget</th>
                    <th>Visibility</th>
                    <th>Goals</th>
                    <th>Sponsor ID</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="campaign in campaigns" :key="campaign.id">
                    <td>{{ campaign.id }}</td>
                    <td>{{ campaign.name }}</td>
                    <td>{{ campaign.description }}</td>
                    <td>{{ campaign.start_date }}</td>
                    <td>{{ campaign.end_date }}</td>
                    <td>{{ campaign.budget }}</td>
                    <td>{{ campaign.visibility }}</td>
                    <td>{{ campaign.goals }}</td>
                    <td>{{ campaign.sponsor_id }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <h2>Ad Requests</h2>
    <div>
        <div v-if="adrequests.length === 0" class="alert alert-warning">
            No ad requests available yet.
        </div>
        <table v-else class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>Ad Request ID</th>
                    <th>Campaign ID</th>
                    <th>Influencer ID</th>
                    <th>Messages</th>
                    <th>Requirements</th>
                    <th>Payment Amount</th>
                    <th>Created By</th>
                    <th>Status Adreq</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="adrequest in adrequests">
                    <td>{{ adrequest.id }}</td>
                    <td>{{ adrequest.campaign_id }}</td>
                    <td>{{ adrequest.influencer_id }}</td>
                    <td>{{ adrequest.messages }}</td>
                    <td>{{ adrequest.requirements }}</td>
                    <td>{{ adrequest.payment_amount }}</td>
                    <td>{{ adrequest.created_by }}</td>
                    <td>{{ adrequest.status_adreq }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
    `,
    data() {
        return {
            users: [],
            campaigns: [],
            adrequests: [],
            unapprovedSponsors: [],
        };
    },
    methods: {
        async fetchData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('Token not found');
                    return;
                }
                const response = await fetch('/api/admin/dashboard', {
                    method: "GET",
                    headers: {
                        'Content-type': "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    this.users = data.users;
                    this.campaigns = data.campaigns;
                    this.adrequests = data.adrequests;
                }
            } catch (error) {
                console.error(error);
            }
        },
        fetchUnapprovedSponsors: async function() {
            try {
              const token = localStorage.getItem("token");
              if (!token) {
                console.error("Access token is missing.");
                return;
              }
          
              const response = await fetch("/api/sponsors/unapproved", {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${token}`,
                },
              });
          
              if (response.ok) {
                const data = await response.json();
                if (data.message && data.data?.length === 0) {
                  console.log("Message from server:", data.message);
                  alert(data.message);
                  return []; 
                }
                return data;
              } else {
                console.error("Failed to fetch sponsors:", response.status, await response.text());
              }
            } catch (error) {
              console.error("Error fetching sponsors:", error);
            }
          },
          async showApprovalRequestsModal() {
            const sponsors = await this.fetchUnapprovedSponsors();
            if (sponsors && sponsors.length === 0) {
              this.message = "No unapproved sponsors available.";
            } else {
              this.unapprovedSponsors = sponsors;
              this.message = ""; 
              $('#approvalRequestsModal').modal('show'); 
            }
          },
          
          async approveSponsor(sponsorId) {
            try {
              const token = localStorage.getItem("token");
              const response = await fetch(`/api/sponsors/approve/${sponsorId}`, {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
      
              if (response.ok) {
                alert("Sponsor approved successfully!");
                this.unapprovedSponsors = this.unapprovedSponsors.filter(
                  (sponsor) => sponsor.id !== sponsorId
                ); 
              } else {
                console.error("Failed to approve sponsor");
              }
            } catch (error) {
              console.error("Error approving sponsor:", error);
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
        this.fetchData();
    },
};

export default AdminDashboard;


