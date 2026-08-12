export function calculateCashTips(mealBlocks) {

    let totalCashSales = 0;
    let totalCashDrop = 0;

    // =========================
    // COMBINE EVERY EMPLOYEE
    // =========================

    for (const block of mealBlocks) {

        // Reset block totals
        block.cash_sales = 0;
        block.cash_drop = 0;
        block.cash_tips = 0;

        for (const employee of block.employees) {

            employee.cash_sales =
                Number(employee.cash_sales) || 0;

            employee.cash_drop =
                Number(employee.cash_drop) || 0;

            // Add every employee to the grand totals
            totalCashSales += employee.cash_sales;
            totalCashDrop += employee.cash_drop;

            // Also maintain block totals
            block.cash_sales += employee.cash_sales;
            block.cash_drop += employee.cash_drop;
        }

        // Block-level cash tips
        block.cash_tips =
            Math.max(
                0,
                block.cash_drop -
                block.cash_sales
            );
    }

    // =========================
    // GRAND TOTAL CASH TIPS
    // =========================

    const totalCashTips =
        Math.max(
            0,
            totalCashDrop -
            totalCashSales
        );

    // Store grand totals
    return {
        totalCashSales,
        totalCashDrop,
        totalCashTips
    };
}