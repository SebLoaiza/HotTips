function minutesToTime(minutes) {

    minutes = minutes % (24 * 60);

    let hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const suffix = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function timeToMinutes(time) {

    const [clock, suffix] = time.trim().split(" ");

    let [hour, minute] = clock.split(":").map(Number);

    if (hour === 12) hour = 0;
    if (suffix.toUpperCase() === "PM") hour += 12;

    return hour * 60 + minute;
}

function isValidTime(time) {
    return /^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM)$/i.test(time.trim());
}