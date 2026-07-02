// =========================
// ENTRY POINT
// =========================

const mealBlocks =
    JSON.parse(sessionStorage.getItem("mealBlocks")) || [];

const tipSessions = mealBlocks.map(block => {

    const session = buildTipSession(block);

    distributeTips(session);   // 💥 THIS WAS MISSING

    return session;
});

renderSessions(tipSessions);


// =========================
// RENDER SESSIONS
// =========================
function renderSessions(sessions) {

    const container = document.getElementById("sessionContainer");
    container.innerHTML = "";

    sessions.forEach(session => {

        let mainRows = "";

        session.employees.forEach(emp => {

            mainRows += `
                <tr>
                    <td>${emp.name}</td>
                    <td>${emp.role}</td>
                    <td>${minutesToTime(emp.meal_start)} → ${minutesToTime(emp.meal_end)}</td>
                    <td>${emp.is_server ? "✔" : ""}</td>
                    <td>${emp.is_busser ? "✔" : ""}</td>
                    <td>${emp.is_host ? "✔" : ""}</td>
                    <td>${emp.is_boh ? "✔" : ""}</td>
                    <td>$${emp.card_collected.toFixed(2)}</td>
                    <td>$${emp.cash_collected.toFixed(2)}</td>
                </tr>
            `;
        });

        const div = document.createElement("div");
        div.className = "session-card";

        div.innerHTML = `
            <h2>${session.date} — ${session.meal}</h2>

            <p>
                <b>Meal Shift:</b>
                ${minutesToTime(session.start)} → ${minutesToTime(session.end)}
            </p>

            <div class="viz-container">
                ${renderCoverageViz("Busser", session.busser_coverage, session.busser_coverage_meta)}
                ${renderCoverageViz("Host", session.host_coverage, session.host_coverage_meta)}
            </div>

            <p>
                <b>Online Tips:</b>
                $${session.online_tips.toFixed(2)}
            </p>

            <!-- MAIN TABLE -->
            <h3>All Employees</h3>
            <table class="employee-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Shift</th>
                        <th>Server</th>
                        <th>Busser</th>
                        <th>Host</th>
                        <th>BOH</th>
                        <th>Card</th>
                        <th>Cash</th>
                    </tr>
                </thead>
                <tbody>
                    ${mainRows}
                </tbody>
            </table>

            <!-- ROLE TABLES -->

            <div class="role-container">

                <h3>
                    Tip Owners
                </h3>
                ${renderSimpleTable("Tip Owners", session.tip_owners)}

                <h3>
                    Servers — Card: $${floorMoney(session.server_pool_card).toFixed(2)} |
                    Cash: $${floorMoney(session.server_pool_cash).toFixed(2)}
                </h3>
                ${renderSimpleTable("Servers", session.servers)}

                <h3>
                    Bussers — Card: $${floorMoney(session.busser_pool_card).toFixed(2)} |
                    Cash: $${floorMoney(session.busser_pool_cash).toFixed(2)}
                </h3>
                ${renderSimpleTable("Bussers", session.bussers)}

                <h3>
                    Hosts — Card: $${floorMoney(session.host_pool_card).toFixed(2)} |
                    Cash: $${floorMoney(session.host_pool_cash).toFixed(2)}
                </h3>
                ${renderSimpleTable("Hosts", session.hosts)}

                <h3>
                    BOH — Card: $${floorMoney(session.boh_pool_card).toFixed(2)} |
                    Cash: $${floorMoney(session.boh_pool_cash).toFixed(2)}
                </h3>
                ${renderSimpleTable("BOH", session.boh)}

            </div>
            <h3>TipSession Object</h3>
            <pre>${JSON.stringify(session, null, 2)}</pre>
        `;

        container.appendChild(div);
    });
}