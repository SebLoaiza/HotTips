from tester_models import MealShift, Employee, MealParticipation
import datetime


MEAL_WINDOWS = {
    "breakfast": (5 * 60 + 30, 11 * 60 + 30),
    "lunch":     (11 * 60 + 31, 17 * 60 + 30),
    "dinner":    (17 * 60 + 31, 25 * 60),
}


def build_meal_shifts(rows):

    meal_map = {}

    i = 0

    while i < len(rows):

        row = rows[i]

        # -------------------------------------
        # Skip stray break rows
        # -------------------------------------
        if not row.get("Employee"):
            i += 1
            continue

        employee_name = row.get("Employee")
        employee_id = row.get("Employee Guid", "")
        date = row.get("Date")

        start = _time_to_min(row.get("Time In"))
        end = _time_to_min(row.get("Time Out"))

        # overnight protection
        if end < start:
            end += 24 * 60

        # -------------------------------------
        # Collect ALL breaks belonging
        # -------------------------------------
        breaks = []

        if row.get("Break Start") and row.get("Break End"):
            breaks.append(
                (
                    _time_to_min(row["Break Start"]),
                    _time_to_min(row["Break End"])
                )
            )

        j = i + 1

        while j < len(rows) and not rows[j].get("Employee"):

            break_row = rows[j]

            if break_row.get("Break Start") and break_row.get("Break End"):

                breaks.append(
                    (
                        _time_to_min(break_row["Break Start"]),
                        _time_to_min(break_row["Break End"])
                    )
                )

            j += 1

        # -------------------------------------
        # Employee object
        # -------------------------------------
        employee = Employee(
            employee_id=employee_id,
            name=employee_name
        )

        # -------------------------------------
        # Build meal participations
        # -------------------------------------
        for meal_name, (meal_start, meal_end) in MEAL_WINDOWS.items():

            overlap_start = max(start, meal_start)
            overlap_end = min(end, meal_end)

            if overlap_start >= overlap_end:
                continue

            worked_minutes = overlap_end - overlap_start

            break_minutes = 0
            meal_breaks = []

            for b_start, b_end in breaks:

                overlap_break_start = max(b_start, meal_start)
                overlap_break_end = min(b_end, meal_end)

                if overlap_break_start < overlap_break_end:

                    break_minutes += (
                        overlap_break_end - overlap_break_start
                    )

                    meal_breaks.append((b_start, b_end))

            worked_minutes -= break_minutes

            meal_length = meal_end - meal_start
            ratio = worked_minutes / meal_length

            key = (date, meal_name)

            if key not in meal_map:
                meal_map[key] = MealShift(
                    date=date,
                    meal=meal_name,
                    employees={},   # ✅ FIXED (dict instead of list)
                    tips=[]
                )

            participation = MealParticipation(
                employee=employee,
                ratio=ratio,
                start_min=start,
                end_min=end,
                breaks=meal_breaks
            )

            # -------------------------------------
            # MERGE LOGIC (NO DUPLICATES)
            # -------------------------------------
            emp_map = meal_map[key].employees
            emp_id = employee_id

            if emp_id not in emp_map:
                emp_map[emp_id] = participation
            else:
                existing = emp_map[emp_id]

                existing.start_min = min(existing.start_min, start)
                existing.end_min = max(existing.end_min, end)

                existing.ratio += ratio

                existing.breaks.extend(meal_breaks)

        i = j

    # convert dict -> list for output
    for meal in meal_map.values():
        meal.employees = list(meal.employees.values())

    return list(meal_map.values())


# =====================================================
# HELPERS
# =====================================================

def _time_to_min(t):

    if not t:
        return 0

    dt = datetime.datetime.strptime(
        t.strip(),
        "%I:%M %p"
    )

    return dt.hour * 60 + dt.minute


def _min_to_time(m):

    h = (m // 60) % 24
    mm = m % 60

    suffix = "AM" if h < 12 else "PM"

    h = h % 12
    if h == 0:
        h = 12

    return f"{h}:{mm:02d} {suffix}"


def print_meal_shifts(meal_shifts):

    for m in meal_shifts:

        print("\n------------------------")
        print(f"{m.date} - {m.meal}")
        print(f"Participants ({len(m.employees)}):")

        for p in m.employees:

            print(
                f"  - {p.employee.name} "
                f"({_min_to_time(p.start_min)} - {_min_to_time(p.end_min)}) "
                f"ratio:{p.ratio:.2f} "
                f"breaks:{len(p.breaks)}"
            )

            for b_start, b_end in p.breaks:

                print(
                    f"      break: "
                    f"{_min_to_time(b_start)} - "
                    f"{_min_to_time(b_end)}"
                )