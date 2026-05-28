from app.ingest.toast_shifts import load_shift_csv
from app.services.coverage_engine import compute_coverage



def format_coverage(coverage_list, employee_shift):

    total = 0

    print(f"\n--- {employee_shift.name} ---")
    print(f"SHIFT: {employee_shift.clock_in} → {employee_shift.clock_out}")
    print(f"DATE: {employee_shift.clock_in.date()}")

    for c in coverage_list:
        print(
            f"{c.shift_type} | "
            f"{c.hours} hours | "
            f"{c.percent_of_shift}% | "
            f"{employee_shift.clock_in.date()}"
        )
        total += c.hours

    print(f"Total computed hours: {round(total, 2)}")
    print(f"Total computed hours CSV: {round(employee_shift.payable_hours + employee_shift.unpaid_break_hours, 2)}\n\n")

    print(f"Payable hours (from CSV): {employee_shift.payable_hours}")
    print(f"Unpaid hours (from CSV): {employee_shift.unpaid_break_hours}")

from app.ingest.toast_shifts import load_shift_csv
from app.services.coverage_engine import compute_coverage


shifts = load_shift_csv("data/raw/shifts.csv")

for s in shifts:


    coverage = compute_coverage(s)

    format_coverage(coverage, s)