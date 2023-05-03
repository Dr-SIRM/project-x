import pymysql
from sqlalchemy import text
from datetime import datetime, time, timedelta
from collections import defaultdict
from app import app, db


class DataProcessing:
    def __init__(self, current_user_id):
        # Attribute
        self.current_user_id = current_user_id
        self.opening_hours = None
        self.laden_oeffnet = None
        self.laden_schliesst = None
        self.user_availability = None
        self.binary_availability = None


    def run(self):
        """ Die einzelnen Methoden werden in der Reihe nach ausgeführt """
        self.get_availability()
        # Ausgabe user_availability
        print(f"User Availability: {self.user_availability}")
        self.get_opening_hours()
        print(f"Laden öffnet: {self.laden_oeffnet}")
        print(f"Laden schliesst: {self.laden_schliesst}")
        print(f"Opening Hours: {self.opening_hours}")
        # self.binaere_liste()
        # print(f"Binary Availability: {self.binary_availability}")



    def get_availability(self):
        """ In dieser Funktion wird user_id, date, start_time, end_time aus der Availability Entität gezogen
            und in einer Liste gespeichert. Key ist user_id """

        print(f"Admin mit der User_id: {self.current_user_id} hat den Solve Button gedrückt.")

        with app.app_context():
            start_date = "2023-05-01"
            end_date = "2023-05-07"
            
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
            result = db.session.execute(sql, {"company_name": company_name, "start_date": start_date, "end_date": end_date})
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
        """ Die eingegebene Uhrzeit (hour, minute, second) wird in Stunden umgerechnet """
        return int((t.hour * 3600 + t.minute * 60 + t.second) / 3600)



    def time_to_int_2(self, t):
        """ Die eingegebene Uhrzeit (second) wird in Stunden umgerechnet """
        return int(t.seconds / 3600)



    def get_opening_hours(self):
        """ In dieser Funktion werden die Öffnungszeiten der jeweiligen Company aus der Datenbank gezogen. """
        with app.app_context():
            # Abfrage, um den company_name des aktuellen Benutzers zu erhalten
            sql = text("""
                SELECT company_name
                FROM user
                WHERE id = :current_user_id
            """)
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




    def binaere_liste(self):
        """ In dieser Funktion werden die zuvor erstellen user_availabilities in binäre Listen umgewandelt. """

        # Testwerte für Ladenöffnungszeiten!!
        self.laden_oeffnet = time(hour=6)
        self.laden_schliesst = time(hour=17)
        self.opening_hours = (self.laden_schliesst.hour * 60 + self.laden_schliesst.minute) - (self.laden_oeffnet.hour * 60 + self.laden_oeffnet.minute)
        

        # Generiert automatisch einen Standartwert für nicht vorhandene Schlüssel.
        binary_availability = defaultdict(list)

        for user_id, availabilities in self.user_availability.items():
            for date, start_time, end_time in availabilities:
                # Anzahl der Stunden Berechnen, in denen der Laden geöffnet ist
                num_hours = self.opening_hours // 60

                # Liste erstellen von Nullen mit der Länge der Anzahl der Stunden, in denen der Laden geöffnet ist
                binary_list = [0] * num_hours

                # Werte werden auf 1 gesetzt, wenn der MA Arbeiten kann.
                start_hour = self.time_to_int_2(start_time) - self.time_to_int_1(self.laden_oeffnet)
                end_hour = self.time_to_int_2(end_time) - self.time_to_int_1(self.laden_oeffnet)
                for i in range(start_hour, end_hour):
                    binary_list[i] = 1

                binary_availability[user_id].append((date, binary_list))

        self.binary_availability = binary_availability

