export function renderMealParticipations(participations) {

    const output = document.getElementById("participations");

    output.innerHTML = "";

    for (const participation of participations) {

        const card = document.createElement("div");

        card.className = "participation-card";

        const breaks = participation.breaks.length
            ? participation.breaks
                .map(b =>
                    `${minutesToTime(b[0])} - ${minutesToTime(b[1])}`
                )
                .join("<br>")
            : "None";

        let totalSales = 0;
        let totalTips = 0;
        let totalGratuity = 0;

        let totalCashPayments = 0;
        let totalCardPayments = 0;
        let totalOtherPayments = 0;

        let ordersHtml = "";

        if (participation.orders.length === 0) {

            ordersHtml = "<i>No Orders</i>";

        }
        else {

            ordersHtml = "<ul>";

            for (const order of participation.orders) {

                totalSales += order.amount;
                totalTips += order.tip;
                totalGratuity += order.gratuity;

                totalCashPayments += order.cash_payment;
                totalCardPayments += order.card_payment;
                totalOtherPayments += order.other_payment;

                ordersHtml += `

                    <li>

                        <b>#${order.order_number}</b>

                        (${minutesToTime(order.order_time_min)})

                        <br>

                        Sales:
                        ${money(order.amount)}

                        |

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

                `;
            }

            ordersHtml += "</ul>";

        }

        card.innerHTML = `

            <h3>${participation.name}</h3>

            <p><b>Role:</b> ${participation.role}</p>

            <p><b>Date:</b> ${participation.date}</p>

            <p>
                <b>Shift:</b>
                ${minutesToTime(participation.meal_start)}
                -
                ${minutesToTime(participation.meal_end)}
            </p>

            <p>
                <b>Breaks:</b><br>
                ${breaks}
            </p>

            <hr>

            <h4>Totals</h4>

            <p><b>Orders:</b> ${participation.orders.length}</p>

            <p><b>Total Sales:</b> ${money(totalSales)}</p>

            <p><b>Total Card Tips:</b> ${money(totalTips)}</p>

            <p><b>Total Gratuity:</b> ${money(totalGratuity)}</p>

            <p><b>Cash Payments:</b> ${money(totalCashPayments)}</p>

            <p><b>Card Payments:</b> ${money(totalCardPayments)}</p>

            <p><b>Other Payments:</b> ${money(totalOtherPayments)}</p>

            <hr>

            <h4>Participation Totals</h4>

            <p><b>Orders:</b> ${participation.orders.length}</p>

            <p><b>Card Sales:</b> ${money(participation.card_sales)}</p>

            <p><b>Cash Sales:</b> ${money(participation.cash_sales)}</p>

            <p><b>Total Sales:</b> ${money(participation.card_sales + participation.cash_sales)}</p>

            <p><b>Card Tips:</b> ${money(participation.card_tips)}</p>

            <p><b>Cash Available:</b> ${money(participation.cash_available)}</p>

            <p><b>Cash Drop:</b> ${money(participation.cash_drop)}</p>

            <hr>

            <h4>Orders</h4>

            ${ordersHtml}

        `;

        output.appendChild(card);

    }

}

function money(cents) {

    return `$${(cents / 100).toFixed(2)}`;

}

function minutesToTime(minutes) {

    let mins = minutes % 1440;

    if (mins < 0) {
        mins += 1440;
    }

    let hours = Math.floor(mins / 60);

    const minutesPart = mins % 60;

    const suffix = hours >= 12 ? "PM" : "AM";

    if (hours === 0) {
        hours = 12;
    }
    else if (hours > 12) {
        hours -= 12;
    }

    return `${hours}:${String(minutesPart).padStart(2, "0")}`;

}