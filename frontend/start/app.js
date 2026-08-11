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
// STATE
// =================================================

let currentMealBlocks = [];
let currentMealParticipations = [];
let currentOrders = [];
let currentPayments = [];

let shiftUploaded = false;
let orderUploaded = false;
let paymentUploaded = false;


// =================================================
// DOM
// =================================================

const shiftInput =
    document.getElementById("shiftCsv");

const orderInput =
    document.getElementById("orderCsv");

const paymentInput =
    document.getElementById("paymentCsv");

const shiftCard =
    document.getElementById("shiftCard");

const orderCard =
    document.getElementById("orderCard");

const paymentCard =
    document.getElementById("paymentCard");

const debugButton =
    document.getElementById("debugObjects");

const debugOutput =
    document.getElementById("debugOutput");

const nextButton =
    document.getElementById("nextPage");

const resetButton =
    document.getElementById("resetProcess");


// =================================================
// INITIAL BUTTON STATE
// =================================================

if (nextButton) {
    nextButton.disabled = true;
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
                    createMealBlocks(rows);

                currentMealParticipations =
                    createMealParticipations(rows);

                shiftUploaded = true;

                shiftCard?.classList.add(
                    "completed"
                );

                updateContinueButton();

                rebuildMealBlocks();

            }

            catch (error) {

                console.error(
                    "Error reading shift CSV:",
                    error
                );

                alert(
                    "There was an error reading the shift CSV."
                );

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

                currentOrders =
                    createOrders(
                        await readCsv(file)
                    );

                orderUploaded = true;

                orderCard?.classList.add(
                    "completed"
                );

                updateContinueButton();

                rebuildMealBlocks();

            }

            catch (error) {

                console.error(
                    "Error reading order CSV:",
                    error
                );

                alert(
                    "There was an error reading the order CSV."
                );

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

                currentPayments =
                    createPayments(
                        await readCsv(file)
                    );

                paymentUploaded = true;

                paymentCard?.classList.add(
                    "completed"
                );

                updateContinueButton();

                rebuildMealBlocks();

            }

            catch (error) {

                console.error(
                    "Error reading payment CSV:",
                    error
                );

                alert(
                    "There was an error reading the payment CSV."
                );

            }

        }
    );

}


// =================================================
// REBUILD MEAL BLOCKS
// =================================================

function rebuildMealBlocks() {

    // Assign employees to meal blocks
    assignMealParticipations(
        currentMealBlocks,
        currentMealParticipations
    );


    // =================================================
    // IMPORTANT
    //
    // This enriches each order with its payments.
    //
    // After this runs, orders should contain:
    //
    // order.payments
    // order.cash_payment
    // order.card_payment
    // order.other_payment
    //
    // =================================================

    enrichOrdersWithPayments(
        currentOrders,
        currentPayments
    );


    // Assign orders to meal blocks
    assignOrders(
        currentMealBlocks,
        currentOrders
    );


    // Assign orders to employees
    assignOrdersToEmployees(
        currentMealBlocks
    );


    // Calculate participation totals
    calculateParticipationTotals(
        currentMealBlocks
    );


    saveState();

    refreshUI();

}


// =================================================
// REFRESH UI
// =================================================

function refreshUI() {

    renderTipTables(
        currentMealBlocks
    );

    renderCashCollectedTables(
        currentMealBlocks
    );

    renderMealBlockTotals(
        currentMealBlocks
    );

}


// =================================================
// MEAL BLOCK TOTALS
//
// IMPORTANT:
//
// These totals ONLY use:
//
//     block.orders
//
// They do NOT loop through currentOrders.
//
// The orders inside block.orders have already
// been enriched by enrichOrdersWithPayments().
//
// Therefore:
//
// Card Tips
//     -> order.tip
//
// Cash Sales
//     -> order.cash_payment
//
// Card Sales
//     -> order.card_payment
//
// =================================================

function renderMealBlockTotals(
    mealBlocks
) {

    const container =
        document.getElementById(
            "mealBlockTotals"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    // =================================================
    // GROUP BLOCKS BY MEAL
    // =================================================

    const breakfastBlocks =
        mealBlocks.filter(
            block =>
                String(
                    block.meal ?? ""
                ).toLowerCase() === "breakfast"
        );


    const lunchBlocks =
        mealBlocks.filter(
            block =>
                String(
                    block.meal ?? ""
                ).toLowerCase() === "lunch"
        );


    const dinnerBlocks =
        mealBlocks.filter(
            block =>
                String(
                    block.meal ?? ""
                ).toLowerCase() === "dinner"
        );


    // =================================================
    // CALCULATE TOTALS FOR ONE MEAL
    //
    // ONLY block.orders ARE USED.
    // =================================================

    function calculateMealTotals(
        blocks
    ) {

        let cardTips = 0;
        let cashSales = 0;
        let cardSales = 0;


        for (
            const block of blocks
        ) {

            const orders =
                block.orders || [];


            for (
                const order of orders
            ) {

                // =====================================
                // CARD TIPS
                //
                // Tip belongs to the order.
                // =====================================

                cardTips +=
                    Number(
                        order.tip ?? 0
                    );


                // =====================================
                // CASH SALES
                //
                // This comes from the enriched order.
                // =====================================

                cashSales +=
                    Number(
                        order.cash_payment ?? 0
                    );


                // =====================================
                // CARD SALES
                //
                // This comes from the enriched order.
                // =====================================

                cardSales +=
                    Number(
                        order.card_payment ?? 0
                    );

            }

        }


        return {
            cardTips,
            cashSales,
            cardSales
        };

    }


    // =================================================
    // MONEY FORMATTER
    //
    // All money is stored as cents.
    // =================================================

    function formatMoney(
        cents
    ) {

        return (
            Number(cents || 0) / 100
        ).toLocaleString(
            "en-US",
            {
                style: "currency",
                currency: "USD"
            }
        );

    }


    // =================================================
    // CREATE MEAL SECTION
    // =================================================

function createMealSection(
    mealName,
    blocks
) {

    const totals =
        calculateMealTotals(
            blocks
        );


    // =================================================
    // ORDER TOTALS ACROSS ALL MEAL BLOCKS
    // =================================================

    let totalOrders = 0;
    let totalOrderTips = 0;
    let totalOrderGratuity = 0;


    for (const block of blocks) {

        for (const order of (block.orders || [])) {

            totalOrders += 1;

            totalOrderTips +=
                Number(order.tip) || 0;

            totalOrderGratuity +=
                Number(order.gratuity) || 0;

        }

    }


    const totalTipsAndGratuity =
        totalOrderTips +
        totalOrderGratuity;


    // =================================================
    // CREATE SECTION
    // =================================================

    const section =
        document.createElement(
            "section"
        );


    section.className =
        "meal-block-total-section";


    section.innerHTML = `

        <div class="meal-block-total-header">

            <h3>
                ${mealName}
            </h3>

            <span>
                ${blocks.length}
                meal block${blocks.length === 1 ? "" : "s"}
            </span>

        </div>


        <!-- =========================================
             ORDER TOTALS
        ========================================== -->

        <div class="meal-block-orders">

            <h4>
                Order Totals
            </h4>


            <div class="meal-block-total-grid">


                <div class="meal-total-item">

                    <span>
                        Orders
                    </span>

                    <strong>
                        ${totalOrders}
                    </strong>

                </div>


                <div class="meal-total-item">

                    <span>
                        Order Tips
                    </span>

                    <strong>
                        ${formatMoney(
                            totalOrderTips
                        )}
                    </strong>

                </div>


                <div class="meal-total-item">

                    <span>
                        Order Gratuity
                    </span>

                    <strong>
                        ${formatMoney(
                            totalOrderGratuity
                        )}
                    </strong>

                </div>


                <div class="meal-total-item">

                    <span>
                        Tips + Gratuity
                    </span>

                    <strong>
                        ${formatMoney(
                            totalTipsAndGratuity
                        )}
                    </strong>

                </div>


            </div>

        </div>


        <!-- =========================================
             PAYMENT TOTALS
        ========================================== -->

        <div class="meal-block-financials">

            <h4>
                Payment Totals
            </h4>


            <div class="meal-block-total-grid">


                <div class="meal-total-item">

                    <span>
                        Card Tips
                    </span>

                    <strong>
                        ${formatMoney(
                            totals.cardTips
                        )}
                    </strong>

                </div>


                <div class="meal-total-item">

                    <span>
                        Cash Sales
                    </span>

                    <strong>
                        ${formatMoney(
                            totals.cashSales
                        )}
                    </strong>

                </div>


                <div class="meal-total-item">

                    <span>
                        Card Sales
                    </span>

                    <strong>
                        ${formatMoney(
                            totals.cardSales
                        )}
                    </strong>

                </div>


            </div>

        </div>

    `;


    return section;

}


    // =================================================
    // BREAKFAST
    // =================================================

    container.appendChild(
        createMealSection(
            "Breakfast",
            breakfastBlocks
        )
    );


    // =================================================
    // LUNCH
    // =================================================

    container.appendChild(
        createMealSection(
            "Lunch",
            lunchBlocks
        )
    );


    // =================================================
    // DINNER
    // =================================================

    container.appendChild(
        createMealSection(
            "Dinner",
            dinnerBlocks
        )
    );

}


// =================================================
// SAVE STATE
// =================================================

function saveState() {

    sessionStorage.setItem(
        "mealBlocks",
        JSON.stringify(
            currentMealBlocks
        )
    );


    sessionStorage.setItem(
        "mealParticipations",
        JSON.stringify(
            currentMealParticipations
        )
    );


    sessionStorage.setItem(
        "orders",
        JSON.stringify(
            currentOrders
        )
    );


    sessionStorage.setItem(
        "payments",
        JSON.stringify(
            currentPayments
        )
    );

}


// =================================================
// LOAD STATE
// =================================================

function loadState() {

    const savedBlocks =
        sessionStorage.getItem(
            "mealBlocks"
        );


    if (!savedBlocks) {
        return false;
    }


    currentMealBlocks =
        JSON.parse(
            savedBlocks
        );


    currentMealParticipations =
        JSON.parse(
            sessionStorage.getItem(
                "mealParticipations"
            )
        ) || [];


    currentOrders =
        JSON.parse(
            sessionStorage.getItem(
                "orders"
            )
        ) || [];


    currentPayments =
        JSON.parse(
            sessionStorage.getItem(
                "payments"
            )
        ) || [];


    // =============================================
    // IMPORTANT
    //
    // Re-enrich the loaded orders so the
    // block.orders contain the payment information.
    //
    // =============================================

    enrichOrdersWithPayments(
        currentOrders,
        currentPayments
    );


    shiftUploaded =
        currentMealBlocks.length > 0;


    orderUploaded =
        currentOrders.length > 0;


    paymentUploaded =
        currentPayments.length > 0;


    shiftCard?.classList.toggle(
        "completed",
        shiftUploaded
    );


    orderCard?.classList.toggle(
        "completed",
        orderUploaded
    );


    paymentCard?.classList.toggle(
        "completed",
        paymentUploaded
    );


    updateContinueButton();


    return true;

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
// CONTINUE
// =================================================

if (nextButton) {

    nextButton.onclick = () => {

        saveState();

        window.location.href =
            "../inputs/inputs.html";

    };

}


// =================================================
// RESET
// =================================================

if (resetButton) {

    resetButton.onclick = () => {

        const confirmed =
            confirm(
                "Reset the current process?\n\nAll imported files and calculations will be removed."
            );


        if (!confirmed) {
            return;
        }


        sessionStorage.clear();


        currentMealBlocks = [];

        currentMealParticipations = [];

        currentOrders = [];

        currentPayments = [];


        shiftUploaded = false;

        orderUploaded = false;

        paymentUploaded = false;


        shiftCard?.classList.remove(
            "completed"
        );


        orderCard?.classList.remove(
            "completed"
        );


        paymentCard?.classList.remove(
            "completed"
        );


        if (shiftInput) {
            shiftInput.value = "";
        }


        if (orderInput) {
            orderInput.value = "";
        }


        if (paymentInput) {
            paymentInput.value = "";
        }


        updateContinueButton();


        const totals =
            document.getElementById(
                "mealBlockTotals"
            );


        if (totals) {
            totals.innerHTML = "";
        }


        window.location.href =
            "../index.html";

    };

}


// =================================================
// UPDATE CONTINUE BUTTON
// =================================================

function updateContinueButton() {

    if (!nextButton) {
        return;
    }


    nextButton.disabled =
        !(
            shiftUploaded &&
            orderUploaded &&
            paymentUploaded
        );

}


// =================================================
// BACK BUTTON
// =================================================

document
    .getElementById("backButton")
    ?.addEventListener(
        "click",
        () => {

            window.location.href =
                "../index.html";

        }
    );


// =================================================
// LOAD SAVED STATE
// =================================================

if (loadState()) {

    refreshUI();

}