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

    output.appendChild(
        createTable(
            rows,
            mealBlocks,
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
// SORT STATE
// =========================
//
// Stored outside the table so
// refreshUI() does not reset
// the user's selected sort.
//

if (!renderCashDropList.sortState) {

    renderCashDropList.sortState = {
        column: "date",
        direction: "asc"
    };

}


// =========================
// CREATE TABLE
// =========================

function createTable(
    rows,
    mealBlocks,
    refreshUI
) {

    const table =
        document.createElement(
            "table"
        );

    table.className =
        "cash-drop-table";


    // =========================
    // MEAL ORDER
    // =========================

    const mealOrder = {
        Breakfast: 0,
        Lunch: 1,
        Dinner: 2
    };


    // =========================
    // SORT ROWS
    // =========================

    const sortState =
        renderCashDropList.sortState;

    const sortedRows =
        [...rows];

    sortedRows.sort(
        (a, b) => {

            let comparison = 0;

            // =========================
            // DATE
            // =========================

            if (
                sortState.column ===
                "date"
            ) {

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

                comparison =
                    dateA - dateB;

            }


            // =========================
            // MEAL
            // =========================

            else if (
                sortState.column ===
                "meal"
            ) {

                comparison =
                    (
                        mealOrder[
                            a.block.meal
                        ] ?? 99
                    ) -
                    (
                        mealOrder[
                            b.block.meal
                        ] ?? 99
                    );

            }


            // =========================
            // EMPLOYEE
            // =========================

            else if (
                sortState.column ===
                "employee"
            ) {

                comparison =
                    String(
                        a.employee.name || ""
                    ).localeCompare(
                        String(
                            b.employee.name || ""
                        )
                    );

            }


            // =========================
            // ROLE
            // =========================

            else if (
                sortState.column ===
                "role"
            ) {

                comparison =
                    String(
                        a.employee.role || ""
                    ).localeCompare(
                        String(
                            b.employee.role || ""
                        )
                    );

            }


            // =========================
            // CASH DROP
            // =========================

            else if (
                sortState.column ===
                "cashDrop"
            ) {

                comparison =
                    (
                        Number(
                            a.employee.cash_drop
                        ) || 0
                    ) -
                    (
                        Number(
                            b.employee.cash_drop
                        ) || 0
                    );

            }


            // =========================
            // CASH SALES
            // =========================

            else if (
                sortState.column ===
                "cashSales"
            ) {

                comparison =
                    (
                        Number(
                            a.employee.cash_sales
                        ) || 0
                    ) -
                    (
                        Number(
                            b.employee.cash_sales
                        ) || 0
                    );

            }


            // =========================
            // SORT DIRECTION
            // =========================

            return (
                sortState.direction ===
                "asc"
                    ? comparison
                    : -comparison
            );

        }
    );


    // =========================
    // HEADER
    // =========================

    const headers = [

        {
            label: "Date",
            column: "date"
        },

        {
            label: "Meal",
            column: "meal"
        },

        {
            label: "Employee",
            column: "employee"
        },

        {
            label: "Role",
            column: "role"
        },

        {
            label: "Cash Drop",
            column: "cashDrop"
        },

        {
            label: "Cash Sales",
            column: "cashSales"
        }

    ];


    const thead =
        document.createElement(
            "thead"
        );

    const headerRow =
        document.createElement(
            "tr"
        );


    for (
        const header
        of headers
    ) {

        const th =
            document.createElement(
                "th"
            );

        th.textContent =
            header.label;

        th.className =
            "sortable-header";


        // =========================
        // SORT INDICATOR
        // =========================

        if (
            sortState.column ===
            header.column
        ) {

            th.textContent =
                `${header.label} ${
                    sortState.direction ===
                    "asc"
                        ? "▲"
                        : "▼"
                }`;

            th.classList.add(
                sortState.direction ===
                    "asc"
                    ? "sort-ascending"
                    : "sort-descending"
            );

        }


        // =========================
        // CLICK TO SORT
        // =========================

        th.addEventListener(
            "click",
            () => {

                /*
                    Clicking the same
                    column reverses it.
                */

                if (
                    sortState.column ===
                    header.column
                ) {

                    sortState.direction =
                        sortState.direction ===
                            "asc"
                            ? "desc"
                            : "asc";

                }

                /*
                    Clicking a new column
                    starts ascending.
                */

                else {

                    sortState.column =
                        header.column;

                    sortState.direction =
                        "asc";

                }


                /*
                    Re-render using
                    the new sort.
                */

                renderCashDropList(
                    mealBlocks,
                    refreshUI
                );

            }
        );


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


    // =========================
    // BODY
    // =========================

    const tbody =
        document.createElement(
            "tbody"
        );


    sortedRows.forEach(
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
    // SELECT ALL + HIGHLIGHT ROW
    // =========================

    input.addEventListener(
        "focus",
        () => {

            input.select();

            row.classList.add(
                "cash-drop-row-selected"
            );

        }
    );


    input.addEventListener(
        "blur",
        () => {

            row.classList.remove(
                "cash-drop-row-selected"
            );

        }
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

            if (refreshUI) {

                refreshUI();

            }

        }
    );


    // =========================
    // ENTER / SHIFT + ENTER
    // =========================

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {

                return;

            }

            event.preventDefault();
            event.stopPropagation();


            // =========================
            // SAVE CURRENT VALUE
            // =========================

            saveCashDrop(
                employee,
                input
            );


            // =========================
            // FIND CURRENT INPUTS
            // =========================

            const inputs =
                Array.from(
                    document.querySelectorAll(
                        "#cashDropTables .cash-drop-input"
                    )
                );


            const currentIndex =
                inputs.indexOf(
                    input
                );


            // =========================
            // DETERMINE DIRECTION
            // =========================

            const nextIndex =
                event.shiftKey
                    ? currentIndex - 1
                    : currentIndex + 1;


            // =========================
            // STOP AT TABLE EDGES
            // =========================

            if (
                nextIndex < 0 ||
                nextIndex >=
                    inputs.length
            ) {

                if (refreshUI) {

                    refreshUI();

                }

                return;

            }


            // =========================
            // REMEMBER NEXT EMPLOYEE
            // =========================

            const nextInput =
                inputs[
                    nextIndex
                ];


            const nextEmployeeId =
                nextInput
                    .closest("tr")
                    ?.querySelector(
                        ".cash-drop-input"
                    )
                    ?.dataset.row;


            /*
                Refresh the application.

                refreshUI() may rebuild
                the table, so we cannot
                keep the old DOM element.
            */

            if (refreshUI) {

                refreshUI();

            }


            // =========================
            // FIND INPUT AFTER REFRESH
            // =========================

            requestAnimationFrame(
                () => {

                    const newInputs =
                        Array.from(
                            document.querySelectorAll(
                                "#cashDropTables .cash-drop-input"
                            )
                        );


                    const newInput =
                        newInputs[
                            nextIndex
                        ];


                    if (newInput) {

                        newInput.focus();

                        newInput.select();

                    }

                }
            );

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

    if (
        drop < sales
    ) {

        return "drop-low";

    }

    if (
        drop > sales
    ) {

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
            match[1].padStart(
                2,
                "0"
            ) +
            "/" +
            match[2].padStart(
                2,
                "0"
            ) +
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
        ).padStart(
            2,
            "0"
        ) +
        "/" +
        String(
            parsed.getDate()
        ).padStart(
            2,
            "0"
        ) +
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
