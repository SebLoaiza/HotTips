import {
    formatMoney
} from "./formatters.js";

import {
    renderEmployeeTable
} from "./renderEmployeeTable.js";

import {
    rebuildDistributionPools
} from "./../logic/rebuildDistributionPools.js";

import {
    calculateRoleRatios
} from "./../logic/calculateRoleRatios.js";


// =========================================================
// RENDER MEAL BLOCK
// =========================================================

export function renderMealBlock(
    block,
    refreshUI
) {

    const section =
        document.createElement("section");

    section.className =
        "meal-block";


    section.__mealBlock =
        block;


    // =====================================================
    // REFRESH WITH STATE
    // =====================================================

    const refreshWithState =
        () => {

            rememberMealBlockState(
                section,
                block
            );

            refreshUI();

        };


    // =====================================================
    // HEADER
    // =====================================================

    const header =
        document.createElement("div");

    header.className =
        "meal-block-header";


    // =====================================================
    // TITLE
    // =====================================================

    const title =
        document.createElement("div");

    title.className =
        "meal-block-title";


    const titleLeft =
        document.createElement("div");

    titleLeft.className =
        "meal-block-title-left";


    const mealName =
        document.createElement("div");

    mealName.className =
        "meal-block-name";

    mealName.textContent =
        block.meal;


    const mealTime =
        document.createElement("div");

    mealTime.className =
        "meal-block-time";

    mealTime.textContent =
        `${formatBlockTime(block.start)} – ${formatBlockTime(block.end)}`;


    titleLeft.appendChild(
        mealName
    );

    titleLeft.appendChild(
        mealTime
    );


    title.appendChild(
        titleLeft
    );


    // =====================================================
    // MONEY SUMMARY
    // =====================================================

    const summary =
        document.createElement("div");

    summary.className =
        "meal-block-summary";


    const cardAmount =
        getTotalCardTips(block);


    const cashAmount =
        getTotalCashTips(block);


    const totalAmount =
        cardAmount +
        cashAmount;


    summary.appendChild(
        createSummaryItem(
            "Card",
            cardAmount
        )
    );


    summary.appendChild(
        createSummaryItem(
            "Cash",
            cashAmount
        )
    );


    summary.appendChild(
        createSummaryItem(
            "Total to Distribute",
            totalAmount,
            true
        )
    );


    // =====================================================
    // COLLAPSE INDICATOR
    // =====================================================

    const collapseIndicator =
        document.createElement("div");

    collapseIndicator.className =
        "meal-block-collapse-indicator";


    const collapseText =
        document.createElement("span");

    collapseText.className =
        "collapse-label";

    collapseText.textContent =
        "Click to expand";


    const collapseArrow =
        document.createElement("span");

    collapseArrow.className =
        "collapse-arrow";

    collapseArrow.textContent =
        "▼";


    collapseIndicator.appendChild(
        collapseText
    );

    collapseIndicator.appendChild(
        collapseArrow
    );


    // =====================================================
    // HEADER CONTENT
    // =====================================================

    header.appendChild(
        title
    );

    header.appendChild(
        summary
    );

    header.appendChild(
        collapseIndicator
    );


    // =====================================================
    // CONTENT
    // =====================================================

    const content =
        document.createElement("div");

    content.className =
        "meal-block-content collapsed";


    header.classList.add(
        "collapsed"
    );


    // =====================================================
    // DISTRIBUTION
    // =====================================================

    content.appendChild(
        renderDistributionSection(
            block,
            refreshWithState
        )
    );


    // =====================================================
    // EMPLOYEE COUNTS
    // =====================================================

    content.appendChild(
        renderEmployeeCounts(
            block
        )
    );


    // =====================================================
    // TIP OWNERS
    // =====================================================

    content.appendChild(
        renderTipOwnersSection(
            block,
            refreshWithState
        )
    );


    // =====================================================
    // COLLAPSE / EXPAND
    // =====================================================

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


            updateCollapseIndicator(
                collapseIndicator,
                collapsed
            );

        }
    );


    // =====================================================
    // ADD CONTENT
    // =====================================================

    section.appendChild(
        header
    );

    section.appendChild(
        content
    );


    // =====================================================
    // ROLE LISTENERS
    // =====================================================

    attachRoleListeners(
        section,
        block,
        refreshWithState
    );


    // =====================================================
    // RESTORE STATE
    // =====================================================

    restoreMealBlockState(
        section,
        block
    );


    return section;

}


// =========================================================
// UPDATE COLLAPSE INDICATOR
// =========================================================

function updateCollapseIndicator(
    indicator,
    collapsed
) {

    if (!indicator) {

        return;

    }


    const label =
        indicator.querySelector(
            ".collapse-label"
        );


    const arrow =
        indicator.querySelector(
            ".collapse-arrow"
        );


    if (collapsed) {

        if (label) {

            label.textContent =
                "Click to expand";

        }


        if (arrow) {

            arrow.textContent =
                "▼";

        }

    }

    else {

        if (label) {

            label.textContent =
                "Click to collapse";

        }


        if (arrow) {

            arrow.textContent =
                "▲";

        }

    }

}


// =========================================================
// REMEMBER MEAL BLOCK STATE
// =========================================================

function rememberMealBlockState(
    section,
    block
) {

    if (
        !section ||
        !block
    ) {

        return;

    }


    if (
        !window.__distributionMealBlockStates
    ) {

        window.__distributionMealBlockStates =
            {};

    }


    const content =
        section.querySelector(
            ".meal-block-content"
        );


    const tipOwnerSection =
        section.querySelector(
            ".tip-owner-section"
        );


    const state = {

        mealCollapsed:
            content?.classList.contains(
                "collapsed"
            ) ?? true,

        pools: {},

        tipOwnersExpanded:
            tipOwnerSection?.classList.contains(
                "expanded"
            ) ?? false

    };


    const pools =
        section.querySelectorAll(
            ".distribution-pool"
        );


    for (
        const pool
        of pools
    ) {

        const nameElement =
            pool.querySelector(
                ".pool-name"
            );


        if (!nameElement) {

            continue;

        }


        const rawName =
            nameElement.textContent.trim();


        const name =
            rawName.replace(
                /\s*\(\d+\)\s*$/,
                ""
            );


        if (!name) {

            continue;

        }


        state.pools[name] =
            pool.classList.contains(
                "expanded"
            );

    }


    const blockKey =
        String(
            block.id ??
            `${block.date}-${block.meal}`
        );


    window.__distributionMealBlockStates[
        blockKey
    ] =
        state;

}


// =========================================================
// RESTORE MEAL BLOCK STATE
// =========================================================

function restoreMealBlockState(
    section,
    block
) {

    if (
        !section ||
        !block
    ) {

        return;

    }


    const blockKey =
        String(
            block.id ??
            `${block.date}-${block.meal}`
        );


    const savedStates =
        window.__distributionMealBlockStates;


    if (
        !savedStates ||
        !savedStates[blockKey]
    ) {

        const indicator =
            section.querySelector(
                ".meal-block-collapse-indicator"
            );


        updateCollapseIndicator(
            indicator,
            true
        );


        return;

    }


    const state =
        savedStates[blockKey];


    const content =
        section.querySelector(
            ".meal-block-content"
        );


    const header =
        section.querySelector(
            ".meal-block-header"
        );


    const indicator =
        section.querySelector(
            ".meal-block-collapse-indicator"
        );


    if (
        content &&
        header
    ) {

        content.classList.toggle(
            "collapsed",
            state.mealCollapsed
        );


        header.classList.toggle(
            "collapsed",
            state.mealCollapsed
        );


        updateCollapseIndicator(
            indicator,
            state.mealCollapsed
        );

    }


    const pools =
        section.querySelectorAll(
            ".distribution-pool"
        );


    for (
        const pool
        of pools
    ) {

        const nameElement =
            pool.querySelector(
                ".pool-name"
            );


        if (!nameElement) {

            continue;

        }


        const rawName =
            nameElement.textContent.trim();


        const name =
            rawName.replace(
                /\s*\(\d+\)\s*$/,
                ""
            );


        if (
            state.pools[name] === undefined
        ) {

            continue;

        }


        pool.classList.toggle(
            "expanded",
            state.pools[name]
        );

    }


    const tipOwnerSection =
        section.querySelector(
            ".tip-owner-section"
        );


    if (
        tipOwnerSection
    ) {

        tipOwnerSection.classList.toggle(
            "expanded",
            state.tipOwnersExpanded
        );

    }

}


// =========================================================
// DISTRIBUTION SECTION
// =========================================================

function renderDistributionSection(
    block,
    refreshUI
) {

    const section =
        document.createElement("div");

    section.className =
        "meal-distribution";


    const label =
        document.createElement("div");

    label.className =
        "section-label";

    label.textContent =
        "DISTRIBUTION";


    section.appendChild(
        label
    );


    section.appendChild(
        createPoolRow(
            "Servers",
            block.servers ?? [],
            getPoolAmount(
                block,
                "servers"
            ),
            block,
            refreshUI
        )
    );


    section.appendChild(
        createPoolRow(
            "Bussers",
            block.bussers ?? [],
            getPoolAmount(
                block,
                "bussers"
            ),
            block,
            refreshUI
        )
    );


    section.appendChild(
        createPoolRow(
            "Hosts",
            block.hosts ?? [],
            getPoolAmount(
                block,
                "hosts"
            ),
            block,
            refreshUI
        )
    );


    section.appendChild(
        createPoolRow(
            "BOH",
            block.boh ?? [],
            getPoolAmount(
                block,
                "boh"
            ),
            block,
            refreshUI
        )
    );


    section.appendChild(
        createPoolRow(
            "Other",
            block.others ?? [],
            getPoolAmount(
                block,
                "others"
            ),
            block,
            refreshUI
        )
    );


    return section;

}


// =========================================================
// CREATE DISTRIBUTION POOL
// =========================================================

function createPoolRow(
    name,
    employees,
    amount,
    mealBlock,
    refreshUI
) {

    const pool =
        document.createElement("div");

    pool.className =
        "distribution-pool";


    // =====================================================
    // HEADER
    // =====================================================

    const header =
        document.createElement("button");

    header.type =
        "button";

    header.className =
        "distribution-pool-header";


    // =====================================================
    // NAME
    // =====================================================

    const poolName =
        document.createElement("span");

    poolName.className =
        "pool-name";

    poolName.textContent =
        `${name} (${employees?.length ?? 0})`;


    // =====================================================
    // BAR
    // =====================================================

    const barContainer =
        document.createElement("span");

    barContainer.className =
        "pool-bar-container";


    const bar =
        document.createElement("span");

    bar.className =
        "pool-bar";


    const percentage =
        calculatePoolMoneyPercentage(
            mealBlock,
            amount
        );


    bar.style.width =
        `${percentage}%`;


    bar.title =
        `${percentage.toFixed(1)}% of total pool money`;


    barContainer.appendChild(
        bar
    );


    // =====================================================
    // RIGHT SIDE TOTAL
    // =====================================================

    const poolAmount =
        document.createElement("span");

    poolAmount.className =
        "pool-amount";


    poolAmount.textContent =
        `${formatMoney(amount)} (${percentage.toFixed(1)}%)`;


    // =====================================================
    // ARROW
    // =====================================================

    const arrow =
        document.createElement("span");

    arrow.className =
        "pool-arrow";

    arrow.textContent =
        "›";


    // =====================================================
    // BUILD HEADER
    // =====================================================

    header.appendChild(
        poolName
    );

    header.appendChild(
        barContainer
    );

    header.appendChild(
        poolAmount
    );

    header.appendChild(
        arrow
    );


    // =====================================================
    // POOL CONTENT
    // =====================================================

    const poolContent =
        document.createElement("div");

    poolContent.className =
        "distribution-pool-content";


    poolContent.appendChild(
        renderEmployeeTable(
            name,
            employees,
            mealBlock,
            refreshUI
        )
    );


    // =====================================================
    // EXPAND / COLLAPSE
    // =====================================================

    header.addEventListener(
        "click",
        () => {

            pool.classList.toggle(
                "expanded"
            );

        }
    );


    pool.appendChild(
        header
    );

    pool.appendChild(
        poolContent
    );


    return pool;

}


// =========================================================
// EMPLOYEE COUNTS
// =========================================================

function renderEmployeeCounts(
    block
) {

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

        <span>
            ${block.others?.length ?? 0}
            Other
        </span>

    `;


    return counts;

}


// =========================================================
// TIP OWNERS
// =========================================================

function renderTipOwnersSection(
    block,
    refreshUI
) {

    const section =
        document.createElement("div");

    section.className =
        "tip-owner-section";


    const header =
        document.createElement("button");

    header.type =
        "button";

    header.className =
        "tip-owner-header";


    const title =
        document.createElement("span");

    title.textContent =
        `TIP OWNERS (${block.tipOwners?.length ?? 0})`;


    const arrow =
        document.createElement("span");

    arrow.className =
        "pool-arrow";

    arrow.textContent =
        "›";


    header.appendChild(
        title
    );

    header.appendChild(
        arrow
    );


    const content =
        document.createElement("div");

    content.className =
        "tip-owner-content";


    content.appendChild(
        renderEmployeeTable(
            "Tip Owners",
            block.tipOwners ?? [],
            block,
            refreshUI
        )
    );


    header.addEventListener(
        "click",
        () => {

            section.classList.toggle(
                "expanded"
            );

        }
    );


    section.appendChild(
        header
    );

    section.appendChild(
        content
    );


    return section;

}


// =========================================================
// SUMMARY ITEM
// =========================================================

function createSummaryItem(
    label,
    amount,
    total = false
) {

    const item =
        document.createElement("div");

    item.className =
        "summary-item";


    if (total) {

        item.classList.add(
            "total"
        );

    }


    const labelElement =
        document.createElement("span");

    labelElement.className =
        "summary-label";

    labelElement.textContent =
        label;


    const value =
        document.createElement("span");

    value.className =
        "summary-value";

    value.textContent =
        formatMoney(
            amount
        );


    item.appendChild(
        labelElement
    );

    item.appendChild(
        value
    );


    return item;

}


// =========================================================
// GET TOTAL CARD TIPS
// =========================================================

function getTotalCardTips(
    block
) {

    const roleCardValues = [

        block.servers_card ?? 0,

        block.busser_card ?? 0,

        block.host_card ?? 0,

        block.boh_card ?? 0

    ];


    const hasRoleCard =
        roleCardValues.some(
            value =>
                Number(value) !== 0
        );


    if (
        hasRoleCard
    ) {

        return roleCardValues.reduce(
            (
                total,
                value
            ) => {

                return total +
                    (Number(value) || 0);

            },
            0
        );

    }


    return (
        block.tipOwners ?? []
    ).reduce(
        (
            total,
            employee
        ) => {

            return total +
                Number(
                    employee.card_after_fee ??
                    employee.card_tips ??
                    0
                );

        },
        0
    );

}


// =========================================================
// GET TOTAL CASH TIPS
// =========================================================

function getTotalCashTips(
    block
) {

    const roleCashValues = [

        block.servers_cash ?? 0,

        block.busser_cash ?? 0,

        block.host_cash ?? 0,

        block.boh_cash ?? 0

    ];


    const hasRoleCash =
        roleCashValues.some(
            value =>
                Number(value) !== 0
        );


    if (
        hasRoleCash
    ) {

        return roleCashValues.reduce(
            (
                total,
                value
            ) => {

                return total +
                    Math.max(
                        Number(value) || 0,
                        0
                    );

            },
            0
        );

    }


    return (
        block.tipOwners ?? []
    ).reduce(
        (
            total,
            employee
        ) => {

            const cash =
                Number(
                    employee.cash_remaining ??
                    employee.cash_tips ??
                    0
                );


            return total +
                Math.max(
                    cash,
                    0
                );

        },
        0
    );

}


// =========================================================
// GET POOL AMOUNT
//
// IMPORTANT:
//
// Pool amount is:
//
//     POOL RECEIVED
//     +
//     EMPLOYEES IN THAT ROLE'S KEPT TIPS
//
// Example:
//
// Server pool received = $400
//
// John:
//     card kept = $40
//     cash kept = $20
//
// Jane:
//     card kept = $30
//     cash kept = $10
//
// Server total:
//
//     $400
//     + $40
//     + $20
//     + $30
//     + $10
//     = $500
//
// The bar represents $500.
// =========================================================

function getPoolAmount(
    block,
    pool
) {

    const distributed =
        getPoolDistributedAmount(
            block,
            pool
        );


    const kept =
        getPoolKeptAmount(
            block,
            pool
        );


    return distributed + kept;

}


// =========================================================
// GET DISTRIBUTED POOL AMOUNT
// =========================================================

function getPoolDistributedAmount(
    block,
    pool
) {

    switch (pool) {

        case "servers":

            return (
                positive(
                    block.servers_cash
                )
                +
                toNumber(
                    block.servers_card
                )
            );


        case "bussers":

            return (
                positive(
                    block.busser_cash
                )
                +
                toNumber(
                    block.busser_card
                )
            );


        case "hosts":

            return (
                positive(
                    block.host_cash
                )
                +
                toNumber(
                    block.host_card
                )
            );


        case "boh":

            return (
                positive(
                    block.boh_cash
                )
                +
                toNumber(
                    block.boh_card
                )
            );


        case "others":

            return 0;


        default:

            return 0;

    }

}


// =========================================================
// GET POOL KEPT AMOUNT
//
// THIS IS THE IMPORTANT PART.
//
// We do NOT use:
//
//     server_card_contribution
//
// because that represents money contributed toward
// the server pool, not necessarily money the server
// personally kept.
//
// Instead we look at the actual employees belonging
// to the role and add:
//
//     card_kept
//     +
//     cash_kept
//
// for those employees.
//
// This means the server bar includes actual server
// kept money.
// =========================================================

function getPoolKeptAmount(
    block,
    pool
) {

    let employees = [];


    switch (pool) {

        case "servers":

            employees =
                block.servers ?? [];

            break;


        case "bussers":

            employees =
                block.bussers ?? [];

            break;


        case "hosts":

            employees =
                block.hosts ?? [];

            break;


        case "boh":

            employees =
                block.boh ?? [];

            break;


        case "others":

            employees =
                block.others ?? [];

            break;


        default:

            employees = [];

    }


    return employees.reduce(
        (
            total,
            employee
        ) => {

            const cardKept =
                toNumber(
                    employee.card_kept
                );


            const cashKept =
                toNumber(
                    employee.cash_kept
                );


            return total +
                Math.max(
                    cardKept +
                    cashKept,
                    0
                );

        },
        0
    );

}


// =========================================================
// POOL MONEY DISTRIBUTION PERCENTAGE
//
// Percentage uses:
//
//     distributed + kept
//
// for every role.
//
// Example:
//
// Servers = $600
// Bussers = $200
// Hosts   = $100
// BOH     = $100
//
// Total = $1,000
//
// Servers = 60%
// =========================================================

function calculatePoolMoneyPercentage(
    block,
    amount
) {

    const total =
        getPoolAmount(
            block,
            "servers"
        )
        +
        getPoolAmount(
            block,
            "bussers"
        )
        +
        getPoolAmount(
            block,
            "hosts"
        )
        +
        getPoolAmount(
            block,
            "boh"
        )
        +
        getPoolAmount(
            block,
            "others"
        );


    if (
        total <= 0
    ) {

        return 0;

    }


    const percentage =
        (
            toNumber(
                amount
            ) /
            total
        ) * 100;


    return Math.min(
        Math.max(
            percentage,
            0
        ),
        100
    );

}


// =========================================================
// POSITIVE VALUE
// =========================================================

function positive(
    value
) {

    return Math.max(
        toNumber(value),
        0
    );

}


// =========================================================
// NUMBER
// =========================================================

function toNumber(
    value
) {

    const number =
        Number(value);


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


// =========================================================
// FORMAT BLOCK TIME
// =========================================================

function formatBlockTime(
    time
) {

    if (
        time === null ||
        time === undefined ||
        time === ""
    ) {

        return "";

    }


    if (
        typeof time === "string" &&
        (
            time.includes(":") ||
            time.includes("AM") ||
            time.includes("PM")
        )
    ) {

        return time;

    }


    const numeric =
        Number(time);


    if (
        Number.isNaN(numeric)
    ) {

        return String(
            time
        );

    }


    const minutes =
        numeric % (
            24 * 60
        );


    let hour =
        Math.floor(
            minutes / 60
        );


    const minute =
        Math.floor(
            minutes % 60
        );


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (
        hour === 0
    ) {

        hour = 12;

    }


    return (
        `${hour}:` +
        `${String(minute).padStart(2, "0")} ` +
        suffix
    );

}


// =========================================================
// ROLE LISTENERS
// =========================================================

function attachRoleListeners(
    section,
    block,
    refreshUI
) {

    const selects =
        section.querySelectorAll(
            ".distribution-role"
        );


    for (
        const select
        of selects
    ) {

        select.addEventListener(
            "change",
            () => {

                const employee =
                    block.employees?.find(
                        emp =>
                            String(
                                emp.employee_id
                            ) ===
                            String(
                                select.dataset.id
                            )
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