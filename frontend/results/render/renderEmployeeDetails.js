import {
    formatMoney,
    formatHours
}
from "../utils/formatters.js";



export function renderEmployeeDetails(
    employee
) {


    const div =
        document.createElement(
            "div"
        );


    div.innerHTML = `


    <h2>
        ${employee.name}
    </h2>


    <p>
        Cash:
        ${formatMoney(
            employee.cash_payout
        )}
    </p>


    <p>
        Card:
        ${formatMoney(
            employee.card_payout
        )}
    </p>


    <p>
        Total:
        ${formatMoney(
            employee.total_payout
        )}
    </p>


    <hr>


    <p>
        Orders:
        ${employee.order_count}
    </p>


    <p>
        Sales:
        ${formatMoney(
            employee.sales
        )}
    </p>


    <p>
        Hours:
        ${formatHours(
            employee.worked_minutes
        )}
    </p>


    `;


    return div;

}