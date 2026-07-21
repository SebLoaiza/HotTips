export class MealParticipation {

    constructor(row) {

        this.employee_id = row["Employee Guid"];

        this.name = row["Employee"];

        this.role = row["Job"];
        // Will be assigned by the role mapping UI later.
        // Until then, default to the Toast role.
        this.standard_role = this.role;


        this.date = row["Date"];


        // Shift
        this.meal_start = timeToMinutes(row["Time In"]);
        this.meal_end = timeToMinutes(row["Time Out"]);

        if (this.meal_end <= this.meal_start) {
            this.meal_end += 1440;
        }

        this.worked_minutes = 0;
        this.lost_minutes = 0;

        this.breaks = [];

        // Orders assigned to this employee
        this.orders = [];

        // ======================
        // Calculated Values
        // ======================

        // Total of all order amounts
        this.order_sales = 0;

        // Card
        this.card_sales = 0;
        this.card_tips = 0;

        // Cash
        this.cash_sales = 0;
        this.cash_drop = 0;          // User enters this
        this.cash_available = 0;     // cash_drop - cash_sales

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

        // New employee shift
        if (row["Employee"]) {

            currentParticipation = new MealParticipation(row);

            participations.push(currentParticipation);

        }

        // Any row (including the employee row) can contain a break.
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

    let [hours, minutes] = clock
        .split(":")
        .map(Number);

    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;

}