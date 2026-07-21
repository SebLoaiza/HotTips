export function renderCashDropTables(mealBlocks, refreshUI) {

    const output =
        document.getElementById("cashDropTables");

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

        const blocks = mealBlocks.filter(
            block => block.meal === meal
        );

        if (blocks.length === 0) {
            continue;
        }

        renderMealTable(
            output,
            meal,
            blocks,
            refreshUI
        );

    }

}

function renderMealTable(
    parent,
    meal,
    blocks,
    refreshUI
) {

    const employeeMap = new Map();

    // ------------------------
    // Collect Employees
    // ------------------------

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

    // ------------------------
    // Build Table
    // ------------------------

    const table =
        document.createElement("table");

    table.className = "summary-table";

    let html = `
        <caption>${meal} Cash Drops</caption>

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
            </tr>

        </thead>

        <tbody>
    `;

    // ------------------------
    // Employee Rows
    // ------------------------

    for (const [employeeId, employeeName] of employeeMap) {

        html += `
            <tr>

                <td>${employeeName}</td>
        `;

        for (const block of blocks) {

            const employee =
                block.employees.find(
                    e => e.employee_id === employeeId
                );

            if (!employee) {

                html += `
                    <td>-</td>
                `;

                continue;

            }

            html += `
                <td>

                    <input
                        type="number"

                        class="cash-drop-input"

                        step="0.01"

                        min="0"

                        data-employee="${employee.employee_id}"

                        data-block="${block.day_key}-${block.meal}"

                        value="${(employee.cash_drop / 100).toFixed(2)}">

                </td>
            `;

        }

        html += `
            </tr>
        `;

    }

    html += `
        </tbody>
    `;

    table.innerHTML = html;

    parent.appendChild(table);

    // ------------------------
    // Hook Inputs
    // ------------------------

    table.querySelectorAll(".cash-drop-input")
        .forEach(input => {

            input.addEventListener("change", () => {

                const employeeId =
                    input.dataset.employee;

                const blockId =
                    input.dataset.block;

                const value =
                    Math.round(
                        (parseFloat(input.value) || 0) * 100
                    );

                const block =
                    blocks.find(
                        b => `${b.day_key}-${b.meal}` === blockId
                    );

                if (!block) {
                    return;
                }

                const employee =
                    block.employees.find(
                        e => e.employee_id === employeeId
                    );

                if (!employee) {
                    return;
                }

                employee.cash_drop = value;

                refreshUI();

            });

        });

}