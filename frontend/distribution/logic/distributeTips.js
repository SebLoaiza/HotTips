// =========================
// TIP RATIO HELPERS
// =========================


function getBusserTipRatio(
    mealBlock
) {

    const busserRatio =
        mealBlock.busser_ratio ?? 0;


    return (
        0.12 *   busserRatio
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
        employee.card_tips ?? 0;


    const cash =
        employee.cash_tips ?? 0;



    // =====================
    // Card Processing Fee
    // =====================

    const card =
        Math.floor(
            originalCard * 0.97
        );


    employee.original_card_tips =
        originalCard;


    employee.card_after_fee =
        card;



    // =====================
    // Ratios
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
        ?
        Math.floor(
            card * bohRatio
        )
        :
        0;



    const busserCard =
        rules.busser
        ?
        Math.floor(
            card * busserRatio
        )
        :
        0;



    const hostCard =
        rules.host
        ?
        Math.floor(
            card * hostRatio
        )
        :
        0;



    const keptCard =
        card
        -
        bohCard
        -
        busserCard
        -
        hostCard;



    // =====================
    // CASH DISTRIBUTION
    // =====================


    const bohCash =
        rules.boh
        ?
        Math.floor(
            cash * bohRatio
        )
        :
        0;



    const busserCash =
        rules.busser
        ?
        Math.floor(
            cash * busserRatio
        )
        :
        0;



    const hostCash =
        rules.host
        ?
        Math.floor(
            cash * hostRatio
        )
        :
        0;



    const keptCash =
        cash
        -
        bohCash
        -
        busserCash
        -
        hostCash;



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
    // ADD ONLY TIP OUTS
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
// MAIN ENTRY
// =========================


export function distributeTips(
    mealBlock
) {


    // =====================
    // Reset Pools
    // =====================

    mealBlock.boh_card = 0;

    mealBlock.busser_card = 0;

    mealBlock.host_card = 0;



    mealBlock.boh_cash = 0;

    mealBlock.busser_cash = 0;

    mealBlock.host_cash = 0;



    // =====================
    // Process Tip Owners
    // =====================


    for (
        const employee of mealBlock.tipOwners
    ) {


        switch(
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



    console.log(
        "FINAL TIP POOLS",
        {

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