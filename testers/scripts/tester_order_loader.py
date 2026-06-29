import csv


def load_orders(path):
    orders = []

    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        for row in reader:
            orders.append(row)

    return orders