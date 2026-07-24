export class ResultsSession {


    constructor(
        tipDistribution
    ) {


        // Full uploaded period
        this.all_distribution =
            tipDistribution;



        // What the user is currently viewing
        this.filtered_distribution =
            tipDistribution;


    }




    // =========================
    // AVAILABLE DAYS
    // =========================
    //
    // Returns unique dates from
    // the uploaded meal blocks.
    //

    getAvailableDays() {


        return [
            ...new Set(

                this.all_distribution.map(
                    block =>
                        block.date
                )

            )

        ];

    }





    // =========================
    // COMMON DATE RANGES
    // =========================
    //
    // Future UI can use these
    // for quick buttons.
    //

    getDateRanges() {


        const days =
            this.getAvailableDays();



        return {


            full_week: {

                start:
                    days[0],

                end:
                    days[
                        days.length - 1
                    ]

            },



            first_three_days: {

                start:
                    days[0],

                end:
                    days[2]

            }


        };


    }





    // =========================
    // FILTER BY DATE RANGE
    // =========================
    //
    // Updates the current view.
    //
    // Example:
    //
    // filterByDates(
    //     "May 22, 2026",
    //     "May 24, 2026"
    // )
    //
    // will show only those days.
    //

    filterByDates(
        start,
        end
    ) {


        const startDate =
            new Date(
                start
            );


        const endDate =
            new Date(
                end
            );



        this.filtered_distribution =

            this.all_distribution.filter(
                block => {


                    const blockDate =
                        new Date(
                            block.date
                        );



                    return (

                        blockDate >= startDate

                        &&

                        blockDate <= endDate

                    );


                }

            );


    }





    // =========================
    // RESET VIEW
    // =========================
    //
    // Return to the full upload.
    //

    resetFilter() {


        this.filtered_distribution =
            this.all_distribution;


    }


}