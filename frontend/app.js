// =================================================
// HOT TIPS HOME PAGE
// =================================================


// =================================================
// INDEXED DB
// =================================================

const DB_NAME =
    "HotTipsDB";

const STORE_NAME =
    "state";


// =================================================
// OPEN INDEXED DB
// =================================================

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME
                );


            // -----------------------------------------
            // DATABASE CREATED FOR THE FIRST TIME
            // -----------------------------------------

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


            // -----------------------------------------
            // DATABASE OPENED
            // -----------------------------------------

            request.onsuccess =
                () => {

                    const db =
                        request.result;


                    /*
                        Normally the state store already
                        exists.

                        This check protects against a
                        partially-created database.
                    */

                    if (
                        db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        resolve(db);

                        return;

                    }


                    /*
                        The database exists but the store
                        does not.

                        Close it and upgrade to the next
                        version.
                    */

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


            // -----------------------------------------
            // ERROR
            // -----------------------------------------

            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };


            // -----------------------------------------
            // VERSION BLOCKED
            // -----------------------------------------

            request.onblocked =
                () => {

                    reject(
                        new Error(
                            "HotTips database is blocked by another open page."
                        )
                    );

                };

        }
    );

}


// =================================================
// CLEAR ALL APPLICATION STATE
// =================================================

async function clearApplicationState() {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            let transaction;


            try {

                transaction =
                    db.transaction(
                        STORE_NAME,
                        "readwrite"
                    );

            }

            catch (error) {

                db.close();

                reject(error);

                return;

            }


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.clear();


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };


            transaction.oncomplete =
                () => {

                    db.close();

                    resolve();

                };


            transaction.onerror =
                () => {

                    db.close();

                    reject(
                        transaction.error
                    );

                };


            transaction.onabort =
                () => {

                    db.close();

                    reject(
                        transaction.error ||
                        new Error(
                            "IndexedDB reset transaction aborted."
                        )
                    );

                };

        }
    );

}


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
// NEW PROCESS
// =================================================

if (newProcessButton) {

    newProcessButton.onclick =
        async () => {

            try {

                /*
                    Completely clear the existing
                    HotTips process before starting
                    a new one.

                    This removes everything stored
                    in the "state" object store,
                    including:

                    - mealBlocks
                    - mealParticipations
                    - orders
                    - payments
                    - tipDistribution
                    - any other saved state
                */

                await clearApplicationState();


                /*
                    Only navigate to the Start page
                    after the database has been
                    successfully cleared.
                */

                window.location.href =
                    "./start/start.html";

            }

            catch (error) {

                console.error(
                    "Could not reset application state:",
                    error
                );


                alert(
                    "Could not completely reset the current process.\n\n" +
                    "Please try again."
                );

            }

        };

}


// =================================================
// HISTORY BUTTON
// =================================================

if (historyButton) {

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

if (userGuideButton) {

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