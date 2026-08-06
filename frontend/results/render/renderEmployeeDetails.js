import {
    formatMoney,
    formatHours
}
from "../utils/formatters.js";



export function renderEmployeeDetails(
    employee
) {


    const div =
        document.createElement(
            "div"
        );



    let trainerSection = "";



    // =========================
    // Tips Sent To Trainers
    // =========================

    if (
        employee.tips_sent_to_trainers &&
        employee.tips_sent_to_trainers.length > 0
    ) {


        trainerSection += `

            <hr>

            <h3>
                Tips Sent To Trainers
            </h3>

        `;



        for (
            const transfer of employee.tips_sent_to_trainers
        ) {


            const total =
                (
                    transfer.cash_amount ?? 0
                )
                +
                (
                    transfer.card_amount ?? 0
                );



            trainerSection += `

                <p>

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

                    <br>

                    Total Sent:
                    ${formatMoney(
                        total
                    )}

                </p>

            `;


        }


    }





    // =========================
    // Training Received
    // =========================


    const trainingTotal =
        (
            employee.training_cash_received ?? 0
        )
        +
        (
            employee.training_card_received ?? 0
        );



    if (
        trainingTotal > 0
    ) {


        trainerSection += `

            <hr>

            <h3>
                Training Tips Received
            </h3>


            <p>

                Cash:
                ${formatMoney(
                    employee.training_cash_received
                )}

                <br>

                Card:
                ${formatMoney(
                    employee.training_card_received
                )}

                <br>

                Total:
                ${formatMoney(
                    trainingTotal
                )}

            </p>

        `;


    }




    // =========================
    // Tip Breakdown
    // =========================


    div.innerHTML = `


    <h2>
        ${employee.name}
    </h2>



    <hr>


    <h3>
        Original Tips Generated
    </h3>


    <p>

        Cash Tips:
        ${formatMoney(
            employee.original_cash_tips
        )}

        <br>

        Card Tips:
        ${formatMoney(
            employee.original_card_tips
        )}

        <br>

        Total Generated:
        ${formatMoney(
            employee.original_tips
        )}

    </p>



    <hr>



    <h3>
        Tip Distribution
    </h3>


    <p>

        Cash Kept:
        ${formatMoney(
            employee.cash_kept
        )}

        <br>

        Card Kept:
        ${formatMoney(
            employee.card_kept
        )}

        <br>

        Pool Cash Received:
        ${formatMoney(
            employee.pool_cash
        )}

        <br>

        Pool Card Received:
        ${formatMoney(
            employee.pool_card
        )}

    </p>




    <hr>



    <h3>
        Final Tips
    </h3>


    <p>

        Cash:
        ${formatMoney(
            employee.cash_payout
        )}

        <br>

        Card:
        ${formatMoney(
            employee.card_payout
        )}

        <br>

        Total:
        ${formatMoney(
            employee.total_payout
        )}

    </p>




    <hr>



    <h3>
        Sales
    </h3>


    <p>

        Cash Sales:
        ${formatMoney(
            employee.cash_sales
        )}

        <br>

        Card Sales:
        ${formatMoney(
            employee.card_sales
        )}

        <br>

        Total Sales:
        ${formatMoney(
            employee.total_sales
        )}

    </p>



    ${trainerSection}




    <hr>



    <h3>
        Performance
    </h3>


    <p>

        Orders:
        ${employee.order_count}

        <br>

        Hours:
        ${formatHours(
            employee.worked_minutes
        )}

        <br>

        Sales / Hour:
        ${formatMoney(
            employee.avg_sales_per_hour
        )}

        <br>

        Avg Tip / Order:
        ${formatMoney(
            employee.avg_tip_per_order
        )}

    </p>



    `;



    return div;

}