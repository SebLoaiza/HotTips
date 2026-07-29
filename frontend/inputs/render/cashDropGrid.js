export function renderCashDropTables(
    mealBlocks,
    refreshUI
) {

    const output =
        document.getElementById(
            "cashDropTables"
        );


    if (!output) {
        return;
    }


    output.innerHTML = "";



    const meals = [
        "Breakfast",
        "Lunch",
        "Dinner"
    ];



    for (const meal of meals) {


        const blocks =
            mealBlocks.filter(
                block =>
                    block.meal === meal
            );



        if (blocks.length === 0) {
            continue;
        }



        output.appendChild(
            renderMealGrid(
                meal,
                blocks,
                refreshUI
            )
        );

    }

}





function renderMealGrid(
    meal,
    blocks,
    refreshUI
) {


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "cash-grid-wrapper";



    wrapper.innerHTML =
    `
        <h3>
            ${meal} Cash Drops
        </h3>
    `;



    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "cash-grid";



    grid.dataset.meal =
        meal;



    grid.style.gridTemplateColumns =
        `180px repeat(${blocks.length},150px)`;



    // HEADER

    grid.appendChild(
        createCell(
            "Employee",
            "grid-header"
        )
    );



    blocks.forEach(
        block => {

            grid.appendChild(
                createCell(
                    block.date,
                    "grid-header"
                )
            );

        }
    );




    const employees =
        collectEmployees(
            blocks
        );




    for (
        let row = 0;
        row < employees.length;
        row++
    ) {


        const employee =
            employees[row];



        grid.appendChild(
            createCell(
                employee.name,
                "employee-cell"
            )
        );



        for (
            let column = 0;
            column < blocks.length;
            column++
        ) {



            const block =
                blocks[column];



            const worker =
                block.employees.find(
                    e =>
                        e.employee_id ===
                        employee.employee_id
                );



            if (!worker) {


                grid.appendChild(
                    createCell(
                        "-",
                        "disabled-cell"
                    )
                );


                continue;

            }




            grid.appendChild(
                createCashCell(
                    worker,
                    row,
                    column,
                    refreshUI
                )
            );


        }


    }




    wrapper.appendChild(
        grid
    );


    return wrapper;

}







function createCashCell(
    employee,
    row,
    column,
    refreshUI
) {


    const cell =
        document.createElement(
            "div"
        );


    cell.className =
        "cash-grid-cell";



    cell.innerHTML =
    `

        <label>
            Drop
        </label>


        <input
            class="cash-drop-input"
            type="number"
            min="0"
            step="0.01"
            value="${
                (
                    employee.cash_drop / 100
                ).toFixed(2)
            }"
            data-row="${row}"
            data-column="${column}"
        >



        <span>
            Sales:
            ${money(employee.cash_sales)}
        </span>

    `;



    const input =
        cell.querySelector(
            "input"
        );




    updateColor(
        input,
        employee
    );





    input.addEventListener(
        "input",
        () => {


            const value =
                Math.round(
                    (
                        Number(input.value)
                        ||
                        0
                    )
                    *
                    100
                );



            input.className =
                "cash-drop-input " +
                (
                    value < employee.cash_sales
                    ? "drop-low"
                    :
                    value > employee.cash_sales
                    ? "drop-high"
                    :
                    "drop-equal"
                );


        }
    );





    input.addEventListener(
        "change",
        () => {

            saveCashDrop(
                employee,
                input
            );


            updateColor(
                input,
                employee
            );


            const grid =
                cell.closest(
                    ".cash-grid"
                );


            if (grid) {

                pendingCashFocus =
                    getNextPosition(
                        grid,
                        input
                    );

            }



            refreshUI();


            restoreCashFocus();

        }
    );






    input.addEventListener(
        "keydown",
        e => {

            if (e.key !== "Enter") {
                return;
            }


            e.preventDefault();



            saveCashDrop(
                employee,
                input
            );



            const grid =
                cell.closest(
                    ".cash-grid"
                );


            if (!grid) {
                return;
            }



            const currentRow =
                Number(
                    input.dataset.row
                );


            const currentColumn =
                Number(
                    input.dataset.column
                );



            const inputs =
                Array.from(
                    grid.querySelectorAll(
                        ".cash-drop-input"
                    )
                );



            // =========================
            // FIND NEXT INPUT DOWN
            // SKIP BLANK CELLS
            // =========================

            let next =
                inputs
                .filter(
                    i =>
                        Number(i.dataset.column) === currentColumn
                        &&
                        Number(i.dataset.row) > currentRow
                )
                .sort(
                    (a,b) =>
                        Number(a.dataset.row)
                        -
                        Number(b.dataset.row)
                )[0];





            // =========================
            // IF COLUMN IS DONE
            // MOVE TO NEXT DATE
            // =========================

            if (!next) {


                next =
                    inputs
                    .filter(
                        i =>
                            Number(i.dataset.column) > currentColumn
                    )
                    .sort(
                        (a,b) => {


                            const colA =
                                Number(a.dataset.column);

                            const colB =
                                Number(b.dataset.column);


                            if (colA !== colB) {
                                return colA - colB;
                            }


                            return (
                                Number(a.dataset.row)
                                -
                                Number(b.dataset.row)
                            );

                        }
                    )[0];


            }




            if (next) {

                next.focus();

                next.select();

            }


        }
    );




    return cell;

}








function collectEmployees(
    blocks
) {


    const map =
        new Map();



    for (
        const block of blocks
    ) {


        for (
            const employee of block.employees
        ) {


            if (
                !map.has(
                    employee.employee_id
                )
            ) {


                map.set(
                    employee.employee_id,
                    employee
                );


            }


        }


    }



    return [
        ...map.values()
    ];

}








function updateColor(
    input,
    employee
) {


    input.className =
        "cash-drop-input " +
        (
            employee.cash_drop < employee.cash_sales
            ? "drop-low"
            :
            employee.cash_drop > employee.cash_sales
            ? "drop-high"
            :
            "drop-equal"
        );

}








function saveCashDrop(
    employee,
    input
) {

    const dollars =
        Number(input.value) || 0;


    const cents =
        Math.round(
            dollars * 100
        );


    employee.cash_drop =
        cents;



    // normalize display
    input.value =
        (cents / 100).toFixed(2);

}






function createCell(
    text,
    className
) {


    const div =
        document.createElement(
            "div"
        );


    div.className =
        className;


    div.textContent =
        text;


    return div;

}








function money(
    cents
) {


    return `$${(
        (Number(cents) || 0)
        /
        100
    ).toFixed(2)}`;

}