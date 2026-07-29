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



if (mealBlocks.length === 0) {

    alert(
        "No data found."
    );

    window.location.href =
        "../start/start.html";

}



console.log(
    "MEAL BLOCKS",
    mealBlocks
);




// =========================
// CREATE DISTRIBUTION
// =========================

const tipDistribution =
    createTipDistribution(
        mealBlocks
    );


console.log(
    "TIP DISTRIBUTION OBJECT",
    tipDistribution
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

            console.warn(
                "Meal block not found:",
                mealBlockId
            );

            return;

        }




        const employee =
            mealBlock.employees.find(
                e =>
                    e.employee_id === employeeId
            );



        if (!employee) {

            console.warn(
                "Employee not found:",
                employeeId
            );

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



        if (!output) {

            return;

        }



        output.textContent =
            JSON.stringify(
                tipDistribution,
                null,
                2
            );


    }
);





// =========================
// RESULTS
// =========================

document
.getElementById("resultsButton")
?.addEventListener(
    "click",
    () => {


        sessionStorage.setItem(
            "tipDistribution",
            JSON.stringify(
                tipDistribution
            )
        );


        window.location.href =
            "../results/results.html";


    }
);





// =========================
// NAVIGATION
// =========================

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
.getElementById("continueButton")
?.addEventListener(
    "click",
    () => {


        sessionStorage.setItem(
            "tipDistribution",
            JSON.stringify(
                tipDistribution
            )
        );


        window.location.href =
            "../results/results.html";


    }
);





// =========================
// START
// =========================

refreshUI();