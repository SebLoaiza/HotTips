export class Order {

    constructor(row) {

        this.order_id = row["Order Id"];

        this.order_number = row["Order #"];


        // normalized time fields
        this.order_day = orderDay(row["Opened"]);

        this.order_time_min = orderTimeMinutes(row["Opened"]);

        this.order_timestamp = new Date(row["Opened"]);


        this.server = standardizeName(row["Server"]);

        this.service = row["Service"] || "";


        // money stored as cents
        this.amount = dollarsToCents(row["Amount"]);

        this.tip = dollarsToCents(row["Tip"]);

        this.gratuity = dollarsToCents(row["Gratuity"]);


        // Payments attached later
        this.payments = [];

        this.cash_payment = 0;

        this.card_payment = 0;

        this.other_payment = 0;


        this.source = row["Order Source"] || "";

    }

}


export function createOrders(rows) {

    const orders = [];

    for (const row of rows) {

        orders.push(
            new Order(row)
        );

    }

    return orders;

}



// ===================================
// Helpers
// ===================================

function orderDay(dateTime) {

    const date = new Date(dateTime);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1)
        .padStart(2, "0");

    const day = String(date.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function orderTimeMinutes(dateTime) {

    const date = new Date(dateTime);

    let mins = date.getHours() * 60 + date.getMinutes();

    // Overnight normalization
    if (mins < 120) {
        mins += 1440;
    }

    return mins;

}


function dollarsToCents(value) {

    value = Number(value) || 0;

    return Math.round(value * 100);

}


function standardizeName(name) {

    if (!name) {
        return "";
    }

    return name
        .trim()
        .toUpperCase();

}