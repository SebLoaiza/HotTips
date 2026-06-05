from tester_models import TipEntry
import datetime


def attach_tips_to_meals(meal_shifts, order_rows):

    meal_lookup = {
        (m.date, m.meal): m
        for m in meal_shifts
    }

    attached = 0

    for row in order_rows:

        try:
            amount = float(row.get("Tip", 0) or 0)
            amount += float(row.get("Gratuity", 0) or 0)

        except ValueError:
            continue

        if amount <= 0:
            continue

        date, meal = _get_date_and_meal(row["Opened"])

        key = (date, meal)

        if key not in meal_lookup:
            continue

        meal_lookup[key].tips.append(
            TipEntry(
                employee_name=row["Server"].strip(),
                amount=amount,
                source="card"
            )
        )

        attached += 1

    print(f"Attached {attached} tips")


def print_tips(meal_shifts):

    for meal in meal_shifts:

        if not meal.tips:
            continue

        print("\n==============================")
        print(f"{meal.date} - {meal.meal}")
        print("==============================")

        total = 0

        for tip in meal.tips:

            print(
                f"{tip.employee_name:<25}"
                f"${tip.amount:>7.2f}"
            )

            total += tip.amount

        print("------------------------------")
        print(f"TOTAL: ${total:.2f}")


def _get_date_and_meal(opened):

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

    date = dt.strftime("%B %d, %Y").replace(" 0", " ")

    return date, meal