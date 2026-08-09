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
    ========================= */

    const traineeMap = new Map();

    for (const block of mealBlocks) {

        for (const employee of block.employees) {

            const role =
                String(employee.role || "")
                    .toLowerCase();

            if (!role.includes("trainee")) {
                continue;
            }

            if (!traineeMap.has(
                employee.employee_id
            )) {

                traineeMap.set(
                    employee.employee_id,
                    {
                        name: employee.name,
                        role: employee.role,
                        employee_id:
                            employee.employee_id
                    }
                );
            }
        }
    }


    /* =========================
       GET DATES
    ========================= */

    const dates = [
        ...new Set(
            mealBlocks.map(
                block =>
                    block.day_key ||
                    block.date
            )
        )
    ];


    dates.sort(
        (a, b) =>
            new Date(a) -
            new Date(b)
    );


    /* =========================
       CREATE ONE TABLE PER
       TRAINEE
    ========================= */

    for (const trainee of traineeMap.values()) {

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

    section.appendChild(title);


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

        headerRow.appendChild(th);
    }


    thead.appendChild(headerRow);
    table.appendChild(thead);


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

            row.appendChild(cell);
        }


        tbody.appendChild(row);
    }


    table.appendChild(tbody);

    section.appendChild(table);

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
        No meal block for this date.
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


    if (!traineeInBlock) {

        cell.classList.add(
            "not-working"
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
       SELECT
    ========================= */

    const select =
        document.createElement("select");

    select.className =
        "assignment-select";


    /* Empty option */

    const blank =
        document.createElement("option");

    blank.value = "";

    blank.textContent =
        "-- Select --";

    select.appendChild(
        blank
    );


    /* No trainer */

    const noTrainer =
        document.createElement("option");

    noTrainer.value =
        "__NO_TRAINER__";

    noTrainer.textContent =
        "No Trainer";

    select.appendChild(
        noTrainer
    );


    /* Trainers */

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
       RESTORE STATE
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
       CHANGE
    ========================= */

    select.addEventListener(
        "change",
        () => {

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


            const trainer =
                trainers.find(
                    employee =>
                        employee.employee_id ===
                        select.value
                );


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


    cell.appendChild(select);

    return cell;
}


/* =========================
   DATE
========================= */

function formatDate(date) {

    if (!date) return "";

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