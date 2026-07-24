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



    const employees =
        compileResults(
            resultsSession.filtered_distribution
        );



    console.log(
        "COMPILED EMPLOYEES",
        employees
    );



    resultsContainer.appendChild(

        renderResultsTable(
            employees,
            openEmployee
        )

    );


}



// =========================
// INITIAL RENDER
// =========================
dateContainer.appendChild(

    renderDateSelector(
        resultsSession,
        renderResults
    )

);

renderResults();



// =========================
// GLOBAL ACCESS
// =========================
//
// Used from console and
// future date filter UI
//

window.RESULTS_SESSION =
    resultsSession;


window.RENDER_RESULTS =
    renderResults;


window.TIP_DISTRIBUTION =
    tipDistribution;