export function formatTime(minutes) {

    if (minutes == null)
        return "-";

    let hour =
        Math.floor(minutes / 60);

    const minute =
        minutes % 60;

    const period =
        hour >= 12
            ? "PM"
            : "AM";

    if (hour > 12)
        hour -= 12;

    if (hour === 0)
        hour = 12;

    return `${hour}:${minute
        .toString()
        .padStart(2, "0")} ${period}`;

}

export function renderBreaks(breaks) {

    if (!breaks || breaks.length === 0)
        return "-";

    return breaks
        .map(
            b =>
                `${formatTime(b[0])} - ${formatTime(b[1])}`
        )
        .join("<br>");

}

export function formatMoney(cents) {

    cents = cents ?? 0;

    return `$${(cents / 100).toFixed(2)}`;

}