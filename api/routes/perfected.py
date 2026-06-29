from fastapi import APIRouter, UploadFile, File
import csv

router = APIRouter()


def is_employee_row(row):
    # employee row always starts with a name in column 0
    return row and row[0] and row[0].strip() != ""


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    decoded = file.file.read().decode("utf-8").splitlines()
    reader = csv.reader(decoded)

    headers = next(reader)

    shifts = []
    current_shift = None

    for row in reader:
        if not row:
            continue

        if is_employee_row(row):
            # start new shift
            current_shift = {
                "employee": row[0],
                "employee_guid": row[1] if len(row) > 1 else None,
                "location": row[4] if len(row) > 4 else None,
                "job": row[6] if len(row) > 6 else None,
                "date": row[8] if len(row) > 8 else None,
                "time_in": row[9] if len(row) > 9 else None,
                "time_out": row[10] if len(row) > 10 else None,
                "total_hours": row[12] if len(row) > 12 else None,
                "breaks": []
            }
            shifts.append(current_shift)

        else:
            # break row (belongs to last shift)
            if current_shift:
                current_shift["breaks"].append({
                    "break_name": row[28] if len(row) > 28 else None,
                    "start": row[29] if len(row) > 29 else None,
                    "end": row[30] if len(row) > 30 else None,
                    "duration": row[31] if len(row) > 31 else None,
                })

    return {
        "filename": file.filename,
        "shifts": shifts
    }