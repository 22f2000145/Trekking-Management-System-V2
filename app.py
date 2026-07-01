from flask import Flask
from application.database import db
from application.models import User, Role
from application.resources import api
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore, hash_password


def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    return app


app = create_app()
with app.app_context():
    db.create_all()
    app.security.datastore.find_or_create_role(name="admin", description="super user of app")
    app.security.datastore.find_or_create_role(name="staff", description="Staff/Guide")
    app.security.datastore.find_or_create_role(name="user", description="Normal User")
    db.session.commit()

    if not app.security.datastore.find_user(email="admin01@trek.com"):
        app.security.datastore.create_user(
            email="admin01@trek.com",
            username="admin01",
            password=hash_password("1234"),
            roles=["admin"]
        )
    db.session.commit()


from application.routes import *


if __name__ == '__main__':
    app.run(debug=True)