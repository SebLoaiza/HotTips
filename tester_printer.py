# tester_printer.py

from tester_time_utils import format_time


def print_shift(shifts):

    print("\n========== SHIFT SUMMARY ==========\n")

    for shift in shifts:

        print(f"Employee : {shift.employee}")
        print(f"Job      : {shift.job}")
        print(f"Date     : {shift.date}")

        print(
            f"Shift    : "
            f"{format_time(shift.start_min)} - "
            f"{format_time(shift.end_min)}"
        )

        print(f"Breakfast Minutes : {shift.breakfast_minutes}")
        print(f"Lunch Minutes     : {shift.lunch_minutes}")
        print(f"Dinner Minutes    : {shift.dinner_minutes}")


        print(f"Breakfast Ratio: {shift.breakfast_coverage}")
        print(f"Lunch Ratio    : {shift.lunch_coverage}")
        print(f"Dinner Ratio   : {shift.dinner_coverage}")

        print(f"Breakfast Eligible: {shift.breakfast_tip_eligible}")
        print(f"Lunch Eligible    : {shift.lunch_tip_eligible}")
        print(f"Dinner Eligible   : {shift.dinner_tip_eligible}")

        print("-" * 50)

    print("\n========== END ==========\n")