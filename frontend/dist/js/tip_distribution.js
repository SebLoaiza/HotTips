function normalizeRatio(val) {
    val = Number(val) || 0;
    return Math.max(0, Math.min(1, val > 1 ? val / 100 : val));
}
function safeZero(val) {
    return Math.abs(val) < 0.00001 ? 0 : val;
}

function distributeTips(session) {

    // =========================
    // RATIOS (0 -> 1)
    // =========================
    const busserRatio = normalizeRatio(session.busser_coverage);
    const hostRatio = normalizeRatio(session.host_coverage);

    // Host percentage:
    // (5% + (3% - 3% * busserRatio)) * hostRatio
    const hostPercent =
        (0.05 + (0.03 - (0.03 * busserRatio))) * hostRatio;

    // =========================
    // RESET POOLS
    // =========================
    session.boh_pool_card = 0;
    session.busser_pool_card = 0;
    session.host_pool_card = 0;

    session.boh_pool_cash = 0;
    session.busser_pool_cash = 0;
    session.host_pool_cash = 0;

    // =========================
    // DISTRIBUTE
    // =========================
    session.tip_owners.forEach(emp => {

        const cardNet = emp.card_collected_net || 0;
        const cash = emp.cash_collected || 0;

        // ---------------- BOH ----------------
        emp.card_to_boh = floorMoney(cardNet * 0.30);
        emp.cash_to_boh = floorMoney(cash * 0.30);

        session.boh_pool_card += emp.card_to_boh;
        session.boh_pool_cash += emp.cash_to_boh;

        // ---------------- BUSSER ----------------
        emp.card_to_busser = floorMoney(cardNet * (0.12 * busserRatio));
        emp.cash_to_busser = floorMoney(cash * (0.12 * busserRatio));

        session.busser_pool_card += emp.card_to_busser;
        session.busser_pool_cash += emp.cash_to_busser;

        // ---------------- HOST ----------------
        emp.card_to_host = floorMoney(cardNet * hostPercent);
        emp.cash_to_host = floorMoney(cash * hostPercent);

        session.host_pool_card += emp.card_to_host;
        session.host_pool_cash += emp.cash_to_host;

        // ---------------- KEPT ----------------
        emp.card_kept = floorMoney(
            cardNet
            - emp.card_to_boh
            - emp.card_to_busser
            - emp.card_to_host
        );

        emp.cash_kept = floorMoney(
            cash
            - emp.cash_to_boh
            - emp.cash_to_busser
            - emp.cash_to_host
        );
    });
    // =========================
    // DISTRIBUTE POOLS
    // =========================

    // BOH
    splitPoolWeighted(
        session.boh_pool_card,
        session.boh,
        "card_received"
    );

    splitPoolWeighted(
        session.boh_pool_cash,
        session.boh,
        "cash_received"
    );

    // BUSSERS
    splitPoolWeighted(
        session.busser_pool_card,
        session.bussers,
        "card_received"
    );

    splitPoolWeighted(
        session.busser_pool_cash,
        session.bussers,
        "cash_received"
    );

    // HOSTS
    splitPoolWeighted(
        session.host_pool_card,
        session.hosts,
        "card_received"
    );

    splitPoolWeighted(
        session.host_pool_cash,
        session.hosts,
        "cash_received"
    );

    // SERVERS (online orders only)
    splitPoolWeighted(
        session.online_tips,
        session.servers,
        "card_received"
    );

}


function splitPoolWeighted(poolAmount, employees, field) {

    if (!employees.length) return;

    // Calculate each employee's weight
    let totalWeight = 0;

    employees.forEach(emp => {

        emp.worked_minutes = Math.max(
            0,
            (emp.meal_end - emp.meal_start) - (emp.lost_mins || 0)
        );

        emp._weight =
            emp.worked_minutes * (Number(emp.point_weight) || 1);

        totalWeight += emp._weight;
    });

    if (totalWeight === 0) {
        employees.forEach(emp => emp[field] = 0);
        return;
    }

    // Initial allocation (floored)
    let distributed = 0;

    employees.forEach(emp => {

        const share =
            poolAmount * (emp._weight / totalWeight);

        emp[field] = floorMoney(share);

        distributed += emp[field];
    });

    // Remaining pennies
    let pennies =
        Math.round((poolAmount - distributed) * 100);

    // Largest weights get remainder first
    const ranked = [...employees].sort((a, b) => {

        if (b._weight !== a._weight)
            return b._weight - a._weight;

        return a.name.localeCompare(b.name);
    });

    let i = 0;

    while (pennies > 0) {

        ranked[i][field] += 0.01;

        pennies--;

        i++;

        if (i >= ranked.length)
            i = 0;
    }

    employees.forEach(emp => {
        emp[field] = floorMoney(emp[field]);
    });
}