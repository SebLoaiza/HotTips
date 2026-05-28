from dataclasses import dataclass
from datetime import time


@dataclass
class ServiceWindow:
    name: str
    start: time
    end: time

# this is in mil time
SERVICE_WINDOWS = [
    ServiceWindow("BREAKFAST", time(5, 30), time(11, 30)),
    ServiceWindow("LUNCH", time(11, 30), time(17, 30)),
    ServiceWindow("DINNER", time(17, 30), time(1, 0)), 
]