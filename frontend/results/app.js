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


// =================================================
// INDEXED DB
// =================================================

const DB_NAME =
    "HotTipsDB";

const STORE_NAME =
    "state";


// =================================================
// OPEN DATABASE
// =================================================

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME
                );


            request.onupgradeneeded =
                () => {

                    const db =
                        request.result;


                    if (
                        !db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        db.createObjectStore(
                            STORE_NAME
                        );

                    }

                };


            request.onsuccess =
                () => {

                    const db =
                        request.result;


                    if (
                        db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        resolve(db);

                        return;

                    }


                    const currentVersion =
                        db.version;


                    db.close();


                    const upgradeRequest =
                        indexedDB.open(
                            DB_NAME,
                            currentVersion + 1
                        );


                    upgradeRequest.onupgradeneeded =
                        () => {

                            const upgradedDB =
                                upgradeRequest.result;


                            if (
                                !upgradedDB.objectStoreNames.contains(
                                    STORE_NAME
                                )
                            ) {

                                upgradedDB.createObjectStore(
                                    STORE_NAME
                                );

                            }

                        };


                    upgradeRequest.onsuccess =
                        () => {

                            resolve(
                                upgradeRequest.result
                            );

                        };


                    upgradeRequest.onerror =
                        () => {

                            reject(
                                upgradeRequest.error
                            );

                        };

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// =================================================
// LOAD STATE
// =================================================

async function loadState(
    key
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.get(
                    key
                );


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// =================================================
// SAVE STATE
// =================================================

async function saveState(
    key,
    value
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.put(
                    value,
                    key
                );


            request.onsuccess =
                () => {

                    resolve();

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// =================================================
// STATE
// =================================================

let tipDistribution =
    [];

let resultsSession =
    null;


// =================================================
// DOM
// =================================================

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


// =================================================
// CURRENT VIEW
// =================================================

let currentView =
    "results";


// =================================================
// EMPLOYEE DETAILS
// =================================================

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


    cell.colSpan =
        4;


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


// =================================================
// SHOW RESULTS VIEW
// =================================================

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


// =================================================
// SHOW STATS VIEW
// =================================================

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


// =================================================
// SHOW ANALYTICS VIEW
// =================================================

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


// =================================================
// RENDER RESULTS VIEW
// =================================================

function renderResults() {

    currentView =
        "results";


    showResultsView();


    resultsContainer.innerHTML =
        "";


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


    printContainer.innerHTML =
        "";


    const filtered =
        resultsSession
            .filtered_distribution;


    const employees =
        compileResults(
            filtered
        );


    resultsContainer.appendChild(

        renderResultsTable(
            employees,
            openEmployee
        )

    );


    resultsContainer.appendChild(

        renderSpecialOrders(
            filtered
        )

    );


    printContainer.appendChild(

        renderPrintSummary(
            employees,
            filtered
        )

    );


    updateViewButtons();

}


// =================================================
// RENDER STATS VIEW
// =================================================

function renderStatsPage() {

    currentView =
        "stats";


    showStatsView();


    resultsContainer.innerHTML =
        "";


    printContainer.innerHTML =
        "";


    if (
        statsContainer
    ) {

        statsContainer.innerHTML =
            "";


        const filtered =
            resultsSession
                .filtered_distribution;


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


// =================================================
// RENDER ANALYTICS VIEW
// =================================================

function renderAnalyticsPage() {

    currentView =
        "analytics";


    showAnalyticsView();


    resultsContainer.innerHTML =
        "";


    printContainer.innerHTML =
        "";


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
            resultsSession
                .filtered_distribution;


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


// =================================================
// UPDATE VIEW BUTTONS
// =================================================

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


// =================================================
// DATE SELECTOR
// =================================================

function setupDateSelector() {

    if (
        !dateContainer
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


// =================================================
// RESULTS BUTTON
// =================================================

if (
    resultsButton
) {

    resultsButton.onclick =
        () => {

            renderResults();

        };

}


// =================================================
// STATS BUTTON
// =================================================

if (
    summaryButton
) {

    summaryButton.onclick =
        () => {

            renderStatsPage();

        };

}


// =================================================
// ANALYTICS BUTTON
// =================================================

if (
    analyticsButton
) {

    analyticsButton.onclick =
        () => {

            renderAnalyticsPage();

        };

}


// =================================================
// EXPORT CSV
// =================================================

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


// =================================================
// SAVE JSON
// =================================================

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


// =================================================
// IMPORT JSON HISTORY
// =================================================

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
                    await loadState(
                        "tipDistribution"
                    ) || [];


                const incoming =
                    imported.tipDistribution ||
                    [];


                // =================================
                // FIND CONFLICTS
                // =================================

                const existingKeys =
                    new Set(
                        existing.map(
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
                        ...existing,
                        ...incoming
                    ];


                    await saveState(
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
                // CONFLICT MESSAGE
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
                        ...existing,
                        ...newOnly
                    ];


                    await saveState(
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
                    existing.filter(
                        block =>
                            !conflictKeys.has(
                                `${block.date}|${block.meal}`
                            )
                    );


                const merged = [
                    ...existingWithoutConflicts,
                    ...incoming
                ];


                await saveState(
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
                    "Could not import history:",
                    error
                );


                alert(
                    "Invalid HotTips JSON history file"
                );

            }

        };

}


// =================================================
// PRINT
// =================================================

if (
    printButton
) {

    printButton.onclick =
        () => {

            window.print();

        };

}


// =================================================
// PAYROLL SUMMARY
// =================================================

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


// =================================================
// BACK BUTTON
// =================================================

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


// =================================================
// LOAD RESULTS
// =================================================

async function start() {

    try {

        console.log(
            "================================"
        );


        console.log(
            "Loading Results from IndexedDB..."
        );


        console.log(
            "================================"
        );


        const savedDistribution =
            await loadState(
                "tipDistribution"
            );


        tipDistribution =
            Array.isArray(
                savedDistribution
            )
                ? savedDistribution
                : [];


        console.log(
            "TIP DISTRIBUTION LOADED"
        );


        console.log(
            tipDistribution
        );


        // =========================================
        // VALIDATION
        // =========================================

        if (
            tipDistribution.length === 0
        ) {

            alert(
                "No tip distribution data found."
            );


            window.location.href =
                "../distribution/distribution.html";


            return;

        }


        // =========================================
        // CREATE RESULTS SESSION
        // =========================================

        resultsSession =
            new ResultsSession(
                tipDistribution
            );


        // =========================================
        // DATE SELECTOR
        // =========================================

        setupDateSelector();


        // =========================================
        // INITIAL RENDER
        // =========================================

        renderResults();


        // =========================================
        // DEBUG GLOBALS
        // =========================================

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
            "Results page loaded successfully."
        );

    }

    catch (
        error
    ) {

        console.error(
            "Could not load Results data:",
            error
        );


        alert(
            "Could not load the saved application data."
        );

    }

}


// =================================================
// START
// =================================================

start();