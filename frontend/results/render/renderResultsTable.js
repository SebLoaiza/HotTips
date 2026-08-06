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
                Cash Tips
            </th>

            <th data-sort="card_payout">
                Card Tips
            </th>

            <th data-sort="total_payout">
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




    function tipsPerHour(
        employee
    ) {


        if (
            employee.hours <= 0
        ) {

            return 0;

        }


        return (
            employee.total_payout /
            employee.hours
        );


    }





    function renderTrainerInfo(
        employee
    ) {


        if (
            employee.tips_sent_to_trainers.length === 0
        ) {

            return "";

        }



        return `

            <br>

            <small class="trainer-note">

                Sent to trainers:
                ${employee.tips_sent_to_trainers.length}

            </small>

        `;


    }





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

                ${renderTrainerInfo(
                    employee
                )}

            </td>



            <td>

                ${formatMoney(
                    employee.cash_payout
                )}

                <br>

                <small>

                    Kept:
                    ${formatMoney(
                        employee.cash_kept
                    )}

                    <br>

                    Pool:
                    ${formatMoney(
                        employee.pool_cash
                    )}

                </small>

            </td>



            <td>

                ${formatMoney(
                    employee.card_payout
                )}

                <br>

                <small>

                    Kept:
                    ${formatMoney(
                        employee.card_kept
                    )}

                    <br>

                    Pool:
                    ${formatMoney(
                        employee.pool_card
                    )}

                </small>

            </td>



            <td>

                ${formatMoney(
                    employee.total_payout
                )}

            </td>



            <td>

                ${formatMoney(
                    employee.cash_sales
                )}

            </td>



            <td>

                ${formatMoney(
                    employee.card_sales
                )}

            </td>



            <td>

                ${formatMoney(
                    employee.total_sales
                )}

            </td>



            <td>

                ${formatMoney(
                    employee.avg_sales_per_hour
                )}

            </td>



            <td>

                ${formatNumber(
                    employee.avg_orders_per_hour
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
                    employee.avg_tip_per_order
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
            [
                ...employees
            ];



        sorted.sort(
            (a,b) => {


                let A =
                    a[key] ?? 0;


                let B =
                    b[key] ?? 0;



                if (
                    key === "tips_per_hour"
                ) {

                    A =
                        tipsPerHour(a);


                    B =
                        tipsPerHour(b);

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
        "th[data-sort]"
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