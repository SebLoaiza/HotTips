from typing import Dict, List, Tuple
from copy import deepcopy

# =========================
# DEFAULT WINDOWS
# =========================

DEFAULT_MEAL_WINDOWS: Dict[str, Tuple[int, int]] = {
    "Breakfast": (330, 690),
    "Lunch": (691, 1050),
    "Dinner": (1051, 1560),
}

# =========================
# GLOBAL STATE
# =========================

CACHED_ROWS: List[dict] = []

# {
#   "May 22, 2026": {
#       "Breakfast": (330,690),
#       "Lunch": (691,1050),
#       "Dinner": (1051,1560)
#   }
# }
CURRENT_MEAL_WINDOWS: Dict[str, Dict[str, Tuple[int, int]]] = {}


# =========================
# CACHE ROWS
# =========================

def cache_rows(rows: List[dict]):
    global CACHED_ROWS
    CACHED_ROWS = rows


def get_cached_rows():
    return CACHED_ROWS


# =========================
# INITIALIZE WINDOWS
# =========================

def initialize_meal_windows(rows: List[dict]):
    """
    Creates default meal windows for every unique date in CSV.
    Does NOT overwrite existing edits unless date is new.
    """
    global CURRENT_MEAL_WINDOWS

    dates = {
        row.get("Date")
        for row in rows
        if row.get("Date")
    }

    for date in dates:
        if date not in CURRENT_MEAL_WINDOWS:
            CURRENT_MEAL_WINDOWS[date] = deepcopy(DEFAULT_MEAL_WINDOWS)


# =========================
# ACCESSORS
# =========================

def get_meal_windows():
    return CURRENT_MEAL_WINDOWS


# =========================
# UPDATE WINDOW (SAFE)
# =========================

def update_meal_window(date: str, meal: str, start: int, end: int):
    if date not in CURRENT_MEAL_WINDOWS:
        CURRENT_MEAL_WINDOWS[date] = deepcopy(DEFAULT_MEAL_WINDOWS)

    if meal not in CURRENT_MEAL_WINDOWS[date]:
        raise ValueError(f"Invalid meal name: {meal}")

    CURRENT_MEAL_WINDOWS[date][meal] = (start, end)