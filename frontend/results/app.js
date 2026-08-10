import {
    ResultsSession
}
from "./model/resultsSession.js";


import {
    compileResults
}
from "./logic/compileResults.js";


import {
    renderResultsTable
}
from "./render/renderResultsTable.js";


import {
    renderStats
}
from "./render/renderStats.js";


import {
    renderEmployeeDetails
}
from "./render/renderEmployeeDetails.js";


import {
    renderDateSelector
}
from "./render/renderDateSelector.js";


import {
    renderPrintSummary
}
from "./render/renderPrintSummary.js";


import {
    exportTipDistributionCSV
}
from "./logic/exportTipDistributionCSV.js";


import {
    saveTipDistributionJSON
}
from "./logic/saveTipDistributionJSON.js";


import {
    loadTipDistributionJSON
}
from "./logic/loadTipDistributionJSON.js";


import {
    renderSpecialOrders
}
from "./render/renderSpecialOrders.js";


import {
    exportPayrollSummaryCSV
}
from "./logic/exportPayrollSummaryCSV.js";


// =================================
// LOAD CURRENT HISTORY
// =================================

let tipDistribution =
    JSON.parse(
        sessionStorage.getItem(
            "tipDistribution"
        )
    ) || [];


const resultsSession =
    new ResultsSession(
        tipDistribution
    );


// =================================
// DOM
// =================================

const resultsContainer =
    document.getElementById(
        "resultsContainer"
    );


const dateContainer =
    document.getElementById(
        "dateSelector"
    );


const printContainer =
    document.getElementById(
        "printSummary"
    );


const printButton =
    document.getElementById(
        "printButton"
    );


const exportCSVButton =
    document.getElementById(
        "exportCSVButton"
    );


const saveButton =
    document.getElementById(
        "saveButton"
    );


const loadButton =
    document.getElementById(
        "loadButton"
    );


const historyInput =
    document.getElementById(
        "historyInput"
    );


const summaryButton =
    document.getElementById(
        "summaryButton"
    );


const resultsButton =
    document.getElementById(
        "resultsButton"
    );


// =================================
// CURRENT VIEW
// =================================

let currentView = "results";


// =================================
// EMPLOYEE DETAILS
// =================================

function openEmployee(
    row,
    employee
) {

    const existing =
        row.nextElementSibling;


    if (
        existing &&
        existing.classList.contains(
            "employeeDetailsRow"
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
        "employeeDetailsRow";


    const cell =
        document.createElement(
            "td"
        );


    /*
        The simple Results table only has
        four columns now:

        Name
        Cash
        Card
        Total
    */

    cell.colSpan = 4;


    cell.appendChild(
        renderEmployeeDetails(
            employee
        )
    );


    detailsRow.appendChild(
        cell
    );


    row.after(
        detailsRow
    );

}


// =================================
// RENDER RESULTS VIEW
// =================================

function renderResults() {

    currentView = "results";


    resultsContainer.innerHTML =
        "";


    printContainer.innerHTML =
        "";


    const filtered =
        resultsSession.filtered_distribution;


    const employees =
        compileResults(
            filtered
        );


    // Employee results table

    resultsContainer.appendChild(

        renderResultsTable(
            employees,
            openEmployee
        )

    );


    // Special orders

    resultsContainer.appendChild(

        renderSpecialOrders(
            filtered
        )

    );


    // Print summary

    printContainer.appendChild(

        renderPrintSummary(
            employees,
            filtered
        )

    );


    updateViewButtons();

}


// =================================
// RENDER STATS VIEW
// =================================

function renderStatsPage() {

    currentView = "stats";


    resultsContainer.innerHTML =
        "";


    printContainer.innerHTML =
        "";


    const filtered =
        resultsSession.filtered_distribution;


    const employees =
        compileResults(
            filtered
        );


    resultsContainer.appendChild(

        renderStats(
            employees,
            filtered
        )

    );


    updateViewButtons();

}


// =================================
// UPDATE TOGGLE BUTTONS
// =================================

function updateViewButtons() {

    if (
        resultsButton
    ) {

        resultsButton.classList.toggle(
            "active",
            currentView === "results"
        );

    }


    if (
        summaryButton
    ) {

        summaryButton.classList.toggle(
            "active",
            currentView === "stats"
        );

    }

}


// =================================
// DATE SELECTOR
// =================================

if (
    dateContainer
) {

    dateContainer.appendChild(

        renderDateSelector(
            resultsSession,
            () => {

                if (
                    currentView === "stats"
                ) {

                    renderStatsPage();

                }
                else {

                    renderResults();

                }

            }
        )

    );

}


// =================================
// RESULTS / STATS TOGGLE
// =================================

if (
    resultsButton
) {

    resultsButton.onclick =
        () => {

            renderResults();

        };

}


if (
    summaryButton
) {

    summaryButton.onclick =
        () => {

            renderStatsPage();

        };

}


// =================================
// EXPORT CSV
// =================================

if (
    exportCSVButton
) {

    exportCSVButton.onclick =
        () => {

            exportTipDistributionCSV(

                resultsSession
                    .filtered_distribution

            );

        };

}


// =================================
// SAVE JSON
// =================================

if (
    saveButton
) {

    saveButton.onclick =
        () => {

            saveTipDistributionJSON(
                tipDistribution
            );

        };

}


// =================================
// IMPORT JSON HISTORY
// =================================

if (
    loadButton
) {

    loadButton.onclick =
        () => {

            historyInput.click();

        };

}


if (
    historyInput
) {

    historyInput.onchange =
        async (event) => {

            const file =
                event.target.files[0];


            if (
                !file
            ) {

                return;

            }


            try {

                const imported =
                    await loadTipDistributionJSON(
                        file
                    );


                const existing =
                    JSON.parse(
                        sessionStorage.getItem(
                            "tipDistribution"
                        )
                    ) || [];


                const incoming =
                    imported.tipDistribution || [];


                const merged =
                    Array.from(

                        new Map(

                            [
                                ...existing,
                                ...incoming
                            ]

                            .map(
                                block => [

                                    block.id,

                                    block

                                ]
                            )

                        ).values()

                    );


                sessionStorage.setItem(

                    "tipDistribution",

                    JSON.stringify(
                        merged
                    )

                );


                alert(
                    `Imported ${incoming.length} meal blocks. Total history: ${merged.length}`
                );


                location.reload();

            }
            catch (
                error
            ) {

                console.error(
                    error
                );


                alert(
                    "Invalid HotTips JSON history file"
                );

            }

        };

}


// =================================
// PRINT
// =================================

if (
    printButton
) {

    printButton.onclick =
        () => {

            window.print();

        };

}


// =================================
// PAYROLL SUMMARY
// =================================

document
    .getElementById(
        "payrollSummaryButton"
    )
    ?.addEventListener(
        "click",
        () => {

            const employees =
                compileResults(
                    resultsSession
                        .filtered_distribution
                );


            exportPayrollSummaryCSV(
                employees
            );

        }
    );


// =================================
// BACK BUTTON
// =================================

const backButton =
    document.getElementById(
        "backButton"
    );


if (
    backButton
) {

    backButton.onclick =
        () => {

            window.location.href =
                "../distribution/distribution.html";

        };

}


// =================================
// START
// =================================

renderResults();


// =================================
// DEBUG
// =================================

window.RESULTS_SESSION =
    resultsSession;


window.TIP_DISTRIBUTION =
    tipDistribution;


window.RENDER_RESULTS =
    renderResults;


window.RENDER_STATS =
    renderStatsPage;


console.log(
    "TIP DISTRIBUTION",
    tipDistribution
);