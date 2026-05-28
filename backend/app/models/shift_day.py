from dataclasses import dataclass, field
from datetime import date
from typing import List

from .employee_shift import EmployeeShift


@dataclass
class ShiftDay:
    day: date
    shifts: List[EmployeeShift] = field(default_factory=list)

    def add_shift(self, shift: EmployeeShift):
        self.shifts.append(shift)

    def total_shifts(self):
        return len(self.shifts)

    def get_by_role(self, role: str):
        result = []
        for shift in self.shifts:
            if shift.role == role:
                result.append(shift)
        return result
    
    
#    def compute_service_window_weights(self):