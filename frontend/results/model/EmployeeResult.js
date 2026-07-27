export class EmployeeResult {


    constructor(employee) {


        this.employee_id =
            employee.employee_id;


        this.name =
            employee.name;



        // =====================
        // ORIGINAL MONEY GENERATED
        // =====================
        //
        // What this employee
        // originally brought in
        // before tip distribution.
        //

        this.original_cash_tips = 0;

        this.original_card_tips = 0;

        this.original_tips = 0;



        // =====================
        // DISTRIBUTED MONEY
        // =====================
        //
        // Final money after pools
        // and distributions.
        //

        this.cash_kept = 0;

        this.card_kept = 0;


        this.pool_cash = 0;

        this.pool_card = 0;



        this.cash_payout = 0;

        this.card_payout = 0;

        this.total_payout = 0;



        // =====================
        // SALES / PERFORMANCE
        // =====================

        this.sales = 0;

        this.order_count = 0;



        // =====================
        // TRAINING
        // =====================
        //
        // Kept separate from
        // original and distributed
        // values.
        //

        this.training_cash_received = 0;

        this.training_card_received = 0;


        this.tips_sent_to_trainers = [];

        this.tips_sent_to_trainers_history = [];

        this.total_sent_to_trainers = 0;



        // =====================
        // WORK ANALYTICS
        // =====================

        this.worked_minutes = 0;

        this.hours = 0;



        // =====================
        // CALCULATED STATS
        // =====================

        this.tip_percentage = 0;

        this.avg_sales_per_hour = 0;

        this.avg_orders_per_hour = 0;

        this.avg_tip_per_order = 0;


    }


}