export function enrichOrdersWithPayments(orders, payments) {

    const orderMap = new Map();

    // -----------------------------
    // Index every order
    // -----------------------------

    for (const order of orders) {

        order.cash_payment = 0;
        order.card_payment = 0;
        order.other_payment = 0;

        orderMap.set(order.order_id, order);

    }

    // -----------------------------
    // Apply payments
    // -----------------------------

    for (const payment of payments) {

        const order = orderMap.get(payment.order_id);

        if (!order) {

            console.log(
                "No matching order:",
                payment.order_id
            );

            continue;

        }

        console.log(
            "Payment:",
            payment.order_id,
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

            default:

                order.other_payment += payment.amount;

                console.log(
                    " -> OTHER:",
                    payment.type
                );

                break;

        }

    }

    // -----------------------------
    // Print a few orders
    // -----------------------------

    console.log("========== Orders ==========");

    for (let i = 0; i < Math.min(10, orders.length); i++) {

        console.log(orders[i]);

    }

}