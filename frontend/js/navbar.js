// =========================
// WORKFLOW NAVBAR
// =========================

window.APP_STATE = {
    shiftsUploaded: false,
    ordersUploaded: false,
    cashEdited: false,
    distributionReady: false,
    finalsComputed: false
};


// =========================
// STEPS
// =========================

const WORKFLOW_STEPS = [
    {
        key: "shiftsUploaded",
        label: "Upload Shifts"
    },
    {
        key: "ordersUploaded",
        label: "Upload Orders"
    },
    {
        key: "cashEdited",
        label: "Edit Cash Tips"
    },
    {
        key: "distributionReady",
        label: "Override Distribution"
    },
    {
        key: "finalsComputed",
        label: "Compute Finals"
    }
];


// =========================
// INIT
// =========================

function initWorkflowNavbar() {

    const bar = document.getElementById("workflowBar");

    if (!bar) {
        console.error("Missing workflowBar element");
        return;
    }

    renderWorkflowBar();
}



// =========================
// RENDER
// =========================

function renderWorkflowBar() {

    const bar = document.getElementById("workflowBar");

    if (!bar) return;

    bar.innerHTML = "";

    WORKFLOW_STEPS.forEach((step, index) => {

        const div = document.createElement("div");

        div.className = "workflow-step";

        const completed = window.APP_STATE[step.key];

        const previousDone =
            index === 0 ||
            window.APP_STATE[WORKFLOW_STEPS[index - 1].key];


        if (completed) {
            div.classList.add("complete");
        }
        else if (previousDone) {
            div.classList.add("active");
        }
        else {
            div.classList.add("locked");
        }


        div.innerHTML = `
            <span>${completed ? "✓" : index + 1}</span>
            ${step.label}
        `;


        div.onclick = () => {

            if (!previousDone || completed) {
                return;
            }

            handleWorkflowClick(step.key);
        };


        bar.appendChild(div);
    });
}



// =========================
// CLICK ACTIONS
// =========================

function handleWorkflowClick(step) {

    switch(step) {

        case "shiftsUploaded":

            document
                .getElementById("fileInput")
                ?.click();

            break;


        case "ordersUploaded":

            document
                .getElementById("orderFileInput")
                ?.click();

            break;


        case "cashEdited":

            document
                .getElementById("output")
                ?.scrollIntoView({
                    behavior:"smooth"
                });

            break;


        case "distributionReady":

            window.location.href = "distribution.html";

            break;


        case "finalsComputed":

            if (typeof goToDistribution === "function") {
                goToDistribution();
            }

            break;
    }
}



// =========================
// STATE UPDATES
// =========================
function refreshWorkflowUI() {

    renderWorkflowBar();

    document.getElementById("ordersStep").style.display =
        APP_STATE.shiftsUploaded ? "block" : "none";

    document.getElementById("continueStep").style.display =
        APP_STATE.ordersUploaded ? "block" : "none";
}



function setWorkflowStep(step, value = true) {

    window.APP_STATE[step] = value;

    renderWorkflowBar();
}


// shortcuts used by upload functions

function markShiftsUploaded() {
    APP_STATE.shiftsUploaded = true;
    refreshWorkflowUI();
}

function markOrdersUploaded() {
    APP_STATE.ordersUploaded = true;
    refreshWorkflowUI();



}
function markCashEdited() {
    setWorkflowStep("cashEdited");
}


function markDistributionReady() {
    setWorkflowStep("distributionReady");
}


function markFinalsComputed() {
    setWorkflowStep("finalsComputed");
}