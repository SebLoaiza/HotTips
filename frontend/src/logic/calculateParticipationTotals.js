export function calculateParticipationTotals(mealBlocks) {

    for (const block of mealBlocks) {

        for (const employee of block.employees) {

            employee.order_sales = 0;
            employee.card_sales = 0;
            employee.card_tips = 0;
            employee.cash_sales = 0;

            for (const order of employee.orders) {

                employee.order_sales += order.amount;

                employee.card_sales += order.card_payment;

                employee.cash_sales += order.cash_payment;

                // THIS LINE
                employee.card_tips +=
                    (order.tip || 0) +
                    (order.gratuity || 0);

            }

            employee.cash_available =
                employee.cash_drop - employee.cash_sales;

        }

    }

}