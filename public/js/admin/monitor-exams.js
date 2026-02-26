/* =========================
   IMPORT DATA
========================= */

import { monitorSessions } from "./admin-data.js";


/* =========================
   DOM
========================= */

const tabs = document.querySelectorAll(".tab");
const tableBody = document.getElementById("monitorTableBody");

let currentTab = "active";


/* =========================
   RISK CALCULATION
========================= */

function getRisk(session) {

    if (session.tabSwitch > 1 || session.keyFlag) return "high";
    if (session.tabSwitch === 1) return "warning";
    return "low";
}


/* =========================
   RENDER TABLE
========================= */

function renderTable() {

    tableBody.innerHTML = "";

    let filtered = [];

    if (currentTab === "active") {
        filtered = monitorSessions.filter(s => s.status === "active");
    }

    if (currentTab === "completed") {
        filtered = monitorSessions.filter(s => s.status === "completed");
    }

    if (currentTab === "violations") {
        filtered = monitorSessions.filter(s => s.violations.length > 0);
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No data</td></tr>`;
        return;
    }

    filtered.forEach(session => {

        const risk = getRisk(session);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${session.student}</td>
            <td>${session.exam}</td>
            <td>${session.os}</td>
            <td>${session.browser}</td>
            <td>${session.ip}</td>
            <td><span class="status ${session.tabSwitch ? "warning" : "active"}">${session.tabSwitch}</span></td>
            <td><span class="status ${session.keyFlag ? "inactive" : "active"}">${session.keyFlag ? "Detected" : "No"}</span></td>
            <td><span class="status ${session.fullscreen ? "active" : "inactive"}">${session.fullscreen ? "Yes" : "No"}</span></td>
            <td><span class="risk ${risk}">${risk.toUpperCase()}</span></td>
            <td><a href="view-monitoring.html?id=${session.sessionId}" class="action-btn">View</a></td>
        `;

        tableBody.appendChild(row);
    });
}


/* =========================
   TAB HANDLING
========================= */

tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        currentTab = tab.dataset.tab;

        renderTable();
    });
});


/* =========================
   INIT
========================= */

renderTable();