from celery import shared_task
from .models import Booking, Trek, User
from .database import db
import csv


@shared_task(ignore_result=False)
def export_bookings_csv():
    bookings = Booking.query.all()
    filename = "bookings_report.csv"
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
