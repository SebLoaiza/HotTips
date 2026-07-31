export function renderTraineeAssignments(
    mealBlocks,
    refreshUI
) {

    const output =
        document.getElementById("traineeAssignments");


    if (!output) {
        return;
    }


    output.innerHTML = "";



    const dates = new Map();



    // =========================
    // Group meal blocks by date
    // =========================

    for (const block of mealBlocks) {


        const trainees =
            block.employees.filter(
                employee =>
                    employee.role
                        .toLowerCase()
                        .includes("trainee")
            );


        if (trainees.length === 0) {
            continue;
        }



        if (!dates.has(block.date)) {

            dates.set(
                block.date,
                []
            );

        }


        dates
            .get(block.date)
            .push({
                block,
                trainees
            });

    }



    // =========================
    // Render
    // =========================

    for (const [date, meals] of dates) {


        const dateSection =
            document.createElement("div");


        dateSection.className =
            "trainee-date-section";



        dateSection.innerHTML = `

            <h3>
                ${date}
            </h3>

        `;




        for (const { block, trainees } of meals) {


            const mealSection =
                document.createElement("div");


            mealSection.className =
                "trainee-meal-section";



            mealSection.innerHTML = `

                <h4>
                    ${block.meal}
                </h4>

            `;




            for (const trainee of trainees) {


                const trainers =
                    block.employees.filter(
                        employee =>
                            !employee.role
                                .toLowerCase()
                                .includes("trainee")
                            &&
                            employee.employee_id !==
                                trainee.employee_id
                    );



                const card =
                    document.createElement("div");


                card.className =
                    "trainee-config-card";




                const info =
                    document.createElement("div");


                info.className =
                    "trainee-info";



                info.innerHTML = `

                    <strong>
                        ${trainee.name}
                    </strong>

                `;




                const select =
                    document.createElement("select");


                select.className =
                    "assignment-select";



                // =========================
                // No Selection
                // =========================

                const blank =
                    document.createElement("option");


                blank.value = "";

                blank.textContent =
                    "-- Select Employee --";


                select.appendChild(
                    blank
                );



                // =========================
                // Explicit No Trainer
                // =========================

                const noTrainer =
                    document.createElement("option");


                noTrainer.value =
                    "__NO_TRAINER__";


                noTrainer.textContent =
                    "No Trainer";


                select.appendChild(
                    noTrainer
                );



                // =========================
                // Employees
                // =========================

                for (const trainer of trainers) {


                    const option =
                        document.createElement("option");


                    option.value =
                        trainer.employee_id;


                    option.textContent =
                        trainer.name;


                    select.appendChild(
                        option
                    );

                }



                // =========================
                // Restore Current State
                // =========================

                if (
                    trainee.no_trainer === true
                ) {

                    select.value =
                        "__NO_TRAINER__";

                }
                else if (
                    trainee.trainer_employee_id
                ) {

                    select.value =
                        trainee.trainer_employee_id;

                }
                else {

                    select.value =
                        "";

                }





                // =========================
                // Change Handler
                // =========================

                select.addEventListener(
                    "change",
                    () => {


                        // Manual No Trainer choice

                        if (
                            select.value === "__NO_TRAINER__"
                        ) {


                            trainee.no_trainer =
                                true;


                            trainee.trainer_employee_id =
                                null;


                            trainee.trainer_employee_name =
                                "";


                            refreshUI();

                            return;

                        }





                        const trainer =
                            trainers.find(
                                employee =>
                                    employee.employee_id ===
                                    select.value
                            );




                        if (trainer) {


                            trainee.no_trainer =
                                false;


                            trainee.trainer_employee_id =
                                trainer.employee_id;


                            trainee.trainer_employee_name =
                                trainer.name;


                        }

                        else {


                            // Reset unanswered

                            trainee.no_trainer =
                                false;


                            trainee.trainer_employee_id =
                                null;


                            trainee.trainer_employee_name =
                                "";

                        }



                        refreshUI();


                    }
                );





                card.appendChild(
                    info
                );


                card.appendChild(
                    select
                );


                mealSection.appendChild(
                    card
                );


            }



            dateSection.appendChild(
                mealSection
            );


        }



        output.appendChild(
            dateSection
        );


    }


}