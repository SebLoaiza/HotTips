export class History {


    constructor(
        tipDistribution
    ) {


        this.version = 1;


        this.created_at =
            new Date()
            .toISOString();



        this.start_date =
            this.getStartDate(
                tipDistribution
            );



        this.end_date =
            this.getEndDate(
                tipDistribution
            );



        this.tipDistribution =
            tipDistribution;


    }



    getStartDate(
        distributions
    ) {


        if (
            distributions.length === 0
        ) {
            return null;
        }


        return distributions[0].date;

    }



    getEndDate(
        distributions
    ) {


        if (
            distributions.length === 0
        ) {
            return null;
        }


        return distributions[
            distributions.length - 1
        ].date;

    }


}