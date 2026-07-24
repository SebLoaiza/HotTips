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
    // Trainee Transfers
    // =========================

    if (
        employee.tips_sent_to_trainers
        &&
        employee.tips_sent_to_trainers.length > 0
    ) {


        trainerSection += `

            <hr>

            <h3>
                Tips Sent To Trainer
            </h3>

        `;



        for (
            const transfer of employee.tips_sent_to_trainers
        ) {


            trainerSection += `

                <p>

                    ➡ 
                    ${transfer.trainer_name}

                    <br>

                    ${transfer.date}
                    -
                    ${transfer.meal}

                    <br>

                    Sent:
                    ${formatMoney(
                        transfer.amount
                    )}

                </p>

            `;


        }


    }




    // =========================
    // Trainer Received Tips
    // =========================

    if (
        employee.training_tips_received > 0
    ) {


        trainerSection += `

            <hr>

            <h3>
                Training Tips Received
            </h3>


            <p>

                Received:
                ${formatMoney(
                    employee.training_tips_received
                )}

            </p>

        `;


    }



    div.innerHTML = `


    <h2>
        ${employee.name}
    </h2>



    <p>
        Cash:
        ${formatMoney(
            employee.cash_payout
        )}
    </p>



    <p>
        Card:
        ${formatMoney(
            employee.card_payout
        )}
    </p>



    <p>
        Total:
        ${formatMoney(
            employee.total_payout
        )}
    </p>



    ${trainerSection}



    <hr>



    <p>
        Orders:
        ${employee.order_count}
    </p>



    <p>
        Sales:
        ${formatMoney(
            employee.sales
        )}
    </p>



    <p>
        Hours:
        ${formatHours(
            employee.worked_minutes
        )}
    </p>



    `;



    return div;

}