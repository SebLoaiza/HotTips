export function assignOrders(mealBlocks, orders) {

    // Clear previous meal block assignments
    for (const block of mealBlocks) {
        block.orders = [];
        block.online_total = 0;
    }


    // Assign each order into a meal block
    for (const order of orders) {

        let matches = 0;

        // Skip voided orders
        if (
            String(order.voided)
                .trim()
                .toUpperCase() === "TRUE"
        ) {

            console.group(
                "%c⚠️ VOIDED ORDER SKIPPED",
                "color:orange;font-size:16px;font-weight:bold;"
            );

            console.warn(
                "This order was marked as voided and was not assigned."
            );

            console.log(order);

            console.groupEnd();

            continue;
        }


        for (const block of mealBlocks) {

            // Wrong day
            if (block.day_key !== order.order_day) {
                continue;
            }


            let orderTime = order.order_time_min;
            let end = block.end;


            // Handle overnight meals
            if (end <= block.start) {

                end += 1440;

                if (orderTime < block.start) {
                    orderTime += 1440;
                }

            }


            // Order belongs in this meal block
            if (
                orderTime >= block.start &&
                orderTime <= end
            ) {

                block.orders.push(order);


                // Track online tips separately
                if (
                    order.source === "Online" ||
                    order.server === "DEFAULT ONLINE ORDERING"
                ) {

                    block.online_total +=
                        order.tip +
                        order.gratuity;

                }


                matches++;

            }

        }


        // Order never found a meal block
        if (matches === 0) {

            console.group(
                "%c🚨 ORDER NOT ASSIGNED TO MEAL BLOCK 🚨",
                "color:red;font-size:20px;font-weight:bold;"
            );

            console.error(
                "Could not find a meal block for this order."
            );

            console.log(order);

            console.trace();

            console.groupEnd();

        }


        // Order matched more than one meal block
        if (matches > 1) {

            console.group(
                "%c🚨 ORDER ASSIGNED TO MULTIPLE MEAL BLOCKS 🚨",
                "color:red;font-size:20px;font-weight:bold;"
            );

            console.error(
                "Order matched multiple meal blocks."
            );

            console.log(order);

            console.trace();

            console.groupEnd();

        }

    }

}