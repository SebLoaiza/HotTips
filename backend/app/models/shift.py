from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class ShiftRecord:
    employee: str
    role: str
    date: str
    time_in: str
    time_out: str
    hours: float
    cash_tips: float
    cc_tips: float
    total_tips: float

    breaks: List[Dict[str, Any]] = field(default_factory=list)