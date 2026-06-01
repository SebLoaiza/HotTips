import pandas as pd
from app.models.shift import ShiftRecord


def build_shift_records(df: pd.DataFrame):
    records = []
    current_shift = None

    for _, row in df.iterrows():

        employee = row.get("Employee")

        # 1. NEW SHIFT ROW (employee exists)
        if pd.notna(employee) and str(employee).strip() != "":

            current_shift = ShiftRecord(
                employee=str(employee).strip(),
                role=str(row.get("Job") or "").strip(),
                date=row.get("Date"),
                time_in=row.get("Time In"),
                time_out=row.get("Time Out"),
                hours=float(row.get("Total Hours") or 0),
                cash_tips=float(row.get("Cash Tips Declared") or 0),
                cc_tips=float(row.get("Non Cash Tips") or 0),
                total_tips=float(row.get("Total Tips") or 0),
                breaks=[]
            )

            records.append(current_shift)
            continue

        # 2. CONTINUATION ROW (BREAK DATA)
        if current_shift is not None:
            break_name = row.get("Break Name")

            if pd.notna(break_name):
                duration_hours = float(row.get("Break Duration") or 0)

                current_shift.breaks.append({
                    "type": break_name,
                    "start": row.get("Break Start"),
                    "end": row.get("Break End"),
                    "duration_minutes": round(duration_hours * 60)
                })

    return records