import pymysql
from sqlalchemy import text
from datetime import datetime, time
from collections import defaultdict
from app import app, db, timedelta


class DataProcessing:
    def __init__(self, current_user_id):
        # Attribute
        self.current_user_id = current_user_id
        self.opening_hours = None
        self.laden_oeffnet = None
        self.laden_schliesst = None
        self.user_availability = None
        self.time_req = None
        self.company_shifts = None
        self.employment_lvl = None
        self.user_employment = None
        self.binary_availability = None

        # Zeitraum in dem gesolvet wird, wird noch angepasst!
        self.start_date = "2023-06-26"
        self.end_date = "2023-06-30"
        

    def run(self):
        """ Die einzelnen Methoden werden in der Reihe nach ausgeführt """
        self.get_availability()
        self.get_opening_hours()
        self.get_time_req()
        self.get_shift_emp_lvl()
        self.binaere_liste()
        self.get_employment()
        self.pre_check_admin()



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

            self.user_availability = user_availability


    def time_to_int(self, t):
        if isinstance(t, timedelta):
            total_seconds = t.total_seconds()
        elif isinstance(t, time):
            total_seconds = t.hour * 3600 + t.minute * 60 + t.second
        else:
            raise ValueError("Invalid input type, must be datetime.timedelta or datetime.time")
        return int(total_seconds / 3600)



    def time_to_int_1(self, t):
        if isinstance(t, timedelta):
            return int((t.seconds) / 3600)
        else:
            return int((t.hour * 3600 + t.minute * 60 + t.second) / 3600)



    def time_to_int_2(self, t):
        """ Die eingegebene Uhrzeit (second) wird in Stunden umgerechnet """
        return int(t.seconds / 3600)



    def get_opening_hours(self):
        """ In dieser Funktion werden die Öffnungszeiten (7 Tage) der jeweiligen Company aus der Datenbank gezogen. """
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
        self.opening_hours = [self.time_to_int(self.laden_schliesst[i]) - self.time_to_int(self.laden_oeffnet[i]) for i in range(7)]



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
            # execute = rohe Mysql Abfrage.
            result = db.session.execute(sql, {"company_name": company_name, "start_date": self.start_date, "end_date": self.end_date})

            # fetchall = alle Zeilen der Datenbank werden abgerufen und in einem Tupel gespeichert
            time_reqs = result.fetchall()

            # Erstellen eines Dictionaries mit Datum und Stunde als Schlüssel:
            time_req_dict_2 = defaultdict(dict)
            for date, start_time, worker in time_reqs:
                # Wochentag als Index (0 = Montag, 1 = Dienstag, usw.) erhalten
                weekday_index = date.weekday()

                # Prüfen, ob die Start- und Endzeiten innerhalb der Öffnungszeiten liegen
                if (self.laden_oeffnet[weekday_index] <= start_time < self.laden_schliesst[weekday_index]):
                    start_hour = self.time_to_int_2(start_time) - self.time_to_int_1(self.laden_oeffnet[weekday_index])
                    time_req_dict_2[date][start_hour] = worker

        self.time_req = time_req_dict_2


    def get_shift_emp_lvl(self):
        """ In dieser Funktion wird als Key die user_id verwendet und die shift und employment_level aus der Datenbank gezogen """
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

            # Hole das employment_level für jeden Benutzer, der in der gleichen Firma arbeitet wie der aktuelle Benutzer
            sql = text("""
                SELECT id, employment_level
                FROM user
                WHERE company_name = :company_name
            """)
            result = db.session.execute(sql, {"company_name": company_name})
            employment_lvl = {user_id: employment_level for user_id, employment_level in result.fetchall()}

        self.company_shifts = company_shifts
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

                # Werte werden auf 1 gesetzt, wenn der Mitarbeiter arbeiten kann.
                start_hour = self.time_to_int_2(start_time) - self.time_to_int_1(self.laden_oeffnet[weekday_index])
                end_hour = self.time_to_int_2(end_time) - self.time_to_int_1(self.laden_oeffnet[weekday_index])
                for i in range(start_hour, end_hour):
                    if 0 <= i < len(binary_list):
                        binary_list[i] = 1

                binary_availability[user_id].append((date, binary_list))

        self.binary_availability = binary_availability


    def get_employment(self):
            """ In following method we are fetching the employment of each user and put them into a list """
            with app.app_context():
                            
                # Hole den company_name des aktuellen Benutzers
                sql = text("""
                    SELECT company_name
                    FROM user
                    WHERE id = :current_user_id
                """)
                result = db.session.execute(sql, {"current_user_id": self.current_user_id})
                company_name = result.fetchone()[0]
                
                # Employment of all user within the same company
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



    def pre_check_admin(self):
        """
        ---------------------------------------------------------------------------------------------------------------
        1. Überprüfen, ob der Admin zu jeder Stunde time_req eingegeben hat
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
        