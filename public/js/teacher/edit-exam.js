document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector(".exam-form");
    const questionsContainer = document.getElementById("questionsContainer");
    const addQuestionBtn = document.getElementById("addQuestionBtn");

    const params = new URLSearchParams(window.location.search);
    const examId = Number(params.get("id"));

    if (!examId) {
        alert("Invalid exam ID.");
        window.location.href = "manage-exams.html";
        return;
    }

    const exams = JSON.parse(localStorage.getItem("exams")) || [];
    const exam = exams.find(e => e.id === examId);

    if (!exam) {
        alert("Exam not found.");
        window.location.href = "manage-exams.html";
        return;
    }

    // ================= LOAD BASIC DETAILS =================

    const textInputs = form.querySelectorAll('input[type="text"]');
    const mainTextarea = form.querySelector(".form-grid textarea");

    textInputs[0].value = exam.subject;
    textInputs[1].value = exam.courseId;
    mainTextarea.value = exam.instructions;

    form.querySelector("select").value = exam.format;
    form.querySelector('input[type="date"]').value = exam.date;
    form.querySelector('input[type="number"]').value = exam.duration;

    // ================= LOAD QUESTIONS =================

    questionsContainer.innerHTML = "";

    exam.questions.forEach((q, index) => {

        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question-card");

        questionDiv.innerHTML = `
            <div class="question-header">
                <h4>Question ${index + 1}</h4>
                <button type="button" class="remove-btn">Remove</button>
            </div>

            <div class="form-group">
                <label>Question Text</label>
                <textarea rows="3">${q.questionText}</textarea>
            </div>

            <div class="options-grid">
                <input type="text" value="${q.options[0]}">
                <input type="text" value="${q.options[1]}">
                <input type="text" value="${q.options[2]}">
                <input type="text" value="${q.options[3]}">
            </div>

            <div class="form-group">
                <label>Correct Answer</label>
                <select>
                    <option ${q.correctAnswer === "A" ? "selected" : ""}>A</option>
                    <option ${q.correctAnswer === "B" ? "selected" : ""}>B</option>
                    <option ${q.correctAnswer === "C" ? "selected" : ""}>C</option>
                    <option ${q.correctAnswer === "D" ? "selected" : ""}>D</option>
                </select>
            </div>
        `;

        questionsContainer.appendChild(questionDiv);
    });

    attachRemoveFunctionality();

    function attachRemoveFunctionality() {
        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.onclick = function () {
                this.closest(".question-card").remove();
                updateNumbers();
            };
        });
    }

    function updateNumbers() {
        const allQuestions = document.querySelectorAll(".question-card");
        allQuestions.forEach((q, index) => {
            q.querySelector("h4").textContent = `Question ${index + 1}`;
        });
    }

    // ================= UPDATE EXAM =================

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const subject = textInputs[0].value.trim();
        const courseId = textInputs[1].value.trim();
        const instructions = mainTextarea.value.trim();
        const format = form.querySelector("select").value;
        const date = form.querySelector('input[type="date"]').value;
        const duration = form.querySelector('input[type="number"]').value;

        if (!subject || !courseId || !instructions || !date || duration <= 0) {
            alert("Please fill all required fields.");
            return;
        }

        const questionCards = document.querySelectorAll(".question-card");

        if (questionCards.length === 0) {
            alert("At least one question required.");
            return;
        }

        let updatedQuestions = [];

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

            updatedQuestions.push({
                questionText,
                options,
                correctAnswer
            });
        }

        // Update exam in array
        const index = exams.findIndex(e => e.id === examId);

        exams[index] = {
            ...exam,
            subject,
            courseId,
            instructions,
            format,
            date,
            duration,
            questions: updatedQuestions
        };

        localStorage.setItem("exams", JSON.stringify(exams));

        alert("Exam updated successfully!");

        window.location.href = "manage-exams.html";
    });

});
