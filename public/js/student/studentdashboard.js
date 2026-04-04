// ================= AUTH CHECK =================

const token = localStorage.getItem("token");
let user = null;

try {
    user = JSON.parse(localStorage.getItem("user"));
} catch (e) {
    console.error("Invalid user data in localStorage");
}

if (!token || !user) {
    alert("Unauthorized access. Please login.");
    window.location.href = "../login.html";
}

if (user.role !== "student") {
    alert("Access denied. Student only.");
    window.location.href = "../login.html";
}

// ================= API BASE URL =================

const API_BASE_URL = "/api";

// ================= USER DATA =================

const student = {
    id: user.id,
    name: user.name || "Student",
    email: user.email || "",
    role: user.role,
    department: "CSE",
    registration: "N/A"
};

// ================= API HELPERS =================

async function apiCall(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            if (response.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "../login.html";
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
}

// ================= DATA FETCHING =================

async function getPublishedExams() {
    const response = await apiCall("/exams");
    if (!response || !response.success) return [];
    return response.exams || [];
}

async function getStudentResults() {
    const response = await apiCall("/exams/my-results");
    if (!response || !response.success) return [];
    return response.results || [];
}

// ================= DASHBOARD =================

async function initDashboard() {
    console.log("Dashboard Initialized");
    setWelcomeMessage();
    await updateStats();
    await loadUpcomingExams();
}

function setWelcomeMessage() {

    const welcomeHeading = document.querySelector(".topbar h1");
    const profileBox = document.querySelector(".profile-box");

    if (welcomeHeading)
        welcomeHeading.textContent = `Welcome, ${student.name}`;

    if (profileBox)
        profileBox.textContent = student.name.charAt(0).toUpperCase();
}

async function updateStats() {

    const exams = await getPublishedExams();
    const results = await getStudentResults();

    const availableExams = getUpcomingExams(exams);
    const avgScore = calculateAverageScore(results);
    const passed = results.filter(r => r.score >= 40).length;
    const failed = results.filter(r => r.score < 40).length;

    const statCards = document.querySelectorAll(".stat-card p");
    if (statCards.length >= 2) {
        statCards[0].textContent = availableExams.length;
        statCards[1].textContent = results.length;
    }

    const scores = document.querySelectorAll(".performance-card .score");
    if (scores.length >= 3) {
        scores[0].textContent = avgScore + "%";
        scores[1].textContent = passed;
        scores[2].textContent = failed;
    }

    const progressBar = document.querySelector(".progress-fill");

    if (!progressBar) {
        console.log("Progress bar not found");
        return;
    }

    progressBar.style.width = avgScore + "%";

    // Change color based on performance
    if (avgScore >= 80) {
        progressBar.style.background = "linear-gradient(135deg, #6a11cb, #2575fc)";
    } else if (avgScore >= 60) {
        progressBar.style.background = "linear-gradient(135deg, #f59e0b, #f97316)";
    } else {
        progressBar.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
    }
}

function getUpcomingExams(exams) {

    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time

    return exams.filter(exam => {
        if (!exam.createdAt) return false;
        const examDate = new Date(exam.createdAt);
        examDate.setHours(0, 0, 0, 0); // remove time

        return examDate >= today;
    });
}

function calculateAverageScore(results) {
    if (results.length === 0) return 0;

    const total = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / results.length);
}

async function loadUpcomingExams() {

    const exams = await getPublishedExams();
    const upcoming = getUpcomingExams(exams);
    const examList = document.querySelector(".exam-list");

    if (!examList) return;

    examList.innerHTML = "";

    if (upcoming.length === 0) {
        examList.innerHTML = "<p>No exams available.</p>";
        return;
    }

    upcoming.forEach(exam => {

        const examItem = document.createElement("div");
        examItem.classList.add("exam-item");

        examItem.innerHTML = `
            <h4>${exam.title}</h4>
            <p>Description: ${exam.description || "N/A"}</p>
            <p>Duration: ${exam.duration} minutes</p>
            <p>Questions: ${exam.questions ? exam.questions.length : 0}</p>
            <button onclick="startExam('${exam._id}')" class="start-btn">Start Exam</button>
        `;

        examList.appendChild(examItem);
    });
}

function startExam(examId) {
    window.location.href = `./attempt-exam.html?examId=${examId}`;
}

// ================= PROFILE =================

async function initProfile() {
    // Update topbar welcome/avatar and profile card
    setWelcomeMessage();
    setProfileDetails();
    setProfileAvatar();
}

function setProfileDetails() {

    const details = document.querySelector(".profile-details");

    if (!details) return;

    details.innerHTML = `
        <p><strong>Full Name:</strong> ${student.name}</p>
        <p><strong>Email:</strong> ${student.email}</p>
        <p><strong>Role:</strong> ${student.role}</p>
        <p><strong>User ID:</strong> ${student.id}</p>
        <p><strong>Department:</strong> ${student.department}</p>
        <p><strong>Registration:</strong> ${student.registration}</p>
    `;
}

function setProfileAvatar() {

    const avatar = document.querySelector(".profile-avatar");

    if (!avatar) return;

    const firstLetter = student.name.charAt(0).toUpperCase();
    avatar.textContent = firstLetter;
}

// ================= LOGOUT =================

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully");
    window.location.href = "../login.html";
}

document.addEventListener("DOMContentLoaded", async function () {

    const currentPage = window.location.pathname.toLowerCase();

    if (currentPage.includes("dashboard.html")) {
        await initDashboard();
    }

    if (currentPage.includes("profile.html")) {
        await initProfile();
    }

    if (currentPage.includes("viewexams.html")) {
        await initViewExams();
    }

    if (currentPage.includes("view-details.html")) {
        initViewDetails();
    }

});

//View Exams
async function initViewExams() {
    setWelcomeMessage();
    await loadExamsGrid();
}

async function loadExamsGrid() {

    const examGrid = document.querySelector(".exam-grid");

    if (!examGrid) return;

    examGrid.innerHTML = "";

    const exams = await getPublishedExams();
    const upcoming = getUpcomingExams(exams);

    if (upcoming.length === 0) {
        examGrid.innerHTML = "<p>No exams available.</p>";
        return;
    }

    upcoming.forEach(exam => {

        const card = document.createElement("div");
        card.classList.add("exam-card");

        card.innerHTML = `
            <h3>${exam.title}</h3>
            <p>${exam.description || "No description"}</p>
            <p class="exam-date">Duration: ${exam.duration} minutes</p>
            <a href="view-details.html?examId=${exam._id}" class="start-btn">
                View Details
            </a>
        `;

        examGrid.appendChild(card);
    });

}

//View Exam Details

async function initViewDetails() {
    setWelcomeMessage();
    await loadExamDetails();
}

async function loadExamDetails() {

    const params = new URLSearchParams(window.location.search);
    const examId = params.get("examId");

    if (!examId) {
        const detailsCard = document.querySelector(".exam-details-card");
        if (detailsCard)
            detailsCard.innerHTML = "<h3>Invalid exam ID.</h3>";
        return;
    }

    const exams = await getPublishedExams();
    const exam = exams.find(e => e._id === examId);

    if (!exam) {
        const detailsCard = document.querySelector(".exam-details-card");
        if (detailsCard)
            detailsCard.innerHTML = "<h3>Exam not found.</h3>";
        return;
    }

    const examTitle = document.querySelector(".exam-title");
    const examDate = document.querySelector(".exam-date");
    const examTime = document.querySelector(".exam-time");
    const examQuestions = document.querySelector(".exam-questions");
    const examType = document.querySelector(".exam-type");
    const examMarks = document.querySelector(".exam-marks");
    const examDescription = document.querySelector(".exam-description");

    if (examTitle) examTitle.textContent = exam.title;
    if (examDate) examDate.textContent = new Date(exam.createdAt).toLocaleDateString();
    if (examTime) examTime.textContent = `${exam.duration} minutes`;
    if (examQuestions) examQuestions.textContent = exam.questions ? exam.questions.length : 0;
    if (examType) examType.textContent = "MCQ";
    if (examMarks) examMarks.textContent = exam.questions ? exam.questions.length : 0;
    if (examDescription) examDescription.textContent = exam.description || "No description available";

    // Update attempt link with exam ID
    const attemptBtn = document.querySelector(".attempt-btn");
    if (attemptBtn) {
        attemptBtn.href = `attempt-exam.html?examId=${exam._id}`;

        // Check if student has already attempted this exam
        try {
            const results = await getStudentResults();
            const alreadyAttempted = results.find(r => r.exam._id === exam._id);

            if (alreadyAttempted) {
                attemptBtn.disabled = true;
                attemptBtn.textContent = "Already Attempted";
                attemptBtn.style.backgroundColor = "#ccc";
                attemptBtn.style.cursor = "not-allowed";
                attemptBtn.href = "#";
            }
        } catch (error) {
            console.error("Error checking attempt status:", error);
        }
    }

    // Load student info
    const studentName = document.querySelector(".student-name");
    const studentEmail = document.querySelector(".student-email");

    if (studentName) studentName.textContent = student.name;
    if (studentEmail) studentEmail.textContent = student.email;

}

