import { readCsv } from "./parsing/csv.js";

import { createMealBlocks } from "./models/mealBlock.js";
import { createMealParticipations } from "./models/mealParticipation.js";
import { createOrders } from "./models/order.js";
import { createPayments } from "./models/payment.js";

import { assignMealParticipations } from "./logic/assignMealParticipations.js";
import { assignOrdersToEmployees } from "./logic/assignOrdersToEmployees.js";
import { assignOrders } from "./logic/assignOrders.js";
import {enrichOrdersWithPayments} from "./logic/enrichOrdersWithPayments.js";
import {calculateParticipationTotals} from "./logic/calculateParticipationTotals.js";


import { renderMealBlocks } from "./render/mealBlocks.js";
import { renderMealParticipations } from "./render/mealParticipations.js";
import { renderAssignedMeals } from "./render/assignedMeals.js";
import { renderTipTables } from "./render/tipTables.js";
import { renderCashCollectedTables } from "./render/cashCollectedTables.js";

let currentMealBlocks = [];
let currentMealParticipations = [];
let currentOrders = [];
let currentPayments = [];

// =========================
// SHIFT CSV
// =========================

const shiftInput = document.getElementById("shiftCsv");

shiftInput.addEventListener("change", async (event) => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const rows = await readCsv(file);

    currentMealBlocks = createMealBlocks(rows);

    currentMealParticipations =
        createMealParticipations(rows);

    rebuildMealBlocks();

});


// =========================
// ORDER CSV
// =========================

const orderInput =
    document.getElementById("orderCsv");

orderInput.addEventListener("change", async (event) => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const rows = await readCsv(file);

    currentOrders = createOrders(rows);

    rebuildMealBlocks();

});


// =========================
// PAYMENT CSV
// =========================

const paymentInput =
    document.getElementById("paymentCsv");

paymentInput.addEventListener("change", async (event) => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const rows = await readCsv(file);

    currentPayments =
        createPayments(rows);

    rebuildMealBlocks();

});



// =========================
// REBUILD DATA
// =========================

function rebuildMealBlocks() {

    assignMealParticipations(
        currentMealBlocks,
        currentMealParticipations
    );

    enrichOrdersWithPayments(
        currentOrders,
        currentPayments
    );

    assignOrders(
        currentMealBlocks,
        currentOrders
    );

    assignOrdersToEmployees(
        currentMealBlocks
    );

    calculateParticipationTotals(
        currentMealBlocks
    );

    saveState();

    refreshUI();

}



// =========================
// REFRESH UI
// =========================

function refreshUI() {

    renderTipTables(
        
        currentMealBlocks
    );

    renderCashCollectedTables(
        currentMealBlocks
    );



    renderMealBlocks(
        currentMealBlocks,
        rebuildMealBlocks
    );

}


// =========================
// UTILITIES
// =========================

function timeToMinutes(time) {

    const parts = time.split(" ");

    const clock = parts[0];
    const modifier = parts[1];

    let [hours, minutes] =
        clock.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;

}



const debugButton =
    document.getElementById("debugObjects");


debugButton.addEventListener("click", () => {

    const debug = {

        mealBlocks: currentMealBlocks,

        participations: currentMealParticipations,

        orders: currentOrders,

        payments: currentPayments

    };


    document.getElementById("debugOutput").textContent =
        JSON.stringify(
            debug,
            null,
            2
        );

});

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

document
    .getElementById("nextPage")
    .addEventListener("click", () => {

        saveState();

        window.location.href = "../inputs/inputs.html";
    });


function loadState() {

    const mealBlocks =
        sessionStorage.getItem("mealBlocks");

    if (!mealBlocks) {
        return false;
    }

    currentMealBlocks =
        JSON.parse(mealBlocks);

    currentMealParticipations =
        JSON.parse(
            sessionStorage.getItem("mealParticipations")
        ) || [];

    currentOrders =
        JSON.parse(
            sessionStorage.getItem("orders")
        ) || [];

    currentPayments =
        JSON.parse(
            sessionStorage.getItem("payments")
        ) || [];

    return true;

}

if (loadState()) {

    refreshUI();

}