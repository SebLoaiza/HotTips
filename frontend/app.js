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

// ======================================
// EDIT
// ======================================

function toggleEdit(key) {
    const el = document.getElementById(`edit-${key}`);
    if (!el) return;

    el.style.display =
        el.style.display === "none" ? "block" : "none";
}

async function applyEdit(key) {

    const startInput = document.getElementById(`start-${key}`);
    const endInput = document.getElementById(`end-${key}`);

    const startText = startInput.value.trim();
    const endText = endInput.value.trim();

    // Clear previous error
    document.getElementById(`error-${key}`).textContent = "";

    if (!isValidTime(startText) || !isValidTime(endText)) {

        document.getElementById(`error-${key}`).textContent =
            "Use hh:mm AM/PM (Example: 5:30 AM)";

        return;
    }

    const start = timeToMinutes(startText);
    const end = timeToMinutes(endText);

    try {

        const res = await fetch("/api/meal-blocks-recompute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                key,
                start,
                end
            })
        });

        const updated = await res.json();

        renderBlocks(updated);

    }
    catch(err){
        console.error(err);
    }
}
// ======================================
// DAY COLLAPSE
// ======================================

function toggleDay(id){

    const table = document.getElementById(id);

    if(!table) return;

    table.style.display =
        table.style.display === "none"
        ? ""
        : "none";
}

// ======================================
// MEAL COLLAPSE
// ======================================

function toggleMeal(key){

    const rows = document.querySelectorAll(
        `[data-meal="${key}"]`
    );

    rows.forEach(row=>{

        row.style.display =
            row.style.display === "none"
            ? ""
            : "none";

    });

}

// ======================================
// RENDER
// ======================================

function renderBlocks(blocks){

    const output = document.getElementById("output");
    output.innerHTML = "";

    const grouped = {};

    blocks.forEach(block=>{

        if(!grouped[block.date])
            grouped[block.date]=[];

        grouped[block.date].push(block);

    });

    Object.keys(grouped).forEach(date=>{

        const dayWrap=document.createElement("div");
        dayWrap.className="meal-block";

        const tableId=
            "day-"+date.replace(/\W/g,"_");

        // DAY HEADER
        const dayHeader=document.createElement("div");
        dayHeader.className="meal-header";
        dayHeader.style.cursor="pointer";
        dayHeader.innerHTML=`▼ ${date}`;
        dayHeader.onclick=()=>toggleDay(tableId);

        dayWrap.appendChild(dayHeader);

        // TABLE
        const table=document.createElement("table");
        table.className="meal-table";
        table.id=tableId;

        const tbody=document.createElement("tbody");

        ["Breakfast","Lunch","Dinner"].forEach(mealName=>{

            const block=grouped[date].find(
                b=>b.meal===mealName
            );

            if(!block) return;

            const key=`${block.date}-${block.meal}`;

            // =========================
            // MEAL HEADER
            // =========================

            const header=document.createElement("tr");

            header.className="meal-group-header";

            header.innerHTML=`
                <td colspan="6"
                style="background:#11141a;color:#7cc7ff;font-weight:bold;">

                    <span
                        style="cursor:pointer;"
                        onclick="toggleMeal('${key}')"
                    >
                        ▼ ${block.meal}
                    </span>

                    <span id="range-${key}" style="margin-left:12px;">
                        ${minutesToTime(block.start)} → ${minutesToTime(block.end)}
                    </span>

                    <button
                        style="margin-left:10px;"
                        onclick="toggleEdit('${key}')"
                    >
                        edit
                    </button>

                    <div
                        id="edit-${key}"
                        style="display:none;margin-top:8px;"
                    >

                    <input
                        id="start-${key}"
                        type="text"
                        value="${minutesToTime(block.start)}"
                    >

                    <input
                        id="end-${key}"
                        type="text"
                        value="${minutesToTime(block.end)}"
                    >

                        <button onclick="applyEdit('${key}')">
                            apply
                        </button>


                            
                        <div
                            id="error-${key}"
                            style="
                                color:#ff6666;
                                margin-top:6px;
                                font-size:13px;
                                font-weight:normal;
                            ">
                        </div>
                    </div>

                </td>
            `;

            tbody.appendChild(header);

            // =========================
            // COLUMN HEADERS
            // =========================

            const cols=document.createElement("tr");

            cols.dataset.meal=key;

            cols.innerHTML=`
                <th>Employee</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Worked</th>
                <th>Lost</th>
                <th>Breaks</th>
            `;

            tbody.appendChild(cols);

            // =========================
            // EMPLOYEES
            // =========================

            block.employees.forEach(emp=>{

                const row=document.createElement("tr");

                row.dataset.meal=key;

                row.innerHTML=`
                    <td>${emp.name}</td>

                    <td>${emp.role}</td>

                    <td>
                        ${minutesToTime(emp.meal_start)}
                        →
                        ${minutesToTime(emp.meal_end)}
                    </td>

                    <td>${emp.worked_minutes}</td>

                    <td>${emp.lost_mins}</td>

                    <td>
                        ${
                            emp.breaks.length
                            ? emp.breaks
                                .map(
                                   b => `${minutesToTime(b[0])} → ${minutesToTime(b[1])} (${b[1]-b[0]} mins)`
                                )
                                .join("<br>")
                            : "-"
                        }
                    </td>
                `;

                tbody.appendChild(row);

            });

            const spacer=document.createElement("tr");
            spacer.dataset.meal=key;
            spacer.innerHTML=
                `<td colspan="6"><div style="height:10px;"></div></td>`;

            tbody.appendChild(spacer);

        });

        table.appendChild(tbody);
        dayWrap.appendChild(table);
        output.appendChild(dayWrap);

    });

}


function minutesToTime(minutes) {

    minutes = minutes % (24 * 60);

    let hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const suffix = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function timeToMinutes(time) {

    const [clock, suffix] = time.trim().split(" ");

    let [hour, minute] = clock.split(":").map(Number);

    if (hour === 12)
        hour = 0;

    if (suffix.toUpperCase() === "PM")
        hour += 12;

    return hour * 60 + minute;
}

function isValidTime(time) {
    return /^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM)$/i.test(time.trim());
}