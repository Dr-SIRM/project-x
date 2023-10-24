from flask import request, url_for, session, jsonify, send_from_directory, make_response, send_file
from flask_mail import Message
import datetime
from datetime import date
from werkzeug.security import generate_password_hash, check_password_hash
import random
from models import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app import app, mail
from openpyxl import Workbook
import io
from excel_output import create_excel_output
from sqlalchemy import func, extract, and_, or_, asc, desc



#Import of Database
#-------------------------------------------------------------------------

from models import User, Availability, TimeReq, Company, OpeningHours, Timetable, \
    TemplateAvailability, TemplateTimeRequirement, RegistrationToken, PasswordReset, \
    SolverRequirement, SolverAnalysis




@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory('./static/react-app/build', path)


@app.route('/react_dashboard')
def react_dashboard():
    return send_from_directory('static/react-app/build', 'index.html')


@app.route('/api/login', methods=['POST'])
def login_react():
    email = request.json.get('email')
    password = request.json.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Generate the JWT token
    additional_claims = {"user_id": user.id}
    session_token = create_access_token(identity=email, additional_claims=additional_claims)

    # Return the session token
    response = make_response(jsonify({'session_token': session_token}))
    response.set_cookie('session_token', session_token, httponly=True, secure=True)

    # Save User Data and token
    response = {
        'session_token': session_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'company_id': user.company_id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'employment': user.employment,
            'email': user.email,
            'employment_level': user.employment_level,
            'company_name': user.company_name,
            'department': user.department,
            'access_level': user.access_level
        }
    }
    return jsonify(response)


@app.route('/api/current_react_user')
@jwt_required()
def current_react_user():
    jwt_data = get_jwt()
    user_id = jwt_data['user_id']
    user = User.query.get(user_id)
    
    if user is None:
        print("No user found with this ID.")
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

@app.route('/api/current_react_user')
def get_general_data():
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()
    company = Company.query.filter_by(company_name=user.company_name).first()
    timereq = TimeReq.query.filter_by(company_name=user.company_name).first()

    general_dict = {
        'id': user.id,
        'hour_divider': timereq.hour_devider,
    }

    return jsonify(general_dict)

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_data():
    react_user_email = get_jwt_identity()
    current_user = User.query.filter_by(email=react_user_email).first()
    
    if current_user is None:
        return jsonify({"message": "User not found"}), 404
    
    # Get the company name of the current logged-in user
    current_company_name = current_user.company_name

    # Query users who are members of the same company
    users = User.query.filter_by(company_name=current_company_name).all()

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
            'employment_level': user.employment_level,
        }
        user_list.append(user_dict)

    return jsonify(user_list) 

@app.route('/api/users/update/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)

    if user is None:
        return jsonify({"message": "User not found"}), 404

    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.email = data.get('email', user.email)
    
    # Convert the employment_level to its original range [0, 1] before saving
    employment_level_percentage = data.get('employment_level')
    if employment_level_percentage is not None:
        user.employment_level = employment_level_percentage / 100.0
    
    user.department = data.get('department', user.department)

    try:
        db.session.commit()
        return jsonify({"message": "User updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update user"}), 500
    finally:
        db.session.close()


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
    department_list = [department for department in departments if department is not None]
    print(department_list)

    if request.method =='POST':
        admin_registration_data = request.get_json()
        if admin_registration_data['password'] != admin_registration_data['password2']:
            return jsonify({'message': 'Password are not matching'}), 200
        else:
            creation_date = datetime.datetime.now()
            last = User.query.order_by(User.id.desc()).first()
            hash = generate_password_hash(admin_registration_data['password'])
            if last is None:
                new_id = 1
            else:
                new_id = last.id + 1

            last_company_id = User.query.filter_by(company_name=admin_registration_data['company_name']).order_by(User.company_id.desc()).first()
            if last_company_id is None:
                new_company_id = 10000
            else:
                new_company_id = last_company_id.company_id + 1

            data = User(id = new_id, 
                        company_id = new_company_id, 
                        first_name = admin_registration_data['first_name'],
                        last_name = admin_registration_data['last_name'], 
                        employment = admin_registration_data['employment'], 
                        employment_level = admin_registration_data['employment_level'],
                        company_name = admin_registration_data['company_name'], 
                        department = admin_registration_data['department'],
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
                        password = hash,
                        created_by = new_company_id, 
                        changed_by = new_company_id, 
                        creation_timestamp = creation_date
                        )

            try:
                db.session.add(data)
                db.session.commit()
                return jsonify({'message': 'Successful Registration'}), 200
            except:
                db.session.rollback()
                return jsonify({'message': 'Registration went wrong!'}), 200
    
    user_dict={
    'department_list': department_list,
    }
    return jsonify(user_dict)

@app.route('/api/update', methods=["GET", "POST"])
@jwt_required()
def react_update():
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()

    if user is None:
        return jsonify({"message": "User not found"}), 404

    if request.method == 'POST':
        user_data = request.get_json()

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

            db.session.commit()
            return 'Success', 200
        

    user_dict = {
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'password': user.password,
    }

    return jsonify(user_dict)


@app.route('/api/change/password', methods=["GET", "POST"])
@jwt_required()
def get_change_password():
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()

    if request.method == 'POST':
        password_data = request.get_json()

        if user:
            if password_data['password'] != password_data['password2']:
                return jsonify({'message': 'Password are not matching'}), 200
            else:
                hashed_password = generate_password_hash(password_data['password'])
                user.password = hashed_password
                user.changed_by = user.id
                user.update_timestamp = datetime.datetime.now()
                db.session.commit()

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
    user = User.query.filter_by(email=react_user).first()
    opening_hours = OpeningHours.query.filter_by(company_name=user.company_name).first()
    weekdays = {0:'Montag', 1:'Dienstag', 2:'Mittwoch', 3:'Donnerstag', 4:'Freitag', 5:'Samstag', 6:'Sonntag'}
    company = Company.query.filter_by(company_name=user.company_name).first()
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
    all_opening_hours = OpeningHours.query.filter(
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

        # Delete existing company data
        OpeningHours.query.filter_by(company_name=user.company_name).delete()
        db.session.commit()

        # Insert new company data
        # Removed manual ID setting, assuming that the ID column in your database is set to auto-increment
        new_company_data = Company(
            id=None,
            company_name=company_data['company_name'],
            weekly_hours=company_data['weekly_hours'],
            shifts=company_data['shifts'],
            department=company_data['department'],
            department2=company_data['department2'],
            department3=company_data['department3'],
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
        db.session.merge(new_company_data)

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
                    id=None,
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
        db.session.bulk_save_objects(new_opening_hours_entries)
        db.session.commit()


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

def get_temp_availability_dict(template_name, email, day_num, weekdays):
    temp_availability_dict = {}

    # Query once to get all relevant TemplateTimeRequirements
    all_temps = TemplateAvailability.query.filter_by(
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
  
    return temp_availability_dict


@app.route('/api/availability', methods = ['GET', 'POST'])
@jwt_required()
def get_availability():
    # today's date
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()
    today = datetime.date.today()
    creation_date = datetime.datetime.now()
    monday = today - datetime.timedelta(days=today.weekday())
    weekdays = {0:'Montag', 1:'Dienstag', 2:'Mittwoch', 3:'Donnerstag', 4:'Freitag', 5:'Samstag', 6:'Sonntag'}
    day_num = 7
    company_id = user.company_id
    solverreq = SolverRequirement.query.filter_by(company_name=user.company_name).first()
    opening = OpeningHours.query.filter_by(company_name=user.company_name).first()

    # Week with adjustments
    monday = today - datetime.timedelta(days=today.weekday())
    week_adjustment = int(request.args.get('week_adjustment', 0))
    week_start = monday + datetime.timedelta(days=week_adjustment)

    query_weekdays = [weekdays[i] for i in range(day_num)]
    dates = [week_start + datetime.timedelta(days=i) for i in range(day_num)]

    # Create Drop Down Based Access Level
    if user.access_level == "User":
        user_list = [f"{user.first_name}, {user.last_name}, {user.email}"]
    else:
        company_users = User.query.filter_by(company_name=user.company_name).order_by(asc(User.last_name)).all()
        user_list = [f"{user.first_name}, {user.last_name}, {user.email}" for user in company_users]
    


    # Fetch all relevant Availability records in a single query
    fetched_user = request.args.get('selectedUser', '')
    if fetched_user:
        first_name, last_name, email = fetched_user.split(', ')

        availabilities = Availability.query.filter(
            Availability.email == email,
            Availability.date.in_(dates),
            Availability.weekday.in_(query_weekdays)
        ).all()

        temp_dict = {}
        availability_dict = {(av.date, av.weekday): av for av in availabilities}
        
        for i, date in enumerate(dates):
            temp = availability_dict.get((date, weekdays[i]))
            
            if temp:
                new_i = i + 1
                temp_dict[f"{new_i}&0"] = temp.start_time.strftime("%H:%M") if temp.start_time else None
                temp_dict[f"{new_i}&1"] = temp.end_time.strftime("%H:%M") if temp.end_time else None
                temp_dict[f"{new_i}&2"] = temp.start_time2.strftime("%H:%M") if temp.start_time2 else None
                temp_dict[f"{new_i}&3"] = temp.end_time2.strftime("%H:%M") if temp.end_time2 else None
                temp_dict[f"{new_i}&4"] = temp.start_time3.strftime("%H:%M") if temp.start_time3 else None
                temp_dict[f"{new_i}&5"] = temp.end_time3.strftime("%H:%M") if temp.end_time3 else None
    else:
        temp_dict = None

    
    #Save Availability
    if request.method == 'POST':
        button = request.json.get("button", None)
        if button == "Submit":
            user_selection = request.json.get("selectedUser", None)
            if user_selection == "":
                new_user = user
            else:
                first_name, last_name = user_selection.split(', ')
                new_user = User.query.filter_by(first_name=first_name, last_name=last_name).first()
            
            new_entries = []
            
            # Delete all entries for the range in one operation
            for i in range(day_num):
                new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
                Availability.query.filter_by(user_id=new_user.id, date=new_date).delete()
            db.session.commit()

            # Create all new entries
            for i in range(day_num):
                new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
                new_weekday = weekdays[i]
                
                # Loop through entries
                new_entry = {}
                for j in range(6):
                    entry = request.json.get(f'day_{i}_{j}')
                    new_entry[f'entry{j + 1}'] = get_time_str(entry)
                    if new_entry['entry1']:
                        availability_hours = new_entry['entry1'].hour
                        availability_minutes = new_entry['entry1'].minute
                        total_availability_start = availability_hours * solverreq.hour_devider + availability_minutes
                        opening_hours = opening.start_time.hour
                        opening_minutes = opening.start_time.minute
                        total_opening_start = opening_hours * solverreq.hour_devider + opening_minutes
                        if total_availability_start == 0:
                            new_entry[f'entry{j + 1}'] = get_time_str(entry)
                        elif total_availability_start < total_opening_start:
                            new_entry['entry1'] = opening.start_time
                        else:
                            new_entry[f'entry{j + 1}'] = get_time_str(entry)



                # Create a new Availability instance and add to list
                data = Availability(
                    id=None,
                    user_id=new_user.id, 
                    date=new_date, 
                    weekday=new_weekday, 
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
            db.session.bulk_save_objects(new_entries)
            db.session.commit()

    
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
                        db.session.commit()

            # Create all new entries
            for i in range(day_num):
                new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
                new_weekday = weekdays[i]
                
                # Loop through entries
                new_entry = {}
                for j in range(6):
                    entry = request.json.get(f'day_{i}_{j}')
                    new_entry[f'entry{j + 1}'] = get_time_str(entry)

                # Create a new Availability instance and add to list
                data = TemplateAvailability(
                    id=None,
                    template_name=availability_data['selectedTemplate'],
                    date=new_date, 
                    weekday=new_weekday, 
                    email=user.email,
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
            db.session.bulk_save_objects(new_entries)
            db.session.commit()


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

    return jsonify(availability_list)


@app.route('/api/forget_password', methods=["GET", "POST"])
def get_forget_password():
    if request.method == 'POST':
        forget_password_data = request.get_json()
        
        existing_user = User.query.filter_by(email=forget_password_data['email']).first()
        if existing_user is None:
            return jsonify({"message": "No User exists under your email"}), 400
        else:
            random_token = random.randint(100000,999999)
            reset_url = url_for('reset_password', token=random_token, _external=True)
            last = PasswordReset.query.order_by(PasswordReset.id.desc()).first()
            if last is None:
                new_id = 1
            else:
                new_id = last.id + 1

            data = PasswordReset(id=new_id, email=forget_password_data['email'], token=random_token)

            db.session.add(data)
            db.session.commit()

            msg = Message('Reset Password', recipients=['timetab@gmx.ch'])
            msg.body = f"Hey there,\n \n Below you will find your reset Link. \n \n {reset_url}"
            mail.send(msg)

            return jsonify({"message": "Password reset email sent"}), 200
    return jsonify({"message": "Method not allowed"}), 405



@app.route('/api/invite', methods = ['GET', 'POST'])
@jwt_required()
def get_invite():
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()

    if request.method == 'POST':
        invite_data = request.get_json()
        random_token = random.randint(100000,999999)
        last = RegistrationToken.query.order_by(RegistrationToken.id.desc()).first()
        if last is None:
            new_id = 1
        else:
            new_id = last.id + 1

        data = RegistrationToken(id=new_id, 
                                 email=invite_data['email'], 
                                 token=random_token, 
                                 company_name=invite_data['company_name'], 
                                 department=invite_data['department'], 
                                 employment=invite_data['employment'], 
                                 employment_level=invite_data['employment_level'], 
                                 access_level=invite_data['access_level'], 
                                 created_by=user.company_id)

        db.session.add(data)
        db.session.commit()

        msg = Message('Registration Token', recipients=['timetab@gmx.ch'])
        msg.body = f"Hey there SHOW BOOBS, SEND NUDES,\n \n Below you will find your registration token \n \n {random_token}"
        mail.send(msg)
        


    invite_dict = {
        'email': "",
        'company_name': user.company_name,
        'department': "",
        'employment': "",
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
    print("Request received", request.method)  # Log the type of request received

    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()

    solver_data = request.get_json()
    print("JSON Payload:", solver_data)  # Log payload

    if 'solverButtonClicked' in solver_data and solver_data['solverButtonClicked']:
        dp = DataProcessing(user.id)
        dp.run()
        or_algo_cp = ORAlgorithm_cp(dp)

        or_algo_cp.run()
    
        errors = []  # Eine Liste um alle Fehler zu speichern
        
        for i in range(1, 7):  # Assuming you have 6 pre-checks
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

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)  # Adjust host and port as needed




@app.route('/api/solver/requirement', methods = ['GET', 'POST'])
@jwt_required()
def solver_req():
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()
    company = Company.query.filter_by(company_name=user.company_name).first()
    solver_requirement = SolverRequirement.query.filter_by(company_name=user.company_name).first()

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
        data_deletion = SolverRequirement.query.filter_by(company_name=user.company_name)
        if solver_requirement:
            data_deletion.delete()
            db.session.commit()
        else:
            pass

        data = SolverRequirement(       
                                id = None,
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
            db.session.add(data)
            db.session.commit()
            return jsonify({'message': 'Succesful Registration'}), 200
        except:
            db.session.rollback()
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
                creation_date = datetime.datetime.now()
                last = User.query.order_by(User.id.desc()).first()
                hash = generate_password_hash(registration_data['password'])
                if last is None:
                    new_id = 1
                else:
                    new_id = last.id + 1

                last_company_id = User.query.filter_by(company_name=token.company_name).order_by(User.company_id.desc()).first()
                if last_company_id is None:
                    new_company_id = 10000
                else:
                    new_company_id = last_company_id.company_id + 1

                data = User(id = new_id, 
                            company_id = new_company_id, 
                            first_name = registration_data['first_name'],
                            last_name = registration_data['last_name'],
                            employment = token.employment,
                            employment_level = token.employment_level,
                            company_name = token.company_name, 
                            department = token.department,
                            access_level = token.access_level, 
                            email = token.email, 
                            password = hash,
                            created_by = new_company_id, 
                            changed_by = new_company_id, 
                            creation_timestamp = creation_date
                            )

                try:
                    db.session.add(data)
                    db.session.commit()
                    return jsonify({'message': 'Succesful Registration'}), 200
                except:
                    db.session.rollback()
                    return jsonify({'message': 'Registration went wrong!'}), 200

    return jsonify({'message': 'Get Ready!'}), 200


@app.route('/api/registration/admin', methods = ['GET', 'POST'])
def get_admin_registration():

    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()

    departments = (
        Company.query
        .filter_by(company_name=user.company)
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
        .all()
    )

    # Flatten the list of departments and filter out None values
    department_list = [department for department in departments if department is not None]
    print(department_list)

    if request.method =='POST':
        admin_registration_data = request.get_json()
        if admin_registration_data['password'] != admin_registration_data['password2']:
            return jsonify({'message': 'Password are not matching'}), 200
        else:
            creation_date = datetime.datetime.now()
            last = User.query.order_by(User.id.desc()).first()
            hash = generate_password_hash(admin_registration_data['password'])
            if last is None:
                new_id = 1
            else:
                new_id = last.id + 1

            last_company_id = User.query.filter_by(company_name=admin_registration_data['company_name']).order_by(User.company_id.desc()).first()
            if last_company_id is None:
                new_company_id = 10000
            else:
                new_company_id = last_company_id.company_id + 1

            data = User(id = new_id, 
                        company_id = new_company_id, 
                        first_name = admin_registration_data['first_name'],
                        last_name = admin_registration_data['last_name'], 
                        employment = admin_registration_data['employment'], 
                        employment_level = admin_registration_data['employment_level'],
                        company_name = admin_registration_data['company_name'], 
                        department = admin_registration_data['department'],
                        access_level = admin_registration_data['access_level'], 
                        email = admin_registration_data['email'], 
                        password = hash,
                        created_by = new_company_id, 
                        changed_by = new_company_id, 
                        creation_timestamp = creation_date
                        )

            try:
                db.session.add(data)
                db.session.commit()
                return jsonify({'message': 'Successful Registration'}), 200
            except:
                db.session.rollback()
                return jsonify({'message': 'Registration went wrong!'}), 200
    
    user_dict={
    'department_list': department_list,
    }
    return jsonify(user_dict)
                

def get_temp_timereq_dict(template_name, day_num, daily_slots, hour_divider, minutes, company_name, full_day):
    temp_timereq_dict = {}

    # Query once to get all relevant TemplateTimeRequirements
    all_temps = TemplateTimeRequirement.query.filter_by(
        company_name=company_name,
        template_name=template_name
    ).all()

    # Convert all_temps to a convenient lookup structure
    temp_lookup = {(temp.weekday, temp.start_time): temp.worker for temp in all_temps if temp.worker != 0}
    
    for i in range(day_num):
        for hour in range(daily_slots):
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
    user = User.query.filter_by(email=react_user).first()
    creation_date = datetime.datetime.now()
    weekdays = {0: 'Montag', 1: 'Dienstag', 2: 'Mittwoch', 3: 'Donnerstag', 4: 'Freitag', 5: 'Samstag', 6: 'Sonntag'}
    today = datetime.date.today()
    solverreq = SolverRequirement.query.filter_by(company_name=user.company_name).first()
    hour_divider = solverreq.hour_devider
    full_day = (24 * hour_divider) -1
    minutes = 60 / hour_divider
    day_num = 7   
    company_id = user.company_id

   

    # Fetch Opening Data
    all_opening_hours = OpeningHours.query.filter(
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
    week_adjustment = int(request.args.get('week_adjustment', 0))
    week_start = monday + datetime.timedelta(days=week_adjustment)

    slot_dict = {}
    for i in range(min_opening, daily_slots):
        effective_hour = i % (full_day + 1) # This will wrap around the time after 24
        quarter_hour = effective_hour / hour_divider
        quarter_minute = (effective_hour % hour_divider) * minutes  # Remainder gives the quarter in the hour
        
        formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
        slot_dict[i] = formatted_time
    
    # Pre-fetch all TimeReq for the given date range and company name
    end_date = week_start + datetime.timedelta(days=day_num)
    all_time_reqs = TimeReq.query.filter(
        TimeReq.company_name == user.company_name,
        TimeReq.date.between(week_start, end_date)
    ).all()

    # Convert all_time_reqs to a dictionary for quick lookup
    time_req_lookup = {(rec.date, rec.start_time): rec.worker for rec in all_time_reqs}

    timereq_dict = {}
    for i in range(day_num):
        for hour in range(daily_slots):
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

    department_list = [department for department in departments if department is not None]

    #Submit the required FTE per hour
    if request.method == 'POST':
        button = request.json.get("button", None)
        if button == "Submit":
            workforce_data = request.get_json()
            week_adjustment = int(request.args.get('week_adjustment', 0))

            # Delete existing TimeReq entries for the week
            new_dates = [monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment) for i in range(day_num)]
            TimeReq.query.filter(
                TimeReq.company_name == user.company_name,
                TimeReq.department == workforce_data['department'] if 'department' in workforce_data else None,
                TimeReq.date.in_(new_dates)
            ).delete(synchronize_session='fetch')
            db.session.commit()

            # Create new TimeReq entries
            new_records = []
            for i in range(day_num):
                for quarter in range(daily_slots):
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
                                id=None,
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

            db.session.bulk_save_objects(new_records)
            db.session.commit()

    #Save Templates
    if request.method == 'POST':
        button = request.json.get("button", None)
        if button == "Save Template":
            workforce_data = request.get_json()
            data_deletion = TemplateTimeRequirement.query.filter_by(company_name=user.company_name, template_name=workforce_data['template_name'])
            if data_deletion:
                data_deletion.delete()
                db.session.commit()
            for i in range(day_num):
                for quarter in range(daily_slots): # There are 96 quarters in a day
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
                            id=None, 
                            company_name = user.company_name,
                            template_name = workforce_data['template_name'],
                            weekday = {i},
                            start_time = new_time,
                            worker = capacity,
                            created_by = user.company_id,
                            changed_by = user.company_id,
                            creation_timestamp = creation_date
                            )
                        db.session.add(temp_req)
                        db.session.commit()
        
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




from functools import wraps
import logging

@app.route('/api/schichtplanung', methods=['POST', 'GET'])
@jwt_required()
def get_shift():
    react_user_email = get_jwt_identity()
    current_user = User.query.filter_by(email=react_user_email).first()

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
    users = User.query.filter_by(company_name=current_company_name).all()

    user_list = []
    for user in users:
        user_dict = {
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        user_list.append(user_dict)

    # Query the opening hours for the current company
    opening_hours_records = OpeningHours.query.filter_by(company_name=current_company_name).all()

    opening_hours_data = {}
    for record in opening_hours_records:
        if record.start_time is not None and record.end_time is not None:
            german_day = DAY_MAP.get(record.weekday.lower(), record.weekday.lower())
            opening_hours_data[german_day] = {
                "start": record.start_time.strftime("%H:%M"),
                "end": record.end_time.strftime("%H:%M")
            }
    logging.debug(f"Opening hours data: {opening_hours_data}")
    print("Opening:", opening_hours_data)

    if start_date and end_date:
        shift_records = Timetable.query.filter(
            Timetable.company_name == current_company_name, 
            Timetable.date >= start_date, 
            Timetable.date <= end_date
        ).all()
    else:
        shift_records = Timetable.query.filter_by(company_name=current_company_name).all()


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
        print("Shift:", shift_data)

    response = {
        'users': user_list,
        'opening_hours': opening_hours_data,
        'shifts': shift_data
    }

    return jsonify(response)

import locale

@app.route('/api/dashboard', methods=['POST', 'GET'])
@jwt_required()
def get_dashboard_data():
    current_user_id = get_jwt_identity()
    
    current_user = User.query.filter_by(email=current_user_id).first()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    # Existing data fetching
    worker_count = User.query.filter_by(company_name=current_user.company_name).count()
    start_time_count = Timetable.query.filter(
        (Timetable.company_name == current_user.company_name) & 
        (Timetable.start_time != None)
    ).count()

    # Fetching upcoming shifts (assuming today's date is represented by datetime.now().date())
    upcoming_shifts_query = Timetable.query.filter(
        (Timetable.company_name == current_user.company_name) &
        (Timetable.date >= datetime.datetime.now().date()) &
        (Timetable.date < datetime.datetime.now().date() + datetime.timedelta(days=7))  # Adjust this timeframe as needed
    ).order_by(Timetable.date, Timetable.start_time).all()

    # Set the locale to German temporarily
    locale.setlocale(locale.LC_TIME, "de_DE.UTF-8")
    # Formatting the upcoming shifts data for JSON serialization
    upcoming_shifts = [{
        'name': f'{shift.first_name} {shift.last_name}',
        'day': shift.date.strftime('%A'),  # Displaying day name
        'shifts': [
            {'start': shift.start_time.strftime('%H:%M'), 'end': shift.end_time.strftime('%H:%M')} if shift.start_time and shift.end_time else None,
            {'start': shift.start_time2.strftime('%H:%M'), 'end': shift.end_time2.strftime('%H:%M')} if shift.start_time2 and shift.end_time2 else None,
            {'start': shift.start_time3.strftime('%H:%M'), 'end': shift.end_time3.strftime('%H:%M')} if shift.start_time3 and shift.end_time3 else None
        ]
    } for shift in upcoming_shifts_query]

    # Remove any None values from the shifts lists
    for shift in upcoming_shifts:
        shift['shifts'] = [s for s in shift['shifts'] if s]

    # Determine the start and end dates of the current week
    today = datetime.datetime.now().date()
    start_of_week = today - datetime.timedelta(days=today.weekday())
    end_of_week = start_of_week + datetime.timedelta(days=6)

    # Fetching hours worked data
    hours_worked_query = (
        db.session.query(
            Timetable.date,
            func.sum(
                (
                    (func.hour(Timetable.end_time) - func.hour(Timetable.start_time)) * 60 +
                    (func.minute(Timetable.end_time) - func.minute(Timetable.start_time))
                ) / 60
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

    # Format the data for JSON serialization
    hours_worked_data = [{"date": item.date.strftime('%A'), "hours_worked": item.hours_worked} for item in hours_worked_query]

    # Fetching currently working shifts
    now = datetime.datetime.now()
    current_shifts_query = Timetable.query.filter(
        (Timetable.company_name == current_user.company_name) &
        (Timetable.date == now.date()) &
        (Timetable.start_time <= now.time()) &
        (Timetable.end_time >= now.time())
    ).all()

    # Formatting the currently working shifts data for JSON serialization
    current_shifts = [{
        'name': f'{shift.first_name} {shift.last_name}',
        'start': shift.start_time.strftime('%H:%M'),
        'end': shift.end_time.strftime('%H:%M')
    } for shift in current_shifts_query]
 
    print(current_shifts)
    return jsonify({
        'worker_count': worker_count,
        'start_time_count': start_time_count,
        'upcoming_shifts': upcoming_shifts,
        'hours_worked_over_time': hours_worked_data,
        'current_shifts': current_shifts
        
    })


@app.route('/api/calendar', methods=['GET'])
@jwt_required()
def get_calendar():
    current_user_id = get_jwt_identity()
    current_user = User.query.filter_by(email=current_user_id).first()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get the shifts for the current user
    shifts = Timetable.query.filter_by(email=current_user_id).all()
    
    # Convert the shifts to the format expected by FullCalendar
    events = [{
        'id': shift.id,
        'title': f"{shift.first_name} {shift.last_name}",
        'date': shift.date.strftime('%Y-%m-%d'),
        'start': datetime.datetime.combine(shift.date, shift.start_time).strftime('%Y-%m-%dT%H:%M:%S'),
        'end': datetime.datetime.combine(shift.date, shift.end_time).strftime('%Y-%m-%dT%H:%M:%S'),
    } for shift in shifts]
    print(events)
    return jsonify(events)




# Bearbeitet von Gery am 23.09.2023
@app.route('/api/download', methods=['POST', 'GET'])
@jwt_required()
def get_excel():
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()

    output = create_excel_output(user.id)
    
    return send_file(output, as_attachment=True, download_name="Schichtplan.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

