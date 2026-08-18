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

import {
    rebuildDistributionPools
}
from "./../logic/rebuildDistributionPools.js";

import {
    calculateRoleRatios
}
from "./../logic/calculateRoleRatios.js";


export function renderEmployeeTable(
    title,
    employees,
    mealBlock,
    refreshUI
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "employee-table";


    wrapper.innerHTML =
        `<h3>${title} (${employees.length})</h3>`;


    if (
        employees.length === 0
    ) {

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

                    <th>Net CC Tips</th>

                    <th>Cash Tips</th>

                    <th>Server Split</th>

                    <th>BOH Split</th>

                    <th>Busser Split</th>

                    <th>Host Split</th>

                    <th>Total Kept</th>

                    `
                    :
                    `

                    <th>Shift</th>

                    <th>Tip Points</th>

                    <th>Pool CC Received</th>

                    <th>Pool Cash Received</th>

                    <th>Trainer</th>

                    `
                }

            </tr>

        </thead>

    `;


    const body =
        document.createElement("tbody");


    // =====================================================
    // TIP OWNER TOTALS
    // =====================================================

    let totalCardTips = 0;

    let totalCashTips = 0;

    let totalServerTips = 0;

    let totalBohTips = 0;

    let totalBusserTips = 0;

    let totalHostTips = 0;

    let totalKept = 0;


    for (
        const employee
        of employees
    ) {

        const row =
            document.createElement("tr");


        // =====================================================
        // TIP OWNERS
        // =====================================================

        if (
            isTipOwners
        ) {

            const cardTips =
                Number(
                    employee.card_after_fee ?? 0
                );


            const cashTips =
                Number(
                    employee.cash_remaining ?? 0
                );


            // =================================================
            // PERSON TOTAL
            // =================================================

            const cashTipsForPercentage =
                Math.max(
                    cashTips,
                    0
                );


            const personTotalTips =
                cardTips +
                cashTipsForPercentage;


            // =================================================
            // CARD / CASH PERCENTAGES
            // =================================================

            let cardPercentage =
                0;

            let cashPercentage =
                0;


            if (
                cashTips < 0
            ) {

                cardPercentage =
                    100;

                cashPercentage =
                    0;

            }

            else if (
                personTotalTips > 0
            ) {

                cardPercentage =
                    (
                        cardTips /
                        personTotalTips
                    ) * 100;


                cashPercentage =
                    (
                        cashTips /
                        personTotalTips
                    ) * 100;

            }


            // =================================================
            // ROLE TIP AMOUNTS
            // =================================================

            const serverTips =
                Number(
                    employee.server_card_contribution ?? 0
                )
                +
                Number(
                    employee.server_cash_contribution ?? 0
                );


            const bohTips =
                Number(
                    employee.boh_card_contribution ?? 0
                )
                +
                Number(
                    employee.boh_cash_contribution ?? 0
                );


            const busserTips =
                Number(
                    employee.busser_card_contribution ?? 0
                )
                +
                Number(
                    employee.busser_cash_contribution ?? 0
                );


            const hostTips =
                Number(
                    employee.host_card_contribution ?? 0
                )
                +
                Number(
                    employee.host_cash_contribution ?? 0
                );


            // =================================================
            // ROLE PERCENTAGES
            // =================================================

            const serverPercentage =
                personTotalTips > 0
                    ?
                    (
                        serverTips /
                        personTotalTips
                    ) * 100
                    :
                    0;


            const bohPercentage =
                personTotalTips > 0
                    ?
                    (
                        bohTips /
                        personTotalTips
                    ) * 100
                    :
                    0;


            const busserPercentage =
                personTotalTips > 0
                    ?
                    (
                        busserTips /
                        personTotalTips
                    ) * 100
                    :
                    0;


            const hostPercentage =
                personTotalTips > 0
                    ?
                    (
                        hostTips /
                        personTotalTips
                    ) * 100
                    :
                    0;


            // =================================================
            // TOTAL KEPT
            // =================================================

            const isServer =
                employee.distribution_role === "server";


            let employeeTotalKept = 0;

            let totalKeptPercentage = 0;


            if (
                isServer
            ) {

                employeeTotalKept =
                    Number(
                        employee.card_kept ?? 0
                    )
                    +
                    Number(
                        employee.cash_kept ?? 0
                    );


                totalKeptPercentage =
                    personTotalTips > 0
                        ?
                        (
                            employeeTotalKept /
                            personTotalTips
                        ) * 100
                        :
                        0;


                totalKept +=
                    employeeTotalKept;

            }


            // =================================================
            // ADD TO TOTALS
            // =================================================

            totalCardTips +=
                cardTips;


            totalCashTips +=
                cashTips;


            totalServerTips +=
                serverTips;


            totalBohTips +=
                bohTips;


            totalBusserTips +=
                busserTips;


            totalHostTips +=
                hostTips;


            // =================================================
            // RENDER TIP OWNER
            // =================================================

            row.innerHTML = `

                <td>
                    ${formatEmployeeName(employee.name)}
                </td>

                <td>
                    ${employee.role}
                </td>

                <td>
                    ${renderRoleSelect(employee)}
                </td>

                <td>

                    ${formatMoney(cardTips)}

                    <span class="tip-percentage">
                        (${cardPercentage.toFixed(1)}%)
                    </span>

                </td>

                <td class="${cashTips < 0 ? "negative-cash" : ""}">

                    ${formatMoney(cashTips)}

                    <span class="tip-percentage">
                        (${cashPercentage.toFixed(1)}%)
                    </span>

                </td>

                <td>

                    ${formatMoney(serverTips)}

                    <span class="tip-percentage">
                        (${serverPercentage.toFixed(1)}%)
                    </span>

                </td>

                <td>

                    ${formatMoney(bohTips)}

                    <span class="tip-percentage">
                        (${bohPercentage.toFixed(1)}%)
                    </span>

                </td>

                <td>

                    ${formatMoney(busserTips)}

                    <span class="tip-percentage">
                        (${busserPercentage.toFixed(1)}%)
                    </span>

                </td>

                <td>

                    ${formatMoney(hostTips)}

                    <span class="tip-percentage">
                        (${hostPercentage.toFixed(1)}%)
                    </span>

                </td>

                <td>

                    ${
                        isServer
                            ?
                            `
                            ${formatMoney(employeeTotalKept)}

                            <span class="tip-percentage">
                                (${totalKeptPercentage.toFixed(1)}%)
                            </span>
                            `
                            :
                            "N/A"
                    }

                </td>

            `;

        }


        // =====================================================
        // ALL OTHER EMPLOYEES
        // =====================================================

        else {

            const trainerDisplay =
                employee.is_trainee
                    ?
                    (
                        employee.trainer_employee_id
                            ?
                            `${employee.trainer_employee_name}`
                            :
                            `
                            <span
                                style="
                                    color:red;
                                    font-weight:bold;
                                "
                            >
                                NO TRAINER ASSIGNED
                            </span>
                            `
                    )
                    :
                    "-";


            row.innerHTML = `

                <td>
                    ${formatEmployeeName(employee.name)}
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
                        employee.pool_card_received ?? 0
                    )}

                </td>

                <td>

                    ${formatMoney(
                        employee.pool_cash_received ?? 0
                    )}

                </td>

                <td>

                    ${trainerDisplay}

                </td>

            `;

        }


        body.appendChild(
            row
        );

    }


    // =====================================================
    // TIP OWNER TOTAL ROW
    // =====================================================

    if (
        isTipOwners
    ) {

        const totalRow =
            document.createElement("tr");

        totalRow.className =
            "employee-table-total-row";


        const totalCashForPercentage =
            Math.max(
                totalCashTips,
                0
            );


        const totalTips =
            totalCardTips +
            totalCashForPercentage;


        const totalCardPercentage =
            totalTips > 0
                ?
                (
                    totalCardTips /
                    totalTips
                ) * 100
                :
                0;


        const totalCashPercentage =
            totalTips > 0
                ?
                (
                    totalCashForPercentage /
                    totalTips
                ) * 100
                :
                0;


        const totalServerPercentage =
            totalTips > 0
                ?
                (
                    totalServerTips /
                    totalTips
                ) * 100
                :
                0;


        const totalBohPercentage =
            totalTips > 0
                ?
                (
                    totalBohTips /
                    totalTips
                ) * 100
                :
                0;


        const totalBusserPercentage =
            totalTips > 0
                ?
                (
                    totalBusserTips /
                    totalTips
                ) * 100
                :
                0;


        const totalHostPercentage =
            totalTips > 0
                ?
                (
                    totalHostTips /
                    totalTips
                ) * 100
                :
                0;


        const totalKeptPercentage =
            totalTips > 0
                ?
                (
                    totalKept /
                    totalTips
                ) * 100
                :
                0;


        totalRow.innerHTML = `

            <td
                colspan="3"
                class="employee-table-total-label"
            >
                TOTAL
            </td>

            <td>

                ${formatMoney(totalCardTips)}

                <span class="tip-percentage">
                    (${totalCardPercentage.toFixed(1)}%)
                </span>

            </td>

            <td
                class="${totalCashTips < 0 ? "negative-cash" : ""}"
            >

                ${formatMoney(totalCashTips)}

                <span class="tip-percentage">
                    (${totalCashPercentage.toFixed(1)}%)
                </span>

            </td>

            <td>

                ${formatMoney(totalServerTips)}

                <span class="tip-percentage">
                    (${totalServerPercentage.toFixed(1)}%)
                </span>

            </td>

            <td>

                ${formatMoney(totalBohTips)}

                <span class="tip-percentage">
                    (${totalBohPercentage.toFixed(1)}%)
                </span>

            </td>

            <td>

                ${formatMoney(totalBusserTips)}

                <span class="tip-percentage">
                    (${totalBusserPercentage.toFixed(1)}%)
                </span>

            </td>

            <td>

                ${formatMoney(totalHostTips)}

                <span class="tip-percentage">
                    (${totalHostPercentage.toFixed(1)}%)
                </span>

            </td>

            <td>

                ${formatMoney(totalKept)}

                <span class="tip-percentage">
                    (${totalKeptPercentage.toFixed(1)}%)
                </span>

            </td>

        `;


        body.appendChild(
            totalRow
        );

    }


    table.appendChild(
        body
    );

    wrapper.appendChild(
        table
    );


    // =========================================================
    // TIP POINT INPUT LISTENERS
    // =========================================================

    const tipPointInputs =
        wrapper.querySelectorAll(
            ".tip-point-input"
        );


    for (
        const input
        of tipPointInputs
    ) {

        input.addEventListener(
            "input",
            () => {

                const employeeId =
                    input.dataset.employeeId;


                const employee =
                    employees.find(
                        emp =>
                            String(
                                emp.employee_id
                            ) ===
                            String(
                                employeeId
                            )
                    );


                if (!employee) {

                    return;

                }


                let value =
                    Number(
                        input.value
                    );


                if (
                    Number.isNaN(value)
                ) {

                    value = 0;

                }


                if (
                    value < 0
                ) {

                    value = 0;

                }


                employee.tip_points =
                    value;


                rebuildDistributionPools(
                    mealBlock
                );


                calculateRoleRatios(
                    mealBlock
                );


                if (
                    typeof refreshUI === "function"
                ) {

                    refreshUI();

                }

            }
        );

    }


    return wrapper;

}


// =========================================================
// FORMAT EMPLOYEE NAME
// =========================================================

function formatEmployeeName(
    name
) {

    if (
        !name
    ) {

        return "";

    }


    const text =
        String(
            name
        ).trim();


    if (
        !text.includes(",")
    ) {

        return text;

    }


    const parts =
        text.split(",");


    const last =
        parts[0]?.trim() ?? "";


    const first =
        parts
            .slice(1)
            .join(",")
            .trim();


    if (
        !first
    ) {

        return last;

    }


    if (
        !last
    ) {

        return first;

    }


    return (
        `${first} ${last}`
    );

}