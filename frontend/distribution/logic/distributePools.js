export function distributePools(
    mealBlock
) {


    // =========================
    // Reset Everyone
    // =========================

    for (const employee of mealBlock.employees) {

        employee.pool_card_received = 0;
        employee.pool_cash_received = 0;

    }



    // =========================
    // Add Online Tips
    // Split Across Active Pools
    // Remainder -> BOH
    // =========================

    distributeOnlineTotal(
        mealBlock
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


}





function distributeOnlineTotal(
    mealBlock
) {


    const onlineTotal =
        mealBlock.online_total ?? 0;



    if (
        onlineTotal <= 0
    ) {

        return;

    }



    const pools = [

        {
            key: "servers",

            employees:
                mealBlock.servers

        },


        {
            key: "boh",

            employees:
                mealBlock.boh

        },


        {
            key: "busser",

            employees:
                mealBlock.bussers

        },


        {
            key: "host",

            employees:
                mealBlock.hosts

        }

    ];



    // Only pools that actually exist receive online tips

    const activePools =
        pools.filter(
            pool =>
                pool.employees &&
                pool.employees.length > 0
        );



    if (
        activePools.length === 0
    ) {

        return;

    }



    const split =
        Math.floor(
            onlineTotal /
            activePools.length
        );



    let distributed = 0;



    for (
        const pool of activePools
    ) {


        mealBlock[
            `${pool.key}_card`
        ] =
            (
                mealBlock[
                    `${pool.key}_card`
                ] ?? 0
            )
            +
            split;



        distributed += split;

    }



    // Give leftover cents to BOH

    const remainder =
        onlineTotal -
        distributed;



    mealBlock.boh_card =
        (
            mealBlock.boh_card ?? 0
        )
        +
        remainder;


}






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



    // =========================
    // Find Eligible Employees
    // =========================
    //
    // Must:
    // - Work at least 90 mins
    // - Have points above 0
    //

    const eligibleEmployees =
        employees.filter(
            employee => {


                const worked =
                    employee.worked_minutes ?? 0;


                const points =
                    employee.tip_points ?? 1;



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
    // Calculate Total Weight
    // =========================

    const totalWeight =
        eligibleEmployees.reduce(
            (sum, employee) => {


                const weight =
                    (
                        employee.worked_minutes ?? 0
                    )
                    *
                    (
                        employee.tip_points ?? 1
                    );


                return sum + weight;


            },
            0
        );



    if (
        totalWeight <= 0
    ) {

        return;

    }



    // =========================
    // Weighted Distribution
    // =========================

    let cardDistributed = 0;

    let cashDistributed = 0;



    for (
        let i = 0;
        i < eligibleEmployees.length;
        i++
    ) {


        const employee =
            eligibleEmployees[i];



        const weight =
            (
                employee.worked_minutes ?? 0
            )
            *
            (
                employee.tip_points ?? 1
            );



        let cardShare =
            Math.floor(
                cardAmount *
                (
                    weight /
                    totalWeight
                )
            );



        let cashShare =
            Math.floor(
                cashAmount *
                (
                    weight /
                    totalWeight
                )
            );



        // =========================
        // Give Remainder
        // Last Eligible Employee
        // =========================

        if (
            i === eligibleEmployees.length - 1
        ) {

            cardShare =
                cardAmount -
                cardDistributed;


            cashShare =
                cashAmount -
                cashDistributed;

        }



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