from tester_models import Shift, Break
from tester_time_utils import time_to_minutes, normalize_overnight
from tester_csv_loader import safe_float
from tester_calculations import calculate_meal_coverage
import random
import sys
from tester_time_utils import format_time


# ─────────────────────────────
# DEBUG TIP GENERATOR
# ─────────────────────────────
def rand_tip():
    return round(random.uniform(0, 300), 2)

def fmt_duration(minutes):
    hours = minutes // 60
    mins = minutes % 60

    if hours > 0:
        return f"{hours}h {mins}m"

    return f"{mins}m"


# ─────────────────────────────
# SHIFT BUILDER
# ─────────────────────────────
def build_shifts(rows):
    shifts = []
    current = None
    cash_prompted = set()

    for row in rows:

        if not row or row[0] == "Employee":
            continue

        is_new_shift = row[0].strip() != ""

        # ─────────────────────────────
        # NEW SHIFT
        # ─────────────────────────────
        if is_new_shift:

            if current:
                shifts.append(current)

            start_min = time_to_minutes(row[9])
            end_min = normalize_overnight(start_min, time_to_minutes(row[10]))

            current = Shift(
                employee=row[0],
                employee_id=row[1],
                job=row[6],
                date=row[8],
                start_min=start_min,
                end_min=end_min,
                breaks=[]
            )

            # DEBUG TIPS
            if current.job.lower() in {"server", "breakfast server"}:
                key = (current.employee.lower(), current.date)

                if key not in cash_prompted:
                    cash_prompted.add(key)

                    current.breakfast_cash = rand_tip()
                    current.breakfast_card = rand_tip()
                    current.lunch_cash = rand_tip()
                    current.lunch_card = rand_tip()
                    current.dinner_cash = rand_tip()
                    current.dinner_card = rand_tip()

        # ─────────────────────────────
        # BREAKS
        # ─────────────────────────────
        if current and len(row) > 30:

            break_name = row[28]

            if break_name and break_name.strip():

                b_start = time_to_minutes(row[29])
                b_end = normalize_overnight(b_start, time_to_minutes(row[30]))

                current.breaks.append(
                    Break(
                        name=break_name,
                        start_min=b_start,
                        end_min=b_end,
                        duration_min=int(safe_float(row[31]) * 60)
                    )
                )

    # append last shift
    if current:
        shifts.append(current)

    # ─────────────────────────────
    # POST PROCESSING
    # ─────────────────────────────
    for s in shifts:

        total_break = sum((b.end_min - b.start_min) for b in s.breaks)
        raw_time = s.end_min - s.start_min

        s.payable_minutes = max(0, raw_time - total_break)

        calculate_meal_coverage(s)

        MIN = 60

        s.breakfast_tip_eligible = s.breakfast_minutes >= MIN
        s.lunch_tip_eligible = s.lunch_minutes >= MIN
        s.dinner_tip_eligible = s.dinner_minutes >= MIN

        s.has_any_eligibility = (
            s.breakfast_tip_eligible or
            s.lunch_tip_eligible or
            s.dinner_tip_eligible
        )

        s.has_multiple_eligibilities = (
            int(s.breakfast_tip_eligible) +
            int(s.lunch_tip_eligible) +
            int(s.dinner_tip_eligible)
        ) > 1

    # ─────────────────────────────
    # FINAL DEBUG DUMP + HARD STOP
    # ─────────────────────────────

    return shifts  # unreachable, but kept for safety


