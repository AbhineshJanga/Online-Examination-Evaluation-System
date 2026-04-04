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

// ================= WELCOME MESSAGE =================

function setWelcomeMessage() {

    const welcomeHeading = document.querySelector(".topbar h1");
    const profileBox = document.querySelector(".profile-box");

    if (welcomeHeading)
        welcomeHeading.textContent = `Welcome, ${student.name}`;

    if (profileBox)
        profileBox.textContent = student.name.charAt(0).toUpperCase();
}

// ================= LOGOUT =================

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully");
    window.location.href = "../login.html";
}

// ================= EXAM SUBMITTED =================

async function initExamSubmitted() {
    const examNameEl = document.querySelector(".exam-name");
    const timeTakenEl = document.querySelector(".time-taken");
    const attemptedEl = document.querySelector(".attempted");
    const statusEl = document.querySelector(".result-status");
    const scoreEl = document.querySelector(".score-display");

    function applySummary(summary) {
        if (!summary) return;
        if (examNameEl) examNameEl.textContent = summary.examName || "Unknown Exam";
        if (timeTakenEl) timeTakenEl.textContent = summary.timeTaken || "N/A";
        if (attemptedEl) attemptedEl.textContent = `${summary.attempted || 0} / ${summary.totalQuestions || 0}`;
        if (statusEl) statusEl.textContent = summary.status || "Not Published";
        if (scoreEl && summary.score !== undefined) {
            scoreEl.textContent = `Score: ${summary.score}/${summary.totalQuestions}`;
            const percentage = summary.totalQuestions > 0 ? Math.round((summary.score / summary.totalQuestions) * 100) : 0;
            scoreEl.innerHTML += `<p>Percentage: ${percentage}%</p>`;
        }
    }

    const localSummary = JSON.parse(localStorage.getItem("examSummary"));
    if (localSummary) {
        applySummary(localSummary);
    }

    try {
        const results = await getStudentResults();
        const latestResult = results[0];

        if (!latestResult) {
            if (!localSummary) {
                if (examNameEl) examNameEl.textContent = "No recent submission";
                if (timeTakenEl) timeTakenEl.textContent = "N/A";
                if (attemptedEl) attemptedEl.textContent = "N/A";
                if (statusEl) statusEl.textContent = "Not Published";
            }
            return;
        }

        const examTitle = latestResult.exam?.title || "Unknown Exam";
        const answerCount = Array.isArray(latestResult.answers) ? latestResult.answers.length : 0;
        const totalQuestions = latestResult.totalQuestions || (latestResult.exam?.questions?.length || 0);

        if (examNameEl) examNameEl.textContent = examTitle;
        if (timeTakenEl) timeTakenEl.textContent = "N/A";
        if (attemptedEl) attemptedEl.textContent = `${answerCount} / ${totalQuestions}`;
        if (statusEl) statusEl.textContent = latestResult.status || "Not Published";

        if (scoreEl) {
            const score = latestResult.score ?? 0;
            scoreEl.textContent = `Score: ${score}/${totalQuestions}`;
            const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
            scoreEl.innerHTML += `<p>Percentage: ${percentage}%</p>`;
        }
    } catch (error) {
        console.error("Error loading exam submission:", error);
        if (!localSummary) {
            if (examNameEl) examNameEl.textContent = "No recent submission";
            if (timeTakenEl) timeTakenEl.textContent = "N/A";
            if (attemptedEl) attemptedEl.textContent = "N/A";
            if (statusEl) statusEl.textContent = "Not Published";
        }
    }
}

// ================= MY RESULTS =================

async function initMyResults() {
    setWelcomeMessage();
    await loadMyResults();
}

async function loadMyResults() {

    const resultGrid = document.querySelector(".result-grid");
    if (!resultGrid) return;

    resultGrid.innerHTML = "";

    console.log('📥 Fetching student results...');
    const results = await getStudentResults();
    console.log('✅ Results loaded:', results);

    if (!results || results.length === 0) {
        resultGrid.innerHTML = "<p>No results available yet.</p>";
        return;
    }

    results.forEach(result => {
        // Exam should be populated in the result
        const exam = result.exam;

        if (!exam) {
            console.warn('⚠️ Result missing exam data:', result);
            return;
        }

        const card = document.createElement("div");
        card.classList.add("result-card");

        const correctCount = result.answers.reduce((sum, answer) => {
            const question = exam.questions[answer.questionIndex];
            if (!question) return sum;

            let correctIndex;
            if (typeof question.correctAnswer === "number") {
                correctIndex = question.correctAnswer;
            } else if (typeof question.correctAnswer === "string") {
                correctIndex = question.correctAnswer.toUpperCase().charCodeAt(0) - 65;
            } else {
                correctIndex = 0;
            }

            return sum + (answer.selectedOption === correctIndex ? 1 : 0);
        }, 0);

        const wrongCount = (result.totalQuestions || exam.questions.length) - correctCount;
        const finalScore = result.score;
        const maxMarks = result.totalQuestions || exam.questions.length;
        const displayScore = `${finalScore}/${maxMarks}`;
        const displayPercent = `${Math.round((finalScore / maxMarks) * 100)}%`;
        const statusClass = ((finalScore / maxMarks) * 100 >= 40 ? "pass" : "fail");
        const statusText = ((finalScore / maxMarks) * 100 >= 40 ? "Passed" : "Failed");

        console.log('Display card for:', exam.title, 'Status:', statusText);

        card.innerHTML = `
            <h3>${exam.title}</h3>
            <p class="result-date">Date: ${new Date(result.submittedAt).toLocaleDateString()}</p>
            <p class="result-score">Score: ${displayScore}</p>
            <p class="result-percentage">Percentage: ${displayPercent}</p>
            <p><strong>Correct:</strong> ${correctCount} | <strong>Wrong:</strong> ${wrongCount}</p>
            <p class="result-status ${statusClass}">Status: ${statusText}</p>
            <a href="result-details.html?resultId=${result._id}" class="start-btn">
                Result Details
            </a>
        `;

        resultGrid.appendChild(card);
    });
}

// ================= RESULT DETAILS =================

async function initResultDetails() {

    const params = new URLSearchParams(window.location.search);
    const resultId = params.get("resultId");

    if (!resultId) {
        alert("Invalid result ID");
        window.location.href = "my-results.html";
        return;
    }

    console.log('📥 Fetching result details for ID:', resultId);
    const results = await getStudentResults();
    const result = results.find(r => r._id === resultId);

    if (!result) {
        alert("Result not found");
        window.location.href = "my-results.html";
        return;
    }

    console.log('✅ Result found:', result);

    // Exam should be populated in the result
    const exam = result.exam;
    if (!exam || typeof exam !== 'object') {
        alert("Exam data not found");
        console.error('❌ Exam not properly populated:', exam);
        return;
    }

    console.log('✅ Exam data:', exam);

    // Display result summary
    const examName = document.querySelector(".result-exam-name");
    const resultTotal = document.querySelector(".result-total");
    const resultCorrect = document.querySelector(".result-correct");
    const resultWrong = document.querySelector(".result-wrong");
    const resultMarks = document.querySelector(".result-marks");
    const resultPercentage = document.querySelector(".result-percentage");
    const statusEl = document.querySelector(".result-status");

    // Calculate correct / wrong / unanswered by comparing answers with exam.correctAnswer
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    exam.questions.forEach((question, index) => {
        const studentAnswer = result.answers.find(a => a.questionIndex === index);

        if (!studentAnswer || studentAnswer.selectedOption === null || studentAnswer.selectedOption === undefined) {
            unansweredCount++;
            return;
        }

        let correctIndex;
        if (typeof question.correctAnswer === "number") {
            correctIndex = question.correctAnswer;
        } else if (typeof question.correctAnswer === "string") {
            correctIndex = question.correctAnswer.toUpperCase().charCodeAt(0) - 65;
        } else {
            correctIndex = 0;
        }

        if (studentAnswer.selectedOption === correctIndex) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });

    if (examName) examName.textContent = exam.title;
    if (resultTotal) resultTotal.textContent = result.totalQuestions;
    if (resultCorrect) resultCorrect.textContent = `${correctCount}`;
    if (resultWrong) resultWrong.textContent = `${wrongCount}`;

    const maxMarks = result.totalQuestions;
    const finalScore = result.score;
    const percentage = Math.round((finalScore / maxMarks) * 100);

    if (resultMarks) resultMarks.textContent = `${finalScore}/${maxMarks}`;
    if (resultPercentage) resultPercentage.textContent = `${percentage}%`;

    const statusClass = (percentage >= 40 ? "pass" : "fail");
    const statusText = (percentage >= 40 ? "Passed" : "Failed");

    if (statusEl) {
        statusEl.textContent = `Status: ${statusText}`;
        statusEl.className = `result-status ${statusClass}`;
    }

    // Display answer review if needed
    displayAnswerReview(exam, result);
}

function displayAnswerReview(exam, result) {
    const reviewContainer = document.querySelector(".answer-review");
    if (!reviewContainer) return;

    reviewContainer.innerHTML = "";

    exam.questions.forEach((question, index) => {
        const studentAnswer = result.answers.find(a => a.questionIndex === index);

        // Handle both number (0-3) and letter (A-D) formats for correct answer
        let correctIndex;
        if (typeof question.correctAnswer === "number") {
            correctIndex = question.correctAnswer;
        } else if (typeof question.correctAnswer === "string") {
            correctIndex = question.correctAnswer.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
        } else {
            correctIndex = 0; // fallback
        }

        const isCorrect = studentAnswer?.selectedOption === correctIndex;

        const div = document.createElement("div");
        div.className = `question-review ${isCorrect ? "correct" : "incorrect"}`;
        div.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${question.questionText}</p>
            <p><strong>Your Answer:</strong> ${studentAnswer ? question.options[studentAnswer.selectedOption] : "Not answered"}</p>
            <p><strong>Correct Answer:</strong> ${question.options[correctIndex] || "Unknown"}</p>
        `;
        reviewContainer.appendChild(div);
    });
}

// ================= INIT =================

document.addEventListener("DOMContentLoaded", async function () {

    const currentPage = window.location.pathname.toLowerCase();

    if (currentPage.includes("exam-submitted.html")) {
        await initExamSubmitted();
    }

    if (currentPage.includes("my-results.html")) {
        await initMyResults();
    }

    if (currentPage.includes("result-details.html")) {
        await initResultDetails();
    }

});