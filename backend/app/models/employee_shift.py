from pydantic import BaseModel
from datetime import datetime


class EmployeeShift(BaseModel):
    name: str
    role: str

    clock_in: datetime
    clock_out: datetime

    payable_hours: float
    unpaid_break_hours: float

    points: float = 1.0

    tip_qualified: bool = True