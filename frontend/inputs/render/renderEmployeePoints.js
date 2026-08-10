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
       COLLECT EMPLOYEES
    ========================= */

    const employees = new Map();


    for (const block of mealBlocks) {

        for (const employee of block.employees) {

            /*
                The same employee can appear
                in multiple meal blocks.

                We use employee ID + role so
                different roles can have
                different points.
            */

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
       GROUP BY ROLE
    ========================= */

    const groups = new Map();


    for (const employee of employees.values()) {

        const role =
            employee.distribution_role ||
            employee.role ||
            "Other";


        if (!groups.has(role)) {

            groups.set(
                role,
                []
            );

        }


        groups
            .get(role)
            .push(employee);

    }


    /* =========================
       SORT ROLES
    ========================= */

    const roleOrder = [
        "server",
        "boh",
        "busser/runner",
        "host",
        "other"
    ];


    const sortedGroups =
        [...groups.entries()].sort(
            ([roleA], [roleB]) => {

                const a =
                    roleOrder.indexOf(
                        String(roleA).toLowerCase()
                    );

                const b =
                    roleOrder.indexOf(
                        String(roleB).toLowerCase()
                    );


                return (
                    (a === -1 ? 99 : a) -
                    (b === -1 ? 99 : b)
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


    thead.innerHTML = `
        <tr>
            <th>Employee</th>
            <th>Points</th>
        </tr>
    `;


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


    /* =========================
       ROLE GROUPS
    ========================= */

    for (
        const [role, employeesInRole]
        of sortedGroups
    ) {

        employeesInRole.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );


        /* =========================
           ROLE HEADER
        ========================= */

        const roleRow =
            document.createElement(
                "tr"
            );


        roleRow.className =
            "employee-points-role-row";


        const roleCell =
            document.createElement(
                "td"
            );


        roleCell.colSpan = 2;


        roleCell.textContent =
            formatRoleName(role);


        roleRow.appendChild(
            roleCell
        );


        tbody.appendChild(
            roleRow
        );


        /* =========================
           EMPLOYEES
        ========================= */

        for (
            const employee
            of employeesInRole
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "employee-points-row";


            row.innerHTML = `
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

    }


    table.appendChild(
        tbody
    );


    output.appendChild(
        table
    );


    /* =========================
       POINT INPUT LISTENERS
    ========================= */

    table
        .querySelectorAll(
            ".points-input"
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

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


                            /*
                                MATCH BOTH:

                                1. Employee ID
                                2. Role

                                This is important because
                                the same employee may appear
                                with different roles.
                            */

                            if (
                                employee.employee_id ===
                                    employeeId &&

                                employeeRole ===
                                    role
                            ) {

                                employee.tip_points =
                                    value;

                            }

                        }

                    }


                    /*
                        Refresh the page/UI after
                        updating the source mealBlocks.
                    */

                    if (refreshUI) {

                        refreshUI();

                    }

                }
            );

        });

}


/* =========================
   ROLE DISPLAY NAME
========================= */

function formatRoleName(role) {

    const names = {

        "server":
            "Servers",

        "boh":
            "BOH",

        "busser/runner":
            "Bussers / Runners",

        "host":
            "Hosts",

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