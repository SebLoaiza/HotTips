import { formatMoney } from "./formatters.js";


export function renderMoneySummary(block) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "meal-money-summary";


    // =================================================
    // TOTAL CARD
    // =================================================

    const cardTotal =
        block.employees.reduce(
            (total, employee) =>
                total +
                (employee.card_tips ?? 0),
            0
        );


    // =================================================
    // TOTAL CASH
    // =================================================

    const cashTotal =
        block.employees.reduce(
            (total, employee) =>
                total +
                (employee.cash_tips ?? 0),
            0
        );


    // =================================================
    // TOTAL
    // =================================================

    const total =
        cardTotal +
        cashTotal;


    // =================================================
    // RENDER
    // =================================================

    wrapper.innerHTML = `

        <div class="money-summary-values">

            <div class="money-summary-item">

                <span class="money-summary-label">
                    Card
                </span>

                <span class="money-summary-value">
                    ${formatMoney(cardTotal)}
                </span>

            </div>


            <div class="money-summary-item">

                <span class="money-summary-label">
                    Cash
                </span>

                <span class="money-summary-value">
                    ${formatMoney(cashTotal)}
                </span>

            </div>


            <div class="money-summary-item">

                <span class="money-summary-label">
                    Total
                </span>

                <span class="money-summary-value">
                    ${formatMoney(total)}
                </span>

            </div>

        </div>

    `;


    return wrapper;

}