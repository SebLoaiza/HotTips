import {
    formatMoney
} from "./formatters.js";


export function renderResultsTable(
    employees,
    clickHandler
) {


    let currentSort = {
        key: "name",
        direction: "asc"
    };


    const table =
        document.createElement(
            "table"
        );


    table.innerHTML = `


        <thead>


            <tr>


                <th data-sort="name">
                    Employee
                </th>


                <th data-sort="cash">
                    Cash
                </th>


                <th data-sort="card">
                    Card
                </th>


                <th data-sort="total">
                    Total
                </th>


            </tr>


        </thead>


        <tbody></tbody>


        <tfoot>


            <tr class="resultsTotalsRow">


                <th>
                    Total
                </th>


                <th class="resultsCashTotal">
                    $0.00
                </th>


                <th class="resultsCardTotal">
                    $0.00
                </th>


                <th class="resultsGrandTotal">
                    $0.00
                </th>


            </tr>


        </tfoot>


    `;


    const body =
        table.querySelector(
            "tbody"
        );


    const cashTotalCell =
        table.querySelector(
            ".resultsCashTotal"
        );


    const cardTotalCell =
        table.querySelector(
            ".resultsCardTotal"
        );


    const grandTotalCell =
        table.querySelector(
            ".resultsGrandTotal"
        );


    // =========================
    // CASH
    // KEPT + POOL
    // =========================

    function roundedCash(
        employee
    ) {


        const kept =
            employee.cash_kept ?? 0;


        const pool =
            employee.pool_cash ?? 0;


        const cash =
            kept + pool;


        return (
            Math.round(
                cash / 100
            ) * 100
        );


    }


    // =========================
    // CARD
    // KEPT + POOL
    // =========================

    function cardAmount(
        employee
    ) {


        const kept =
            employee.card_kept ?? 0;


        const pool =
            employee.pool_card ?? 0;


        return (
            kept + pool
        );


    }


    // =========================
    // TOTAL
    // CASH + CARD
    // =========================

    function totalAmount(
        employee
    ) {


        return (
            roundedCash(employee)
            +
            cardAmount(employee)
        );


    }


    // =========================
    // UPDATE TOTALS
    // =========================

    function renderTotals() {


        let cashTotal = 0;


        let cardTotal = 0;


        for (
            const employee
            of employees
        ) {


            cashTotal +=
                roundedCash(
                    employee
                );


            cardTotal +=
                cardAmount(
                    employee
                );


        }


        const grandTotal =
            cashTotal +
            cardTotal;


        cashTotalCell.textContent =
            formatMoney(
                cashTotal
            );


        cardTotalCell.textContent =
            formatMoney(
                cardTotal
            );


        grandTotalCell.textContent =
            formatMoney(
                grandTotal
            );


    }


    // =========================
    // LAST NAME
    //
    // Names are formatted:
    // Last Name, First Name
    // =========================

    function lastName(
        employee
    ) {


        const name =
            String(
                employee.name ?? ""
            )
            .trim();


        // -------------------------
        // NORMAL FORMAT
        //
        // Last Name, First Name
        // -------------------------

        if (
            name.includes(",")
        ) {


            return (
                name
                    .split(",")[0]
                    .trim()
                    .toLowerCase()
            );


        }


        // -------------------------
        // FALLBACK
        //
        // Handles names without
        // a comma.
        // -------------------------

        const parts =
            name.split(/\s+/);


        return (
            parts.length > 0
                ?
                parts[
                    parts.length - 1
                ]
                    .toLowerCase()
                :
                ""
        );


    }


    // =========================
    // FIRST NAME
    //
    // Used as a tie breaker
    // when last names match.
    // =========================

    function firstName(
        employee
    ) {


        const name =
            String(
                employee.name ?? ""
            )
            .trim();


        // -------------------------
        // NORMAL FORMAT
        //
        // Last Name, First Name
        // -------------------------

        if (
            name.includes(",")
        ) {


            return (
                name
                    .split(",")
                    .slice(1)
                    .join(",")
                    .trim()
                    .toLowerCase()
            );


        }


        // -------------------------
        // FALLBACK
        // -------------------------

        const parts =
            name.split(/\s+/);


        return (
            parts.length > 0
                ?
                parts[0]
                    .toLowerCase()
                :
                ""
        );


    }


    // =========================
    // SORT
    // =========================

    function sortEmployees(
        key
    ) {


        const sorted =
            [
                ...employees
            ];


        sorted.sort(
            (a, b) => {


                let A;


                let B;


                // -------------------------
                // NAME
                // -------------------------

                if (
                    key === "name"
                ) {


                    const lastA =
                        lastName(a);


                    const lastB =
                        lastName(b);


                    // -------------------------
                    // SORT BY LAST NAME
                    // -------------------------

                    const lastResult =
                        lastA.localeCompare(
                            lastB
                        );


                    if (
                        lastResult !== 0
                    ) {


                        return (
                            currentSort.direction === "asc"
                                ?
                                lastResult
                                :
                                -lastResult
                        );


                    }


                    // -------------------------
                    // SAME LAST NAME
                    // SORT BY FIRST NAME
                    // -------------------------

                    const firstA =
                        firstName(a);


                    const firstB =
                        firstName(b);


                    const firstResult =
                        firstA.localeCompare(
                            firstB
                        );


                    if (
                        firstResult !== 0
                    ) {


                        return (
                            currentSort.direction === "asc"
                                ?
                                firstResult
                                :
                                -firstResult
                        );


                    }


                    // -------------------------
                    // FINAL TIE BREAKER
                    // FULL NAME
                    // -------------------------

                    A =
                        String(
                            a.name ?? ""
                        )
                        .toLowerCase();


                    B =
                        String(
                            b.name ?? ""
                        )
                        .toLowerCase();


                }


                // -------------------------
                // CASH
                // -------------------------

                else if (
                    key === "cash"
                ) {


                    A =
                        roundedCash(a);


                    B =
                        roundedCash(b);


                }


                // -------------------------
                // CARD
                // -------------------------

                else if (
                    key === "card"
                ) {


                    A =
                        cardAmount(a);


                    B =
                        cardAmount(b);


                }


                // -------------------------
                // TOTAL
                // -------------------------

                else if (
                    key === "total"
                ) {


                    A =
                        totalAmount(a);


                    B =
                        totalAmount(b);


                }


                // -------------------------
                // STRING SORT
                // -------------------------

                if (
                    typeof A === "string"
                ) {


                    return (
                        currentSort.direction === "asc"
                            ?
                            A.localeCompare(B)
                            :
                            B.localeCompare(A)
                    );


                }


                // -------------------------
                // NUMBER SORT
                // -------------------------

                return (
                    currentSort.direction === "asc"
                        ?
                        A - B
                        :
                        B - A
                );


            }
        );


        return sorted;


    }


    // =========================
    // RENDER ROWS
    // =========================

    function renderRows(
        list
    ) {


        body.innerHTML = "";


        for (
            const employee
            of list
        ) {


            // =========================
            // MAIN ROW
            // =========================

            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "resultsEmployeeRow";


            const cash =
                roundedCash(
                    employee
                );


            const card =
                cardAmount(
                    employee
                );


            const total =
                totalAmount(
                    employee
                );


            row.innerHTML = `


                <td class="resultsEmployeeCell">


                    <span
                        class="resultsExpandArrow"
                        aria-hidden="true"
                    >
                        ▸
                    </span>


                    <span class="resultsEmployeeName">
                        ${employee.name}
                    </span>


                </td>


                <td>
                    ${formatMoney(
                        cash
                    )}
                </td>


                <td>
                    ${formatMoney(
                        card
                    )}
                </td>


                <td>


                    <strong>
                        ${formatMoney(
                            total
                        )}
                    </strong>


                </td>


            `;


            // =========================
            // EXPANDED ROW
            // =========================

            const expandedRow =
                document.createElement(
                    "tr"
                );


            expandedRow.className =
                "resultsExpandedRow";


            expandedRow.style.display =
                "none";


            const expandedCell =
                document.createElement(
                    "td"
                );


            expandedCell.colSpan = 4;


            expandedCell.className =
                "resultsExpandedCell";


            expandedCell.innerHTML = `


                <div class="resultsExpandedContent">


                    <div class="resultsExpandedItem">


                        <span class="resultsExpandedLabel">
                            Cash Kept
                        </span>


                        <span class="resultsExpandedValue">
                            ${formatMoney(
                                employee.cash_kept ?? 0
                            )}
                        </span>


                    </div>


                    <div class="resultsExpandedItem">


                        <span class="resultsExpandedLabel">
                            Cash Pool
                        </span>


                        <span class="resultsExpandedValue">
                            ${formatMoney(
                                employee.pool_cash ?? 0
                            )}
                        </span>


                    </div>


                    <div class="resultsExpandedItem">


                        <span class="resultsExpandedLabel">
                            Card Kept
                        </span>


                        <span class="resultsExpandedValue">
                            ${formatMoney(
                                employee.card_kept ?? 0
                            )}
                        </span>


                    </div>


                    <div class="resultsExpandedItem">


                        <span class="resultsExpandedLabel">
                            Card Pool
                        </span>


                        <span class="resultsExpandedValue">
                            ${formatMoney(
                                employee.pool_card ?? 0
                            )}
                        </span>


                    </div>


                    <div class="resultsExpandedItem">


                        <span class="resultsExpandedLabel">
                            Cash Total
                        </span>


                        <span class="resultsExpandedValue">
                            ${formatMoney(
                                cash
                            )}
                        </span>


                    </div>


                    <div class="resultsExpandedItem">


                        <span class="resultsExpandedLabel">
                            Card Total
                        </span>


                        <span class="resultsExpandedValue">
                            ${formatMoney(
                                card
                            )}
                        </span>


                    </div>


                    <div class="resultsExpandedItem">


                        <span class="resultsExpandedLabel">
                            Total Take Home
                        </span>


                        <span class="resultsExpandedValue resultsExpandedTotal">
                            ${formatMoney(
                                total
                            )}
                        </span>


                    </div>


                </div>


            `;


            expandedRow.appendChild(
                expandedCell
            );


            // =========================
            // ROW CLICK
            // =========================

            row.onclick = () => {


                const isExpanded =
                    expandedRow.style.display !== "none";


                if (
                    isExpanded
                ) {


                    expandedRow.style.display =
                        "none";


                    row.classList.remove(
                        "resultsRowExpanded"
                    );


                    const arrow =
                        row.querySelector(
                            ".resultsExpandArrow"
                        );


                    if (
                        arrow
                    ) {


                        arrow.textContent =
                            "▸";


                    }


                }


                else {


                    expandedRow.style.display =
                        "table-row";


                    row.classList.add(
                        "resultsRowExpanded"
                    );


                    const arrow =
                        row.querySelector(
                            ".resultsExpandArrow"
                        );


                    if (
                        arrow
                    ) {


                        arrow.textContent =
                            "▾";


                    }


                }


                // =========================
                // EXISTING CLICK HANDLER
                // =========================

                if (
                    clickHandler
                ) {


                    clickHandler(
                        row,
                        employee
                    );


                }


            };


            // =========================
            // ADD ROWS
            // =========================

            body.appendChild(
                row
            );


            body.appendChild(
                expandedRow
            );


        }


    }


    // =========================
    // SORT HEADERS
    // =========================

    table
        .querySelectorAll(
            "th[data-sort]"
        )
        .forEach(
            header => {


                header.onclick = (
                    event
                ) => {


                    event.stopPropagation();


                    const key =
                        header.dataset.sort;


                    if (
                        currentSort.key === key
                    ) {


                        currentSort.direction =
                            currentSort.direction === "asc"
                                ?
                                "desc"
                                :
                                "asc";


                    }


                    else {


                        currentSort.key =
                            key;


                        currentSort.direction =
                            "asc";


                    }


                    renderRows(
                        sortEmployees(
                            key
                        )
                    );


                };


            }
        );


    // =========================
    // INITIAL SORT
    // LAST NAME
    // =========================

    renderRows(
        sortEmployees(
            "name"
        )
    );


    // =========================
    // INITIAL TOTALS
    // =========================

    renderTotals();


    return table;


}