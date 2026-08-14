import {
    History
}
from "../model/History.js";

export function exportPayrollSummaryCSV(
    employees,
    tipDistribution
) {

    const history =
        new History(
            tipDistribution
        );


    const rows = [

        [
            "Employee",
            "Sales",
            "Total Tips",
            "Card Take Home",
            "Cash Take Home"
        ]

    ];


    // =========================
    // DATE / TIME
    // =========================

    const now = new Date();

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
    // SORT EMPLOYEES
    // =========================

    const sorted =
        [...employees]
        .sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );


    // =========================
    // BUILD ROWS
    // =========================

    for (
        const employee of sorted
    ) {


        // =========================
        // CARD TAKE HOME
        // KEPT + POOL
        // =========================

        const cardTakeHome =
            (
                employee.card_kept ?? 0
            )
            +
            (
                employee.pool_card ?? 0
            );


        // =========================
        // CASH TAKE HOME
        // KEPT + POOL
        // =========================

        const cashTakeHome =
            (
                employee.cash_kept ?? 0
            )
            +
            (
                employee.pool_cash ?? 0
            );


        // =========================
        // TOTAL TIPS
        // CARD + CASH
        // =========================

        const totalTips =
            cardTakeHome +
            cashTakeHome;


        // =========================
        // CARD TIP PERCENTAGE
        // =========================

        const cardPercentage =
            totalTips > 0
                ? (
                    cardTakeHome /
                    totalTips
                ) * 100
                : 0;


        // =========================
        // CASH TIP PERCENTAGE
        // =========================

        const cashPercentage =
            totalTips > 0
                ? (
                    cashTakeHome /
                    totalTips
                ) * 100
                : 0;


        // =========================
        // CASH ROUNDING
        // =========================

        const roundedCashTakeHome =
            Math.round(
                cashTakeHome / 100
            );


        // =========================
        // ADD ROW
        // =========================

        rows.push([

            `"${employee.name}"`,


            // =========================
            // SALES
            // Cents -> Dollars
            // =========================

            (
                (employee.total_sales || 0)
                / 100
            ).toFixed(2),


            // =========================
            // TOTAL TIPS
            // Card + Cash
            // Cents -> Dollars
            // =========================

            (
                totalTips / 100
            ).toFixed(2),


            // =========================
            // CARD TAKE HOME
            // Dollar Amount + Percentage
            // =========================

            `"${(
                cardTakeHome / 100
            ).toFixed(2)} (${cardPercentage.toFixed(2)}%)"`,


            // =========================
            // CASH TAKE HOME
            // Rounded Dollar Amount + Percentage
            // =========================

            `"${roundedCashTakeHome.toString()} (${cashPercentage.toFixed(2)}%)"`

        ]);

    }


    // =========================
    // CREATE CSV
    // =========================

    const csv =
        rows
        .map(
            row =>
                row.join(",")
        )
        .join("\n");


    // =========================
    // CREATE BLOB
    // =========================

    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    // =========================
    // CREATE DOWNLOAD URL
    // =========================

    const url =
        URL.createObjectURL(
            blob
        );


    // =========================
    // CREATE DOWNLOAD LINK
    // =========================

    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    // =========================
    // FILE NAME
    // =========================

    link.download =
        `HotTips Summary Results - ${history.start_date}_to_${history.end_date} - ${dateTime}.csv`;


    // =========================
    // DOWNLOAD
    // =========================

    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    // =========================
    // CLEAN UP
    // =========================

    URL.revokeObjectURL(
        url
    );

}