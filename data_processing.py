from sqlalchemy import text, case
from datetime import datetime, time
from dateutil.relativedelta import relativedelta
from collections import defaultdict
from collections import OrderedDict
from app import app, db, timedelta
from models import User, Availability, TimeReq, Company, OpeningHours, Timetable, \
    TemplateAvailability, TemplateTimeRequirement, RegistrationToken, PasswordReset, \
    SolverRequirement, SolverAnalysis


class DataProcessing:
    def __init__(self, current_user_id):
        # Attribute
        self.current_user_id = current_user_id
        self.week_timeframe = None
        self.hour_devider = None
        self.start_date = None
        self.end_date = None
        self.opening_hours = None
        self.laden_oeffnet = None
        self.laden_schliesst = None
        self.user_availability = None
        self.time_req = None
        self.company_shifts = None
        self.employment_lvl = None
        self.user_employment = None
        self.solver_requirements = None
        self.binary_availability = None
        self.user_names = None

        
        
    def run(self):
        """ Die einzelnen Methoden werden in der Reihe nach ausgeführt """
        self.solving_period()
        self.get_availability()
        self.get_opening_hours()
        self.get_time_req()
        self.get_shift_weeklyhours_emp_lvl()
        self.binaere_liste()
        self.get_employment()
        self.get_solver_requirement()
        self.user_name_list()


    def solving_period(self):
        """
        In dieser Methode wird das aktuelle Datum gezogen, anschliessend der nächste Montag gefunden.
        Ebenfalls werden die zwei Werte "week_timeframe" und "hour_devider" aus der Datenbank gezogen.
        """

        # company_name filtern aus der Datenkbank
        user = User.query.filter_by(id=self.current_user_id).first()
        company_name = user.company_name

        # week_timeframe und hour_devider filtern aus der Datenkbank
        solver_req = SolverRequirement.query.filter_by(company_name=company_name).first()
        self.week_timeframe = solver_req.week_timeframe
        self.hour_devider = solver_req.hour_devider

        # Holen Sie sich das heutige Datum
        today = datetime.today()

        # Finden Sie den nächsten Montag
        # next_monday = today + timedelta(days=(0-today.weekday() + 7) % 7)
        next_monday = today + timedelta(days=-today.weekday(), weeks=1)

        # Berechnen Sie das Enddatum basierend auf week_timeframe
        if self.week_timeframe == 1:
            self.end_date = next_monday + relativedelta(weeks=1) - timedelta(days=1)
        elif self.week_timeframe == 2:
            self.end_date = next_monday + relativedelta(weeks=2) - timedelta(days=1)
        elif self.week_timeframe == 4:
            self.end_date = next_monday + relativedelta(weeks=4) - timedelta(days=1)
        else:
            raise ValueError("Invalid value for week_timeframe.")
        
        self.start_date = next_monday.strftime("%Y-%m-%d")
        self.end_date = self.end_date.strftime("%Y-%m-%d")

        # Zeitraum selbst manipulieren
        # self.start_date = "2023-08-07"
        # self.end_date = "2023-08-13"

        print(self.start_date)
        print(self.end_date)

        return self.start_date, self.end_date



    def get_availability(self):
        """ In dieser Funktion wird user_id, date, start_time, end_time,
        start_time2, end_time2, start_time3, und end_time3 aus der
        Availability Entität gezogen und in einer Liste gespeichert.
        Key ist user_id """

        print(f"Admin mit der User_id: {self.current_user_id} hat den Solve Button gedrückt.")

        # company_name filtern aus der Datenkbank
        user = User.query.filter_by(id=self.current_user_id).first()
        company_name = user.company_name

        users = User.query.filter_by(company_name=company_name).all()
        user_ids = [user.id for user in users]

        availability = Availability.query.filter(
            Availability.user_id.in_(user_ids),
            Availability.date.between(self.start_date, self.end_date)
        ).all()

        times = [(record.user_id, record.date,
              self.time_to_timedelta(record.start_time), self.time_to_timedelta(record.end_time),
              self.time_to_timedelta(record.start_time2), self.time_to_timedelta(record.end_time2),
              self.time_to_timedelta(record.start_time3), self.time_to_timedelta(record.end_time3))
             for record in availability]

        user_availability = defaultdict(list)
        for user_id, date, st1, et1, st2, et2, st3, et3 in times:
            user_availability[user_id].append((date, st1, et1, st2, et2, st3, et3))

        for user_id, availabilities in user_availability.items():
            user_availability[user_id] = sorted(availabilities, key=lambda x: x[0])

        self.user_availability = user_availability



    def time_to_int(self, t):
        # Divisor basierend auf self.hour_devider erzeugen
        divisor = 3600 / self.hour_devider

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



    def get_opening_hours(self):
        """ In dieser Funktion werden die Öffnungszeiten (7 Tage) der jeweiligen Company aus der Datenbank gezogen. """
        
        # company_name filtern aus der Datenkbank
        user = User.query.filter_by(id=self.current_user_id).first()
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

        opening = OpeningHours.query.filter_by(company_name=company_name).order_by(weekday_order).all()

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

        

    def get_time_req(self):
        """ In dieser Funktion werden die benötigten Mitarbeiter für jede Stunde jedes Tages abgerufen """

        # company_name filtern aus der Datenkbank
        user = User.query.filter_by(id=self.current_user_id).first()
        company_name = user.company_name

        # Anforderungen für das Unternehmen mit demselben company_name abrufen
        time_reqs = TimeReq.query.filter(
            TimeReq.company_name == company_name,
            TimeReq.date.between(self.start_date, self.end_date)
        ).all()

        # Bestimme den Divisor basierend auf self.hour_devider
        divisor = 3600 / self.hour_devider
        
        # Erstellen eines Dictionaries mit Datum und Stunde als Schlüssel:
        time_req_dict_2 = defaultdict(dict)
        for record in time_reqs:
            date = record.date
            start_time = self.time_to_timedelta(record.start_time)
            worker = record.worker
            
            weekday_index = date.weekday()
            
            # Prüfen, ob die Öffnungszeit am selben Tag bleibt oder in den nächsten Tag übergeht
            if self.laden_schliesst[weekday_index] < self.laden_oeffnet[weekday_index]:
                corrected_close_time = self.laden_schliesst[weekday_index] + timedelta(seconds=86400)
            else:
                corrected_close_time = self.laden_schliesst[weekday_index]

            # Wenn die Schicht während der Öffnungszeiten stattfindet
            if (self.laden_oeffnet[weekday_index] <= start_time < corrected_close_time):
                start_hour = int(start_time.total_seconds() // divisor) - int(self.laden_oeffnet[weekday_index].total_seconds() // divisor)
                if start_hour < 0:
                    start_hour = 0
                time_req_dict_2[date][start_hour] = worker
                
        # Umwandeln des Strings in ein datetime.date-Objekt
        current_date = datetime.strptime(self.start_date, '%Y-%m-%d').date()
        
        # Füge fehlende Tage hinzu
        while current_date <= datetime.strptime(self.end_date, '%Y-%m-%d').date():
            if current_date not in time_req_dict_2:
                time_req_dict_2[current_date] = {}
            current_date += timedelta(days=1)
        
        # Sortiere das Wörterbuch nach Datum
        self.time_req = OrderedDict(sorted(time_req_dict_2.items()))
        print("TIME REQ:", self.time_req)



    def get_shift_weeklyhours_emp_lvl(self):
        """ In dieser Funktion wird als Key die user_id verwendet und die shift, employment_level und weekly_hours aus der Datenbank gezogen """

        # company_name filtern aus der Datenkbank
        user = User.query.get(self.current_user_id)
        company_name = user.company_name

        # Hole die Schichten und die weekly_hours für die Firma des aktuellen Benutzers in einer einzelnen Abfrage
        company = Company.query.filter_by(company_name=company_name).first()
        
        self.company_shifts = company.shifts
        self.weekly_hours = company.weekly_hours

        # Hole das employment_level für jeden Benutzer, der in der gleichen Firma arbeitet wie der aktuelle Benutzer
        users = User.query.filter_by(company_name=company_name).all()
        self.employment_lvl = {user.id: user.employment_level for user in users}



    def binaere_liste(self):
        """ In dieser Funktion werden die zuvor erstellten user_availabilities in binäre Listen umgewandelt. """

        # Generiert automatisch einen Standardwert für nicht vorhandene Schlüssel.
        binary_availability = defaultdict(list)

        for user_id, availabilities in self.user_availability.items():
            for date, st1, et1, st2, et2, st3, et3 in availabilities:
                # Wochentag als Index (0 = Montag, 1 = Dienstag, usw.) erhalten
                weekday_index = date.weekday()

                # Anzahl der Stunden berechnen, in denen der Laden geöffnet ist
                num_hours = self.opening_hours[weekday_index]

                # Liste erstellen von Nullen mit der Länge der Anzahl der Stunden, in denen der Laden geöffnet ist
                binary_list = [0] * num_hours

                # Bestimme den Divisor basierend auf self.hour_devider
                divisor = 3600 / self.hour_devider

                # Eine Hilfsfunktion, um die Binärliste für verschiedene Zeitspannen zu aktualisieren.
                def update_binary_list(start_time, end_time):
                    # Wenn die Endzeit vor der Startzeit liegt, füge 24 Stunden zur Endzeit hinzu.
                    if end_time < start_time:
                        end_time += timedelta(seconds=86400)
                    
                    # Behandlung der Zeiten, die über Mitternacht hinausgehen
                    if start_time < self.laden_oeffnet[weekday_index]:
                        start_time += timedelta(seconds=86400)
                        end_time += timedelta(seconds=86400)

                    # Berechne die Stundenindizes für Start- und Endzeit.
                    start_hour = int(start_time.total_seconds() / divisor) - int(self.laden_oeffnet[weekday_index].total_seconds() / divisor)
                    end_hour = int(end_time.total_seconds() / divisor) - int(self.laden_oeffnet[weekday_index].total_seconds() / divisor)

                    """
                    if user_id == 129:
                        print(f"\nDebugging for user_id {user_id}, date {date}:")
                        print(f"    time window: {start_time} to {end_time}")
                        print(f"    start_time.total_seconds(): {start_time.total_seconds()}")
                        print(f"    end_time.total_seconds(): {end_time.total_seconds()}")
                        print(f"    divisor: {divisor}")
                        print(f"    self.laden_oeffnet[{weekday_index}].total_seconds(): {self.laden_oeffnet[weekday_index].total_seconds()}")
                        print(f"    Calculated start_hour: {start_hour}")
                        print(f"    Calculated end_hour: {end_hour}")
                    """

                    # Überprüfung und Korrektur von Zeiten, die außerhalb der Geschäftszeiten liegen.
                    if start_hour < 0: start_hour = 0
                    if end_hour > num_hours: end_hour = num_hours

                    # Aktualisiere die Binärliste.
                    for i in range(start_hour, end_hour):
                        if 0 <= i < len(binary_list):
                            binary_list[i] = 1


                # Werte werden auf 1 gesetzt, wenn der Mitarbeiter während jedes Zeitfensters arbeiten kann.
                update_binary_list(st1, et1)
                update_binary_list(st2, et2)
                update_binary_list(st3, et3)

                binary_availability[user_id].append((date, binary_list))

        self.binary_availability = binary_availability



    def get_employment(self):
        """ In der folgenden Methode holen wir die Beschäftigung jedes Benutzers und fügen sie in eine Liste ein """

        # company_name filtern aus der Datenkbank
        user = User.query.get(self.current_user_id)
        company_name = user.company_name

        # Hole das employment_level für jeden Benutzer, der in der gleichen Firma arbeitet wie der aktuelle Benutzer
        users = User.query.filter_by(company_name=company_name).all()

        # Dictionarie erstellen mit user_id als Key:
        self.user_employment = defaultdict(str, {user.id: user.employment for user in users})




    def get_solver_requirement(self):
        """ In dieser Methode werden die Anforderungen des Solvers für das Unternehmen gezogen """

        # company_name filtern aus der Datenkbank
        user = User.query.get(self.current_user_id)
        company_name = user.company_name

        solver_requirement = SolverRequirement.query.filter_by(company_name=company_name).first()
        
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
            'hour_devider': solver_requirement.hour_devider,
            'fair_distribution': solver_requirement.fair_distribution,
            'week_timeframe': solver_requirement.week_timeframe,
            'subsequent_workingdays': solver_requirement.subsequent_workingdays,
            'daily_deployment': solver_requirement.daily_deployment,
            'time_per_deployment': solver_requirement.time_per_deployment,
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


    def user_name_list(self):
        """ In dieser Funktion werden alle user Vor- und Nachnamen der company geozgen und in einer Liste gespeichert """

        # Eine Liste mit allen ids der user erstellen (Reihenfolge gleich wie später)
        user_ids = [user_id for user_id in self.binary_availability]

        # Liste für alle Vor- und Nachnamen der User
        self.user_names = []

        for user_id in user_ids:
            # user mit bestimmter ID aus der Datenbank abrufen
            user = User.query.filter_by(id=user_id).first()
            
            # Überprüfen, ob ein Benutzer gefunden wurde
            if user is not None:
                self.user_names.append((user.first_name, user.last_name))
            else:
                self.user_names.append((None, None))