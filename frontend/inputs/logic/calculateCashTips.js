export function calculateCashTips(mealBlocks) {

    for (const block of mealBlocks) {

        block.cash_sales = 0;
        block.cash_drop = 0;
        block.cash_tips = 0;

        for (const employee of block.employees) {

            employee.cash_sales =
                Number(employee.cash_sales) || 0;

            employee.cash_drop =
                Number(employee.cash_drop) || 0;

            employee.cash_tips =
                Math.max(
                    0,
                    employee.cash_drop -
                    employee.cash_sales
                );

            block.cash_sales += employee.cash_sales;
            block.cash_drop += employee.cash_drop;
            block.cash_tips += employee.cash_tips;

        }

    }

}