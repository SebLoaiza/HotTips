const newProcessButton =
    document.getElementById("newProcessButton");

const historyButton =
    document.getElementById("historyButton");

const userGuideButton =
    document.getElementById("userGuideButton");


newProcessButton.onclick = () => {
    window.location.href = "./start/start.html";
};


historyButton.onclick = () => {
    window.location.href = "./results/results.html";
};


userGuideButton.onclick = () => {
    window.location.href = "./UserGuide.pdf";
};