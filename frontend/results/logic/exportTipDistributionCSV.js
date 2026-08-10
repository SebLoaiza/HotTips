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

        "Sales",

        "Original Cash Tips",
        "Original Card Tips",
        "Original Total Tips",

        "Cash Kept",
        "Card Kept",

        "Pool Cash Received",
        "Pool Card Received",

        "Cash Payout",
        "Card Payout",
        "Total Payout",

        "Worked Minutes",

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

            const cashPayout =
                (
                    employee.cash_kept ?? 0
                )
                +
                (
                    employee.pool_cash_received ?? 0
                );


            const cardPayout =
                (
                    employee.card_kept ?? 0
                )
                +
                (
                    employee.pool_card_received ?? 0
                );


            const totalPayout =
                cashPayout +
                cardPayout;


            const totalOriginalTips =
                (
                    employee.cash_tips ?? 0
                )
                +
                (
                    employee.card_tips ?? 0
                );


            rows.push([

                block.date,

                block.meal,


                employee.name,

                employee.employee_id,

                employee.role,


                employee.order_sales ?? 0,


                employee.cash_tips ?? 0,

                employee.card_tips ?? 0,

                totalOriginalTips,


                employee.cash_kept ?? 0,

                employee.card_kept ?? 0,


                employee.pool_cash_received ?? 0,

                employee.pool_card_received ?? 0,


                cashPayout,

                cardPayout,

                totalPayout,


                employee.worked_minutes ?? 0,

                employee.order_count ?? 0

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