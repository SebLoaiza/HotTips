import {
    formatTime,
    renderBreaks,
    formatMoney
}
from "./formatters.js";

import {
    renderRoleSelect
}
from "./renderRoleSelect.js";

export function renderEmployeeTable(
    title,
    employees,
    mealBlock
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "employee-table";

    wrapper.innerHTML =
        `<h3>${title} (${employees.length})</h3>`;

    if (employees.length === 0) {

        wrapper.innerHTML +=
            "<p>No Employees</p>";

        return wrapper;

    }

    const isTipOwners =
        title === "Tip Owners";

    const table =
        document.createElement("table");

    table.innerHTML = `

        <thead>

            <tr>

                <th>Name</th>

                <th>Role</th>

                <th>Dist. Role</th>

                ${
                    isTipOwners

                    ?

                    `

                    <th>Net Card Tips</th>

                    <th>Cash Tips</th>

                    <th>Server Tips</th>

                    <th>BOH Tips</th>

                    <th>Busser Tips</th>

                    <th>Host Tips</th>

                    <th>Total Kept</th>

                    `

                    :

                    `

                    <th>Shift</th>

                    <th>Tip Points</th>

                    <th>Pool Card Received</th>

                    <th>Pool Cash Received</th>

                    <th>Trainer</th>

                    `
                }

            </tr>

        </thead>

    `;

    const body =
        document.createElement("tbody");


    for (const employee of employees) {

        const row =
            document.createElement("tr");


        // =====================================================
        // TIP OWNERS
        // =====================================================

        if (isTipOwners) {

            // =================================================
            // PERSON'S TIP DROP
            // =================================================

            const cardTips =
                employee.card_after_fee ?? 0;

            const cashTips =
                employee.cash_remaining ?? 0;


            // =================================================
            // PERSON'S TOTAL TIPS
            //
            // This is the denominator for all percentages.
            // =================================================

            const cashTipsForPercentage =
                Math.max(cashTips, 0);

            const personTotalTips =
                cardTips +
                cashTipsForPercentage;


            // =================================================
            // CARD / CASH PERCENTAGES
            //
            // EDGE CASE:
            // If cash is negative:
            //
            //     Card = 100%
            //     Cash = 0%
            //
            // The actual dollar amounts are NOT changed.
            // =================================================

            let cardPercentage = 0;

            let cashPercentage = 0;


            if (cashTips < 0) {

                cardPercentage = 100;

                cashPercentage = 0;

            }

            else if (personTotalTips > 0) {

                cardPercentage =
                    (cardTips / personTotalTips) * 100;

                cashPercentage =
                    (cashTips / personTotalTips) * 100;

            }


            // =================================================
            // ROLE TIP AMOUNTS
            // =================================================

            const serverTips =
                (employee.server_card_contribution ?? 0)
                +
                (employee.server_cash_contribution ?? 0);

            const bohTips =
                (employee.boh_card_contribution ?? 0)
                +
                (employee.boh_cash_contribution ?? 0);

            const busserTips =
                (employee.busser_card_contribution ?? 0)
                +
                (employee.busser_cash_contribution ?? 0);

            const hostTips =
                (employee.host_card_contribution ?? 0)
                +
                (employee.host_cash_contribution ?? 0);


            // =================================================
            // ROLE PERCENTAGES
            //
            // Each role is compared against THIS TIP OWNER'S
            //
            // Net Card Tips + Cash Tips
            // =================================================

            const serverPercentage =
                personTotalTips > 0
                    ? (serverTips / personTotalTips) * 100
                    : 0;

            const bohPercentage =
                personTotalTips > 0
                    ? (bohTips / personTotalTips) * 100
                    : 0;

            const busserPercentage =
                personTotalTips > 0
                    ? (busserTips / personTotalTips) * 100
                    : 0;

            const hostPercentage =
                personTotalTips > 0
                    ? (hostTips / personTotalTips) * 100
                    : 0;


            // =================================================
            // TOTAL KEPT
            // =================================================

            const totalKept =
                (employee.card_kept ?? 0)
                +
                (employee.cash_kept ?? 0);


            // =================================================
            // TOTAL KEPT PERCENTAGE
            //
            // Total Kept /
            // (Net Card Tips + Cash Tips)
            // =================================================

            const totalKeptPercentage =
                personTotalTips > 0
                    ? (totalKept / personTotalTips) * 100
                    : 0;


            // =================================================
            // RENDER TIP OWNER ROW
            // =================================================

            row.innerHTML = `

                <td>
                    ${employee.name}
                </td>

                <td>
                    ${employee.role}
                </td>

                <td>
                    ${renderRoleSelect(employee)}
                </td>


                <!-- =========================================
                     NET CARD TIPS
                     ========================================= -->

                <td>

                    ${formatMoney(cardTips)}

                    <span class="tip-percentage">
                        (${cardPercentage.toFixed(1)}%)
                    </span>

                </td>


                <!-- =========================================
                     CASH TIPS
                     ========================================= -->

                <td class="${cashTips < 0 ? 'negative-cash' : ''}">

                    ${formatMoney(cashTips)}

                    <span class="tip-percentage">
                        (${cashPercentage.toFixed(1)}%)
                    </span>

                </td>


                <!-- =========================================
                     SERVER TIPS
                     ========================================= -->

                <td>

                    ${formatMoney(serverTips)}

                    <span class="tip-percentage">
                        (${serverPercentage.toFixed(1)}%)
                    </span>

                </td>


                <!-- =========================================
                     BOH TIPS
                     ========================================= -->

                <td>

                    ${formatMoney(bohTips)}

                    <span class="tip-percentage">
                        (${bohPercentage.toFixed(1)}%)
                    </span>

                </td>


                <!-- =========================================
                     BUSSER TIPS
                     ========================================= -->

                <td>

                    ${formatMoney(busserTips)}

                    <span class="tip-percentage">
                        (${busserPercentage.toFixed(1)}%)
                    </span>

                </td>


                <!-- =========================================
                     HOST TIPS
                     ========================================= -->

                <td>

                    ${formatMoney(hostTips)}

                    <span class="tip-percentage">
                        (${hostPercentage.toFixed(1)}%)
                    </span>

                </td>


                <!-- =========================================
                     TOTAL KEPT
                     ========================================= -->

                <td>

                    ${formatMoney(totalKept)}

                    <span class="tip-percentage">
                        (${totalKeptPercentage.toFixed(1)}%)
                    </span>

                </td>

            `;

        }


        // =====================================================
        // ALL OTHER EMPLOYEES
        // =====================================================

        else {

            const isTrainee =
                employee.is_trainee;


            const trainerDisplay =
                employee.is_trainee
                    ? (
                        employee.trainer_employee_id
                            ?
                            ` ${employee.trainer_employee_name}`
                            :
                            `<span style="color:red;font-weight:bold;">
                                NO TRAINER ASSIGNED
                            </span>`
                    )
                    : "-";


            row.innerHTML = `

                <td>
                    ${employee.name}
                </td>

                <td>
                    ${employee.role}
                </td>

                <td>
                    ${renderRoleSelect(employee)}
                </td>

                <td>

                    ${formatTime(employee.meal_start)}

                    -

                    ${formatTime(employee.meal_end)}

                </td>

                <td>

                    <input
                        class="tip-point-input"
                        type="number"
                        step="0.1"
                        min="0"
                        value="${employee.tip_points ?? 1}"
                        data-employee-id="${employee.employee_id}"
                        data-meal-block-id="${mealBlock.id}"
                    >

                </td>

                <td>

                    ${formatMoney(
                        employee.pool_card_received
                    )}

                </td>

                <td>

                    ${formatMoney(
                        employee.pool_cash_received
                    )}

                </td>

                <td>

                    ${trainerDisplay}

                </td>

            `;

        }


        body.appendChild(row);

    }


    table.appendChild(body);

    wrapper.appendChild(table);

    return wrapper;

}