import csv


# =====================================================
# CSV LOADER (ROBUST)
# =====================================================

def load_csv(path: str):
    """
    Loads CSV rows safely using DictReader,
    with basic cleaning for POS export issues.
    """
    with open(path, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    return clean_rows(rows)


# =====================================================
# CLEANING LAYER (IMPORTANT FIX)
# =====================================================

def clean_rows(rows):
    """
    Removes:
    - repeated header rows
    - empty rows
    - malformed POS exports
    """

    cleaned = []

    for row in rows:

        if not row:
            continue

        # Detect repeated header row
        if row.get("Order #") == "Order #":
            continue

        # Skip completely empty rows
        if all(v in (None, "", " ") for v in row.values()):
            continue

        cleaned.append(row)

    return cleaned


# =====================================================
# SAFE CONVERSION HELPERS
# =====================================================

def safe_float(x):
    """
    Converts messy CSV values safely to float.
    """
    try:
        if x is None:
            return 0.0
        x = str(x).strip()
        if x == "" or x.lower() in ("none", "null"):
            return 0.0
        return float(x)
    except:
        return 0.0


def safe_int(x):
    """
    Converts to int safely if needed.
    """
    try:
        return int(float(x))
    except:
        return 0


# =====================================================
# DEBUG PRINT
# =====================================================

def print_raw(rows):
    """
    Debug print of cleaned CSV rows.
    Highlights suspicious rows.
    """

    for i, row in enumerate(rows):
        print(f"\nROW {i}")

        bad_row = False

        for k, v in row.items():
            if v in (None, "", " "):
                continue

            # flag suspicious repeated header leakage
            if v == k:
                bad_row = True

            print(f"  {k}: {v}")

        if bad_row:
            print("  ⚠️ POSSIBLE BAD ROW (header leakage detected)")


# =====================================================
# TIP EXTRACTION HELPERS
# =====================================================

def get_tip_amount(row):
    """
    Safely extracts Tip + Gratuity as cents.
    """

    tip = safe_float(row.get("Tip"))
    gratuity = safe_float(row.get("Gratuity"))

    return int(round((tip + gratuity) * 100))