from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import csv

from api.db import SessionLocal
from api.models import Employee

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    decoded = file.file.read().decode("utf-8").splitlines()
    reader = csv.reader(decoded)

    next(reader, None)

    # existing DB guids
    existing_guids = {
        guid for (guid,) in db.query(Employee.external_guid).all()
    }

    seen = set()

    new_employees = []
    skipped = 0

    for row in reader:
        if len(row) < 2:
            continue

        name = (row[0] or "").strip()
        guid = (row[1] or "").strip()

        if not guid:
            continue

        # skip DB duplicates
        if guid in existing_guids:
            skipped += 1
            continue

        # skip CSV duplicates
        if guid in seen:
            skipped += 1
            continue

        seen.add(guid)

        new_employees.append(
            Employee(
                external_guid=guid,
                name=name
            )
        )

    # bulk insert safely
    db.add_all(new_employees)
    db.commit()

    return {
        "inserted": len(new_employees),
        "skipped": skipped
    }