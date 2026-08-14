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

let mealBlocks = [];

let tipDistribution = [];


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

            console.warn(
                "NO TARGET BLOCK FOUND FOR CASH SYNC:",
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

            // =================================================
            // FIND MATCHING EMPLOYEE
            // =================================================

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

                console.warn(
                    "NO TARGET EMPLOYEE FOUND FOR CASH SYNC:",
                    {
                        employee_id:
                            sourceEmployee.employee_id,

                        name:
                            sourceEmployee.name,

                        date:
                            sourceBlock.date,

                        meal:
                            sourceBlock.meal
                    }
                );

                continue;

            }


            // =================================================
            // CASH DROP
            // =================================================

            const newCashDrop =
                Number(
                    sourceEmployee.cash_drop
                ) || 0;


            // =================================================
            // CASH SALES
            // =================================================

            const newCashSales =
                Number(
                    sourceEmployee.cash_sales
                ) || 0;


            // =================================================
            // CASH TIPS
            // =================================================

            const newCashTips =
                Number(
                    sourceEmployee.cash_tips
                ) || 0;


            // =================================================
            // COPY CASH DROP
            // =================================================

            targetEmployee.cash_drop =
                newCashDrop;


            // =================================================
            // COPY CASH SALES
            // =================================================

            targetEmployee.cash_sales =
                newCashSales;


            // =================================================
            // CASH SOLD
            // =================================================

            targetEmployee.cash_sold =
                newCashSales;


            // =================================================
            // CASH TIPS
            // =================================================

            targetEmployee.cash_tips =
                newCashTips;


            // =================================================
            // CASH REMAINING
            // =================================================

            targetEmployee.cash_remaining =
                newCashDrop -
                newCashSales;


            updatedCount++;

        }

    }


    console.log(
        "CASH DROP SYNC COMPLETE:",
        updatedCount
    );

}


// =================================================
// SYNC TIP POINTS
//
// IMPORTANT:
//
// This is ONLY called when the Distribution page
// loads.
//
// It does NOT run during refreshUI() or
// recalculateDistribution().
//
// This means:
//     Employee Points page
//              ↓
//       Distribution page load
//              ↓
//       Distribution owns points
//
// Editing points on Distribution will therefore
// survive recalculation and refresh.
// =================================================

function syncTipPointsFromMealBlocks() {

    console.log(
        "========================================"
    );

    console.log(
        "TIP POINT INITIAL SYNC"
    );

    console.log(
        "========================================"
    );


    if (
        !Array.isArray(mealBlocks) ||
        !Array.isArray(tipDistribution)
    ) {

        console.error(
            "Tip point sync failed: arrays missing",
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
        // FIND MATCHING DISTRIBUTION BLOCK
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

            console.warn(
                "NO TARGET BLOCK FOUND FOR TIP POINT SYNC:",
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

            // =================================================
            // FIND MATCHING EMPLOYEE
            // =================================================

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

                console.warn(
                    "NO TARGET EMPLOYEE FOUND FOR TIP POINT SYNC:",
                    {
                        employee_id:
                            sourceEmployee.employee_id,

                        name:
                            sourceEmployee.name,

                        date:
                            sourceBlock.date,

                        meal:
                            sourceBlock.meal
                    }
                );

                continue;

            }


            // =================================================
            // GET POINTS
            // =================================================

            let points =
                Number(
                    sourceEmployee.tip_points
                );


            if (
                Number.isNaN(points) ||
                points < 0
            ) {

                points = 0;

            }


            // =================================================
            // COPY POINTS
            // =================================================

            targetEmployee.tip_points =
                points;


            updatedCount++;


            console.log(
                "TIP POINT INITIALIZED:",
                {
                    employee:
                        sourceEmployee.name,

                    employee_id:
                        sourceEmployee.employee_id,

                    date:
                        sourceBlock.date,

                    meal:
                        sourceBlock.meal,

                    points
                }
            );

        }

    }


    console.log(
        "TIP POINT INITIAL SYNC COMPLETE:",
        updatedCount
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
        // INITIAL PAGE-LOAD SYNC
        //
        // Cash drops are synchronized from Inputs.
        //
        // Tip points are synchronized from Employee
        // Points ONLY HERE during page initialization.
        // =================================================

        syncCashDropsFromMealBlocks();

        syncTipPointsFromMealBlocks();


        // =================================================
        // SAVE INITIALIZED DISTRIBUTION
        // =================================================

        await saveState(
            "tipDistribution",
            tipDistribution
        );


        console.log(
            "Initial tip distribution ready:",
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
//
// IMPORTANT:
//
// Do NOT sync tip points here.
//
// The points in tipDistribution are now the
// values being edited by this page.
//
// Only cash-drop information comes from
// mealBlocks during recalculation.
// =================================================

function recalculateDistribution() {

    console.log(
        "========================================"
    );

    console.log(
        "RECALCULATING DISTRIBUTION"
    );

    console.log(
        "========================================"
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

        console.log(
            "RECALCULATING:",
            {
                date:
                    mealBlock.date,

                meal:
                    mealBlock.meal
            }
        );


        // =================================================
        // REBUILD POOLS
        // =================================================

        rebuildDistributionPools(
            mealBlock
        );


        // =================================================
        // CALCULATE ROLE RATIOS
        // =================================================

        calculateRoleRatios(
            mealBlock
        );


        // =================================================
        // DISTRIBUTE TIPS
        // =================================================

        distributeTips(
            mealBlock
        );


        // =================================================
        // DISTRIBUTE POOLS
        // =================================================

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

        // =================================================
        // EMPLOYEES
        // =================================================

        for (
            const employee
            of (
                mealBlock.employees || []
            )
        ) {

            // =================================================
            // ORIGINAL CASH
            // =================================================

            originalCashTips +=
                Number(
                    employee.cash_tips
                ) || 0;


            // =================================================
            // ORIGINAL CARD
            // =================================================

            originalCardTips +=
                Number(
                    employee.card_tips
                ) || 0;


            // =================================================
            // CASH KEPT
            // =================================================

            const cashKept =
                Number(
                    employee.cash_kept
                ) || 0;


            // =================================================
            // CASH FROM POOL
            // =================================================

            const cashPooled =
                Number(
                    employee.pool_cash_received
                ) || 0;


            totalCashDistributed +=
                cashKept +
                cashPooled;


            // =================================================
            // CARD KEPT
            // =================================================

            const cardKept =
                Number(
                    employee.card_kept
                ) || 0;


            // =================================================
            // CARD FROM POOL
            // =================================================

            const cardPooled =
                Number(
                    employee.pool_card_received
                ) || 0;


            totalCardDistributed +=
                cardKept +
                cardPooled;

        }

    }


    // =================================================
    // ORIGINAL CASH
    // =================================================

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


    // =================================================
    // DISTRIBUTED CASH
    // =================================================

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


    // =================================================
    // ORIGINAL CARD
    // =================================================

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


    // =================================================
    // DISTRIBUTED CARD
    // =================================================

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


        console.log(
            "Distribution tip points changed:",
            {
                employee_id:
                    employeeId,

                mealBlockId:
                    mealBlockId,

                points:
                    newPoints
            }
        );


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
        // SAVE
        // =================================================

        await saveTipDistribution();


        // =================================================
        // REFRESH
        //
        // IMPORTANT:
        //
        // refreshUI() does NOT sync tip points from
        // mealBlocks.
        //
        // Therefore this new value remains intact.
        // =================================================

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

        Distribution edits are preserved in
        tipDistribution.
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