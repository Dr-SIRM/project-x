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
 - (erl.) die calc_time soll automatisch errechnet werden
 - (erl.) Als Key oder i für MA soll nicht mehr MA1, MA2 usw stehen, sondern die user_id (zB. 1002)
 - (erl.) Shifts/Employment_level aus der Datenbank ziehen
 - auf Viertelstunden wechseln
 - Eine if Anweseiung, wenn der Betrieb an einem Tag geschlossen hat. Dann soll an diesem Tag nicht gesolvet werden
 - time_req stunden zusammenaddieren


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
        self.company_shifts = dp.company_shifts
        self.employment_lvl = dp.employment_lvl
        self.time_req = dp.time_req
        self.user_employment = dp.user_employment

        # Attribute der Methode "create_variables"
        self.mitarbeiter = None
        self.verfügbarkeit = None
        self.kosten = None
        self.max_zeit = None
        self.min_zeit = None
        self.working_h = None
        self.calc_time = None
        self.employment_lvl_list = None
        self.employment = None
        self.verteilbare_stunden = None
        self.stunden_pro_tag = None
        self.gesamtstunden_verfügbarkeit = None
        self.min_anwesend = []

        # Attribute der Methode "solver_selection"
        self.solver = None

        # Attribute der Methode "decision_variables"
        self.x = None
        self.y = None
        self.s = None
        self.a = None

        # Attribute der Methode "objective_function"
        self.objective = None

        # Attribute der Methode "solve_problem"
        self.status = None

        # Attribute der Methode "output_result_excel"
        self.mitarbeiter_arbeitszeiten = None


    def run(self):
        self.create_variables()
        self.pre_check()
        self.solver_selection()
        self.decision_variables()
        self.objective_function()
        self.constraints()
        self.solve_problem()
        self.output_result_excel()


    def create_variables(self):
        """
        Allgemeine Variabeln
        """

        # user_ids Liste, wird als Key in der Ausgabe verwendet
        self.mitarbeiter = [user_id for user_id in self.binary_availability]

        # Aus dem binary_availability dict. die Verfügbarkeits-Informationen ziehen
        self.verfügbarkeit = {}
        for i, (user_id, availabilities) in enumerate(self.binary_availability.items()):
            self.verfügbarkeit[self.mitarbeiter[i]] = []
            for day_availability in availabilities:
                date, binary_list = day_availability
                self.verfügbarkeit[self.mitarbeiter[i]].append(binary_list)

        # Kosten für jeden MA noch gleich, ebenfalls die max Zeit bei allen gleich
        self.kosten = {ma: 20 for ma in self.mitarbeiter}  # Kosten pro Stunde

        self.max_zeit = {ma: 8 for ma in self.mitarbeiter}  # Maximale Arbeitszeit pro Tag
        self.min_zeit = {ma: 2 for ma in self.mitarbeiter}  # Minimale Arbeitszeit pro Tag
        # max Stunden pro MA pro Woche - Kann evtl. noch aus der Datenbank gezogen werden in Zukunft?
        self.working_h = 35

        # Berechnung der calc_time (Anzahl Tage an denen die MA eingeteilt werden)
        # Es werden nur die Tage des ersten MA berechnet, da jeder MA die gleiche Wochenlänge hat
        self.calc_time = len(next(iter(self.binary_availability.values())))

        # Shifts aus dem Attribut der Variable shifts zuweisen
        self.shifts = self.company_shifts

        # Empolyment_level aus dem employment_lvl dict in einer Liste speichern (nur MA die berücksichtigt werden)
        self.employment_lvl = [] 

        # Iterieren Sie über die Schlüssel in binary_availability
        for user_id in self.binary_availability.keys():
            # Prüfen Sie, ob die user_id in employment_lvl vorhanden ist
            if user_id in self.employment_lvl:
                # Fügen Sie den entsprechenden employment_lvl Wert zur Liste hinzu
                self.employment_lvl.append(self.employment_lvl[user_id])
        print("Liste Empolyment_lvl: ", self.employment_lvl)

        self.employment_lvl = [1, 0.8, 0.8, 0.6, 0.6] # Damit die Liste noch selbst manipuliert werden kann.

        """
        # Creating a Employment List based on the user of binary_availability
        self.employment = []

        # Iteration of the key within binary_availability
        for user_id in self.binary_availability.keys():
            if user.id in self.user_employment:
                employment.append(self.user_employment[user_id])
        print("List Employment: ", employment)
        """
        self.employment = ["Perm", "Temp", "Temp", "Temp", "Temp"]

        # verteilbare Stunden (Wieviele Mannstunden benötigt die Firma im definierten Zeitraum)
        self.verteilbare_stunden = 0
        for date in self.time_req:
            for hour in self.time_req[date]:
                self.verteilbare_stunden += self.time_req[date][hour]
        print("Verteilbare Stunden: ", self.verteilbare_stunden)

        # gesamtstunden Verfügbarkeit pro MA pro Woche
        self.stunden_pro_tag = 1 # flexibler wenn einmal 1/4h eingebaut werden

        self.gesamtstunden_verfügbarkeit = []
        for key in self.binary_availability:
            gesamt_stunden = sum(sum(day_data[1]) * self.stunden_pro_tag for day_data in self.binary_availability[key])
            self.gesamtstunden_verfügbarkeit.append(gesamt_stunden)

        print("Gesamtstunden Verfügbarkeit: ", self.gesamtstunden_verfügbarkeit)

        # Eine Liste mit den min. anwesendheiten der MA wird erstellt
        for _, values in sorted(self.time_req.items()):
            self.min_anwesend.append(list(values.values()))

       
    def pre_check(self):
        """ 
        Vorüberprüfungen

        Hier als nächstes ausbauen, alles überprüfen (evtl. für Programmierer auch mit assert)

        """

        """
        assert isinstance(self.mitarbeiter, list), "self.mitarbeiter sollte eine Liste sein"
        assert all(isinstance(ma, int) for ma in self.mitarbeiter), "Alle Elemente in self.mitarbeiter sollten Ganzzahlen sein"

        assert isinstance(self.verfügbarkeit, dict), "self.verfügbarkeit sollte ein Wörterbuch sein"
        assert all(isinstance(val, list) for val in self.verfügbarkeit.values()), "Alle Werte in self.verfügbarkeit sollten Listen sein"
        assert len(self.verfügbarkeit) == len(self.mitarbeiter), "self.verfügbarkeit und self.mitarbeiter sollten die gleiche Länge haben"

        assert isinstance(self.kosten, dict), "self.kosten sollte ein Wörterbuch sein"
        assert all(isinstance(kost, (int, float)) for kost in self.kosten.values()), "Alle Werte in self.kosten sollten Ganzzahlen oder Gleitkommazahlen sein"
    
        assert isinstance(self.max_zeit, dict), "self.max_zeit sollte ein Wörterbuch sein"
        assert all(isinstance(zeit, (int, float)) for zeit in self.max_zeit.values()), "Alle Werte in self.max_zeit sollten Ganzzahlen oder Gleitkommazahlen sein"

        assert isinstance(self.min_zeit, dict), "self.min_zeit sollte ein Wörterbuch sein"
        assert all(isinstance(zeit, (int, float)) for zeit in self.min_zeit.values()), "Alle Werte in self.min_zeit sollten Ganzzahlen oder Gleitkommazahlen sein"
        """

        """
        # Hat Phu noch hinzugefügt, haben die festen MA genug Stunden eingeplant?
        for i in range(len(self.mitarbeiter)):
            if self.employment[i] == "Perm": 
                sum_availability_perm = 0
                for j in range(self.calc_time):
                    for k in range(len(self.verfügbarkeit[i][j])):
                        sum_availability_perm += self.verfügbarkeit[i][j][k]
                        print(sum_availability_perm)           
                if sum_availability_perm <= self.working_h:
                    print(self.mitarbeiter[i], " has not planned enough hours.")
                else:
                    pass
        """

    def solver_selection(self):
        """
        Anwahl des geeigneten Solvers
        # GLOP = Simplex Verfahren
        # CBC =  branch-and-bound- und branch-and-cut-Verfahren
        # SCIP = Framework für die Lösung gemischt-ganzzahliger Programmierungsproblem
        # GLPK = Vielzahl von Algorithmen, einschließlich des Simplex-Verfahrens und des branch-and-bound-Verfahrens
        """
        self.solver = pywraplp.Solver.CreateSolver('SCIP')


    def decision_variables(self):
        """ 
        Entscheidungsvariabeln 
        # solver.NumVar() <-- kontinuierliche Variabeln
        # solver.BoolVar() <-- boolesche Variabeln
        # solver.IntVar() <-- Int Variabeln
        """

        # Arbeitsvariable
        self.x = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):  # Für jeden Tag der Woche
                for k in range(len(self.verfügbarkeit[i][j])):  # Für jede Stunde des Tages, an dem die Firma geöffnet ist
                    self.x[i, j, k] = self.solver.IntVar(0, 1, f'x[{i}, {j}, {k}]') # Variabeln können nur die Werte 0 oder 1 annehmen

        # Arbeitsblockvariable
        self.y = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):  # Für jeden Tag der Woche
                for k in range(len(self.verfügbarkeit[i][j])):  # Für jede Stunde des Tages, an dem die Firma geöffnet ist
                    self.y[i, j, k] = self.solver.IntVar(0, 1, f'y[{i}, {j}, {k}]') # Variabeln können nur die Werte 0 oder 1 annehmen

        # Schichtvariable - wird noch nicht genutzt!
        self.s = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):  # Für jeden Tag der Woche
                for k in range(len(self.verfügbarkeit[i][j])):  # Für jede Stunde des Tages, an dem die Firma geöffnet ist
                    self.s[i, j, k] = self.solver.IntVar(0, 1, f'y[{i}, {j}, {k}]') # Variabeln können nur die Werte 0 oder 1 annehmen

        # Arbeitstagvariable
        self.a = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):  # Für jeden Tag der Woche
                self.a[i, j] = self.solver.BoolVar(f'a[{i}, {j}]') # Variablen können nur die Werte 0 oder 1 annehmen


    def objective_function(self):
        """
        Zielfunktion
        """
        self.objective = self.solver.Objective()
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                for k in range(len(self.verfügbarkeit[i][j])):
                    # Die Kosten werden multipliziert
                    self.objective.SetCoefficient(self.x[i, j, k], self.kosten[i])
        # Es wird veruscht, eine Kombination von Werten für die x[i, j, k] zu finden, die die Summe kosten[i]*x[i, j, k] minimiert            
        self.objective.SetMinimization()




    def constraints(self):
        """
        Beschränkungen / Nebenbedingungen
        # (Die solver.Add() Funktion nimmt eine Bedingung als Argument und fügt sie dem Optimierungsproblem hinzu.)
        """

        # NB 1 - MA nur einteilen, wenn er verfügbar ist.
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                for k in range(len(self.verfügbarkeit[i][j])):
                    self.solver.Add(self.x[i, j, k] <= self.verfügbarkeit[i][j][k])


        # NB 2 - Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend 
        for j in range(self.calc_time):
            for k in range(len(self.verfügbarkeit[self.mitarbeiter[0]][j])):  # Wir nehmen an, dass alle Mitarbeiter die gleichen Öffnungszeiten haben
                self.solver.Add(self.solver.Sum([self.x[i, j, k] for i in self.mitarbeiter]) >= self.min_anwesend[j][k])



        # NB 3 - Max. Arbeitszeit pro Woche - (working_h muss noch berechnet werden!)
        total_hours = {ma: self.solver.Sum([self.x[ma, j, k] for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
        for ma in self.mitarbeiter:
            self.solver.Add(total_hours[ma] <= self.working_h)


        """ 
        # NB X - Max. Arbeitszeit pro Tag - Diese NB ist nicht mehr nötig, da die max zeit bereits in der NB5 implementiert ist
        for i in mitarbeiter:
            for j in range(calc_time):
                solver.Add(solver.Sum(x[i, j, k] for k in range(len(verfügbarkeit[i][j]))) <= max_zeit[i])
        """


        # NB 4 - Min. und Max. Arbeitszeit pro Tag
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                # Prüfen, ob der Mitarbeiter an diesem Tag arbeiten kann (z.B. [0, 1, 1] = sum(2))
                if sum(self.verfügbarkeit[i][j]) >= self.min_zeit[i]:
                    sum_hour = self.solver.Sum(self.x[i, j, k] for k in range(len(self.verfügbarkeit[i][j])))
                    # Es ist nötig, das die min und die max Zeit implementiert ist. 
                    self.solver.Add(sum_hour >= self.min_zeit[i] * self.a[i, j])
                    # NB 4.1 - Die Arbeitszeit eines Mitarbeiters an einem Tag kann nicht mehr als die maximale Arbeitszeit pro Tag betragen
                    self.solver.Add(sum_hour <= self.max_zeit[i] * self.a[i, j])

        

        # NB 5 - Anzahl Arbeitsblöcke
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                # Für die erste Stunde des Tages
                self.solver.Add(self.y[i, j, 0] >= self.x[i, j, 0])
                # Für die restlichen Stunden des Tages
                for k in range(1, len(self.verfügbarkeit[i][j])):
                    self.solver.Add(self.y[i, j, k] >= self.x[i, j, k] - self.x[i, j, k-1])
                # Die Summe der y[i, j, k] für einen bestimmten Tag j sollte nicht größer als 1 sein
                self.solver.Add(self.solver.Sum(self.y[i, j, k] for k in range(len(self.verfügbarkeit[i][j]))) <= 1)
        

        # NB X - Innerhalb einer Woche immer gleiche Schichten
        
        
        # NB 6 - Verteilungsgrad MA - (entsprechend employment_lvl (keine Festanstellung) - muss noch angepasst werden, sobald feste MA eingeplant werden)
        list_gesamtstunden = []
        prozent_gesamtstunden = []
        gerechte_verteilung = []
        for i in range(len(self.mitarbeiter)):
            if self.gesamtstunden_verfügbarkeit[i] > self.working_h:
                arbeitsstunden_MA = self.employment_lvl[i] * self.working_h
            else:
                arbeitsstunden_MA = self.employment_lvl[i] * self.gesamtstunden_verfügbarkeit[i]
            list_gesamtstunden.append(int(arbeitsstunden_MA))
        # list_gesamtstunden = [35, 28, 28, 21, 21]
        summe_stunden = sum(list_gesamtstunden)
        # summe_stunden = 133
        
        for i in range(len(self.mitarbeiter)):
            prozent_per_ma = list_gesamtstunden[i] / summe_stunden
            prozent_gesamtstunden.append(prozent_per_ma)
         # prozent_gesamtstunden = [0.2631578947368421, 0.21052631578947367, 0.21052631578947367, 0.15789473684210525, 0.15789473684210525]

        for i in range(len(self.mitarbeiter)):
            if self.employment[i] == "Perm":
                verteilende_h = self.working_h
            else:
                verteilende_h = prozent_gesamtstunden[i] * self.verteilbare_stunden
                # +0.5, damit es immer aufgerundet
            gerechte_verteilung.append(round(verteilende_h + 0.5))
        print("Gerechte Verteilung: ", gerechte_verteilung)     

        # for loop für die gerechte Verteilung gemäss Liste gerechte_verteilung
        verteilungsstunden = {ma: self.solver.Sum([self.x[ma, j, k] for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
        
        # Toleranz später noch auslagern
        tolerance = 0.3
        for i, ma in enumerate(self.mitarbeiter):
            lower_bound = gerechte_verteilung[i] * (1 - tolerance)
            upper_bound = gerechte_verteilung[i] * (1 + tolerance)
            self.solver.Add(verteilungsstunden[ma] <= upper_bound)
            self.solver.Add(verteilungsstunden[ma] >= lower_bound)
        

        # NB 7 - Feste Mitarbeiter zu employement_level fest einplanen
        total_hours = {ma: self.solver.Sum([self.x[ma, j, k] for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
        for i, ma in enumerate(self.mitarbeiter):
            if self.employment[i] == "Perm": 
                self.solver.Add(total_hours[ma] == self.working_h)


        # NB X - Wechselnde Schichten innerhalb 2 Wochen

        # NB X - Gleiche Verteilung der Stunden über eine Woche


    def solve_problem(self):
        """
        Problem lösen
        """

        self.solver.EnableOutput()
        self.status = self.solver.Solve()


    def output_result_excel(self):
        """
        Excelausgabe
        """

        if self.status == pywraplp.Solver.OPTIMAL or self.status == pywraplp.Solver.FEASIBLE:
            self.mitarbeiter_arbeitszeiten = {}
            for i in self.mitarbeiter:
                self.mitarbeiter_arbeitszeiten[i] = []
                for j in range(self.calc_time):
                    arbeitszeit_pro_tag = []
                    for k in range(len(self.verfügbarkeit[i][j])):
                        arbeitszeit_pro_tag.append(int(self.x[i, j, k].solution_value()))
                    self.mitarbeiter_arbeitszeiten[i].append(arbeitszeit_pro_tag)
            print(self.mitarbeiter_arbeitszeiten)
        if self.status == pywraplp.Solver.OPTIMAL:
            print("Optimal solution found.")
        elif self.status == pywraplp.Solver.FEASIBLE:
            print("Feasible solution found.")
        elif self.status == pywraplp.Solver.INFEASIBLE:
            print("Problem is infeasible.")
        elif self.status == pywraplp.Solver.UNBOUNDED:
            print("Problem is unbounded.")
        elif self.status == pywraplp.Solver.NOT_SOLVED:
            print("Solver did not solve the problem.")
        else:
            print("Unknown status.")


        # Ergebnisse ausgeben Excel ----------------------------------------------------------------------------------------------
        data = self.mitarbeiter_arbeitszeiten

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
        headers = ["user_id"]
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
