import pandas as pd
import datetime
import pymysql
import time
import math
import re
import threading
import os

from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font
from openpyxl.utils import get_column_letter
from openpyxl.chart import LineChart, Reference
from data_processing import DataProcessing
from app import app, db
from sqlalchemy import text
from models import Timetable, User, SolverAnalysis

# New 
from ortools.sat.python import cp_model
"""
Der CP-SAT Solver arbeitet mit Boolescher Zufriedenheit (SAT, Satisfiability) 
und Constraint Programming (CP) Techniken, um Diskretheit, Kombinatorik und 
Bedingungen in den Problemen zu behandeln. Er ist speziell für Probleme entwickelt worden, 
bei denen komplexe und kombinatorische Beschränkungen berücksichtigt werden müssen.
"""


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
 - (erl.) Den Übergang auf harte und weiche NBs machen? 
 - (erl.) Die gesolvten Daten in der Datenbank speichern
 - (erl.) Daten für Solven in die Datenbank einpflegen (max. Zeit, min. Zeit, Solvingzeitraum, Toleranz für die Stundenverteilung, ...)
 - (erl.) Eine if Anweseiung, wenn der Betrieb an einem Tag geschlossen hat. Dann soll an diesem Tag nicht gesolvet werden
 - (erl.) Stunden Teiler für 1/4, 1/2 und 1h einbauen
 - (erl.) NB10 die weiche fertigbauen
 - (erl.) Opening Hour 2 einbauen
 - (erl.) Shifts aus Solver_req Datenbank rauslöschen und Daten nicht mehr ziehen
 - (erl.) Während des Solvings Daten ziehen --> Fragen gestellt
 - (erl.) Die erste Vorüberprüfung funktioniert noch nicht, da auch ein Perm MA der 60% angestellt ist weekly_hours eingteilt werden muss.

 To-Do's 
 -------------------------------
 - (*) Vorüberprüfungen fertigstellen und Daten an React geben

 - gerechte_verteilung funktioniert noch nicht richtig, wenn ein MA fast keine Stunden availability eingibt. Das muss noch geändert werden.
 
 - self.min_working_hour_per_block in Solver Req einbauen und ziehen
 - self.working_blocks in Solver Req einbauen und ziehen
 - self.max_consecutive_days in Solver Req einbauen und ziehen


 --- PRIO 2 ---
 -------------------------------
 - start_time und end_time zwei und drei noch implementieren (noch warten bis über 00:00 Zeiten eingegeben werden können!)
 - MA mit verschiedenen Profilen - Department (Koch, Service, ..)? Wie genau lösen wir das?
 - Die gerechte Verteilung geht über die max Stunden hinaus wenn zuviele MA benötigt werden und zu wenige Stunden eingegeben wurden?
 - Der erstellte "divisor" in data_processing könnte als Attribut initialisiert werden, damit es nicht bei jeder Methode einzeln berechnet werden muss
 - (*) NB9 mit 3 Schichten fertigbauen
 -------------------------------

 
"""

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
        self.model = None
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
        self.cost_expressions = []

        # Attribute der Methode "solve_problem"
        self.best_values = []
        self.status = None
        self.solving_time_seconds = None

        # Attribute der Methode "calculate_costs"
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
        results = {
            'checks': []
        }
        self.pre_check_programmer()
        #self.pre_check_admin()
        results['checks'].append(self.pre_check_admin())
        print("Test Check:", results)

        return 

    def run_2(self):
        self.solver_selection()
        self.define_penalty_costs()
        self.decision_variables()
        self.violation_variables()
        self.objective_function()
        self.constraints()
        self.solve_problem()
        self.calculate_costs()
        self.store_solved_data()
        self.output_result_excel()
        self.plot_costs_excel()
        self.save_data_in_database()
        self.save_data_in_database_testing()

        return results


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
        try:
        
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

                    #if sum_availability_perm < self.weekly_hours * self.employment_lvl_exact[i]:
                        #raise ValueError(f"Fester Mitarbeiter mit ID {self.mitarbeiter[i]} hat nicht genügend Stunden geplant.")

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
            #if errors:
                #raise ValueError("Folgende Fehler wurden gefunden:\n" + "\n".join(errors))

            """
            ---------------------------------------------------------------------------------------------------------------
            3. Haben alle MA zusammen genug Stunden eingegeben, um die verteilbaren Stunden zu erreichen?
            ---------------------------------------------------------------------------------------------------------------
            """
            total_hours_available = sum(self.gesamtstunden_verfügbarkeit)
            toleranz = 1 # Wenn man möchte, das die eingegebenen Stunden der MA höher sein müssen als die verteilbaren_stunden

            if total_hours_available < self.verteilbare_stunden * toleranz:
                pass
                #raise ValueError(f"Die Mitarbeiter haben insgesamt nicht genug Stunden eingegeben, um die verteilbaren Stunden zu erreichen. Benötigte Stunden: {self.verteilbare_stunden}, eingegebene Stunden: {total_hours_available}, Toleranz: {toleranz}")

            """
            ---------------------------------------------------------------------------------------------------------------
            4. Ist zu jeder notwendigen Zeit (self.min_anwesend) die mindestanzahl Mitarbeiter verfügbar?
            ---------------------------------------------------------------------------------------------------------------
            """
            
            for i in range(len(self.min_anwesend)):  # Für jeden Tag in der Woche
                for j in range(len(self.min_anwesend[i])):  # Für jede Stunde am Tag
                    if sum([self.verfügbarkeit[ma][i][j] for ma in self.mitarbeiter]) < self.min_anwesend[i][j]:
                        #raise ValueError(f"Es sind nicht genügend Mitarbeiter verfügbar zur notwendigen Zeit (Tag {i+1}, Stunde {j+1}).")
                        pass
            
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
            #if errors:
                #raise ValueError("Folgende Fehler wurden gefunden:\n" + "\n".join(errors))

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
            return {"success": True, "name": "Pre-check", "message": "All checks are successful!"}
        except ValueError as e:
            return {"success": False, "name": "Pre-check", "message": str(e)}


    def solver_selection(self):
        """
        Auswahl des geeigneten Solvers für Constraint Programmierung.
        """
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        
        self.solver.parameters.max_time_in_seconds = 500
        # self.solver.parameters.num_search_workers = 4 # Anzahl Kerne --> noch genau testen was das optimum ist (CPU-Auslastung beachten!)


    def define_penalty_costs(self):
        """
        Definiere Strafkosten für weiche Nebenbedingungen
        """
        # Strafkosten für jede NB
        penalty_values = {
            "nb1": {0: 1, 1: 100, 2: 250, 3: 400 , 4: 600, 5: 10000},
            "nb2": {0: 1, 1: 100, 2: 250, 3: 400 , 4: 600, 5: 10000},
            "nb3": {0: 1, 1: 100, 2: 250, 3: 400 , 4: 600, 5: 10000},
            "nb4": {0: 1, 1: 100, 2: 250, 3: 400 , 4: 600, 5: 10000},
            "nb5": {0: 1, 1: 100, 2: 250, 3: 400 , 4: 600, 5: 10000},
            "nb6": {0: 1, 1: 100, 2: 250, 3: 400 , 4: 600, 5: 10000},
            "nb7": {0: 1, 1: 100, 2: 250, 3: 400 , 4: 600, 5: 10000},
            "nb8": {0: 1, 1: 100, 2: 250, 3: 400 , 4: 600, 5: 10000},
            "nb9": {0: 1, 1: 100, 2: 250, 3: 400 , 4: 600, 5: 10000},
            "nb10": {0: 1, 1: 100, 2: 250, 3: 400 , 4: 600, 5: 10000}
        }

        # Mapping für die entsprechenden Namen der Klassenattribute
        penalty_cost_names = {
            "nb1": "penalty_cost_nb1",
            "nb2": "penalty_cost_nb2",
            "nb3": "penalty_cost_nb3_min",
            "nb4": "penalty_cost_nb4_max",
            "nb5": "penalty_cost_nb5_min",
            "nb6": "penalty_cost_nb6_max",
            "nb7": "penalty_cost_nb7",
            "nb8": "penalty_cost_nb8",
            "nb9": "penalty_cost_nb9",
            "nb10": "penalty_cost_nb10"
        }

        # Setze die Strafkosten für jede NB basierend auf dem Dictionary
        for key, values in penalty_values.items():
            if key in self.solver_requirements:
                nb_value = self.solver_requirements[key]
                if nb_value in values:
                    setattr(self, penalty_cost_names[key], values[nb_value])
                    print(f"{penalty_cost_names[key].upper()}: {getattr(self, penalty_cost_names[key])}")
                else:
                    print(f"Zahl für {penalty_cost_names[key].upper()} wurde nicht gefunden")
            else:
                print(f"{penalty_cost_names[key].upper()} nicht in solver_requirements gefunden")



    def decision_variables(self):
        """
        Entscheidungsvariabeln für den CP-Solver
        """

        # Arbeitsvariable
        self.x = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                for k in range(len(self.verfügbarkeit[i][j])):
                    self.x[i, j, k] = self.model.NewIntVar(0, 1, f'x[{i}, {j}, {k}]')

        # Arbeitsblockvariable
        self.y = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                for k in range(len(self.verfügbarkeit[i][j])):
                    self.y[i, j, k] = self.model.NewIntVar(0, 1, f'y[{i}, {j}, {k}]')

        # Arbeitstagvariable
        self.a = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.a[i, j] = self.model.NewBoolVar(f'a[{i}, {j}]')

        # Schichtvariable Woche (2-Schicht)
        self.s2 = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.s2[i, j] = self.model.NewIntVar(0, 1, f's2[{i}, {j}]')

        # Schichtvariable Woche (3-Schicht)
        self.s3 = {}
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.s3[i, j] = self.model.NewIntVar(0, 2, f's3[{i}, {j}]')

        # Gleiche Schichten innerhalb 2 und 4 Wochen
        self.c = {}
        for i in self.mitarbeiter:
            for j in range(7, self.calc_time):
                self.c[i, j] = self.model.NewIntVar(0, 1, f'c[{i}, {j}]')


    def violation_variables(self):
        """ 
        Verletzungsvariabeln für den CP-Solver
        """
        
        # Unendlichkeitssimulation
        INF = int(1e6)
        
        # NB1 violation variable
        for j in range(self.calc_time):
            for k in range(len(self.verfügbarkeit[self.mitarbeiter[0]][j])):
                self.nb1_violation[j, k] = self.model.NewIntVar(0, INF, f'nb1_violation[{j}, {k}]')

        # NB2 violation variable
        diff_1 = self.max_time_week - self.weekly_hours
        self.nb2_violation = {ma: {} for ma in self.mitarbeiter}
        for ma in self.mitarbeiter:
            for week in range(1, self.week_timeframe + 1):
                self.nb2_violation[ma][week] = self.model.NewIntVar(0, diff_1, f'nb2_violation[{ma}][{week}]')

        # NB3 Mindestarbeitszeit Verletzungsvariable
        diff_2 = self.desired_min_time_day - self.min_time_day
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.nb3_min_violation[i, j] = self.model.NewIntVar(0, diff_2, f'nb3_min_violation[{i}, {j}]')

        # NB4 Höchstarbeitszeit Verletzungsvariable
        diff_3 = self.max_time_day - self.desired_max_time_day
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.nb4_max_violation[i, j] = self.model.NewIntVar(0, diff_3, f'nb4_max_violation[{i}, {j}]')

        # NB5 Mindestarbeitszeit Verletzungsvariable
        for i in self.mitarbeiter:
            self.nb5_min_violation[i] = [self.model.NewIntVar(0, INF, f'nb5_min_violation[{i}][{week}]') for week in range(1, self.week_timeframe + 1)]

        # NB6 Höchstarbeitszeit Verletzungsvariable
        for i in self.mitarbeiter:
            self.nb6_max_violation[i] = [self.model.NewIntVar(0, INF, f'nb6_max_violation[{i}][{week}]') for week in range(1, self.week_timeframe + 1)]

        # NB7 Innerhalb einer Woche die gleiche Schicht - Verletzungsvariable
        for i in self.mitarbeiter:
            for j in range(7):
                self.nb7_violation[i, j] = self.model.NewIntVar(0, INF, f'nb7_violation[{i}, {j}]')

        # NB8 Innerhalb der zweiten / vierten Woche die gleiche Schicht - Verletzungsvariable
        for i in self.mitarbeiter:
            for j in range(7, self.calc_time):
                self.nb8_violation[i, j] = self.model.NewIntVar(0, INF, f'nb8_violation[{i}, {j}]')

        # NB9 Minimale Arbeitsstunden pro Block - Verletzungsvariable
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                for k in range(len(self.verfügbarkeit[i][j])):
                    self.nb9_violation[i, j, k] = self.model.NewIntVar(0, INF, f'nb9_violation[{i}, {j}, {k}]')

        # NB10 Max. Anzahl an Arbeitstagen in Folge
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.nb10_violation[i, j] = self.model.NewIntVar(0, INF, f'nb10_violation[{i}, {j}]')


    def objective_function(self):
        """
        Zielfunktion
        """

        # Kosten MA minimieren
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                for k in range(len(self.verfügbarkeit[i][j])):
                    self.cost_expressions.append(self.x[i, j, k] * int(self.kosten[i] / self.hour_devider))

        # Kosten Weiche NB1
        for j in range(self.calc_time):
            for k in range(len(self.verfügbarkeit[self.mitarbeiter[0]][j])):
                self.cost_expressions.append(self.nb1_violation[j, k] * int(self.penalty_cost_nb1 / self.hour_devider))

        # Kosten Weiche NB2
        for i in self.mitarbeiter:
            for week in range(1, self.week_timeframe + 1):
                self.cost_expressions.append(self.nb2_violation[i][week] * self.penalty_cost_nb2)
        
        # Kosten für Weiche NB3 Mindestarbeitszeit Verletzung
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.cost_expressions.append(self.nb3_min_violation[i, j] * self.penalty_cost_nb3_min)
                
        # Kosten für Weiche NB4 Höchstarbeitszeit Verletzung
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.cost_expressions.append(self.nb4_max_violation[i, j] * self.penalty_cost_nb4_max)

        # Kosten für Weiche NB5 Mindestarbeitszeit Verletzung
        for i in self.mitarbeiter:
            for week in range(1, self.week_timeframe + 1):
                self.cost_expressions.append(self.nb5_min_violation[i][week-1] * self.penalty_cost_nb5_min)

        # Kosten für Weiche NB6 Höchstarbeitszeit Verletzung
        for i in self.mitarbeiter:
            for week in range(1, self.week_timeframe + 1):
                self.cost_expressions.append(self.nb6_max_violation[i][week-1] * self.penalty_cost_nb6_max)
        
        # Kosten für Weiche NB7 "Innerhalb einer Woche immer gleiche Schichten"
        for i in self.mitarbeiter:
            for j in range(7):
                self.cost_expressions.append(self.nb7_violation[i, j] * self.penalty_cost_nb7)
        
        # Kosten für Weiche NB8 "Innerhalb der zweiten Woche immer gleiche Schichten"
        for i in self.mitarbeiter:
            for j in range(7, self.calc_time):
                self.cost_expressions.append(self.nb8_violation[i, j] * self.penalty_cost_nb8)
        
        # Kosten für Weiche NB9 "Minimale Arbeitsstunden pro Block"
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                for k in range(len(self.verfügbarkeit[i][j])):
                    self.cost_expressions.append(self.nb9_violation[i, j, k] * int(self.penalty_cost_nb9 / self.hour_devider))
        
        # Kosten für Weiche NB10 "Max. Anzahl an Arbeitstagen in Folge"
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                self.cost_expressions.append(self.nb10_violation[i, j] * self.penalty_cost_nb10)
        
                
        # Alle Kosten-Ausdrücke summieren und dem Model befehlen, die Kosten zu minimieren
        total_cost = sum(self.cost_expressions)
        self.model.Minimize(total_cost)


    def constraints(self):
        """
        Beschränkungen / Nebenbedingungen
        """

        # -------------------------------------------------------------------------------------------------------
        # HARTE NB -- NEU 08.08.2023 --
        # NB 0 - Variable a ist 1, wenn der Mitarbeiter an einem Tag arbeitet, sonst 0
        # -------------------------------------------------------------------------------------------------------
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                # sum_x ist die Summe an der ein MA am Tag arbeiten kann
                sum_x = sum(self.x[i, j, k] for k in range(len(self.verfügbarkeit[i][j])))
                
                self.model.Add(self.a[i, j] * (len(self.verfügbarkeit[i][j]) + 1) >= sum_x)
                self.model.Add(self.a[i, j] <= sum_x)
        
        # -------------------------------------------------------------------------------------------------------
        # HARTE NB
        # NB 1 - MA nur einteilen, wenn er verfügbar ist. 
        # -------------------------------------------------------------------------------------------------------
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                for k in range(len(self.verfügbarkeit[i][j])):
                    self.model.Add(self.x[i, j, k] <= self.verfügbarkeit[i][j][k])

        # -------------------------------------------------------------------------------------------------------
        # HARTE NB
        # NB 2 - Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend
        # -------------------------------------------------------------------------------------------------------
        for j in range(self.calc_time):
            for k in range(len(self.verfügbarkeit[self.mitarbeiter[0]][j])):  # Wir nehmen an, dass alle Mitarbeiter die gleichen Öffnungszeiten haben
                self.model.Add(sum(self.x[i, j, k] for i in self.mitarbeiter) >= self.min_anwesend[j][k])
        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB -- NEU 26.07.2023 --
        # NB 2 - Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend 
        # ***** Weiche Nebenbedingung 1 *****
        # -------------------------------------------------------------------------------------------------------
        for j in range(self.calc_time):
            for k in range(len(self.verfügbarkeit[self.mitarbeiter[0]][j])):  # Wir nehmen an, dass alle Mitarbeiter die gleichen Öffnungszeiten haben
                self.model.Add(sum(self.x[i, j, k] for i in self.mitarbeiter) - self.min_anwesend[j][k] <= self.nb1_violation[j, k])


        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB -- NEU 28.07.2023 -- --> Muss noch genauer überprüft werden ob es funktioniert!
        # NB 3 - Max. Arbeitszeit pro Woche
        # ***** Weiche Nebenbedingung 2 *****
        # -------------------------------------------------------------------------------------------------------

        if self.week_timeframe == 1:
            total_hours = {ma: sum([self.x[ma, j, k] for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
            for ma in self.mitarbeiter:
                self.model.Add(total_hours[ma] - self.weekly_hours <= self.nb2_violation[ma][1])
                        
        elif self.week_timeframe == 2:
            total_hours_week1 = {ma: sum([self.x[ma, j, k] for j in range(self.calc_time // 2) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
            total_hours_week2 = {ma: sum([self.x[ma, j, k] for j in range(self.calc_time // 2, self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
            for ma in self.mitarbeiter:
                self.model.Add(total_hours_week1[ma] - self.weekly_hours <= self.nb2_violation[ma][1])
                self.model.Add(total_hours_week2[ma] - self.weekly_hours <= self.nb2_violation[ma][2])
                        
        elif self.week_timeframe == 4:
            total_hours_week1 = {ma: sum([self.x[ma, j, k] for j in range(self.calc_time // 4) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
            total_hours_week2 = {ma: sum([self.x[ma, j, k] for j in range(self.calc_time // 4, self.calc_time // 2) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
            total_hours_week3 = {ma: sum([self.x[ma, j, k] for j in range(self.calc_time // 2, 3 * self.calc_time // 4) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
            total_hours_week4 = {ma: sum([self.x[ma, j, k] for j in range(3 * self.calc_time // 4, self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))]) for ma in self.mitarbeiter}
            
            for ma in self.mitarbeiter:
                self.model.Add(total_hours_week1[ma] - self.weekly_hours <= self.nb2_violation[ma][1])
                self.model.Add(total_hours_week2[ma] - self.weekly_hours <= self.nb2_violation[ma][2])
                self.model.Add(total_hours_week3[ma] - self.weekly_hours <= self.nb2_violation[ma][3])
                self.model.Add(total_hours_week4[ma] - self.weekly_hours <= self.nb2_violation[ma][4])


        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB -- NEU 31.07.2023 --
        # NB 4 - Min. und Max. Arbeitszeit pro Tag
        # ***** Weiche Nebenbedingung 3 und 4 *****
        # -------------------------------------------------------------------------------------------------------
        for i in self.mitarbeiter:
            for j in range(self.calc_time):

                sum_hour = sum(self.x[i, j, k] for k in range(len(self.verfügbarkeit[i][j])))

                # Prüfen, ob die Summe der Arbeitsstunden kleiner als die Mindestarbeitszeit ist
                self.model.Add(sum_hour - self.min_zeit[i] * self.a[i, j] >= -self.nb3_min_violation[i, j])
                self.model.Add(self.nb3_min_violation[i, j] >= 0)

                # Prüfen, ob die Summe der Arbeitsstunden größer als die maximale Arbeitszeit ist
                self.model.Add(sum_hour - self.max_zeit[i] * self.a[i, j] <= self.nb4_max_violation[i, j])
                self.model.Add(self.nb4_max_violation[i, j] >= 0)

        # -------------------------------------------------------------------------------------------------------
        # HARTE NB
        # NB 5 - Anzahl Arbeitsblöcke
        # -------------------------------------------------------------------------------------------------------

        self.working_blocks = 1
                
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                # Überprüfen, ob der Betrieb an diesem Tag geöffnet ist
                if self.opening_hours[j] > 0:
                    # Für die erste Stunde des Tages
                    self.model.Add(self.y[i, j, 0] >= self.x[i, j, 0])
                    
                    # Für die restlichen Stunden des Tages
                    for k in range(1, len(self.verfügbarkeit[i][j])):
                        self.model.Add(self.y[i, j, k] >= self.x[i, j, k] - self.x[i, j, k-1])

                    # Die Summe der y[i, j, k] für einen bestimmten Tag j sollte nicht größer als 1 sein
                    self.model.Add(sum(self.y[i, j, k] for k in range(len(self.verfügbarkeit[i][j]))) <= self.working_blocks)

        
        # -------------------------------------------------------------------------------------------------------
        # HARTE NB
        # NB 6 - Verteilungsgrad MA
        # -------------------------------------------------------------------------------------------------------
        verteilungsstunden = {ma: sum(self.x[ma, j, k] for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[ma][j]))) for ma in self.mitarbeiter}

        for i, ma in enumerate(self.mitarbeiter):
            lower_bound = math.floor(self.gerechte_verteilung[i] * (1 - self.fair_distribution))
            upper_bound = math.ceil(self.gerechte_verteilung[i] * (1 + self.fair_distribution))
            
            self.model.Add(verteilungsstunden[ma] <= upper_bound)
            self.model.Add(verteilungsstunden[ma] >= lower_bound)
        

        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB -- NEU 08.08.23 --
        # NB 7 - "Perm" Mitarbeiter zu employement_level fest einplanen
        # ***** Weiche Nebenbedingung 5 und 6 *****
        # -------------------------------------------------------------------------------------------------------

        for i, ma in enumerate(self.mitarbeiter):
            if self.employment[i] == "Perm":
                for week in range(1, self.week_timeframe + 1):
                    week_start = (week - 1) * (self.calc_time // self.week_timeframe)
                    week_end = week * (self.calc_time // self.week_timeframe)
                    print(f'Week start for employee {ma} in week {week}: {week_start}')
                    print(f'Week end for employee {ma} in week {week}: {week_end}')

                    total_hours_week = sum(self.x[ma, j, k] for j in range(week_start, week_end) for k in range(len(self.verfügbarkeit[ma][j])))
                    print(f'Total hours for employee {ma} in week {week}: {total_hours_week}')

                    # Prüfen, ob die Gesamtstunden kleiner als die vorgegebenen Arbeitsstunden sind (Unterschreitung)
                    self.model.Add(total_hours_week - self.weekly_hours <= self.nb5_min_violation[ma][week - 1])
                    self.model.Add(self.nb5_min_violation[ma][week - 1] >= 0)

                    # Prüfen, ob die Gesamtstunden größer als die vorgegebenen Arbeitsstunden sind (Überschreitung)
                    self.model.Add(self.weekly_hours - total_hours_week <= -self.nb6_max_violation[ma][week - 1])
                    self.model.Add(self.nb6_max_violation[ma][week - 1] >= 0)

        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB
        # NB 8 - Innerhalb einer Woche immer gleiche Schichten
        # ***** Weiche Nebenbedingung 7 *****
        # -------------------------------------------------------------------------------------------------------
        if self.company_shifts <= 1:
            pass

        elif self.company_shifts == 2:
            for i in self.mitarbeiter:
                for j in range(7):

                    # Hier noch einbauen, das wenn die Stundenanzahl ungerade ist!!

                    first_shift_hours = sum(self.x[i, j, k] for k in range(0, int(len(self.verfügbarkeit[i][j]) / 2))) 
                    second_shift_hours = sum(self.x[i, j, k] for k in range(int(len(self.verfügbarkeit[i][j]) / 2), len(self.verfügbarkeit[i][j]))) 
                    
                    delta = self.model.NewBoolVar("delta")
                    
                    self.model.Add(first_shift_hours - second_shift_hours - 1000 * delta <= 0)         
                    self.model.Add(second_shift_hours - first_shift_hours - 1000 * (1 - delta) <= 0)   
                    
                    self.model.Add(self.s2[i, j] == 1 - delta)

            """
            # Harte nb Option zum testen
            for i in self.mitarbeiter:
                for j in range(1, self.calc_time):
                    self.model.Add(self.s2[i, j] - self.s2[i, j-1] == 0)
            """ 

            # Bedingungen, um sicherzustellen, dass innerhalb einer Woche immer die gleiche Schicht gearbeitet wird
            for i in self.mitarbeiter:
                for j in range(1, 7):
                    diff = self.model.NewIntVar(-1, 1, "diff")
                    
                    self.model.Add(diff == self.s2[i, j] - self.s2[i, j-1])
            
                    # Bedingungen für den "absoluten Wert"
                    self.model.Add(self.nb7_violation[i, j] >= diff)
                    self.model.Add(self.nb7_violation[i, j] >= -diff)

        elif self.company_shifts == 3:
            for i in self.mitarbeiter:
                for j in range(7):
                    total_len = len(self.verfügbarkeit[i][j])
                    third_shift_len = total_len // 3
                    first_shift_len = third_shift_len + (total_len % 3) // 2
                    second_shift_len = third_shift_len + (total_len % 3) - (total_len % 3) // 2

                    first_shift_hours = sum(self.x[i, j, k] for k in range(0, first_shift_len))
                    second_shift_hours = sum(self.x[i, j, k] for k in range(first_shift_len, first_shift_len + second_shift_len))
                    third_shift_hours = sum(self.x[i, j, k] for k in range(first_shift_len + second_shift_len, total_len))

                    delta1 = self.model.NewBoolVar(f"delta1_{i}_{j}")
                    delta2 = self.model.NewBoolVar(f"delta2_{i}_{j}")
                    delta3 = self.model.NewBoolVar(f"delta3_{i}_{j}")

                    M = 1000

                    self.model.Add(first_shift_hours >= second_shift_hours - M * (1 - delta1))
                    self.model.Add(first_shift_hours >= third_shift_hours - M * (1 - delta1))

                    self.model.Add(second_shift_hours >= first_shift_hours - M * (1 - delta2))
                    self.model.Add(second_shift_hours >= third_shift_hours - M * (1 - delta2))

                    self.model.Add(third_shift_hours >= first_shift_hours - M * (1 - delta3))
                    self.model.Add(third_shift_hours >= second_shift_hours - M * (1 - delta3))

                    self.model.Add(delta1 + delta2 + delta3 == 1)

                    self.model.Add(self.s3[i, j] == 0 * delta1 + 1 * delta2 + 2 * delta3)

            """
            # Harte Bedingung, dass innerhalb einer Woche immer die gleiche Schicht gearbeitet wird
            for i in self.mitarbeiter:
                for j in range(1, self.calc_time):
                    self.model.Add(self.s3[i, j] - self.s3[i, j-1] == 0)
            """

            # Bedingungen, um sicherzustellen, dass innerhalb einer Woche immer die gleiche Schicht gearbeitet wird
            for i in self.mitarbeiter:
                for j in range(1, 7):
                    diff = self.model.NewIntVar(-2, 2, "diff") # Unterschied kann -2, -1, 0, 1 oder 2 sein
                    self.model.Add(diff == self.s3[i, j] - self.s3[i, j-1])

                    self.model.Add(self.nb7_violation[i, j] >= diff)
                    self.model.Add(self.nb7_violation[i, j] >= -diff)
                    self.model.Add(self.nb7_violation[i, j] <= 1) # Die Verletzung sollte maximal 1 betragen

        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB
        # NB 9 - Wechselnde Schichten innerhalb von 2 und 4 Wochen
        # ***** Weiche Nebenbedingung 8 *****
        # -------------------------------------------------------------------------------------------------------

        # 2 Wochen + 2-Schicht # --------------------------------------------------------------------------------
        if self.week_timeframe == 2:
            if self.company_shifts == 2:
                for i in self.mitarbeiter:
                    # Anzahl der Tage in der ersten Woche, an denen in der ersten bzw. zweiten Schicht gearbeitet wurde
                    first_week_first_shift_days = sum(self.s2[i, j] for j in range(7))
                    first_week_second_shift_days = 7 - first_week_first_shift_days

                    # Hilfsvariable, um die Schicht der ersten Woche festzulegen
                    first_week_shift = self.model.NewBoolVar("first_week_shift")

                    # Wenn die Anzahl der Tage in der ersten Schicht größer ist, setzen Sie first_week_shift auf 1
                    self.model.Add(first_week_first_shift_days - first_week_second_shift_days - 1000 * first_week_shift <= 0)
                    self.model.Add(first_week_second_shift_days - first_week_first_shift_days - 1000 * (1 - first_week_shift) <= 0)

                    for j in range(7, 14):
                        self.model.Add(self.c[i, j] == 1 - first_week_shift)

                    # In der zweiten Woche muss der Mitarbeiter in der entgegengesetzten Schicht arbeiten
                    for j in range(7, 14):
                        # Summe der Stunden in der ersten Schicht in der zweiten Woche
                        first_shift_hours_second_week = sum(self.x[i, j, k] for k in range(0, int(len(self.verfügbarkeit[i][j]) / 2)))
                        second_shift_hours_second_week = sum(self.x[i, j, k] for k in range(int(len(self.verfügbarkeit[i][j]) / 2), len(self.verfügbarkeit[i][j])))

                        # Kann 0 oder 1 annehmen
                        delta_2 = self.model.NewBoolVar("delta_2")
                        
                        self.model.Add(first_shift_hours_second_week - second_shift_hours_second_week - 1000 * delta_2 <= 0)      
                        self.model.Add(second_shift_hours_second_week - first_shift_hours_second_week - 1000 * (1 - delta_2) <= 0)  
                        
                        # Hilfsvariable mit s2[i, j] verknüpfen
                        self.model.Add(self.s2[i, j] == 1 - delta_2)
                        
                        # Harte Nebenbedingung
                        # self.model.Add(self.s2[i, j] == self.c[i, j])

                # Verletzungsvariable erhöhen, wenn die Schicht in der zweiten Woche nicht der entgegengesetzten Schicht entspricht
                for i in self.mitarbeiter:
                    for j in range(7, 14):
                        diff = self.model.NewIntVar(-1, 1, f"diff_{i}_{j}")
                        self.model.Add(diff == self.s2[i, j] - self.c[i, j])

                        self.model.Add(self.nb8_violation[i, j] >= diff)
                        self.model.Add(self.nb8_violation[i, j] >= -diff)


        # 2 Wochen + 3-Schicht # --------------------------------------------------------------------------------

        """
        Der Code muss neu erstellt werden, viel zu gross in or_algorithm und funktionierte auch noch nicht richtig
        """

        # 4 Wochen + 2-Schicht ----------------------------------------------------------------------------------
        if self.week_timeframe == 4:
            if self.company_shifts == 2:
                for i in self.mitarbeiter:
                    # Anzahl der Tage in der ersten Woche, an denen in der ersten bzw. zweiten Schicht gearbeitet wurde
                    first_week_first_shift_days = sum(self.s2[i, j] for j in range(7))
                    first_week_second_shift_days = 7 - first_week_first_shift_days

                    # Hilfsvariable, um die Schicht der ersten Woche festzulegen
                    first_week_shift = self.model.NewBoolVar("first_week_shift")

                    # Wenn die Anzahl der Tage in der ersten Schicht größer ist, setzen Sie first_week_shift auf 1
                    self.model.Add(first_week_first_shift_days - first_week_second_shift_days - 1000 * first_week_shift <= 0)
                    self.model.Add(first_week_second_shift_days - first_week_first_shift_days - 1000 * (1 - first_week_shift) <= 0)

                    for week in range(2, 5): # Beginne bei Woche 2
                        for j in range((week-1)*7, week*7): # Beginne bei Tag 0 der aktuellen Woche und gehe bis zum letzten Tag der Woche
                            if week % 2 == 0:
                                self.model.Add(self.c[i, j] == 1 - first_week_shift)
                            else:
                                self.model.Add(self.c[i, j] == first_week_shift)

                    for week in range(2, 5): # Wochen 2 bis 4
                        for j in range((week-1)*7, week*7):
                            # Summe der Stunden in der ersten Schicht in der aktuellen Woche
                            first_shift_hours_current_week = sum(self.x[i, j, k] for k in range(0, int(len(self.verfügbarkeit[i][j]) / 2)))
                            second_shift_hours_current_week = sum(self.x[i, j, k] for k in range(int(len(self.verfügbarkeit[i][j]) / 2), len(self.verfügbarkeit[i][j])))

                            # Kann 0 oder 1 annehmen
                            delta_2 = self.model.NewBoolVar("delta_2")
                            
                            self.model.Add(first_shift_hours_current_week - second_shift_hours_current_week - 1000 * delta_2 <= 0)      
                            self.model.Add(second_shift_hours_current_week - first_shift_hours_current_week - 1000 * (1 - delta_2) <= 0)  
                            
                            # Hilfsvariable mit s2[i, j] verknüpfen
                            self.model.Add(self.s2[i, j] == 1 - delta_2)
                            
                            # Harte Nebenbedingung
                            # self.model.Add(self.s2[i, j] == self.c[i, j])

                # Verletzungsvariable erhöhen, wenn die Schicht in den Wochen 2, 3 und 4 nicht der entgegengesetzten Schicht entspricht
                for i in self.mitarbeiter:
                    for j in range(7, 28):
                        diff = self.model.NewIntVar(-1, 1, f"diff_{i}_{j}")
                        self.model.Add(diff == self.s2[i, j] - self.c[i, j])

                        self.model.Add(self.nb8_violation[i, j] >= diff)
                        self.model.Add(self.nb8_violation[i, j] >= -diff)


        # 4 Wochen + 3-Schicht ----------------------------------------------------------------------------------
        if self.week_timeframe == 4:
            if self.company_shifts == 3:
                for i in self.mitarbeiter:
                    pass




        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB (28.08.2023)
        # NB 10 - Minimale Arbeitsstunden pro Arbeitsblock
        # ***** Weiche Nebenbedingung 9 *****
        # -------------------------------------------------------------------------------------------------------

        """
        # HARTE NB
        self.min_working_hour_per_block = 4 * self.hour_devider

        if self.working_blocks == 2:
            for i in self.mitarbeiter:
                for j in range(self.calc_time):
                    for k in range(len(self.verfügbarkeit[i][j]) - self.min_working_hour_per_block + 1):
                        # Wenn der MA in einem Block beginnt (y == 1), dann muss er für die nächsten min_working_hour_per_block-1 Stunden arbeiten (x == 1)
                        self.model.Add(self.y[i, j, k] <= self.x[i, j, k])
                        for h in range(1, self.min_working_hour_per_block):
                            if k + h < len(self.verfügbarkeit[i][j]):  # Überprüfen, um IndexOutOfBounds zu vermeiden
                                self.model.Add(self.y[i, j, k] <= self.x[i, j, k + h])

                        # Verhindern, dass in den letzten min_working_hour_per_block-1 Stunden des Tages ein neuer Block beginnt
                        if len(self.verfügbarkeit[i][j]) >= self.min_working_hour_per_block:
                            for h in range(1, self.min_working_hour_per_block):
                                last_hour = len(self.verfügbarkeit[i][j]) - h
                                self.model.Add(self.y[i, j, last_hour] == 0)
        """

        # WEICHE NB
        self.min_working_hour_per_block = 2 * self.hour_devider

        if self.working_blocks == 2:
            for i in self.mitarbeiter:
                for j in range(self.calc_time):
                    for k in range(len(self.verfügbarkeit[i][j])):
                        if k < len(self.verfügbarkeit[i][j]) - self.min_working_hour_per_block + 1:
                            working_conditions = [self.y[i, j, k] - self.x[i, j, k]]
                            for h in range(1, self.min_working_hour_per_block):
                                if k + h < len(self.verfügbarkeit[i][j]):
                                    working_conditions.append(self.y[i, j, k] - self.x[i, j, k + h])
                            ct = sum(working_conditions) <= self.nb9_violation[i, j, k]
                            self.model.Add(ct)

                        # Für die letzten Stunden des Tages
                        else:
                            # Verbleibende Stunden des Tages ermitteln
                            remaining_hours = len(self.verfügbarkeit[i][j]) - k
                            # Anzahl der Stunden ermitteln, die fehlen, um min_working_hour_per_block zu erreichen
                            missing_hours = self.min_working_hour_per_block - remaining_hours

                            # Anzahl der Verstöße ist gleich der Anzahl der fehlenden Stunden
                            ct = self.y[i, j, k] * missing_hours == self.nb9_violation[i, j, k]
                            self.model.Add(ct)

        # -------------------------------------------------------------------------------------------------------
        # WEICHE NB (30.08.2023)
        # NB 11 - Max. Anzahl an Arbeitstagen in Folge
        # ***** Weiche Nebenbedingung 10 *****
        # -------------------------------------------------------------------------------------------------------
        
        self.max_consecutive_days = 5

        for i in self.mitarbeiter:
            for j in range(self.calc_time - self.max_consecutive_days):
                # Rollfenster-Technik:
                consecutive_days = [self.a[i, j + k] for k in range(self.max_consecutive_days + 1)]
                
                # Erstellen Sie ein lineares Ausdruck-Objekt für die Summe der aufeinanderfolgenden Tage
                sum_consecutive_days = sum(consecutive_days)
                
                # Summe der Arbeitstage soll nicht größer als self.max_consecutive_days sein
                self.model.Add(sum_consecutive_days <= self.max_consecutive_days + self.nb10_violation[i, j])
                # nb10_violation wird nur erhöht, wenn die Anzahl der aufeinanderfolgenden Arbeitstage das Limit überschreitet
                self.model.Add(self.nb10_violation[i, j] >= sum_consecutive_days - self.max_consecutive_days)
                self.model.Add(self.nb10_violation[i, j] >= 0)



    def solve_problem(self):
        """
        Problem lösen und Kosten ausgeben
        """
        self.last_best_value = None
        self.current_best_value = None
        self.last_read_time = 0
        self.stop_thread = False

        # -----------------------------
        # Nach wievielen Sekunden soll jeweils der aktuelle Bestwert in der Liste aufgenommen werden:
        self.best_test_time = 5
        # -----------------------------

        start_time_solver = time.time()

        log_file = open('log.txt', 'w')

        def log_callback(message):
            log_file.write(message)
            log_file.flush()
            self.read_best_value(message)
            current_time = time.time()
            if current_time - self.last_read_time > self.best_test_time:
                self.last_read_time = current_time

        def add_best_value_to_list():
            while not self.stop_thread:
                time.sleep(self.best_test_time)
                if self.last_best_value is not None:
                    self.current_best_value = self.last_best_value
                self.best_values.append(self.current_best_value)
                print("------------------ NEUER WERT HINZUGEFÜGT: ", self.current_best_value, "------------------------")

        self.solver.parameters.log_search_progress = True
        self.solver.parameters.log_to_stdout = True
        self.solver.log_callback = log_callback

        thread = threading.Thread(target=add_best_value_to_list)
        thread.start()

        self.status = self.solver.Solve(self.model)

        end_time_solver = time.time()
        self.solving_time_seconds = end_time_solver - start_time_solver

        self.stop_thread = True
        thread.join()
        log_file.close()

        print("Best Values: ", self.best_values)

    def read_best_value(self, message):
        match = re.search(r'best:(\d+)', message)
        if match:
            self.last_best_value = int(match.group(1))



    def calculate_costs(self):
        """
        In dieser Methode werden die Kosten der einzelnen Nebenbedingungen berechnet und ausgegeben
        """
        # self.model.ExportToFile('slow_model.pb.txt')

        """
        # ----------------------------------------------------------------
        # Die Werte von s2 printen
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                # Drucken Sie den Wert von s3[i, j]
                print(f"s2[{i}][{j}] =", self.solver.Value(self.s2[i, j]))

        # Die Werte von a printen
        for i in self.mitarbeiter:
            for j in range(self.calc_time):
                # Drucken Sie den Wert von a[i, j]
                print(f"a[{i}][{j}] =", self.solver.Value(self.a[i, j]))
        # ----------------------------------------------------------------
        """

        # Kosten für die Einstellung von Mitarbeitern
        self.hiring_costs = sum((self.kosten[i] / self.hour_devider) * self.solver.Value(self.x[i, j, k]) for i in self.mitarbeiter for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[i][j])))

        self.violation_nb1 = sum(self.solver.Value(self.nb1_violation[j, k]) for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[self.mitarbeiter[0]][j])))
        self.nb1_penalty_costs = (self.penalty_cost_nb1 / self.hour_devider) * self.violation_nb1

        self.violation_nb2 = sum(self.solver.Value(self.nb2_violation[i][week]) for i in self.mitarbeiter for week in range(1, self.week_timeframe + 1))
        self.nb2_penalty_costs = self.penalty_cost_nb2 * self.violation_nb2

        self.violation_nb3 = sum(self.solver.Value(self.nb3_min_violation[i, j]) for i in self.mitarbeiter for j in range(self.calc_time))
        self.nb3_min_penalty_costs = self.penalty_cost_nb3_min * self.violation_nb3

        self.violation_nb4 = sum(self.solver.Value(self.nb4_max_violation[i, j]) for i in self.mitarbeiter for j in range(self.calc_time))
        self.nb4_max_penalty_costs = self.penalty_cost_nb4_max * self.violation_nb4

        self.violation_nb5 = sum(self.solver.Value(self.nb5_min_violation[i][week - 1]) for i in self.mitarbeiter for week in range(1, self.week_timeframe + 1))
        self.nb5_min_penalty_costs = self.penalty_cost_nb5_min * self.violation_nb5

        self.violation_nb6 = sum(self.solver.Value(self.nb6_max_violation[i][week - 1]) for i in self.mitarbeiter for week in range(1, self.week_timeframe + 1))
        self.nb6_max_penalty_costs = self.penalty_cost_nb6_max * self.violation_nb6

        self.violation_nb7 = sum(self.solver.Value(self.nb7_violation[i, j]) for i in self.mitarbeiter for j in range(7))
        self.nb7_penalty_costs = self.penalty_cost_nb7 * self.violation_nb7

        self.violation_nb8 = sum(self.solver.Value(self.nb8_violation[i, j]) for i in self.mitarbeiter for j in range(7, self.calc_time))
        self.nb8_penalty_costs = self.penalty_cost_nb8 * self.violation_nb8

        self.violation_nb9 = sum(self.solver.Value(self.nb9_violation[i, j, k]) for i in self.mitarbeiter for j in range(self.calc_time) for k in range(len(self.verfügbarkeit[i][j])))
        self.nb9_penalty_costs = (self.penalty_cost_nb9 / self.hour_devider) * self.violation_nb9

        self.violation_nb10 = sum(self.solver.Value(self.nb10_violation[i, j]) for i in self.mitarbeiter for j in range(self.calc_time))
        self.nb10_penalty_costs = self.penalty_cost_nb10 * self.violation_nb10

        # Kosten der einzelnen NBs ausgeben
        print('Kosten Einstellung von Mitarbeitern:', self.hiring_costs)
        print('Kosten Weiche NB1 (Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend):', self.nb1_penalty_costs)
        print('Kosten Weiche NB2 (Max. Arbeitszeit pro Woche "Temp" MA):', self.nb2_penalty_costs)
        print('Kosten Weiche NB3 (Min. Arbeitszeit pro Tag):', self.nb3_min_penalty_costs)
        print('Kosten Weiche NB4 (Max. Arbeitszeit pro Tag):', self.nb4_max_penalty_costs)
        print('Kosten Weiche NB5 (Unterschreitung der festen Mitarbeiter zu employment_level):', self.nb5_min_penalty_costs)
        print('Kosten Weiche NB6 (Überschreitung der festen Mitarbeiter zu employment_level):', self.nb6_max_penalty_costs)
        print('Kosten Weiche NB7 (Immer die gleiche Schicht in einer Woche):', self.nb7_penalty_costs)
        print('Kosten Weiche NB8 (Immer die gleiche Schicht zweite Woche):', self.nb8_penalty_costs)
        print('Kosten Weiche NB9 (Minimale Arbeitsstunden pro Block):', self.nb9_penalty_costs)
        print('Kosten Weiche NB10 (Max. Anzahl an Arbeitstagen in Folge):', self.nb10_penalty_costs)
        print('Gesamtkosten:', self.solver.ObjectiveValue())



    def store_solved_data(self):
        """
        mitarbeiter_arbeitszeiten Attribut befülle
        """

        if self.status is None:
            print("Das Problem wurde noch nicht gelöst.")
            return

        if self.status == cp_model.OPTIMAL or self.status == cp_model.FEASIBLE:
            for i in self.mitarbeiter:
                self.mitarbeiter_arbeitszeiten[i] = [
                    [self.solver.Value(self.x[i, j, k]) for k in range(len(self.verfügbarkeit[i][j]))] 
                    for j in range(self.calc_time)
                ]
            print(self.mitarbeiter_arbeitszeiten)

        if self.status == cp_model.OPTIMAL:
            print("Optimale Lösung gefunden.")
        elif self.status == cp_model.FEASIBLE:
            print("Mögliche Lösung gefunden.")
        elif self.status == cp_model.INFEASIBLE:
            print("Problem ist unlösbar.")
        elif self.status == cp_model.NOT_SOLVED:
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
            total_hours_col = len(headers)  # Wir verwenden die Anzahl der Überschriften, um die richtige Spalte zu erhalten
            ws.cell(row=idx, column=total_hours_col, value=f"=SUM(B{idx}:{get_column_letter(total_hours_col-1)}{idx})")


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

        wb.save("Einsatzplan.xlsx")


    def plot_costs_excel(self):
        """
        In dieser Methode werden die besten Kosten nach X Sekunden als Liniendiagramm in einem Excel gespeichert
        """

        # Workbook erstellen
        wb = Workbook()
        ws = wb.active
        ws.title = "Kosten"

        # Datei in das Arbeitsblatt einfügen
        data = [
            ['Zeit (Sekunden)', 'Beste Werte', 'Optimale Werte'],
        ]
        times = [i * self.best_test_time for i in range(1, len(self.best_values) + 1)]
        for i in range(len(times)):
            data.append([times[i], self.best_values[i], (self.hiring_costs - self.nb1_penalty_costs)]) # Penaltykosten von NB1 werden abgezogen, damit nur die minimale Einstellung der MA berechnet wird

        for row in data:
            ws.append(row)

        # Liniendiagramm erstellen
        chart = LineChart()
        chart.title = "Kosten über die Zeit"
        chart.style = 13
        chart.x_axis.title = 'Zeit (Sekunden)'
        chart.y_axis.title = 'Kosten'

        data = Reference(ws, min_col=2, min_row=1, max_col=3, max_row=len(self.best_values)+1)
        chart.add_data(data, titles_from_data=True)
        times = Reference(ws, min_col=1, min_row=2, max_row=len(self.best_values)+1)
        chart.set_categories(times)
        ws.add_chart(chart, "E5")

        wb.save("Kostenanalyse.xlsx")


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

                    # Löschen der jeweiligen Tage
                    Timetable.query.filter_by(email=user.email, date=date).delete()
                    db.session.commit()
                    

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

                    # Divisor bestimmen
                    divisor = 3600 / self.hour_devider

                    for shift_index, (start_time, end_time) in enumerate(shifts):
                        opening_time_in_units = int(self.laden_oeffnet[day_index].total_seconds() * self.hour_devider / 3600)
                        start_time += opening_time_in_units
                        end_time += opening_time_in_units

                        # Neues Timetable-Objekt
                        if shift_index == 0:
                            new_entry = Timetable(
                                id=None,
                                email=user.email,
                                first_name=user.first_name,
                                last_name=user.last_name,
                                company_name=user.company_name,
                                date=date,
                                start_time=datetime.datetime.combine(date, datetime.time(hour=int(start_time // self.hour_devider), minute=int((start_time % self.hour_devider) * 60 / self.hour_devider))),
                                end_time=datetime.datetime.combine(date, datetime.time(hour=int(end_time // self.hour_devider), minute=int((end_time % self.hour_devider) * 60 / self.hour_devider))),
                                start_time2=None,
                                end_time2=None,
                                start_time3=None,
                                end_time3=None,
                                created_by=self.current_user_id,
                                changed_by=self.current_user_id,
                                creation_timestamp=datetime.datetime.now()
                            )
                            db.session.add(new_entry)

                        elif shift_index == 1:
                            new_entry.start_time2 = datetime.datetime.combine(date, datetime.time(hour=int(start_time // self.hour_devider), minute=int((start_time % self.hour_devider) * 60 / self.hour_devider)))
                            new_entry.end_time2 = datetime.datetime.combine(date, datetime.time(hour=int(end_time // self.hour_devider), minute=int((end_time % self.hour_devider) * 60 / self.hour_devider)))

                        # new_entry der Datenbank hinzufügen
                        db.session.add(new_entry)

            # Änderungen in der Datenbank speichern
            db.session.commit()


    def save_data_in_database_testing(self):
        """ 
        Diese Methode speichert verwendete Daten in der Datenbank für das testing
        """
        new_entry = SolverAnalysis(
            id = None,
            usecase = self.solver_requirements["company_name"],
            self_current_user_id = self.current_user_id,
            self_user_availability = str(self.user_availability),
            self_opening_hours = str(self.opening_hours),
            self_laden_oeffnet = str(self.laden_oeffnet),
            self_laden_schliesst = str(self.laden_schliesst),
            self_binary_availability = str(self.binary_availability),
            self_company_shifts = self.company_shifts,
            self_weekly_hours = self.weekly_hours,
            self_employment_lvl = str(self.employment_lvl),
            self_time_req = str(self.time_req),
            self_user_employment = self.user_employment,
            self_solver_requirements = str(self.solver_requirements),
            self_week_timeframe = self.week_timeframe,
            self_hour_devider = self.hour_devider,
            self_mitarbeiter = str(self.mitarbeiter),
            self_verfügbarkeit = str(self.verfügbarkeit),
            self_kosten = str(self.kosten),
            self_max_zeit = str(self.max_zeit),
            self_min_zeit = str(self.min_zeit),
            self_max_time_week = self.max_time_week,
            self_calc_time = self.calc_time,
            self_employment_lvl_exact = str(self.employment_lvl_exact),
            self_employment = str(self.employment),
            self_verteilbare_stunden = self.verteilbare_stunden,
            self_gesamtstunden_verfügbarkeit = str(self.gesamtstunden_verfügbarkeit),
            self_min_anwesend = str(self.min_anwesend),
            self_gerechte_verteilung = str(self.gerechte_verteilung),
            self_fair_distribution = self.fair_distribution,
            solving_time = self.solving_time_seconds,
            lp_iteration = None,
            violation_nb1 = self.violation_nb1,
            violation_nb2 = self.violation_nb2,
            violation_nb3 = self.violation_nb3,
            violation_nb4 = self.violation_nb4,
            violation_nb5 = self.violation_nb5,
            violation_nb6 = self.violation_nb6,
            violation_nb7 = self.violation_nb7,
            violation_nb8 = self.violation_nb8,
            violation_nb9 = self.violation_nb9,
            violation_nb10 = self.violation_nb10,
            violation_nb11 = None,
            violation_nb12 = None,
            violation_nb13 = None,
            violation_nb14 = None,
            violation_nb15 = None,
            violation_nb16 = None,
            violation_nb17 = None,
            violation_nb18 = None,
            violation_nb19 = None,
            violation_nb20 = None,
            penalty_cost_nb1 = self.penalty_cost_nb1,
            penalty_cost_nb2 = self.penalty_cost_nb2,
            penalty_cost_nb3 = self.penalty_cost_nb3_min,
            penalty_cost_nb4 = self.penalty_cost_nb4_max,
            penalty_cost_nb5 = self.penalty_cost_nb5_min,
            penalty_cost_nb6 = self.penalty_cost_nb6_max,
            penalty_cost_nb7 = self.penalty_cost_nb7,
            penalty_cost_nb8 = self.penalty_cost_nb8,
            penalty_cost_nb9 = self.penalty_cost_nb9,
            penalty_cost_nb10 = self.penalty_cost_nb10,
            penalty_cost_nb11 = None,
            penalty_cost_nb12 = None,
            penalty_cost_nb13 = None,
            penalty_cost_nb14 = None,
            penalty_cost_nb15 = None,
            penalty_cost_nb16 = None,
            penalty_cost_nb17 = None,
            penalty_cost_nb18 = None,
            penalty_cost_nb19 = None,
            penalty_cost_nb20 = None,
            possible_solution = None,
            gap_016 = None,
            gap_05 = None,
            gap_1 = None,
            gap_2 = None,
            gap_3 = None,
            gap_4 = None,
            gap_5 = None,
            gap_10 = None,
            gap_20 = None,
            gap_30 = None,
            memory = None
        )

        # new_entry der Datenbank hinzufügen
        db.session.add(new_entry)

        # Änderungen in der Datenbank speichern
        db.session.commit()
        print("Daten erfolgreich in die Datenbank gespeichert.")