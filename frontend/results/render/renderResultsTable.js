import {
    formatMoney
}
from "./formatters.js";


export function renderResultsTable(
    employees,
    clickHandler
) {


    let currentSort = {
        key: "name",
        direction: "asc"
    };


    const table =
        document.createElement(
            "table"
        );


    table.innerHTML = `

        <thead>

            <tr>

                <th data-sort="name">
                    Employee
                </th>

                <th data-sort="cash">
                    Cash
                </th>

                <th data-sort="card">
                    Card
                </th>

                <th data-sort="total">
                    Total
                </th>

            </tr>

        </thead>

        <tbody></tbody>

    `;


    const body =
        table.querySelector(
            "tbody"
        );


    // =========================
    // CASH ROUNDING
    // =========================

    function roundedCash(
        employee
    ) {

        const cash =
            employee.cash_kept ?? 0;

        return (
            Math.round(
                cash / 100
            ) * 100
        );

    }


    // =========================
    // CARD
    // =========================

    function cardAmount(
        employee
    ) {

        return (
            employee.card_kept ?? 0
        );

    }


    // =========================
    // TOTAL
    // =========================

    function totalAmount(
        employee
    ) {

        return (
            roundedCash(employee)
            +
            cardAmount(employee)
        );

    }


    // =========================
    // LAST NAME
    // =========================

    function lastName(
        employee
    ) {

        const name =
            String(
                employee.name ?? ""
            )
            .trim();


        const parts =
            name.split(/\s+/);


        return (
            parts.length > 0
                ?
                parts[parts.length - 1]
                :
                ""
        );

    }


    // =========================
    // SORT
    // =========================

    function sortEmployees(
        key
    ) {

        const sorted =
            [
                ...employees
            ];


        sorted.sort(
            (a, b) => {

                let A;
                let B;


                // -------------------------
                // NAME
                // -------------------------

                if (
                    key === "name"
                ) {

                    A =
                        lastName(a)
                        .toLowerCase();

                    B =
                        lastName(b)
                        .toLowerCase();


                    const result =
                        A.localeCompare(
                            B
                        );


                    if (
                        result !== 0
                    ) {

                        return (
                            currentSort.direction === "asc"
                                ?
                                result
                                :
                                -result
                        );

                    }


                    // Same last name:
                    // sort by full name

                    A =
                        String(
                            a.name ?? ""
                        )
                        .toLowerCase();

                    B =
                        String(
                            b.name ?? ""
                        )
                        .toLowerCase();

                }


                // -------------------------
                // CASH
                // -------------------------

                else if (
                    key === "cash"
                ) {

                    A =
                        roundedCash(a);

                    B =
                        roundedCash(b);

                }


                // -------------------------
                // CARD
                // -------------------------

                else if (
                    key === "card"
                ) {

                    A =
                        cardAmount(a);

                    B =
                        cardAmount(b);

                }


                // -------------------------
                // TOTAL
                // -------------------------

                else if (
                    key === "total"
                ) {

                    A =
                        totalAmount(a);

                    B =
                        totalAmount(b);

                }


                // -------------------------
                // STRING SORT
                // -------------------------

                if (
                    typeof A === "string"
                ) {

                    return (
                        currentSort.direction === "asc"
                            ?
                            A.localeCompare(B)
                            :
                            B.localeCompare(A)
                    );

                }


                // -------------------------
                // NUMBER SORT
                // -------------------------

                return (
                    currentSort.direction === "asc"
                        ?
                        A - B
                        :
                        B - A
                );

            }
        );


        return sorted;

    }


    // =========================
    // RENDER ROWS
    // =========================

    function renderRows(
        list
    ) {

        body.innerHTML = "";


        for (
            const employee
            of list
        ) {


            const row =
                document.createElement(
                    "tr"
                );


            const cash =
                roundedCash(
                    employee
                );


            const card =
                cardAmount(
                    employee
                );


            const total =
                totalAmount(
                    employee
                );


            row.innerHTML = `

                <td>
                    ${employee.name}
                </td>

                <td>
                    ${formatMoney(
                        cash
                    )}
                </td>

                <td>
                    ${formatMoney(
                        card
                    )}
                </td>

                <td>
                    <strong>
                        ${formatMoney(
                            total
                        )}
                    </strong>
                </td>

            `;


            row.onclick = () => {

                if (clickHandler) {

                    clickHandler(
                        row,
                        employee
                    );

                }

            };


            body.appendChild(
                row
            );

        }

    }


    // =========================
    // SORT HEADERS
    // =========================

    table
        .querySelectorAll(
            "th[data-sort]"
        )
        .forEach(
            header => {

                header.onclick = () => {

                    const key =
                        header.dataset.sort;


                    if (
                        currentSort.key === key
                    ) {

                        currentSort.direction =
                            currentSort.direction === "asc"
                                ?
                                "desc"
                                :
                                "asc";

                    }

                    else {

                        currentSort.key =
                            key;

                        currentSort.direction =
                            "asc";

                    }


                    renderRows(
                        sortEmployees(
                            key
                        )
                    );

                };

            }
        );


    // =========================
    // INITIAL SORT
    // =========================

    renderRows(
        sortEmployees(
            "name"
        )
    );


    return table;

}