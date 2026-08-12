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

    /* =================================================
       SORT STATE
    ================================================= */

    if (!renderEmployeePoints.sortState) {

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


    /* =================================================
       ROLE CLASSIFICATION
    ================================================= */

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


    /* =================================================
       COLLECT EMPLOYEES
    ================================================= */

    const employees =
        new Map();

    for (const block of mealBlocks) {

        for (const employee of block.employees) {

            const role =
                employee.distribution_role ||
                employee.role ||
                "Other";

            /*
                Employee + role is the unique key.

                This is important because one employee
                can have multiple roles.
            */

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


    /* =================================================
       SPLIT FOH / BOH
    ================================================= */

    const frontOfHouse = [];
    const backOfHouse = [];

    for (const employee of employees.values()) {

        const role =
            employee.distribution_role ||
            employee.role ||
            "Other";

        if (isFrontOfHouse(role)) {

            frontOfHouse.push(
                employee
            );

        } else {

            backOfHouse.push(
                employee
            );

        }

    }


    /* =================================================
       SORT EMPLOYEES
    ================================================= */

    function sortEmployees(
        list,
        tableSortState
    ) {

        list.sort(
            (a, b) => {

                let comparison = 0;

                /* ROLE */

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

                /* NAME */

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

                /* POINT */

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
                        pointA - pointB;

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


    sortEmployees(
        frontOfHouse,
        sortState.frontOfHouse
    );

    sortEmployees(
        backOfHouse,
        sortState.backOfHouse
    );


    /* =================================================
       POINT FILE CONTROLS
    ================================================= */

    const controls =
        document.createElement(
            "div"
        );

    controls.className =
        "employee-points-controls";


    /* =================================================
       EXPORT BUTTON
    ================================================= */

    const exportButton =
        document.createElement(
            "button"
        );

    exportButton.type =
        "button";

    exportButton.className =
        "employee-points-button export-points-button";

    exportButton.textContent =
        "Export Points";

    exportButton.addEventListener(
        "click",
        () => {

            exportPoints(
                mealBlocks
            );

        }
    );


    /* =================================================
       LOAD BUTTON
    ================================================= */

    const loadButton =
        document.createElement(
            "button"
        );

    loadButton.type =
        "button";

    loadButton.className =
        "employee-points-button load-points-button";

    loadButton.textContent =
        "Load Points";

    /* =================================================
       HIDDEN FILE INPUT
    ================================================= */

    const fileInput =
        document.createElement(
            "input"
        );

    fileInput.type =
        "file";

    fileInput.accept =
        ".json,application/json";

    fileInput.style.display =
        "none";


    loadButton.addEventListener(
        "click",
        () => {

            fileInput.click();

        }
    );


    fileInput.addEventListener(
        "change",
        async () => {

            const file =
                fileInput.files?.[0];

            if (!file) return;

            try {

                await loadPoints(
                    file,
                    mealBlocks
                );

                renderEmployeePoints(
                    mealBlocks,
                    refreshUI
                );

                if (refreshUI) {

                    refreshUI();

                }

            }
            catch (error) {

                console.error(
                    "Failed to load employee points:",
                    error
                );

                alert(
                    "Could not load the employee points file."
                );

            }

            fileInput.value = "";

        }
    );


    controls.appendChild(
        exportButton
    );

    controls.appendChild(
        loadButton
    );

    controls.appendChild(
        fileInput
    );


    /*
        IMPORTANT:

        The controls are added BEFORE
        either table so they appear
        at the top.
    */

    output.appendChild(
        controls
    );


    /* =================================================
       CREATE EMPLOYEE TABLE
    ================================================= */

    function createEmployeeTable(
        employeeList,
        title,
        tableSortState
    ) {

        const group =
            document.createElement(
                "div"
            );

        group.className =
            "employee-points-group";


        /* =================================================
           TITLE
        ================================================= */

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


        /* =================================================
           TABLE
        ================================================= */

        const table =
            document.createElement(
                "table"
            );

        table.className =
            "config-table employee-points-table";


        /* =================================================
           HEADER
        ================================================= */

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


        for (const header of headers) {

            const th =
                document.createElement(
                    "th"
                );

            th.className =
                "sortable-header";

            th.textContent =
                header.label;


            /*
                Show sort arrow.
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


            /*
                Sorting.
            */

            th.addEventListener(
                "click",
                () => {

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


        /* =================================================
           BODY
        ================================================= */

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


            /* ROLE */

            const roleCell =
                document.createElement(
                    "td"
                );

            roleCell.textContent =
                formatRoleName(
                    role
                );


            /* NAME */

            const nameCell =
                document.createElement(
                    "td"
                );

            nameCell.textContent =
                formatEmployeeName(
                    employee.name
                );


            /* POINT */

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


    /* =================================================
       TABLES WRAPPER
    ================================================= */

    const tablesWrapper =
        document.createElement(
            "div"
        );

    tablesWrapper.className =
        "employee-points-tables";


    /*
        Tables remain stacked vertically.
    */

    tablesWrapper.appendChild(
        createEmployeeTable(
            frontOfHouse,
            "Front of House",
            sortState.frontOfHouse
        )
    );

    tablesWrapper.appendChild(
        createEmployeeTable(
            backOfHouse,
            "Back of House",
            sortState.backOfHouse
        )
    );


    output.appendChild(
        tablesWrapper
    );


    /* =================================================
       GET POINT INPUTS
    ================================================= */

    const getPointInputs = () => {

        return Array.from(
            output.querySelectorAll(
                ".points-input"
            )
        );

    };


    /* =================================================
       SAVE POINT
    ================================================= */

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


        /*
            Update every occurrence
            of this employee + role.
        */

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
                    )

                    &&

                    employeeRole ===
                    role

                ) {

                    employee.tip_points =
                        value;

                }

            }

        }

    }


    /* =================================================
       CHANGE EVENTS
    ================================================= */

    getPointInputs().forEach(
        input => {

            input.addEventListener(
                "change",
                () => {

                    savePoint(
                        input
                    );

                    if (refreshUI) {

                        refreshUI();

                    }

                }
            );

        }
    );


    /* =================================================
       KEYBOARD NAVIGATION
    ================================================= */

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


                    savePoint(
                        input
                    );


                    const inputs =
                        getPointInputs();


                    const currentIndex =
                        inputs.indexOf(
                            input
                        );


                    /*
                        Enter = down

                        Shift + Enter = up
                    */

                    const direction =
                        event.shiftKey
                            ? -1
                            : 1;


                    const nextIndex =
                        currentIndex +
                        direction;


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


                    if (refreshUI) {

                        refreshUI();

                    }


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
                                        )

                                        &&

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


/* =================================================
   EXPORT POINTS
================================================= */

function exportPoints(
    mealBlocks
) {

    const employees =
        new Map();


    for (
        const block
        of mealBlocks
    ) {

        for (
            const employee
            of block.employees
        ) {

            const role =
                employee.distribution_role ||
                employee.role ||
                "Other";


            const employeeId =
                String(
                    employee.employee_id
                );


            const key =
                `${employeeId}__${role}`;


            if (
                !employees.has(key)
            ) {

                employees.set(
                    key,
                    {

                        employee_id:
                            employee.employee_id,

                        name:
                            employee.name || "",

                        role:
                            role,

                        tip_points:
                            Number(
                                employee.tip_points ?? 1
                            )

                    }
                );

            }

        }

    }


    const data = {

        hotTipsPointsVersion:
            1,

        exportedAt:
            new Date().toISOString(),

        employees:
            Array.from(
                employees.values()
            )

    };


    const json =
        JSON.stringify(
            data,
            null,
            4
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    const now =
        new Date();


    const date =
        `${String(
            now.getMonth() + 1
        ).padStart(2, "0")}-` +

        `${String(
            now.getDate()
        ).padStart(2, "0")}-` +

        `${now.getFullYear()}`;


    link.href =
        url;


    link.download =
        `HotTips Employee Points - ${date}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =================================================
   LOAD POINTS
================================================= */

function loadPoints(
    file,
    mealBlocks
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    try {

                        const data =
                            JSON.parse(
                                reader.result
                            );


                        /*
                            Validate the file.
                        */

                        if (
                            !data ||
                            !Array.isArray(
                                data.employees
                            )
                        ) {

                            throw new Error(
                                "Invalid HotTips employee points file."
                            );

                        }


                        /*
                            Apply saved points.
                        */

                        for (
                            const savedEmployee
                            of data.employees
                        ) {

                            const savedId =
                                String(
                                    savedEmployee.employee_id
                                );


                            const savedRole =
                                String(
                                    savedEmployee.role ||
                                    "Other"
                                );


                            let points =
                                Number(
                                    savedEmployee.tip_points
                                );


                            if (
                                Number.isNaN(
                                    points
                                ) ||
                                points < 0
                            ) {

                                points = 0;

                            }


                            /*
                                Find matching
                                employee + role.
                            */

                            for (
                                const block
                                of mealBlocks
                            ) {

                                for (
                                    const employee
                                    of block.employees
                                ) {

                                    const employeeId =
                                        String(
                                            employee.employee_id
                                        );


                                    const employeeRole =
                                        String(
                                            employee.distribution_role ||
                                            employee.role ||
                                            "Other"
                                        );


                                    /*
                                        BOTH employee ID
                                        AND role must match.

                                        This allows:

                                        John Smith
                                        Server = 1.0

                                        John Smith
                                        Host = 0.5
                                    */

                                    if (

                                        employeeId ===
                                        savedId

                                        &&

                                        employeeRole ===
                                        savedRole

                                    ) {

                                        employee.tip_points =
                                            points;

                                    }

                                }

                            }

                        }


                        resolve(
                            data
                        );

                    }
                    catch (error) {

                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                () => {

                    reject(
                        reader.error
                    );

                };


            reader.readAsText(
                file
            );

        }
    );

}


/* =================================================
   EMPLOYEE NAME FORMAT
================================================= */

function formatEmployeeName(
    name
) {

    const raw =
        String(
            name || ""
        ).trim();


    if (!raw) {

        return "";

    }


    /*
        POS format:

        Last, First

        becomes:

        First L.
    */

    if (
        raw.includes(",")
    ) {

        const parts =
            raw
                .split(",")
                .map(
                    part =>
                        part.trim()
                );


        const lastName =
            parts[0] || "";


        const firstName =
            parts[1] || "";


        const lastInitial =
            lastName
                .charAt(0)
                .toUpperCase();


        return (
            `${firstName} ${lastInitial}.`
        ).trim();

    }


    /*
        Standard format:

        First Last

        becomes:

        First L.
    */

    const parts =
        raw
            .split(/\s+/)
            .filter(Boolean);


    if (
        parts.length === 1
    ) {

        return parts[0];

    }


    const firstName =
        parts[0];


    const lastName =
        parts[
            parts.length - 1
        ];


    return (
        `${firstName} ${lastName.charAt(0).toUpperCase()}.`
    );

}


/* =================================================
   ROLE DISPLAY NAME
================================================= */

function formatRoleName(
    role
) {

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
            String(
                role
            ).toLowerCase()
        ] ||
        role
    );

}