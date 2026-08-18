import {
    HotTipsStorage
}
from "./storage/storage.js";


const newProcessButton =
    document.getElementById("newProcessButton");

const historyButton =
    document.getElementById("historyButton");

const userGuideButton =
    document.getElementById("userGuideButton");


// =========================================================
// START NEW PROCESS
// =========================================================

newProcessButton.onclick =
    async () => {

        try {

            // =================================================
            // CLEAR INDEXEDDB
            // =================================================

            await HotTipsStorage.clear();


            console.log(
                "HotTips database cleared for new process."
            );


            // =================================================
            // CLEAR MEMORY STATE
            // =================================================

            window.LAST_BLOCKS = [];

            window.ALL_ORDERS = [];

            window.currentMealBlocks = [];

            window.currentMealParticipations = [];

            window.currentOrders = [];

            window.currentPayments = [];


            // =================================================
            // CLEAR PROCESS FLAGS
            // =================================================

            window.shiftUploaded = false;

            window.orderUploaded = false;

            window.paymentUploaded = false;


            // =================================================
            // GO TO START
            // =================================================

            window.location.href =
                "./start/start.html";

        }
        catch (error) {

            console.error(
                "Failed to clear HotTips database:",
                error
            );


            alert(
                "Could not clear the previous process. Please try again."
            );

        }

    };


// =========================================================
// HISTORY
// =========================================================

historyButton.onclick =
    () => {

        window.location.href =
            "./results/results.html";

    };


// =========================================================
// USER GUIDE
// =========================================================

if (
    userGuideButton
) {

    userGuideButton.onclick =
        () => {

            const link =
                document.createElement(
                    "a"
                );


            link.href =
                "./HotTips-User-Manual.pdf";


            link.download =
                "HotTips-User-Manual.pdf";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();

        };

}