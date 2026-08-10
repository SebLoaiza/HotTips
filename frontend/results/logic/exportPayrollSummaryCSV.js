export function exportPayrollSummaryCSV(
    employees
) {

    const rows = [

        [
            "Employee",
            "Sales",
            "Card Take Home",
            "Cash Take Home"
        ]

    ];

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
        // =========================
        //
        // Card remains accurate
        // to the nearest cent.
        //

        const cardTakeHome =
            (
                employee.card_kept ?? 0
            )
            +
            (
                employee.pool_card_received ?? 0
            );


        // =========================
        // CASH TAKE HOME
        // =========================
        //
        // Cash is rounded to the
        // nearest whole dollar.
        //

        const cashTakeHome =
            (
                employee.cash_kept ?? 0
            )
            +
            (
                employee.pool_cash_received ?? 0
            );


        const roundedCashTakeHome =
            Math.round(
                cashTakeHome / 100
            );


        // =========================
        // ADD ROW
        // =========================

        rows.push([

            `"${employee.name}"`,

            // Sales — cents

            (
                (employee.card_sales || 0)
                / 100
            ).toFixed(2),


            // Card Take Home — cents

            (
                cardTakeHome / 100
            ).toFixed(2),


            // Cash Take Home —
            // nearest whole dollar

            roundedCashTakeHome.toString()

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


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    // =========================
    // DOWNLOAD
    // =========================

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
        `Payroll Summary - ${dateTime}.csv`;


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