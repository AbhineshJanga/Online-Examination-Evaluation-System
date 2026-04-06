/* =========================
   AUTH CHECK
========================= */

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

if (!token || user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "../login.html";
}

const API_BASE_URL = "/api";

/* =========================
   DOM REFERENCES
========================= */

const totalStudentsEl = document.getElementById("totalStudents");
const totalFacultyEl = document.getElementById("totalFaculty");
const totalExamsEl = document.getElementById("totalExams");
const activeExamsEl = document.getElementById("activeExams");
const activityTableBody = document.getElementById("activityTableBody");


/* =========================
   STATISTICS CALCULATION
========================= */

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch stats');

        const data = await response.json();

        totalStudentsEl.textContent = data.totalStudents;
        totalFacultyEl.textContent = data.totalTeachers;
        totalExamsEl.textContent = data.totalExams;
        activeExamsEl.textContent = data.activeExams;
    } catch (error) {
        console.error('Error loading stats:', error);
        totalStudentsEl.textContent = "--";
        totalFacultyEl.textContent = "--";
        totalExamsEl.textContent = "--";
        activeExamsEl.textContent = "--";
    }
}

function renderStats() {
    loadStats();
}


/* =========================
   ACTIVITY RENDERING
========================= */

async function renderActivity() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/activity`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch activity log');

        const data = await response.json();
        const activityLog = data.activities || [];

        activityTableBody.innerHTML = "";

        if (activityLog.length === 0) {
            activityTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No activity yet</td></tr>`;
            return;
        }

        // Display activities (already sorted descending from backend)
        activityLog.forEach(item => {
            const row = document.createElement("tr");
            const date = new Date(item.timestamp).toLocaleString();

            row.innerHTML = `
                <td>${item.userId?.name || 'Unknown'}</td>
                <td>${item.action}</td>
                <td>${date}</td>
            `;

            activityTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading activity:', error);
        activityTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: red;">Error loading activity</td></tr>`;
    }
}


/* =========================
   INIT
========================= */

renderStats();
renderActivity();