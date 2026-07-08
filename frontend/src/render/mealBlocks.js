export function renderMealBlocks(mealBlocks, updateFunction) {

    const output = document.getElementById("output");

    output.innerHTML = "";

    let currentDate = "";

    for (const block of mealBlocks) {

        if (block.date !== currentDate) {

            currentDate = block.date;

            const title = document.createElement("h2");

            title.textContent = block.date;

            output.appendChild(title);

        }

        const container = document.createElement("div");

        container.className = "meal-block";

        const id = `${block.day_key}-${block.meal}`;

        container.innerHTML = `

            <h3>${block.meal}</h3>

            <label>
                Start:
                <input
                    class="time-input"
                    data-id="${id}"
                    data-field="start"
                    value="${minutesToTime(block.start)}"
                >
            </label>

            <label>
                End:
                <input
                    class="time-input"
                    data-id="${id}"
                    data-field="end"
                    value="${minutesToTime(block.end)}"
                >
            </label>

            <hr>

            <h4>Employees (${block.employees.length})</h4>

            <div class="employee-list"></div>

            <hr>

            <h4>All Orders (${block.orders.length})</h4>

            <div class="meal-orders"></div>

        `;

        // -----------------------------
        // Time editing
        // -----------------------------

        const inputs = container.querySelectorAll(".time-input");

        inputs.forEach(input => {

            input.addEventListener("change", () => {

                updateFunction(
                    input.dataset.id,
                    input.dataset.field,
                    input.value
                );

            });

        });

        // -----------------------------
        // Employees
        // -----------------------------

        const employeeContainer =
            container.querySelector(".employee-list");

        for (const employee of block.employees) {

            const card = document.createElement("div");

            card.className = "employee-card";

            let totalSales = 0;
            let totalTips = 0;
            let totalGratuity = 0;
            let totalCollected = 0;

            for (const order of employee.orders) {

                totalSales += order.amount;
                totalTips += order.tip;
                totalGratuity += order.gratuity;
                totalCollected += order.tip + order.gratuity;

            }

            let html = `

                <h4>${employee.name}</h4>

                <div>${employee.role}</div>

                <div><strong>Orders:</strong> ${employee.orders.length}</div>

                <div><strong>Sales:</strong> ${money(totalSales)}</div>

                <div><strong>Tips:</strong> ${money(totalTips)}</div>

                <div><strong>Gratuity:</strong> ${money(totalGratuity)}</div>

                <div><strong>Total Collected:</strong> ${money(totalCollected)}</div>

            `;

            if (employee.orders.length === 0) {

                html += `<div class="no-orders">No Orders</div>`;

            }
            else {

                html += `<ul class="employee-orders">`;

                for (const order of employee.orders) {

                    html += `

                        <li>

                            #${order.order_number}
                            |
                            ${minutesToTime(order.order_time_min)}
                            |
                            Sale ${money(order.amount)}
                            |
                            Tip ${money(order.tip)}
                            |
                            Grat ${money(order.gratuity)}
                            |
                            Total ${money(order.tip + order.gratuity)}

                        </li>

                    `;

                }

                html += `</ul>`;

            }

            card.innerHTML = html;

            employeeContainer.appendChild(card);

        }

        // -----------------------------
        // All Orders
        // -----------------------------

        const orderContainer =
            container.querySelector(".meal-orders");

        for (const order of block.orders) {

            const div = document.createElement("div");

            div.className = "meal-order";

            div.textContent =
                `#${order.order_number} | ${minutesToTime(order.order_time_min)} | ${order.server} | Sale ${money(order.amount)} | Tip ${money(order.tip)} | Grat ${money(order.gratuity)} | Total ${money(order.tip + order.gratuity)}`;

            orderContainer.appendChild(div);

        }

        output.appendChild(container);

    }

}

function minutesToTime(minutes) {

    minutes %= 1440;

    let hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    const suffix = hours >= 12 ? "PM" : "AM";

    hours %= 12;

    if (hours === 0) {
        hours = 12;
    }

    return `${hours}:${String(mins).padStart(2, "0")} ${suffix}`;

}

function money(cents) {

    return `$${(cents / 100).toFixed(2)}`;

}