from sqlalchemy import text, case
from datetime import datetime, time, date
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

        
        
    def run(self):
        """ Die einzelnen Methoden werden in der Reihe nach ausgeführt """
        self.solving_period()
        self.get_availability()
        self.get_opening_hours()
        self.get_skills()
        self.get_time_req()
        self.get_shift_weeklyhours_emp_lvl()
        self.binaere_liste()
        self.get_employment_skills()
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
        """ 
        In dieser Funktion wird user_id, date, start_time, end_time, start_time2, end_time2, start_time3, und end_time3 
        aus der Availability Entität gezogen und in einer Liste gespeichert. -> Ferien werden berücksichtigt!

        Zusätzlich wird ein dict self.user_holidays erstellt, das angbit, welcher User an welchem Tag Ferien hat (Ferien = 1, keine Ferien = 0)
        """

        print(f"Admin mit der User_id: {self.current_user_id} hat den Solve Button gedrückt.")

        # company_name filtern aus der Datenbank
        user = User.query.filter_by(id=self.current_user_id).first()
        company_name = user.company_name

        # Umwandlung der Datumsstrings in Datumsobjekte für die weitere Verarbeitung
        start_date_obj = datetime.strptime(self.start_date, "%Y-%m-%d").date()
        end_date_obj = datetime.strptime(self.end_date, "%Y-%m-%d").date()

        # Erstellen einer Liste von Tagen im Bereich
        date_range = [start_date_obj + timedelta(days=x) for x in range((end_date_obj - start_date_obj).days + 1)]

        # Sämtliche IDs der Nutzer der aktuellen Firma abrufen
        company_user_ids = db.session.query(User.id).filter_by(company_name=company_name).all()
        company_user_ids = [user_id for (user_id,) in company_user_ids]  # Umwandlung in eine Liste von IDs

        # Datenbankabfrage, um nur Benutzer (aus der company) mit Einträgen in der Verfügbarkeitstabelle abzurufen
        user_ids_with_availability = db.session.query(Availability.user_id).filter(
            Availability.user_id.in_(company_user_ids),
            Availability.date.between(self.start_date, self.end_date)
        ).distinct().all()

        # Konvertieren von Ergebnissen in eine Liste von IDs
        user_ids = [item[0] for item in user_ids_with_availability]

        user_availability = defaultdict(list)
        self.user_holidays = defaultdict(list)

        # Prüfen, ob jeder Benutzer und jeden Tag im Zeitraum die Verfügbarkeit hat
        for user_id in user_ids:
            for single_date in date_range:
                # Versuchen, für das aktuelle Datum einen Eintrag zu finden
                availability_entry = Availability.query.filter_by(user_id=user_id, date=single_date).first()

                # Wenn der Mitarbeiter Ferien hat ("X" in der Spalte holiday), dann wird eine 1 für Ferien gesetzt
                if availability_entry and availability_entry.holiday == "X":
                    times = (None,) * 6  # Keine spezifischen Zeiten, weil Ferien
                    self.user_holidays[user_id].append((single_date, 1))
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
                    self.user_holidays[user_id].append((single_date, 0))
                else:
                    # Wenn kein Eintrag, alles auf None setzen und als Arbeitstag betrachten
                    times = (None,) * 6
                    self.user_holidays[user_id].append((single_date, 0))

                # Zeiten für das aktuelle Datum dem user_availability-Dict hinzufügen
                user_availability[user_id].append((single_date, *times))

            # Verfügbarkeiten und Ferien für jeden Benutzer nach Datum sortieren
            user_availability[user_id] = sorted(user_availability[user_id], key=lambda x: x[0])
            self.user_holidays[user_id] = sorted(self.user_holidays[user_id], key=lambda x: x[0])

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

        """
        for i in range(7):
            print(f"{i}-ter Tag Laden Öffnet: {self.laden_oeffnet[i]}")
            print(f"{i}-ter Tag Laden Schliesst: {self.laden_schliesst[i]}")
        
        print("Opening_hour: ", self.opening_hours)
        """


    def get_skills(self):
        """ In dieser Methode werden sämtliche Skills einer Company in einer Liste gespeichert """

        # company_name filtern aus der Datenkbank
        user = User.query.filter_by(id=self.current_user_id).first()
        company_name = user.company_name

        # Die entsprechende Company-Instanz abfragen
        company = Company.query.filter_by(company_name=company_name).first()

        # Zugriff auf das erste Department, da deparment nicht mit 1 beginnt
        first_department = getattr(company, 'department')
        if first_department:
            self.skills.append(first_department)
        
        # Die restlichen deparments durchiterieren 
        for i in range(2, 11): 
            department_value = getattr(company, f'department{i}')
            if department_value:  # Wenn department_value nicht leer/null ist
                self.skills.append(department_value)

        print("Skills: ", self.skills)
        


    def get_time_req(self):
        """ In dieser Funktion werden die benötigten Mitarbeiter für jede Stunde jedes Tages jedes Skills abgerufen """

        # Holt den company_name aus der Datenbank.
        user = User.query.filter_by(id=self.current_user_id).first()
        company_name = user.company_name

        # Abrufen aller TimeReq-Datensätze für das Unternehmen im relevanten Datumsbereich.
        time_reqs = TimeReq.query.filter(
            TimeReq.company_name == company_name,
            TimeReq.date.between(self.start_date, self.end_date)
        ).all()

        # Bestimmt den Divisor basierend auf self.hour_devider
        divisor = 3600 / self.hour_devider

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

        binary_availability = defaultdict(list)

        divisor = 3600 / self.hour_devider

        for user_id, availabilities in self.user_availability.items():
            for availability in availabilities:
                date = availability[0]
                time_blocks = availability[1:]  # Alle Zeitblöcke als Tuple extrahieren
                weekday_index = date.weekday()
                num_hours = self.opening_hours[weekday_index]
                binary_list = [0] * num_hours

                for i in range(0, len(time_blocks), 2):  # Über Paare aus Start-/Endzeiten iterieren in 2er Schritten
                    start_time = time_blocks[i]
                    end_time = time_blocks[i + 1]

                    # Überspringen, falls Startzeit oder Endzeit None sind
                    if start_time is None or end_time is None:
                        continue

                    # Behandlung von Mitternacht als Endzeit
                    if end_time == timedelta(0):
                        end_time = timedelta(hours=24)

                    # Anpassung an die Öffnungszeit des Ladens
                    start_hour = int((start_time.total_seconds() - self.laden_oeffnet[weekday_index].total_seconds()) / divisor)
                    end_hour = int((end_time.total_seconds() - self.laden_oeffnet[weekday_index].total_seconds()) / divisor)

                    # Sicherstellen, dass die Stunden innerhalb der Geschäftszeiten liegen
                    start_hour = max(0, start_hour)
                    end_hour = min(num_hours, end_hour)

                    # Die binäre Liste aktualisieren
                    for hour in range(start_hour, end_hour):
                        binary_list[hour] = 1

                binary_availability[user_id].append((date, binary_list))

        self.binary_availability = binary_availability



    def get_employment_skills(self):
        """ In der folgenden Methode holen wir die Beschäftigung und die Skills jedes Benutzers und fügen sie jeweils in eine Liste ein """

        # company_name filtern aus der Datenkbank
        user = User.query.get(self.current_user_id)
        company_name = user.company_name

        # Hole das employment_level für jeden Benutzer, der in der gleichen Firma arbeitet wie der aktuelle Benutzer
        users = User.query.filter_by(company_name=company_name).all()

        # user_employment Dictionarie erstellen mit user_id als Key:
        self.user_employment = defaultdict(str, {user.id: user.employment for user in users})

        # user_skills Dictionary erstellen mit user_id als Key:
        self.user_skills = defaultdict(list) 
        for user in users:
            # Das erste Attribut heisst "department", nicht "department1", also müssen wir es separat behandeln
            first_department = getattr(user, 'department')
            if first_department:  # Füge hinzu, wenn es nicht None oder leer ist
                self.user_skills[user.id].append(first_department)

            # Iteration durch die restlichen "department"-Attribute (von "department2" bis "department10")
            for i in range(2, 11):
                skill = getattr(user, f'department{i}')
                if skill:  # Füge hinzu, wenn es nicht None oder leer ist
                    self.user_skills[user.id].append(skill)



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

