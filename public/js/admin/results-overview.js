/* =========================
   IMPORT DATA
========================= */

import { results } from "./admin-data.js";


/* =========================
   DOM
========================= */

const totalAppearedEl = document.getElementById("totalAppeared");
const totalPassedEl = document.getElementById("totalPassed");
const totalFailedEl = document.getElementById("totalFailed");
const passPercentEl = document.getElementById("passPercent");

const tableBody = document.getElementById("resultsTableBody");


/* =========================
   SUMMARY CALCULATION
========================= */

function renderSummary() {

    let totalAppeared = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    results.forEach(r => {
        totalAppeared += r.appeared;
        totalPassed += r.passed;
        totalFailed += r.failed;
    });

    const percent = totalAppeared
        ? Math.round((totalPassed / totalAppeared) * 100)
        : 0;

    totalAppearedEl.textContent = totalAppeared;
    totalPassedEl.textContent = totalPassed;
    totalFailedEl.textContent = totalFailed;
    passPercentEl.textContent = percent + "%";
}


/* =========================
   RISK COLOR
========================= */

function getRiskClass(percent) {

    if (percent >= 80) return "low";      // good
    if (percent >= 60) return "warning";  // average
    return "high";                        // poor
}


/* =========================
   TABLE RENDER
========================= */

function renderTable() {

    tableBody.innerHTML = "";

    results.forEach(r => {

        const percent = Math.round((r.passed / r.appeared) * 100);
        const riskClass = getRiskClass(percent);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${r.examName}</td>
            <td>${r.appeared}</td>
            <td>${r.passed}</td>
            <td>${r.failed}</td>
            <td><span class="risk ${riskClass}">${percent}%</span></td>
        `;

        tableBody.appendChild(row);
    });
}


/* =========================
   INIT
========================= */

renderSummary();
renderTable();