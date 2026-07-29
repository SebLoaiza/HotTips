export class MealParticipation {

    constructor(row) {

        this.employee_id = row["Employee Guid"];
        this.name = row["Employee"];

        this.role = row["Job"];

        // Assigned later by the role mapping screen
        this.standard_role = this.role;

        this.date = row["Date"];


        // Shift times
        this.meal_start = timeToMinutes(row["Time In"]);
        this.meal_end = timeToMinutes(row["Time Out"]);

        if (this.meal_end <= this.meal_start) {
            this.meal_end += 1440;
        }


        this.worked_minutes = 0;
        this.lost_minutes = 0;

        this.breaks = [];


        // Orders
        this.orders = [];


        // Sales
        this.order_sales = 0;

        this.card_sales = 0;
        this.card_tips = 0;

        this.cash_sales = 0;
        this.cash_drop = 0;
        this.cash_available = 0;

    }


    addBreak(row) {

        if (!row["Break Start"]) {
            return;
        }


        let start = timeToMinutes(row["Break Start"]);
        let end = timeToMinutes(row["Break End"]);

        if (end <= start) {
            end += 1440;
        }


        this.breaks.push([start, end]);

    }

}



export function createMealParticipations(rows) {

    const participations = [];

    let currentParticipation = null;


    for (const row of rows) {

        // Start a new employee shift
        if (row["Employee"]) {

            currentParticipation = new MealParticipation(row);

            participations.push(currentParticipation);

        }


        // Add any break rows
        if (
            currentParticipation &&
            row["Break Start"]
        ) {

            currentParticipation.addBreak(row);

        }

    }


    return participations;

}



function timeToMinutes(time) {

    if (!time) {
        return 0;
    }


    const [clock, modifier] = time.trim().split(" ");

    let [hours, minutes] =
        clock.split(":").map(Number);


    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }


    return hours * 60 + minutes;

}