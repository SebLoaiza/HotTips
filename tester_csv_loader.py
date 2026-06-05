import csv


def load_csv(path: str):
    """
    Loads raw CSV rows as dictionaries.
    """
    with open(path, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def print_raw(rows):
    """
    Debug print of raw CSV rows.
    """
    for i, row in enumerate(rows):
        print(f"\nROW {i}")
        for k, v in row.items():
            if v not in (None, "", " "):
                print(f"  {k}: {v}")