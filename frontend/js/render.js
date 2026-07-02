
function updateCashTips(date, meal, employeeId, value) {

    const block = window.LAST_BLOCKS.find(
        b => b.date === date && b.meal === meal
    );

    if (!block) return;

    const employee = block.employees.find(
        e => e.employee_id === employeeId
    );

    if (!employee) return;

    const cash = Math.round((parseFloat(value) || 0) * 100) / 100;

    employee.cash_tips = cash;
}
// ======================================
// NAME MATCHING
// ======================================

function normalizeName(name) {

    if (!name) return "";

    name = name.trim();

    if (name.includes(",")) {

        const [last, first] = name.split(",");

        return `${first.trim()} ${last.trim()}`
            .toLowerCase()
            .replace(/\s+/g, " ");
    }

    return name
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}




function attachOrdersToBlocks(blocks, orders) {

    if (!blocks) return [];
    if (!orders) return blocks;

    // reset
    blocks.forEach(b => b.orders = []);

    for (const order of orders) {

        let matched = null;

        for (const block of blocks) {

            if (
                block.day_key === order.order_day &&
                order.order_time_min >= block.start &&
                order.order_time_min <= block.end
            ) {
                matched = block;
                break;
            }
        }

        if (matched) {
            matched.orders.push(order);
        } else {
            console.log("⚠️ Unmatched order:", {
                id: order.order_id,
                day: order.order_day,
                time: order.order_time_min,
                service: order.service
            });
        }
    }

    return blocks;
}


function attachOrdersToEmployees(blocks) {

    for (const block of blocks) {

        // reset every employee
        block.employees.forEach(emp => {
            emp.orders = [];
            emp.card_tips = 0;
        });

        // reset pool total (IMPORTANT if you're using it)
        block.online_total = 0;

        for (const order of block.orders) {

            const server = normalizeName(order.server);

            // =========================
            // 1. ONLINE ORDERING RULE
            // =========================
            if (
                server.includes("default online ordering") ||
                server.includes("online ordering")
            ) {
                block.online_total +=
                    (order.tip || 0) +
                    (order.gratuity || 0);

                continue;
            }

            // =========================
            // 2. EMPLOYEE MATCHING
            // =========================
            const employee = block.employees.find(emp =>
                normalizeName(emp.name) === server
            );

            if (!employee) {
                console.log("Couldn't match:", order.server);
                continue;
            }

            // assign order
            employee.orders.push(order);

            // add card tips
            employee.card_tips +=
                (order.tip || 0) +
                (order.gratuity || 0);
        }
    }
}


function renderBlocks(blocks) {

    const output = document.getElementById("output");
    output.innerHTML = "";

    const grouped = {};

    // group by date
    blocks.forEach(block => {
        if (!grouped[block.date]) grouped[block.date] = [];
        grouped[block.date].push(block);
    });

    Object.keys(grouped).forEach(date => {

        const dayWrap = document.createElement("div");
        dayWrap.className = "meal-block";

        const tableId = "day-" + date.replace(/\W/g, "_");

        // ======================
        // DAY HEADER
        // ======================
        const dayHeader = document.createElement("div");
        dayHeader.className = "meal-header";
        dayHeader.style.cursor = "pointer";
        dayHeader.innerHTML = `▼ ${date}`;
        dayHeader.onclick = () => toggleDay(tableId);

        dayWrap.appendChild(dayHeader);

        // ======================
        // TABLE
        // ======================
        const table = document.createElement("table");
        table.className = "meal-table";
        table.id = tableId;

        const tbody = document.createElement("tbody");

        ["Breakfast", "Lunch", "Dinner"].forEach(mealName => {

            const block = grouped[date].find(b => b.meal === mealName);

            if (!block) {
                console.log(`⚠️ Missing meal block: ${date} / ${mealName}`);
                return;
            }

            const key = `${block.date}-${block.meal}`;

            // ======================
            // FIX SERVER NAMES (DEBUG ISSUE)
            // ======================
            function formatServer(name) {
                if (!name || name.toLowerCase() === "unknown") return "Unknown";

                return name
                    .split(" ")
                    .map((p, i) =>
                        i === 0
                            ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                            : p.charAt(0).toUpperCase() + "."
                    )
                    .join(" ");
            }

            // ======================
            // MEAL HEADER
            // ======================
            const header = document.createElement("tr");
            header.className = "meal-group-header";

            header.innerHTML = `
                <td colspan="8"
                    style="background:#11141a;color:#7cc7ff;font-weight:bold;">

                    <span onclick="toggleMeal('${key}')" style="cursor:pointer;">
                        ▼ ${block.meal}
                    </span>

                    <span style="margin-left:12px;">
                        ${minutesToTime(block.start)} → ${minutesToTime(block.end)}
                    </span>

                    <button onclick="toggleEdit('${key}')">edit</button>

                    <div id="edit-${key}" style="display:none;margin-top:8px;">
                        <input id="start-${key}" type="text" value="${minutesToTime(block.start)}">
                        <input id="end-${key}" type="text" value="${minutesToTime(block.end)}">

                        <button onclick="applyEdit('${key}')">apply</button>

                        <div id="error-${key}" style="color:#ff6666;margin-top:6px;font-size:13px;"></div>
                    </div>

                </td>
            `;

            tbody.appendChild(header);


            // ======================
            // COLUMN HEADERS
            // ======================
            const cols = document.createElement("tr");
            cols.dataset.meal = key;

            cols.innerHTML = `
                <th>Employee</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Worked</th>
                <th>Lost</th>
                <th>Breaks</th>
                <th>Cash</th>
                <th>Card Tips</th>
            `;

            tbody.appendChild(cols);

            // ======================
            // EMPLOYEES
            // ======================
            block.employees.forEach(emp => {

                const row = document.createElement("tr");
                row.dataset.meal = key;

                const serverName = formatServer(emp.name);

                // initialize if missing
                if (emp.card_tips === undefined) emp.card_tips = 0;

                row.innerHTML = `
                    <td>${serverName}</td>
                    <td>${emp.role}</td>
                    <td>${minutesToTime(emp.meal_start)} → ${minutesToTime(emp.meal_end)}</td>
                    <td>${emp.worked_minutes}</td>
                    <td>${emp.lost_mins}</td>
                    <td>${
                        emp.breaks.length
                            ? emp.breaks.map(b =>
                                `${minutesToTime(b[0])} → ${minutesToTime(b[1])}`
                            ).join("<br>")
                            : "-"
                    }</td>

                    <td>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value="${emp.cash_tips.toFixed(2)}"
                            style="width:70px"
                            oninput="updateCashTips('${block.date}', '${block.meal}', '${emp.employee_id}', this.value)"
                            onchange="this.value = Number(this.value || 0).toFixed(2)"
                        >
                    </td>

                    <td id="card-${emp.employee_id}">
                        $${(emp.card_tips || 0).toFixed(2)}
                    </td>
                `;

                tbody.appendChild(row);
            });

            // ======================
            // ORDERS + TIP TOTALS
            // ======================
            let totalTip = 0;
            let totalGratuity = 0;

            if (block.orders && block.orders.length) {
                block.orders.forEach(o => {
                    totalTip += (o.tip || 0);
                    totalGratuity += (o.gratuity || 0);
                });
            }

            const totalCombined = totalTip + totalGratuity;

            const orderRow = document.createElement("tr");
            orderRow.dataset.meal = key;

            orderRow.innerHTML = `
                <td colspan="8">
                    <div style="margin-top:10px;padding:8px;background:#111;border-radius:6px;">

                        <b>
                            Orders (${block.orders ? block.orders.length : 0})
                        </b>

                        <div style="margin-top:5px;">
                            ${
                                block.orders && block.orders.length
                                ? block.orders.map(o => `
                                    <div>
                                        #${o.order_number}
                                        — ${minutesToTime(o.order_time_min)}
                                        — $${o.amount}
                                        — ${o.service}
                                        — Tip: $${o.tip || 0}
                                        — Gratuity: $${o.gratuity || 0}
                                        — Server: ${formatServer(o.server)}
                                    </div>
                                `).join("")
                                : "No orders"
                            }
                        </div>

                        <hr style="margin:8px 0;border:0;border-top:1px solid #333;">

                        <div style="font-weight:bold;">
                            Tip Total: $${totalTip.toFixed(2)} <br>
                            Gratuity Total: $${totalGratuity.toFixed(2)} <br>
                            Combined Total: $${totalCombined.toFixed(2)} <br>
                            Online Pool: $${block.online_total.toFixed(2)}
                        </div>

                    </div>
                </td>
            `;

            tbody.appendChild(orderRow);

            // spacing
            const spacer = document.createElement("tr");
            spacer.dataset.meal = key;
            spacer.innerHTML = `<td colspan="8"><div style="height:10px;"></div></td>`;

            tbody.appendChild(spacer);
        });

        table.appendChild(tbody);
        dayWrap.appendChild(table);
        output.appendChild(dayWrap);
    });
}