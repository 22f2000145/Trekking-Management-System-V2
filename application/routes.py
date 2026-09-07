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


@app.route('/api/admin/analytics', methods=['GET'])
@auth_required("token")
@roles_required("admin")
def get_admin_analytics():
    from datetime import datetime
    all_treks = Trek.query.all()
    all_bookings = Booking.query.all()
    all_users = User.query.all()
    
    user_count = 0
    staff_count = 0
    active_users = 0
    inactive_users = 0
    active_guides = 0
    inactive_guides = 0
    
    guides_map = {}
    for u in all_users:
        u_roles = roles_list(u.roles)
        if "admin" in u_roles:
            continue
        if "staff" in u_roles:
            staff_count += 1
            if u.active:
                active_guides += 1
            else:
                inactive_guides += 1
            guides_map[u.id] = {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "active": u.active,
                "treks_count": 0,
                "trekkers_count": 0,
                "revenue": 0
            }
        elif "user" in u_roles:
            user_count += 1
            if u.active:
                active_users += 1
            else:
                inactive_users += 1

    total_bookings = len(all_bookings)
    confirmed_bookings = 0
    pending_bookings = 0
    verification_bookings = 0
    cancelled_bookings = 0
    
    total_paid_revenue = 0
    pending_revenue = 0
    cancelled_revenue = 0
    
    monthly_stats = {}
    
    for b in all_bookings:
        amount = b.total_amount or 0
        if b.payment_status == 'Paid':
            total_paid_revenue += amount
            confirmed_bookings += 1
        elif b.payment_status == 'Pending Verification':
            pending_revenue += amount
            verification_bookings += 1
        elif b.payment_status == 'Cancelled' or b.booking_status == 'Cancelled':
            cancelled_revenue += amount
            cancelled_bookings += 1
        else:
            pending_revenue += amount
            pending_bookings += 1

        date_str = str(b.booking_date) if b.booking_date else ""
        month_key = None
        month_label = None
        if len(date_str) >= 7 and date_str[:4].isdigit() and date_str[4] == '-' and date_str[5:7].isdigit():
            month_key = date_str[:7]
            try:
                dt = datetime.strptime(month_key, "%Y-%m")
                month_label = dt.strftime("%b %Y")
            except Exception:
                month_label = month_key
        else:
            now = datetime.now()
            month_key = now.strftime("%Y-%m")
            month_label = now.strftime("%b %Y")
            
        if month_key not in monthly_stats:
            monthly_stats[month_key] = {
                "key": month_key,
                "label": month_label,
                "paid": 0,
                "pending": 0,
                "bookings": 0
            }
        monthly_stats[month_key]["bookings"] += 1
        if b.payment_status == 'Paid':
            monthly_stats[month_key]["paid"] += amount
        elif b.payment_status in ['Pending', 'Pending Verification']:
            monthly_stats[month_key]["pending"] += amount

    sorted_months = sorted(monthly_stats.values(), key=lambda x: x["key"])
    if not sorted_months:
        now = datetime.now()
        sorted_months = [{
            "key": now.strftime("%Y-%m"),
            "label": now.strftime("%b %Y"),
            "paid": 0,
            "pending": 0,
            "bookings": 0
        }]

    difficulty_counts = {"Easy": 0, "Moderate": 0, "Hard": 0, "Difficult": 0}
    status_counts = {"Open": 0, "Closed": 0, "Completed": 0, "Cancelled": 0}
    
    total_slots_capacity = 0
    total_slots_booked = 0
    top_treks = []
    
    for t in all_treks:
        diff = (t.difficulty or "Moderate").capitalize()
        if diff in difficulty_counts:
            difficulty_counts[diff] += 1
        else:
            difficulty_counts[diff] = 1
            
        st = (t.status or "Open").capitalize()
        if st in status_counts:
            status_counts[st] += 1
        else:
            status_counts[st] = 1
            
        if t.assigned_guide_id and t.assigned_guide_id in guides_map:
            guides_map[t.assigned_guide_id]["treks_count"] += 1
            
        trek_confirmed_bookings = 0
        trek_revenue = 0
        for b in t.bookings:
            if b.payment_status == 'Paid':
                trek_revenue += (b.total_amount or 0)
                trek_confirmed_bookings += 1
                if t.assigned_guide_id and t.assigned_guide_id in guides_map:
                    guides_map[t.assigned_guide_id]["trekkers_count"] += 1
                    guides_map[t.assigned_guide_id]["revenue"] += (b.total_amount or 0)
        
        current_slots = t.slots or 0
        original_capacity = current_slots + trek_confirmed_bookings
        total_slots_capacity += original_capacity
        total_slots_booked += trek_confirmed_bookings
        occupancy_rate = round((trek_confirmed_bookings / original_capacity * 100), 1) if original_capacity > 0 else 0
        
        top_treks.append({
            "id": t.id,
            "name": t.name,
            "location": t.location,
            "difficulty": t.difficulty,
            "price": t.price,
            "status": t.status,
            "slots_available": current_slots,
            "slots_booked": trek_confirmed_bookings,
            "total_capacity": original_capacity,
            "occupancy_rate": occupancy_rate,
            "bookings_count": len(t.bookings),
            "revenue": trek_revenue,
            "guide_name": t.guide.username if t.guide else "Unassigned"
        })
        
    top_treks.sort(key=lambda x: (x["revenue"], x["bookings_count"]), reverse=True)
    
    guides_list = list(guides_map.values())
    guides_list.sort(key=lambda x: (x["treks_count"], x["revenue"]), reverse=True)
    
    conversion_rate = round((confirmed_bookings / total_bookings * 100), 1) if total_bookings > 0 else 0
    avg_order_val = round(total_paid_revenue / confirmed_bookings, 2) if confirmed_bookings > 0 else 0
    overall_occupancy_rate = round((total_slots_booked / total_slots_capacity * 100), 1) if total_slots_capacity > 0 else 0
    
    return jsonify({
        "kpis": {
            "total_revenue": total_paid_revenue,
            "pending_revenue": pending_revenue,
            "cancelled_revenue": cancelled_revenue,
            "total_bookings": total_bookings,
            "confirmed_bookings": confirmed_bookings,
            "pending_bookings": pending_bookings,
            "verification_bookings": verification_bookings,
            "cancelled_bookings": cancelled_bookings,
            "avg_booking_value": avg_order_val,
            "conversion_rate": conversion_rate,
            "total_treks": len(all_treks),
            "open_treks": status_counts.get("Open", 0),
            "total_slots_capacity": total_slots_capacity,
            "total_slots_booked": total_slots_booked,
            "overall_occupancy_rate": overall_occupancy_rate,
            "total_users": user_count,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "total_staff": staff_count,
            "active_guides": active_guides,
            "inactive_guides": inactive_guides
        },
        "trends": sorted_months,
        "booking_status_distribution": {
            "labels": ["Confirmed (Paid)", "Pending Verification", "Payment Pending", "Cancelled"],
            "data": [confirmed_bookings, verification_bookings, pending_bookings, cancelled_bookings],
            "colors": ["#2d5a3d", "#d4a855", "#4a90b8", "#c0392b"]
        },
        "trek_difficulty_distribution": {
            "labels": list(difficulty_counts.keys()),
            "data": [difficulty_counts[k] for k in difficulty_counts.keys()],
            "colors": ["#3d7a52", "#d4a855", "#c4895a", "#c0392b"]
        },
        "trek_status_distribution": {
            "labels": list(status_counts.keys()),
            "data": [status_counts[k] for k in status_counts.keys()],
            "colors": ["#2d5a3d", "#9e9e8f", "#4a90b8", "#c0392b"]
        },
        "top_treks": top_treks[:8],
        "all_treks_utilization": top_treks,
        "guides": guides_list
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
    target_user_id = None
    target_guide_id = None
    
    if "admin" in user_roles:
        target_user_id = None
        target_guide_id = None
    elif "staff" in user_roles:
        target_user_id = None
        target_guide_id = current_user.id
    else:
        target_user_id = current_user.id
        target_guide_id = None

    filename = None
    try:
        import redis
        r = redis.Redis(host='127.0.0.1', port=6379, socket_connect_timeout=0.2, socket_timeout=0.2)
        r.ping()
        result = export_bookings_csv.delay(user_id=target_user_id, guide_id=target_guide_id)
        filename = result.get(timeout=3)
    except Exception:
        filename = export_bookings_csv(user_id=target_user_id, guide_id=target_guide_id)

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
