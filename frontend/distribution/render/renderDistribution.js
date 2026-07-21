import { renderMealBlock }
from "./renderMealBlock.js";



export function renderDistribution(
    tipDistribution,
    refreshUI
) {


    const output =
        document.getElementById(
            "distributionTables"
        );


    if (!output) {
        return;
    }



    output.innerHTML = "";



    for (const block of tipDistribution) {


        const section =
            renderMealBlock(
                block,
                refreshUI
            );


        output.appendChild(
            section
        );


    }


}