import {
    formatMoney,
    formatNumber
} from "../utils/formatters.js";


export function renderStats(
    employees
) {


    let currentSort = {
        key: "name",
        direction: "asc"
    };


    // =================================================
    // TABLE
    // =================================================


    const table =
        document.createElement(
            "table"
        );


    table.innerHTML = `

        <thead>

            <tr>

                <th data-sort="name">
                    Name
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="cash_tips">
                    Cash Tips
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="card_tips">
                    CC Tips <br>ex. fees
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="cash_to_card_ratio">
                    Cash:CC<br>Tip Ratio
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="total_tips">
                    Total Tips
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="cash_sales">
                    Cash Sales
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="cash_drop">
                    Cash Drop
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="card_sales">
                    Card Sales
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="total_sales">
                    Total Sales
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="avg_sales_per_hour">
                    Sales / Hr
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="avg_orders_per_hour">
                    Orders / Hr
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="tips_per_hour">
                    Tips / Hr
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="avg_tip_per_order">
                    Avg Tip / Order
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>


                <th data-sort="average_tip_percentage">
                    Average Tip %
                    <span
                        class="sortIndicator"
                        aria-hidden="true"
                    ></span>
                </th>

            </tr>

        </thead>


        <tbody></tbody>


        <tfoot></tfoot>

    `;


    const body =
        table.querySelector(
            "tbody"
        );


    const footer =
        table.querySelector(
            "tfoot"
        );


    // =================================================
    // TIP VALUES
    // SAME VALUES USED BY PAYROLL SUMMARY
    // =================================================


    function cashTips(
        employee
    ) {

        return (

            (
                Number(
                    employee.cash_kept
                ) || 0
            )

            +

            (
                Number(
                    employee.pool_cash
                ) || 0
            )

        );

    }


    function cardTips(
        employee
    ) {

        return (

            (
                Number(
                    employee.card_kept
                ) || 0
            )

            +

            (
                Number(
                    employee.pool_card
                ) || 0
            )

        );

    }


    // =================================================
    // ORIGINAL CARD TIPS
    // =================================================

    function originalCardTips(
        employee
    ) {

        return (
            Number(
                employee.original_card_tips
            ) || 0
        );

    }


    // =================================================
    // TOTAL TIPS
    // =================================================

    function totalTips(
        employee
    ) {

        return (
            cashTips(employee)
            +
            cardTips(employee)
        );

    }


    // =================================================
    // CASH TO CARD RATIO
    // =================================================

    function cashToCardRatio(
        employee
    ) {

        const cash =
            cashTips(
                employee
            );


        const card =
            cardTips(
                employee
            );


        if (
            card <= 0
        ) {

            return cash > 0
                ? Infinity
                : 0;

        }


        return cash / card;

    }


    // =================================================
    // FORMAT CASH:CC RATIO
    // =================================================

    function formatCashToCardRatio(
        employee
    ) {

        const ratio =
            cashToCardRatio(
                employee
            );


        if (
            ratio === Infinity
        ) {

            return "∞";

        }


        const percentage =
            Math.floor(
                ratio * 100
            );


        if (
            percentage === 0
        ) {

            return "0:1";

        }


        function gcd(
            a,
            b
        ) {

            while (
                b !== 0
            ) {

                const temp =
                    b;


                b =
                    a % b;


                a =
                    temp;

            }


            return a;

        }


        const divisor =
            gcd(
                percentage,
                100
            );


        const left =
            percentage /
            divisor;


        const right =
            100 /
            divisor;


        return `${left}:${right}`;

    }


    // =================================================
    // TIPS PER HOUR
    // =================================================

    function tipsPerHour(
        employee
    ) {

        const hours =
            Number(
                employee.hours
            ) || 0;


        if (
            hours <= 0
        ) {

            return 0;

        }


        return (
            totalTips(employee)
            /
            hours
        );

    }


    // =================================================
    // AVG TIP PER ORDER
    // =================================================

    function avgTipPerOrder(
        employee
    ) {

        const orders =
            Number(
                employee.order_count
            ) || 0;


        if (
            orders <= 0
        ) {

            return 0;

        }


        return (
            totalTips(employee)
            /
            orders
        );

    }


    // =================================================
    // AVERAGE TIP %
    // =================================================

    function averageTipPercentage(
        employee
    ) {

        const originalTips =
            Number(
                employee.original_tips
            ) || 0;


        const sales =
            Number(
                employee.total_sales
            ) || 0;


        if (
            sales <= 0
        ) {

            return 0;

        }


        return (
            originalTips /
            sales
        ) * 100;

    }


    // =================================================
    // OVERALL TOTALS
    // =================================================

    function calculateTotals() {

        let cashTipsTotal = 0;


        let originalCardTipsTotal = 0;


        let originalTipsTotal = 0;


        let cardTipsExcludingFeesTotal = 0;


        let cashSales = 0;


        let cashDropTotal = 0;


        let cardSales = 0;


        let totalSales = 0;


        let totalHours = 0;


        let totalOrders = 0;


        for (
            const employee
            of employees
        ) {

            // -----------------------------------------
            // CASH TIPS
            // -----------------------------------------

            cashTipsTotal +=
                cashTips(
                    employee
                );


            // -----------------------------------------
            // ORIGINAL TIPS
            // -----------------------------------------

            originalTipsTotal +=
                Number(
                    employee.original_tips
                ) || 0;


            // -----------------------------------------
            // ORIGINAL CARD TIPS
            // -----------------------------------------

            originalCardTipsTotal +=
                originalCardTips(
                    employee
                );


            // -----------------------------------------
            // CARD TIPS EXCLUDING FEES
            // -----------------------------------------

            cardTipsExcludingFeesTotal +=
                cardTips(
                    employee
                );


            // -----------------------------------------
            // SALES
            // -----------------------------------------

            cashSales +=
                Number(
                    employee.cash_sales
                ) || 0;


            cashDropTotal +=
                Number(
                    employee.cash_drop
                ) || 0;


            cardSales +=
                Number(
                    employee.card_sales
                ) || 0;


            totalSales +=
                Number(
                    employee.total_sales
                ) || 0;


            // -----------------------------------------
            // HOURS / ORDERS
            // -----------------------------------------

            totalHours +=
                Number(
                    employee.hours
                ) || 0;


            totalOrders +=
                Number(
                    employee.order_count
                ) || 0;

        }


        // =================================================
        // TOTAL TIPS
        // =================================================

        const totalTips =
            cashTipsTotal +
            cardTipsExcludingFeesTotal;


        // =================================================
        // CASH TO CARD
        // =================================================

        const cashToCard =
            cardTipsExcludingFeesTotal > 0

                ? cashTipsTotal /
                    cardTipsExcludingFeesTotal

                : cashTipsTotal > 0

                    ? Infinity

                    : 0;


        // =================================================
        // SALES PER HOUR
        // =================================================

        const salesPerHour =
            totalHours > 0

                ? totalSales /
                    totalHours

                : 0;


        // =================================================
        // ORDERS PER HOUR
        // =================================================

        const ordersPerHour =
            totalHours > 0

                ? totalOrders /
                    totalHours

                : 0;


        // =================================================
        // TIPS PER HOUR
        // =================================================

        const tipsPerHourTotal =
            totalHours > 0

                ? totalTips /
                    totalHours

                : 0;


        // =================================================
        // AVG TIP PER ORDER
        // =================================================

        const avgTipPerOrder =
            totalOrders > 0

                ? totalTips /
                    totalOrders

                : 0;


        // =================================================
        // AVERAGE TIP %
        // =================================================

        const averageTipPercentage =
            totalSales > 0

                ? (
                    originalTipsTotal /
                    totalSales
                ) * 100

                : 0;


        return {

            cashTips:
                cashTipsTotal,

            originalCardTips:
                originalCardTipsTotal,

            originalTips:
                originalTipsTotal,

            cardTipsExcludingFees:
                cardTipsExcludingFeesTotal,

            cashToCard,

            totalTips,

            cashSales,

            cashDrop:
                cashDropTotal,

            cardSales,

            totalSales,

            totalHours,

            totalOrders,

            salesPerHour,

            ordersPerHour,

            tipsPerHourTotal,

            avgTipPerOrder,

            averageTipPercentage

        };

    }


    // =================================================
    // TIP SUMMARY BOX
    // =================================================

    function renderTipSummary() {

        const totals =
            calculateTotals();


        const summary =
            document.createElement(
                "div"
            );


        summary.className =
            "stats-tip-summary";


        summary.innerHTML = `

            <div class="stats-tip-card">

                <div class="stats-tip-label">
                    Total Cash Tips
                </div>

                <div class="stats-tip-value">
                    ${formatMoney(
                        totals.cashTips
                    )}
                </div>

            </div>


            <div class="stats-tip-card">

                <div class="stats-tip-label">
                    Card Tips Excluding Fees
                </div>

                <div class="stats-tip-value">
                    ${formatMoney(
                        totals.cardTipsExcludingFees
                    )}
                </div>

            </div>


            <div class="stats-tip-card">

                <div class="stats-tip-label">
                    Total Tips Distributed
                </div>

                <div class="stats-tip-value">
                    ${formatMoney(
                        totals.totalTips
                    )}
                </div>

            </div>

        `;


        return summary;

    }


    // =================================================
    // TOTAL ROW
    // =================================================

    function renderTotals() {

        const totals =
            calculateTotals();


        footer.innerHTML = `

            <tr class="stats-total-row">

                <th>
                    Total
                </th>


                <th>
                    ${formatMoney(
                        totals.cashTips
                    )}
                </th>


                <th>
                    ${formatMoney(
                        totals.cardTipsExcludingFees
                    )}
                </th>


                <th>
                    ${
                        totals.cashToCard === Infinity

                            ? "∞"

                            : totals.cashToCard.toFixed(2)
                    }
                </th>


                <th>
                    ${formatMoney(
                        totals.totalTips
                    )}
                </th>


                <th>
                    ${formatMoney(
                        totals.cashSales
                    )}
                </th>


                <th>
                    ${formatMoney(
                        totals.cashDrop
                    )}
                </th>


                <th>
                    ${formatMoney(
                        totals.cardSales
                    )}
                </th>


                <th>
                    ${formatMoney(
                        totals.totalSales
                    )}
                </th>


                <th>
                    ${formatMoney(
                        totals.salesPerHour
                    )}
                </th>


                <th>
                    ${formatNumber(
                        totals.ordersPerHour
                    )}
                </th>


                <th>
                    ${formatMoney(
                        totals.tipsPerHourTotal
                    )}
                </th>


                <th>
                    ${formatMoney(
                        totals.avgTipPerOrder
                    )}
                </th>


                <th>
                    ${formatNumber(
                        totals.averageTipPercentage
                    )}%
                </th>

            </tr>

        `;

    }


    // =================================================
    // RENDER ROWS
    // =================================================

    function renderRows(
        list
    ) {

        body.innerHTML = "";


        for (
            const employee
            of list
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${employee.name}
                </td>


                <td>
                    ${formatMoney(
                        cashTips(
                            employee
                        )
                    )}
                </td>


                <td>
                    ${formatMoney(
                        cardTips(
                            employee
                        )
                    )}
                </td>


                <td>
                    ${formatCashToCardRatio(
                        employee
                    )}
                </td>


                <td>
                    ${formatMoney(
                        totalTips(
                            employee
                        )
                    )}
                </td>


                <td>
                    ${formatMoney(
                        employee.cash_sales || 0
                    )}
                </td>


                <td>
                    ${formatMoney(
                        employee.cash_drop || 0
                    )}
                </td>


                <td>
                    ${formatMoney(
                        employee.card_sales || 0
                    )}
                </td>


                <td>
                    ${formatMoney(
                        employee.total_sales || 0
                    )}
                </td>


                <td>
                    ${formatMoney(
                        employee.avg_sales_per_hour || 0
                    )}
                </td>


                <td>
                    ${formatNumber(
                        employee.avg_orders_per_hour || 0
                    )}
                </td>


                <td>
                    ${formatMoney(
                        tipsPerHour(
                            employee
                        )
                    )}
                </td>


                <td>
                    ${formatMoney(
                        avgTipPerOrder(
                            employee
                        )
                    )}
                </td>


                <td>
                    ${formatNumber(
                        averageTipPercentage(
                            employee
                        )
                    )}%
                </td>

            `;


            body.appendChild(
                row
            );

        }


        renderTotals();

    }


    // =================================================
    // SORT INDICATORS
    // =================================================

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


    // =================================================
    // SORT
    // =================================================

    function sortEmployees(
        key
    ) {

        const sorted =
            [
                ...employees
            ];


        sorted.sort(
            (
                a,
                b
            ) => {

                let A;


                let B;


                // NAME

                if (
                    key === "name"
                ) {

                    A =
                        a.name || "";


                    B =
                        b.name || "";


                    return (
                        currentSort.direction === "asc"

                            ?

                            A.localeCompare(
                                B
                            )

                            :

                            B.localeCompare(
                                A
                            )
                    );

                }


                // CASH TIPS

                if (
                    key === "cash_tips"
                ) {

                    A =
                        cashTips(
                            a
                        );


                    B =
                        cashTips(
                            b
                        );

                }


                // CARD TIPS

                else if (
                    key === "card_tips"
                ) {

                    A =
                        cardTips(
                            a
                        );


                    B =
                        cardTips(
                            b
                        );

                }


                // TOTAL TIPS

                else if (
                    key === "total_tips"
                ) {

                    A =
                        totalTips(
                            a
                        );


                    B =
                        totalTips(
                            b
                        );

                }


                // CASH:CARD

                else if (
                    key === "cash_to_card_ratio"
                ) {

                    A =
                        cashToCardRatio(
                            a
                        );


                    B =
                        cashToCardRatio(
                            b
                        );

                }


                // TIPS / HOUR

                else if (
                    key === "tips_per_hour"
                ) {

                    A =
                        tipsPerHour(
                            a
                        );


                    B =
                        tipsPerHour(
                            b
                        );

                }


                // AVG TIP / ORDER

                else if (
                    key === "avg_tip_per_order"
                ) {

                    A =
                        avgTipPerOrder(
                            a
                        );


                    B =
                        avgTipPerOrder(
                            b
                        );

                }


                // AVERAGE TIP %

                else if (
                    key === "average_tip_percentage"
                ) {

                    A =
                        averageTipPercentage(
                            a
                        );


                    B =
                        averageTipPercentage(
                            b
                        );

                }


                // NORMAL NUMERIC VALUES

                else {

                    A =
                        Number(
                            a[key]
                        ) || 0;


                    B =
                        Number(
                            b[key]
                        ) || 0;

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


    // =================================================
    // HEADER CLICK
    // =================================================

    table
        .querySelectorAll(
            "th[data-sort]"
        )
        .forEach(
            header => {

                header.onclick =
                    () => {

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


                        // Update the visible
                        // sort arrow.

                        updateSortIndicators();

                    };

            }
        );


    // =================================================
    // INITIAL SORT
    // LAST NAME
    // =================================================

    const initial =
        [...employees].sort(
            (
                a,
                b
            ) => {

                const lastNameA =
                    (a.name || "")
                        .trim()
                        .split(/\s+/)
                        .slice(-1)[0]
                        .toLowerCase();


                const lastNameB =
                    (b.name || "")
                        .trim()
                        .split(/\s+/)
                        .slice(-1)[0]
                        .toLowerCase();


                const result =
                    lastNameA.localeCompare(
                        lastNameB
                    );


                if (
                    result !== 0
                ) {

                    return result;

                }


                return (
                    a.name || ""
                ).localeCompare(
                    b.name || ""
                );

            }
        );


    // =================================================
    // INITIAL RENDER
    // =================================================

    renderRows(
        initial
    );


    // =================================================
    // INITIAL SORT ARROW
    // =================================================

    updateSortIndicators();


    // =================================================
    // RETURN COMPLETE STATS VIEW
    // =================================================

    const container =
        document.createElement(
            "div"
        );


    container.className =
        "stats-page";


    container.appendChild(
        renderTipSummary()
    );


    container.appendChild(
        table
    );


    return container;

}