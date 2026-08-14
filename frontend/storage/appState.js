// ============================================================
// HOT TIPS - SHARED APPLICATION STORAGE
// ============================================================
//
// Every page MUST use this same database.
//
// Database:
//     HotTipsDB
//
// Object store:
//     appState
//
// Keys:
//     mealBlocks
//     mealParticipations
//     orders
//     payments
//     tipDistribution
//
// IndexedDB is used instead of sessionStorage because the
// imported CSV data can become much larger than the
// sessionStorage quota.
// ============================================================

const DB_NAME = "HotTipsDB";

// IMPORTANT:
// Keep this version the same across every page.
//
// If you ever need to change the database schema, increase
// this number ONCE here.
const DB_VERSION = 1;

const STORE_NAME = "appState";


// ============================================================
// OPEN DATABASE
// ============================================================

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            // ------------------------------------------------
            // FIRST CREATION
            // ------------------------------------------------

            request.onupgradeneeded =
                (event) => {

                    const db =
                        event.target.result;


                    // Create the store if it doesn't exist.

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


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            request.onsuccess =
                () => {

                    const db =
                        request.result;


                    // Handle another tab/page attempting
                    // to upgrade the database.

                    db.onversionchange =
                        () => {

                            db.close();

                        };


                    resolve(db);

                };


            // ------------------------------------------------
            // ERROR
            // ------------------------------------------------

            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };


            // ------------------------------------------------
            // BLOCKED
            // ------------------------------------------------

            request.onblocked =
                () => {

                    console.warn(
                        "HotTips IndexedDB open is blocked. " +
                        "Another page may still have the database open."
                    );

                };

        }
    );

}


// ============================================================
// SAVE ONE VALUE
// ============================================================

export async function saveState(
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


            store.put(
                value,
                key
            );


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

        }
    );

}


// ============================================================
// LOAD ONE VALUE
// ============================================================

export async function loadState(
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

                    const value =
                        request.result;


                    db.close();

                    resolve(
                        value
                    );

                };


            request.onerror =
                () => {

                    db.close();

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ============================================================
// SAVE ALL APPLICATION STATE
// ============================================================

export async function saveAllState(
    state
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


            // -----------------------------------------------
            // Only save values that were actually supplied.
            // -----------------------------------------------

            if (
                state.mealBlocks !== undefined
            ) {

                store.put(
                    state.mealBlocks,
                    "mealBlocks"
                );

            }


            if (
                state.mealParticipations !== undefined
            ) {

                store.put(
                    state.mealParticipations,
                    "mealParticipations"
                );

            }


            if (
                state.orders !== undefined
            ) {

                store.put(
                    state.orders,
                    "orders"
                );

            }


            if (
                state.payments !== undefined
            ) {

                store.put(
                    state.payments,
                    "payments"
                );

            }


            if (
                state.tipDistribution !== undefined
            ) {

                store.put(
                    state.tipDistribution,
                    "tipDistribution"
                );

            }


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

        }
    );

}


// ============================================================
// LOAD ALL APPLICATION STATE
// ============================================================

export async function loadAllState() {

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


            const result = {};


            const keys = [
                "mealBlocks",
                "mealParticipations",
                "orders",
                "payments",
                "tipDistribution"
            ];


            let completed = 0;


            for (
                const key
                of keys
            ) {

                const request =
                    store.get(
                        key
                    );


                request.onsuccess =
                    () => {

                        result[key] =
                            request.result;


                        completed++;


                        if (
                            completed ===
                            keys.length
                        ) {

                            db.close();

                            resolve(
                                result
                            );

                        }

                    };


                request.onerror =
                    () => {

                        db.close();

                        reject(
                            request.error
                        );

                    };

            }

        }
    );

}


// ============================================================
// CLEAR APPLICATION
// ============================================================

export async function clearAllState() {

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


            store.clear();


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

        }
    );

}