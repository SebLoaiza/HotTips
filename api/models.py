from api.db import Base
from sqlalchemy import Column, Integer, String, Float
from dataclasses import dataclass, field
import datetime
from typing import List

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
    date: str          # "May 22, 2026"
    day_key: str       # "2026-05-22"

    meal: str

    start: int = 0
    end: int = 0

    online_total: float = 0.0

    employees: list["MealParticipation"] = field(default_factory=list)
    orders: list["Order"] = field(default_factory=list)

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
    orders: list["Order"] = field(default_factory=list)
    # tips for this meal
    cash_tips: float = 0.0
    card_tips: float = 0.0

@dataclass
class Order:
    order_id: str
    order_number: str

    # normalized time fields (used for all logic)
    order_day: str              # YYYY-MM-DD
    order_time_min: int        # minutes since midnight
    order_timestamp: datetime   # full datetime object

    server: str
    service: str

    amount: float
    tip: float
    gratuity: float
    source: str





@dataclass
class TipSession:
    date: str
    meal: str


    employees: list["MealParticipation"] = field(default_factory=list)


    
    # grouped views
    tip_owners: list["MealParticipation"] = field(default_factory=list)
    servers: list["MealParticipation"] = field(default_factory=list)
    bussers: list["MealParticipation"] = field(default_factory=list)
    hosts: list["MealParticipation"] = field(default_factory=list)
    boh: list["MealParticipation"] = field(default_factory=list)

    online_tips: float = 0.0

    # computed ratios
    busser_coverage: float = 0.0
    host_coverage: float = 0.0

    # computed pools
    boh_pool_cash: float = 0.0
    busser_pool_cash: float = 0.0
    host_pool_cash: float = 0.0
    server_pool_cash: float = 0.0

    boh_pool_card: float = 0.0
    busser_pool_card: float = 0.0
    host_pool_card: float = 0.0
    server_pool_card: float = 0.0








@dataclass
class TipEmployee:

    # Identity
    employee_id: str
    name: str
    role: str

    # Shift information
    meal_start: int
    meal_end: int
    lost_mins: int = 0

    point_weight: float = 1.0

    # Classification
    is_server: bool = False
    is_busser: bool = False
    is_host: bool = False
    is_boh: bool = False

    # -------------------------------
    # Tips they personally collected
    # -------------------------------

    card_collected: float = 0.0
    card_collected_net: float = 0.0  # after fees
    cash_collected: float = 0.0
    # -------------------------------
    # Sent from their own tips into pools
    # -------------------------------

    card_to_boh: float = 0.0
    card_to_busser: float = 0.0
    card_to_host: float = 0.0

    cash_to_boh: float = 0.0
    cash_to_busser: float = 0.0
    cash_to_host: float = 0.0

    
    # -------------------------------
    # Final amounts
    # -------------------------------

    card_kept: float = 0.0
    cash_kept: float = 0.0


    card_recieved: float = 0.0
    cash_recieved: float = 0.0


    final_total: float = 0.0