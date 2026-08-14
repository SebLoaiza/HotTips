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
// INDEXED DB
// =================================================

const DB_NAME =
    "HotTipsDB";

const STORE_NAME =
    "state";


// =================================================
// OPEN DATABASE
// =================================================

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME
                );


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


                    const version =
                        db.version;


                    db.close();


                    const upgradeRequest =
                        indexedDB.open(
                            DB_NAME,
                            version + 1
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
                store.get(
                    key
                );


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                    db.close();

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

                    db.close();

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
// STATE
// =================================================

let mealBlocks = [];

let tipDistribution = [];


// =================================================
// SYNC TIP POINTS
// =================================================

function syncTipPointsFromMealBlocks() {

    console.log(
        "========================================"
    );

    console.log(
        "TIP POINT SYNC START"
    );

    console.log(
        "========================================"
    );


    if (
        !Array.isArray(mealBlocks) ||
        !Array.isArray(tipDistribution)
    ) {

        console.error(
            "Tip point sync failed: arrays missing.",
            {
                mealBlocks,
                tipDistribution
            }
        );

        return;

    }


    let updatedCount = 0;


    // =================================================
    // LOOP MEAL BLOCKS
    // =================================================

    for (
        const sourceBlock
        of mealBlocks
    ) {

        // =================================================
        // FIND MATCHING DISTRIBUTION BLOCK
        // =================================================

        const targetBlock =
            tipDistribution.find(
                block => {

                    const sameId =
                        sourceBlock.id != null &&
                        block.id != null &&
                        String(
                            sourceBlock.id
                        ) ===
                        String(
                            block.id
                        );


                    const sameDate =
                        String(
                            block.date || ""
                        ) ===
                        String(
                            sourceBlock.date || ""
                        );


                    const sameMeal =
                        String(
                            block.meal || ""
                        ) ===
                        String(
                            sourceBlock.meal || ""
                        );


                    return (
                        sameId ||
                        (
                            sameDate &&
                            sameMeal
                        )
                    );

                }
            );


        if (!targetBlock) {

            console.warn(
                "No matching distribution block for:",
                {
                    date:
                        sourceBlock.date,

                    meal:
                        sourceBlock.meal
                }
            );

            continue;

        }


        // =================================================
        // LOOP SOURCE EMPLOYEES
        // =================================================

        for (
            const sourceEmployee
            of (
                sourceBlock.employees || []
            )
        ) {

            const targetEmployee =
                (
                    targetBlock.employees || []
                ).find(
                    employee =>

                        String(
                            employee.employee_id
                        ) ===
                        String(
                            sourceEmployee.employee_id
                        )
                );


            if (!targetEmployee) {

                continue;

            }


            // =================================================
            // DEFAULT TIP POINTS
            // =================================================

            const sourcePoints =
                Number(
                    sourceEmployee.tip_points
                );


            if (
                !Number.isFinite(
                    sourcePoints
                )
            ) {

                continue;

            }


            console.log(
                "SYNCING TIP POINTS:",
                {
                    employee:
                        sourceEmployee.name,

                    employee_id:
                        sourceEmployee.employee_id,

                    date:
                        sourceBlock.date,

                    meal:
                        sourceBlock.meal,

                    oldPoints:
                        targetEmployee.tip_points,

                    newPoints:
                        sourcePoints
                }
            );


            targetEmployee.tip_points =
                sourcePoints;


            updatedCount++;

        }

    }


    console.log(
        "TIP POINT SYNC COMPLETE"
    );


    console.log(
        "EMPLOYEES UPDATED:",
        updatedCount
    );


    console.log(
        "========================================"
    );

}


// =================================================
// SYNC CASH DROPS
// =================================================

function syncCashDropsFromMealBlocks() {

    console.log(
        "========================================"
    );

    console.log(
        "CASH DROP SYNC START"
    );

    console.log(
        "========================================"
    );


    if (
        !Array.isArray(mealBlocks) ||
        !Array.isArray(tipDistribution)
    ) {

        console.error(
            "Cash drop sync failed: arrays missing",
            {
                mealBlocks,
                tipDistribution
            }
        );

        return;

    }


    let updatedCount = 0;


    // =================================================
    // LOOP SOURCE MEAL BLOCKS
    // =================================================

    for (
        const sourceBlock
        of mealBlocks
    ) {

        // =================================================
        // FIND MATCHING TIP DISTRIBUTION BLOCK
        // =================================================

        const targetBlock =
            tipDistribution.find(
                block =>

                    String(
                        block.date
                    ) ===
                    String(
                        sourceBlock.date
                    )

                    &&

                    String(
                        block.meal
                    ) ===
                    String(
                        sourceBlock.meal
                    )
            );


        if (!targetBlock) {

            console.error(
                "NO TARGET BLOCK FOUND:",
                {
                    date:
                        sourceBlock.date,

                    meal:
                        sourceBlock.meal
                }
            );

            continue;

        }


        // =================================================
        // LOOP EMPLOYEES
        // =================================================

        for (
            const sourceEmployee
            of (
                sourceBlock.employees || []
            )
        ) {

            const targetEmployee =
                (
                    targetBlock.employees || []
                ).find(
                    employee =>

                        String(
                            employee.employee_id
                        ) ===
                        String(
                            sourceEmployee.employee_id
                        )
                );


            if (!targetEmployee) {

                continue;

            }


            // =================================================
            // VALUES
            // =================================================

            const newCashDrop =
                Number(
                    sourceEmployee.cash_drop
                ) || 0;


            const newCashSales =
                Number(
                    sourceEmployee.cash_sales
                ) || 0;


            const newCashTips =
                Number(
                    sourceEmployee.cash_tips
                ) || 0;


            // =================================================
            // COPY CASH VALUES
            // =================================================

            targetEmployee.cash_drop =
                newCashDrop;


            targetEmployee.cash_sales =
                newCashSales;


            targetEmployee.cash_sold =
                newCashSales;


            targetEmployee.cash_tips =
                newCashTips;


            targetEmployee.cash_remaining =
                newCashDrop -
                newCashSales;


            updatedCount++;

        }

    }


    console.log(
        "CASH DROP SYNC COMPLETE"
    );


    console.log(
        "UPDATED EMPLOYEES:",
        updatedCount
    );


    console.log(
        "========================================"
    );

}


// =================================================
// LOAD APPLICATION STATE
// =================================================

async function loadApplicationState() {

    try {

        console.log(
            "Starting Distribution page..."
        );


        // =================================================
        // LOAD MEAL BLOCKS
        // =================================================

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


            return false;

        }


        mealBlocks =
            savedMealBlocks;


        console.log(
            "Meal blocks loaded:",
            mealBlocks
        );


        // =================================================
        // LOAD EXISTING TIP DISTRIBUTION
        // =================================================

        const savedTipDistribution =
            await loadState(
                "tipDistribution"
            );


        if (
            Array.isArray(
                savedTipDistribution
            ) &&
            savedTipDistribution.length > 0
        ) {

            tipDistribution =
                savedTipDistribution;


            console.log(
                "Existing tip distribution loaded."
            );

        }

        else {

            // =================================================
            // CREATE NEW DISTRIBUTION
            // =================================================

            console.log(
                "Creating new tip distribution..."
            );


            tipDistribution =
                createTipDistribution(
                    mealBlocks
                );


            console.log(
                "New tip distribution created:",
                tipDistribution
            );

        }


        // =================================================
        // VALIDATE DISTRIBUTION
        // =================================================

        if (
            !Array.isArray(
                tipDistribution
            ) ||
            tipDistribution.length === 0
        ) {

            console.error(
                "Tip distribution is empty."
            );


            alert(
                "Could not create the tip distribution."
            );


            return false;

        }


        // =================================================
        // IMPORTANT:
        // SYNC DEFAULT TIP POINTS FIRST
        // =================================================

        syncTipPointsFromMealBlocks();


        // =================================================
        // SYNC CASH DROPS
        // =================================================

        syncCashDropsFromMealBlocks();


        // =================================================
        // SAVE SYNCHRONIZED DISTRIBUTION
        // =================================================

        await saveState(
            "tipDistribution",
            tipDistribution
        );


        console.log(
            "Tip distribution after initial sync:",
            tipDistribution
        );


        return true;

    }

    catch (error) {

        console.error(
            "Could not load application state:",
            error
        );


        alert(
            "Could not load the saved application data."
        );


        return false;

    }

}


// =================================================
// RECALCULATE DISTRIBUTION
// =================================================

function recalculateDistribution() {

    console.log(
        "========================================"
    );


    console.log(
        "RECALCULATING DISTRIBUTION"
    );


    // =================================================
    // SYNC CASH DROPS
    // =================================================

    syncCashDropsFromMealBlocks();


    // =================================================
    // RECALCULATE EACH MEAL BLOCK
    // =================================================

    for (
        const mealBlock
        of tipDistribution
    ) {

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


    console.log(
        "RECALCULATION COMPLETE"
    );


    console.log(
        "========================================"
    );

}


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
            of (
                mealBlock.employees || []
            )
        ) {

            originalCashTips +=
                Number(
                    employee.cash_tips
                ) || 0;


            originalCardTips +=
                Number(
                    employee.card_tips
                ) || 0;


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

function money(cents) {

    return `$${(
        (Number(cents) || 0) /
        100
    ).toFixed(2)}`;

}


// =================================================
// SAVE TIP DISTRIBUTION
// =================================================

async function saveTipDistribution() {

    try {

        await saveState(
            "tipDistribution",
            tipDistribution
        );


        console.log(
            "Tip distribution saved."
        );


        return true;

    }

    catch (error) {

        console.error(
            "Could not save tip distribution:",
            error
        );


        return false;

    }

}


// =================================================
// REFRESH UI
// =================================================

async function refreshUI() {

    // =================================================
    // RECALCULATE
    // =================================================

    recalculateDistribution();


    // =================================================
    // UPDATE TOTALS
    // =================================================

    updateDistributionTotals();


    // =================================================
    // SAVE
    // =================================================

    await saveTipDistribution();


    // =================================================
    // RENDER
    // =================================================

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
    async (event) => {

        if (
            !event.target.classList.contains(
                "tip-point-input"
            )
        ) {

            return;

        }


        // =================================================
        // EMPLOYEE ID
        // =================================================

        const employeeId =
            event.target.dataset.employeeId;


        // =================================================
        // MEAL BLOCK ID
        // =================================================

        const mealBlockId =
            event.target.dataset.mealBlockId;


        // =================================================
        // NEW POINTS
        // =================================================

        let newPoints =
            Number(
                event.target.value
            );


        if (
            Number.isNaN(
                newPoints
            ) ||
            newPoints < 0
        ) {

            newPoints = 0;

        }


        event.target.value =
            newPoints;


        // =================================================
        // FIND MEAL BLOCK
        // =================================================

        const mealBlock =
            tipDistribution.find(
                block =>
                    String(
                        block.id
                    ) ===
                    String(
                        mealBlockId
                    )
            );


        if (!mealBlock) {

            console.warn(
                "Meal block not found:",
                mealBlockId
            );


            return;

        }


        // =================================================
        // FIND EMPLOYEE
        // =================================================

        const employee =
            (
                mealBlock.employees || []
            ).find(
                employee =>
                    String(
                        employee.employee_id
                    ) ===
                    String(
                        employeeId
                    )
            );


        if (!employee) {

            console.warn(
                "Employee not found:",
                employeeId
            );


            return;

        }


        // =================================================
        // SAVE NEW POINTS
        // =================================================

        employee.tip_points =
            newPoints;


        // =================================================
        // RECALCULATE THIS MEAL BLOCK
        // =================================================

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


        // =================================================
        // SAVE + REFRESH
        // =================================================

        await saveTipDistribution();

        await refreshUI();

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


                const savedTipDistribution =
                    await loadState(
                        "tipDistribution"
                    );


                output.textContent =
                    JSON.stringify(
                        {
                            mealBlocks:
                                savedMealBlocks,

                            tipDistribution:
                                savedTipDistribution

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


// =================================================
// GO TO RESULTS
// =================================================

async function goToResults() {

    // =================================================
    // FINAL CALCULATION
    // =================================================

    recalculateDistribution();


    // =================================================
    // SAVE FINAL DISTRIBUTION
    // =================================================

    const saved =
        await saveTipDistribution();


    if (!saved) {

        console.error(
            "Could not save final distribution."
        );


        return;

    }


    // =================================================
    // GO TO RESULTS
    // =================================================

    window.location.href =
        "../results/results.html";

}


// =================================================
// RESULTS / CONTINUE
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

async function goBack() {

    /*
        Save the current distribution before
        returning to Inputs.
    */

    await saveTipDistribution();


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

async function start() {

    const loaded =
        await loadApplicationState();


    if (!loaded) {

        return;

    }


    await refreshUI();

}


start();