#tester_calculations.py

from tester_time_utils import time_to_minutes


BREAKFAST_START = time_to_minutes("5:30 AM")
BREAKFAST_END = time_to_minutes("11:30 AM")

LUNCH_START = time_to_minutes("11:30 AM")
LUNCH_END = time_to_minutes("5:30 PM")

DINNER_START = time_to_minutes("5:30 PM")
DINNER_END = time_to_minutes("1:00 AM")

if DINNER_END < DINNER_START:
    DINNER_END += 1440


def overlap(start1, end1, start2, end2):
    return max(0, min(end1, end2) - max(start1, start2))


def calculate_meal_coverage(shift):

    meals = {
        "breakfast": (BREAKFAST_START, BREAKFAST_END),
        "lunch": (LUNCH_START, LUNCH_END),
        "dinner": (DINNER_START, DINNER_END),
    }

    for name, (start, end) in meals.items():

        base_overlap = overlap(
            shift.start_min,
            shift.end_min,
            start,
            end
        )

        break_overlap = 0

        for b in shift.breaks:
            break_overlap += overlap(
                b.start_min,
                b.end_min,
                start,
                end
            )

        effective = max(0, base_overlap - break_overlap)

        window = end - start

        setattr(shift, f"{name}_minutes", effective)
        setattr(
            shift,
            f"{name}_coverage",
            (effective / window) * 100 if window > 0 else 0
        )