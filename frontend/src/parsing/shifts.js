import { createMealBlock } from "../models/mealBlock.js";
import { MEALS } from "../models/meals.js";


export function parseShifts(rows) {

    const mealBlocks = [];

    const dates = new Set();


    for (const row of rows) {

        if (!row.Date) {
            continue;
        }

        dates.add(row.Date);

    }


    for (const date of dates) {

        const dayKey = makeDayKey(date);


        for (const meal of MEALS) {

            mealBlocks.push(
                createMealBlock(
                    date,
                    dayKey,
                    meal.meal,
                    meal.start,
                    meal.end
                )
            );

        }

    }


    return mealBlocks;

}



function makeDayKey(dateString) {

    const date = new Date(dateString);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1)
        .padStart(2, "0");

    const day = String(date.getDate())
        .padStart(2, "0");


    return `${year}-${month}-${day}`;

}