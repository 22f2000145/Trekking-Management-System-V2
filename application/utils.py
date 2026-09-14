import os
from jinja2 import Template
try:
    import pdfkit
except ImportError:
    pdfkit = None
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def roles_list(roles):
    role_list = []
    for role in roles:
        role_list.append(role.name)
    return role_list


def format_report(template_path, data):
    """Render a Jinja2 template file with the given data.
    
    Args:
        template_path: Absolute path to the HTML template file.
        data: Dictionary of data to render in the template.
    
    Returns:
        Rendered HTML string.
    """
    with open(template_path, "r", encoding="utf-8") as f:
        template_content = f.read()
    template = Template(template_content)
    rendered_html = template.render(data)
    return rendered_html


def send_email(to_address, subject, content_body, smtp_host="localhost", smtp_port=1025, sender="noreply@trekking.com", password=""):
    """Send an HTML email using SMTP.
    
    Args:
        to_address: Recipient email address.
        subject: Email subject line.
        content_body: HTML content of the email body.
        smtp_host: SMTP server hostname.
        smtp_port: SMTP server port.
        sender: Sender email address.
        password: SMTP password (empty string for no auth).
    """
    msg = MIMEMultipart("alternative")
    msg['From'] = sender
    msg['To'] = to_address
    msg['Subject'] = subject

    # Attach the HTML content with proper encoding
    html_part = MIMEText(content_body, 'html', 'utf-8')
    msg.attach(html_part)

    # Send email
    try:
        s = smtplib.SMTP(host=smtp_host, port=smtp_port)
        if password:
            s.login(sender, password)
        s.send_message(msg)
        s.quit()
        print(f"[EMAIL] Successfully sent email to {to_address} - Subject: {subject}")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_address}: {e}")
        raise


def get_template_path(template_name):
    """Get the absolute path to a template file, handling both Flask app 
    and Celery worker contexts.
    
    Args:
        template_name: Name of the template file (e.g., 'mail_details.html').
    
    Returns:
        Absolute path to the template file.
    """
    # Try Flask app context first
    try:
        from flask import current_app
        template_dir = os.path.join(current_app.root_path, '..', 'templates')
        path = os.path.normpath(os.path.join(template_dir, template_name))
        if os.path.exists(path):
            return path
    except RuntimeError:
        pass

    # Fallback: resolve relative to this file's location
    # application/utils.py -> project_root/templates/
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(base_dir, 'templates', template_name)
    if os.path.exists(path):
        return path

    raise FileNotFoundError(f"Template '{template_name}' not found")


def get_smtp_config():
    """Get SMTP configuration from Flask app config if available, 
    otherwise return defaults.
    
    Returns:
        Tuple of (host, port, sender, password).
    """
    try:
        from flask import current_app
        host = current_app.config.get("SMTP_SERVER_HOST", "localhost")
        port = current_app.config.get("SMTP_SERVER_PORT", 1025)
        sender = current_app.config.get("SENDER_ADDRESS", "noreply@trekking.com")
        password = current_app.config.get("SENDER_PASSWORD", "")
        return host, port, sender, password
    except RuntimeError:
        return "localhost", 1025, "noreply@trekking.com", ""
