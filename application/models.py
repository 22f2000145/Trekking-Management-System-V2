from application.database import db
from flask_security import UserMixin, RoleMixin


# Single User Table (Admin, Guide, Trekker)

class User(db.Model, UserMixin):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(), unique=True, nullable=False)
    email = db.Column(db.String(), unique=True, nullable=False)
    password = db.Column(db.String(), nullable=False)

    fs_uniquifier = db.Column(db.String(), unique=True, nullable=False)
    active = db.Column(db.Boolean(), default=True)

    # Relationships
    roles = db.relationship("Role", secondary="user_roles", backref="bearer")
    bookings = db.relationship("Booking", backref="trekker", lazy=True)
    assigned_treks = db.relationship("Trek", backref="guide", foreign_keys="Trek.assigned_guide_id", lazy=True)



# Single Roles table
class Role(db.Model, RoleMixin):
    __tablename__ = "role"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), unique=True, nullable=False)
    description = db.Column(db.String())


class UserRoles(db.Model):
    __tablename__ = "user_roles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("role.id"), nullable=False)


# Treks


class Trek(db.Model):
    __tablename__ = "treks"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    location = db.Column(db.String(), nullable=False)
    difficulty = db.Column(db.String(), nullable=False)
    duration = db.Column(db.String(), nullable=False)
    slots = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String())
    start_date = db.Column(db.String(), nullable=False)
    end_date = db.Column(db.String(), nullable=False)
    status = db.Column(db.String(), default="Open")

    assigned_guide_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)


    bookings = db.relationship("Booking", backref="trek", lazy=True)

# Bookings

class Booking(db.Model):
    __tablename__ = "bookings"
    id = db.Column(db.Integer, primary_key=True)
    trek_id = db.Column(db.Integer, db.ForeignKey("treks.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    booking_date = db.Column(db.String(), nullable=False)
    total_amount = db.Column(db.Integer, nullable=False)
    payment_status = db.Column(db.String(), default="Pending")
    booking_status = db.Column(db.String(), default="Pending")