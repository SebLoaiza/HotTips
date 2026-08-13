import {
    formatMoney,
    formatNumber
} from "../utils/formatters.js";

// =================================
// RENDER ANALYTICS
// =================================

export function renderAnalytics(employees) {

    const container =
        document.createElement("div");

    container.className =
        "analytics-content";

    // =================================
    // SHARED CALCULATIONS
    // =================================

    function originalTips(employee) {

        return (
            Number(
                employee.original_tips
            ) || 0
        );
    }

    function tipPercentage(employee) {

        const tips =
            originalTips(employee);

        const totalSales =
            Number(
                employee.total_sales
            ) || 0;

        if (totalSales <= 0) {

            return 0;
        }

        return (
            tips /
            totalSales
        ) * 100;
    }

    function tipsPerHour(employee) {

        const hours =
            Number(
                employee.hours
            ) || 0;

        if (hours <= 0) {

            return 0;
        }

        return (
            originalTips(employee) /
            hours
        );
    }

    // =================================
    // TITLE
    // =================================

    const title =
        document.createElement("h2");

    title.textContent =
        "Employee Performance";

    container.appendChild(
        title
    );

    // =================================
    // TABLE CONFIGURATION
    // =================================

    const tables = [

        {
            title:
                "Top Sales",

            valueKey:
                "totalSales",

            valueLabel:
                "Total Sales",

            format:
                value =>
                    formatMoney(value),

            getValue:
                employee =>
                    Number(
                        employee.total_sales
                    ) || 0
        },

        {
            title:
                "Top Tip %",

            valueKey:
                "tipPercentage",

            valueLabel:
                "Tip %",

            format:
                value =>
                    `${formatNumber(value)}%`,

            getValue:
                employee =>
                    tipPercentage(employee)
        },

        {
            title:
                "Top Tips / Hour",

            valueKey:
                "tipsPerHour",

            valueLabel:
                "Tips / Hour",

            format:
                value =>
                    formatMoney(value),

            getValue:
                employee =>
                    tipsPerHour(employee)
        }

    ];

    // =================================
    // CREATE TABLES
    // =================================

    tables.forEach(
        tableConfig => {

            // =================================
            // SORT STATE
            // =================================

            let sortColumn =
                tableConfig.valueKey;

            let sortDirection =
                "desc";

            // =================================
            // TABLE SECTION
            // =================================

            const section =
                document.createElement("div");

            section.className =
                "analytics-table-section";

            // =================================
            // TABLE TITLE
            // =================================

            const tableTitle =
                document.createElement("h3");

            tableTitle.textContent =
                tableConfig.title;

            section.appendChild(
                tableTitle
            );

            // =================================
            // TABLE WRAPPER
            // =================================

            const tableWrapper =
                document.createElement("div");

            tableWrapper.className =
                "analytics-table-wrapper";

            // =================================
            // TABLE
            // =================================

            const table =
                document.createElement("table");

            table.className =
                "analytics-table";

            // =================================
            // TABLE HEADER
            // =================================

            const thead =
                document.createElement("thead");

            const headerRow =
                document.createElement("tr");

            // =================================
            // SORT HEADER CREATOR
            // =================================

            function createHeader(
                label,
                columnKey
            ) {

                const header =
                    document.createElement("th");

                const button =
                    document.createElement("button");

                button.type =
                    "button";

                button.className =
                    "analytics-sort-button";

                // =================================
                // HEADER LABEL
                // =================================

                const labelSpan =
                    document.createElement("span");

                labelSpan.textContent =
                    label;

                // =================================
                // SORT ARROW
                // =================================

                const arrow =
                    document.createElement("span");

                arrow.className =
                    "analytics-sort-arrow";

                // =================================
                // UPDATE HEADER
                // =================================

                function updateHeader() {

                    const isActive =
                        sortColumn === columnKey;

                    if (!isActive) {

                        arrow.textContent =
                            "↑";

                        arrow.classList.add(
                            "inactive"
                        );

                        button.setAttribute(
                            "aria-sort",
                            "none"
                        );

                        return;
                    }

                    arrow.classList.remove(
                        "inactive"
                    );

                    if (
                        sortDirection ===
                        "asc"
                    ) {

                        arrow.textContent =
                            "↑";

                        button.setAttribute(
                            "aria-sort",
                            "ascending"
                        );

                    } else {

                        arrow.textContent =
                            "↓";

                        button.setAttribute(
                            "aria-sort",
                            "descending"
                        );
                    }
                }

                // =================================
                // SORT CLICK
                // =================================

                button.addEventListener(
                    "click",
                    () => {

                        if (
                            sortColumn ===
                            columnKey
                        ) {

                            sortDirection =
                                sortDirection ===
                                "asc"
                                    ? "desc"
                                    : "asc";

                        } else {

                            sortColumn =
                                columnKey;

                            sortDirection =
                                "asc";
                        }

                        updateHeader();

                        renderBody();
                    }
                );

                button.appendChild(
                    labelSpan
                );

                button.appendChild(
                    arrow
                );

                header.appendChild(
                    button
                );

                updateHeader();

                return header;
            }

            // =================================
            // RANK HEADER
            // =================================

            const rankHeader =
                createHeader(
                    "Rank",
                    "rank"
                );

            rankHeader.className =
                "analytics-rank-column";

            // =================================
            // EMPLOYEE HEADER
            // =================================

            const employeeHeader =
                createHeader(
                    "Employee",
                    "employee"
                );

            // =================================
            // VALUE HEADER
            // =================================

            const valueHeader =
                createHeader(
                    tableConfig.valueLabel,
                    tableConfig.valueKey
                );

            // =================================
            // ADD HEADERS
            // =================================

            headerRow.appendChild(
                rankHeader
            );

            headerRow.appendChild(
                employeeHeader
            );

            headerRow.appendChild(
                valueHeader
            );

            thead.appendChild(
                headerRow
            );

            table.appendChild(
                thead
            );

            // =================================
            // TABLE BODY
            // =================================

            const tbody =
                document.createElement("tbody");

            // =================================
            // RENDER TABLE BODY
            // =================================

            function renderBody() {

                // Remove existing rows
                tbody.replaceChildren();

                // =================================
                // CREATE PERMANENT RANKINGS
                // =================================

                /*
                    Rank is based on the table's
                    primary metric.

                    Highest metric = Rank 1.

                    The rank stays attached to
                    the employee even when the
                    table is sorted differently.
                */

                const rankedEmployees =
                    [...employees]
                        .sort(
                            (a, b) => {

                                const valueA =
                                    tableConfig.getValue(
                                        a
                                    );

                                const valueB =
                                    tableConfig.getValue(
                                        b
                                    );

                                return (
                                    valueB -
                                    valueA
                                );
                            }
                        )
                        .map(
                            (employee, index) => {

                                return {
                                    employee,
                                    rank:
                                        index + 1
                                };
                            }
                        );

                // =================================
                // SORT DISPLAY ORDER
                // =================================

                const sortedEmployees =
                    [...rankedEmployees].sort(
                        (a, b) => {

                            // =================================
                            // SORT BY RANK
                            // =================================

                            if (
                                sortColumn ===
                                "rank"
                            ) {

                                return (
                                    sortDirection ===
                                    "asc"
                                )
                                    ? a.rank - b.rank
                                    : b.rank - a.rank;
                            }

                            // =================================
                            // SORT BY EMPLOYEE
                            // =================================

                            if (
                                sortColumn ===
                                "employee"
                            ) {

                                const nameA =
                                    String(
                                        a.employee.name ?? ""
                                    ).toLowerCase();

                                const nameB =
                                    String(
                                        b.employee.name ?? ""
                                    ).toLowerCase();

                                const comparison =
                                    nameA.localeCompare(
                                        nameB
                                    );

                                return (
                                    sortDirection ===
                                    "asc"
                                )
                                    ? comparison
                                    : -comparison;
                            }

                            // =================================
                            // SORT BY METRIC
                            // =================================

                            const valueA =
                                tableConfig.getValue(
                                    a.employee
                                );

                            const valueB =
                                tableConfig.getValue(
                                    b.employee
                                );

                            if (
                                sortDirection ===
                                "asc"
                            ) {

                                return (
                                    valueA -
                                    valueB
                                );
                            }

                            return (
                                valueB -
                                valueA
                            );
                        }
                    );

                // =================================
                // CREATE ROWS
                // =================================

                sortedEmployees.forEach(
                    ({
                        employee,
                        rank
                    }) => {

                        const value =
                            tableConfig.getValue(
                                employee
                            );

                        const row =
                            document.createElement("tr");

                        // =================================
                        // RANK CELL
                        // =================================

                        const rankCell =
                            document.createElement("td");

                        rankCell.textContent =
                            String(rank);

                        rankCell.className =
                            "analytics-rank-column";

                        // =================================
                        // EMPLOYEE CELL
                        // =================================

                        const employeeCell =
                            document.createElement("td");

                        employeeCell.textContent =
                            employee.name ?? "";

                        // =================================
                        // VALUE CELL
                        // =================================

                        const valueCell =
                            document.createElement("td");

                        valueCell.textContent =
                            tableConfig.format(
                                value
                            );

                        // =================================
                        // ADD CELLS
                        // =================================

                        row.appendChild(
                            rankCell
                        );

                        row.appendChild(
                            employeeCell
                        );

                        row.appendChild(
                            valueCell
                        );

                        tbody.appendChild(
                            row
                        );
                    }
                );
            }

            // =================================
            // INITIAL BODY
            // =================================

            renderBody();

            table.appendChild(
                tbody
            );

            // =================================
            // ADD TABLE
            // =================================

            tableWrapper.appendChild(
                table
            );

            section.appendChild(
                tableWrapper
            );

            container.appendChild(
                section
            );

            // =================================
            // STICKY HEADER SCROLL HANDLER
            // =================================

            function updateStickyHeader() {

                const tableRect =
                    table.getBoundingClientRect();

                const headerRect =
                    thead.getBoundingClientRect();

                /*
                    When the table's top has moved
                    above the viewport, add the
                    sticky-active class.

                    This does not affect the table
                    rendering or sorting.
                */

                const isSticky =
                    tableRect.top < 0 &&
                    headerRect.top <= 1;

                thead.classList.toggle(
                    "sticky-active",
                    isSticky
                );
            }

            window.addEventListener(
                "scroll",
                updateStickyHeader,
                {
                    passive: true
                }
            );

            updateStickyHeader();
        }
    );

    // =================================
    // RETURN ANALYTICS
    // =================================

    return container;
}