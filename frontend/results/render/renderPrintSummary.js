import {
    formatMoney
}
from "../utils/formatters.js";



export function renderPrintSummary(
    employees
) {


    const container =
        document.createElement(
            "div"
        );


    container.className =
        "printSheet";



    // =========================
    // FILTER QUALIFIED EMPLOYEES
    // =========================
    //
    // Money is stored in cents.
    // $250 = 25000
    //

    const qualifiedEmployees =
        employees.filter(
            employee =>

                employee.sales >= 25000

                &&

                employee.worked_minutes >= 120

        );




    // =========================
    // TOP 5 SALES
    // =========================

    const topSales =
        [...employees]
        .sort(
            (a,b) =>
                b.sales - a.sales
        )
        .slice(0,5);





    // =========================
    // TOP 5 TIP %
    // =========================

    const topTips =
        [...qualifiedEmployees]
        .sort(
            (a,b) => {


                const tipA =
                    a.total_payout /
                    a.sales;


                const tipB =
                    b.total_payout /
                    b.sales;



                return tipB - tipA;

            }
        )
        .slice(0,5);






    // =========================
    // TOP 5 TIPS / HOUR
    // =========================

    const topTipsPerHour =
        [...qualifiedEmployees]
        .sort(
            (a,b) => {


                const hoursA =
                    a.worked_minutes / 60;


                const hoursB =
                    b.worked_minutes / 60;



                const tipsA =
                    a.total_payout /
                    hoursA;


                const tipsB =
                    b.total_payout /
                    hoursB;



                return tipsB - tipsA;


            }
        )
        .slice(0,5);






    container.innerHTML = `


        <h2>
            Tip Summary
        </h2>



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
                                    *
                                    100;



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


                                const tipsPerHour =
                                    employee.total_payout /
                                    (
                                        employee.worked_minutes / 60
                                    );



                                return `

                                <li>

                                    ${employee.name}

                                    -

                                    ${formatMoney(
                                        tipsPerHour
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