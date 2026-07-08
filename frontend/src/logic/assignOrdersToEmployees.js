export function assignOrdersToEmployees(mealBlocks) {

    for (const block of mealBlocks) {

        // Clear previous assignments and totals
        for (const employee of block.employees) {

            employee.orders = [];

            employee.order_sales = 0;

            employee.card_tips = 0;

            employee.cash_tips = 0;

        }

        // Assign every order in this meal block
        for (const order of block.orders) {

            // Ignore online orders
            if (
                order.source === "Online" ||
                order.server === "DEFAULT ONLINE ORDERING"
            ) {
                continue;
            }

            const server = normalizeName(order.server);

            let found = false;

            for (const employee of block.employees) {

                if (employee.normalized_name !== server) {
                    continue;
                }

                // Attach order
                employee.orders.push(order);

                // Update running totals
                employee.order_sales += order.amount;

                employee.card_tips +=
                    order.tip +
                    order.gratuity;

                found = true;

                // Only one employee should match
                break;

            }

            if (!found) {

                console.error(
                    "ORDER NOT ASSIGNED TO EMPLOYEE",
                    {
                        meal: block.meal,
                        date: block.date,
                        server: order.server,
                        employees: block.employees.map(
                            e => e.name
                        )
                    }
                );

            }

        }

    }

}

function normalizeName(name) {

    if (!name) {
        return "";
    }

    name = name.trim().toUpperCase();

    if (name.includes(",")) {

        const parts = name.split(",");

        return `${parts[1].trim()} ${parts[0].trim()}`;

    }

    return name;

}