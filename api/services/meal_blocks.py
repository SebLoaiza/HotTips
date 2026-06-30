from api.models import MealBlock, MealParticipation
import datetime
from typing import List, Dict, Tuple

# =====================================================
# TIME HELPERS
# =====================================================

def time_to_min(time_str: str) -> int:
    if not time_str:
        return 0

    dt = datetime.datetime.strptime(time_str.strip(), "%I:%M %p")
    return dt.hour * 60 + dt.minute


def clip(a_start, a_end, b_start, b_end):
    s = max(a_start, b_start)
    e = min(a_end, b_end)
    if s < e:
        return s, e
    return None


# =====================================================
# STEP 1: BUILD MEAL BLOCKS
# =====================================================

def build_meal_blocks(
    rows: List[dict],
    meal_windows: Dict[str, Dict[str, Tuple[int, int]]]
):
    seen_dates = set()
    meal_blocks: List[MealBlock] = []

    for row in rows:
        date = row.get("Date")

        if not date or date in seen_dates:
            continue

        seen_dates.add(date)

        day_key = datetime.datetime.strptime(
            date,
            "%B %d, %Y"
        ).date().isoformat()

        windows = meal_windows.get(date)
        if not windows:
            continue

        for meal_name, (start, end) in windows.items():
            meal_blocks.append(
                MealBlock(
                    date=date,
                    day_key=day_key,
                    meal=meal_name,
                    start=start,
                    end=end,
                    online_total=0,
                    employees=[],
                    orders=[]
                )
            )

    return meal_blocks


# =====================================================
# STEP 2: LINK EMPLOYEES
# =====================================================

def link_employees(rows: List[dict], meal_blocks: List[MealBlock]):

    current_shift = None
    current_breaks = []

    def process_shift(shift_row, breaks):
        if not shift_row:
            return

        date = shift_row.get("Date")

        start = time_to_min(shift_row.get("Time In"))
        end = time_to_min(shift_row.get("Time Out"))

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

                b_clip = clip(b_start, b_end, meal_start, meal_end)

                if b_clip:
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

    for row in rows:

        if row.get("Employee"):

            process_shift(current_shift, current_breaks)

            current_shift = row
            current_breaks = []

            if row.get("Break Start") and row.get("Break End"):
                current_breaks.append(
                    (
                        time_to_min(row["Break Start"]),
                        time_to_min(row["Break End"])
                    )
                )

        else:

            if not current_shift:
                continue

            if row.get("Break Start") and row.get("Break End"):
                current_breaks.append(
                    (
                        time_to_min(row["Break Start"]),
                        time_to_min(row["Break End"])
                    )
                )

    process_shift(current_shift, current_breaks)


# =====================================================
# STEP 3: MERGE PARTICIPATIONS
# =====================================================

def merge_employee_participations(meal_blocks: List[MealBlock]):

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
                    "roles": {p.role: p.worked_minutes}
                }
                continue

            m = merged[emp_id]

            m["meal_start"] = min(m["meal_start"], p.meal_start)
            m["meal_end"] = max(m["meal_end"], p.meal_end)
            m["worked"] += p.worked_minutes
            m["breaks"].extend(p.breaks)
            m["roles"][p.role] = m["roles"].get(p.role, 0) + p.worked_minutes

        final_list = []

        for emp_id, data in merged.items():

            role = max(data["roles"], key=data["roles"].get)

            span = data["meal_end"] - data["meal_start"]
            break_minutes = sum(e - s for s, e in data["breaks"])
            gap_minutes = max(0, span - data["worked"])

            lost = gap_minutes + break_minutes

            final_list.append(
                MealParticipation(
                    employee_id=emp_id,
                    name=data["name"],
                    role=role,
                    meal_start=data["meal_start"],
                    meal_end=data["meal_end"],
                    worked_minutes=data["worked"],
                    lost_mins=lost,
                    breaks=sorted(data["breaks"], key=lambda b: b[0])
                )
            )

        block.employees = sorted(final_list, key=lambda x: x.meal_start)


# =====================================================
# PIPELINE
# =====================================================

def build_meal_blocks_with_employees(
    rows: List[dict],
    meal_windows: Dict[str, Dict[str, Tuple[int, int]]]
):
    blocks = build_meal_blocks(rows, meal_windows)
    link_employees(rows, blocks)
    merge_employee_participations(blocks)
    return blocks