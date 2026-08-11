function money(cents) {

    return `$${(
        (Number(cents) || 0) / 100
    ).toFixed(2)}`;

}


export function renderCashTipSummary(
    mealBlocks,
    selectedDay = null
) {

    const output =
        document.getElementById(
            "cashTipSummary"
        );

    if (!output) {
        return;
    }

    output.innerHTML = "";

    let blocksToRender =
        mealBlocks;


    // =================================================
    // FILTER BY SELECTED DAY
    // =================================================

    if (selectedDay) {

        blocksToRender =
            mealBlocks.filter(
                block =>
                    block.day_key ===
                    selectedDay
            );

    }


    // =================================================
    // OVERALL TOTALS
    // =================================================

    let grandCashSales = 0;
    let grandCashDrop = 0;
    let grandCashTips = 0;


    // =================================================
    // INDIVIDUAL MEAL BLOCK TABLES
    // =================================================

    for (const block of blocksToRender) {

        const wrap =
            document.createElement(
                "div"
            );

        wrap.className =
            "panel";


        let html = `

            <h3>
                ${block.meal} • ${block.date}
            </h3>

            <table class="summary-table">

                <thead>

                    <tr>

                        <th>
                            Employee
                        </th>

                        <th>
                            Cash Sales
                        </th>

                        <th>
                            Cash Drop
                        </th>

                        <th>
                            Cash Tips
                        </th>

                    </tr>

                </thead>

                <tbody>

        `;


        // =================================================
        // BLOCK TOTALS
        // =================================================

        let blockCashSales = 0;
        let blockCashDrop = 0;
        let blockCashTips = 0;


        // =================================================
        // EMPLOYEE ROWS
        // =================================================

        for (const employee of block.employees) {

            const cashSales =
                Number(
                    employee.cash_sales
                ) || 0;

            const cashDrop =
                Number(
                    employee.cash_drop
                ) || 0;

            const cashTips =
                Number(
                    employee.cash_tips
                ) || 0;


            // -------------------------
            // BLOCK TOTALS
            // -------------------------

            blockCashSales +=
                cashSales;

            blockCashDrop +=
                cashDrop;

            blockCashTips +=
                cashTips;


            // -------------------------
            // GRAND TOTALS
            // -------------------------

            grandCashSales +=
                cashSales;

            grandCashDrop +=
                cashDrop;

            grandCashTips +=
                cashTips;


            // -------------------------
            // EMPLOYEE ROW
            // -------------------------

            html += `

                <tr>

                    <td>
                        ${employee.name}
                    </td>

                    <td>
                        ${money(
                            cashSales
                        )}
                    </td>

                    <td>
                        ${money(
                            cashDrop
                        )}
                    </td>

                    <td>
                        ${money(
                            cashTips
                        )}
                    </td>

                </tr>

            `;

        }


        // =================================================
        // MEAL BLOCK TOTAL
        // =================================================

        html += `

                <tr>

                    <th>
                        Total
                    </th>

                    <th>
                        ${money(
                            blockCashSales
                        )}
                    </th>

                    <th>
                        ${money(
                            blockCashDrop
                        )}
                    </th>

                    <th>
                        ${money(
                            blockCashTips
                        )}
                    </th>

                </tr>

                </tbody>

            </table>

        `;


        wrap.innerHTML =
            html;


        output.appendChild(
            wrap
        );

    }


    // =================================================
    // OVERALL TABLE
    // =================================================

    if (
        blocksToRender.length > 0
    ) {

        const totalWrap =
            document.createElement(
                "div"
            );

        totalWrap.className =
            "panel";


        let totalHtml = `

            <h3>
                Overall Cash Tip Totals
            </h3>

            <table class="summary-table">

                <thead>

                    <tr>

                        <th>
                            Date
                        </th>

                        <th>
                            Meal
                        </th>

                        <th>
                            Employee
                        </th>

                        <th>
                            Cash Sales
                        </th>

                        <th>
                            Cash Drop
                        </th>

                        <th>
                            Cash Tips
                        </th>

                    </tr>

                </thead>

                <tbody>

        `;


        // =================================================
        // EVERY EMPLOYEE / DROP
        // =================================================

        for (
            const block
            of blocksToRender
        ) {

            for (
                const employee
                of block.employees
            ) {

                const cashSales =
                    Number(
                        employee.cash_sales
                    ) || 0;

                const cashDrop =
                    Number(
                        employee.cash_drop
                    ) || 0;

                const cashTips =
                    Number(
                        employee.cash_tips
                    ) || 0;


                totalHtml += `

                    <tr>

                        <td>
                            ${block.date}
                        </td>

                        <td>
                            ${block.meal}
                        </td>

                        <td>
                            ${employee.name}
                        </td>

                        <td>
                            ${money(
                                cashSales
                            )}
                        </td>

                        <td>
                            ${money(
                                cashDrop
                            )}
                        </td>

                        <td>
                            ${money(
                                cashTips
                            )}
                        </td>

                    </tr>

                `;

            }

        }


        // =================================================
        // GRAND TOTAL
        // =================================================

        totalHtml += `

                    <tr>

                        <th colspan="3">
                            GRAND TOTAL
                        </th>

                        <th>
                            ${money(
                                grandCashSales
                            )}
                        </th>

                        <th>
                            ${money(
                                grandCashDrop
                            )}
                        </th>

                        <th>
                            ${money(
                                grandCashTips
                            )}
                        </th>

                    </tr>

                </tbody>

            </table>

        `;


        totalWrap.innerHTML =
            totalHtml;


        output.appendChild(
            totalWrap
        );

    }

}