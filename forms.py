from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField, PasswordField, IntegerField, RadioField, TimeField, DateField, SelectField
from wtforms.validators import DataRequired, EqualTo

#Create of Forms
#--------------------------------------------------------------------------------

class EmployeeForm(FlaskForm):
    id = IntegerField("Id", validators=[DataRequired()])
    first_name = StringField("First Name", validators=[DataRequired()])
    last_name = StringField("Last Name", validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired()])
    employment = SelectField("Access Level", choices=[('Perm', 'Festangestellt'), ('Temp', 'Teilzeit')])
    employment_level = SelectField("Employment Level", choices=[(1, '100%'), (0.9, '90%'), (0.8, '80%'), (0.7, '70%'),
                                                                (0.6, '60%'), (0.5, '50%'), (0.4, '40%'), (0.3, '30%'),
                                                                (0.2, '20%'), (0.1, '10%')])
    company_name = StringField("Company Name", validators=[DataRequired()])
    department = StringField("Department", validators=[DataRequired()])
    access_level = SelectField("Access Level", choices=[('Admin', 'Admin'), ('User', 'User')])
    password = PasswordField("Password", validators=[DataRequired()])
    password2 = PasswordField("Repeat Password", validators=[DataRequired(), EqualTo('password', message='Passwords must match')])
    remove = IntegerField("Remove")
    submit = SubmitField("Submit")
    update = SubmitField("Update")
    token = IntegerField("Token", validators=[DataRequired()])



class CompanyForm(FlaskForm):
    id = IntegerField("Id", validators=[DataRequired()])
    company_name = StringField("Company Name", validators=[DataRequired()])
    weekly_hours = IntegerField("Weekly Hours", validators=[DataRequired()])
    shift = IntegerField("Shift", validators=[DataRequired()])
    update = SubmitField("Update")



class PlanningForm(FlaskForm):
    id = IntegerField("Id", validators=[DataRequired()])
    days = RadioField('Working Days', choices=[('value', 'Monday'), ('value_two', 'Tuesday'),
                                               ('value_three', 'Wednesday'), ('value_four', 'Thursday'),
                                               ('value_five', 'Friday'), ('value_six', 'Saturday'),
                                               ('value_seven', 'Sunday'),])
    submit = SubmitField('Submit')
    template1 = SubmitField('Template1')
    template2 = SubmitField('Template2')
    template3 = SubmitField('Template 3')
    template_name = StringField('Template Name')
    template = SubmitField('Save Template')
    prev_week = SubmitField('Previous Week')
    next_week = SubmitField('Next Week')



class UpdateForm(FlaskForm):
    first_name = StringField("First Name")
    last_name = StringField("Last Name")
    email = StringField("Email")
    employment = SelectField("Access Level", choices=[('Perm', 'Festangestellt'), ('Temp', 'Teilzeit')])
    employment_level = SelectField("Employment Level", choices=[(1, '100%'), (0.9, '90%'), (0.8, '80%'), (0.7, '70%'),
                                                                (0.6, '60%'), (0.5, '50%'), (0.4, '40%'), (0.3, '30%'),
                                                                (0.2, '20%'), (0.1, '10%')])
    company_name = StringField("Company Name")
    department = StringField("Department")
    access_level = SelectField("Access Level", choices=[('Admin', 'Admin'), ('User', 'User')])
    password = PasswordField("Password")
    password2 = PasswordField("Repeat Password",
                              validators=[EqualTo('password', message='Passwords must match')])
    remove = IntegerField("Remove")
    submit = SubmitField("Submit")
    update = SubmitField("Update")


class TimeReqForm(FlaskForm):
    id = IntegerField("Id", validators=[DataRequired()])
    weeks = RadioField('Weeks', choices=[(1, 1), (2, 2), (3, 3), (4, 4)])
    date = DateField('Date', format='%Y-%m-%d')
    time = TimeField('Time', format='%H:%M')
    worker = IntegerField('FTE')
    submit = SubmitField('Submit')
    remove = SubmitField('Remove')
    template1 = SubmitField('Template1')
    template2 = SubmitField('Template2')
    template3 = SubmitField('Template 3')
    template_name = StringField('Template Name')
    template = SubmitField('Save Template')
    prev_week = SubmitField('Previous Week')
    next_week = SubmitField('Next Week')


class InviteForm(FlaskForm):
    first_name = StringField("First Name", validators=[DataRequired()])
    last_name = StringField("Last Name", validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired()])
    employment_level = SelectField("Employment Level", choices=[(1, '100%'), (0.9, '90%'), (0.8, '80%'), (0.7, '70%'),
                                                                (0.6, '60%'), (0.5, '50%'), (0.4, '40%'), (0.3, '30%'),
                                                                (0.2, '20%'), (0.1, '10%')])
    company_name = StringField("Company Name", validators=[DataRequired()])
    department = StringField("Department", validators=[DataRequired()])
    access_level = SelectField("Access Level", choices=[('Admin', 'Admin'), ('User', 'User')])  
    remove = IntegerField("Remove")
    submit = SubmitField("Submit")
    update = SubmitField("Update")
    token = IntegerField("Token", validators=[DataRequired()])

# Klasse für Forms für Solve Button, erstellt 13.04.23 von Gery
class SolveForm(FlaskForm):
    solve_button = SubmitField('Solve')