import { HotTipsStorage }
    from "../storage/storage.js";

import { readCsv }
    from "./parsing/csv.js";

import { createMealBlocks }
    from "./models/mealBlock.js";

import { createMealParticipations }
    from "./models/mealParticipation.js";

import { createOrders }
    from "./models/order.js";

import { createPayments }
    from "./models/payment.js";

import { assignMealParticipations }
    from "./logic/assignMealParticipations.js";

import { assignOrdersToEmployees }
    from "./logic/assignOrdersToEmployees.js";

import { assignOrders }
    from "./logic/assignOrders.js";

import { enrichOrdersWithPayments }
    from "./logic/enrichOrdersWithPayments.js";

import { calculateParticipationTotals }
    from "./logic/calculateParticipationTotals.js";

import { renderTipTables }
    from "./render/tipTables.js";

import { renderCashCollectedTables }
    from "./render/cashCollectedTables.js";


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


            } catch (error) {

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


            } catch (error) {

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


            } catch (error) {

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
        Only perform the logic that is possible
        with the data currently available.
    */


    if (
        currentMealBlocks.length > 0 &&
        currentMealParticipations.length > 0
    ) {

        assignMealParticipations(
            currentMealBlocks,
            currentMealParticipations
        );

    }


    if (
        currentOrders.length > 0 &&
        currentPayments.length > 0
    ) {

        enrichOrdersWithPayments(
            currentOrders,
            currentPayments
        );

    }


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


    if (
        currentMealBlocks.length > 0
    ) {

        calculateParticipationTotals(
            currentMealBlocks
        );

    }


    // -------------------------------------------------
    // Save current state
    // -------------------------------------------------

    await saveState();


    // -------------------------------------------------
    // Re-render everything
    // -------------------------------------------------

    refreshUI();


    // -------------------------------------------------
    // Re-check Continue
    // -------------------------------------------------

    updateContinueButton();

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
// SAVE STATE
// =================================================

async function saveState() {

    try {

        await HotTipsStorage.setItem(
            "mealBlocks",
            currentMealBlocks
        );


        await HotTipsStorage.setItem(
            "mealParticipations",
            currentMealParticipations
        );


        await HotTipsStorage.setItem(
            "orders",
            currentOrders
        );


        await HotTipsStorage.setItem(
            "payments",
            currentPayments
        );


        console.log(
            "HotTips state saved."
        );


    } catch (error) {

        console.error(
            "Error saving HotTips state:",
            error
        );

    }

}


// =================================================
// LOAD STATE
// =================================================

async function loadState() {

    try {

        const savedBlocks =
            await HotTipsStorage.getItem(
                "mealBlocks"
            );


        const savedParticipations =
            await HotTipsStorage.getItem(
                "mealParticipations"
            );


        const savedOrders =
            await HotTipsStorage.getItem(
                "orders"
            );


        const savedPayments =
            await HotTipsStorage.getItem(
                "payments"
            );


        // ---------------------------------------------
        // LOAD EACH DATASET
        // ---------------------------------------------

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
            "HotTips state loaded."
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


    } catch (error) {

        console.error(
            "Error loading saved state:",
            error
        );


        currentMealBlocks = [];

        currentMealParticipations = [];

        currentOrders = [];

        currentPayments = [];

    }


    // ---------------------------------------------
    // UPDATE CARD APPEARANCE
    // ---------------------------------------------

    updateCardStatus();


    // ---------------------------------------------
    // UPDATE CONTINUE
    // ---------------------------------------------

    updateContinueButton();


    // ---------------------------------------------
    // TELL CALLER WHETHER DATA EXISTS
    // ---------------------------------------------

    return (
        hasShiftData() ||
        hasOrderData() ||
        hasPaymentData()
    );

}


// =================================================
// UPDATE CARD STATUS
// =================================================

function updateCardStatus() {

    /*
        A card is complete if either:

        1. Its file is currently selected
        OR
        2. Its data was loaded from IndexedDB
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


    /*
        IMPORTANT:

        Each input is considered complete if:

        FILE EXISTS
        OR
        DATA ALREADY EXISTS

        This means the user does NOT have to
        re-upload a file after returning to
        this page.
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


    const allComplete =
        shiftComplete &&
        orderComplete &&
        paymentComplete;


    // ---------------------------------------------
    // Update card appearance
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
    // Enable / disable Continue
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
// DEBUG
// =================================================

if (debugButton) {

    debugButton.onclick = () => {

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

    };

}


// =================================================
// NEXT PAGE
// =================================================

if (nextButton) {

    nextButton.onclick =
        async () => {

            /*
                Run the check one last time before
                navigating.
            */

            updateContinueButton();


            if (nextButton.disabled) {

                console.warn(
                    "Cannot continue. Required data is missing."
                );

                return;

            }


            /*
                IMPORTANT:

                Wait for IndexedDB to finish writing
                before navigating to the next page.
            */

            await saveState();


            window.location.href =
                "../inputs/inputs.html";

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
                    "Reset the current process?\n\nAll imported files and calculations will be removed."
                );


            if (!confirmed) {

                return;

            }


            /*
                Clear our IndexedDB storage instead
                of sessionStorage.
            */

            try {

                await HotTipsStorage.clear();


            } catch (error) {

                console.error(
                    "Error clearing HotTips storage:",
                    error
                );

            }


            // -----------------------------------------
            // Clear memory
            // -----------------------------------------

            currentMealBlocks = [];

            currentMealParticipations = [];

            currentOrders = [];

            currentPayments = [];


            // -----------------------------------------
            // Clear file inputs
            // -----------------------------------------

            if (shiftInput) {

                shiftInput.value = "";

            }


            if (orderInput) {

                orderInput.value = "";

            }


            if (paymentInput) {

                paymentInput.value = "";

            }


            // -----------------------------------------
            // Update UI
            // -----------------------------------------

            updateCardStatus();

            updateContinueButton();


            // -----------------------------------------
            // Return home
            // -----------------------------------------

            window.location.href =
                "../index.html";

        };

}


// =================================================
// BACK BUTTON
// =================================================

document
    .getElementById("backButton")
    ?.addEventListener(
        "click",
        async () => {

            /*
                Save everything before leaving
                this page.
            */

            await saveState();


            window.location.href =
                "../index.html";

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
// INITIALIZE PAGE
// =================================================

(async () => {

    /*
        IMPORTANT:

        We MUST wait for IndexedDB to finish loading
        before rendering anything.

        This prevents the page from rendering empty
        tables before the saved data has arrived.
    */

    await loadState();


    // ---------------------------------------------
    // Render saved data
    // ---------------------------------------------

    refreshUI();


    // ---------------------------------------------
    // Final button check
    // ---------------------------------------------

    updateContinueButton();

})();