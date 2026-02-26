document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);
    const submissionId = Number(params.get("id"));

    if (!submissionId) {
        alert("Invalid submission.");
        window.location.href = "submissions.html";
        return;
    }

    let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
    const exams = JSON.parse(localStorage.getItem("exams")) || [];

    const submission = submissions.find(s => s.id === submissionId);

    if (!submission) {
        alert("Submission not found.");
        window.location.href = "submissions.html";
        return;
    }

    const exam = exams.find(e => e.id === submission.examId);

    if (!exam) {
        alert("Exam not found.");
        window.location.href = "submissions.html";
        return;
    }

    const container = document.querySelector(".form-section");

    // Clear old static content
    container.innerHTML = `
        <div class="section-header">
            <h2>Evaluate: ${submission.studentName}</h2>
        </div>
    `;

    let totalMarks = 0;

    exam.questions.forEach((q, index) => {

        const studentAnswerIndex = submission.answers[index];
        const studentAnswer =
            studentAnswerIndex !== null && studentAnswerIndex !== undefined
                ? q.options[studentAnswerIndex]
                : "Not Answered";

        const correctAnswerLetter = q.correctAnswer;
        const correctAnswerIndex = correctAnswerLetter.charCodeAt(0) - 65;
        const correctAnswer = q.options[correctAnswerIndex];

        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question-card");

        questionDiv.innerHTML = `
            <div class="question-header">
                <h4>Question ${index + 1}</h4>
            </div>

            <p><strong>Question:</strong> ${q.questionText}</p>
            <p><strong>Student Answer:</strong> ${studentAnswer}</p>
            <p><strong>Correct Answer:</strong> ${correctAnswer}</p>

            <div class="form-group">
                <label>Marks (Out of 5)</label>
                <input type="number" min="0" max="5" class="mark-input" data-index="${index}">
            </div>
        `;

        container.appendChild(questionDiv);
    });

    // ===== TOTAL SECTION =====

    const totalSection = document.createElement("div");
    totalSection.classList.add("question-card");

    totalSection.innerHTML = `
        <div class="question-header">
            <h4>Total Evaluation</h4>
        </div>

        <div class="form-group">
            <label>Total Marks</label>
            <input type="number" id="totalMarks" readonly>
        </div>

        <div style="margin-top:15px;">
            <button class="primary-btn" id="saveEvaluation">
                Save Evaluation
            </button>
        </div>
    `;

    container.appendChild(totalSection);

    const markInputs = document.querySelectorAll(".mark-input");
    const totalMarksInput = document.getElementById("totalMarks");

    // ===== Auto Calculate Total =====

    markInputs.forEach(input => {
        input.addEventListener("input", function () {

            let sum = 0;

            markInputs.forEach(i => {
                const value = Number(i.value);
                if (!isNaN(value)) sum += value;
            });

            totalMarksInput.value = sum;
        });
    });

    // ===== Save Evaluation =====

    document.getElementById("saveEvaluation").addEventListener("click", function () {

        for (let input of markInputs) {
            const value = Number(input.value);

            if (isNaN(value) || value < 0 || value > 5) {
                alert("Marks must be between 0 and 5.");
                return;
            }
        }

        submission.totalMarks = Number(totalMarksInput.value);
        submission.status = "Graded";

        localStorage.setItem("submissions", JSON.stringify(submissions));

        alert("Evaluation saved successfully!");

        window.location.href = "submissions.html";
    });

});
