export class Payment {

    constructor(row) {

        this.payment_id =
            row["Payment Id"];

        this.order_id =
            row["Order Id"];

        this.order_number =
            row["Order #"];

        this.server =
            row["Server"] || "";

        this.type =
            row["Type"] || "";

        this.amount =
            dollarsToCents(row["Amount"]);

        this.amount_tendered =
            dollarsToCents(row["Amount Tendered"]);

        this.tip =
            dollarsToCents(row["Tip"]);

        this.gratuity =
            dollarsToCents(row["Gratuity"]);


        this.payments = [];

        this.status =
            row["Status"] || "";

    }

}



export function createPayments(rows) {

    console.log("Payment rows:", rows.length);

    if (rows.length > 0) {

        console.log("Headers:");
        console.log(Object.keys(rows[0]));

    }


    const payments = [];

    const seen = new Set();


    for (const row of rows) {


        const payment = new Payment(row);



        // Never store VOIDED payments
        if (
            payment.status.trim().toUpperCase() === "VOIDED" ||
            payment.status.trim().toUpperCase() === "DENIED"

        ) {

            console.log(
                "Ignoring VOIDED or DENIED payment:",
                payment.payment_id
            );

            continue;

        }



        if (seen.has(payment.payment_id)) {

            console.warn(
                "Duplicate Payment Id:",
                payment.payment_id
            );

        }


        seen.add(payment.payment_id);

        payments.push(payment);

    }


    console.table(payments);

    return payments;

}



function dollarsToCents(value) {

    value = Number(value) || 0;

    return Math.round(value * 100);

}