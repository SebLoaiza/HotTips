const newProcessButton =
    document.getElementById("newProcessButton");

const historyButton =
    document.getElementById("historyButton");


newProcessButton.onclick = () => {
    window.location.href = "./start/start.html";
};


historyButton.onclick = () => {
    window.location.href = "./results/results.html";
};


const shiftCsv = document.getElementById("shiftCsv");
const orderCsv = document.getElementById("orderCsv");
const paymentCsv = document.getElementById("paymentCsv");


const shiftCard = document.getElementById("shiftCard");
const orderCard = document.getElementById("orderCard");
const paymentCard = document.getElementById("paymentCard");

const continueStep = document.getElementById("continueStep");


function updateUploadStatus(input, card){

    if(input.files.length > 0){

        card.classList.add("process-complete");

    } else {

        card.classList.remove("process-complete");

    }


    checkAllUploads();

}



function checkAllUploads(){

    const complete =
        shiftCsv.files.length > 0 &&
        orderCsv.files.length > 0 &&
        paymentCsv.files.length > 0;


    if(complete){

        continueStep.classList.add("continue-complete");

    } else {

        continueStep.classList.remove("continue-complete");

    }

}



shiftCsv.onchange = () => {

    updateUploadStatus(
        shiftCsv,
        shiftCard
    );

};


orderCsv.onchange = () => {

    updateUploadStatus(
        orderCsv,
        orderCard
    );

};


paymentCsv.onchange = () => {

    updateUploadStatus(
        paymentCsv,
        paymentCard
    );

};

