import io

from models import Timetable
from openpyxl import Workbook
from app import app, db, timedelta
from sqlalchemy import text

def create_excel_output(user_id):
    with app.app_context():
                            
                # Hole den company_name des aktuellen Benutzers
                sql = text("""
                    SELECT company_name
                    FROM user
                    WHERE id = :current_user_id
                """)
                result = db.session.execute(sql, {"current_user_id": user_id})
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


    wb = Workbook()
    ws = wb.active

    # Startzeile für Daten
    row = 2

    # Durch die employment_data iterieren
    for data in employment_data:
        # Nehmen wir an, dass das erste Element die ID und das zweite Element das employment_level ist
        user_id, employment_level = data

        # Daten in die entsprechenden Zellen schreiben
        ws.cell(row=row, column=1, value=user_id)
        ws.cell(row=row, column=2, value=employment_level)

        # Zur nächsten Zeile wechseln für den nächsten Datensatz
        row += 1
    
    # In-memory bytes stream
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)  # Gehe zum Start des Streams

    return output



