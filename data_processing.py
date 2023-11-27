from sqlalchemy import text, case
from datetime import datetime, time, date
from dateutil.relativedelta import relativedelta
from collections import defaultdict
from collections import OrderedDict
from app import app, db, timedelta, get_database_uri
from models import User, Availability, TimeReq, Company, OpeningHours, Timetable, \
    TemplateAvailability, TemplateTimeRequirement, RegistrationToken, PasswordReset, \
    SolverRequirement, SolverAnalysis
from routes_react import get_session
from flask_jwt_extended import get_jwt

class DataProcessing:
    def __init__(self, current_user_email, start_date):
        # Attribute
        self.current_user_email = current_user_email
        self.week_timeframe = None
        self.hour_divider = None
        self.start_date = start_date
        self.end_date = None
        self.opening_hours = None
        self.laden_oeffnet = None
        self.laden_schliesst = None
        self.user_availability = None
        self.user_holidays = None
        self.skills = []
        self.time_req = None
        self.company_shifts = None
        self.employment_lvl = None
        self.user_employment = None
        self.user_skills = None
        self.solver_requirements = None
        self.binary_availability = None
        self.user_names = None
        self.new_employees = None
        session = None

        
        
    def run(self):
        jwt_data = get_jwt()
        session_company = jwt_data.get("company_name").lower().replace(' ', '_')
        uri = get_database_uri('', session_company)
        
        """ Die einzelnen Methoden werden in der Reihe nach ausgeführt """

        with get_session(uri) as session:
            self.solving_period(session)
            self.get_availability(session)
            self.get_opening_hours(session)
            self.get_skills(session)
            self.get_time_req(session)
            self.get_shift_weeklyhours_emp_lvl(session)
            self.binaere_liste()
            self.get_employment_skills(session)
            self.get_solver_requirement(session)
            self.user_name_and_training(session)


    # def load_session(self):
    #     """
    #     In dieser Methode wird eine API SQL definiert
    #     """
    #     jwt_data = get_jwt()
    #     session_company = jwt_data.get("company_name").lower().replace(' ', '_')
    #     session = get_session(get_database_uri('', session_company))
        


    def solving_period(self, session):
        """
        In dieser Methode wird das aktuelle Datum gezogen, anschliessend der nächste Montag gefunden.
        Ebenfalls werden die zwei Werte "week_timeframe" und "hour_divider" aus der Datenbank gezogen.
        """

        # company_name filtern aus der Datenkbank
        user = session.query(User).filter_by(email=self.current_user_email).first()
        company_name = user.company_name

        # week_timeframe und hour_divider filtern aus der Datenkbank
        solver_req = session.query(SolverRequirement).filter_by(company_name=company_name).first()
        self.week_timeframe = solver_req.week_timeframe
        self.hour_divider = solver_req.hour_divider


        # Enddatum basierend auf week_timeframe finden
        self.end_date = self.start_date + relativedelta(weeks=self.week_timeframe) - timedelta(days=1)

        # Formatieren der Datumsangaben als Strings
        self.start_date = self.start_date.strftime("%Y-%m-%d")
        self.end_date = self.end_date.strftime("%Y-%m-%d")

        print("start_date: ", self.start_date)
        print("end_time: ", self.end_date)

        return self.start_date, self.end_date



    def get_availability(self, session):
        """ 
        In dieser Funktion wird user_id, date, start_time, end_time, start_time2, end_time2, start_time3, und end_time3 
        aus der Availability Entität gezogen und in einer Liste gespeichert. -> Ferien werden berücksichtigt!

        Zusätzlich wird ein dict self.user_holidays erstellt, das angbit, welcher User an welchem Tag Ferien hat (Ferien = 1, keine Ferien = 0)
        """

        print(f"Admin mit der Email: {self.current_user_email} hat den Solve Button gedrückt.")

        # company_name filtern aus der Datenbank
        user = session.query(User).filter_by(email=self.current_user_email).first()
        company_name = user.company_name

        # Umwandlung der Datumsstrings in Datumsobjekte für die weitere Verarbeitung
        start_date_obj = datetime.strptime(self.start_date, "%Y-%m-%d").date()
        end_date_obj = datetime.strptime(self.end_date, "%Y-%m-%d").date()

        # Erstellen einer Liste von Tagen im Bereich
        date_range = [start_date_obj + timedelta(days=x) for x in range((end_date_obj - start_date_obj).days + 1)]

        # Sämtliche Emails der Nutzer der aktuellen Firma abrufen
        company_user_emails = session.query(User.email).filter_by(company_name=company_name).all()
        company_user_emails = [user_email for (user_email,) in company_user_emails]  # Umwandlung in eine Liste von IDs

        # Datenbankabfrage, um nur Benutzer (aus der company) mit Einträgen in der Verfügbarkeitstabelle abzurufen
        user_emails_with_availability = session.query(Availability.email).filter(
            Availability.email.in_(company_user_emails),
            Availability.date.between(self.start_date, self.end_date)
        ).distinct().all()

        # Konvertieren von Ergebnissen in eine Liste von IDs
        user_emails = [item[0] for item in user_emails_with_availability]

        user_availability = defaultdict(list)
        self.user_holidays = defaultdict(list)

        # Prüfen, ob jeder Benutzer und jeden Tag im Zeitraum die Verfügbarkeit hat
        for email in user_emails:
            for single_date in date_range:
                # Versuchen, für das aktuelle Datum einen Eintrag zu finden
                availability_entry = session.query(Availability).filter_by(email=email, date=single_date).first()

                # Wenn der Mitarbeiter Ferien hat ("X" in der Spalte holiday), dann wird eine 1 für Ferien gesetzt
                if availability_entry and availability_entry.holiday == "X":
                    times = (None,) * 6  # Keine spezifischen Zeiten, weil Ferien
                    self.user_holidays[email].append((single_date, 1))

                # Wenn keine Ferien eingetragen sind
                elif availability_entry:
                    times = (
                        self.time_to_timedelta(availability_entry.start_time) if availability_entry.start_time else None,
                        self.time_to_timedelta(availability_entry.end_time) if availability_entry.end_time else None,
                        self.time_to_timedelta(availability_entry.start_time2) if availability_entry.start_time2 else None,
                        self.time_to_timedelta(availability_entry.end_time2) if availability_entry.end_time2 else None,
                        self.time_to_timedelta(availability_entry.start_time3) if availability_entry.start_time3 else None,
                        self.time_to_timedelta(availability_entry.end_time3) if availability_entry.end_time3 else None
                    )
                    self.user_holidays[email].append((single_date, 0))
                else:
                    # Wenn kein Eintrag, alles auf None setzen und als Arbeitstag betrachten
                    times = (None,) * 6
                    self.user_holidays[email].append((single_date, 0))

                # Zeiten für das aktuelle Datum dem user_availability-Dict hinzufügen
                user_availability[email].append((single_date, *times))

            # Verfügbarkeiten und Ferien für jeden Benutzer nach Datum sortieren
            user_availability[email] = sorted(user_availability[email], key=lambda x: x[0])
            self.user_holidays[email] = sorted(self.user_holidays[email], key=lambda x: x[0])

        self.user_availability = user_availability



    def time_to_int(self, t):
        # Divisor basierend auf self.hour_divider erzeugen
        divisor = 3600 / self.hour_divider

        # Typ "timedelta"
        if isinstance(t, timedelta):
            total_seconds = t.total_seconds()  # oder t.seconds, je nachdem, welches Verhalten Sie bevorzugen
        # Typ "time"
        elif isinstance(t, time):
            total_seconds = t.hour * 3600 + t.minute * 60 + t.second
        # Typ "int" oder "float" (z.B. zur direkten Eingabe von Sekunden)
        elif isinstance(t, (int, float)):
            total_seconds = t
        else:
            raise ValueError("Invalid input type, must be datetime.timedelta, datetime.time, int or float")
        
        return int(total_seconds / divisor)
    
    def time_to_timedelta(self, t):
        if t is None:
            return timedelta(hours=0, minutes=0, seconds=0)
        return timedelta(hours=t.hour, minutes=t.minute, seconds=t.second)



    def get_opening_hours(self, session):
        """ In dieser Funktion werden die Öffnungszeiten (7 Tage) der jeweiligen Company aus der Datenbank gezogen. """
        
        # company_name filtern aus der Datenkbank
        user = session.query(User).filter_by(email=self.current_user_email).first()
        company_name = user.company_name

        weekday_order = case(
            *[(OpeningHours.weekday == "Montag", 1),
            (OpeningHours.weekday == "Dienstag", 2),
            (OpeningHours.weekday == "Mittwoch", 3),
            (OpeningHours.weekday == "Donnerstag", 4),
            (OpeningHours.weekday == "Freitag", 5),
            (OpeningHours.weekday == "Samstag", 6),
            (OpeningHours.weekday == "Sonntag", 7)]
        )

        opening = session.query(OpeningHours).filter_by(company_name=company_name).order_by(weekday_order).all()

        # Dictionary mit den Öffnungszeiten für einfachere Abfragen
        opening_dict = {record.weekday: record for record in opening}

        # Standardliste von Wochentagen
        weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
        
        # "times" für jeden Wochentag, Werte aus der Datenbank, wenn verfügbar, sonst timedelta(0)
        times = []
        for day in weekdays:
            if day in opening_dict:
                record = opening_dict[day]
                start_time = self.time_to_timedelta(record.start_time)
                end_time = self.time_to_timedelta(record.end_time)
                end_time2 = self.time_to_timedelta(record.end_time2)

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
        self.laden_oeffnet = [None] * 7
        self.laden_schliesst = [None] * 7

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
            self.laden_oeffnet[index] = start_time
            self.laden_schliesst[index] = close_time

        # Berechne die Öffnungszeiten für jeden Wochentag und speichere sie in einer Liste
        self.opening_hours = []
        for i in range(7):
            # Wenn die Schließzeit vor der Öffnungszeit liegt, werden 24 Stunden (86400 Sekunden) zur Schließzeit dazuaddiert
            if self.laden_schliesst[i] < self.laden_oeffnet[i]:
                corrected_close_time = self.laden_schliesst[i] + timedelta(seconds=86400) 
            else:
                corrected_close_time = self.laden_schliesst[i]
            # Berechne die Öffnungszeit als Differenz zwischen der korrigierten Schließzeit und der Öffnungszeit
            self.opening_hours.append(self.time_to_int(corrected_close_time) - self.time_to_int(self.laden_oeffnet[i]))

        self.laden_oeffnet = self.laden_oeffnet * self.week_timeframe
        self.laden_schliesst = self.laden_schliesst * self.week_timeframe
        self.opening_hours = self.opening_hours * self.week_timeframe

        """
        for i in range(7):
            print(f"{i}-ter Tag Laden Öffnet: {self.laden_oeffnet[i]}")
            print(f"{i}-ter Tag Laden Schliesst: {self.laden_schliesst[i]}")
        """
        

    def get_skills(self, session):
        """ In dieser Methode werden sämtliche Skills einer Company in einer Liste gespeichert """

        # company_name filtern aus der Datenkbank
        user = session.query(User).filter_by(email=self.current_user_email).first()
        company_name = user.company_name

        # Die entsprechende Company-Instanz abfragen
        company = session.query(Company).filter_by(company_name=company_name).first()

        # Zugriff auf das erste Department, da deparment nicht mit 1 beginnt
        first_department = getattr(company, 'department')
        if first_department:
            self.skills.append(first_department)
        
        # Die restlichen deparments durchiterieren 
        for i in range(2, 11): 
            department_value = getattr(company, f'department{i}')
            if department_value:  # Wenn department_value nicht leer/null ist
                self.skills.append(department_value)
        


    def get_time_req(self, session):
        """ In dieser Funktion werden die benötigten Mitarbeiter für jede Stunde jedes Tages jedes Skills abgerufen """

        # Holt den company_name aus der Datenbank.
        user = session.query(User).filter_by(email=self.current_user_email).first()
        company_name = user.company_name

        # Abrufen aller TimeReq-Datensätze für das Unternehmen im relevanten Datumsbereich.
        time_reqs = session.query(TimeReq).filter(
            TimeReq.company_name == company_name,
            TimeReq.date.between(self.start_date, self.end_date)
        ).all()

        # Bestimmt den Divisor basierend auf self.hour_divider
        divisor = 3600 / self.hour_divider

        # Verschachteltes Wörterbuch, wobei das äussere Wörterbuch die Daten und das innere die Stunden und Anforderungen pro Skill enthält.
        time_req_dict = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))

        # Hieritteriert man jeden Eintrag von time_reqs der Reihe nach durch
        for record in time_reqs:
            date = record.date
            department = record.department 
            start_time = self.time_to_timedelta(record.start_time)
            worker = record.worker

            weekday_index = date.weekday()

            # Hier prüfen wir, ob die Arbeitszeit nach Mitternacht beginnt. Wenn das zutrifft, gehen wir im index, in der start_time und im Datum einen Tag zurück
            if start_time < self.laden_oeffnet[weekday_index]:
                # Wenn ja, dann beziehen wir uns auf den vorherigen Tag. 
                weekday_index = (weekday_index - 1) % 7  # Modulo 7, um sicherzustellen, dass der Wert innerhalb [0,6] bleibt.
                start_time = start_time + timedelta(seconds=86400)
                date = date - timedelta(days=1)


            # Berechnung der korrigierten Schliesszeit
            if self.laden_schliesst[weekday_index] < self.laden_oeffnet[weekday_index]:
                corrected_close_time = self.laden_schliesst[weekday_index] + timedelta(seconds=86400)
            else:
                corrected_close_time = self.laden_schliesst[weekday_index]

            # Anzahl der Slots berechnen
            hours_open = corrected_close_time - self.laden_oeffnet[weekday_index]
            total_slots = self.time_to_int(hours_open)

            # Prints zu Debugging zwecken:
            # print("weekday_index", weekday_index)
            # print("laden_oeffnet", self.laden_oeffnet[weekday_index])
            # print("start_time", start_time)
            # print("corrected_close_time", corrected_close_time)
            # print("date", date)

            # Wenn die start_time innerhalb von Öffnung und Schliesszeit liegt, wird sie berücksichtigt
            if self.laden_oeffnet[weekday_index] <= start_time < corrected_close_time:
                start_hour = self.time_to_int(start_time - self.laden_oeffnet[weekday_index])

                # Durch alle slots durchitterieren, gebraucht wird nur immer der erste Wert, der Rest wird überschrieben
                for hour_slot in range(start_hour, total_slots):
                    time_req_dict[date][department][hour_slot] = worker 
                    # print(f"Datum {date}, Deparment {department}, Stundenslot {hour_slot}, Worker {worker}")


        # Konvertieren der Start- und Enddatenstrings in datetime.date-Objekte
        current_date = datetime.strptime(self.start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(self.end_date, '%Y-%m-%d').date()

        # Überprüfen, ob für das aktuelle Datum ein Eintrag existiert und ob alle Skills vertreten sind
        while current_date <= end_date:
            if current_date not in time_req_dict:
                for skill in self.skills:
                    time_req_dict[current_date][skill] = {}  # Fügt leere dicts für alle Skills hinzu, wenn das Datum fehlt.
            else:
                # Wenn es bereits Einträge für das aktuelle Datum gibt, prüfen wir, ob alle Skills vorhanden sind.
                for skill in self.skills:
                    if skill not in time_req_dict[current_date]:
                        time_req_dict[current_date][skill] = {}  # Fügt leere dicts für fehlende Skills hinzu.
            current_date += timedelta(days=1)

        # Sortiert das Wörterbuch nach Datum und konvertiert es in ein geordnetes Wörterbuch, um die Reihenfolge beizubehalten
        self.time_req = OrderedDict(sorted(time_req_dict.items()))
 

    def get_shift_weeklyhours_emp_lvl(self, session):
        """ In dieser Funktion wird als Key die emails verwendet und die shift, employment_level und weekly_hours aus der Datenbank gezogen """

        # company_name filtern aus der Datenkbank
        user = session.query(User).filter_by(email=self.current_user_email).first()
        company_name = user.company_name

        # Hole die Schichten und die weekly_hours für die Firma des aktuellen Benutzers in einer einzelnen Abfrage
        company = session.query(Company).filter_by(company_name=company_name).first()
        
        self.company_shifts = company.shifts
        self.weekly_hours = company.weekly_hours

        # Hole das employment_level für jeden Benutzer, der in der gleichen Firma arbeitet wie der aktuelle Benutzer
        users = session.query(User).filter_by(company_name=company_name).all()
        self.employment_lvl = {user.email: user.employment_level for user in users}


    def binaere_liste(self):
        """ In dieser Funktion werden die zuvor erstellten user_availabilities in binäre Listen umgewandelt. """

        self.binary_availability = defaultdict(list)

        for user_id, availabilities in self.user_availability.items():
            for date, st1, et1, st2, et2, st3, et3 in availabilities:
                weekday_index = date.weekday()
                num_hours = self.opening_hours[weekday_index]
                binary_list = [0] * num_hours
                divisor = 3600 / self.hour_divider

                def update_binary_list(start_time, end_time):
                    if start_time is None or end_time is None:
                        return  # Mitarbeiter arbeitet nicht in diesem Zeitfenster

                    # Wenn die Startzeit 0 ist, setzen wir sie auf Mitternacht
                    if start_time.total_seconds() == 0:
                        start_time = timedelta(seconds=0)  # Ab Mitternacht

                    # Wenn die Endzeit 0 ist, setzen wir sie auf Mitternacht
                    if end_time.total_seconds() == 0:
                        end_time = timedelta(seconds=86400)  # Bis Mitternacht

                    if end_time < start_time:
                        end_time += timedelta(seconds=86400)

                    if start_time < self.laden_oeffnet[weekday_index]:
                        start_time += timedelta(seconds=86400)
                        end_time += timedelta(seconds=86400)

                    start_hour = int(start_time.total_seconds() / divisor) - int(self.laden_oeffnet[weekday_index].total_seconds() / divisor)
                    end_hour = int(end_time.total_seconds() / divisor) - int(self.laden_oeffnet[weekday_index].total_seconds() / divisor)

                    if start_hour < 0: start_hour = 0
                    if end_hour > num_hours: end_hour = num_hours

                    for i in range(start_hour, end_hour):
                        if 0 <= i < len(binary_list):
                            binary_list[i] = 1

                update_binary_list(st1, et1)
                update_binary_list(st2, et2)
                update_binary_list(st3, et3)

                self.binary_availability[user_id].append((date, binary_list))


    def get_employment_skills(self, session):
        """ In der folgenden Methode holen wir die Beschäftigung und die Skills jedes Benutzers und fügen sie jeweils in eine Liste ein """

        # company_name filtern aus der Datenkbank
        user = session.query(User).filter_by(email=self.current_user_email).first()
        company_name = user.company_name

        # Hole das employment_level für jeden Benutzer, der in der gleichen Firma arbeitet wie der aktuelle Benutzer
        users = session.query(User).filter_by(company_name=company_name).all()

        # user_employment Dictionarie erstellen mit user_id als Key:
        self.user_employment = defaultdict(str, {user.email: user.employment for user in users})

        # user_skills Dictionary erstellen mit user_id als Key:
        self.user_skills = defaultdict(list) 
        for user in users:
            # Das erste Attribut heisst "department", nicht "department1", also müssen wir es separat behandeln
            first_department = getattr(user, 'department')
            if first_department:  # Füge hinzu, wenn es nicht None oder leer ist
                self.user_skills[user.email].append(first_department)

            # Iteration durch die restlichen "department"-Attribute (von "department2" bis "department10")
            for i in range(2, 11):
                skill = getattr(user, f'department{i}')
                if skill:  # Füge hinzu, wenn es nicht None oder leer ist
                    self.user_skills[user.email].append(skill)


    def get_solver_requirement(self, session):
        """ In dieser Methode werden die Anforderungen des Solvers für das Unternehmen gezogen """

        # company_name filtern aus der Datenkbank
        user = session.query(User).filter_by(email=self.current_user_email).first()
        company_name = user.company_name

        solver_requirement = session.query(SolverRequirement).filter_by(company_name=company_name).first()
        
        self.solver_requirements = {
            'id': solver_requirement.id,
            'company_name': solver_requirement.company_name,
            'weekly_hours': solver_requirement.weekly_hours,
            'shifts': solver_requirement.shifts,
            'desired_min_time_day': solver_requirement.desired_min_time_day,
            'desired_max_time_day': solver_requirement.desired_max_time_day,
            'min_time_day': solver_requirement.min_time_day,
            'max_time_day': solver_requirement.max_time_day,
            'desired_max_time_week': solver_requirement.desired_max_time_week,
            'max_time_week': solver_requirement.max_time_week,
            'hour_divider': solver_requirement.hour_divider,
            'fair_distribution': solver_requirement.fair_distribution,
            'week_timeframe': solver_requirement.week_timeframe,
            'subsequent_workingdays': solver_requirement.subsequent_workingdays,
            'subsequent_workingdays_max': solver_requirement.subsequent_workingdays_max,
            'daily_deployment': solver_requirement.daily_deployment,
            'time_per_deployment': solver_requirement.time_per_deployment,
            'new_fte_per_slot': solver_requirement.new_fte_per_slot,
            'skills_per_day': solver_requirement.skills_per_day,
            'nb1': solver_requirement.nb1,
            'nb2': solver_requirement.nb2,
            'nb3': solver_requirement.nb3,
            'nb4': solver_requirement.nb4,
            'nb5': solver_requirement.nb5,
            'nb6': solver_requirement.nb6,
            'nb7': solver_requirement.nb7,
            'nb8': solver_requirement.nb8,
            'nb9': solver_requirement.nb9,
            'nb10': solver_requirement.nb10,
            'nb11': solver_requirement.nb11,
            'nb12': solver_requirement.nb12,
            'nb13': solver_requirement.nb13,
            'nb14': solver_requirement.nb14,
            'nb15': solver_requirement.nb15,
            'nb16': solver_requirement.nb16,
            'nb17': solver_requirement.nb17,
            'nb18': solver_requirement.nb18,
            'nb19': solver_requirement.nb19,
            'nb20': solver_requirement.nb20
        }


    def user_name_and_training(self, session):
        """ In dieser Funktion werden alle User-Vor- und Nachnamen der Company geholt und in einer Liste gespeichert,
        sowie ein Dictionary erstellt, das angibt, ob ein User in der Einarbeitung ist oder nicht. """

        # Eine Liste mit allen E-Mail-Adressen der User erstellen
        user_emails = [user_email for user_email in self.binary_availability]

        # Liste für alle Vor- und Nachnamen der User
        self.user_names = []
        # Dict für die Angabe, ob ein User neu ist oder nicht
        self.new_employees = {}

        for email in user_emails:
            # User mit bestimmter E-Mail-Adresse aus der Datenbank abrufen
            user = session.query(User).filter_by(email=email).first()

            if user is not None:
                self.user_names.append((user.first_name, user.last_name))

                # 1, wenn user.in_training == 'X' ist, sonst 0
                self.new_employees[email] = 1 if user.in_training == 'X' else 0
            else:
                self.user_names.append((None, None))
                self.new_employees[email] = 0



    # def close_session(self):
    #     """ Session wieder closen """
    #     session.close()