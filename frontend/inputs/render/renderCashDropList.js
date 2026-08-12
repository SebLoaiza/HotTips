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


    // =========================
    // BUILD ROW LIST
    // =========================

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
    // CREATE TABLE
    // =========================

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


                if (comparison === 0) {

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


                if (comparison === 0) {

                    comparison =
                        String(
                            a.employee.name || ""
                        ).localeCompare(
                            String(
                                b.employee.name || ""
                            )
                        );

                }

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

                else {

                    sortState.column =
                        header.column;

                    sortState.direction =
                        "asc";

                }


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


    // =========================
    // TOTALS
    // =========================

    let totalCashDrop = 0;

    let totalCashSales = 0;


    // =========================
    // EMPLOYEE ROWS
    // =========================

    sortedRows.forEach(
        (rowData, index) => {

            const employee =
                rowData.employee;


            totalCashDrop +=
                Number(
                    employee.cash_drop
                ) || 0;


            totalCashSales +=
                Number(
                    employee.cash_sales
                ) || 0;


            tbody.appendChild(
                createRow(
                    rowData,
                    index,
                    refreshUI
                )
            );

        }
    );


    // =========================
    // UPDATE TIP TOTALS
    // =========================

    updateTipTotals(
        mealBlocks
    );


    // =========================
    // TOTAL ROW
    // =========================

    const totalRow =
        document.createElement(
            "tr"
        );


    totalRow.className =
        "cash-drop-total-row";


    const totalLabelCell =
        document.createElement(
            "th"
        );


    totalLabelCell.textContent =
        "TOTAL";


    totalLabelCell.colSpan = 4;


    totalRow.appendChild(
        totalLabelCell
    );


    // =========================
    // CASH DROP TOTAL
    // =========================

    const totalDropCell =
        document.createElement(
            "th"
        );


    totalDropCell.textContent =
        money(
            totalCashDrop
        );


    totalRow.appendChild(
        totalDropCell
    );


    // =========================
    // CASH SALES TOTAL
    // =========================

    const totalSalesCell =
        document.createElement(
            "th"
        );


    totalSalesCell.textContent =
        money(
            totalCashSales
        );


    totalRow.appendChild(
        totalSalesCell
    );


    tbody.appendChild(
        totalRow
    );


    table.appendChild(
        tbody
    );


    return table;

}


// =========================
// UPDATE TIP TOTALS
// =========================
//
// Cash Tips:
//
//     ALL CASH DROP
//          -
//     ALL CASH SALES
//          =
//     TOTAL CASH TIPS
//
// This uses every employee
// in every meal block.
//

function updateTipTotals(
    mealBlocks
) {

    let totalCashDrop = 0;

    let totalCashSales = 0;


    // =========================
    // COMBINE EVERY EMPLOYEE
    // =========================

    for (
        const block
        of mealBlocks
    ) {

        for (
            const employee
            of block.employees
        ) {

            // -------------------------
            // CASH DROP
            // -------------------------

            totalCashDrop +=
                Number(
                    employee.cash_drop
                ) || 0;


            // -------------------------
            // CASH SALES
            // -------------------------

            totalCashSales +=
                Number(
                    employee.cash_sales
                ) || 0;

        }

    }


    // =========================
    // CALCULATE CASH TIPS
    // =========================

    const totalCashTips =
        totalCashDrop -
        totalCashSales;


    // =========================
    // DISPLAY CASH DROP
    // =========================

    const cashDropElement =
        document.getElementById(
            "totalCashDrop"
        );


    if (cashDropElement) {

        cashDropElement.textContent =
            money(
                totalCashDrop
            );

    }


    // =========================
    // DISPLAY CASH SALES
    // =========================

    const cashSalesElement =
        document.getElementById(
            "totalCashSales"
        );


    if (cashSalesElement) {

        cashSalesElement.textContent =
            money(
                totalCashSales
            );

    }


    // =========================
    // DISPLAY CASH TIPS
    // =========================

    const cashTipsElement =
        document.getElementById(
            "totalCashTips"
        );


    if (cashTipsElement) {

        cashTipsElement.textContent =
            money(
                totalCashTips
            );

    }


    // =========================
    // CREDIT CARD TIPS
    // =========================

    let totalCreditCardTips = 0;


    for (
        const block
        of mealBlocks
    ) {

        const blockCardTips =
            firstNumber(

                block.credit_card_tips,

                block.credit_card_tip,

                block.card_tips,

                block.card_tip,

                block.creditCardTips,

                block.cardTips

            );


        // -------------------------
        // BLOCK LEVEL
        // -------------------------

        if (
            blockCardTips !== null
        ) {

            totalCreditCardTips +=
                blockCardTips;

            continue;

        }


        // -------------------------
        // EMPLOYEE LEVEL
        // -------------------------

        for (
            const employee
            of block.employees
        ) {

            const employeeCardTips =
                firstNumber(

                    employee.credit_card_tips,

                    employee.credit_card_tip,

                    employee.card_tips,

                    employee.card_tip,

                    employee.creditCardTips,

                    employee.cardTips

                );


            if (
                employeeCardTips !== null
            ) {

                totalCreditCardTips +=
                    employeeCardTips;

            }

        }

    }


    // =========================
    // DISPLAY CREDIT CARD TIPS
    // =========================

    const creditCardTipsElement =
        document.getElementById(
            "totalCreditCardTips"
        );


    if (
        creditCardTipsElement
    ) {

        creditCardTipsElement.textContent =
            money(
                totalCreditCardTips
            );

    }

}


// =========================
// FIND FIRST NUMBER
// =========================

function firstNumber(
    ...values
) {

    for (
        const value
        of values
    ) {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            const number =
                Number(
                    value
                );


            if (
                Number.isFinite(
                    number
                )
            ) {

                return number;

            }

        }

    }


    return null;

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
            (
                Number(
                    employee.cash_drop
                ) || 0
            ) / 100
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


    // =========================
    // COLOR
    // =========================

    updateColor(
        input,
        employee
    );


    // =========================
    // SELECT ALL + HIGHLIGHT
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
            // FIND INPUTS
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
            // DIRECTION
            // =========================

            const nextIndex =
                event.shiftKey

                    ? currentIndex - 1

                    : currentIndex + 1;


            // =========================
            // TABLE EDGE
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
            // REFRESH
            // =========================

            if (refreshUI) {

                refreshUI();

            }


            // =========================
            // FIND NEW INPUT
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


// =========================
// DROP COLOR
// =========================

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

function formatDate(
    date
) {

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
            )

            +

            "/"

            +

            match[2].padStart(
                2,
                "0"
            )

            +

            "/"

            +

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
        )

        +

        "/"

        +

        String(
            parsed.getDate()
        ).padStart(
            2,
            "0"
        )

        +

        "/"

        +

        parsed.getFullYear()

    );

}


// =========================
// MONEY
// =========================

function money(
    cents
) {

    return `$${(
        (Number(cents) || 0) /
        100
    ).toFixed(2)}`;

}