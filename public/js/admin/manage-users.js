/* =========================
   IMPORT DATA
========================= */

import { users } from "./admin-data.js";

/* =========================
   STATE
========================= */

// Create working copy so original data stays intact
let usersState = [...users];


/* =========================
   DOM REFERENCES
========================= */

const tableBody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");


/* =========================
   RENDER FUNCTION
========================= */

function renderUsers(data) {

    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No users found</td></tr>`;
        return;
    }

    data.forEach(user => {

        const roleLabel = user.role === "student" ? "Student" : "Faculty";

        const statusClass = user.status === "active" ? "active" : "inactive";
        const statusLabel = user.status === "active" ? "Active" : "Disabled";

        const toggleLabel = user.status === "active" ? "Disable" : "Enable";
        const toggleClass = user.status === "active" ? "warning" : "";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${roleLabel}</td>
            <td><span class="status ${statusClass}">${statusLabel}</span></td>
            <td>${user.lastLogin}</td>
            <td class="action-cell">
                <button class="action-btn activity-btn" data-id="${user.id}">Activity</button>
                <button class="action-btn ${toggleClass} toggle-btn" data-id="${user.id}">${toggleLabel}</button>
                <button class="action-btn danger remove-btn" data-id="${user.id}">Remove</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    attachActionListeners();
}


/* =========================
   FILTER PIPELINE
========================= */

function applyFilters() {

    let filtered = [...usersState];

    // Search filter
    const searchText = searchInput.value.toLowerCase();
    if (searchText) {
        filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(searchText) ||
            user.email.toLowerCase().includes(searchText)
        );
    }

    // Role filter
    const roleValue = roleFilter.value.toLowerCase();
    if (roleValue.includes("student")) {
        filtered = filtered.filter(user => user.role === "student");
    } else if (roleValue.includes("faculty")) {
        filtered = filtered.filter(user => user.role === "faculty");
    }

    // Status filter
    const statusValue = statusFilter.value.toLowerCase();
    if (statusValue.includes("active")) {
        filtered = filtered.filter(user => user.status === "active");
    } else if (statusValue.includes("disabled")) {
        filtered = filtered.filter(user => user.status === "disabled");
    }

    renderUsers(filtered);
}


/* =========================
   ACTION LISTENERS
========================= */

function attachActionListeners() {

    // Activity
    document.querySelectorAll(".activity-btn").forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const user = usersState.find(u => u.id == id);
            alert(`Activity view for ${user.name} (Coming soon)`);
        };
    });

    // Toggle status
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const user = usersState.find(u => u.id == id);

            user.status = user.status === "active" ? "disabled" : "active";

            applyFilters();
        };
    });

    // Remove user
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;

            if (confirm("Are you sure to remove this user?")) {
                usersState = usersState.filter(u => u.id != id);
                applyFilters();
            }
        };
    });
}


/* =========================
   EVENT LISTENERS
========================= */

searchInput.addEventListener("input", applyFilters);
roleFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);


/* =========================
   INIT
========================= */

renderUsers(usersState);