from ortools.linear_solver import pywraplp
from data_processing import DataProcessing

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
        max_working_time = 8
        min_zeit = {ma: 3 for ma in mitarbeiter}  # Maximale Arbeitszeit pro Tag
        salary = 1
        calc_time = 3

        # Diese Daten werden später noch aus der Datenbank gezogen
        # min_anwesend = [2] * 24  # Mindestanzahl an Mitarbeitern pro Stunde
        min_anwesend = []
        for _, values in sorted(self.time_req.items()):
            min_anwesend.append(list(values.values()))
        
        print(min_anwesend)

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

        print(x)

        # Zielfunktion ----------------------------------------------------------------------------------------------------------
        objective = solver.Objective()
        for i in mitarbeiter:
            for j in range(calc_time):
                for k in range(len(verfügbarkeit[i][j])):
                    # Die Kosten werden multipliziert
                    objective.SetCoefficient(x[i, j, k], salary)
        # Es wird veruscht, eine Kombination von Werten für die x[i, j, k] zu finden, die die Summe kosten[i]*x[i, j, k] minimiert            
        objective.SetMinimization()


        # Beschränkungen --------------------------------------------------------------------------------------------------------
        # (Die solver.Add() Funktion nimmt eine Bedingung als Argument und fügt sie dem Optimierungsproblem hinzu.)

        # NB 1 MA darf nur eingeteilt werden, sofern er auch verfügbar ist.
        for i in mitarbeiter:
            for j in range(calc_time):
                for k in range(len(verfügbarkeit[i][j])):
                    solver.Add(x[i, j, k] <= verfügbarkeit[i][j][k])


        # NB 2 Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend 
        for i in mitarbeiter:
            for j in range(calc_time):
                # for k in range(len(verfügbarkeit[mitarbeiter[i]][j])):  # Wir nehmen an, dass alle Mitarbeiter die gleichen Öffnungszeiten haben
                for k in range(len(verfügbarkeit[i][j])):  # Wir nehmen an, dass alle Mitarbeiter die gleichen Öffnungszeiten haben
                    solver.Add(solver.Sum([x[i, j, k] for i in mitarbeiter]) >= min_anwesend[j][k])


        # NB 3 Constraint only allows solutions where the max planned summed hour is 25
        total_hours = {ma: solver.Sum([x[ma, j, k] for j in range(calc_time) for k in range(len(verfügbarkeit[ma][j]))]) for ma in mitarbeiter}
        for ma in mitarbeiter:
            solver.Add(total_hours[ma] <= 50)


        # NB 4 Constraint min working hours per day is 5 hours
        for i in mitarbeiter:
            for j in range(calc_time):
                solver.Add(solver.Sum(x[i, j, k] for k in range(len(verfügbarkeit[i][j]))) <= max_zeit[i])

        
        # NB 5 Constraint min working hours per day is 3 hours
        for i in mitarbeiter:
            for j in range(calc_time):
                sum_hours = solver.Sum(x[i, j, k] for k in range(len(verfügbarkeit[i][j])))
                if sum_hours >= min_zeit[i]:
                    solver.Add(sum_hours >= min_zeit[i])

    

       # Constraints to work consecutive
        """for i in mitarbeiter:
            for j in range(calc_time):
                consecutive_hours = 0
                for k in range(len(verfügbarkeit[i][j])):
                    if x[i, j, k] == 1:
                        consecutive_hours += 1
                        solver.Add(consecutive_hours >= 3)"""
                        

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
           

