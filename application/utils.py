from jinja2 import Template
import pdfkit
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import current_app as app

def roles_list(roles):
    role_list = []
    for role in roles:
        role_list.append(role.name)
    return role_list

def format_report(html_template, data):
    template = Template(html_template)
    rendered_html = template.render(data)
    return rendered_html

def send_email(to_address, subject, content_body):
    host = app.config.get("SMTP_SERVER_HOST", "localhost")
    port = app.config.get("SMTP_SERVER_PORT", 1025)
    sender = app.config.get("SENDER_ADDRESS", "noreply@trekking.com")
    password = app.config.get("SENDER_PASSWORD", "")

    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = to_address
    msg['Subject'] = subject

    msg.attach(MIMEText(content_body, 'html'))

    # Send email
    s = smtplib.SMTP(host=host, port=port)
    if password:
        s.login(sender, password)
    s.send_message(msg)
    s.quit()
