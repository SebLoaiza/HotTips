import {
    formatMoney,
    formatNumber
}
from "../utils/formatters.js";



export function renderResultsTable(
    employees,
    clickHandler
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

            <th data-sort="cash_payout">
                Cash
            </th>

            <th data-sort="card_payout">
                Card
            </th>

            <th data-sort="total_payout">
                Total
            </th>

            <th data-sort="sales">
                Sales
            </th>

            <th data-sort="sales_per_hour">
                Sales / Hr
            </th>

            <th data-sort="orders_per_hour">
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



    function calculateStats(employee) {


        const hours =
            (
                employee.worked_minutes ?? 0
            )
            /
            60;



        return {


            sales_per_hour:
                hours > 0
                    ?
                    (
                        employee.sales ?? 0
                    )
                    /
                    hours
                    :
                    0,



            orders_per_hour:
                hours > 0
                    ?
                    (
                        employee.order_count ?? 0
                    )
                    /
                    hours
                    :
                    0,



            tips_per_hour:
                hours > 0
                    ?
                    (
                        employee.total_payout ?? 0
                    )
                    /
                    hours
                    :
                    0,



            avg_tip_per_order:
                (
                    employee.order_count ?? 0
                )
                > 0
                    ?
                    (
                        employee.total_payout ?? 0
                    )
                    /
                    employee.order_count
                    :
                    0

        };


    }



    function renderRows(list) {


        body.innerHTML = "";



        for (
            const employee of list
        ) {


            const stats =
                calculateStats(
                    employee
                );



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
                        employee.cash_payout
                    )}
                </td>


                <td>
                    ${formatMoney(
                        employee.card_payout
                    )}
                </td>


                <td>
                    ${formatMoney(
                        employee.total_payout
                    )}
                </td>


                <td>
                    ${formatMoney(
                        employee.sales
                    )}
                </td>


                <td>
                    ${formatMoney(
                        stats.sales_per_hour
                    )}
                </td>


                <td>
                    ${formatNumber(
                        stats.orders_per_hour
                    )}
                </td>


                <td>
                    ${formatMoney(
                        stats.tips_per_hour
                    )}
                </td>


                <td>
                    ${formatMoney(
                        stats.avg_tip_per_order
                    )}
                </td>

            `;



            row.onclick = () => {

                clickHandler(
                    row,
                    employee
                );

            };



            body.appendChild(
                row
            );


        }


    }



    function sortEmployees(
        key
    ) {


        const sorted =
            [...employees];



        sorted.sort(
            (a,b) => {


                let A;
                let B;



                if (
                    key === "sales_per_hour"
                    ||
                    key === "orders_per_hour"
                    ||
                    key === "tips_per_hour"
                    ||
                    key === "avg_tip_per_order"
                ) {


                    const statsA =
                        calculateStats(
                            a
                        );


                    const statsB =
                        calculateStats(
                            b
                        );



                    A =
                        statsA[key];

                    B =
                        statsB[key];


                }
                else {


                    A =
                        a[key] ?? 0;


                    B =
                        b[key] ?? 0;


                }



                if (
                    typeof A === "string"
                ) {


                    return currentSort.direction === "asc"
                        ?
                        A.localeCompare(B)
                        :
                        B.localeCompare(A);


                }



                return currentSort.direction === "asc"
                    ?
                    A - B
                    :
                    B - A;


            }
        );



        return sorted;

    }



    table
    .querySelectorAll(
        "th"
    )
    .forEach(
        header => {


            header.onclick = () => {


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



    renderRows(
        employees
    );



    return table;

}