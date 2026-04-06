/* =========================
   GET SESSION ID
========================= */

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("id");

let session = null;


/* =========================
   DOM
========================= */

const studentNameEl = document.getElementById("studentName");
const examNameEl = document.getElementById("examName");
const osEl = document.getElementById("os");
const browserEl = document.getElementById("browser");
const ipEl = document.getElementById("ip");
const fullscreenEl = document.getElementById("fullscreen");

const riskBadge = document.getElementById("riskBadge");
const totalViolationsEl = document.getElementById("totalViolations");
const tabSwitchCountEl = document.getElementById("tabSwitchCount");
const keyFlagStatusEl = document.getElementById("keyFlagStatus");

const violationLog = document.getElementById("violationLog");


/* =========================
   LOAD SESSION DATA
========================= */

async function loadSession() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/monitoring/${sessionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch session');

        const data = await response.json();
        session = data.session;

        if (!session) {
            alert("Session not found");
            return;
        }

        renderInfo();
        renderRisk();
        renderLog();
    } catch (error) {
        console.error('Error loading session:', error);
        alert("Error loading session data");
    }
}

function calculateRisk() {
    if (session.tabSwitch > 2 || session.keysFlag) return "high";
    if (session.tabSwitch > 0 || (session.violations && session.violations.length > 1)) return "warning";
    return "low";
}


/* =========================
   RENDER INFO
========================= */

function renderInfo() {

    if (!session) {
        alert("Session not found");
        return;
    }

    studentNameEl.textContent = session.studentName || "Unknown";
    examNameEl.textContent = session.examName || "Unknown Exam";
    osEl.textContent = session.os || "Unknown";
    browserEl.textContent = session.browser || "Unknown";
    ipEl.textContent = session.ip || "Unknown";
    fullscreenEl.textContent = session.fullscreen ? "Yes" : "No";
}


/* =========================
   RENDER RISK
========================= */

function renderRisk() {

    const risk = calculateRisk();

    riskBadge.textContent = risk.toUpperCase();
    riskBadge.classList.add(risk);

    totalViolationsEl.textContent = session.violations ? session.violations.length : 0;
    tabSwitchCountEl.textContent = session.tabSwitch || 0;
    keyFlagStatusEl.textContent = session.keysFlag ? "Detected" : "No";
}


/* =========================
   RENDER LOG
========================= */

function renderLog() {

    violationLog.innerHTML = "";

    if (session.violations.length === 0) {
        violationLog.innerHTML = `<p>No violations</p>`;
        return;
    }

    session.violations.forEach(v => {

        const item = document.createElement("div");
        item.className = "log-item";

        item.innerHTML = `
            <span class="log-time">${v.time}</span>
            <span class="log-text">${v.type}</span>
        `;

        violationLog.appendChild(item);
    });
}


/* =========================
   INIT
========================= */

loadSession();