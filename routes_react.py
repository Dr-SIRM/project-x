from flask import request, url_for, session, jsonify, send_from_directory, make_response
from flask_mail import Message
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import random
from models import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app import app


#Import of Database
#-------------------------------------------------------------------------

from models import User, Availability, TimeReq, Company, OpeningHours, Timetable, \
    TemplateAvailability, TemplateTimeRequirement, RegistrationToken, PasswordReset




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

@app.route('/api/users')
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

@app.route('/api/new_user', methods=['POST'])
def new_user():
    data = request.json
    user = User(first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                employment_level=data['employment_level'],
                company_name=data['company_name'],
                department=data['department'],
                access_level=data['access_level'])
    db.session.add(user)
    db.session.commit()
    return {'success': True}


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
            
            # Convert the employment_level to its original range [0, 1] before saving
            employment_level_percentage = user_data.get('employment_level')
            if employment_level_percentage is not None:
                user.employment_level = employment_level_percentage / 100.0
            
            user.department = user_data.get('department', user.department)
            user.changed_by = react_user
            user.update_timestamp = datetime.datetime.now()

            db.session.commit()
            return 'Success', 200

    # Convert the employment_level to a percentage before sending it to the frontend
    employment_level_percentage = user.employment_level * 100

    user_dict = {
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'employment_level': employment_level_percentage,
        'department': user.department,
    }

    return jsonify(user_dict)


@app.route('/api/company', methods=['GET', 'POST'])
@jwt_required()
def get_company():
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()
    opening_hours = OpeningHours.query.filter_by(company_name=user.company_name).first()
    weekdays = {0:'Monday', 1:'Tuesday', 2:'Wednesday', 3:'Thursday', 4:'Friday', 5:'Saturday', 6:'Sunday'}
    company = Company.query.filter_by(company_name=user.company_name).first()
    day_num = 7
    company_id = user.company_id
    creation_date = datetime.datetime.now()

    if company is None:
        company_name = ''
        shift = ''
        weekly_hour = ''
    else:
        company_name = company.company_name
        shift = company.shifts
        weekly_hour = company.weekly_hours

    temp_dict = {}
    for i in range(day_num):
        temp = OpeningHours.query.filter_by(company_name=user.company_name, weekday=weekdays[i]).first()
        if temp is None:
            pass
        else:
            new_i = i + 1
            temp_dict[str(new_i) + '&0'] = temp.start_time.strftime("%H:%M") if temp.start_time else None
            temp_dict[str(new_i) + '&1'] = temp.end_time.strftime("%H:%M") if temp.end_time else None

        if request.method == 'POST':
            company_data = request.get_json()

            # Company Data 
            OpeningHours.query.filter_by(company_name=user.company_name).delete()
            db.session.commit()
            company_no = Company.query.order_by(Company.id.desc()).first()
            if company_no is None:
                new_company_no = 1
            else:
                new_company_no = company_no.id + 1
            


            company_data = Company(
                id=new_company_no,
                company_name=company_data['company_name'],
                weekly_hours=company_data['weekly_hours'],
                shifts=company_data['shifts'],
                created_by=company_id,
                changed_by=company_id,
                creation_timestamp=creation_date
            )

            db.session.merge(company_data)
            db.session.commit()

            for i in range(day_num):
                entry1 = request.json.get(f'day_{i}_0')
                print(entry1)
                entry2 = request.json.get(f'day_{i}_1')
                if entry1:
                    last = OpeningHours.query.order_by(OpeningHours.id.desc()).first()
                    if last is None:
                        new_id = 1
                    else:
                        new_id = last.id + 1
                    try:
                        new_entry1 = datetime.datetime.strptime(entry1, '%H:%M:%S').time()
                    except:
                        new_entry1 = datetime.datetime.strptime(entry1, '%H:%M').time()

                    try:
                        new_entry2 = datetime.datetime.strptime(entry2, '%H:%M:%S').time()
                    except:
                        new_entry2 = datetime.datetime.strptime(entry2, '%H:%M').time()

                    new_weekday = weekdays[i]

                    opening = OpeningHours(
                    id=new_id,
                    company_name=user.company_name,
                    weekday=new_weekday,
                    start_time=new_entry1,
                    end_time=new_entry2,
                    created_by=company_id,
                    changed_by=company_id,
                    creation_timestamp=creation_date
                )

                db.session.add(opening)
                db.session.commit()


    company_list = {
        'company_name': company_name,
        'shifts': shift,
        'weekly_hours': weekly_hour,
        'weekdays': weekdays,
        'day_num': day_num,
        'temp_dict': temp_dict, 
    }
    
    
    return jsonify(company_list)


@app.route('/api/availability', methods = ['GET', 'POST'])
@jwt_required()
def get_availability():
    # today's date
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()
    today = datetime.date.today()
    creation_date = datetime.datetime.now()
    monday = today - datetime.timedelta(days=today.weekday())
    weekdays = {0:'Monday', 1:'Tuesday', 2:'Wednesday', 3:'Thursday', 4:'Friday', 5:'Saturday', 6:'Sunday'}
    day_num = 7
    week_adjustment = session.get('week_adjustment', 0)
    company_id = user.company_id


    temp_dict = {}
    for i in range(day_num):
        temp = Availability.query.filter_by(email=user.email, weekday=weekdays[i]).first()
        if temp is None:
            pass
        else:
            new_i = i + 1
            temp_dict[str(new_i) + '&0'] = temp.start_time.strftime("%H:%M") if temp.start_time else None
            temp_dict[str(new_i) + '&1'] = temp.end_time.strftime("%H:%M") if temp.end_time else None
            temp_dict[str(new_i) + '&2'] = temp.start_time2.strftime("%H:%M") if temp.start_time else None
            temp_dict[str(new_i) + '&3'] = temp.end_time2.strftime("%H:%M") if temp.end_time else None
            temp_dict[str(new_i) + '&4'] = temp.start_time3.strftime("%H:%M") if temp.start_time else None
            temp_dict[str(new_i) + '&5'] = temp.end_time3.strftime("%H:%M") if temp.end_time else None

    """
    if planning_form.prev_week.data:
        week_adjustment -=7
        session['week_adjustment'] = week_adjustment

        monday = monday + datetime.timedelta(days=week_adjustment)

        return render_template('planning.html', template_form=planning_form, monday=monday, weekdays=weekdays,
                               day_num=day_num)

    if planning_form.next_week.data:
        week_adjustment +=7
        session['week_adjustment'] = week_adjustment

        monday = monday + datetime.timedelta(days=week_adjustment)

        return render_template('planning.html', template_form=planning_form, monday=monday, weekdays=weekdays,
                               day_num=day_num, temp_dict=temp_dict)
    """


    #Save Availability
    if request.method == 'POST':
        availability_data = request.get_json()
        for i in range(day_num):
            new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
            Availability.query.filter_by(user_id=user.id, date=new_date).delete()
            db.session.commit()

            entry1 = request.json.get(f'day_{i}_0')
            entry2 = request.json.get(f'day_{i}_1')
            entry3 = request.json.get(f'day_{i}_2')
            entry4 = request.json.get(f'day_{i}_3')
            entry5 = request.json.get(f'day_{i}_4')
            entry6 = request.json.get(f'day_{i}_5')
            if entry1:
                last = Availability.query.order_by(Availability.id.desc()).first()
                if last is None:
                    new_id = 1
                else:
                    new_id = last.id + 1
    
                try:
                    new_entry1 = datetime.datetime.strptime(entry1, '%H:%M:%S').time()
                except:
                    new_entry1 = datetime.datetime.strptime(entry1, '%H:%M').time()
                
                try:
                    new_entry2 = datetime.datetime.strptime(entry2, '%H:%M:%S').time()
                except:
                    new_entry2 = datetime.datetime.strptime(entry2, '%H:%M').time()
                
                try:
                    new_entry3 = datetime.datetime.strptime(entry3, '%H:%M:%S').time()
                except:
                    new_entry3 = datetime.datetime.strptime(entry3, '%H:%M').time()
                
                try:
                    new_entry4 = datetime.datetime.strptime(entry4, '%H:%M:%S').time()
                except:
                    new_entry4 = datetime.datetime.strptime(entry4, '%H:%M').time()
               
                try:
                    new_entry5 = datetime.datetime.strptime(entry5, '%H:%M:%S').time()
                except:
                    new_entry5 = datetime.datetime.strptime(entry5, '%H:%M').time()
                
                try:
                    new_entry6 = datetime.datetime.strptime(entry6, '%H:%M:%S').time()
                except:
                    new_entry6 = datetime.datetime.strptime(entry6, '%H:%M').time()

                
                new_weekday = weekdays[i]


                data = Availability(
                    id=new_id, 
                    user_id=user.id, 
                    date=new_date, 
                    weekday=new_weekday, 
                    email=user.email,
                    start_time=new_entry1, 
                    end_time=new_entry2, 
                    start_time2=new_entry3,
                    end_time2=new_entry4, 
                    start_time3=new_entry5, 
                    end_time3=new_entry6,
                    created_by=company_id, 
                    changed_by=company_id, 
                    creation_timestamp = creation_date
                    )


                db.session.add(data)
                db.session.commit()

    '''
    #Save templates
    if request.method == 'POST' and 'template' in request.form:
        for i in range(day_num):
            entry1 = request.form.get(f'day_{i}_0')
            entry2 = request.form.get(f'day_{i}_1')
            entry3 = request.form.get(f'day_{i}_2')
            entry4 = request.form.get(f'day_{i}_3')
            entry5 = request.form.get(f'day_{i}_4')
            entry6 = request.form.get(f'day_{i}_5')
            if entry1:
                last = TemplateAvailability.query.order_by(TemplateAvailability.id.desc()).first()
                if last is None:
                    new_id = 1
                else:
                    new_id = last.id + 1
                new_name = planning_form.template_name.data
                new_date = monday + datetime.timedelta(days=i)
                new_entry1 = datetime.datetime.strptime(entry1, '%H:%M').time()
                new_entry2 = datetime.datetime.strptime(entry2, '%H:%M').time()
                new_entry3 = datetime.datetime.strptime(entry3, '%H:%M').time()
                new_entry4 = datetime.datetime.strptime(entry4, '%H:%M').time()
                new_entry5 = datetime.datetime.strptime(entry5, '%H:%M').time()
                new_entry6 = datetime.datetime.strptime(entry6, '%H:%M').time()
                new_weekday = weekdays[i]

                data = TemplateAvailability(
                    id=new_id, 
                    template_name=new_name, 
                    date=new_date, 
                    weekday=new_weekday, 
                    email=user.email,
                    start_time=new_entry1, 
                    end_time=new_entry2, 
                    start_time2=new_entry3,
                    end_time2=new_entry4, 
                    start_time3=new_entry5, 
                    end_time3=new_entry6,
                    created_by=company_id, 
                    changed_by=company_id, 
                    creation_timestamp = creation_date
                    )


                db.session.add(data)
                db.session.commit()
            '''

    availability_list = {
        'weekdays': weekdays,
        'day_num': day_num,
        'temp_dict': temp_dict,
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


@app.route('/api/solver', methods = ['GET', 'POST'])
@jwt_required()
def run_solver():

    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()

    if request.method == 'POST':
        from data_processing import DataProcessing
        from or_algorithm import ORAlgorithm

        solver_data = request.get_json()
        if 'solverButtonClicked' in solver_data and solver_data['solverButtonClicked']:
            # Damit der Code threadsafe ist, wird jedesmal eine neue Instanz erstellt pro Anfrage!
            dp = DataProcessing(user.id)
            dp.run()
            or_algo = ORAlgorithm(dp)
            or_algo.run()
            
            return jsonify({'message': 'Solver successfully started'}), 200
        else:
            return jsonify({'message': 'Solver button was not clicked'}), 200
    return jsonify({'message': 'Solver Go'}), 200



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


#api should maybe be named differently? as aleardy used
@app.route('/api/registration/admin', methods = ['GET', 'POST'])
def get_admin_registration():   
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
    
    return jsonify({'message': 'Get Ready!'}), 200
                


@app.route('/api/requirement/workforce', methods = ['GET', 'POST'])
@jwt_required()
def get_required_workforce():
    react_user = get_jwt_identity()
    user = User.query.filter_by(email=react_user).first()
    Time = TimeReq.query.all()
    creation_date = datetime.datetime.now()
    weekdays = {0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday'}
    today = datetime.date.today()
    monday = today - datetime.timedelta(days=today.weekday())
    day_num = 7
    week_adjustment = int(request.args.get('week_adjustment', 0))
    user = User.query.get(user.id)
    company_id = user.company_id


    timereq_dict = {}
    for i in range(day_num):
        for hour in range(24):
            new_date = monday + datetime.timedelta(days=i)
            time_num = hour * 100
            time = f'{time_num:04d}'
            new_time = datetime.datetime.strptime(time, '%H%M').time()
            temp = TimeReq.query.filter_by(company_name=user.company_name, date=new_date, start_time=new_time).first()
            if temp is None:
                pass
            else:
                new_i = i + 1
                timereq_dict[str(new_i) + str(hour)] = temp.worker
    
    opening_dict = {}
    for i in range(day_num):
        opening = OpeningHours.query.filter_by(company_name=user.company_name, weekday=weekdays[i]).first()
        if opening is None:
            pass
        else:
            new_i = i + 1
            opening_dict[str(new_i) + '&0'] = opening.start_time.strftime("%H:%M") if opening.start_time else None
            opening_dict[str(new_i) + '&1'] = opening.end_time.strftime("%H:%M") if opening.end_time else None

    """
    #Prev Week
    if time_form.prev_week.data:
        week_adjustment -=7
        session['week_adjustment'] = week_adjustment

        monday = monday + datetime.timedelta(days=week_adjustment)


    #Next Week
    if time_form.next_week.data:
        week_adjustment +=7
        session['week_adjustment'] = week_adjustment

        monday = monday + datetime.timedelta(days=week_adjustment)
    
    

    # Set Template
    if time_form.template1.data:
        temp_dict = {}
        for i in range(day_num):
            for hour in range(24):
                time_num = hour * 100
                time = f'{time_num:04d}'
                new_time = datetime.datetime.strptime(time, '%H%M').time()
                temp = TemplateTimeRequirement.query.filter_by(weekday=weekdays[i], start_time=new_time).first()
                if temp is None:
                    pass
                else:
                    new_i = i + 1
                    temp_dict[str(new_i) + '&' + str(hour)] = temp.worker

   """     

    #Submit the required FTE per hour
    if request.method =='POST':
        workforce_data = request.get_json()
        for i in range(day_num):
            for quarter in range(96): # There are 96 quarters in a day
                quarter_hour = quarter / 4  # Each quarter represents 15 minutes, so divided by 4 gives hour
                quarter_minute = (quarter % 4) * 15  # Remainder gives the quarter in the hour
                formatted_time = f'{int(quarter_hour):02d}:{int(quarter_minute):02d}'
                capacity = workforce_data.get(f'worker_{i}_{formatted_time}')
                if capacity:
                    last = TimeReq.query.order_by(TimeReq.id.desc()).first()
                    if last is None:
                        new_id = 1
                    else:
                        new_id = last.id + 1
                    new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
                    """
                    time_num = hour * 100"
                    """
                    time = f'{formatted_time}:00'
                    new_time = datetime.datetime.strptime(time, '%H:%M:%S').time()

                    TimeReq.query.filter_by(company_name=user.company_name, date=new_date, start_time=new_time).delete()
                    db.session.commit()

                    req = TimeReq(id=new_id, company_name=user.company_name, date=new_date, start_time=new_time, worker=capacity, created_by=company_id,
                                  changed_by=company_id, creation_timestamp = creation_date)

                    db.session.add(req)
                    db.session.commit()
        
    calendar_dict={
        'weekdays': weekdays,
        'opening_dict': opening_dict,
        'day_num': day_num,
        'timereq_dict': timereq_dict,
        'monday': monday
    }

    return jsonify(calendar_dict)