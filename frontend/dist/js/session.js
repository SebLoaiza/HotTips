// =========================
// MONEY UTILITIES
// =========================

// Always floor to nearest cent.
function floorMoney(amount) {
    amount = Number(amount) || 0;
    return Math.floor((amount + 1e-9) * 100) / 100;
}

// Round percentages / ratios to two decimals.
function roundRatio(value) {
    value = Number(value) || 0;
    return Math.round((value + Number.EPSILON) * 100) / 100;
}


// =========================
// TIP SESSION FACTORY
// =========================

function createTipSession(block) {

    return {
        date: block.date,
        meal: block.meal,

        start: block.start,
        end: block.end,

        online_tips: floorMoney(block.online_total || 0),

        employees: [],

        tip_owners: [],
        servers: [],
        bussers: [],
        hosts: [],
        boh: [],

        busser_coverage: 0,
        host_coverage: 0,

        boh_pool_card: 0,
        boh_pool_cash: 0,

        busser_pool_card: 0,
        busser_pool_cash: 0,

        host_pool_card: 0,
        host_pool_cash: 0,

        server_pool_card: 0,
        server_pool_cash: 0
    };
}


// =========================
// SESSION BUILDER
// =========================

function buildTipSession(block) {

    const session = createTipSession(block);

    block.employees.forEach(emp => {

        const role = emp.role.toLowerCase();

        const cardCollected = floorMoney(Number(emp.card_tips) || 0);
        const cashCollected = floorMoney(Number(emp.cash_tips) || 0);

        const employee = {

            employee_id: emp.employee_id,
            name: emp.name,
            role: emp.role,

            meal_start: emp.meal_start,
            meal_end: emp.meal_end,
            lost_mins: emp.lost_mins || 0,

            point_weight: 1.0,

            is_server: role.includes("server"),
            is_busser: role.includes("busser"),
            is_host: role.includes("host"),
            is_boh:
                !role.includes("server") &&
                !role.includes("host") &&
                !role.includes("busser"),

            // -----------------------------
            // Tips collected
            // -----------------------------
            card_collected: cardCollected,
            cash_collected: cashCollected,

            // 3% card fee
            card_collected_net: floorMoney(cardCollected * 0.97),

            // -----------------------------
            // Money sent to pools
            // -----------------------------
            card_to_boh: 0,
            cash_to_boh: 0,

            card_to_busser: 0,
            cash_to_busser: 0,

            card_to_host: 0,
            cash_to_host: 0,

            // -----------------------------
            // Money kept
            // -----------------------------
            card_kept: 0,
            cash_kept: 0,

            // -----------------------------
            // Money received from role pool
            // -----------------------------
            card_received: 0,
            cash_received: 0,

            // -----------------------------
            // Final payout
            // -----------------------------
            final_total: 0
        };

        session.employees.push(employee);

        if (employee.card_collected > 0 || employee.cash_collected > 0) {
            session.tip_owners.push(employee);
        }

        if (employee.is_server) session.servers.push(employee);
        if (employee.is_busser) session.bussers.push(employee);
        if (employee.is_host) session.hosts.push(employee);
        if (employee.is_boh) session.boh.push(employee);
    });

    const busserCoverage = calculateCoverage(session, "is_busser");
    session.busser_coverage = busserCoverage.percent;
    session.busser_coverage_meta = busserCoverage;

    const hostCoverage = calculateCoverage(session, "is_host");
    session.host_coverage = hostCoverage.percent;
    session.host_coverage_meta = hostCoverage;

    return session;
}


// =========================
// COVERAGE ENGINE
// =========================

function calculateCoverage(session, property) {

    if (session.employees.length === 0) {
        return {
            percent: 0,
            covered: 0,
            total: 0,
            merged: []
        };
    }

    const start = Math.min(...session.employees.map(e => e.meal_start));
    const end = Math.max(...session.employees.map(e => e.meal_end));

    const totalMinutes = end - start;

    if (totalMinutes <= 0) {
        return {
            percent: 0,
            covered: 0,
            total: 0,
            merged: []
        };
    }

    const intervals = session.employees
        .filter(e => e[property])
        .map(e => [e.meal_start, e.meal_end])
        .sort((a, b) => a[0] - b[0]);

    if (intervals.length === 0) {
        return {
            percent: 0,
            covered: 0,
            total: totalMinutes,
            merged: []
        };
    }

    const merged = [];

    let [currentStart, currentEnd] = intervals[0];

    for (let i = 1; i < intervals.length; i++) {

        const [start, end] = intervals[i];

        if (start <= currentEnd) {
            currentEnd = Math.max(currentEnd, end);
        } else {
            merged.push([currentStart, currentEnd]);
            currentStart = start;
            currentEnd = end;
        }
    }

    merged.push([currentStart, currentEnd]);

    let covered = 0;

    merged.forEach(([start, end]) => {
        covered += end - start;
    });

    return {
        percent: roundRatio((covered / totalMinutes) * 100),
        covered,
        total: totalMinutes,
        merged
    };
}


// =========================
// TIME UTILITY
// =========================

function minutesToTime(mins) {

    if (mins === null || mins === undefined || isNaN(mins)) {
        return "-";
    }

    mins = Number(mins);

    mins = ((mins % 1440) + 1440) % 1440;

    let hours = Math.floor(mins / 60);
    const minutes = mins % 60;

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}