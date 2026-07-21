export function calculateTipPools(
    mealBlock
) {

    const pools = {

        server_pool: 0,

        boh_pool: 0,

        busser_pool: 0,

        host_pool: 0,

        other_pool: 0

    };


    for (const employee of mealBlock.tipOwners) {


        const tips =
            employee.card_tips +
            employee.cash_drop;



        switch (
            employee.distribution_role
        ) {


            case "server":

                pools.server_pool += tips;

                break;



            case "boh":

                pools.boh_pool += tips;

                break;



            case "busser/runner":

                pools.busser_pool += tips;

                break;



            case "host":

                pools.host_pool += tips;

                break;



            default:

                pools.other_pool += tips;

                break;


        }

    }


    console.log(
        "TIP POOLS",
        {
            meal:
                mealBlock.meal,

            date:
                mealBlock.date,

            pools
        }
    );


    return pools;

}