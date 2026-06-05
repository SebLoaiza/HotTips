from dataclasses import dataclass, field


@dataclass
class Employee:
    employee_id: str
    name: str


@dataclass
class TipEntry:
    employee_name: str
    amount: float
    source: str  # "cash" or "card"


@dataclass
class Break:
    start_min: int
    end_min: int


@dataclass
class MealParticipation:
    employee: Employee

    start_min: int
    end_min: int

    ratio: float

    breaks: list[Break] = field(default_factory=list)


@dataclass
class MealShift:
    date: str
    meal: str

    employees: list[MealParticipation] = field(default_factory=list)
    tips: list[TipEntry] = field(default_factory=list)