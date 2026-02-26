/* =========================
   IMPORT DATA
========================= */

import { monitorSessions } from "./admin-data.js";


/* =========================
   GET SESSION ID
========================= */

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("id");

const session = monitorSessions.find(s => s.sessionId == sessionId);


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
   RISK CALCULATION
========================= */

function calculateRisk() {

    if (session.tabSwitch > 1 || session.keyFlag) return "high";
    if (session.tabSwitch === 1) return "warning";
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

    studentNameEl.textContent = session.student;
    examNameEl.textContent = session.exam;
    osEl.textContent = session.os;
    browserEl.textContent = session.browser;
    ipEl.textContent = session.ip;
    fullscreenEl.textContent = session.fullscreen ? "Yes" : "No";
}


/* =========================
   RENDER RISK
========================= */

function renderRisk() {

    const risk = calculateRisk();

    riskBadge.textContent = risk.toUpperCase();
    riskBadge.classList.add(risk);

    totalViolationsEl.textContent = session.violations.length;
    tabSwitchCountEl.textContent = session.tabSwitch;
    keyFlagStatusEl.textContent = session.keyFlag ? "Detected" : "No";
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

renderInfo();
renderRisk();
renderLog();