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
    // Distribute server pool LAST
    // so returned CASH from other
    // pools can go to servers.
    //

    let serverCard =
        Number(
            mealBlock.servers_card ?? 0
        );


    let serverCash =
        Number(
            mealBlock.servers_cash ?? 0
        );



    // =========================
    // BOH POOL
    // =========================

    const bohResult =
        distributePool(
            mealBlock.boh,
            mealBlock.boh_card,
            mealBlock.boh_cash
        );


    // ONLY CASH RETURNS TO SERVER

    serverCash +=
        bohResult.returnedCash;



    // =========================
    // BUSSER POOL
    // =========================

    const busserResult =
        distributePool(
            mealBlock.bussers,
            mealBlock.busser_card,
            mealBlock.busser_cash
        );


    // ONLY CASH RETURNS TO SERVER

    serverCash +=
        busserResult.returnedCash;



    // =========================
    // HOST POOL
    // =========================

    const hostResult =
        distributePool(
            mealBlock.hosts,
            mealBlock.host_card,
            mealBlock.host_cash
        );


    // ONLY CASH RETURNS TO SERVER

    serverCash +=
        hostResult.returnedCash;



    // =========================
    // SERVER POOL
    // =========================
    //
    // Server gets:
    //
    // original server cash
    // +
    // unclaimable BOH cash
    // +
    // unclaimable busser cash
    // +
    // unclaimable host cash
    //

    distributePool(
        mealBlock.servers,
        serverCard,
        serverCash
    );



    // =========================
    // DEBUG
    // =========================

    console.log(
        "FINAL POOL DISTRIBUTION",
        {

            serverCard,

            serverCash,

            bohCard:
                mealBlock.boh_card,

            bohCash:
                mealBlock.boh_cash,

            busserCard:
                mealBlock.busser_card,

            busserCash:
                mealBlock.busser_cash,

            hostCard:
                mealBlock.host_card,

            hostCash:
                mealBlock.host_cash

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


    // =========================
    // NORMALIZE
    // =========================

    cardAmount =
        Number(
            cardAmount ?? 0
        );


    cashAmount =
        Number(
            cashAmount ?? 0
        );



    // =========================
    // NO EMPLOYEES
    // =========================
    //
    // ONLY CASH is returned.
    //
    // Card stays in the pool.
    //

    if (
        !employees
        ||
        employees.length === 0
    ) {

        return {

            returnedCash:
                cashAmount

        };

    }



    // =========================
    // NO MONEY
    // =========================

    if (
        cardAmount <= 0
        &&
        cashAmount <= 0
    ) {

        return {

            returnedCash:
                0

        };

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



    // =========================
    // NO VALID EMPLOYEE
    // =========================
    //
    // Card stays here.
    //
    // Cash goes back to servers.
    //

    if (
        eligibleEmployees.length === 0
    ) {

        return {

            returnedCash:
                cashAmount

        };

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



    // =========================
    // INVALID WEIGHT
    // =========================

    if (
        totalWeight <= 0
    ) {

        return {

            returnedCash:
                cashAmount

        };

    }



    // =========================
    // DISTRIBUTE
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
        // CARD SHARE
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
        // CASH SHARE
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
        // LAST EMPLOYEE
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



    // =========================
    // NOTHING RETURNS
    // =========================

    return {

        returnedCash:
            0

    };

}