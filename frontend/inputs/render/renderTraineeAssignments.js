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

    // -------------------------
    // Render every trainee
    // -------------------------

    for (const block of mealBlocks) {

        for (const trainee of block.employees) {

            if (
                !trainee.role
                    .toLowerCase()
                    .includes("trainee")
            ) {
                continue;
            }

            // -------------------------
            // Trainers for THIS meal block only
            // -------------------------

            const trainers = [];

            for (const employee of block.employees) {

                // Can't assign to yourself
                if (
                    employee.employee_id ===
                    trainee.employee_id
                ) {
                    continue;
                }

                // Skip other trainees
                if (
                    employee.role
                        .toLowerCase()
                        .includes("trainee")
                ) {
                    continue;
                }

                trainers.push(employee);

            }

            // -------------------------
            // Card
            // -------------------------

            const card =
                document.createElement("div");

            card.className =
                "trainee-card";

            card.innerHTML = `

                <h3>${block.date} — ${block.meal}</h3>

                <p>

                    <strong>${trainee.name}</strong>

                    <br>

                    ${trainee.role}

                </p>

            `;

            // -------------------------
            // Dropdown
            // -------------------------

            const select =
                document.createElement("select");

            const blank =
                document.createElement("option");

            blank.value = "";

            blank.textContent =
                "-- Select Trainer --";

            select.appendChild(blank);

            for (const trainer of trainers) {

                const option =
                    document.createElement("option");

                option.value =
                    trainer.employee_id;

                option.textContent =
                    trainer.name;

                if (
                    trainee.trainer_employee_id ===
                    trainer.employee_id
                ) {

                    option.selected = true;

                }

                select.appendChild(option);

            }

            // -------------------------
            // Save selection
            // -------------------------

            select.addEventListener(
                "change",
                () => {

                    const trainer =
                        trainers.find(
                            employee =>
                                employee.employee_id ===
                                select.value
                        );

                    if (trainer) {

                        trainee.trainer_employee_id =
                            trainer.employee_id;

                        trainee.trainer_employee_name =
                            trainer.name;

                    }
                    else {

                        trainee.trainer_employee_id =
                            null;

                        trainee.trainer_employee_name =
                            "";

                    }

                    refreshUI();

                }
            );

            card.appendChild(select);

            output.appendChild(card);

        }

    }

}