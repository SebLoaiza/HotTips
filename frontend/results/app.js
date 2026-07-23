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



const tipDistribution =
    JSON.parse(
        sessionStorage.getItem(
            "tipDistribution"
        )
    ) || [];



const employees =
    compileResults(
        tipDistribution
    );



const resultsContainer =
    document.getElementById(
        "resultsContainer"
    );


const detailsContainer =
    document.getElementById(
        "employeeDetails"
    );


function openEmployee(
    row,
    employee
) {


    // already open -> close it

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



    // create details row

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


    detailsCell.colSpan = 4;



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


resultsContainer.appendChild(

    renderResultsTable(
        employees,
        openEmployee
    )

);