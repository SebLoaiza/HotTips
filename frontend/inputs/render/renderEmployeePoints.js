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
        Each table gets its own
        independent sort state.

        FOH and BOH can therefore
        be sorted differently.
    */

    if (
        !renderEmployeePoints.sortState
    ) {

        renderEmployeePoints.sortState = {

            frontOfHouse: {
                column: "role",
                direction: "asc"
            },

            backOfHouse: {
                column: "role",
                direction: "asc"
            }

        };

    }

    const sortState =
        renderEmployeePoints.sortState;

    /* =========================
       ROLE CLASSIFICATION
    ========================= */

    function isFrontOfHouse(role) {

        const normalizedRole =
            String(role || "")
                .toLowerCase()
                .trim()
                .replace(/[_-]+/g, " ")
                .replace(/\s+/g, " ");

        const baseRole =
            normalizedRole
                .replace(/\bbreakfast\b/g, "")
                .replace(/\s+/g, " ")
                .trim();

        return (
            baseRole === "server" ||
            baseRole === "busser" ||
            baseRole === "runner" ||
            baseRole === "busser / runner" ||
            baseRole === "busser/runner" ||
            baseRole === "host"
        );

    }

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
       SPLIT FOH / BOH
    ========================= */

    const frontOfHouse = [];
    const backOfHouse = [];

    for (
        const employee
        of employees.values()
    ) {

        const role =
            employee.distribution_role ||
            employee.role ||
            "Other";

        if (
            isFrontOfHouse(role)
        ) {

            frontOfHouse.push(
                employee
            );

        } else {

            backOfHouse.push(
                employee
            );

        }

    }

    /* =========================
       SORT EMPLOYEES
    ========================= */

    function sortEmployees(
        list,
        tableSortState
    ) {

        list.sort(
            (a, b) => {

                let comparison = 0;

                /* =========================
                   ROLE SORT
                ========================= */

                if (
                    tableSortState.column ===
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
                    tableSortState.column ===
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
                    tableSortState.column ===
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

                return (
                    tableSortState.direction ===
                    "asc"
                        ? comparison
                        : -comparison
                );

            }
        );

    }

    /*
        Sort each list using its
        own independent state.
    */

    sortEmployees(
        frontOfHouse,
        sortState.frontOfHouse
    );

    sortEmployees(
        backOfHouse,
        sortState.backOfHouse
    );

    /* =========================
       CREATE TABLE
    ========================= */

    function createEmployeeTable(
        employeeList,
        title,
        tableSortState,
        sortStateKey
    ) {

        /* =========================
           GROUP WRAPPER
        ========================= */

        const group =
            document.createElement(
                "div"
            );

        group.className =
            "employee-points-group";

        /* =========================
           GROUP TITLE
        ========================= */

        const groupTitle =
            document.createElement(
                "h3"
            );

        groupTitle.className =
            "employee-points-group-title";

        groupTitle.textContent =
            title;

        group.appendChild(
            groupTitle
        );

        /* =========================
           TABLE
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
                Use THIS table's sort state
                rather than the shared state.
            */

            if (
                tableSortState.column ===
                header.column
            ) {

                th.classList.add(
                    tableSortState.direction ===
                        "asc"
                        ? "sort-ascending"
                        : "sort-descending"
                );

                th.textContent =
                    `${header.label} ${
                        tableSortState.direction ===
                        "asc"
                            ? "▲"
                            : "▼"
                    }`;

            }

            /* =========================
               HEADER CLICK
            ========================= */

            th.addEventListener(
                "click",
                () => {

                    /*
                        Only change the sort
                        state for THIS table.
                    */

                    if (
                        tableSortState.column ===
                        header.column
                    ) {

                        tableSortState.direction =
                            tableSortState.direction ===
                                "asc"
                                ? "desc"
                                : "asc";

                    } else {

                        tableSortState.column =
                            header.column;

                        tableSortState.direction =
                            "asc";

                    }

                    /*
                        Re-render both tables,
                        but each table keeps
                        its own sort state.
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
            of employeeList
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

            const roleCell =
                document.createElement(
                    "td"
                );

            roleCell.textContent =
                formatRoleName(
                    role
                );

            const nameCell =
                document.createElement(
                    "td"
                );

            nameCell.textContent =
                employee.name || "";

            const pointCell =
                document.createElement(
                    "td"
                );

            const input =
                document.createElement(
                    "input"
                );

            input.className =
                "points-input";

            input.type =
                "number";

            input.step =
                "0.25";

            input.min =
                "0";

            input.value =
                employee.tip_points ?? 1;

            input.dataset.employeeId =
                employee.employee_id;

            input.dataset.role =
                role;

            pointCell.appendChild(
                input
            );

            row.appendChild(
                roleCell
            );

            row.appendChild(
                nameCell
            );

            row.appendChild(
                pointCell
            );

            tbody.appendChild(
                row
            );

        }

        table.appendChild(
            tbody
        );

        group.appendChild(
            table
        );

        return group;

    }

    /* =========================
       CREATE TWO-TABLE LAYOUT
    ========================= */

    const tablesWrapper =
        document.createElement(
            "div"
        );

    tablesWrapper.className =
        "employee-points-tables";

    /*
        FOH uses its own sort state.
    */

    const fohTable =
        createEmployeeTable(
            frontOfHouse,
            "Front of House",
            sortState.frontOfHouse,
            "frontOfHouse"
        );

    /*
        BOH uses its own sort state.
    */

    const bohTable =
        createEmployeeTable(
            backOfHouse,
            "Back of House",
            sortState.backOfHouse,
            "backOfHouse"
        );

    tablesWrapper.appendChild(
        fohTable
    );

    tablesWrapper.appendChild(
        bohTable
    );

    output.appendChild(
        tablesWrapper
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

                    savePoint(
                        input
                    );

                    if (
                        refreshUI
                    ) {

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

                    savePoint(
                        input
                    );

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

                        if (
                            refreshUI
                        ) {

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
                        nextInput.dataset
                            .employeeId;

                    const nextRole =
                        nextInput.dataset
                            .role;

                    /*
                        Refresh the UI.
                    */

                    if (
                        refreshUI
                    ) {

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

                            if (
                                newInput
                            ) {

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

        "busser / runner":
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