export function renderCashCollectedTables(mealBlocks) {

    const output = document.getElementById("cashCollectedTables");

    if (!output) {
        return;
    }

    output.innerHTML = "";

    const meals = ["Breakfast", "Lunch", "Dinner"];

    for (const meal of meals) {

        const blocks =
            mealBlocks.filter(
                b => b.meal === meal
            );

        if (blocks.length === 0) {
            continue;
        }


        // Build a unique employee list for this meal
        const employeeMap = new Map();

        for (const block of blocks) {

            for (const employee of block.employees) {

                if (!employeeMap.has(employee.employee_id)) {

                    employeeMap.set(
                        employee.employee_id,
                        employee.name
                    );

                }

            }

        }


        const table = document.createElement("table");
        table.className = "summary-table";


        // Header
        let html = `
            <caption>${meal} Cash Payments</caption>

            <thead>
                <tr>
                    <th>Employee</th>
        `;

        for (const block of blocks) {

            html += `
                <th>${block.date}</th>
            `;

        }

        html += `
                    <th>Total</th>
                </tr>
            </thead>

            <tbody>
        `;


        // Employee rows
        for (const [employeeId, employeeName] of employeeMap) {

            html += `
                <tr>
                    <td>${employeeName}</td>
            `;

            let employeeTotal = 0;

            for (const block of blocks) {

                const employee =
                    block.employees.find(
                        e => e.employee_id === employeeId
                    );

                const cashCollected =
                    employee
                        ? employee.cash_sales
                        : 0;

                employeeTotal += cashCollected;

                html += `
                    <td>${money(cashCollected)}</td>
                `;

            }

            html += `
                    <td><strong>${money(employeeTotal)}</strong></td>
                </tr>
            `;

        }


        // Totals row
        html += `
            <tr>
                <th>Total</th>
        `;

        let grandTotal = 0;

        for (const block of blocks) {

            let dayTotal = 0;

            for (const employee of block.employees) {
                dayTotal += employee.cash_sales;
            }

            grandTotal += dayTotal;

            html += `
                <th>${money(dayTotal)}</th>
            `;

        }

        html += `
                <th>${money(grandTotal)}</th>
            </tr>

            </tbody>
        `;

        table.innerHTML = html;


        const wrapper = document.createElement("div");

        wrapper.className = "table-scroll";


        wrapper.appendChild(table);


        output.appendChild(wrapper);

    }

}


function money(cents) {

    return `$${(cents / 100).toFixed(2)}`;

}