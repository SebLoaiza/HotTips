import json

from testers.scripts.tester_csv_loader import load_csv
from testers.scripts.tester_meal_builder import build_meal_shifts
from testers.scripts.tester_order_loader import load_orders
from testers.scripts.tester_pool_distribution import distribute_pools
from testers.scripts.tester_tip_builder import attach_tips_to_meals
from testers.scripts.tester_cash_tips import collect_cash_tips
from testers.scripts.tester_tip_distribution import run_tip_distribution


def main():

    # =================================================
    # LOAD SHIFTS
    # =================================================
    shift_rows = load_csv("shiftsTEMP.csv")
    print("Loaded", len(shift_rows), "shifts")

    meal_shifts, employee_registry = build_meal_shifts(shift_rows)

    # =================================================
    # EMPLOYEE REGISTRY DEBUG (START STATE)
    # =================================================
    print("\n================ EMPLOYEE REGISTRY ================\n")

    for emp_id, emp in employee_registry.items():
        print(
            f"{emp.name:25} "
            f"{emp.employee_id} "
            f"pt:{emp.default_point_weight:.2f} "
            f"gross:${emp.lifetime_gross_tips/100:.2f} "
            f"owned:${emp.lifetime_owned_cash/100:.2f} "
            f"pool:${emp.lifetime_pool_cash/100:.2f}"
        )

    print("\n====================================================\n")

    # =================================================
    # LOAD ORDERS
    # =================================================
    order_rows = load_orders("ordersTEMP.csv")
    print("Loaded", len(order_rows), "orders")

    attach_tips_to_meals(meal_shifts, order_rows)
    collect_cash_tips(meal_shifts)

    # =================================================
    # RUN TIP DISTRIBUTION
    # =================================================
    reports = run_tip_distribution(meal_shifts)
    distribute_pools(reports)

    # =================================================
    # EXPORT HELPERS
    # =================================================
    def meal_shift_to_dict(m):
        return {
            "date": m.date,
            "meal": m.meal,
            "shift_start_min": m.shift_start_min,
            "shift_end_min": m.shift_end_min,
            "online_total": m.online_total,

            "employees": [
                {
                    "employee_id": p.employee.employee_id,
                    "name": p.employee.name,
                    "role": p.role,
                    "worked_minutes": p.worked_minutes,
                    "ratio": p.ratio,

                    "meal_start_min": p.meal_start_min,
                    "meal_end_min": p.meal_end_min,

                    "meal_earned": getattr(p, "meal_earned", 0),
                    "direct_earnings": getattr(p, "direct_earnings", 0),
                    "pool_received": getattr(p, "pool_received", 0),

                    "lifetime_gross_tips": p.employee.lifetime_gross_tips,
                    "lifetime_owned_cash": p.employee.lifetime_owned_cash,
                    "lifetime_pool_cash": p.employee.lifetime_pool_cash,
                }
                for p in m.employees
            ],

            "tips": [
                {
                    "employee_name": t.employee_name,
                    "employee_id": t.employee_id,
                    "amount": t.amount,
                    "source": t.source,
                }
                for t in m.tips
            ],

            "lifetime_summary": {
                p.employee.employee_id: {
                    "name": p.employee.name,
                    "gross": p.employee.lifetime_gross_tips,
                    "owned": p.employee.lifetime_owned_cash,
                    "pool": p.employee.lifetime_pool_cash,
                }
                for p in m.employees
            }
        }

    # =================================================
    # WRITE JSON OUTPUT
    # =================================================
    output = [meal_shift_to_dict(m) for m in meal_shifts]

    with open("output.json", "w") as f:
        json.dump(output, f, indent=2)

    print("\nExported to output.json")

    # =================================================
    # FINAL EMPLOYEE SNAPSHOT (CLEAN LEADERBOARD)
    # =================================================
    print("\n\n================ FINAL EMPLOYEE SNAPSHOT ================\n")

    all_employees = {}

    for m in meal_shifts:
        for p in m.employees:
            emp = p.employee
            all_employees[emp.employee_id] = emp

    sorted_employees = sorted(
        all_employees.items(),
        key=lambda x: x[1].lifetime_owned_cash,
        reverse=True
    )

    for emp_id, emp in sorted_employees:

        gross = emp.lifetime_gross_tips / 100
        owned = emp.lifetime_owned_cash / 100
        pool = emp.lifetime_pool_cash / 100
        total = owned + pool

        print(
            f"{emp.name:25} "
            f"gross:${gross:,.2f}   "
            f"owned:${owned:,.2f}   "
            f"pool:${pool:,.2f}   "
            f"total:${total:,.2f}"
        )

    print("\n=========================================================\n")


# =====================================================
# ENTRY POINT
# =====================================================

if __name__ == "__main__":
    main()