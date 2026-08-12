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

                <th data-sort="original_cash_tips">
                    Cash Tips
                </th>

                <th data-sort="original_card_tips">
                    Card Tips
                </th>

                <th data-sort="cash_to_card_ratio">
                    Cash:CC
                </th>

                <th data-sort="original_tips">
                    Total Tips
                </th>

                <th data-sort="cash_sales">
                    Cash Sales
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


    // =========================
    // HELPERS
    // =========================

    function originalTips(
        employee
    ) {

        return (
            (Number(employee.original_cash_tips) || 0)
            +
            (Number(employee.original_card_tips) || 0)
        );

    }


    function cashToCardRatio(
        employee
    ) {

        const cash =
            Number(
                employee.original_cash_tips
            ) || 0;


        const card =
            Number(
                employee.original_card_tips
            ) || 0;


        if (card <= 0) {

            return cash > 0
                ? Infinity
                : 0;

        }


        return cash / card;

    }


    function tipsPerHour(
        employee
    ) {

        const hours =
            Number(
                employee.hours
            ) || 0;


        if (hours <= 0) {
            return 0;
        }


        return (
            originalTips(employee)
            /
            hours
        );

    }


    function avgTipPerOrder(
        employee
    ) {

        const orders =
            Number(
                employee.order_count
            ) || 0;


        if (orders <= 0) {
            return 0;
        }


        return (
            originalTips(employee)
            /
            orders
        );

    }


    // =========================
    // OVERALL TOTALS
    // =========================

    function calculateTotals() {

        let cashTips = 0;
        let cardTips = 0;

        let cashSales = 0;
        let cardSales = 0;
        let totalSales = 0;

        let totalHours = 0;
        let totalOrders = 0;


        for (
            const employee of employees
        ) {

            cashTips +=
                Number(
                    employee.original_cash_tips
                ) || 0;


            cardTips +=
                Number(
                    employee.original_card_tips
                ) || 0;


            cashSales +=
                Number(
                    employee.cash_sales
                ) || 0;


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
            cashTips +
            cardTips;


        const cashToCard =
            cardTips > 0
                ? cashTips / cardTips
                : cashTips > 0
                    ? Infinity
                    : 0;


        const salesPerHour =
            totalHours > 0
                ? totalSales / totalHours
                : 0;


        const ordersPerHour =
            totalHours > 0
                ? totalOrders / totalHours
                : 0;


        const tipsPerHourTotal =
            totalHours > 0
                ? totalTips / totalHours
                : 0;


        const avgTipPerOrder =
            totalOrders > 0
                ? totalTips / totalOrders
                : 0;


        return {
            cashTips,
            cardTips,
            cashToCard,
            totalTips,
            cashSales,
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


    // =========================
    // RENDER TOTAL ROW
    // =========================

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


    // =========================
    // RENDER ROWS
    // =========================

    function renderRows(
        list
    ) {

        body.innerHTML = "";


        for (
            const employee of list
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            const ratio =
                cashToCardRatio(
                    employee
                );


            row.innerHTML = `

                <td>
                    ${employee.name}
                </td>

                <td>
                    ${formatMoney(
                        employee.original_cash_tips || 0
                    )}
                </td>

                <td>
                    ${formatMoney(
                        employee.original_card_tips || 0
                    )}
                </td>

                <td>
                    ${
                        ratio === Infinity
                            ? "∞"
                            : ratio.toFixed(2)
                    }
                </td>

                <td>
                    ${formatMoney(
                        originalTips(employee)
                    )}
                </td>

                <td>
                    ${formatMoney(
                        employee.cash_sales || 0
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
                        tipsPerHour(employee)
                    )}
                </td>

                <td>
                    ${formatMoney(
                        avgTipPerOrder(employee)
                    )}
                </td>

            `;


            body.appendChild(
                row
            );

        }


        // Keep totals at the bottom
        // regardless of sorting.
        renderTotals();

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

                    A =
                        a.name || "";


                    B =
                        b.name || "";


                    return currentSort.direction === "asc"

                        ?

                        A.localeCompare(
                            B
                        )

                        :

                        B.localeCompare(
                            A
                        );

                }


                // -------------------------
                // CALCULATED VALUES
                // -------------------------

                if (
                    key === "original_tips"
                ) {

                    A =
                        originalTips(a);


                    B =
                        originalTips(b);

                }


                else if (
                    key === "tips_per_hour"
                ) {

                    A =
                        tipsPerHour(a);


                    B =
                        tipsPerHour(b);

                }


                else if (
                    key === "avg_tip_per_order"
                ) {

                    A =
                        avgTipPerOrder(a);


                    B =
                        avgTipPerOrder(b);

                }


                else if (
                    key === "cash_to_card_ratio"
                ) {

                    A =
                        cashToCardRatio(a);


                    B =
                        cashToCardRatio(b);

                }


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


                // -------------------------
                // NUMERIC SORT
                // -------------------------

                return currentSort.direction === "asc"

                    ?

                    A - B

                    :

                    B - A;

            }
        );


        return sorted;

    }


    // =========================
    // HEADER CLICK
    // =========================

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


    // =========================
    // INITIAL SORT
    // LAST NAME
    // =========================

    const initial =
        [...employees].sort(
            (a, b) => {

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


    renderRows(
        initial
    );


    return table;

}