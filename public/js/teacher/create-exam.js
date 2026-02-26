document.addEventListener("DOMContentLoaded", () => {

    const addQuestionBtn = document.getElementById("addQuestionBtn");
    const questionsContainer = document.getElementById("questionsContainer");

    let questionCount = document.querySelectorAll(".question-card").length;

    // Function to update numbering
    function updateQuestionNumbers() {
        const allQuestions = document.querySelectorAll(".question-card");
        allQuestions.forEach((q, index) => {
            q.querySelector("h4").textContent = `Question ${index + 1}`;
        });
        questionCount = allQuestions.length;
    }

    // Attach remove functionality to existing buttons
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
        if (placeholder) {
            placeholder.remove();
        }

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

});
document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector(".exam-form");
    const addQuestionBtn = document.getElementById("addQuestionBtn");
    const questionsContainer = document.getElementById("questionsContainer");

    let questionCount = document.querySelectorAll(".question-card").length;

    // ================= QUESTION NUMBER UPDATE =================

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

    // ================= ADD QUESTION =================

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

    // ================= FORM SUBMISSION =================

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // ===== BASIC DETAILS =====
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

        let questions = [];

        for (let card of questionCards) {

            const questionText = card.querySelector("textarea").value.trim();
            const optionInputs = card.querySelectorAll(".options-grid input");
            const correctAnswer = card.querySelector("select").value;

            if (!questionText) {
                alert("Question text cannot be empty.");
                return;
            }

            let options = [];

            for (let opt of optionInputs) {
                if (!opt.value.trim()) {
                    alert("All options must be filled.");
                    return;
                }
                options.push(opt.value.trim());
            }

            if (!correctAnswer) {
                alert("Please select correct answer.");
                return;
            }

            questions.push({
                questionText,
                options,
                correctAnswer
            });
        }

        // ===== SAVE EXAM =====
        const exams = JSON.parse(localStorage.getItem("exams")) || [];

        const newExam = {
            id: Date.now(),
            subject,
            courseId,
            instructions,
            format,
            date,
            duration,
            questions,
            status: "Draft"
        };

        exams.push(newExam);

        localStorage.setItem("exams", JSON.stringify(exams));

        alert("Exam created successfully!");

        window.location.href = "manage-exams.html";
    });

});
