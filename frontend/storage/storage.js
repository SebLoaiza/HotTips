// ============================================================
// HotTips Storage
// IndexedDB-backed localStorage-style storage
// ============================================================

const DATABASE_NAME =
    "HotTipsDatabase";

const DATABASE_VERSION =
    1;

const STORE_NAME =
    "storage";


// ============================================================
// OPEN DATABASE
// ============================================================

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DATABASE_NAME,
                    DATABASE_VERSION
                );


            // ---------------------------------------------
            // Create the object store the first time
            // ---------------------------------------------

            request.onupgradeneeded =
                (event) => {

                    const database =
                        event.target.result;


                    if (
                        !database.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        database.createObjectStore(
                            STORE_NAME
                        );

                    }

                };


            // ---------------------------------------------
            // Database opened successfully
            // ---------------------------------------------

            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                };


            // ---------------------------------------------
            // Database failed
            // ---------------------------------------------

            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ============================================================
// STORAGE
// ============================================================

export const HotTipsStorage = {


    // ========================================================
    // SET ITEM
    // ========================================================

    async setItem(
        key,
        value
    ) {

        const database =
            await openDatabase();


        return new Promise(
            (resolve, reject) => {

                const transaction =
                    database.transaction(
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

                        database.close();

                        resolve();

                    };


                transaction.onerror =
                    () => {

                        database.close();

                        reject(
                            transaction.error
                        );

                    };


                transaction.onabort =
                    () => {

                        database.close();

                        reject(
                            transaction.error ||
                            new Error(
                                "IndexedDB transaction aborted."
                            )
                        );

                    };

            }
        );

    },


    // ========================================================
    // GET ITEM
    // ========================================================

    async getItem(
        key
    ) {

        const database =
            await openDatabase();


        return new Promise(
            (resolve, reject) => {

                const transaction =
                    database.transaction(
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

                        /*
                            IndexedDB returns undefined
                            when the key does not exist.

                            localStorage returns null.

                            So we convert undefined
                            to null here.
                        */

                        resolve(
                            request.result === undefined
                                ? null
                                : request.result
                        );

                    };


                request.onerror =
                    () => {

                        reject(
                            request.error
                        );

                    };


                transaction.oncomplete =
                    () => {

                        database.close();

                    };


                transaction.onerror =
                    () => {

                        database.close();

                        reject(
                            transaction.error
                        );

                    };

            }
        );

    },


    // ========================================================
    // REMOVE ITEM
    // ========================================================

    async removeItem(
        key
    ) {

        const database =
            await openDatabase();


        return new Promise(
            (resolve, reject) => {

                const transaction =
                    database.transaction(
                        STORE_NAME,
                        "readwrite"
                    );


                const store =
                    transaction.objectStore(
                        STORE_NAME
                    );


                store.delete(
                    key
                );


                transaction.oncomplete =
                    () => {

                        database.close();

                        resolve();

                    };


                transaction.onerror =
                    () => {

                        database.close();

                        reject(
                            transaction.error
                        );

                    };

            }
        );

    },


    // ========================================================
    // CLEAR
    // ========================================================

    async clear() {

        const database =
            await openDatabase();


        return new Promise(
            (resolve, reject) => {

                const transaction =
                    database.transaction(
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

                        database.close();

                        resolve();

                    };


                transaction.onerror =
                    () => {

                        database.close();

                        reject(
                            transaction.error
                        );

                    };

            }
        );

    },


    // ========================================================
    // GET ALL KEYS
    // ========================================================

    async keys() {

        const database =
            await openDatabase();


        return new Promise(
            (resolve, reject) => {

                const transaction =
                    database.transaction(
                        STORE_NAME,
                        "readonly"
                    );


                const store =
                    transaction.objectStore(
                        STORE_NAME
                    );


                const request =
                    store.getAllKeys();


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


                transaction.oncomplete =
                    () => {

                        database.close();

                    };


                transaction.onerror =
                    () => {

                        database.close();

                        reject(
                            transaction.error
                        );

                    };

            }
        );

    },


    // ========================================================
    // GET KEY BY INDEX
    // ========================================================

    async key(
        index
    ) {

        const keys =
            await this.keys();


        return (
            keys[index] ??
            null
        );

    }

};