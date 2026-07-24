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

        <h3>
            View Dates
        </h3>


        <button data-range="all">
            Full Week
        </button>


        <button data-range="first3">
            First 3 Days
        </button>


        <hr>


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

    `;



    const start =
        div.querySelector(
            "#startDate"
        );


    const end =
        div.querySelector(
            "#endDate"
        );



    for (
        const day of days
    ) {


        start.innerHTML += `

            <option>
                ${day}
            </option>

        `;


        end.innerHTML += `

            <option>
                ${day}
            </option>

        `;


    }



    div.querySelector(
        "[data-range='all']"
    )
    .onclick = () => {


        resultsSession.resetFilter();


        renderResults();


    };



    div.querySelector(
        "[data-range='first3']"
    )
    .onclick = () => {


        const range =
            resultsSession.getDateRanges()
                .first_three_days;



        resultsSession.filterByDates(
            range.start,
            range.end
        );


        renderResults();


    };



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