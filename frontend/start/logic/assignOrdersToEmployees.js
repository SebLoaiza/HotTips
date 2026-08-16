export function assignOrdersToEmployees(mealBlocks) {


    let totalOrders = 0;
    let assignedOrders = 0;
    let skippedOnlineOrders = 0;
    let unassignedOrders = 0;


    for (const block of mealBlocks) {


        // =================================================
        // RESET EMPLOYEE ORDERS AND TOTALS
        // =================================================


        for (const employee of block.employees) {

            employee.orders = [];

            employee.order_sales = 0;

            employee.card_tips = 0;

            employee.cash_tips = 0;

        }


        // =================================================
        // RESET ONLINE TOTAL
        // =================================================

        block.online_total = 0;


        // =================================================
        // MATCH EACH ORDER TO ITS SERVER
        // =================================================


        for (const order of block.orders) {


            totalOrders++;


            // =================================================
            // ONLINE ORDERS
            // =================================================

            if (
                order.source === "Online" ||
                order.server === "DEFAULT ONLINE ORDERING"
            ) {

                skippedOnlineOrders++;


                /*
                    Online orders are not assigned
                    to an employee.

                    Instead, their sales are stored
                    directly on the meal block.

                    Example:

                    block.online_total = 125.50
                */

                block.online_total +=
                    Number(
                        order.amount || 0
                    );


                continue;

            }


            const server =
                normalizeName(
                    order.server
                );


            let found = false;


            // =================================================
            // FIND EMPLOYEE
            // =================================================


            for (const employee of block.employees) {


                // Normalize the employee name HERE
                const employeeName =
                    normalizeName(
                        employee.name
                    );


                if (
                    employeeName !== server
                ) {

                    continue;

                }


                employee.orders.push(
                    order
                );


                employee.order_sales +=
                    Number(
                        order.amount || 0
                    );


                employee.card_tips +=
                    Number(
                        order.tip || 0
                    ) +
                    Number(
                        order.gratuity || 0
                    );


                found = true;


                assignedOrders++;


                break;

            }


            // =================================================
            // ORDER COULD NOT BE ASSIGNED
            // =================================================


            if (!found) {


                unassignedOrders++;


                console.error(
                    "🚨🚨🚨 ORDER HAS NO EMPLOYEE 🚨🚨🚨"
                );


                console.error(
                    "Order ID:",
                    order.order_id
                );


                console.error(
                    "Order #:",
                    order.order_number
                );


                console.error(
                    "Server:",
                    order.server
                );


                console.error(
                    "Normalized Server:",
                    server
                );


                console.error(
                    "Meal:",
                    block.meal
                );


                console.error(
                    "Date:",
                    block.date
                );


                console.error(
                    "Employees in this meal block:",
                    block.employees.map(
                        employee =>
                            employee.name
                    )
                );

            }

        }

    }


    // =================================================
    // SUMMARY
    // =================================================


    console.log("");

    console.log(
        "========================================"
    );

    console.log(
        "   ORDER → EMPLOYEE ASSIGNMENT SUMMARY"
    );

    console.log(
        "========================================"
    );


    console.log(
        "Orders in meal blocks:",
        totalOrders
    );


    console.log(
        "Assigned to employees:",
        assignedOrders
    );


    console.log(
        "Online orders skipped:",
        skippedOnlineOrders
    );


    console.log(
        "Orders with no employee:",
        unassignedOrders
    );


    // =================================================
    // ONLINE TOTAL SUMMARY
    // =================================================


    const totalOnlineSales =
        mealBlocks.reduce(
            (
                total,
                block
            ) =>
                total +
                Number(
                    block.online_total || 0
                ),
            0
        );


    console.log(
        "Online sales:",
        totalOnlineSales
    );


    // =================================================
    // FINAL RESULT
    // =================================================


    if (unassignedOrders === 0) {

        console.log(
            "✅ All applicable orders were assigned."
        );

    } else {

        console.error(
            `❌ ${unassignedOrders} order(s) could not be assigned.`
        );

    }


    console.log(
        "========================================"
    );

}


// =================================================
// NORMALIZE NAME
// =================================================


function normalizeName(name) {


    if (!name) {

        return "";

    }


    name =
        String(name)
            .trim()
            .toUpperCase()
            .replace(/\s+/g, " ");


    // =================================================
    // Convert LAST, FIRST
    // into FIRST LAST
    // =================================================


    if (name.includes(",")) {


        const parts =
            name.split(",");


        const lastName =
            parts[0].trim();


        const firstName =
            parts
                .slice(1)
                .join(" ")
                .trim();


        return `${firstName} ${lastName}`;

    }


    return name;

}