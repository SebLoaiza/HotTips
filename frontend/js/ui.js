function toggleEdit(key) {
    const el = document.getElementById(`edit-${key}`);
    if (!el) return;

    el.style.display = el.style.display === "none" ? "block" : "none";
}

function toggleDay(id) {

    const table = document.getElementById(id);
    if (!table) return;

    table.style.display =
        table.style.display === "none" ? "" : "none";
}

function toggleMeal(key) {

    const rows = document.querySelectorAll(`[data-meal="${key}"]`);

    rows.forEach(row => {
        row.style.display =
            row.style.display === "none" ? "" : "none";
    });
}

function dumpMealBlocks() {

    console.clear();

    console.log("========== CURRENT MEAL BLOCKS ==========");

    console.dir(window.LAST_BLOCKS, {
        depth: null
    });

    console.log(
        JSON.stringify(window.LAST_BLOCKS, null, 2)
    );
}

function goToDistribution() {

    sessionStorage.setItem(
        "mealBlocks",
        JSON.stringify(window.LAST_BLOCKS)
    );

    window.location.href = "/static/dist/distribution.html";
}