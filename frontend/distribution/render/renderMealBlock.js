import { renderMoneySummary }
from "./renderMoneySummary.js";

import { renderEmployeeTable }
from "./renderEmployeeTable.js";

import { rebuildDistributionPools }
from "./../logic/rebuildDistributionPools.js";

import { calculateRoleRatios }
from "./../logic/calculateRoleRatios.js";

export function renderMealBlock(
    block,
    refreshUI
) {

    const section =
        document.createElement("div");

    section.className =
        "meal-block";

    // =========================
    // MEAL BLOCK HEADER
    // =========================

    const header =
        document.createElement("h2");

    header.className =
        "meal-block-header";

    header.innerHTML = `
        <span class="meal-block-arrow">▼</span>
        ${block.meal} - ${block.date}
    `;

    // =========================
    // MEAL BLOCK CONTENT
    // =========================

    const content =
        document.createElement("div");

    content.className =
        "meal-block-content";

    content.appendChild(
        renderMoneySummary(block)
    );

    content.appendChild(
        renderEmployeeTable(
            "Tip Owners",
            block.tipOwners,
            block
        )
    );

    content.appendChild(
        renderEmployeeTable(
            "Servers",
            block.servers,
            block
        )
    );

    content.appendChild(
        renderEmployeeTable(
            "BOH",
            block.boh,
            block
        )
    );

    content.appendChild(
        renderEmployeeTable(
            `Bussers (${(block.busser_ratio * 100).toFixed(0)}%)`,
            block.bussers,
            block
        )
    );

    content.appendChild(
        renderEmployeeTable(
            `Hosts (${(block.host_ratio * 100).toFixed(0)}%)`,
            block.hosts,
            block
        )
    );

    content.appendChild(
        renderEmployeeTable(
            "Other",
            block.others,
            block
        )
    );

    // =========================
    // COLLAPSE / EXPAND
    // =========================

    header.addEventListener(
        "click",
        () => {

            const collapsed =
                content.classList.toggle(
                    "collapsed"
                );

            header.classList.toggle(
                "collapsed",
                collapsed
            );

        }
    );

    // =========================
    // ADD TO SECTION
    // =========================

    section.appendChild(
        header
    );

    section.appendChild(
        content
    );

    // =========================
    // ROLE LISTENERS
    // =========================

    attachRoleListeners(
        section,
        block,
        refreshUI
    );

    return section;
}

function attachRoleListeners(
    section,
    block,
    refreshUI
) {

    const selects =
        section.querySelectorAll(
            ".distribution-role"
        );

    for (const select of selects) {

        select.addEventListener(
            "change",
            () => {

                const employee =
                    block.employees.find(
                        emp =>
                            emp.employee_id ===
                            select.dataset.id
                    );

                if (!employee) {
                    return;
                }

                employee.distribution_role =
                    select.value;

                rebuildDistributionPools(
                    block
                );

                calculateRoleRatios(
                    block
                );

                refreshUI();

            }
        );

    }

}