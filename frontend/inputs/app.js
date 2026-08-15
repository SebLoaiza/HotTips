import { HotTipsStorage }
    from "../storage/storage.js";

import { renderTraineeAssignments }
    from "./render/renderTraineeAssignments.js";

import { renderEmployeePoints }
    from "./render/renderEmployeePoints.js";

import { renderCashTipSummary }
    from "./render/renderCashTipSummary.js";

import { calculateCashTips }
    from "./logic/calculateCashTips.js";

import { renderCashDropList }
    from "./render/renderCashDropList.js";


// =================================================
// STATE
// =================================================

let currentMealBlocks = [];


// =================================================
// DOM
// =================================================

const backButton =
    document.getElementById(
        "backButton"
    );

const continueButton =
    document.getElementById(
        "continueButton"
    );

const debugButton =
    document.getElementById(
        "debugObjects"
    );


// =================================================
// LOAD DATA
// =================================================

async function loadState() {

    try {

        const savedMealBlocks =
            await HotTipsStorage.getItem(
                "mealBlocks"
            );


        currentMealBlocks =
            Array.isArray(
                savedMealBlocks
            )
                ? savedMealBlocks
                : [];


        console.log(
            "Inputs page loaded mealBlocks:",
            currentMealBlocks.length
        );


    } catch (error) {

        console.error(
            "Error loading mealBlocks:",
            error
        );


        currentMealBlocks = [];

    }


    // ---------------------------------------------
    // Validate that data actually exists
    // ---------------------------------------------

    if (
        currentMealBlocks.length === 0
    ) {

        alert(
            "No imported data found."
        );


        window.location.href =
            "../start/start.html";


        return false;

    }


    return true;

}


// =================================================
// VALIDATION
// =================================================

function validateInputs() {

    let valid = true;


    for (
        const block
        of currentMealBlocks
    ) {

        for (
            const employee
            of block.employees
        ) {

            const role =
                String(
                    employee.role || ""
                )
                .toLowerCase();


            if (
                !role.includes("trainee")
            ) {

                continue;

            }


            const hasTrainer =
                employee.trainer_employee_id != null;


            const noTrainer =
                employee.no_trainer === true;


            if (
                !hasTrainer &&
                !noTrainer
            ) {

                valid = false;

            }

        }

    }


    if (continueButton) {

        continueButton.disabled =
            !valid;


        continueButton.classList.toggle(
            "ready",
            valid
        );

    }

}


// =================================================
// REFRESH UI
// =================================================

function refreshUI() {

    calculateCashTips(
        currentMealBlocks
    );


    renderCashDropList(
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


    validateInputs();

}


// =================================================
// SAVE STATE
// =================================================

export async function saveState() {

    try {

        await HotTipsStorage.setItem(
            "mealBlocks",
            currentMealBlocks
        );


        console.log(
            "Inputs state saved."
        );


    } catch (error) {

        console.error(
            "Error saving mealBlocks:",
            error
        );

    }

}


// =================================================
// NAVIGATION
// =================================================

if (backButton) {

    backButton.addEventListener(
        "click",
        async () => {

            /*
                Wait for IndexedDB to finish
                before leaving the page.
            */

            await saveState();


            window.location.href =
                "../start/start.html";

        }
    );

}


if (continueButton) {

    continueButton.addEventListener(
        "click",
        async () => {

            /*
                Save the modified mealBlocks
                before moving to Distribution.
            */

            await saveState();


            window.location.href =
                "../distribution/distribution.html";

        }
    );

}


// =================================================
// TOP NAVIGATION
// =================================================

document
    .getElementById("topBackButton")
    ?.addEventListener(
        "click",
        async () => {

            await saveState();


            window.location.href =
                "../start/start.html";

        }
    );


document
    .getElementById("topContinueButton")
    ?.addEventListener(
        "click",
        async () => {

            await saveState();


            window.location.href =
                "../distribution/distribution.html";

        }
    );


// =================================================
// DEBUG
// =================================================

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


// =================================================
// INITIALIZE PAGE
// =================================================

(async () => {

    /*
        IMPORTANT:

        IndexedDB is asynchronous.

        We MUST wait for the data to come back
        before rendering the page.

        This prevents:

            page loads
                ↓
            empty array
                ↓
            render empty UI
                ↓
            IndexedDB finishes later

        Instead:

            page loads
                ↓
            wait for IndexedDB
                ↓
            get mealBlocks
                ↓
            render UI
    */

    const hasData =
        await loadState();


    if (!hasData) {

        return;

    }


    refreshUI();

})();