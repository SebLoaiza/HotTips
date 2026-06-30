from datetime import datetime
from api.models import Order


# =========================
# SINGLE ROW PARSER
# =========================


def parse_order(row: dict) -> Order:

    dt = datetime.strptime(row["Opened"], "%m/%d/%y %I:%M %p")

    return Order(
        order_id=row["Order Id"],
        order_number=row["Order #"],

        order_day=dt.date().isoformat(),
        order_time_min=dt.hour * 60 + dt.minute,
        order_timestamp=dt,

        server=row["Server"],
        service=row["Service"],

        amount=float(row["Amount"] or 0),
        tip=float(row["Tip"] or 0),
        gratuity=float(row["Gratuity"] or 0),

        source=row["Order Source"]
    )

# =========================
# BATCH PARSER
# =========================
def parse_orders(rows: list[dict]) -> list[Order]:
    return [parse_order(row) for row in rows]