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



// =========================
// LOAD DATA
// =========================

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

if (mealBlocks.length === 0) {

    alert("No data found.");

    window.location.href =
        "../start/start.html";

}



// =========================
// CREATE DISTRIBUTION
// =========================

const tipDistribution =
    createTipDistribution(
        mealBlocks
    );




// =========================
// RECALCULATE
// =========================

function recalculateDistribution() {

    for (const mealBlock of tipDistribution) {

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

    }

}



// =========================
// SAVE RESULTS
// =========================

function saveTipDistribution() {

    sessionStorage.setItem(
        "tipDistribution",
        JSON.stringify(
            tipDistribution
        )
    );

}



// =========================
// REFRESH UI
// =========================

function refreshUI() {

    recalculateDistribution();

    renderDistribution(
        tipDistribution,
        refreshUI
    );

}



// =========================
// TIP POINT EDITING
// =========================

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



        const employeeId =
            event.target.dataset.employeeId;


        const mealBlockId =
            event.target.dataset.mealBlockId;



        let newPoints =
            Number(
                event.target.value
            );



        if (
            isNaN(newPoints)
            ||
            newPoints < 0
        ) {

            newPoints = 0;

        }



        event.target.value =
            newPoints;



        const mealBlock =
            tipDistribution.find(
                block =>
                    block.id === mealBlockId
            );



        if (!mealBlock) {
            return;
        }



        const employee =
            mealBlock.employees.find(
                e =>
                    e.employee_id === employeeId
            );



        if (!employee) {
            return;
        }



        employee.tip_points =
            newPoints;



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


        refreshUI();

    }
);




// =========================
// DEBUG
// =========================

document
.getElementById("debugObjects")
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




// =========================
// NAVIGATION
// =========================

function goToResults() {

    saveTipDistribution();

    window.location.href =
        "../results/results.html";

}



document
.getElementById("resultsButton")
?.addEventListener(
    "click",
    goToResults
);



document
.getElementById("continueButton")
?.addEventListener(
    "click",
    goToResults
);



document
.getElementById("topContinueButton")
?.addEventListener(
    "click",
    goToResults
);



document
.getElementById("backButton")
?.addEventListener(
    "click",
    () => {

        window.location.href =
            "../inputs/inputs.html";

    }
);



document
.getElementById("topBackButton")
?.addEventListener(
    "click",
    () => {

        window.location.href =
            "../inputs/inputs.html";

    }
);




// =========================
// START
// =========================

refreshUI();