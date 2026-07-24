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

                <th>Distribution Role</th>

                ${
                    isTipOwners

                    ?

                    `

                    <th>Card Tips</th>

                    <th>Net Card</th>

                    <th>Cash Sold</th>

                    <th>Cash Drop</th>

                    <th>Cash Remaining</th>

                    <th>Server Card</th>

                    <th>BOH Card</th>

                    <th>Busser Card</th>

                    <th>Host Card</th>

                    <th>Server Cash</th>

                    <th>BOH Cash</th>

                    <th>Busser Cash</th>

                    <th>Host Cash</th>

                    <th>Total Kept</th>

                    `

                    :

                    `

                    <th>Shift</th>

                    <th>Worked</th>

                    <th>Breaks</th>

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

        if (isTipOwners) {

            const totalKept =

                (employee.card_kept ?? 0)

                +

                (employee.cash_kept ?? 0);

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
                    ${formatMoney(employee.card_tips)}
                </td>

                <td>
                    ${formatMoney(employee.card_after_fee)}
                </td>

                <td>
                    ${formatMoney(employee.cash_sold)}
                </td>

                <td>
                    ${formatMoney(employee.cash_drop)}
                </td>

                <td>
                    ${formatMoney(employee.cash_remaining)}
                </td>

                <td>
                    ${formatMoney(
                        employee.server_card_contribution
                    )}
                </td>

                <td>
                    ${formatMoney(
                        employee.boh_card_contribution
                    )}
                </td>

                <td>
                    ${formatMoney(
                        employee.busser_card_contribution
                    )}
                </td>

                <td>
                    ${formatMoney(
                        employee.host_card_contribution
                    )}
                </td>

                <td>
                    ${formatMoney(
                        employee.server_cash_contribution
                    )}
                </td>

                <td>
                    ${formatMoney(
                        employee.boh_cash_contribution
                    )}
                </td>

                <td>
                    ${formatMoney(
                        employee.busser_cash_contribution
                    )}
                </td>

                <td>
                    ${formatMoney(
                        employee.host_cash_contribution
                    )}
                </td>

                <td>
                    ${formatMoney(totalKept)}
                </td>

            `;

        }

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
                    ${employee.worked_minutes} mins
                </td>

                <td>
                    ${renderBreaks(employee.breaks)}
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