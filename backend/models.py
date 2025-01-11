from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(30), nullable = False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=False)
    is_sponsor = db.Column(db.Boolean, default=False)
    is_influencer = db.Column(db.Boolean, default=False)
    sp_industry = db.Column(db.String(30), nullable=True)
    inf_category = db.Column(db.String(30),nullable=True)
    inf_niche = db.Column(db.String(30), nullable=True)
    inf_reach = db.Column(db.Integer, nullable=True)
    sp_budget = db.Column(db.Integer, nullable=True)
    campaigns = db.relationship('Campaign', back_populates='sponsor', cascade="all, delete-orphan")
    ad_requests = db.relationship('AdRequest', back_populates='influencer', cascade="all, delete-orphan")

# Campaign model
class Campaign(db.Model):
    __tablename__ = 'campaigns'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    start_date = db.Column(db.Date, nullable=False, default=datetime.now().date())
    end_date = db.Column(db.Date, nullable=False)
    budget = db.Column(db.Integer, nullable=False)
    visibility = db.Column(db.String(10), nullable=False, default='public')
    goals = db.Column(db.Text, nullable=True)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sponsor = db.relationship('User', back_populates='campaigns')
    ad_requests = db.relationship('AdRequest', back_populates='campaign', cascade="all, delete-orphan")

# AdRequest model
class AdRequest(db.Model):
    __tablename__ = 'ad_requests'
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    influencer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    messages = db.Column(db.Text, nullable=True)
    requirements = db.Column(db.Text, nullable=False)
    payment_amount = db.Column(db.Integer, nullable=False)
    created_by = db.Column(db.String(10), nullable=False, default='sponsor')  
    status_adreq = db.Column(db.String(10), nullable=False, default='pending')  
    campaign = db.relationship('Campaign', back_populates='ad_requests')
    influencer = db.relationship('User', back_populates='ad_requests')
