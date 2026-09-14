from datetime import datetime
from celery import shared_task
from .models import Booking, Trek, User
from .database import db
import csv
from .utils import format_report, send_email, get_template_path, get_smtp_config
import requests


@shared_task(ignore_result=False)
def export_bookings_csv(user_id=None, guide_id=None):
    filename = "bookings_report.csv"
    if user_id:
        bookings = Booking.query.filter_by(user_id=user_id).all()
    elif guide_id:
        bookings = Booking.query.join(Trek).filter(Trek.assigned_guide_id == guide_id).all()
    else:
        bookings = Booking.query.all()

    filepath = "static/" + filename

    with open(filepath, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Booking ID", "Trek Name", "Trekker", "Guide", "Booking Date", "Amount", "Payment Status", "Booking Status"])
        for booking in bookings:
            trek = Trek.query.get(booking.trek_id)
            trekker = User.query.get(booking.user_id)
            trek_name = trek.name if trek else "Unknown"
            trekker_name = trekker.username if trekker else "Unknown"
            guide_name = trek.guide.username if trek and trek.guide else "Not Assigned"
            writer.writerow([booking.id, trek_name, trekker_name, guide_name, booking.booking_date, booking.total_amount, booking.payment_status, booking.booking_status])
 
    return filename

@shared_task(ignore_result=False, name="monthly_report")
def monthly_report():
    # Get SMTP config once at the start
    smtp_host, smtp_port, sender, password = get_smtp_config()

    # Get the absolute template paths (works in both Flask and Celery contexts)
    user_template_path = get_template_path("mail_details.html")
    admin_template_path = get_template_path("admin_monthly_report.html")

    users = User.query.all()
    all_users_data = []  

    for user in users:
        user_roles = [r.name for r in user.roles]
        if "user" not in user_roles:
            continue
            
        user_data = {}
        user_data["username"] = user.username
        user_data["email"] = user.email
        user_bookings = []
        for b in user.bookings:
            this_booking = {}
            this_booking["id"] = b.id
            this_booking["trek_name"] = b.trek.name if b.trek else "Unknown"
            this_booking["booking_date"] = b.booking_date
            this_booking["payment_status"] = b.payment_status
            this_booking["total_amount"] = b.total_amount
            user_bookings.append(this_booking)
        
        user_data["bookings"] = user_bookings
        all_users_data.append(user_data)

        # Render the user template and send email
        try:
            message = format_report(user_template_path, {"data": user_data})
            send_email(
                to_address=user.email,
                subject="Monthly Report",
                content_body=message,
                smtp_host=smtp_host,
                smtp_port=smtp_port,
                sender=sender,
                password=password
            )
        except Exception as e:
            print(f"[TASK ERROR] Failed to send monthly report to {user.email}: {e}")

    # Send admin summary
    try:
        admin_message = format_report(admin_template_path, {"all_users": all_users_data})

        for user in users:
            admin_roles = [r.name for r in user.roles]
            if "admin" in admin_roles:
                send_email(
                    to_address=user.email,
                    subject="Monthly Report - Admin Summary",
                    content_body=admin_message,
                    smtp_host=smtp_host,
                    smtp_port=smtp_port,
                    sender=sender,
                    password=password
                )
    except Exception as e:
        print(f"[TASK ERROR] Failed to send admin monthly report: {e}")

    return "Monthly Report Sent"


@shared_task(ignore_result=False, name="update_message")
def update_message(username):
    text = f"Hi {username}, your trek booking status has been updated. Please check the app at http://127.0.0.1:5000"
    response = requests.post("https://chat.googleapis.com/v1/spaces/AAQAv5fyRZU/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Rk_uDehQBZYtCEKPg8lTqr0oATRlaxgQyXC4cqHO0p4", json = {"text": text})
    print(response.status_code)
    return "The booking update is sent to user"