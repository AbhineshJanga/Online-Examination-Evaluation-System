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
   SOCKET.IO MONITORING
========================= */

// Initialize Socket.IO connection
const socket = io(window.location.origin);

// Real-time monitoring data
let realTimeSessions = [];

// Load initial sessions from API
async function loadInitialSessions() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/monitoring/sessions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            realTimeSessions = data.sessions || [];
            renderTable();
        }
    } catch (error) {
        console.error('Error loading initial sessions:', error);
        document.getElementById("monitorTableBody").innerHTML = `<tr><td colspan="10" style="text-align:center; color: red;">Error loading sessions</td></tr>`;
    }
}

// Handle cheating alerts (real-time via Socket.IO)
socket.on('cheating-alert', (alert) => {
    console.log('🚨 Cheating alert received:', alert);

    // Find and update session
    const session = realTimeSessions.find(s => s.socketId === alert.socketId || s.studentId === alert.userId);
    if (session && alert.type) {
        if (!session.violations) session.violations = [];
        session.violations.push({
            time: new Date(alert.time).toLocaleTimeString(),
            type: alert.type
        });
        
        // Update risk level
        if (alert.type === 'TAB_SWITCH') {
            session.tabSwitch = (session.tabSwitch || 0) + 1;
        } else if (alert.type === 'SUSPICIOUS_KEYS') {
            session.keysFlag = true;
        }
        
        // Re-render table
        renderTable();
    }

    // Show notification
    showAlertNotification(alert);
});

function showAlertNotification(alert) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'alert-notification';
    notification.innerHTML = `
        <div class="alert-content">
            <strong>🚨 Alert:</strong> ${alert.studentName} - ${alert.type}
            <button class="alert-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);

    // Close button
    notification.querySelector('.alert-close').addEventListener('click', () => {
        notification.remove();
    });
}


/* =========================
   DOM REFERENCES
========================= */

const tabs = document.querySelectorAll(".tab");
const tableBody = document.getElementById("monitorTableBody");

let currentTab = "active";


/* =========================
   GET RISK LEVEL
========================= */

function getRisk(session) {
    if (session.tabSwitch > 2 || session.keysFlag) return "high";
    if (session.tabSwitch > 0 || (session.violations && session.violations.length > 1)) return "warning";
    return "low";
}


/* =========================
   RENDER TABLE
========================= */

function renderTable() {
    tableBody.innerHTML = "";

    let filtered = [...realTimeSessions];

    // Filter by tab
    if (currentTab === "violations") {
        filtered = filtered.filter(s => s.violations && s.violations.length > 0);
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No data</td></tr>`;
        return;
    }

    filtered.forEach(session => {
        const risk = getRisk(session);
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${session.studentName}</td>
            <td>${session.examName}</td>
            <td>${session.os}</td>
            <td>${session.browser}</td>
            <td>${session.ip}</td>
            <td><span class="status ${session.tabSwitch > 0 ? "warning" : "active"}">${session.tabSwitch}</span></td>
            <td><span class="status ${session.keysFlag ? "inactive" : "active"}">${session.keysFlag ? "Detected" : "No"}</span></td>
            <td><span class="status ${session.fullscreen ? "active" : "inactive"}">${session.fullscreen ? "Yes" : "No"}</span></td>
            <td><span class="risk ${risk}">${risk.toUpperCase()}</span></td>
            <td><a href="view-monitoring.html?id=${session.socketId}" class="action-btn">View</a></td>
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

loadInitialSessions();