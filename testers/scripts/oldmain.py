import csv
from dataclasses import dataclass, field
from typing import List, Tuple


# =========================================================
# TIME SYSTEM
# =========================================================

def time_to_minutes(t: str) -> int:
    if not t:
        return 0

    t = t.strip()
    time_part, meridian = t.split(" ")
    hour, minute = map(int, time_part.split(":"))

    meridian = meridian.upper()

    if meridian == "PM" and hour != 12:
        hour += 12
    if meridian == "AM" and hour == 12:
        hour = 0

    return hour * 60 + minute


def normalize_overnight(start_min: int, end_min: int) -> int:
    if end_min < start_min:
        end_min += 1440
    return end_min

# =========================================================
# MEAL PERIODS
# =========================================================

BREAKFAST_START = time_to_minutes("5:30 AM")
BREAKFAST_END = time_to_minutes("11:30 AM")

LUNCH_START = time_to_minutes("11:30 AM")
LUNCH_END = time_to_minutes("5:30 PM")

DINNER_START = time_to_minutes("5:30 PM")
DINNER_END = time_to_minutes("1:00 AM")  # overnight

if DINNER_END < DINNER_START:
    DINNER_END += 1440

# =========================================================
# MODELS
# =========================================================

@dataclass
class Break:
    name: str
    start_min: int
    end_min: int
    duration_min: int


@dataclass
class Shift:
    employee: str = ""
    employee_id: str = ""
    job: str = ""
    date: str = ""

    start_min: int = 0
    end_min: int = 0

    total_minutes: int = 0
    payable_minutes: int = 0

    system_tips: float = 0.0
    cash_tips: float = 0.0

    breakfast_minutes: int = 0
    lunch_minutes: int = 0
    dinner_minutes: int = 0

    breakfast_coverage: float = 0.0
    lunch_coverage: float = 0.0
    dinner_coverage: float = 0.0

    breaks: List[Break] = field(default_factory=list)

    crosses_midnight: bool = False


# =========================================================
# CSV LOADER
# =========================================================

def load_csv(file_path):
    rows = []
    with open(file_path, "r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f)

        for row in reader:
            if not row or all(cell.strip() == "" for cell in row):
                continue
            rows.append(row)

    return rows


def safe_float(value):
    try:
        return float(value)
    except:
        return 0.0
# =========================================================
# COVERAGE CALCULATIONS
# =========================================================

def overlap(start1, end1, start2, end2):
    return max(
        0,
        min(end1, end2) - max(start1, start2)
    )


def calculate_meal_coverage(shift: Shift):

    breakfast = overlap(
        shift.start_min,
        shift.end_min,
        BREAKFAST_START,
        BREAKFAST_END
    )

    lunch = overlap(
        shift.start_min,
        shift.end_min,
        LUNCH_START,
        LUNCH_END
    )

    dinner = overlap(
        shift.start_min,
        shift.end_min,
        DINNER_START,
        DINNER_END
    )

    # =====================================
    # REMOVE BREAK TIME FROM COVERAGE
    # =====================================

    for b in shift.breaks:

        breakfast -= overlap(
            b.start_min,
            b.end_min,
            BREAKFAST_START,
            BREAKFAST_END
        )

        lunch -= overlap(
            b.start_min,
            b.end_min,
            LUNCH_START,
            LUNCH_END
        )

        dinner -= overlap(
            b.start_min,
            b.end_min,
            DINNER_START,
            DINNER_END
        )

    breakfast = max(0, breakfast)
    lunch = max(0, lunch)
    dinner = max(0, dinner)

    shift.breakfast_minutes = breakfast
    shift.lunch_minutes = lunch
    shift.dinner_minutes = dinner

    shift.breakfast_coverage = (
        breakfast /
        (BREAKFAST_END - BREAKFAST_START)
    ) * 100

    shift.lunch_coverage = (
        lunch /
        (LUNCH_END - LUNCH_START)
    ) * 100

    shift.dinner_coverage = (
        dinner /
        (DINNER_END - DINNER_START)
    ) * 100

# =========================================================
# SHIFT BUILDER (WITH CASH TIP PROMPT)
# =========================================================

def build_shifts(rows):
    shifts = []
    current = None

    cash_prompted: set[Tuple[str, str]] = set()

    for row in rows:

        if row[0] == "Employee":
            continue

        is_new_shift = row[0].strip() != ""

        # -----------------------------
        # NEW SHIFT
        # -----------------------------
        if is_new_shift:
            if current:
                shifts.append(current)

            start_min = time_to_minutes(row[9])
            end_raw = time_to_minutes(row[10])

            end_min = normalize_overnight(start_min, end_raw)
            total_minutes = end_min - start_min

            current = Shift(
                employee=row[0],
                employee_id=row[1],
                job=row[6],
                date=row[8],
                start_min=start_min,
                end_min=end_min,
                total_minutes=total_minutes,
                system_tips=safe_float(row[21]),
                breaks=[]
            )

            # =================================================
            # CASH TIP PROMPT (SERVER + BREAKFAST SERVER)
            # =================================================
            is_tipped_role = current.job.lower() in ["server", "breakfast server"]

            if is_tipped_role:
                key = (current.employee.lower(), current.date)

                if key not in cash_prompted:
                    cash_prompted.add(key)

                    while True:
                        try:
                            raw = input(
                                f"\nCash tips for {current.employee} "
                                f"({current.job} - {current.date}): $"
                            )

                            if raw.strip() == "":
                                current.cash_tips = 0.0
                                break

                            current.cash_tips = float(raw)
                            break

                        except ValueError:
                            print("Invalid number. Try again.")

        # -----------------------------
        # CONTINUATION ROW (BREAKS)
        # -----------------------------
        else:
            if current:

                break_name = row[28] if len(row) > 28 else ""
                break_start = row[29] if len(row) > 29 else ""
                break_end = row[30] if len(row) > 30 else ""
                break_duration = safe_float(row[31]) if len(row) > 31 else 0.0

                if break_name.strip():
                    b_start = time_to_minutes(break_start)
                    b_end = normalize_overnight(b_start, time_to_minutes(break_end))

                    current.breaks.append(
                        Break(
                            name=break_name,
                            start_min=b_start,
                            end_min=b_end,
                            duration_min=int(break_duration * 60)
                        )
                    )

    if current:
        shifts.append(current)

    # =====================================================
    # PAYABLE MINUTES
    # =====================================================
    for s in shifts:
        unpaid = sum(
            (b.end_min - b.start_min)
            for b in s.breaks
            if "unpaid" in b.name.lower()
        )

        s.payable_minutes = max(0, s.total_minutes - unpaid)
        calculate_meal_coverage(s)

    return shifts


# =========================================================
# OUTPUT
# =========================================================

def format_time(mins: int) -> str:
    mins %= 1440
    return f"{mins // 60:02d}:{mins % 60:02d}"


def print_shifts(shifts):
    for i, s in enumerate(shifts):

        print("\n" + "=" * 60)
        print(f"SHIFT {i}")

        print(f"Employee: {s.employee}")
        print(f"Role: {s.job}")

        print(f"Date: {s.date}")
        print(f"In: {format_time(s.start_min)} -> Out: {format_time(s.end_min)}")

        print(f"Total Minutes: {s.total_minutes}")
        print(f"Payable Minutes: {s.payable_minutes}")

        print("\nMEAL COVERAGE")

        print(
            f"Breakfast: "
            f"{s.breakfast_minutes} min "
            f"({s.breakfast_coverage:.2f}%)"
        )

        print(
            f"Lunch: "
            f"{s.lunch_minutes} min "
            f"({s.lunch_coverage:.2f}%)"
        )

        print(
            f"Dinner: "
            f"{s.dinner_minutes} min "
            f"({s.dinner_coverage:.2f}%)"
        )

        print("\nTIP BREAKDOWN")
        print(f"System Tips: ${s.system_tips:.2f}")
        print(f"Cash Tips:   ${s.cash_tips:.2f}")
        print(f"TOTAL TIPS:  ${(s.system_tips + s.cash_tips):.2f}")

        print("\nBreaks:")
        if not s.breaks:
            print("  None")
        else:
            for b in s.breaks:
                print(
                    f"  - {b.name}: "
                    f"{format_time(b.start_min)} -> {format_time(b.end_min)} "
                    f"({b.duration_min} min)"
                )


# =========================================================
# MAIN
# =========================================================

def main():
    rows = load_csv("shifts.csv")
    shifts = build_shifts(rows)
    print_shifts(shifts)


if __name__ == "__main__":
    main()
