from api.models import MealBlock, MealParticipation
import datetime

# =====================================================
# MEAL WINDOWS
# =====================================================

MEAL_WINDOWS = {
    "Breakfast": (330, 690),
    "Lunch": (691, 1050),
    "Dinner": (1051, 1560),
}

# =====================================================
# TIME HELPERS
# =====================================================

def time_to_min(time_str: str) -> int:
    if not time_str:
        return 0

    dt = datetime.datetime.strptime(time_str.strip(), "%I:%M %p")
    return dt.hour * 60 + dt.minute


def overlaps(a_start, a_end, b_start, b_end) -> bool:
    return max(a_start, b_start) < min(a_end, b_end)


def clip(a_start, a_end, b_start, b_end):
    """
    Returns intersection of two ranges or None
    """
    s = max(a_start, b_start)
    e = min(a_end, b_end)

    if s < e:
        return s, e
    return None


# =====================================================
# STEP 1: BUILD MEAL BLOCKS
# =====================================================

def build_meal_blocks(rows: list[dict]):
    seen_dates = set()
    meal_blocks = []

    for row in rows:
        date = row.get("Date")
        if not date:
            continue

        if date in seen_dates:
            continue

        seen_dates.add(date)

        for meal_name, (start, end) in MEAL_WINDOWS.items():
            meal_blocks.append(
                MealBlock(
                    date=date,
                    meal=meal_name,
                    start=start,
                    end=end,
                    online_total=0,
                    employees=[]
                )
            )

    return meal_blocks


# =====================================================
# STEP 2: LINK + SLICE EMPLOYEES INTO MEALS
# =====================================================

def link_employees(rows: list[dict], meal_blocks: list[MealBlock]):

    current_shift = None
    current_breaks = []

    def process_shift(shift_row, breaks):

        if shift_row is None:
            return

        date = shift_row.get("Date")

        start = time_to_min(shift_row.get("Time In"))
        end = time_to_min(shift_row.get("Time Out"))

        # overnight shifts
        if end < start:
            end += 24 * 60

        for block in meal_blocks:

            if block.date != date:
                continue

            clipped = clip(start, end, block.start, block.end)

            if clipped is None:
                continue

            meal_start, meal_end = clipped
            worked = meal_end - meal_start

            meal_breaks = []

            for b_start, b_end in breaks:

                if b_end < b_start:
                    b_end += 24 * 60

                b_clip = clip(
                    b_start,
                    b_end,
                    meal_start,
                    meal_end
                )

                if b_clip is None:
                    continue

                bs, be = b_clip

                meal_breaks.append((bs, be))

            block.employees.append(
                MealParticipation(
                    employee_id=shift_row.get("Employee Guid", ""),
                    name=shift_row.get("Employee", ""),
                    role=shift_row.get("Job", ""),
                    meal_start=meal_start,
                    meal_end=meal_end,
                    worked_minutes=worked,
                    breaks=meal_breaks
                )
            )

    # =====================================================
    # Read CSV
    # =====================================================

    for row in rows:

        # New employee row
        if row.get("Employee"):

            # Finish previous employee
            process_shift(current_shift, current_breaks)

            current_shift = row
            current_breaks = []

            # First row can contain a break
            if row.get("Break Start") and row.get("Break End"):

                current_breaks.append((
                    time_to_min(row["Break Start"]),
                    time_to_min(row["Break End"])
                ))

        # Continuation row = another break
        else:

            if current_shift is None:
                continue

            if row.get("Break Start") and row.get("Break End"):

                current_breaks.append((
                    time_to_min(row["Break Start"]),
                    time_to_min(row["Break End"])
                ))

    # Don't forget the final employee
    process_shift(current_shift, current_breaks)
# =====================================================
# STEP 3: MERGE EMPLOYEE PARTICIPATIONS
# =====================================================

def merge_employee_participations(meal_blocks: list[MealBlock]):

    for block in meal_blocks:

        merged = {}

        for p in block.employees:

            emp_id = p.employee_id

            if emp_id not in merged:
                merged[emp_id] = {
                    "name": p.name,
                    "meal_start": p.meal_start,
                    "meal_end": p.meal_end,
                    "worked": p.worked_minutes,
                    "breaks": list(p.breaks),
                    "roles": {
                        p.role: p.worked_minutes
                    }
                }
                continue

            m = merged[emp_id]

            # Expand overall span
            m["meal_start"] = min(
                m["meal_start"],
                p.meal_start
            )

            m["meal_end"] = max(
                m["meal_end"],
                p.meal_end
            )

            # Total worked minutes
            m["worked"] += p.worked_minutes

            # Keep every break
            m["breaks"].extend(p.breaks)

            # Track time in each role
            m["roles"][p.role] = (
                m["roles"].get(p.role, 0)
                + p.worked_minutes
            )

        new_participations = []

        for emp_id, data in merged.items():

            # Longest-held role wins
            role = max(
                data["roles"],
                key=data["roles"].get
            )

            span = data["meal_end"] - data["meal_start"]

            break_minutes = sum(
                end - start
                for start, end in data["breaks"]
            )

            gap_minutes = max(
                0,
                span - data["worked"]
            )

            lost = gap_minutes + break_minutes

            new_participations.append(
                MealParticipation(
                    employee_id=emp_id,
                    name=data["name"],
                    role=role,

                    meal_start=data["meal_start"],
                    meal_end=data["meal_end"],

                    worked_minutes=data["worked"],
                    lost_mins=lost,

                    breaks=sorted(
                        data["breaks"],
                        key=lambda b: b[0]
                    )
                )
            )

        block.employees = sorted(
            new_participations,
            key=lambda p: p.meal_start
        )

# =====================================================
# STEP 4: PIPELINE
# =====================================================

def build_meal_blocks_with_employees(rows: list[dict]):
    blocks = build_meal_blocks(rows)

    link_employees(rows, blocks)

    merge_employee_participations(blocks)

    return blocks