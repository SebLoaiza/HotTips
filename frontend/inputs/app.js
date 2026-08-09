import { renderCashDropTables } from "./render/cashDropGrid.js";
import { renderTraineeAssignments } from "./render/renderTraineeAssignments.js";
import { renderEmployeePoints } from "./render/renderEmployeePoints.js";
import { renderCashTipSummary } from "./render/renderCashTipSummary.js";
import { calculateCashTips } from "./logic/calculateCashTips.js";
import { renderCashDropList } from "./render/renderCashDropList.js";

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
// DOM
// =========================

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




// =========================
// VALIDATION
// =========================

function validateInputs() {

    let valid = true;


    for (const block of currentMealBlocks) {


        for (const employee of block.employees) {


            if (
                !employee.role
                    .toLowerCase()
                    .includes("trainee")
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



        if (valid) {

            continueButton.classList.add(
                "ready"
            );

        }

        else {

            continueButton.classList.remove(
                "ready"
            );

        }


    }


}

// =========================
// REFRESH UI
// =========================

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
// TOP NAVIGATION
// =========================

document
.getElementById("topBackButton")
?.addEventListener(
    "click",
    () => {

        window.location.href =
                "../start/start.html";

    }
);



document
.getElementById("topContinueButton")
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
            "../distribution/distribution.html";

    }
);


// =========================
// DEBUG
// =========================

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



// =========================
// INITIAL RENDER
// =========================

refreshUI();
