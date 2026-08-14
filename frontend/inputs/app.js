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
                        !db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        db.close();


                        const upgradeRequest =
                            indexedDB.open(
                                DB_NAME,
                                db.version + 1
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


                        return;

                    }


                    resolve(db);

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

async function loadState(key) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

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

                    resolve(
                        request.result
                    );

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
// SAVE STATE
// =================================================

async function saveState(
    key,
    value
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

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

                    resolve();

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
// SAVE MEAL BLOCKS
// =================================================

async function saveMealBlocks() {

    try {

        await saveState(
            "mealBlocks",
            currentMealBlocks
        );


        console.log(
            "Meal blocks saved."
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
// GO BACK TO START
// =================================================

async function goBack() {

    const saved =
        await saveMealBlocks();


    if (!saved) {

        console.error(
            "Could not save before returning to Start."
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

    if (
        continueButton &&
        continueButton.disabled
    ) {

        return;

    }


    const saved =
        await saveMealBlocks();


    if (!saved) {

        console.error(
            "Could not save before opening Distribution."
        );


        return;

    }


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
// DEBUG
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


            alert(
                "No imported data found."
            );


            window.location.href =
                "../start/start.html";


            return;

        }


        currentMealBlocks =
            savedMealBlocks;


        console.log(
            "Meal blocks loaded:",
            currentMealBlocks
        );


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