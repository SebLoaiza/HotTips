#tester_csv_loader.py

import csv


def load_csv(file_path):
    rows = []
    with open(file_path, "r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f)

        for row in reader:
            if not row or all(cell.strip() == "" for cell in row):
                continue
            rows.append(row)

    return rows


def safe_float(value):
    try:
        return float(value)
    except:
        return 0.0


    
