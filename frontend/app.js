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
    renderBlocks(data);
}

// ============================
// EDIT TOGGLE
// ============================

function toggleEdit(key) {
    const el = document.getElementById(`edit-${key}`);
    if (!el) return;
    el.style.display = el.style.display === "none" ? "block" : "none";
}

// ============================
// APPLY EDIT (safe fallback)
// ============================

async function applyEdit(key) {

    const startEl = document.getElementById(`start-${key}`);
    const endEl = document.getElementById(`end-${key}`);

    const start = parseInt(startEl.value);
    const end = parseInt(endEl.value);

    // optimistic UI update
    const range = document.getElementById(`range-${key}`);
    if (range) {
        range.textContent = `${start} → ${end}`;
    }

    try {
        const res = await fetch("/api/meal-blocks-recompute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, start, end })
        });

        if (!res.ok) {
            console.error("Recompute failed");
            return;
        }

        const updated = await res.json();
        renderBlocks(updated);

    } catch (err) {
        console.error("Backend not ready yet:", err);
    }
}

// ============================
// RENDER
// ============================

function renderBlocks(blocks) {
    const output = document.getElementById("output");
    output.innerHTML = "";

    // group by date
    const grouped = {};

    blocks.forEach(b => {
        if (!grouped[b.date]) grouped[b.date] = [];
        grouped[b.date].push(b);
    });

    Object.keys(grouped).forEach(date => {

        const dateBlock = document.createElement("div");
        dateBlock.className = "meal-block";

        const header = document.createElement("div");
        header.className = "meal-header";
        header.textContent = date;

        dateBlock.appendChild(header);

        grouped[date].forEach(block => {

            const key = `${block.date}-${block.meal}`;

            const row = document.createElement("div");
            row.className = "meal-row";

            // EMPLOYEE HTML
            let employeeHTML = "";

            block.employees.forEach(emp => {

                let breaksHTML = "";

                if (emp.breaks && emp.breaks.length > 0) {
                    breaksHTML = `
                        <div class="break-title">Breaks:</div>
                        ${emp.breaks.map(b => `
                            <div class="break">
                                ${b[0]} → ${b[1]} (${b[1] - b[0]} mins)
                            </div>
                        `).join("")}
                    `;
                }

                employeeHTML += `
                    <div class="employee">
                        <div class="emp-name">
                            ${emp.name}
                            <span>${emp.role}</span>
                        </div>

                        <div class="emp-shift">
                            ${emp.meal_start} → ${emp.meal_end}
                        </div>

                        <div class="emp-stats">
                            Worked: ${emp.worked_minutes} mins |
                            Lost: ${emp.lost_mins} mins
                        </div>

                        ${breaksHTML}
                    </div>
                `;
            });

            row.innerHTML = `
                <div class="meal-header-row">
                    <b>${block.meal}</b>

                    <span id="range-${key}">
                        ${block.start} → ${block.end}
                    </span>

                    <button onclick="toggleEdit('${key}')">
                        edit times
                    </button>
                </div>

                <div id="edit-${key}" style="display:none; margin-top:8px;">
                    <input id="start-${key}" type="number" value="${block.start}" />
                    <input id="end-${key}" type="number" value="${block.end}" />

                    <button onclick="applyEdit('${key}')">
                        apply
                    </button>
                </div>

                <div class="employees">
                    ${employeeHTML}
                </div>
            `;

            dateBlock.appendChild(row);
        });

        output.appendChild(dateBlock);
    });
}