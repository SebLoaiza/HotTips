export function enrichOrdersWithPayments(orders, payments) {

    const orderMap = new Map();


    // Index every order by ID
    for (const order of orders) {

        order.cash_payment = 0;
        order.card_payment = 0;
        order.other_payment = 0;

        // Store every payment attached to this order
        order.payments = [];

        orderMap.set(order.order_id, order);

    }


    // Attach each payment to its order
    for (const payment of payments) {

        const order = orderMap.get(payment.order_id);

        if (!order) {

            console.log(
                "No matching order:",
                payment.payment_id
            );

            continue;

        }


        // Keep the full payment object
        order.payments.push(payment);


        console.log(
            "Payment:",
            payment.payment_id,
            payment.type,
            payment.amount
        );


        switch (payment.type.trim().toUpperCase()) {

            case "CASH":

                order.cash_payment += payment.amount;

                console.log(" -> Cash");

                break;


            case "CARD":
            case "CREDIT":
            case "CREDIT CARD":

                order.card_payment += payment.amount;

                console.log(" -> Card");

                break;


            case "OTHER":

                order.other_payment += payment.amount;

                console.log(" -> Other");

                break;


            default:

                // Unknown payment types are treated as "Other"
                order.other_payment += payment.amount;

                console.log(
                    " -> Unknown Type:",
                    payment.type
                );

                break;

        }

    }


    // Print a few orders for debugging
    console.log("========== Orders ==========");

    for (let i = 0; i < Math.min(10, orders.length); i++) {

        console.log(orders[i]);

    }

}