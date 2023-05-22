import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font
from openpyxl.utils import get_column_letter
from ortools.linear_solver import pywraplp
from data_processing import DataProcessing

"""
To-Do Liste:

Prio 1:

 - (erl.) NB6: Max. einen Arbeitsblock pro Tag
 - Eine if Anweseiung, wenn der Betrieb an einem Tag geschlossen hat. Dann soll an diesem Tag nicht gesolvet werden
 - die calc_time soll automatisch errechnet werden
 - Als Key oder i für MA soll nicht mehr MA1, MA2 usw stehen, sondern die user_id (zB. 1002)
 - NB7: ?

Prio 2:

 - Die gesolvten Daten in der Datenbank speichern

Prio 3:

 - die max und min Zeit für die MA soll der Admin eingeben können. Diese Daten dann aus der Datenbank ziehen
 - der Admin kann auch die Kosten der MA, wenn er will, eintragen. 


"""




class ORAlgorithm:
    def __init__(self, dp: DataProcessing):
        self.current_user_id = dp.current_user_id
        self.user_availability = dp.user_availability
        self.opening_hours = dp.opening_hours
        self.laden_oeffnet = dp.laden_oeffnet
        self.laden_schliesst = dp.laden_schliesst
        self.binary_availability = dp.binary_availability
        self.time_req = dp.time_req

    def run(self):
        self.algorithm()

    def algorithm(self):
        # List-Comprehensions
        mitarbeiter = [f"MA{i+1}" for i in range(len(self.binary_availability))]

        # Aus dem binary_availability dict. die Verfügbarkeits-Informationen ziehen
        verfügbarkeit = {}
        for i, (user_id, availabilities) in enumerate(self.binary_availability.items()):
            verfügbarkeit[mitarbeiter[i]] = []
            for day_availability in availabilities:
                date, binary_list = day_availability
                verfügbarkeit[mitarbeiter[i]].append(binary_list)

        # Kosten für jeden MA noch gleich, ebenfalls die max Zeit bei allen gleich
        kosten = {ma: 20 for ma in mitarbeiter}  # Kosten pro Stunde
        max_zeit = {ma: 8 for ma in mitarbeiter}  # Maximale Arbeitszeit pro Tag
        min_zeit = {ma: 3 for ma in mitarbeiter}  # Maximale Arbeitszeit pro Tag
        calc_time = 5

        # Eine Liste mit den min. anwesendheiten der MA wird erstellt
        min_anwesend = []
        for _, values in sorted(self.time_req.items()):
            min_anwesend.append(list(values.values()))
        

        # Problem 
        # GLOP = Simplex Verfahren
        # CBC =  branch-and-bound- und branch-and-cut-Verfahren
        # SCIP = Framework für die Lösung gemischt-ganzzahliger Programmierungsproblem
        # GLPK = Vielzahl von Algorithmen, einschließlich des Simplex-Verfahrens und des branch-and-bound-Verfahrens
        solver = pywraplp.Solver.CreateSolver('SCIP')


        # Entscheidungsvariablen ------------------------------------------------------------------------------------------------

        # solver.NumVar() <-- kontinuierliche Variabeln
        # solver.BoolVar() <-- boolesche Variabeln
        # solver.IntVar() <-- Int Variabeln
        x = {}
        for i in mitarbeiter:
            for j in range(calc_time):  # Für jeden Tag der Woche
                for k in range(len(verfügbarkeit[i][j])):  # Für jede Stunde des Tages, an dem das Café geöffnet ist
                    x[i, j, k] = solver.IntVar(0, 1, f'x[{i}, {j}, {k}]') # Variabeln können nur die Werte 0 oder 1 annehmen

        # Schichtvariable
        y = {}
        for i in mitarbeiter:
            for j in range(calc_time):  # Für jeden Tag der Woche
                for k in range(len(verfügbarkeit[i][j])):  # Für jede Stunde des Tages, an dem das Café geöffnet ist
                    y[i, j, k] = solver.IntVar(0, 1, f'y[{i}, {j}, {k}]') # Variabeln können nur die Werte 0 oder 1 annehmen


        # Zielfunktion ----------------------------------------------------------------------------------------------------------
        objective = solver.Objective()
        for i in mitarbeiter:
            for j in range(calc_time):
                for k in range(len(verfügbarkeit[i][j])):
                    # Die Kosten werden multipliziert
                    objective.SetCoefficient(x[i, j, k], kosten[i])
        # Es wird veruscht, eine Kombination von Werten für die x[i, j, k] zu finden, die die Summe kosten[i]*x[i, j, k] minimiert            
        objective.SetMinimization()


        # Beschränkungen --------------------------------------------------------------------------------------------------------
        # (Die solver.Add() Funktion nimmt eine Bedingung als Argument und fügt sie dem Optimierungsproblem hinzu.)

        # NB 1 - MA darf nur eingeteilt werden, sofern er auch verfügbar ist.
        for i in mitarbeiter:
            for j in range(calc_time):
                for k in range(len(verfügbarkeit[i][j])):
                    solver.Add(x[i, j, k] <= verfügbarkeit[i][j][k])


        # NB 2 - Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend 
        for j in range(calc_time):
            for k in range(len(verfügbarkeit[mitarbeiter[0]][j])):  # Wir nehmen an, dass alle Mitarbeiter die gleichen Öffnungszeiten haben
                solver.Add(solver.Sum([x[i, j, k] for i in mitarbeiter]) >= min_anwesend[j][k] + 1)


        # NB 3 - Max. Arbeitszeit pro Woche 
        total_hours = {ma: solver.Sum([x[ma, j, k] for j in range(calc_time) for k in range(len(verfügbarkeit[ma][j]))]) for ma in mitarbeiter}
        for ma in mitarbeiter:
            solver.Add(total_hours[ma] <= 35)


        # NB 4 - Max. Arbeitszeit pro Tag
        for i in mitarbeiter:
            for j in range(calc_time):
                solver.Add(solver.Sum(x[i, j, k] for k in range(len(verfügbarkeit[i][j]))) <= max_zeit[i])


       # NB 5 - Min. Arbeitszeit pro Tag
        for i in mitarbeiter:
            for j in range(calc_time):
                # Prüfen, ob der Mitarbeiter an diesem Tag arbeiten kann (z.B. [0, 1, 1] = sum(2))
                if sum(verfügbarkeit[i][j]) >= min_zeit[i]:
                    sum_hour = solver.Sum(x[i, j, k] for k in range(len(verfügbarkeit[i][j])))
                    solver.Add(sum_hour >= min_zeit[i])


        # NB 6 - Nur einen Arbeitsblock pro Tag
        for i in mitarbeiter:
            for j in range(calc_time):
                # Für die erste Stunde des Tages
                solver.Add(y[i, j, 0] >= x[i, j, 0])
                # Für die restlichen Stunden des Tages
                for k in range(1, len(verfügbarkeit[i][j])):
                    solver.Add(y[i, j, k] >= x[i, j, k] - x[i, j, k-1])
                # Die Summe der y[i, j, k] für einen bestimmten Tag j sollte nicht größer als 1 sein
                solver.Add(solver.Sum(y[i, j, k] for k in range(len(verfügbarkeit[i][j]))) <= 1)


        # NB 7 - Innerhalb einer Woche immer gleiche Schichten


        # NB 8 - Verteilungsgrad ca. 50%


        # NB 9 - Feste Mitarbeiter zu employement_level fest einplanen


        # NB 10 - Max Stunden pro Woche gemäss company data (employement_level * working_hours)


        # NB 11 - Planung pro Viertel Stunde


        # NB 12 - Wechselnde Schichten innerhalb 2 Wochen

        # Problem lösen ---------------------------------------------------------------------------------------------------------
        status = solver.Solve()



        # Ergebnisse ausgeben ----------------------------------------------------------------------------------------------------
        if status == pywraplp.Solver.OPTIMAL or status == pywraplp.Solver.FEASIBLE:
            mitarbeiter_arbeitszeiten = {}
            for i in mitarbeiter:
                mitarbeiter_arbeitszeiten[i] = []
                for j in range(calc_time):
                    arbeitszeit_pro_tag = []
                    for k in range(len(verfügbarkeit[i][j])):
                        arbeitszeit_pro_tag.append(int(x[i, j, k].solution_value()))
                    mitarbeiter_arbeitszeiten[i].append(arbeitszeit_pro_tag)
            print(mitarbeiter_arbeitszeiten)
        if status == pywraplp.Solver.OPTIMAL:
            print("Optimal solution found.")
        elif status == pywraplp.Solver.FEASIBLE:
            print("Feasible solution found.")
        elif status == pywraplp.Solver.INFEASIBLE:
            print("Problem is infeasible.")
        elif status == pywraplp.Solver.UNBOUNDED:
            print("Problem is unbounded.")
        elif status == pywraplp.Solver.NOT_SOLVED:
            print("Solver did not solve the problem.")
        else:
            print("Unknown status.")
           

        # Ergebnisse ausgeben Excel ----------------------------------------------------------------------------------------------
        data = mitarbeiter_arbeitszeiten

        # Legen Sie die Füllungen fest
        green_fill = PatternFill(start_color="00FF00", end_color="00FF00", fill_type="solid")
        red_fill = PatternFill(start_color="FF0000", end_color="FF0000", fill_type="solid")

        # Festlegen der Schriftgröße
        font = Font(size=10)
        header_font = Font(size=5)  # Schriftgröße für die Spaltentitel

        # Erstellen Sie ein Workbook
        wb = Workbook()
        ws = wb.active

        # Schreiben Sie die Überschriften
        headers = ["MA"]
        for i in range(1, len(max(data.values(), key=len)) + 7):
            headers.extend(["T{},h{}".format(i, j+8) for j in range(10)])
        ws.append(headers)

        # Ändern der Schriftgröße der Spaltentitel
        for cell in ws[1]:
            cell.font = header_font

        # Schreiben Sie die Daten
        for ma, days in data.items():
            row = [ma]
            for day in days:
                if day:
                    row.extend(day)
                else:
                    row.extend([None]*9)  # Für Tage ohne Stunden
            ws.append(row)

        # Farben auf Basis der Zellenwerte festlegen und Schriftgröße für den Rest des Dokuments
        for row in ws.iter_rows(min_row=2, values_only=False):
            for cell in row[1:]:
                if cell.value == 1:
                    cell.fill = green_fill
                elif cell.value == 0:
                    cell.fill = red_fill
                cell.font = font

        # Ändern der Spaltenbreite
        for column in ws.columns:
            max_length = 0
            column = [cell for cell in column]
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(cell.value)
                except:
                    pass
            adjusted_width = (max_length + 2)
            if adjusted_width > 3:
                adjusted_width = 3
            ws.column_dimensions[get_column_letter(column[0].column)].width = adjusted_width

        # Speichern Sie das Workbook
        wb.save("Einsatzplan.xlsx")