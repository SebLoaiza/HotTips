// =================================
// RENDER ANALYTICS
// =================================

import {
    formatMoney,
    formatNumber
} from "../utils/formatters.js";


// =================================
// RENDER ANALYTICS
// =================================

export function renderAnalytics(
    employees
) {

    const container =
        document.createElement(
            "div"
        );

    container.className =
        "analytics-content";


    // =================================
    // SHARED EMPLOYEE CALCULATIONS
    // SAME LOGIC AS renderStats
    // =================================

    function cashTips(
        employee
    ) {

        return (

            (
                Number(
                    employee.cash_kept
                ) || 0
            )

            +

            (
                Number(
                    employee.pool_cash
                ) || 0
            )

        );

    }


    function cardTips(
        employee
    ) {

        return (

            (
                Number(
                    employee.card_kept
                ) || 0
            )

            +

            (
                Number(
                    employee.pool_card
                ) || 0
            )

        );

    }


    function totalTips(
        employee
    ) {

        return (
            cashTips(
                employee
            )

            +

            cardTips(
                employee
            )
        );

    }


    function salesPerHour(
        employee
    ) {

        const hours =
            Number(
                employee.hours
            ) || 0;

        const totalSales =
            Number(
                employee.total_sales
            ) || 0;

        if (
            hours <= 0
        ) {

            return 0;

        }

        return (
            totalSales /
            hours
        );

    }


    function ordersPerHour(
        employee
    ) {

        const hours =
            Number(
                employee.hours
            ) || 0;

        const orders =
            Number(
                employee.order_count
            ) || 0;

        if (
            hours <= 0
        ) {

            return 0;

        }

        return (
            orders /
            hours
        );

    }


    function tipsPerHour(
        employee
    ) {

        const hours =
            Number(
                employee.hours
            ) || 0;

        if (
            hours <= 0
        ) {

            return 0;

        }

        return (
            totalTips(
                employee
            )

            /

            hours
        );

    }


    function avgTipPerOrder(
        employee
    ) {

        const orders =
            Number(
                employee.order_count
            ) || 0;

        if (
            orders <= 0
        ) {

            return 0;

        }

        return (
            totalTips(
                employee
            )

            /

            orders
        );

    }


    function totalPayout(
        employee
    ) {

        const cashKept =
            Number(
                employee.cash_kept
            ) || 0;

        const cardKept =
            Number(
                employee.card_kept
            ) || 0;

        const poolCash =
            Number(
                employee.pool_cash
            ) || 0;

        const poolCard =
            Number(
                employee.pool_card
            ) || 0;

        return (
            cashKept
            +
            cardKept
            +
            poolCash
            +
            poolCard
        );

    }


    // =================================
    // TITLE
    // =================================

    const title =
        document.createElement(
            "h2"
        );

    title.textContent =
        "Employee Performance";

    container.appendChild(
        title
    );


    // =================================
    // EMPLOYEE PERFORMANCE TABLE
    // =================================

    const tableWrapper =
        document.createElement(
            "div"
        );

    tableWrapper.className =
        "analytics-table-wrapper";


    const table =
        document.createElement(
            "table"
        );

    table.className =
        "analytics-table";


    // =================================
    // TABLE HEADER
    // =================================

    const thead =
        document.createElement(
            "thead"
        );

    const headerRow =
        document.createElement(
            "tr"
        );


    const headers = [

        "Employee",

        "Total Sales",

        "Sales / Hr",

        "Orders",

        "Orders / Hr",

        "Original Tips",

        "Tips / Hr",

        "Avg Tip / Order",

        "Hours",

        "Total Payout"

    ];


    headers.forEach(
        header => {

            const th =
                document.createElement(
                    "th"
                );

            th.textContent =
                header;

            headerRow.appendChild(
                th
            );

        }
    );


    thead.appendChild(
        headerRow
    );

    table.appendChild(
        thead
    );


    // =================================
    // TABLE BODY
    // =================================

    const tbody =
        document.createElement(
            "tbody"
        );


    employees.forEach(
        employee => {

            const totalSales =
                Number(
                    employee.total_sales
                ) || 0;

            const orders =
                Number(
                    employee.order_count
                ) || 0;

            const hours =
                Number(
                    employee.hours
                ) || 0;


            const row =
                document.createElement(
                    "tr"
                );


            const values = [

                employee.name ?? "",

                formatMoney(
                    totalSales
                ),

                formatMoney(
                    salesPerHour(
                        employee
                    )
                ),

                formatNumber(
                    orders
                ),

                formatNumber(
                    ordersPerHour(
                        employee
                    )
                ),

                formatMoney(
                    totalTips(
                        employee
                    )
                ),

                formatMoney(
                    tipsPerHour(
                        employee
                    )
                ),

                formatMoney(
                    avgTipPerOrder(
                        employee
                    )
                ),

                formatNumber(
                    hours
                ),

                formatMoney(
                    totalPayout(
                        employee
                    )
                )

            ];


            values.forEach(
                value => {

                    const td =
                        document.createElement(
                            "td"
                        );

                    td.textContent =
                        value;

                    row.appendChild(
                        td
                    );

                }
            );


            tbody.appendChild(
                row
            );

        }
    );


    table.appendChild(
        tbody
    );


    tableWrapper.appendChild(
        table
    );


    container.appendChild(
        tableWrapper
    );


    // =================================
    // GRAPHS TITLE
    // =================================

    const graphsTitle =
        document.createElement(
            "h2"
        );

    graphsTitle.textContent =
        "Employee Performance Graphs";

    graphsTitle.className =
        "analytics-graphs-title";

    container.appendChild(
        graphsTitle
    );


    // =================================
    // GRAPH CONTAINER
    // =================================

    const graphsContainer =
        document.createElement(
            "div"
        );

    graphsContainer.className =
        "analytics-graphs";


    // =================================
    // BUILD ALL EMPLOYEE DATA
    // =================================
    //
    // IMPORTANT:
    //
    // Do NOT sort or slice here.
    //
    // Every graph gets to choose its
    // own top 10.
    //
    // =================================

    const allEmployeeData =
        employees.map(
            employee => {

                const totalSales =
                    Number(
                        employee.total_sales
                    ) || 0;

                const orders =
                    Number(
                        employee.order_count
                    ) || 0;

                const hours =
                    Number(
                        employee.hours
                    ) || 0;


                return {

                    name:
                        employee.name ??
                        "Unknown",

                    totalSales,

                    salesPerHour:
                        salesPerHour(
                            employee
                        ),

                    orders,

                    ordersPerHour:
                        ordersPerHour(
                            employee
                        ),

                    totalTips:
                        totalTips(
                            employee
                        ),

                    tipsPerHour:
                        tipsPerHour(
                            employee
                        ),

                    avgTipPerOrder:
                        avgTipPerOrder(
                            employee
                        ),

                    hours,

                    totalPayout:
                        totalPayout(
                            employee
                        )

                };

            }
        );


    // =================================
    // GRAPH METRICS
    // =================================

    const metrics = [

        {
            title:
                "Total Sales",

            key:
                "totalSales",

            type:
                "money"
        },


        {
            title:
                "Sales / Hr",

            key:
                "salesPerHour",

            type:
                "money"
        },


        {
            title:
                "Orders",

            key:
                "orders",

            type:
                "number"
        },


        {
            title:
                "Orders / Hr",

            key:
                "ordersPerHour",

            type:
                "number"
        },


        {
            title:
                "Original Total Tips",

            key:
                "totalTips",

            type:
                "money"
        },


        {
            title:
                "Tips / Hr",

            key:
                "tipsPerHour",

            type:
                "money"
        },


        {
            title:
                "Avg Tip / Order",

            key:
                "avgTipPerOrder",

            type:
                "money"
        },


        {
            title:
                "Hours",

            key:
                "hours",

            type:
                "number"
        },


        {
            title:
                "Total Payout",

            key:
                "totalPayout",

            type:
                "money"
        }

    ];


    // =================================
    // CREATE EACH GRAPH
    // =================================

    metrics.forEach(
        metric => {

            const graphCard =
                document.createElement(
                    "div"
                );

            graphCard.className =
                "analytics-graph-card";


            // =================================
            // GRAPH TITLE
            // =================================

            const graphTitle =
                document.createElement(
                    "h3"
                );

            graphTitle.textContent =
                metric.title;

            graphCard.appendChild(
                graphTitle
            );


            // =================================
            // CHART
            // =================================

            const chartWrapper =
                document.createElement(
                    "div"
                );

            chartWrapper.className =
                "bar-chart";


            // =================================
            // TOP 10 FOR THIS GRAPH
            // =================================
            //
            // Each graph independently:
            //
            // 1. Copies ALL employees
            // 2. Sorts by its own metric
            // 3. Highest first
            // 4. Takes top 10
            //
            // Therefore:
            //
            // LEFT  = highest
            // RIGHT = lowest of top 10
            //
            // =================================

            const employeeData =
                [...allEmployeeData]
                    .sort(
                        (
                            a,
                            b
                        ) => {

                            const valueA =
                                Number(
                                    a[
                                        metric.key
                                    ]
                                ) || 0;

                            const valueB =
                                Number(
                                    b[
                                        metric.key
                                    ]
                                ) || 0;

                            return (
                                valueB -
                                valueA
                            );

                        }
                    )
                    .slice(
                        0,
                        10
                    );


            // =================================
            // FIND MAX VALUE
            // =================================

            const maxValue =
                Math.max(
                    ...employeeData.map(
                        employee =>
                            Number(
                                employee[
                                    metric.key
                                ]
                            ) || 0
                    ),
                    1
                );


            // =================================
            // CREATE BARS
            // =================================

            employeeData.forEach(
                employee => {

                    const value =
                        Number(
                            employee[
                                metric.key
                            ]
                        ) || 0;


                    const percentage =
                        (
                            value /
                            maxValue
                        ) * 100;


                    // =================================
                    // BAR COLUMN
                    // =================================

                    const barColumn =
                        document.createElement(
                            "div"
                        );

                    barColumn.className =
                        "bar-column";


                    // =================================
                    // VALUE ABOVE BAR
                    // =================================

                    const valueLabel =
                        document.createElement(
                            "div"
                        );

                    valueLabel.className =
                        "bar-value";


                    if (
                        metric.type ===
                        "money"
                    ) {

                        valueLabel.textContent =
                            formatMoney(
                                value
                            );

                    }

                    else {

                        valueLabel.textContent =
                            formatNumber(
                                value
                            );

                    }


                    // =================================
                    // BAR AREA
                    // =================================

                    const barArea =
                        document.createElement(
                            "div"
                        );

                    barArea.className =
                        "bar-area";


                    // =================================
                    // BAR
                    // =================================

                    const bar =
                        document.createElement(
                            "div"
                        );

                    bar.className =
                        "bar";


                    bar.style.height =
                        `${percentage}%`;


                    // =================================
                    // TOOLTIP
                    // =================================

                    const formattedValue =
                        metric.type ===
                        "money"

                            ?

                            formatMoney(
                                value
                            )

                            :

                            formatNumber(
                                value
                            );


                    bar.title =
                        `${employee.name}: ${formattedValue}`;


                    // =================================
                    // EMPLOYEE NAME
                    // =================================

                    const employeeLabel =
                        document.createElement(
                            "div"
                        );

                    employeeLabel.className =
                        "bar-label";

                    employeeLabel.textContent =
                        employee.name;


                    // =================================
                    // ASSEMBLE BAR
                    // =================================

                    barArea.appendChild(
                        bar
                    );


                    barColumn.appendChild(
                        valueLabel
                    );


                    barColumn.appendChild(
                        barArea
                    );


                    barColumn.appendChild(
                        employeeLabel
                    );


                    chartWrapper.appendChild(
                        barColumn
                    );

                }
            );


            // =================================
            // ADD GRAPH
            // =================================

            graphCard.appendChild(
                chartWrapper
            );


            graphsContainer.appendChild(
                graphCard
            );

        }
    );


    // =================================
    // ADD ALL GRAPHS
    // =================================

    container.appendChild(
        graphsContainer
    );


    // =================================
    // RETURN ANALYTICS
    // =================================

    return container;

}