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

async function renderSummary() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch('/api/admin/results', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch results');

        const data = await response.json();
        const summary = data.summary || {};

        totalAppearedEl.textContent = summary.totalAppeared || 0;
        totalPassedEl.textContent = summary.totalPassed || 0;
        totalFailedEl.textContent = summary.totalFailed || 0;
        passPercentEl.textContent = (summary.passPercentage || 0) + "%";
    } catch (error) {
        console.error('Error loading results summary:', error);
        totalAppearedEl.textContent = "--";
        totalPassedEl.textContent = "--";
        totalFailedEl.textContent = "--";
        passPercentEl.textContent = "--";
    }
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

/* =========================
   TABLE RENDER
========================= */

async function renderTable() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch('/api/admin/results', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch results');

        const data = await response.json();
        const examResults = data.examResults || [];

        tableBody.innerHTML = "";

        if (examResults.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: gray;">No results available</td></tr>`;
            return;
        }

        examResults.forEach(result => {
            const percent = result.appeared > 0 
                ? Math.round((result.passed / result.appeared) * 100)
                : 0;
            const riskClass = getRiskClass(percent);

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${result.examName}</td>
                <td>${result.appeared}</td>
                <td>${result.passed}</td>
                <td>${result.failed}</td>
                <td><span class="risk ${riskClass}">${percent}%</span></td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading results table:', error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Error loading results</td></tr>`;
    }
}


/* =========================
   INIT
========================= */

renderSummary();
renderTable();