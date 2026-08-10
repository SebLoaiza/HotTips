export function renderCashDropList(
    mealBlocks,
    refreshUI
) {

    const output =
        document.getElementById(
            "cashDropTables"
        );

    if (!output) {
        return;
    }

    output.innerHTML = "";

    const rows = [];

    for (const block of mealBlocks) {

        for (const employee of block.employees) {

            // Hide BOH employees
            if (isBOH(employee.role)) {
                continue;
            }

            rows.push({
                block,
                employee
            });

        }

    }

    // =========================
    // SORT
    // =========================

    const mealOrder = {
        Breakfast: 0,
        Lunch: 1,
        Dinner: 2
    };

    rows.sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.block.day_key ||
                    a.block.date
                );

            const dateB =
                new Date(
                    b.block.day_key ||
                    b.block.date
                );

            if (dateA - dateB !== 0) {

                return dateA - dateB;

            }

            return (
                (mealOrder[a.block.meal] ?? 99) -
                (mealOrder[b.block.meal] ?? 99)
            );

        }
    );

    output.appendChild(
        createTable(
            rows,
            refreshUI
        )
    );

}

// =========================
// BOH FILTER
// =========================

function isBOH(role) {

    const value =
        String(
            role || ""
        )
        .toLowerCase()
        .trim();

    return (
        value.includes("cook") ||
        value.includes("dishwasher")
    );

}

// =========================
// CREATE TABLE
// =========================

function createTable(
    rows,
    refreshUI
) {

    const table =
        document.createElement(
            "table"
        );

    table.className =
        "cash-drop-table";

    const headers = [
        "Date",
        "Meal",
        "Employee",
        "Role",
        "Cash Drop",
        "Cash Sales"
    ];

    const thead =
        document.createElement(
            "thead"
        );

    const headerRow =
        document.createElement(
            "tr"
        );

    for (const text of headers) {

        const th =
            document.createElement(
                "th"
            );

        th.textContent =
            text;

        headerRow.appendChild(
            th
        );

    }

    thead.appendChild(
        headerRow
    );

    table.appendChild(
        thead
    );

    const tbody =
        document.createElement(
            "tbody"
        );

    rows.forEach(
        (rowData, index) => {

            tbody.appendChild(
                createRow(
                    rowData,
                    index,
                    refreshUI
                )
            );

        }
    );

    table.appendChild(
        tbody
    );

    return table;

}

// =========================
// CREATE ROW
// =========================

function createRow(
    { block, employee },
    index,
    refreshUI
) {

    const row =
        document.createElement(
            "tr"
        );

    row.className =
        "cash-drop-table-row";

    // =========================
    // DATE
    // =========================

    addCell(
        row,
        "cash-drop-date",
        formatDate(
            block.date
        )
    );

    // =========================
    // MEAL
    // =========================

    addCell(
        row,
        "cash-drop-meal",
        block.meal
    );

    // =========================
    // EMPLOYEE
    // =========================

    addCell(
        row,
        "cash-drop-employee",
        employee.name
    );

    // =========================
    // ROLE
    // =========================

    addCell(
        row,
        "cash-drop-role",
        employee.role || ""
    );

    // =========================
    // CASH DROP
    // =========================

    const dropCell =
        document.createElement(
            "td"
        );

    dropCell.className =
        "cash-drop-value-cell";

    const input =
        document.createElement(
            "input"
        );

    input.className =
        "cash-drop-input";

    input.type =
        "number";

    input.min =
        "0";

    input.step =
        "0.01";

    input.value =
        (
            (employee.cash_drop || 0) /
            100
        ).toFixed(2);

    input.dataset.row =
        index;

    dropCell.appendChild(
        input
    );

    row.appendChild(
        dropCell
    );

    // =========================
    // CASH SALES
    // =========================

    addCell(
        row,
        "cash-drop-sales",
        money(
            employee.cash_sales
        )
    );

    updateColor(
        input,
        employee
    );

    // =========================
    // LIVE INPUT
    // =========================

    input.addEventListener(
        "input",
        () => {

            const value =
                Math.round(
                    (
                        Number(
                            input.value
                        ) || 0
                    ) * 100
                );

            input.className =
                "cash-drop-input " +
                getDropClass(
                    value,
                    employee.cash_sales
                );

        }
    );

    // =========================
    // SAVE
    // =========================

    input.addEventListener(
        "change",
        () => {

            saveCashDrop(
                employee,
                input
            );

            updateColor(
                input,
                employee
            );

            /*
             * DO NOT save to sessionStorage
             * here.
             *
             * currentMealBlocks in app.js
             * contains this same employee object.
             */

            if (refreshUI) {

                refreshUI();

            }

        }
    );

    // =========================
    // ENTER → NEXT ROW
    // =========================

// =========================
// ENTER → NEXT ROW
// =========================

input.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        // Save current value
        saveCashDrop(
            employee,
            input
        );

        // Find all current inputs
        const inputs =
            Array.from(
                document.querySelectorAll(
                    "#cashDropTables .cash-drop-input"
                )
            );

        const currentIndex =
            inputs.indexOf(input);

        const nextIndex =
            currentIndex + 1;

        // Refresh the UI
        if (refreshUI) {
            refreshUI();
        }

        // After refresh, find the newly-created inputs
        const newInputs =
            Array.from(
                document.querySelectorAll(
                    "#cashDropTables .cash-drop-input"
                )
            );

        const next =
            newInputs[nextIndex];

        if (next) {

            next.focus();
            next.select();

        }

    }
);  

    return row;

}

// =========================
// ADD CELL
// =========================

function addCell(
    row,
    className,
    text
) {

    const cell =
        document.createElement(
            "td"
        );

    cell.className =
        className;

    cell.textContent =
        text;

    row.appendChild(
        cell
    );

}

// =========================
// UPDATE COLOR
// =========================

function updateColor(
    input,
    employee
) {

    input.className =
        "cash-drop-input " +
        getDropClass(
            employee.cash_drop,
            employee.cash_sales
        );

}

function getDropClass(
    drop,
    sales
) {

    if (drop < sales) {

        return "drop-low";

    }

    if (drop > sales) {

        return "drop-high";

    }

    return "drop-equal";

}

// =========================
// SAVE CASH DROP
// =========================

function saveCashDrop(
    employee,
    input
) {

    const dollars =
        Number(
            input.value
        ) || 0;

    const cents =
        Math.round(
            dollars * 100
        );

    employee.cash_drop =
        cents;

    input.value =
        (
            cents / 100
        ).toFixed(2);

}

// =========================
// FORMAT DATE
// =========================

function formatDate(date) {

    if (!date) {
        return "";
    }

    const value =
        String(
            date
        ).trim();

    const match =
        value.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

    if (match) {

        return (
            match[1].padStart(2, "0") +
            "/" +
            match[2].padStart(2, "0") +
            "/" +
            match[3]
        );

    }

    const parsed =
        new Date(
            date
        );

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return value;

    }

    return (
        String(
            parsed.getMonth() + 1
        ).padStart(2, "0") +
        "/" +
        String(
            parsed.getDate()
        ).padStart(2, "0") +
        "/" +
        parsed.getFullYear()
    );

}

// =========================
// MONEY
// =========================

function money(cents) {

    return `$${(
        (Number(cents) || 0) /
        100
    ).toFixed(2)}`;

}