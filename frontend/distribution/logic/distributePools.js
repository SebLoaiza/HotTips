export function distributePools(
    mealBlock
) {


    // =========================
    // RESET EVERYONE
    // =========================

    for (
        const employee
        of mealBlock.employees
    ) {

        employee.pool_card_received =
            0;

        employee.pool_cash_received =
            0;

    }



    // =========================
    // SERVER POOL
    // =========================
    //
    // This pool is populated by
    // online tips in distributeTips().
    //

    distributePool(
        mealBlock.servers,
        mealBlock.servers_card,
        mealBlock.servers_cash
    );



    // =========================
    // BOH POOL
    // =========================

    distributePool(
        mealBlock.boh,
        mealBlock.boh_card,
        mealBlock.boh_cash
    );



    // =========================
    // BUSSER POOL
    // =========================

    distributePool(
        mealBlock.bussers,
        mealBlock.busser_card,
        mealBlock.busser_cash
    );



    // =========================
    // HOST POOL
    // =========================

    distributePool(
        mealBlock.hosts,
        mealBlock.host_card,
        mealBlock.host_cash
    );



    // =========================
    // DEBUG
    // =========================

    console.log(
        "FINAL EMPLOYEE POOL DISTRIBUTION",
        {

            meal:
                mealBlock.meal,

            date:
                mealBlock.date,

            servers_card:
                mealBlock.servers_card,

            boh_card:
                mealBlock.boh_card,

            busser_card:
                mealBlock.busser_card,

            host_card:
                mealBlock.host_card

        }
    );

}



// =====================================================
// DISTRIBUTE ONE POOL
// =====================================================


function distributePool(
    employees,
    cardAmount,
    cashAmount
) {


    if (
        !employees ||
        employees.length === 0
    ) {

        return;

    }



    cardAmount =
        Number(
            cardAmount ?? 0
        );


    cashAmount =
        Number(
            cashAmount ?? 0
        );



    if (
        cardAmount <= 0
        &&
        cashAmount <= 0
    ) {

        return;

    }



    // =========================
    // ELIGIBLE EMPLOYEES
    // =========================
    //
    // Must:
    //
    // - Work at least 90 minutes
    // - Have points above 0
    //

    const eligibleEmployees =
        employees.filter(
            employee => {

                const worked =
                    Number(
                        employee.worked_minutes ?? 0
                    );


                const points =
                    Number(
                        employee.tip_points ?? 1
                    );


                return (
                    worked >= 90
                    &&
                    points > 0
                );

            }
        );



    if (
        eligibleEmployees.length === 0
    ) {

        return;

    }



    // =========================
    // TOTAL WEIGHT
    // =========================

    const totalWeight =
        eligibleEmployees.reduce(
            (
                sum,
                employee
            ) => {

                const worked =
                    Number(
                        employee.worked_minutes ?? 0
                    );


                const points =
                    Number(
                        employee.tip_points ?? 1
                    );


                return (
                    sum
                    +
                    (
                        worked *
                        points
                    )
                );

            },
            0
        );



    if (
        totalWeight <= 0
    ) {

        return;

    }



    // =========================
    // DISTRIBUTE POOL
    // =========================

    let cardDistributed =
        0;


    let cashDistributed =
        0;



    for (
        let i = 0;
        i < eligibleEmployees.length;
        i++
    ) {


        const employee =
            eligibleEmployees[i];


        const worked =
            Number(
                employee.worked_minutes ?? 0
            );


        const points =
            Number(
                employee.tip_points ?? 1
            );


        const weight =
            worked *
            points;



        // =========================
        // CALCULATE CARD SHARE
        // =========================

        let cardShare =
            Math.floor(
                cardAmount *
                (
                    weight /
                    totalWeight
                )
            );



        // =========================
        // CALCULATE CASH SHARE
        // =========================

        let cashShare =
            Math.floor(
                cashAmount *
                (
                    weight /
                    totalWeight
                )
            );



        // =========================
        // LAST EMPLOYEE GETS REMAINDER
        // =========================

        if (
            i ===
            eligibleEmployees.length - 1
        ) {

            cardShare =
                cardAmount -
                cardDistributed;


            cashShare =
                cashAmount -
                cashDistributed;

        }



        // =========================
        // SAVE
        // =========================

        employee.pool_card_received +=
            cardShare;


        employee.pool_cash_received +=
            cashShare;



        cardDistributed +=
            cardShare;


        cashDistributed +=
            cashShare;

    }

}