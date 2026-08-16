import { formatMoney } from "./formatters.js";


export function renderDistributionPools(
    block,
    refreshUI
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "distribution-section";


    // =================================================
    // SECTION TITLE
    // =================================================

    const title =
        document.createElement("div");

    title.className =
        "distribution-section-title";

    title.textContent =
        "DISTRIBUTION";


    wrapper.appendChild(
        title
    );


    // =================================================
    // POOLS
    // =================================================

    const pools = [

        {
            name: "Servers",

            employees:
                block.servers ?? [],

            cash:
                block.servers_cash ?? 0,

            card:
                block.servers_card ?? 0

        },

        {
            name: "Bussers",

            employees:
                block.bussers ?? [],

            cash:
                block.busser_cash ?? 0,

            card:
                block.busser_card ?? 0

        },

        {
            name: "Hosts",

            employees:
                block.hosts ?? [],

            cash:
                block.host_cash ?? 0,

            card:
                block.host_card ?? 0

        },

        {
            name: "BOH",

            employees:
                block.boh ?? [],

            cash:
                block.boh_cash ?? 0,

            card:
                block.boh_card ?? 0

        }

    ];


    // =================================================
    // RENDER POOLS
    // =================================================

    for (const pool of pools) {

        const row =
            createPoolRow(
                pool,
                block,
                refreshUI
            );

        wrapper.appendChild(
            row
        );

    }


    // =================================================
    // EMPLOYEE COUNTS
    // =================================================

    const counts =
        document.createElement("div");

    counts.className =
        "meal-employee-counts";


    counts.innerHTML = `

        <span>
            ${block.servers?.length ?? 0}
            Servers
        </span>

        <span>
            ${block.boh?.length ?? 0}
            BOH
        </span>

        <span>
            ${block.bussers?.length ?? 0}
            Bussers
        </span>

        <span>
            ${block.hosts?.length ?? 0}
            Hosts
        </span>

    `;


    wrapper.appendChild(
        counts
    );


    return wrapper;

}


// =====================================================
// CREATE POOL ROW
// =====================================================

function createPoolRow(
    pool,
    block,
    refreshUI
) {

    const row =
        document.createElement("div");

    row.className =
        "distribution-pool";


    // =================================================
    // TOTAL
    // =================================================

    const total =
        pool.cash +
        pool.card;


    // =================================================
    // POOL HEADER
    // =================================================

    const header =
        document.createElement("button");

    header.type =
        "button";

    header.className =
        "distribution-pool-header";


    // =================================================
    // BAR PERCENTAGE
    // =================================================

    const allPoolTotals = [

        (block.servers_cash ?? 0)
        +
        (block.servers_card ?? 0),

        (block.busser_cash ?? 0)
        +
        (block.busser_card ?? 0),

        (block.host_cash ?? 0)
        +
        (block.host_card ?? 0),

        (block.boh_cash ?? 0)
        +
        (block.boh_card ?? 0)

    ];


    const largestPool =
        Math.max(
            ...allPoolTotals.map(
                value =>
                    Math.max(
                        value,
                        0
                    )
            ),
            0
        );


    let percentage = 0;


    if (
        largestPool > 0 &&
        total > 0
    ) {

        percentage =
            (total / largestPool) * 100;

    }


    header.innerHTML = `

        <span class="pool-name">
            ${pool.name}
        </span>

        <span class="pool-bar-container">

            <span
                class="pool-bar"
                style="width: ${percentage}%"
            ></span>

        </span>

        <span class="pool-amount">
            ${formatMoney(total)}
        </span>

        <span class="pool-arrow">
            ›
        </span>

    `;


    // =================================================
    // POOL CONTENT
    // =================================================

    const content =
        document.createElement("div");

    content.className =
        "distribution-pool-content";


    // =================================================
    // EMPLOYEE TABLE
    // =================================================

    if (
        pool.employees.length === 0
    ) {

        content.innerHTML = `
            <div class="empty-pool">
                No employees
            </div>
        `;

    }

    else {

        for (
            const employee
            of pool.employees
        ) {

            const employeeRow =
                createEmployeeRow(
                    employee,
                    block
                );

            content.appendChild(
                employeeRow
            );

        }

    }


    // =================================================
    // TOGGLE
    // =================================================

    header.addEventListener(
        "click",
        () => {

            const expanded =
                row.classList.toggle(
                    "expanded"
                );

            header.setAttribute(
                "aria-expanded",
                String(expanded)
            );

        }
    );


    row.appendChild(
        header
    );

    row.appendChild(
        content
    );


    return row;

}


// =====================================================
// EMPLOYEE DETAIL
// =====================================================

function createEmployeeRow(
    employee,
    block
) {

    const row =
        document.createElement("div");

    row.className =
        "pool-employee";


    row.innerHTML = `

        <div>

            <div class="pool-employee-name">
                ${employee.name}
            </div>

            <div class="pool-employee-role">
                ${employee.role}
            </div>

        </div>


        <div class="pool-employee-shift">

            ${employee.meal_start ?? ""}
            -
            ${employee.meal_end ?? ""}

        </div>


        <div class="pool-employee-points">

            <label>
                Points
            </label>

            <input
                class="tip-point-input"
                type="number"
                step="0.1"
                min="0"
                value="${employee.tip_points ?? 1}"
                data-employee-id="${employee.employee_id}"
                data-meal-block-id="${block.id}"
            >

        </div>


        <div class="pool-employee-received">

            <div>

                <span>
                    Card
                </span>

                <strong>
                    ${formatMoney(
                        employee.pool_card_received ?? 0
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Cash
                </span>

                <strong>
                    ${formatMoney(
                        employee.pool_cash_received ?? 0
                    )}
                </strong>

            </div>

        </div>

    `;


    return row;

}