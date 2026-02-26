/* =========================
   USERS DATASET
========================= */

export const users = [
  { id: 1, name: "Rahul Sharma", email: "rahul@example.com", role: "student", status: "active", lastLogin: "2026-02-17", createdAt: "2025-08-01" },
  { id: 2, name: "Ananya Verma", email: "ananya@example.com", role: "student", status: "active", lastLogin: "2026-02-16", createdAt: "2025-08-10" },
  { id: 3, name: "Prof. Kumar", email: "kumar@example.com", role: "faculty", status: "active", lastLogin: "2026-02-15", createdAt: "2024-12-01" },
  { id: 4, name: "Prof. Mehta", email: "mehta@example.com", role: "faculty", status: "disabled", lastLogin: "2026-02-10", createdAt: "2024-11-20" }
];


/* =========================
   ACTIVITY LOG
========================= */

export const activityLog = [
  { id: 1, user: "Prof. Kumar", role: "faculty", action: "Created Mathematics Exam", date: "2026-02-15" },
  { id: 2, user: "Rahul Sharma", role: "student", action: "Submitted Programming Exam", date: "2026-02-16" },
  { id: 3, user: "Admin", role: "admin", action: "Added New Faculty", date: "2026-02-17" }
];


/* =========================
   MONITORING SESSIONS
========================= */

export const monitorSessions = [
  {
    sessionId: 101,
    student: "Rahul Sharma",
    exam: "Mathematics",
    os: "Windows 11",
    browser: "Chrome",
    ip: "192.168.1.12",
    tabSwitch: 2,
    keyFlag: true,
    fullscreen: true,
    status: "active",
    violations: [
      { time: "10:12 AM", type: "Tab switched to another window" },
      { time: "10:18 AM", type: "Copy shortcut detected (Ctrl+C)" }
    ]
  },
  {
    sessionId: 102,
    student: "Ananya Verma",
    exam: "Programming",
    os: "macOS",
    browser: "Safari",
    ip: "192.168.1.25",
    tabSwitch: 0,
    keyFlag: false,
    fullscreen: true,
    status: "completed",
    violations: []
  }
];


/* =========================
   RESULTS DATASET
========================= */

export const results = [
  { examId: 1, examName: "Mathematics", appeared: 60, passed: 50, failed: 10 },
  { examId: 2, examName: "Programming", appeared: 60, passed: 45, failed: 15 }
];


/* =========================
   ADMIN PROFILE
========================= */

export const adminProfile = {
  name: "System Administrator",
  email: "admin@example.com",
  role: "Super Admin",
  department: "Examination Cell",
  contact: "+91 9876543210",
  joined: "01-Jan-2025"
};