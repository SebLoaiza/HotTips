export function exportResults(
    employees
) {


    const headers = [

        "Employee ID",
        "Name",

        "Original Cash Tips",
        "Original Card Tips",
        "Original Tips",

        "Sales",

        "Cash Kept",
        "Card Kept",

        "Pool Cash",
        "Pool Card",

        "Total Payout",

        "Orders",
        "Worked Minutes"

    ];



    const rows =
        employees.map(
            employee => {


                return [

                    employee.employee_id,

                    employee.name,


                    employee.original_cash_tips,

                    employee.original_card_tips,

                    employee.original_tips,


                    employee.sales,


                    employee.cash_kept,

                    employee.card_kept,


                    employee.pool_cash,

                    employee.pool_card,


                    employee.total_payout,


                    employee.order_count,

                    employee.worked_minutes

                ];

            }
        );



    const csv =
        [
            headers,
            ...rows
        ]
        .map(
            row =>
                row.join(",")
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
        "HotTips_Results.csv";


    link.click();



    URL.revokeObjectURL(
        url
    );

}