export function renderEmployeePoints(
    mealBlocks,
    refreshUI
) {

    const output =
        document.getElementById("employeePoints");

    if (!output) {
        return;
    }

    output.innerHTML = "";


    // =========================
    // Build Unique Employee List
    // =========================

    const uniqueEmployees =
        new Map();


    for (const block of mealBlocks) {

        for (const employee of block.employees) {

            const key =
                employee.normalized_name;

            if (!uniqueEmployees.has(key)) {

                if (
                    employee.tip_points === undefined
                ) {
                    employee.tip_points = 1;
                }

                uniqueEmployees.set(key, {

                    name:
                        employee.name,

                    role:
                        employee.role,

                    normalized_name:
                        employee.normalized_name,

                    employees: []

                });

            }

            uniqueEmployees
                .get(key)
                .employees
                .push(employee);

        }

    }


    // =========================
    // Render Inputs
    // =========================

    for (const person of uniqueEmployees.values()) {

        const row =
            document.createElement("div");

        row.className =
            "employee-point-row";


        const label =
            document.createElement("span");

        label.textContent =
            `${person.name} (${person.role})`;


        const input =
            document.createElement("input");

        input.type = "number";
        input.min = "0";
        input.step = "0.1";

        input.value =
            person.employees[0].tip_points;


        input.addEventListener(
            "change",
            () => {

                let value =
                    Number(input.value);

                if (
                    Number.isNaN(value) ||
                    value < 0
                ) {

                    value = 0;

                }

                input.value = value;

                // Update every occurrence
                for (const employee of person.employees) {

                    employee.tip_points =
                        value;

                }

                refreshUI();

            }
        );


        row.appendChild(label);
        row.appendChild(input);

        output.appendChild(row);

    }

}