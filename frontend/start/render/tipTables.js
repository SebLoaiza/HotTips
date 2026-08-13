export function renderTipTables(mealBlocks) {

    const output =
        document.getElementById("cardSalesTables");

    if (!output) {
        return;
    }

    output.innerHTML = "";

    const meals = [
        "Breakfast",
        "Lunch",
        "Dinner"
    ];


    for (const meal of meals) {

        const blocks =
            mealBlocks.filter(
                b => b.meal === meal
            );

        if (blocks.length === 0) {
            continue;
        }


        // Collect every employee that worked this meal
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


        // Create the meal title OUTSIDE the scrollable table
        const title = document.createElement("h4");

        title.className = "table-title";

        title.textContent =
            `${meal} Tips & Gratuity Earned`;

        output.appendChild(title);


        // Create table
        const table =
            document.createElement("table");

        table.className = "summary-table";


        // Header
        let html = `
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

                const cardTips =
                    employee
                        ? employee.card_tips
                        : 0;

                employeeTotal += cardTips;

                html += `
                    <td>${money(cardTips)}</td>
                `;

            }


            html += `
                    <td>
                        <strong>
                            ${money(employeeTotal)}
                        </strong>
                    </td>

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

                dayTotal += employee.card_tips;

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


        // Insert table HTML
        table.innerHTML = html;


        // Create scrollable wrapper
        const wrapper =
            document.createElement("div");

        wrapper.className = "table-scroll";


        wrapper.appendChild(table);


        // Add scrolling table underneath the title
        output.appendChild(wrapper);

    }

}


function money(cents) {

    cents = Number(cents) || 0;

    return `$${(cents / 100).toFixed(2)}`;

}