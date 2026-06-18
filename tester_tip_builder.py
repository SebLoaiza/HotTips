from tester_models import TipEntry
import datetime
import re
import random
import string

# =====================================================
# ANSI COLORS
# =====================================================

RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RESET = "\033[0m"


# =====================================================
# MONEY (CENTS ONLY)
# =====================================================

def to_cents(x: float) -> int:
    return int(round(x * 100))


def to_dollars(cents: int) -> float:
    return cents / 100


# =====================================================
# NAME NORMALIZATION
# =====================================================

def normalize_name(name: str):
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
# DIGITAL ID
# =====================================================

def digital_id():
    return "DIGITAL-" + "".join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=8
        )
    )


# =====================================================
# DATE / MEAL PARSER
# =====================================================

def get_date_and_meal(opened: str):

    dt = datetime.datetime.strptime(
        opened.strip(),
        "%m/%d/%y %I:%M %p"
    )

    minutes = dt.hour * 60 + dt.minute

    if 330 <= minutes <= 690:
        meal = "breakfast"
    elif 691 <= minutes <= 1050:
        meal = "lunch"
    else:
        meal = "dinner"

    # MUST MATCH MEAL JSON
    date = dt.strftime("%B %d, %Y")

    return date, meal


# =====================================================
# INDEX BUILDER
# =====================================================

def build_participation_index(meal_shifts):

    index = {}

    print("\n==============================")
    print("BUILDING PARTICIPATION INDEX")
    print("==============================")

    for meal in meal_shifts:

        key = (meal.date, meal.meal)

        index[key] = {}

        print(
            "\n[DEBUG] INDEX BUILD:",
            key,
            "employees:",
            len(meal.employees)
        )

        for p in meal.employees:

            name = normalize_name(
                p.employee.name
            )

            index[key][name] = p

            print(
                "[DEBUG]   indexed:",
                name,
                "->",
                p.employee.employee_id
            )

    return index


# =====================================================
# ATTACH TIPS
# =====================================================

def attach_tips_to_meals(
    meal_shifts,
    order_rows
):

    index = build_participation_index(
        meal_shifts
    )

    attached = 0
    unmatched = 0

    print("\n==============================")
    print("ATTACHING CARD TIPS")
    print("==============================")

    for i, row in enumerate(order_rows):

        print("\n--------------------------------------")
        print(
            "ROW",
            i,
            ": Order #"
            + str(row.get("Order #"))
        )
        print(row)

        # -------------------------
        # MONEY
        # -------------------------

        try:

            tip = to_cents(
                float(
                    row.get("Tip", 0)
                    or 0
                )
            )

            gratuity = to_cents(
                float(
                    row.get("Gratuity", 0)
                    or 0
                )
            )

        except Exception as e:

            print(
                RED,
                "BAD MONEY FIELD:",
                e,
                RESET
            )

            continue

        amount = tip + gratuity

        print(
            "TIP cents:",
            tip,
            "| GRATUITY cents:",
            gratuity,
            "| TOTAL:",
            amount
        )

        if amount <= 0:

            print("SKIP: zero tip/gratuity")

            continue

        # -------------------------
        # DATE / MEAL
        # -------------------------

        date, meal = get_date_and_meal(
            row["Opened"]
        )

        print(
            "PARSED:",
            date,
            "|",
            meal
        )

        # -------------------------
        # FIND MEAL
        # -------------------------

        meal_obj = None

        for m in meal_shifts:

            if (
                m.date == date
                and
                m.meal == meal
            ):
                meal_obj = m
                break

        if meal_obj is None:

            print("NO MEAL MATCH FOUND")
            print(
                "LOOKING FOR:",
                date,
                meal
            )

            print("\nAVAILABLE:")

            for m in meal_shifts:

                if m.date == date:
                    print(
                        "  ",
                        m.date,
                        m.meal
                    )

            continue

        print(
            "MEAL FOUND:",
            meal_obj.date,
            meal_obj.meal
        )

        # -------------------------
        # DIGITAL
        # -------------------------

        server_raw = (
            row.get("Server")
            or ""
        ).lower()

        is_digital = (
            "online ordering" in server_raw
            or
            "default online ordering" in server_raw
            or
            "digital" in server_raw
        )

        if is_digital:

            print(
                "DIGITAL ORDER"
            )

            meal_obj.online_total += amount

            meal_obj.tips.append(
                TipEntry(
                    employee_name="DIGITAL ORDER",
                    employee_id=digital_id(),
                    amount=amount,
                    source="digital"
                )
            )

            attached += 1

            continue

        # -------------------------
        # SERVER LOOKUP
        # -------------------------

        server_name = normalize_name(
            row.get("Server", "")
        )

        print(
            "SERVER:",
            server_name
        )

        participant = (
            index
            .get(
                (date, meal),
                {}
            )
            .get(
                server_name
            )
        )

        if participant is None:

            unmatched += 1

            print(
                RED
                + "SERVER NOT FOUND"
                + RESET
            )

            print(
                "SEARCHED:",
                server_name
            )

            print(
                "\nAVAILABLE SERVERS:"
            )

            for name in sorted(
                index.get(
                    (date, meal),
                    {}
                ).keys()
            ):
                print(
                    "   ",
                    name
                )

            continue

        print(
            GREEN
            + "SERVER MATCHED"
            + RESET
        )

        print(
            "Employee:",
            participant.employee.name
        )

        print(
            "Employee ID:",
            participant.employee.employee_id
        )

        print(
            "Amount:",
            "$"
            + str(
                round(
                    to_dollars(amount),
                    2
                )
            )
        )

        meal_obj.tips.append(
            TipEntry(
                employee_name=participant.employee.name,
                employee_id=participant.employee.employee_id,
                amount=amount,
                source="card"
            )
        )

        print(
            GREEN
            + "ATTACHED"
            + RESET
        )

        attached += 1

    print("\n==============================")
    print("ATTACH SUMMARY")
    print("==============================")

    print(
        GREEN
        + "Attached "
        + str(attached)
        + " rows"
        + RESET
    )

    if unmatched:

        print(
            RED
            + "Unmatched "
            + str(unmatched)
            + " rows"
            + RESET
        )