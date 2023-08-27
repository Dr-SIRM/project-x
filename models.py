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
    start_time2 = db.Column(db.Time)
    end_time2 = db.Column(db.Time)
    created_by = db.Column(db.Integer, index=True, unique=False)
    changed_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, id, company_name, weekday, start_time, end_time, start_time2, end_time2,created_by, changed_by, creation_timestamp):
        self.id = id
        self.company_name = company_name
        self.weekday = weekday
        self.start_time = start_time
        self.end_time = end_time
        self.start_time2 = start_time2
        self.end_time2 = end_time2
        self.created_by = created_by
        self.changed_by = changed_by
        self.creation_timestamp = creation_timestamp



class Timetable(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(200), index=True, unique=False)
    first_name = db.Column(db.String(100), index=True, unique=False)
    last_name = db.Column(db.String(100), index=True, unique=False)
    company_name = db.Column(db.String(200), index=True, unique=False)
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
                 start_time3, end_time3, created_by, changed_by, creation_timestamp, company_name):
        self.id = id
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.company_name = company_name
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
    employment = db.Column(db.String(200), index=True, unique=False)
    employment_level = db.Column(db.Float, index=True, unique=False)
    department = db.Column(db.String(200), index=True, unique=False)
    access_level = db.Column(db.String(200), index=True, unique=False)
    created_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, id, email, token, company_name, employment, employment_level, department, access_level, created_by):
        self.id = id
        self.email = email
        self.token = token
        self.company_name = company_name
        self.employment = employment
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



class SolverRequirement(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(200), index=True, unique=False)
    weekly_hours = db.Column(db.Integer)
    shifts = db.Column(db.Integer)
    desired_min_time_day = db.Column(db.Integer, index=True, unique=False)
    desired_max_time_day = db.Column(db.Integer, index=True, unique=False)
    min_time_day = db.Column(db.Integer, index=True, unique=False)
    max_time_day = db.Column(db.Integer, index=True, unique=False)
    desired_max_time_week = db.Column(db.Integer, index=True, unique=False)
    max_time_week = db.Column(db.Integer, index=True, unique=False)
    hour_devider = db.Column(db.Integer, index=True, unique=False)
    fair_distribution = db.Column(db.Integer, index=True, unique=False)
    week_timeframe = db.Column(db.Integer, index=True, unique=False)

    nb1 = db.Column(db.Integer, index=True, unique=False)
    nb2 = db.Column(db.Integer, index=True, unique=False)
    nb3 = db.Column(db.Integer, index=True, unique=False)
    nb4 = db.Column(db.Integer, index=True, unique=False)
    nb5 = db.Column(db.Integer, index=True, unique=False)
    nb6 = db.Column(db.Integer, index=True, unique=False)
    nb7 = db.Column(db.Integer, index=True, unique=False)
    nb8 = db.Column(db.Integer, index=True, unique=False)
    nb9 = db.Column(db.Integer, index=True, unique=False)
    nb10 = db.Column(db.Integer, index=True, unique=False)
    nb11 = db.Column(db.Integer, index=True, unique=False)
    nb12 = db.Column(db.Integer, index=True, unique=False)
    nb13 = db.Column(db.Integer, index=True, unique=False)
    nb14 = db.Column(db.Integer, index=True, unique=False)
    nb15 = db.Column(db.Integer, index=True, unique=False)
    nb16 = db.Column(db.Integer, index=True, unique=False)
    nb17 = db.Column(db.Integer, index=True, unique=False)
    nb18 = db.Column(db.Integer, index=True, unique=False)
    nb19 = db.Column(db.Integer, index=True, unique=False)
    nb20 = db.Column(db.Integer, index=True, unique=False)

    created_by = db.Column(db.Integer, index=True, unique=False)
    changed_by = db.Column(db.Integer, index=True, unique=False)
    creation_timestamp = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime, default=datetime.datetime.now)


    def __init__(self, id, company_name, weekly_hours, shifts, desired_min_time_day, desired_max_time_day, 
                 min_time_day, max_time_day, desired_max_time_week, max_time_week, hour_devider, 
                 fair_distribution, week_timeframe, nb1, nb2, nb3, nb4, nb5, nb6, nb7, nb8, nb9, nb10, 
                 nb11, nb12, nb13, nb14, nb15, nb16, nb17, nb18, nb19, nb20, created_by, changed_by, 
                 creation_timestamp, update_timestamp):
        self.id = id
        self.company_name = company_name
        self.weekly_hours = weekly_hours
        self.shifts = shifts
        self.desired_min_time_day = desired_min_time_day
        self.desired_max_time_day = desired_max_time_day
        self.min_time_day = min_time_day
        self.max_time_day = max_time_day
        self.desired_max_time_week = desired_max_time_week
        self.max_time_week = max_time_week
        self.hour_devider = hour_devider
        self.fair_distribution = fair_distribution
        self.week_timeframe = week_timeframe

        self.nb1 = nb1
        self.nb2 = nb2
        self.nb3 = nb3
        self.nb4 = nb4
        self.nb5 = nb5
        self.nb6 = nb6
        self.nb7 = nb7
        self.nb8 = nb8
        self.nb9 = nb9
        self.nb10 = nb10
        self.nb11 = nb11
        self.nb12 = nb12
        self.nb13 = nb13
        self.nb14 = nb14
        self.nb15 = nb15
        self.nb16 = nb16
        self.nb17 = nb17
        self.nb18 = nb18
        self.nb19 = nb19
        self.nb20 = nb20

        self.created_by = created_by
        self.changed_by = changed_by
        self.creation_timestamp = creation_timestamp
        self.update_timestamp = update_timestamp


class SolverAnalysis(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usecase = db.Column(db.String(30))
    self_current_user_id = db.Column(db.Text)
    self_user_availability = db.Column(db.Text)
    self_opening_hours = db.Column(db.Text)
    self_laden_oeffnet = db.Column(db.Text)
    self_laden_schliesst = db.Column(db.Text)
    self_binary_availability = db.Column(db.Text)
    self_company_shifts = db.Column(db.Text)
    self_weekly_hours = db.Column(db.Text)
    self_employment_lvl = db.Column(db.Text)
    self_time_req = db.Column(db.Text)
    self_user_employment = db.Column(db.Text)
    self_solver_requirements = db.Column(db.Text)
    self_week_timeframe = db.Column(db.Text)
    self_hour_devider = db.Column(db.Text)
    self_mitarbeiter = db.Column(db.Text)
    self_verfügbarkeit = db.Column(db.Text)
    self_kosten = db.Column(db.Text)
    self_max_zeit = db.Column(db.Text)
    self_min_zeit = db.Column(db.Text)
    self_max_time_week = db.Column(db.Text)
    self_calc_time = db.Column(db.Text)
    self_employment_lvl_exact = db.Column(db.Text)
    self_employment = db.Column(db.Text)
    self_verteilbare_stunden = db.Column(db.Text)
    self_gesamtstunden_verfügbarkeit = db.Column(db.Text)
    self_min_anwesend = db.Column(db.Text)
    self_gerechte_verteilung = db.Column(db.Text)
    self_fair_distribution = db.Column(db.Text)
    solving_time = db.Column(db.Integer)
    lp_iteration = db.Column(db.Integer)
    violation_nb1 = db.Column(db.Integer)
    violation_nb2 = db.Column(db.Integer)
    violation_nb3 = db.Column(db.Integer)
    violation_nb4 = db.Column(db.Integer)
    violation_nb5 = db.Column(db.Integer)
    violation_nb6 = db.Column(db.Integer)
    violation_nb7 = db.Column(db.Integer)
    violation_nb8 = db.Column(db.Integer)
    violation_nb9 = db.Column(db.Integer)
    violation_nb10 = db.Column(db.Integer)
    violation_nb11 = db.Column(db.Integer)
    violation_nb12 = db.Column(db.Integer)
    violation_nb13 = db.Column(db.Integer)
    violation_nb14 = db.Column(db.Integer)
    violation_nb15 = db.Column(db.Integer)
    violation_nb16 = db.Column(db.Integer)
    violation_nb17 = db.Column(db.Integer)
    violation_nb18 = db.Column(db.Integer)
    violation_nb19 = db.Column(db.Integer)
    violation_nb20 = db.Column(db.Integer)
    possible_solution = db.Column(db.Integer)
    gap_016 = db.Column(db.Integer)
    gap_05 = db.Column(db.Integer)
    gap_1 = db.Column(db.Integer)
    gap_2 = db.Column(db.Integer)
    gap_3 = db.Column(db.Integer)
    gap_4 = db.Column(db.Integer)
    gap_5 = db.Column(db.Integer)
    gap_10 = db.Column(db.Integer)
    gap_20 = db.Column(db.Integer)
    gap_30 = db.Column(db.Integer)
    memory = db.Column(db.String(15))



    def __init__(self_current_user_id, self_user_availability, self_opening_hours, self_laden_oeffnet, 
                 self_laden_schliesst, self_binary_availability, self_company_shifts, self_weekly_hours, 
                 self_employment_lvl, self_time_req, self_user_employment, self_solver_requirements, 
                 self_week_timeframe, self_hour_devider, self_mitarbeiter, self_verfügbarkeit, self_kosten, 
                 self_max_zeit, self_min_zeit, self_max_time_week, self_calc_time, 
                 self_employment_lvl_exact, self_employment, self_verteilbare_stunden, 
                 self_gesamtstunden_verfügbarkeit, self_min_anwesend, self_gerechte_verteilung, 
                 self_fair_distribution, solving_time, lp_iteration, violation_nb1, violation_nb2, violation_nb3, 
                 violation_nb4, violation_nb5, violation_nb6, violation_nb7, violation_nb8, violation_nb9, 
                 violation_nb10, violation_nb11, violation_nb12, violation_nb13, violation_nb14, violation_nb15, 
                 violation_nb16, violation_nb17, violation_nb18, violation_nb19, violation_nb20, 
                 possible_solution, gap_016, gap_05, gap_1, gap_2, gap_3, gap_4, gap_5, gap_10, gap_20, gap_30, 
                 memory):

        self.self_current_user_id = self_current_user_id
        self.self_user_availability = self_user_availability
        self.self_opening_hours = self_opening_hours
        self.self_laden_oeffnet = self_laden_oeffnet
        self.self_laden_schliesst = self_laden_schliesst
        self.self_binary_availability = self_binary_availability
        self.self_company_shifts = self_company_shifts
        self.self_weekly_hours = self_weekly_hours
        self.self_employment_lvl = self_employment_lvl
        self.self_time_req = self_time_req
        self.self_user_employment = self_user_employment
        self.self_solver_requirements = self_solver_requirements
        self.self_week_timeframe = self_week_timeframe
        self.self_hour_devider = self_hour_devider
        self.self_mitarbeiter = self_mitarbeiter
        self.self_verfügbarkeit = self_verfügbarkeit
        self.self_kosten = self_kosten
        self.self_max_zeit = self_max_zeit
        self.self_min_zeit = self_min_zeit
        self.self_max_time_week = self_max_time_week
        self.self_calc_time = self_calc_time
        self.self_employment_lvl_exact = self_employment_lvl_exact
        self.self_employment = self_employment
        self.self_verteilbare_stunden = self_verteilbare_stunden
        self.self_gesamtstunden_verfügbarkeit = self_gesamtstunden_verfügbarkeit
        self.self_min_anwesend = self_min_anwesend
        self.self_gerechte_verteilung = self_gerechte_verteilung
        self.self_fair_distribution = self_fair_distribution
        self.solving_time = solving_time
        self.lp_iteration = lp_iteration
        self.violation_nb1 = violation_nb1
        self.violation_nb2 = violation_nb2
        self.violation_nb3 = violation_nb3
        self.violation_nb4 = violation_nb4
        self.violation_nb5 = violation_nb5
        self.violation_nb6 = violation_nb6
        self.violation_nb7 = violation_nb7
        self.violation_nb8 = violation_nb8
        self.violation_nb9 = violation_nb9
        self.violation_nb10 = violation_nb10
        self.violation_nb11 = violation_nb11
        self.violation_nb12 = violation_nb12
        self.violation_nb13 = violation_nb13
        self.violation_nb14 = violation_nb14
        self.violation_nb15 = violation_nb15
        self.violation_nb16 = violation_nb16
        self.violation_nb17 = violation_nb17
        self.violation_nb18 = violation_nb18
        self.violation_nb19 = violation_nb19
        self.violation_nb20 = violation_nb20
        self.possible_solution = possible_solution
        self.gap_016 = gap_016
        self.gap_05 = gap_05
        self.gap_1 = gap_1
        self.gap_2 = gap_2
        self.gap_3 = gap_3
        self.gap_4 = gap_4
        self.gap_5 = gap_5
        self.gap_10 = gap_10
        self.gap_20 = gap_20
        self.gap_30 = gap_30
        self.memory = memory


















    
