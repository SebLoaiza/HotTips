import { MEALS } from "./meals.js";

export function createMealBlock(date, dayKey, meal, start, end) {

    return {

        date: date,
        day_key: dayKey,

        meal: meal,

        start: start,
        end: end,

        online_total: 0,

        employees: [],
        orders: []

    };

}


export function createMealBlocks(rows) {

    const mealBlocks = [];

    const dates = new Set();


    // Collect each unique date from the shift CSV
    for (const row of rows) {

        if (!row["Date"]) {
            continue;
        }

        dates.add(row["Date"]);

    }


    // Create Breakfast, Lunch, and Dinner for every date
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