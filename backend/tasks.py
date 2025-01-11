from workers import celery
from mailer import send_email
from flask import current_app 
from models import db, User, AdRequest, Campaign
import csv, smtplib, os
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from io import StringIO
from werkzeug.utils import secure_filename

@celery.task
def send_daily_reminder():
    with current_app.app_context():
        influencers = User.query.filter_by(is_influencer=True).all()
        for influencer in influencers:
            pending_requests = AdRequest.query.filter_by(
                influencer_id=influencer.id, status_adreq="pending"
            ).count()
            if pending_requests > 0:
                send_email(
                    influencer.email,
                    "Daily Reminder",
                    f"You have {pending_requests} pending requests. Please review them!"
                )

@celery.task
def send_monthly_report():
    with current_app.app_context():
        sponsors = User.query.filter_by(is_sponsor=True).all()
        template_dir = os.path.join(current_app.root_path, "templates")
        env = Environment(loader=FileSystemLoader(template_dir))

        for sponsor in sponsors:
            campaigns = Campaign.query.filter_by(sponsor_id=sponsor.id).all()
            report_data = []

            for campaign in campaigns:
                pending = AdRequest.query.filter_by(
                    campaign_id=campaign.id, status_adreq="pending"
                ).count()
                accepted = AdRequest.query.filter_by(
                    campaign_id=campaign.id, status_adreq="accepted"
                ).count()
                rejected = AdRequest.query.filter_by(
                    campaign_id=campaign.id, status_adreq="rejected"
                ).count()

                report_data.append({
                    "name": campaign.name,
                    "pending": pending,
                    "accepted": accepted,
                    "rejected": rejected,
                })

            template = env.get_template("monthly_report.html")
            html_content = template.render(sponsor_name=sponsor.name, campaigns=report_data)
            
            pdf = HTML(string=html_content).write_pdf()

            
            send_email_with_pdf(
                to=sponsor.email,
                subject="Monthly Report",
                html_content=html_content,
                pdf_data=pdf,
                pdf_filename="monthly_report.pdf"
            )

def send_email_with_pdf(to, subject, html_content, pdf_data, pdf_filename):
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from email.mime.base import MIMEBase
    from email import encoders

    sender = "noreply@example.com"
    msg = MIMEMultipart()
    msg["From"] = sender
    msg["To"] = to
    msg["Subject"] = subject

    # Attach the HTML content
    msg.attach(MIMEText(html_content, "html"))

    # Attach the PDF
    attachment = MIMEBase("application", "octet-stream")
    attachment.set_payload(pdf_data)
    encoders.encode_base64(attachment)
    attachment.add_header(
        "Content-Disposition", f"attachment; filename={pdf_filename}"
    )
    msg.attach(attachment)

    # Send the email via MailHog
    with smtplib.SMTP("localhost", 1025) as server:
        server.send_message(msg)




@celery.task
def export_campaigns(sponsor_id):
    sponsor = User.query.get(sponsor_id)
    campaigns = Campaign.query.filter_by(sponsor_id=sponsor_id).all()
    
    # Prepare CSV data
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Description", "Start Date", "End Date", "Budget", "Visibility", "Goals"])
    
    for campaign in campaigns:
        writer.writerow([
            campaign.name, campaign.description, campaign.start_date,
            campaign.end_date, campaign.budget, campaign.visibility, campaign.goals
        ])
    
    output.seek(0)

    # Save CSV to a file (in a temporary directory)
    filename = f"campaign_export_{sponsor_id}.csv"
    file_path = os.path.join(os.getcwd(), filename)
    with open(file_path, "w") as f:
        f.write(output.getvalue())

    # Send email with file link or attachment
    send_email_with_csv(
        sponsor.email,
        subject="Campaign Export Completed",
        message=f"Your campaign export is ready. You can download it from {file_path}.",
        csv_data=output.getvalue().encode("utf-8"),
        csv_filename=filename
    )



def send_email_with_csv(to, subject, message, csv_data, csv_filename):
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from email.mime.base import MIMEBase
    from email import encoders

    sender = "noreply@example.com"
    msg = MIMEMultipart()
    msg["From"] = sender
    msg["To"] = to
    msg["Subject"] = subject

    msg.attach(MIMEText(message, "text/plain"))

    attachment = MIMEBase("application", "octet-stream")
    attachment.set_payload(csv_data)
    encoders.encode_base64(attachment)
    attachment.add_header(
        "Content-Disposition", f"attachment; filename={csv_filename}"
    )
    msg.attach(attachment)

    # Send the email via MailHog
    with smtplib.SMTP("localhost", 1025) as server:
        server.send_message(msg)



#to test only
@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(10, send_daily_reminder.s(), name='Daily_Reminder') 
    sender.add_periodic_task(10, send_monthly_report.s(), name='Monthly_Report')


from celery.schedules import crontab


celery.conf.timezone = "Asia/Kolkata"
celery.conf.beat_schedule = {
    "daily-reminder-task": {
        "task": "tasks.send_daily_reminder",
        "schedule": crontab(hour='20', minute='0'),  # 8 PM IST
    },
    "monthly-report-task": {
        "task": "tasks.send_monthly_report",
        "schedule": crontab(day_of_month='1', hour='0', minute='0'),  # 1st of every month
    },
}