// ======================================
// GLOBAL STATE (safe init)
// ======================================

window.LAST_BLOCKS = [];
window.ALL_ORDERS = [];

// ======================================
// BOOTSTRAP
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("🔥 App initialized");

    // optional: if you ever want auto-render cached data
    if (window.LAST_BLOCKS.length > 0) {
        renderBlocks(window.LAST_BLOCKS);
    }

});