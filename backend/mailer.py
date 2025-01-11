import smtplib
from email.mime.text import MIMEText

def send_email(to, subject, body):
    sender = "noreply@iescp.com"  
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to

    # Configure MailHog SMTP server
    with smtplib.SMTP("localhost", 1025) as server:
        server.sendmail(sender, to, msg.as_string())
