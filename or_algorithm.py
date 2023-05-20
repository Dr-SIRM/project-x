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
        max_zeit = {ma: 7 for ma in mitarbeiter}  # Maximale Arbeitszeit pro Tag

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
            for j in range(7):  # Für jeden Tag der Woche
                for k in range(len(verfügbarkeit[i][j])):  # Für jede Stunde des Tages, an dem das Café geöffnet ist
                    x[i, j, k] = solver.IntVar(0, 1, f'x[{i}, {j}, {k}]') # Variabeln können nur die Werte 0 oder 1 annehmen

        # Schichtvariable
        y = {}
        for i in mitarbeiter:
            for j in range(7):  # Für jeden Tag der Woche
                for k in range(len(verfügbarkeit[i][j]) - 1):  # Für jede Stunde des Tages, an dem das Café geöffnet ist
                    y[i, j, k] = solver.IntVar(0, 1, f'y[{i}, {j}, {k}]') # Variabeln können nur die Werte 0 oder 1 annehmen


        # Zielfunktion ----------------------------------------------------------------------------------------------------------
        objective = solver.Objective()
        for i in mitarbeiter:
            for j in range(7):
                for k in range(len(verfügbarkeit[i][j])):
                    # Die Kosten werden multipliziert
                    objective.SetCoefficient(x[i, j, k], kosten[i])
        # Es wird veruscht, eine Kombination von Werten für die x[i, j, k] zu finden, die die Summe kosten[i]*x[i, j, k] minimiert            
        objective.SetMinimization()


        # Beschränkungen --------------------------------------------------------------------------------------------------------
        # (Die solver.Add() Funktion nimmt eine Bedingung als Argument und fügt sie dem Optimierungsproblem hinzu.)

        # MA darf nur eingeteilt werden, sofern er auch verfügbar ist.
        for i in mitarbeiter:
            for j in range(7):
                for k in range(len(verfügbarkeit[i][j])):
                    solver.Add(x[i, j, k] <= verfügbarkeit[i][j][k])


        # Mindestanzahl MA zu jeder Stunde an jedem Tag anwesend 
        for j in range(7):
            for k in range(len(verfügbarkeit[mitarbeiter[0]][j])):  # Wir nehmen an, dass alle Mitarbeiter die gleichen Öffnungszeiten haben
                solver.Add(solver.Sum([x[i, j, k] for i in mitarbeiter]) >= min_anwesend[j][k])
        

        # Max Arbeitszeit pro Woche 
        total_hours = {ma: solver.Sum([x[ma, j, k] for j in range(7) for k in range(len(verfügbarkeit[ma][j]))]) for ma in mitarbeiter}
        for ma in mitarbeiter:
            solver.Add(total_hours[ma] <= 25)

        # Max Arbeitszeit pro Tag
        for i in mitarbeiter:
            for j in range(7):
                solver.Add(solver.Sum([x[i, j, k] for k in range(len(verfügbarkeit[i][j]))]) <= max_zeit[i])

        # Mitarbeiter darf nur eine Schicht pro Tag beginnen
        # funktioniert nocht nicht!
        for i in mitarbeiter:
            for j in range(7):
                solver.Add(solver.Sum([y[i, j, k] for k in range(len(verfügbarkeit[i][j]) - 1)]) <= 1)


        # Wenn ein Mitarbeiter arbeitet, darf er nicht in der nächsten Stunde eine neue Schicht beginnen, wenn er auch in dieser Stunde arbeitet
        # funktioniert noch nicht!
        for i in mitarbeiter:
            for j in range(7):
                for k in range(len(verfügbarkeit[i][j]) - 1):
                    if k < len(verfügbarkeit[i][j]) - 2:  # Stellen Sie sicher, dass k+1 innerhalb des Bereichs liegt
                        solver.Add(x[i, j, k] + y[i, j, k+1] - x[i, j, k+1] <= 1)

        # funktioniert noch nicht!
        for i in mitarbeiter:
            for j in range(7):
                for k in range(len(verfügbarkeit[i][j]) - 1):
                    solver.Add(y[i, j, k] <= x[i, j, k])

        # Problem lösen ---------------------------------------------------------------------------------------------------------
        status = solver.Solve()



        # Ergebnisse ausgeben ----------------------------------------------------------------------------------------------------
        if status == pywraplp.Solver.OPTIMAL:
            mitarbeiter_arbeitszeiten = {}
            for i in mitarbeiter:
                mitarbeiter_arbeitszeiten[i] = []
                for j in range(7):
                    arbeitszeit_pro_tag = []
                    for k in range(len(verfügbarkeit[i][j])):
                        arbeitszeit_pro_tag.append(int(x[i, j, k].solution_value()))
                    mitarbeiter_arbeitszeiten[i].append(arbeitszeit_pro_tag)
            print(mitarbeiter_arbeitszeiten)
        else:
            print('Das Problem konnte nicht optimal gelöst werden.')

