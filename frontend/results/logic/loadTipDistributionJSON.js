export function loadTipDistributionJSON(
    file
) {

    return new Promise(
        (resolve, reject) => {

            // =========================
            // VALIDATE FILE
            // =========================

            if (!file) {

                reject(
                    new Error(
                        "No history file selected"
                    )
                );

                return;

            }

            // =========================
            // CREATE READER
            // =========================

            const reader =
                new FileReader();

            // =========================
            // LOAD FILE
            // =========================

            reader.onload =
                () => {

                    try {

                        const history =
                            JSON.parse(
                                reader.result
                            );

                        // =========================
                        // VALIDATE HISTORY
                        // =========================

                        if (
                            !history ||
                            !Array.isArray(
                                history.tipDistribution
                            )
                        ) {

                            throw new Error(
                                "Invalid HotTips history file"
                            );

                        }

                        // =========================
                        // SUCCESS
                        // =========================

                        resolve(
                            history
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

            // =========================
            // FILE ERROR
            // =========================

            reader.onerror =
                () => {

                    reject(
                        reader.error ||
                        new Error(
                            "Unable to read history file"
                        )
                    );

                };

            // =========================
            // READ JSON
            // =========================

            reader.readAsText(
                file
            );

        }
    );

}