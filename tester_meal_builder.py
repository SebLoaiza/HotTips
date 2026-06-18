from tester_models import MealShift, Employee, MealParticipation, TipEntry, Break
import datetime
from collections import defaultdict

# =====================================================
# MEAL WINDOWS
# =====================================================

MEAL_WINDOWS = {
    "breakfast": (5 * 60 + 30, 11 * 60 + 30),
    "lunch":     (11 * 60 + 31, 17 * 60 + 30),
    "dinner":    (17 * 60 + 31, 25 * 60),
}

# =====================================================
# TIME HELPERS
# =====================================================

def fmt(cents: int) -> str:
    return f"${cents / 100:.2f}"


def _time_to_min(t):
    if not t:
        return 0

    dt = datetime.datetime.strptime(t.strip(), "%I:%M %p")
    return dt.hour * 60 + dt.minute


# =====================================================
# CORE HELPERS
# =====================================================

def compute_overlap(start, end, m_start, m_end):
    s = max(start, m_start)
    e = min(end, m_end)
    return s, e


def compute_worked_minutes(overlap_start, overlap_end, breaks, meal_start, meal_end):
    worked = overlap_end - overlap_start

    break_minutes = 0
    meal_breaks = []

    for b in breaks:
        bs, be = max(b.start_min, meal_start), min(b.end_min, meal_end)

        if bs < be:
            break_minutes += (be - bs)
            meal_breaks.append(b)

    return worked - break_minutes, meal_breaks


# =====================================================
# SHIFT CREATION
# =====================================================

def create_meal_shift(date, meal):
    meal_start, meal_end = MEAL_WINDOWS[meal]

    shift = MealShift(
        date=date,
        meal=meal,
        meal_minutes=meal_end - meal_start,

        shift_start_min=meal_start,
        shift_end_min=meal_end,

        employees=[],
        tips=[]
    )

    shift._emp_map = {}
    return shift
# =====================================================
# BUILD MEAL SHIFTS
# =====================================================

def build_meal_shifts(rows):

    meal_map = {}
    employee_registry = {}
    i = 0

    while i < len(rows):

        row = rows[i]

        if not row.get("Employee"):
            i += 1
            continue
 
        employee_name = row.get("Employee")
        employee_id = row.get("Employee Guid", "")
        date = row.get("Date")
        role = row.get("Job", "").strip()

        start = _time_to_min(row.get("Time In"))
        end = _time_to_min(row.get("Time Out"))

        if end < start:
            end += 24 * 60

        # -------------------------------------
        # COLLECT BREAKS
        # -------------------------------------
        breaks = []

        if row.get("Break Start") and row.get("Break End"):
            breaks.append(
                Break(
                    start_min=_time_to_min(row["Break Start"]),
                    end_min=_time_to_min(row["Break End"])
                )
            )

        j = i + 1

        while j < len(rows) and not rows[j].get("Employee"):

            b_row = rows[j]

            if b_row.get("Break Start") and b_row.get("Break End"):
                breaks.append(
                    Break(
                        start_min=_time_to_min(b_row["Break Start"]),
                        end_min=_time_to_min(b_row["Break End"])
                    )
                )

            j += 1

        if employee_id not in employee_registry:

            print("\n====================================")
            print(f"NEW EMPLOYEE DETECTED: {employee_name}")
            print("====================================")

            while True:
                try:
                    raw = input(f"Enter default point weight for {employee_name} (0.0 - 1.0): ")

                    if raw.strip() == "":
                        weight = 1.0
                        break

                    weight = float(raw)

                    if 0.0 <= weight <= 1.0:
                        break

                    print("Must be between 0 and 1.")
                except ValueError:
                    print("Invalid number. Try again.")

            employee_registry[employee_id] = Employee(
                employee_id=employee_id,
                name=employee_name,
                default_point_weight=weight
            )

        employee = employee_registry[employee_id]

        # -------------------------------------
        # MEAL SPLITTING
        # -------------------------------------
        for meal_name, (meal_start, meal_end) in MEAL_WINDOWS.items():

            overlap_start, overlap_end = compute_overlap(
                start, end, meal_start, meal_end
            )

            if overlap_start >= overlap_end:
                continue

            worked_minutes, meal_breaks = compute_worked_minutes(
                overlap_start,
                overlap_end,
                breaks,
                meal_start,
                meal_end
            )

            meal_length = meal_end - meal_start
            ratio = worked_minutes / meal_length if meal_length else 0

            key = (date, meal_name)

            if key not in meal_map:
                meal_map[key] = create_meal_shift(date, meal_name)

            participation = MealParticipation(
                employee=employee,

                start_min=start,
                end_min=end,

                meal_start_min=overlap_start,
                meal_end_min=overlap_end,

                worked_minutes=worked_minutes,
                ratio=ratio,
                role=role,
                breaks=meal_breaks
            )

            shift = meal_map[key]
            emp_map = shift._emp_map

            if employee_id not in emp_map:
                emp_map[employee_id] = participation

            else:
                existing = emp_map[employee_id]

                # overall shift span
                existing.start_min = min(existing.start_min, start)
                existing.end_min = max(existing.end_min, end)

                # meal overlap span
                existing.meal_start_min = min(
                    existing.meal_start_min,
                    overlap_start
                )

                existing.meal_end_min = max(
                    existing.meal_end_min,
                    overlap_end
                )

                # accumulate work
                existing.worked_minutes += worked_minutes

                # recompute ratio from total worked minutes
                existing.ratio = (
                    existing.worked_minutes / meal_length
                    if meal_length else 0
                )

                if role and not existing.role:
                    existing.role = role

                existing.breaks.extend(meal_breaks)

        i = j

    # -------------------------------------
    # FINALIZE (DICT → LIST)
    # -------------------------------------
    for meal in meal_map.values():
        meal.employees = list(meal._emp_map.values())
        del meal._emp_map

    return list(meal_map.values()), employee_registry