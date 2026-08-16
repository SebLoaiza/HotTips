export function assignOrders(mealBlocks, orders) {

    // Clear previous meal block assignments
    for (const block of mealBlocks) {

        block.orders = [];

        block.special_orders = [];

        block.online_total = 0;

    }


    // Assign each order into a meal block
    for (const order of orders) {

        let matches = 0;


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



                // ----------------------------------
                // Special OTHER payment orders
                // ----------------------------------

                const hasSpecialOtherPayment =
                    order.payments?.some(
                        payment =>
                            payment.type
                                .trim()
                                .toUpperCase() === "OTHER"
                            &&
                            (
                                payment.tip > 0 ||
                                payment.gratuity > 0
                            )
                    );


                if (hasSpecialOtherPayment) {

                    block.special_orders.push(order);

                }


                // Track online tips separately



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