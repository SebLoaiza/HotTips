//THIS IS FOR RENDERING THE MEAL BLOCKS IN THE CONSOLE IF YOU WANT THIS TO BE PUT IN THE final batch be my guest

console.log("mealBlocks renderer loaded");
export function renderMealBlocks(mealBlocks, rebuild) {
    console.log("renderMealBlocks called", mealBlocks);
    const output = document.getElementById("mealBlocks");

    if (!output) {
        return;
    }

    output.innerHTML = "";

    let currentDate = "";

    for (const block of mealBlocks) {

        if (block.date !== currentDate) {

            currentDate = block.date;

            const title = document.createElement("h2");
            title.className = "date-title";
            title.textContent = block.date;

            output.appendChild(title);
        }


        const container = document.createElement("div");
        container.className = "meal-block";

        const id = `${block.day_key}-${block.meal}`;

        let employeesHTML = "";


        if (block.employees.length === 0) {

            employeesHTML = "<p><i>No employees assigned.</i></p>";

        } else {

            for (const employee of block.employees) {

                let totalGratuity = 0;

                let ordersHTML = "";


                if (employee.orders.length === 0) {

                    ordersHTML = "<i>No Orders</i>";

                } else {

                    for (const order of employee.orders) {

                        totalGratuity += order.gratuity;

                        ordersHTML += `

                        <details class="order-card">

                            <summary>

                                Order #${order.order_number}
                                • ${minutesToTime(order.order_time_min)}
                                • ${money(order.amount)}

                            </summary>

                            <div class="order-details">

                                <div>
                                    <strong>Sale:</strong>
                                    ${money(order.amount)}
                                </div>

                                <div>
                                    <strong>Tip:</strong>
                                    ${money(order.tip)}
                                </div>

                                <div>
                                    <strong>Gratuity:</strong>
                                    ${money(order.gratuity)}
                                </div>

                                <div>
                                    <strong>Cash Payment:</strong>
                                    ${money(order.cash_payment)}
                                </div>

                                <div>
                                    <strong>Card Payment:</strong>
                                    ${money(order.card_payment)}
                                </div>

                                <div>
                                    <strong>Other Payment:</strong>
                                    ${money(order.other_payment)}
                                </div>

                                <div>
                                    <strong>Source:</strong>
                                    ${order.source}
                                </div>

                            </div>

                        </details>

                        `;

                    }

                }


                employeesHTML += `

                <details class="employee-card">

                    <summary>

                        <strong>${employee.name}</strong>

                        (${employee.role})

                        • ${employee.orders.length} Orders

                    </summary>


                    <div class="employee-details">

                        <div>
                            <strong>Shift:</strong>
                            ${minutesToTime(employee.meal_start)}
                            -
                            ${minutesToTime(employee.meal_end)}
                        </div>


                        <div>
                            <strong>Worked:</strong>
                            ${employee.worked_minutes} mins
                        </div>


                        <hr>


                        <div>
                            <strong>Total Sales:</strong>
                            ${money(employee.order_sales)}
                        </div>


                        <div>
                            <strong>Card Sales:</strong>
                            ${money(employee.card_sales)}
                        </div>


                        <div>
                            <strong>Cash Sales:</strong>
                            ${money(employee.cash_sales)}
                        </div>


                        <hr>


                        <div>
                            <strong>Card Tips:</strong>
                            ${money(employee.card_tips)}
                        </div>


                        <div>
                            <strong>Cash Drop:</strong>
                            ${money(employee.cash_drop)}
                        </div>


                        <div>
                            <strong>Cash Available:</strong>
                            ${money(employee.cash_available)}
                        </div>


                        <hr>


                        <div>
                            <strong>Gratuity:</strong>
                            ${money(totalGratuity)}
                        </div>


                        <br>


                        ${ordersHTML}


                    </div>


                </details>

                `;

            }

        }


        container.innerHTML = `

            <div class="meal-header">

                <h3>
                    ${block.meal}
                    • Online Tips: ${money(block.online_total)}
                </h3>


                <div class="time-editor">

                    <label>

                        Start

                        <input
                            type="time"
                            class="time-input"
                            data-id="${id}"
                            data-field="start"
                            value="${minutesToInput(block.start)}"
                        >

                    </label>


                    <label>

                        End

                        <input
                            type="time"
                            class="time-input"
                            data-id="${id}"
                            data-field="end"
                            value="${minutesToInput(block.end)}"
                        >

                    </label>

                </div>

            </div>


            <details class="employee-section" open>

                <summary>

                    Employees (${block.employees.length})

                </summary>


                ${employeesHTML}


            </details>

        `;


        container
            .querySelectorAll(".time-input")
            .forEach(input => {

                input.addEventListener("change", () => {

                    const mealBlock = mealBlocks.find(
                        b =>
                        `${b.day_key}-${b.meal}` === input.dataset.id
                    );


                    if (!mealBlock) {
                        return;
                    }


                    mealBlock[input.dataset.field] =
                        timeToMinutes(input.value);


                    rebuild();

                });

            });


        output.appendChild(container);

    }

}



function money(cents) {

    return `$${(cents / 100).toFixed(2)}`;

}



function minutesToInput(minutes) {

    minutes %= 1440;

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

}



function minutesToTime(minutes) {

    minutes %= 1440;

    let h = Math.floor(minutes / 60);
    const m = minutes % 60;

    const suffix = h >= 12 ? "PM" : "AM";

    h %= 12;

    if (h === 0) {
        h = 12;
    }

    return `${h}:${String(m).padStart(2, "0")} ${suffix}`;

}



function timeToMinutes(time) {

    const [h, m] = time.split(":").map(Number);

    return h * 60 + m;

}