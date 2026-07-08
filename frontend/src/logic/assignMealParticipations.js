export function assignMealParticipations(
    mealBlocks,
    participations
) {

    // Clear previous assignments
    for (const block of mealBlocks) {

        block.employees = [];

    }



    for (const participation of participations) {


        for (const block of mealBlocks) {


            // Different date
            if (block.date !== participation.date) {
                continue;
            }



            const clipped = clipRange(

                participation.meal_start,

                participation.meal_end,

                block.start,

                block.end

            );



            // No overlap
            if (!clipped) {
                continue;
            }



            const employee = {


                employee_id:
                    participation.employee_id,


                name:
                    participation.name,


                normalized_name:
                    normalizeName(
                        participation.name
                    ),



                role:
                    participation.role,



                // clipped to this meal block
                meal_start:
                    clipped.start,


                meal_end:
                    clipped.end,



                worked_minutes:
                    clipped.end - clipped.start,



                lost_minutes:
                    0,



                breaks:
                    clipBreaks(

                        participation.breaks,

                        clipped.start,

                        clipped.end

                    ),



                orders: [],



                cash_tips:
                    0,


                card_tips:
                    0


            };



            block.employees.push(employee);



        }


    }


    return mealBlocks;

}





// =====================================================
// CLIP SHIFT INTO MEAL WINDOW
// =====================================================

function clipRange(
    shiftStart,
    shiftEnd,
    mealStart,
    mealEnd
) {


    let start = shiftStart;

    let end = shiftEnd;



    // overnight employee shift
    if (end <= start) {

        end += 1440;

    }



    // NOTE:
    // meal blocks should already be normalized
    // when created.
    //
    // This is a safety check.

    if (mealEnd <= mealStart) {

        mealEnd += 1440;

    }



    const clippedStart =
        Math.max(
            start,
            mealStart
        );



    const clippedEnd =
        Math.min(
            end,
            mealEnd
        );



    if (clippedStart >= clippedEnd) {

        return null;

    }



    return {

        start: clippedStart,

        end: clippedEnd

    };

}







// =====================================================
// CLIP BREAKS INTO MEAL WINDOW
// =====================================================

function clipBreaks(
    breaks,
    mealStart,
    mealEnd
) {


    const result = [];



    for (const br of breaks) {


        let start = br[0];

        let end = br[1];



        // overnight break
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







// =====================================================
// NAME NORMALIZATION
// =====================================================

function normalizeName(name) {


    if (!name) {

        return "";

    }



    name =
        name
        .trim()
        .toUpperCase();




    // CSV format:
    // LAST, FIRST

    if (name.includes(",")) {


        const parts =
            name.split(",");



        return (

            parts[1].trim()
            + " "
            + parts[0].trim()

        );

    }



    return name;

}