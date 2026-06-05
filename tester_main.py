from tester_csv_loader import load_csv
from tester_meal_builder import build_meal_shifts

from tester_order_loader import load_orders

from tester_tip_builder import attach_tips_to_meals


# =====================================================
# FINAL PRINT
# =====================================================

def print_full_meal_shifts(meal_shifts):

    for m in meal_shifts:

        print("\n==============================")
        print(f"{m.date} - {m.meal}")
        print("==============================")

        # -------------------------
        # EMPLOYEES
        # -------------------------
        print(f"\nEmployees ({len(m.employees)}):")

        for p in m.employees:
            print(
                f"  - {p.employee.name} "
                f"ratio:{p.ratio:.2f}"
            )

        # -------------------------
        # TIPS
        # -------------------------
        print(f"\nTips ({len(m.tips)}):")

        total = 0

        for t in m.tips:
            print(
                f"  - {t.employee_name:<20} ${t.amount:.2f}"
            )
            total += t.amount

        print(f"\nTOTAL TIPS: ${total:.2f}")


# =====================================================
# MAIN
# =====================================================

def main():

    # ----------------------------------
    # LOAD SHIFTS
    # ----------------------------------
    shift_rows = load_csv("shifts.csv")

    print(f"\nLoaded {len(shift_rows)} shifts")

    meal_shifts = build_meal_shifts(shift_rows)

    # ----------------------------------
    # LOAD ORDERS
    # ----------------------------------
    order_rows = load_orders("orders.csv")

    print(f"\nLoaded {len(order_rows)} orders")

    # ----------------------------------
    # ATTACH TIPS (UNCOMMENT WHEN READY)
    # ----------------------------------
    attach_tips_to_meals(
        meal_shifts,
        order_rows
    )

    # ----------------------------------
    # FINAL OUTPUT ONLY
    # ----------------------------------
    print_full_meal_shifts(meal_shifts)


if __name__ == "__main__":
    main()