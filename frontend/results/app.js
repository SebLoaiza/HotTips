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



// =========================
// LOAD TIP DISTRIBUTION
// =========================

const tipDistribution =
    JSON.parse(
        sessionStorage.getItem(
            "tipDistribution"
        )
    ) || [];



console.log(
    "TIP DISTRIBUTION LOADED",
    tipDistribution
);



// =========================
// CREATE RESULTS SESSION
// =========================

const resultsSession =
    new ResultsSession(
        tipDistribution
    );



console.log(
    "AVAILABLE DAYS",
    resultsSession.getAvailableDays()
);


console.log(
    "DATE RANGES",
    resultsSession.getDateRanges()
);



// =========================
// DOM
// =========================

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


const exportButton =
    document.getElementById(
        "exportButton"
    );



// =========================
// OPEN EMPLOYEE DETAILS
// =========================

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



    const detailsCell =
        document.createElement(
            "td"
        );



    detailsCell.colSpan =
        10;



    detailsCell.appendChild(
        renderEmployeeDetails(
            employee
        )
    );



    detailsRow.appendChild(
        detailsCell
    );



    row.after(
        detailsRow
    );

}



// =========================
// RENDER RESULTS
// =========================

function renderResults() {


    console.log(
        "FILTERED BLOCKS",
        resultsSession.filtered_distribution
    );



    resultsContainer.innerHTML =
        "";


    printContainer.innerHTML =
        "";



    const employees =
        compileResults(
            resultsSession.filtered_distribution
        );



    console.log(
        "COMPILED EMPLOYEES",
        employees
    );



    // Employee table

    resultsContainer.appendChild(

        renderResultsTable(
            employees,
            openEmployee
        )

    );



    // Printable sheet

    printContainer.appendChild(

        renderPrintSummary(
            employees
        )

    );


}



// =========================
// DATE SELECTOR
// =========================

dateContainer.appendChild(

    renderDateSelector(
        resultsSession,
        renderResults
    )

);



// =========================
// BUTTONS
// =========================

if (
    printButton
) {

    printButton.onclick = () => {

        window.print();

    };

}



if (
    exportButton
) {

    exportButton.onclick = () => {


        exportTipDistributionCSV(
            tipDistribution
        );


    };

}



// =========================
// INITIAL LOAD
// =========================

renderResults();



// =========================
// GLOBAL DEBUG ACCESS
// =========================

window.RESULTS_SESSION =
    resultsSession;


window.RENDER_RESULTS =
    renderResults;


window.TIP_DISTRIBUTION =
    tipDistribution;