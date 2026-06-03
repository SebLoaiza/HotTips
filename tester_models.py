#tester_models.py
from dataclasses import dataclass, field
from typing import List


@dataclass
class Break:
    name: str
    start_min: int
    end_min: int
    duration_min: int


@dataclass
class Shift:
    employee: str = ""
    employee_id: str = ""
    job: str = ""
    date: str = ""

    start_min: int = 0
    end_min: int = 0

    breakfast_cash: float = 0.0
    breakfast_card: float = 0.0

    lunch_cash: float = 0.0
    lunch_card: float = 0.0

    dinner_cash: float = 0.0
    dinner_card: float = 0.0

    # ─────────────────────────────
    # OUTPUT (what employee earns)
    # ─────────────────────────────

    breakfast_earned: float = 0.0
    lunch_earned: float = 0.0
    dinner_earned: float = 0.0

    # ─────────────────────────────
    # TIME TRACKING
    # ─────────────────────────────

    breakfast_minutes: int = 0
    lunch_minutes: int = 0
    dinner_minutes: int = 0
    other_minutes: int = 0
    
    breakfast_coverage: float = 0.0
    lunch_coverage: float = 0.0
    dinner_coverage: float = 0.0


    breakfast_tip_eligible: bool = False
    lunch_tip_eligible: bool = False
    dinner_tip_eligible: bool = False

    has_multiple_eligibilities: bool = False
    has_any_eligibility: bool = False

    breaks: List[Break] = field(default_factory=list)

    crosses_midnight: bool = False