export function assignOrders(
    mealBlocks,
    orders
) {


    for (const block of mealBlocks) {

        block.orders = [];

    }



    for (const order of orders) {


        let matches = 0;



        for (const block of mealBlocks) {


            if (
                block.day_key !==
                order.order_day
            ) {
                continue;
            }



            let orderTime =
                order.order_time_min;


            let end =
                block.end;



            if (end <= block.start) {

                end += 1440;


                if (orderTime < block.start) {

                    orderTime += 1440;

                }

            }



            if (
                orderTime >= block.start &&
                orderTime <= end
            ) {

                block.orders.push(order);

                matches++;

            }

        }



        if (matches === 0) {

            console.error(
                "ORDER NOT ASSIGNED TO MEAL BLOCK",
                order
            );

        }



        if (matches > 1) {

            console.error(
                "ORDER ASSIGNED TO MULTIPLE MEAL BLOCKS",
                order
            );

        }

    }

}