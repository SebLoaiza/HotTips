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


