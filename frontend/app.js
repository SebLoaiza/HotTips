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

    const grouped = {};

    blocks.forEach(b => {
        if (!grouped[b.date]) grouped[b.date] = [];
        grouped[b.date].push(b);
    });

    Object.keys(grouped).forEach(date => {

        const dayWrap = document.createElement("div");
        dayWrap.className = "meal-block";

        const dayTitle = document.createElement("div");
        dayTitle.className = "meal-header";
        dayTitle.textContent = date;

        dayWrap.appendChild(dayTitle);

        const table = document.createElement("table");
        table.className = "meal-table";

        const tbody = document.createElement("tbody");

        const meals = grouped[date];

        ["Breakfast", "Lunch", "Dinner"].forEach(mealName => {

            const block = meals.find(m => m.meal === mealName);
            if (!block) return;

            const key = `${block.date}-${block.meal}`;

            const mealId = `meal-${key}`;

            // =========================
            // MEAL HEADER ROW
            // =========================
            const headerRow = document.createElement("tr");
            headerRow.className = "meal-group-header";

            headerRow.innerHTML = `
                <td colspan="7" style="background:#11141a; color:#7cc7ff; font-weight:bold;">
                    <span style="cursor:pointer;" onclick="toggleMeal('${key}')">
                        ${block.meal} ▼
                    </span>

                    <span id="range-${key}" style="margin-left:10px;">
                        ${block.start} → ${block.end}
                    </span>

                    <button onclick="toggleEdit('${key}')">edit</button>

                    <div id="edit-${key}" style="display:none; margin-top:6px;">
                        <input id="start-${key}" type="number" value="${block.start}" />
                        <input id="end-${key}" type="number" value="${block.end}" />
                        <button onclick="applyEdit('${key}')">apply</button>
                    </div>
                </td>
            `;

            headerRow.dataset.mealId = mealId;

            tbody.appendChild(headerRow);

            // =========================
            // EMPLOYEE HEADER ROW
            // =========================
            const subHeader = document.createElement("tr");
            subHeader.dataset.mealId = mealId;

            subHeader.innerHTML = `
                <th>Employee</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Worked</th>
                <th>Lost</th>
                <th>Breaks</th>
            `;

            tbody.appendChild(subHeader);

            // =========================
            // EMPLOYEE ROWS
            // =========================
            block.employees.forEach(emp => {

                const breaksHTML = (emp.breaks || [])
                    .map(b => `${b[0]}→${b[1]} (${b[1] - b[0]})`)
                    .join("<br>");

                const row = document.createElement("tr");
                row.dataset.mealId = mealId;

                row.innerHTML = `
                    <td>${emp.name}</td>
                    <td>${emp.role}</td>
                    <td>${emp.meal_start} → ${emp.meal_end}</td>
                    <td>${emp.worked_minutes}</td>
                    <td>${emp.lost_mins}</td>
                    <td>${breaksHTML || "-"}</td>
                `;

                tbody.appendChild(row);
            });

            // spacer row
            const spacer = document.createElement("tr");
            spacer.dataset.mealId = mealId;
            spacer.innerHTML = `<td colspan="7"><div style="height:10px;"></div></td>`;
            tbody.appendChild(spacer);
        });

        table.appendChild(tbody);
        dayWrap.appendChild(table);
        output.appendChild(dayWrap);
    });
}
function toggleMeal(key) {
    const rows = document.querySelectorAll(`[data-meal-id="meal-${key}"]`);
    if (!rows.length) return;

    // determine current state from first row
    const isHidden = rows[1]?.style.display === "none";

    rows.forEach(r => {
        r.style.display = isHidden ? "" : "none";
    });
}