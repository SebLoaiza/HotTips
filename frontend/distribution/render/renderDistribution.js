import { renderMealBlock }
from "./renderMealBlock.js";

import { renderTabs }
from "./renderTabs.js";

let selectedDate = null;


// =================================================
// RENDER DISTRIBUTION
// =================================================

export function renderDistribution(
    tipDistribution,
    refreshUI
) {

    const output =
        document.getElementById(
            "distributionTables"
        );

    if (!output) {

        console.error(
            "Missing distributionTables"
        );

        return;

    }


    // =================================================
    // ATTACH KEYBOARD NAVIGATION ONCE
    // =================================================

    if (
        !output.dataset.keyboardNavigationAttached
    ) {

        attachFillableNavigation(
            output
        );

        output.dataset.keyboardNavigationAttached =
            "true";

    }


    // =================================================
    // FIND ALL DAYS
    // =================================================

    const dates =
        [
            ...new Set(
                tipDistribution.map(
                    block =>
                        block.date
                )
            )
        ];

    console.log(
        "DATES FOUND",
        dates
    );


    // =================================================
    // DEFAULT DATE
    // =================================================

    if (
        !selectedDate &&
        dates.length > 0
    ) {

        selectedDate =
            dates[0];

    }


    // =================================================
    // RENDER DAY TABS
    // =================================================

    renderTabs(
        dates,
        selectedDate,
        (date) => {

            selectedDate =
                date;

            renderDistribution(
                tipDistribution,
                refreshUI
            );

        }
    );


    // =================================================
    // FILTER CURRENT DAY
    // =================================================

    const currentBlocks =
        tipDistribution.filter(
            block =>
                block.date ===
                selectedDate
        );

    console.log(
        "CURRENT DAY BLOCKS",
        currentBlocks
    );


    // =================================================
    // CLEAR TABLES
    // =================================================

    output.innerHTML =
        "";


    // =================================================
    // RENDER MEAL BLOCKS
    // =================================================

    for (
        const block
        of currentBlocks
    ) {

        output.appendChild(

            renderMealBlock(
                block,
                refreshUI
            )

        );

    }


    // =================================================
    // RESTORE FOCUS AFTER REFRESH
    // =================================================

    restorePendingFocus(
        output
    );

}


// =================================================
// KEYBOARD NAVIGATION
// =================================================

function attachFillableNavigation(
    output
) {

    const fillableSelector = [
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[contenteditable='true']"
    ].join(",");


    output.addEventListener(
        "keydown",
        (event) => {

            // =================================================
            // ONLY HANDLE ENTER
            // =================================================

            if (
                event.key !== "Enter"
            ) {
                return;
            }


            // Ignore IME/composition input.
            if (
                event.isComposing
            ) {
                return;
            }


            const target =
                event.target;


            // =================================================
            // MAKE SURE THIS IS A FILLABLE ELEMENT
            // =================================================

            if (
                !target.matches(
                    fillableSelector
                )
            ) {
                return;
            }


            // =================================================
            // PREVENT NORMAL ENTER BEHAVIOR
            // =================================================

            event.preventDefault();


            // =================================================
            // FIND ALL CURRENTLY FILLABLE ELEMENTS
            // =================================================

            const fillable =
                Array.from(
                    output.querySelectorAll(
                        fillableSelector
                    )
                );


            const currentIndex =
                fillable.indexOf(
                    target
                );


            if (
                currentIndex === -1
            ) {
                return;
            }


            // =================================================
            // DETERMINE DIRECTION
            //
            // Enter:
            //     NEXT
            //
            // Shift + Enter:
            //     PREVIOUS
            // =================================================

            const direction =
                event.shiftKey
                    ? -1
                    : 1;


            const nextIndex =
                currentIndex +
                direction;


            // =================================================
            // STOP AT FIRST / LAST FIELD
            // =================================================

            if (
                nextIndex < 0 ||
                nextIndex >=
                    fillable.length
            ) {
                return;
            }


            const next =
                fillable[
                    nextIndex
                ];


            // =================================================
            // REMEMBER THE FIELD
            // =================================================

            rememberFocus(
                next
            );


            // =================================================
            // MOVE FOCUS
            // =================================================

            next.focus();


            // =================================================
            // HIGHLIGHT TIP POINTS
            // =================================================

            if (
                next.classList.contains(
                    "tip-point-input"
                )
            ) {

                selectEntireInput(
                    next
                );

                return;

            }


            // =================================================
            // NORMAL TEXT / NUMBER INPUTS
            // =================================================

            if (
                next instanceof
                    HTMLInputElement ||
                next instanceof
                    HTMLTextAreaElement
            ) {

                const length =
                    next.value.length;

                try {

                    next.setSelectionRange(
                        length,
                        length
                    );

                } catch (error) {

                    // Some input types do not support
                    // setSelectionRange.

                }

            }

        }
    );

}


// =================================================
// REMEMBER CURRENT FIELD
// =================================================

function rememberFocus(
    element
) {

    if (
        element.classList.contains(
            "tip-point-input"
        )
    ) {

        const employeeId =
            element.dataset.employeeId;

        const mealBlockId =
            element.dataset.mealBlockId;


        if (
            employeeId &&
            mealBlockId
        ) {

            window.__distributionPendingFocus = {

                type:
                    "tip-point",

                employeeId:
                    employeeId,

                mealBlockId:
                    mealBlockId

            };

            return;

        }

    }


    // Generic fallback for other inputs.
    window.__distributionPendingFocus = {

        type:
            "generic",

        selector:
            createElementSelector(
                element
            )

    };

}


// =================================================
// RESTORE FOCUS AFTER REFRESH
// =================================================

function restorePendingFocus(
    output
) {

    const pending =
        window.__distributionPendingFocus;


    if (!pending) {
        return;
    }


    // Clear it immediately so we don't
    // accidentally restore it forever.
    window.__distributionPendingFocus =
        null;


    // =================================================
    // TIP POINT FIELD
    // =================================================

    if (
        pending.type ===
        "tip-point"
    ) {

        const selector =
            `.tip-point-input[data-employee-id="${CSS.escape(
                pending.employeeId
            )}"][data-meal-block-id="${CSS.escape(
                pending.mealBlockId
            )}"]`;


        const input =
            output.querySelector(
                selector
            );


        if (!input) {
            return;
        }


        input.focus();


        selectEntireInput(
            input
        );


        return;

    }


    // =================================================
    // GENERIC FIELD
    // =================================================

    if (
        pending.type ===
        "generic"
    ) {

        const element =
            output.querySelector(
                pending.selector
            );


        if (!element) {
            return;
        }


        element.focus();

    }

}


// =================================================
// CREATE FALLBACK SELECTOR
// =================================================

function createElementSelector(
    element
) {

    if (
        element.id
    ) {

        return `#${CSS.escape(
            element.id
        )}`;

    }


    if (
        element.name
    ) {

        return `${element.tagName.toLowerCase()}[name="${CSS.escape(
            element.name
        )}"]`;

    }


    return element.tagName.toLowerCase();

}


// =================================================
// SELECT ENTIRE INPUT VALUE
// =================================================

function selectEntireInput(
    input
) {

    input.focus();


    try {

        input.select();

    } catch (error) {

        try {

            input.setSelectionRange(
                0,
                input.value.length
            );

        } catch (selectionError) {

            // Nothing else to do.

        }

    }

}