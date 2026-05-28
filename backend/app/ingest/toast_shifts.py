import pandas as pd

from app.models.employee_shift import EmployeeShift


def load_shift_csv(path: str):

    df = pd.read_csv(path)

    shifts = []


    #To_datetime automatically puts it in 24 hour format
    for _, row in df.iterrows():

        shift = EmployeeShift(
            name=row["Employee"],
            role=row["Job"],
            clock_in=pd.to_datetime(
                f'{row["Date"]} {row["Time In"]}'
            ),
            clock_out=pd.to_datetime(
                f'{row["Date"]} {row["Time Out"]}'
            ),
            unpaid_break_hours=float(row["Unpaid Break Time"]),

            payable_hours=float(row["Payable Hours"]),
            
        )

        shifts.append(shift)

    return shifts