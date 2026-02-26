/* =========================
   IMPORT DATA
========================= */

import { users, activityLog, monitorSessions, results } from "./admin-data.js";


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

function renderStats() {

    // Count students
    const totalStudents = users.filter(u => u.role === "student").length;

    // Count faculty
    const totalFaculty = users.filter(u => u.role === "faculty").length;

    // Total exams (from results dataset)
    const totalExams = results.length;

    // Active exams (from monitoring sessions)
    const activeExams = monitorSessions.filter(s => s.status === "active").length;

    totalStudentsEl.textContent = totalStudents;
    totalFacultyEl.textContent = totalFaculty;
    totalExamsEl.textContent = totalExams;
    activeExamsEl.textContent = activeExams;
}


/* =========================
   ACTIVITY RENDERING
========================= */

function renderActivity() {

    activityTableBody.innerHTML = "";

    // Sort by latest date (descending)
    const sorted = [...activityLog].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    sorted.forEach(item => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.user}</td>
            <td>${item.action}</td>
            <td>${item.date}</td>
        `;

        activityTableBody.appendChild(row);
    });
}


/* =========================
   INIT
========================= */

renderStats();
renderActivity();