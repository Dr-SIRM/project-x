from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
import datetime

db = SQLAlchemy()

#Create of Database
#-------------------------------------------------------------------------

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, index=True, unique=False)
    first_name = db.Column(db.String(100), index=True, unique=False)
    last_name = db.Column(db.String(100), index=True, unique=False)
    employment = db.Column(db.String(100), index=True, unique=False)
    email = db.Column(db.String(200), index=True, unique=True)
    password = db.Column(db.String(200))
    employment_level = db.Column(db.Float, index=True, unique=False)
    company_name = db.Column(db.String(200), index=True, unique=False)
    department = db.Column(db.String(200), index=True, unique=False)
    access_level = db.Column(db.String(200), index=True, unique=False)
    created_by = db.Column(db.Integer, index=True, unique=False)
    changed_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)


    def __init__(self, id, company_id, first_name, last_name, employment, email, password, employment_level, company_name, department,
                 access_level, created_by, changed_by, creation_timestamp):
        self.id = id
        self.company_id = company_id
        self.first_name = first_name
        self.last_name = last_name
        self.employment = employment
        self.email = email
        self.password = password
        self.employment_level = employment_level
        self.company_name = company_name
        self.department = department
        self.access_level = access_level
        self.created_by = created_by
        self.changed_by = changed_by
        self.creation_timestamp = creation_timestamp



class Availability(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    email = db.Column(db.String(200), index=True, unique=False)
    date = db.Column(db.Date, index=True)
    weekday = db.Column(db.String(200), index=True, unique=False)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    start_time2 = db.Column(db.Time)
    end_time2 = db.Column(db.Time)
    start_time3 = db.Column(db.Time)
    end_time3 = db.Column(db.Time)
    created_by = db.Column(db.Integer, index=True, unique=False)
    changed_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, id, user_id, email, date, weekday, start_time, end_time, start_time2, end_time2, start_time3, end_time3,
                 created_by, changed_by, creation_timestamp):
        self.id = id
        self.user_id = user_id
        self.email = email
        self.date = date
        self.weekday = weekday
        self.start_time = start_time
        self.end_time = end_time
        self.start_time2 = start_time2
        self.end_time2 = end_time2
        self.start_time3 = start_time3
        self.end_time3 = end_time3
        self.created_by = created_by
        self.changed_by = changed_by
        self.creation_timestamp = creation_timestamp



class TimeReq(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(200), index=True, unique=False)
    date = db.Column(db.Date, index=True)
    start_time = db.Column(db.Time)
    worker = db.Column(db.Integer)
    created_by = db.Column(db.Integer, index=True, unique=False)
    changed_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, company_name, id, date, start_time, worker, created_by, changed_by, creation_timestamp):
        self.id = id
        self.company_name = company_name
        self.date = date
        self.start_time = start_time
        self.worker = worker
        self.created_by = created_by
        self.changed_by = changed_by
        self.creation_timestamp = creation_timestamp



class Company(db.Model, UserMixin):
    id = db.Column(db.Integer)
    company_name = db.Column(db.String(200), primary_key=True)
    weekly_hours = db.Column(db.Integer)
    shifts = db.Column(db.Integer)
    created_by = db.Column(db.Integer, index=True, unique=False)
    changed_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, id, company_name, weekly_hours, shifts, created_by, changed_by, creation_timestamp):
        self.id = id
        self.company_name = company_name
        self.weekly_hours = weekly_hours
        self.shifts = shifts
        self.created_by = created_by
        self.changed_by = changed_by
        self.creation_timestamp = creation_timestamp



class OpeningHours(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(200), index=True, unique=False)
    weekday = db.Column(db.String(200), index=True, unique=False)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    created_by = db.Column(db.Integer, index=True, unique=False)
    changed_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, id, company_name, weekday, start_time, end_time, created_by, changed_by, creation_timestamp):
        self.id = id
        self.company_name = company_name
        self.weekday = weekday
        self.start_time = start_time
        self.end_time = end_time
        self.created_by = created_by
        self.changed_by = changed_by
        self.creation_timestamp = creation_timestamp



class Timetable(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(200), index=True, unique=False)
    first_name = db.Column(db.String(100), index=True, unique=False)
    last_name = db.Column(db.String(100), index=True, unique=False)
    date = db.Column(db.Date, index=True)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    start_time2 = db.Column(db.Time)
    end_time2 = db.Column(db.Time)
    start_time3 = db.Column(db.Time)
    end_time3 = db.Column(db.Time)
    created_by = db.Column(db.Integer, index=True, unique=False)
    changed_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)


    def __init__(self, id, email, first_name, last_name, date, start_time, end_time, start_time2, end_time2,
                 start_time3, end_time3, created_by, changed_by, creation_timestamp):
        self.id = id
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.date = date
        self.start_time = start_time
        self.end_time = end_time
        self.start_time2 = start_time2
        self.end_time2 = end_time2
        self.start_time3 = start_time3
        self.end_time3 = end_time3
        self.created_by = created_by
        self.changed_by = changed_by
        self.creation_timestamp = creation_timestamp



class TemplateTimeRequirement(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    template_name = db.Column(db.String(200), index=True, unique=False)
    date = db.Column(db.Date, index=True)
    weekday = db.Column(db.String(200), index=True, unique=False)
    start_time = db.Column(db.Time)
    worker = db.Column(db.Integer)
    created_by = db.Column(db.Integer, index=True, unique=False)
    changed_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, id, template_name, date, weekday, start_time, worker, created_by, changed_by, creation_timestamp):
        self.id = id
        self.template_name = template_name
        self.date = date
        self.weekday = weekday
        self.start_time = start_time
        self.worker = worker
        self.created_by = created_by
        self.changed_by = changed_by
        self.creation_timestamp = creation_timestamp



class TemplateAvailability(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    template_name = db.Column(db.String(200), index=True, unique=False)
    email = db.Column(db.String(200), index=True, unique=False)
    date = db.Column(db.Date, index=True)
    weekday = db.Column(db.String(200), index=True, unique=False)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    start_time2 = db.Column(db.Time)
    end_time2 = db.Column(db.Time)
    start_time3 = db.Column(db.Time)
    end_time3 = db.Column(db.Time)
    created_by = db.Column(db.Integer, index=True, unique=False)
    changed_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, id, template_name, email, date, weekday, start_time, end_time, start_time2, end_time2,
                 start_time3, end_time3, created_by, changed_by, creation_timestamp):
        self.id = id
        self.template_name = template_name
        self.email = email
        self.date = date
        self.weekday = weekday
        self.start_time = start_time
        self.end_time = end_time
        self.start_time2 = start_time2
        self.end_time2 = end_time2
        self.start_time3 = start_time3
        self.end_time3 = end_time3
        self.created_by = created_by
        self.changed_by = changed_by
        self.creation_timestamp = creation_timestamp



class RegistrationToken(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(200), index=True, unique=False)
    token = db.Column(db.String(6), index=True, unique=False)
    company_name = db.Column(db.String(200), index=True, unique=False)
    employment_level = db.Column(db.Float, index=True, unique=False)
    department = db.Column(db.String(200), index=True, unique=False)
    access_level = db.Column(db.String(200), index=True, unique=False)
    created_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, id, email, token, company_name, employment_level, department, access_level, created_by):
        self.id = id
        self.email = email
        self.token = token
        self.company_name = company_name
        self.employment_level = employment_level
        self.department = department
        self.access_level = access_level
        self.created_by = created_by



class PasswordReset(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(200), index=True, unique=False)
    token = db.Column(db.String(6), index=True, unique=False)
    expiration = db.Column(db.DateTime, default=datetime.datetime.now() + datetime.timedelta(hours=24))
    creation_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, id, email, token):
        self.id = id
        self.email = email
        self.token = token