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


    console.log(
        "SOURCE MEAL BLOCKS:",
        mealBlocks.length
    );


    console.log(
        "TARGET TIP DISTRIBUTION:",
        tipDistribution.length
    );


    let updatedCount = 0;


    // =================================================
    // LOOP SOURCE MEAL BLOCKS
    // =================================================

    for (
        const sourceBlock
        of mealBlocks
    ) {

        console.log(
            "----------------------------------------"
        );


        console.log(
            "SOURCE BLOCK:",
            {
                date:
                    sourceBlock.date,

                meal:
                    sourceBlock.meal
            }
        );


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


        console.log(
            "TARGET BLOCK FOUND:",
            {
                date:
                    targetBlock.date,

                meal:
                    targetBlock.meal,

                id:
                    targetBlock.id
            }
        );


        // =================================================
        // LOOP EMPLOYEES
        // =================================================

        for (
            const sourceEmployee
            of (
                sourceBlock.employees || []
            )
        ) {

            console.log(
                "SOURCE EMPLOYEE:",
                {
                    id:
                        sourceEmployee.employee_id,

                    name:
                        sourceEmployee.name,

                    cash_drop:
                        sourceEmployee.cash_drop,

                    cash_sales:
                        sourceEmployee.cash_sales,

                    cash_tips:
                        sourceEmployee.cash_tips,

                    role:
                        sourceEmployee.role
                }
            );


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

                console.error(
                    "NO TARGET EMPLOYEE FOUND:",
                    {
                        id:
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
            // BEFORE SYNC
            // =================================================

            console.log(
                "TARGET EMPLOYEE BEFORE SYNC:",
                {
                    id:
                        targetEmployee.employee_id,

                    name:
                        targetEmployee.name,

                    cash_drop:
                        targetEmployee.cash_drop,

                    cash_sales:
                        targetEmployee.cash_sales,

                    cash_sold:
                        targetEmployee.cash_sold,

                    cash_remaining:
                        targetEmployee.cash_remaining
                }
            );


            // =================================================
            // CONVERT VALUES
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


            console.log(
                "VALUES BEING COPIED:",
                {
                    sourceCashDrop:
                        sourceEmployee.cash_drop,

                    convertedCashDrop:
                        newCashDrop,

                    sourceCashSales:
                        sourceEmployee.cash_sales,

                    convertedCashSales:
                        newCashSales,

                    sourceCashTips:
                        sourceEmployee.cash_tips,

                    convertedCashTips:
                        newCashTips
                }
            );


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


            // =================================================
            // AFTER SYNC
            // =================================================

            console.log(
                "TARGET EMPLOYEE AFTER SYNC:",
                {
                    id:
                        targetEmployee.employee_id,

                    name:
                        targetEmployee.name,

                    cash_drop:
                        targetEmployee.cash_drop,

                    cash_sales:
                        targetEmployee.cash_sales,

                    cash_sold:
                        targetEmployee.cash_sold,

                    cash_tips:
                        targetEmployee.cash_tips,

                    cash_remaining:
                        targetEmployee.cash_remaining
                }
            );


            updatedCount++;

        }

    }


    // =================================================
    // COMPLETE
    // =================================================

    console.log(
        "========================================"
    );


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
        // DEBUG SOURCE CASH DROPS
        // =================================================

        console.log(
            "========================================"
        );


        console.log(
            "SOURCE CASH DROP CHECK"
        );


        for (
            const block
            of mealBlocks
        ) {

            for (
                const employee
                of (
                    block.employees || []
                )
            ) {

                if (
                    Number(
                        employee.cash_drop
                    ) > 0
                ) {

                    console.log(
                        "SOURCE CASH DROP FOUND:",
                        {
                            date:
                                block.date,

                            meal:
                                block.meal,

                            employee:
                                employee.name,

                            employee_id:
                                employee.employee_id,

                            cash_drop:
                                employee.cash_drop,

                            cash_sales:
                                employee.cash_sales
                        }
                    );

                }

            }

        }


        console.log(
            "========================================"
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


            console.log(
                "TIP DISTRIBUTION LOADED FROM INDEXED DB:",
                tipDistribution
            );


            console.log(
                "FIRST TIP DISTRIBUTION EMPLOYEES:",
                tipDistribution[0]?.employees
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


            await saveState(
                "tipDistribution",
                tipDistribution
            );


            console.log(
                "New tip distribution saved."
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
        // SYNC CASH DROPS BEFORE CALCULATIONS
        // =================================================

        syncCashDropsFromMealBlocks();


        // =================================================
        // SAVE THE SYNCHRONIZED DISTRIBUTION
        // =================================================

        await saveState(
            "tipDistribution",
            tipDistribution
        );


        console.log(
            "Tip distribution after cash-drop sync:",
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
    // SYNC CASH DROPS FIRST
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

        This means any changes made here
        survive navigation.
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