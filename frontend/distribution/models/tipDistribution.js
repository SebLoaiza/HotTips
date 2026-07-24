import { assignDistributionRole }
from "./../logic/assignDistributionRoles.js";


import { rebuildDistributionPools }
from "./../logic/rebuildDistributionPools.js";


import { calculateRoleRatios }
from "./../logic/calculateRoleRatios.js";


import { distributeTips }
from "./../logic/distributeTips.js";

export function createTipDistribution(
    mealBlocks
) {


    const tipDistribution = [];



    for (const block of mealBlocks) {


        const mealBlock = {


            // ------------------------
            // Meal Info
            // ------------------------
            id:
                crypto.randomUUID(),


            date:
                block.date,

            meal:
                block.meal,

            start:
                block.start,

            end:
                block.end,



            // ------------------------
            // Employees
            // ------------------------

            employees: [],



            // ------------------------
            // Role Pools
            // ------------------------

            servers: [],

            boh: [],

            bussers: [],

            hosts: [],

            others: [],



            // ------------------------
            // Tip Owners
            // ------------------------

            tipOwners: [],



            // ------------------------
            // Role Ratios
            // ------------------------

            host_ratio: 0,

            busser_ratio: 0,


            // ------------------------
            // pools cash and card
            // ------------------------


            
            servers_cash: 0,
            servers_card: 0,

            boh_cash: 0,
            boh_card: 0,

            host_cash: 0,
            host_card: 0,

            busser_cash: 0,
            busser_card: 0



        };




        for (const employee of block.employees) {



        const tipEmployee = {

            // Identity
            employee_id:
                employee.employee_id,

            name:
                employee.name,

            role:
                employee.role,


            // Distribution
            distribution_role:
                assignDistributionRole(
                    employee.role
                ),


            // Shift Time
            meal_start:
                employee.meal_start,

            meal_end:
                employee.meal_end,

            worked_minutes:
                employee.worked_minutes,

            breaks:
                employee.breaks ?? [],


            // Points
            tip_points:
                employee.tip_points ?? 1,

            // ------------------------
            // Trainer Relationship
            // ------------------------

            is_trainee:Boolean(employee.role?.toLowerCase().includes("trainee")),

            // Trainer
            trainer_employee_id:
                employee.trainer_employee_id ?? null,

            trainer_employee_name:
                employee.trainer_employee_name ?? "",

            order_count:
                employee.orders?.length ?? 0,

            // Sales Tracking
            card_sales:
                employee.card_sales ?? 0,

            cash_sales:
                employee.cash_sales ?? 0,

            order_sales:
                employee.order_sales ?? 0,


            // Tip Ownership
            card_tips:
                employee.card_tips ?? 0,

            cash_tips:
                employee.cash_tips ?? 0,


            // Cash Handling
            cash_sold:
                employee.cash_sales ?? 0,

            cash_drop:
                employee.cash_drop ?? 0,

            cash_remaining:
                (
                    (employee.cash_drop ?? 0)
                    -
                    (employee.cash_sales ?? 0)
                ),



            // ------------------------
            // Tip Contributions
            // ------------------------

            server_card_contribution: 0,
            server_cash_contribution: 0,

            boh_card_contribution: 0,
            boh_cash_contribution: 0,

            busser_card_contribution: 0,
            busser_cash_contribution: 0,

            host_card_contribution: 0,
            host_cash_contribution: 0,


            card_kept: 0,
            cash_kept: 0,
            
            pool_card_received: 0,
            pool_cash_received: 0,



        };



            // ------------------------
            // Master Employee List
            // ------------------------

            mealBlock.employees.push(
                tipEmployee
            );



            // ------------------------
            // Tip Owners
            // ------------------------

            if (
                tipEmployee.cash_drop > 0 ||
                tipEmployee.card_tips > 0
            ) {


                mealBlock.tipOwners.push(
                    tipEmployee
                );


            }




        }



        // ------------------------
        // Build Role Pools
        // ------------------------

        rebuildDistributionPools(
            mealBlock
        );



        // ------------------------
        // Calculate Role Coverage
        // ------------------------

        calculateRoleRatios(
            mealBlock
        );

        distributeTips(
            mealBlock
        );

        console.log(
            "ROLE RATIOS",
            {
                meal:
                    mealBlock.meal,

                host_ratio:
                    mealBlock.host_ratio,

                busser_ratio:
                    mealBlock.busser_ratio
            }
        );



        tipDistribution.push(
            mealBlock
        );


        

    }



    return tipDistribution;

}