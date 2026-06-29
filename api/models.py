from api.db import Base
from sqlalchemy import Column, Integer, String, Float
from dataclasses import dataclass, field
# -------------------------
# DATABASE MODEL
# -------------------------
class Employee(Base):
    __tablename__ = "employees"

    external_guid = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    points = Column(Float, nullable=False, default=1)


# -------------------------
# RUNTIME MODEL (NOT DB)
# -------------------------

@dataclass
class MealBlock:
    date: str
    meal: str


    start: int = 0
    end: int = 0

    online_total: int = 0


    employees: list["MealParticipation"] = field(default_factory=list)

@dataclass
class MealParticipation:
    employee_id: str
    name: str
    role: str

    # clipped to meal window
    meal_start: int
    meal_end: int

    worked_minutes: int = 0

    # total missing minutes inside the meal window
    lost_mins: int = 0

    # each break's duration (minutes)
    breaks: list[tuple[int, int]] = field(default_factory=list)