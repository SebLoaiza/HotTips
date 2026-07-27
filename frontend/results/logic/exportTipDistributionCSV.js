export function exportTipDistributionCSV(
    tipDistribution
) {


    const rows = [];



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


            rows.push([

                block.date,

                block.meal,


                employee.name,

                employee.employee_id,

                employee.role,


                employee.order_sales ?? 0,



                employee.cash_tips ?? 0,

                employee.card_tips ?? 0,

                (
                    (employee.cash_tips ?? 0)
                    +
                    (employee.card_tips ?? 0)
                ),



                employee.cash_kept ?? 0,

                employee.card_kept ?? 0,



                employee.pool_cash_received ?? 0,

                employee.pool_card_received ?? 0,



                (
                    employee.cash_kept ?? 0
                )
                +
                (
                    employee.pool_cash_received ?? 0
                ),


                (
                    employee.card_kept ?? 0
                )
                +
                (
                    employee.pool_card_received ?? 0
                ),



                (
                    employee.cash_kept ?? 0
                )
                +
                (
                    employee.pool_cash_received ?? 0
                )
                +
                (
                    employee.card_kept ?? 0
                )
                +
                (
                    employee.pool_card_received ?? 0
                ),



                employee.worked_minutes ?? 0,


                employee.order_count ?? 0


            ]);



        }


    }





    downloadCSV(
        rows,
        "HotTips_Distribution_History.csv"
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
                        `"${String(value ?? "")
                        .replaceAll('"','""')}"`
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
                "text/csv"
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