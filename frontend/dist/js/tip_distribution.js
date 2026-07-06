function normalizeRatio(val) {
    val = Number(val) || 0;
    return Math.max(0, Math.min(1, val > 1 ? val / 100 : val));
}
function safeZero(val) {
    return Math.abs(val) < 0.00001 ? 0 : val;
}

function distributeTips(session) {

    const hasBOH = session.boh.length > 0;
    const hasBussers = session.bussers.length > 0;
    const hasHosts = session.hosts.length > 0;

    // =========================
    // RATIOS
    // =========================
    const busserRatio = normalizeRatio(session.busser_coverage);
    const hostRatio = normalizeRatio(session.host_coverage);

    const hostPercent =
        (0.05 + (0.03 - (0.03 * busserRatio))) * hostRatio;

    // =========================
    // RESET POOLS
    // =========================
    session.boh_pool_card = 0;
    session.busser_pool_card = 0;
    session.host_pool_card = 0;
    session.server_pool_card = 0;

    session.boh_pool_cash = 0;
    session.busser_pool_cash = 0;
    session.host_pool_cash = 0;

    // =========================
    // 1. EMPLOYEE TIP DISTRIBUTION (BASE POOLS)
    // =========================
    session.tip_owners.forEach(emp => {

        const cardNet = emp.card_collected_net || 0;
        const cash = emp.cash_collected || 0;

        let bohPercent = 0.30;
        let busserPercent = 0.12 * busserRatio;
        let hostPercentLocal = hostPercent;

        if (emp.is_host) hostPercentLocal = 0;
        else if (emp.is_busser) busserPercent = 0;

        if (hasBOH) {
            emp.card_to_boh = floorMoney(cardNet * bohPercent);
            emp.cash_to_boh = floorMoney(cash * bohPercent);
            session.boh_pool_card += emp.card_to_boh;
            session.boh_pool_cash += emp.cash_to_boh;
        } else {
            emp.card_to_boh = 0;
            emp.cash_to_boh = 0;
        }

        if (hasBussers) {
            emp.card_to_busser = floorMoney(cardNet * busserPercent);
            emp.cash_to_busser = floorMoney(cash * busserPercent);
            session.busser_pool_card += emp.card_to_busser;
            session.busser_pool_cash += emp.cash_to_busser;
        } else {
            emp.card_to_busser = 0;
            emp.cash_to_busser = 0;
        }

        if (hasHosts) {
            emp.card_to_host = floorMoney(cardNet * hostPercentLocal);
            emp.cash_to_host = floorMoney(cash * hostPercentLocal);
            session.host_pool_card += emp.card_to_host;
            session.host_pool_cash += emp.cash_to_host;
        } else {
            emp.card_to_host = 0;
            emp.cash_to_host = 0;
        }

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
    // 2. ONLINE TIPS (ADDED AFTER POOLS EXIST)
    // =========================
    distributeOnlineTips(session);

    // =========================
    // 3. FINAL SPLITS
    // =========================

    splitPoolWeighted(session.boh_pool_card, session.boh, "card_received");
    splitPoolWeighted(session.boh_pool_cash, session.boh, "cash_received");

    splitPoolWeighted(session.busser_pool_card, session.bussers, "card_received");
    splitPoolWeighted(session.busser_pool_cash, session.bussers, "cash_received");

    splitPoolWeighted(session.host_pool_card, session.hosts, "card_received");
    splitPoolWeighted(session.host_pool_cash, session.hosts, "cash_received");

    splitPoolWeighted(session.server_pool_card, session.servers, "card_received");
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

        let points = Number(emp.point_weight);

        // Only invalid values become 1
        if (isNaN(points)) {
            points = 1;
            emp.point_weight = 1;
        }

        // Don't allow negative weights
        if (points < 0) {
            points = 0;
            emp.point_weight = 0;
        }

        emp._weight = emp.worked_minutes * points;

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



function distributeOnlineTips(session) {

    const gross = Number(session.online_tips) || 0;
    if (gross <= 0) return;

    // =========================
    // APPLY CARD FEE (3%)
    // =========================
    const net = floorMoney(gross * 0.97);

    const pools = [];

    if (session.servers.length) pools.push("server");
    if (session.bussers.length) pools.push("busser");
    if (session.hosts.length) pools.push("host");
    if (session.boh.length) pools.push("boh");

    if (!pools.length) return;

    const share = floorMoney(net / pools.length);

    let used = share * pools.length;
    let pennies = Math.round((net - used) * 100);

    for (let i = 0; i < pools.length; i++) {

        switch (pools[i]) {

            case "server":
                session.server_pool_card += share;
                break;

            case "busser":
                session.busser_pool_card += share;
                break;

            case "host":
                session.host_pool_card += share;
                break;

            case "boh":
                session.boh_pool_card += share;
                break;
        }
    }

    // =========================
    // REMAINDER HANDLING
    // =========================
    if (pennies > 0) {

        const extra = pennies / 100;

        if (session.boh.length) {
            session.boh_pool_card += extra;
        } else {
            session[pools[0] + "_pool_card"] += extra;
        }
    }
}