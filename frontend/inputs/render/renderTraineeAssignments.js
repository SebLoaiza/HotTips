export function renderTraineeAssignments(
    mealBlocks,
    refreshUI
) {

    const output =
        document.getElementById(
            "traineeAssignments"
        );

    if (!output) return;

    output.innerHTML = "";


    /* =========================
       FIND TRAINEES
       AND THEIR TRAINEE DATES
    ========================= */

    const traineeMap = new Map();

    for (const block of mealBlocks) {

        const date =
            block.day_key ||
            block.date;

        if (!date) {
            continue;
        }

        for (const employee of block.employees) {

            const role =
                String(employee.role || "")
                    .toLowerCase();

            /*
             * Only add the employee to the
             * trainee list when they are
             * actually a trainee on this date.
             */

            if (!role.includes("trainee")) {
                continue;
            }


            let trainee =
                traineeMap.get(
                    employee.employee_id
                );


            /* =========================
               CREATE TRAINEE RECORD
            ========================= */

            if (!trainee) {

                trainee = {
                    name:
                        employee.name,

                    role:
                        employee.role,

                    employee_id:
                        employee.employee_id,

                    /*
                     * Stores every date this
                     * employee was actually
                     * a trainee.
                     */

                    traineeDates:
                        new Set()
                };

                traineeMap.set(
                    employee.employee_id,
                    trainee
                );

            }


            /* =========================
               STORE TRAINEE DATE
            ========================= */

            trainee.traineeDates.add(
                date
            );

        }

    }


    /* =========================
       GET ALL DATES
    ========================= */

    const allDates = [
        ...new Set(
            mealBlocks
                .map(
                    block =>
                        block.day_key ||
                        block.date
                )
                .filter(Boolean)
        )
    ];


    /* =========================
       SORT DATES
    ========================= */

    allDates.sort(
        (a, b) =>
            new Date(a) -
            new Date(b)
    );


    /* =========================
       CREATE TABLE FOR EACH
       TRAINEE
    ========================= */

    for (
        const trainee of
        traineeMap.values()
    ) {

        /*
         * Get the dates on which this
         * employee was actually a trainee.
         */

        const traineeDates = [
            ...trainee.traineeDates
        ];


        traineeDates.sort(
            (a, b) =>
                new Date(a) -
                new Date(b)
        );


        if (!traineeDates.length) {
            continue;
        }


        /* =========================
           FIRST TRAINEE DATE
        ========================= */

        const firstTraineeDate =
            new Date(
                traineeDates[0]
            );


        /* =========================
           LAST TRAINEE DATE
        ========================= */

        const lastTraineeDate =
            new Date(
                traineeDates[
                    traineeDates.length - 1
                ]
            );


        /*
         * Only show dates from the
         * first time they were a trainee
         * through the last time they were
         * a trainee.
         *
         * Example:
         *
         * 8/10 = trainee
         * 8/11 = cook
         * 8/12 = cook
         * 8/13 = trainee
         *
         * Table shows:
         *
         * 8/10 | 8/11 | 8/12 | 8/13
         *
         * The middle dates will display "-".
         */

        const dates =
            allDates.filter(
                date => {

                    const currentDate =
                        new Date(date);

                    return (
                        currentDate >=
                            firstTraineeDate &&
                        currentDate <=
                            lastTraineeDate
                    );

                }
            );


        /* =========================
           CREATE TABLE
        ========================= */

        output.appendChild(
            createTraineeTable(
                trainee,
                dates,
                mealBlocks,
                refreshUI
            )
        );

    }

}


/* =========================
   TRAINEE TABLE
========================= */

function createTraineeTable(
    trainee,
    dates,
    mealBlocks,
    refreshUI
) {

    const section =
        document.createElement("div");

    section.className =
        "trainee-table-section";


    /* =========================
       TITLE
    ========================= */

    const title =
        document.createElement("div");

    title.className =
        "trainee-table-title";

    title.innerHTML = `
        <strong>${trainee.name}</strong>
        <span>${trainee.role || ""}</span>
    `;

    section.appendChild(
        title
    );


    /* =========================
       SET ALL NO TRAINER BUTTON
    ========================= */

    const noTrainerButton =
        document.createElement("button");

    noTrainerButton.type =
        "button";

    noTrainerButton.className =
        "trainee-no-trainer-button";

    noTrainerButton.textContent =
        "Set All to No Trainer";


    noTrainerButton.addEventListener(
        "click",
        () => {

            for (const block of mealBlocks) {

                const date =
                    block.day_key ||
                    block.date;


                if (!dates.includes(date)) {
                    continue;
                }


                const traineeInBlock =
                    block.employees.find(
                        employee =>
                            employee.employee_id ===
                            trainee.employee_id
                    );


                if (!traineeInBlock) {
                    continue;
                }


                const role =
                    String(
                        traineeInBlock.role || ""
                    ).toLowerCase();


                if (!role.includes("trainee")) {
                    continue;
                }


                traineeInBlock.no_trainer =
                    true;

                traineeInBlock
                    .trainer_employee_id =
                    null;

                traineeInBlock
                    .trainer_employee_name =
                    "";

            }


            refreshUI();

        }
    );


    section.appendChild(
        noTrainerButton
    );


    /* =========================
       TABLE SCROLL WRAPPER
    ========================= */

    const tableWrapper =
        document.createElement("div");

    tableWrapper.className =
        "trainee-table-scroll";


    /*
     * Add a class when there are more
     * than 10 date columns.
     *
     * The first column is "Meal", so
     * this checks only the dates.
     */

    if (dates.length > 10) {

        tableWrapper.classList.add(
            "has-horizontal-scroll"
        );

    }


    /* =========================
       TABLE
    ========================= */

    const table =
        document.createElement("table");

    table.className =
        "trainee-assignment-table";


    /* =========================
       HEADER
    ========================= */

    const thead =
        document.createElement("thead");

    const headerRow =
        document.createElement("tr");


    const mealHeader =
        document.createElement("th");

    mealHeader.textContent =
        "Meal";

    mealHeader.className =
        "trainee-meal-header";

    headerRow.appendChild(
        mealHeader
    );


    for (const date of dates) {

        const th =
            document.createElement("th");

        th.textContent =
            formatDate(date);

        th.className =
            "trainee-date-header";

        headerRow.appendChild(
            th
        );

    }


    thead.appendChild(
        headerRow
    );

    table.appendChild(
        thead
    );


    /* =========================
       BODY
    ========================= */

    const tbody =
        document.createElement("tbody");


    const meals = [
        "Breakfast",
        "Lunch",
        "Dinner"
    ];


    for (const meal of meals) {

        const row =
            document.createElement("tr");


        /* Meal name */

        const mealCell =
            document.createElement("td");

        mealCell.className =
            "trainee-meal-cell";

        mealCell.textContent =
            meal;

        row.appendChild(
            mealCell
        );


        /* Date cells */

        for (const date of dates) {

            const cell =
                createAssignmentCell(
                    trainee,
                    date,
                    meal,
                    mealBlocks,
                    refreshUI
                );

            row.appendChild(
                cell
            );

        }


        tbody.appendChild(
            row
        );

    }


    table.appendChild(
        tbody
    );


    /* =========================
       PUT TABLE INSIDE WRAPPER
    ========================= */

    tableWrapper.appendChild(
        table
    );


    section.appendChild(
        tableWrapper
    );


    return section;

}


/* =========================
   ASSIGNMENT CELL
========================= */

function createAssignmentCell(
    trainee,
    date,
    meal,
    mealBlocks,
    refreshUI
) {

    const cell =
        document.createElement("td");

    cell.className =
        "trainee-assignment-cell";


    /* =========================
       CHECK IF ACTUALLY A
       TRAINEE ON THIS DATE
    ========================= */

    if (
        !trainee.traineeDates.has(
            date
        )
    ) {

        cell.classList.add(
            "not-trainee"
        );

        cell.textContent =
            "—";

        return cell;

    }


    /* =========================
       FIND MEAL BLOCK
    ========================= */

    const block =
        mealBlocks.find(
            block =>
                (
                    block.day_key ||
                    block.date
                ) === date &&
                block.meal === meal
        );


    /*
     * No meal block for this date.
     */

    if (!block) {

        cell.classList.add(
            "no-meal"
        );

        cell.textContent =
            "—";

        return cell;

    }


    /* =========================
       FIND TRAINEE
    ========================= */

    const traineeInBlock =
        block.employees.find(
            employee =>
                employee.employee_id ===
                trainee.employee_id
        );


    /*
     * Employee is not working this
     * particular meal.
     */

    if (!traineeInBlock) {

        cell.classList.add(
            "not-working"
        );

        cell.textContent =
            "—";

        return cell;

    }


    /* =========================
       VERIFY ROLE
    ========================= */

    const traineeRole =
        String(
            traineeInBlock.role || ""
        ).toLowerCase();


    /*
     * This handles the situation where
     * the employee is in the block but
     * isn't actually a trainee anymore.
     */

    if (
        !traineeRole.includes("trainee")
    ) {

        cell.classList.add(
            "not-trainee"
        );

        cell.textContent =
            "—";

        return cell;

    }


    /* =========================
       FIND TRAINERS
    ========================= */

    const trainers =
        block.employees.filter(
            employee => {

                const role =
                    String(
                        employee.role || ""
                    ).toLowerCase();


                return (
                    !role.includes("trainee") &&
                    employee.employee_id !==
                        trainee.employee_id
                );

            }
        );


    /* =========================
       CREATE SELECT
    ========================= */

    const select =
        document.createElement("select");

    select.className =
        "assignment-select";


    /* =========================
       EMPTY OPTION
    ========================= */

    const blank =
        document.createElement("option");

    blank.value =
        "";

    blank.textContent =
        "-- Select --";

    select.appendChild(
        blank
    );


    /* =========================
       NO TRAINER OPTION
    ========================= */

    const noTrainer =
        document.createElement("option");

    noTrainer.value =
        "__NO_TRAINER__";

    noTrainer.textContent =
        "No Trainer";

    select.appendChild(
        noTrainer
    );


    /* =========================
       TRAINER OPTIONS
    ========================= */

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


    /* =========================
       RESTORE SAVED STATE
    ========================= */

    if (
        traineeInBlock.no_trainer === true
    ) {

        select.value =
            "__NO_TRAINER__";

    }

    else if (
        traineeInBlock.trainer_employee_id
    ) {

        select.value =
            traineeInBlock
                .trainer_employee_id;

    }


    /* =========================
       CHANGE EVENT
    ========================= */

    select.addEventListener(
        "change",
        () => {

            /* =========================
               NO TRAINER
            ========================= */

            if (
                select.value ===
                "__NO_TRAINER__"
            ) {

                traineeInBlock.no_trainer =
                    true;

                traineeInBlock
                    .trainer_employee_id =
                    null;

                traineeInBlock
                    .trainer_employee_name =
                    "";

                refreshUI();

                return;

            }


            /* =========================
               FIND SELECTED TRAINER
            ========================= */

            const trainer =
                trainers.find(
                    employee =>
                        employee.employee_id ===
                        select.value
                );


            /* =========================
               VALID TRAINER
            ========================= */

            if (trainer) {

                traineeInBlock.no_trainer =
                    false;

                traineeInBlock
                    .trainer_employee_id =
                    trainer.employee_id;

                traineeInBlock
                    .trainer_employee_name =
                    trainer.name;

            }


            /* =========================
               BLANK SELECTION
            ========================= */

            else {

                traineeInBlock.no_trainer =
                    false;

                traineeInBlock
                    .trainer_employee_id =
                    null;

                traineeInBlock
                    .trainer_employee_name =
                    "";

            }


            refreshUI();

        }
    );


    /* =========================
       ADD SELECT TO CELL
    ========================= */

    cell.appendChild(
        select
    );


    return cell;

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(date) {

    if (!date) {
        return "";
    }


    const value =
        String(date).trim();


    const parsed =
        new Date(value);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return value;

    }


    return (
        String(
            parsed.getMonth() + 1
        ).padStart(2, "0") +
        "/" +
        String(
            parsed.getDate()
        ).padStart(2, "0") +
        "/" +
        parsed.getFullYear()
    );

}