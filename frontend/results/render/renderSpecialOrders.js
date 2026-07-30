import { formatMoney } from "../utils/formatters.js";


export function renderSpecialOrders(
    mealBlocks
) {


    const container =
        document.createElement(
            "div"
        );


    container.innerHTML = `

        <h2>
            Special Orders
        </h2>

    `;



    for (
        const block of mealBlocks
    ) {


        if (
            !block.special_orders ||
            block.special_orders.length === 0
        ) {

            continue;

        }



        const section =
            document.createElement(
                "div"
            );


        section.innerHTML = `

            <h3>
                ${block.date}
                -
                ${block.meal}
            </h3>


            <table>

                <thead>

                    <tr>

                        <th>
                            Order
                        </th>

                        <th>
                            Server
                        </th>

                        <th>
                            Amount
                        </th>

                        <th>
                            Tip
                        </th>

                        <th>
                            Gratuity
                        </th>

                    </tr>

                </thead>


                <tbody>

                </tbody>

            </table>

        `;



        const body =
            section.querySelector(
                "tbody"
            );



        for (
            const order of block.special_orders
        ) {


            const row =
                document.createElement(
                    "tr"
                );


            row.style.cursor =
                "pointer";


            row.innerHTML = `

                <td>
                    ${order.order_number}
                </td>


                <td>
                    ${order.server}
                </td>


                <td>
                    ${formatMoney(
                        order.amount
                    )}
                </td>


                <td>
                    ${formatMoney(
                        order.tip
                    )}
                </td>


                <td>
                    ${formatMoney(
                        order.gratuity
                    )}
                </td>

            `;



            row.onclick = () => {

                toggleSpecialOrderDetails(
                    row,
                    order
                );

            };



            body.appendChild(
                row
            );

        }



        container.appendChild(
            section
        );

    }



    return container;

}





function toggleSpecialOrderDetails(
    row,
    order
) {


    const existing =
        row.nextElementSibling;



    if (
        existing &&
        existing.classList.contains(
            "specialOrderDetailsRow"
        )
    ) {

        existing.remove();

        return;

    }



    const detailsRow =
        document.createElement(
            "tr"
        );


    detailsRow.className =
        "specialOrderDetailsRow";



    const cell =
        document.createElement(
            "td"
        );


    cell.colSpan = 5;



    cell.innerHTML = `

        <div class="specialOrderDetails">


            <h4>
                Order Information
            </h4>


            <p>
                <b>Order ID:</b>
                ${order.order_id}
            </p>


            <p>
                <b>Order Number:</b>
                ${order.order_number}
            </p>


            <p>
                <b>Server:</b>
                ${order.server}
            </p>


            <p>
                <b>Service:</b>
                ${order.service}
            </p>


            <p>
                <b>Date:</b>
                ${order.order_day}
            </p>


            <p>
                <b>Time:</b>
                ${order.order_timestamp}
            </p>


            <p>
                <b>Source:</b>
                ${order.source}
            </p>


            <p>
                <b>Total:</b>
                ${formatMoney(
                    order.amount
                )}
            </p>


            <p>
                <b>Order Tip:</b>
                ${formatMoney(
                    order.tip
                )}
            </p>


            <p>
                <b>Order Gratuity:</b>
                ${formatMoney(
                    order.gratuity
                )}
            </p>



            <h4>
                Payments
            </h4>


            <table>

                <thead>

                    <tr>

                        <th>
                            Type
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Amount
                        </th>

                        <th>
                            Tip
                        </th>

                        <th>
                            Gratuity
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        (order.payments || [])
                        .map(
                            payment => `

                                <tr>

                                    <td>
                                        ${payment.type}
                                    </td>


                                    <td>
                                        ${payment.status}
                                    </td>


                                    <td>
                                        ${formatMoney(
                                            payment.amount
                                        )}
                                    </td>


                                    <td>
                                        ${formatMoney(
                                            payment.tip
                                        )}
                                    </td>


                                    <td>
                                        ${formatMoney(
                                            payment.gratuity
                                        )}
                                    </td>

                                </tr>

                            `
                        )
                        .join("")
                    }

                </tbody>

            </table>



            <h4>
                Payment Totals
            </h4>


            <p>
                <b>Cash:</b>
                ${formatMoney(
                    order.cash_payment
                )}
            </p>


            <p>
                <b>Card:</b>
                ${formatMoney(
                    order.card_payment
                )}
            </p>


            <p>
                <b>Other:</b>
                ${formatMoney(
                    order.other_payment
                )}
            </p>


        </div>

    `;



    detailsRow.appendChild(
        cell
    );


    row.after(
        detailsRow
    );

}