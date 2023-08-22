from flask import Flask, render_template, current_app, request, redirect, flash, url_for, abort, session, jsonify, send_from_directory, make_response
from flask_login import LoginManager, current_user, logout_user, login_required, login_user
from flask_mail import Mail, Message
from flask_cors import CORS
import datetime
from datetime import timedelta
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import random
from models import db
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from collections.abc import Mapping as ABCMapping

#Config
#----------------------------------------------------------------------------------

app = Flask(__name__, template_folder='template')
CORS(app)


#SET SQLALCHEMY
app.config["SECRET_KEY"] = "mysecret"
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://admin:ProjectX2023.@projectx3.cj6fxzhtmztu.eu-central-1.rds.amazonaws.com/projectx3'
app.config['SQLALCHEMY_TRACK_MODIFICATION'] = False
db.init_app(app)
migrate = Migrate(app, db)


#SET FLASK LOGIN
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

#SET JWT Manager
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  
jwt = JWTManager(app)


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))


#SET FLASK MAIL
app.config['MAIL_SERVER'] = 'mail.gmx.net'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'timetab@gmx.ch'
app.config['MAIL_DEFAULT_SENDER'] = 'timetab@gmx.ch'
app.config['MAIL_PASSWORD'] = 'ProjectX2023.'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
mail = Mail(app)


#SET WEBSITE PASSWORT
app.secret_key = 'Only for Admins'
password = 'Arsch_Und_Titten'





#Import of Database
#-------------------------------------------------------------------------

from models import User, Availability, TimeReq, Company, OpeningHours, Timetable, \
    TemplateAvailability, TemplateTimeRequirement, RegistrationToken, PasswordReset


#Import of routes_html
#---------------------------------------------------------------------------------

from routes_html import homepage, registration, admin_registration, login, logout, about, \
    user, update, forget_password, reset_password, planning, delete_availability, delete, \
    admin, dashboard, company_data, invite


#IMPORT OF ROUTES_REACT
#---------------------------------------------------------------------------------

from routes_react import react_dashboard, login_react, current_react_user, get_data, \
    get_admin_registration, get_availability, get_company, get_forget_password, get_invite, \
    get_registration, get_required_workforce, new_user, run_solver


# SET LOAD USER REACT
@jwt.user_lookup_loader
def load_user(jwt_header, jwt_data):
    user_email = jwt_data["sub"]
    user = User.query.filter_by(email=user_email).first()
    return user


# Change/Update content in the database
@app.route('/upgrade_db')
def set_db():
    users = Timetable.query.all()
    for i in users:
        i.company_name = "TimeTab GmbH"
    db.session.commit()
    return "Company_name column updated successfully."




if __name__ == "__main__":
    app.run(debug=True, port=5000)
