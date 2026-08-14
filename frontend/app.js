// =================================================
// HOT TIPS HOME PAGE
// =================================================


// =================================================
// DOM ELEMENTS
// =================================================

const newProcessButton =
    document.getElementById(
        "newProcessButton"
    );


const historyButton =
    document.getElementById(
        "historyButton"
    );


const userGuideButton =
    document.getElementById(
        "userGuideButton"
    );


// =================================================
// FIRST APP STARTUP RESET
// =================================================
//
// This runs ONLY the first time HotTips is opened.
//
// It completely removes the HotTips IndexedDB
// database so the application starts clean.
//
// After the reset is complete, a localStorage
// flag is saved so future launches keep the
// user's existing data.
//

const FIRST_START_KEY =
    "HotTips_First_Startup_Complete";


const DB_NAME =
    "HotTipsDB";


// =================================================
// RESET DATABASE
// =================================================

function resetDatabase() {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            console.log(
                "Deleting HotTips database..."
            );


            const request =
                indexedDB.deleteDatabase(
                    DB_NAME
                );


            request.onsuccess =
                () => {

                    console.log(
                        "HotTips database deleted successfully."
                    );


                    resolve();

                };


            request.onerror =
                () => {

                    console.error(
                        "Could not delete HotTips database:",
                        request.error
                    );


                    reject(
                        request.error
                    );

                };


            request.onblocked =
                () => {

                    console.warn(
                        "HotTips database deletion is blocked."
                    );

                };

        }
    );

}


// =================================================
// FIRST STARTUP INITIALIZATION
// =================================================

async function initializeApp() {

    const alreadyInitialized =
        localStorage.getItem(
            FIRST_START_KEY
        );


    // =================================================
    // NORMAL STARTUP
    // =================================================

    if (
        alreadyInitialized ===
        "true"
    ) {

        console.log(
            "HotTips already initialized."
        );


        console.log(
            "Existing application data will be preserved."
        );


        return;

    }


    // =================================================
    // FIRST STARTUP
    // =================================================

    console.log(
        "================================"
    );


    console.log(
        "HOT TIPS FIRST STARTUP"
    );


    console.log(
        "================================"
    );


    console.log(
        "No previous HotTips initialization found."
    );


    console.log(
        "Resetting application data..."
    );


    try {

        await resetDatabase();


        // =================================================
        // MARK INITIALIZATION COMPLETE
        // =================================================

        localStorage.setItem(
            FIRST_START_KEY,
            "true"
        );


        console.log(
            "================================"
        );


        console.log(
            "HOT TIPS INITIALIZATION COMPLETE"
        );


        console.log(
            "================================"
        );

    }

    catch (
        error
    ) {

        console.error(
            "HotTips first-startup initialization failed:",
            error
        );


        throw error;

    }

}


// =================================================
// NEW PROCESS BUTTON
// =================================================

if (
    newProcessButton
) {

    newProcessButton.onclick =
        () => {

            console.log(
                "Starting new HotTips process..."
            );


            window.location.href =
                "./start/start.html";

        };

}


// =================================================
// HISTORY BUTTON
// =================================================

if (
    historyButton
) {

    historyButton.onclick =
        () => {

            console.log(
                "Opening HotTips history..."
            );


            window.location.href =
                "./results/results.html";

        };

}


// =================================================
// USER GUIDE BUTTON
// =================================================

if (
    userGuideButton
) {

    userGuideButton.onclick =
        () => {

            console.log(
                "Opening HotTips User Guide..."
            );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                "./HotTips-User-Guide.pdf";


            link.download =
                "HotTips-User-Guide.pdf";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();

        };

}


// =================================================
// START APPLICATION
// =================================================

initializeApp()
    .catch(
        error => {

            console.error(
                "================================"
            );


            console.error(
                "HOT TIPS STARTUP ERROR"
            );


            console.error(
                error
            );


            console.error(
                "================================"
            );


            alert(
                "HotTips could not initialize correctly."
            );

        }
    );