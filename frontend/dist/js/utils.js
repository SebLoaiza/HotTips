function minutesToTime(mins) {
    if (mins === null || mins === undefined || isNaN(mins)) return "-";

    mins = Number(mins);

    // normalize into 0–1439 range (VERY important)
    mins = ((mins % 1440) + 1440) % 1440;

    let hours = Math.floor(mins / 60);
    let minutes = mins % 60;

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}



// =========================
// MONEY UTILITIES
// =========================

// Floors to the nearest penny.
// Examples:
// 242.5097 -> 242.50
// 57.9899  -> 57.98
// 10       -> 10.00
function floorMoney(amount) {
    return Math.floor(((Number(amount) || 0) + 1e-9) * 100) / 100;
}




function renderSimpleTable(title, list) {

    if (!list || list.length === 0) {
        return `
            <div class="role-block">
                <h3>${title}</h3>
                <p>No data</p>
            </div>
        `;
    }

    const isTipOwners = title === "Tip Owners";

    let rows = "";

    list.forEach(emp => {

        const card = Number(emp.card_collected) || 0;
        const cash = Number(emp.cash_collected) || 0;
        const netCard = emp.card_collected_net || 0;

        rows += `
            <tr>
                <td>${emp.name}</td>
                <td>${emp.role}</td>
                <td>${minutesToTime(emp.meal_start)} → ${minutesToTime(emp.meal_end)}</td>

                <!-- BASE INPUT -->
                <td>$${floorMoney(card).toFixed(2)}</td>
                ${isTipOwners ? `<td>$${floorMoney(netCard).toFixed(2)}</td>` : ``}
                <td>$${floorMoney(cash).toFixed(2)}</td>

                <!-- DISTRIBUTION BREAKDOWN -->
                <td>$${floorMoney(emp.card_to_boh).toFixed(2)}</td>
                <td>$${floorMoney(emp.cash_to_boh).toFixed(2)}</td>

                <td>$${floorMoney(emp.card_to_busser).toFixed(2)}</td>
                <td>$${floorMoney(emp.cash_to_busser).toFixed(2)}</td>

                <td>$${floorMoney(emp.card_to_host).toFixed(2)}</td>
                <td>$${floorMoney(emp.cash_to_host).toFixed(2)}</td>

                <!-- KEPT -->
                <td>$${floorMoney(emp.card_kept || 0).toFixed(2)}</td>
                <td>$${floorMoney(emp.cash_kept || 0).toFixed(2)}</td>
            </tr>
        `;
    });

    return `
        <div class="role-block">
            <h3>${title}</h3>

            <table class="employee-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Shift</th>

                        <th>Card</th>
                        ${isTipOwners ? `<th>Net Card</th>` : ``}
                        <th>Cash</th>

                        <th>BOH Card</th>
                        <th>BOH Cash</th>

                        <th>Busser Card</th>
                        <th>Busser Cash</th>

                        <th>Host Card</th>
                        <th>Host Cash</th>

                        <th>Card Kept</th>
                        <th>Cash Kept</th>
                    </tr>
                </thead>

                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}


function renderRoleTable(title, list, poolCard = 0, poolCash = 0) {

    if (!list || list.length === 0) {
        return `
            <div class="role-block">
                <h3>${title}</h3>
                <p>No data</p>
            </div>
        `;
    }

    let rows = "";

    list.forEach(emp => {

        const cardRec = emp.card_received ?? 0;
        const cashRec = emp.cash_received ?? 0;

        rows += `
            <tr>
                <td>${emp.name}</td>

                <td>${emp.role}</td>

                <td>
                    ${minutesToTime(emp.meal_start)} → ${minutesToTime(emp.meal_end)}
                </td>

                <!-- EDITABLE POINTS -->
                <td>
                    <input 
                        type="number"
                        step="0.1"
                        value="${emp.point_weight ?? 1}"
                        data-emp-id="${emp.employee_id}"
                        class="point-input"
                    />
                </td>

                <!-- POOL RESULTS -->
                <td>$${floorMoney(cardRec).toFixed(2)}</td>
                <td>$${floorMoney(cashRec).toFixed(2)}</td>
            </tr>
        `;
    });

    return `
        <div class="role-block">
            <h3>${title}</h3>

            <div class="summary">
                <div><b>Card Pool:</b> $${floorMoney(poolCard).toFixed(2)}</div>
                <div><b>Cash Pool:</b> $${floorMoney(poolCash).toFixed(2)}</div>
            </div>

            <table class="employee-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Shift</th>
                        <th>Points</th>
                        <th>Card Earned</th>
                        <th>Cash Earned</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}