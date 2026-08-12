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


    `;


    const body =
        table.querySelector(
            "tbody"
        );


    // =========================
    // HELPERS
    // =========================


    function originalTips(
        employee
    ) {


        return (
            (employee.original_cash_tips || 0)
            +
            (employee.original_card_tips || 0)
        );


    }


    function cashToCardRatio(
        employee
    ) {


        const cash =
            employee.original_cash_tips || 0;


        const card =
            employee.original_card_tips || 0;


        if (card <= 0) {


            return cash > 0 ? Infinity : 0;


        }


        return cash / card;


    }


    // =========================
    // FORMAT CASH:CC RATIO
    // =========================


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


        // Round DOWN to the nearest whole
        // percentage out of 100.
        const percentage =
            Math.floor(
                ratio * 100
            );


        if (
            percentage === 0
        ) {


            return "0:1";


        }


        // Find greatest common divisor
        // to reduce the ratio.
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


    function tipsPerHour(
        employee
    ) {


        if (
            !employee.hours ||
            employee.hours <= 0
        ) {


            return 0;


        }


        return (
            originalTips(employee)
            /
            employee.hours
        );


    }


    function avgTipPerOrder(
        employee
    ) {


        if (
            !employee.order_count ||
            employee.order_count <= 0
        ) {


            return 0;


        }


        return (
            originalTips(employee)
            /
            employee.order_count
        );


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
                    ${formatCashToCardRatio(
                        employee
                    )}
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
                        a[key] ?? 0;


                    B =
                        b[key] ?? 0;


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