from datetime import datetime
from celery import shared_task
from .models import Booking, Trek, User
from .database import db
import csv
from .utils import format_report, send_email
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

        with open("templates/mail_details.html", "r") as f:
            template_content = f.read()
            message = format_report(template_content, {"data": user_data})
            send_email(user.email, "Monthly Report", message)

    with open("templates/admin_monthly_report.html", "r") as f:
        admin_template = f.read()

    admin_message = format_report(admin_template, {"all_users": all_users_data})

    for user in users:
        admin_roles = [r.name for r in user.roles]
        if "admin" in admin_roles:
            send_email(user.email, "Monthly Report - Admin Summary", admin_message)

    return "Monthly Report Sent"


@shared_task(ignore_result=False, name="update_message")
def update_message(username):
    text = f"Hi {username}, your trek booking status has been updated. Please check the app at http://127.0.0.1:5000"
    response = requests.post("https://chat.googleapis.com/v1/spaces/AAQAv5fyRZU/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Rk_uDehQBZYtCEKPg8lTqr0oATRlaxgQyXC4cqHO0p4", json = {"text": text})
    print(response.status_code)
    return "The booking update is sent to user"