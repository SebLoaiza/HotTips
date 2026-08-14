import { readCsv } from "./parsing/csv.js";

import { createMealBlocks } from "./models/mealBlock.js";
import { createMealParticipations } from "./models/mealParticipation.js";
import { createOrders } from "./models/order.js";
import { createPayments } from "./models/payment.js";

import { assignMealParticipations } from "./logic/assignMealParticipations.js";
import { assignOrdersToEmployees } from "./logic/assignOrdersToEmployees.js";
import { assignOrders } from "./logic/assignOrders.js";
import { enrichOrdersWithPayments } from "./logic/enrichOrdersWithPayments.js";
import { calculateParticipationTotals } from "./logic/calculateParticipationTotals.js";

import { renderTipTables } from "./render/tipTables.js";
import { renderCashCollectedTables } from "./render/cashCollectedTables.js";


// =================================================
// INDEXED DB
// =================================================

const DB_NAME = "HotTipsDB";

const STORE_NAME = "state";


// =================================================
// STATE
// =================================================

let currentMealBlocks = [];

let currentMealParticipations = [];

let currentOrders = [];

let currentPayments = [];


// =================================================
// ELEMENTS
// =================================================

const shiftInput =
    document.getElementById("shiftCsv");

const orderInput =
    document.getElementById("orderCsv");

const paymentInput =
    document.getElementById("paymentCsv");

const debugButton =
    document.getElementById("debugObjects");

const debugOutput =
    document.getElementById("debugOutput");

const nextButton =
    document.getElementById("nextPage");

const resetButton =
    document.getElementById("resetProcess");

const shiftCard =
    document.getElementById("shiftCard");

const orderCard =
    document.getElementById("orderCard");

const paymentCard =
    document.getElementById("paymentCard");


// =================================================
// INITIAL BUTTON STATE
// =================================================

if (nextButton) {

    nextButton.disabled = true;

}


// =================================================
// OPEN INDEXED DB
// =================================================

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME
                );


            // -----------------------------------------
            // DATABASE CREATED FOR THE FIRST TIME
            // -----------------------------------------

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


            // -----------------------------------------
            // DATABASE OPENED
            // -----------------------------------------

            request.onsuccess =
                () => {

                    const db =
                        request.result;


                    /*
                        Normally the state store already
                        exists.

                        This check protects against a
                        partially-created database.
                    */

                    if (
                        db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        resolve(db);

                        return;

                    }


                    /*
                        The database exists but the store
                        does not.

                        Close it and upgrade to the next
                        version.
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


            // -----------------------------------------
            // ERROR
            // -----------------------------------------

            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };


            // -----------------------------------------
            // VERSION BLOCKED
            // -----------------------------------------

            request.onblocked =
                () => {

                    reject(
                        new Error(
                            "HotTips database is blocked by another open page."
                        )
                    );

                };

        }
    );

}


// =================================================
// SAVE ONE STATE VALUE
// =================================================

async function saveState(
    key,
    value
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            let transaction;

            try {

                transaction =
                    db.transaction(
                        STORE_NAME,
                        "readwrite"
                    );

            }

            catch (error) {

                db.close();

                reject(error);

                return;

            }


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


            transaction.oncomplete =
                () => {

                    db.close();

                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error
                    );

                };


            transaction.onabort =
                () => {

                    reject(
                        transaction.error ||
                        new Error(
                            "IndexedDB transaction aborted."
                        )
                    );

                };

        }
    );

}


// =================================================
// LOAD ONE STATE VALUE
// =================================================

async function loadState(
    key
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            let transaction;

            try {

                transaction =
                    db.transaction(
                        STORE_NAME,
                        "readonly"
                    );

            }

            catch (error) {

                db.close();

                reject(error);

                return;

            }


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


            transaction.oncomplete =
                () => {

                    db.close();

                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


// =================================================
// DELETE ONE STATE VALUE
// =================================================

async function deleteState(
    key
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
                store.delete(
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


            transaction.oncomplete =
                () => {

                    db.close();

                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


// =================================================
// CLEAR APPLICATION STATE
// =================================================

async function clearApplicationState() {

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
                store.clear();


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


            transaction.oncomplete =
                () => {

                    db.close();

                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


// =================================================
// CHECK IF DATA EXISTS
// =================================================

function hasShiftData() {

    return (
        Array.isArray(
            currentMealBlocks
        ) &&
        currentMealBlocks.length > 0
    );

}


function hasOrderData() {

    return (
        Array.isArray(
            currentOrders
        ) &&
        currentOrders.length > 0
    );

}


function hasPaymentData() {

    return (
        Array.isArray(
            currentPayments
        ) &&
        currentPayments.length > 0
    );

}


// =================================================
// CHECK IF FILE IS CURRENTLY SELECTED
// =================================================

function hasShiftFile() {

    return (
        shiftInput &&
        shiftInput.files &&
        shiftInput.files.length > 0
    );

}


function hasOrderFile() {

    return (
        orderInput &&
        orderInput.files &&
        orderInput.files.length > 0
    );

}


function hasPaymentFile() {

    return (
        paymentInput &&
        paymentInput.files &&
        paymentInput.files.length > 0
    );

}


// =================================================
// SHIFT CSV
// =================================================

if (shiftInput) {

    shiftInput.addEventListener(
        "change",
        async (event) => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            try {

                console.log(
                    "Reading Shift CSV..."
                );


                const rows =
                    await readCsv(file);


                currentMealBlocks =
                    createMealBlocks(
                        rows
                    );


                currentMealParticipations =
                    createMealParticipations(
                        rows
                    );


                shiftCard?.classList.add(
                    "completed"
                );


                await rebuildMealBlocks();


            }

            catch (error) {

                console.error(
                    "Error reading Shift CSV:",
                    error
                );


                shiftCard?.classList.remove(
                    "completed"
                );


                updateContinueButton();

            }

        }
    );

}


// =================================================
// ORDER CSV
// =================================================

if (orderInput) {

    orderInput.addEventListener(
        "change",
        async (event) => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            try {

                console.log(
                    "Reading Order CSV..."
                );


                const rows =
                    await readCsv(file);


                currentOrders =
                    createOrders(
                        rows
                    );


                orderCard?.classList.add(
                    "completed"
                );


                await rebuildMealBlocks();


            }

            catch (error) {

                console.error(
                    "Error reading Order CSV:",
                    error
                );


                orderCard?.classList.remove(
                    "completed"
                );


                updateContinueButton();

            }

        }
    );

}


// =================================================
// PAYMENT CSV
// =================================================

if (paymentInput) {

    paymentInput.addEventListener(
        "change",
        async (event) => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            try {

                console.log(
                    "Reading Payment CSV..."
                );


                const rows =
                    await readCsv(file);


                currentPayments =
                    createPayments(
                        rows
                    );


                paymentCard?.classList.add(
                    "completed"
                );


                await rebuildMealBlocks();


            }

            catch (error) {

                console.error(
                    "Error reading Payment CSV:",
                    error
                );


                paymentCard?.classList.remove(
                    "completed"
                );


                updateContinueButton();

            }

        }
    );

}


// =================================================
// REBUILD MEAL BLOCKS
// =================================================

async function rebuildMealBlocks() {

    /*
        Only perform logic that is possible
        with the data currently available.
    */


    // ---------------------------------------------
    // MEAL PARTICIPATIONS
    // ---------------------------------------------

    if (
        currentMealBlocks.length > 0 &&
        currentMealParticipations.length > 0
    ) {

        assignMealParticipations(
            currentMealBlocks,
            currentMealParticipations
        );

    }


    // ---------------------------------------------
    // PAYMENT ENRICHMENT
    // ---------------------------------------------

    if (
        currentOrders.length > 0 &&
        currentPayments.length > 0
    ) {

        enrichOrdersWithPayments(
            currentOrders,
            currentPayments
        );

    }


    // ---------------------------------------------
    // ASSIGN ORDERS
    // ---------------------------------------------

    if (
        currentMealBlocks.length > 0 &&
        currentOrders.length > 0
    ) {

        assignOrders(
            currentMealBlocks,
            currentOrders
        );


        assignOrdersToEmployees(
            currentMealBlocks
        );

    }


    // ---------------------------------------------
    // PARTICIPATION TOTALS
    // ---------------------------------------------

    if (
        currentMealBlocks.length > 0
    ) {

        calculateParticipationTotals(
            currentMealBlocks
        );

    }


    // ---------------------------------------------
    // SAVE
    // ---------------------------------------------

    try {

        await saveAllState();

    }

    catch (error) {

        console.error(
            "Could not save application state:",
            error
        );


        alert(
            "Could not save the imported data.\n\n" +
            "Please check the browser storage settings."
        );

        return;

    }


    // ---------------------------------------------
    // RENDER
    // ---------------------------------------------

    refreshUI();


    // ---------------------------------------------
    // CONTINUE
    // ---------------------------------------------

    updateContinueButton();

}


// =================================================
// SAVE ALL STATE
// =================================================

async function saveAllState() {

    console.log(
        "Saving HotTips application state..."
    );


    /*
        Save each dataset into its own IndexedDB
        key.

        IndexedDB can store much larger objects than
        sessionStorage.
    */

    await saveState(
        "mealBlocks",
        currentMealBlocks
    );


    await saveState(
        "mealParticipations",
        currentMealParticipations
    );


    await saveState(
        "orders",
        currentOrders
    );


    await saveState(
        "payments",
        currentPayments
    );


    console.log(
        "HotTips application state saved."
    );

}


// =================================================
// LOAD STATE
// =================================================

async function loadSavedState() {

    try {

        console.log(
            "Loading HotTips application state..."
        );


        // -----------------------------------------
        // LOAD MEAL BLOCKS
        // -----------------------------------------

        const savedBlocks =
            await loadState(
                "mealBlocks"
            );


        // -----------------------------------------
        // LOAD PARTICIPATIONS
        // -----------------------------------------

        const savedParticipations =
            await loadState(
                "mealParticipations"
            );


        // -----------------------------------------
        // LOAD ORDERS
        // -----------------------------------------

        const savedOrders =
            await loadState(
                "orders"
            );


        // -----------------------------------------
        // LOAD PAYMENTS
        // -----------------------------------------

        const savedPayments =
            await loadState(
                "payments"
            );


        // -----------------------------------------
        // RESTORE STATE
        // -----------------------------------------

        currentMealBlocks =
            Array.isArray(
                savedBlocks
            )
                ? savedBlocks
                : [];


        currentMealParticipations =
            Array.isArray(
                savedParticipations
            )
                ? savedParticipations
                : [];


        currentOrders =
            Array.isArray(
                savedOrders
            )
                ? savedOrders
                : [];


        currentPayments =
            Array.isArray(
                savedPayments
            )
                ? savedPayments
                : [];


        console.log(
            "=============================="
        );


        console.log(
            "SAVED STATE LOADED"
        );


        console.log(
            "=============================="
        );


        console.log(
            {
                mealBlocks:
                    currentMealBlocks.length,

                mealParticipations:
                    currentMealParticipations.length,

                orders:
                    currentOrders.length,

                payments:
                    currentPayments.length
            }
        );


        // -----------------------------------------
        // UPDATE UI
        // -----------------------------------------

        updateCardStatus();

        updateContinueButton();


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
// UPDATE CARD STATUS
// =================================================

function updateCardStatus() {

    /*
        A card is complete if either:

        1. Its file is currently selected

        OR

        2. Its processed data was restored from
           IndexedDB.
    */


    const shiftComplete =
        hasShiftFile() ||
        hasShiftData();


    const orderComplete =
        hasOrderFile() ||
        hasOrderData();


    const paymentComplete =
        hasPaymentFile() ||
        hasPaymentData();


    shiftCard?.classList.toggle(
        "completed",
        shiftComplete
    );


    orderCard?.classList.toggle(
        "completed",
        orderComplete
    );


    paymentCard?.classList.toggle(
        "completed",
        paymentComplete
    );

}


// =================================================
// CONTINUE BUTTON
// =================================================

function updateContinueButton() {

    if (!nextButton) {

        return;

    }


    const shiftComplete =
        hasShiftFile() ||
        hasShiftData();


    const orderComplete =
        hasOrderFile() ||
        hasOrderData();


    const paymentComplete =
        hasPaymentFile() ||
        hasPaymentData();


    const allComplete =
        shiftComplete &&
        orderComplete &&
        paymentComplete;


    // ---------------------------------------------
    // CARD STATUS
    // ---------------------------------------------

    shiftCard?.classList.toggle(
        "completed",
        shiftComplete
    );


    orderCard?.classList.toggle(
        "completed",
        orderComplete
    );


    paymentCard?.classList.toggle(
        "completed",
        paymentComplete
    );


    // ---------------------------------------------
    // BUTTON
    // ---------------------------------------------

    nextButton.disabled =
        !allComplete;


    console.log(
        "Continue check:",
        {
            shiftComplete,

            orderComplete,

            paymentComplete,

            allComplete,

            shiftFile:
                hasShiftFile(),

            shiftData:
                hasShiftData(),

            orderFile:
                hasOrderFile(),

            orderData:
                hasOrderData(),

            paymentFile:
                hasPaymentFile(),

            paymentData:
                hasPaymentData()
        }
    );

}


// =================================================
// REFRESH UI
// =================================================

function refreshUI() {

    renderOverallTotals();

    renderOverallCashSales();


    renderTipTables(
        currentMealBlocks
    );


    renderCashCollectedTables(
        currentMealBlocks
    );

}


// =================================================
// DEBUG
// =================================================

if (debugButton) {

    debugButton.onclick =
        async () => {

            try {

                const debug = {

                    mealBlocks:
                        currentMealBlocks,

                    participations:
                        currentMealParticipations,

                    orders:
                        currentOrders,

                    payments:
                        currentPayments

                };


                if (debugOutput) {

                    debugOutput.textContent =
                        JSON.stringify(
                            debug,
                            null,
                            2
                        );

                }

            }

            catch (error) {

                console.error(
                    "Debug error:",
                    error
                );

            }

        };

}


// =================================================
// NEXT PAGE
// =================================================

if (nextButton) {

    nextButton.onclick =
        async () => {

            /*
                Check one last time before
                navigating.
            */

            updateContinueButton();


            if (nextButton.disabled) {

                console.warn(
                    "Cannot continue. Required data is missing."
                );


                return;

            }


            try {

                /*
                    Save everything before leaving
                    the Start page.
                */

                await saveAllState();


                /*
                    Go to the Inputs page.
                */

                window.location.href =
                    "../inputs/inputs.html";

            }

            catch (error) {

                console.error(
                    "Could not save before continuing:",
                    error
                );


                alert(
                    "Could not save the current process."
                );

            }

        };

}


// =================================================
// RESET
// =================================================

if (resetButton) {

    resetButton.onclick =
        async () => {

            const confirmed =
                confirm(
                    "Reset the current process?\n\n" +
                    "All imported files and calculations " +
                    "will be removed."
                );


            if (!confirmed) {

                return;

            }


            try {

                /*
                    Clear ALL HotTips IndexedDB state.

                    This removes:

                    mealBlocks
                    mealParticipations
                    orders
                    payments
                    tipDistribution
                */

                await clearApplicationState();


                // -------------------------------------
                // CLEAR MEMORY
                // -------------------------------------

                currentMealBlocks = [];

                currentMealParticipations = [];

                currentOrders = [];

                currentPayments = [];


                // -------------------------------------
                // CLEAR FILE INPUTS
                // -------------------------------------

                if (shiftInput) {

                    shiftInput.value = "";

                }


                if (orderInput) {

                    orderInput.value = "";

                }


                if (paymentInput) {

                    paymentInput.value = "";

                }


                // -------------------------------------
                // UPDATE UI
                // -------------------------------------

                updateCardStatus();

                updateContinueButton();

                refreshUI();


                /*
                    Return to the main Home page.
                */

                window.location.href =
                    "../index.html";

            }

            catch (error) {

                console.error(
                    "Could not reset application:",
                    error
                );


                alert(
                    "Could not completely reset the application."
                );

            }

        };

}


// =================================================
// BACK BUTTON
// =================================================

document
    .getElementById(
        "backButton"
    )
    ?.addEventListener(
        "click",
        async () => {

            try {

                /*
                    Save before leaving.
                */

                await saveAllState();


                window.location.href =
                    "../index.html";

            }

            catch (error) {

                console.error(
                    "Could not save before going back:",
                    error
                );


                alert(
                    "Could not save the current process."
                );

            }

        }
    );


// =================================================
// MONEY FORMAT
// =================================================

function money(cents) {

    cents =
        Number(cents) || 0;


    return (
        "$" +
        (
            cents / 100
        ).toFixed(2)
    );

}


// =================================================
// OVERALL CARD TIPS
// =================================================

function renderOverallTotals() {

    const output =
        document.getElementById(
            "overallTotals"
        );


    if (!output) {

        return;

    }


    output.innerHTML = "";


    let overallCardTips = 0;


    for (
        const block
        of currentMealBlocks
    ) {

        for (
            const employee
            of (
                block.employees ?? []
            )
        ) {

            overallCardTips +=
                Number(
                    employee.card_tips
                ) || 0;

        }

    }


    output.innerHTML = `

        <div class="overall-total-card">

            <span class="overall-total-label">
                Total Card Tips
            </span>

            <strong class="overall-total-value">
                ${money(
                    overallCardTips
                )}
            </strong>

        </div>

    `;

}


// =================================================
// OVERALL CASH SALES
// =================================================

function renderOverallCashSales() {

    const output =
        document.getElementById(
            "overallCashSales"
        );


    if (!output) {

        return;

    }


    output.innerHTML = "";


    let overallCashSales = 0;


    for (
        const block
        of currentMealBlocks
    ) {

        for (
            const employee
            of (
                block.employees ?? []
            )
        ) {

            overallCashSales +=
                Number(
                    employee.cash_sales
                ) || 0;

        }

    }


    output.innerHTML = `

        <div class="overall-total-card">

            <span class="overall-total-label">
                Total Cash Sales
            </span>

            <strong class="overall-total-value">
                ${money(
                    overallCashSales
                )}
            </strong>

        </div>

    `;

}


// =================================================
// START APPLICATION
// =================================================

async function start() {

    console.log(
        "Starting HotTips Start page..."
    );


    try {

        /*
            Make sure the database can be opened.
        */

        await openDatabase();


        /*
            Restore any existing application state.
        */

        await loadSavedState();


        /*
            Render whatever was restored.
        */

        refreshUI();


        /*
            Update cards and Continue button.
        */

        updateCardStatus();

        updateContinueButton();


        console.log(
            "HotTips Start page initialized."
        );

    }

    catch (error) {

        console.error(
            "Could not initialize Start page:",
            error
        );


        alert(
            "Could not initialize the HotTips application."
        );

    }

}


// =================================================
// START
// =================================================

start();