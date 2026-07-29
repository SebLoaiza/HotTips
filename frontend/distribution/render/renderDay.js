import { renderMealBlock }
from "./renderMealBlock.js";


export function renderDay(
    day,
    output,
    refreshUI
) {


    output.innerHTML = "";


    for (const meal of day.meals) {


        output.appendChild(

            renderMealBlock(
                meal,
                refreshUI
            )

        );


    }


}