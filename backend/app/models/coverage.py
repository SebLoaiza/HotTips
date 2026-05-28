from dataclasses import dataclass


@dataclass
class ShiftCoverage:
    shift_type: str
    hours: float
    percent_of_shift: float  # coverage of THAT service window