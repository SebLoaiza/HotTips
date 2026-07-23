// =========================
// MONEY FORMATTER
// =========================

export function formatMoney(
    cents
) {

    cents =
        Number(cents) || 0;


    return (
        "$" +
        (cents / 100)
        .toFixed(2)
    );

}   


export function renderPayoutTable(
    payouts
) {

    const container =
        document.createElement("div");


    container.className =
        "payout-table-container";



    const table =
        document.createElement("table");


    table.innerHTML = `

        <thead>

            <tr>

                <th>Name</th>

                <th>Cash Payout</th>

                <th>Card Payout</th>

                <th>Total</th>

            </tr>

        </thead>

    `;



    const body =
        document.createElement("tbody");



    for (const employee of payouts) {


        const row =
            document.createElement("tr");



        row.innerHTML = `

            <td>
                ${employee.name}
            </td>


            <td>
                ${formatMoney(
                    employee.cash_payout
                )}
            </td>


            <td>
                ${formatMoney(
                    employee.card_payout
                )}
            </td>


            <td>
                ${formatMoney(
                    employee.total_payout
                )}
            </td>

        `;



        body.appendChild(row);

    }



    table.appendChild(body);


    container.appendChild(table);



    return container;

}