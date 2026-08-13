import {
    formatMoney
} from "../utils/formatters.js";

export function renderPrintSummary(
    employees,
    distribution
) {

    const container =
        document.createElement("div");

    container.className =
        "printSheet";

    // =================================
    // FORMAT LEADERBOARD NAME
    // =================================

    function formatLeaderboardName(
        name
    ) {

        const cleanName =
            (name || "").trim();

        if (!cleanName) {
            return "";
        }

        // LAST, FIRST
        if (
            cleanName.includes(",")
        ) {

            const parts =
                cleanName
                    .split(",")
                    .map(
                        part =>
                            part.trim()
                    );

            const lastName =
                parts[0] || "";

            const firstName =
                parts[1] || "";

            if (!firstName) {
                return lastName;
            }

            return `${firstName} ${lastName.charAt(0)}.`;
        }

        // FIRST LAST
        const parts =
            cleanName
                .split(/\s+/)
                .filter(Boolean);

        if (
            parts.length === 1
        ) {
            return parts[0];
        }

        const firstName =
            parts[0];

        const lastName =
            parts[parts.length - 1];

        return `${firstName} ${lastName.charAt(0)}.`;
    }

    // =================================
    // DATE RANGE
    // =================================

    const dates =
        [
            ...new Set(
                distribution
                    .map(
                        block =>
                            block.date
                    )
                    .filter(Boolean)
            )
        ];

    dates.sort(
        (a, b) =>
            new Date(a) -
            new Date(b)
    );

    const startDate =
        dates[0] || "";

    const endDate =
        dates[dates.length - 1] || "";

    // =================================
    // QUALIFIED EMPLOYEES
    // =================================

    const qualifiedEmployees =
        employees.filter(
            employee => {

                const totalSales =
                    Number(
                        employee.total_sales
                    ) || 0;

                const workedMinutes =
                    Number(
                        employee.worked_minutes
                    ) || 0;

                return (
                    totalSales >= 250 &&
                    workedMinutes >= 120
                );
            }
        );

    // =================================
    // TOP SALES
    // =================================

    const topSales =
        [
            ...employees
        ]
        .sort(
            (a, b) => {

                const salesA =
                    Number(
                        a.total_sales
                    ) || 0;

                const salesB =
                    Number(
                        b.total_sales
                    ) || 0;

                return (
                    salesB -
                    salesA
                );
            }
        )
        .slice(
            0,
            5
        );

    // =================================
    // TOP TIP %
    // =================================

    const topTips =
        [
            ...qualifiedEmployees
        ]
        .sort(
            (a, b) => {

                const salesA =
                    Number(
                        a.total_sales
                    ) || 0;

                const salesB =
                    Number(
                        b.total_sales
                    ) || 0;

                const tipsA =
                    Number(
                        a.original_tips
                    ) || 0;

                const tipsB =
                    Number(
                        b.original_tips
                    ) || 0;

                const tipA =
                    salesA > 0
                        ? tipsA / salesA
                        : 0;

                const tipB =
                    salesB > 0
                        ? tipsB / salesB
                        : 0;

                return (
                    tipB -
                    tipA
                );
            }
        )
        .slice(
            0,
            5
        );

    // =================================
    // TOP TIPS / HOUR
    // =================================

    const topTipsPerHour =
        [
            ...qualifiedEmployees
        ]
        .sort(
            (a, b) => {

                const minutesA =
                    Number(
                        a.worked_minutes
                    ) || 0;

                const minutesB =
                    Number(
                        b.worked_minutes
                    ) || 0;

                const hoursA =
                    minutesA / 60;

                const hoursB =
                    minutesB / 60;

                const tipsA =
                    Number(
                        a.original_tips
                    ) || 0;

                const tipsB =
                    Number(
                        b.original_tips
                    ) || 0;

                const hourlyA =
                    hoursA > 0
                        ? tipsA / hoursA
                        : 0;

                const hourlyB =
                    hoursB > 0
                        ? tipsB / hoursB
                        : 0;

                return (
                    hourlyB -
                    hourlyA
                );
            }
        )
        .slice(
            0,
            5
        );

    // =================================
    // TIP %
    // =================================

    function getTipPercentage(
        employee
    ) {

        const sales =
            Number(
                employee.total_sales
            ) || 0;

        const tips =
            Number(
                employee.original_tips
            ) || 0;

        if (
            sales <= 0
        ) {
            return 0;
        }

        return (
            tips /
            sales
        ) * 100;
    }

    // =================================
    // TIPS / HOUR
    // =================================

    function getTipsPerHour(
        employee
    ) {

        const minutes =
            Number(
                employee.worked_minutes
            ) || 0;

        const tips =
            Number(
                employee.original_tips
            ) || 0;

        const hours =
            minutes / 60;

        if (
            hours <= 0
        ) {
            return 0;
        }

        return (
            tips /
            hours
        );
    }

    // =================================
    // GRAPH BAR BUILDER
    // =================================

    function buildGraphBars(
        data,
        valueFunction,
        formatter,
        suffix = "",
        barColor = "#000000"
    ) {

        if (
            !data.length
        ) {

            return `
                <div class="analyticsNoData">
                    No qualifying employees
                </div>
            `;
        }

        const values =
            data.map(
                employee =>
                    valueFunction(
                        employee
                    )
            );

        const maxValue =
            Math.max(
                ...values,
                1
            );

        // =================================
        // GRAPH DIMENSIONS
        // =================================

        const BAR_AREA_HEIGHT =
            155;

        const SVG_WIDTH =
            42;

        return data.map(
            employee => {

                const value =
                    valueFunction(
                        employee
                    );

                const normalizedValue =
                    maxValue > 0
                        ?
                        value /
                        maxValue
                        :
                        0;

                const barHeight =
                    Math.max(
                        3,
                        normalizedValue *
                        BAR_AREA_HEIGHT
                    );

                const barY =
                    BAR_AREA_HEIGHT -
                    barHeight;

                const displayValue =
                    `${formatter(value)}${suffix}`;

                const displayName =
                    formatLeaderboardName(
                        employee.name
                    );

                return `

                    <div
                        class="analyticsBarColumn"
                    >

                        <div
                            class="analyticsBarValue"
                            title="${displayValue}"
                        >

                            ${displayValue}

                        </div>

                        <div
                            class="analyticsBarArea"
                        >

                            <svg
                                class="analyticsBarSvg"
                                xmlns="http://www.w3.org/2000/svg"
                                width="${SVG_WIDTH}"
                                height="${BAR_AREA_HEIGHT}"
                                viewBox="
                                    0 0
                                    ${SVG_WIDTH}
                                    ${BAR_AREA_HEIGHT}
                                "
                                preserveAspectRatio="none"
                            >

                                <rect
                                    x="0"
                                    y="${barY}"
                                    width="${SVG_WIDTH}"
                                    height="${barHeight}"
                                    rx="1"
                                    ry="1"
                                    fill="${barColor}"
                                ></rect>

                            </svg>

                        </div>

                        <div
                            class="analyticsBarLabel"
                            title="${displayName}"
                        >

                            ${displayName}

                        </div>

                    </div>

                `;
            }
        )
        .join("");
    }

    // =================================
    // GRAPH HTML
    // =================================

    // PINK = TOP SALES
    const salesGraph =
        buildGraphBars(
            topSales,
            employee =>
                Number(
                    employee.total_sales
                ) || 0,
            value =>
                formatMoney(
                    value
                ),
            "",
            "#E942A3"
        );

    // YELLOW = TOP TIP %
    const tipPercentageGraph =
        buildGraphBars(
            topTips,
            employee =>
                getTipPercentage(
                    employee
                ),
            value =>
                value.toFixed(2),
            "%",
            "#8BE7FF"
        );

    // CYAN = TOP TIPS / HOUR
    const tipsPerHourGraph =
        buildGraphBars(
            topTipsPerHour,
            employee =>
                getTipsPerHour(
                    employee
                ),
            value =>
                formatMoney(
                    value
                ),
            " / hr",
            "#E942A3"
        );

    // =================================
    // TOP SALES ROWS
    // =================================

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

                        ${formatLeaderboardName(
                            employee.name
                        )}

                    </td>

                    <td class="valueCell">

                        ${formatMoney(
                            Number(
                                employee.total_sales
                            ) || 0
                        )}

                    </td>

                </tr>

            `
        )
        .join("");

    // =================================
    // TOP TIP % ROWS
    // =================================

    const topTipsRows =
        topTips.map(
            (
                employee,
                index
            ) => {

                const percent =
                    getTipPercentage(
                        employee
                    );

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

                            ${formatLeaderboardName(
                                employee.name
                            )}

                        </td>

                        <td class="valueCell">

                            ${percent.toFixed(2)}%

                        </td>

                    </tr>

                `;
            }
        )
        .join("");

    // =================================
    // TOP TIPS / HOUR ROWS
    // =================================

    const topTipsPerHourRows =
        topTipsPerHour.map(
            (
                employee,
                index
            ) => {

                const hourly =
                    getTipsPerHour(
                        employee
                    );

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

                            ${formatLeaderboardName(
                                employee.name
                            )}

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

    // =================================
    // REPORT
    // =================================

    container.innerHTML = `

        <style>

            /* =================================
               REPORT
            ================================= */

            .tipSummaryReport {

                width: 100%;

                box-sizing: border-box;

                margin: 0;

                padding: 0;

                background: white;

                color: black;

                font-family:
                    Arial,
                    Helvetica,
                    sans-serif;

            }

            /* =================================
               REPEATING PRINT HEADER
            ================================= */

            .customReportHeader {

                width: 100%;

                height: 72px;

                display: flex;

                justify-content:
                    space-between;

                align-items: center;

                box-sizing: border-box;

                padding:
                    0 0 10px 0;

                margin:
                    0 0 18px 0;

                border-bottom:
                    2px solid #000;

            }

            .reportBrand {

                display: flex;

                align-items: center;

                gap: 12px;

            }

            .reportLogo {

                width: 82px;

                height: auto;

                max-height: 48px;

                display: block;

                object-fit: contain;

            }

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

                margin-top: 5px;

            }

            .reportInfo {

                text-align: right;

            }

            .reportInfoTitle {

                font-size: 19px;

                font-weight: 700;

                line-height: 1.1;

            }

            .reportInfoDate {

                font-size: 10px;

                margin-top: 5px;

            }

            /* =================================
               CRITERIA
            ================================= */

            .criteria {

                text-align: center;

                margin:
                    0 0 20px 0;

                font-size: 10px;

            }

            /* =================================
               TABLE LAYOUT
            ================================= */

            .printResults {

                display: flex;

                flex-direction: column;

                gap: 100px;

                width: 100%;

                box-sizing: border-box;

                align-items: stretch;

            }

            .resultSection {

                width: 100%;

                min-width: 0;

                box-sizing: border-box;

                break-inside: avoid;

                page-break-inside: avoid;

            }

            .resultSection h2 {

                margin:
                    0 0 8px 30px;

                text-align: left;

                font-size: 15px;

                font-weight: 700;

            }

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

            .resultMatrix th,
            .resultMatrix td {

                border-right:
                    1px solid #000;

                border-bottom:
                    1px solid #000;

                padding:
                    6px 9px;

                line-height: 1.2;

                vertical-align: middle;

                box-sizing: border-box;

            }

            .resultMatrix th:last-child,
            .resultMatrix td:last-child {

                border-right: none;

            }

            .resultMatrix tbody tr:last-child td {

                border-bottom: none;

            }

            .resultMatrix thead th {

                font-weight: bold;

                text-align: center;

                white-space: nowrap;

            }

            .resultMatrix {
                width: 75%;
                table-layout: fixed;
                border-collapse: separate;
                border-spacing: 0;
                border: 2px solid #000;
                margin: 0 auto;
                padding: 0;
                background: white;
                box-sizing: border-box;
            }

            /* # column */
            .resultMatrix th:nth-child(1),
            .resultMatrix td:nth-child(1) {
                width: 8% !important;
                text-align: center;
            }

            /* Employee column */
            .resultMatrix th:nth-child(2),
            .resultMatrix td:nth-child(2) {
                width: 37% !important;
                text-align: left;
            }

            /* Value column */
            .resultMatrix th:nth-child(3),
            .resultMatrix td:nth-child(3) {
                width: 30% !important;
                text-align: center;
            }

            .resultMatrix .firstPlace td {

                font-weight: 700;

            }

            /* =================================
               PERFORMANCE GRAPHS
            ================================= */

            .performanceGraphs {

                width: 100%;

                display: flex;

                flex-direction: column;

                gap: 40px;

                margin-top: 12px;

            }

            .performanceGraphCard {

                width: 100%;

                box-sizing: border-box;

                break-inside: avoid;

                page-break-inside: avoid;

            }

            .performanceGraphCard h2 {

                margin:
                    0 0 10px 0;

                text-align: left;

                font-size: 15px;

                font-weight: 700;

            }

            /* =================================
               GRAPH
            ================================= */

            .analyticsBarChart {

                width: 100%;

                height: 235px;

                display: flex;

                align-items: flex-end;

                justify-content:
                    space-evenly;

                gap: 14px;

                padding:
                    14px 14px 0 14px;

                box-sizing: border-box;

                border-top:
                    1px solid #999;

                border-bottom:
                    2px solid #000;

                position: relative;

                background: white;

            }

            /* =================================
               VERY LIGHT GUIDE LINES
            ================================= */

            .analyticsBarChart::before {

                content: "";

                position: absolute;

                left: 14px;

                right: 14px;

                top: 25%;

                border-top:
                    1px solid #d0d0d0;

                pointer-events: none;

            }

            .analyticsBarChart::after {

                content: "";

                position: absolute;

                left: 14px;

                right: 14px;

                top: 50%;

                border-top:
                    1px solid #d0d0d0;

                pointer-events: none;

            }

            /* =================================
               BAR COLUMN
            ================================= */

            .analyticsBarColumn {

                flex: 0 1 76px;

                width: 76px;

                min-width: 42px;

                height: 215px;

                display: flex;

                flex-direction: column;

                justify-content: flex-end;

                align-items: center;

                box-sizing: border-box;

                position: relative;

                z-index: 2;

            }

            /* =================================
               VALUE
            ================================= */

            .analyticsBarValue {

                width: 100%;

                height: 16px;

                text-align: center;

                font-size: 15px;

                font-weight: 700;

                line-height: 1.1;

                margin-bottom: 5px;

                white-space: nowrap;

                overflow: hidden;

                text-overflow: ellipsis;

                box-sizing: border-box;

            }

            /* =================================
               BAR AREA
            ================================= */

            .analyticsBarArea {

                width: 48%;

                max-width: 42px;

                min-width: 24px;

                height: 155px;

                display: flex;

                align-items: flex-end;

                justify-content: center;

                box-sizing: border-box;

                flex-shrink: 0;

            }

            /* =================================
               SVG BAR
            ================================= */

            .analyticsBarSvg {

                display: block;

                width: 100%;

                height: 155px;

                flex-shrink: 0;

                overflow: visible;

            }

            /* =================================
               EMPLOYEE LABEL
            ================================= */

            .analyticsBarLabel {

                width: 100%;

                height: 14px;

                margin-top: 6px;

                text-align: center;

                font-size: 12px;

                font-weight: 600;

                line-height: 1.1;

                white-space: nowrap;

                overflow: hidden;

                text-overflow: ellipsis;

                box-sizing: border-box;

            }

            /* =================================
               NO DATA
            ================================= */

            .analyticsNoData {

                width: 100%;

                padding: 20px;

                box-sizing: border-box;

                border:
                    1px solid #000;

                text-align: center;

                font-size: 11px;

            }

            /* =================================
               PRINT
            ================================= */

            @media print {

                @page {

                    margin:
                        8mm
                        14mm
                        6mm
                        14mm;

                }

                html,
                body {

                    margin: 0;

                    padding: 0;

                    background: white;

                }

                .tipSummaryReport {

                    width: 100%;

                    margin: 0;

                    padding: 0;

                }

                .customReportHeader {

                    position: fixed;

                    top: 0;

                    left: 0;

                    right: 0;

                    width: 100%;

                    height: 58px;

                    margin: 0;

                    padding:
                        0 0 8px 0;

                    background: white;

                    z-index: 1000;

                }

                .tipSummaryReport {

                    padding-top: 98px;

                }

                .tipSummaryReport .customReportHeader {

                    box-sizing: border-box;

                }

                .reportLogo {

                    width: 72px;

                    max-height: 40px;

                }

                .reportBrandName {

                    font-size: 18px;

                }

                .reportBrandSubtitle {

                    font-size: 8px;

                }

                .reportInfoTitle {

                    font-size: 16px;

                }

                .reportInfoDate {

                    font-size: 9px;

                }

                .criteria {

                    margin-bottom: 18px;

                }

                .printResults {

                    display: flex;

                    flex-direction: column;

                    gap: 50px;

                }

                .resultSection {

                    break-inside: avoid;

                    page-break-inside: avoid;

                }

                .resultMatrix {

                    break-inside: avoid;

                    page-break-inside: avoid;

                }

                .resultMatrix tr {

                    break-inside: avoid;

                    page-break-inside: avoid;

                }

                .performanceGraphs {

                    break-inside: avoid;

                    page-break-inside: avoid;

                    gap: 40px;

                }

                .performanceGraphCard {

                    break-inside: avoid;

                    page-break-inside: avoid;

                }

                .analyticsBarChart {

                    height: 235px;

                    break-inside: avoid;

                    page-break-inside: avoid;

                }

                .analyticsBarColumn {

                    height: 215px;

                    break-inside: avoid;

                    page-break-inside: avoid;

                }

                .analyticsBarArea {

                    height: 155px;

                }

                .analyticsBarSvg {

                    height: 155px;

                }

            }

        </style>

        <div class="tipSummaryReport">

            <!-- =================================
                 REPEATING HEADER
            ================================= -->

            <header
                class="customReportHeader"
            >

                <div class="reportBrand">

                    <img
                        class="reportLogo"
                        src="./logo.png"
                        alt="Hot Noods"
                    />

                    <div
                        class="reportBrandText"
                    >

                        <div
                            class="reportBrandName"
                        >

                            Hot Noods

                        </div>

                        <div
                            class="reportBrandSubtitle"
                        >

                            Employee leaderboard

                        </div>

                    </div>

                </div>

                <div
                    class="reportInfo"
                >

                    <div
                        class="reportInfoTitle"
                    >

                        Tip Summary

                    </div>

                    <div
                        class="reportInfoDate"
                    >

                        ${startDate}

                        -

                        ${endDate}

                    </div>

                </div>

            </header>

            <!-- =================================
                 TABLES
            ================================= -->

            <section
                class="printResults"
            >

                <!-- TOP SALES -->

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

                <!-- TOP TIP % -->

                <div
                    class="resultSection"
                >

                    <h2>

                        Top 5 Tip Percentage *

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

                <!-- TOP TIPS / HOUR -->

                <div
                    class="resultSection bottomMatrix"
                >

                    <h2>

                        Top 5 Tips Per Hour *

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

            <!-- =================================
                 PERFORMANCE GRAPHS
            ================================= -->

            <section
                class="performanceGraphs"
            >

                <!-- TOP SALES GRAPH -->

                <div
                    class="performanceGraphCard"
                >

                    <h2>

                        Top Sales

                    </h2>

                    <div
                        class="analyticsBarChart"
                    >

                        ${salesGraph}

                    </div>

                </div>

                <!-- TOP TIP % GRAPH -->

                <div
                    class="performanceGraphCard"
                >

                    <h2>

                        Top Tip Percentage *

                    </h2>

                    <div
                        class="analyticsBarChart"
                    >

                        ${tipPercentageGraph}

                    </div>

                </div>

                <!-- TOP TIPS / HOUR GRAPH -->

                <div
                    class="performanceGraphCard"
                >

                    <h2>

                        Top Tips Per Hour *

                    </h2>

                    <div
                        class="analyticsBarChart"
                    >

                        ${tipsPerHourGraph}

                    </div>

                </div>

            </section>

        </div>

    `;
    const footer =
        document.createElement("div");

    footer.className =
        "analytics-footer";

    const footerNote =
        document.createElement("div");

    footerNote.className =
        "analytics-footer-note";

    footerNote.textContent =
        "*Minimum $250 sales + 2 hours worked required for Tip % and Tips / Hour.";

    const footerDate =
        document.createElement("div");

    footerDate.className =
        "analytics-footer-date";

    footerDate.textContent =
        `${new Date().toLocaleDateString()}`;

    footer.appendChild(
        footerNote
    );

    footer.appendChild(
        footerDate
    );

    container.appendChild(
        footer
    );

    return container;
}