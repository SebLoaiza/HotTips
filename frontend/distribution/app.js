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

const mealBlocks =
    JSON.parse(
        sessionStorage.getItem("mealBlocks")
    ) || [];



if (mealBlocks.length === 0) {

    alert("No data found.");

    window.location.href = "/";

}



// =========================
// CREATE DISTRIBUTION OBJECT
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
// RECALCULATE EVERYTHING
// =========================
function recalculateDistribution() {

    for (const mealBlock of tipDistribution) {

        // rebuild role arrays
        rebuildDistributionPools(
            mealBlock
        );

        // calculate host/busser coverage
        calculateRoleRatios(
            mealBlock
        );

        // calculate contributions and pool totals
        distributeTips(
            mealBlock
        );

        // distribute pool totals back to employees
        distributePools(
            mealBlock
        );

    }

}



// =========================
// UI REFRESH
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
            Number(event.target.value);

        if (isNaN(newPoints) || newPoints < 0) {
            newPoints = 0;
        }

        event.target.value = newPoints;


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

        console.log(
            "UPDATED",
            mealBlock.meal,
            mealBlock.date,
            employee.name,
            employee.tip_points
        );

    }
);


// =========================
// DEBUG
// =========================

const debugButton =
    document.getElementById(
        "debugObjects"
    );


if (debugButton) {

    debugButton.addEventListener(
        "click",
        () => {


            document.getElementById(
                "debugOutput"
            ).textContent =

                JSON.stringify(
                    tipDistribution,
                    null,
                    2
                );


        }
    );

}



// =========================
// INITIAL RENDER
// =========================

refreshUI();