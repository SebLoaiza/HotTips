export function formatMoney(cents) {

    return (
        Number(cents ?? 0) / 100
    )
    .toLocaleString(
        "en-US",
        {
            style: "currency",
            currency: "USD"
        }
    );

}



export function formatHours(minutes) {

    return (
        Number(minutes ?? 0) / 60
    )
    .toFixed(2);

}



export function formatNumber(value) {

    return Number(value ?? 0)
        .toFixed(2);

}