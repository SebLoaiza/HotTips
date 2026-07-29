import { renderMealBlock }
from "./renderMealBlock.js";


import { renderTabs }
from "./renderTabs.js";



let selectedDate = null;



export function renderDistribution(
    tipDistribution,
    refreshUI
) {


    const output =
        document.getElementById(
            "distributionTables"
        );


    if (!output) {
        console.error(
            "Missing distributionTables"
        );

        return;
    }




    // =========================
    // FIND ALL DAYS
    // =========================

    const dates =
        [
            ...new Set(
                tipDistribution.map(
                    block =>
                        block.date
                )
            )
        ];



    console.log(
        "DATES FOUND",
        dates
    );



    if (!selectedDate && dates.length > 0) {

        selectedDate =
            dates[0];

    }




    // =========================
    // RENDER TABS
    // =========================

    renderTabs(
        dates,
        selectedDate,
        (date)=>{


            selectedDate =
                date;


            renderDistribution(
                tipDistribution,
                refreshUI
            );


        }
    );






    // =========================
    // FILTER CURRENT DAY
    // =========================

    const currentBlocks =
        tipDistribution.filter(
            block =>
                block.date === selectedDate
        );



    console.log(
        "CURRENT DAY BLOCKS",
        currentBlocks
    );




    output.innerHTML = "";



    for (const block of currentBlocks) {


        output.appendChild(

            renderMealBlock(
                block,
                refreshUI
            )

        );

    }


}