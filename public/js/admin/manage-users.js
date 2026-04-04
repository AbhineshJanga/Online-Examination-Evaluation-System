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

// Fallback static data for filters if needed
let usersState = [];


/* =========================
   DOM REFERENCES
========================= */

const tableBody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");


/* =========================
   LOAD USERS FROM API
========================= */

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch users');

        const data = await response.json();
        usersState = data.users || [];
        applyFilters();
    } catch (error) {
        console.error('Error loading users:', error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Error loading users</td></tr>`;
    }
}

// Load on init
loadUsers();


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

        const roleLabel = user.role === "student" ? "Student" : "Teacher";

        const statusClass = user.active !== false ? "active" : "inactive";
        const statusLabel = user.active !== false ? "Active" : "Disabled";

        const toggleLabel = user.active !== false ? "Disable" : "Enable";
        const toggleClass = user.active !== false ? "warning" : "";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${roleLabel}</td>
            <td><span class="status ${statusClass}">${statusLabel}</span></td>
            <td>${user.lastLogin || "N/A"}</td>
            <td class="action-cell">
                <button class="action-btn activity-btn" data-id="${user._id}">Activity</button>
                <button class="action-btn danger remove-btn" data-id="${user._id}">Remove</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    attachActionListeners();
}


/* =========================
   DELETE USER
========================= */

async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/user/${userId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to delete user');

        alert("User deleted successfully");
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Error: ${error.message}`);
    }
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
    if (roleValue && roleValue !== "all") {
        filtered = filtered.filter(user => user.role?.toLowerCase() === roleValue);
    }

    // Status filter  
    const statusValue = statusFilter.value.toLowerCase();
    if (statusValue && statusValue !== "all") {
        const isActive = statusValue === "active";
        filtered = filtered.filter(user => (user.active !== false) === isActive);
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
            const userId = btn.dataset.id;
            const user = usersState.find(u => u._id == userId);
            alert(`Activity view for ${user?.name || 'User'} (Coming soon)`);
        };
    });

    // Remove user
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.onclick = () => {
            const userId = btn.dataset.id;
            deleteUser(userId);
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