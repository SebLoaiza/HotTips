import {
    formatMoney,
    formatHours
} from "../utils/formatters.js";

export function renderEmployeeDetails(
    employee
) {

    const div =
        document.createElement(
            "div"
        );

    let trainerSection = "";

    // =========================
    // PERCENTAGES
    // =========================

    // Pre-distribution tip percentages
    const originalTips =
        employee.original_tips ?? 0;

    const cashTipsPercentage =
        originalTips > 0
            ? ((employee.original_cash_tips ?? 0) / originalTips) * 100
            : 0;

    const cardTipsPercentage =
        originalTips > 0
            ? ((employee.original_card_tips ?? 0) / originalTips) * 100
            : 0;


    // Final payout percentages
    // Based on the FINAL PAYOUT TOTAL
    const finalPayoutTotal =
        employee.total_payout ?? 0;

    const cashPayoutPercentage =
        finalPayoutTotal > 0
            ? ((employee.cash_payout ?? 0) / finalPayoutTotal) * 100
            : 0;

    const cardPayoutPercentage =
        finalPayoutTotal > 0
            ? ((employee.card_payout ?? 0) / finalPayoutTotal) * 100
            : 0;


    // Tip percentage
    // Total original tips divided by total sales
    const totalSales =
        employee.total_sales ?? 0;

    const tipPercentage =
        totalSales > 0
            ? (originalTips / totalSales) * 100
            : 0;


    const formatPercentage = (value) =>
        `${value.toFixed(2)}%`;


    // =========================
    // TRAINEE TRANSFERS
    // =========================

    if (
        employee.tips_sent_to_trainers &&
        employee.tips_sent_to_trainers.length > 0
    ) {

        trainerSection += `

            <section class="detailCard">

                <h3>
                    Tips Sent To Trainers
                </h3>

        `;

        for (
            const transfer of employee.tips_sent_to_trainers
        ) {

            const total =
                (transfer.cash_amount ?? 0) +
                (transfer.card_amount ?? 0);

            trainerSection += `

                <div class="trainerTransfer">

                    <strong>
                        ${transfer.trainer_name}
                    </strong>

                    <span>
                        ${transfer.date} • ${transfer.meal}
                    </span>

                    <div class="detailList">

                        <div>
                            <label>Cash</label>

                            <span>
                                ${formatMoney(
                                    transfer.cash_amount
                                )}
                            </span>
                        </div>

                        <div>
                            <label>Card</label>

                            <span>
                                ${formatMoney(
                                    transfer.card_amount
                                )}
                            </span>
                        </div>

                        <div>
                            <label>Total</label>

                            <span>
                                ${formatMoney(
                                    total
                                )}
                            </span>
                        </div>

                    </div>

                </div>

            `;
        }

        trainerSection += `

            </section>

        `;
    }


    // =========================
    // TRAINER BONUS
    // =========================

    const trainingTotal =
        (employee.training_cash_received ?? 0) +
        (employee.training_card_received ?? 0);

    if (trainingTotal > 0) {

        trainerSection += `

            <section class="detailCard">

                <h3>
                    Training Tips Received
                </h3>

                <div class="detailList">

                    <div>

                        <label>
                            Cash
                        </label>

                        <span>

                            ${formatMoney(
                                employee.training_cash_received
                            )}

                        </span>

                    </div>

                    <div>

                        <label>
                            Card
                        </label>

                        <span>

                            ${formatMoney(
                                employee.training_card_received
                            )}

                        </span>

                    </div>

                    <div>

                        <label>
                            Total
                        </label>

                        <span>

                            ${formatMoney(
                                trainingTotal
                            )}

                        </span>

                    </div>

                </div>

            </section>

        `;
    }


    // =========================
    // DETAILS
    // =========================

    div.innerHTML = `

        <div class="employeeHeader">

            <h2>
                ${employee.name}
            </h2>

        </div>


        <div class="detailGrid">


            <!-- =========================
                 TIPS PRE-DISTRIBUTION
                 ========================= -->

            <section class="detailCard">

                <h3>
                    Tips Pre-Distribution
                </h3>

                <div class="detailList">


                    <div>

                        <label>
                            Cash Tips
                        </label>

                        <span>

                            ${formatMoney(
                                employee.original_cash_tips
                            )}

                            <small>
                                ${formatPercentage(
                                    cashTipsPercentage
                                )}
                            </small>

                        </span>

                    </div>


                    <div>

                        <label>
                            Card Tips
                        </label>

                        <span>

                            ${formatMoney(
                                employee.original_card_tips
                            )}

                            <small>
                                ${formatPercentage(
                                    cardTipsPercentage
                                )}
                            </small>

                        </span>

                    </div>


                    <div>

                        <label>
                            Total Generated
                        </label>

                        <span>

                            ${formatMoney(
                                employee.original_tips
                            )}

                        </span>

                    </div>


                </div>

            </section>


            <!-- =========================
                 DISTRIBUTION
                 ========================= -->

            <section class="detailCard">

                <h3>
                    Distribution
                </h3>

                <div class="detailList">


                    <div>

                        <label>
                            Cash Tips Kept
                        </label>

                        <span>
                            ${formatMoney(
                                employee.cash_kept
                            )}
                        </span>

                    </div>


                    <div>

                        <label>
                            Credit Card Tips Kept
                        </label>

                        <span>
                            ${formatMoney(
                                employee.card_kept
                            )}
                        </span>

                    </div>


                    <div>

                        <label>
                            Pool Cash Received
                        </label>

                        <span>
                            ${formatMoney(
                                employee.pool_cash
                            )}
                        </span>

                    </div>


                    <div>

                        <label>
                            Pool Credit Card Received
                        </label>

                        <span>
                            ${formatMoney(
                                employee.pool_card
                            )}
                        </span>

                    </div>


                </div>

            </section>


            <!-- =========================
                 FINAL PAYOUT
                 ========================= -->

            <section class="detailCard">

                <h3>
                    Final Payout
                </h3>

                <div class="detailList">


                    <div>

                        <label>
                            Cash
                        </label>

                        <span>

                            ${formatMoney(
                                employee.cash_payout
                            )}

                            <small>
                                ${formatPercentage(
                                    cashPayoutPercentage
                                )}
                            </small>

                        </span>

                    </div>


                    <div>

                        <label>
                            Credit Card
                        </label>

                        <span>

                            ${formatMoney(
                                employee.card_payout
                            )}

                            <small>
                                ${formatPercentage(
                                    cardPayoutPercentage
                                )}
                            </small>

                        </span>

                    </div>


                    <div>

                        <label>
                            Total
                        </label>

                        <span>

                            ${formatMoney(
                                employee.total_payout
                            )}

                        </span>

                    </div>


                </div>

            </section>


            <!-- =========================
                 SALES
                 ========================= -->

            <section class="detailCard">

                <h3>
                    Sales
                </h3>

                <div class="detailList">


                    <div>

                        <label>
                            Cash Sales
                        </label>

                        <span>
                            ${formatMoney(
                                employee.cash_sales
                            )}
                        </span>

                    </div>


                    <div>

                        <label>
                            Credit Card Sales
                        </label>

                        <span>
                            ${formatMoney(
                                employee.card_sales
                            )}
                        </span>

                    </div>


                    <div>

                        <label>
                            Total Sales
                        </label>

                        <span>
                            ${formatMoney(
                                employee.total_sales
                            )}
                        </span>

                    </div>


                </div>

            </section>


            <!-- =========================
                 PERFORMANCE
                 ========================= -->

            <section class="detailCard">

                <h3>
                    Performance
                </h3>

                <div class="detailList">


                    <div>

                        <label>
                            Orders
                        </label>

                        <span>
                            ${employee.order_count}
                        </span>

                    </div>


                    <div>

                        <label>
                            Hours
                        </label>

                        <span>
                            ${formatHours(
                                employee.worked_minutes
                            )}
                        </span>

                    </div>


                    <div>

                        <label>
                            Sales / Hour
                        </label>

                        <span>
                            ${formatMoney(
                                employee.avg_sales_per_hour
                            )}
                        </span>

                    </div>


                    <div>

                        <label>
                            Avg Tip / Order
                        </label>

                        <span>

                            ${formatMoney(
                                employee.avg_tip_per_order
                            )}

                        </span>

                    </div>


                </div>

            </section>


            ${trainerSection}


        </div>

    `;

    return div;

}