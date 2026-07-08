export function renderAssignedMeals(mealBlocks) {

    const output = document.getElementById("assignedMeals");

    output.innerHTML = "";


    for (const block of mealBlocks) {

        const container = document.createElement("div");

        container.className = "meal-block-card";


        let employeesHTML = "";


        if (block.employees.length === 0) {

            employeesHTML = "<p>No employees assigned</p>";

        } 
        else {

            for (const employee of block.employees) {

                employeesHTML += `

                    <div class="employee-card">

                        <b>${employee.name}</b>

                        <br>

                        ${employee.role}

                        <br>

                        Shift:
                        ${minutesToTime(employee.meal_start)}
                        -
                        ${minutesToTime(employee.meal_end)}

                        <br>

                        Worked:
                        ${employee.worked_minutes} minutes

                        <br><br>

                        Breaks:
                        <br>

                        ${renderBreaks(employee.breaks)}

                    </div>

                `;

            }

        }


        container.innerHTML = `

            <h2>
                ${block.date}
                -
                ${block.meal}
            </h2>


            <p>
                Meal Window:
                ${minutesToTime(block.start)}
                -
                ${minutesToTime(block.end)}
            </p>


            <hr>


            ${employeesHTML}

        `;


        output.appendChild(container);

    }

}



function minutesToTime(minutes) {


    let value = minutes % 1440;


    if (value < 0) {
        value += 1440;
    }


    let hours = Math.floor(value / 60);

    const mins = value % 60;


    const suffix = hours >= 12 ? "PM" : "AM";


    if (hours === 0) {
        hours = 12;
    }
    else if (hours > 12) {
        hours -= 12;
    }


    return `${hours}:${String(mins).padStart(2,"0")} ${suffix}`;

}

function renderBreaks(breaks) {

    if (!breaks || breaks.length === 0) {
        return "None";
    }


    return breaks
        .map(
            b =>
            `${minutesToTime(b[0])} - ${minutesToTime(b[1])}`
        )
        .join("<br>");

}