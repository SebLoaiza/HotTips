import {
    formatMoney
}
from "../utils/formatters.js";


export function renderPayrollSummary(
    employees
) {

    const container =
        document.createElement(
            "div"
        );

    container.className =
        "printSheet";


    const sorted =
        [...employees]
        .sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );


    container.innerHTML = `

        <h2>
            Payroll Summary
        </h2>


        <table class="summaryTable">


            <thead>

                <tr>

                    <th>
                        Employee
                    </th>


                    <th>
                        Sales
                    </th>


                    <th>
                        Card Take Home
                    </th>


                    <th>
                        Cash Take Home
                    </th>


                </tr>

            </thead>



            <tbody>


                ${sorted.map(employee => `

                    <tr>


                        <td>

                            ${employee.name}

                        </td>



                        <td>

                            ${formatMoney(
                                employee.total_sales
                            )}

                        </td>



                        <td>

                            ${formatMoney(

                                (
                                    employee.card_kept ?? 0
                                )
                                +
                                (
                                    employee.pool_card_received ?? 0
                                )

                            )}

                        </td>



                        <td>

                            ${formatMoney(

                                (
                                    employee.cash_kept ?? 0
                                )
                                +
                                (
                                    employee.pool_cash_received ?? 0
                                )

                            )}

                        </td>



                    </tr>


                `).join("")}



            </tbody>


        </table>


    `;


    return container;

}