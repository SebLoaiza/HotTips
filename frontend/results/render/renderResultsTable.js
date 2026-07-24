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


            <th>
                Cash
            </th>


            <th>
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




    // =========================
    // Training Calculations
    // =========================


    function getTrainingTransfers(
        employee
    ) {


        const transfers =
            employee.tips_sent_to_trainers ?? [];


        let sentCash = 0;

        let sentCard = 0;


        for (
            const transfer of transfers
        ) {


            sentCash +=
                transfer.cash_amount ?? 0;


            sentCard +=
                transfer.card_amount ?? 0;


        }



        return {

            cash:
                sentCash,


            card:
                sentCard


        };


    }




    function getTrainingReceived(
        employee
    ) {


        return {

            cash:
                employee.training_cash_received ?? 0,


            card:
                employee.training_card_received ?? 0

        };


    }




    function getMoneyBreakdown(
        employee
    ) {


        const received =
            getTrainingReceived(
                employee
            );


        return {


            cash:


                (
                    employee.cash_payout ?? 0
                )
                +
                received.cash,



            card:


                (
                    employee.card_payout ?? 0
                )
                +
                received.card,


            total:


                (
                    employee.cash_payout ?? 0
                )
                +
                (
                    employee.card_payout ?? 0
                )
                +
                received.cash
                +
                received.card



        };


    }





    function calculateStats(
        employee
    ) {


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

                    employee.sales /
                    hours

                    :

                    0,



            orders_per_hour:

                hours > 0

                    ?

                    employee.order_count /
                    hours

                    :

                    0,



            tips_per_hour:

                hours > 0

                    ?

                    (
                        getMoneyBreakdown(employee)
                            .total
                    )
                    /
                    hours

                    :

                    0,



            avg_tip_per_order:

                employee.order_count > 0

                    ?

                    (
                        getMoneyBreakdown(employee)
                            .total
                    )
                    /
                    employee.order_count

                    :

                    0


        };


    }





    function buildTrainerSentNote(
        employee
    ) {


        const transfers =
            employee.tips_sent_to_trainers ?? [];



        if (
            transfers.length === 0
        ) {

            return "";

        }



        let html = `

            <br>

            <small style="
                color:red;
                font-weight:bold;
            ">
                Sent:
            </small>

        `;



        for (
            const transfer of transfers
        ) {


            html += `

                <br>

                <small style="
                    color:red;
                ">

                    ➡ ${transfer.trainer_name}

                    <br>

                    ${transfer.date}
                    -
                    ${transfer.meal}

                    <br>

                    Cash:
                    ${formatMoney(
                        transfer.cash_amount
                    )}

                    <br>

                    Card:
                    ${formatMoney(
                        transfer.card_amount
                    )}

                </small>

            `;


        }



        return html;


    }





    function renderRows(
        list
    ) {


        body.innerHTML = "";



        for (
            const employee of list
        ) {


            const stats =
                calculateStats(
                    employee
                );



            const money =
                getMoneyBreakdown(
                    employee
                );



            const received =
                getTrainingReceived(
                    employee
                );



            const row =
                document.createElement(
                    "tr"
                );



            row.innerHTML = `


                <td>

                    ${employee.name}

                    ${buildTrainerSentNote(
                        employee
                    )}

                </td>



                <td>

                    ${formatMoney(
                        money.cash
                    )}

                    <br>

                    <small>

                        Base:
                        ${formatMoney(
                            employee.cash_payout
                        )}

                        <br>

                        From Trainees:
                        ${formatMoney(
                            received.cash
                        )}

                    </small>

                </td>




                <td>

                    ${formatMoney(
                        money.card
                    )}

                    <br>

                    <small>

                        Base:
                        ${formatMoney(
                            employee.card_payout
                        )}

                        <br>

                        From Trainees:
                        ${formatMoney(
                            received.card
                        )}

                    </small>

                </td>




                <td>

                    ${formatMoney(
                        money.total
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
            [
                ...employees
            ];



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