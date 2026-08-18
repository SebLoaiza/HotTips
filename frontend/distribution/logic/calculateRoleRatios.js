// logic/calculateRoleRatios.js


export function calculateRoleRatios(
    mealBlock
) {


    // =========================
    // Determine Effective End
    // =========================

    let effectiveMealEnd =
        mealBlock.start;


    for (const employee of mealBlock.employees) {

        effectiveMealEnd =
            Math.max(
                effectiveMealEnd,
                employee.meal_end
            );

    }


    effectiveMealEnd =
        Math.min(
            effectiveMealEnd,
            mealBlock.end
        );



    // =========================
    // Calculate Ratios
    // =========================

    mealBlock.host_ratio =
        calculateCoverage(
            mealBlock.hosts,
            mealBlock.start,
            effectiveMealEnd
        );


    mealBlock.busser_ratio =
        calculateCoverage(
            mealBlock.bussers,
            mealBlock.start,
            effectiveMealEnd
        );




}





function calculateCoverage(
    employees,
    mealStart,
    mealEnd
) {


    if (
        employees.length === 0
    ) {

        return 0;

    }



    const mealLength =
        mealEnd - mealStart;


    if (
        mealLength <= 0
    ) {

        return 0;

    }



    // =========================
    // Create Coverage Ranges
    // Removing Breaks
    // =========================

    const ranges = [];



    for (const employee of employees) {


        let segments = [

            {
                start:
                    Math.max(
                        employee.meal_start,
                        mealStart
                    ),

                end:
                    Math.min(
                        employee.meal_end,
                        mealEnd
                    )
            }

        ];



        if (
            segments[0].end <=
            segments[0].start
        ) {

            continue;

        }



        // =========================
        // Remove Breaks
        // =========================

        const breaks =
            employee.breaks ?? [];



        for (const brk of breaks) {


            // Break format:
            // [
            //   breakStart,
            //   breakEnd
            // ]

            const breakStart =
                Math.max(
                    brk[0],
                    mealStart
                );


            const breakEnd =
                Math.min(
                    brk[1],
                    mealEnd
                );



            if (
                breakEnd <= breakStart
            ) {

                continue;

            }



            const updatedSegments = [];



            for (const segment of segments) {


                // Break does not touch segment

                if (

                    breakEnd <= segment.start ||

                    breakStart >= segment.end

                ) {


                    updatedSegments.push(
                        segment
                    );


                    continue;

                }




                // Before break

                if (
                    breakStart >
                    segment.start
                ) {

                    updatedSegments.push({

                        start:
                            segment.start,

                        end:
                            breakStart

                    });

                }




                // After break

                if (
                    breakEnd <
                    segment.end
                ) {

                    updatedSegments.push({

                        start:
                            breakEnd,

                        end:
                            segment.end

                    });

                }


            }



            segments =
                updatedSegments;


        }



        ranges.push(
            ...segments
        );


    }



    if (
        ranges.length === 0
    ) {

        return 0;

    }




    // =========================
    // Merge Coverage
    // =========================

    ranges.sort(
        (a,b) =>
            a.start - b.start
    );



    let coveredMinutes = 0;



    let currentStart =
        ranges[0].start;


    let currentEnd =
        ranges[0].end;




    for (
        let i = 1;
        i < ranges.length;
        i++
    ) {


        const next =
            ranges[i];



        if (
            next.start <= currentEnd
        ) {


            currentEnd =
                Math.max(
                    currentEnd,
                    next.end
                );


        }

        else {


            coveredMinutes +=
                currentEnd -
                currentStart;



            currentStart =
                next.start;


            currentEnd =
                next.end;


        }


    }



    coveredMinutes +=
        currentEnd -
        currentStart;




    const ratio =
        coveredMinutes /
        mealLength;



    console.log(
        "COVERAGE",
        {
            employees:
                employees.map(
                    e => e.name
                ),

            ranges,

            coveredMinutes,

            mealLength,

            ratio
        }
    );



    return Math.min(
        ratio,
        1
    );

}