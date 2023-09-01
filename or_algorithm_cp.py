import pandas as pd
import datetime
import pymysql
import time
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font
from openpyxl.utils import get_column_letter
from data_processing import DataProcessing
from app import app, db
from sqlalchemy import text
from models import Timetable, User, SolverAnalysis

# New 
from ortools.sat.python import cp_model

class ORAlgorithm_cp:
    def __init__(self, dp: DataProcessing):
        self.current_user_id = dp.current_user_id           # 100     
        self.user_availability = dp.user_availability       # 101
        self.opening_hours = dp.opening_hours               # 102
        self.laden_oeffnet = dp.laden_oeffnet               # 103
        self.laden_schliesst = dp.laden_schliesst           # 104
        self.binary_availability = dp.binary_availability   # 105
        self.company_shifts = dp.company_shifts             # 106
        self.weekly_hours = dp.weekly_hours                 # 107
        self.employment_lvl = dp.employment_lvl             # 108
        self.time_req = dp.time_req                         # 109    
        self.user_employment = dp.user_employment           # 110
        self.solver_requirements = dp.solver_requirements   # 111
        self.week_timeframe = dp.week_timeframe             # 112
        self.hour_devider = dp.hour_devider                 # 113

        # Attribute der Methode "create_variables"
        self.mitarbeiter = None                             # 1
        self.verfügbarkeit = {}                             # 2
        self.kosten = None                                  # 3
        self.max_zeit = None                                # 4
        self.min_zeit = None                                # 5
        self.max_time_week = None                           # 6   
        #self.weekly_hours (* self.hour_devider)            # 7
        self.calc_time = None                               # 8
        self.employment_lvl_exact = []                      # 9
        self.employment = []                                # 10
        self.verteilbare_stunden = None                     # 11
        self.gesamtstunden_verfügbarkeit = []               # 12
        self.min_anwesend = []                              # 13
        self.gerechte_verteilung = []                       # 14
        self.fair_distribution = None                       # 15

        self.desired_max_time_day = None
        self.max_time_day = None
        self.desired_min_time_day = None
        self.min_time_day = None

        # Attribute der Methode "solver_selection"
        self.solver = None               

        # Attribute der Methode "define_penalty_costs"
        self.penalty_cost_nb1 = None
        self.penalty_cost_nb2 = None
        self.penalty_cost_nb3_min = None
        self.penalty_cost_nb4_max = None
        self.penalty_cost_nb5_min = None
        self.penalty_cost_nb6_max = None
        self.penalty_cost_nb7 = None
        self.penalty_cost_nb8 = None
        self.penalty_cost_nb9 = None
        self.penalty_cost_nb10 = None

        # Attribute der Methode "decision_variables"
        self.x = None
        self.y = None
        self.a = None
        self.s2 = None
        self.s3 = None
        self.c = None 

        # Attribute der Methode "violation_variables"
        self.nb1_violation = {}
        self.nb2_violation = {}
        self.nb3_min_violation = {}
        self.nb4_max_violation = {}
        self.nb5_min_violation = {}
        self.nb6_max_violation = {}
        self.nb7_violation = {}
        self.nb8_violation = {}
        self.nb9_violation = {}
        self.nb10_violation = {}

        # Attribute der Methode "objective_function"
        self.objective = None

        # Attribute der Methode "solve_problem"
        self.status = None
        self.solving_time_seconds = None

        self.violation_nb1 = None
        self.violation_nb2 = None
        self.violation_nb3 = None
        self.violation_nb4 = None
        self.violation_nb5 = None
        self.violation_nb6 = None
        self.violation_nb7 = None
        self.violation_nb8 = None
        self.violation_nb9 = None
        self.violation_nb10 = None

        self.hiring_costs = None
        self.nb1_penalty_costs = None
        self.nb2_penalty_costs = None
        self.nb3_min_penalty_costs = None
        self.nb4_max_penalty_costs = None
        self.nb5_min_penalty_costs = None
        self.nb6_max_penalty_costs = None
        self.nb7_penalty_costs = None
        self.nb8_penalty_costs = None
        self.nb9_penalty_costs = None
        self.nb10_penalty_costs = None

        # Attribute der Methode "store_solved_data"
        self.mitarbeiter_arbeitszeiten = {}

    def run(self):
        self.create_variables()
        # self.show_variables()
        # self.pre_check_programmer()
        # self.pre_check_admin()
        # self.solver_selection()
        # self.define_penalty_costs()
        # self.decision_variables()
        # self.violation_variables()
        # self.objective_function()
        # self.constraints()
        # self.solve_problem()
        # self.store_solved_data()
        # self.output_result_excel()
        # self.save_data_in_database()
        # self.save_data_in_database_testing()


    def create_variables(self):
        """
        Allgemeine Variabeln
        """
        # -- 1 ------------------------------------------------------------------------------------------------------------
        # user_ids Liste, wird als Key in der Ausgabe verwendet
        self.mitarbeiter = [user_id for user_id in self.binary_availability]

        # -- 2 ------------------------------------------------------------------------------------------------------------
        # Aus dem binary_availability dict. die Verfügbarkeits-Informationen ziehen
        for i, (user_id, availabilities) in enumerate(self.binary_availability.items()):
            self.verfügbarkeit[self.mitarbeiter[i]] = []
            for day_availability in availabilities:
                date, binary_list = day_availability
                self.verfügbarkeit[self.mitarbeiter[i]].append(binary_list)

        # -- 3 --
        # Kosten für jeden MA noch gleich, ebenfalls die max Zeit bei allen gleich
        self.kosten = {ma: 100 for ma in self.mitarbeiter}  # Kosten pro Stunde

        # -- 4 ------------------------------------------------------------------------------------------------------------
        key = "desired_max_time_day"
        if key in self.solver_requirements:
            self.desired_max_time_day = self.solver_requirements[key]
        self.desired_max_time_day = self.desired_max_time_day * self.hour_devider

        key = "max_time_day"
        if key in self.solver_requirements:
            self.max_time_day = self.solver_requirements[key]
        self.max_time_day = self.max_time_day * self.hour_devider             
        
        # Es wird weiterhin ein dict generiert, falls in Zukunft die max_time pro MA verschieden wird
        self.max_zeit = {ma: self.desired_max_time_day for ma in self.mitarbeiter}  # Maximale Arbeitszeit pro Tag

        # -- 5 ------------------------------------------------------------------------------------------------------------
        key = "desired_min_time_day"
        if key in self.solver_requirements:
            self.desired_min_time_day = self.solver_requirements[key]
        self.desired_min_time_day = self.desired_min_time_day * self.hour_devider      

        key = "min_time_day"
        if key in self.solver_requirements:
            self.min_time_day = self.solver_requirements[key]
        self.min_time_day = self.min_time_day * self.hour_devider                  

        # Es wird weiterhin ein dict generiert, falls in Zukunft die min_time pro MA verschieden wird
        self.min_zeit = {ma: self.desired_min_time_day for ma in self.mitarbeiter}  # Minimale Arbeitszeit pro Tag

        # -- 6 ------------------------------------------------------------------------------------------------------------
        # Max. Arbeitszeit pro Woche / Arbeitszeit pro Woche
        key = "max_time_week"
        if key in self.solver_requirements:
            self.max_time_week = self.solver_requirements[key]

        self.max_time_week = self.max_time_week * self.hour_devider

        # -- 7 ------------------------------------------------------------------------------------------------------------
        self.weekly_hours = self.weekly_hours * self.hour_devider                    

        # -- 8 ------------------------------------------------------------------------------------------------------------
        # Berechnung der calc_time (Anzahl Tage an denen die MA eingeteilt werden)
        self.calc_time = 7 * self.week_timeframe

        # -- 9 ------------------------------------------------------------------------------------------------------------
        # Empolyment_level aus dem employment_lvl dict in einer Liste speichern (nur MA die berücksichtigt werden)
        # Iterieren Sie über die Schlüssel in binary_availability
        for user_id in self.binary_availability.keys():
            # Prüfen Sie, ob die user_id in employment_lvl vorhanden ist
            if user_id in self.employment_lvl:
                # Fügen Sie den entsprechenden employment_lvl Wert zur Liste hinzu
                self.employment_lvl_exact.append(self.employment_lvl[user_id])
        # self.employment_lvl_exact = [1, 0.8, 0.8, 0.6, 0.6] # Damit die Liste noch selbst manipuliert werden kann.

        # -- 10 ------------------------------------------------------------------------------------------------------------
        # Iteration of the key within binary_availability
        for user_id in self.binary_availability.keys():
            if user_id in self.user_employment:
                self.employment.append(self.user_employment[user_id])
        # self.employment = ["Perm", "Temp", "Temp", "Temp", "Temp"] # selbst manipuliert

        # -- 11 ------------------------------------------------------------------------------------------------------------
        # verteilbare Stunden (Wieviele Mannstunden benötigt die Firma im definierten Zeitraum)
        self.verteilbare_stunden = 0
        for date in self.time_req:
            for hour in self.time_req[date]:
                self.verteilbare_stunden += self.time_req[date][hour]
                self.verteilbare_stunden = self.verteilbare_stunden

        # -- 12 ------------------------------------------------------------------------------------------------------------
        for key in self.binary_availability:
            gesamt_stunden = sum(sum(day_data[1]) for day_data in self.binary_availability[key])
            self.gesamtstunden_verfügbarkeit.append(gesamt_stunden)

        # -- 13 ------------------------------------------------------------------------------------------------------------
        # Eine Liste mit den min. anwesendheiten der MA wird erstellt
        for _, values in sorted(self.time_req.items()):
            self.min_anwesend.append(list(values.values()))

        # -- 14 ------------------------------------------------------------------------------------------------------------
        # Eine Liste mit den Stunden wie sie gerecht verteilt werden
        list_gesamtstunden = []
        for i in range(len(self.mitarbeiter)):
            if self.gesamtstunden_verfügbarkeit[i] > self.weekly_hours * self.week_timeframe:
                arbeitsstunden_MA = self.employment_lvl_exact[i] * self.weekly_hours * self.week_timeframe
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
                allocated_hours = self.employment_lvl_exact[i] * self.weekly_hours * self.week_timeframe
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
        print("4. self.gerechte_verteilung: ", self.gerechte_verteilung)   

        # -- 15 ------------------------------------------------------------------------------------------------------------
        # Toleranz der gerechten Verteilung
        key = "fair_distribution"
        if key in self.solver_requirements:
            self.fair_distribution = self.solver_requirements[key]
        self.fair_distribution = self.fair_distribution / 100      # Prozentumrechnung


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
        print("107. self.weekly_hours: ", self.weekly_hours)
        print("108. self.employment_lvl: ", self.employment_lvl) 
        print("109. self.time_req: ", self.time_req) 
        print("110. user_employment: ", self.user_employment) 
        print("111. solver_requirements: ", self.solver_requirements)
        print("112. week_timeframe: ", self.week_timeframe)
        print("113. self.hour_devider: ", self.hour_devider)
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
        print("6. self.max_time_week: ", self.max_time_week)
        print("7. self.weekly_hours: ", self.weekly_hours)
        print("8. self.calc_time: ", self.calc_time)
        print("9. self.empolyment_lvl_exact: ", self.employment_lvl_exact)
        print("10. self.employment: ", self.employment)
        print("11. self.verteilbare_stunden: ", self.verteilbare_stunden)
        print("12. self.gesamtstunden_verfügbarkeit: ", self.gesamtstunden_verfügbarkeit)
        print("13. self.min_anwesend: ", self.min_anwesend)
        print("14. self.gerechte_verteilung: ", self.gerechte_verteilung)
        print("15. self.fair_distribution: ", self.fair_distribution)


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
        assert isinstance(self.max_time_week, (int, float)), "self.max_time_week sollte eine Ganzzahl oder eine Gleitkommazahl sein"

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
        assert isinstance(self.gesamtstunden_verfügbarkeit, list), "self.gesamtstunden_verfügbarkeit sollte eine Liste sein"
        assert all(isinstance(stunde, (int, float)) for stunde in self.gesamtstunden_verfügbarkeit), "Alle Elemente in self.gesamtstunden_verfügbarkeit sollten Ganzzahlen oder Gleitkommazahlen sein"

        # -- 12 -- 
        assert isinstance(self.min_anwesend, list), "self.min_anwesend sollte eine Liste sein"
        assert all(isinstance(val, list) for val in self.min_anwesend), "Alle Elemente in self.min_anwesend sollten Listen sein"


    def pre_check_admin(self):
        # Wenn die einzelnen Überprüfungen nicht standhalten, wird ein ValueError ausgelöst und jeweils geprintet, woran das Problem liegt. 
        # Später soll der Admin genau eine solche Meldung angezeigt bekommen.
        
        """
        ---------------------------------------------------------------------------------------------------------------
        1. Überprüfen ob die "Perm" Mitarbeiter mind. self.weekly_hours Stunden einplant haben
        ---------------------------------------------------------------------------------------------------------------
        """
        for i in range(len(self.mitarbeiter)):
            if self.employment[i] == "Perm": 
                sum_availability_perm = 0
                for j in range(self.calc_time):
                    for k in range(len(self.verfügbarkeit[self.mitarbeiter[i]][j])):
                        sum_availability_perm += self.verfügbarkeit[self.mitarbeiter[i]][j][k]
                if sum_availability_perm < self.weekly_hours:
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
                if 0 < total_hours < self.min_time_day:
                    errors.append(
                        f"Mitarbeiter {ma} hat am Tag {day+1} nur {total_hours/4} Stunden eingetragen. "
                        f"Das ist weniger als die Mindestarbeitszeit von {self.min_zeit[ma]/4} Stunden."
                    )
        if errors:
            raise ValueError("Folgende Fehler wurden gefunden:\n" + "\n".join(errors))

        """
        ---------------------------------------------------------------------------------------------------------------
        6. Ist die min. Zeit pro Tag so klein, dass die Stunden in der gerechten Verteilung nicht erfüllt werden können?
        ---------------------------------------------------------------------------------------------------------------
        """



        """
        ---------------------------------------------------------------------------------------------------------------
        7. Ist die Toleranz der gerechten Verteilung zu klein gewählt? --> Evtl. die Bedingung weich machen!
        ---------------------------------------------------------------------------------------------------------------
        """