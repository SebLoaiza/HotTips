import {
    EmployeeResult
}
from "../model/EmployeeResult.js";



export function compileResults(
    tipDistribution
) {


    const employees = {};



    // =========================
    // BUILD EMPLOYEE RESULTS
    // =========================

    for (
        const block of tipDistribution
    ) {


        for (
            const employee of block.employees
        ) {


            const id =
                employee.employee_id;



            if (!employees[id]) {


                employees[id] =
                    new EmployeeResult(
                        employee
                    );


            }



            const result =
                employees[id];



            // =====================
            // MONEY GENERATED
            // =====================


            // Original tips

            result.original_cash_tips +=
                employee.cash_tips ?? 0;


            result.original_card_tips +=
                employee.card_tips ?? 0;


            result.original_tips =
                result.original_cash_tips +
                result.original_card_tips;



            // Sales

            result.cash_sales +=
                employee.cash_sales ?? 0;


            result.card_sales +=
                employee.card_sales ?? 0;


            result.total_sales =
                result.cash_sales +
                result.card_sales;



            // Kept after distribution

            result.cash_kept +=
                employee.cash_kept ?? 0;


            result.card_kept +=
                employee.card_kept ?? 0;



            // Pool received

            result.pool_cash +=
                employee.pool_cash_received ?? 0;


            result.pool_card +=
                employee.pool_card_received ?? 0;


            // =====================
            // Analytics
            // =====================


            result.order_count +=
                employee.order_count ?? 0;



            result.sales +=
                employee.order_sales ?? 0;



            result.worked_minutes +=
                employee.worked_minutes ?? 0;




            // =====================
            // TRAINER TRACKING
            // =====================
            //
            // Store transfers per meal.
            // A trainee may have different
            // trainers on different shifts.
            //

            if (
                employee.is_trainee &&
                employee.trainer_employee_id
            ) {


                result.tips_sent_to_trainers.push({

                    trainer_id:
                        employee.trainer_employee_id,


                    trainer_name:
                        employee.trainer_employee_name,


                    date:
                        block.date,


                    meal:
                        block.meal,


                    cash_amount:
                        (
                            employee.cash_kept ?? 0
                        )
                        +
                        (
                            employee.pool_cash_received ?? 0
                        ),



                    card_amount:
                        (
                            employee.card_kept ?? 0
                        )
                        +
                        (
                            employee.pool_card_received ?? 0
                        )

                });


            }


        }


    }




    const output =
        Object.values(
            employees
        );




    // =========================
    // INITIAL PAYOUT CALCULATION
    // =========================

    for (
        const employee of output
    ) {


        employee.cash_payout =
            employee.cash_kept
            +
            employee.pool_cash;



        employee.card_payout =
            employee.card_kept
            +
            employee.pool_card;



        employee.total_payout =
            employee.cash_payout
            +
            employee.card_payout;




        // Analytics

        employee.hours =
            employee.worked_minutes / 60;



        employee.avg_sales_per_hour =
            employee.hours > 0
                ?
                employee.total_sales /
                employee.hours
                :
                0;


        employee.avg_orders_per_hour =
            employee.hours > 0
                ?
                employee.order_count /
                employee.hours
                :
                0;



        employee.avg_tip_per_order =
            employee.order_count > 0
                ?
                employee.total_payout /
                employee.order_count
                :
                0;


    }





    // =========================
    // APPLY TRAINER TRANSFERS
    // =========================

    for (
        const trainee of output
    ) {


        for (
            const transfer of trainee.tips_sent_to_trainers
        ) {


            const trainer =
                output.find(
                    employee =>
                        employee.employee_id ===
                        transfer.trainer_id
                );



            if (!trainer) {


                console.warn(
                    "Trainer not found",
                    transfer
                );


                continue;

            }




            const totalTransfer =
                transfer.cash_amount
                +
                transfer.card_amount;




            // =====================
            // TRAINEE SIDE
            // =====================


            trainee.tips_sent_to_trainers_history =
                trainee.tips_sent_to_trainers_history ?? [];


            trainee.tips_sent_to_trainers_history.push(
                transfer
            );



            trainee.total_sent_to_trainers =
                (
                    trainee.total_sent_to_trainers ?? 0
                )
                +
                totalTransfer;



            trainee.cash_payout -=
                transfer.cash_amount;



            trainee.card_payout -=
                transfer.card_amount;



            trainee.total_payout -=
                totalTransfer;





            // =====================
            // TRAINER SIDE
            // =====================


            trainer.training_cash_received +=
                transfer.cash_amount;



            trainer.training_card_received +=
                transfer.card_amount;




        }


    }




    console.log(
        "========== COMPILED RESULTS =========="
    );


    console.log(
        output
    );


    console.log(
        "======================================"
    );




    return output.sort(
        (a,b) =>
            a.name.localeCompare(
                b.name
            )
    );


}