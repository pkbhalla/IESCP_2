from flask import Flask, request
from flask_restful import Resource, Api, reqparse
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity


from flask_restful import Resource, Api, reqparse
from flask import jsonify, request
from models import db, User, Campaign, AdRequest
from werkzeug.security import generate_password_hash, check_password_hash
from tasks import export_campaigns
from flask_caching import Cache



api = Api() 
cache = Cache()


# User Registration/Login Parsers
user_parser = reqparse.RequestParser()
user_parser.add_argument('username', type=str, required=True, help="Username is required")
user_parser.add_argument('password', type=str, required=True, help="Password is required")
user_parser.add_argument('name', type=str, required=True, help="Name is required")
user_parser.add_argument('email', type=str, required=True, help="Email is required")
user_parser.add_argument('is_sponsor', type=bool, default=False)
user_parser.add_argument('is_influencer', type=bool, default=False)
user_parser.add_argument('is_approved', type=bool, default=False)
user_parser.add_argument('is_admin', type=bool, default=False)
user_parser.add_argument('sp_industry', type=str, default=None)
user_parser.add_argument('inf_category', type=str, default=None)
user_parser.add_argument('inf_niche', type=str, default=None)
user_parser.add_argument('inf_reach', type=int, default=None)
user_parser.add_argument('sp_budget', type=int, default=None)

login_parser = reqparse.RequestParser()
login_parser.add_argument('username', type=str, required=True, help="Username is required")
login_parser.add_argument('password', type=str, required=True, help="Password is required")

# Campaign Parsers
campaign_parser = reqparse.RequestParser()
campaign_parser.add_argument('name', type=str, required=True, help="Campaign name is required")
campaign_parser.add_argument('description', type=str, required=True, help="Description is required")
campaign_parser.add_argument('end_date', type=str, required=True, help="End date is required")
campaign_parser.add_argument('budget', type=int, required=True, help="Budget is required")
campaign_parser.add_argument('visibility', type=str, default='public')
campaign_parser.add_argument('goals', type=str, default='')

# AdRequest Parsers
ad_request_parser = reqparse.RequestParser()
ad_request_parser.add_argument('campaign_id', type=int, required=True, help="Campaign ID is required")
ad_request_parser.add_argument('influencer_id', type=int, required=True, help="Influencer ID is required")
ad_request_parser.add_argument('requirements', type=str, required=True, help="Requirements are required")
ad_request_parser.add_argument('payment_amount', type=int, required=True, help="Payment amount is required")


class UserRegister(Resource):
    def post(self):
        args = user_parser.parse_args()
        username = args['username']
        password = generate_password_hash(args['password'])
        name = args['name']
        email = args['email']
        is_sponsor = args['is_sponsor']
        is_influencer = args['is_influencer']
        if is_sponsor:
            sp_industry = args['sp_industry']
            sp_budget = args['sp_budget']
        if is_influencer:
            inf_category = args['inf_category']
            inf_niche = args['inf_niche']
            inf_reach = args['inf_reach']

        if User.query.filter_by(username=username).first():
            return {"message": "Username already exists"}, 400

        if User.query.filter_by(email=email).first():
            return {"message": "Email already registered"}, 400
        if is_sponsor:
            new_user = User(username=username, password=password, name=name, email=email,
                            is_sponsor=is_sponsor, sp_industry=sp_industry, sp_budget=sp_budget)
        if is_influencer:
            new_user = User(username=username, password=password, name=name, email=email,
                            is_sponsor=is_sponsor, is_influencer=is_influencer, is_approved=True, inf_category=inf_category, inf_niche=inf_niche, inf_reach=inf_reach)
        db.session.add(new_user)
        db.session.commit()
        return {"message": "User registered successfully"}, 201


class UserLogin(Resource):
    def post(self):
        args = login_parser.parse_args()
        username = args['username']
        password = args['password']

        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password, password):
            return {"message": "Invalid username or password"}, 401

        if user.is_sponsor and not user.is_approved:
            return {"message": "Your sponsor account is not approved by admin"}, 403

        access_token = create_access_token(identity=
                                           {"id": user.id, 
                                            "role": "admin" if user.is_admin else "sponsor" if user.is_sponsor else "influencer"})
        return {"message": "Login successful", 
                "access_token": access_token, 
                "role": "admin" if user.is_admin else "sponsor" if user.is_sponsor else "influencer"}, 200


class UserLogout(Resource):
    @jwt_required()
    def post(self):
        return {"message": "Successfully logged out"}, 200



class CampaignList(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user or not user.is_sponsor:
            return {"message": "Only sponsors can access campaigns"}, 403
        campaigns = Campaign.query.filter_by(sponsor_id=user_id).all()
        return ([{
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "start_date": c.start_date.isoformat(),
            "end_date": c.end_date.isoformat(),
            "budget": c.budget,
            "visibility": c.visibility,
            "goals": c.goals
        } for c in campaigns])

    
    @jwt_required()
    def post(self):
        args = campaign_parser.parse_args()
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user or not user.is_sponsor:
            return {"message": "Only sponsors can create campaigns"}, 403
        date_format = "%Y-%m-%d"

        datetime_object = datetime.strptime(args['end_date'], date_format)
        new_campaign = Campaign(
            name=args['name'],
            description=args['description'],
            end_date=datetime_object,
            budget=args['budget'],
            visibility=args['visibility'],
            goals=args['goals'],
            sponsor_id=user.id
        )
        db.session.add(new_campaign)
        db.session.commit()
        return {"message": "Campaign created successfully"}, 201

    

class CampaignDetail(Resource):
    @jwt_required()
    def get(self, campaign_id):
        campaign = Campaign.query.get_or_404(campaign_id)
        return {
            "id": campaign.id,
            "name": campaign.name,
            "description": campaign.description,
            "start_date": campaign.start_date.isoformat(),
            "end_date": campaign.end_date.isoformat(),
            "budget": campaign.budget,
            "visibility": campaign.visibility,
            "goals": campaign.goals
        }, 200

    @jwt_required()
    def put(self, campaign_id):
        args = campaign_parser.parse_args()
        campaign = Campaign.query.get_or_404(campaign_id)
        user_id = get_jwt_identity().get("id")
        if campaign.sponsor_id != user_id:
            return {"message": "You are not authorized to update this campaign"}, 403
        date_format = "%Y-%m-%d"
        datetime_object_end_date = datetime.strptime(args['end_date'], date_format)
        for key, value in args.items():
            if key == "end_date":
                value = datetime_object_end_date
            setattr(campaign, key, value)
        db.session.commit()
        return {"message": "Campaign updated successfully"}, 200

    @jwt_required()
    def delete(self, campaign_id):
        campaign = Campaign.query.get_or_404(campaign_id)
        user_id = get_jwt_identity().get("id")
        if campaign.sponsor_id != user_id:
            return {"message": "You are not authorized to delete this campaign"}, 403

        db.session.delete(campaign)
        db.session.commit()
        return {"message": "Campaign deleted successfully"}, 200



adreq_parser = reqparse.RequestParser()
adreq_parser.add_argument('influencer_id', type=int, required=False, help="Influencer ID is optional.")
adreq_parser.add_argument('requirements', type=str, required=True, help="Ad requirements are required.")
adreq_parser.add_argument('messages', type=str, required=True, help="Messages are required.")
adreq_parser.add_argument('payment_amount', type=int, required=True, help="Payment amount is required.")





class AdRequestList(Resource):
    @jwt_required()
    def get(self, campaign_id):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if user.is_sponsor:
            ad_requests = AdRequest.query.filter_by(campaign_id=campaign_id, created_by='sponsor').all()
        else:
            ad_requests = AdRequest.query.filter_by(campaign_id=campaign_id, influencer_id=user_id, created_by='influencer').all()
        return jsonify([{
            "id": ar.id,
            "campaign_id": ar.campaign_id,
            "influencer_id": ar.influencer_id,
            "messages": ar.messages,
            "requirements": ar.requirements,
            "payment_amount": ar.payment_amount,
            "created_by": ar.created_by,
            "status_adreq": ar.status_adreq
        } for ar in ad_requests])



    @jwt_required()
    def post(self, campaign_id):
        args = adreq_parser.parse_args()
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        campaign = Campaign.query.get_or_404(campaign_id)

        if campaign.visibility == "private" and (not user or not user.is_sponsor):
            return {"message": "Only the sponsor can create ad requests for private campaigns"}, 403

        if campaign.sponsor_id != user_id and (not user or not user.is_influencer):
            return {"message": "Only the sponsor or influencers can create ad requests"}, 403

        new_adreq = AdRequest(
            campaign_id=campaign_id,
            influencer_id=args['influencer_id'] if user.is_sponsor else user_id,
            requirements=args['requirements'],
            messages=args['messages'],
            payment_amount=args['payment_amount'],
            created_by='influencer' if user.is_influencer else 'sponsor',
            status_adreq='pending'
        )
        db.session.add(new_adreq)
        db.session.commit()
        return {"message": "Ad request created successfully"}, 201

    

class AdRequestDetail(Resource):
    @jwt_required()
    def get(self, campaign_id, adreq_id):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user or not user.is_sponsor:
            return {"message": "Only sponsors can access ad requests"}, 403
        adreq = AdRequest.query.get_or_404(adreq_id)
        return {
            "id": adreq.id,
            "campaign_id": adreq.campaign_id,
            "influencer_id": adreq.influencer_id,
            "messages": adreq.messages,
            "requirements": adreq.requirements,
            "payment_amount": adreq.payment_amount,
            "created_by": adreq.created_by,
            "status_adreq": adreq.status_adreq
        }, 200

    @jwt_required()
    def put(self, campaign_id, adreq_id):
        args = adreq_parser.parse_args()
        adreq = AdRequest.query.get_or_404(adreq_id)
        user_id = get_jwt_identity().get("id")
        if adreq.campaign.sponsor_id != user_id:
            return {"message": "You are not authorized to update this ad request"}, 403

        for key, value in args.items():
            setattr(adreq, key, value)
        db.session.commit()
        return {"message": "Ad request updated successfully"}, 200
    
    @jwt_required()
    def delete(self, campaign_id, adreq_id):
        adreq = AdRequest.query.get_or_404(adreq_id)
        user_id = get_jwt_identity().get("id")
        if adreq.campaign.sponsor_id != user_id:
            return {"message": "You are not authorized to delete this ad request"}, 403

        db.session.delete(adreq)
        db.session.commit()
        return {"message": "Ad request deleted successfully"}, 200



class PublicCampaigns(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user or not user.is_influencer:
            return {"message": "Only influencers can access public campaigns"}, 403
        
        
        filters = request.args
        keyword = filters.get('keyword', None)
        min_budget = filters.get('min_budget', None)
        max_budget = filters.get('max_budget', None)

        query = Campaign.query.filter_by(visibility='public')
        if keyword:
            query = query.filter(Campaign.name.ilike(f"%{keyword}%"))
        if min_budget:
            query = query.filter(Campaign.budget >= int(min_budget))
        if max_budget:
            query = query.filter(Campaign.budget <= int(max_budget))

        campaigns = query.all()

        result = [{
            'id': c.id,
            'name': c.name,
            'description': c.description,
            'start_date': c.start_date.isoformat(),
            'end_date': c.end_date.isoformat(),
            'budget': c.budget,
            'visibility': c.visibility,
            'goals': c.goals
        } for c in campaigns]

        return {"campaigns": result}, 200


class ApproveSponsor(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user.is_admin:
            return {"message": "Only admins can see the list of unapproved sponsors"}, 403

        unapproved_sponsors = User.query.filter_by(is_sponsor=True, is_approved=False).all()
        if not unapproved_sponsors:
                return {"message": "No unapproved sponsors found", "data": []}, 200
        return jsonify([{
            "id": us.id,
            "username": us.username,
            "name": us.name,
            "email": us.email,
            "sp_industry": us.sp_industry,
            "sp_budget": us.sp_budget
        } for us in unapproved_sponsors])


    
    @jwt_required()
    def put(self, sponsor_user_id):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user.is_admin:
            return {"message": "Only admins can approve sponsors"}, 403

        sponsor = User.query.get_or_404(sponsor_user_id)
        if not sponsor.is_sponsor:
            return {"message": "User is not a sponsor"}, 400
        if sponsor.is_approved:
            return {"message": "Sponsor is already approved"}, 400
        sponsor.is_approved = True
        db.session.commit()
        return {"message": "Sponsor approved successfully"}, 200


class IndluencersList(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user.is_sponsor:
            return {"message": "Only sponsors can see the list of influencers"}, 403

        name = request.args.get('name', None)
        username = request.args.get('username', None)
        niche = request.args.get('niche', None)
        category = request.args.get('category', None)
        reach = request.args.get('reach', None)

        query = User.query.filter_by(is_influencer=True)
        if name:
            query = query.filter(User.name.ilike(f"%{name}%"))
        if username:
            query = query.filter(User.username.ilike(f"%{username}%"))
        if niche:
            query = query.filter(User.inf_niche.ilike(f"%{niche}%"))
        if category:
            query = query.filter(User.inf_category.ilike(f"%{category}%"))
        if reach:
            query = query.filter(User.inf_reach == int(reach))

        influencers = query.all()
        return jsonify([{
            "id": us.id,
            "username": us.username,
            "name": us.name,
            "email": us.email,
            "inf_category": us.inf_category,
            "inf_niche": us.inf_niche,
            "inf_reach": us.inf_reach
        } for us in influencers])
    

#creating api resource class to show all the users, campaigns and ad requests to admin
class AdminDashboard(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user.is_admin:
            return {"message": "Only admins can see the admin dashboard"}, 403

        users = User.query.all()
        campaigns = Campaign.query.all()
        adrequests = AdRequest.query.all()
        return ({"users": [{
            "id": us.id,
            "username": us.username,
            "name": us.name,
            "email": us.email,
            "is_admin": us.is_admin,
            "is_approved": us.is_approved,
            "is_sponsor": us.is_sponsor,
            "is_influencer": us.is_influencer,
            "sp_industry": us.sp_industry,
            "inf_category": us.inf_category,
            "inf_niche": us.inf_niche,
            "inf_reach": us.inf_reach,
            "sp_budget": us.sp_budget
        } for us in users], "campaigns": [{
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "start_date": c.start_date.isoformat(),
            "end_date": c.end_date.isoformat(),
            "budget": c.budget,
            "visibility": c.visibility,
            "goals": c.goals,
            "sponsor_id": c.sponsor_id
        } for c in campaigns], "adrequests": [{
            "id": ar.id,
            "campaign_id": ar.campaign_id,
            "influencer_id": ar.influencer_id,
            "messages": ar.messages,
            "requirements": ar.requirements,
            "payment_amount": ar.payment_amount,
            "created_by": ar.created_by,
            "status_adreq": ar.status_adreq,
        } for ar in adrequests]}), 200


response_parser = reqparse.RequestParser()
response_parser.add_argument('status', type=str, required=True, help="Ad request status is required")


#Accept/Reject Ad Request by Influencer or by sponsor
class AdRequestRespond(Resource):
    @jwt_required()
    def put(self, adreq_id):
        adreq = AdRequest.query.get_or_404(adreq_id)
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if adreq.influencer_id != user_id and adreq.campaign.sponsor_id != user_id:
            return {"message": "Only the influencer or sponsor can respond to this ad request"}, 403
        args = response_parser.parse_args()
        if args['status'] == 'accepted':
            adreq.status_adreq = 'accepted'
        elif args['status'] == 'rejected':
            adreq.status_adreq = 'rejected'
        else:
            return {"message": "Invalid ad request status"}, 400
        db.session.commit()
        return {"message": "Ad request responded successfully"}, 200



#Pending and Active Ad Requests for Sponsor
class SponsorAdRequests(Resource):
    @jwt_required()
    @cache.cached(timeout=2)  # Cache the result for 2 seconds
    def get(self):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user or not user.is_sponsor:
            return {"message": "Only sponsors can view their adrequests"}, 403
        adrequests = AdRequest.query.filter(AdRequest.campaign.has(Campaign.sponsor_id==user_id)).all()
        pending_adrequests = [ar for ar in adrequests if (ar.status_adreq == 'pending' and ar.created_by == 'influencer')]
        active_adrequests = [ar for ar in adrequests if (ar.status_adreq == 'accepted' and ar.created_by == 'influencer')]
        return ({"pending_adrequests": [{
            "id": ar.id,
            "campaign_id": ar.campaign_id,
            "influencer_id": ar.influencer_id,
            "messages": ar.messages,
            "requirements": ar.requirements,
            "payment_amount": ar.payment_amount,
            "created_by": ar.created_by,
            "status_adreq": ar.status_adreq,
        } for ar in pending_adrequests], "active_adrequests": [{
            "id": ar.id,
            "campaign_id": ar.campaign_id,
            "influencer_id": ar.influencer_id,
            "messages": ar.messages,
            "requirements": ar.requirements,
            "payment_amount": ar.payment_amount,
            "created_by": ar.created_by,
            "status_adreq": ar.status_adreq,
        } for ar in active_adrequests]}), 200

class InfluencerAdRequests(Resource):
    @jwt_required()
    @cache.cached(timeout=2)  # Cache the result for 2 seconds
    def get(self):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user or not user.is_influencer:
            return {"message": "Only influencers can view their adrequests"}, 403
        adrequests = AdRequest.query.filter_by(influencer_id=user_id).all()
        pending_adrequests = [ar for ar in adrequests if (ar.status_adreq == 'pending' and ar.created_by == 'sponsor')]
        active_adrequests = [ar for ar in adrequests if (ar.status_adreq == 'accepted' and ar.created_by == 'sponsor')]
        return ({"pending_adrequests": [{
            "id": ar.id,
            "campaign_id": ar.campaign_id,
            "influencer_id": ar.influencer_id,
            "messages": ar.messages,
            "requirements": ar.requirements,
            "payment_amount": ar.payment_amount,
            "created_by": ar.created_by,
            "status_adreq": ar.status_adreq,
        } for ar in pending_adrequests], "active_adrequests": [{
            "id": ar.id,
            "campaign_id": ar.campaign_id,
            "influencer_id": ar.influencer_id,
            "messages": ar.messages,
            "requirements": ar.requirements,
            "payment_amount": ar.payment_amount,
            "created_by": ar.created_by,
            "status_adreq": ar.status_adreq,
        } for ar in active_adrequests]}), 200

class AdminDashboardData(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity().get("id")
        user = User.query.get(user_id)
        if not user.is_admin:
            return {"message": "Only admins can see the admin dashboard"}, 403
        user_roles = {
            "sponsors": User.query.filter_by(is_sponsor=True).count(),
            "influencers": User.query.filter_by(is_influencer=True).count(),
            "admins": User.query.filter_by(is_admin=True).count(),
        }
        ad_request_statuses = {
            "pending": AdRequest.query.filter_by(status_adreq="pending").count(),
            "accepted": AdRequest.query.filter_by(status_adreq="accepted").count(),
            "rejected": AdRequest.query.filter_by(status_adreq="rejected").count(),
        }
        return {"user_roles": user_roles, "ad_request_statuses": ad_request_statuses}, 200

class ExportCampaignsResource(Resource):
    @jwt_required()
    def post(self):
        # Extract sponsor ID from the JWT token
        sponsor_id = get_jwt_identity().get("id")
        if not sponsor_id:
            return {"message": "Unauthorized access."}, 401
        export_campaigns.apply_async(args=[sponsor_id])  # Async task with sponsor_id
        return {"message": "Export job started, you will be notified via email."}, 202


### Register Endpoints
api.add_resource(UserRegister, "/api/register") #post (create)
api.add_resource(UserLogin, "/api/login") #post (login)
api.add_resource(CampaignList, "/api/campaigns") #get (list) post (create)
api.add_resource(CampaignDetail, "/api/campaigns/<int:campaign_id>") #get (read) put (update) delete (delete)
api.add_resource(AdRequestList, "/api/campaigns/<int:campaign_id>/adrequests") #get (list) post (create)
api.add_resource(AdRequestDetail, "/api/campaigns/<int:campaign_id>/adrequests/<int:adreq_id>") #get (read) put (update) delete (delete)
api.add_resource(PublicCampaigns, "/api/campaigns/public") #get (search)
api.add_resource(ApproveSponsor, "/api/sponsors/unapproved", "/api/sponsors/approve/<int:sponsor_user_id>")  #get, #post
api.add_resource(IndluencersList, "/api/influencers") #get
api.add_resource(AdminDashboard, "/api/admin/dashboard") #get
api.add_resource(UserLogout, "/api/logout") #post
api.add_resource(AdRequestRespond, "/api/adrequests/<int:adreq_id>/respond") #put
api.add_resource(SponsorAdRequests, "/api/sponsor/dashboard") #get
api.add_resource(InfluencerAdRequests, "/api/influencer/dashboard") #get
api.add_resource(AdminDashboardData, '/api/admin/dashboard-data')
api.add_resource(ExportCampaignsResource, '/api/export_campaigns')


