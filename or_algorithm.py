import pandas as pd
import datetime
import pymysql
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font
from openpyxl.utils import get_column_letter
from ortools.linear_solver import pywraplp
from data_processing import DataProcessing
from app import app, db
from sqlalchemy import text
from models import Timetable, User


"""
To-Do Liste:

Prio 1:

 - (erl.) NB6: Max. einen Arbeitsblock pro Tag
 - (erl.) die calc_time soll automatisch errechnet werden
 - (erl.) Als Key oder i für MA soll nicht mehr MA1, MA2 usw stehen, sondern die user_id (zB. 1002)
 - (erl.) Shifts/Employment_level aus der Datenbank ziehen
 - (erl.) auf Viertelstunden wechseln
 - (erl.) Gerechte Verteilung Anpassen, das Stunden von "Perm" Mitarbeiter abgezogen werden
 - (erl.) Weiche NB4 implementieren, hat noch nicht wunschgemäss geklappt


 To-Do's 
 -------------------------------
 1. Weiche NB3 überprüfen ob alles richtig definiert wurde
 2. exponentieller Anstieg der Kosten in den weichen NBs
 3. Die Kosten der weichen NBs müssen mit einer reihe von Tests erprobt werden, dafür 3-4 Firmen erstellen und alles mögliche durchtesten und dokumentieren/auswerten.
    Tests wenn möglich auf dem eigenen Rechner laufen lassen.

 - (80%) Den Übergang auf harte und weiche NBs machen? 
 - (80%) Die gesolvten Daten in der Datenbank speichern
 - (10%) Eine if Anweseiung, wenn der Betrieb an einem Tag geschlossen hat. Dann soll an diesem Tag nicht gesolvet werden


 Fragen an die Runde:
 -------------------------------
 - MA mit verschiedenen Profilen - Department (Koch, Service, ..)? Wie genau lösen wir das?
 - Was machen wenn nicht genug Stunden von MA eingegeben wurden? Einen virtuellen MA der anzeigt, an welchen Stunden noch MA eingeteilt werden müssen?
   Andere Vorschläge?
 - Sobald gesolvt wird, kann die Webseite nicht mehr bedient werden. Wie können wir das lösen?
   "Eine Möglichkeit, dies zu umgehen, wäre, die Berechnung in einen Hintergrundprozess oder einen separaten Thread zu verschieben."
   "Sie könnten einen Hintergrund-Worker wie Celery verwenden, um die Optimierungsaufgabe zu verwalten."
 - Wie oft darf gesolvt werden? zb. max 2x pro Woche?

 - Die gerechte Verteilung geht über die max Stunden hinaus wenn zuviele MA benötigt werden und zu wenige Stunden eingegeben wurden?
 -------------------------------


 - working_h noch diskutieren, ist das max. arbeitszeit oder norm Arbeiszeit?
 - Jeder MA muss vor dem Solven eingegeben haben, wann er arbeiten kann. Auch wenn es alles 0 sind.
 - Daten für Solven in die Datenbank einpflegen (max. Zeit, min. Zeit, Solvingzeitraum, Toleranz für die Stundenverteilung, ...)


Prio 2:
 - start_time und end_time zwei und drei noch implementieren
 - der Admin kann auch die Kosten der MA, wenn er will, eintragen. 


"""

class ORAlgorithm:
    def __init__(self, dp: DataProcessing):
        self.current_user_id = dp.current_user_id           # 100     
        self.user_availability = dp.user_availability       # 101
        self.opening_hours = dp.opening_hours               # 102
        self.laden_oeffnet = dp.laden_oeffnet               # 103
        self.laden_schliesst = dp.laden_schliesst           # 104
        self.binary_availability = dp.binary_availability   # 105
        self.company_shifts = dp.company_shifts             # 106
        self.employment_lvl = dp.employment_lvl             # 107
        self.time_req = dp.time_req                         # 108    
        self.user_employment = dp.user_employment           # 109

        # Attribute der Methode "create_variables"
        self.mitarbeiter = None                             # 1
        self.verfügbarkeit = {}                             # 2
        self.kosten = None                                  # 3
        self.max_zeit = None                                # 4
        self.min_zeit = None                                # 5
        self.working_h = None                               # 6   
        self.calc_time = None                               # 7
        self.employment_lvl_exact = []                      # 8
        self.employment = []                                # 9
        self.verteilbare_stunden = None                     # 10
        self.stunden_pro_tag = None                         # 11
        self.gesamtstunden_verfügbarkeit = []               # 12
        self.min_anwesend = []                              # 13
        self.gerechte_verteilung = []                       # 14

        # Attribute der Methode "solver_selection"
        self.solver = None               

        # Attribute der Methode "define_penalty_costs"
        self.penalty_cost_nb2 = None
        self.penalty_cost_nb3 = None
        self.penalty_cost_nb4_min = None
        self.penalty_cost_nb4_max = None
        self.penalty_cost_nb5 = None
        self.penalty_cost_nb6 = None
        self.penalty_cost_nb7_min = None
        self.penalty_cost_nb7_max = None


        # Attribute der Methode "decision_variables"
        self.x = None
        self.y = None
        self.s = None
        self.a = None
        self.c = None # -- IN BEARBEITUNG 01.07.2023 --

        # Attribute der Methode "violation_variables"
        self.nb2_violation = {}
        self.nb3_violation = {}
        self.nb4_min_violation = {}
        self.nb4_max_violation = {}
        self.nb5_violation = {}
        self.nb6_violation = {}
        self.nb7_violation = {}

        # Attribute der Methode "objective_function"
        self.objective = None

        # Attribute der Methode "solve_problem"
        self.status = None

        # Attribute der Methode "store_solved_data"
        self.mitarbeiter_arbeitszeiten = {}


    def run(self):
        self.create_variables()
        self.show_variables()
        self.pre_check_programmer()
        self.pre_check_admin()
        self.solver_selection()
        self.define_penalty_costs()
        self.decision_variables()
        self.violation_variables()

        self.objective_function()
        self.constraints()
        self.solve_problem()
        self.store_solved_data()
        self.output_result_excel()

        self.save_data_in_database()


    def create_variables(self):
        """
        Allgemeine Variabeln
        """

        # -- 1 -- 
        # user_ids Liste, wird als Key in der Ausgabe verwendet
        self.mitarbeiter = [user_id for user_id in self.binary_availability]

        # -- 2 --
        # Aus dem binary_availability dict. die Verfügbarkeits-Informationen ziehen
        for i, (user_id, availabilities) in enumerate(self.binary_availability.items()):
            self.verfügbarkeit[self.mitarbeiter[i]] = []
            for day_availability in availabilities:
                date, binary_list = day_availability
                self.verfügbarkeit[self.mitarbeiter[i]].append(binary_list)

        # -- 3 --
        # Kosten für jeden MA noch gleich, ebenfalls die max Zeit bei allen gleich
        self.kosten = {ma: 20 for ma in self.mitarbeiter}  # Kosten pro Stunde

        # -- 4 --
        self.max_zeit = {ma: 9*4 for ma in self.mitarbeiter}  # Maximale Arbeitszeit pro Tag

        # -- 5 --
        self.min_zeit = {ma: 3*4 for ma in self.mitarbeiter}  # Minimale Arbeitszeit pro Tag

        # -- 6 --
        # Maximale Arbeitszeit pro woche, wird später noch aus der Datenbank gezogen
        self.working_h = 42*4   

        # -- 7 --
        # Berechnung der calc_time (Anzahl Tage an denen die MA eingeteilt werden)
        # Es werden nur die Tage des ersten MA berechnet, da jeder MA die gleiche Wochenlänge hat
        self.calc_time = len(next(iter(self.binary_availability.values())))

        # -- 8 --
        # Empolyment_level aus dem employment_lvl dict in einer Liste speichern (nur MA die berücksichtigt werden)
        # Iterieren Sie über die Schlüssel in binary_availability
        for user_id in self.binary_availability.keys():
            # Prüfen Sie, ob die user_id in employment_lvl vorhanden ist
            if user_id in self.employment_lvl:
                # Fügen Sie den entsprechenden employment_lvl Wert zur Liste hinzu
                self.employment_lvl_exact.append(self.employment_lvl[user_id])
        # self.employment_lvl_exact = [1, 0.8, 0.8, 0.6, 0.6] # Damit die Liste noch selbst manipuliert werden kann.

        # -- 9 --
        # Iteration of the key within binary_availability
        for user_id in self.binary_availability.keys():
            if user_id in self.user_employment:
                self.employment.append(self.user_employment[user_id])
        # self.employment = ["Perm", "Temp", "Temp", "Temp", "Temp"] # selbst manipuliert

        # -- 10 --
        # verteilbare Stunden (Wieviele Mannstunden benötigt die Firma im definierten Zeitraum)
        self.verteilbare_stunden = 0
        for date in self.time_req:
            for hour in self.time_req[date]:
                self.verteilbare_stunden += self.time_req[date][hour]
                self.verteilbare_stunden = self.verteilbare_stunden

        # -- 11 --
        # gesamtstunden Verfügbarkeit pro MA pro Woche
        self.stunden_pro_tag = 1 # flexibler wenn einmal 1/4h eingebaut werden          !!!  -- EVTL KANN DAS GANZ RAUSGELÖSCHT WERDEN --  !!!

        # -- 12 --
        for key in self.binary_availability:
            gesamt_stunden = sum(sum(day_data[1]) * self.stunden_pro_tag for day_data in self.binary_availability[key])
            self.gesamtstunden_verfügbarkeit.append(gesamt_stunden)

        # -- 13 --
        # Eine Liste mit den min. anwesendheiten der MA wird erstellt
        for _, values in sorted(self.time_req.items()):
            self.min_anwesend.append(list(values.values()))

        # -- 14 --
        # Eine Liste mit den Stunden wie sie gerecht verteilt werden
        list_gesamtstunden = []
        for i in range(len(self.mitarbeiter)):
            if self.gesamtstunden_verfügbarkeit[i] > self.working_h:
                arbeitsstunden_MA = self.employment_lvl_exact[i] * self.working_h
            else:
                arbeitsstunden_MA = self.employment_lvl_exact[i] * self.gesamtstunden_verfügbarkeit[i]
            list_gesamtstunden.append(int(arbeitsstunden_MA))
        print("list_gesamtstunden: ", list_gesamtstunden)

        # Berechnung der Arbeitsstunden für Perm und Temp Mitarbeiter
        total_hours_assigned = 0
        temp_employees = []
        self.gerechte_verteilung = [0 for _ in range(len(self.mitarbeiter))]  # Initialisiere die Liste mit Platzhaltern
        print("1. self.gerechte_verteilung: ", self.gerechte_verteilung)
        for i in range(len(self.mitarbeiter)):
            if self.employment[i] == "Perm":
                allocated_hours = self.employment_lvl_exact[i] * self.working_h
                total_hours_assigned += allocated_hours
                self.gerechte_verteilung[i] = round(allocated_hours + 0.5)
            else:
                temp_employees.append(i)
        print("2. self.gerechte_verteilung: ", self.gerechte_verteilung)

        remaining_hours = self.verteilbare_stunden - total_hours_assigned
        print("remaining_hours: ", remaining_hours)
        for i in temp_employees:
            temp_hours = remaining_hours * (self.employment_lvl_exact[i] / sum(self.employment_lvl_exact[j] for j in temp_employees))
            self.gerechte_verteilung[i] = round(temp_hours + 0.5)
        print("3. self.gerechte_verteilung: ", self.gerechte_verteilung)

        # Wenn die Rundung dazu geführt hat, dass total_hours_assigned die verteilbare_stunden überschreitet, werden die Stunden für Temp-Mitarbeiter angepasst
        total_hours_assigned = sum(self.gerechte_verteilung)
        print("remaining_hours2: ", remaining_hours)
        if total_hours_assigned > self.verteilbare_stunden:
            # Sortieren der Temp-Mitarbeiter nach zugeteilten Stunden in absteigender Reihenfolge
            temp_employees.sort(key=lambda i: self.gerechte_verteilung[i], reverse=True)
            print(temp_employees)
            # Überschüssigen Stunden von den Temp-Mitarbeitern abziehen, beginnend mit demjenigen mit den meisten Stunden
            for i in temp_employees:
                if total_hours_assigned == self.verteilbare_stunden:
                    break
                self.gerechte_verteilung[i] -= 1
                total_hours_assigned -= 1

        print("GERECHTE VERTEILUNG ORIGINAL:", self.gerechte_verteilung)
        print("Summe gerechte_verteilung: ", sum(self.gerechte_verteilung))



    def show_variables(self):
        """
        Wenn die Methode aktiviert wird, werden alle Attribute geprintet
        """

        # Attribute aus DataProcessing
        print("100. self.current_user_id: ", self.current_user_id) 
        print("101. self.user_availability: ", self.user_availability) 
        print("102. self.opening_hours: ", self.opening_hours) 
        print("103. self.laden_oeffnet: ", self.laden_oeffnet) 
        print("104. self.laden_schliesst: ", self.laden_schliesst) 
        print("105. self.binary_availability: ", self.binary_availability) 
        print("106. self.company_shifts: ", self.company_shifts) 
        print("107. self.employment_lvl: ", self.employment_lvl) 
        print("108. self.time_req: ", self.time_req) 
        print("109. user_employment: ", self.user_employment) 
        print()
        
        print("Attribute der Methode create_variables:")
        # Attribute der Methode "create_variables"
        print("1. self.mitarbeiter: ", self.mitarbeiter)
        print("2. self.verfügbarkeit: ")
        for key, value in self.verfügbarkeit.items():
            print("MA_id: ", key)
            print("Wert: ", value)
        print("3. self.kosten: ", self.kosten)
        print("4. self.max_zeit: ", self.max_zeit)
        print("5. self.min_zeit: ", self.min_zeit)
        print("6. self.working_h: ", self.working_h)
        print("7. self.calc_time: ", self.calc_time)
        print("8. self.empolyment_lvl_exact: ", self.employment_lvl_exact)
        print("9. self.employment: ", self.employment)
        print("10. self.verteilbare_stunden: ", self.verteilbare_stunden)
        print("11. self.stunden_pro_tag: ", self.stunden_pro_tag)
        print("12. self.gesamtstunden_verfügbarkeit: ", self.gesamtstunden_verfügbarkeit)
        print("13. self.min_anwesend: ", self.min_anwesend)
        print("14. self.gerechte_verteilung: ", self.gerechte_verteilung)



    def pre_check_programmer(self):
        """ 
        Vorüberprüfungen für den Programmierer
        """

        # Attribute der Methode "create_variables"
        # -- 1 -- 
        assert isinstance(self.mitarbeiter, list), "self.mitarbeiter sollte eine Liste sein"
        assert all(isinstance(ma, int) for ma in self.mitarbeiter), "Alle Elemente in self.mitarbeiter sollten Ganzzahlen sein"

        # -- 2 -- 
        assert isinstance(self.verfügbarkeit, dict), "self.verfügbarkeit sollte ein Wörterbuch sein"
        assert all(isinstance(val, list) for val in self.verfügbarkeit.values()), "Alle Werte in self.verfügbarkeit sollten Listen sein"
        assert len(self.verfügbarkeit) == len(self.mitarbeiter), "self.verfügbarkeit und self.mitarbeiter sollten die gleiche Länge haben"

        # -- 3 -- 
        assert isinstance(self.kosten, dict), "self.kosten sollte ein Wörterbuch sein"
        assert all(isinstance(kost, (int, float)) for kost in self.kosten.values()), "Alle Werte in self.kosten sollten Ganzzahlen oder Gleitkommazahlen sein"

        # -- 4 -- 
        assert isinstance(self.max_zeit, dict), "self.max_zeit sollte ein Wörterbuch sein"
        assert all(isinstance(zeit, (int, float)) for zeit in self.max_zeit.values()), "Alle Werte in self.max_zeit sollten Ganzzahlen oder Gleitkommazahlen sein"

        # -- 5 -- 
        assert isinstance(self.min_zeit, dict), "self.min_zeit sollte ein Wörterbuch sein"
        assert all(isinstance(zeit, (int, float)) for zeit in self.min_zeit.values()), "Alle Werte in self.min_zeit sollten Ganzzahlen oder Gleitkommazahlen sein"

        # -- 6 -- 
        assert isinstance(self.working_h, (int, float)), "self.working_h sollte eine Ganzzahl oder eine Gleitkommazahl sein"

        # -- 7 -- 
        assert isinstance(self.calc_time, int), "self.calc_time sollte eine Ganzzahl sein"

        # -- 8 -- 
        assert isinstance(self.employment_lvl_exact, list), "self.employment_lvl_exact sollte eine Liste sein"
        assert all(isinstance(level, (int, float)) for level in self.employment_lvl_exact), "Alle Elemente in self.employment_lvl_exact sollten Ganzzahlen oder Gleitkommazahlen sein"

        # -- 9 -- 
        assert isinstance(self.employment, list), "self.employment sollte eine Liste sein"
        assert all(isinstance(emp, str) for emp in self.employment), "Alle Elemente in self.employment sollten Zeichenketten sein"

        # -- 10 -- 
        assert isinstance(self.verteilbare_stunden, (int, float)), "self.verteilbare_stunden sollte eine Ganzzahl oder eine Gleitkommazahl sein"

        # -- 11 -- 
        assert isinstance(self.stunden_pro_tag, (int, float)), "self.stunden_pro_tag sollte eine Ganzzahl oder eine Gleitkommazahl sein"

        # -- 12 -- 
        assert isinstance(self.gesamtstunden_verfügbarkeit, list), "self.gesamtstunden_verfügbarkeit sollte eine Liste sein"
        assert all(isinstance(stunde, (int, float)) for stunde in self.gesamtstunden_verfügbarkeit), "Alle Elemente in self.gesamtstunden_verfügbarkeit sollten Ganzzahlen oder Gleitkommazahlen sein"

        # -- 13 -- 
        assert isinstance(self.min_anwesend, list), "self.min_anwesend sollte eine Liste sein"
        assert all(isinstance(val, list) for val in self.min_anwesend), "Alle Elemente in self.min_anwesend sollten Listen sein"

        

    def pre_check_admin(self):
        # Wenn die einzelnen Überprüfungen nicht standhalten, wird ein ValueError ausgelöst und jeweils geprintet, woran das Problem liegt. 
        # Später soll der Admin genau eine solche Meldung angezeigt bekommen.
        
        """
        ---------------------------------------------------------------------------------------------------------------
        1. Überprüfen ob die "Perm" Mitarbeiter mind. working_h Stunden einplant haben
        ---------------------------------------------------------------------------------------------------------------
        """
        for i in range(len(self.mitarbeiter)):
            if self.employment[i] == "Perm": 
                sum_availability_perm = 0
                for j in range(self.calc_time):
                    for k in range(len(self.verfügbarkeit[self.mitarbeiter[i]][j])):
                        sum_availability_perm += self.verfügbarkeit[self.mitarbeiter[i]][j][k]
                if sum_availability_perm < self.working_h:
                    raise ValueError(f"Fester Mitarbeiter mit ID {self.mitarbeiter[i]} hat nicht genügend Stunden geplant.")

        """
        ---------------------------------------------------------------------------------------------------------------
        2. Haben die MA mindestens die anzahl Stunden von gerechte_verteilung eingegeben?
        ---------------------------------------------------------------------------------------------------------------
        """
        errors = []

        for index, ma_id in enumerate(self.mitarbeiter):
            if self.employment[index] == 'Temp':
                total_hours_week = sum(sum(self.verfügbarkeit[ma_id][day]) for day in range(self.calc_time))
                if total_hours_week < self.gerechte_verteilung[index]:
                    errors.append(
                        f"Temp-Mitarbeiter {ma_id} hat nur {total_hours_week} Stunden in der Woche eingetragen. "
                        f"Das ist weniger als die erforderliche Gesamtstundenzahl von {self.gerechte_verteilung[index]} Stunden."
                    )
        if errors:
            raise ValueError("Folgende Fehler wurden gefunden:\n" + "\n".join(errors))

        """
        ---------------------------------------------------------------------------------------------------------------
        3. Haben alle MA zusammen genug Stunden eingegeben, um die verteilbaren Stunden zu erreichen?
        ---------------------------------------------------------------------------------------------------------------
        """
        total_hours_available = sum(self.gesamtstunden_verfügbarkeit)
        toleranz = 1 # Wenn man möchte, das die eingegebenen Stunden der MA höher sein müssen als die verteilbaren_stunden

        if total_hours_available < self.verteilbare_stunden * toleranz:
            raise ValueError(f"Die Mitarbeiter haben insgesamt nicht genug Stunden eingegeben, um die verteilbaren Stunden zu erreichen. Benötigte Stunden: {self.verteilbare_stunden}, eingegebene Stunden: {total_hours_available}, Toleranz: {toleranz}")

        """
        ---------------------------------------------------------------------------------------------------------------
        4. Ist zu jeder notwendigen Zeit (self.min_anwesend) die mindestanzahl Mitarbeiter verfügbar?
        ---------------------------------------------------------------------------------------------------------------
        """
        for i in range(len(self.min_anwesend)):  # Für jeden Tag in der Woche
            for j in range(len(self.min_anwesend[i])):  # Für jede Stunde am Tag
                if sum([self.verfügbarkeit[ma][i][j] for ma in self.mitarbeiter]) < self.min_anwesend[i][j]:
                    raise ValueError(f"Es sind nicht genügend Mitarbeiter verfügbar zur notwendigen Zeit (Tag {i+1}, Stunde {j+1}).")

        """
        ---------------------------------------------------------------------------------------------------------------
        5. Können die MA die min. Zeit täglich erreichen? Wenn 0 Stunden eingegeben wurden, läuft es durch!
        ---------------------------------------------------------------------------------------------------------------
        """
        errors = []
        for ma in self.mitarbeiter:
            for day in range(self.calc_time):
                total_hours = sum(self.verfügbarkeit[ma][day])
                if 0 < total_hours < self.min_zeit[ma]:
                    errors.append(
                        f"Mitarbeiter {ma} hat am Tag {day+1} nur {total_hours/4} Stunden eingetragen. "
                        f"Das ist weniger als die Mindestarbeitszeit von {self.min_zeit[ma]/4} Stunden."
                    )
        if errors:
            raise ValueError("Folgende Fehler wurden gefunden:\n" + "\n".join(errors))



    def solver_selection(self):
        """
        Anwahl des geeigneten Solvers
        # GLOP = Simplex Verfahren
        # CBC =  branch-and-bound- und branch-and-cut-Verfahren
        # SCIP = Framework für die Lösung gemischt-ganzzahliger Programmierungsproblem
        # GLPK = Vielzahl von Algorithmen, einschließlich des Simplex-Verfahrens und des branch-and-bound-Verfahrens
        """
        self.solver = pywraplp.Solver.CreateSolver('SCIP')
        # self.solver.SetTimeLimit(20000)  # Zeitlimit auf 20 Sekunden (in Millisekunden)
        # self.solver.SetSolverSpecificParametersAsString("limits/gap=0.01") # Wenn der gap kleiner 1% ist, bricht der Solver ab



    def define_penalty_costs(self):
        """
        Definiere Strafkosten für weiche Nebenbedingungen
        """

        # NB 2 - Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend 
        self.penalty_cost_nb2 = 100

        # NB 3 - Max. Arbeitszeit pro Woche
        self.penalty_cost_nb3 = 100

        # NB 4 - Min. und Max. Arbeitszeit pro Tag
        self.penalty_cost_nb4_min = 100 # Strafkosten für Unterschreitung
        # self.penalty_cost_nb4_min = [0, 10, 50, 100, 300]

        self.penalty_cost_nb4_max = 100 # Strafkosten für Überschreitung

        # NB 7 - Feste Mitarbeiter zu employement_level fest einplanen (Achtung, pro 1/4h wird momentan bestraft!)
        self.penalty_cost_nb7_min = 100  # Strafkosten für Unterschreitung
        self.penalty_cost_nb7_max = 100  # Strafkosten für Überschreitung


        # Werden noch nicht gebraucht
        self.penalty_cost_nb5 = 100
        self.penalty_cost_nb6 = 100


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

        # Arbeitstagvariable
        self.a = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):  # Für jeden Tag der Woche
                self.a[i, j] = self.solver.BoolVar(f'a[{i}, {j}]') # Variablen können nur die Werte 0 oder 1 annehmen



        # Gleiche Schichten -- IN BEARBEITUNG 01.07.23 --
        self.c = {}
        for i in self.mitarbeiter:
            for j in range(1, self.calc_time):  # Von Tag 1 an, da es keinen Vortag für Tag 0 gibt
                self.c[i, j] = self.solver.BoolVar(f'c[{i}, {j}]')

        # Schichtvariable -- IN BEARBEITUNG 09.08.23 --
        self.s = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):  # Für jeden Tag der Woche
                self.s[i, j] = self.solver.IntVar(0, 1, f's[{i}, {j}]') # Variabeln können nur die Werte 0 oder 1 annehmen



    def violation_variables(self):
        """
        Verletzungsvariabeln

        Definiere Variablen für Nebenbedingungsverletzungen
        self.solver.NumVar(0, self.solver.infinity() <-- Von 0 bis unendlich. für infinity kann man auch eine Zahl einsetzen
        """
        # NB2 violation variable
        self.nb2_violation = {}
        for j in range(self.calc_time):
            for k in range(len(self.verfügbarkeit[self.mitarbeiter[0]][j])):
                self.nb2_violation[j, k] = self.solver.NumVar(0, self.solver.infinity(), f'nb2_violation[{j}, {k}]')
        # print("self.nb2_violation: ", self.nb2_violation)


        # NB3 violation variable
        self.nb3_violation = {}
        for i in self.mitarbeiter:
            self.nb3_violation[i] = self.solver.NumVar(0, self.solver.infinity(), f'nb3_violation[{i}]')
        # print("self.nb3_violation: ", self.nb3_violation)


        # NB4 Mindestarbeitszeit Verletzungsvariable
        self.nb4_min_violation = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.nb4_min_violation[i, j] = self.solver.NumVar(0, self.solver.infinity(), 'nb4_min_violation[%i,%i]' % (i, j))

        # NB4 Höchstarbeitszeit Verletzungsvariable
        self.nb4_max_violation = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.nb4_max_violation[i, j] = self.solver.NumVar(0, self.solver.infinity(), 'nb4_max_violation[%i,%i]' % (i, j))


        # NB7 Mindestarbeitszeit Verletzungsvariable
        self.nb7_min_violation = {}
        for i in self.mitarbeiter:
            self.nb7_min_violation[i] = self.solver.NumVar(0, self.solver.infinity(), f'nb7_min_violation[{i}]')

        # NB7 Höchstarbeitszeit Verletzungsvariable
        self.nb7_max_violation = {}
        for i in self.mitarbeiter:
            self.nb7_max_violation[i] = self.solver.NumVar(0, self.solver.infinity(), f'nb7_max_violation[{i}]')


        

    def objective_function(self):
        """
        Zielfunktion
        """
        self.objective = self.solver.Objective()

        # Kosten MA + NB2
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                for k in range(len(self.verfügbarkeit[i][j])):
                    # Die Kosten werden multipliziert
                    self.objective.SetCoefficient(self.x[i, j, k], self.kosten[i])
                    self.objective.SetCoefficient(self.nb2_violation[j, k], self.penalty_cost_nb2)

        # Kosten NB3
        for i in self.mitarbeiter:
            self.objective.SetCoefficient(self.nb3_violation[i], self.penalty_cost_nb3)

        # Kosten für NB4 Mindestarbeitszeit Verletzung
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.objective.SetCoefficient(self.nb4_min_violation[i, j], self.penalty_cost_nb4_min)

        # Kosten für NB4 Höchstarbeitszeit Verletzung
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.objective.SetCoefficient(self.nb4_max_violation[i, j], self.penalty_cost_nb4_max)

        # Kosten für NB7 Mindestarbeitszeit Verletzung
        for i in self.mitarbeiter:
            self.objective.SetCoefficient(self.nb7_min_violation[i], self.penalty_cost_nb7_min)

        # Kosten für NB7 Höchstarbeitszeit Verletzung
        for i in self.mitarbeiter:
            self.objective.SetCoefficient(self.nb7_max_violation[i], self.penalty_cost_nb7_max)


        # Es wird veruscht, eine Kombination von Werten für die x[i, j, k] zu finden, die die Summe kosten[i]*x[i, j, k] minimiert + weiche NBs            
        self.objective.SetMinimization()



    def constraints(self):
        """
        Beschränkungen / Nebenbedingungen
        # (Die solver.Add() Funktion nimmt eine Bedingung als Argument und fügt sie dem Optimierungsproblem hinzu.)
        """

        # -------------------------------------------------------------------------------------------------------
        # HARTE NB -- NEU 08.08.2023 --
        # NB 0 - Variable a ist 1, wenn der Mitarbeiter an einem Tag arbeitet, sonst 0
        # -------------------------------------------------------------------------------------------------------
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                # sum_x ist die Summe an der ein MA am Tag arbeiten kann
                sum_x = self.solver.Sum(self.x[i, j, k] for k in range(len(self.verfügbarkeit[i][j])))
                self.solver.Add(self.a[i, j] >= sum_x * 1.0 / (len(self.verfügbarkeit[i][j]) + 1))
                self.solver.Add(self.a[i, j] <= sum_x)


        # -------------------------------------------------------------------------------------------------------
        # HARTE NB
        # NB 1 - MA nur einteilen, wenn er verfügbar ist. 
        # -------------------------------------------------------------------------------------------------------
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                for k in range(len(self.verfügbarkeit[i][j])):
                    self.solver.Add(self.x[i, j, k] <= self.verfügbarkeit[i][j][k])


        # -------------------------------------------------------------------------------------------------------
        # HARTE NB
        # NB 2 - Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend
        # -------------------------------------------------------------------------------------------------------
        for j in range(self.calc_time):
            for k in range(len(self.verfügbarkeit[self.mitarbeiter[0]][j])):  # Wir nehmen an, dass alle Mitarbeiter die gleichen Öffnungszeiten haben
                self.solver.Add(self.solver.Sum([self.x[i, j, k] for i in self.mitarbeiter]) >= self.min_anwesend[j][k])
        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB -- NEU 26.07.2023 --
        # NB 2 - Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend 
        # -------------------------------------------------------------------------------------------------------
        for j in range(self.calc_time):
            for k in range(len(self.verfügbarkeit[self.mitarbeiter[0]][j])):  # Wir nehmen an, dass alle Mitarbeiter die gleichen Öffnungszeiten haben
                self.solver.Add(self.solver.Sum([self.x[i, j, k] for i in self.mitarbeiter]) - self.min_anwesend[j][k] <= self.nb2_violation[j, k])


        """
        # HARTE NB
        # NB 3 - Max. Arbeitszeit pro Woche 
        total_hours = {ma: self.solver.Sum([self.x[ma, j, k] for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
        for ma in self.mitarbeiter:
            self.solver.Add(total_hours[ma] <= self.working_h)
        """

        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB -- NEU 28.07.2023 -- --> Muss noch genauer überprüft werden ob es funktioniert!
        # NB 3 - Max. Arbeitszeit pro Woche (für "Temp" Mitarbeiter)
        # -------------------------------------------------------------------------------------------------------
        total_hours = {ma: self.solver.Sum([self.x[ma, j, k] for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
        for ma in self.mitarbeiter:
            self.solver.Add(total_hours[ma] - self.working_h <= self.nb3_violation[ma]) 

        
    
     
        """
        # HARTE NB
        # NB 4 - Min. und Max. Arbeitszeit pro Tag
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                # Prüfen, ob der Mitarbeiter an diesem Tag arbeiten kann (z.B. [0, 1, 1] = sum(2))

                # Wenn diese Bedingung nicht erfüllt ist, kann die min und max Zeit verletzt werden! Ändern

                if sum(self.verfügbarkeit[i][j]) >= self.min_zeit[i]:
                    sum_hour = self.solver.Sum(self.x[i, j, k] for k in range(len(self.verfügbarkeit[i][j])))
                    # Es ist nötig, das die min und die max Zeit implementiert ist. 
                    self.solver.Add(sum_hour >= self.min_zeit[i] * self.a[i, j])
                    # NB 4.1 - Die Arbeitszeit eines Mitarbeiters an einem Tag kann nicht mehr als die maximale Arbeitszeit pro Tag betragen
                    self.solver.Add(sum_hour <= self.max_zeit[i] * self.a[i, j])
        """

        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB -- NEU 31.07.2023 --
        # NB 4 - Min. und Max. Arbeitszeit pro Tag
        # -------------------------------------------------------------------------------------------------------
        for i in self.mitarbeiter:
            for j in range(self.calc_time):

                # Wenn die if Bedingung auskommentiert wird, dann wird die min und max Zeit im gleichen Masse verteilt, funktioniert aber noch nicht!

                # if sum(self.verfügbarkeit[i][j]) >= self.min_zeit[i]:
                    sum_hour = self.solver.Sum(self.x[i, j, k] for k in range(len(self.verfügbarkeit[i][j])))

                    
                    # Prüfen, ob die Summe der Arbeitsstunden kleiner als die Mindestarbeitszeit ist
                    self.solver.Add(sum_hour - self.min_zeit[i] * self.a[i, j] >= -self.nb4_min_violation[i, j])
                    self.solver.Add(self.nb4_min_violation[i, j] >= 0)

                    
                    # Prüfen, ob die Summe der Arbeitsstunden größer als die maximale Arbeitszeit ist
                    self.solver.Add(sum_hour - self.max_zeit[i] * self.a[i, j] <= self.nb4_max_violation[i, j])
                    self.solver.Add(self.nb4_max_violation[i, j] >= 0)


        # -------------------------------------------------------------------------------------------------------
        # HARTE NB
        # NB 5 - Anzahl Arbeitsblöcke
        # -------------------------------------------------------------------------------------------------------
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                # Für die erste Stunde des Tages
                self.solver.Add(self.y[i, j, 0] >= self.x[i, j, 0])
                # Für die restlichen Stunden des Tages
                for k in range(1, len(self.verfügbarkeit[i][j])):
                    self.solver.Add(self.y[i, j, k] >= self.x[i, j, k] - self.x[i, j, k-1])
                # Die Summe der y[i, j, k] für einen bestimmten Tag j sollte nicht größer als 1 sein
                self.solver.Add(self.solver.Sum(self.y[i, j, k] for k in range(len(self.verfügbarkeit[i][j]))) <= 1)
        

        # -------------------------------------------------------------------------------------------------------
        # HARTE NB --> Könnte man sogar lassen mit der Toleranz? Toleranz kann vom Admin geändert werden...
        # NB 6 - Verteilungsgrad MA
        # -------------------------------------------------------------------------------------------------------
        verteilungsstunden = {ma: self.solver.Sum([self.x[ma, j, k] for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
        tolerance = 0.3 # Toleranz später noch auslagern
        for i, ma in enumerate(self.mitarbeiter):
            lower_bound = self.gerechte_verteilung[i] * (1 - tolerance)
            upper_bound = self.gerechte_verteilung[i] * (1 + tolerance)
            self.solver.Add(verteilungsstunden[ma] <= upper_bound)
            self.solver.Add(verteilungsstunden[ma] >= lower_bound)


        """
        # HARTE NB
        # NB 7 - Feste Mitarbeiter zu employement_level fest einplanen
        total_hours = {ma: self.solver.Sum([self.x[ma, j, k] for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
        for i, ma in enumerate(self.mitarbeiter):
            if self.employment[i] == "Perm": 
                self.solver.Add(total_hours[ma] == self.working_h)
        """
        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB -- NEU 08.08.23 --
        # NB 7 - "Perm" Mitarbeiter zu employement_level fest einplanen
        # -------------------------------------------------------------------------------------------------------
        total_hours = {ma: self.solver.Sum(self.x[ma, j, k] for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))) for ma in self.mitarbeiter}
        for i, ma in enumerate(self.mitarbeiter):
            if self.employment[i] == "Perm": 
                # Prüfen, ob die Gesamtstunden kleiner als die vorgegebenen Arbeitsstunden sind (Unterschreitung)
                self.solver.Add(total_hours[ma] - self.working_h <= self.nb7_min_violation[ma])
                self.solver.Add(self.nb7_min_violation[ma] >= 0)

                # Prüfen, ob die Gesamtstunden größer als die vorgegebenen Arbeitsstunden sind (Überschreitung)
                self.solver.Add(self.working_h - total_hours[ma] <= -self.nb7_max_violation[ma])
                self.solver.Add(self.nb7_max_violation[ma] >= 0)


        # -- IN BEARBEITUNG 09.08.2023

        # self.company_shifts  <-- Anzahl Schichten der Company!

        
        # HARTE NB
        # NB 8 - Innerhalb einer Woche immer gleiche Schichten
        # Definition der Schicht für jeden Mitarbeiter und Tag basierend auf Arbeitsstunden
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                first_shift_hours = self.solver.Sum(self.x[i, j, k] for k in range(0, int(len(self.verfügbarkeit[i][j]) / 2))) # Stunden in der ersten Schicht
                second_shift_hours = self.solver.Sum(self.x[i, j, k] for k in range(int(len(self.verfügbarkeit[i][j]) / 2), len(self.verfügbarkeit[i][j]))) # Stunden in der zweiten Schicht
                
                # Kann 0 oder 1 annehmen
                delta = self.solver.BoolVar("delta")
                
                self.solver.Add(first_shift_hours - second_shift_hours - 1000 * delta <= 0)
                self.solver.Add(second_shift_hours - first_shift_hours - 1000 * (1 - delta) <= 0)
                
                # Hilfsvariable mit s[i, j] verknüpfen
                self.solver.Add(self.s[i, j] == delta)

        # Bedingungen für gleiche Schicht innerhalb einer Woche
        for i in self.mitarbeiter:
            for j in range(1, self.calc_time): # Beginnt bei 1, da es keinen Vortag für Tag 0 gibt
                self.solver.Add(self.s[i, j] == self.s[i, j - 1]) # Gleiche Schicht wie am Vortag
        

        """
        # HARTE NB
        # NB 9 - Wechselnde Schichten innerhalb von 2 Wochen
        for i in self.mitarbeiter:
            for j in range(1, self.calc_time):  # Von Tag 1 an, da es keinen Vortag für Tag 0 gibt
                week_number = j // 7
                # Wenn wir in eine neue Woche wechseln, setzen Sie c[i, j] auf den Wert von s[i, j - 1]
                if j % 7 == 0:
                    self.solver.Add(self.c[i, j] == self.s[i, j - 1])

                # Wenn wir uns in einer ungeraden Woche befinden, muss die Schicht anders sein als in der vorherigen Woche
                if week_number % 2 != 0:
                    self.solver.Add(self.s[i, j] != self.c[i, j])
        """



    def solve_problem(self):
        """
        Problem lösen und Kosten ausgeben
        """
        self.solver.EnableOutput()
        self.status = self.solver.Solve()

        # Kosten für die Einstellung von Mitarbeitern
        hiring_costs = sum(self.kosten[i] * self.x[i, j, k].solution_value() for i in self.mitarbeiter for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[i][j])))

        # Strafen für die Verletzung der weichen Nebenbedingungen
        nb2_penalty_costs = sum(self.penalty_cost_nb2 * self.nb2_violation[j, k].solution_value() for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[self.mitarbeiter[0]][j])))
        nb3_penalty_costs = sum(self.penalty_cost_nb3 * self.nb3_violation[i].solution_value() for i in self.mitarbeiter)
        nb4_min_penalty_costs = sum(self.penalty_cost_nb4_min * self.nb4_min_violation[i, j].solution_value() for i in self.mitarbeiter for j in range(self.calc_time))
        nb4_max_penalty_costs = sum(self.penalty_cost_nb4_max * self.nb4_max_violation[i, j].solution_value() for i in self.mitarbeiter for j in range(self.calc_time))
        # nb7_penalty_costs = sum(self.penalty_cost_nb7 * self.nb7_violation[i].solution_value() for i in self.mitarbeiter)
        nb7_min_penalty_costs = sum(self.penalty_cost_nb7_min * self.nb7_min_violation[i].solution_value() for i in self.mitarbeiter)
        nb7_max_penalty_costs = sum(self.penalty_cost_nb7_max * self.nb7_max_violation[i].solution_value() for i in self.mitarbeiter)


        # Drucken Sie die Kosten
        print('Kosten Einstellung von Mitarbeitern:', hiring_costs)
        print('Kosten NB2 (Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend):', nb2_penalty_costs)
        print('Kosten NB3 (Max. Arbeitszeit pro Woche "Temp" MA):', nb3_penalty_costs)
        print('Kosten NB4 (Min. Arbeitszeit pro Tag):', nb4_min_penalty_costs)
        print('Kosten NB4 (Max. Arbeitszeit pro Tag):', nb4_max_penalty_costs)
        # print('Kosten NB7 (Feste Mitarbeiter zu employment_level fest einplanen):', nb7_penalty_costs)
        print('Kosten NB7 (Unterschreitung der festen Mitarbeiter zu employment_level):', nb7_min_penalty_costs)
        print('Kosten NB7 (Überschreitung der festen Mitarbeiter zu employment_level):', nb7_max_penalty_costs)
        print('Gesamtkosten:', self.objective.Value())



    def store_solved_data(self):
        """
        mitarbeiter_arbeitszeiten Attribut befüllen
        """
        if self.status == pywraplp.Solver.OPTIMAL or self.status == pywraplp.Solver.FEASIBLE:
            for i in self.mitarbeiter:
                self.mitarbeiter_arbeitszeiten[i] = []
                for j in range(self.calc_time):
                    arbeitszeit_pro_tag = []
                    for k in range(len(self.verfügbarkeit[i][j])):
                        arbeitszeit_pro_tag.append(int(self.x[i, j, k].solution_value()))
                    self.mitarbeiter_arbeitszeiten[i].append(arbeitszeit_pro_tag)
            print(self.mitarbeiter_arbeitszeiten)

        if self.status == pywraplp.Solver.OPTIMAL:
            print("Optimale Lösung gefunden.")
        elif self.status == pywraplp.Solver.FEASIBLE:
            print("Mögliche Lösung gefunden.")
        elif self.status == pywraplp.Solver.INFEASIBLE:
            print("Problem ist unlösbar.")
        elif self.status == pywraplp.Solver.UNBOUNDED:
            print("Problem ist unbeschränkt.")
        elif self.status == pywraplp.Solver.NOT_SOLVED:
            print("Solver hat das Problem nicht gelöst.")
        else:
            print("Unbekannter Status.")



    def output_result_excel(self):
        """
        Excel ausgabe
        """
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
        for i in range(1, len(data[list(data.keys())[0]]) + 1):
            headers.extend(["T{}, {}:{}".format(i, j+8, k*15) for j in range(10) for k in range(4)])
            headers.append(' ')
        headers.append("Total Hours") 
        ws.append(headers)

        # Ändern der Schriftgröße der Spaltentitel
        for cell in ws[1]:
            cell.font = header_font

        # Schreiben Sie die Daten
        for idx, (ma, days) in enumerate(data.items(), start=2):
            row = [ma]
            for day in days:
                quarter_hours = [h for h in day]
                row.extend(quarter_hours)
                row.append(' ')  # Fügt eine leere Spalte nach jedem Tag hinzu
            ws.append(row)
            ws.cell(row=idx, column=len(row) + 1, value=f"=SUM(B{idx}:{get_column_letter(len(row))}{idx})")


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



    def save_data_in_database(self):
        """ 
        Diese Methode speichert die berechneten Arbeitszeiten in der Datenbank 
        """
        with app.app_context():
            for user_id, days in self.mitarbeiter_arbeitszeiten.items(): # Durch mitarbeiter_arbeitszeiten durchitterieren
                print(f"Verarbeite Benutzer-ID: {user_id}")

                # Benutzer aus der Datenbank abrufen
                user = User.query.get(user_id)
                print(user)
                if not user:
                    print(f"Kein Benutzer gefunden mit ID: {user_id}")
                    continue

                for day_index, day in enumerate(days):
                    # Wir gehen davon aus, dass der erste Tag im 'self.user_availability' das Startdatum ist
                    date = self.user_availability[user_id][0][0] + datetime.timedelta(days=day_index)
                    print("DATE: ", date)
                    # Hier unterteilen wir den Tag in Schichten, basierend auf den Zeiten, zu denen der Mitarbeiter arbeitet
                    shifts = []
                    start_time_index = None
                    for time_index in range(len(day)):
                        if day[time_index] == 1 and start_time_index is None:
                            start_time_index = time_index
                        elif day[time_index] == 0 and start_time_index is not None:
                            shifts.append((start_time_index, time_index))
                            start_time_index = None
                    
                    if start_time_index is not None:
                        shifts.append((start_time_index, len(day)))

                    print(f"Berechnete Schichten für Benutzer-ID {user_id}, Tag-Index {day_index}: {shifts}")

                    for shift_index, (start_time, end_time) in enumerate(shifts):
                        # Ladenöffnungszeit am aktuellen Tag hinzufügen
                        opening_time_in_quarters = int(self.laden_oeffnet[day_index].total_seconds() / 900)
                        start_time += opening_time_in_quarters
                        end_time += opening_time_in_quarters

                        # Neues Timetable-Objekt
                        new_entry = Timetable(
                            id=None,  # ID wird automatisch generiert
                            email=user.email,
                            first_name=user.first_name,
                            last_name=user.last_name,
                            date=date,
                            start_time=datetime.datetime.combine(date, datetime.time(hour=start_time // 4, minute=(start_time % 4) * 15)),
                            end_time=datetime.datetime.combine(date, datetime.time(hour=end_time // 4, minute=(end_time % 4) * 15)),
                            start_time2=None,
                            end_time2=None,
                            start_time3=None,
                            end_time3=None,
                            created_by=self.current_user_id,
                            changed_by=self.current_user_id,
                            creation_timestamp=datetime.datetime.now()
                        )

                        # new_entry der Datenbank hinzufügen
                        db.session.add(new_entry)

            # Änderungen in der Datenbank speichern
            db.session.commit()

