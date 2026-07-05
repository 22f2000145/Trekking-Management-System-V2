from application.models import Booking
from flask_restful import Api, Resource, reqparse
from application.database import db 
from application.models import *
from flask_security import auth_required, roles_accepted, current_user
from datetime import datetime
from application.utils import roles_list

api = Api()

trek_parser = reqparse.RequestParser()
trek_parser.add_argument("name")
trek_parser.add_argument("location")
trek_parser.add_argument("difficulty")
trek_parser.add_argument("duration")
trek_parser.add_argument("slots")
trek_parser.add_argument("start_date")
trek_parser.add_argument("end_date")
trek_parser.add_argument("price")
trek_parser.add_argument("description")
trek_parser.add_argument("status")
trek_parser.add_argument("assigned_guide_id")


book = reqparse.RequestParser()
book.add_argument("trek_id")
book.add_argument("total_amount")
book.add_argument("payment_status")
book.add_argument("booking_status")


#Treks

class TrekApi(Resource):
    @auth_required("token")
    @roles_accepted("user","admin","staff")
    def get(self):
        treks=[]
        if "admin" in roles_list(current_user.roles):
            treks = Trek.query.all()
        elif "staff" in roles_list(current_user.roles):
            treks = Trek.query.filter_by(assigned_guide_id=current_user.id).all()
        else:
            treks=Trek.query.filter_by(status="Open").all()

        treks_json=[]
        for trek in treks:

            this_treks ={}

            this_treks["id"]=trek.id
            this_treks["name"]=trek.name
            this_treks["location"]=trek.location
            this_treks["difficulty"]=trek.difficulty
            this_treks["duration"]=trek.duration
            this_treks["slots"]=trek.slots
            this_treks["start_date"]=trek.start_date
            this_treks["end_date"]=trek.end_date
            this_treks["price"]=trek.price
            this_treks["description"]=trek.description
            this_treks["status"]=trek.status
            this_treks["assigned_guide_id"]=trek.assigned_guide_id

            treks_json.append(this_treks)

        if treks_json:
            return treks_json, 200
        
        return {
            "message": "No treks found"
            }, 404

    @auth_required("token")
    @roles_accepted("admin")
    def post(self):
        args = trek_parser.parse_args()

        try:
            trek = Trek()
            trek.name = args['name']
            trek.location = args['location']
            trek.difficulty = args['difficulty']
            trek.duration = args['duration']
            trek.slots = args['slots']
            trek.start_date = args['start_date']
            trek.end_date = args['end_date']
            trek.price = args['price']
            trek.description = args['description']
            trek.status = args['status']
            trek.assigned_guide_id = args['assigned_guide_id']

            db.session.add(trek)
            db.session.commit()

            return {
                "message": "Trek created successfully"
                }, 201
        except:
            db.session.rollback()
            return {
                "message": "Fields Missing"
                }, 400
        
    @auth_required('token')
    @roles_accepted("admin")
    def put(self, trek_id):
        args = trek_parser.parse_args()

        trek = Trek.query.get(trek_id)

        if trek:

           
            trek.name = args['name']
            trek.location = args['location']
            trek.difficulty = args['difficulty']
            trek.duration = args['duration']
            trek.slots = args['slots']
            trek.start_date = args['start_date']
            trek.end_date = args['end_date']
            trek.description = args['description']
            trek.price = args['price']
            trek.assigned_guide_id = args['assigned_guide_id']
            trek.status = args['status']

            db.session.commit()

            return {
                "message": "Trek updated successfully"
                }, 200

        return {
            "message": "Trek not found"
            }, 404

        
    @auth_required('token')
    @roles_accepted('admin')
    def delete(self, trek_id):

        trek = Trek.query.get(trek_id)

        if trek:
            
            Booking.query.filter_by(trek_id=trek.id).delete()

            db.session.delete(trek)
            db.session.commit()

            return {
                "message": "deleted successfully"
            }, 200

        return {
            "message": "trek not found"
        }, 404


#Bookings
   
class BookingApi(Resource):
    @auth_required('token')
    @roles_accepted("user", "admin", "staff")
    def get(self):
        bookings = []

        if "admin" in roles_list(current_user.roles):
            bookings = Booking.query.all()
        elif "staff" in roles_list(current_user.roles):
            bookings = Booking.query.join(Trek).filter(Trek.assigned_guide_id == current_user.id).all()
        else:
            bookings = Booking.query.filter_by(user_id=current_user.id).all()

        bookings_json = []
        for booking in bookings:
            this_booking = {}
            this_booking["id"] = booking.id
            this_booking["trek_id"] = booking.trek_id
            this_booking["user_id"] = booking.user_id
            this_booking["username"] = booking.trekker.username if booking.trekker else "Unknown"
            this_booking["trek_name"] = booking.trek.name if booking.trek else "Unknown"
            this_booking["guide_name"] = booking.trek.guide.username if booking.trek and booking.trek.guide else "Not Assigned"
            this_booking["booking_date"] = booking.booking_date
            this_booking["total_amount"] = booking.total_amount
            this_booking["payment_status"] = booking.payment_status
            this_booking["booking_status"] = booking.booking_status
            bookings_json.append(this_booking)

        return bookings_json, 200

    @auth_required("token")
    @roles_accepted('user')
    def post(self):
        args = book.parse_args()
        trek = Trek.query.get(args['trek_id'])
        
        if not trek:
            return{
                "message": "trek not found"
            },404

        if trek.slots <=0:
            return{
                "message": "No slots available"
            },400

        existing_booking = Booking.query.filter_by(
            user_id=current_user.id,
            trek_id=args['trek_id'],
            booking_status="Booked"
        ).first()

        if existing_booking:
            return {
                "message": "already booked"
            }, 400

        try:
            booking = Booking()
            booking.trek_id = args['trek_id']
            booking.user_id = current_user.id
            booking.booking_date = datetime.now()
            booking.total_amount = args['total_amount']
            booking.payment_status = args['payment_status']
            booking.booking_status = args['booking_status']
            db.session.add(booking)
            db.session.commit()
            return {
                "message": "Booking created successfully"
                }, 201
        except:
            return {
                "message": "unable to create the bookings"
            },400

    @auth_required('token')
    @roles_accepted('user')
    def put(self, booking_id):
        booking = Booking.query.get(booking_id)

        if not booking:
            return {
                "message": "booking not found"
            },404
            
        if booking.user_id != current_user.id:
            return {
                "message": "you are not authorized to perform this action"
            }, 403

        args = book.parse_args()
        trek = Trek.query.get(booking.trek_id)
        if not trek:
            return {
                "message": "trek not found"
            },404

        if booking.booking_status == "Cancelled":
            return {
                "message": "already cancelled"
            }, 400

        if args['payment_status'] == 'Paid' and booking.payment_status != 'Paid':
            if trek.slots > 0:
                trek.slots -= 1
                booking.payment_status = args['payment_status']
                booking.booking_status = "Booked"
                db.session.commit()
                return {
                    "message": "Booking confirmed"
                }, 200
            else:
                return {
                    "message": "No slots available"
                }, 400

        elif args['payment_status'] == 'Pending' and booking.payment_status == 'Paid':
            return {
                "message": "Cannot cancel paid booking"
            }, 400

        elif args['payment_status'] == 'Pending' and booking.payment_status == 'Pending':
            return {
                "message": "already pending"
            }, 400

        return {
            "message": "unable to update the booking"
        }, 400
          
    
    
api.add_resource(
    TrekApi,
    '/api/treks',
    '/api/treks/create',
    '/api/treks/update/<int:trek_id>',
    '/api/treks/delete/<int:trek_id>'
)

api.add_resource(
    BookingApi,
    '/api/bookings',
    '/api/bookings/create',
    '/api/bookings/update/<int:booking_id>')
          
    
    