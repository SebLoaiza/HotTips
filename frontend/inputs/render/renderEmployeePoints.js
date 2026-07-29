export function renderEmployeePoints(mealBlocks, refreshUI) {

    const output =
        document.getElementById("employeePoints");

    if (!output) {
        return;
    }


    output.innerHTML = "";


    const employees = new Map();


    for (const block of mealBlocks) {

        for (const employee of block.employees) {

            if (!employees.has(employee.employee_id)) {

                employees.set(
                    employee.employee_id,
                    employee
                );

            }

        }

    }



    const table =
        document.createElement("table");


    table.className =
        "config-table";



    let html = `

        <thead>

            <tr>

                <th>
                    Employee
                </th>

                <th>
                    Points
                </th>

            </tr>

        </thead>


        <tbody>

    `;



    for (const employee of employees.values()) {


        html += `

            <tr>

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
                        data-employee="${employee.employee_id}"
                    >

                </td>

            </tr>

        `;

    }



    html += `

        </tbody>

    `;



    table.innerHTML = html;


    output.appendChild(table);



    // Attach listeners AFTER creating the table

    table.querySelectorAll(
        ".points-input"
    ).forEach(input => {


        input.addEventListener(
            "change",
            () => {

                const id =
                    input.dataset.employee;


                const value =
                    Number(input.value) || 0;



                for (const block of mealBlocks) {

                    const employee =
                        block.employees.find(
                            e =>
                                e.employee_id === id
                        );


                    if (employee) {

                        employee.tip_points =
                            value;

                    }

                }



                if (refreshUI) {
                    refreshUI();
                }

            }
        );


    });


}