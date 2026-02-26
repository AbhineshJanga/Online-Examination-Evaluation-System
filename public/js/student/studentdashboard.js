function getPublishedExams() {
    const exams = JSON.parse(localStorage.getItem("exams")) || [];
    return exams.filter(e => e.status === "Published");
}

// ================= Temp DATA =================

const student = {
    id: 1,
    name: "Abhinesh Janga",
    email: "abhineshjanga@gmail.com",
    department: "CSE",
    registration: "24BIT0401"
};



const results = [
    { examId: 1, score: 99, published: true },
    { examId: 2, score: 35, published: true }
];

// ================= DASHBOARD =================

function initDashboard() {
    console.log("Dashboard Initialized");
    setWelcomeMessage();
    updateStats();
    loadUpcomingExams();
}


function setWelcomeMessage() {

    const welcomeHeading = document.querySelector(".topbar h1");
    const profileBox = document.querySelector(".profile-box");

    welcomeHeading.textContent = `Welcome, ${student.name}`;
    profileBox.textContent = student.name.charAt(0).toUpperCase();
}

function updateStats() {

    const availableExams = getUpcomingExams();
    const publishedResults = results.filter(r => r.published);
    const avgScore = calculateAverageScore(publishedResults);
    const passed = publishedResults.filter(r => r.score >= 40).length;
    const failed = publishedResults.filter(r => r.score < 40).length;

    document.querySelectorAll(".stat-card p")[0].textContent = availableExams.length;
    document.querySelectorAll(".stat-card p")[1].textContent = publishedResults.length;

    document.querySelectorAll(".performance-card .score")[0].textContent = avgScore + "%";

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



    document.querySelectorAll(".performance-card .score")[1].textContent = passed;
    document.querySelectorAll(".performance-card .score")[2].textContent = failed;
}

function getUpcomingExams() {

    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time

    return getPublishedExams().filter(exam => {
        const examDate = new Date(exam.date);
        examDate.setHours(0, 0, 0, 0); // remove time

        return examDate >= today;
    });
}



function calculateAverageScore(publishedResults) {
    if (publishedResults.length === 0) return 0;

    const total = publishedResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / publishedResults.length);
}

function loadUpcomingExams() {

    const upcoming = getUpcomingExams();
    const examList = document.querySelector(".exam-list");

    examList.innerHTML = "";

    if (upcoming.length === 0) {
        examList.innerHTML = "<p>No exams available.</p>";
        return;
    }

    upcoming.forEach(exam => {

        const examItem = document.createElement("div");
        examItem.classList.add("exam-item");

        examItem.innerHTML = `
            <h4>${exam.subject}</h4>
            <p>Date: ${exam.date}</p>
        `;

        examList.appendChild(examItem);
    });
}

// ================= PROFILE =================

function initProfile() {
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
        <p><strong>Registration No:</strong> ${student.registration}</p>
        <p><strong>Department:</strong> ${student.department}</p>
        <p><strong>Phone:</strong> 1234567890</p>
        <p><strong>DOB:</strong> 01-01-2004</p>
    `;
}

function setProfileAvatar() {

    const avatar = document.querySelector(".profile-avatar");

    if (!avatar) return;

    const firstLetter = student.name.charAt(0).toUpperCase();
    avatar.textContent = firstLetter;
}

document.addEventListener("DOMContentLoaded", function () {

    const currentPage = window.location.pathname.toLowerCase();

    if (currentPage.includes("dashboard.html")) {
        initDashboard();
    }

    if (currentPage.includes("profile.html")) {
        initProfile();
    }

    if (currentPage.includes("viewexams.html")) {
        initViewExams();
    }

    if (currentPage.includes("view-details.html")) {
        initViewDetails();
    }

    if (currentPage.includes("attempt-exam.html")) {
        initAttemptExam();
    }

    if (currentPage.includes("exam-submitted.html")) {
        initExamSubmitted();
    }

    if (currentPage.includes("my-results.html")) {
        initMyResults();
    }

    if (currentPage.includes("result-details.html")) {
        initResultDetails();
    }


});


//View Exams
function initViewExams() {
    setWelcomeMessage();
    loadExamsGrid();
}

function loadExamsGrid() {

    const examGrid = document.querySelector(".exam-grid");

    if (!examGrid) return;

    examGrid.innerHTML = "";

    const upcoming = getUpcomingExams();

    if (upcoming.length === 0) {
        examGrid.innerHTML = "<p>No exams available.</p>";
        return;
    }

    upcoming.forEach(exam => {

        const card = document.createElement("div");
        card.classList.add("exam-card");

        card.innerHTML = `
            <h3>${exam.subject}</h3>
            <p class="exam-date">Exam Date: ${exam.date}</p>
            <a href="view-details.html?id=${exam.id}" class="start-btn">
                View Details
            </a>
        `;

        examGrid.appendChild(card);
    });

}


//View Exam Details

function initViewDetails() {
    setWelcomeMessage();
    loadExamDetails();
}

function loadExamDetails() {

    const params = new URLSearchParams(window.location.search);
    const examId = parseInt(params.get("id"));


    const exam = getPublishedExams().find(e => e.id === examId);


    if (!exam) {
        document.querySelector(".exam-details-card").innerHTML =
            "<h3>Exam not found.</h3>";
        return;
    }

    document.querySelector(".exam-title").textContent = exam.subject;
    document.querySelector(".exam-date").textContent = exam.date;
    document.querySelector(".exam-time").textContent = "10:00 AM - 12:00 PM";
    document.querySelector(".exam-questions").textContent = exam.totalQuestions;
    document.querySelector(".exam-type").textContent = "MCQ";
    document.querySelector(".exam-marks").textContent = exam.totalMarks;

    document.querySelector(".exam-description").textContent =
        `This exam covers important concepts of ${exam.subject}.`;

    // Update attempt link with exam ID
    const attemptBtn = document.querySelector(".attempt-btn");
    attemptBtn.href = `Attempt-Exam.html?id=${exam.id}`;

    // Load student info
    document.querySelector(".student-name").textContent = student.name;
    document.querySelector(".student-email").textContent = student.email;

}

//Attempt Exam

const questionBank = {
    1: [
        {
            question: "Which is a core concept of OOP?",
            options: ["Encapsulation", "Compilation", "Linking", "Execution"],
            correct: 0
        },
        {
            question: "Which principle allows reusability?",
            options: ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"],
            correct: 0
        }
    ]
};


let currentQuestionIndex = 0;
let currentExamQuestions = [];
let examTimerInterval;
let selectedAnswers = [];
let startTime;
let currentExamId;
let currentExam;



function initAttemptExam() {

    console.log("Attempt Exam Initialized");

    const params = new URLSearchParams(window.location.search);
    currentExamId = parseInt(params.get("id"));

    currentExam = getPublishedExams().find(e => e.id === currentExamId);

    if (!currentExam) return;

    // Reset state
    currentQuestionIndex = 0;
    clearInterval(examTimerInterval);

    document.querySelector(".exam-title").textContent =
        currentExam.subject + " Exam";

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


//Submitted
function initExamSubmitted() {

    const summary = JSON.parse(localStorage.getItem("examSummary"));

    if (!summary) return;

    document.querySelector(".exam-name").textContent = summary.examName;
    document.querySelector(".time-taken").textContent = summary.timeTaken;
    document.querySelector(".attempted").textContent =
        `${summary.attempted} / ${summary.totalQuestions}`;
}
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

        timerDisplay.textContent = `${String(hours).padStart(2, "0")}:` +
            `${String(mins).padStart(2, "0")}:` +
            `${String(secs).padStart(2, "0")}`;
        totalSeconds--;
        if (totalSeconds < 0) {
            clearInterval(examTimerInterval);

            let submissions = JSON.parse(localStorage.getItem("submissions")) || [];

            submissions.push({
                id: Date.now(),
                examId: currentExamId,
                studentName: student.name,
                answers: selectedAnswers,
                submittedAt: new Date().toISOString(),
                status: "Pending",
                totalMarks: null
            });

            localStorage.setItem("submissions", JSON.stringify(submissions));


            // Also save a summary used by the Exam-Submitted page
            const examSummary = {
                examId: currentExamId,
                examName: currentExam ? currentExam.subject : "",
                attempted: selectedAnswers.filter(a => a !== null).length,
                totalQuestions: currentExamQuestions.length,
                timeTaken: getTimeTaken()
            };

            localStorage.setItem("examSummary", JSON.stringify(examSummary));

            alert("Time is up! Submitting exam.");
            window.location.href = "Exam-Submitted.html";
        }



    }, 1000);
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
            // REVIEW MODE

            // Force save current selected option
            const selectedRadio = document.querySelector('input[name="option"]:checked');
            if (selectedRadio) {
                selectedAnswers[currentQuestionIndex] = parseInt(selectedRadio.value);
            }

            const attempted = selectedAnswers.filter(a => a !== null).length;
            const total = currentExamQuestions.length;

            alert(`You have attempted ${attempted} out of ${total} questions.`);
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

        let submissions = JSON.parse(localStorage.getItem("submissions")) || [];

        submissions.push({
            id: Date.now(),
            examId: currentExamId,
            studentName: student.name,
            answers: selectedAnswers,
            submittedAt: new Date().toISOString(),
            status: "Pending",
            totalMarks: null
        });

        localStorage.setItem("submissions", JSON.stringify(submissions));


        // Also save a lightweight summary for the submission page
        const examSummary = {
            examId: currentExamId,
            examName: currentExam ? currentExam.subject : "",
            attempted: selectedAnswers.filter(a => a !== null).length,
            totalQuestions: currentExamQuestions.length,
            timeTaken: getTimeTaken()
        };

        localStorage.setItem("examSummary", JSON.stringify(examSummary));

        window.location.href = "Exam-Submitted.html";
    }

});
// ================= MY RESULTS =================

function initMyResults() {
    setWelcomeMessage();
    loadMyResults();
}

function loadMyResults() {

    const resultGrid = document.querySelector(".result-grid");
    if (!resultGrid) return;

    resultGrid.innerHTML = "";

    getPublishedExams().forEach(exam => {


        const submissions = JSON.parse(localStorage.getItem("submissions")) || [];

        const submission = submissions.find(s => s.examId === exam.id);


        const card = document.createElement("div");
        card.classList.add("result-card");

        // If student has not attempted
        if (!submission) {

            card.innerHTML = `
                <h3>${exam.subject}</h3>
                <p class="result-date">Exam Date: ${exam.date}</p>
                <p class="result-score">Score: --</p>
                <p class="result-status pending">Status: Not Attempted</p>
                <a href="view-details.html?id=${exam.id}" class="start-btn">
                    View Exam
                </a>
            `;

        } else {

            const evaluation = evaluateExam(exam.id, submission.answers);
            

            card.innerHTML = `
                <h3>${exam.subject}</h3>
                <p class="result-date">Exam Date: ${exam.date}</p>
                <p class="result-score">Score: ${evaluation.percentage}%</p>
                <p class="result-status ${evaluation.statusClass}">
                    Status: ${evaluation.statusText}
                </p>
                <a href="result-details.html?id=${exam.id}" class="start-btn">
                    Result Details
                </a>
            `;
        }

        resultGrid.appendChild(card);
    });
}

function evaluateExam(examId, answers) {

    const exam = getPublishedExams().find(e => e.id === examId);
    const questions = exam ? exam.questions : [];


    if (!questions) {
        return {
            correct: 0,
            wrong: 0,
            percentage: 0,
            statusText: "Not Published",
            statusClass: "pending"
        };
    }

    let correctCount = 0;

    questions.forEach((q, index) => {

        const correctIndex = ["A", "B", "C", "D"].indexOf(q.correctAnswer);

        if (answers[index] === correctIndex) {
            correctCount++;
        }
    });


    const percentage = Math.round(
        (correctCount / questions.length) * 100
    );

    const passed = percentage >= 40;

    return {
        correct: correctCount,
        wrong: questions.length - correctCount,
        percentage: percentage,
        statusText: passed ? "Passed" : "Failed",
        statusClass: passed ? "pass" : "fail"
    };
}

//result function
function initResultDetails() {

    const params = new URLSearchParams(window.location.search);
    const examId = parseInt(params.get("id"));

    const exam = getPublishedExams().find(e => e.id === examId);

    if (!exam) return;

    const submissions = JSON.parse(localStorage.getItem("submissions")) || [];

    const submission = submissions.find(s => s.examId === exam.id);


    if (!submission) {
        document.querySelector(".result-summary-card").innerHTML =
            "<h3>No result available.</h3>";
        return;
    }

    const questions = exam.questions || [];

    const answers = submission.answers;

    let correct = 0;

    questions.forEach((q, index) => {

        const correctIndex = ["A", "B", "C", "D"].indexOf(q.correctAnswer);

        if (answers[index] === correctIndex) {
            correct++;
        }
    });

    const total = questions.length;
    const wrong = total - correct;

    // ✅ total marks based on manual evaluation scheme
    const totalMarks = total * 5;

    // If teacher has not evaluated yet
    if (submission.totalMarks === null) {

        document.querySelector(".result-marks").textContent = "--";
        document.querySelector(".result-percentage").textContent = "--";

        const statusEl = document.querySelector(".result-status");
        statusEl.textContent = "Status: Pending";
        statusEl.classList.add("pending");

        return;   // stop further calculation
    }

    // If evaluated
    const marks = submission.totalMarks;
    const percentage = Math.round((marks / totalMarks) * 100);


    // Fill UI
    document.querySelector(".result-exam-name").textContent = exam.subject;
    document.querySelector(".result-total").textContent = total;
    document.querySelector(".result-correct").textContent = correct;
    document.querySelector(".result-wrong").textContent = wrong;
    document.querySelector(".result-marks").textContent =
        marks + " / " + totalMarks;
    document.querySelector(".result-percentage").textContent =
        percentage + "%";

    const statusEl = document.querySelector(".result-status");

    if (percentage >= 40) {
        statusEl.textContent = "Status: Passed";
        statusEl.classList.add("pass");
    } else {
        statusEl.textContent = "Status: Failed";
        statusEl.classList.add("fail");
    }
}


function initProfile() {
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
        <p><strong>Registration No:</strong> ${student.registration}</p>
        <p><strong>Department:</strong> ${student.department}</p>
        <p><strong>Phone:</strong> 1234567890</p>
        <p><strong>DOB:</strong> 01-01-2004</p>
    `;
}
function setProfileAvatar() {
    const avatar = document.querySelector(".profile-avatar");
    if (!avatar) return;

    const firstLetter = student.name.charAt(0).toUpperCase();
    avatar.textContent = firstLetter;
}

