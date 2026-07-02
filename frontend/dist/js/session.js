// =========================
// SESSION BUILDER
// =========================

function buildTipSession(block) {

    const session = {
        date: block.date,
        meal: block.meal,

        start: block.start,
        end: block.end,

        online_tips: block.online_total || 0,

        busser_coverage: 0,
        host_coverage: 0,

        boh_pool: 0,
        busser_pool: 0,
        host_pool: 0,
        server_pool: 0,

        tip_owners: [],
        servers: [],
        bussers: [],
        hosts: [],
        boh: [],

        employees: []
    };

    block.employees.forEach(emp => {

        const role = emp.role.toLowerCase();

        const cardCollected = Number(emp.card_tips) || 0;
        const cashCollected = Number(emp.cash_tips) || 0;

        // 3% card fee
        const cardNet = floorMoney(cardCollected * 0.97);

        const employeeObj = {
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

            card_collected: cardCollected,
            cash_collected: cashCollected,
            card_collected_net: cardNet,

            card_kept: 0,
            cash_kept: 0,

            card_pool: 0,
            cash_pool: 0,

            server_received: 0,
            busser_received: 0,
            host_received: 0,
            boh_received: 0,

            final_card: 0,
            final_cash: 0,
            final_total: 0
        };

        session.employees.push(employeeObj);
        session.tip_owners.push(employeeObj);

        if (employeeObj.is_server) session.servers.push(employeeObj);
        if (employeeObj.is_busser) session.bussers.push(employeeObj);
        if (employeeObj.is_host) session.hosts.push(employeeObj);
        if (employeeObj.is_boh) session.boh.push(employeeObj);
    });

    // remove zero tip people
    session.tip_owners = session.tip_owners.filter(e =>
        (e.card_collected + e.cash_collected) > 0
    );

    // coverage
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

    const start = Math.min(...session.employees.map(e => e.meal_start));
    const end = Math.max(...session.employees.map(e => e.meal_end));

    const totalMinutes = end - start;

    if (totalMinutes <= 0) {
        return { percent: 0, covered: 0, total: 0, merged: [] };
    }

    const intervals = session.employees
        .filter(e => e[property])
        .map(e => [e.meal_start, e.meal_end])
        .sort((a, b) => a[0] - b[0]);

    if (!intervals.length) {
        return { percent: 0, covered: 0, total: totalMinutes, merged: [] };
    }

    const merged = [];
    let [cs, ce] = intervals[0];

    for (let i = 1; i < intervals.length; i++) {
        const [s, e] = intervals[i];

        if (s <= ce) ce = Math.max(ce, e);
        else {
            merged.push([cs, ce]);
            cs = s;
            ce = e;
        }
    }

    merged.push([cs, ce]);

    let covered = 0;
    for (const [s, e] of merged) {
        covered += e - s;
    }

    return {
        percent: (covered / totalMinutes) * 100,
        covered,
        total: totalMinutes,
        merged
    };
}


// =========================
// TIME UTILITY
// =========================

function minutesToTime(mins) {
    if (mins === null || mins === undefined || isNaN(mins)) return "-";

    mins = Number(mins);
    mins = ((mins % 1440) + 1440) % 1440;

    let hours = Math.floor(mins / 60);
    let minutes = mins % 60;

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}


// =========================
// FLOOR MONEY (IMPORTANT FIX)
// =========================

