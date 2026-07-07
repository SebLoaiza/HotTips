import { readCsv } from "./parsing/csv.js";
import { parseShifts } from "./parsing/shifts.js";
import { renderMealBlocks } from "./render/mealBlocks.js";
import { renderTipTables } from "./render/tipTables.js";

let currentMealBlocks = [];


const shiftInput = document.getElementById("shiftCsv");


shiftInput.addEventListener("change", async (event) => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }


    const rows = await readCsv(file);


    currentMealBlocks = parseShifts(rows);


    renderMealBlocks(
        currentMealBlocks,
        updateMealBlockTime
    );  
    renderTipTables(currentMealBlocks);
});



function updateMealBlockTime(id, field, value) {

    const block = currentMealBlocks.find(block => {

        return `${block.day_key}-${block.meal}` === id;

    });


    if (!block) {
        return;
    }


    block[field] = timeToMinutes(value);


    console.log("UPDATED BLOCK:", block);

}



function timeToMinutes(time) {

    const parts = time.split(" ");

    const clock = parts[0];
    const modifier = parts[1];


    let [hours, minutes] = clock.split(":")
        .map(Number);


    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }


    return hours * 60 + minutes;

}