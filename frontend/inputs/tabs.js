const steps =
document.querySelectorAll(".step");


const pages =
document.querySelectorAll(".tab-page");


let current = 0;



function showPage(index)
{

    current = index;


    steps.forEach(
        step =>
        step.classList.remove("active")
    );


    pages.forEach(
        page =>
        page.classList.remove("active")
    );



    steps[index]
        .classList
        .add("active");



    document
    .getElementById(
        steps[index].dataset.tab
    )
    .classList
    .add("active");


}




steps.forEach(
(step,index)=>{


    step.onclick = ()=>{

        showPage(index);

    };


});



document
.getElementById("continueButton")
.onclick = ()=>{


    if(current < steps.length-1)
    {

        showPage(
            current+1
        );

    }

};



document
.getElementById("backButton")
.onclick = ()=>{


    if(current > 0)
    {

        showPage(
            current-1
        );

    }


};