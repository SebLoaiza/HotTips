from fastapi import APIRouter, UploadFile, File, HTTPException
import csv

from api.services.meal_blocks import build_meal_blocks_with_employees
from api.services.meal_state import (
    cache_rows,
    get_cached_rows,
    get_meal_windows,
    initialize_meal_windows,
    update_meal_window
)

router = APIRouter()


# =========================
# CSV LOADER
# =========================

def load_csv(file):
    decoded = file.file.read().decode("utf-8").splitlines()
    return list(csv.DictReader(decoded))


# =========================
# INITIAL LOAD
# =========================

import json
from dataclasses import asdict

@router.post("/meal-blocks")
async def meal_blocks(file: UploadFile = File(...)):

    rows = load_csv(file)

    cache_rows(rows)
    initialize_meal_windows(rows)

    blocks = build_meal_blocks_with_employees(
        rows,
        get_meal_windows()
    )

    print("\n========== MEAL BLOCKS ==========")
    print(json.dumps([asdict(b) for b in blocks], indent=2))
    print("=================================\n")

    return blocks


# =========================
# RECOMPUTE AFTER EDIT
# =========================

@router.post("/meal-blocks-recompute")
async def recompute(payload: dict):

    try:
        key = payload["key"]
        start = int(payload["start"])
        end = int(payload["end"])

        date, meal = key.split("-", 1)

        # 1. update memory state
        update_meal_window(date, meal, start, end)

        # 2. rebuild from cached rows
        rows = get_cached_rows()

        blocks = build_meal_blocks_with_employees(
            rows,
            get_meal_windows()
        )

        # 3. return
        return blocks

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


    