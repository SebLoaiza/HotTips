import { renderCashDropTables } from "./render/cashDropGrid.js";
import { renderTraineeAssignments } from "./render/renderTraineeAssignments.js";
import { renderEmployeePoints } from "./render/renderEmployeePoints.js";
import { renderCashTipSummary } from "./render/renderCashTipSummary.js";
import { calculateCashTips } from "./logic/calculateCashTips.js";


// =========================
// LOAD DATA
// =========================

const currentMealBlocks =
    JSON.parse(
        sessionStorage.getItem(
            "mealBlocks"
        )
    ) || [];


if (currentMealBlocks.length === 0) {

    alert(
        "No imported data found."
    );

    window.location.href =
        "../start/start.html";

}



// =========================
// INITIAL RENDER
// =========================

refreshUI();



// =========================
// REFRESH UI
// =========================

function refreshUI() {

    calculateCashTips(
        currentMealBlocks
    );


    renderCashDropTables(
        currentMealBlocks,
        refreshUI
    );


    renderTraineeAssignments(
        currentMealBlocks,
        refreshUI
    );


    renderEmployeePoints(
        currentMealBlocks,
        refreshUI
    );


    renderCashTipSummary(
        currentMealBlocks
    );

}



// =========================
// SAVE STATE
// =========================

export function saveState() {

    sessionStorage.setItem(
        "mealBlocks",
        JSON.stringify(
            currentMealBlocks
        )
    );

}



// =========================
// NAVIGATION
// =========================

const backButton =
    document.getElementById(
        "backButton"
    );


if (backButton) {

    backButton.addEventListener(
        "click",
        () => {

            saveState();

            window.location.href =
                "../start/start.html";

        }
    );

}



const continueButton =
    document.getElementById(
        "continueButton"
    );


if (continueButton) {

    continueButton.addEventListener(
        "click",
        () => {

            saveState();

            window.location.href =
                "../distribution/distribution.html";

        }
    );

}



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

            const output =
                document.getElementById(
                    "debugOutput"
                );


            if (!output) {
                return;
            }


            output.textContent =
                JSON.stringify(
                    {
                        mealBlocks:
                            currentMealBlocks
                    },
                    null,
                    2
                );

        }
    );

}