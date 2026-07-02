function normalizeRatio(val) {
    val = Number(val) || 0;
    return Math.max(0, Math.min(1, val > 1 ? val / 100 : val));
}
function safeZero(val) {
    return Math.abs(val) < 0.00001 ? 0 : val;
}
function distributeTips(session) {

    // =========================
    // CLEAN RATIOS (INTEGERIZED)
    // =========================
    const busserRatio = normalizeRatio(session.busser_coverage);
    const hostRatio = normalizeRatio(session.host_coverage);
    const hostBonus =
        busserRatio <= 0 ? 0.03 : 0.03 * (1 - busserRatio);

    const hostMultiplier = safeZero(hostRatio + hostBonus);
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

        // =========================
        // BOH (FIXED 30%)
        // =========================
        emp.card_to_boh = floorMoney(cardNet * 0.30);
        emp.cash_to_boh = floorMoney(cash * 0.30);

        session.boh_pool_card += emp.card_to_boh;
        session.boh_pool_cash += emp.cash_to_boh;

        // =========================
        // BUSSER (12% × ratio)
        // =========================
        const busserMultiplier = Math.max(0, Math.min(1, busserRatio));

        emp.card_to_busser = floorMoney(cardNet * 0.12 * busserMultiplier);
        emp.cash_to_busser = floorMoney(cash * 0.12 * busserMultiplier);

        session.busser_pool_card += emp.card_to_busser;
        session.busser_pool_cash += emp.cash_to_busser;

        // =========================
        // HOST (5% + bonus × inverse)
        // =========================
        const hostMultiplier = Math.max(
            0,
            Math.min(1.25, (hostRatio + hostBonus))
        );

        emp.card_to_host = floorMoney(cardNet * 0.05 * hostMultiplier);
        emp.cash_to_host = floorMoney(cash * 0.05 * hostMultiplier);

        session.host_pool_card += emp.card_to_host;
        session.host_pool_cash += emp.cash_to_host;

        // =========================
        // KEPT
        // =========================
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
}