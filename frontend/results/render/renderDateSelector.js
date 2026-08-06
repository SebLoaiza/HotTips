export function renderDateSelector(
    resultsSession,
    renderResults
) {


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "dateSelector";



    const days =
        resultsSession.getAvailableDays();



    div.innerHTML = `


        <div class="date-header">

            <h3>
                View Dates
            </h3>

        </div>



        <div class="date-controls">


            <label>

                Start:

                <select id="startDate">

                </select>

            </label>



            <label>

                End:

                <select id="endDate">

                </select>

            </label>



            <button id="applyDates">

                Apply

            </button>


        </div>


    `;



    const start =
        div.querySelector(
            "#startDate"
        );


    const end =
        div.querySelector(
            "#endDate"
        );




    // =========================
    // BUILD DATE OPTIONS
    // =========================


    for (
        const day of days
    ) {


        start.innerHTML += `

            <option value="${day}">
                ${day}
            </option>

        `;



        end.innerHTML += `

            <option value="${day}">
                ${day}
            </option>

        `;


    }





    // =========================
    // DEFAULT FULL RANGE
    // =========================


    const fullWeek =
        resultsSession
            .getDateRanges()
            .full_week;



    start.value =
        fullWeek.start;


    end.value =
        fullWeek.end;






    // =========================
    // APPLY BUTTON
    // =========================


    div.querySelector(
        "#applyDates"
    )
    .onclick = () => {


        resultsSession.filterByDates(
            start.value,
            end.value
        );


        renderResults();


    };




    return div;

}