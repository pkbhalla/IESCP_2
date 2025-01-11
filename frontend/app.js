import Login from './components/login.js';
import RegisterSponsor from './components/register-sponsor.js';
import RegisterInfluencer from './components/register-influencer.js';
import AdminDashboard from './components/admin-dashboard.js';
import SponsorDashboard from './components/sponsor-dashboard.js';
import SponsorCampaigns from './components/sponsor-campaigns.js';
import CreateCampaign from './components/create-campaign.js';
import ViewCampaign from './components/view-campaign.js';
import InfluencerDashboard from './components/influencer-dashboard.js';
import CreateAdRequest from './components/create-adrequest.js';
import PublicCampaigns from './components/public-campaigns.js';
import InfluencerSearch from './components/influencer-search.js';
import Summary from './components/summary.js';



n
const routes = [
    { path: '/', component: Login },
    { path: '/register-sponsor', component: RegisterSponsor },
    { path: '/register-influencer', component: RegisterInfluencer },
    { path: '/admin-dashboard', component: AdminDashboard },
    { path: '/sponsor-dashboard', component: SponsorDashboard },
    { path: '/sponsor-dashboard/campaigns', component: SponsorCampaigns },
    { path: '/sponsor-dashboard/campaigns/create-campaigns', component: CreateCampaign },
    { path: '/sponsor-dashboard/campaigns/:campaignId', component: ViewCampaign },
    { path: '/influencer-dashboard', component: InfluencerDashboard },
    { path: '/sponsor-dashboard/campaigns/:campaignId/create-adrequest', component: CreateAdRequest },
    { path: '/influencer-dashboard/public-campaigns', component: PublicCampaigns },
    { path: '/sponsor-dashboard/influencer-search', component: InfluencerSearch },
    { path: '/admin-dashboard/summary', component: Summary },
    { path: '/:catchAll(.*)', redirect: '/' }, 
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes,
});

const app = Vue.createApp({});
app.use(router);
app.mount('#app');
