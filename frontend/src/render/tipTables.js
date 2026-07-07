export function renderTipTables(mealBlocks) {

    const container = document.getElementById("tipTables");

    container.innerHTML = "";


    const meals = [
        "Breakfast",
        "Lunch",
        "Dinner"
    ];


    for (const meal of meals) {


        const blocks = mealBlocks.filter(block => {
            return block.meal === meal;
        });


        if (blocks.length === 0) {
            continue;
        }


        const title = document.createElement("h2");

        title.textContent = `${meal} Card Tips`;

        container.appendChild(title);



        const table = document.createElement("table");


        const header = document.createElement("tr");


        header.innerHTML = `
            <th>Employee</th>
        `;


        for (const block of blocks) {

            header.innerHTML += `
                <th>
                    ${block.date}
                </th>
            `;

        }


        table.appendChild(header);



        /*
            Temporary employees.
            Later this comes from:
            
            block.employees
        */

        const employees = [];


        for (const block of blocks) {

            for (const employee of block.employees) {

                if (!employees.includes(employee.name)) {
                    employees.push(employee.name);
                }

            }

        }



        for (const employee of employees) {


            const row = document.createElement("tr");


            row.innerHTML = `
                <td>
                    ${employee}
                </td>
            `;


            for (const block of blocks) {

                row.innerHTML += `
                    <td>
                        $0.00
                    </td>
                `;

            }


            table.appendChild(row);

        }


        container.appendChild(table);

    }

}