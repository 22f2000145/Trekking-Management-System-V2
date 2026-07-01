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









