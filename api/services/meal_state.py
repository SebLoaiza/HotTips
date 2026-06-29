# api/services/meal_state.py

from typing import Dict, List, Tuple

# =========================
# GLOBAL STATE
# =========================

CACHED_ROWS: List[dict] = []

CURRENT_MEAL_WINDOWS: Dict[str, Tuple[int, int]] = {
    "Breakfast": (330, 690),
    "Lunch": (691, 1050),
    "Dinner": (1051, 1560),
}


# =========================
# CACHE ROWS
# =========================

def cache_rows(rows: List[dict]):
    global CACHED_ROWS
    CACHED_ROWS = rows


def get_cached_rows():
    return CACHED_ROWS


# =========================
# WINDOW EDITING
# =========================

def get_meal_windows():
    return CURRENT_MEAL_WINDOWS


def update_meal_window(meal: str, start: int, end: int):
    global CURRENT_MEAL_WINDOWS
    CURRENT_MEAL_WINDOWS[meal] = (start, end)