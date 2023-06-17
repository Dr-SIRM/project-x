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
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from collections.abc import Mapping as ABCMapping

#Config
#----------------------------------------------------------------------------------

app = Flask(__name__, template_folder='template')
CORS(app)

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory('./static/react-app/build', path)


#SET SQLALCHEMY
app.config["SECRET_KEY"] = "mysecret"
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://admin:ProjectX2023.@projectx2.crbavgy9fqyf.eu-central-1.rds.amazonaws.com/projectx2'
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



#Define Login Requirement

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()
        elif current_user.access_level != 'Admin':
            abort(403)
        return f(*args, **kwargs)
    return decorated_function


def user_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()
        elif current_user.access_level != 'User':
            abort(403)
        return f(*args, **kwargs)

    return decorated_function


#Import of Forms
#--------------------------------------------------------------------------------

from forms import EmployeeForm, PlanningForm, UpdateForm, TimeReqForm, InviteForm, SolveForm, CompanyForm


#Import of Database
#-------------------------------------------------------------------------

from models import User, Availability, TimeReq, Company, OpeningHours, Timetable, \
    TemplateAvailability, TemplateTimeRequirement, RegistrationToken, PasswordReset


#Define functions
#----------------------------------------------------------------------------------


    #General functions
    #-----------------------------------------------------------------------------
#NEW for React app

@app.route('/react_dashboard')
def react_dashboard():
    return send_from_directory('static/react-app/build', 'index.html')


@app.route('/')
def homepage():
    return render_template('homepage.html')

@app.route('/registration', methods = ['GET', 'POST'])
def registration():   
    data_form = EmployeeForm(csrf_enabled=False)
    if request.method =='POST':
        if data_form.password.data != data_form.password2.data:
            flash("Wrong Password")
            return render_template('token_registration.html', data_tag=User.query.all(), template_form=data_form)
        else:
            token = RegistrationToken.query.filter_by(token=data_form.token.data, email=data_form.email.data).first()
            if token is None:
                flash('Token does not exist. Please check your Confirmation Mail.')
                return redirect(url_for('registration'))
            else:
                creation_date = datetime.datetime.now()
                last = User.query.order_by(User.id.desc()).first()
                hash = generate_password_hash(data_form.password.data)
                if last is None:
                    new_id = 1
                else:
                    new_id = last.id + 1

                last_company_id = User.query.filter_by(company_name=token.company_name).order_by(User.company_id.desc()).first()
                if last_company_id is None:
                    new_company_id = 10000
                else:
                    new_company_id = last_company_id + 1

                data = User(id = new_id, company_id = new_company_id, first_name = data_form.first_name.data,
                            last_name = data_form.last_name.data, employment_level = token.employment_level,
                            company_name = token.company_name, department = token.department,
                            access_level = token.access_level, email = token.email, password = hash,
                            created_by = new_company_id, changed_by = new_company_id, creation_timestamp = creation_date)

                try:
                    db.session.add(data)
                    db.session.commit()
                    print(data_form.password.data)
                    print(data_form.password2.data)
                    flash('Registration successful submitted')
                    return redirect(url_for('login'))
                except:
                    db.session.rollback()
                    flash('Error occured - Your mail might be already in use :(')
                    return redirect(url_for('registration'))
    
    return render_template('token_registration.html', data_tag=User.query.all(), template_form=data_form)



@app.route('/registration/admin', methods = ['GET', 'POST'])
def admin_registration():   
    data_form = EmployeeForm(csrf_enabled=False)
    if request.method =='POST':
        if data_form.password.data != data_form.password2.data:
            flash("Wrong Password")
            return render_template('admin_registration.html', data_tag=User.query.all(), template_form=data_form)
        else:
            creation_date = datetime.datetime.now()
            last = User.query.order_by(User.id.desc()).first()
            hash = generate_password_hash(data_form.password.data)
            if last is None:
                new_id = 1
            else:
                new_id = last.id + 1

            last_company_id = User.query.filter_by(company_name=data_form.company_name.data).order_by(User.company_id.desc()).first()
            if last_company_id is None:
                new_company_id = 10000
            else:
                new_company_id = last_company_id + 1

            data = User(id = new_id, company_id = new_company_id, first_name = data_form.first_name.data,
                        last_name = data_form.last_name.data, employment = data_form.employment.data, employment_level = data_form.employment_level.data,
                        company_name = data_form.company_name.data, department = data_form.department.data,
                        access_level = data_form.access_level.data, email = data_form.email.data, password = hash,
                        created_by = new_company_id, changed_by = new_company_id, creation_timestamp = creation_date)

            try:
                db.session.add(data)
                db.session.commit()
                flash('Registration successful submitted')
                return redirect(url_for('login'))
            except:
                db.session.rollback()
                flash('Error occured - Your mail might be already in use :(')
                return redirect(url_for('registration'))
    
    return render_template('registration.html', data_tag=User.query.all(), template_form=data_form)


#NEW for react dashboard after login
@app.route('/login', methods=['GET', 'POST'])
def login():
    login_form = EmployeeForm(csrf_enabled=False)
    if request.method == 'POST':
        user = User.query.filter_by(email=login_form.email.data).first()
        if user is None:
            flash('User does not exist')
            return redirect(url_for('user'))
        login_user(user)
        if user and check_password_hash(user.password, login_form.password.data):
            flash('Successfully logged in')
            #return redirect(url_for('react_dashboard'))
            return redirect(url_for('user'))
        else:
            flash('Please try again')
            return render_template('login.html', template_form=login_form)
    else:
        return render_template('login.html', template_form=login_form)



@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('homepage'))


@app.route('/about')
def about():
    return f'About Us'


    #User functions
    #---------------------------------------------------

@app.route('/user', methods=["GET", "POST"])
@login_required
def user():
    account = User.query.get(current_user.id)
    user_form = UpdateForm(csrf_enabled=False, obj=account)

    return render_template('user.html', available=Availability.query.filter_by(email=account.email),
                           account=account, template_form=user_form)



@app.route('/update', methods=["GET", "POST"])
@login_required
def update():
    new_data = User.query.get(current_user.id)
    user_form = UpdateForm(csrf_enabled=False, obj=new_data)
    company_id = User.query.get(current_user.company_id)

    if request.method == 'POST':
        existing_user = User.query.filter_by(id=current_user.id).first()
        if existing_user:
            existing_user.first_name = user_form.first_name.data
            existing_user.last_name = user_form.last_name.data
            existing_user.employment = user_form.employment.data
            existing_user.employment_level = user_form.employment_level.data
            existing_user.company_name = user_form.company_name.data
            existing_user.department = user_form.department.data
            existing_user.access_level = user_form.access_level.data
            existing_user.email = user_form.email.data
            existing_user.changed_by = company_id
            existing_user.update_timestamp = datetime.datetime.now

            db.session.commit()


    return render_template('update.html', data_tag=User.query.all(), account=new_data, template_form=user_form)


@app.route('/forget_password', methods=["GET", "POST"])
def forget_password():
    update_form = UpdateForm(csrf_enabled=False)
  
    if request.method == 'POST':
        existing_user = User.query.filter_by(email=update_form.email.data).first()
        if existing_user is None:
            flash('No User exists under your email')
        else:
            random_token = random.randint(100000,999999)
            reset_url = url_for('reset_password', token=random_token, _external=True)
            last = PasswordReset.query.order_by(PasswordReset.id.desc()).first()
            if last is None:
                new_id = 1
            else:
                new_id = last.id + 1

            data = PasswordReset(id=new_id, email=update_form.email.data, token=random_token)

            db.session.add(data)
            db.session.commit()

            msg = Message('Reset Password', recipients=['timetab@gmx.ch'])
            msg.body = f"Hey there,\n \n Below you will find your reset Link. \n \n {reset_url}"
            mail.send(msg)

    return render_template('forget_password.html', template_form=update_form)



@app.route('/reset_password/<token>', methods=["GET", "POST"])
def reset_password(token):
    update_form = UpdateForm(csrf_enabled=False)

    reset_request = PasswordReset.query.filter_by(token=token).first()
    if reset_request is None or reset_request.expiration < datetime.datetime.now():
        flash('Request is expired or does not exist')
        return redirect(url_for('login'))


    if request.method == 'POST':
        if update_form.password.data != update_form.password2.data:
            flash("Password does not match")
            return redirect(url_for('login'))
        else:
            hash = generate_password_hash(update_form.password.data)
            existing_user = User.query.filter_by(email=reset_request.email).first()
            print(existing_user)
            print(token)
            if existing_user:
                existing_user.password = hash
            
                db.session.commit()

                db.session.delete(reset_request)
                db.session.commit()
        return redirect(url_for('login'))


    return render_template('reset_password.html', template_form=update_form)


@app.route('/planning', methods = ['GET', 'POST'])
@login_required
def planning():
    # today's date
    today = datetime.date.today()
    creation_date = datetime.datetime.now()
    monday = today - datetime.timedelta(days=today.weekday())
    weekdays = {0:'Monday', 1:'Tuesday', 2:'Wednesday', 3:'Thursday', 4:'Friday', 5:'Saturday', 6:'Sunday'}
    day_num = 7
    week_adjustment = session.get('week_adjustment', 0)

    user = User.query.get(current_user.id)
    company_id = current_user.company_id
    planning_form = PlanningForm(csrf_enabled = False)

    company_dict = {}
    for company in User.query.filter_by(email=current_user.email).all():
        company_dict[company.company_name] = company
       


    temp_dict = {}
    for i in range(day_num):
        temp = Availability.query.filter_by(email=user.email, weekday=weekdays[i]).first()
        if temp is None:
            pass
        else:
            new_i = i + 1
            temp_dict[str(new_i) + '&0'] = temp.start_time
            temp_dict[str(new_i) + '&1'] = temp.end_time
            temp_dict[str(new_i) + '&2'] = temp.start_time2
            temp_dict[str(new_i) + '&3'] = temp.end_time2
            temp_dict[str(new_i) + '&4'] = temp.start_time3
            temp_dict[str(new_i) + '&5'] = temp.end_time3


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

    #Set Template
    if planning_form.template1.data:
        temp_dict = {}
        for i in range(day_num):
            temp = TemplateAvailability.query.filter_by(email=user.email, weekday=weekdays[i]).first()
            if temp is None:
                pass
            else:
                new_i = i + 1
                temp_dict[str(new_i) + '&0'] = temp.start_time
                temp_dict[str(new_i) + '&1'] = temp.end_time
                temp_dict[str(new_i) + '&2'] = temp.start_time2
                temp_dict[str(new_i) + '&3'] = temp.end_time2
                temp_dict[str(new_i) + '&4'] = temp.start_time3
                temp_dict[str(new_i) + '&5'] = temp.end_time3

        return render_template('planning.html', template_form=planning_form, monday=monday, weekdays=weekdays,
                               day_num=day_num, temp_dict=temp_dict)


    #Save Availability
    if request.method == 'POST' and 'submit' in request.form:
        for i in range(day_num):
            new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
            Availability.query.filter_by(user_id=current_user.id, date=new_date).delete()
            db.session.commit()

            entry1 = request.form.get(f'day_{i}_0')
            entry2 = request.form.get(f'day_{i}_1')
            entry3 = request.form.get(f'day_{i}_2')
            entry4 = request.form.get(f'day_{i}_3')
            entry5 = request.form.get(f'day_{i}_4')
            entry6 = request.form.get(f'day_{i}_5')
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


                data = Availability(id=new_id, user_id=current_user.id, date=new_date, weekday=new_weekday, email=user.email,
                                    start_time=new_entry1, end_time=new_entry2, start_time2=new_entry3,
                                    end_time2=new_entry4, start_time3=new_entry5, end_time3=new_entry6,
                                    created_by=company_id, changed_by=company_id, creation_timestamp = creation_date)


                db.session.add(data)
                db.session.commit()

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

                data = TemplateAvailability(id=new_id, template_name=new_name, date=new_date, weekday=new_weekday, email=user.email,
                                            start_time=new_entry1, end_time=new_entry2, start_time2=new_entry3,
                                            end_time2=new_entry4, start_time3=new_entry5, end_time3=new_entry6,
                                            created_by=company_id, changed_by=company_id, creation_timestamp = creation_date)


                db.session.add(data)
                db.session.commit()



    return render_template('planning.html', template_form=planning_form, monday=monday, weekdays=weekdays,
                           day_num=day_num, temp_dict=temp_dict, company_dict=company_dict)


@app.route('/delete_availability/<int:id>')
def delete_availability(id):
    account = User.query.get(current_user.id)
    user_form = UpdateForm(csrf_enabled=False, obj=account)
    remove = Availability.query.get(id)

    db.session.delete(remove)
    db.session.commit()
    flash('Successful')
    return render_template('user.html', available=Availability.query.filter_by(email=account.email),
                           account=account, template_form=user_form)

@app.route('/delete/<int:id>')
def delete(id):
    data_form = EmployeeForm(csrf_enabled=False)
    remove = User.query.get(id)

    db.session.delete(remove)
    db.session.commit()
    flash('Successful')
    return render_template('/registration.html', template_form=data_form)


    #Admin function
    #-----------------------------------------------------------------


@app.route('/admin', methods = ['GET', 'POST'])
@admin_required
def admin():
    time_form = TimeReqForm(csrf_enbled=False)
    solve_form = SolveForm(csrf_enbled=False)
    Time = TimeReq.query.all()
    creation_date = datetime.datetime.now()
    weekdays = {0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday'}
    today = datetime.date.today()
    monday = today - datetime.timedelta(days=today.weekday())
    day_num = 7
    week_adjustment = session.get('week_adjustment', 0)
    user = User.query.get(current_user.id)
    company_id = current_user.company_id


    timereq_dict = {}
    for i in range(day_num):
        for hour in range(24):
            new_date = monday + datetime.timedelta(days=i)
            time_num = hour * 100
            time = f'{time_num:04d}'
            new_time = datetime.datetime.strptime(time, '%H%M').time()
            temp = TimeReq.query.filter_by(company_name=current_user.company_name, date=new_date, start_time=new_time).first()
            if temp is None:
                pass
            else:
                new_i = i + 1
                timereq_dict[str(new_i) + str(hour)] = temp.worker


    #Prev Week
    if time_form.prev_week.data:
        week_adjustment -=7
        session['week_adjustment'] = week_adjustment

        monday = monday + datetime.timedelta(days=week_adjustment)

        return render_template('admin.html', template_form=time_form, solve_form=solve_form, timedelta=timedelta, monday=monday,
                               Time=Time, weekdays=weekdays, day_num=day_num, timereq_dict=timereq_dict)
    #Next Week
    if time_form.next_week.data:
        week_adjustment +=7
        session['week_adjustment'] = week_adjustment

        monday = monday + datetime.timedelta(days=week_adjustment)

        return render_template('admin.html', template_form=time_form, solve_form=solve_form, timedelta=timedelta, monday=monday,
                               Time=Time, weekdays=weekdays, day_num=day_num, timereq_dict=timereq_dict)
    
    

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

        return render_template('admin.html', template_form=time_form, solve_form=solve_form, timedelta=timedelta, monday=monday,
                               weekdays=weekdays, day_num=day_num, temp_dict=temp_dict, timereq_dict=timereq_dict)

    #Submit the required FTE per hour
    if request.method == 'POST' and 'submit' in request.form:
        for i in range(day_num):
            for hour in range(24):
                capacity = request.form.get(f'worker_{i}_{hour}')
                if capacity:
                    last = TimeReq.query.order_by(TimeReq.id.desc()).first()
                    if last is None:
                        new_id = 1
                    else:
                        new_id = last.id + 1
                    new_date = monday + datetime.timedelta(days=i) + datetime.timedelta(days=week_adjustment)
                    time_num = hour * 100
                    time = f'{time_num:04d}'
                    new_time = datetime.datetime.strptime(time, '%H%M').time()

                    TimeReq.query.filter_by(company_name=current_user.company_name, date=new_date, start_time=new_time).delete()
                    db.session.commit()

                    req = TimeReq(id=new_id, company_name=current_user.company_name, date=new_date, start_time=new_time, worker=capacity, created_by=company_id,
                                  changed_by=company_id, creation_timestamp = creation_date)

                    db.session.add(req)
                    db.session.commit()
        return render_template('admin.html', monday=monday, timedelta=timedelta, day_num=day_num, template_form=time_form, solve_form=solve_form, timereq_dict=timereq_dict)

    # Save templates
    if request.method == 'POST' and 'template' in request.form:
        for i in range(day_num):
            for hour in range(24):

                capacity = request.form.get(f'worker_{i}_{hour}')
                if capacity:
                    last = TemplateTimeRequirement.query.order_by(TemplateTimeRequirement.id.desc()).first()
                    if last is None:
                        new_id = 1
                    else:
                        new_id = last.id + 1
                    new_name = time_form.template_name.data
                    new_date = monday + datetime.timedelta(days=i)
                    time_num = hour * 100
                    time = f'{time_num:04d}'
                    new_time = datetime.datetime.strptime(time, '%H%M').time()
                    new_weekday = weekdays[i]

                    data = TemplateTimeRequirement(id=new_id, template_name=new_name, date=new_date, weekday=new_weekday,
                                                   start_time=new_time, worker=capacity, created_by=company_id,
                                                   changed_by=company_id, creation_timestamp = creation_date)

                    db.session.add(data)
                    db.session.commit()

    

    #Remove entries of single dates
    if request.method == 'POST' and 'remove' in request.form:
        remove_date = time_form.date.data
        remove_date_formatted = remove_date.strftime('%Y-%m-%d')
        remove = TimeReq.query.filter_by(date=remove_date_formatted).all()

        for entry in remove:
            db.session.delete(entry)

        db.session.commit()
        flash('Successful')
        return render_template('admin.html', monday=monday, timedelta=timedelta, day_num=day_num, Time=Time, solve_form=solve_form, template_form=time_form, timereq_dict=timereq_dict)



    # Solve Button, erstellt 13.04.23 von Gery
    if solve_form.solve_button.data:
        from data_processing import DataProcessing
        from or_algorithm import ORAlgorithm
        # Damit der Code threadsafe ist, wird jedesmal eine neue Instanz erstellt pro Anfrage!
        dp = DataProcessing(current_user.id)
        dp.run()
        or_algo = ORAlgorithm(dp)
        or_algo.run()
        return render_template('admin.html', template_form=time_form, timedelta=timedelta, monday=monday,
                               Time=Time, weekdays=weekdays, day_num=day_num, solve_form=solve_form, timereq_dict=timereq_dict)


    return render_template('admin.html', monday=monday, timedelta=timedelta, day_num=day_num, Time=Time, solve_form=solve_form,
                           template_form=time_form, timereq_dict=timereq_dict)





@app.route('/dashboard')
@admin_required
def dashboard():

    return render_template('dashboard.html', data_tag=User.query.all(), open_tag=OpeningHours.query.all())


@app.route('/company', methods = ['GET', 'POST'])
@admin_required
def company_data():
    opening_hour = OpeningHours.query.all()
    creation_date = datetime.datetime.now()
    weekdays = {0:'Monday', 1:'Tuesday', 2:'Wednesday', 3:'Thursday', 4:'Friday', 5:'Saturday', 6:'Sunday'}
    day_num = 7
    company_form = CompanyForm(csrf_enabled = False, obj=opening_hour)
    company_id = current_user.company_id
    company_name = current_user.company_name
    company = Company.query.filter_by(company_name=company_name).first()

    if company is None:
        shift = ''
        weekly_hour = ''
    else:

        shift = company.shifts
        weekly_hour = company.weekly_hours
   

    temp_dict = {}
    for i in range(day_num):
        temp = OpeningHours.query.filter_by(company_name=company_name, weekday=weekdays[i]).first()
        if temp is None:
            pass
        else:
            new_i = i + 1
            temp_dict[str(new_i) + '&0'] = temp.start_time
            temp_dict[str(new_i) + '&1'] = temp.end_time

    #Save Company Data
    if request.method == 'POST':
        OpeningHours.query.filter_by(company_name=current_user.company_name).delete()
        db.session.commit()
        company_no = Company.query.order_by(Company.id.desc()).first()
        if company_no is None:
            new_company_no = 1
        else:
            new_company_no = company_no.id + 1

        company_data = Company(id=new_company_no ,company_name=company_form.company_name.data, weekly_hours=company_form.weekly_hours.data, shifts=company_form.shift.data,
                                created_by=company_id, changed_by=company_id, creation_timestamp = creation_date)
        
        db.session.merge(company_data)
        db.session.commit()

        for i in range(day_num): 
            entry1 = request.form.get(f'day_{i}_0')
            entry2 = request.form.get(f'day_{i}_1')
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


                opening = OpeningHours(id=new_id, company_name=current_user.company_name, weekday=new_weekday, start_time=new_entry1,
                                    end_time=new_entry2, created_by=company_id, changed_by=company_id,
                                    creation_timestamp = creation_date)
                

                db.session.add(opening)
                db.session.commit()


    return render_template('company.html', template_form=company_form, weekdays=weekdays, day_num=day_num, temp_dict=temp_dict, company_name=company_name, shift=shift, weekly_hours=weekly_hour)


@app.route('/invite', methods = ['GET', 'POST'])
@admin_required
def invite():
    data_form = InviteForm(csrf_enabled=False)
    company_id = current_user.company_id
    company = current_user.company_name
    if request.method == 'POST':
        random_token = random.randint(100000,999999)
        last = RegistrationToken.query.order_by(RegistrationToken.id.desc()).first()
        if last is None:
            new_id = 1
        else:
            new_id = last.id + 1

        data = RegistrationToken(id=new_id, email=data_form.email.data, token=random_token, company_name=data_form.company_name.data, department=data_form.department.data, employment=data_form.employment.data, employment_level=data_form.employment_level.data, access_level=data_form.access_level.data, created_by=company_id)

        db.session.add(data)
        db.session.commit()

        msg = Message('Registration Token', recipients=['timetab@gmx.ch'])
        msg.body = f"Hey there SHOW BOOBS, SEND NUDES,\n \n Below you will find your registration token \n \n {random_token}"
        mail.send(msg)
        


    return render_template('invite.html', template_form=data_form, company=company)


# Change/Update content in the database
@app.route('/upgrade_db')
def set_db():
    users = User.query.all()
    for user in users:
        user.employment = "Temp"
    db.session.commit()
    return "Employment column updated successfully."


'''
if __name__ == '__main__':
    app.run(debug=True)
'''


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
    response.set_cookie('session_token', session_token, httponly=True)
    return response


@app.route('/api/users')
def get_data():
    users = User.query.all()
    user_list = []
    for user in users:
        user_dict = {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'company_name': user.company_name,
            'email': user.email,
            'access_level': user.access_level
        }
        user_list.append(user_dict)
    return jsonify(user_list)

@app.route('/api/current_user')
def react_current_user():
    token = request.headers.get('Authorization').split(' ')[1]

    # Perform any necessary validation and decoding of the token

    # Search for the email address associated with the token
    email = search_user_by_token(token)

    if email:
        # Return the email address as a response
        return {'email': email}
    else:
        # Handle the case where the email address is not found
        return {'error': 'Email address not found'}, 404


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


@app.route('/api/registration/admin', methods=['POST'])
def api_admin_registration():
    data = request.json
    creation_date = datetime.datetime.now()
    last = User.query.order_by(User.id.desc()).first()

    if last is None:
        new_id = 1
    else:
        new_id = last.id + 1

    last_company_id = User.query.filter_by(company_name=data['company_name']).order_by(User.company_id.desc()).first()

    if last_company_id is None:
        new_company_id = 10000
    else:
        new_company_id = last_company_id.company_id + 1

    data = User(
        id=new_id,
        company_id=new_company_id,
        first_name=data['first_name'],
        last_name=data['last_name'],
        employment_level=data['employment_level'],
        employment=data['employment'],
        company_name=data['company_name'],
        department=data['department'],
        access_level=data['access_level'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        created_by=new_company_id,
        changed_by=new_company_id,
        creation_timestamp=creation_date
    )

    try:
        db.session.add(data)
        db.session.commit()
        return jsonify({'message': 'Registration successful'})
    
    except:
        db.session.rollback()
        return jsonify({'error': 'Error occurred - Your email might already be in use'})



@app.route('/api/update', methods=["GET", "POST"])
def react_update():
    new_data = User.query.get(current_user.id)
    user_form = UpdateForm(csrf_enabled=False, obj=new_data)
    company_id = User.query.get(current_user.company_id)

    if request.method == 'POST':
        existing_user = User.query.filter_by(id=current_user.id).first()
        if existing_user:
            existing_user.first_name = user_form.first_name.data
            existing_user.last_name = user_form.last_name.data
            existing_user.employment_level = user_form.employment_level.data
            existing_user.company_name = user_form.company_name.data
            existing_user.department = user_form.department.data
            existing_user.access_level = user_form.access_level.data
            existing_user.email = user_form.email.data
            existing_user.changed_by = company_id
            existing_user.update_timestamp = datetime.datetime.now

            db.session.commit()


    return render_template('update.html', data_tag=User.query.all(), account=new_data, template_form=user_form)

@app.route('/api/company', methods=['GET', 'POST'])
def get_company():
    # This has to be updated to the current user once the function is implemented.
    email = react_current_user()
    session['react_mail'] = email
    user = User.query.filter_by(email=email).first()
    print(email)
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
def get_availability():
    # today's date
    user = User.query.filter_by(email="robin.martin@timetab.ch").first()
    today = datetime.date.today()
    creation_date = datetime.datetime.now()
    monday = today - datetime.timedelta(days=today.weekday())
    weekdays = {0:'Monday', 1:'Tuesday', 2:'Wednesday', 3:'Thursday', 4:'Friday', 5:'Saturday', 6:'Sunday'}
    day_num = 7
    week_adjustment = session.get('week_adjustment', 0)
    company_id = user.company_id
    planning_form = PlanningForm(csrf_enabled = False)

    """
    company_dict = {}
    for company in User.query.filter_by(email=user.email).all():
        company_dict[company.company_name] = company
    """      


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

    availability_list = {
        'weekdays': weekdays,
        'day_num': day_num,
        'temp_dict': temp_dict,
    }

    return jsonify(availability_list)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
