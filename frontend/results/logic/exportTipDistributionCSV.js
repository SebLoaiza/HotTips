import {
    formatMoney,
    formatNumber
} from "../utils/formatters.js";

export function exportTipDistributionCSV(
    tipDistribution
) {

    const rows = [];

    // =========================
    // DATE / TIME
    // =========================

    const now =
        new Date();

    const dateTime =
        `${String(
            now.getMonth() + 1
        ).padStart(2, "0")}-` +

        `${String(
            now.getDate()
        ).padStart(2, "0")}-` +

        `${now.getFullYear()} ` +

        `${String(
            now.getHours()
        ).padStart(2, "0")}` +

        `${String(
            now.getMinutes()
        ).padStart(2, "0")}` +

        `${String(
            now.getSeconds()
        ).padStart(2, "0")}`;


    // =========================
    // HEADER
    // =========================

    rows.push([

        "Date",
        "Meal",

        "Employee",
        "Employee ID",
        "Role",

        // -------------------------
        // SALES
        // -------------------------

        "Cash Sales",
        "Card Sales",
        "Total Sales",

        // -------------------------
        // ORIGINAL TIPS
        // -------------------------

        "Original Cash Tips",
        "Original Card Tips",
        "Original Total Tips",

        // -------------------------
        // DISTRIBUTION
        // -------------------------

        "Cash Kept",
        "Card Kept",

        "Pool Cash Received",
        "Pool Card Received",

        "Cash Payout",
        "Card Payout",
        "Total Payout",

        // -------------------------
        // STATS
        // -------------------------

        "Sales / Hr",
        "Orders / Hr",
        "Tips / Hr",
        "Avg Tip / Order",

        // -------------------------
        // WORK
        // -------------------------

        "Worked Minutes",
        "Hours",
        "Orders"

    ]);


    // =========================
    // BUILD ROWS
    // =========================

    for (
        const block of tipDistribution
    ) {

        for (
            const employee of block.employees
        ) {

            // =========================
            // SALES
            // =========================

            const cashSales =
                employee.cash_sales ?? 0;

            const cardSales =
                employee.card_sales ?? 0;

            const totalSales =
                cashSales +
                cardSales;


            // =========================
            // ORIGINAL TIPS
            // =========================

            const cashTips =
                employee.cash_tips ?? 0;

            const cardTips =
                employee.card_tips ?? 0;

            const totalOriginalTips =
                cashTips +
                cardTips;


            // =========================
            // DISTRIBUTION
            // =========================

            const cashKept =
                employee.cash_kept ?? 0;

            const cardKept =
                employee.card_kept ?? 0;

            const poolCashReceived =
                employee.pool_cash_received ?? 0;

            const poolCardReceived =
                employee.pool_card_received ?? 0;


            const cashPayout =
                cashKept +
                poolCashReceived;


            const cardPayout =
                cardKept +
                poolCardReceived;


            const totalPayout =
                cashPayout +
                cardPayout;


            // =========================
            // WORK TIME
            // =========================

            const workedMinutes =
                employee.worked_minutes ?? 0;

            const hours =
                employee.hours ??
                (
                    workedMinutes / 60
                );


            // =========================
            // STATS
            // =========================

            const salesPerHour =
                hours > 0
                    ?
                    totalSales / hours
                    :
                    0;


            const orders =
                employee.order_count ?? 0;


            const ordersPerHour =
                hours > 0
                    ?
                    orders / hours
                    :
                    0;


            const tipsPerHour =
                hours > 0
                    ?
                    totalOriginalTips / hours
                    :
                    0;


            const avgTipPerOrder =
                orders > 0
                    ?
                    totalOriginalTips / orders
                    :
                    0;


            // =========================
            // ADD ROW
            // =========================

            rows.push([

                block.date,

                block.meal,

                employee.name,

                employee.employee_id,

                employee.role,

                // -------------------------
                // SALES
                // -------------------------

                formatMoney(
                    cashSales
                ),

                formatMoney(
                    cardSales
                ),

                formatMoney(
                    totalSales
                ),

                // -------------------------
                // ORIGINAL TIPS
                // -------------------------

                formatMoney(
                    cashTips
                ),

                formatMoney(
                    cardTips
                ),

                formatMoney(
                    totalOriginalTips
                ),

                // -------------------------
                // DISTRIBUTION
                // -------------------------

                formatMoney(
                    cashKept
                ),

                formatMoney(
                    cardKept
                ),

                formatMoney(
                    poolCashReceived
                ),

                formatMoney(
                    poolCardReceived
                ),

                formatMoney(
                    cashPayout
                ),

                formatMoney(
                    cardPayout
                ),

                formatMoney(
                    totalPayout
                ),

                // -------------------------
                // STATS
                // -------------------------

                formatMoney(
                    salesPerHour
                ),

                formatNumber(
                    ordersPerHour
                ),

                formatMoney(
                    tipsPerHour
                ),

                formatMoney(
                    avgTipPerOrder
                ),

                // -------------------------
                // WORK
                // -------------------------

                workedMinutes,

                formatNumber(
                    hours
                ),

                orders

            ]);

        }

    }


    // =========================
    // DOWNLOAD
    // =========================

    downloadCSV(
        rows,
        `HotTips Distribution History - ${dateTime}.csv`
    );

}


// =========================
// CSV CREATION
// =========================

function downloadCSV(
    rows,
    filename
) {

    const csv =
        rows
        .map(
            row =>
                row
                .map(
                    value =>
                        `"${String(
                            value ?? ""
                        ).replaceAll(
                            '"',
                            '""'
                        )}"`
                )
                .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            [
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}