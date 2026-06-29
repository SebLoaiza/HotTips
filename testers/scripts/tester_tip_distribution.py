from dataclasses import dataclass
from typing import List, Dict
from collections import defaultdict

PROCESSING_FEE = 0.03
BUSSER_MIN_THRESHOLD = 90
import random

# =====================================================
# UTIL
# =====================================================

def apply_processing_fee(amount: int, source: str) -> int:
    if source in ("card", "digital"):
        return int(round(amount * (1 - PROCESSING_FEE)))
    return amount


def clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * clamp(t)


# =====================================================
# ROLE NORMALIZER
# =====================================================

def get_role(role: str) -> str:
    role = (role or "").lower()

    if "server" in role:
        return "server"
    if "busser" in role or "runner" in role:
        return "busser"
    if "host" in role:
        return "host"

    return "server"


# =====================================================
# COVERAGE
# =====================================================

def get_busser_coverage(meal) -> float:
    start, end = meal.shift_start_min, meal.shift_end_min
    intervals = []

    for e in meal.employees:
        role = (e.role or "").lower()
        if "busser" not in role and "runner" not in role:
            continue

        s = getattr(e, "meal_start_min", None)
        f = getattr(e, "meal_end_min", None)
        if s is None or f is None:
            continue

        s, f = max(s, start), min(f, end)
        if f <= s:
            continue

        if (f - s) < BUSSER_MIN_THRESHOLD:
            continue

        intervals.append((s, f))

    if not intervals:
        return 0.0

    intervals.sort()
    merged = []

    for s, f in intervals:
        if not merged or s > merged[-1][1]:
            merged.append([s, f])
        else:
            merged[-1][1] = max(merged[-1][1], f)

    covered = sum(e - s for s, e in merged)
    total = end - start

    return clamp(covered / total if total > 0 else 0.0)


def get_host_coverage(meal) -> float:
    start, end = meal.shift_start_min, meal.shift_end_min
    intervals = []

    for e in meal.employees:
        role = (e.role or "").lower()
        if "host" not in role:
            continue

        s = getattr(e, "meal_start_min", None)
        f = getattr(e, "meal_end_min", None)
        if s is None or f is None:
            continue

        s, f = max(s, start), min(f, end)
        if f <= s:
            continue

        intervals.append((s, f))

    if not intervals:
        return 0.0

    intervals.sort()
    merged = []

    for s, f in intervals:
        if not merged or s > merged[-1][1]:
            merged.append([s, f])
        else:
            merged[-1][1] = max(merged[-1][1], f)

    covered = sum(e - s for s, e in merged)
    total = end - start

    return clamp(covered / total if total > 0 else 0.0)


# =====================================================
# RATE SYSTEM
# =====================================================

def busser_rate(busser_cov: float) -> float:
    return 0.12 * busser_cov


def host_rate(host_cov: float, busser_cov: float) -> float:
    base = lerp(0.025, 0.05, host_cov)
    bonus = lerp(0.0, 0.03, busser_cov)
    return clamp(base + bonus, 0.025, 0.08)


# =====================================================
# DATA STRUCTS
# =====================================================

@dataclass
class ShiftSummary:
    date: str
    meal: str
    server_pool: int = 0
    boh_pool: int = 0
    busser_pool: int = 0
    host_pool: int = 0
    total_net: int = 0


@dataclass
class EmployeeResult:
    employee_id: str
    name: str
    role: str
    employee: object   

    owned_cash: int
    pooled_cash: int
    ratio: float
    worked_minutes: int
    point_weight: float

    @property
    def total_cash(self) -> int:
        return self.owned_cash + self.pooled_cash


@dataclass
class ShiftReport:
    summary: ShiftSummary
    employees: List[EmployeeResult]
    servers: List[EmployeeResult]
    bussers: List[EmployeeResult]
    hosts: List[EmployeeResult]
    boh: List[EmployeeResult]


# =====================================================
# MAIN
# =====================================================

def run_tip_distribution(meal_shifts):

    reports = []

    for meal in meal_shifts:

        busser_cov = get_busser_coverage(meal)
        host_cov = get_host_coverage(meal)

        direct_cash: Dict[str, int] = {}
        employee_map = {}

        for p in meal.employees:
            emp_id = p.employee.employee_id
            direct_cash[emp_id] = 0
            employee_map[emp_id] = p

        server_pool = 0
        boh_pool = 0
        busser_pool = 0
        host_pool = 0

        debug_log = defaultdict(lambda: {
            "original": 0,
            "processed": 0,
            "boh": 0,
            "busser": 0,
            "host": 0,
            "net": 0,
            "count": 0
        })
        # =================================================
        # TIP PROCESSING (PURE LOGIC)
        # =================================================
        for tip in meal.tips:

            emp_id = tip.employee_id
            original_amount = tip.amount

            # -------------------------
            # GROSS TRACKING
            # -------------------------
            if emp_id in employee_map:
                employee_map[emp_id].employee.lifetime_gross_tips += original_amount

            # -------------------------
            # PROCESS FEE
            # -------------------------
            amount = apply_processing_fee(
                tip.amount,
                (tip.source or "").lower()
            )

            # -------------------------
            # DIGITAL SPLIT
            # -------------------------
            if tip.source == "digital":
                split = amount // 4
                remainder = amount - (split * 4)

                server_pool += split
                busser_pool += split
                host_pool += split
                boh_pool += split + remainder
                continue

            if emp_id not in employee_map:
                continue

            participation = employee_map[emp_id]
            employee = participation.employee

            # ❗ FIX: role comes from participation, not employee
            role = get_role(participation.role)

            if role == "host":
                boh = int(amount * 0.30)
                busser = int(amount * 0.12)
                host = 0

            elif role == "busser":
                boh = int(amount * 0.30)
                host = int(amount * 0.05)
                busser = 0

            else:
                boh = int(amount * 0.30)
                busser = int(amount * busser_rate(busser_cov))
                host = int(amount * host_rate(host_cov, busser_cov))

            distributed = boh + busser + host
            net = amount - distributed

            direct_cash[emp_id] += net
            employee.lifetime_owned_cash += net

            boh_pool += boh
            busser_pool += busser
            host_pool += host

            d = debug_log[emp_id]
            d["original"] += original_amount
            d["processed"] += amount
            d["boh"] += boh
            d["busser"] += busser
            d["host"] += host
            d["net"] += net
            d["count"] += 1

        # =================================================
        # BUILD EMPLOYEES
        # =================================================
        results: Dict[str, EmployeeResult] = {}

        for p in meal.employees:
            emp = p.employee
            emp_id = emp.employee_id

            results[emp_id] = EmployeeResult(
                employee_id=emp_id,
                name=emp.name,
                role=p.role,
                employee=emp,  
                owned_cash=direct_cash.get(emp_id, 0),
                pooled_cash=0,
                ratio=p.ratio,
                worked_minutes=p.worked_minutes,
                point_weight=emp.default_point_weight
            )

        servers, bussers, hosts, boh_list = [], [], [], []

        for r in results.values():
            role = (r.role or "").lower()

            if "server" in role:
                servers.append(r)
            elif "busser" in role or "runner" in role:
                bussers.append(r)
            elif "host" in role:
                hosts.append(r)
            else:
                boh_list.append(r)

        total_direct = sum(r.owned_cash for r in results.values())

        summary = ShiftSummary(
            date=meal.date,
            meal=meal.meal,
            server_pool=server_pool,
            boh_pool=boh_pool,
            busser_pool=busser_pool,
            host_pool=host_pool,
            total_net=total_direct
        )

        report = ShiftReport(
            summary=summary,
            employees=list(results.values()),
            servers=servers,
            bussers=bussers,
            hosts=hosts,
            boh=boh_list
        )

        meal.summary = report
        reports.append(report)

    return reports