export class EmployeeResult {


    constructor(employee) {


        this.employee_id =
            employee.employee_id;


        this.name =
            employee.name;


        // Money

        this.cash_kept = 0;

        this.card_kept = 0;


        this.pool_cash = 0;

        this.pool_card = 0;


        this.cash_payout = 0;

        this.card_payout = 0;

        this.total_payout = 0;



        // Training

        this.training_cash_received = 0;
        this.training_card_received = 0;

        this.tips_sent_to_trainers = [];


        // Analytics

        this.order_count = 0;

        this.sales = 0;

        this.worked_minutes = 0;


    }


}