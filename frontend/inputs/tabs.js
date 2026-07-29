const tabButtons =
    document.querySelectorAll(".tab-button");


const tabPages =
    document.querySelectorAll(".tab-page");



tabButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const target =
                button.dataset.tab;



            tabButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });



            tabPages.forEach(page => {

                page.classList.remove(
                    "active"
                );

            });



            button.classList.add(
                "active"
            );



            document
                .getElementById(target)
                .classList.add(
                    "active"
                );

        }
    );

});