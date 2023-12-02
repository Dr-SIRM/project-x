from flask import request, url_for, session, jsonify, send_from_directory, make_response, send_file, redirect
from flask_mail import Message
import datetime
from datetime import date, time
from werkzeug.security import generate_password_hash, check_password_hash
import random
from models import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt, create_refresh_token
from app import app, mail, timedelta, get_database_uri
from openpyxl import Workbook
import io
from excel_output import create_excel_output
from sqlalchemy import func, extract, not_, and_, or_, asc, desc, text, create_engine, inspect, case, exists
from sqlalchemy.orm import scoped_session, sessionmaker
import stripe
import math
from contextlib import contextmanager
from functools import wraps
import logging


#Import of Database
#-------------------------------------------------------------------------

from models import OverviewUser, OverviewCompany, User, Availability, TimeReq, Company, OpeningHours, Timetable, \
    TemplateAvailability, TemplateTimeRequirement, RegistrationToken, PasswordReset, \
    SolverRequirement, SolverAnalysis



@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory('./static/react-app/build', path)


@app.route('/react_dashboard')
def react_dashboard():
    return send_from_directory('static/react-app/build', 'index.html')

@contextmanager
def get_session(uri):
    engine = create_engine(uri)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@app.route('/api/login', methods=['POST'])
def login_react():
    email = request.json.get('email')
    password = request.json.get('password')

    user = OverviewUser.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401
    # Generate the JWT token
    additional_claims = {"company_name": user.company_name}
    session_token = create_access_token(identity=email, additional_claims=additional_claims)

    # Return the session token
    response = make_response(jsonify({'session_token': session_token}))
    response.set_cookie('session_token', session_token, httponly=True, secure=True)

    refresh_token = create_refresh_token(identity=email)

    # Save User Data and token
    response = {
        'session_token': session_token,
        'refresh_token': refresh_token,
        'user': {
            'email': user.email,
            'company': user.company_name,
            'access_level': user.access_level
        }
    }

    return jsonify(response)

@app.route('/api/token/refresh', methods=['POST'])
@jwt_required(refresh=True) 
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify({'session_token': new_token})


@app.route('/api/current_react_user')
@jwt_required()
def current_react_user():
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        user = session.query(User).filter_by(email=react_user).first()
        
        if user is None:
            return jsonify({"msg": "User not found"}), 404

        user_dict = {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'company_name': user.company_name,
            'email': user.email,
            'access_level': user.access_level
        }

    return jsonify(user_dict)

# @app.route('/api/current_react_user')
# def get_general_data():
#     react_user = get_jwt_identity()
#     user = User.query.filter_by(email=react_user).first()
#     company = Company.query.filter_by(company_name=user.company_name).first()
#     timereq = TimeReq.query.filter_by(company_name=user.company_name).first()

#     general_dict = {
#         'id': user.id,
#         'hour_divider': timereq.hour_divider,
#     }

#     return jsonify(general_dict)

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_data():
    react_user_email = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        current_user = session.query(User).filter_by(email=react_user_email).first()
        
        if current_user is None:
            return jsonify({"message": "User not found"}), 404

        current_company_name = current_user.company_name
        company = session.query(Company).filter_by(company_name=current_company_name).first()

        if company is None:
            return jsonify({"message": "Company not found"}), 404

        departments = [
        company.department,
        company.department2,
        company.department3,
        company.department4,
        company.department5,
        company.department6,
        company.department7,
        company.department8,
        company.department9,
        company.department10,
        ]

        # Filter out any None values from the departments list
        departments = [dept for dept in departments if dept is not None]

        users = session.query(User).filter_by(company_name=current_company_name).filter(not_(User.access_level == "Super_Admin")).all()

        user_list = []
        for user in users:
            user_dict = {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'company_name': user.company_name,
                'email': user.email,
                'phone': user.phone_number,
                'in_training': user.in_training,
                'access_level': user.access_level,
                'employment': user.employment,
                'department': user.department,
                'department2': user.department2,
                'department3': user.department3,
                'employment_level': user.employment_level,
                'in_training': user.in_training,
            }
            user_list.append(user_dict)

        response_dict = {
            'users': user_list,
            'departments': departments
        }
    
    return jsonify(response_dict)



@app.route('/api/users/update/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    data = request.get_json()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        user = session.query(User).get(user_id)
        
        if user is None:
            return jsonify({"message": "User not found"}), 404

        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.in_training = data.get('in_training', user.in_training)
        user.employment = data.get('employment', user.employment)
        user.department = data.get('department1', user.department)
        user.department2 = data.get('department2', user.department2)
        user.department3 = data.get('department3', user.department3)

        employment_level_percentage = data.get('employment_level')
        if employment_level_percentage is not None:
            user.employment_level = employment_level_percentage / 100.0

        # Commit and rollback are handled by the context manager

    return jsonify({"message": "User updated"}), 200


@app.route('/api/users/delete/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        user_to_delete = session.query(User).get(user_id)
        if user_to_delete is None:
            return jsonify({"message": "User not found"}), 404

        session.delete(user_to_delete)

    return jsonify({"message": "User deleted"}), 200


@app.route('/api/new_user', methods=['GET', 'POST'])
@jwt_required()
def new_user():
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()

    if user is None:
        return jsonify({'message': 'User not found'}), 404

    departments = (
        Company.query
        .filter_by(company_name=user.company_name)
        .with_entities(
            Company.department,
            Company.department2,
            Company.department3,
            Company.department4,
            Company.department5,
            Company.department6,
            Company.department7,
            Company.department8,
            Company.department9,
            Company.department10
        )
        .first()
    )

    # Flatten the list of departments and filter out None values
    department_list = [dept for dept in departments if dept] if departments else []

    if request.method =='POST':
        admin_registration_data = request.get_json()
        company_name = admin_registration_data['company_name']

        if admin_registration_data['password'] != admin_registration_data['password2']:
            return jsonify({'message': 'Passwords do not match'}), 400

        # Check if company name already exists
        existing_company = OverviewCompany.query.filter_by(company_name=company_name).first()

        if existing_company:
            uri = get_database_uri('', "timetab")
            with get_session(uri) as session:
            
                data1 = OverviewUser( 
                            email = admin_registration_data['email'], 
                            company_name = admin_registration_data['company_name'], 
                            password = generate_password_hash(admin_registration_data['password']),
                            access_level = admin_registration_data['access_level'], 
                            creation_timestamp = datetime.datetime.now()
                            )
                
                data2 = User(
                            company_id = None, 
                            first_name = admin_registration_data['first_name'],
                            last_name = admin_registration_data['last_name'], 
                            employment = admin_registration_data['employment'], 
                            employment_level = admin_registration_data['employment_level'],
                            company_name = admin_registration_data['company_name'], 
                            department = admin_registration_data['department'] if 'department' in admin_registration_data else None,
                            department2 = admin_registration_data['department2'] if 'department2' in admin_registration_data else None,
                            department3 = admin_registration_data['department3'] if 'department3' in admin_registration_data else None,
                            department4 = None,
                            department5 = None,
                            department6 = None,
                            department7 = None,
                            department8 = None,
                            department9 = None,
                            department10 = None,
                            access_level = admin_registration_data['access_level'], 
                            email = admin_registration_data['email'],
                            phone_number = admin_registration_data['phone_number'] if 'phone_number' in admin_registration_data else None,
                            in_training = None, 
                            password = generate_password_hash(admin_registration_data['password']),
                            created_by = user.id, 
                            changed_by = user.id, 
                            creation_timestamp = datetime.datetime.now()
                            )
                
                session.add(data1)
                session.add(data2)

            uri = get_database_uri('', company_name.lower().replace(' ', '_'))
            with get_session(uri) as session:

                data3 = User(
                            company_id = None, 
                            first_name = admin_registration_data['first_name'],
                            last_name = admin_registration_data['last_name'], 
                            employment = admin_registration_data['employment'], 
                            employment_level = admin_registration_data['employment_level'],
                            company_name = admin_registration_data['company_name'], 
                            department = admin_registration_data['department'] if 'department' in admin_registration_data else None,
                            department2 = admin_registration_data['department2'] if 'department2' in admin_registration_data else None,
                            department3 = admin_registration_data['department3'] if 'department3' in admin_registration_data else None,
                            department4 = None,
                            department5 = None,
                            department6 = None,
                            department7 = None,
                            department8 = None,
                            department9 = None,
                            department10 = None,
                            access_level = admin_registration_data['access_level'], 
                            email = admin_registration_data['email'], 
                            phone_number = admin_registration_data['phone_number'] if 'phone_number' in admin_registration_data else None,
                            in_training = None, 
                            password = generate_password_hash(admin_registration_data['password']),
                            created_by = user.id, 
                            changed_by = user.id, 
                            creation_timestamp = datetime.datetime.now()
                            )

                session.add(data3)
                return jsonify({'message': 'Successful Registration'}), 200
        else:
            schema_name = f"schema_{admin_registration_data['company_name'].lower().replace(' ', '_')}"
            with db.engine.connect() as connection:
                try:
                    connection.execute(text(f"CREATE SCHEMA `{schema_name}`;"))
                    connection.commit()  # Commit the changes
                except Exception as e:
                    print(str(e))
                    return jsonify({'message': 'Failed to create schema'}), 500

                # Clone entire schema
                original_schema = 'schema_timetab'
                query = text("SELECT table_name FROM information_schema.tables WHERE table_schema = :schema")
                tables = connection.execute(query, {'schema': original_schema}).fetchall()
                for table in tables:
                    table_name = table[0]
                    connection.execute(text(f"CREATE TABLE `{schema_name}`.`{table_name}` LIKE `{original_schema}`.`{table_name}`;"))
                connection.commit()  # Commit the changes after cloning the schema
                        
            uri = get_database_uri('', "timetab")
            with get_session(uri) as session:

                data1 = OverviewUser( 
                    email = admin_registration_data['email'], 
                    company_name = admin_registration_data['company_name'], 
                    password = generate_password_hash(admin_registration_data['password']),
                    access_level = admin_registration_data['access_level'], 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                data2 = OverviewCompany( 
                    company_name = admin_registration_data['company_name'], 
                    subscription = 'Test', 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                generic_admin = OverviewUser( 
                    email = f"{admin_registration_data['company_name'].lower().replace(' ', '_')}@timetab.ch", 
                    company_name = admin_registration_data['company_name'], 
                    password = generate_password_hash('ProjectX2023.'),
                    access_level = 'Super_Admin', 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                data3 = User( 
                    company_id = None, 
                    first_name = "Time",
                    last_name = "Tab", 
                    employment = None, 
                    employment_level = None,
                    company_name = admin_registration_data['company_name'], 
                    department = None,
                    department2 = None,
                    department3 = None,
                    department4 = None,
                    department5 = None,
                    department6 = None,
                    department7 = None,
                    department8 = None,
                    department9 = None,
                    department10 = None,
                    access_level = "Super_Admin", 
                    email = f"{admin_registration_data['company_name'].lower().replace(' ', '_')}@timetab.ch",
                    phone_number = None,
                    in_training = None,  
                    password = generate_password_hash('ProjectX2023.'),
                    created_by = user.id, 
                    changed_by = user.id, 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                data4 = User(
                    company_id = None, 
                    first_name = admin_registration_data['first_name'],
                    last_name = admin_registration_data['last_name'], 
                    employment = admin_registration_data['employment'], 
                    employment_level = admin_registration_data['employment_level'],
                    company_name = admin_registration_data['company_name'], 
                    department = admin_registration_data['department'] if 'department' in admin_registration_data else None,
                    department2 = admin_registration_data['department2'] if 'department2' in admin_registration_data else None,
                    department3 = admin_registration_data['department3'] if 'department3' in admin_registration_data else None,
                    department4 = None,
                    department5 = None,
                    department6 = None,
                    department7 = None,
                    department8 = None,
                    department9 = None,
                    department10 = None,
                    access_level = admin_registration_data['access_level'], 
                    email = admin_registration_data['email'], 
                    phone_number = admin_registration_data['phone_number'] if 'phone_number' in admin_registration_data else None,
                    in_training = None, 
                    password = generate_password_hash(admin_registration_data['password']),
                    created_by = user.id, 
                    changed_by = user.id, 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                session.add(data1)
                session.add(data2)
                session.add(data3)
                session.add(data4)
                session.add(generic_admin)
                    
            uri = get_database_uri('', company_name.lower().replace(' ', '_'))
            with get_session(uri) as session:
                    
                data5 = User(
                    company_id = None, 
                    first_name = "Time",
                    last_name = "Tab", 
                    employment = None, 
                    employment_level = None,
                    company_name = admin_registration_data['company_name'], 
                    department = None,
                    department2 = None,
                    department3 = None,
                    department4 = None,
                    department5 = None,
                    department6 = None,
                    department7 = None,
                    department8 = None,
                    department9 = None,
                    department10 = None,
                    access_level = "Super_Admin", 
                    email = f"{admin_registration_data['company_name'].lower().replace(' ', '_')}@timetab.ch", 
                    phone_number = None,
                    in_training = None, 
                    password = generate_password_hash('ProjectX2023.'),
                    created_by = user.id, 
                    changed_by = user.id, 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                data6 = User(
                    company_id = None, 
                    first_name = admin_registration_data['first_name'],
                    last_name = admin_registration_data['last_name'], 
                    employment = admin_registration_data['employment'], 
                    employment_level = admin_registration_data['employment_level'],
                    company_name = admin_registration_data['company_name'], 
                    department = admin_registration_data['department'] if 'department' in admin_registration_data else None,
                    department2 = admin_registration_data['department2'] if 'department2' in admin_registration_data else None,
                    department3 = admin_registration_data['department3'] if 'department3' in admin_registration_data else None,
                    department4 = None,
                    department5 = None,
                    department6 = None,
                    department7 = None,
                    department8 = None,
                    department9 = None,
                    department10 = None,
                    access_level = admin_registration_data['access_level'], 
                    email = admin_registration_data['email'], 
                    phone_number = admin_registration_data['phone_number'] if 'phone_number' in admin_registration_data else None,
                    in_training = None, 
                    password = generate_password_hash(admin_registration_data['password']),
                    created_by = user.id, 
                    changed_by = user.id, 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                session.add(data5)
                session.add(data6)
                print("Schema and entry created")
                    
    user_dict={
    'department_list': department_list,
    }
    return jsonify(user_dict)


@app.route('/api/update', methods=["GET", "POST"])
@jwt_required()
def react_update():
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')

    if request.method == 'POST':
        user_data = request.get_json()
        uri = get_database_uri('', session_company)

        with get_session(uri) as session:
            user = session.query(User).filter_by(email=react_user).first()
            if user is None:
                return jsonify({"message": "User not found"}), 404
            
            with get_session(uri) as session:
                user = session.query(User).filter_by(email=react_user).first()
                if user is None:
                    return jsonify({"message": "User not found"}), 404

                user.first_name = user_data.get('first_name', user.first_name)
                user.last_name = user_data.get('last_name', user.last_name)
                user.email = user_data.get('email', user.email)
                user.phone_number = user_data.get('phone_number', user.phone_number)

                if user_data['password'] != user_data['password2']:
                    return jsonify({'message': 'Passwords do not match'}), 400

                hashed_password = generate_password_hash(user_data['password'])
                user.password = hashed_password
                user.changed_by = react_user
                user.update_timestamp = datetime.datetime.now()

                return jsonify({'message': 'Success'}), 200

    else:
        uri = get_database_uri('', session_company)
        with get_session(uri) as session:
            user = session.query(User).filter_by(email=react_user).first()
            if user is None:
                return jsonify({"message": "User not found"}), 404

            user_dict = {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone_number': user.phone_number,
                'password': user.password,
                }


            return jsonify(user_dict)


@app.route('/api/change/password', methods=["GET", "POST"])
@jwt_required()
def get_change_password():
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        user = session.query(User).filter_by(email=react_user).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        if request.method == 'POST':
            password_data = request.get_json()
            if password_data['password'] != password_data['password2']:
                return jsonify({'message': 'Passwords do not match'}), 400

            hashed_password = generate_password_hash(password_data['password'])
            user.password = hashed_password
            user.changed_by = user.id
            user.update_timestamp = datetime.datetime.now()

            return jsonify({'message': 'Password successfully updated!'}), 200

    return jsonify({'message': 'Method not allowed'}), 405


def get_time_str(time_str):
    try:
        return datetime.datetime.strptime(time_str, '%H:%M:%S').time()
    except:
        return datetime.datetime.strptime(time_str, '%H:%M').time()


@app.route('/api/company', methods=['GET', 'POST'])
@jwt_required()
def get_company():
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)
    day_num = 7
    weekdays = {0:'Montag', 1:'Dienstag', 2:'Mittwoch', 3:'Donnerstag', 4:'Freitag', 5:'Samstag', 6:'Sonntag'}

    with get_session(uri) as session:
        user = session.query(User).filter_by(email=react_user).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        company = session.query(Company).filter_by(company_name=jwt_data.get("company_name")).first()
        if company is None:
            # Return or handle the scenario when the company is not found
            return jsonify({"message": "Company not found"}), 404

        # Code for GET request - Fetch and return company details
        if request.method == 'GET':
            company = session.query(Company).filter_by(company_name=jwt_data.get("company_name")).first()

            if company is None:
                company_name = user.company_name
                shift = ''
                weekly_hour = ''
                department = ''
                department2 = ''
                department3 = ''
                department4 = ''
                department5 = ''
                department6 = ''
                department7 = ''
                department8 = ''
                department9 = ''
                department10 = ''
            else:
                company_name = company.company_name
                shift = company.shifts
                weekly_hour = company.weekly_hours
                department = company.department
                department2 = company.department2
                department3 = company.department3
                department4 = company.department4
                department5 = company.department5
                department6 = company.department6
                department7 = company.department7
                department8 = company.department8
                department9 = company.department9
                department10 = company.department10


            # Fetch Opening Data
            all_opening_hours = session.query(OpeningHours).filter(
                OpeningHours.company_name == user.company_name,
                OpeningHours.weekday.in_(list(weekdays.values()))
            ).all()
            
            opening_hours_dict = {oh.weekday: oh for oh in all_opening_hours}
            opening_dict = {}
                
            for i in range(day_num):
                weekday = weekdays.get(i)
                opening = opening_hours_dict.get(weekday)
                
                if opening is not None:
                    new_i = i + 1
                    opening_dict[str(new_i) + '&0'] = opening.start_time.strftime("%H:%M") if opening.start_time else None
                    opening_dict[str(new_i) + '&1'] = opening.end_time.strftime("%H:%M") if opening.end_time else None
                    opening_dict[str(new_i) + '&2'] = opening.start_time2.strftime("%H:%M") if opening.start_time2 else None
                    opening_dict[str(new_i) + '&3'] = opening.end_time2.strftime("%H:%M") if opening.end_time2 else None

            company_list = {
                'company_name': company_name,
                'shifts': shift,
                'weekly_hours': weekly_hour,
                'department' : department,
                'department2' : department2,
                'department3' : department3,
                'department4' : department4,
                'department5' : department5,
                'department6' : department6,
                'department7' : department7,
                'department8' : department8,
                'department9' : department9,
                'department10' : department10,
                'weekdays': weekdays,
                'day_num': day_num,
                'opening_dict': opening_dict, 
            }

            return jsonify(company_list)


        elif request.method == 'POST':
            company_data = request.get_json()

            # Delete existing company data
            session.query(OpeningHours).filter_by(company_name=user.company_name).delete()

            # Insert new company data
            # Removed manual ID setting, assuming that the ID column in your database is set to auto-increment
            new_company_data = Company(
                company_name=company_data['company_name'],
                weekly_hours=company_data['weekly_hours'],
                shifts=company_data['shifts'],
                department=company_data['department'] if company_data.get('department') else None,
                department2=company_data['department2'] if company_data.get('department2') else None,
                department3=company_data['department3'] if company_data.get('department3') else None,
                department4=None,
                department5=None,
                department6=None,
                department7=None,
                department8=None,
                department9=None,
                department10=None,
                created_by=None,
                changed_by=None,
                creation_timestamp=datetime.datetime.now(),
            )
            session.merge(new_company_data)

            # Create list to hold new OpeningHours entries
            new_opening_hours_entries = []

            for i in range(day_num):
                entry1 = request.json.get(f'day_{i}_0')
                entry2 = request.json.get(f'day_{i}_1')
                entry3 = request.json.get(f'day_{i}_2')
                entry4 = request.json.get(f'day_{i}_3')
                
                if entry1:
                    new_entry1 = get_time_str(entry1) if entry1 else None
                    new_entry2 = get_time_str(entry2) if entry2 else None
                    new_entry3 = get_time_str(entry3) if entry3 else None
                    new_entry4 = get_time_str(entry4) if entry4 else None

                    new_weekday = weekdays[i]
                    
                    # Create new OpeningHours entry
                    opening = OpeningHours(
                        company_name=user.company_name,
                        weekday=new_weekday,
                        start_time=new_entry1,
                        end_time=new_entry2,
                        start_time2=new_entry3,
                        end_time2=new_entry4,
                        created_by=None,
                        changed_by=None,
                        creation_timestamp=datetime.datetime.now(),
                    )
                    
                    # Append to list of new entries
                    new_opening_hours_entries.append(opening)


            # Bulk insert all new OpeningHours entries and commit
            session.bulk_save_objects(new_opening_hours_entries)
            return jsonify({"message": "Successful operation"}), 200 
    

def get_temp_availability_dict(template_name, email, day_num, weekdays):

    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        temp_availability_dict = {}

        # Query once to get all relevant TemplateTimeRequirements
        all_temps = session.query(TemplateAvailability).filter_by(
            email=email,
            template_name=template_name
        ).all()

        temp_dict = {(av.weekday): av for av in all_temps}

        for i in range(day_num):
            temp = temp_dict.get((weekdays[i]))
            
            if temp:
                new_i = i + 1
                temp_availability_dict[f"{new_i}&0"] = temp.start_time.strftime("%H:%M") if temp.start_time else None
                temp_availability_dict[f"{new_i}&1"] = temp.end_time.strftime("%H:%M") if temp.end_time else None
                temp_availability_dict[f"{new_i}&2"] = temp.start_time2.strftime("%H:%M") if temp.start_time2 else None
                temp_availability_dict[f"{new_i}&3"] = temp.end_time2.strftime("%H:%M") if temp.end_time2 else None
                temp_availability_dict[f"{new_i}&4"] = temp.start_time3.strftime("%H:%M") if temp.start_time3 else None
                temp_availability_dict[f"{new_i}&5"] = temp.end_time3.strftime("%H:%M") if temp.end_time3 else None

    return temp_availability_dict


@app.route('/api/availability', methods = ['GET', 'POST'])
@jwt_required()
def get_availability():

    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        user = session.query(User).filter_by(email=react_user).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # today's date
        today = datetime.date.today()
        creation_date = datetime.datetime.now()
        monday = today - datetime.timedelta(days=today.weekday())
        weekdays = {0:'Montag', 1:'Dienstag', 2:'Mittwoch', 3:'Donnerstag', 4:'Freitag', 5:'Samstag', 6:'Sonntag'}
        day_num = 7
        company_id = user.company_id
        solverreq = session.query(SolverRequirement).filter_by(company_name=user.company_name).first()
        opening = session.query(OpeningHours).filter_by(company_name=user.company_name).first()

        # Week with adjustments
        monday = today - datetime.timedelta(days=today.weekday())
        week_adjustment = int(request.args.get('week_adjustment', 0)) +7
        week_start = monday + datetime.timedelta(days=week_adjustment)

        query_weekdays = [weekdays[i] for i in range(day_num)]
        dates = [week_start + datetime.timedelta(days=i) for i in range(day_num)]


        # Fetch Opening Data
        all_opening_hours = session.query(OpeningHours).filter(
            OpeningHours.company_name == user.company_name,
            OpeningHours.weekday.in_(list(weekdays.values()))
        ).all()
        
        opening_hours_dict = {oh.weekday: oh for oh in all_opening_hours}


        # Create Drop Down Based Access Level
        if user.access_level == "User":
            user_list = [f"{user.first_name}, {user.last_name}, {user.email}"]
        else:
            # Query all users from the same company, excluding the current user
            company_users = session.query(User).filter(
                User.company_name == user.company_name,
                User.email != react_user
            ).filter(not_(User.access_level == "Super_Admin")
            ).order_by(asc(User.last_name)).all()

            # Create a list of user details
            user_list = [f"{user.first_name}, {user.last_name}, {user.email}" for user in company_users]
        
        print(user_list)

        if request.method == 'GET':
            selected_user = request.args.get('selectedUser', None)
        else: # request.method == 'POST'
            selected_user = request.json.get('selectedUser', None)

        if selected_user:
            # Parse the 'selectedUser' string to extract the email
            first_name, last_name, email = selected_user.split(', ')
            selected_user_email = email.strip()
        else:
            # Fall back to the logged-in user's email if 'selectedUser' is not provided
            selected_user_email = user.email
        
        # Use the extracted email in the availability query
        availabilities = session.query(Availability).filter(
            Availability.email == selected_user_email,
            Availability.date.in_(dates),
            Availability.weekday.in_(query_weekdays)
        ).all()

        temp_dict = {}
        availability_dict = {(av.date, av.weekday): av for av in availabilities}
        
        for i, date in enumerate(dates):
            temp = availability_dict.get((date, weekdays[i]))
            
            if temp:
                new_i = i + 1
                temp_dict[f"checkBox{new_i}"] = temp.holiday if temp.holiday else None
                temp_dict[f"{new_i}&0"] = temp.start_time.strftime("%H:%M") if temp.start_time else None
                temp_dict[f"{new_i}&1"] = temp.end_time.strftime("%H:%M") if temp.end_time else None
                temp_dict[f"{new_i}&2"] = temp.start_time2.strftime("%H:%M") if temp.start_time2 else None
                temp_dict[f"{new_i}&3"] = temp.end_time2.strftime("%H:%M") if temp.end_time2 else None
                temp_dict[f"{new_i}&4"] = temp.start_time3.strftime("%H:%M") if temp.start_time3 else None
                temp_dict[f"{new_i}&5"] = temp.end_time3.strftime("%H:%M") if temp.end_time3 else None
    

        #Save Availability
        if request.method == 'POST':
            button = request.json.get("button", None)
            if button == "Submit":
                user_selection = request.json.get("selectedUser", None)
                print("Availability: ", request.json)
                if user_selection == "":
                    new_user = user
                else:
                    first_name, last_name, email = user_selection.split(', ')
                    new_user = session.query(User).filter_by(email=email).first()
                
                new_entries = []
                
                # Delete all entries for the range in one operation
                for i in range(day_num):
                    new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
                    try:
                        session.query(Availability).filter_by(email=new_user.email, date=new_date).delete()
                    except:
                        pass
                

                # Create all new entries
                for i in range(day_num):
                    new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
                    new_weekday = weekdays[i]

                    if request.json.get(f'checkbox_{i}') is True:
                        planned_holiday = "X"
                        print(i)
                    else:
                        planned_holiday = None

                    weekday = weekdays.get(i)
                    opening_details = opening_hours_dict.get(weekday)
                    
                    # Loop through entries
                    new_entry = {}
                    for j in range(6):
                        entry = request.json.get(f'day_{i}_{j}')
                        if entry is None:
                            new_entry[f'entry{j + 1}'] = None
                        else:
                            new_entry[f'entry{j + 1}'] = get_time_str(entry) if entry else None
                            if new_entry['entry1']:
                                availability_hours = new_entry['entry1'].hour
                                availability_minutes = new_entry['entry1'].minute
                                total_availability_start = availability_hours * solverreq.hour_divider + availability_minutes
                                print(i, j, total_availability_start)
                                opening_hours = opening_details.start_time.hour
                                opening_minutes = opening_details.start_time.minute
                                total_opening_start = opening_hours * solverreq.hour_divider + opening_minutes
                                print(opening_details.start_time)
                                print(i, j , total_opening_start)
                                if total_availability_start == 0:
                                    new_entry[f'entry{j + 1}'] = get_time_str(entry) if entry else None
                                elif total_availability_start < total_opening_start:
                                    new_entry['entry1'] = opening_details.start_time
                                else:
                                    new_entry[f'entry{j + 1}'] = get_time_str(entry) if entry else None



                    # Create a new Availability instance and add to list
                    data = Availability(
                        user_id=new_user.id, 
                        date=new_date, 
                        weekday=new_weekday, 
                        holiday=planned_holiday,
                        email=new_user.email,
                        start_time=new_entry['entry1'], 
                        end_time=new_entry['entry2'], 
                        start_time2=new_entry['entry3'],
                        end_time2=new_entry['entry4'], 
                        start_time3=new_entry['entry5'], 
                        end_time3=new_entry['entry6'],
                        created_by=company_id, 
                        changed_by=company_id, 
                        creation_timestamp=creation_date
                    )
                    new_entries.append(data)
                    
                # Bulk insert and commit
                session.bulk_save_objects(new_entries)

        
        #Save Template Availability
        if request.method == 'POST':
            button = request.json.get("button", None)
            if button == "Save Template":
                new_entries = []
                availability_data = request.get_json()
        
                # Delete all entries for the range in one operation
                for i in range(day_num):
                    data_deletion = TemplateAvailability.query.filter_by(email=user.email, template_name=availability_data['selectedTemplate'])
                    if data_deletion:
                            data_deletion.delete()

                # Create all new entries
                for i in range(day_num):
                    new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
                    new_weekday = weekdays[i]
                    
                    # Loop through entries
                    new_entry = {}
                    for j in range(6):
                        entry = request.json.get(f'day_{i}_{j}')
                        new_entry[f'entry{j + 1}'] = get_time_str(entry) if entry else None

                    # Create a new Availability instance and add to list
                    data = TemplateAvailability(
                        template_name=availability_data['selectedTemplate'],
                        date=new_date, 
                        weekday=new_weekday, 
                        email=user.email,
                        holiday=None,
                        start_time=new_entry['entry1'], 
                        end_time=new_entry['entry2'], 
                        start_time2=new_entry['entry3'],
                        end_time2=new_entry['entry4'], 
                        start_time3=new_entry['entry5'], 
                        end_time3=new_entry['entry6'],
                        created_by=company_id, 
                        changed_by=company_id, 
                        creation_timestamp=creation_date
                    )
                    new_entries.append(data)
                    
                # Bulk insert and commit
                session.bulk_save_objects(new_entries)


        availability_list = {
            'weekdays': weekdays,
            'day_num': day_num,
            'temp_dict': temp_dict,
            'week_start': week_start,
            'hour_divider': solverreq.hour_divider,
            'user_list': user_list,
            'template1_dict': get_temp_availability_dict("Template 1", user.email, day_num, weekdays),
            'template2_dict': get_temp_availability_dict("Template 2", user.email, day_num, weekdays),
            'template3_dict': get_temp_availability_dict("Template 3", user.email, day_num, weekdays),
        }


        return jsonify(availability_list)


@app.route('/api/forget_password', methods=["GET", "POST"])
def get_forget_password():
    if request.method == 'POST':
        forget_password_data = request.get_json()
        uri = get_database_uri('', "timetab")
        with get_session(uri) as session:
            existing_user = OverviewUser.query.filter_by(email=forget_password_data['email']).first()
            if existing_user is None:
                return jsonify({"message": "No User exists under your email"}), 400
            else:
                random_token = random.randint(100000,999999)
                reset_url = url_for('reset_password', token=random_token, _external=True)

                data = PasswordReset(email=forget_password_data['email'], token=random_token)
                session.add(data)

        # The session is automatically closed here due to the context manager
        msg = Message('Reset Password', recipients=['timetab@gmx.ch'])
        msg.body = f"Hey there,\n \n Below you will find your reset Link. \n \n {reset_url}"
        mail.send(msg)

        return jsonify({"message": "Password reset email sent"}), 200
    return jsonify({"message": "Method not allowed"}), 405



@app.route('/api/invite', methods = ['GET', 'POST'])
@jwt_required()
def get_invite():
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        user = session.query(User).filter_by(email=react_user).first()

        #List of Departments
        departments = (
            session.query(Company)
            .filter_by(company_name=user.company_name)
            .with_entities(
                Company.department,
                Company.department2,
                Company.department3,
                Company.department4,
                Company.department5,
                Company.department6,
                Company.department7,
                Company.department8,
                Company.department9,
                Company.department10
            )
            .first()
        )

        department_list = [department for department in departments if department is not None]

        if request.method == 'POST':
            invite_data = request.get_json()
            random_token = random.randint(100000,999999)

            data = RegistrationToken( 
                email=invite_data['email'], 
                token=random_token, 
                company_name=invite_data['company_name'], 
                department = invite_data['department'] if 'department' in invite_data else None, 
                department2 = invite_data['department2'] if 'department2' in invite_data else None,
                department3 = invite_data['department3'] if 'department3' in invite_data else None,
                department4 = None,
                department5 = None,
                department6 = None,
                department7 = None,
                department8 = None,
                department9 = None,
                department10 = None,
                employment=invite_data['employment'], 
                employment_level=invite_data['employment_level'], 
                in_training=invite_data['in_training'] if 'in_training' in invite_data else None, 
                access_level=invite_data['access_level'], 
                created_by=user.company_id)

            session.add(data)

        # The session is automatically closed here

    if request.method == 'POST':
        msg = Message('Registration Token', recipients=['timetab@gmx.ch'])
        msg.body = f"Hey there,\n \n Below you will find your registration token \n \n {random_token}"
        mail.send(msg)

    invite_dict = {
        'email': "",
        'company_name': user.company_name,
        'department': "",
        'employment': "",
        'department_list': department_list,
        'employment_level': "",
        'access_level': "",
    }

    return jsonify(invite_dict)


from flask_socketio import SocketIO
socketio = SocketIO(app, cors_allowed_origins="*") 
from data_processing import DataProcessing
from or_algorithm import ORAlgorithm
from or_algorithm_cp import ORAlgorithm_cp

@app.route('/api/solver', methods=['POST'])
@jwt_required()
def run_solver():

    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        user = session.query(User).filter_by(email=react_user).first()

        solver_data = request.get_json()
        # The session is automatically managed by the context manager

        start_week = solver_data['startWeek']
        # Calculate the start date
        today = datetime.datetime.today()
        start_date_delta = datetime.timedelta(weeks=start_week)
        start_date = (today.date() - datetime.timedelta(days=today.weekday())) + start_date_delta

        if 'solverButtonClicked' in solver_data and solver_data['solverButtonClicked']:
            dp = DataProcessing(user.email, start_date)
            dp.run()
            or_algo_cp = ORAlgorithm_cp(dp)

            or_algo_cp.run()
        
            errors = []  # List to store all errors
            
            for i in range(1, 6):  # Assuming you have 6 pre-checks
                pre_check_result = getattr(or_algo_cp, f'pre_check_{i}')()
                socketio.emit('pre_check_update', {
                    'pre_check_number': i,
                    'status': 'completed' if pre_check_result["success"] else 'error',
                    'message': pre_check_result["message"]
                })

                if not pre_check_result["success"]:
                    errors.append(f'Pre-check {i} failed: {pre_check_result["message"]}\n')

            # If errors occurred during the checks, they are sent here.
            if errors:
                return jsonify({'message': errors}), 400
            
            # Maximale Solvingzeit aufgrund Berechnungen
            solve_time = or_algo_cp.solving_time()

            socketio.emit('solve_time', {'time': solve_time})

            # If no errors occurred, the algorithm is further executed.
            or_algo_cp.run_2()

            # 1 == Solver hat eine Lösung gefunden, 0 == Solver hat keine Lösung gefunden
            solver_res = or_algo_cp.solver_result()

            socketio.emit('solution_completion', {'solution': solver_res})

            # If no errors occurred, the algorithm is further executed.
            or_algo_cp.run_3()


            print("Solver successfully started")  # Log success
            return jsonify({'message': 'Solver successfully started'}), 200
        else:
            print("Solver button was not clicked")  # Log if button wasn’t clicked
            return jsonify({'message': 'Solver button was not clicked'}), 200
    

    

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)  # Adjust host and port as needed



@app.route('/api/solver/requirement', methods = ['GET', 'POST'])
@jwt_required()
def solver_req():
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        user = session.query(User).filter_by(email=react_user).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        

        company = session.query(Company).filter_by(company_name=user.company_name).first()
        solver_requirement = session.query(SolverRequirement).filter_by(company_name=user.company_name).first()

        if solver_requirement is None:
            company_name = ""
            weekly_hours = ""
            shifts = ""
            desired_min_time_day = ""
            desired_max_time_day = ""
            min_time_day = ""
            max_time_day = ""
            desired_max_time_week = ""
            max_time_week = ""
            hour_divider = ""
            fair_distribution = ""
            week_timeframe = ""
            subsequent_workingdays = ""
            daily_deployment = ""
            time_per_deployment = ""
            new_fte_per_slot = "" 
            subsequent_workingdays_max = ""
            skills_per_day = ""
            nb1 = ""
            nb2 = ""
            nb3 = ""
            nb4 = ""
            nb5 = ""
            nb6 = ""
            nb7 = ""
            nb8 = ""
            nb9 = ""
            nb10 = ""
            nb11 = ""
            nb12 = ""
            nb13 = ""
            nb14 = ""
            nb15 = ""
            nb16 = ""
            nb17 = ""
            nb18 = ""
            nb19 = ""
            nb20 = ""
        else:
            company_name = company.company_name
            weekly_hours = company.weekly_hours
            shifts = company.shifts
            desired_min_time_day = solver_requirement.desired_min_time_day
            desired_max_time_day = solver_requirement.desired_max_time_day
            min_time_day = solver_requirement.min_time_day
            max_time_day = solver_requirement.max_time_day
            desired_max_time_week = company.weekly_hours
            max_time_week = solver_requirement.max_time_week
            hour_divider = solver_requirement.hour_divider
            fair_distribution = solver_requirement.fair_distribution
            week_timeframe = solver_requirement.week_timeframe
            subsequent_workingdays = solver_requirement.subsequent_workingdays
            daily_deployment = solver_requirement.daily_deployment
            time_per_deployment = solver_requirement.time_per_deployment
            new_fte_per_slot = solver_requirement.new_fte_per_slot 
            subsequent_workingdays_max = solver_requirement.subsequent_workingdays_max
            skills_per_day = solver_requirement.skills_per_day
            nb1 = solver_requirement.nb1
            nb2 = solver_requirement.nb2
            nb3 = solver_requirement.nb3
            nb4 = solver_requirement.nb4
            nb5 = solver_requirement.nb5
            nb6 = solver_requirement.nb6
            nb7 = solver_requirement.nb7
            nb8 = solver_requirement.nb8
            nb9 = solver_requirement.nb9
            nb10 = solver_requirement.nb10
            nb11 = solver_requirement.nb11
            nb12 = solver_requirement.nb12
            nb13 = solver_requirement.nb13
            nb14 = solver_requirement.nb14
            nb15 = solver_requirement.nb15
            nb16 = solver_requirement.nb16
            nb17 = solver_requirement.nb17
            nb18 = solver_requirement.nb18
            nb19 = solver_requirement.nb19
            nb20 =solver_requirement.nb20

        #Submit Solver Requirements
        if request.method =='POST':
            solver_req_data = request.get_json()
            data_deletion = session.query(SolverRequirement).filter_by(company_name=user.company_name)
            if solver_requirement:
                data_deletion.delete()
            else:
                pass

            data = SolverRequirement(       
                                    company_name = user.company_name,
                                    weekly_hours = company.weekly_hours,
                                    shifts = company.shifts,
                                    desired_min_time_day = solver_req_data['desired_min_time_day'],
                                    desired_max_time_day = solver_req_data['desired_max_time_day'],
                                    min_time_day = solver_req_data['min_time_day'],
                                    max_time_day = solver_req_data['max_time_day'],
                                    desired_max_time_week = solver_req_data['desired_max_time_week'],
                                    max_time_week = solver_req_data['max_time_week'],
                                    hour_divider = solver_req_data['hour_divider'],
                                    fair_distribution = None,
                                    week_timeframe = solver_req_data['week_timeframe'],
                                    subsequent_workingdays = solver_req_data['subsequent_workingdays'],
                                    daily_deployment = solver_req_data['daily_deployment'],
                                    time_per_deployment = solver_req_data['time_per_deployment'],
                                    new_fte_per_slot = solver_req_data['new_fte_per_slot'],
                                    subsequent_workingdays_max = solver_req_data['subsequent_workingdays_max'],
                                    skills_per_day = solver_req_data['skills_per_day'],
                                    nb1 = solver_req_data['nb1'],
                                    nb2 = solver_req_data['nb2'],
                                    nb3 = solver_req_data['nb3'],
                                    nb4 = solver_req_data['nb4'],
                                    nb5 = solver_req_data['nb5'],
                                    nb6 = solver_req_data['nb6'],
                                    nb7 = solver_req_data['nb7'],
                                    nb8 = solver_req_data['nb8'],
                                    nb9 = solver_req_data['nb9'],
                                    nb10 = solver_req_data['nb10'],
                                    nb11 = solver_req_data['nb11'],
                                    nb12 = solver_req_data['nb12'],
                                    nb13 = 0,
                                    nb14 = 0,
                                    nb15 = 0,
                                    nb16 = 0,
                                    nb17 = 0,
                                    nb18 = 0,
                                    nb19 = 0,
                                    nb20 = 0,
                                    created_by = user.company_id,
                                    changed_by = user.company_id,
                                    creation_timestamp = datetime.datetime.now(),
                                    update_timestamp = datetime.datetime.now()
                                    )
            session.add(data)


        solver_req_dict = {
        "company_name": company_name,
        "weekly_hours": weekly_hours,
        "shifts": shifts,
        "desired_min_time_day": desired_min_time_day,
        "desired_max_time_day": desired_max_time_day,
        "min_time_day": min_time_day,
        "max_time_day": max_time_day,
        "desired_max_time_week": desired_max_time_week,
        "max_time_week": max_time_week,
        "hour_divider": hour_divider,
        "fair_distribution": fair_distribution,
        "week_timeframe": week_timeframe,
        "subsequent_workingdays": subsequent_workingdays,
        "daily_deployment": daily_deployment,
        "time_per_deployment": time_per_deployment,
        "new_fte_per_slot": new_fte_per_slot, 
        "subsequent_workingdays_max": subsequent_workingdays_max,
        "skills_per_day": skills_per_day,
        "nb1": nb1,
        "nb2": nb2,
        "nb3": nb3,
        "nb4": nb4,
        "nb5": nb5,
        "nb6": nb6,
        "nb7": nb7,
        "nb8": nb8,
        "nb9": nb9,
        "nb10": nb10,
        "nb11": nb11,
        "nb12": nb12,
        "nb13": nb13,
        "nb14": nb14,
        "nb15": nb15,
        "nb16": nb16,
        "nb17": nb17,
        "nb18": nb18,
        "nb19": nb19,
        "nb20": nb20
        }
    
    return jsonify(solver_req_dict)





@app.route('/api/token_registration', methods = ['POST'])
def get_registration():   

    if request.method == 'POST':
        registration_data = request.get_json()
        if registration_data['password'] != registration_data['password2']:
            return jsonify({'message': 'Passwords do not match'}), 400

        uri_timetab = get_database_uri('', 'timetab')
        uri_company = get_database_uri('', registration_data['company_name'].lower().replace(' ', '_'))

        token = RegistrationToken.query.filter_by(token=registration_data['token'], email=registration_data['email']).first()
        if token is None:
            return jsonify({'message': 'Invalid token'}), 400

        with get_session(uri_timetab) as session:

            data1 = User( 
                company_id = None, 
                first_name = registration_data['first_name'],
                last_name = registration_data['last_name'],
                employment = token.employment,
                employment_level = token.employment_level,
                company_name = token.company_name, 
                access_level = token.access_level, 
                department = token.department,
                department2 = token.department2,
                department3 = token.department3,
                department4 = token.department4,
                department5 = token.department5,
                department6 = token.department6,
                department7 = token.department7,
                department8 = token.department8,
                department9 = token.department9,
                department10 = token.department10,
                email = token.email, 
                phone_number = registration_data['phone_number'] if 'phone_number' in registration_data else None,
                in_training = token.in_training,
                password = generate_password_hash(registration_data['password']),
                created_by = None, 
                changed_by = None, 
                creation_timestamp = datetime.datetime.now()
                )

            data2 = OverviewUser( 
                email = token.email, 
                company_name = token.company_name,
                password = generate_password_hash(registration_data['password']),
                access_level = token.access_level,
                creation_timestamp = datetime.datetime.now()
                )
            
            
            session.add(data1)
            session.add(data2)

        with get_session(uri_company) as session:

            data3 = User(
                company_id = None, 
                first_name = registration_data['first_name'],
                last_name = registration_data['last_name'],
                employment = token.employment,
                employment_level = token.employment_level,
                company_name = token.company_name, 
                access_level = token.access_level, 
                department = token.department,
                department2 = token.department2,
                department3 = token.department3,
                department4 = token.department4,
                department5 = token.department5,
                department6 = token.department6,
                department7 = token.department7,
                department8 = token.department8,
                department9 = token.department9,
                department10 = token.department10,
                email = token.email, 
                phone_number = registration_data['phone_number'] if 'phone_number' in registration_data else None,
                in_training = token.in_training,
                password = generate_password_hash(registration_data['password']),
                created_by = None, 
                changed_by = None, 
                creation_timestamp = datetime.datetime.now()
                )

            session.add(data3)

    return jsonify({'message': 'Registration successful'}), 200


@app.route('/api/registration/admin', methods = ['GET', 'POST'])
def get_admin_registration():

    if request.method =='POST':
        admin_registration_data = request.get_json()
        company_name = admin_registration_data['company_name']

        if admin_registration_data['password'] != admin_registration_data['password2']:
            return jsonify({'message': 'Passwords do not match'}), 400

        # Check if company name already exists
        existing_company = OverviewCompany.query.filter_by(company_name=company_name).first()

        if existing_company:
            uri = get_database_uri('', "timetab")
            with get_session(uri) as session:
            
                data1 = OverviewUser( 
                            email = admin_registration_data['email'], 
                            company_name = admin_registration_data['company_name'], 
                            password = generate_password_hash(admin_registration_data['password']),
                            access_level = admin_registration_data['access_level'], 
                            creation_timestamp = datetime.datetime.now()
                            )
                
                data2 = User(
                            company_id = None, 
                            first_name = admin_registration_data['first_name'],
                            last_name = admin_registration_data['last_name'], 
                            employment = admin_registration_data['employment'], 
                            employment_level = admin_registration_data['employment_level'],
                            company_name = admin_registration_data['company_name'], 
                            department = admin_registration_data['department'] if 'department' in admin_registration_data else None,
                            department2 = admin_registration_data['department2'] if 'department2' in admin_registration_data else None,
                            department3 = admin_registration_data['department3'] if 'department3' in admin_registration_data else None,
                            department4 = None,
                            department5 = None,
                            department6 = None,
                            department7 = None,
                            department8 = None,
                            department9 = None,
                            department10 = None,
                            access_level = admin_registration_data['access_level'], 
                            email = admin_registration_data['email'],
                            phone_number = admin_registration_data['phone_number'] if 'phone_number' in admin_registration_data else None,
                            in_training = None, 
                            password = generate_password_hash(admin_registration_data['password']),
                            created_by = None, 
                            changed_by = None, 
                            creation_timestamp = datetime.datetime.now()
                            )
                
                session.add(data1)
                session.add(data2)

            uri = get_database_uri('', company_name.lower().replace(' ', '_'))
            with get_session(uri) as session:

                data3 = User(
                            company_id = None, 
                            first_name = admin_registration_data['first_name'],
                            last_name = admin_registration_data['last_name'], 
                            employment = admin_registration_data['employment'], 
                            employment_level = admin_registration_data['employment_level'],
                            company_name = admin_registration_data['company_name'], 
                            department = admin_registration_data['department'] if 'department' in admin_registration_data else None,
                            department2 = admin_registration_data['department2'] if 'department2' in admin_registration_data else None,
                            department3 = admin_registration_data['department3'] if 'department3' in admin_registration_data else None,
                            department4 = None,
                            department5 = None,
                            department6 = None,
                            department7 = None,
                            department8 = None,
                            department9 = None,
                            department10 = None,
                            access_level = admin_registration_data['access_level'], 
                            email = admin_registration_data['email'], 
                            phone_number = admin_registration_data['phone_number'] if 'phone_number' in admin_registration_data else None,
                            in_training = None, 
                            password = generate_password_hash(admin_registration_data['password']),
                            created_by = None, 
                            changed_by = None, 
                            creation_timestamp = datetime.datetime.now()
                            )

                session.add(data3)
                return jsonify({'message': 'Successful Registration'}), 200
        else:
            schema_name = f"schema_{admin_registration_data['company_name'].lower().replace(' ', '_')}"
            with db.engine.connect() as connection:
                try:
                    connection.execute(text(f"CREATE SCHEMA `{schema_name}`;"))
                    connection.commit()  # Commit the changes
                except Exception as e:
                    print(str(e))
                    return jsonify({'message': 'Failed to create schema'}), 500

                # Clone entire schema
                original_schema = 'schema_timetab'
                query = text("SELECT table_name FROM information_schema.tables WHERE table_schema = :schema")
                tables = connection.execute(query, {'schema': original_schema}).fetchall()
                for table in tables:
                    table_name = table[0]
                    connection.execute(text(f"CREATE TABLE `{schema_name}`.`{table_name}` LIKE `{original_schema}`.`{table_name}`;"))
                connection.commit()  # Commit the changes after cloning the schema
                        
            uri = get_database_uri('', "timetab")
            with get_session(uri) as session:

                data1 = OverviewUser( 
                    email = admin_registration_data['email'], 
                    company_name = admin_registration_data['company_name'], 
                    password = generate_password_hash(admin_registration_data['password']),
                    access_level = admin_registration_data['access_level'], 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                data2 = OverviewCompany( 
                    company_name = admin_registration_data['company_name'], 
                    subscription = 'Test', 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                generic_admin = OverviewUser( 
                    email = f"{admin_registration_data['company_name'].lower().replace(' ', '_')}@timetab.ch", 
                    company_name = admin_registration_data['company_name'], 
                    password = generate_password_hash('ProjectX2023.'),
                    access_level = 'Super_Admin', 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                data3 = User( 
                    company_id = None, 
                    first_name = "Time",
                    last_name = "Tab", 
                    employment = None, 
                    employment_level = None,
                    company_name = admin_registration_data['company_name'], 
                    department = None,
                    department2 = None,
                    department3 = None,
                    department4 = None,
                    department5 = None,
                    department6 = None,
                    department7 = None,
                    department8 = None,
                    department9 = None,
                    department10 = None,
                    access_level = "Super_Admin", 
                    email = f"{admin_registration_data['company_name'].lower().replace(' ', '_')}@timetab.ch",
                    phone_number = None,
                    in_training = None,  
                    password = generate_password_hash('ProjectX2023.'),
                    created_by = None, 
                    changed_by = None, 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                data4 = User(
                    company_id = None, 
                    first_name = admin_registration_data['first_name'],
                    last_name = admin_registration_data['last_name'], 
                    employment = admin_registration_data['employment'], 
                    employment_level = admin_registration_data['employment_level'],
                    company_name = admin_registration_data['company_name'], 
                    department = admin_registration_data['department'] if 'department' in admin_registration_data else None,
                    department2 = admin_registration_data['department2'] if 'department2' in admin_registration_data else None,
                    department3 = admin_registration_data['department3'] if 'department3' in admin_registration_data else None,
                    department4 = None,
                    department5 = None,
                    department6 = None,
                    department7 = None,
                    department8 = None,
                    department9 = None,
                    department10 = None,
                    access_level = admin_registration_data['access_level'], 
                    email = admin_registration_data['email'], 
                    phone_number = admin_registration_data['phone_number'] if 'phone_number' in admin_registration_data else None,
                    in_training = None, 
                    password = generate_password_hash(admin_registration_data['password']),
                    created_by = None, 
                    changed_by = None, 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                session.add(data1)
                session.add(data2)
                session.add(data3)
                session.add(data4)
                session.add(generic_admin)
                    
            uri = get_database_uri('', company_name.lower().replace(' ', '_'))
            with get_session(uri) as session:
                    
                data5 = User(
                    company_id = None, 
                    first_name = "Time",
                    last_name = "Tab", 
                    employment = None, 
                    employment_level = None,
                    company_name = admin_registration_data['company_name'], 
                    department = None,
                    department2 = None,
                    department3 = None,
                    department4 = None,
                    department5 = None,
                    department6 = None,
                    department7 = None,
                    department8 = None,
                    department9 = None,
                    department10 = None,
                    access_level = "Super_Admin", 
                    email = f"{admin_registration_data['company_name'].lower().replace(' ', '_')}@timetab.ch", 
                    phone_number = None,
                    in_training = None, 
                    password = generate_password_hash('ProjectX2023.'),
                    created_by = None, 
                    changed_by = None, 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                data6 = User(
                    company_id = None, 
                    first_name = admin_registration_data['first_name'],
                    last_name = admin_registration_data['last_name'], 
                    employment = admin_registration_data['employment'], 
                    employment_level = admin_registration_data['employment_level'],
                    company_name = admin_registration_data['company_name'], 
                    department = admin_registration_data['department'] if 'department' in admin_registration_data else None,
                    department2 = admin_registration_data['department2'] if 'department2' in admin_registration_data else None,
                    department3 = admin_registration_data['department3'] if 'department3' in admin_registration_data else None,
                    department4 = None,
                    department5 = None,
                    department6 = None,
                    department7 = None,
                    department8 = None,
                    department9 = None,
                    department10 = None,
                    access_level = admin_registration_data['access_level'], 
                    email = admin_registration_data['email'], 
                    phone_number = admin_registration_data['phone_number'] if 'phone_number' in admin_registration_data else None,
                    in_training = None, 
                    password = generate_password_hash(admin_registration_data['password']),
                    created_by = None, 
                    changed_by = None, 
                    creation_timestamp = datetime.datetime.now()
                    )
                
                session.add(data5)
                session.add(data6)
                print("Schema and entry created")
                
   

                

def get_temp_timereq_dict(template_name, day_num, daily_slots, hour_divider, minutes, company_name, full_day):

    uri = get_database_uri('', company_name.lower().replace(' ', '_'))

    with get_session(uri) as session:
        # Query once to get all relevant TemplateTimeRequirements
        all_temps = session.query(TemplateTimeRequirement).filter_by(
            company_name=company_name,
            template_name=template_name
        ).all()

        # Convert all_temps to a convenient lookup structure
        temp_lookup = {(temp.weekday, temp.start_time): temp.worker for temp in all_temps if temp.worker != 0}

        temp_timereq_dict = {}
        for i in range(day_num):
            for hour in range(daily_slots):
                adjusted_hour = hour if hour <= full_day else hour - full_day - 1
                quarter_hour = adjusted_hour // hour_divider
                quarter_minute = (adjusted_hour % hour_divider) * minutes
                formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
                new_time = datetime.datetime.strptime(f'{formatted_time}:00', '%H:%M:%S').time()

                # Use lookup instead of database query
                worker_count = temp_lookup.get((str(i), new_time))
                
                if worker_count is not None:
                    key = f"{i}-{hour + full_day + 1}" if hour > full_day else f"{i}-{hour}"
                    temp_timereq_dict[key] = worker_count

    return temp_timereq_dict


def is_within_opening_hours(time, opening, closing):
    if opening is None or closing is None:
        return False
    if closing >= opening:
        return opening <= time < closing
    else:
        return opening <= time or time < closing



@app.route('/api/requirement/workforce', methods = ['GET', 'POST'])
@jwt_required()
def get_required_workforce():

    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    company_uri = get_database_uri('', jwt_data["company_name"].lower().replace(' ', '_'))

    with get_session(company_uri) as session:
        user = session.query(User).filter_by(email=react_user).first()
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        creation_date = datetime.datetime.now()
        weekdays = {0: 'Montag', 1: 'Dienstag', 2: 'Mittwoch', 3: 'Donnerstag', 4: 'Freitag', 5: 'Samstag', 6: 'Sonntag'}
        today = datetime.date.today()
        solverreq = session.query(SolverRequirement).filter_by(company_name=user.company_name).first()
        hour_divider = solverreq.hour_divider
        full_day = (24 * hour_divider) -1
        minutes = 60 / hour_divider
        day_num = 7   
        company_id = user.company_id

    

        # Fetch Opening Data
        all_opening_hours = session.query(OpeningHours).filter(
            OpeningHours.company_name == user.company_name,
            OpeningHours.weekday.in_(list(weekdays.values()))
        ).all()
        
        opening_hours_dict = {oh.weekday: oh for oh in all_opening_hours}

        # Calculation Working Day
        closing_times = []
        for i in range(day_num):
            weekday = weekdays.get(i)
            closing = opening_hours_dict.get(weekday)
            slot = 24

            if closing:
                if closing.end_time == None:
                    pass
                else:
                    if closing.end_time2 == None:
                        if closing.end_time < closing.start_time:
                            hour = closing.end_time.hour
                            minute = closing.end_time.minute / 60 if closing.end_time.minute != 0 else 0
                            slot += hour + minute
                    else:
                        if closing.end_time2 < closing.start_time:
                            hour = closing.end_time2.hour
                            minute = closing.end_time2.minute / 60 if closing.end_time2.minute != 0 else 0
                            slot += hour + minute
                            
                closing_times.append(slot)

        daily_slots = int(max(closing_times) * hour_divider)

        # Calculation Min Working Day
        opening_times = []
        for i in range(day_num):
            weekday = weekdays.get(i)
            opening = opening_hours_dict.get(weekday)
            slot = 0

            if opening:
                if opening.start_time == None:
                    pass
                else:
                    hour = opening.start_time.hour
                    minute = opening.start_time.minute / 60 if opening.start_time.minute != 0 else 0
                    slot += hour + minute
                            
                opening_times.append(slot)
        
        min_opening = min(opening_times)* hour_divider

        # Week with adjustments
        monday = today - datetime.timedelta(days=today.weekday())
        week_adjustment = int(request.args.get('week_adjustment', 0)) +7
        week_start = monday + datetime.timedelta(days=week_adjustment)

        slot_dict = {}
        for i in range(min_opening, int(daily_slots)):
            effective_hour = i % (full_day + 1) # This will wrap around the time after 24
            quarter_hour = effective_hour / hour_divider
            quarter_minute = (effective_hour % hour_divider) * minutes  # Remainder gives the quarter in the hour
            
            formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
            slot_dict[i] = formatted_time
        
        # Pre-fetch all TimeReq for the given date range and company name
        end_date = week_start + datetime.timedelta(days=day_num)
        all_time_reqs = session.query(TimeReq).filter(
            TimeReq.company_name == user.company_name,
            TimeReq.department == request.args.get('selectedDepartment'),
            TimeReq.date.between(week_start, end_date)
        ).all()


        # Convert all_time_reqs to a dictionary for quick lookup
        time_req_lookup = {(rec.date, rec.start_time): rec.worker for rec in all_time_reqs}

        timereq_dict = {}
        for i in range(day_num):
            for hour in range(int(daily_slots)):
                if hour >= full_day +1:
                    hour -= full_day + 1
                    new_date = monday + datetime.timedelta(days=i+1) + datetime.timedelta(days=week_adjustment)
                    quarter_hour = hour // hour_divider
                    quarter_minute = (hour % hour_divider) * minutes
                    formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
                    time = f'{formatted_time}:00'
                    new_time = datetime.datetime.strptime(time, '%H:%M:%S').time()
                    hour += full_day + 1
                else:
                    new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
                    quarter_hour = hour // hour_divider
                    quarter_minute = (hour % hour_divider) * minutes
                    formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
                    time = f'{formatted_time}:00'
                    new_time = datetime.datetime.strptime(time, '%H:%M:%S').time()
                
                # Use dictionary for quick lookup
                worker_count = time_req_lookup.get((new_date, new_time), 0)
                
                if worker_count != 0:
                    new_i = i + 1  # (Is this variable used?)
                    timereq_dict[f"{i}-{hour}"] = worker_count


        # Opening Dictionary
        opening_dict = {}
            
        for i in range(day_num):
            weekday = weekdays.get(i)
            opening = opening_hours_dict.get(weekday)
            
            if opening is not None:
                new_i = i + 1
                opening_dict[str(new_i) + '&0'] = opening.start_time.strftime("%H:%M") if opening.start_time else None
                opening_dict[str(new_i) + '&1'] = opening.end_time.strftime("%H:%M") if opening.end_time else None
                
                if opening.end_time2 != None:
                    opening_dict[str(new_i) + '&2'] = opening.start_time2.strftime("%H:%M") if opening.start_time2 else None
                    opening_dict[str(new_i) + '&3'] = opening.end_time2.strftime("%H:%M") if opening.end_time2 else None

        #List of Departments
        departments = (
            session.query(Company)
            .filter_by(company_name=user.company_name)
            .with_entities(
                Company.department,
                Company.department2,
                Company.department3,
                Company.department4,
                Company.department5,
                Company.department6,
                Company.department7,
                Company.department8,
                Company.department9,
                Company.department10
            )
            .first()
        )

        department_list = [department for department in departments if department is not None]

        #Submit the required FTE per hour
        if request.method == 'POST':
            button = request.json.get("button", None)
            workforce_data = request.get_json()
            if button == "Submit":
                week_adjustment = int(request.args.get('week_adjustment', 0)) +7

                # Delete existing TimeReq entries for the week
                new_dates = [monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment) for i in range(day_num)]
                session.query(TimeReq).filter(
                    TimeReq.company_name == user.company_name,
                    TimeReq.department == workforce_data['department'] if 'department' in workforce_data else None,
                    TimeReq.date.in_(new_dates)
                ).delete()

                # Create new TimeReq entries
                new_records = []
                for i in range(day_num):
                    for quarter in range(int(daily_slots)):
                        weekday = weekdays.get(i)
                        opening_details = opening_hours_dict.get(weekday)
                        if opening_details == None:
                            pass
                        else:
                            opening_hours = opening_details.start_time.hour * hour_divider
                            opening_minutes = math.ceil(opening_details.start_time.minute /60 * hour_divider)
                            total_hours = opening_hours + opening_minutes
                            if quarter < (total_hours):
                                pass
                            else:
                                if quarter >= full_day +1:
                                    quarter -= full_day + 1

                                    if i+1 < day_num:
                                        new_date = new_dates[i+1]
                                        weekday = weekdays.get(i)
                                        opening_details = opening_hours_dict.get(weekday)
                                    else:
                                        new_date = new_dates[i] + datetime.timedelta(days=1)
                                        weekday = weekdays.get(i)
                                        opening_details = opening_hours_dict.get(weekday)
                                else:
                                    new_date = new_dates[i]
                                    weekday = weekdays.get(i)
                                    opening_details = opening_hours_dict.get(weekday)
                
                                quarter_hour = quarter // hour_divider
                                quarter_minute = (quarter % hour_divider) * minutes
                                formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
                        
                                capacity = workforce_data.get(f'worker_{i}_{formatted_time}', 0)
                                
                                time = f'{formatted_time}:00'
                                new_time = datetime.datetime.strptime(time, '%H:%M:%S').time()

                                if opening_details:
                                    if opening_details.end_time2 is not None:
                                        # Both end_time and end_time2 are defined
                                        if is_within_opening_hours(new_time, opening_details.start_time, opening_details.end_time) or \
                                        is_within_opening_hours(new_time, opening_details.start_time, opening_details.end_time2):
                                            pass
                                        else:
                                            capacity = 0
                                    else:
                                        # Only end_time is defined
                                        if is_within_opening_hours(new_time, opening_details.start_time, opening_details.end_time):
                                            pass
                                        else:
                                            capacity = 0
                                    
                                new_record = TimeReq(
                                    company_name=user.company_name,
                                    department=workforce_data['department'],
                                    date=new_date,
                                    start_time=new_time,
                                    worker=capacity,
                                    created_by=company_id,
                                    changed_by=company_id,
                                    creation_timestamp=creation_date
                                )
                                new_records.append(new_record)
                session.bulk_save_objects(new_records)

        #Save Templates
            if button == "Save Template":
                data_deletion = session.query(TemplateTimeRequirement).filter_by(company_name=user.company_name, template_name=workforce_data['template_name'])
                if data_deletion:
                    data_deletion.delete()
                for i in range(day_num):
                    for quarter in range(int(daily_slots)): # There are 96 quarters in a day
                        if quarter >= full_day +1:
                            quarter -= full_day + 1
                            quarter_hour = quarter / hour_divider  # Each quarter represents 15 minutes, so divided by 4 gives hour
                            quarter_minute = (quarter % hour_divider) * minutes  # Remainder gives the quarter in the hour
                            formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
                        else:
                            quarter_hour = quarter / hour_divider  # Each quarter represents 15 minutes, so divided by 4 gives hour
                            quarter_minute = (quarter % hour_divider) * minutes  # Remainder gives the quarter in the hour
                            formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
                        capacity = workforce_data.get(f'worker_{i}_{formatted_time}')
                        if capacity:
                            time = f'{formatted_time}:00'
                            new_time = datetime.datetime.strptime(time, '%H:%M:%S').time()

                            temp_req = TemplateTimeRequirement(
                                company_name = user.company_name,
                                template_name = workforce_data['template_name'],
                                weekday = {i},
                                start_time = new_time,
                                worker = capacity,
                                created_by = user.company_id,
                                changed_by = user.company_id,
                                creation_timestamp = creation_date
                                )
                            session.add(temp_req)
            
        calendar_dict={
            'weekdays': weekdays,
            'opening_dict': opening_dict,
            'slots_dict': slot_dict,
            'day_num': day_num,
            'timereq_dict': timereq_dict,
            'week_start': week_start,
            'hour_divider': hour_divider,
            'daily_slots': daily_slots,
            'minutes': minutes,
            'department_list': department_list,
            'template1_dict': get_temp_timereq_dict("Template 1", day_num, daily_slots, hour_divider, minutes, user.company_name, full_day),
            'template2_dict': get_temp_timereq_dict("Template 2", day_num, daily_slots, hour_divider, minutes, user.company_name, full_day),
            'template3_dict': get_temp_timereq_dict("Template 3", day_num, daily_slots, hour_divider, minutes, user.company_name, full_day),

        }

    return jsonify(calendar_dict)


@app.route('/api/schichtplanung', methods=['POST', 'GET'])
@jwt_required()
def get_shift():

    react_user_email = get_jwt_identity()
    jwt_data = get_jwt()
    company_uri = get_database_uri('', jwt_data["company_name"].lower().replace(' ', '_'))

    with get_session(company_uri) as session:
        current_user = session.query(User).filter_by(email=react_user_email).first()
        if not current_user:
            return jsonify({"message": "User not found"}), 404

        today = datetime.date.today()
        current_week_num = int(today.isocalendar()[1])
        current_company_name = current_user.company_name

        DAY_MAP = {
            'monday': 'montag',
            'tuesday': 'dienstag',
            'wednesday': 'mittwoch',
            'thursday': 'donnerstag',
            'friday': 'freitag',
            'saturday': 'samstag',
            'sunday': 'sonntag',
        }


        view = request.args.get('view')
        today = date.today()

        if view == 'day':
            specific_day = request.args.get('specific_day') # or another appropriate name
            start_date, end_date = specific_day, specific_day

        elif view == 'week':
            # Retrieve the start_date and end_date from query parameters
            start_date_str = request.args.get('start_date')
            end_date_str = request.args.get('end_date')

            # Convert the date strings to date objects
            if start_date_str and end_date_str:
                start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date()
                end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date()
            else:
                # If no dates are provided, default to the current week
                start_date = today - datetime.timedelta(days=today.weekday())
                end_date = start_date + datetime.timedelta(days=6)
        else:
            start_date, end_date = None, None  # default to getting all shifts

        # Query users who are members of the same company
        users = session.query(User).filter_by(company_name=current_company_name).filter(not_(User.access_level == "Super_Admin")).all()

        user_list = []
        for user in users:
            user_dict = {
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
            user_list.append(user_dict)

        # Query the opening hours for the current company
        opening_hours_records = session.query(OpeningHours).filter_by(company_name=current_company_name).all()

        opening_hours_data = {}
        for record in opening_hours_records:
            german_day = DAY_MAP.get(record.weekday.lower(), record.weekday.lower())
            
            # Determine which end time to use
            end_time = record.end_time2 if record.end_time2 is not None else record.end_time
            
            if record.start_time is not None and end_time is not None:
                opening_hours_data[german_day] = {
                    "start": record.start_time.strftime("%H:%M"),
                    "end": end_time.strftime("%H:%M")
            }
        logging.debug(f"Opening hours data: {opening_hours_data}")
        print("Opening:", opening_hours_data)

        if start_date and end_date:
            shift_records = session.query(Timetable).filter(
                Timetable.company_name == current_company_name, 
                Timetable.date >= start_date, 
                Timetable.date <= end_date
            ).all()
        else:
            shift_records = session.query(Timetable).filter_by(company_name=current_company_name).all()


        shift_data = []
        for record in shift_records:
            if record.date is not None:
                date_str = record.date.strftime("%Y-%m-%d")
            else:
                date_str = None

            shift_data.append({
                'email': record.email,
                'first_name': record.first_name,
                'last_name': record.last_name,
                'department': record.department,
                'date': date_str,
                'shifts': [
                    {
                        'start_time': record.start_time.strftime("%H:%M") if record.start_time is not None else None,
                        'end_time': record.end_time.strftime("%H:%M") if record.end_time is not None else None
                    },
                    {
                        'start_time': record.start_time2.strftime("%H:%M") if record.start_time2 is not None else None,
                        'end_time': record.end_time2.strftime("%H:%M") if record.end_time2 is not None else None
                    },
                    {
                        'start_time': record.start_time3.strftime("%H:%M") if record.start_time3 is not None else None,
                        'end_time': record.end_time3.strftime("%H:%M") if record.end_time3 is not None else None
                    }
                ]
            })
            #print("Shift:", shift_data)

        response = {
            'users': user_list,
            'opening_hours': opening_hours_data,
            'shifts': shift_data,
            'current_week_num': current_week_num
        }

    return jsonify(response)



@app.route('/api/schichtplanung2', methods=['GET'])
@jwt_required()
def get_shift2():
    react_user_email = get_jwt_identity()
    jwt_data = get_jwt()
    company_uri = get_database_uri('', jwt_data["company_name"].lower().replace(' ', '_'))

    with get_session(company_uri) as session:
        current_user = session.query(User).filter_by(email=react_user_email).first()
        if not current_user:
            return jsonify({"message": "User not found"}), 404

        current_company_name = current_user.company_name
        DAY_MAP = {
            'monday': 'montag',
            'tuesday': 'dienstag',
            'wednesday': 'mittwoch',
            'thursday': 'donnerstag',
            'friday': 'freitag',
            'saturday': 'samstag',
            'sunday': 'sonntag',
        }

        # Query users who are members of the same company
        users = session.query(User).filter_by(company_name=current_company_name).filter(not_(User.access_level == "Super_Admin")).all()

        user_list = []
        for user in users:
            user_dict = {
                'first_name': user.first_name,
                'last_name': user.last_name,
                "email": user.email,
            }
            user_list.append(user_dict)

        # Query the opening hours for the current company
        opening_hours_records = session.query(OpeningHours).filter_by(company_name=current_company_name).all()

        opening_hours_data = {}
        for record in opening_hours_records:
            german_day = DAY_MAP.get(record.weekday.lower(), record.weekday.lower())
            end_time = record.end_time2 if record.end_time2 is not None else record.end_time
            if record.start_time is not None and end_time is not None:
                opening_hours_data[german_day] = {
                    "start": record.start_time.strftime("%H:%M"),
                    "end": end_time.strftime("%H:%M")
                }

        # Fetching all shifts for the company
        shift_records = session.query(Timetable).filter_by(company_name=current_company_name).all()

        shift_data = []
        for record in shift_records:
            date_str = record.date.strftime("%Y-%m-%d") if record.date is not None else None
            shift_data.append({
                'email': record.email,
                'first_name': record.first_name,
                'last_name': record.last_name,
                'department': record.department,
                'date': date_str,
                'shifts': [
                    {
                        'start_time': record.start_time.strftime("%H:%M") if record.start_time is not None else None,
                        'end_time': record.end_time.strftime("%H:%M") if record.end_time is not None else None
                    },
                    {
                        'start_time': record.start_time2.strftime("%H:%M") if record.start_time2 is not None else None,
                        'end_time': record.end_time2.strftime("%H:%M") if record.end_time2 is not None else None
                    },
                    {
                        'start_time': record.start_time3.strftime("%H:%M") if record.start_time3 is not None else None,
                        'end_time': record.end_time3.strftime("%H:%M") if record.end_time3 is not None else None
                    }
                ]
            })

        response = {
            'users': user_list,
            'opening_hours': opening_hours_data,
            'shifts': shift_data
        }

    return jsonify(response)

import locale

@app.route('/api/dashboard', methods=['POST', 'GET'])
@jwt_required() # Die Route ist durch den Dekorator geschützt, ein gültiger JWT-Token muss vorhanden sein
def get_dashboard_data():
    current_user_id = get_jwt_identity() # Benutzer ID aus dem Token holen
    jwt_data = get_jwt() # Gesamter Token holen

    # Extrahiert den Firmennamen aus dem JWT, wandelt ihn in Kleinbuchstaben um und ersetzt Leerzeichen durch Unterstriche.
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company) # uri für Datenbankverbindung erstellen

    with get_session(uri) as session:
        current_user = get_current_user(session, current_user_id)

        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        users = session.query(User).filter_by(company_name=current_user.company_name).filter(not_(User.access_level == "Super_Admin")).all()
        today = datetime.datetime.now().date()
        current_week_num = int(today.isocalendar()[1])
    
        # Welche User haben ihre Verfügbarkeiten noch nicht eingegeben (erl) 
        missing_users = get_missing_user_list(session, current_user)

        # An den Folgenden Zeiten sind noch zu wenig User 
        unavailable_times_list = unavailable_times(session, current_user)
            
        # Extract email addresses from the missing users list
        recipients_missing_user = [user['email'] for user in missing_users]
        recipients_all = [user.email for user in users]

        if request.method == 'POST':
            button = request.json.get("button", None)
            if button == "Msg_Missing_Availability":
                msg = Message('Fehlende Verfuegbarkeit', recipients=recipients_missing_user)
                msg.body = f"Hoi Team,\n \n" \
                f"Bisher hast du noch keine Verfügbarkeit für die kommenden Wochen eingetragen. \n \n" \
                F"Bitte trage deine Verfügbarkeit schnellstmöglich. Anderenfalls können wir dich leider nicht mit einplanen. \n \n" \
                f"Liebe Grüsse \n \n" \
                f"Team {current_user.company_name}"
                # mail.send(msg)
                print(msg.body)
            if button == "Msg_Insufficient_Planning":
                table_header = "Datum\t\tUnbesetzte Zeiten\n"
                table_rows = "\n".join([f"{time_dict['date']}\t\t{time_dict['time']}" for time_dict in unavailable_times_list])
                time_table = table_header + table_rows
                msg = Message('Unbesetzte Stunden', recipients=recipients_all)
                msg.body = f"Hoi Team,\n \n" \
                f"Wir haben leider noch einige Stunden, die wir noch nicht besetzen können. Solltest du zu einer der untenstehen Stunden Zeit haben, trag dich doch bitte ein. \n \n" \
                f"{time_table}\n\n" \
                f"Bitte trage deine Unterstützung in deiner Verfügbarkeit schnellstmöglich ein. \n \n" \
                f"Liebe Grüsse \n \n" \
                f"Team {current_user.company_name}"
                # mail.send(msg)
                print(msg.body)
    

        return jsonify({
            'worker_count': get_worker_count(session, current_user),
            'start_time_count': get_start_time_count(session, current_user),
            'upcoming_shifts': get_upcoming_shifts(session, current_user),
            'hours_worked_over_time': get_hours_worked(session, current_user),
            'current_shifts': get_current_shifts(session, current_user),
            'part_time_count': get_part_time_count(session, current_user),
            'full_time_count': get_full_time_count(session, current_user),
            'missing_user_list': get_missing_user_list(session, current_user),
            'current_week_num': current_week_num,
            'unavailable_times': unavailable_times(session, current_user)
        })

def get_current_user(session, user_id):
    return session.query(User).filter_by(email=user_id).first()

def get_worker_count(session, current_user):
    return session.query(User).filter_by(company_name=current_user.company_name).filter(not_(User.access_level == "Super_Admin")).count()

def get_start_time_count(session, current_user):
    return session.query(Timetable).filter(
        (Timetable.company_name == current_user.company_name) & 
        (Timetable.start_time != None)
    ).count()

def get_upcoming_shifts(session, current_user):
    now = datetime.datetime.now()
    upcoming_shifts_query = session.query(Timetable).filter(
        (Timetable.company_name == current_user.company_name) &
        ((Timetable.date > now.date()) | ((Timetable.date == now.date()) & (Timetable.start_time >= now.time()))) &
        (Timetable.date < now.date() + datetime.timedelta(days=7))
    ).order_by(Timetable.date, Timetable.start_time).all()
    return format_shifts(upcoming_shifts_query)

def format_shifts(shifts):
    locale.setlocale(locale.LC_TIME, "de_DE.UTF-8")
    formatted_shifts = []
    for shift in shifts:
        # First shift
        first_shift_time = format_shift_time(shift, 1)
        if first_shift_time:
            formatted_shifts.append({
                'name': f'{shift.first_name} {shift.last_name}',
                'day': shift.date.strftime('%A'),
                'shifts': [first_shift_time]
            })

        # Second shift (if exists)
        second_shift_time = format_shift_time(shift, 2)
        if second_shift_time:
            formatted_shifts.append({
                'name': f'{shift.first_name} {shift.last_name}',
                'day': shift.date.strftime('%A'),
                'shifts': [second_shift_time]
            })

    return formatted_shifts

def format_shift_time(shift, index):
    start_time = getattr(shift, f'start_time{index}' if index > 1 else 'start_time')
    end_time = getattr(shift, f'end_time{index}' if index > 1 else 'end_time')
    if start_time and end_time:
        return {'start': start_time.strftime('%H:%M'), 'end': end_time.strftime('%H:%M')}
    return None

def get_hours_worked(session, current_user):
    start_of_week, end_of_week, *_ = get_current_week_range()
    hours_worked_query = (
        session.query(
            Timetable.date,
            func.sum(
                calculate_shift_hours(Timetable.start_time, Timetable.end_time)
            ).label('hours_worked')
        )
        .filter(
            and_(
                Timetable.company_name == current_user.company_name,
                Timetable.date >= start_of_week,
                Timetable.date <= end_of_week
            )
        )
        .group_by(Timetable.date)
        .all()
    )
    return [{"date": item.date.strftime('%A'), "hours_worked": item.hours_worked} for item in hours_worked_query]

def calculate_shift_hours(start_time, end_time):
    return (
        (
            case(
                (func.hour(end_time) < func.hour(start_time), func.hour(end_time) + 24),
                else_=func.hour(end_time)
            ) -
            func.hour(start_time)
        ) * 60 +
        (func.minute(end_time) - func.minute(start_time))
    ) / 60


def get_current_week_range():
    today = datetime.datetime.now().date()
    start_of_week = today - datetime.timedelta(days=today.weekday())
    end_of_week = start_of_week + datetime.timedelta(days=6)
    return start_of_week, end_of_week


# Bearbeitet von Gery 01.12.2023
def get_current_week_range2(selectedMissingWeek):
    # 1 = aktuelle Woche, 2 = nächste Woche
    selectedMissingWeek = int(selectedMissingWeek)

    # aktuelles Datums
    today = datetime.datetime.now().date()
    # Startdatums der aktuellen Woche (Montag) berechnen
    start_of_current_week = today - datetime.timedelta(days=today.weekday())

    # Berechnung des Startdatums der gewünschten Woche 
    start_of_week_missing_team = start_of_current_week + datetime.timedelta(days=7 * (selectedMissingWeek - 1))
    # Berechnung des Enddatums der gewünschten Woche (Sonntag der selectedMissingWeek)
    end_of_week_missing_team = start_of_week_missing_team + datetime.timedelta(days=6)

    return start_of_week_missing_team, end_of_week_missing_team



def get_current_shifts(session, current_user):
    now = datetime.datetime.now()
    current_shifts_query = session.query(Timetable).filter(
        (Timetable.company_name == current_user.company_name) &
        (Timetable.date == now.date()) &
        (Timetable.start_time <= now.time()) &
        (Timetable.end_time >= now.time())
    ).all()
    return [{
        'name': f'{shift.first_name} {shift.last_name}',
        'start': shift.start_time.strftime('%H:%M'),
        'end': shift.end_time.strftime('%H:%M')
    } for shift in current_shifts_query]

def get_part_time_count(session, current_user):
    return session.query(User).filter(
        (User.company_name == current_user.company_name) &
        (User.employment == 'Temp')
    ).filter(not_(User.access_level == "Super_Admin")
    ).count()

def get_full_time_count(session, current_user):
    return session.query(User).filter(
        (User.company_name == current_user.company_name) &
        (User.employment == 'Perm')
    ).filter(not_(User.access_level == "Super_Admin")
    ).count()

def get_missing_user_list(session, current_user):
    
    missing_users = []

    selectedMissingWeek = int(request.args.get('selectedMissingWeek', None))
    start_of_week_missing_team, end_of_week_missing_team, *_ = get_current_week_range2(selectedMissingWeek)
    missing_fte_query = session.query(Availability.email).filter(
        Availability.date >= start_of_week_missing_team,
        Availability.date <= end_of_week_missing_team
    ).subquery()
    missing_users = session.query(User).filter(
        not_(User.email.in_(missing_fte_query)),
        not_(User.access_level == "Super_Admin")
    ).filter_by(company_name=current_user.company_name).all()
    
    return [{'name': f'{user.first_name} {user.last_name}', 'email': user.email} for user in missing_users]



# ------------------------------------------------------------------------------------------------------------

# Bearbeitet von Gery 01.12.2023
def unavailable_times(session, current_user):
    # Welche Woche habe ich gezogen (KW)
    selectedMissingWeek = int(request.args.get('selectedMissingWeek', None))
    start_of_week_missing_team, end_of_week_missing_team, *_ = get_current_week_range2(selectedMissingWeek)

    # print("Zeitraum: ", start_of_week_missing_team, end_of_week_missing_team)

    # hour_devider ------------------------------------------------------------------------------------------------------
    hour_divider_record = session.query(SolverRequirement).first()
    hour_divider = hour_divider_record.hour_divider
    # print("hour_divider: ", hour_divider)

    # Öffnungszeiten ----------------------------------------------------------------------------------------------------
    def time_to_timedelta(t):
        if t is None:
            return timedelta(hours=0, minutes=0, seconds=0)
        return timedelta(hours=t.hour, minutes=t.minute, seconds=t.second)
    
    def time_to_int(t, hour_divider):
        divisor = 3600 / hour_divider
        return int(t.total_seconds() / divisor)

    weekday_order = case(
        *[(OpeningHours.weekday == "Montag", 1),
        (OpeningHours.weekday == "Dienstag", 2),
        (OpeningHours.weekday == "Mittwoch", 3),
        (OpeningHours.weekday == "Donnerstag", 4),
        (OpeningHours.weekday == "Freitag", 5),
        (OpeningHours.weekday == "Samstag", 6),
        (OpeningHours.weekday == "Sonntag", 7)]
    )

    opening = session.query(OpeningHours).order_by(weekday_order).all()
    # Dictionary mit den Öffnungszeiten für einfachere Abfragen
    opening_dict = {record.weekday: record for record in opening}
    # Standardliste von Wochentagen
    weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
    # "times" für jeden Wochentag, Werte aus der Datenbank, wenn verfügbar, sonst timedelta(0)
    times = []
    for day in weekdays:
        if day in opening_dict:
            record = opening_dict[day]
            start_time = time_to_timedelta(record.start_time)
            end_time = time_to_timedelta(record.end_time)
            end_time2 = time_to_timedelta(record.end_time2)

            # Logik zur Bestimmung der Schließzeit hinzufügen
            if end_time2.total_seconds() == 0: 
                # Wenn end_time2 nicht gesetzt ist, verwende end_time
                close_time = end_time
            else:
                # Wenn end_time2 gesetzt ist, wird es immer verwendet, unabhängig von der Uhrzeit
                close_time = end_time2
                
            times.append((record.weekday, start_time, end_time, close_time))
        else:
            times.append((day, timedelta(0), timedelta(0), timedelta(0)))


    # Initialisiere leere Listen für die Öffnungs- und Schließzeiten
    laden_oeffnet = [None] * 7
    laden_schliesst = [None] * 7

    # Ordne jedem Wochentag einen Index zu, um die Listen korrekt zu befüllen
    weekday_indices = {
        'Montag': 0,
        'Dienstag': 1,
        'Mittwoch': 2,
        'Donnerstag': 3,
        'Freitag': 4,
        'Samstag': 5,
        'Sonntag': 6
    }

    for weekday, start_time, end_time, close_time in times:
        index = weekday_indices[weekday]
        laden_oeffnet[index] = start_time
        laden_schliesst[index] = close_time

    # Berechne die Öffnungszeiten für jeden Wochentag und speichere sie in einer Liste
    opening_hours = []
    for i in range(7):
        # Wenn die Schließzeit vor der Öffnungszeit liegt, werden 24 Stunden (86400 Sekunden) zur Schließzeit dazuaddiert
        if laden_schliesst[i] < laden_oeffnet[i]:
            corrected_close_time = laden_schliesst[i] + timedelta(seconds=86400) 
        else:
            corrected_close_time = laden_schliesst[i]
        # Berechne die Öffnungszeit als Differenz zwischen der korrigierten Schließzeit und der Öffnungszeit
        opening_hours.append(time_to_int(corrected_close_time, hour_divider) - time_to_int(laden_oeffnet[i], hour_divider))

    # print("opening_hours: ", opening_hours)
    # print("laden_oeffnet: ", laden_oeffnet)
    # print("laden_schliesst: ", laden_schliesst)

    # Verfügbarkeit ----------------------------------------------------------------------------------------------------
    
    # Pausiert da wichtigere Arbeit, später weiter machen
    # Es müssen noch folgende Infos gezogen werden: Availability, User, Time_req





    # Subquery to count available workers for each time slot
    available_workers_subquery = session.query(
        Availability.date.label('avail_date'),
        Availability.start_time.label('avail_start_time'),
        func.count(Availability.user_id).label('available_workers')
    ).filter(
        Availability.date >= start_of_week_missing_team,
        Availability.date <= end_of_week_missing_team
    ).group_by(
        Availability.date, Availability.start_time
    ).subquery()


    # Query to find dates and start times with insufficient workers
    insufficient_worker_dates_and_times = session.query(
        TimeReq.date,
        TimeReq.start_time
    ).filter(
        TimeReq.date >= start_of_week_missing_team,
        TimeReq.date <= end_of_week_missing_team,
        TimeReq.worker > 0
    ).outerjoin(
        available_workers_subquery,
        (TimeReq.date == available_workers_subquery.c.avail_date) &
        (TimeReq.start_time == available_workers_subquery.c.avail_start_time)
    ).filter(
        or_(
            TimeReq.worker > available_workers_subquery.c.available_workers,
            available_workers_subquery.c.available_workers == None  # No available workers
        )
    ).all()

    # Extracting date and time into a list
    unavailable_times = [
    {'date': item.date.isoformat(), 'time': item.start_time.strftime('%H:%M:%S')} 
    for item in insufficient_worker_dates_and_times
    ]

    return unavailable_times

def check_time_overlap(start_time, end_time, availability):
    # Function to check if given time_req overlaps with availability
    time_slots = [
        (availability.start_time, availability.end_time),
        (availability.start_time2, availability.end_time2),
        (availability.start_time3, availability.end_time3)
    ]

    for start, end in time_slots:
        if start is not None and end is not None:
            if start <= end_time and end >= start_time:
                return True

    return False


@app.route('/api/calendar', methods=['GET'])
@jwt_required()
def get_calendar():
    current_user_id = get_jwt_identity()
    jwt_data = get_jwt()
    company_uri = get_database_uri('', jwt_data["company_name"].lower().replace(' ', '_'))

    with get_session(company_uri) as session:
        current_user = session.query(User).filter_by(email=current_user_id).first()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        shifts = session.query(Timetable, Company)\
                    .select_from(Timetable)\
                    .join(Company, Timetable.company_name == Company.company_name)\
                    .filter(Timetable.email == current_user_id)\
                    .all()

        # Convert the shifts to the format expected by FullCalendar
        events = [{
            'id': shift.Timetable.id,
            'title': f"{shift.Timetable.first_name} {shift.Timetable.last_name} - {shift.Company.department}",
            'date': shift.Timetable.date.strftime('%Y-%m-%d'),
            'start': datetime.datetime.combine(shift.Timetable.date, shift.Timetable.start_time).strftime('%Y-%m-%dT%H:%M:%S'),
            'end': datetime.datetime.combine(shift.Timetable.date, shift.Timetable.end_time).strftime('%Y-%m-%dT%H:%M:%S'),
        } for shift in shifts]

    return jsonify(events)


@app.route('/api/download', methods=['POST', 'GET'])
@jwt_required()
def get_excel():
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    company_uri = get_database_uri('', jwt_data["company_name"].lower().replace(' ', '_'))

    with get_session(company_uri) as session:
        user = session.query(User).filter_by(email=react_user).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        download_data = request.get_json()
        if not download_data or 'startWeek' not in download_data or 'endWeek' not in download_data:
            return jsonify({'error': 'Invalid request data'}), 400

        today = datetime.datetime.today()
        start_date_delta = datetime.timedelta(weeks=download_data['startWeek'] - 1)
        end_date_delta = datetime.timedelta(weeks=download_data['endWeek'] - 1, days=6)

        start_date = (today.date() - datetime.timedelta(days=today.weekday())) + start_date_delta
        end_date = (today.date() - datetime.timedelta(days=today.weekday())) + end_date_delta

        try:
            output = create_excel_output(user.email, start_date, end_date)
            return send_file(output, as_attachment=True, download_name="Schichtplan.xlsx",
                             mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        except Exception as e:
            return jsonify({'error': 'Failed to generate Excel file'}), 500


@app.route('/api/user_management', methods=['GET'])
@jwt_required()
def user_management():  
    react_user_email = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)

    with get_session(uri) as session:
        current_user = session.query(User).filter_by(email=react_user_email).first()
        
        if current_user is None:
            return jsonify({"message": "User not found"}), 404

        current_company_name = current_user.company_name
        users = session.query(User).filter_by(company_name=current_company_name).filter(not_(User.access_level == "Super_Admin")).all()

        to_dict = []  
        for user in users:
            user_dict = {  
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
            }
            to_dict.append(user_dict)  

    return jsonify(users=to_dict) 


@app.route('/api/user_availability/<string:email>', methods=['GET'])
@jwt_required()
def user_availability(email):
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    uri = get_database_uri('', session_company)
    today = datetime.datetime.today().date()
    four_weeks_later = today + datetime.timedelta(weeks=4)

    with get_session(uri) as session:
    
        availabilities = session.query(Availability).filter(
            Availability.email == email,
            Availability.date >= today,
            Availability.date <= four_weeks_later
        ).order_by(Availability.date).all()

        
        availability_data = []
        for availability in availabilities:
            # Check and add first time slot
            if availability.start_time and availability.end_time:
                availability_dict = {
                    'date': availability.date.strftime('%Y-%m-%d'),
                    'weekday': availability.weekday,
                    'start_time': availability.start_time.strftime('%H:%M:%S'),
                    'end_time': availability.end_time.strftime('%H:%M:%S')
                }
                availability_data.append(availability_dict)

            # Entry for second time slot
            if availability.start_time2 and availability.end_time2:
                availability_dict = {
                    'date': availability.date.strftime('%Y-%m-%d'),
                    'weekday': availability.weekday,
                    'start_time': availability.start_time2.strftime('%H:%M:%S'),
                    'end_time': availability.end_time2.strftime('%H:%M:%S')
                }
                availability_data.append(availability_dict)

            # Entry for third time slot
            if availability.start_time3 and availability.end_time3:
                availability_dict = {
                    'date': availability.date.strftime('%Y-%m-%d'),
                    'weekday': availability.weekday,
                    'start_time': availability.start_time3.strftime('%H:%M:%S'),
                    'end_time': availability.end_time3.strftime('%H:%M:%S')
                }
                availability_data.append(availability_dict)

        print(availability_data)

        return jsonify(availability=availability_data)


@app.route('/api/user_scheduled_shifts/<string:email>', methods=['GET'])
@jwt_required()
def user_scheduled_shifts(email):
    jwt_data = get_jwt()
    company_uri = get_database_uri('', jwt_data["company_name"].lower().replace(' ', '_'))
    today = datetime.datetime.today().date()

    with get_session(company_uri) as session:

        scheduled_shifts = session.query(Timetable).filter(
            Timetable.email == email,
            Timetable.date >= today  # This gets shifts from today onwards
        ).order_by(Timetable.date).all()

        shifts_data = []
        for shift in scheduled_shifts:
            shift_dict = {
                'id': shift.id,
                'date': shift.date.strftime('%Y-%m-%d'),
                'start_time': shift.start_time.strftime('%H:%M:%S'),
                'end_time': shift.end_time.strftime('%H:%M:%S'),
                'start_time2': shift.start_time2.strftime('%H:%M:%S') if shift.start_time2 else None,
                'end_time2': shift.end_time2.strftime('%H:%M:%S') if shift.end_time2 else None,
                'start_time3': shift.start_time3.strftime('%H:%M:%S') if shift.start_time3 else None,
                'end_time3': shift.end_time3.strftime('%H:%M:%S') if shift.end_time3 else None,
                # Add additional fields as needed
            }
            shifts_data.append(shift_dict)
        
    return jsonify(scheduledShifts=shifts_data)

stripe.api_key = 'sk_test_51O8inXLP2HwOJuOXYsZAeWHRxFedJ31u63UGY8RAZvEFyjwGdG6tUzUv3FSgmhqaYVNz907s7KIWi8SXzsGnxbJV0025IxrfKI'

YOUR_DOMAIN = "http://localhost:3000"

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[{
                'price': 'price_id',  # Replace with the price ID of your product
                'quantity': 1,
            }],
            payment_method_types=['card'],
            mode='subscription',
            success_url=YOUR_DOMAIN + '/success',
            cancel_url=YOUR_DOMAIN + '/cancel',
        )
        return jsonify(id=checkout_session.id)
    except Exception as e:
        return jsonify(error=str(e)), 403

def is_initial_setup_needed():
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    with get_session(get_database_uri('', session_company)) as session:
        is_company_empty = session.query(Company).first() is None
        is_opening_hours_empty = session.query(OpeningHours).first() is None
        is_solverreq_empty = session.query(SolverRequirement).first() is None

    return is_company_empty or is_opening_hours_empty or is_solverreq_empty

@app.route('/api/check_initial_setup', methods=['POST', 'GET'])
@jwt_required()
def check_initial_setup():

    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    weekdays = {0:'Montag', 1:'Dienstag', 2:'Mittwoch', 3:'Donnerstag', 4:'Freitag', 5:'Samstag', 6:'Sonntag'}
    day_num = 7
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    with get_session(get_database_uri('', session_company)) as session:
        user = session.query(User).filter_by(email=react_user).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if request.method == 'POST':
            initial_data = request.get_json()

            new_company_data = Company(
                company_name=user.company_name,
                weekly_hours=initial_data['weekly_hours'],
                shifts=initial_data['shifts'],
                department=initial_data['department'] if initial_data.get('department') else None,
                department2=initial_data['department2'] if initial_data.get('department2') else None,
                department3=initial_data['department3'] if initial_data.get('department3') else None,
                department4=None,
                department5=None,
                department6=None,
                department7=None,
                department8=None,
                department9=None,
                department10=None,
                created_by=user.id,
                changed_by=user.id,
                creation_timestamp=datetime.datetime.now()
            )
            session.merge(new_company_data)

            # Create list to hold new OpeningHours entries
            new_opening_hours_entries = []

            for i in range(day_num):
                entry1 = request.json.get(f'day_{i}_0')
                entry2 = request.json.get(f'day_{i}_1')
                entry3 = request.json.get(f'day_{i}_2')
                entry4 = request.json.get(f'day_{i}_3')
                
                if entry1:
                    new_entry1 = get_time_str(entry1) if entry1 else None
                    new_entry2 = get_time_str(entry2) if entry2 else None
                    new_entry3 = get_time_str(entry3) if entry3 else None
                    new_entry4 = get_time_str(entry4) if entry4 else None

                    new_weekday = weekdays[i]
                    
                    # Create new OpeningHours entry
                    opening = OpeningHours(
                        company_name=user.company_name,
                        weekday=new_weekday,
                        start_time=new_entry1,
                        end_time=new_entry2,
                        start_time2=new_entry3,
                        end_time2=new_entry4,
                        created_by=user.id,
                        changed_by=user.id,
                        creation_timestamp=datetime.datetime.now()
                    )
                    
                    # Append to list of new entries
                    new_opening_hours_entries.append(opening)


            # Bulk insert all new OpeningHours entries and commit
            session.bulk_save_objects(new_opening_hours_entries)

            new_solverreq_data = SolverRequirement(       
                company_name = user.company_name,
                weekly_hours=initial_data['weekly_hours'],
                shifts=initial_data['shifts'],
                desired_min_time_day = initial_data['desired_min_time_day'],
                desired_max_time_day = initial_data['desired_max_time_day'],
                min_time_day = initial_data['min_time_day'],
                max_time_day = initial_data['max_time_day'],
                desired_max_time_week = initial_data['weekly_hours'],
                max_time_week = initial_data['max_time_week'],
                hour_divider = initial_data['hour_divider'],
                fair_distribution = initial_data['fair_distribution'],
                week_timeframe = initial_data['week_timeframe'],
                subsequent_workingdays = initial_data['subsequent_workingdays'],
                daily_deployment = initial_data['daily_deployment'],
                time_per_deployment = initial_data['time_per_deployment'],
                new_fte_per_slot = initial_data['new_fte_per_slot'],
                subsequent_workingdays_max = initial_data['subsequent_workingdays_max'],
                skills_per_day = initial_data['skills_per_day'],

                nb1 = initial_data['nb1'],
                nb2 = initial_data['nb2'],
                nb3 = initial_data['nb3'],
                nb4 = initial_data['nb4'],
                nb5 = initial_data['nb5'],
                nb6 = initial_data['nb6'],
                nb7 = initial_data['nb7'],
                nb8 = initial_data['nb8'],
                nb9 = initial_data['nb9'],
                nb10 = initial_data['nb10'],
                nb11 = initial_data['nb11'],
                nb12 = initial_data['nb12'],
                nb13 = 0,
                nb14 = 0,
                nb15 = 0,
                nb16 = 0,
                nb17 = 0,
                nb18 = 0,
                nb19 = 0,
                nb20 = 0,
                created_by = user.company_id,
                changed_by = user.company_id,
                creation_timestamp = datetime.datetime.now(),
                update_timestamp = datetime.datetime.now()
                )
            
            session.add(new_solverreq_data)


    return jsonify({'initialSetupNeeded': is_initial_setup_needed()})




    