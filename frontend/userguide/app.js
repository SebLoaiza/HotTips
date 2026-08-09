const searchInput =
    document.getElementById("guideSearch");

const sections =
    [
        ...document.querySelectorAll(".guide-section")
    ];

const navLinks =
    [
        ...document.querySelectorAll("#guideNav a")
    ];

const sidebar =
    document.querySelector(".sidebar");


/* =========================
   Guide Search
========================= */

searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();

        sections.forEach(
            section => {

                const matches =
                    section.textContent
                        .toLowerCase()
                        .includes(query);

                section.classList.toggle(
                    "hidden",
                    query && !matches
                );

            }
        );

        if (query) {

            sidebar.classList.add(
                "open"
            );

        }

    }
);


/* =========================
   Navigation
========================= */

navLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                sidebar.classList.remove(
                    "open"
                );

            }
        );

    }
);


/* =========================
   Highlight Current Section
========================= */

const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if (!entry.isIntersecting) {

                        return;

                    }

                    navLinks.forEach(
                        link => {

                            link.classList.toggle(
                                "active",
                                link.getAttribute(
                                    "href"
                                ) ===
                                `#${entry.target.id}`
                            );

                        }
                    );

                }
            );

        },
        {
            rootMargin:
                "-100px 0px -60% 0px",

            threshold: 0
        }
    );


sections.forEach(
    section => {

        observer.observe(
            section
        );

    }
);
