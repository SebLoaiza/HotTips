export function renderAssignedMeals(mealBlocks) {

    const output = document.getElementById("assignedMeals");

    output.innerHTML = "";


    for (const block of mealBlocks) {

        const container = document.createElement("div");

        container.className = "meal-block-card";


        let employeesHTML = "";


        if (block.employees.length === 0) {

            employeesHTML = "<p>No employees assigned</p>";

        }
        else {


            for (const employee of block.employees) {


                let ordersHTML = "";

                let totalSales = 0;
                let totalTip = 0;
                let totalGratuity = 0;

                let totalCash = 0;
                let totalCard = 0;
                let totalOther = 0;



                if (!employee.orders || employee.orders.length === 0) {

                    ordersHTML = "<p>No Orders</p>";

                }
                else {


                    ordersHTML = "<ul>";


                    for (const order of employee.orders) {


                        totalSales += order.amount;

                        totalTip += order.tip;

                        totalGratuity += order.gratuity;


                        totalCash += order.cash_payment;

                        totalCard += order.card_payment;

                        totalOther += order.other_payment;



                        ordersHTML += `

                            <li>

                                <b>
                                    #${order.order_number}
                                </b>

                                |
                                ${minutesToTime(order.order_time_min)}

                                <br>


                                Sales:
                                ${money(order.amount)}

                                <br>


                                Tip:
                                ${money(order.tip)}

                                |

                                Gratuity:
                                ${money(order.gratuity)}


                                <br>


                                Cash:
                                ${money(order.cash_payment)}

                                |

                                Card:
                                ${money(order.card_payment)}

                                |

                                Other:
                                ${money(order.other_payment)}


                            </li>

                            <br>

                        `;

                    }


                    ordersHTML += "</ul>";

                }



                employeesHTML += `


                    <div class="employee-card">


                        <h3>
                            ${employee.name}
                        </h3>


                        <b>Role:</b>
                        ${employee.role}


                        <br><br>


                        <b>Shift:</b>

                        ${minutesToTime(employee.meal_start)}

                        -

                        ${minutesToTime(employee.meal_end)}


                        <br>


                        <b>Worked:</b>
                        ${employee.worked_minutes}
                        minutes



                        <br><br>


                        <b>Breaks:</b>

                        <br>

                        ${renderBreaks(employee.breaks)}



                        <hr>


                        <h4>
                            Order Totals
                        </h4>


                        Sales:
                        ${money(totalSales)}

                        <br>


                        Card Tips:
                        ${money(totalTip)}

                        <br>


                        Gratuity:
                        ${money(totalGratuity)}

                        <br>


                        Cash Payments:
                        ${money(totalCash)}

                        <br>


                        Card Payments:
                        ${money(totalCard)}

                        <br>


                        Other Payments:
                        ${money(totalOther)}



                        <hr>


                        <h4>
                            Orders (${employee.orders?.length || 0})
                        </h4>


                        ${ordersHTML}


                    </div>


                `;


            }

        }



        container.innerHTML = `


            <h2>

                ${block.date}

                -

                ${block.meal}

            </h2>



            <p>

                <b>Meal Window:</b>

                ${minutesToTime(block.start)}

                -

                ${minutesToTime(block.end)}

            </p>



            <hr>



            ${employeesHTML}


        `;



        output.appendChild(container);

    }

}



function money(cents) {

    return `$${((cents || 0) / 100).toFixed(2)}`;

}



function minutesToTime(minutes) {


    let value = minutes % 1440;


    if (value < 0) {
        value += 1440;
    }


    let hours = Math.floor(value / 60);

    const mins = value % 60;


    const suffix = hours >= 12 ? "PM" : "AM";


    if (hours === 0) {

        hours = 12;

    }
    else if (hours > 12) {

        hours -= 12;

    }


    return `${hours}:${String(mins).padStart(2,"0")} ${suffix}`;

}



function renderBreaks(breaks) {


    if (!breaks || breaks.length === 0) {

        return "None";

    }


    return breaks
        .map(
            b =>
            `${minutesToTime(b[0])} - ${minutesToTime(b[1])}`
        )
        .join("<br>");

}