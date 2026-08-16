export function renderCashDropList(
    mealBlocks,
    refreshUI
) {

    const output =
        document.getElementById(
            "cashDropTables"
        );

    const controlsOutput =
        document.getElementById(
            "cashDropControls"
        );

    if (!output) {
        return;
    }

    output.innerHTML = "";

    if (controlsOutput) {
        controlsOutput.innerHTML = "";
    }


    // =================================================
    // INITIALIZE SORT STATE
    // =================================================

    if (!renderCashDropList.sortState) {

        renderCashDropList.sortState = {

            column: "date",

            direction: "asc"

        };

    }


    // =================================================
    // INITIALIZE SECTION STATE
    // =================================================
    //
    // This survives renderCashDropList() calls.
    //
    // That means:
    //
    // - sorting does not reopen sections
    // - refreshUI does not reopen sections
    // - saving/loading does not reopen sections
    //
    // =================================================

    if (!renderCashDropList.sectionState) {

        renderCashDropList.sectionState = {

            cashSales: true,

            allEmployees: false

        };

    }


    // =================================================
    // BUILD ROW LIST
    // =================================================

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


    // =================================================
    // CONTROLS
    // =================================================

    const controls =
        document.createElement(
            "div"
        );

    controls.className =
        "cash-drop-controls";


    // =================================================
    // SAVE BUTTON
    // =================================================

    const downloadButton =
        document.createElement(
            "button"
        );

    downloadButton.type =
        "button";

    downloadButton.className =
        "cash-drop-button cash-drop-download-button";

    downloadButton.textContent =
        "Save Cash Drops";

    downloadButton.addEventListener(
        "click",
        () => {

            downloadCashDrops(
                mealBlocks
            );

        }
    );


    // =================================================
    // LOAD BUTTON
    // =================================================

    const uploadButton =
        document.createElement(
            "button"
        );

    uploadButton.type =
        "button";

    uploadButton.className =
        "cash-drop-button cash-drop-upload-button";

    uploadButton.textContent =
        "Load Pre-Saved Cash Drops";


    // =================================================
    // FILE INPUT
    // =================================================

    const fileInput =
        document.createElement(
            "input"
        );

    fileInput.type =
        "file";

    fileInput.accept =
        ".json,application/json";

    fileInput.className =
        "cash-drop-file-input";

    fileInput.hidden =
        true;


    // =================================================
    // LOAD BUTTON CLICK
    // =================================================

    uploadButton.addEventListener(
        "click",
        () => {

            fileInput.click();

        }
    );


    // =================================================
    // FILE CHANGE
    // =================================================

    fileInput.addEventListener(
        "change",
        async () => {

            const file =
                fileInput.files?.[0];

            if (!file) {
                return;
            }

            try {

                await uploadCashDrops(
                    file,
                    mealBlocks
                );


                renderCashDropList(
                    mealBlocks,
                    refreshUI
                );


                if (refreshUI) {
                    refreshUI();
                }


                alert(
                    "Cash drops loaded successfully."
                );

            }
            catch (error) {

                console.error(
                    "Failed to load cash drops:",
                    error
                );


                alert(
                    "Could not load the cash drops file."
                );

            }


            fileInput.value = "";

        }
    );


    // =================================================
    // ADD CONTROLS
    // =================================================

    controls.appendChild(
        downloadButton
    );

    controls.appendChild(
        uploadButton
    );

    controls.appendChild(
        fileInput
    );


    if (controlsOutput) {

        controlsOutput.appendChild(
            controls
        );

    }


    // =================================================
    // CREATE SECTIONS
    // =================================================

    output.appendChild(
        createCashDropSections(
            rows,
            mealBlocks,
            refreshUI
        )
    );

}


// =================================================
// BOH FILTER
// =================================================

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


// =================================================
// CREATE CASH DROP SECTIONS
// =================================================

function createCashDropSections(
    rows,
    mealBlocks,
    refreshUI
) {

    const container =
        document.createElement(
            "div"
        );

    container.className =
        "cash-drop-sections";


    // =================================================
    // FIND EMPLOYEES WITH CASH SALES
    // =================================================

    const salesRows =
        rows.filter(
            row =>
                (
                    Number(
                        row.employee.cash_sales
                    ) || 0
                ) > 0
        );


    // =================================================
    // CASH SALES SECTION
    // =================================================

    const salesSection =
        createCollapsibleSection(
            "Cash Sales",
            salesRows,
            mealBlocks,
            refreshUI,
            renderCashDropList.sectionState.cashSales,
            "cashSales",
            "cash-drop-sales-section"
        );


    container.appendChild(
        salesSection
    );


    // =================================================
    // ALL EMPLOYEES SECTION
    // =================================================

    const allSection =
        createCollapsibleSection(
            "All Employees",
            rows,
            mealBlocks,
            refreshUI,
            renderCashDropList.sectionState.allEmployees,
            "allEmployees",
            "cash-drop-all-section"
        );


    container.appendChild(
        allSection
    );


    return container;

}


// =================================================
// CREATE COLLAPSIBLE SECTION
// =================================================

function createCollapsibleSection(
    title,
    rows,
    mealBlocks,
    refreshUI,
    expanded,
    stateKey,
    className
) {

    const section =
        document.createElement(
            "section"
        );

    section.className =
        `cash-drop-collapsible-section ${className}`;


    // =================================================
    // HEADER
    // =================================================

    const header =
        document.createElement(
            "button"
        );

    header.type =
        "button";

    header.className =
        "cash-drop-section-header";

    header.setAttribute(
        "aria-expanded",
        expanded
            ? "true"
            : "false"
    );


    // =================================================
    // LEFT SIDE
    // =================================================

    const titleContainer =
        document.createElement(
            "div"
        );

    titleContainer.className =
        "cash-drop-section-title";


    const titleText =
        document.createElement(
            "span"
        );

    titleText.className =
        "cash-drop-section-title-text";

    titleText.textContent =
        title;


    const count =
        document.createElement(
            "span"
        );

    count.className =
        "cash-drop-section-count";

    count.textContent =
        rows.length;


    titleContainer.appendChild(
        titleText
    );

    titleContainer.appendChild(
        count
    );


    // =================================================
    // RIGHT SIDE
    // =================================================

    const arrow =
        document.createElement(
            "span"
        );

    arrow.className =
        "cash-drop-section-arrow";

    arrow.setAttribute(
        "aria-hidden",
        "true"
    );


    // =================================================
    // UPDATE HEADER VISUAL
    // =================================================

    function updateHeader() {

        const isOpen =
            renderCashDropList.sectionState[
                stateKey
            ];


        header.setAttribute(
            "aria-expanded",
            isOpen
                ? "true"
                : "false"
        );

        section.classList.toggle(
            "is-collapsed",
            !isOpen
        );

    }


    header.appendChild(
        titleContainer
    );

    header.appendChild(
        arrow
    );


    // =================================================
    // CONTENT
    // =================================================

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "cash-drop-section-content";


    // =================================================
    // INITIAL STATE
    // =================================================

    if (!expanded) {

        content.hidden =
            true;

    }


    // =================================================
    // TABLE
    // =================================================

    if (rows.length > 0) {

        content.appendChild(
            createTable(
                rows,
                mealBlocks,
                refreshUI
            )
        );

    }
    else {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "cash-drop-empty";

        empty.textContent =
            "No employees in this section.";

        content.appendChild(
            empty
        );

    }


    // =================================================
    // TOGGLE
    // =================================================

    header.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            const currentState =
                renderCashDropList.sectionState[
                    stateKey
                ];


            renderCashDropList.sectionState[
                stateKey
            ] =
                !currentState;


            const isOpen =
                renderCashDropList.sectionState[
                    stateKey
                ];


            content.hidden =
                !isOpen;


            updateHeader();

        }
    );


    // =================================================
    // ADD ELEMENTS
    // =================================================

    section.appendChild(
        header
    );

    section.appendChild(
        content
    );


    // Set initial arrow
    updateHeader();


    return section;

}


// =================================================
// CREATE TABLE
// =================================================

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


    // =================================================
    // MEAL ORDER
    // =================================================

    const mealOrder = {

        Breakfast: 0,

        Lunch: 1,

        Dinner: 2

    };


    // =================================================
    // SORT STATE
    // =================================================

    const sortState =
        renderCashDropList.sortState;


    const sortedRows =
        [...rows];


    // =================================================
    // SORT ROWS
    // =================================================

    sortedRows.sort(
        (a, b) => {

            let comparison = 0;


            if (
                sortState.column ===
                "date"
            ) {

                const dateA =
                    getBlockDateValue(
                        a.block
                    );

                const dateB =
                    getBlockDateValue(
                        b.block
                    );


                comparison =
                    dateA.localeCompare(
                        dateB
                    );


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


                if (comparison === 0) {

                    comparison =
                        getBlockDateValue(
                            a.block
                        ).localeCompare(
                            getBlockDateValue(
                                b.block
                            )
                        );

                }

            }


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


            return (
                sortState.direction ===
                "asc"

                    ? comparison

                    : -comparison
            );

        }
    );


    // =================================================
    // HEADERS
    // =================================================

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

        th.className =
            "sortable-header";


        const label =
            document.createElement(
                "span"
            );

        label.className =
            "cash-drop-sort-label";

        label.textContent =
            header.label;


        const indicator =
            document.createElement(
                "span"
            );

        indicator.className =
            "cash-drop-sort-indicator";


        if (
            sortState.column ===
            header.column
        ) {

            indicator.textContent =
                sortState.direction ===
                "asc"
                    ? "▲"
                    : "▼";

        }


        th.appendChild(
            label
        );

        th.appendChild(
            indicator
        );


        th.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


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


    // =================================================
    // BODY
    // =================================================

    const tbody =
        document.createElement(
            "tbody"
        );


    let totalCashDrop = 0;

    let totalCashSales = 0;


    // =================================================
    // ROWS
    // =================================================

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


    // =================================================
    // UPDATE TOTALS
    // =================================================

    updateTipTotals(
        mealBlocks
    );


    // =================================================
    // TOTAL ROW
    // =================================================

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

    totalLabelCell.colSpan =
        4;


    totalRow.appendChild(
        totalLabelCell
    );


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


// =================================================
// GET BLOCK DATE VALUE
// =================================================

function getBlockDateValue(
    block
) {

    if (block.day_key) {

        return String(
            block.day_key
        ).trim();

    }


    if (block.date) {

        const value =
            String(
                block.date
            ).trim();


        const isoMatch =
            value.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );


        if (isoMatch) {

            return value;

        }


        const usMatch =
            value.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
            );


        if (usMatch) {

            return (
                usMatch[3] +
                "-" +
                usMatch[1].padStart(
                    2,
                    "0"
                ) +
                "-" +
                usMatch[2].padStart(
                    2,
                    "0"
                )
            );

        }

    }


    return "";

}


// =================================================
// UPDATE TIP TOTALS
// =================================================

function updateTipTotals(
    mealBlocks
) {

    let totalCashDrop = 0;

    let totalCashSales = 0;


    for (
        const block
        of mealBlocks
    ) {

        for (
            const employee
            of block.employees
        ) {

            totalCashDrop +=
                Number(
                    employee.cash_drop
                ) || 0;

            totalCashSales +=
                Number(
                    employee.cash_sales
                ) || 0;

        }

    }


    const totalCashTips =
        totalCashDrop -
        totalCashSales;


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


    // =================================================
    // CREDIT CARD TIPS
    // =================================================

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


        if (
            blockCardTips !== null
        ) {

            totalCreditCardTips +=
                blockCardTips;

            continue;

        }


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


// =================================================
// FIND FIRST NUMBER
// =================================================

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


// =================================================
// CREATE ROW
// =================================================

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


    // =================================================
    // DATE
    // =================================================

    addCell(
        row,
        "cash-drop-date",
        formatDate(
            block.date ||
            block.day_key
        )
    );


    // =================================================
    // MEAL
    // =================================================

    addCell(
        row,
        "cash-drop-meal",
        block.meal
    );


    // =================================================
    // EMPLOYEE
    // =================================================

    addCell(
        row,
        "cash-drop-employee",
        employee.name
    );


    // =================================================
    // ROLE
    // =================================================

    addCell(
        row,
        "cash-drop-role",
        employee.role || ""
    );


    // =================================================
    // CASH DROP
    // =================================================

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


    // =================================================
    // CASH SALES
    // =================================================

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


    // =================================================
    // FOCUS
    // =================================================

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


    // =================================================
    // LIVE INPUT
    // =================================================

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


    // =================================================
    // SAVE
    // =================================================

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


    // =================================================
    // ENTER NAVIGATION
    // =================================================

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


            saveCashDrop(
                employee,
                input
            );


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


            const nextIndex =
                event.shiftKey
                    ? currentIndex - 1
                    : currentIndex + 1;


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


            if (refreshUI) {
                refreshUI();
            }


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


// =================================================
// ADD CELL
// =================================================

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


// =================================================
// UPDATE COLOR
// =================================================

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


// =================================================
// DROP COLOR
// =================================================

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


// =================================================
// SAVE CASH DROP
// =================================================

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


// =================================================
// DOWNLOAD CASH DROPS
// =================================================

function downloadCashDrops(
    mealBlocks
) {

    const cashDrops = [];


    for (
        const block
        of mealBlocks
    ) {

        for (
            const employee
            of block.employees
        ) {

            if (
                isBOH(
                    employee.role
                )
            ) {

                continue;

            }


            const cashDrop =
                Number(
                    employee.cash_drop
                );


            if (
                !Number.isFinite(
                    cashDrop
                ) ||
                cashDrop <= 0
            ) {

                continue;

            }


            cashDrops.push({

                employee:
                    String(
                        employee.employee_id
                    ),

                cash:
                    Math.round(
                        cashDrop
                    ),

                day:
                    getBlockDay(
                        block
                    ),

                meal:
                    String(
                        block.meal || ""
                    )

            });

        }

    }


    const data = {

        hotTipsCashDropsVersion:
            1,

        savedAt:
            new Date().toISOString(),

        cashDrops

    };


    const json =
        JSON.stringify(
            data,
            null,
            4
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    const now =
        new Date();


    const date =
        `${String(
            now.getMonth() + 1
        ).padStart(2, "0")}-` +

        `${String(
            now.getDate()
        ).padStart(2, "0")}-` +

        `${now.getFullYear()}`;


    link.href =
        url;


    link.download =
        `HotTips Cash Drops - ${date}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// =================================================
// UPLOAD CASH DROPS
// =================================================

function uploadCashDrops(
    file,
    mealBlocks
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    try {

                        const data =
                            JSON.parse(
                                reader.result
                            );


                        if (
                            !data ||
                            !Array.isArray(
                                data.cashDrops
                            )
                        ) {

                            throw new Error(
                                "Invalid HotTips cash drops file."
                            );

                        }


                        for (
                            const savedDrop
                            of data.cashDrops
                        ) {

                            const savedEmployee =
                                String(
                                    savedDrop.employee
                                );


                            const savedDay =
                                String(
                                    savedDrop.day
                                );


                            const savedMeal =
                                String(
                                    savedDrop.meal
                                );


                            const savedCash =
                                Number(
                                    savedDrop.cash
                                );


                            if (
                                !Number.isFinite(
                                    savedCash
                                )
                            ) {

                                continue;

                            }


                            for (
                                const block
                                of mealBlocks
                            ) {

                                const blockDay =
                                    getBlockDay(
                                        block
                                    );


                                if (
                                    blockDay !==
                                    savedDay
                                ) {

                                    continue;

                                }


                                if (
                                    String(
                                        block.meal || ""
                                    ) !==
                                    savedMeal
                                ) {

                                    continue;

                                }


                                for (
                                    const employee
                                    of block.employees
                                ) {

                                    const employeeId =
                                        String(
                                            employee.employee_id
                                        );


                                    if (
                                        employeeId !==
                                        savedEmployee
                                    ) {

                                        continue;

                                    }


                                    const existing =
                                        Number(
                                            employee.cash_drop
                                        );


                                    if (
                                        !Number.isFinite(
                                            existing
                                        ) ||
                                        existing === 0
                                    ) {

                                        employee.cash_drop =
                                            Math.round(
                                                savedCash
                                            );

                                    }

                                }

                            }

                        }


                        resolve(
                            data
                        );

                    }
                    catch (error) {

                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                () => {

                    reject(
                        reader.error
                    );

                };


            reader.readAsText(
                file
            );

        }
    );

}


// =================================================
// GET BLOCK DAY
// =================================================

function getBlockDay(
    block
) {

    if (
        block.day_key
    ) {

        return String(
            block.day_key
        ).trim();

    }


    if (
        block.date
    ) {

        const value =
            String(
                block.date
            ).trim();


        const isoMatch =
            value.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );


        if (isoMatch) {

            return value;

        }


        const usMatch =
            value.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
            );


        if (usMatch) {

            return (
                usMatch[3] +
                "-" +
                usMatch[1].padStart(
                    2,
                    "0"
                ) +
                "-" +
                usMatch[2].padStart(
                    2,
                    "0"
                )
            );

        }


        const parsed =
            new Date(
                value
            );


        if (
            !Number.isNaN(
                parsed.getTime()
            )
        ) {

            return (
                String(
                    parsed.getFullYear()
                ) +
                "-" +
                String(
                    parsed.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                ) +
                "-" +
                String(
                    parsed.getDate()
                ).padStart(
                    2,
                    "0"
                )
            );

        }

    }


    return "";

}


// =================================================
// FORMAT DATE
// =================================================

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


    const isoMatch =
        value.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (isoMatch) {

        return (
            isoMatch[2] +
            "/" +
            isoMatch[3] +
            "/" +
            isoMatch[1]
        );

    }


    const usMatch =
        value.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (usMatch) {

        return (
            usMatch[1].padStart(
                2,
                "0"
            ) +
            "/" +
            usMatch[2].padStart(
                2,
                "0"
            ) +
            "/" +
            usMatch[3]
        );

    }


    const parsed =
        new Date(
            value
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


// =================================================
// MONEY
// =================================================

function money(
    cents
) {

    return `$${(
        (Number(cents) || 0) /
        100
    ).toFixed(2)}`;

}