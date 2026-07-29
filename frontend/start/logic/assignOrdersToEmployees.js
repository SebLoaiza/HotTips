export function assignOrdersToEmployees(mealBlocks) {

    for (const block of mealBlocks) {

        // Reset employee orders and totals
        for (const employee of block.employees) {

            employee.orders = [];

            employee.order_sales = 0;

            employee.card_tips = 0;

            employee.cash_tips = 0;

        }


        // Match each order to its server
        for (const order of block.orders) {

            // Skip online orders
            if (
                order.source === "Online" ||
                order.server === "DEFAULT ONLINE ORDERING"
            ) {
                continue;
            }


            const server =
                normalizeName(order.server);


            let found = false;


            for (const employee of block.employees) {

                if (employee.normalized_name !== server) {
                    continue;
                }


                employee.orders.push(order);

                employee.order_sales += order.amount;

                employee.card_tips +=
                    order.tip +
                    order.gratuity;


                found = true;

                break;

            }


            if (!found) {

                console.group(
                    "%c🚨 ORDER NOT ASSIGNED TO EMPLOYEE 🚨",
                    "color:red;font-size:20px;font-weight:bold;"
                );

                console.error(
                    "Order server did not match any employee in this meal block."
                );

                console.log(
                    "Order:",
                    order
                );

                console.log(
                    "Meal Block:",
                    {
                        meal: block.meal,
                        date: block.date
                    }
                );

                console.log(
                    "Server From Order:",
                    order.server
                );

                console.log(
                    "Normalized Server:",
                    server
                );

                console.log(
                    "Available Employees:",
                    block.employees.map(
                        e => e.name
                    )
                );

                console.trace(
                    "Assignment stack trace"
                );

                console.groupEnd();

            }

        }

    }

}





function normalizeName(name) {

    if (!name) {
        return "";
    }


    name =
        name
        .trim()
        .toUpperCase();


    // Convert LAST, FIRST into FIRST LAST
    if (name.includes(",")) {

        const parts =
            name.split(",");


        return `${parts[1].trim()} ${parts[0].trim()}`;

    }


    return name;

}