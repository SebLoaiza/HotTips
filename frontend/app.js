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



if (userGuideButton) {
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
