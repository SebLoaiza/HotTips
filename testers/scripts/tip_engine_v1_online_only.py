from typing import List
from testers.scripts.tester_models import MealShift


# =====================================================
# MONEY HELPERS
# =====================================================

def fmt(cents: int) -> str:
    return f"${cents / 100:,.2f}"


# =====================================================
# MAIN ENGINE
# =====================================================

def run_tip_distribution(meal_shifts: List[MealShift]):

    for m in meal_shifts:

        # =====================================================
        # RESET POOLS
        # =====================================================
        m.boh_pool = 0
        m.busser_pool = 0
        m.host_pool = 0
        m.server_pool = 0

        # =====================================================
        # ONLINE ORDERS → NET (3% fee)
        # =====================================================
        online_gross = m.online_total
        online_fee = int(online_gross * 0.03)
        online_net = online_gross - online_fee

        per_pool = online_net // 4

        m.server_pool = per_pool
        m.boh_pool = per_pool
        m.busser_pool = per_pool
        m.host_pool = per_pool

        # =====================================================
        # RESET EMPLOYEE EARNINGS
        # =====================================================
        for p in m.employees:
            p.meal_earned = 0

        # =====================================================
        # TOTAL TIP TRACKING
        # =====================================================
        total_employee_net = 0

        # =====================================================
        # TIP ROUTING
        # =====================================================
        for p in m.employees:

            role = (p.role or "").lower()

            card_gross = p.card_brought
            cash = p.cash_brought

            # ONLY card pays 3% fee
            card_net = int(card_gross * 0.97)
            net_total = card_net + cash

            total_employee_net += net_total

            if net_total <= 0:
                continue

            # =================================================
            # SERVER
            # =================================================
            if "server" in role:

                boh = int(net_total * 0.30)
                busser = int(net_total * 0.12)
                host = int(net_total * 0.05)

                routed = boh + busser + host
                keep = net_total - routed

                m.boh_pool += boh
                m.busser_pool += busser
                m.host_pool += host
                p.meal_earned += keep

            # =================================================
            # BUSSER / RUNNER
            # =================================================
            elif "busser" in role or "runner" in role:

                boh = int(net_total * 0.30)
                host = int(net_total * 0.05)

                routed = boh + host
                keep = net_total - routed

                m.boh_pool += boh
                m.host_pool += host
                p.meal_earned += keep

            # =================================================
            # HOST
            # =================================================
            elif "host" in role:

                boh = int(net_total * 0.30)
                busser = int(net_total * 0.12)

                routed = boh + busser
                keep = net_total - routed

                m.boh_pool += boh
                m.busser_pool += busser
                p.meal_earned += keep

            # =================================================
            # BOH
            # =================================================
            elif "cook" in role or "prep" in role or "dish" in role:

                m.boh_pool += net_total
                p.meal_earned += net_total

        # =====================================================
        # GLOBAL TOTALS
        # =====================================================
        expected_total = online_net + total_employee_net

        pool_total = (
            m.server_pool +
            m.boh_pool +
            m.busser_pool +
            m.host_pool
        )

        take_home_total = sum(p.meal_earned for p in m.employees)

        distributed_total = pool_total + take_home_total

        diff = distributed_total - expected_total

        # =====================================================
        # OUTPUT HEADER
        # =====================================================
        print("\n" + "=" * 80)
        print(f"{m.date} - {m.meal}")
        print("=" * 80)

        # =====================================================
        # ONLINE SUMMARY
        # =====================================================
        print("\nONLINE ORDER SUMMARY")
        print("-" * 80)
        print(f"Gross Online Total : {fmt(online_gross)}")
        print(f"Platform Fee (3%)  : -{fmt(online_fee)}")
        print(f"Net Online Amount  : {fmt(online_net)}")

        # =====================================================
        # GLOBAL TOTALS
        # =====================================================
        print("\nGLOBAL TOTALS")
        print("-" * 80)
        print(f"Total Amount (Gross)      : {fmt(online_gross + total_employee_net)}")
        print(f"Total To Distribute (NET) : {fmt(expected_total)}")

        # =====================================================
        # POOLS
        # =====================================================
        print("\nPOOL AUDIT")
        print("-" * 80)
        print(f"Server Pool : {fmt(m.server_pool)}")
        print(f"BOH Pool    : {fmt(m.boh_pool)}")
        print(f"Busser Pool : {fmt(m.busser_pool)}")
        print(f"Host Pool   : {fmt(m.host_pool)}")

        print("\nPOOL TOTAL")
        print("-" * 80)
        print(fmt(pool_total))

        # =====================================================
        # TAKE HOME
        # =====================================================
        print("\nTAKE HOME TOTAL")
        print("-" * 80)
        print(fmt(take_home_total))

        # =====================================================
        # FINAL CHECK
        # =====================================================
        print("\nTOTAL DISTRIBUTION CHECK")
        print("-" * 80)
        print(f"Distributed Total : {fmt(distributed_total)}")
        print(f"Expected Total    : {fmt(expected_total)}")

        if abs(diff) == 0:
            print("🟢 PASS ($0.00)")
        elif abs(diff) < 100:
            print(f"🟡 SMALL DRIFT ({fmt(diff)})")
        else:
            print(f"🔴 FAIL ({fmt(diff)})")

        # =====================================================
        # EMPLOYEES
        # =====================================================
        print("\nEMPLOYEE TAKE HOME")
        print("-" * 80)

        for p in m.employees:
            print(f"{p.employee.name:25} | {fmt(p.meal_earned)}")

    return meal_shifts