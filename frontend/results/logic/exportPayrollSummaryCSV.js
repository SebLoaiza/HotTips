export function exportPayrollSummaryCSV(
    employees
) {

    const rows = [

        [
            "Employee",
            "Sales",
            "Take Home"
        ]

    ];


    const sorted =
        [...employees]
        .sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );


    for (
        const employee of sorted
    ) {

        rows.push([

            `"${employee.name}"`,

            (
                (employee.card_sales || 0)
                / 100
            ).toFixed(2),

            (
                (employee.total_payout || 0)
                / 100
            ).toFixed(2)

        ]);

    }


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
                type: "text/csv;charset=utf-8;"
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
        "Payroll Summary.csv";


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