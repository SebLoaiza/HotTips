from dataclasses import dataclass
from typing import List, Dict, Tuple


# =========================================================
# CONFIG
# =========================================================

@dataclass
class TipConfig:
    boh_percent: float = 0.30
    foh_percent: float = 0.70


# =========================================================
# EMPLOYEE MODEL
# =========================================================

@dataclass
class Employee:
    name: str
    role: str
    server_cash: float = 0.0


# =========================================================
# SAMPLE DATA
# =========================================================

shifts = [
    {"name": "Becky FOH SERVER", "role": "Server", "server_cash": 100},
    {"name": "Joe FOH SERVER", "role": "Server", "server_cash": 75},
    {"name": "Angela FOH", "role": "Host", "server_cash": 0},
    {"name": "Ruben BOH", "role": "Prep Cook/Dishwasher", "server_cash": 0},
    {"name": "Hank BOH", "role": "Prep Cook/Dishwasher", "server_cash": 0},
    {"name": "Rode BOH", "role": "Prep Cook/Dishwasher", "server_cash": 0},
]


# =========================================================
# BUILD EMPLOYEES
# =========================================================

def build_employees(data: List[Dict]) -> List[Employee]:
    return [
        Employee(
            name=d["name"],
            role=d["role"],
            server_cash=d.get("server_cash", 0.0)
        )
        for d in data
    ]


# =========================================================
# GROUPING
# =========================================================

def is_boh(role: str) -> bool:
    return "Cook" in role or "Dishwasher" in role


def is_server(role: str) -> bool:
    return role == "Server"


def split_groups(employees: List[Employee]):
    boh = [e for e in employees if is_boh(e.role)]
    foh = [e for e in employees if not is_boh(e.role)]
    return boh, foh


# =========================================================
# EQUAL SPLIT
# =========================================================

def equal_split(pool: float, employees: List[Employee]) -> Dict[str, float]:
    if not employees:
        return {}

    share = pool / len(employees)
    return {e.name: round(share, 2) for e in employees}


# =========================================================
# TRACE
# =========================================================

def build_trace(
    total,
    boh_pool,
    foh_pool,
    boh_results,
    servers,
    non_servers,
    server_results,
    non_server_results
) -> List[str]:

    lines = []

    lines.append(f"TOTAL TIPS: ${total}")
    lines.append(f"BOH POOL (30%): ${round(boh_pool, 2)}")
    lines.append(f"FOH POOL (70%): ${round(foh_pool, 2)}")

    # -------------------------
    # BOH
    # -------------------------
    lines.append("\n--- BOH SPLIT ---")
    for k, v in boh_results.items():
        lines.append(f"{k}: ${v}")

    # -------------------------
    # SERVERS
    # -------------------------
    lines.append("\n--- SERVER FOH DISTRIBUTION ---")

    for s in servers:
        payout = server_results.get(s.name, 0)

        if s.server_cash > 0:
            conversion_pct = (payout / s.server_cash) * 100
        else:
            conversion_pct = 0

        lines.append(
            f"{s.name}: ${payout} "
            f"(input: ${s.server_cash}, return: {round(conversion_pct, 2)}%)"
        )

    # -------------------------
    # NON-SERVER FOH
    # -------------------------
    lines.append("\n--- NON-SERVER FOH SPLIT ---")
    for k, v in non_server_results.items():
        lines.append(f"{k}: ${v}")

    return lines


# =========================================================
# MAIN
# =========================================================

def distribute_tips(employees: List[Employee], total: float, config: TipConfig) -> Tuple[Dict[str, float], List[str]]:

    boh, foh = split_groups(employees)

    boh_pool = total * config.boh_percent
    foh_pool = total * config.foh_percent

    results: Dict[str, float] = {}

    # BOH
    boh_results = equal_split(boh_pool, boh)
    results.update(boh_results)

    # FOH
    servers = [e for e in foh if is_server(e.role)]
    non_servers = [e for e in foh if not is_server(e.role)]

    total_server_cash = sum(s.server_cash for s in servers)

    server_results = {}
    for s in servers:
        share = 0 if total_server_cash == 0 else s.server_cash / total_server_cash
        server_results[s.name] = round(foh_pool * share, 2)

    results.update(server_results)

    remaining_foh_pool = foh_pool * 0.30
    non_server_results = equal_split(remaining_foh_pool, non_servers)

    results.update(non_server_results)

    # TRACE
    trace = build_trace(
        total,
        boh_pool,
        foh_pool,
        boh_results,
        servers,
        non_servers,
        server_results,
        non_server_results
    )

    return results, trace


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    config = TipConfig()
    employees = build_employees(shifts)

    total_tips = 175

    results, trace = distribute_tips(employees, total_tips, config)

    print("\nTIP SPLIT (FINAL)")
    print("==================")

    for name, amount in results.items():
        print(f"{name}: ${amount}")

    print("\n\nBREAKDOWN")
    print("==========")

    for line in trace:
        print(line)