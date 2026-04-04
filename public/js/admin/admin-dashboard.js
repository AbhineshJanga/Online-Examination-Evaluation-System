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
   IMPORT DATA
========================= */

import { activityLog, monitorSessions, results } from "./admin-data.js";


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
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch users');

        const usersData = await response.json();
        const userList = usersData.users || [];

        const totalStudents = userList.filter(u => u.role === "student").length;
        const totalFaculty = userList.filter(u => u.role === "teacher").length;
        const totalExams = results.length;
        const activeExams = monitorSessions.filter(s => s.status === "active").length;

        totalStudentsEl.textContent = totalStudents;
        totalFacultyEl.textContent = totalFaculty;
        totalExamsEl.textContent = totalExams;
        activeExamsEl.textContent = activeExams;
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