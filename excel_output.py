import io

from datetime import datetime, timedelta
from models import Timetable
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from app import app, db, timedelta
from sqlalchemy import text

def create_excel_output(user_id):
    """
    In dieser Funktion werden relevante gesolvte Daten aus der Datenbank gezogen und eine Excelausgabe daraus generiert.
    """

    # Achtung, start_date muss immer ein Montag sein!
    start_date = "2023-10-09"
    end_date = "2023-10-15"

    with app.app_context():
                """
                COMPANY INFOS ZIEHEN ---------------------------------------------------------------
                """
                # Hole den company_name des aktuellen Benutzers
                sql = text("""
                    SELECT company_name
                    FROM user
                    WHERE id = :current_user_id
                """)
                result = db.session.execute(sql, {"current_user_id": user_id})
                company_name = result.fetchone()[0]

                # ----------------------------------------------------------------------------------

                # Abfrage, um die Öffnungszeiten der Firma basierend auf dem company_name abzurufen
                sql = text("""
                    SELECT weekday, start_time, end_time, end_time2
                    FROM opening_hours
                    WHERE company_name = :company_name
                    ORDER BY FIELD(weekday, 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag')
                """)
                result = db.session.execute(sql, {"company_name": company_name})
                times = result.fetchall()

                # ----------------------------------------------------------------------------------

                # Abfrage, um hour_devider abzurufen
                sql = text("""
                    SELECT hour_devider
                    FROM solver_requirement
                    WHERE company_name = :company_name
                """)
                result = db.session.execute(sql, {"company_name": company_name})
                hour_devider = result.fetchone()[0] # Um nur einen Wert zuzuschreiben

                """
                USER INFOS ZIEHEN ------------------------------------------------------------------
                """

                # Abfrage, um die user Informationen abzurufen
                sql = text("""
                    SELECT id, first_name, last_name, employment, email, employment_level
                    FROM user
                    WHERE company_name = :company_name
                """)
                result = db.session.execute(sql, {"company_name": company_name})
                company_users = result.fetchall()
                print(company_users)

                # ----------------------------------------------------------------------------------
 
                # Abfrage, um die Tiemtable Infos der User abzurufen
                sql = text("""
                    SELECT email, date, start_time, end_time, start_time2, end_time2
                    FROM timetable
                    WHERE company_name = :company_name
                    AND timetable.date BETWEEN :start_date AND :end_date
                """)

                result = db.session.execute(sql, {"company_name": company_name, "start_date": start_date, "end_date": end_date})
                # fetchall = alle Zeilen der Datenbank werden abgerufen und in einem Tupel gespeichert
                data_timetable = result.fetchall()
                print(data_timetable)


    # Excel erstellen und befüllen ----------------------------------------------------------------------------------------------
    wb = Workbook()
    ws = wb.active

    # Erstelle einen Border-Style --> Rahmenlinien definieren
    border_style = Border(left=Side(style='thin'),
                        right=Side(style='thin'),
                        top=Side(style='thin'),
                        bottom=Side(style='thin'))
    
    green_fill = PatternFill(start_color="00FF00", end_color="00FF00", fill_type="solid")

    # Company Name in Zelle B2 eintragen mit Schriftgröße 24
    ws['B2'] = f"Einsatzplan {company_name}"  # company_name ist der Name der Firma, der aus der Datenbank abgerufen wurde
    ws['B2'].font = Font(size=24)  # Schriftgröße auf 24

    # Spaltentitel setzen
    titles = [
        (2, "ID"),
        (3, "Vorname"),
        (4, "Name"),
        (5, "Anstellung"),
        (6, "Anstellungsgrad")
    ]
    
    fill_color = PatternFill(start_color="D9D9D9", end_color="D9D9D9", fill_type="solid")
    for col_idx, title in titles:
        cell = ws.cell(row=5, column=col_idx, value=title)
        cell.alignment = Alignment(horizontal='left')  # Setze den Text des Titels linksbündig
        cell.fill = fill_color  # Setze die Füllfarbe der Zelle
        cell.border = border_style  # Rahmenlinien für die Titel setzen

        
        # Spaltenbreiten einstellen
        if title == "ID":
            ws.column_dimensions[chr(64 + col_idx)].width = 5
        if title == "Vorname":
            ws.column_dimensions[chr(64 + col_idx)].width = 12
        if title == "Name":
            ws.column_dimensions[chr(64 + col_idx)].width = 12
        if title == "Anstellung":
            ws.column_dimensions[chr(64 + col_idx)].width = 12
        if title == "Anstellungsgrad":
            ws.column_dimensions[chr(64 + col_idx)].width = 15
    

    # Startzeile für Daten
    first_data_row = 6
    row = first_data_row

    email_row_dict = {}
    # User-Informationen eintragen
    for user in company_users:
        user_id, first_name, last_name, employment, email, employment_level = user
        email_row_dict[email] = row
        data = [
            (2, user_id),
            (3, first_name),
            (4, last_name),
            (5, employment),
            (6, employment_level)
        ]
        for col_idx, value in data:
            cell = ws.cell(row=row, column=col_idx, value=value)
            cell.alignment = Alignment(horizontal='left')  # Setze den Text der Datenzelle linksbündig
            cell.border = border_style  # Rahmenlinien für die User-Informationen setzen
        row += 1

    last_data_row = row - 1  # Da row nach dem letzten Eintrag erhöht wurde, reduzieren wir es um 1.

    # Funktion zur Generierung der Stunden
    def generate_hours(start_time, end_time, hour_devider):
        current_time = start_time
        times = []
        delta = timedelta(minutes=60//hour_devider)
        while current_time < end_time:
            times.append(current_time.strftime('%H:%M'))
            current_time += delta
        return times
    
    # Stunden für jeden Tag hinzufügen
    col_index = 7  # Beginne in Spalte G
    for time_info in times:
        weekday, start_time_obj, end_time_obj, end_time2_obj = time_info
        start_time = (datetime.min + start_time_obj).time()
        end_time = (datetime.min + (end_time2_obj if end_time2_obj != timedelta(0) else end_time_obj)).time()
        hours = generate_hours(datetime.combine(datetime.today(), start_time), datetime.combine(datetime.today(), end_time), hour_devider)
        row_index = 5
        
        if hours:
            day_cell = ws.cell(row=4, column=col_index, value=f"{weekday} {start_date}")
            if len(hours) > 1:
                ws.merge_cells(start_row=4, start_column=col_index, end_row=4, end_column=col_index + len(hours) - 1)
                
            for merge_col_index in range(col_index, col_index + len(hours)):
                cell = ws.cell(row=4, column=merge_col_index)
                cell.border = border_style
                
            for hour in hours:
                cell = ws.cell(row=row_index, column=col_index, value=hour)
                cell.font = Font(size=6)
                cell.border = border_style
                ws.column_dimensions[get_column_letter(col_index)].width = 3.2
                col_index += 1
            
            for email, date, start_time, end_time, _, _ in data_timetable:
                if date.strftime("%Y-%m-%d") == start_date:
                    user_row = email_row_dict.get(email)
                    if user_row:
                        start_time = (datetime.min + start_time).time()
                        end_time = (datetime.min + end_time).time()
                        
                        start_col = col_index - len(hours) + (datetime.combine(datetime.today(), start_time) - datetime.combine(datetime.today(), (datetime.min + start_time_obj).time())).seconds // (60 * 60 // hour_devider)
                        end_col = start_col + (datetime.combine(datetime.today(), end_time) - datetime.combine(datetime.today(), start_time)).seconds // (60 * 60 // hour_devider) - 1

                        
                        # Färben der Zellen
                        for col in range(start_col, end_col + 1):
                            cell = ws.cell(row=user_row, column=col)
                            cell.fill = green_fill
        
        start_date = (datetime.strptime(start_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")

    # Rahmen für alle Zellen
    for row in range(first_data_row, last_data_row + 1):
        for col in range(7, col_index):
            cell = ws.cell(row=row, column=col)
            cell.border = border_style  # Setzen Sie hier den vorher definierten border_style.

    # In-memory bytes stream
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)  # Gehe zum Start des Streams

    return output



