// =========================
// LOAD SESSIONS
// =========================

const tipSessions =
    JSON.parse(sessionStorage.getItem("tipSessions")) || [];

console.log("Loaded Sessions:", tipSessions);

// =========================
// MONEY
// =========================

function floorMoney(amount) {
    amount = Number(amount) || 0;
    return Math.floor((amount + 1e-9) * 100) / 100;
}

// =========================
// COMPILE RESULTS
// =========================

const employees = {};

tipSessions.forEach(session => {

    session.employees.forEach(emp => {

        if (!employees[emp.employee_id]) {

            employees[emp.employee_id] = {
                employee_id: emp.employee_id,
                name: emp.name,
                role: emp.role,

                card_total: 0,
                cash_total: 0,

                orders_total: 0,
                minutes_total: 0
            };
        }

        const target = employees[emp.employee_id];

        target.card_total +=
            (emp.card_kept || 0) + (emp.card_received || 0);

        target.cash_total +=
            (emp.cash_kept || 0) + (emp.cash_received || 0);

        target.orders_total += (emp.orders?.length || 0);

        target.minutes_total += Math.max(
            0,
            (emp.meal_end - emp.meal_start)
        );
    });
});

// =========================
// STATS
// =========================

function calculateStats(emp) {

    const totalTips =
        (emp.card_total || 0) + (emp.cash_total || 0);

    const orders = emp.orders_total || 0;

    const hours = Math.max((emp.minutes_total || 0) / 60, 0.01);

    return {
        totalTips,
        avgPerOrder: orders > 0 ? totalTips / orders : 0,
        avgPerHour: totalTips / hours
    };
}

// =========================
// SORT LISTS
// =========================

const allEmployees = Object.values(employees);

const alphabetical = [...allEmployees]
    .sort((a, b) => a.name.localeCompare(b.name));

const byOrder = [...allEmployees]
    .sort((a, b) =>
        calculateStats(b).avgPerOrder -
        calculateStats(a).avgPerOrder
    );

const byHour = [...allEmployees]
    .sort((a, b) =>
        calculateStats(b).avgPerHour -
        calculateStats(a).avgPerHour
    );

// =========================
// RENDER TABLES
// =========================

function renderTable(title, list, showRank = false) {

    let html = `
        <h2>${title}</h2>
        <table>
            <thead>
                <tr>
                    ${showRank ? "<th>Rank</th>" : ""}
                    <th>Name</th>
                    <th>Card</th>
                    <th>Cash</th>
                    <th>Orders</th>
                    <th>Hours</th>
                    <th>Avg/Order</th>
                    <th>Avg/Hour</th>
                </tr>
            </thead>
            <tbody>
    `;

    list.forEach((emp, i) => {

        const stats = calculateStats(emp);

        html += `
            <tr>
                ${showRank ? `<td>${i + 1}</td>` : ""}

                <td>${emp.name}</td>

                <td>$${floorMoney(emp.card_total).toFixed(2)}</td>
                <td>$${floorMoney(emp.cash_total).toFixed(2)}</td>

                <td>${emp.orders_total}</td>

                <td>${(emp.minutes_total / 60).toFixed(2)}</td>

                <td>$${stats.avgPerOrder.toFixed(2)}</td>
                <td>$${stats.avgPerHour.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `</tbody></table><br/>`;

    return html;
}

// =========================
// OUTPUT (3 LISTS)
// =========================

const container = document.body;

container.innerHTML += `
    ${renderTable("1. Alphabetical List", alphabetical)}
    ${renderTable("2. Ranked by Avg Per Order", byOrder, true)}
    ${renderTable("3. Ranked by Avg Per Hour", byHour, true)}
`;