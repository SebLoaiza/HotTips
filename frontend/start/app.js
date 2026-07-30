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

import { renderMealBlocks } from "./render/mealBlocks.js";
import { renderTipTables } from "./render/tipTables.js";
import { renderCashCollectedTables } from "./render/cashCollectedTables.js";


let currentMealBlocks = [];
let currentMealParticipations = [];
let currentOrders = [];
let currentPayments = [];

let shiftUploaded = false;
let orderUploaded = false;
let paymentUploaded = false;

const shiftInput = document.getElementById("shiftCsv");
const orderInput = document.getElementById("orderCsv");
const paymentInput = document.getElementById("paymentCsv");

const debugButton = document.getElementById("debugObjects");
const debugOutput = document.getElementById("debugOutput");
const nextButton = document.getElementById("nextPage");
const resetButton = document.getElementById("resetProcess");

if (nextButton) {
    nextButton.disabled = true;
}

// Shift CSV

if (shiftInput) {

    shiftInput.addEventListener("change", async (event) => {

        const file = event.target.files[0];

        if (!file) return;

        const rows = await readCsv(file);

        currentMealBlocks = createMealBlocks(rows);
        currentMealParticipations = createMealParticipations(rows);

        shiftUploaded = true;

        updateContinueButton();

        rebuildMealBlocks();
    });

}



// Order CSV

if (orderInput) {

    orderInput.addEventListener("change", async (event) => {

        const file = event.target.files[0];

        if (!file) return;

        currentOrders = createOrders(
            await readCsv(file)
        );

        orderUploaded = true;

        updateContinueButton();

        rebuildMealBlocks();

    });

}



// Payment CSV

if (paymentInput) {

    paymentInput.addEventListener("change", async (event) => {

        const file = event.target.files[0];

        if (!file) return;

        currentPayments = createPayments(
            await readCsv(file)
        );

        paymentUploaded = true;

        updateContinueButton();

        rebuildMealBlocks();

    });

}



function rebuildMealBlocks() {

    assignMealParticipations(currentMealBlocks, currentMealParticipations);

    enrichOrdersWithPayments(currentOrders, currentPayments);

    assignOrders(currentMealBlocks, currentOrders);

    assignOrdersToEmployees(currentMealBlocks);

    calculateParticipationTotals(currentMealBlocks);

    saveState();

    refreshUI();

}



function refreshUI() {

    renderMealBlocks(currentMealBlocks, rebuildMealBlocks);

    renderTipTables(currentMealBlocks);

    renderCashCollectedTables(currentMealBlocks);

}



function saveState() {

    sessionStorage.setItem(
        "mealBlocks",
        JSON.stringify(currentMealBlocks)
    );

    sessionStorage.setItem(
        "mealParticipations",
        JSON.stringify(currentMealParticipations)
    );

    sessionStorage.setItem(
        "orders",
        JSON.stringify(currentOrders)
    );

    sessionStorage.setItem(
        "payments",
        JSON.stringify(currentPayments)
    );

}



function loadState() {

    const savedBlocks = sessionStorage.getItem("mealBlocks");

    if (!savedBlocks) return false;


    currentMealBlocks = JSON.parse(savedBlocks);

    currentMealParticipations =
        JSON.parse(sessionStorage.getItem("mealParticipations")) || [];

    currentOrders =
        JSON.parse(sessionStorage.getItem("orders")) || [];

    currentPayments =
        JSON.parse(sessionStorage.getItem("payments")) || [];


    shiftUploaded = currentMealBlocks.length > 0;
    orderUploaded = currentOrders.length > 0;
    paymentUploaded = currentPayments.length > 0;

    updateContinueButton();


    return true;

}



if (debugButton) {

    debugButton.onclick = () => {

        const debug = {
            mealBlocks: currentMealBlocks,
            participations: currentMealParticipations,
            orders: currentOrders,
            payments: currentPayments
        };

        debugOutput.textContent = JSON.stringify(debug, null, 2);

    };

}



if (nextButton) {

    nextButton.onclick = () => {

        saveState();

        window.location.href = "../inputs/inputs.html";

    };

}

if (resetButton) {

    resetButton.onclick = () => {

        const confirmed = confirm(
            "Reset the current process?\n\nAll imported files and calculations will be removed."
        );

        if (!confirmed) {
            return;
        }

        // Clear browser session
        sessionStorage.clear();

        // Clear memory
        currentMealBlocks = [];
        currentMealParticipations = [];
        currentOrders = [];
        currentPayments = [];


        shiftUploaded = false;
        orderUploaded = false;
        paymentUploaded = false;

        updateContinueButton();



        // Reload fresh page
        window.location.reload();

    };

}



if (loadState()) {

    refreshUI();

}


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