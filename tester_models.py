from dataclasses import dataclass, field


@dataclass
class Employee:
    employee_id: str
    name: str

    default_point_weight: float = 1.0

    lifetime_gross_tips: int = 0   # BEFORE redistribution logic
    lifetime_owned_cash: int = 0   # AFTER redistribution (take-home)

    lifetime_pool_cash: int = 0
    
    @property
    def lifetime_total_cash(self):
        return self.lifetime_owned_cash + self.lifetime_pool_cash
    

@dataclass
class TipEntry:
    employee_name: str
    employee_id: str
    amount: int   # <-- cents
    source: str



@dataclass
class Break:
    start_min: int
    end_min: int



@dataclass
class MealParticipation:
    employee: Employee

    start_min: int
    end_min: int

    meal_start_min: int = 0
    meal_end_min: int = 0
    
    worked_minutes: int = 0

    ratio: float = 0.0
    role: str = ""

    breaks: list = field(default_factory=list)
    
@dataclass
class MealShift:
    date: str
    meal: str

    meal_minutes: int = 0
    
    shift_start_min: int = 0
    shift_end_min: int = 0
    
    online_total: int = 0

    employees: list[MealParticipation] = field(default_factory=list)
    tips: list[TipEntry] = field(default_factory=list)


@dataclass
class TipSummary:
    total_cash: int = 0
    total_card: int = 0

    @property
    def total(self) -> int:
        return self.total_cash + self.total_card

    def net_card(self) -> int:
        return int(self.total_card * 0.97)