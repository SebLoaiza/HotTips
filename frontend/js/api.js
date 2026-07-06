// ===============================
// GLOBAL STATE
// ===============================

window.LAST_BLOCKS = [];
window.ALL_ORDERS = [];


// ===============================
// UPLOAD MEAL BLOCKS
// ===============================

async function upload() {

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a CSV file first.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/meal-blocks", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        const err = await res.text();
        document.getElementById("output").textContent = "Error: " + err;
        return;
    }

    const data = await res.json();

    window.LAST_BLOCKS = attachOrdersToBlocks(
        data,
        window.ALL_ORDERS
    );
    attachOrdersToEmployees(window.LAST_BLOCKS);
    renderBlocks(window.LAST_BLOCKS);
}


// ===============================
// APPLY EDIT
// ===============================

async function applyEdit(key) {

    const startText = document.getElementById(`start-${key}`).value.trim();
    const endText = document.getElementById(`end-${key}`).value.trim();

    const errorEl = document.getElementById(`error-${key}`);
    errorEl.textContent = "";

    if (!isValidTime(startText) || !isValidTime(endText)) {
        errorEl.textContent = "Use hh:mm AM/PM (Example: 5:30 AM)";
        return;
    }

    const start = timeToMinutes(startText);
    const end = timeToMinutes(endText);

    try {

        const res = await fetch("/api/meal-blocks-recompute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, start, end })
        });

        const updated = await res.json();

        window.LAST_BLOCKS = attachOrdersToBlocks(
            updated,
            window.ALL_ORDERS
        );

        attachOrdersToEmployees(window.LAST_BLOCKS);
        renderBlocks    (window.LAST_BLOCKS);

    } catch (err) {
        console.error("applyEdit error:", err);
    }
}

async function uploadOrders() {

    const fileInput = document.getElementById("orderFileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an orders CSV file");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/orders", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Order upload error:", err);
        return;
    }

    const orders = await res.json();

    window.ALL_ORDERS = orders;

    console.log("ORDERS LOADED:", orders);

    // re-attach orders to existing blocks if they exist
    if (window.LAST_BLOCKS && window.LAST_BLOCKS.length) {
        window.LAST_BLOCKS = attachOrdersToBlocks(
            window.LAST_BLOCKS,
            orders
        );
        attachOrdersToEmployees(window.LAST_BLOCKS);
        renderBlocks(window.LAST_BLOCKS);
    }
}

