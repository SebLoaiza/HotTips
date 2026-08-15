import {
    HotTipsStorage
} from "../storage/storage.js";


import {
    ResultsSession
} from "./model/resultsSession.js";


import {
    compileResults
} from "./logic/compileResults.js";


import {
    renderResultsTable
} from "./render/renderResultsTable.js";


import {
    renderStats
} from "./render/renderStats.js";


import {
    renderAnalytics
} from "./render/renderAnalytics.js";


import {
    renderEmployeeDetails
} from "./render/renderEmployeeDetails.js";


import {
    renderDateSelector
} from "./render/renderDateSelector.js";


import {
    renderPrintSummary
} from "./render/renderPrintSummary.js";


import {
    exportTipDistributionCSV
} from "./logic/exportTipDistributionCSV.js";


import {
    saveTipDistributionJSON
} from "./logic/saveTipDistributionJSON.js";


import {
    loadTipDistributionJSON
} from "./logic/loadTipDistributionJSON.js";


import {
    renderSpecialOrders
} from "./render/renderSpecialOrders.js";


import {
    exportPayrollSummaryCSV
} from "./logic/exportPayrollSummaryCSV.js";


// =================================
// STATE
// =================================

let tipDistribution = [];

let resultsSession = null;


// =================================
// LOAD CURRENT HISTORY
// =================================

async function loadTipDistribution() {

    try {

        const savedTipDistribution =
            await HotTipsStorage.getItem(
                "tipDistribution"
            );


        tipDistribution =
            Array.isArray(
                savedTipDistribution
            )
                ? savedTipDistribution
                : [];


        console.log(
            "=============================="
        );


        console.log(
            "TIP DISTRIBUTION LOADED"
        );


        console.log(
            "=============================="
        );


        console.log(
            tipDistribution
        );


        console.log(
            "RAW TIP DISTRIBUTION JSON:"
        );


        console.log(
            JSON.stringify(
                tipDistribution,
                null,
                2
            )
        );


    }
    catch (error) {

        console.error(
            "Error loading tip distribution:",
            error
        );


        tipDistribution = [];

    }


    if (
        tipDistribution.length === 0
    ) {

        alert(
            "No tip distribution data found."
        );


        window.location.href =
            "../start/start.html";


        return false;

    }


    return true;

}


// =================================
// CREATE RESULTS SESSION
// =================================

function createResultsSession() {

    resultsSession =
        new ResultsSession(
            tipDistribution
        );

}


// =================================
// DOM
// =================================

const resultsContainer =
    document.getElementById(
        "resultsContainer"
    );


const statsContainer =
    document.getElementById(
        "statsContainer"
    );


const analyticsContainer =
    document.getElementById(
        "analyticsContainer"
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


const analyticsButton =
    document.getElementById(
        "analyticsButton"
    );


const resultsView =
    document.getElementById(
        "resultsView"
    );


const statsView =
    document.getElementById(
        "statsView"
    );


const analyticsView =
    document.getElementById(
        "analyticsView"
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
// SHOW RESULTS VIEW
// =================================

function showResultsView() {

    if (
        resultsView
    ) {

        resultsView.style.display =
            "";

    }


    if (
        statsView
    ) {

        statsView.style.display =
            "none";

    }


    if (
        analyticsView
    ) {

        analyticsView.style.display =
            "none";

    }

}


// =================================
// SHOW STATS VIEW
// =================================

function showStatsView() {

    if (
        resultsView
    ) {

        resultsView.style.display =
            "none";

    }


    if (
        statsView
    ) {

        statsView.style.display =
            "";

    }


    if (
        analyticsView
    ) {

        analyticsView.style.display =
            "none";

    }

}


// =================================
// SHOW ANALYTICS VIEW
// =================================

function showAnalyticsView() {

    if (
        resultsView
    ) {

        resultsView.style.display =
            "none";

    }


    if (
        statsView
    ) {

        statsView.style.display =
            "none";

    }


    if (
        analyticsView
    ) {

        analyticsView.style.display =
            "";

    }

}


// =================================
// RENDER RESULTS VIEW
// =================================

function renderResults() {

    if (!resultsSession) {
        return;
    }


    currentView = "results";


    showResultsView();


    if (
        resultsContainer
    ) {

        resultsContainer.innerHTML =
            "";

    }


    if (
        statsContainer
    ) {

        statsContainer.innerHTML =
            "";

    }


    if (
        analyticsContainer
    ) {

        analyticsContainer.innerHTML =
            "";

    }


    if (
        printContainer
    ) {

        printContainer.innerHTML =
            "";

    }


    const filtered =
        resultsSession.filtered_distribution;


    const employees =
        compileResults(
            filtered
        );


    // =================================
    // EMPLOYEE RESULTS TABLE
    // =================================

    if (
        resultsContainer
    ) {

        resultsContainer.appendChild(

            renderResultsTable(
                employees,
                openEmployee
            )

        );


        // =================================
        // SPECIAL ORDERS
        // =================================

        resultsContainer.appendChild(

            renderSpecialOrders(
                filtered
            )

        );

    }


    // =================================
    // PRINT SUMMARY
    // =================================

    if (
        printContainer
    ) {

        printContainer.appendChild(

            renderPrintSummary(
                employees,
                filtered
            )

        );

    }


    updateViewButtons();

}


// =================================
// RENDER STATS VIEW
// =================================

function renderStatsPage() {

    if (!resultsSession) {
        return;
    }


    currentView = "stats";


    showStatsView();


    if (
        resultsContainer
    ) {

        resultsContainer.innerHTML =
            "";

    }


    if (
        printContainer
    ) {

        printContainer.innerHTML =
            "";

    }


    if (
        statsContainer
    ) {

        statsContainer.innerHTML =
            "";


        const filtered =
            resultsSession.filtered_distribution;


        const employees =
            compileResults(
                filtered
            );


        statsContainer.appendChild(

            renderStats(
                employees,
                filtered
            )

        );

    }


    if (
        analyticsContainer
    ) {

        analyticsContainer.innerHTML =
            "";

    }


    updateViewButtons();

}


// =================================
// RENDER ANALYTICS VIEW
// =================================

function renderAnalyticsPage() {

    if (!resultsSession) {
        return;
    }


    currentView = "analytics";


    showAnalyticsView();


    if (
        resultsContainer
    ) {

        resultsContainer.innerHTML =
            "";

    }


    if (
        printContainer
    ) {

        printContainer.innerHTML =
            "";

    }


    if (
        statsContainer
    ) {

        statsContainer.innerHTML =
            "";

    }


    if (
        analyticsContainer
    ) {

        analyticsContainer.innerHTML =
            "";


        const filtered =
            resultsSession.filtered_distribution;


        const employees =
            compileResults(
                filtered
            );


        analyticsContainer.appendChild(

            renderAnalytics(
                employees,
                filtered
            )

        );

    }


    updateViewButtons();

}


// =================================
// UPDATE VIEW BUTTONS
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


    if (
        analyticsButton
    ) {

        analyticsButton.classList.toggle(
            "active",
            currentView === "analytics"
        );

    }

}


// =================================
// DATE SELECTOR
// =================================

function initializeDateSelector() {

    if (
        !dateContainer ||
        !resultsSession
    ) {

        return;

    }


    dateContainer.innerHTML =
        "";


    dateContainer.appendChild(

        renderDateSelector(
            resultsSession,
            () => {

                if (
                    currentView === "stats"
                ) {

                    renderStatsPage();

                }
                else if (
                    currentView === "analytics"
                ) {

                    renderAnalyticsPage();

                }
                else {

                    renderResults();

                }

            }
        )

    );

}


// =================================
// RESULTS BUTTON
// =================================

if (
    resultsButton
) {

    resultsButton.onclick =
        () => {

            renderResults();

        };

}


// =================================
// STATS BUTTON
// =================================

if (
    summaryButton
) {

    summaryButton.onclick =
        () => {

            renderStatsPage();

        };

}


// =================================
// ANALYTICS BUTTON
// =================================

if (
    analyticsButton
) {

    analyticsButton.onclick =
        () => {

            renderAnalyticsPage();

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

            if (!resultsSession) {
                return;
            }


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

            if (
                historyInput
            ) {

                historyInput.click();

            }

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
                    await HotTipsStorage.getItem(
                        "tipDistribution"
                    );


                const existingDistribution =
                    Array.isArray(
                        existing
                    )
                        ? existing
                        : [];


                const incoming =
                    imported.tipDistribution || [];


                // =================================
                // FIND CONFLICTS
                // =================================

                const existingKeys =
                    new Set(
                        existingDistribution.map(
                            block =>
                                `${block.date}|${block.meal}`
                        )
                    );


                const conflicts =
                    incoming.filter(
                        block =>
                            existingKeys.has(
                                `${block.date}|${block.meal}`
                            )
                    );


                // =================================
                // NO CONFLICTS
                // =================================

                if (
                    conflicts.length === 0
                ) {

                    const merged = [
                        ...existingDistribution,
                        ...incoming
                    ];


                    await HotTipsStorage.setItem(
                        "tipDistribution",
                        merged
                    );


                    alert(
                        `Imported ${incoming.length} meal blocks. Total history: ${merged.length}`
                    );


                    location.reload();


                    return;

                }


                // =================================
                // BUILD CONFLICT MESSAGE
                // =================================

                const conflictText =
                    conflicts
                        .map(
                            block =>
                                `${block.date} — ${block.meal}`
                        )
                        .join(
                            "\n"
                        );


                const useNew =
                    confirm(

                        `Some meal blocks already exist:\n\n` +

                        conflictText +

                        `\n\n` +

                        `OK = Replace the existing blocks with the new ones\n` +

                        `Cancel = Keep the existing blocks`

                    );


                // =================================
                // KEEP EXISTING
                // =================================

                if (
                    !useNew
                ) {

                    const conflictKeys =
                        new Set(
                            conflicts.map(
                                block =>
                                    `${block.date}|${block.meal}`
                            )
                        );


                    const newOnly =
                        incoming.filter(
                            block =>
                                !conflictKeys.has(
                                    `${block.date}|${block.meal}`
                                )
                        );


                    const merged = [
                        ...existingDistribution,
                        ...newOnly
                    ];


                    await HotTipsStorage.setItem(
                        "tipDistribution",
                        merged
                    );


                    alert(

                        `Import complete.\n\n` +

                        `Kept existing overlapping meal blocks.\n` +

                        `Added ${newOnly.length} new meal blocks.`

                    );


                    location.reload();


                    return;

                }


                // =================================
                // USE NEW
                // =================================

                const conflictKeys =
                    new Set(
                        conflicts.map(
                            block =>
                                `${block.date}|${block.meal}`
                        )
                    );


                const existingWithoutConflicts =
                    existingDistribution.filter(
                        block =>
                            !conflictKeys.has(
                                `${block.date}|${block.meal}`
                            )
                    );


                const merged = [
                    ...existingWithoutConflicts,
                    ...incoming
                ];


                await HotTipsStorage.setItem(
                    "tipDistribution",
                    merged
                );


                alert(

                    `Import complete.\n\n` +

                    `Replaced ${conflicts.length} overlapping meal blocks.\n` +

                    `Added ${incoming.length - conflicts.length} new meal blocks.`

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

            if (!resultsSession) {
                return;
            }


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
// INITIALIZE
// =================================

(async () => {

    /*
        IMPORTANT:

        IndexedDB is asynchronous.

        We MUST wait for the saved
        tipDistribution before creating
        ResultsSession.
    */

    const hasData =
        await loadTipDistribution();


    if (!hasData) {

        return;

    }


    // ---------------------------------------------
    // Create results session
    // ---------------------------------------------

    createResultsSession();


    // ---------------------------------------------
    // Create date selector
    // ---------------------------------------------

    initializeDateSelector();


    // ---------------------------------------------
    // Initial render
    // ---------------------------------------------

    renderResults();


    // ---------------------------------------------
    // DEBUG
    // ---------------------------------------------

    window.RESULTS_SESSION =
        resultsSession;


    window.TIP_DISTRIBUTION =
        tipDistribution;


    window.RENDER_RESULTS =
        renderResults;


    window.RENDER_STATS =
        renderStatsPage;


    window.RENDER_ANALYTICS =
        renderAnalyticsPage;


    console.log(
        "TIP DISTRIBUTION",
        tipDistribution
    );

})();