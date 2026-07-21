import { renderCashDropTables } from "./render/cashDropTables.js";
import { renderTraineeAssignments } from "./render/renderTraineeAssignments.js";
import { renderEmployeePoints } from "./render/renderEmployeePoints.js";
import { calculateCashTips } from "./logic/calculateCashTips.js";
import { renderCashTipSummary } from "./render/renderCashTipSummary.js";

// =========================
// LOAD SAVED DATA
// =========================

const currentMealBlocks =
    JSON.parse(
        sessionStorage.getItem("mealBlocks")
    ) || [];


// =========================
// PAGE
// =========================

if (currentMealBlocks.length === 0) {

    alert("No imported data found.");

    window.location.href = "/";

}

refreshUI();


// =========================
// UI
// =========================

function refreshUI() {

    calculateCashTips(
        currentMealBlocks
    );

    renderTraineeAssignments(
        currentMealBlocks,
        refreshUI
    );

    renderEmployeePoints(
        currentMealBlocks,
        refreshUI
    );

    renderCashDropTables(
        currentMealBlocks,
        refreshUI
    );

    renderCashTipSummary(
        currentMealBlocks
    );

}
// =========================
// SAVE
// =========================

export function saveState() {

    sessionStorage.setItem(
        "mealBlocks",
        JSON.stringify(currentMealBlocks)
    );

}


// =========================
// BUTTONS
// =========================

document
    .getElementById("backButton")
    .addEventListener("click", () => {

        saveState();

        window.location.href = "/";

    });

document
    .getElementById("continueButton")
    .addEventListener("click", () => {

        saveState();

        alert("Page 3 not built yet.");

    });











    // =========================
// DEBUG OBJECTS
// =========================

const debugButton =
    document.getElementById("debugObjects");


if (debugButton) {

    debugButton.addEventListener(
        "click",
        () => {

            const debug = {

                mealBlocks:
                    currentMealBlocks

            };


            document
                .getElementById("debugOutput")
                .textContent =
                JSON.stringify(
                    debug,
                    null,
                    2
                );

        }
    );

}



// =========================
// BUTTONS
// =========================

document
    .getElementById("backButton")
    .addEventListener("click", () => {

        saveState();

        window.location.href = "/";

    });


document
    .getElementById("continueButton")
    .addEventListener("click", () => {

        saveState();

        window.location.href = "../distribution/distribution.html";
    });