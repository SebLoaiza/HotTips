from fastapi import APIRouter, UploadFile, File
import csv

from api.services.meal_blocks import build_meal_blocks_with_employees

router = APIRouter()


def load_csv(file):
    rows = []
    decoded = file.file.read().decode("utf-8").splitlines()
    reader = csv.DictReader(decoded)

    for row in reader:
        rows.append(row)

    return rows


@router.post("/meal-blocks")
async def meal_blocks(file: UploadFile = File(...)):

    rows = load_csv(file)

    blocks = build_meal_blocks_with_employees(rows)

    return [
    {
        "date": b.date,
        "meal": b.meal,
        "start": b.start,
        "end": b.end,
        "employees": [
            {
                "employee_id": e.employee_id,
                "name": e.name,
                "role": e.role,
                "meal_start": e.meal_start,
                "meal_end": e.meal_end,
                "worked_minutes": e.worked_minutes,
                "lost_mins": e.lost_mins,
                "breaks": e.breaks,
            }
            for e in b.employees
        ],
    }
    for b in blocks
]

@router.post("/meal-blocks-recompute")
async def recompute(payload: dict):
    key = payload["key"]
    start = payload["start"]
    end = payload["end"]

    date, meal = key.split("-", 1)

    # re-run your pipeline with modified windows
    updated_windows = get_current_windows_somehow()

    updated_windows[date][meal] = (start, end)

    rows = get_cached_rows_somehow()

    blocks = build_meal_blocks_with_employees(rows, updated_windows)

    return blocks