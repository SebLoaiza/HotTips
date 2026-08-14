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
// INDEXED DB
// =================================================

const DB_NAME = "HotTipsDB";
const STORE_NAME = "state";


// =================================================
// OPEN DATABASE
// =================================================

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(DB_NAME);


            request.onupgradeneeded =
                () => {

                    const db =
                        request.result;


                    if (
                        !db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        db.createObjectStore(
                            STORE_NAME
                        );

                    }

                };


            request.onsuccess =
                () => {

                    const db =
                        request.result;


                    if (
                        db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        resolve(db);

                        return;

                    }


                    /*
                        This should normally never be
                        necessary because the store is
                        created in onupgradeneeded.

                        It is kept here as a safety net.
                    */

                    const currentVersion =
                        db.version;


                    db.close();


                    const upgradeRequest =
                        indexedDB.open(
                            DB_NAME,
                            currentVersion + 1
                        );


                    upgradeRequest.onupgradeneeded =
                        () => {

                            const upgradedDB =
                                upgradeRequest.result;


                            if (
                                !upgradedDB.objectStoreNames.contains(
                                    STORE_NAME
                                )
                            ) {

                                upgradedDB.createObjectStore(
                                    STORE_NAME
                                );

                            }

                        };


                    upgradeRequest.onsuccess =
                        () => {

                            resolve(
                                upgradeRequest.result
                            );

                        };


                    upgradeRequest.onerror =
                        () => {

                            reject(
                                upgradeRequest.error
                            );

                        };

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// =================================================
// LOAD STATE
// =================================================

async function loadState(
    key
) {

    const db =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.get(key);


            request.onsuccess =
                () => {

                    const result =
                        request.result;


                    db.close();


                    resolve(
                        result
                    );

                };


            request.onerror =
                () => {

                    db.close();


                    reject(
                        request.error
                    );

                };

        }
    );

}


// =================================================
// SAVE STATE
// =================================================

async function saveState(
    key,
    value
) {

    const db =
        await openDatabase();


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.put(
                    value,
                    key
                );


            request.onsuccess =
                () => {

                    db.close();


                    resolve();

                };


            request.onerror =
                () => {

                    db.close();


                    reject(
                        request.error
                    );

                };

        }
    );

}


// =================================================
// CURRENT STATE
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
            of (
                block.employees || []
            )
        ) {

            const role =
                String(
                    employee.role || ""
                )
                .toLowerCase();


            /*
                Only trainees require a trainer.
            */

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


    if (!continueButton) {

        return;

    }


    continueButton.disabled =
        !valid;


    continueButton.classList.toggle(
        "ready",
        valid
    );

}


// =================================================
// SAVE CURRENT MEAL BLOCKS
// =================================================

async function saveMealBlocks() {

    try {

        /*
            currentMealBlocks is the single source
            of truth for the Inputs page.

            Anything changed inside the employee
            objects, including:

                employee.tip_points
                employee.cash_drop
                employee.trainer_employee_id
                employee.no_trainer

            will be saved here.
        */

        await saveState(
            "mealBlocks",
            currentMealBlocks
        );


        console.log(
            "Meal blocks saved:",
            currentMealBlocks
        );


        return true;

    }

    catch (error) {

        console.error(
            "Could not save meal blocks:",
            error
        );


        return false;

    }

}


// =================================================
// REFRESH UI
// =================================================

function refreshUI() {

    /*
        Recalculate values that depend on the
        current meal blocks.
    */

    calculateCashTips(
        currentMealBlocks
    );


    /*
        Render everything from currentMealBlocks.

        These render functions should modify the
        objects inside currentMealBlocks rather
        than replacing the entire state.
    */

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
// GO BACK
// =================================================

async function goBack() {

    const saved =
        await saveMealBlocks();


    if (!saved) {

        console.error(
            "Could not save before returning."
        );


        alert(
            "Could not save the current data."
        );


        return;

    }


    window.location.href =
        "../start/start.html";

}


// =================================================
// GO TO DISTRIBUTION
// =================================================

async function goToDistribution() {

    /*
        Do not continue if trainee validation
        has not passed.
    */

    if (
        continueButton &&
        continueButton.disabled
    ) {

        return;

    }


    /*
        Save EVERYTHING currently in memory
        before leaving Inputs.

        This includes employee.tip_points.
    */

    const saved =
        await saveMealBlocks();


    if (!saved) {

        console.error(
            "Could not save before opening Distribution."
        );


        alert(
            "Could not save the current data."
        );


        return;

    }


    console.log(
        "Opening Distribution with:",
        currentMealBlocks
    );


    window.location.href =
        "../distribution/distribution.html";

}


// =================================================
// BACK BUTTON
// =================================================

if (backButton) {

    backButton.addEventListener(
        "click",
        goBack
    );

}


// =================================================
// CONTINUE BUTTON
// =================================================

if (continueButton) {

    continueButton.addEventListener(
        "click",
        goToDistribution
    );

}


// =================================================
// TOP BACK BUTTON
// =================================================

document
    .getElementById(
        "topBackButton"
    )
    ?.addEventListener(
        "click",
        goBack
    );


// =================================================
// TOP CONTINUE BUTTON
// =================================================

document
    .getElementById(
        "topContinueButton"
    )
    ?.addEventListener(
        "click",
        goToDistribution
    );


// =================================================
// DEBUG BUTTON
// =================================================

if (debugButton) {

    debugButton.addEventListener(
        "click",
        async () => {

            const output =
                document.getElementById(
                    "debugOutput"
                );


            if (!output) {

                return;

            }


            try {

                /*
                    Read directly from IndexedDB so
                    this shows what is ACTUALLY saved,
                    not merely what is currently in memory.
                */

                const savedMealBlocks =
                    await loadState(
                        "mealBlocks"
                    );


                output.textContent =
                    JSON.stringify(
                        {
                            mealBlocks:
                                savedMealBlocks
                        },
                        null,
                        2
                    );

            }

            catch (error) {

                console.error(
                    "Could not load debug state:",
                    error
                );


                output.textContent =
                    String(
                        error
                    );

            }

        }
    );

}


// =================================================
// LOAD PAGE
// =================================================

async function start() {

    console.log(
        "Starting Inputs page..."
    );


    try {

        /*
            Load the exact mealBlocks object that
            was previously saved.
        */

        const savedMealBlocks =
            await loadState(
                "mealBlocks"
            );


        if (
            !Array.isArray(
                savedMealBlocks
            ) ||
            savedMealBlocks.length === 0
        ) {

            console.warn(
                "No meal blocks found in IndexedDB."
            );


            /*
                Stay on the page instead of
                redirecting automatically.
            */

            return;

        }


        /*
            IMPORTANT:

            Use the saved objects directly.

            Do NOT rebuild employee objects.
            Do NOT regenerate tip_points.
            Do NOT reset defaults here.
        */

        currentMealBlocks =
            savedMealBlocks;


        console.log(
            "Meal blocks loaded:",
            currentMealBlocks
        );


        /*
            Render the saved state.
        */

        refreshUI();

    }

    catch (error) {

        console.error(
            "Could not load application state:",
            error
        );


        alert(
            "Could not load the saved application data."
        );

    }

}


// =================================================
// START APPLICATION
// =================================================

start();