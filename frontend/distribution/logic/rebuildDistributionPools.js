export function rebuildDistributionPools(
    mealBlock
) {


    mealBlock.servers = [];

    mealBlock.boh = [];

    mealBlock.bussers = [];

    mealBlock.hosts = [];

    mealBlock.others = [];



    for (const employee of mealBlock.employees) {


        switch (
            employee.distribution_role
        ) {


            case "server":

                mealBlock.servers.push(
                    employee
                );

                break;



            case "boh":

                mealBlock.boh.push(
                    employee
                );

                break;



            case "busser/runner":

                mealBlock.bussers.push(
                    employee
                );

                break;



            case "host":

                mealBlock.hosts.push(
                    employee
                );

                break;



            default:

                mealBlock.others.push(
                    employee
                );

                break;


        }


    }


}