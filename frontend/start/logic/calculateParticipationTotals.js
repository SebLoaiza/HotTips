export function calculateParticipationTotals(mealBlocks) {

    for (const block of mealBlocks) {

        for (const employee of block.employees) {

            employee.order_sales = 0;

            employee.card_sales = 0;
            employee.card_tips = 0;

            employee.cash_sales = 0;


            for (const order of employee.orders) {

                employee.order_sales += order.amount;


                employee.card_sales +=
                    order.card_payment;


                employee.cash_sales +=
                    order.cash_payment;



                // Only count tips/gratuity that were paid by card.
                // Cash gratuity is handled through the cash drop.
                if (order.card_payment > 0) {

                    employee.card_tips +=
                        (order.tip || 0) +
                        (order.gratuity || 0);

                }

            }


            // Cash left after covering sales.
            // This is the employee's cash tips.
            employee.cash_available =
                employee.cash_drop -
                employee.cash_sales;

        }

    }

}