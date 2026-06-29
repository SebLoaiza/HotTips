import csv
from api.services.meal_blocks import build_meal_blocks_with_employees


# =====================================================
# LOAD CSV
# =====================================================

def load_csv(path: str):
    rows = []

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            rows.append(row)

    return rows


# =====================================================
# TIME FORMATTER
# =====================================================

def mins_to_time(mins: int):

    hour = (mins // 60) % 24
    minute = mins % 60

    suffix = "AM"
    if hour >= 12:
        suffix = "PM"

    display = hour % 12
    if display == 0:
        display = 12

    return f"{display}:{minute:02d} {suffix}"


# =====================================================
# PRINT RESULTS
# =====================================================

def print_blocks(blocks):

    print(f"\nCreated {len(blocks)} meal blocks\n")

    for block in blocks:

        print("=" * 85)

        print(
            f"{block.date} | "
            f"{block.meal} | "
            f"{mins_to_time(block.start)} -> {mins_to_time(block.end)} | "
            f"Employees: {len(block.employees)}"
        )

        print("-" * 85)

        for e in block.employees:

            print(f"\n{e.name}")
            print(f"    Role          : {e.role}")
            print(
                f"    Meal Span     : "
                f"{mins_to_time(e.meal_start)} -> "
                f"{mins_to_time(e.meal_end)}"
            )
            print(f"    Worked Minutes: {e.worked_minutes}")
            print(f"    Lost Minutes  : {e.lost_mins}")

            if e.breaks:

                print("    Breaks:")

                total_break = 0

                for start, end in e.breaks:

                    mins = end - start
                    total_break += mins

                    print(
                        f"        "
                        f"{mins_to_time(start)} -> "
                        f"{mins_to_time(end)} "
                        f"({mins} mins)"
                    )

                print(f"    Total Breaks : {total_break} mins")

            else:
                print("    Breaks       : None")

        print()

# =====================================================
# MAIN TEST RUN
# =====================================================

if __name__ == "__main__":

    # CHANGE THIS PATH IF NEEDED
    CSV_PATH = "shiftser.csv"

    rows = load_csv(CSV_PATH)

    blocks = build_meal_blocks_with_employees(rows)

    print_blocks(blocks)