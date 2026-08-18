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
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>

                <th data-sort="cash">
                    Cash Payout
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>

                <th data-sort="card">
                    CC Payout
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>

                <th data-sort="total">
                    Total Payout
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
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
    // CASH PAYOUT
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
    // CC PAYOUT
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
    // TOTAL PAYOUT
    // CASH + CC
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
    // PAYOUT PERCENTAGE
    // =========================

    function tipPercentage(
        amount,
        total
    ) {

        if (
            !total
        ) {

            return 0;

        }


        return (
            amount / total
        ) * 100;

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
    // SORT INDICATORS
    // =========================

    function updateSortIndicators() {

        table
            .querySelectorAll(
                "th[data-sort]"
            )
            .forEach(
                header => {

                    const indicator =
                        header.querySelector(
                            ".sortIndicator"
                        );


                    if (
                        header.dataset.sort ===
                        currentSort.key
                    ) {

                        indicator.textContent =
                            currentSort.direction === "asc"
                                ? " ▲"
                                : " ▼";


                        header.classList.add(
                            "resultsSortedHeader"
                        );

                    }

                    else {

                        indicator.textContent =
                            "";


                        header.classList.remove(
                            "resultsSortedHeader"
                        );

                    }

                }
            );

    }


    // =========================
    // LAST NAME
    // =========================

    function lastName(
        employee
    ) {

        const name =
            String(
                employee.name ?? ""
            )
            .trim();


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
    // =========================

    function firstName(
        employee
    ) {

        const name =
            String(
                employee.name ?? ""
            )
            .trim();


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


                if (
                    key === "name"
                ) {

                    const lastA =
                        lastName(a);


                    const lastB =
                        lastName(b);


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


                else if (
                    key === "cash"
                ) {

                    A =
                        roundedCash(a);


                    B =
                        roundedCash(b);

                }


                else if (
                    key === "card"
                ) {

                    A =
                        cardAmount(a);


                    B =
                        cardAmount(b);

                }


                else if (
                    key === "total"
                ) {

                    A =
                        totalAmount(a);


                    B =
                        totalAmount(b);

                }


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


            // =========================
            // PAYOUT PERCENTAGES
            // =========================

            const cashPercentage =
                tipPercentage(
                    cash,
                    total
                );


            const cardPercentage =
                tipPercentage(
                    card,
                    total
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

                    <span class="resultsAmount">
                        ${formatMoney(
                            cash
                        )}
                    </span>

                    <span class="resultsPercentage">
                        ${cashPercentage.toFixed(1)}%
                    </span>

                </td>


                <td>

                    <span class="resultsAmount">
                        ${formatMoney(
                            card
                        )}
                    </span>

                    <span class="resultsPercentage">
                        ${cardPercentage.toFixed(1)}%
                    </span>

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
                            CC Kept
                        </span>

                        <span class="resultsExpandedValue">
                            ${formatMoney(
                                employee.card_kept ?? 0
                            )}
                        </span>

                    </div>


                    <div class="resultsExpandedItem">

                        <span class="resultsExpandedLabel">
                            CC Pool
                        </span>

                        <span class="resultsExpandedValue">
                            ${formatMoney(
                                employee.pool_card ?? 0
                            )}
                        </span>

                    </div>


                    <div class="resultsExpandedItem">

                        <span class="resultsExpandedLabel">
                            Cash Payout
                        </span>

                        <span class="resultsExpandedValue">
                            ${formatMoney(
                                cash
                            )}
                        </span>

                    </div>


                    <div class="resultsExpandedItem">

                        <span class="resultsExpandedLabel">
                            CC Payout
                        </span>

                        <span class="resultsExpandedValue">
                            ${formatMoney(
                                card
                            )}
                        </span>

                    </div>


                    <div class="resultsExpandedItem">

                        <span class="resultsExpandedLabel">
                            Total Payout
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


                if (
                    clickHandler
                ) {

                    clickHandler(
                        row,
                        employee
                    );

                }

            };


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


                    updateSortIndicators();

                };

            }
        );


    // =========================
    // INITIAL SORT
    // =========================

    renderRows(
        sortEmployees(
            "name"
        )
    );


    // =========================
    // INITIAL SORT ARROW
    // =========================

    updateSortIndicators();


    // =========================
    // INITIAL TOTALS
    // =========================

    renderTotals();


    return table;

}