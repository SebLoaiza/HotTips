export function enrichOrdersWithPayments(
    orders,
    payments
) {

    const orderMap = new Map();

    // =================================================
    // INDEX EVERY ORDER BY ORDER ID
    // =================================================

    for (const order of orders) {

        order.cash_payment = 0;
        order.card_payment = 0;
        order.other_payment = 0;

        order.payments = [];

        orderMap.set(
            order.order_id,
            order
        );

    }


    // =================================================
    // TRACK RESULTS
    // =================================================

    let attachedCount = 0;
    let unmatchedCount = 0;

    const unmatchedPayments = [];


    // =================================================
    // ATTACH PAYMENTS TO ORDERS
    // =================================================

    for (const payment of payments) {

        const order =
            orderMap.get(
                payment.order_id
            );


        // =================================================
        // NO MATCHING ORDER
        // =================================================

        if (!order) {

            unmatchedCount++;

            unmatchedPayments.push(
                payment
            );

            continue;

        }


        // =================================================
        // PAYMENT SUCCESSFULLY ATTACHED
        // =================================================

        order.payments.push(
            payment
        );

        attachedCount++;


        // =================================================
        // CLASSIFY PAYMENT
        // =================================================

        const type =
            String(
                payment.type || ""
            )
            .trim()
            .toUpperCase();


        switch (type) {

            case "CASH":

                order.cash_payment +=
                    payment.amount;

                break;


            case "CARD":

            case "CREDIT":

            case "CREDIT CARD":

                order.card_payment +=
                    payment.amount;

                break;


            case "OTHER":

                order.other_payment +=
                    payment.amount;

                break;


            default:

                console.error(
                    "UNKNOWN PAYMENT TYPE",
                    {
                        paymentId:
                            payment.payment_id,

                        orderId:
                            payment.order_id,

                        type:
                            payment.type,

                        amount:
                            payment.amount
                    }
                );

                order.other_payment +=
                    payment.amount;

                break;

        }

    }


    // =================================================
    // SUMMARY
    // =================================================

    console.log(
        "========================================"
    );

    console.log(
        "PAYMENT ENRICHMENT SUMMARY"
    );

    console.log(
        "========================================"
    );

    console.log(
        "Orders:",
        orders.length
    );

    console.log(
        "Payments:",
        payments.length
    );

    console.log(
        "Attached:",
        attachedCount
    );

    console.log(
        "Unmatched:",
        unmatchedCount
    );

    console.log(
        "========================================"
    );


    // =================================================
    // SHOW UNMATCHED PAYMENTS
    // =================================================

    if (unmatchedPayments.length > 0) {

        console.error(
            "UNMATCHED PAYMENTS:",
            unmatchedPayments
        );

    } else {

        console.log(
            "All payments successfully attached."
        );

    }


    // =================================================
    // RETURN RESULTS
    // =================================================

    return {
        attachedCount,
        unmatchedCount,
        unmatchedPayments
    };

}