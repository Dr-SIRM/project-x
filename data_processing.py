import pymysql
from sqlalchemy import text
from datetime import datetime, time
from dateutil.relativedelta import relativedelta
from collections import defaultdict
from collections import OrderedDict
from app import app, db, timedelta

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
        self.pre_check_admin()


    def solving_period(self):
        """
        In dieser Methode wird das aktuelle Datum gezogen, anschliessend der nächste Montag gefunden.
        Ebenfalls werden die zwei Werte "week_timeframe" und "hour_devider" aus der Datenbank gezogen.
        """
        with app.app_context():
            # Hole den company_name des aktuellen Benutzers
            sql = text("""
                SELECT company_name
                FROM user
                WHERE id = :current_user_id
            """)
            result = db.session.execute(sql, {"current_user_id": self.current_user_id})
            company_name = result.fetchone()[0]
            
            # Hole die Solver-Anforderungen für das Unternehmen
            sql = text("""
                SELECT week_timeframe, hour_devider
                FROM solver_requirement
                WHERE company_name = :company_name
            """)
            result = db.session.execute(sql, {"company_name": company_name})
            week_timeframe, hour_devider = result.fetchone()

            self.week_timeframe = week_timeframe
            self.hour_devider = hour_devider

        # Holen Sie sich das heutige Datum
        today = datetime.today()

        # Finden Sie den nächsten Montag
        next_monday = today + timedelta(days=(0-today.weekday() + 7) % 7)

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
        # Gute Daten zum testsolven
        # self.start_date = "2023-07-31"
        # self.end_date = "2023-08-04"

        # Alles voll availability 3-MA 1 Woche
        # self.start_date = "2023-07-10"
        # self.end_date = "2023-07-16"

        # Alles voll availability 3-MA 2 Wochen
        # self.start_date = "2023-07-10"
        # self.end_date = "2023-07-23"

        # Alles voll availability 3-MA 4 Wochen
        # self.start_date = "2023-07-03"
        # self.end_date = "2023-07-30"

        # usecase_1
        self.start_date = "2023-08-28"
        self.end_date = "2023-09-03"


        return self.start_date, self.end_date



    def get_availability(self):
        """ In dieser Funktion wird user_id, date, start_time, end_time aus der Availability Entität gezogen
            und in einer Liste gespeichert. Key ist user_id """

        print(f"Admin mit der User_id: {self.current_user_id} hat den Solve Button gedrückt.")

        with app.app_context():
            
            # Hole den company_name des aktuellen Benutzers
            sql = text("""
                SELECT company_name
                FROM user
                WHERE id = :current_user_id
            """)
            result = db.session.execute(sql, {"current_user_id": self.current_user_id})
            company_name = result.fetchone()[0]
            
            # Verfügbarkeiten für alle Benutzer mit demselben company_name abrufen
            sql = text("""
                SELECT a.user_id, a.date, a.start_time, a.end_time
                FROM availability a
                JOIN user u ON a.user_id = u.id
                WHERE u.company_name = :company_name
                AND a.date BETWEEN :start_date AND :end_date
            """)
            # execute = rohe Mysql Abfrage.
            result = db.session.execute(sql, {"company_name": company_name, "start_date": self.start_date, "end_date": self.end_date})
            # fetchall = alle Zeilen der Datenbank werden abgerufen und in einem Tupel gespeichert
            times = result.fetchall()

            # Dictionarie erstellen mit user_id als Key:
            user_availability = defaultdict(list)
            for user_id, date, start_time, end_time in times:
                user_availability[user_id].append((date, start_time, end_time))

            # Sortieren der Einträge in der Liste für jeden Benutzer nach Datum
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



    def get_opening_hours(self):
        """ In dieser Funktion werden die Öffnungszeiten (7 Tage) der jeweiligen Company aus der Datenbank gezogen. """

        # end_time in dieser Methode auf end_time2 wechslen!!
 


        with app.app_context():
            # Abfrage, um den company_name des aktuellen Benutzers zu erhalten
            sql = text("""
                SELECT company_name
                FROM user
                WHERE id = :current_user_id
            """)
            # current_user_id ist nur ein Platzhalter, welcher im Dict nachfolgend ersetzt wird (erhöht die Sicherheit)
            result = db.session.execute(sql, {"current_user_id": self.current_user_id})
            company_name = result.fetchone()[0]

            # Abfrage, um die Öffnungszeiten der Firma basierend auf dem company_name abzurufen
            sql = text("""
                SELECT weekday, start_time, end_time
                FROM opening_hours
                WHERE company_name = :company_name
                ORDER BY FIELD(weekday, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
            """)
            result = db.session.execute(sql, {"company_name": company_name})
            times = result.fetchall()

        # Initialisiere leere Listen für die Öffnungs- und Schließzeiten
        self.laden_oeffnet = [None] * 7
        self.laden_schliesst = [None] * 7

        # Ordne jedem Wochentag einen Index zu, um die Listen korrekt zu befüllen
        weekday_indices = {
            'Monday': 0,
            'Tuesday': 1,
            'Wednesday': 2,
            'Thursday': 3,
            'Friday': 4,
            'Saturday': 5,
            'Sunday': 6
        }

        for weekday, start_time, end_time in times:
            index = weekday_indices[weekday]
            self.laden_oeffnet[index] = start_time
            self.laden_schliesst[index] = end_time

        # Berechne die Öffnungszeiten für jeden Wochentag und speichere sie in einer Liste
        self.opening_hours = [(self.time_to_int(self.laden_schliesst[i]) - self.time_to_int(self.laden_oeffnet[i])) for i in range(7)]
        # Wenn ich 2 oder 4 Wochen solve, wird auch die opening_hours Liste dementsprechend länger
        self.laden_oeffnet = self.laden_oeffnet * self.week_timeframe
        self.laden_schliesst = self.laden_schliesst * self.week_timeframe
        self.opening_hours = self.opening_hours * self.week_timeframe


        
    def get_time_req(self):
        """ In dieser Funktion werden die benötigten Mitarbeiter für jede Stunde jedes Tages abgerufen """
        with app.app_context():
            # Hole den company_name des aktuellen Benutzers
            sql = text("""
                SELECT company_name
                FROM user
                WHERE id = :current_user_id
            """)
            result = db.session.execute(sql, {"current_user_id": self.current_user_id})
            company_name = result.fetchone()[0]

            # Anforderungen für das Unternehmen mit demselben company_name abrufen
            sql = text("""
                SELECT t.date, t.start_time, t.worker
                FROM time_req t
                WHERE t.company_name = :company_name
                AND t.date BETWEEN :start_date AND :end_date
            """)
            result = db.session.execute(sql, {"company_name": company_name, "start_date": self.start_date, "end_date": self.end_date})
            time_reqs = result.fetchall()
            print(time_reqs)

            # Bestimme den Divisor basierend auf self.hour_devider
            divisor = 3600 / self.hour_devider

            # Erstellen eines Dictionaries mit Datum und Stunde als Schlüssel:
            time_req_dict_2 = defaultdict(dict)
            for date, start_time, worker in time_reqs:
                weekday_index = date.weekday()
                if (self.laden_oeffnet[weekday_index] <= start_time < self.laden_schliesst[weekday_index]):
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
            print(self.time_req)


    # NEU 25.08.23
    """
    def get_time_req(self):
        with app.app_context():
            # Hole den company_name des aktuellen Benutzers
            sql = text(
                SELECT company_name
                FROM user
                WHERE id = :current_user_id
            )
            result = db.session.execute(sql, {"current_user_id": self.current_user_id})
            company_name = result.fetchone()[0]

            # Anforderungen für das Unternehmen mit demselben company_name abrufen
            sql = text(
                SELECT t.date, t.start_time, t.worker
                FROM time_req t
                WHERE t.company_name = :company_name
                AND t.date BETWEEN :start_date AND :end_date
            )
            result = db.session.execute(sql, {"company_name": company_name, "start_date": self.start_date, "end_date": self.end_date})
            time_reqs = result.fetchall()
            print(time_reqs)

            # Bestimme den Divisor basierend auf self.hour_devider
            divisor = 3600 / self.hour_devider

            # Erstellen eines Dictionaries mit Datum und Stunde als Schlüssel:
            time_req_dict_2 = defaultdict(dict)

            # Initialisiere für jeden Tag und jede Stunde einen Standardwert von 0
            current_date = datetime.strptime(self.start_date, '%Y-%m-%d').date()
            while current_date <= datetime.strptime(self.end_date, '%Y-%m-%d').date():
                for hour in range(24):  # für jede Stunde des Tages
                    time_req_dict_2[current_date][hour] = 0
                current_date += timedelta(days=1)

            # Jetzt setze die tatsächlichen Werte aus dem time_reqs-Datensatz darauf
            for date, start_time, worker in time_reqs:
                weekday_index = date.weekday()
                if (self.laden_oeffnet[weekday_index] <= start_time < self.laden_schliesst[weekday_index]):
                    start_hour = int(start_time.total_seconds() // divisor) - int(self.laden_oeffnet[weekday_index].total_seconds() // divisor)
                    if start_hour < 0:
                        start_hour = 0
                    time_req_dict_2[date][start_hour] = worker

            # Sortiere das Wörterbuch nach Datum
            self.time_req = OrderedDict(sorted(time_req_dict_2.items()))
            print(self.time_req)
    """
            


    def get_shift_weeklyhours_emp_lvl(self):
        """ In dieser Funktion wird als Key die user_id verwendet und die shift, employment_level und weekly_hours aus der Datenbank gezogen """
        with app.app_context():
            # Hole den Firmennamen des aktuellen Benutzers
            sql = text("""
                SELECT company_name
                FROM user
                WHERE id = :current_user_id
            """)
            result = db.session.execute(sql, {"current_user_id": self.current_user_id})
            company_name = result.fetchone()[0]

            # Hole die Schichten für die Firma des aktuellen Benutzers
            sql = text("""
                SELECT shifts
                FROM company
                WHERE company_name = :company_name
            """)
            result = db.session.execute(sql, {"company_name": company_name})
            company_shifts = result.fetchone()[0]

            # Hole die weekly_hours für die Firma des aktuellen Benutzers
            sql = text("""
                SELECT weekly_hours
                FROM company
                WHERE company_name = :company_name
            """)
            result = db.session.execute(sql, {"company_name": company_name})
            weekly_hours = result.fetchone()[0]

            # Hole das employment_level für jeden Benutzer, der in der gleichen Firma arbeitet wie der aktuelle Benutzer
            sql = text("""
                SELECT id, employment_level
                FROM user
                WHERE company_name = :company_name
            """)
            result = db.session.execute(sql, {"company_name": company_name})
            employment_lvl = {user_id: employment_level for user_id, employment_level in result.fetchall()}

        self.company_shifts = company_shifts
        self.weekly_hours = weekly_hours
        self.employment_lvl = employment_lvl



    def binaere_liste(self):
        """ In dieser Funktion werden die zuvor erstellten user_availabilities in binäre Listen umgewandelt. """

        # Generiert automatisch einen Standardwert für nicht vorhandene Schlüssel.
        binary_availability = defaultdict(list)

        for user_id, availabilities in self.user_availability.items():
            for date, start_time, end_time in availabilities:
                # Wochentag als Index (0 = Montag, 1 = Dienstag, usw.) erhalten
                weekday_index = date.weekday()

                # Anzahl der Stunden berechnen, in denen der Laden geöffnet ist
                num_hours = self.opening_hours[weekday_index]

                # Liste erstellen von Nullen mit der Länge der Anzahl der Stunden, in denen der Laden geöffnet ist
                binary_list = [0] * num_hours

                # Bestimme den Divisor basierend auf self.hour_devider
                divisor = 3600 / self.hour_devider

                # Werte werden auf 1 gesetzt, wenn der Mitarbeiter arbeiten kann.
                start_hour = int(start_time.total_seconds() / divisor) - int(self.laden_oeffnet[weekday_index].total_seconds() / divisor)
                end_hour = int(end_time.total_seconds() / divisor) - int(self.laden_oeffnet[weekday_index].total_seconds() / divisor)
                for i in range(start_hour, end_hour):
                    if 0 <= i < len(binary_list):
                        binary_list[i] = 1

                binary_availability[user_id].append((date, binary_list))

        self.binary_availability = binary_availability



    def get_employment(self):
            """ In der folgenden Methode holen wir die Beschäftigung jedes Benutzers und fügen sie in eine Liste ein """
            with app.app_context():
                            
                # Hole den company_name des aktuellen Benutzers
                sql = text("""
                    SELECT company_name
                    FROM user
                    WHERE id = :current_user_id
                """)
                result = db.session.execute(sql, {"current_user_id": self.current_user_id})
                company_name = result.fetchone()[0]
                
                # Hole das employment_level für jeden Benutzer, der in der gleichen Firma arbeitet wie der aktuelle Benutzer
                sql = text("""
                    SELECT id, employment
                    FROM user
                    WHERE company_name = :company_name
                """)

                # execute = rohe Mysql Abfrage.
                result = db.session.execute(sql, {"company_name": company_name})
                # fetchall = alle Zeilen der Datenbank werden abgerufen und in einem Tupel gespeichert
                employment_data = result.fetchall()

                # Dictionarie erstellen mit user_id als Key:
                user_employment = defaultdict(str)
                for user_id, employment in employment_data:
                    user_employment[user_id] = employment

                self.user_employment = user_employment



    def get_solver_requirement(self):
        """ In dieser Methode werden die Anforderungen des Solvers für das Unternehmen gezogen """
        with app.app_context():
            # Hole den company_name des aktuellen Benutzers
            sql = text("""
                SELECT company_name
                FROM user
                WHERE id = :current_user_id
            """)
            result = db.session.execute(sql, {"current_user_id": self.current_user_id})
            company_name = result.fetchone()[0]
            
            # Hole die Solver-Anforderungen für das Unternehmen
            sql = text("""
                SELECT 
                    id,
                    company_name,
                    weekly_hours,
                    shifts,
                    desired_min_time_day,
                    desired_max_time_day,
                    min_time_day,
                    max_time_day,
                    desired_max_time_week,
                    max_time_week,
                    hour_devider,
                    fair_distribution,
                    week_timeframe,
                    nb1, nb2, nb3, nb4, nb5,
                    nb6, nb7, nb8, nb9, nb10,
                    nb11, nb12, nb13, nb14, nb15,
                    nb16, nb17, nb18, nb19, nb20
                FROM solver_requirement
                WHERE company_name = :company_name
            """)
            result = db.session.execute(sql, {"company_name": company_name})
            solver_requirements = result.fetchall()

            for row in solver_requirements:
                row_dict = {
                    'id': row[0],
                    'company_name': row[1],
                    'weekly_hours': row[2],
                    'shifts': row[3],
                    'desired_min_time_day': row[4],
                    'desired_max_time_day': row[5],
                    'min_time_day': row[6],
                    'max_time_day': row[7],
                    'desired_max_time_week': row[8],
                    'max_time_week': row[9],
                    'hour_devider': row[10],
                    'fair_distribution': row[11],
                    'week_timeframe': row[12],
                    'nb1': row[13], 'nb2': row[14], 'nb3': row[15], 'nb4': row[16], 'nb5': row[17],
                    'nb6': row[18], 'nb7': row[19], 'nb8': row[20], 'nb9': row[21], 'nb10': row[22],
                    'nb11': row[23], 'nb12': row[24], 'nb13': row[25], 'nb14': row[26], 'nb15': row[27],
                    'nb16': row[28], 'nb17': row[29], 'nb18': row[30], 'nb19': row[31], 'nb20': row[32]
                }

            self.solver_requirements = row_dict


    
    def pre_check_admin(self):
        """
        ---------------------------------------------------------------------------------------------------------------
        1. Überprüfen, ob der Admin zu jeder Öffnungszeitstunde time_req eingegeben hat
        ---------------------------------------------------------------------------------------------------------------
        """
        fehlende_stunden = []

        # Erzeugt alle möglichen Daten innerhalb des Bereichs
        start_date = datetime.strptime(self.start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(self.end_date, "%Y-%m-%d").date()
        date_range = [start_date + timedelta(days=x) for x in range((end_date-start_date).days + 1)]

        for current_date in date_range:
            # Wochentag als Index (0 = Montag, 1 = Dienstag, usw.) erhalten
            weekday_index = current_date.weekday()

            # Prüft, ob der Tag ein Arbeitstag ist (Basierend auf den Öffnungszeiten)
            if self.laden_oeffnet[weekday_index] is not None and self.laden_schliesst[weekday_index] is not None:
                time_req_dict = self.time_req.get(current_date, {})

                for hour in range(self.time_to_int(self.laden_schliesst[weekday_index]) - self.time_to_int(self.laden_oeffnet[weekday_index])):
                    if hour not in time_req_dict:
                        fehlende_stunden.append((current_date, hour))
        if fehlende_stunden:
            print("Für folgende Zeitfenster fehlen time_req-Werte:")
            for date, hour in fehlende_stunden:
                print(f"Datum: {date}, Stunde: {hour}")
            raise ValueError("Es fehlen time_req-Werte.")
        else:
            print("Alle Zeitfenster haben time_req-Werte.")

        """
        ---------------------------------------------------------------------------------------------------------------
        2. XXXXXXXXXXXXXX
        ---------------------------------------------------------------------------------------------------------------
        """
        