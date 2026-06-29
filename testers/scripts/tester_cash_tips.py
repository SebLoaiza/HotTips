from testers.scripts.tester_models import TipEntry
import re
import random

# =====================================================
# MONEY HELPERS
# =====================================================

def to_cents(x: float) -> int:
    return int(round(x * 100))


def to_dollars(cents: int) -> float:
    return cents / 100


# =====================================================
# NAME NORMALIZATION
# =====================================================

def normalize_name(name: str) -> str:

    if not name:
        return ""

    name = name.strip().lower()
    name = re.sub(r"\s+", " ", name)

    parts = name.split(",")

    if len(parts) == 2:
        parts = [p.strip() for p in parts]
        name = parts[1] + " " + parts[0]

    return name


# =====================================================
# TIME HELPER
# =====================================================

def _min_to_time(m: int) -> str:

    h = (m // 60) % 24
    mm = m % 60

    suffix = "AM"
    if h >= 12:
        suffix = "PM"

    h = h % 12
    if h == 0:
        h = 12

    return str(h) + ":" + str(mm).zfill(2) + " " + suffix


# =====================================================
# RULES
# =====================================================

FOH_KEYWORDS = {"server", "bartender", "host", "runner"}
ELIGIBLE_MINUTES = 90


def is_foh(role: str) -> bool:
    return role is not None and any(k in role.lower() for k in FOH_KEYWORDS)


def is_eligible(participation) -> bool:
    return participation.worked_minutes >= ELIGIBLE_MINUTES


def get_eligible_foh(meal):
    result = []

    for p in meal.employees:
        if is_foh(p.role) and is_eligible(p):
            result.append(p)

    return result


# =====================================================
# CASH COLLECTION
# =====================================================

def collect_cash_tips(meal_shifts):

    print("\n==============================")
    print("CASH TIP ENTRY")
    print("==============================")
    print("Minimum eligibility: " + str(ELIGIBLE_MINUTES) + " minutes")

    for meal in meal_shifts:

        eligible_foh = get_eligible_foh(meal)

        if len(eligible_foh) == 0:
            continue

        print("\n====================================")
        print(meal.date + " | " + meal.meal.upper())
        print("====================================")

        for p in eligible_foh:

            print("\n" + p.employee.name)
            print("Role: " + p.role)
            print(
                "Worked Window: "
                + _min_to_time(p.start_min)
                + " - "
                + _min_to_time(p.end_min)
            )
            print("Worked Minutes: " + str(p.worked_minutes))
            print("Eligible: YES")

            # -------------------------
            # INPUT
            # -------------------------
            while True:
                try:
                    amount = float(input("Cash tips earned ($): "))
                    #amount = random.uniform(0,100)
                    #amount = 0

                    amount_cents = to_cents(amount)

                    meal.tips.append(
                        TipEntry(
                            employee_id=p.employee.employee_id,
                            employee_name=p.employee.name,
                            amount=amount_cents,
                            source="cash"
                        )
                    )

                    break

                except ValueError:
                    print("Invalid amount. Try again.")


# =====================================================
# SUMMARY
# =====================================================

def print_cash_summary(meal_shifts):

    print("\n==============================")
    print("CASH TIP SUMMARY")
    print("==============================")

    grand_total = 0

    for meal in meal_shifts:

        cash_total = 0

        for t in meal.tips:
            if t.source == "cash":
                cash_total += t.amount

        grand_total += cash_total

        print(
            meal.date + " "
            + meal.meal + " "
            + "$" + str(round(to_dollars(cash_total), 2))
        )

    print("\nTOTAL CASH: $" + str(round(to_dollars(grand_total), 2)))


# =====================================================
# DEBUG OUTPUT
# =====================================================

def print_cash_tips(meal_shifts):

    print("\n==============================")
    print("CASH TIP DETAILS")
    print("==============================")

    for meal in meal_shifts:

        cash_tips = []

        for t in meal.tips:
            if t.source == "cash":
                cash_tips.append(t)

        if len(cash_tips) == 0:
            continue

        print("\n" + meal.date + " - " + meal.meal)

        for tip in cash_tips:

            print(
                "  " + tip.employee_name
                + " $" + str(round(to_dollars(tip.amount), 2))
            )