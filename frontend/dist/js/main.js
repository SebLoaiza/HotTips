// =========================
// ENTRY POINT
// =========================

const mealBlocks =
    JSON.parse(sessionStorage.getItem("mealBlocks")) || [];

const tipSessions = mealBlocks.map(block => {

    const session = buildTipSession(block);

    distributeTips(session);   
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

                ${renderSimpleTable("Tip Owners", session.tip_owners)}

                ${renderRoleTable(
                    "Servers",
                    session,
                    session.servers,
                    session.server_pool_card,
                    session.server_pool_cash
                )}

                ${renderRoleTable(
                    "Bussers",
                    session,
                    session.bussers,
                    session.busser_pool_card,
                    session.busser_pool_cash
                )}

                ${renderRoleTable(
                    "Hosts",
                    session,
                    session.hosts,
                    session.host_pool_card,
                    session.host_pool_cash
                )}

                ${renderRoleTable(
                    "BOH",
                    session,
                    session.boh,
                    session.boh_pool_card,
                    session.boh_pool_cash
                )}

            </div>
            <details class="debug-panel">
                <summary>TipSession JSON (Debug)</summary>
                <pre>${JSON.stringify(session, null, 2)}</pre>
            </details>
        `;

        container.appendChild(div);
    });

    
}

document.getElementById("finalizeBtn").addEventListener("click", () => {

    tipSessions.forEach(session => distributeTips(session));

    sessionStorage.setItem(
        "tipSessions",
        JSON.stringify(tipSessions)
    );

    window.location.href = "results.html";

});