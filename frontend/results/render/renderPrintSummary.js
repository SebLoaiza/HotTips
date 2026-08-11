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
            (a, b) =>
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
            (a, b) => {

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
            (a, b) => {

                const hoursA =
                    a.worked_minutes /
                    60;


                const hoursB =
                    b.worked_minutes /
                    60;


                const tipsA =
                    hoursA > 0
                        ?
                        a.original_tips /
                        hoursA
                        :
                        0;


                const tipsB =
                    hoursB > 0
                        ?
                        b.original_tips /
                        hoursB
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
    // TOP SALES ROWS
    // =========================

    const topSalesRows =
        topSales.map(
            (
                employee,
                index
            ) => `

                <tr
                    class="${
                        index === 0
                            ? "firstPlace"
                            : ""
                    }"
                >

                    <td class="rankCell">

                        ${index + 1}

                    </td>


                    <td class="nameCell">

                        ${employee.name}

                    </td>


                    <td class="valueCell">

                        ${formatMoney(
                            employee.total_sales
                        )}

                    </td>

                </tr>

            `
        )
        .join("");


    // =========================
    // TOP TIP % ROWS
    // =========================

    const topTipsRows =
        topTips.map(
            (
                employee,
                index
            ) => {

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

                    <tr
                        class="${
                            index === 0
                                ? "firstPlace"
                                : ""
                        }"
                    >

                        <td class="rankCell">

                            ${index + 1}

                        </td>


                        <td class="nameCell">

                            ${employee.name}

                        </td>


                        <td class="valueCell">

                            ${percent.toFixed(2)}%

                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    // =========================
    // TOP TIPS / HOUR ROWS
    // =========================

    const topTipsPerHourRows =
        topTipsPerHour.map(
            (
                employee,
                index
            ) => {

                const hours =
                    employee.worked_minutes /
                    60;


                const hourly =
                    hours > 0
                        ?
                        employee.original_tips /
                        hours
                        :
                        0;


                return `

                    <tr
                        class="${
                            index === 0
                                ? "firstPlace"
                                : ""
                        }"
                    >

                        <td class="rankCell">

                            ${index + 1}

                        </td>


                        <td class="nameCell">

                            ${employee.name}

                        </td>


                        <td class="valueCell">

                            ${formatMoney(
                                hourly
                            )}

                            / hr

                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    // =========================
    // REPORT HTML
    // =========================

    container.innerHTML = `

        <style>

            /* =========================
               REPORT
            ========================= */

            .tipSummaryReport {

                width: 100%;

                box-sizing: border-box;

                margin: 0;

                padding: 0;

                background: white;

                color: black;

            }


            /* =========================
               CUSTOM HEADER
            ========================= */

            .customReportHeader {

                width: 100%;

                display: flex;

                justify-content:
                    space-between;

                align-items: center;

                box-sizing: border-box;

                padding:
                    0 0 14px 0;

                margin:
                    0 0 18px 0;

                border-bottom:
                    2px solid #000;

            }


            /* =========================
               BRAND
            ========================= */

            .reportBrand {

                display: flex;

                align-items: center;

                gap: 12px;

            }


            /* =========================
               LOGO
            ========================= */

            .reportLogo {

                width: 90px;

                height: auto;

                display: block;

                object-fit: contain;

            }


            /* =========================
               BRAND TEXT
            ========================= */

            .reportBrandText {

                display: flex;

                flex-direction: column;

            }


            .reportBrandName {

                font-size: 22px;

                font-weight: 800;

                line-height: 1;

            }


            .reportBrandSubtitle {

                font-size: 10px;

                margin-top: 4px;

            }


            /* =========================
               REPORT INFO
            ========================= */

            .reportInfo {

                text-align: right;

            }


            .reportInfoTitle {

                font-size: 21px;

                font-weight: 700;

                line-height: 1.1;

            }


            .reportInfoDate {

                font-size: 11px;

                margin-top: 5px;

            }


            /* =========================
               DISCLAIMER
            ========================= */

            .criteria {

                text-align: center;

                margin:
                    0 0 20px 0;

                font-size: 11px;

            }


            /* =========================
               THREE MATRIX LAYOUT
            ========================= */

            .printResults {

                display: grid;

                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );

                gap: 24px;

                width: 100%;

                box-sizing: border-box;

                align-items: start;

            }


            /* =========================
               RESULT SECTION
            ========================= */

            .resultSection {

                width: 100%;

                min-width: 0;

                box-sizing: border-box;

                break-inside: avoid;

                page-break-inside: avoid;

            }


            .resultSection h2 {

                margin:
                    0 0 8px 0;

                text-align: center;

                font-size: 16px;

                font-weight: 700;

            }


            /* =========================
               BOTTOM TABLE
            ========================= */

            .resultSection.bottomMatrix {

                grid-column:
                    1 / -1;

                width: 50%;

                justify-self: center;

            }


            /* =========================
               MATRIX
            ========================= */

            .resultMatrix {

                width: 100%;

                table-layout: fixed;

                border-collapse: separate;

                border-spacing: 0;

                border:
                    2px solid #000;

                margin: 0;

                padding: 0;

                background: white;

                box-sizing: border-box;

            }


            /* =========================
               CELLS
            ========================= */

            .resultMatrix th,
            .resultMatrix td {

                border-right:
                    1px solid #000;

                border-bottom:
                    1px solid #000;

                padding:
                    7px 9px;

                line-height: 1.2;

                vertical-align: middle;

                box-sizing: border-box;

            }


            /* =========================
               OUTER BORDERS
            ========================= */

            .resultMatrix th:last-child,
            .resultMatrix td:last-child {

                border-right: none;

            }


            .resultMatrix tbody tr:last-child td {

                border-bottom: none;

            }


            /* =========================
               TABLE HEADERS
            ========================= */

            .resultMatrix thead th {

                font-weight: bold;

                text-align: center;

                white-space: nowrap;

            }


            /* =========================
               COLUMN WIDTHS
            ========================= */

            .resultMatrix .rankCell {

                width: 12%;

                text-align: center;

            }


            .resultMatrix .nameCell {

                width: 48%;

                text-align: left;

                white-space: nowrap;

                overflow: hidden;

                text-overflow: ellipsis;

            }


            .resultMatrix .valueCell {

                width: 40%;

                text-align: right;

                white-space: nowrap;

            }


            /* =========================
               FIRST PLACE
            ========================= */

            .resultMatrix .firstPlace td {

                font-weight: 700;

            }


            /* =========================
               PRINT SAFETY
            ========================= */

            @media print {

                .tipSummaryReport {

                    width: 100%;

                    margin: 0;

                    padding: 0;

                }


                .customReportHeader {

                    break-inside: avoid;

                    page-break-inside: avoid;

                }


                .printResults {

                    display: grid;

                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );

                    gap: 24px;

                }


                .resultSection {

                    break-inside: avoid;

                    page-break-inside: avoid;

                }


                .resultSection.bottomMatrix {

                    grid-column:
                        1 / -1;

                    width: 50%;

                    justify-self: center;

                }


                .resultMatrix {

                    break-inside: avoid;

                    page-break-inside: avoid;

                }


                .resultMatrix tr {

                    break-inside: avoid;

                    page-break-inside: avoid;

                }

            }

        </style>


        <div class="tipSummaryReport">


            <!-- =========================
                 CUSTOM HEADER
            ========================= -->

            <header
                class="customReportHeader"
            >

                <div class="reportBrand">

                    <img
                        class="reportLogo"
                        src="./logo.png"
                        alt="Hot Noods"
                    />


                    <div class="reportBrandText">

                        <div class="reportBrandName">

                            Hot Noods

                        </div>


                        <div
                            class="
                                reportBrandSubtitle
                            "
                        >

                            Employee leaderboard

                        </div>

                    </div>

                </div>


                <div class="reportInfo">

                    <div
                        class="
                            reportInfoTitle
                        "
                    >

                    </div>


                    <div
                        class="
                            reportInfoDate
                        "
                    >

                        ${startDate}

                        -

                        ${endDate}

                    </div>

                </div>

            </header>


            <!-- =========================
                 SINGLE DISCLAIMER
            ========================= -->

            <p class="criteria">

                Minimum $250 sales + 2 hours worked
                required for Tip % and Tips / Hour.

            </p>


            <!-- =========================
                 THREE MATRICES
            ========================= -->

            <section class="printResults">


                <!-- =========================
                     TOP SALES
                ========================= -->

                <div
                    class="resultSection"
                >

                    <h2>

                        Top 5 Sales

                    </h2>


                    <table
                        class="resultMatrix"
                    >

                        <thead>

                            <tr>

                                <th>

                                    #

                                </th>


                                <th>

                                    Employee

                                </th>


                                <th>

                                    Sales

                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${topSalesRows}

                        </tbody>

                    </table>

                </div>


                <!-- =========================
                     TOP TIP %
                ========================= -->

                <div
                    class="resultSection"
                >

                    <h2>

                        Top 5 Tip %

                    </h2>


                    <table
                        class="resultMatrix"
                    >

                        <thead>

                            <tr>

                                <th>

                                    #

                                </th>


                                <th>

                                    Employee

                                </th>


                                <th>

                                    Tip %

                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${topTipsRows}

                        </tbody>

                    </table>

                </div>


                <!-- =========================
                     TOP TIPS / HOUR
                ========================= -->

                <div
                    class="
                        resultSection
                        bottomMatrix
                    "
                >

                    <h2>

                        Top 5 Tips / Hour

                    </h2>


                    <table
                        class="resultMatrix"
                    >

                        <thead>

                            <tr>

                                <th>

                                    #

                                </th>


                                <th>

                                    Employee

                                </th>


                                <th>

                                    Tips / Hour

                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${topTipsPerHourRows}

                        </tbody>

                    </table>

                </div>


            </section>


        </div>

    `;


    return container;

}