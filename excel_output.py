import io

from models import Timetable
from openpyxl import Workbook
from app import app, db, timedelta
from sqlalchemy import text

def create_excel_output(user_id):
    """
    In dieser Funktion werden relevante gesolvte Daten aus der Datenbank gezogen und eine Excelausgabe daraus generiert.
    """

    start_date = "2023-09-25"
    end_date = "2023-10-01"

    with app.app_context():
                            
                # Hole den company_name des aktuellen Benutzers
                sql = text("""
                    SELECT company_name
                    FROM user
                    WHERE id = :current_user_id
                """)
                result = db.session.execute(sql, {"current_user_id": user_id})
                company_name = result.fetchone()[0]
                
                # Abfrage, um die Öffnungszeiten der Firma basierend auf dem company_name abzurufen
                sql = text("""
                    SELECT weekday, start_time, end_time, end_time2
                    FROM opening_hours
                    WHERE company_name = :company_name
                    ORDER BY FIELD(weekday, 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag')
                """)
                result = db.session.execute(sql, {"company_name": company_name})
                times = result.fetchall()

                # Abfrage, um die Tiemtable Infos der User abzurufen
                sql = text("""
                    SELECT email, date
                    FROM timetable
                    WHERE company_name = :company_name
                    AND timetable.date BETWEEN :start_date AND :end_date
                """)

                # execute = rohe Mysql Abfrage.
                result = db.session.execute(sql, {"company_name": company_name, "start_date": start_date, "end_date": end_date})
                # fetchall = alle Zeilen der Datenbank werden abgerufen und in einem Tupel gespeichert
                data_timetable = result.fetchall()


    # Excel erstellen und befüllen ----------------------------------------------------------------------------------------------
    wb = Workbook()
    ws = wb.active

    # Startzeile für Daten
    row = 2

    # Durch die employment_data iterieren
    for data in data_timetable:
        email, date = data

        # Daten in die entsprechenden Zellen schreiben
        ws.cell(row=row, column=1, value=email)
        ws.cell(row=row, column=2, value=date)

        # Zur nächsten Zeile wechseln für den nächsten Datensatz
        row += 1
    
    # In-memory bytes stream
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)  # Gehe zum Start des Streams

    return output



