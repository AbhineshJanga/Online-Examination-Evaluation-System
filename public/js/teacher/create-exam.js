// ================= AUTH CHECK =================
const token = localStorage.getItem("token");
let user = null;

try {
    user = JSON.parse(localStorage.getItem("user"));
} catch (e) {
    console.error("Invalid user data in localStorage", e);
}

if (!token || !user || user.role !== "teacher") {
    alert("Access denied. You must be logged in as a teacher to create exams.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../login.html?role=teacher";
}

const API_BASE_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".exam-form");
    const addQuestionBtn = document.getElementById("addQuestionBtn");
    const questionsContainer = document.getElementById("questionsContainer");

    let questionCount = document.querySelectorAll(".question-card").length;

    function updateQuestionNumbers() {
        const allQuestions = document.querySelectorAll(".question-card");
        allQuestions.forEach((q, index) => {
            q.querySelector("h4").textContent = `Question ${index + 1}`;
        });
        questionCount = allQuestions.length;
    }

    function attachRemoveFunctionality() {
        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.onclick = function () {
                this.closest(".question-card").remove();
                updateQuestionNumbers();
            };
        });
    }

    attachRemoveFunctionality();

    addQuestionBtn.addEventListener("click", () => {
        questionCount++;

        const placeholder = document.querySelector(".question-placeholder");
        if (placeholder) placeholder.remove();

        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question-card");

        questionDiv.innerHTML = `
            <div class="question-header">
                <h4>Question ${questionCount}</h4>
                <button type="button" class="remove-btn">Remove</button>
            </div>

            <div class="form-group">
                <label>Question Text</label>
                <textarea rows="3" placeholder="Enter question"></textarea>
            </div>

            <div class="options-grid">
                <input type="text" placeholder="Option A">
                <input type="text" placeholder="Option B">
                <input type="text" placeholder="Option C">
                <input type="text" placeholder="Option D">
            </div>

            <div class="form-group">
                <label>Correct Answer</label>
                <select>
                    <option value="">Select</option>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                </select>
            </div>
        `;

        questionsContainer.appendChild(questionDiv);
        attachRemoveFunctionality();
        updateQuestionNumbers();
    });

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const subject = form.querySelector('input[type="text"]').value.trim();
        const courseId = form.querySelectorAll('input[type="text"]')[1].value.trim();
        const instructions = form.querySelector("textarea").value.trim();
        const format = form.querySelector("select").value;
        const date = form.querySelector('input[type="date"]').value;
        const duration = form.querySelector('input[type="number"]').value;

        if (!subject) {
            alert("Subject is required.");
            return;
        }

        if (!courseId) {
            alert("Course ID is required.");
            return;
        }

        if (!instructions) {
            alert("Instructions are required.");
            return;
        }

        if (!date) {
            alert("Exam date is required.");
            return;
        }

        if (!duration || duration <= 0) {
            alert("Duration must be greater than 0.");
            return;
        }

        const questionCards = document.querySelectorAll(".question-card");
        if (questionCards.length === 0) {
            alert("Please add at least one question.");
            return;
        }

        const questions = [];
        for (let card of questionCards) {
            const questionText = card.querySelector("textarea").value.trim();
            const optionInputs = card.querySelectorAll(".options-grid input");
            const selectedAnswer = card.querySelector("select").value;

            if (!questionText) {
                alert("Question text cannot be empty.");
                return;
            }

            const options = [];
            for (let opt of optionInputs) {
                if (!opt.value.trim()) {
                    alert("All options must be filled.");
                    return;
                }
                options.push(opt.value.trim());
            }

            if (!selectedAnswer) {
                alert("Please select the correct answer.");
                return;
            }

            const answerMap = { A: 0, B: 1, C: 2, D: 3 };
            const correctAnswer = answerMap[selectedAnswer];

            if (correctAnswer === undefined) {
                alert("Correct answer must be A, B, C, or D.");
                return;
            }

            questions.push({
                questionText,
                options,
                correctAnswer
            });
        }

        const payload = {
            title: subject,
            description: `${instructions} | Course: ${courseId} | Format: ${format} | Date: ${date}`,
            duration: Number(duration),
            questions
        };

        try {
            const response = await fetch(`${API_BASE_URL}/exams`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    alert(data.message || "Unauthorized. Please login again.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "../login.html?role=teacher";
                    return;
                }
                throw new Error(data.message || "Failed to create exam");
            }

            if (!data.success) {
                throw new Error(data.message || "Failed to create exam");
            }

            const localExams = JSON.parse(localStorage.getItem("exams")) || [];
            localExams.push({
                id: data.exam._id || Date.now(),
                subject,
                courseId,
                instructions,
                format,
                date,
                duration,
                questions,
                status: "Published"
            });
            localStorage.setItem("exams", JSON.stringify(localExams));

            alert("Exam created successfully!");
            window.location.href = "manage-exams.html";
        } catch (error) {
            console.error("Create exam API error:", error);
            alert(error.message || "Could not create exam on server. Please try again.");
        }
    });
});

