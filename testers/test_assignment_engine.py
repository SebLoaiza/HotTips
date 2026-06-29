from engine.meal_assignment_engine import build_employee_meal_assignments


# =========================
# Mock models (for testing only)
# =========================

class EmployeeShift:
    def __init__(self, employee_id, date, start_minute, end_minute):
        self.employee_id = employee_id
        self.date = date
        self.start_minute = start_minute
        self.end_minute = end_minute


class MealShift:
    def __init__(self, date, meal, start_minute, end_minute):
        self.date = date
        self.meal = meal
        self.start_minute = start_minute
        self.end_minute = end_minute


# =========================
# Test data
# =========================

employees = [
    # 06:00 → 12:00
    EmployeeShift("E1", "May 22, 2026", 360, 720),

    # Overnight shift 22:00 → 08:00 (next day logic not handled yet in engine,
    # but useful for future testing)
    EmployeeShift("E2", "May 22, 2026", 1320, 480),
]

meals = [
    # Breakfast: 05:30 → 11:30
    MealShift("May 22, 2026", "Breakfast", 330, 690),

    # Lunch: 11:30 → 17:00
    MealShift("May 22, 2026", "Lunch", 690, 1020),

    # Dinner: 17:30 → 23:59
    MealShift("May 22, 2026", "Dinner", 1050, 1439),
]


# =========================
# Run test
# =========================

def run_test():
    results = build_employee_meal_assignments(employees, meals)

    print("\n===== EMPLOYEE MEAL ASSIGNMENTS =====\n")

    for r in results:
        print(
            f"Employee: {r.employee_id} | "
            f"Date: {r.date} | "
            f"Meal: {r.meal} | "
            f"Overlap: {r.overlap_minutes} min | "
            f"Shift: {r.shift_start_minute}-{r.shift_end_minute} | "
            f"Meal: {r.meal_start_minute}-{r.meal_end_minute}"
        )

    print("\nTotal assignments:", len(results))


# =========================
# Entry point
# =========================

if __name__ == "__main__":
    run_test()