import { createTipDistribution }
from "./models/tipDistribution.js";


import { renderDistribution }
from "./render/renderDistribution.js";


import { rebuildDistributionPools }
from "./logic/rebuildDistributionPools.js";


import { calculateRoleRatios }
from "./logic/calculateRoleRatios.js";


import { distributeTips }
from "./logic/distributeTips.js";


import { distributePools }
from "./logic/distributePools.js";


// =================================================
// LOAD DATA
// =================================================

const mealBlocks =
    JSON.parse(
        sessionStorage.getItem("mealBlocks")
    ) || [];


console.log(
    "=============================="
);


console.log(
    "MEAL BLOCKS IMPORTED FROM INPUTS"
);


console.log(
    "=============================="
);


console.log(
    mealBlocks
);


console.log(
    "RAW MEAL BLOCK JSON:"
);


console.log(
    JSON.stringify(
        mealBlocks,
        null,
        2
    )
);


if (
    mealBlocks.length === 0
) {

    alert(
        "No data found."
    );


    window.location.href =
        "../start/start.html";

}


// =================================================
// CREATE DISTRIBUTION
// =================================================

const tipDistribution =
    createTipDistribution(
        mealBlocks
    );


// =================================================
// RECALCULATE DISTRIBUTION
// =================================================

function recalculateDistribution() {

    for (
        const mealBlock
        of tipDistribution
    ) {

        // -----------------------------------------
        // REBUILD POOLS
        // -----------------------------------------

        rebuildDistributionPools(
            mealBlock
        );


        // -----------------------------------------
        // CALCULATE ROLE RATIOS
        // -----------------------------------------

        calculateRoleRatios(
            mealBlock
        );


        // -----------------------------------------
        // DISTRIBUTE TIPS
        // -----------------------------------------

        distributeTips(
            mealBlock
        );


        // -----------------------------------------
        // DISTRIBUTE POOLS
        // -----------------------------------------

        distributePools(
            mealBlock
        );

    }

}


// =================================================
// UPDATE TOTALS
// =================================================

// =================================================
// UPDATE DISTRIBUTION TOTALS
// =================================================

// =================================================
// UPDATE DISTRIBUTION TOTALS
// =================================================

function updateDistributionTotals() {

    let originalCashTips = 0;
    let originalCardTips = 0;

    let totalCashDistributed = 0;
    let totalCardDistributed = 0;


    for (
        const mealBlock
        of tipDistribution
    ) {

        for (
            const employee
            of mealBlock.employees
        ) {

            // =================================================
            // ORIGINAL TIPS
            // =================================================

            originalCashTips +=
                Number(
                    employee.cash_tips
                ) || 0;


            originalCardTips +=
                Number(
                    employee.card_tips
                ) || 0;


            // =================================================
            // FINAL CASH
            // =================================================

            const cashKept =
                Number(
                    employee.cash_kept
                ) || 0;


            const cashPooled =
                Number(
                    employee.pool_cash_received
                ) || 0;


            totalCashDistributed +=
                cashKept +
                cashPooled;


            // =================================================
            // FINAL CARD
            // =================================================

            const cardKept =
                Number(
                    employee.card_kept
                ) || 0;


            const cardPooled =
                Number(
                    employee.pool_card_received
                ) || 0;


            totalCardDistributed +=
                cardKept +
                cardPooled;

        }

    }


    // =================================================
    // ORIGINAL CASH
    // =================================================

    const originalCashElement =
        document.getElementById(
            "originalCashTips"
        );


    if (originalCashElement) {

        originalCashElement.textContent =
            money(
                originalCashTips
            );

    }


    // =================================================
    // DISTRIBUTED CASH
    // =================================================

    const cashElement =
        document.getElementById(
            "totalCashDistributed"
        );


    if (cashElement) {

        cashElement.textContent =
            money(
                totalCashDistributed
            );

    }


    // =================================================
    // ORIGINAL CARD
    // =================================================

    const originalCardElement =
        document.getElementById(
            "originalCardTips"
        );


    if (originalCardElement) {

        originalCardElement.textContent =
            money(
                originalCardTips
            );

    }


    // =================================================
    // DISTRIBUTED CARD
    // =================================================

    const cardElement =
        document.getElementById(
            "totalCardDistributed"
        );


    if (cardElement) {

        cardElement.textContent =
            money(
                totalCardDistributed
            );

    }

}

// =================================================
// MONEY
// =================================================

function money(
    cents
) {

    return `$${(
        (Number(cents) || 0) /
        100
    ).toFixed(2)}`;

}


// =================================================
// SAVE RESULTS
// =================================================

function saveTipDistribution() {

    sessionStorage.setItem(
        "tipDistribution",
        JSON.stringify(
            tipDistribution
        )
    );

}


// =================================================
// REFRESH UI
// =================================================

function refreshUI() {

    // -----------------------------------------
    // FIRST:
    // Recalculate everything
    // -----------------------------------------

    recalculateDistribution();


    // -----------------------------------------
    // SECOND:
    // Calculate totals from final values
    // -----------------------------------------

    updateDistributionTotals();


    // -----------------------------------------
    // THIRD:
    // Render tables
    // -----------------------------------------

    renderDistribution(
        tipDistribution,
        refreshUI
    );

}


// =================================================
// TIP POINT EDITING
// =================================================

document.addEventListener(
    "change",
    (event) => {

        if (
            !event.target.classList.contains(
                "tip-point-input"
            )
        ) {

            return;

        }


        // -----------------------------------------
        // EMPLOYEE ID
        // -----------------------------------------

        const employeeId =
            event.target.dataset.employeeId;


        // -----------------------------------------
        // MEAL BLOCK ID
        // -----------------------------------------

        const mealBlockId =
            event.target.dataset.mealBlockId;


        // -----------------------------------------
        // NEW POINTS
        // -----------------------------------------

        let newPoints =
            Number(
                event.target.value
            );


        if (
            Number.isNaN(
                newPoints
            )
            ||
            newPoints < 0
        ) {

            newPoints = 0;

        }


        event.target.value =
            newPoints;


        // -----------------------------------------
        // FIND MEAL BLOCK
        // -----------------------------------------

        const mealBlock =
            tipDistribution.find(
                block =>
                    block.id ===
                    mealBlockId
            );


        if (!mealBlock) {

            return;

        }


        // -----------------------------------------
        // FIND EMPLOYEE
        // -----------------------------------------

        const employee =
            mealBlock.employees.find(
                employee =>
                    employee.employee_id ===
                    employeeId
            );


        if (!employee) {

            return;

        }


        // -----------------------------------------
        // SAVE POINTS
        // -----------------------------------------

        employee.tip_points =
            newPoints;


        // -----------------------------------------
        // RECALCULATE
        // -----------------------------------------

        rebuildDistributionPools(
            mealBlock
        );


        calculateRoleRatios(
            mealBlock
        );


        distributeTips(
            mealBlock
        );


        distributePools(
            mealBlock
        );


        // -----------------------------------------
        // REFRESH EVERYTHING
        // -----------------------------------------

        refreshUI();

    }
);


// =================================================
// DEBUG
// =================================================

document
    .getElementById(
        "debugObjects"
    )
    ?.addEventListener(
        "click",
        () => {

            const output =
                document.getElementById(
                    "debugOutput"
                );


            if (output) {

                output.textContent =
                    JSON.stringify(
                        tipDistribution,
                        null,
                        2
                    );

            }

        }
    );


// =================================================
// NAVIGATION
// =================================================

function goToResults() {

    // -----------------------------------------
    // Make absolutely sure final values are
    // calculated before leaving the page.
    // -----------------------------------------

    recalculateDistribution();


    saveTipDistribution();


    window.location.href =
        "../results/results.html";

}


// =================================================
// TOP RESULTS / CONTINUE
// =================================================

document
    .getElementById(
        "resultsButton"
    )
    ?.addEventListener(
        "click",
        goToResults
    );


document
    .getElementById(
        "continueButton"
    )
    ?.addEventListener(
        "click",
        goToResults
    );


document
    .getElementById(
        "topContinueButton"
    )
    ?.addEventListener(
        "click",
        goToResults
    );


// =================================================
// BACK
// =================================================

function goBack() {

    window.location.href =
        "../inputs/inputs.html";

}


document
    .getElementById(
        "backButton"
    )
    ?.addEventListener(
        "click",
        goBack
    );


document
    .getElementById(
        "topBackButton"
    )
    ?.addEventListener(
        "click",
        goBack
    );


// =================================================
// START
// =================================================

refreshUI();