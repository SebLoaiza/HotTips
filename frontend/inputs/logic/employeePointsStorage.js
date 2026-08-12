// =========================================================
// EMPLOYEE POINTS STORAGE
// =========================================================


/* =========================================================
   EXPORT EMPLOYEE POINTS
========================================================= */

export function exportEmployeePoints(
    mealBlocks
) {

    const employees = new Map();


    // =====================================================
    // COLLECT EMPLOYEES
    // =====================================================

    for (
        const block of mealBlocks
    ) {

        for (
            const employee of block.employees
        ) {

            const employeeId =
                employee.employee_id;


            const role =
                employee.distribution_role ||
                employee.role ||
                "Other";


            /*
                Employee ID + role is the key.

                This is important because the same
                employee can have multiple roles.
            */

            const key =
                `${employeeId}__${role}`;


            if (
                !employees.has(key)
            ) {

                employees.set(
                    key,
                    {
                        employee_id:
                            employeeId,

                        name:
                            employee.name || "",

                        role:
                            role,

                        tip_points:
                            Number(
                                employee.tip_points ?? 1
                            )
                    }
                );

            }

        }

    }


    // =====================================================
    // BUILD JSON
    // =====================================================

    const data = {

        type:
            "HotTips Employee Tip Points",

        version:
            1,

        exported_at:
            new Date().toISOString(),

        employees:
            Array.from(
                employees.values()
            )

    };


    // =====================================================
    // CREATE FILE
    // =====================================================

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
        `HotTips Employee Points - ${date}.json`;


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


/* =========================================================
   LOAD EMPLOYEE POINTS
========================================================= */

export function loadEmployeePoints(
    file,
    mealBlocks
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


                        // =================================
                        // VALIDATE FILE
                        // =================================

                        if (
                            !data ||
                            data.type !==
                                "HotTips Employee Tip Points"
                        ) {

                            throw new Error(
                                "Invalid HotTips Employee Points file."
                            );

                        }


                        if (
                            !Array.isArray(
                                data.employees
                            )
                        ) {

                            throw new Error(
                                "Employee points data is missing."
                            );

                        }


                        // =================================
                        // BUILD LOOKUP
                        // =================================

                        const savedPoints =
                            new Map();


                        for (
                            const employee
                            of data.employees
                        ) {

                            if (
                                employee.employee_id ==
                                    null
                            ) {

                                continue;

                            }


                            const role =
                                employee.role ||
                                "Other";


                            const key =
                                `${employee.employee_id}__${role}`;


                            const points =
                                Number(
                                    employee.tip_points
                                );


                            if (
                                Number.isNaN(
                                    points
                                )
                            ) {

                                continue;

                            }


                            savedPoints.set(
                                key,
                                points
                            );

                        }


                        // =================================
                        // APPLY POINTS
                        // =================================

                        let updatedCount =
                            0;


                        for (
                            const block
                            of mealBlocks
                        ) {

                            for (
                                const employee
                                of block.employees
                            ) {

                                const employeeId =
                                    employee.employee_id;


                                const role =
                                    employee.distribution_role ||
                                    employee.role ||
                                    "Other";


                                const key =
                                    `${employeeId}__${role}`;


                                if (
                                    savedPoints.has(
                                        key
                                    )
                                ) {

                                    employee.tip_points =
                                        savedPoints.get(
                                            key
                                        );

                                    updatedCount++;

                                }

                            }

                        }


                        // =================================
                        // RESULT
                        // =================================

                        resolve(
                            {
                                updatedCount,

                                savedCount:
                                    savedPoints.size
                            }
                        );

                    }
                    catch (
                        error
                    ) {

                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                () => {

                    reject(
                        reader.error ||
                        new Error(
                            "Unable to read employee points file."
                        )
                    );

                };


            reader.readAsText(
                file
            );

        }
    );

}