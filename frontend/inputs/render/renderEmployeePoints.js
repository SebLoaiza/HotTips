export function renderEmployeePoints(
    mealBlocks,
    refreshUI
) {

    const output =
        document.getElementById(
            "employeePoints"
        );

    if (!output) return;

    output.innerHTML = "";

    /* =========================
       SORT STATE
    ========================= */

    /*
        Keep the sort outside the
        table-rendering logic so it
        survives refreshUI() calls.
    */

    if (
        !renderEmployeePoints.sortState
    ) {

        renderEmployeePoints.sortState = {
            column: "role",
            direction: "asc"
        };

    }

    const sortState =
        renderEmployeePoints.sortState;

    /* =========================
       COLLECT EMPLOYEES
    ========================= */

    const employees = new Map();

    for (const block of mealBlocks) {

        for (const employee of block.employees) {

            const role =
                employee.distribution_role ||
                employee.role ||
                "Other";

            const key =
                `${employee.employee_id}__${role}`;

            if (!employees.has(key)) {

                employees.set(
                    key,
                    employee
                );

            }

        }

    }

    /* =========================
       CREATE EMPLOYEE LIST
    ========================= */

    const sortedEmployees =
        Array.from(
            employees.values()
        );

    /* =========================
       SORT EMPLOYEES
    ========================= */

    sortedEmployees.sort(
        (a, b) => {

            let comparison = 0;

            /* =========================
               ROLE SORT
            ========================= */

            if (
                sortState.column ===
                "role"
            ) {

                const roleA =
                    String(
                        a.distribution_role ||
                        a.role ||
                        "Other"
                    ).toLowerCase();

                const roleB =
                    String(
                        b.distribution_role ||
                        b.role ||
                        "Other"
                    ).toLowerCase();

                comparison =
                    roleA.localeCompare(
                        roleB
                    );

            }

            /* =========================
               NAME SORT
            ========================= */

            else if (
                sortState.column ===
                "name"
            ) {

                const nameA =
                    String(
                        a.name || ""
                    );

                const nameB =
                    String(
                        b.name || ""
                    );

                comparison =
                    nameA.localeCompare(
                        nameB
                    );

            }

            /* =========================
               POINT SORT
            ========================= */

            else if (
                sortState.column ===
                "point"
            ) {

                const pointA =
                    Number(
                        a.tip_points ?? 1
                    );

                const pointB =
                    Number(
                        b.tip_points ?? 1
                    );

                comparison =
                    pointA -
                    pointB;

            }

            /*
                Apply ascending /
                descending direction.
            */

            return (
                sortState.direction ===
                "asc"
                    ? comparison
                    : -comparison
            );

        }
    );

    /* =========================
       CREATE TABLE
    ========================= */

    const table =
        document.createElement(
            "table"
        );

    table.className =
        "config-table employee-points-table";

    /* =========================
       HEADER
    ========================= */

    const thead =
        document.createElement(
            "thead"
        );

    const headerRow =
        document.createElement(
            "tr"
        );

    /* =========================
       CREATE HEADER
    ========================= */

    const headers = [
        {
            label: "Role",
            column: "role"
        },
        {
            label: "Employee Name",
            column: "name"
        },
        {
            label: "Point",
            column: "point"
        }
    ];

    for (
        const header
        of headers
    ) {

        const th =
            document.createElement(
                "th"
            );

        th.textContent =
            header.label;

        th.className =
            "sortable-header";

        /*
            Add the current sort
            direction to the header.
        */

        if (
            sortState.column ===
            header.column
        ) {

            th.classList.add(
                sortState.direction ===
                    "asc"
                    ? "sort-ascending"
                    : "sort-descending"
            );

            th.textContent =
                `${header.label} ${
                    sortState.direction ===
                    "asc"
                        ? "▲"
                        : "▼"
                }`;

        }

        /*
            Make the header clickable.
        */

        th.addEventListener(
            "click",
            () => {

                /*
                    Clicking the same column
                    reverses the direction.
                */

                if (
                    sortState.column ===
                    header.column
                ) {

                    sortState.direction =
                        sortState.direction ===
                            "asc"
                            ? "desc"
                            : "asc";

                }

                /*
                    Clicking a new column
                    starts ascending.
                */

                else {

                    sortState.column =
                        header.column;

                    sortState.direction =
                        "asc";

                }

                /*
                    Re-render the table
                    using the new sort.
                */

                renderEmployeePoints(
                    mealBlocks,
                    refreshUI
                );

            }
        );

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
        document.createElement(
            "tbody"
        );

    for (
        const employee
        of sortedEmployees
    ) {

        const role =
            employee.distribution_role ||
            employee.role ||
            "Other";

        const row =
            document.createElement(
                "tr"
            );

        row.className =
            "employee-points-row";

        row.innerHTML = `
            <td>
                ${formatRoleName(role)}
            </td>

            <td>
                ${employee.name}
            </td>

            <td>
                <input
                    class="points-input"
                    type="number"
                    step="0.25"
                    min="0"
                    value="${employee.tip_points ?? 1}"
                    data-employee-id="${employee.employee_id}"
                    data-role="${role}"
                >
            </td>
        `;

        tbody.appendChild(
            row
        );

    }

    table.appendChild(
        tbody
    );

    output.appendChild(
        table
    );

    /* =========================
       GET POINT INPUTS
    ========================= */

    const getPointInputs = () => {

        return Array.from(
            output.querySelectorAll(
                ".points-input"
            )
        );

    };

    /* =========================
       SAVE POINT
    ========================= */

    function savePoint(input) {

        const employeeId =
            input.dataset.employeeId;

        const role =
            input.dataset.role;

        let value =
            Number(
                input.value
            );

        if (
            Number.isNaN(value) ||
            value < 0
        ) {

            value = 0;

        }

        input.value =
            value;

        /* =========================
           UPDATE EVERY MEAL BLOCK
        ========================= */

        for (
            const block
            of mealBlocks
        ) {

            for (
                const employee
                of block.employees
            ) {

                const employeeRole =
                    employee.distribution_role ||
                    employee.role ||
                    "Other";

                if (
                    String(
                        employee.employee_id
                    ) ===
                        String(
                            employeeId
                        ) &&

                    employeeRole ===
                        role
                ) {

                    employee.tip_points =
                        value;

                }

            }

        }

    }

    /* =========================
       CHANGE EVENTS
    ========================= */

    getPointInputs().forEach(
        input => {

            input.addEventListener(
                "change",
                () => {

                    savePoint(input);

                    if (refreshUI) {

                        refreshUI();

                    }

                }
            );

        }
    );

    /* =========================
       KEYBOARD NAVIGATION
    ========================= */

    getPointInputs().forEach(
        input => {

            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key !==
                        "Enter"
                    ) {

                        return;

                    }

                    event.preventDefault();
                    event.stopPropagation();

                    /*
                        Save current value.
                    */

                    savePoint(input);

                    /*
                        Find current inputs.
                    */

                    const inputs =
                        getPointInputs();

                    const currentIndex =
                        inputs.indexOf(
                            input
                        );

                    /*
                        Enter =
                        move down.

                        Shift + Enter =
                        move up.
                    */

                    const direction =
                        event.shiftKey
                            ? -1
                            : 1;

                    const nextIndex =
                        currentIndex +
                        direction;

                    /*
                        Stop at the top
                        or bottom.
                    */

                    if (
                        nextIndex < 0 ||
                        nextIndex >=
                            inputs.length
                    ) {

                        if (refreshUI) {

                            refreshUI();

                        }

                        return;

                    }

                    /*
                        Remember the
                        destination employee.
                    */

                    const nextInput =
                        inputs[
                            nextIndex
                        ];

                    const nextEmployeeId =
                        nextInput.dataset.employeeId;

                    const nextRole =
                        nextInput.dataset.role;

                    /*
                        Refresh the UI.
                    */

                    if (refreshUI) {

                        refreshUI();

                    }

                    /*
                        Find the same employee
                        after refreshUI rebuilds
                        the table.
                    */

                    requestAnimationFrame(
                        () => {

                            const newInputs =
                                getPointInputs();

                            const newInput =
                                newInputs.find(
                                    candidate =>

                                        String(
                                            candidate
                                                .dataset
                                                .employeeId
                                        ) ===
                                            String(
                                                nextEmployeeId
                                            ) &&

                                        candidate
                                            .dataset
                                            .role ===
                                            nextRole
                                );

                            if (newInput) {

                                newInput.focus();

                                newInput.select();

                            }

                        }
                    );

                }
            );

        }
    );

}

/* =========================
   ROLE DISPLAY NAME
========================= */

function formatRoleName(role) {

    const names = {

        "server":
            "Server",

        "boh":
            "BOH",

        "busser/runner":
            "Busser / Runner",

        "host":
            "Host",

        "other":
            "Other"

    };

    return (
        names[
            String(role).toLowerCase()
        ] ||
        role
    );

}
