import {
    formatMoney,
    formatNumber
} from "../utils/formatters.js";

export function renderStats(
    employees
) {


    let currentSort = {
        key: null,
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
                </th>

                <th data-sort="cash_tips">
                    Cash Tips
                </th>

                <th data-sort="card_tips">
                    CC Tips ex fees
                </th>

                <th data-sort="cash_to_card_ratio">
                    Cash:CC
                </th>

                <th data-sort="total_tips">
                    Total Tips
                </th>

                <th data-sort="cash_sales">
                    Cash Sales
                </th>

                <th data-sort="cash_drop">
                    Cash Drop
                </th>

                <th data-sort="card_sales">
                    Card Sales
                </th>

                <th data-sort="total_sales">
                    Total Sales
                </th>

                <th data-sort="avg_sales_per_hour">
                    Sales / Hr
                </th>

                <th data-sort="avg_orders_per_hour">
                    Orders / Hr
                </th>

                <th data-sort="tips_per_hour">
                    Tips / Hr
                </th>

                <th data-sort="avg_tip_per_order">
                    Avg Tip / Order
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
    // GROSS CARD TIPS
    // =================================================
    //
    // Tries to find the gross card-tip value before fees.
    //
    // If your compileResults data has one of these fields,
    // it will use it:
    //
    //   employee.card_tips
    //   employee.card_tip
    //   employee.card_total
    //   employee.gross_card_tips
    //
    // Otherwise it falls back to cardTips(employee).
    //
    // =================================================

    function grossCardTips(
        employee
    ) {

        const possibleValues = [

            employee.gross_card_tips,

            employee.card_tips,

            employee.card_tip,

            employee.card_total

        ];

        for (
            const value
            of possibleValues
        ) {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                return (
                    Number(value) || 0
                );

            }

        }

        return cardTips(
            employee
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

<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
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
    // OVERALL TOTALS
    // =================================================

    function calculateTotals() {


        let cashTipsTotal = 0;


        let cardTipsTotal = 0;

<<<<<<< Updated upstream
=======
        let grossCardTipsTotal = 0;
>>>>>>> Stashed changes

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


            cashTipsTotal +=
                cashTips(
                    employee
                );

            cardTipsTotal +=
                cardTips(
                    employee
                );

            grossCardTipsTotal +=
                grossCardTips(
                    employee
                );

            cashSales +=
                Number(
                    employee.cash_sales
                ) || 0;

<<<<<<< Updated upstream

            cashDropTotal +=
                Number(
                    employee.cash_drop
                ) || 0;


=======
>>>>>>> Stashed changes
            cardSales +=
                Number(
                    employee.card_sales
                ) || 0;

            totalSales +=
                Number(
                    employee.total_sales
                ) || 0;

            totalHours +=
                Number(
                    employee.hours
                ) || 0;

            totalOrders +=
                Number(
                    employee.order_count
                ) || 0;

        }

        const totalTips =
            cashTipsTotal +
            cardTipsTotal;

        const cashToCard =
            cardTipsTotal > 0

                ? cashTipsTotal /
                    cardTipsTotal

                : cashTipsTotal > 0

                    ? Infinity

                    : 0;

        const salesPerHour =
            totalHours > 0

                ? totalSales /
                    totalHours

                : 0;

        const ordersPerHour =
            totalHours > 0

                ? totalOrders /
                    totalHours

                : 0;

        const tipsPerHourTotal =
            totalHours > 0

                ? totalTips /
                    totalHours

                : 0;

        const avgTipPerOrder =
            totalOrders > 0

                ? totalTips /
                    totalOrders

                : 0;

        return {

            cashTips:
                cashTipsTotal,


            cardTips:
                cardTipsTotal,

<<<<<<< Updated upstream
=======
            grossCardTips:
                grossCardTipsTotal,

            cardTipsExcludingFees:
                cardTipsTotal,
>>>>>>> Stashed changes

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


            avgTipPerOrder

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
                    Total Card Tips
                </div>

                <div class="stats-tip-value">
                    ${formatMoney(
                        totals.grossCardTips
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
                        totals.cardTips
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

            `;

            body.appendChild(
                row
            );

        }

        renderTotals();

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

<<<<<<< Updated upstream

                // =========================
                // NAME
                // =========================

=======
                // NAME
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream

                // =========================
                // CASH TIPS
                // =========================

=======
                // CASH TIPS
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream

                // =========================
                // CARD TIPS
                // =========================

=======
                // CARD TIPS
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream

                // =========================
                // TOTAL TIPS
                // =========================

=======
                // TOTAL TIPS
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream

                // =========================
                // CASH:CARD
                // =========================

=======
                // CASH:CARD
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream

                // =========================
                // CASH DROP
                // =========================


                else if (
                    key === "cash_drop"
                ) {


                    A =
                        Number(
                            a.cash_drop
                        ) || 0;


                    B =
                        Number(
                            b.cash_drop
                        ) || 0;

                }


                // =========================
                // TIPS / HOUR
                // =========================

=======
                // TIPS / HOUR
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream

                // =========================
                // AVG TIP / ORDER
                // =========================

=======
                // AVG TIP / ORDER
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream

                // =========================
                // NORMAL NUMERIC VALUES
                // =========================

=======
                // NORMAL NUMERIC VALUES
>>>>>>> Stashed changes

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