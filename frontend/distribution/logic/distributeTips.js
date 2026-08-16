// =========================
// TIP RATIO HELPERS
// =========================


function getBusserTipRatio(
    mealBlock
) {

    const busserRatio =
        mealBlock.busser_ratio ?? 0;


    return (
        0.12 * busserRatio
    );

}



function getHostTipRatio(
    mealBlock
) {

    const busserRatio =
        mealBlock.busser_ratio ?? 0;


    const hostRatio =
        mealBlock.host_ratio ?? 0;


    return (
        (
            0.05 +
            (0.03 * (1 - busserRatio))
        )
        *
        hostRatio
    );

}



// =========================
// DISTRIBUTE ONE EMPLOYEE
// =========================


function distributeEmployeeTip(
    employee,
    mealBlock,
    rules
) {


    const originalCard =
        Number(
            employee.card_tips ?? 0
        );


    const cash =
        Number(
            employee.cash_tips ?? 0
        );



    // =====================
    // CARD PROCESSING FEE
    // =====================
    //
    // 3% processing fee
    //
    // Example:
    //
    // $100.00
    // × .97
    // = $97.00
    //
    // The fee is applied BEFORE
    // the card tips are distributed.
    //

    const card =
        Math.floor(
            originalCard * 0.97 * 100
        ) / 100;


    employee.card_after_fee =
        card;



    // =====================
    // RATIOS
    // =====================

    const bohRatio =
        0.30;


    const busserRatio =
        getBusserTipRatio(
            mealBlock
        );


    const hostRatio =
        getHostTipRatio(
            mealBlock
        );



    // =====================
    // CARD DISTRIBUTION
    // =====================

    const bohCard =
        rules.boh
            ? Math.floor(
                card * bohRatio
            )
            : 0;


    let busserCard =
        rules.busser
            ? Math.floor(
                card * busserRatio
            )
            : 0;


    let hostCard =
        rules.host
            ? Math.floor(
                card * hostRatio
            )
            : 0;


    let keptCard =
        card
        - bohCard
        - busserCard
        - hostCard;



    // =====================
    // CASH DISTRIBUTION
    // =====================

    const bohCash =
        rules.boh
            ? Math.floor(
                cash * bohRatio
            )
            : 0;


    let busserCash =
        rules.busser
            ? Math.floor(
                cash * busserRatio
            )
            : 0;


    let hostCash =
        rules.host
            ? Math.floor(
                cash * hostRatio
            )
            : 0;


    let keptCash =
        cash
        - bohCash
        - busserCash
        - hostCash;



    // =====================
    // HOST KEEPS REMAINDER
    // =====================

    if (
        employee.distribution_role === "host"
    ) {

        hostCard =
            keptCard;

        hostCash =
            keptCash;

        keptCard =
            0;

        keptCash =
            0;

    }



    // =====================
    // BUSSER KEEPS REMAINDER
    // =====================

    if (
        employee.distribution_role === "busser/runner"
    ) {

        busserCard =
            keptCard;

        busserCash =
            keptCash;

        keptCard =
            0;

        keptCash =
            0;

    }



    // =====================
    // SAVE EMPLOYEE RESULTS
    // =====================

    employee.card_kept =
        keptCard;


    employee.cash_kept =
        keptCash;


    employee.boh_card_contribution =
        bohCard;


    employee.busser_card_contribution =
        busserCard;


    employee.host_card_contribution =
        hostCard;


    employee.boh_cash_contribution =
        bohCash;


    employee.busser_cash_contribution =
        busserCash;


    employee.host_cash_contribution =
        hostCash;



    // =====================
    // ADD TIP OUTS TO POOLS
    // =====================

    mealBlock.boh_card +=
        bohCard;


    mealBlock.busser_card +=
        busserCard;


    mealBlock.host_card +=
        hostCard;


    mealBlock.boh_cash +=
        bohCash;


    mealBlock.busser_cash +=
        busserCash;


    mealBlock.host_cash +=
        hostCash;

}



// =========================
// ONLINE TIP DISTRIBUTION
// =========================
//
// Online tips:
//
// 1. Take online_total
// 2. Apply 3% card fee
// 3. Find active pools
// 4. Split equally
// 5. Add directly to pools
//
// Online tips DO NOT use:
//
//     busser_ratio
//     host_ratio
//     bohRatio
//
// They are split equally between:
//
//     Servers
//     BOH
//     Bussers
//     Hosts
//
// The actual employee distribution happens later
// inside distributePools().
//
// =========================


function distributeOnlineTips(
    mealBlock
) {


    const originalOnlineTotal =
        Number(
            mealBlock.online_total ?? 0
        );


    if (
        originalOnlineTotal <= 0
    ) {

        return;

    }



    // =====================
    // 3% CARD FEE
    // =====================

    const onlineAfterFee =
        Math.floor(
            originalOnlineTotal
            * 0.97
            * 100
        ) / 100;



    if (
        onlineAfterFee <= 0
    ) {

        return;

    }



    // =====================
    // ACTIVE POOLS
    // =====================

    const pools = [

        {
            employees:
                mealBlock.servers,

            property:
                "servers_card"

        },

        {
            employees:
                mealBlock.boh,

            property:
                "boh_card"

        },

        {
            employees:
                mealBlock.bussers,

            property:
                "busser_card"

        },

        {
            employees:
                mealBlock.hosts,

            property:
                "host_card"

        }

    ];



    const activePools =
        pools.filter(
            pool =>
                Array.isArray(
                    pool.employees
                )
                &&
                pool.employees.length > 0
        );



    if (
        activePools.length === 0
    ) {

        return;

    }



    // =====================
    // EQUAL SPLIT
    // =====================

    const split =
        Math.floor(
            (
                onlineAfterFee
                * 100
            )
            /
            activePools.length
        ) / 100;



    let distributed =
        0;



    // =====================
    // ADD TO EACH POOL
    // =====================

    for (
        const pool
        of activePools
    ) {

        mealBlock[
            pool.property
        ] =
            (
                mealBlock[
                    pool.property
                ] ?? 0
            )
            +
            split;


        distributed +=
            split;

    }



    // =====================
    // REMAINDER
    // =====================
    //
    // Any leftover cents go to BOH.
    //

    const remainder =
        Math.round(
            (
                onlineAfterFee
                - distributed
            )
            * 100
        ) / 100;



    if (
        remainder > 0
    ) {

        mealBlock.boh_card +=
            remainder;

    }



    // =====================
    // SAVE ONLINE TOTALS
    // =====================

    mealBlock.online_after_fee =
        onlineAfterFee;


    mealBlock.online_distributed =
        onlineAfterFee;



    console.log(
        "ONLINE TIP DISTRIBUTION",
        {

            original:
                originalOnlineTotal,

            after_fee:
                onlineAfterFee,

            active_pools:
                activePools.map(
                    pool =>
                        pool.property
                ),

            split,

            remainder,

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



// =========================
// MAIN ENTRY
// =========================


export function distributeTips(
    mealBlock
) {


    // =====================
    // RESET ALL POOLS
    // =====================

    mealBlock.servers_card =
        0;


    mealBlock.servers_cash =
        0;


    mealBlock.boh_card =
        0;


    mealBlock.boh_cash =
        0;


    mealBlock.busser_card =
        0;


    mealBlock.busser_cash =
        0;


    mealBlock.host_card =
        0;


    mealBlock.host_cash =
        0;



    // =====================
    // PROCESS TIP OWNERS
    // =====================

    for (
        const employee
        of mealBlock.tipOwners
    ) {


        switch (
            employee.distribution_role
        ) {


            // =================
            // SERVER
            // =================

            case "server":

                distributeEmployeeTip(
                    employee,
                    mealBlock,
                    {
                        boh: true,
                        busser: true,
                        host: true
                    }
                );

                break;



            // =================
            // BUSSER
            // =================

            case "busser/runner":

                distributeEmployeeTip(
                    employee,
                    mealBlock,
                    {
                        boh: true,
                        busser: false,
                        host: true
                    }
                );

                break;



            // =================
            // HOST
            // =================

            case "host":

                distributeEmployeeTip(
                    employee,
                    mealBlock,
                    {
                        boh: true,
                        busser: true,
                        host: false
                    }
                );

                break;



            // =================
            // BOH
            // =================

            case "boh":

                distributeEmployeeTip(
                    employee,
                    mealBlock,
                    {
                        boh: false,
                        busser: false,
                        host: false
                    }
                );

                break;



            default:

                console.warn(
                    "Unknown distribution role:",
                    employee.distribution_role
                );

                break;

        }

    }



    // =========================
    // ONLINE TIPS
    // =========================
    //
    // Add online tips AFTER
    // normal tip-outs are built.
    //
    // These go directly into
    // the role pools.
    //

    distributeOnlineTips(
        mealBlock
    );



    // =========================
    // FINAL DEBUG
    // =========================

    console.log(
        "FINAL TIP POOLS",
        {

            servers_card:
                mealBlock.servers_card,

            boh_card:
                mealBlock.boh_card,

            busser_card:
                mealBlock.busser_card,

            host_card:
                mealBlock.host_card,


            boh_cash:
                mealBlock.boh_cash,

            busser_cash:
                mealBlock.busser_cash,

            host_cash:
                mealBlock.host_cash

        }
    );

}