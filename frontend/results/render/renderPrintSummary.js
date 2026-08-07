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

                employee.total_sales >= 250

                &&

                employee.worked_minutes >= 120

        );



    // =========================
    // TOP SALES
    // =========================


    const topSales =
        [
            ...employees
        ]
        .sort(
            (a,b) =>
                b.total_sales -
                a.total_sales
        )
        .slice(
            0,
            5
        );



    // =========================
    // TOP TIP %
    // =========================


    const topTips =
        [
            ...qualifiedEmployees
        ]
        .sort(
            (a,b) => {


                const tipA =
                    a.total_sales > 0
                        ?

                        (
                            a.original_tips /
                            a.total_sales
                        )

                        :

                        0;



                const tipB =
                    b.total_sales > 0
                        ?

                        (
                            b.original_tips /
                            b.total_sales
                        )

                        :

                        0;



                return tipB - tipA;

            }
        )
        .slice(
            0,
            5
        );



    // =========================
    // TOP TIPS / HOUR
    // =========================


    const topTipsPerHour =
        [
            ...qualifiedEmployees
        ]
        .sort(
            (a,b) => {


                const hoursA =
                    a.worked_minutes / 60;


                const hoursB =
                    b.worked_minutes / 60;



                const tipsA =
                    hoursA > 0
                        ?
                        a.original_tips / hoursA
                        :
                        0;



                const tipsB =
                    hoursB > 0
                        ?
                        b.original_tips / hoursB
                        :
                        0;



                return tipsB - tipsA;


            }
        )
        .slice(
            0,
            5
        );




    // =========================
    // HTML
    // =========================


    container.innerHTML = `


        <header class="printHeader">


            <img

                src="./assets/logo.png"

                class="printLogo"

            >


        </header>




        <section class="reportTitle">


            <h1>
                Tip Summary
            </h1>


            <p>

                ${startDate}

                -

                ${endDate}

            </p>


        </section>





        <section class="printResults">



            <div class="resultSection">


                <h2>
                    Top 5 Sales
                </h2>



                <ol>


                ${
                    topSales.map(
                        employee => `


                        <li>


                            ${employee.name}


                            -

                            ${formatMoney(
                                employee.total_sales
                            )}


                        </li>


                        `
                    )
                    .join("")
                }


                </ol>


            </div>







            <div class="resultSection">


                <h2>
                    Top 5 Tip %
                </h2>



                <p class="criteria">

                    Minimum $250 sales + 2 hours worked

                </p>



                <ol>


                ${
                    topTips.map(
                        employee => {


                            const percent =

                                employee.total_sales > 0

                                ?

                                (
                                    employee.original_tips /
                                    employee.total_sales
                                )
                                *
                                100

                                :

                                0;



                            return `


                            <li>


                                ${employee.name}


                                -


                                ${percent.toFixed(2)}%


                            </li>


                            `;


                        }
                    )
                    .join("")
                }


                </ol>


            </div>








            <div class="resultSection">


                <h2>
                    Top 5 Tips / Hour
                </h2>



                <p class="criteria">

                    Minimum $250 sales + 2 hours worked

                </p>




                <ol>


                ${
                    topTipsPerHour.map(
                        employee => {


                            const hours =

                                employee.worked_minutes / 60;



                            const hourly =

                                hours > 0

                                ?

                                employee.original_tips /
                                hours

                                :

                                0;



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
                    )
                    .join("")
                }


                </ol>



            </div>



        </section>


    `;



    return container;

}