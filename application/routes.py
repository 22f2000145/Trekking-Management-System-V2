from application.database import db
from application.models import *
from flask import current_app as app 
from flask_security import roles_accepted, roles_required, auth_required, current_user, hash_password, verify_password, login_user
from flask import jsonify, request, render_template, send_file
from application.utils import roles_list
from celery.result import AsyncResult
from application.task import export_bookings_csv

@app.route('/')
def home():
    return render_template("index.html")

@app.errorhandler(404)
def page_not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"message": "API endpoint not found"}), 404
    return render_template("index.html"), 200

@app.route('/api/admin')
@auth_required("token")#authentication required for this route, using token authentication
@roles_required("admin")#authorization required for this route, only users with 'admin' role can access this route
def admin():
    return {
        "message": "Admin logged in successfully"
        },200


@app.route('/api/home')
@auth_required("token")
@roles_accepted("user","admin")
def user_home():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "roles": roles_list(user.roles)
    }),200
#login

@app.route('/api/login', methods=["POST"])
def user_login():
    body = request.get_json()
    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({
            "message": "Please provide email and password"
        }),400
    user = app.security.datastore.find_user(email=email)
    if not user:
        return jsonify({
            "message": "User not found"
        }),404
    if not verify_password(password, user.password):
        return jsonify({
            "message": "Invalid password"
        }),401
    if not user.active:
        return jsonify({
            "message": "User account is inactive. Please wait for admin approval."
        }),403
    login_user(user)
    return jsonify({
        "message": "User logged in successfully",
        "username": user.username,
        "email": user.email,
        "token": user.get_auth_token(),
        "roles": roles_list(user.roles)
    }),200
#register

@app.route('/api/register', methods=["POST"])
def create_user():
    body = request.get_json()
    username = body.get("username")
    email = body.get("email")
    password = body.get("password")
    
    if not username or not email or not password:
        return jsonify({
            "message": "Fields missing"
        }), 400

    roles = ["user"]

    user = app.security.datastore.find_user(email=email)
    if user:
        return jsonify({
            "message": "User already exists"
        }), 400

    app.security.datastore.create_user(
        username=username, 
        email=email, 
        password=hash_password(password), 
        active=True, 
        roles=roles
    )
    db.session.commit()

    return jsonify({
        "message": "User created successfully"
    }), 200


@app.route('/api/admin/stats', methods=['GET'])
@auth_required("token")
@roles_required("admin")
def get_admin_stats():
    total_treks = Trek.query.count()
    total_bookings = Booking.query.count()
    all_users = User.query.all()
    user_count = 0
    staff_count = 0
    pending_staff_count = 0
    
    for u in all_users:
        u_roles = roles_list(u.roles)
        if "user" in u_roles:
            user_count += 1
        if "staff" in u_roles:
            staff_count += 1
            if not u.active:
                pending_staff_count += 1
                
    return jsonify({
        "total_treks": total_treks,
        "total_bookings": total_bookings,
        "total_users": user_count,
        "total_staff": staff_count,
        "pending_staff_count": pending_staff_count
    }), 200


@app.route('/api/admin/guides', methods=['GET'])
@auth_required("token")
@roles_required("admin")
def get_active_guides():
    all_users = User.query.filter_by(active=True).all()
    guides = []
    for u in all_users:
        if "staff" in roles_list(u.roles):
            guides.append({
                "id": u.id,
                "username": u.username,
                "email": u.email
            })
    return jsonify(guides), 200

@app.route('/api/admin/users', methods=['GET'])
@auth_required("token")
@roles_required("admin")
def get_all_users():
    all_users = User.query.all()
    users_list = []
    for u in all_users:
        u_roles = roles_list(u.roles)
        if "admin" in u_roles:
            continue
        users_list.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "active": u.active,
            "role": u_roles[0] if u_roles else "user"
        })
    return jsonify(users_list), 200


@app.route('/api/admin/create-staff', methods=['POST'])
@auth_required("token")
@roles_required("admin")
def create_staff_directly():
    body = request.get_json()
    username = body.get("username")
    email = body.get("email")
    password = body.get("password")
    
    if not username or not email or not password:
        return jsonify({"message": "Username, email and password are required"}), 400
        
    existing_user = app.security.datastore.find_user(email=email)
    if existing_user:
        return jsonify({"message": "User with this email already exists"}), 400
        
    existing_username = User.query.filter_by(username=username).first()
    if existing_username:
        return jsonify({"message": "Username already taken"}), 400

    app.security.datastore.create_user(
        username=username,
        email=email,
        password=hash_password(password),
        active=True,
        roles=["staff"]
    )
    db.session.commit()
    return jsonify({"message": f"Staff user '{username}' created successfully"}), 201


@app.route('/api/admin/toggle-user/<int:user_id>', methods=['POST'])
@auth_required("token")
@roles_required("admin")
def toggle_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    if "admin" in roles_list(user.roles):
        return jsonify({"message": "Cannot toggle admin user status"}), 400
        
    user.active = not user.active
    db.session.commit()
    
    status_str = "activated" if user.active else "deactivated/blacklisted"
    return jsonify({"message": f"User status successfully toggled. User is now {status_str}."}), 200


@app.route('/api/export')
@auth_required("token")
@roles_accepted("admin", "user", "staff")
def export_csv():
    user_roles = roles_list(current_user.roles)
    if "admin" in user_roles:
        result = export_bookings_csv.delay(user_id=None, guide_id=None)
    elif "staff" in user_roles:
        result = export_bookings_csv.delay(user_id=None, guide_id=current_user.id)
    else:
        result = export_bookings_csv.delay(user_id=current_user.id, guide_id=None)
    
    filename = result.get()  # wait for task to finish
    return send_file("static/" + filename, as_attachment=True)


@app.route('/api/user/profile', methods=['GET', 'PUT'])
@auth_required("token")
def user_profile():
    if request.method == 'GET':
        return jsonify({
            "username": current_user.username,
            "email": current_user.email,
            "roles": roles_list(current_user.roles)
        }), 200

    elif request.method == 'PUT':
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email:
            return jsonify({"message": "Username and email are required"}), 400

        if username != current_user.username:
            existing_username = User.query.filter_by(username=username).first()
            if existing_username:
                return jsonify({"message": "Username already taken"}), 400

        if email != current_user.email:
            existing_email = User.query.filter_by(email=email).first()
            if existing_email:
                return jsonify({"message": "Email already in use"}), 400

        current_user.username = username
        current_user.email = email

        if password:
            current_user.password = hash_password(password)

        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200
