import pandas as pd
from fastapi import APIRouter, UploadFile, File
from app.services.parser import load_csv
from app.services.shift_builder import build_shift_records

from app.services.shift_builder import build_shift_records
from app.services.shift_engine import ShiftEngine

router = APIRouter()


def clean_json(df: pd.DataFrame):
    return (
        df.fillna("") 
        .to_dict(orient="records")
    )


@router.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    print(ShiftEngine.__dict__.keys())

    content = await file.read()

    df = load_csv(content)
    records = build_shift_records(df)
    for r in records[:5]:
        print({
            "employee": r.employee,
            "date": r.date,
            "time_in": r.time_in,
            "time_out": r.time_out,
            "hours": r.hours,
            "breaks": r.breaks
        })


    engine = ShiftEngine(records)

    daily = engine.build_daily_shifts()
    daily_shifts = engine.build_daily_shifts()

    return {
        "raw_records": len(records),
        "daily_shifts": daily_shifts
    }