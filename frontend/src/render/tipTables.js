export function renderTipTables(mealBlocks) {

    const container = document.getElementById("tipTables");

    container.innerHTML = "";

    const meals = [
        "Breakfast",
        "Lunch",
        "Dinner"
    ];

    for (const meal of meals) {

        const blocks = mealBlocks.filter(block =>
            block.meal === meal
        );

        if (blocks.length === 0) {
            continue;
        }

        const title = document.createElement("h2");

        title.textContent = `${meal} Card Tips`;

        container.appendChild(title);

        const table = document.createElement("table");

        const header = document.createElement("tr");

        header.innerHTML = `
            <th>Employee</th>
        `;

        for (const block of blocks) {

            header.innerHTML += `
                <th>${block.date}</th>
            `;

        }

        table.appendChild(header);

        // -------------------------
        // Build employee list
        // -------------------------

        const employees = [];

        for (const block of blocks) {

            for (const employee of block.employees) {

                if (!employees.includes(employee.name)) {
                    employees.push(employee.name);
                }

            }

        }

        // -------------------------
        // Employee rows
        // -------------------------

        for (const employeeName of employees) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${employeeName}</td>
            `;

            for (const block of blocks) {

                const employee =
                    block.employees.find(
                        e => e.name === employeeName
                    );

                const tips = employee
                    ? employee.card_tips
                    : 0;

                row.innerHTML += `
                    <td>${money(tips)}</td>
                `;

            }

            table.appendChild(row);

        }

        // -------------------------
        // Totals row
        // -------------------------

        const totalRow = document.createElement("tr");

        totalRow.innerHTML = `
            <td><strong>Total</strong></td>
        `;

        for (const block of blocks) {

            let total = 0;

            for (const employee of block.employees) {

                total += employee.card_tips;

            }

            totalRow.innerHTML += `
                <td><strong>${money(total)}</strong></td>
            `;

        }

        table.appendChild(totalRow);

        container.appendChild(table);

    }

}

function money(cents) {

    return `$${(cents / 100).toFixed(2)}`;

}