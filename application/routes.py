from application.database import db
from application.models import *
from flask import current_app as app 
from flask_security import roles_accepted, roles_required, auth_required, current_user, hash_password, verify_password, login_user
from flask import jsonify, request, render_template
from application.utils import roles_list

@app.route('/')
def home():
    return render_template("index.html")

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
    roles = body.get("roles")
    
    if not username or not email or not password:
        return jsonify({
            "message": "Fields missing"
        }), 400
        

    if not roles:
        roles = ["user"]
        

    user = app.security.datastore.find_user(email=email)
    if user:
        return jsonify({
            "message": "User already exists"
        }), 400


    active_status = True
    if "staff" in roles:
        active_status = False


    app.security.datastore.create_user(
        username=username, 
        email=email, 
        password=hash_password(password), 
        active=active_status, 
        roles=roles
    )
    db.session.commit()


    if not active_status:
        return jsonify({
            "message": "Please wait for admin approval."
        }), 201
    return jsonify({
        "message": "User created successfully"
    }), 200


@app.route('/api/admin/pending-staff', methods=['GET'])
@auth_required("token")
@roles_required("admin")
def get_pending_staff():
    inactive_users = User.query.filter_by(active=False).all()
    pending_staff = []
    for user in inactive_users:
        user_role_names = roles_list(user.roles)
        if "staff" in user_role_names:
            pending_staff.append({
                "id": user.id,
                "username": user.username,
                "email": user.email
            })
            
    return jsonify(pending_staff), 200


@app.route('/api/admin/approve-staff/<int:user_id>', methods=['POST'])
@auth_required("token")
@roles_required("admin")
def approve_staff(user_id):
    staff_user = User.query.filter_by(id=user_id).first()
    if not staff_user:
        return jsonify({
            "message": "Staff user not found"
            }), 404
        
    user_role_names = roles_list(staff_user.roles)
    if 'staff' not in user_role_names:
        return jsonify({
            "message": "User is not a staff member"
            }), 400
        
    staff_user.active = True
    db.session.commit()
    
    return jsonify({
        "message": f"Staff user '{staff_user.username}' has been approved and is now active."
        }), 200


@app.route('/api/admin/reject-staff/<int:user_id>', methods=['POST'])
@auth_required("token")
@roles_required("admin")
def reject_staff(user_id):
    staff_user = User.query.filter_by(id=user_id).first()
    if not staff_user:
        return jsonify({
            "message": "Staff user not found"
            }), 404
        
    user_role_names = roles_list(staff_user.roles)
    if 'staff' not in user_role_names:
        return jsonify({
            "message": "User is not a staff member"
            }), 400
        
    db.session.delete(staff_user)
    db.session.commit()
    
    return jsonify({
        "message": f"Staff user '{staff_user.username}' registration request has been rejected."
        }), 200




    











