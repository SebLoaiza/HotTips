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

            if (
                !traineeMap.has(
                    employee.employee_id
                )
            ) {

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
       CREATE ONE TABLE PER
       TRAINEE
    ========================= */

    for (
        const trainee of
        traineeMap.values()
    ) {

        const traineeBlocks =
            mealBlocks.filter(
                block =>
                    block.employees.some(
                        employee =>
                            employee.employee_id ===
                            trainee.employee_id
                    )
            );


        /*
            If the trainee has no
            meal blocks, don't render
            an empty table.
        */

        if (!traineeBlocks.length) {
            continue;
        }


        output.appendChild(
            createTraineeTable(
                trainee,
                traineeBlocks,
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
    traineeBlocks,
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
       SET ALL NO TRAINER
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

            for (const block of traineeBlocks) {

                const traineeInBlock =
                    block.employees.find(
                        employee =>
                            employee.employee_id ===
                            trainee.employee_id
                    );

                if (!traineeInBlock) {
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
       GET ONLY DATES WHERE
       THIS TRAINEE WORKED
    ========================= */

    const dates = [
        ...new Set(
            traineeBlocks.map(
                block =>
                    block.day_key ||
                    block.date
            )
        )
    ];


    dates.sort(
        (a, b) =>
            compareDates(a, b)
    );


    /* =========================
       GET ONLY MEALS WHERE
       THIS TRAINEE WORKED
    ========================= */

    const mealsByDate =
        new Map();


    for (const block of traineeBlocks) {

        const date =
            block.day_key ||
            block.date;

        if (!mealsByDate.has(date)) {

            mealsByDate.set(
                date,
                new Set()
            );

        }

        mealsByDate
            .get(date)
            .add(block.meal);

    }


    /*
        Keep the normal meal order,
        but only include meals that
        actually exist for this trainee.
    */

    const mealOrder = [
        "Breakfast",
        "Lunch",
        "Dinner"
    ];


    const meals = [
        ...new Set(
            traineeBlocks.map(
                block =>
                    block.meal
            )
        )
    ].sort(
        (a, b) => {

            const aIndex =
                mealOrder.indexOf(a);

            const bIndex =
                mealOrder.indexOf(b);

            return (
                (aIndex === -1 ? 999 : aIndex) -
                (bIndex === -1 ? 999 : bIndex)
            );

        }
    );


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


    for (const meal of meals) {

        const row =
            document.createElement("tr");


        /* =========================
           MEAL NAME
        ========================= */

        const mealCell =
            document.createElement("td");

        mealCell.className =
            "trainee-meal-cell";

        mealCell.textContent =
            meal;

        row.appendChild(
            mealCell
        );


        /* =========================
           DATE CELLS
        ========================= */

        for (const date of dates) {

            /*
                Only render an active
                assignment cell if this
                trainee actually worked
                this meal on this date.
            */

            const worked =
                mealsByDate
                    .get(date)
                    ?.has(meal);


            if (!worked) {

                const cell =
                    document.createElement("td");

                cell.className =
                    "trainee-assignment-cell no-meal";

                cell.textContent =
                    "—";

                row.appendChild(
                    cell
                );

                continue;

            }


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

    section.appendChild(
        table
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
        No meal block.
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
       NO TRAINER
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
       TRAINERS
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

            /* =====================
               NO TRAINER
            ===================== */

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


            /* =====================
               FIND TRAINER
            ===================== */

            const trainer =
                trainers.find(
                    employee =>
                        employee.employee_id ===
                        select.value
                );


            /* =====================
               TRAINER SELECTED
            ===================== */

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

            /* =====================
               EMPTY SELECTION
            ===================== */

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


    /* =========================
       YYYY-MM-DD
    ========================= */

    const match =
        value.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (match) {

        const year =
            match[1];

        const month =
            match[2];

        const day =
            match[3];


        return (
            month +
            "/" +
            day +
            "/" +
            year
        );

    }


    /* =========================
       FALLBACK
    ========================= */

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


/* =========================
   COMPARE DATES
========================= */

function compareDates(
    a,
    b
) {

    const aValue =
        String(a || "").trim();

    const bValue =
        String(b || "").trim();


    /* =========================
       YYYY-MM-DD
    ========================= */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(aValue) &&
        /^\d{4}-\d{2}-\d{2}$/.test(bValue)
    ) {

        return (
            aValue.localeCompare(
                bValue
            )
        );

    }


    /* =========================
       FALLBACK
    ========================= */

    const aDate =
        new Date(aValue);

    const bDate =
        new Date(bValue);


    return (
        aDate.getTime() -
        bDate.getTime()
    );

}