export function renderTabs(
    dates,
    selectedDate,
    onChange
){


    const container =
        document.getElementById(
            "dayTabs"
        );


    if (!container) {
        return;
    }



    container.innerHTML = "";



    for (const date of dates) {


        const button =
            document.createElement(
                "button"
            );


        button.textContent =
            date;



        if(date === selectedDate){

            button.classList.add(
                "active"
            );

        }



        button.onclick =
            ()=>{

                onChange(date);

            };



        container.appendChild(
            button
        );


    }

}