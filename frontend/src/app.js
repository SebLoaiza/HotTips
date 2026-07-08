import { readCsv } from "./parsing/csv.js";

import { createMealBlocks } from "./models/mealBlock.js";
import { createMealParticipations } from "./models/mealParticipation.js";
import { createOrders } from "./models/order.js";

import { assignMealParticipations } from "./logic/assignMealParticipations.js";
import { assignOrdersToEmployees } from "./logic/assignOrdersToEmployees.js";

import { renderMealBlocks } from "./render/mealBlocks.js";
import { renderMealParticipations } from "./render/mealParticipations.js";
import { renderAssignedMeals } from "./render/assignedMeals.js";
import { renderTipTables } from "./render/tipTables.js";
import { assignOrders } from "./logic/assignOrders.js";


let currentMealBlocks = [];
let currentMealParticipations = [];
let currentOrders = [];


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
// REBUILD
// =========================
function rebuildMealBlocks() {

    assignMealParticipations(
        currentMealBlocks,
        currentMealParticipations
    );


    assignOrders(
        currentMealBlocks,
        currentOrders
    );


    assignOrdersToEmployees(
        currentMealBlocks
    );

    console.log(currentMealBlocks);


    
    renderMealBlocks(
        currentMealBlocks,
        updateMealBlockTime
    );

    renderAssignedMeals(currentMealBlocks);

    renderMealParticipations(currentMealParticipations);

    renderTipTables(currentMealBlocks);

}


// =========================
// EDITING
// =========================

function updateMealBlockTime(id, field, value) {

    const block = currentMealBlocks.find(
        b => `${b.day_key}-${b.meal}` === id
    );

    if (!block) {
        return;
    }

    block[field] = timeToMinutes(value);

    rebuildMealBlocks();

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