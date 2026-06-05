from dataclasses import dataclass, field
from typing import List


@dataclass
class MealShift:
    """
    Simple aggregation object:
    one meal period + list of employees who worked it.
    """

    
    date: str
    meal: str

    employees: List[str] = field(default_factory=list)