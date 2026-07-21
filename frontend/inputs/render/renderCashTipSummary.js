function money(cents) {

    return `$${((Number(cents) || 0) / 100).toFixed(2)}`;

}

export function renderCashTipSummary(mealBlocks) {

    const output =
        document.getElementById("cashTipSummary");

    if (!output) {
        return;
    }

    output.innerHTML = "";

    for (const block of mealBlocks) {

        const wrap =
            document.createElement("div");

        wrap.className = "panel";

        let html = `

            <h3>
                ${block.meal} • ${block.date}
            </h3>

            <table class="summary-table">

                <thead>

                    <tr>

                        <th>Employee</th>

                        <th>Cash Sales</th>

                        <th>Cash Drop</th>

                        <th>Cash Tips</th>

                    </tr>

                </thead>

                <tbody>

        `;

        for (const employee of block.employees) {

            html += `

                <tr>

                    <td>${employee.name}</td>

                    <td>${money(employee.cash_sales)}</td>

                    <td>${money(employee.cash_drop)}</td>

                    <td>${money(employee.cash_tips)}</td>

                </tr>

            `;

        }

        html += `

                <tr>

                    <th>Total</th>

                    <th>${money(block.cash_sales)}</th>

                    <th>${money(block.cash_drop)}</th>

                    <th>${money(block.cash_tips)}</th>

                </tr>

                </tbody>

            </table>

        `;

        wrap.innerHTML = html;

        output.appendChild(wrap);

    }

}