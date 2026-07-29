export function assignMealParticipations(mealBlocks, participations) {

    // Reset employees before rebuilding assignments
    for (const block of mealBlocks) {
        block.employees = [];
    }


    // Match each employee shift to the correct meal block
    for (const participation of participations) {

        for (const block of mealBlocks) {

            if (block.date !== participation.date) {
                continue;
            }


            // Find the part of the shift that overlaps this meal
            const clipped = clipRange(
                participation.meal_start,
                participation.meal_end,
                block.start,
                block.end
            );


            if (!clipped) {
                continue;
            }


            const employee = {
                employee_id: participation.employee_id,
                name: participation.name,
                normalized_name: normalizeName(participation.name),

                role: participation.role,
                standard_role: participation.standard_role,

                meal_start: clipped.start,
                meal_end: clipped.end,

                worked_minutes: 0,
                lost_minutes: 0,

                // Only keep breaks inside this meal window
                breaks: clipBreaks(
                    participation.breaks,
                    clipped.start,
                    clipped.end
                ),

                orders: [],

                card_sales: 0,
                card_tips: 0,

                cash_sales: 0,
                cash_drop: 0,
                cash_tips: 0,

                tip_points: 1,

                trainer_employee_id: null,
                trainer_employee_name: ""
            };


            const existingEmployee =
                block.employees.find(
                    e => e.employee_id === employee.employee_id
                );


            if (existingEmployee) {

                // Merge multiple shifts from the same employee
                if (employee.meal_start > existingEmployee.meal_end) {
                    existingEmployee.breaks.push([
                        existingEmployee.meal_end,
                        employee.meal_start
                    ]);
                }


                if (employee.meal_end < existingEmployee.meal_start) {
                    existingEmployee.breaks.push([
                        employee.meal_end,
                        existingEmployee.meal_start
                    ]);
                }


                // Expand employee time range
                existingEmployee.meal_start =
                    Math.min(
                        existingEmployee.meal_start,
                        employee.meal_start
                    );

                existingEmployee.meal_end =
                    Math.max(
                        existingEmployee.meal_end,
                        employee.meal_end
                    );


                existingEmployee.breaks.push(
                    ...employee.breaks
                );


                // Keep breaks ordered by start time
                existingEmployee.breaks.sort(
                    (a, b) => a[0] - b[0]
                );


                existingEmployee.worked_minutes =
                    calculateWorkedMinutes(
                        existingEmployee.meal_start,
                        existingEmployee.meal_end,
                        existingEmployee.breaks
                    );


            } else {

                employee.worked_minutes =
                    calculateWorkedMinutes(
                        employee.meal_start,
                        employee.meal_end,
                        employee.breaks
                    );


                block.employees.push(employee);

            }

        }

    }


    return mealBlocks;

}





// Clips a shift down to only the meal window
function clipRange(
    shiftStart, shiftEnd, mealStart, mealEnd) {

    let start = shiftStart;
    let end = shiftEnd;


    // Handle overnight shifts
    if (end <= start) {
        end += 1440;
    }


    if (mealEnd <= mealStart) {
        mealEnd += 1440;
    }


    const clippedStart =
        Math.max(start, mealStart);

    const clippedEnd =
        Math.min(end, mealEnd);


    if (clippedStart >= clippedEnd) {
        return null;
    }


    return {
        start: clippedStart,
        end: clippedEnd
    };

}





// Keeps only breaks that happen during this meal
function clipBreaks(breaks, mealStart, mealEnd) {

    const result = [];


    for (const br of breaks) {

        let start = br[0];
        let end = br[1];


        if (end <= start) {
            end += 1440;
        }


        const clipped =
            clipRange(
                start,
                end,
                mealStart,
                mealEnd
            );


        if (clipped) {
            result.push([
                clipped.start,
                clipped.end
            ]);
        }

    }


    return result;

}





// Calculates worked time after removing breaks
function calculateWorkedMinutes(start, end, breaks) {

    let total = end - start;


    for (const br of breaks) {
        total -= br[1] - br[0];
    }


    return total;

}





// Converts names into a consistent format for matching
function normalizeName(name) {

    if (!name) {
        return "";
    }


    name =
        name
        .trim()
        .toUpperCase();


    // Converts LAST, FIRST into FIRST LAST
    if (name.includes(",")) {

        const parts =
            name.split(",");


        return parts[1].trim() + " " + parts[0].trim();

    }


    return name;

}