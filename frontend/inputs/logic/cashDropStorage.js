/* =================================================
   CASH DROP STORAGE
================================================= */

/*
    Temporary storage format:

    {
        hotTipsCashDropsVersion: 1,
        savedAt: "...",
        cashDrops: [
            {
                user: "...",
                cash: 100,
                day: "2026-08-10",
                meal: "Dinner"
            }
        ]
    }
*/


/* =================================================
   COLLECT CASH DROPS
================================================= */

export function collectCashDrops(
    mealBlocks
) {

    const cashDrops = [];


    for (
        const block
        of mealBlocks
    ) {

        const day =
            block.day_key ||
            block.date ||
            "";

        const meal =
            block.meal ||
            "";


        for (
            const employee
            of block.employees || []
        ) {

            /*
                We need the employee's
                cash-drop value.

                Different parts of the app
                may use slightly different
                property names, so check
                the expected cash-drop field.
            */

            const cash =
                Number(
                    employee.cash_drop ?? 0
                );


            /*
                Only save actual cash drops.

                Employees with no cash drop
                do not need to be stored.
            */

            if (
                Number.isNaN(cash) ||
                cash === 0
            ) {

                continue;

            }


            cashDrops.push({

                user:
                    employee.name || "",

                cash:
                    cash,

                day:
                    day,

                meal:
                    meal

            });

        }

    }


    return cashDrops;

}


/* =================================================
   CREATE CASH DROP FILE
================================================= */

export function createCashDropFile(
    mealBlocks
) {

    const data = {

        hotTipsCashDropsVersion:
            1,

        savedAt:
            new Date().toISOString(),

        cashDrops:
            collectCashDrops(
                mealBlocks
            )

    };


    return data;

}


/* =================================================
   EXPORT CASH DROPS
================================================= */

export function exportCashDrops(
    mealBlocks
) {

    const data =
        createCashDropFile(
            mealBlocks
        );


    const json =
        JSON.stringify(
            data,
            null,
            4
        );


    const blob =
        new Blob(
            [
                json
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    const now =
        new Date();


    const date =
        `${String(
            now.getMonth() + 1
        ).padStart(2, "0")}-` +

        `${String(
            now.getDate()
        ).padStart(2, "0")}-` +

        `${now.getFullYear()}`;


    link.href =
        url;


    link.download =
        `HotTips Cash Drops - ${date}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =================================================
   VALIDATE CASH DROP FILE
================================================= */

function validateCashDropFile(
    data
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        throw new Error(
            "Invalid cash drop file."
        );

    }


    if (
        !Array.isArray(
            data.cashDrops
        )
    ) {

        throw new Error(
            "Invalid cash drop file."
        );

    }


    for (
        const cashDrop
        of data.cashDrops
    ) {

        if (
            !cashDrop ||
            typeof cashDrop !== "object"
        ) {

            throw new Error(
                "Invalid cash drop entry."
            );

        }


        if (
            cashDrop.user === undefined ||
            cashDrop.day === undefined ||
            cashDrop.meal === undefined ||
            cashDrop.cash === undefined
        ) {

            throw new Error(
                "A cash drop entry is missing required information."
            );

        }

    }


    return true;

}


/* =================================================
   READ CASH DROP FILE
================================================= */

export function readCashDropFile(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    try {

                        const data =
                            JSON.parse(
                                reader.result
                            );


                        validateCashDropFile(
                            data
                        );


                        resolve(
                            data
                        );

                    }
                    catch (error) {

                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                () => {

                    reject(
                        reader.error
                    );

                };


            reader.readAsText(
                file
            );

        }
    );

}


/* =================================================
   APPLY CASH DROPS
================================================= */

export function applyCashDrops(
    data,
    mealBlocks
) {

    validateCashDropFile(
        data
    );


    for (
        const savedDrop
        of data.cashDrops
    ) {

        const savedUser =
            String(
                savedDrop.user
            ).trim()
            .toLowerCase();


        const savedDay =
            String(
                savedDrop.day
            ).trim();


        const savedMeal =
            String(
                savedDrop.meal
            ).trim()
            .toLowerCase();


        const cash =
            Number(
                savedDrop.cash
            );


        /*
            Find the matching meal block.
        */

        for (
            const block
            of mealBlocks
        ) {

            const blockDay =
                String(
                    block.day_key ||
                    block.date ||
                    ""
                ).trim();


            const blockMeal =
                String(
                    block.meal ||
                    ""
                ).trim()
                .toLowerCase();


            if (
                blockDay !==
                savedDay
            ) {

                continue;

            }


            if (
                blockMeal !==
                savedMeal
            ) {

                continue;

            }


            /*
                Find the employee
                inside this meal block.
            */

            for (
                const employee
                of block.employees || []
            ) {

                const employeeName =
                    String(
                        employee.name ||
                        ""
                    ).trim()
                    .toLowerCase();


                if (
                    employeeName !==
                    savedUser
                ) {

                    continue;

                }


                /*
                    Put the saved cash drop
                    back onto the employee.
                */

                employee.cash_drop =
                    Number.isNaN(
                        cash
                    )
                        ? 0
                        : cash;

            }

        }

    }


    return mealBlocks;

}


/* =================================================
   IMPORT CASH DROPS
================================================= */

export async function importCashDrops(
    file,
    mealBlocks
) {

    const data =
        await readCashDropFile(
            file
        );


    applyCashDrops(
        data,
        mealBlocks
    );


    return data;

}