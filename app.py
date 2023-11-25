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
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
from collections.abc import Mapping as ABCMapping
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

#Config
#----------------------------------------------------------------------------------

app = Flask(__name__, template_folder='template')
CORS(app)


#SET SQLALCHEMY

db_uri_prefix = 'mysql+pymysql://admin:ProjectX2023.@projectx3.cj6fxzhtmztu.eu-central-1.rds.amazonaws.com/'

app.config["SECRET_KEY"] = "mysecret"
#app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://admin:ProjectX2023.@projectx3.cj6fxzhtmztu.eu-central-1.rds.amazonaws.com/projectx3'
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://PhuNguyen:ProjectX2023.@localhost/timetab'
app.config['SQLALCHEMY_DATABASE_URI'] = f'{db_uri_prefix}schema_timetab'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_BINDS'] = {
    'dynamic': f'{db_uri_prefix}schema_timetab'  # This will be set dynamically in before_request
}

# Database URI prefix
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


def get_database_uri(company_name, schema_name=None):
    if schema_name is None:
        schema_name = f"schema_{company_name}"
    else:
        lower_name = schema_name.lower().replace(' ', "_")
        schema_name = f"schema_{lower_name}"

    print(f"Get URI: {db_uri_prefix}{schema_name}")
    return f"{db_uri_prefix}{schema_name}"

def jwt_required_optional(fn):
    """
    A decorator to optionally require JWT only if Authorization header is present.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if 'Authorization' in request.headers:
            verify_jwt_in_request(optional=True)
        return fn(*args, **kwargs)
    return wrapper

@app.before_request
@jwt_required_optional
def before_request():
    react_user = get_jwt_identity() if 'Authorization' in request.headers else None

    session_company = "timetab"  # Default schema name

    if react_user:
        user = User.query.filter_by(email=react_user).first()
        if user:
            session_company = user.company_name.lower().replace(' ', '_')
            dynamic_bind_uri = get_database_uri(session_company, None)
            app.config['SQLALCHEMY_DATABASE_URI'] = dynamic_bind_uri
            app.config['SQLALCHEMY_BINDS']['dynamic'] = dynamic_bind_uri
    else:
        dynamic_bind_uri = get_database_uri(session_company, None)
        app.config['SQLALCHEMY_DATABASE_URI'] = dynamic_bind_uri
        app.config['SQLALCHEMY_BINDS']['dynamic'] = dynamic_bind_uri

    

#app.before_request(before_request)
#Import of Database
#-------------------------------------------------------------------------

from models import User, Availability, TimeReq, Company, OpeningHours, Timetable, \
    TemplateAvailability, TemplateTimeRequirement, RegistrationToken, PasswordReset, SolverRequirement, OverviewUser


#Import of routes_html
#---------------------------------------------------------------------------------

from routes_html import homepage, registration, admin_registration, login, logout, about, \
    user, update, forget_password, reset_password, planning, delete_availability, delete, \
    admin, dashboard, company_data, invite


#IMPORT OF ROUTES_REACT
#---------------------------------------------------------------------------------

from routes_react import react_dashboard, login_react, current_react_user, get_data, \
    get_availability, get_company, get_forget_password, get_invite, \
    get_registration, get_required_workforce, new_user, run_solver, delete_user


# SET LOAD USER REACT
@jwt.user_lookup_loader
def load_user(jwt_header, jwt_data):
    user_email = jwt_data["sub"]
    user = User.query.filter_by(email=user_email).first()
    return user


# Change/Update content in the database
@app.route('/upgrade_db')
def set_db():
    #User
    #Timereq
    #Availability
    #Company
    #Opening Hours
    #Solver Requirement
    user = User.query.all()
    
    for i in range(26, 126):
        for j in User.query.filter_by(id=i).first():
            j.password = generate_password_hash("test")
        db.session.commit()
    return "Company_name column updated successfully."


# Change/Update content in the database
@app.route('/testing_db')
def set_db_test():
    #User
    #Timereq
    #Availability
    #Company
    #Opening Hours
    #Solver Requirement
    users = User.query.all()

    iteration = 9
    """
    for i in range(1, iteration):
        data = User(
            id = 125+i, 
            company_id = 10000, 
            first_name = "Test",
            last_name = "2", 
            employment = "Temp", 
            employment_level = 1.0,
            company_name = f'Use Case {i+1}', 
            department = "Test",
            access_level = "Admin", 
            email = f'1@usecase{i+1}.com', 
            password = generate_password_hash("test"),
            created_by = 10000, 
            changed_by = 10000, 
            creation_timestamp = "26.08.2023"
            )
        db.session.add(data)
    db.session.commit()
    """

    # Manually adding Availability
    weekdays = {0:'Monday', 1:'Tuesday', 2:'Wednesday', 3:'Thursday', 4:'Friday', 5:'Saturday', 6:'Sunday'}

    for ma in range(2, 7):
        for day in range(7):
            avail = Availability(
                id=628 + day + 7*ma-2,
                user_id=56 + ma -1,
                email=f'{ma}@usecase8.ch',
                date=datetime.datetime(2023, 8, 28, 0, 0, 0) + datetime.timedelta(days=day),
                weekday=weekdays[day],
                start_time=datetime.time(8, 0, 0),
                end_time=datetime.time(17, 0, 0),
                start_time2=datetime.time(0, 0, 0),
                end_time2=datetime.time(0, 0, 0),
                start_time3=datetime.time(0, 0, 0),
                end_time3=datetime.time(0, 0, 0),
                created_by=1,
                changed_by=1,
                creation_timestamp=datetime.datetime.now(),
                )
            day += 1
            db. session.add(avail)
    db.session.commit()
    return "Company_name column updated successfully."

    """
    # Manually adding TimeReq
    db.session.add(TimeReq(
        company_name='TechCorp',
        date=date.today(),
        start_time=time(9, 0, 0),
        worker=1,
        created_by=1,
        changed_by=1,
        creation_timestamp=datetime.now(),
        update_timestamp=datetime.now()
    ))
    time_req = TimeReq(
        company_name='TechCorp',
        date=date.today(),
        start_time=time(9, 0, 0),
        worker=1,
        created_by=1,
        changed_by=1,
        creation_timestamp=datetime.now(),
        update_timestamp=datetime.now()
    )
    db.session.add(time_req)
    db.session.commit()

    # Manually adding Company
    company = Company(
        id=1,
        company_name='TechCorp',
        weekly_hours=40,
        shifts=5,
        created_by=1,
        changed_by=1,
        creation_timestamp=datetime.now(),
        update_timestamp=datetime.now()
    )
    db.session.add(company)
    db.session.commit()

    # Manually adding OpeningHours
    opening_hours = OpeningHours(
        company_name='TechCorp',
        weekday='Monday',
        start_time=time(9, 0, 0),
        end_time=time(17, 0, 0),
        created_by=1,
        changed_by=1,
        creation_timestamp=datetime.now(),
        update_timestamp=datetime.now()
    )
    db.session.add(opening_hours)
    db.session.commit()

    # Manually adding Timetable
    timetable = Timetable(
        email='john.doe@example.com',
        first_name='John',
        last_name='Doe',
        company_name='TechCorp',
        date=date.today(),
        start_time=time(9, 0, 0),
        end_time=time(17, 0, 0),
        created_by=1,
        changed_by=1,
        creation_timestamp=datetime.now(),
        update_timestamp=datetime.now()
    )
    db.session.add(timetable)
    db.session.commit()

    # Manually adding TemplateTimeRequirement
    template_time_req = TemplateTimeRequirement(
        template_name='Default',
        date=date.today(),
        weekday='Monday',
        start_time=time(9, 0, 0),
        worker=1,
        created_by=1,
        changed_by=1,
        creation_timestamp=datetime.now(),
        update_timestamp=datetime.now()
    )
    db.session.add(template_time_req)
    db.session.commit()

    # Manually adding TemplateAvailability
    template_availability = TemplateAvailability(
        template_name='Default',
        email='john.doe@example.com',
        date=date.today(),
        weekday='Monday',
        start_time=time(9, 0, 0),
        end_time=time(17, 0, 0),
        created_by=1,
        changed_by=1,
        creation_timestamp=datetime.now(),
        update_timestamp=datetime.now()
    )
    db.session.add(template_availability)
    db.session.commit()

    # Manually adding RegistrationToken
    registration_token = RegistrationToken(
        email='john.doe@example.com',
        token='123456',
        company_name='TechCorp',
        employment='Engineer',
        employment_level=1.5,
        department='Engineering',
        access_level='Admin',
        created_by=1,
        creation_timestamp=datetime.now()
    )
    db.session.add(registration_token)
    db.session.commit()

    # Manually adding PasswordReset
    password_reset = PasswordReset(
        email='john.doe@example.com',
        token='654321',
        expiration=datetime.now() + timedelta(hours=24),
        creation_timestamp=datetime.now()
    )
    db.session.add(password_reset)
    db.session.commit()
    """

    """
    # Manually adding SolverRequirement
    solver_requirement = SolverRequirement(
        id=17,
        company_name='Use Case 8',
        weekly_hours=42,
        shifts=1,
        desired_min_time_day=5,
        desired_max_time_day=8,
        min_time_day=3,
        max_time_day=9,
        desired_max_time_week=42,
        max_time_week=45,
        hour_divider=1,
        fair_distribution=30,
        week_timeframe=1,
        nb1=5, nb2=5, nb3=5, nb4=5, nb5=5, nb6=5, nb7=5, nb8=0,
        nb9=5, nb10=5, nb11=5, nb12=5, nb13=5, nb14=5, nb15=5,
        nb16=5, nb17=5, nb18=5, nb19=5, nb20=5,
        created_by=10000,
        changed_by=10000,
        creation_timestamp=datetime.datetime.now(),
        update_timestamp=datetime.datetime.now()
    )
    db. session.add(solver_requirement)
    db.session.commit()
    return "Company_name column updated successfully."
    """


if __name__ == "__main__":
    app.run(debug=True, port=5000)
