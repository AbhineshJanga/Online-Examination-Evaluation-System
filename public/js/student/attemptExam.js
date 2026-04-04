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

// ================= FULL SCREEN FUNCTIONS =================

async function requestFullScreen() {
    try {
        const elem = document.documentElement;

        if (elem.requestFullscreen) {
            await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
            await elem.msRequestFullscreen();
        }

        console.log("✅ Entered full screen mode");
    } catch (error) {
        console.error("❌ Failed to enter full screen:", error);
        alert("Please enable full screen mode for this exam.");
    }
}

// ================= ATTEMPT EXAM =================

let currentQuestionIndex = 0;
let currentExamQuestions = [];
let examTimerInterval;
let selectedAnswers = [];
let startTime;
let currentExamId;
let currentExam;

async function initAttemptExam() {

    console.log("Attempt Exam Initialized");

    // ================= FULL SCREEN MODE =================
    await requestFullScreen();



    const params = new URLSearchParams(window.location.search);
    currentExamId = params.get("examId");
    // ================= SOCKET MONITORING =================

    const socket = io("http://localhost:5000");

    // After examId is set (IMPORTANT)
    socket.emit("join-exam", {
        userId: student.id,
        examId: currentExamId
    });

    // Tab switch
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            socket.emit("monitoring-event", {
                userId: student.id,
                examId: currentExamId,
                type: "TAB_SWITCH"
            });
        }
    });

    // Window blur
    window.addEventListener("blur", () => {
        socket.emit("monitoring-event", {
            userId: student.id,
            examId: currentExamId,
            type: "WINDOW_BLUR"
        });
    });

    // Fullscreen exit
    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
            socket.emit("monitoring-event", {
                userId: student.id,
                examId: currentExamId,
                type: "FULLSCREEN_EXIT"
            });

            setTimeout(() => {
                requestFullScreen();
            }, 1000);
        }
    });

    if (!currentExamId) {
        alert("Invalid exam ID");
        window.location.href = "viewexams.html";
        return;
    }

    const exams = await getPublishedExams();
    currentExam = exams.find(e => e._id === currentExamId);

    if (!currentExam) {
        alert("Exam not found");
        window.location.href = "viewexams.html";
        return;
    }

    // Reset state
    currentQuestionIndex = 0;
    clearInterval(examTimerInterval);

    const examTitleEl = document.querySelector(".exam-title");
    if (examTitleEl)
        examTitleEl.textContent = currentExam.title;

    // Use teacher-created questions
    currentExamQuestions = currentExam.questions || [];

    selectedAnswers = new Array(currentExamQuestions.length).fill(null);
    startTime = Date.now();

    // If no questions
    if (currentExamQuestions.length === 0) {
        const questionSection = document.querySelector('.question-section');
        const optionsSection = document.querySelector('.options-section');

        if (questionSection)
            questionSection.innerHTML = '<p>No questions available for this exam.</p>';

        if (optionsSection)
            optionsSection.style.display = 'none';

        return;
    }

    loadQuestion();

    // Use exam duration
    startTimer(currentExam.duration || 30);
}

function loadQuestion() {
    const questionObj = currentExamQuestions[currentQuestionIndex];

    if (!questionObj) return;

    document.querySelector(".question-number").textContent =
        "Question " + (currentQuestionIndex + 1);

    document.querySelector(".question-text").textContent =
        questionObj.questionText;

    const prevBtn = document.querySelector('.prev-btn');
    if (prevBtn) {
        prevBtn.disabled = currentQuestionIndex === 0;
    }

    const optionsContainer = document.querySelector(".options-container");
    optionsContainer.innerHTML = "";

    questionObj.options.forEach((option, index) => {

        const label = document.createElement("label");
        label.classList.add("option-card");

        label.innerHTML = `
            <input type="radio" name="option" value="${index}" />
            <div class="option-content">${option}</div>
        `;

        optionsContainer.appendChild(label);
    });

    // Restore previous selection
    if (selectedAnswers[currentQuestionIndex] !== null) {
        const valueToCheck = String(selectedAnswers[currentQuestionIndex]);
        const radios = document.querySelectorAll('input[name="option"]');
        radios.forEach(r => {
            if (r.value === valueToCheck) r.checked = true;
        });
    }

    // Update navigation button text when on last question

    const nextBtn = document.querySelector('.next-btn');
    if (nextBtn) {
        if (currentQuestionIndex === currentExamQuestions.length - 1) {
            nextBtn.textContent = 'Review';
        } else {
            nextBtn.textContent = 'Next';
        }
    }
}

document.addEventListener("change", function (e) {
    if (e.target.name === "option") {
        selectedAnswers[currentQuestionIndex] = parseInt(e.target.value);
    }
});

//get time taken
function getTimeTaken() {
    const endTime = Date.now();
    const diffSeconds = Math.floor((endTime - startTime) / 1000);

    const hours = Math.floor(diffSeconds / 3600);
    const mins = Math.floor((diffSeconds % 3600) / 60);
    const secs = diffSeconds % 60;

    return `${String(hours).padStart(2, "0")}:` +
        `${String(mins).padStart(2, "0")}:` +
        `${String(secs).padStart(2, "0")}`;
}

//Timer
function startTimer(minutes) {
    let totalSeconds = minutes * 60;
    const timerDisplay = document.querySelector(".timer-display");

    examTimerInterval = setInterval(() => {
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (timerDisplay) {
            timerDisplay.textContent = `${String(hours).padStart(2, "0")}:` +
                `${String(mins).padStart(2, "0")}:` +
                `${String(secs).padStart(2, "0")}`;
        }

        totalSeconds--;

        if (totalSeconds < 0) {
            clearInterval(examTimerInterval);
            alert("Time is up! Auto-submitting your exam...");
            autoSubmitExam();
        }

    }, 1000);
}

async function autoSubmitExam() {
    // Force save last answer
    const selectedRadio = document.querySelector('input[name="option"]:checked');
    if (selectedRadio) {
        selectedAnswers[currentQuestionIndex] = parseInt(selectedRadio.value);
    }

    await submitExamToAPI();
}

//Navigation btns
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("next-btn")) {

        // If NOT last question → go next
        if (currentQuestionIndex < currentExamQuestions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        }
        else {
            // REVIEW MODE - show summary
            const attempted = selectedAnswers.filter(a => a !== null).length;
            const total = currentExamQuestions.length;
            const skipped = total - attempted;

            alert(`Exam Summary:\n\nTotal Questions: ${total}\nAttempted: ${attempted}\nSkipped: ${skipped}\n\nClick "Finish Exam" to submit.`);
        }
    }

    if (e.target.classList.contains("prev-btn")) {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
    }

    if (e.target.classList.contains("finish-exam")) {
        clearInterval(examTimerInterval);

        // Force save last answer
        const selectedRadio = document.querySelector('input[name="option"]:checked');
        if (selectedRadio) {
            selectedAnswers[currentQuestionIndex] = parseInt(selectedRadio.value);
        }

        // Submit exam to API
        submitExamToAPI();
    }
});

async function submitExamToAPI() {
    const answers = selectedAnswers.map((selectedIndex, questionIndex) => {
        if (selectedIndex === null) return null;

        return {
            questionIndex: questionIndex,
            selectedOption: selectedIndex
        };
    }).filter(a => a !== null);

    const payload = {
        examId: currentExamId,
        answers: answers
    };

    const response = await apiCall("/exams/submit", "POST", payload);

    if (response && response.success) {
        const examSummary = {
            examId: currentExamId,
            examName: currentExam.title,
            attempted: answers.length,
            totalQuestions: currentExamQuestions.length,
            timeTaken: getTimeTaken(),
            score: response.score,
            totalQuestions: response.totalQuestions
        };

        localStorage.setItem("examSummary", JSON.stringify(examSummary));
        alert("Exam submitted successfully!");
        window.location.href = "exam-submitted.html";
    } else {
        alert("Failed to submit exam. Please try again.");
    }
}

// ================= INIT =================

document.addEventListener("DOMContentLoaded", function () {
    const currentPage = window.location.pathname.toLowerCase();

    if (currentPage.includes("attempt-exam.html")) {
        initAttemptExam();
    }
});