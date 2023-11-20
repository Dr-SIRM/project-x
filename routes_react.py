from flask import request, url_for, session, jsonify, send_from_directory, make_response, send_file, redirect
from flask_mail import Message
import datetime
from datetime import date
from werkzeug.security import generate_password_hash, check_password_hash
import random
from models import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt, create_refresh_token
from app import app, mail, get_database_uri
from openpyxl import Workbook
import io
from excel_output import create_excel_output
from sqlalchemy import func, extract, not_, and_, or_, asc, desc, text, create_engine, inspect, case, exists
from sqlalchemy.orm import scoped_session, sessionmaker
import stripe


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

def get_session(uri):
    engine = create_engine(uri)
    Session = sessionmaker(bind=engine)
    return Session()


@app.route('/api/login', methods=['POST'])
def login_react():
    email = request.json.get('email')
    password = request.json.get('password')
    print(email)
    print(password)

    user = OverviewUser.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401
    print("Login User: ", user)
    print("Login Company: ", user.company_name)
    # Generate the JWT token
    additional_claims = {"company_name": user.company_name}
    session_token = create_access_token(identity=email, additional_claims=additional_claims)
    print("Token: ", session_token)

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
    print("JWT: ", jwt_data)
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri("", session_company)
    print(session_company)
    session = get_session(get_database_uri('', session_company))
    user = session.query(User).filter_by(email=react_user).first()

    
    if user is None:
        print("No user found.")
        return jsonify({"msg": "User not found"}), 404

    user_dict = {
        'id': user.id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'company_name': user.company_name,
        'email': user.email,
        'access_level': user.access_level
    }

    session.close()

    return jsonify(user_dict)

# @app.route('/api/current_react_user')
# def get_general_data():
#     react_user = get_jwt_identity()
#     user = User.query.filter_by(email=react_user).first()
#     company = Company.query.filter_by(company_name=user.company_name).first()
#     timereq = TimeReq.query.filter_by(company_name=user.company_name).first()

#     general_dict = {
#         'id': user.id,
#         'hour_divider': timereq.hour_devider,
#     }

#     return jsonify(general_dict)

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_data():
    react_user_email = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    current_user = session.query(User).filter_by(email=react_user_email).first()
    
    if current_user is None:
        return jsonify({"message": "User not found"}), 404
    
    # Get the company name of the current logged-in user
    current_company_name = current_user.company_name

    # Query the Company model to get the company data
    company = session.query(Company).filter_by(company_name=current_company_name).first()

    if company is None:
        return jsonify({"message": "Company not found"}), 404

    # Extract the department names from the company data
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

    # Query users who are members of the same company
    users = session.query(User).filter_by(company_name=current_company_name).filter(not_(User.access_level == "Super_Admin")).all()

    user_list = []
    for user in users:
        user_dict = {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'company_name': user.company_name,
            'email': user.email,
            'access_level': user.access_level,
            'employment': user.employment,
            'department': user.department,
            'department2': user.department2,
            'department3': user.department3,
            'employment_level': user.employment_level,
        }
        user_list.append(user_dict)

    # Create a response dictionary to hold both the user data and the department data
    response_dict = {
        'users': user_list,
        'departments': departments
    }

    session.close()

    print(response_dict)
    return jsonify(response_dict)


@app.route('/api/users/update/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    data = request.get_json()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    user = session.query(User).get(user_id)
    

    if user is None:
        return jsonify({"message": "User not found"}), 404

    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.email = data.get('email', user.email)
    user.employment = data.get('employment', user.employment)
    user.department = data.get('department', user.department)
    user.department2 = data.get('department2', user.department2)
    user.department3 = data.get('department3', user.department3)

    # Convert the employment_level to its original range [0, 1] before saving
    employment_level_percentage = data.get('employment_level')
    if employment_level_percentage is not None:
        user.employment_level = employment_level_percentage / 100.0
    
    try:
        session.commit()
        return jsonify({"message": "User updated"}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": "Failed to update user"}), 500
    finally:
        session.close()


@app.route('/api/users/delete/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):

    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))

    user_to_delete = session.query(User).get(user_id)
    if user_to_delete is None:
        return jsonify({"message": "User not found"}), 404
    
    try:
        session.delete(user_to_delete)
        session.commit()
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": "Failed to delete user", "error": str(e)}), 500
    finally:
        session.close()


@app.route('/api/new_user', methods=['GET', 'POST'])
@jwt_required()
def new_user():
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()

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
    if departments is not None:
        department_list = [department for department in departments if department is not None]
    else:
        department_list = []

    if request.method =='POST':
        admin_registration_data = request.get_json()
        company_name = admin_registration_data['company_name']

        # Check if company name already exists
        existing_company = OverviewCompany.query.filter_by(company_name=company_name).first()      
        
        if admin_registration_data['password'] != admin_registration_data['password2']:
            return jsonify({'message': 'Password are not matching'}), 200
        else:
            if existing_company:

                session = get_session(get_database_uri('', "timetab"))
            
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
                            password = generate_password_hash(admin_registration_data['password']),
                            created_by = user.id, 
                            changed_by = user.id, 
                            creation_timestamp = datetime.datetime.now()
                            )
                
                session.add(data1)
                session.add(data2)
                session.commit()
                session.close()

                session = get_session(get_database_uri('', company_name.lower().replace(' ', '_')))

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
                            password = generate_password_hash(admin_registration_data['password']),
                            created_by = user.id, 
                            changed_by = user.id, 
                            creation_timestamp = datetime.datetime.now()
                            )

                session.add(data3)
                session.commit()
                session.close()
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
                    try:
                        tables = connection.execute(query, {'schema': original_schema}).fetchall()
                        for table in tables:
                            table_name = table[0]
                            connection.execute(text(f"CREATE TABLE `{schema_name}`.`{table_name}` LIKE `{original_schema}`.`{table_name}`;"))
                        connection.commit()  # Commit the changes after cloning the schema
                        
                        session = get_session(get_database_uri('', "timetab"))

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
                        session.commit()
                        session.close()
                        

                        session = get_session(get_database_uri('', company_name.lower().replace(' ', '_')))
                        
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
                            password = generate_password_hash(admin_registration_data['password']),
                            created_by = user.id, 
                            changed_by = user.id, 
                            creation_timestamp = datetime.datetime.now()
                            )
                        
                        session.add(data5)
                        session.add(data6)
                        session.commit()
                        session.close()
                        print("Schema and entry created")
                    
                    except Exception as e:
                        print(str(e))
                        return jsonify({'message': 'Failed to clone schema'}), 500
                
   
    
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
    session = get_session(get_database_uri('', session_company))
    user = session.query(User).filter_by(email=react_user).first()

    if user is None:
        return jsonify({"message": "User not found"}), 404

    if request.method == 'POST':
        user_data = request.get_json()
        session = get_session(get_database_uri('', user.company_name.lower().replace(' ', '_')))

        if user_data is not None:
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.email = user_data.get('email', user.email)
            if user_data['password'] != user_data['password2']:
                return jsonify({'message': 'Password are not matching'}), 200
            else:
                hashed_password = generate_password_hash(user_data['password'])
                user.password = hashed_password
            
            
            user.changed_by = react_user
            user.update_timestamp = datetime.datetime.now()

            session.commit()
            session.close()
            return 'Success', 200
        

    user_dict = {
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'password': user.password,
    }

    session.close()

    return jsonify(user_dict)


@app.route('/api/change/password', methods=["GET", "POST"])
@jwt_required()
def get_change_password():
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    user = session.query(User).filter_by(email=react_user).first()

    if request.method == 'POST':
        password_data = request.get_json()
        session = get_session(get_database_uri('', user.company_name.lower().replace(' ', '_')))

        if user:
            if password_data['password'] != password_data['password2']:
                return jsonify({'message': 'Password are not matching'}), 200
            else:
                hashed_password = generate_password_hash(password_data['password'])
                user.password = hashed_password
                user.changed_by = user.id
                user.update_timestamp = datetime.datetime.now()
                session.commit()
                session.close()

    session.close()

    return jsonify({'message': 'Password succesfull updated!'}), 200


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
    print("JWT: ", jwt_data)
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    print("SESSION Company: ", session_company)
    session = get_session(get_database_uri('', session_company))
    current_schema = app.config['SQLALCHEMY_DATABASE_URI']
    print(f"Current Schema in some_route_handler: {current_schema}")
    inspector = inspect(session.bind)
    current_schema = inspector.default_schema_name
    print(f"Current Schema in fetch_data: {current_schema}")
    user = session.query(User).filter_by(email=react_user).first()
    opening_hours = session.query(OpeningHours).filter_by(company_name=jwt_data.get("company_name")).first()
    weekdays = {0:'Montag', 1:'Dienstag', 2:'Mittwoch', 3:'Donnerstag', 4:'Freitag', 5:'Samstag', 6:'Sonntag'}
    company = session.query(Company).filter_by(company_name=jwt_data.get("company_name")).first()
    print("User Company: ", user.company_name)
    print("Company: ", company)
    day_num = 7
    company_id = user.company_id
    creation_date = datetime.datetime.now()

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


    if request.method == 'POST':
        company_data = request.get_json()
        print(request.json)
        session = get_session(get_database_uri('', user.company_name.lower().replace(' ', '_')))

        # Delete existing company data
        session.query(OpeningHours).filter_by(company_name=user.company_name).delete()
        session.commit()

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
            created_by=company_id,
            changed_by=company_id,
            creation_timestamp=creation_date
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
                    created_by=company_id,
                    changed_by=company_id,
                    creation_timestamp=creation_date
                )
                
                # Append to list of new entries
                new_opening_hours_entries.append(opening)


        # Bulk insert all new OpeningHours entries and commit
        session.bulk_save_objects(new_opening_hours_entries)
        session.commit()
        session.close()


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
    
    session.close()
    
    return jsonify(company_list)

def get_temp_availability_dict(template_name, email, day_num, weekdays):

    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))

    temp_availability_dict = {}

    # Query once to get all relevant TemplateTimeRequirements
    all_temps = session.query(TemplateAvailability).filter_by(
        email=email,
        template_name=template_name
    ).all()

    temp_dict = {(av.weekday): av for av in all_temps}
    

    for i in range(day_num):
        temp = temp_dict.get(( weekdays[i]))
        
        if temp:
            new_i = i + 1
            temp_availability_dict[f"{new_i}&0"] = temp.start_time.strftime("%H:%M") if temp.start_time else None
            temp_availability_dict[f"{new_i}&1"] = temp.end_time.strftime("%H:%M") if temp.end_time else None
            temp_availability_dict[f"{new_i}&2"] = temp.start_time2.strftime("%H:%M") if temp.start_time2 else None
            temp_availability_dict[f"{new_i}&3"] = temp.end_time2.strftime("%H:%M") if temp.end_time2 else None
            temp_availability_dict[f"{new_i}&4"] = temp.start_time3.strftime("%H:%M") if temp.start_time3 else None
            temp_availability_dict[f"{new_i}&5"] = temp.end_time3.strftime("%H:%M") if temp.end_time3 else None
    
    session.close()

    return temp_availability_dict


@app.route('/api/availability', methods = ['GET', 'POST'])
@jwt_required()
def get_availability():
    # today's date
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    user = session.query(User).filter_by(email=react_user).first()
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
    
    print(temp_dict)

    #Save Availability
    if request.method == 'POST':
        button = request.json.get("button", None)
        if button == "Submit":
            print(request.json)
            session = get_session(get_database_uri('', user.company_name.lower().replace(' ', '_')))
            user_selection = request.json.get("selectedUser", None)
            checkedBox_selection = request.json.get("checkedBoxes", None)
            if user_selection == "":
                new_user = user
            else:
                first_name, last_name, email = user_selection.split(', ')
                new_user = session.query(User).filter_by(email=email).first()
                print(email)
            
            new_entries = []
            
            # Delete all entries for the range in one operation
            for i in range(day_num):
                new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
                try:
                    session.query(Availability).filter_by(email=new_user.email, date=new_date).delete()
                    session.commit()
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
                            total_availability_start = availability_hours * solverreq.hour_devider + availability_minutes
                            opening_hours = opening.start_time.hour
                            opening_minutes = opening.start_time.minute
                            total_opening_start = opening_hours * solverreq.hour_devider + opening_minutes
                            if total_availability_start == 0:
                                new_entry[f'entry{j + 1}'] = get_time_str(entry) if entry else None
                            elif total_availability_start < total_opening_start:
                                new_entry['entry1'] = opening.start_time
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
            session.commit()
            session.close()

    
    #Save Template Availability
    if request.method == 'POST':
        button = request.json.get("button", None)
        if button == "Save Template":
            new_entries = []
            availability_data = request.get_json()
            session = get_session(get_database_uri('', user.company_name.lower().replace(' ', '_')))
       
            # Delete all entries for the range in one operation
            for i in range(day_num):
                data_deletion = TemplateAvailability.query.filter_by(email=user.email, template_name=availability_data['selectedTemplate'])
                if data_deletion:
                        data_deletion.delete()
                        session.commit()

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
            session.commit()
            session.close()


    availability_list = {
        'weekdays': weekdays,
        'day_num': day_num,
        'temp_dict': temp_dict,
        'week_start': week_start,
        'hour_divider': solverreq.hour_devider,
        'user_list': user_list,
        'template1_dict': get_temp_availability_dict("Template 1", user.email, day_num, weekdays),
        'template2_dict': get_temp_availability_dict("Template 2", user.email, day_num, weekdays),
        'template3_dict': get_temp_availability_dict("Template 3", user.email, day_num, weekdays),
    }

    session.close()

    return jsonify(availability_list)


@app.route('/api/forget_password', methods=["GET", "POST"])
def get_forget_password():
    if request.method == 'POST':
        forget_password_data = request.get_json()
        session = get_session(get_database_uri('', "timetab"))
        
        existing_user = OverviewUser.query.filter_by(email=forget_password_data['email']).first()
        if existing_user is None:
            return jsonify({"message": "No User exists under your email"}), 400
        else:
            random_token = random.randint(100000,999999)
            reset_url = url_for('reset_password', token=random_token, _external=True)

            data = PasswordReset(email=forget_password_data['email'], token=random_token)

            session.add(data)
            session.commit()
            session.close()

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
    session = get_session(get_database_uri('', session_company))
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
    print(department_list)

    if request.method == 'POST':
        invite_data = request.get_json()
        session = get_session(get_database_uri('', "timetab"))
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
            access_level=invite_data['access_level'], 
            created_by=user.company_id)

        session.add(data)
        session.commit()
        session.close()

        msg = Message('Registration Token', recipients=['timetab@gmx.ch'])
        msg.body = f"Hey there SHOW BOOBS, SEND NUDES,\n \n Below you will find your registration token \n \n {random_token}"
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

    session.close()
    
    return jsonify(invite_dict)


from flask_socketio import SocketIO
socketio = SocketIO(app, cors_allowed_origins="*") 
from data_processing import DataProcessing
from or_algorithm import ORAlgorithm
from or_algorithm_cp import ORAlgorithm_cp

@app.route('/api/solver', methods=['POST'])
@jwt_required()
def run_solver():
    print("Request received", request.method)  # Log the type of request received

    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    user = session.query(User).filter_by(email=react_user).first()

    solver_data = request.get_json()
    print("JSON Payload:", solver_data)  # Log payload

    if 'solverButtonClicked' in solver_data and solver_data['solverButtonClicked']:
        dp = DataProcessing(user.email)
        dp.run()
        or_algo_cp = ORAlgorithm_cp(dp)

        or_algo_cp.run()
    
        
        errors = []  # Eine Liste um alle Fehler zu speichern
        
        for i in range(1, 5):  # Assuming you have 6 pre-checks
            pre_check_result = getattr(or_algo_cp, f'pre_check_{i}')()
            socketio.emit('pre_check_update', {
                'pre_check_number': i,
                'status': 'completed' if pre_check_result["success"] else 'error',
                'message': pre_check_result["message"]
            })

            if not pre_check_result["success"]:
                errors.append(f'Pre-check {i} failed: {pre_check_result["message"]}\n')

        
        # Wenn Fehler während der Überprüfungen aufgetreten sind, werden diese hier gesendet.
        if errors:
            return jsonify({'message': errors}), 400
        

        # Wenn keine Fehler aufgetreten sind, wird der Algorithmus weiter durchgeführt.
        or_algo_cp.run_2()

        print("Solver successfully started")  # Log success
        return jsonify({'message': 'Solver successfully started'}), 200
    else:
        print("Solver button was not clicked")  # Log if button wasn’t clicked
        return jsonify({'message': 'Solver button was not clicked'}), 200
    
    session.close()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)  # Adjust host and port as needed




@app.route('/api/solver/requirement', methods = ['GET', 'POST'])
@jwt_required()
def solver_req():
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    user = session.query(User).filter_by(email=react_user).first()
    session = get_session(get_database_uri('', user.company_name.lower().replace(' ', '_')))
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
        hour_devider = ""
        fair_distribution = ""
        week_timeframe = ""
        subsequent_workingdays = ""
        daily_deployment = ""
        time_per_deployment = ""
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
        hour_devider = solver_requirement.hour_devider
        fair_distribution = solver_requirement.fair_distribution
        week_timeframe = solver_requirement.week_timeframe
        subsequent_workingdays = solver_requirement.subsequent_workingdays
        daily_deployment = solver_requirement.daily_deployment
        time_per_deployment = solver_requirement.time_per_deployment
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
        print(solver_req_data)
        session = get_session(get_database_uri('', user.company_name.lower().replace(' ', '_')))
        data_deletion = SolverRequirement.query.filter_by(company_name=user.company_name)
        if solver_requirement:
            data_deletion.delete()
            session.commit()
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
                                hour_devider = solver_req_data['hour_devider'],
                                fair_distribution = solver_req_data['fair_distribution'],
                                week_timeframe = solver_req_data['week_timeframe'],
                                subsequent_workingdays = solver_req_data['subsequent_workingdays'],
                                daily_deployment = solver_req_data['daily_deployment'],
                                time_per_deployment = solver_req_data['time_per_deployment'],
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
        try:
            session.add(data)
            session.commit()
            session.close()
            return jsonify({'message': 'Succesful Registration'}), 200
        except:
            session.rollback()
            return jsonify({'message': 'Registration went wrong!'}), 200


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
    "hour_devider": hour_devider,
    "fair_distribution": fair_distribution,
    "week_timeframe": week_timeframe,
    "subsequent_workingdays": subsequent_workingdays,
    "daily_deployment": daily_deployment,
    "time_per_deployment": time_per_deployment,
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

    session.close()
    
    return jsonify(solver_req_dict)





@app.route('/api/token_registration', methods = ['POST'])
def get_registration():   
    if request.method =='POST':
        registration_data = request.get_json()
        if registration_data['password'] != registration_data['password2']:
            return jsonify({'message': 'Password are not matching'}), 200
        else:
            token = RegistrationToken.query.filter_by(token=registration_data['token'], email=registration_data['email']).first()
            if token is None:
                return jsonify({'message': 'Token does not exist'}), 200
            else:

                session = get_session(get_database_uri('', 'timetab'))

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
                session.commit()
                session.close()

                session = get_session(get_database_uri('', token.company_name.lower().replace(' ', '_')))

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
                    password = generate_password_hash(registration_data['password']),
                    created_by = None, 
                    changed_by = None, 
                    creation_timestamp = datetime.datetime.now()
                    )

                session.add(data3)
                session.commit()
                session.close()



    return jsonify({'message': 'Get Ready!'}), 200


@app.route('/api/registration/admin', methods = ['GET', 'POST'])
def get_admin_registration():

    if request.method =='POST':
        admin_registration_data = request.get_json()
        existing_company = OverviewCompany.query.filter_by(company_name=admin_registration_data['company_name']).first()  
        if admin_registration_data['password'] != admin_registration_data['password2']:
            return jsonify({'message': 'Password are not matching'}), 200
        else:
            if existing_company:

                session = get_session(get_database_uri('', "timetab"))
            
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
                            access_level = admin_registration_data['access_level'], 
                            email = admin_registration_data['email'], 
                            password = generate_password_hash(admin_registration_data['password']),
                            created_by = None, 
                            changed_by = None, 
                            creation_timestamp = datetime.datetime.now()
                            )
                
                session.add(data1)
                session.add(data2)
                session.commit()
                session.close()

                session = get_session(get_database_uri('', admin_registration_data['company_name'].lower().replace(' ', '_')))

                data3 = User(
                            company_id = None, 
                            first_name = admin_registration_data['first_name'],
                            last_name = admin_registration_data['last_name'], 
                            employment = admin_registration_data['employment'], 
                            employment_level = admin_registration_data['employment_level'],
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
                            access_level = admin_registration_data['access_level'], 
                            email = admin_registration_data['email'], 
                            password = generate_password_hash(admin_registration_data['password']),
                            created_by = None, 
                            changed_by = None, 
                            creation_timestamp = datetime.datetime.now()
                            )

                session.add(data3)
                session.commit()
                session.close()
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
                    try:
                        tables = connection.execute(query, {'schema': original_schema}).fetchall()
                        for table in tables:
                            table_name = table[0]
                            connection.execute(text(f"CREATE TABLE `{schema_name}`.`{table_name}` LIKE `{original_schema}`.`{table_name}`;"))
                        connection.commit()  # Commit the changes after cloning the schema
                        
                        session = get_session(get_database_uri('', "timetab"))

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
                            access_level = admin_registration_data['access_level'], 
                            email = admin_registration_data['email'], 
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
                        session.commit()
                        session.close()
                        

                        session = get_session(get_database_uri('', admin_registration_data['company_name'].lower().replace(' ', '_')))
                        
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
                            access_level = admin_registration_data['access_level'], 
                            email = admin_registration_data['email'], 
                            password = generate_password_hash(admin_registration_data['password']),
                            created_by = None, 
                            changed_by = None, 
                            creation_timestamp = datetime.datetime.now()
                            )
                        
                        session.add(data5)
                        session.add(data6)
                        session.commit()
                        session.close()
                        print("Schema and entry created")
                    
                    except Exception as e:
                        print(str(e))
                        return jsonify({'message': 'Failed to clone schema'}), 500
                
   

                

def get_temp_timereq_dict(template_name, day_num, daily_slots, hour_divider, minutes, company_name, full_day):

    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))

    temp_timereq_dict = {}

    # Query once to get all relevant TemplateTimeRequirements
    all_temps = session.query(TemplateTimeRequirement).filter_by(
        company_name=company_name,
        template_name=template_name
    ).all()

    # Convert all_temps to a convenient lookup structure
    temp_lookup = {(temp.weekday, temp.start_time): temp.worker for temp in all_temps if temp.worker != 0}
    
    for i in range(day_num):
        for hour in range(int(daily_slots)):
            if hour > full_day:
                hour -= full_day + 1
                quarter_hour = hour // hour_divider
                quarter_minute = (hour % hour_divider) * minutes
                formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
                time = f'{formatted_time}:00'
                new_time = datetime.datetime.strptime(time, '%H:%M:%S').time()
                hour += full_day + 1
            else:
                quarter_hour = hour // hour_divider
                quarter_minute = (hour % hour_divider) * minutes
                formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
                time = f'{formatted_time}:00'
                new_time = datetime.datetime.strptime(time, '%H:%M:%S').time()

            # Use lookup instead of database query
            worker_count = temp_lookup.get((str(i), new_time))
            
            if worker_count is not None:
                temp_timereq_dict[f"{i}-{hour}"] = worker_count
    
    session.close()

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
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    user = session.query(User).filter_by(email=react_user).first()
    creation_date = datetime.datetime.now()
    weekdays = {0: 'Montag', 1: 'Dienstag', 2: 'Mittwoch', 3: 'Donnerstag', 4: 'Freitag', 5: 'Samstag', 6: 'Sonntag'}
    today = datetime.date.today()
    solverreq = session.query(SolverRequirement).filter_by(company_name=user.company_name).first()
    hour_divider = solverreq.hour_devider
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

    daily_slots = max(closing_times) * hour_divider
    print("Max: ", daily_slots)
    print("Max: ", closing_times)

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
    print("Min: ", min_opening)
    print("Min: ", opening_times)

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

    print(request.args.get('selectedDepartment'))

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
        if button == "Submit":
            workforce_data = request.get_json()
            week_adjustment = int(request.args.get('week_adjustment', 0)) +7
            session = get_session(get_database_uri('', user.company_name.lower().replace(' ', '_')))

            # Delete existing TimeReq entries for the week
            new_dates = [monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment) for i in range(day_num)]
            TimeReq.query.filter(
                TimeReq.company_name == user.company_name,
                TimeReq.department == workforce_data['department'] if 'department' in workforce_data else None,
                TimeReq.date.in_(new_dates)
            ).delete(synchronize_session='fetch')
            session.commit()

            # Create new TimeReq entries
            new_records = []
            for i in range(day_num):
                for quarter in range(int(daily_slots)):
                    weekday = weekdays.get(i)
                    opening_details = opening_hours_dict.get(weekday)
                    if opening_details == None:
                        pass
                    else:
                        opening_hours = opening_details.start_time.hour
                        opening_minutes = opening_details.start_time.minute
                        total_hours = opening_hours * hour_divider + opening_minutes
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
            session.commit()
            session.close()

    #Save Templates
    if request.method == 'POST':
        button = request.json.get("button", None)
        if button == "Save Template":
            workforce_data = request.get_json()
            session = get_session(get_database_uri('', user.company_name.lower().replace(' ', '_')))
            data_deletion = session.query(TemplateTimeRequirement).filter_by(company_name=user.company_name, template_name=workforce_data['template_name'])
            if data_deletion:
                data_deletion.delete()
                session.commit()
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
                        session.commit()
                        session.close()
        
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

    session.close()

    return jsonify(calendar_dict)




from functools import wraps
import logging

@app.route('/api/schichtplanung', methods=['POST', 'GET'])
@jwt_required()
def get_shift():
    react_user_email = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    current_user = session.query(User).filter_by(email=react_user_email).first()

    if current_user is None:
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
        'shifts': shift_data
    }

    session.close()

    return jsonify(response)



@app.route('/api/schichtplanung2', methods=['GET'])
@jwt_required()
def get_shift2():
    react_user_email = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))

    current_user = session.query(User).filter_by(email=react_user_email).first()
    if current_user is None:
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

    session.close()
    print(response)
    return jsonify(response)

import locale

@app.route('/api/dashboard', methods=['POST', 'GET'])
@jwt_required()
def get_dashboard_data():
    session, current_user = get_current_user_session()
    users = session.query(User).filter_by(company_name=current_user.company_name).filter(not_(User.access_level == "Super_Admin")).all()
    today = datetime.datetime.now().date()
    current_week_num = int(today.isocalendar()[1])
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    missing_users = get_missing_user_list(session, current_user)
    unavailable_times_list = unavailable_times(session, current_user)
        
    # Extract email addresses from the missing users list
    recipients_missing_user = [user['email'] for user in missing_users]
    recipients_all = [user.email for user in users]
    print(recipients_missing_user)
    print(recipients_all)

    if request.method == 'POST':
        button = request.json.get("button", None)
        if button == "Msg_Missing_Availability":
            msg = Message('Fehlende Verfuegbarkeit', recipients=recipients_missing_user)
            msg.body = f"Hoi Team,\n \n" \
            f"Bisher hast du noch keine Verfügbarkeit für die kommenden Wochen eingetragen. \n \n" \
            F"Bitte trage deine Verfügbarkeit schnellstmöglich. Anderenfalls können wir dich leider nicht mit einplanen. \n \n" \
            f"Liebe Grüsse \n \n" \
            f"Team {current_user.company_name}"
            #mail.send(msg)
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
            #mail.send(msg)
            print(msg.body)
    

    try:
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
    finally:
        session.close()

def get_current_user_session():
    current_user_id = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    current_user = session.query(User).filter_by(email=current_user_id).first()
    return session, current_user

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
        shift_data = {
            'name': f'{shift.first_name} {shift.last_name}',
            'day': shift.date.strftime('%A'),
            'shifts': [format_shift_time(shift, i) for i in range(1, 4)]
        }
        shift_data['shifts'] = [s for s in shift_data['shifts'] if s]
        formatted_shifts.append(shift_data)
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


def get_current_week_range2(selectedMissingWeek):
    selectedMissingWeek = int(request.args.get('selectedMissingWeek', None))
    print(selectedMissingWeek)
    today = datetime.datetime.now().date()

    start_of_week_missing_team = today - datetime.timedelta(days=today.weekday()) + datetime.timedelta(days=7*selectedMissingWeek)
    end_of_week_missing_team = start_of_week_missing_team + datetime.timedelta(days=6) 
    print(start_of_week_missing_team, end_of_week_missing_team)
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
    print(missing_users)
    print(start_of_week_missing_team, end_of_week_missing_team)
    return [{'name': f'{user.first_name} {user.last_name}', 'email': user.email} for user in missing_users]


def unavailable_times(session, current_user):
    selectedMissingWeek = int(request.args.get('selectedMissingWeek', None))
    start_of_week_missing_team, end_of_week_missing_team, *_ = get_current_week_range2(selectedMissingWeek)
    
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
    print("Unavailable Times: ", unavailable_times)

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
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
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

    print(events)

    session.close()

    return jsonify(events)


# Bearbeitet von Gery am 23.09.2023
@app.route('/api/download', methods=['POST', 'GET'])
@jwt_required()
def get_excel():
    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    user = session.query(User).filter_by(email=react_user).first()

    output = create_excel_output(user.email)

    session.close()
    
    return send_file(output, as_attachment=True, download_name="Schichtplan.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@app.route('/api/user_management', methods=['GET'])
@jwt_required()
def user_management():  
    react_user_email = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    current_user = session.query(User).filter_by(email=react_user_email).first()
    
    if current_user is None:
        return jsonify({"message": "User not found"}), 404
    
    current_company_name = current_user.company_name
    users = session.query(User).filter_by(company_name=current_company_name).filter(not_(User.access_level == "Super_Admin")).all()

    to_dict = []  # This will hold all user data
    for user in users:
        user_dict = {  # Create a dictionary for each user
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        }
        to_dict.append(user_dict)  # Append each user_dict to to_dict list
    return jsonify(users=to_dict)  # Return all user data as a JSON response


@app.route('/api/user_availability/<string:email>', methods=['GET'])
@jwt_required()
def user_availability(email):
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    today = datetime.datetime.today().date()
    four_weeks_later = today + datetime.timedelta(weeks=4)
    
    availabilities = session.query(Availability).filter(
        Availability.email == email,
        Availability.date >= today,
        Availability.date <= four_weeks_later
    ).all()

    
    availability_data = []
    for availability in availabilities:
        availability_dict = {
            'date': availability.date.strftime('%Y-%m-%d'),
            'weekday': availability.weekday,
            'start_time': availability.start_time.strftime('%H:%M:%S') if availability.start_time else None,
            'end_time': availability.end_time.strftime('%H:%M:%S') if availability.end_time else None,
            # Including the additional times as you've mentioned
            'start_time2': availability.start_time2.strftime('%H:%M:%S') if availability.start_time2 else None,
            'end_time2': availability.end_time2.strftime('%H:%M:%S') if availability.end_time2 else None,
            'start_time3': availability.start_time3.strftime('%H:%M:%S') if availability.start_time3 else None,
            'end_time3': availability.end_time3.strftime('%H:%M:%S') if availability.end_time3 else None
        }
        availability_data.append(availability_dict)
    
    session.close()

    print(availability_data)

    return jsonify(availability=availability_data)

@app.route('/api/user_scheduled_shifts/<string:email>', methods=['GET'])
@jwt_required()
def user_scheduled_shifts(email):
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))

    today = datetime.datetime.today().date()
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
    print(shifts_data)
    session.close()
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
    session = get_session(get_database_uri('', session_company))
    is_company_empty = session.query(Company).first() is None
    is_opening_hours_empty = session.query(OpeningHours).first() is None
    is_solverreq_empty = session.query(SolverRequirement).first() is None
    # Add a similar check for SolverReq table
    return is_company_empty or is_opening_hours_empty or is_solverreq_empty

@app.route('/api/check_initial_setup', methods=['POST', 'GET'])
@jwt_required()
def check_initial_setup():

    react_user = get_jwt_identity()
    jwt_data = get_jwt()
    session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    session = get_session(get_database_uri('', session_company))
    user = session.query(User).filter_by(email=react_user).first()
    weekdays = {0:'Montag', 1:'Dienstag', 2:'Mittwoch', 3:'Donnerstag', 4:'Freitag', 5:'Samstag', 6:'Sonntag'}
    day_num = 7


    if request.method == 'POST':
        initial_data = request.get_json()
        print(initial_data)
        session = get_session(get_database_uri('', user.company_name.lower().replace(' ', '_')))

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
            hour_devider = initial_data['hour_divider'],
            fair_distribution = initial_data['fair_distribution'],
            week_timeframe = initial_data['week_timeframe'],
            subsequent_workingdays = initial_data['subsequent_workingdays'],
            daily_deployment = initial_data['daily_deployment'],
            time_per_deployment = initial_data['time_per_deployment'],
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
        session.commit()
        session.close()   

    return jsonify({'initialSetupNeeded': is_initial_setup_needed()})




    