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

        renderEmployeePoints.sortState = {};

    }

    const sortState =
        renderEmployeePoints.sortState;


    /* =================================================
       ACTIVE POOL STATE
    ================================================= */

    if (!renderEmployeePoints.activePool) {

        renderEmployeePoints.activePool =
            "Server";

    }

    let activePool =
        renderEmployeePoints.activePool;


    /* =================================================
       NORMALIZE ROLE
    ================================================= */

    function normalizeRole(role) {

        return String(
            role || ""
        )
            .toLowerCase()
            .trim()
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ");

    }


    /* =================================================
       GET POINT GROUP
    ================================================= */

    function getPointGroup(role) {

        const normalized =
            normalizeRole(role);


        /* =================================================
           SERVERS
        ================================================= */

        if (
            normalized === "server" ||
            normalized === "breakfast server"
        ) {

            return "Server";

        }


        /* =================================================
           HOSTS
        ================================================= */

        if (
            normalized === "host" ||
            normalized === "breakfast host"
        ) {

            return "Host";

        }


        /* =================================================
           BUSSERS / RUNNERS
        ================================================= */

        if (
            normalized === "busser" ||
            normalized === "runner" ||
            normalized === "busser / runner" ||
            normalized === "busser/runner" ||
            normalized === "breakfast busser" ||
            normalized === "breakfast runner" ||
            normalized === "breakfast busser / runner" ||
            normalized === "breakfast busser/runner"
        ) {

            return "Busser";

        }


        /* =================================================
           BOH
        ================================================= */

        if (
            normalized === "boh" ||
            normalized === "boh trainee" ||
            normalized.startsWith("boh ") ||
            normalized === "line cook" ||
            normalized === "breakfast line cook" ||
            normalized === "prep cook/dishwasher" ||
            normalized === "prep cook / dishwasher" ||
            normalized.includes("line cook") ||
            normalized.includes("prep cook") ||
            normalized.includes("dishwasher")
        ) {

            return "BOH";

        }


        /* =================================================
           EVERYTHING ELSE
        ================================================= */

        return "Other";

    }


    /* =================================================
       COLLECT EMPLOYEES BY POINT GROUP
    ================================================= */

    const roleGroups =
        new Map();


    const groupOrder = [

        "Server",

        "Host",

        "Busser",

        "BOH",

        "Other"

    ];


    for (
        const group
        of groupOrder
    ) {

        roleGroups.set(
            group,
            new Map()
        );

    }


    for (
        const block
        of mealBlocks
    ) {

        if (
            !Array.isArray(
                block.employees
            )
        ) {

            continue;

        }


        for (
            const employee
            of block.employees
        ) {

            const originalRole =
                String(
                    employee.distribution_role ||
                    employee.role ||
                    "Other"
                ).trim() || "Other";


            const pointGroup =
                getPointGroup(
                    originalRole
                );


            const employeeId =
                String(
                    employee.employee_id ?? ""
                );


            /*
                Employee + POINT GROUP
                is the unique points record.
            */

            const key =
                `${employeeId}__${pointGroup}`;


            const group =
                roleGroups.get(
                    pointGroup
                );


            if (
                !group.has(key)
            ) {

                group.set(
                    key,
                    {
                        ...employee,

                        point_group:
                            pointGroup,

                        display_role:
                            originalRole
                    }
                );

            }

        }

    }


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
        "Save Tip Points";


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
        "Load Pre-Saved Points";


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

    fileInput.className =
        "employee-points-file-input";


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


    output.appendChild(
        controls
    );


    /* =================================================
       POOL TABS
    ================================================= */

    const tabsWrapper =
        document.createElement(
            "div"
        );

    tabsWrapper.className =
        "employee-points-tabs";


    const tableWrapper =
        document.createElement(
            "div"
        );

    tableWrapper.className =
        "employee-points-table-wrapper";


    /* =================================================
       POOL TAB LABELS
    ================================================= */

    const tabLabels = {

        "Server":
            "Servers",

        "Host":
            "Hosts",

        "Busser":
            "Bussers / Runners",

        "BOH":
            "BOH",

        "Other":
            "Other"

    };


    /* =================================================
       CREATE ROLE TABLE
    ================================================= */

    function createRoleTable(
        role,
        employeeList
    ) {

        const group =
            document.createElement(
                "div"
            );

        group.className =
            "employee-points-group";


        /* =================================================
           SORT STATE
        ================================================= */

        if (
            !sortState[role]
        ) {

            sortState[role] = {

                column:
                    "name",

                direction:
                    "asc"

            };

        }


        const tableSortState =
            sortState[role];


        /* =================================================
           SORT EMPLOYEES
        ================================================= */

        employeeList.sort(
            (a, b) => {

                let comparison =
                    0;


                /* NAME */

                if (
                    tableSortState.column ===
                    "name"
                ) {

                    const nameA =
                        formatEmployeeName(
                            a.name
                        ).toLowerCase();


                    const nameB =
                        formatEmployeeName(
                            b.name
                        ).toLowerCase();


                    comparison =
                        nameA.localeCompare(
                            nameB
                        );

                }


                /* ROLE */

                else if (
                    tableSortState.column ===
                    "role"
                ) {

                    const roleA =
                        formatActualRoleName(
                            a.display_role
                        ).toLowerCase();


                    const roleB =
                        formatActualRoleName(
                            b.display_role
                        ).toLowerCase();


                    comparison =
                        roleA.localeCompare(
                            roleB
                        );

                }


                /* POINTS */

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


        /* =================================================
           ROLE TITLE
        ================================================= */

        const groupTitle =
            document.createElement(
                "h3"
            );

        groupTitle.className =
            "employee-points-group-title";

        groupTitle.textContent =
            formatRoleName(
                role
            );


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
                label:
                    "Employee Name",

                column:
                    "name"

            },

            {
                label:
                    "Role",

                column:
                    "role"

            },

            {
                label:
                    "Tip Points",

                column:
                    "point"

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


            th.className =
                "sortable-header";


            /* LABEL */

            const label =
                document.createElement(
                    "span"
                );

            label.className =
                "employee-points-sort-label";

            label.textContent =
                header.label;


            /* SORT INDICATOR */

            const indicator =
                document.createElement(
                    "span"
                );

            indicator.className =
                "employee-points-sort-indicator";


            if (
                tableSortState.column ===
                header.column
            ) {

                indicator.textContent =
                    tableSortState.direction ===
                    "asc"

                        ? "▲"

                        : "▼";

            }


            th.appendChild(
                label
            );

            th.appendChild(
                indicator
            );


            /* =================================================
               SORT CLICK
            ================================================= */

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

                    }

                    else {

                        tableSortState.column =
                            header.column;

                        tableSortState.direction =
                            "asc";

                    }


                    /*
                        Re-render the SAME
                        currently selected pool.
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

            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "employee-points-row";


            /* =================================================
               NAME
            ================================================= */

            const nameCell =
                document.createElement(
                    "td"
                );

            nameCell.className =
                "employee-points-name";

            nameCell.textContent =
                formatEmployeeName(
                    employee.name
                );


            /* =================================================
               ROLE
            ================================================= */

            const roleCell =
                document.createElement(
                    "td"
                );

            roleCell.className =
                "employee-points-role";


            roleCell.textContent =
                formatActualRoleName(
                    employee.display_role
                );


            /* =================================================
               POINTS
            ================================================= */

            const pointCell =
                document.createElement(
                    "td"
                );

            pointCell.className =
                "employee-points-value";


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


            /*
                dataset.employeeId identifies
                the employee.

                dataset.role identifies the
                grouped point pool.
            */

            input.dataset.employeeId =
                employee.employee_id;

            input.dataset.role =
                role;


            pointCell.appendChild(
                input
            );


            row.appendChild(
                nameCell
            );

            row.appendChild(
                roleCell
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
       LOAD SELECTED POOL
    ================================================= */

    function loadPool(
        role
    ) {

        activePool =
            role;

        renderEmployeePoints.activePool =
            role;


        tableWrapper.innerHTML =
            "";


        const employeeMap =
            roleGroups.get(
                role
            );


        if (
            !employeeMap ||
            employeeMap.size === 0
        ) {

            const emptyMessage =
                document.createElement(
                    "div"
                );

            emptyMessage.className =
                "employee-points-empty";

            emptyMessage.textContent =
                `No employees in ${tabLabels[role] || role}.`;


            tableWrapper.appendChild(
                emptyMessage
            );


            return;

        }


        const employeeList =
            Array.from(
                employeeMap.values()
            );


        tableWrapper.appendChild(
            createRoleTable(
                role,
                employeeList
            )
        );


        attachPointInputEvents();

    }


    /* =================================================
       CREATE TABS
    ================================================= */

    for (
        const role
        of groupOrder
    ) {

        const tab =
            document.createElement(
                "button"
            );

        tab.type =
            "button";

        tab.className =
            "employee-points-tab";

        tab.dataset.role =
            role;

        tab.textContent =
            tabLabels[role];


        if (
            role === activePool
        ) {

            tab.classList.add(
                "active"
            );

        }


        tab.addEventListener(
            "click",
            () => {

                if (
                    renderEmployeePoints.activePool ===
                    role
                ) {

                    return;

                }


                renderEmployeePoints.activePool =
                    role;


                const allTabs =
                    tabsWrapper.querySelectorAll(
                        ".employee-points-tab"
                    );


                allTabs.forEach(
                    otherTab => {

                        otherTab.classList.remove(
                            "active"
                        );

                    }
                );


                tab.classList.add(
                    "active"
                );


                loadPool(
                    role
                );

            }
        );


        tabsWrapper.appendChild(
            tab
        );

    }


    output.appendChild(
        tabsWrapper
    );

    output.appendChild(
        tableWrapper
    );


    /* =================================================
       GET POINT INPUTS
    ================================================= */

    const getPointInputs = () => {

        return Array.from(
            tableWrapper.querySelectorAll(
                ".points-input"
            )
        );

    };


    /* =================================================
       SAVE POINT
    ================================================= */

    function savePoint(
        input
    ) {

        const employeeId =
            String(
                input.dataset.employeeId
            );


        const role =
            String(
                input.dataset.role ||
                "Other"
            );


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
            Update EVERY occurrence
            of this employee that
            belongs to the same
            point group.
        */

        for (
            const block
            of mealBlocks
        ) {

            if (
                !Array.isArray(
                    block.employees
                )
            ) {

                continue;

            }


            for (
                const employee
                of block.employees
            ) {

                const currentId =
                    String(
                        employee.employee_id
                    );


                if (
                    currentId !==
                    employeeId
                ) {

                    continue;

                }


                const currentOriginalRole =
                    String(
                        employee.distribution_role ||
                        employee.role ||
                        "Other"
                    );


                const currentPointGroup =
                    getPointGroup(
                        currentOriginalRole
                    );


                if (
                    currentPointGroup ===
                    role
                ) {

                    employee.tip_points =
                        value;

                }

            }

        }

    }


    /* =================================================
       ATTACH POINT INPUT EVENTS
    ================================================= */

    function attachPointInputEvents() {

        const inputs =
            getPointInputs();


        inputs.forEach(
            (
                input,
                index
            ) => {

                /* =================================================
                   CHANGE
                ================================================= */

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


                /* =================================================
                   KEYDOWN
                ================================================= */

                input.addEventListener(
                    "keydown",
                    event => {

                        /*
                            ONLY handle ENTER.

                            Tab continues to behave
                            normally.
                        */

                        if (
                            event.key !==
                            "Enter"
                        ) {

                            return;

                        }


                        /*
                            Prevent Enter from:

                            - submitting a form
                            - clicking a button
                            - inserting anything
                            - triggering other
                              keyboard handlers
                        */

                        event.preventDefault();
                        event.stopPropagation();


                        /*
                            Save the value before
                            moving to the next employee.
                        */

                        savePoint(
                            input
                        );


                        /*
                            Re-read the inputs from
                            the CURRENT table.

                            We intentionally DO NOT
                            call refreshUI() here.

                            refreshUI() can rebuild
                            the table and destroy
                            the input we are navigating
                            from.
                        */

                        const currentInputs =
                            getPointInputs();


                        const currentIndex =
                            currentInputs.indexOf(
                                input
                            );


                        /*
                            Enter = move DOWN

                            Shift + Enter = move UP
                        */

                        const direction =
                            event.shiftKey
                                ? -1
                                : 1;


                        const nextIndex =
                            currentIndex +
                            direction;


                        /*
                            Stop at the top/bottom.
                        */

                        if (
                            nextIndex < 0 ||
                            nextIndex >=
                            currentInputs.length
                        ) {

                            return;

                        }


                        const nextInput =
                            currentInputs[
                                nextIndex
                            ];


                        /*
                            Move focus directly
                            to the next Tip Points
                            input.
                        */

                        nextInput.focus();


                        /*
                            Select the entire
                            number so the user can
                            immediately type the
                            replacement value.
                        */

                        nextInput.select();

                    }
                );

            }
        );

    }


    /* =================================================
       LOAD INITIAL POOL
    ================================================= */

    if (
        !roleGroups.get(
            activePool
        )?.size
    ) {

        const firstAvailable =
            groupOrder.find(
                role =>
                    roleGroups.get(
                        role
                    )?.size > 0
            );


        if (firstAvailable) {

            activePool =
                firstAvailable;

            renderEmployeePoints.activePool =
                firstAvailable;

        }

    }


    /* =================================================
       UPDATE ACTIVE TAB
    ================================================= */

    tabsWrapper
        .querySelectorAll(
            ".employee-points-tab"
        )
        .forEach(
            tab => {

                tab.classList.toggle(
                    "active",
                    tab.dataset.role ===
                    activePool
                );

            }
        );


    /* =================================================
       LOAD INITIAL POOL
    ================================================= */

    loadPool(
        activePool
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

        if (
            !Array.isArray(
                block.employees
            )
        ) {

            continue;

        }


        for (
            const employee
            of block.employees
        ) {

            const originalRole =
                String(
                    employee.distribution_role ||
                    employee.role ||
                    "Other"
                ).trim() || "Other";


            const role =
                getExportPointGroup(
                    originalRole
                );


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
            2,

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
   EXPORT ROLE GROUP HELPER
================================================= */

function getExportPointGroup(
    role
) {

    const normalized =
        normalizeExportRole(
            role
        );


    /* =================================================
       SERVER
    ================================================= */

    if (
        normalized === "server" ||
        normalized === "breakfast server"
    ) {

        return "Server";

    }


    /* =================================================
       HOST
    ================================================= */

    if (
        normalized === "host" ||
        normalized === "breakfast host"
    ) {

        return "Host";

    }


    /* =================================================
       BUSSER / RUNNER
    ================================================= */

    if (
        normalized === "busser" ||
        normalized === "runner" ||
        normalized === "busser / runner" ||
        normalized === "busser/runner" ||
        normalized === "breakfast busser" ||
        normalized === "breakfast runner" ||
        normalized === "breakfast busser / runner" ||
        normalized === "breakfast busser/runner"
    ) {

        return "Busser";

    }


    /* =================================================
       BOH
    ================================================= */

    if (
        normalized === "boh" ||
        normalized === "boh trainee" ||
        normalized.startsWith("boh ") ||
        normalized === "line cook" ||
        normalized === "breakfast line cook" ||
        normalized === "prep cook/dishwasher" ||
        normalized === "prep cook / dishwasher" ||
        normalized.includes("line cook") ||
        normalized.includes("prep cook") ||
        normalized.includes("dishwasher")
    ) {

        return "BOH";

    }


    /* =================================================
       EVERYTHING ELSE
    ================================================= */

    return "Other";

}


/* =================================================
   NORMALIZE EXPORT ROLE
================================================= */

function normalizeExportRole(
    role
) {

    return String(
        role || ""
    )
        .toLowerCase()
        .trim()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

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


                        for (
                            const savedEmployee
                            of data.employees
                        ) {

                            const savedId =
                                String(
                                    savedEmployee.employee_id
                                );


                            /*
                                Convert saved role
                                into the current
                                point group.
                            */

                            const savedRole =
                                getExportPointGroup(
                                    savedEmployee.role
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


                            /* =================================================
                               APPLY TO ALL MATCHING EMPLOYEES
                            ================================================= */

                            for (
                                const block
                                of mealBlocks
                            ) {

                                if (
                                    !Array.isArray(
                                        block.employees
                                    )
                                ) {

                                    continue;

                                }


                                for (
                                    const employee
                                    of block.employees
                                ) {

                                    const employeeId =
                                        String(
                                            employee.employee_id
                                        );


                                    if (
                                        employeeId !==
                                        savedId
                                    ) {

                                        continue;

                                    }


                                    const employeeRole =
                                        String(
                                            employee.distribution_role ||
                                            employee.role ||
                                            "Other"
                                        );


                                    const employeePointGroup =
                                        getExportPointGroup(
                                            employeeRole
                                        );


                                    /*
                                        Match BOTH:

                                        Employee ID

                                        AND

                                        Point Group
                                    */

                                    if (
                                        employeePointGroup ===
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
            "Servers",

        "host":
            "Hosts",

        "busser":
            "Bussers / Runners",

        "boh":
            "BOH",

        "other":
            "Other"

    };


    const normalized =
        String(
            role || "Other"
        )
            .trim()
            .toLowerCase();


    return (
        names[
            normalized
        ] ||
        String(
            role || "Other"
        ).trim()
    );

}


/* =================================================
   ACTUAL ROLE DISPLAY
================================================= */

function formatActualRoleName(
    role
) {

    const raw =
        String(
            role || "Other"
        ).trim();


    const normalized =
        raw
            .toLowerCase()
            .replace(/\s+/g, " ");


    const names = {

        "server":
            "Server",

        "breakfast server":
            "Server",


        "host":
            "Host",

        "breakfast host":
            "Host",


        "busser":
            "Busser",

        "runner":
            "Runner",

        "busser / runner":
            "Busser / Runner",

        "busser/runner":
            "Busser / Runner",

        "breakfast busser":
            "Busser",

        "breakfast runner":
            "Runner",

        "breakfast busser / runner":
            "Busser / Runner",

        "breakfast busser/runner":
            "Busser / Runner",


        "boh":
            "BOH",

        "boh trainee":
            "BOH - Trainee",


        "line cook":
            "Line Cook",

        "breakfast line cook":
            "Line Cook",


        "prep cook/dishwasher":
            "Prep Cook/Dishwasher",

        "prep cook / dishwasher":
            "Prep Cook / Dishwasher",


        "foh trainee":
            "FOH - Trainee",

        "it consultant":
            "IT Consultant",

        "owner":
            "Owner"

    };


    return (
        names[
            normalized
        ] ||
        raw
    );

}