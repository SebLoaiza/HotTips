export function assignDistributionRole(
    role
) {


    role =
        role.toLowerCase();



    if (
        role.includes("server")
    ) {

        return "server";

    }



    if (
        role.includes("host")
    ) {

        return "host";

    }



    if (
        role.includes("busser") ||
        role.includes("runner")
    ) {

        return "busser/runner";

    }



    if (
        role.includes("cook") ||
        role.includes("dishwasher") ||
        role.includes("prep")
    ) {

        return "boh";

    }



    return "other";

}