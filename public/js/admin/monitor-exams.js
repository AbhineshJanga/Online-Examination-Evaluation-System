/* =========================
   IMPORT DATA
========================= */

import { monitorSessions } from "./admin-data.js";


/* =========================
   SOCKET.IO MONITORING
========================= */

// Initialize Socket.IO connection
const socket = io(window.location.origin);

// Real-time monitoring data
let realTimeSessions = [...monitorSessions];

// Handle cheating alerts
socket.on('cheating-alert', (alert) => {
    console.log('🚨 Cheating alert received:', alert);

    // Update or add session data
    updateSessionWithAlert(alert);

    // Re-render table if current tab shows violations
    if (currentTab === 'violations' || currentTab === 'active') {
        renderTable();
    }

    // Show notification
    showAlertNotification(alert);
});

function updateSessionWithAlert(alert) {
    // Find or create session
    let session = realTimeSessions.find(s =>
        s.student === alert.userId && s.exam === 'Active Exam' // We need to map examId to exam name
    );

    if (!session) {
        // Create new session
        session = {
            sessionId: Date.now(),
            student: alert.userId,
            exam: 'Active Exam', // Should map from examId
            os: 'Unknown',
            browser: 'Unknown',
            ip: 'Unknown',
            tabSwitch: 0,
            keyFlag: false,
            fullscreen: true,
            status: 'active',
            violations: []
        };
        realTimeSessions.push(session);
    }

    // Update based on alert type
    if (alert.type === 'TAB_SWITCH') {
        session.tabSwitch++;
        session.violations.push({
            time: new Date(alert.time).toLocaleTimeString(),
            type: 'Tab switched to another window'
        });
    } else if (alert.type === 'WINDOW_BLUR') {
        session.violations.push({
            time: new Date(alert.time).toLocaleTimeString(),
            type: 'Window focus lost'
        });
    } else if (alert.type === 'FULLSCREEN_EXIT') {
        session.fullscreen = false;
        session.violations.push({
            time: new Date(alert.time).toLocaleTimeString(),
            type: 'Exited fullscreen mode'
        });
    }
}

function showAlertNotification(alert) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'alert-notification';
    notification.innerHTML = `
        <div class="alert-content">
            <strong>🚨 Alert:</strong> ${alert.userId} - ${alert.message}
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

// Update renderTable to use realTimeSessions
function renderTable() {
    tableBody.innerHTML = "";

    let filtered = [];

    if (currentTab === "active") {
        filtered = realTimeSessions.filter(s => s.status === "active");
    }

    if (currentTab === "completed") {
        filtered = realTimeSessions.filter(s => s.status === "completed");
    }

    if (currentTab === "violations") {
        filtered = realTimeSessions.filter(s => s.violations.length > 0);
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
   DOM
========================= */

const tabs = document.querySelectorAll(".tab");
const tableBody = document.getElementById("monitorTableBody");

let currentTab = "active";


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