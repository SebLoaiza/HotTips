import {
    formatMoney
}
from "../utils/formatters.js";



export function renderPrintSummary(
    employees,
    distribution
) {


    const container =
        document.createElement(
            "div"
        );


    container.className =
        "printSheet";



    // =========================
    // DATE RANGE
    // =========================

    const dates =
        [
            ...new Set(
                distribution.map(
                    block => block.date
                )
            )
        ];



    const startDate =
        dates[0] || "";



    const endDate =
        dates[dates.length - 1] || "";




    // =========================
    // QUALIFIED EMPLOYEES
    // =========================

    const qualifiedEmployees =
        employees.filter(
            employee =>

                employee.sales >= 25000

                &&

                employee.worked_minutes >= 120

        );





    // =========================
    // TOP SALES
    // =========================

    const topSales =
        [...employees]
        .sort(
            (a,b)=>
                b.sales - a.sales
        )
        .slice(0,5);





    // =========================
    // TOP TIP %
    // =========================

    const topTips =
        [...qualifiedEmployees]
        .sort(
            (a,b)=>{


                const tipA =
                    a.total_payout /
                    a.sales;



                const tipB =
                    b.total_payout /
                    b.sales;



                return tipB-tipA;

            }
        )
        .slice(0,5);





    // =========================
    // TOP TIPS / HOUR
    // =========================

    const topTipsPerHour =
        [...qualifiedEmployees]
        .sort(
            (a,b)=>{


                const tipsA =
                    a.total_payout /
                    (
                        a.worked_minutes / 60
                    );



                const tipsB =
                    b.total_payout /
                    (
                        b.worked_minutes / 60
                    );



                return tipsB - tipsA;

            }
        )
        .slice(0,5);






    container.innerHTML = `


        <h2>
            Tip Summary
        </h2>


        <h4>
            ${startDate}
            -
            ${endDate}
        </h4>




        <div class="printColumns">


            <div>

                <h3>
                    Top 5 Sales
                </h3>


                <ol>

                ${
                    topSales.map(
                        employee => `

                        <li>

                            ${employee.name}

                            -

                            ${formatMoney(
                                employee.sales
                            )}

                        </li>

                        `
                    ).join("")
                }

                </ol>

            </div>




            <div>

                <h3>
                    Top 5 Tip %
                </h3>


                <small>
                    Minimum $250 sales + 2 hours worked
                </small>


                <ol>

                ${
                    topTips.map(
                        employee => {


                            const percent =
                                (
                                    employee.total_payout /
                                    employee.sales
                                )
                                *100;



                            return `

                            <li>

                                ${employee.name}

                                -

                                ${percent.toFixed(2)}%

                            </li>

                            `;


                        }
                    ).join("")
                }

                </ol>

            </div>





            <div>

                <h3>
                    Top 5 Tips / Hour
                </h3>


                <small>
                    Minimum $250 sales + 2 hours worked
                </small>


                <ol>

                ${
                    topTipsPerHour.map(
                        employee => {


                            const hourly =
                                employee.total_payout /
                                (
                                    employee.worked_minutes / 60
                                );



                            return `

                            <li>

                                ${employee.name}

                                -

                                ${formatMoney(
                                    hourly
                                )}
                                / hr

                            </li>

                            `;

                        }
                    ).join("")
                }

                </ol>

            </div>



        </div>


    `;



    return container;


}