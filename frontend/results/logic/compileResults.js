import {
    EmployeeResult
}
from "../model/employeeResult.js";



export function compileResults(
    tipDistribution
) {


    const employees = {};



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
            // Money
            // =====================


            result.cash_kept +=
                employee.cash_kept ?? 0;


            result.card_kept +=
                employee.card_kept ?? 0;



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



        }


    }



    const output =
        Object.values(
            employees
        );



    for (
        const employee of output
    ) {


        // =====================
        // Final Payouts
        // =====================


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




        // =====================
        // Analytics
        // =====================


        employee.hours =
            employee.worked_minutes / 60;



        employee.avg_sales_per_hour =
            employee.hours > 0
                ?
                employee.sales /
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



    return output.sort(
        (a, b) =>
            a.name.localeCompare(
                b.name
            )
    );


}