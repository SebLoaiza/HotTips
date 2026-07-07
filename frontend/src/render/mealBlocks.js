export function renderMealBlocks(mealBlocks, updateFunction) {

    const output = document.getElementById("output");

    output.innerHTML = "";


    let currentDate = "";


    for (const block of mealBlocks) {


        if (block.date !== currentDate) {

            currentDate = block.date;


            const title = document.createElement("h2");

            title.textContent = block.date;

            output.appendChild(title);

        }



        const container = document.createElement("div");

        container.className = "meal-block";


        const id = `${block.day_key}-${block.meal}`;


        container.innerHTML = `

            <h3>${block.meal}</h3>


            <label>
                Start:
                <input 
                    class="time-input"
                    data-id="${id}"
                    data-field="start"
                    value="${minutesToTime(block.start)}"
                >
            </label>


            <label>
                End:
                <input 
                    class="time-input"
                    data-id="${id}"
                    data-field="end"
                    value="${minutesToTime(block.end)}"
                >
            </label>

        `;



        const inputs = container.querySelectorAll(".time-input");


        inputs.forEach(input => {

            input.addEventListener("change", () => {


                updateFunction(
                    input.dataset.id,
                    input.dataset.field,
                    input.value
                );


            });

        });



        output.appendChild(container);

    }

}


function minutesToTime(minutes) {

    minutes = minutes % 1440;

    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;

    let suffix = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    return `${hours}:${String(mins).padStart(2,"0")} ${suffix}`;
}