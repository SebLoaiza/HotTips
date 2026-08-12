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

    // =========================
    // GET AVAILABLE DAYS
    // =========================

    const days =
        [
            ...resultsSession.getAvailableDays()
        ];

    // =========================
    // SORT CHRONOLOGICALLY
    // =========================

    days.sort(
        (a, b) => {

            const dateA =
                new Date(a);

            const dateB =
                new Date(b);

            return dateA - dateB;

        }
    );

    // =========================
    // BUILD HTML
    // =========================

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
    // BUILD OPTIONS
    // =========================

    start.innerHTML = "";

    end.innerHTML = "";

    for (
        const day of days
    ) {

        const startOption =
            document.createElement(
                "option"
            );

        startOption.value =
            day;

        startOption.textContent =
            day;

        start.appendChild(
            startOption
        );


        const endOption =
            document.createElement(
                "option"
            );

        endOption.value =
            day;

        endOption.textContent =
            day;

        end.appendChild(
            endOption
        );

    }

    // =========================
    // EXISTING DATE RANGE
    // =========================
    //
    // Preserve the range that
    // was already selected.
    //

    const currentRange =
        resultsSession.getDateRanges();

    const currentStart =
        currentRange?.start;

    const currentEnd =
        currentRange?.end;

    // =========================
    // FULL AVAILABLE RANGE
    // =========================

    const firstDay =
        days.length > 0
            ? days[0]
            : null;

    const lastDay =
        days.length > 0
            ? days[days.length - 1]
            : null;

    // =========================
    // START DATE
    // =========================
    //
    // If the imported history
    // contains an earlier date,
    // use that earlier date.
    //

    if (
        currentStart &&
        firstDay
    ) {

        const currentStartTime =
            new Date(
                currentStart
            ).getTime();

        const firstDayTime =
            new Date(
                firstDay
            ).getTime();

        start.value =
            currentStartTime < firstDayTime
                ? currentStart
                : firstDay;

    }

    else if (
        firstDay
    ) {

        start.value =
            firstDay;

    }

    // =========================
    // END DATE
    // =========================
    //
    // Preserve the existing
    // end date when it is still
    // available.
    //
    // Otherwise use the latest
    // available date.
    //

    if (
        currentEnd &&
        days.includes(
            currentEnd
        )
    ) {

        end.value =
            currentEnd;

    }

    else if (
        lastDay
    ) {

        end.value =
            lastDay;

    }

    // =========================
    // APPLY BUTTON
    // =========================

    div.querySelector(
        "#applyDates"
    )
    .onclick =
        () => {

            const startDate =
                start.value;

            const endDate =
                end.value;

            if (
                !startDate ||
                !endDate
            ) {

                return;

            }

            const startTime =
                new Date(
                    startDate
                ).getTime();

            const endTime =
                new Date(
                    endDate
                ).getTime();

            if (
                startTime > endTime
            ) {

                return;

            }

            resultsSession.filterByDates(
                startDate,
                endDate
            );

            renderResults();

        };

    return div;

}