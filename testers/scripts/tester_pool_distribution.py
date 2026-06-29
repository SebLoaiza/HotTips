from testers.scripts.tester_tip_distribution import ShiftReport
from typing import List, Dict

# =====================================================
# ANSI COLORS
# =====================================================

class C:
    TEAL = "\033[96m"
    BOLD = "\033[1m"
    RESET = "\033[0m"
    ORANGE = "\033[38;5;208m"   # nice orange

    
def bold(text: str) -> str:
    return f"{C.BOLD}{text}{C.RESET}"


def teal(text: str) -> str:
    return f"{C.TEAL}{text}{C.RESET}"


# =====================================================
# EFFECTIVE MINUTES (WITH OVERRIDES)
# =====================================================

def get_weight(e, overrides: Dict[str, float]) -> float:
    return overrides.get(
        e.employee.employee_id,
        getattr(e.employee, "default_point_weight", 1.0)
    )


def effective_minutes(e, overrides: Dict[str, float]) -> float:
    return e.worked_minutes * get_weight(e, overrides)


# =====================================================
# USER INPUT OVERRIDES (PER SHIFT)
# =====================================================

def collect_point_overrides(report):
    overrides = {}

    print("\nPOINT WEIGHT OVERRIDES (SHIFT-SPECIFIC)")
    print("-" * 60)

    print(f"SHIFT: {report.summary.date} | {report.summary.meal}")
    print("-" * 60)

    for e in report.employees:
        default = getattr(e.employee, "default_point_weight", 1.0)

        user_input = input(
            f"{e.name} (default {default:.2f}) → override? [Enter to keep]: "
        ).strip()

        if user_input == "":
            continue

        try:
            overrides[e.employee.employee_id] = float(user_input)
        except ValueError:
            print("Invalid input — skipping override.")

    return overrides


# =====================================================
# WEIGHTED DISTRIBUTION
# =====================================================

def distribute_weighted_pool(pool_name: str, pool_amount: int, employees: list, overrides: Dict[str, float]):

    print("\n" + "=" * 90)
    print(bold(f"{pool_name} DISTRIBUTION"))
    print("=" * 90)

    if pool_amount <= 0 or not employees:
        print("No distribution\n")
        return

    total_effective = sum(effective_minutes(e, overrides) for e in employees)

    if total_effective <= 0:
        print("No worked minutes\n")
        return

    print(f"Pool: ${pool_amount / 100:.2f} | Employees: {len(employees)}")
    print("-" * 90)

    distributed = 0

    for e in employees:

        eff = effective_minutes(e, overrides)
        weight = eff / total_effective

        payout = int(round(pool_amount * weight))

        e.pooled_cash += payout
        e.employee.lifetime_pool_cash += payout

        distributed += payout

        print(
            f"{e.name:25} "
            f"{e.role[:14]:15} "
            f"{e.worked_minutes:4} min "
            f"pt:{get_weight(e, overrides):.2f} "
            f"eff:{eff:6.1f} "
            f"-> ${payout/100:7.2f} "
            f"({weight*100:5.1f}%)"
        )

    diff = pool_amount - distributed
    if diff != 0:
        employees[0].pooled_cash += diff
        print(f"\nRounding fix: ${diff/100:.2f} → {employees[0].name}")

    print()


# =====================================================
# POOL BREAKDOWN
# =====================================================

def print_pool_breakdown(pool_name: str, pool_amount: int, employees: list):

    print("\n" + "=" * 90)
    print(bold(f"{pool_name} BREAKDOWN"))
    print("=" * 90)

    if pool_amount <= 0:
        print("No pool\n")
        return

    print(f"Pool Total: ${pool_amount / 100:.2f}")
    print("-" * 90)

    any_printed = False

    for e in sorted(employees, key=lambda x: x.pooled_cash, reverse=True):

        if e.pooled_cash == 0:
            continue

        any_printed = True

        print(
            f"{e.name:25} "
            f"{e.role[:14]:15} "
            f"${e.pooled_cash/100:8.2f}"
        )

    if not any_printed:
        print("(no payouts)")

    print()


# =====================================================
# DELTA VIEW
# =====================================================

def print_delta(report: ShiftReport):

    print("\n" + "=" * 90)
    print(bold("OWNED VS POOL DELTA"))
    print("=" * 90)

    print(
        f"{'NAME':25}"
        f"{'OWNED':>12}"
        f"{'POOL':>12}"
        f"{'TOTAL':>12}"
        f"{'ΔPOOL':>12}"
    )

    print("-" * 90)

    for e in sorted(report.employees, key=lambda x: x.total_cash, reverse=True):

        print(
            f"{e.name[:24]:25}"
            f"${e.owned_cash/100:11.2f}"
            f"${e.pooled_cash/100:11.2f}"
            f"${e.total_cash/100:11.2f}"
            f"${e.pooled_cash/100:11.2f}"
        )


# =====================================================
# MAIN REPORT
# =====================================================

def print_report(report: ShiftReport, overrides: dict):

    print("\n" + teal("=" * 90))
    print(teal(f"{report.summary.date} | {report.summary.meal.upper()}"))
    print(teal("=" * 90))

    print("\nPOOL SUMMARY")
    print(
        f"S:${report.summary.server_pool/100:.2f} "
        f"B:${report.summary.boh_pool/100:.2f} "
        f"R:${report.summary.busser_pool/100:.2f} "
        f"H:${report.summary.host_pool/100:.2f} "
        f"D:${report.summary.total_net/100:.2f}"
    )

    print_pool_breakdown("SERVER POOL", report.summary.server_pool, report.servers)
    print_pool_breakdown("BUSSER POOL", report.summary.busser_pool, report.bussers)
    print_pool_breakdown("HOST POOL", report.summary.host_pool, report.hosts)
    print_pool_breakdown("BOH POOL", report.summary.boh_pool, report.boh)

    print("\n" + "=" * 90)
    print(bold("EMPLOYEE FINAL RESULTS"))
    print("=" * 90)

    print(
        f"{'NAME':25}"
        f"{'ROLE':15}"
        f"{'MIN':6}"
        f"{'PT':10}"
        f"{'EFF':8}"
        f"{'OWN':12}"
        f"{'POOL':12}"
        f"{'TOTAL':12}"
    )

    print("-" * 90)

    for e in sorted(report.employees, key=lambda x: x.total_cash, reverse=True):

        emp_id = e.employee.employee_id
        base_weight = getattr(e.employee, "default_point_weight", 1.0)

        overridden = emp_id in overrides
        final_weight = overrides.get(emp_id, base_weight)

        eff = e.worked_minutes * final_weight

        weight_display = f"{final_weight:6.2f}"

        if overridden:
            weight_display = f"{C.ORANGE}{weight_display}{C.RESET}"

        print(
            f"{e.name[:24]:25}"
            f"{e.role[:14]:15}"
            f"{e.worked_minutes:6}"
            f"{weight_display}"
            f"{eff:8.1f}"
            f"{e.owned_cash/100:11.2f}"
            f"{e.pooled_cash/100:12.2f}"
            f"${e.total_cash/100:11.2f}"
        )

# =====================================================
# ENTRY
# =====================================================

def distribute_pools(reports: List[ShiftReport]):

    print("\n" + "=" * 90)
    print(bold("POOL DISTRIBUTION SYSTEM"))
    print("=" * 90)

    for report in reports:

        for e in report.employees:
            e.pooled_cash = 0

        overrides = collect_point_overrides(report)

        distribute_weighted_pool("SERVER POOL", report.summary.server_pool, report.servers, overrides)
        distribute_weighted_pool("BUSSER POOL", report.summary.busser_pool, report.bussers, overrides)
        distribute_weighted_pool("HOST POOL", report.summary.host_pool, report.hosts, overrides)
        distribute_weighted_pool("BOH POOL", report.summary.boh_pool, report.boh, overrides)

        print_report(report, overrides)