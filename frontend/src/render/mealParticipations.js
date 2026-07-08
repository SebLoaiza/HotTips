export function renderMealParticipations(participations) {

    const output = document.getElementById("participations");

    output.innerHTML = "";


    for (const participation of participations) {

        const card = document.createElement("div");

        card.className = "participation-card";


        const breaks = participation.breaks.length
            ? participation.breaks
                .map(b => `${minutesToTime(b[0])} - ${minutesToTime(b[1])}`)
                .join("<br>")
            : "None";


        card.innerHTML = `

            <h3>${participation.name}</h3>

            <p><b>Role:</b> ${participation.role}</p>

            <p><b>Date:</b> ${participation.date}</p>

            <p><b>Shift:</b>
                ${minutesToTime(participation.meal_start)}
                -
                ${minutesToTime(participation.meal_end)}
            </p>

            <p><b>Breaks:</b><br>${breaks}</p>

        `;

        output.appendChild(card);

    }

}



function minutesToTime(minutes) {

    let mins = minutes % 1440;

    if (mins < 0) {
        mins += 1440;
    }

    let hours = Math.floor(mins / 60);
    const minutesPart = mins % 60;

    const suffix = hours >= 12 ? "PM" : "AM";

    if (hours === 0) {
        hours = 12;
    }
    else if (hours > 12) {
        hours -= 12;
    }

    return `${hours}:${String(minutesPart).padStart(2, "0")} ${suffix}`;

}