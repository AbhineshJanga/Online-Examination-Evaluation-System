document.addEventListener("DOMContentLoaded", async function () {

    const params = new URLSearchParams(window.location.search);
    const submissionId = params.get("id");

    if (!submissionId) {
        alert("Invalid submission.");
        window.location.href = "submissions.html";
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view submission details.");
        window.location.href = "../login.html";
        return;
    }

    const submissionResponse = await fetch(`/api/exams/submissions/${submissionId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const submissionData = await submissionResponse.json();

    if (!submissionResponse.ok || !submissionData.success) {
        alert(submissionData.message || "Submission not found.");
        window.location.href = "submissions.html";
        return;
    }

    const submission = submissionData.submission;
    const exam = submission.exam;

    if (!exam) {
        alert("Exam not found.");
        window.location.href = "submissions.html";
        return;
    }

    // Display auto-evaluated summary
    document.getElementById("summaryScore").textContent = submission.score;
    document.getElementById("summaryTotal").textContent = submission.totalQuestions;
    const percentage = Math.round((submission.score / submission.totalQuestions) * 100);
    document.getElementById("summaryPercentage").textContent = percentage;

    // Create answer map
    const mapAnswers = submission.answers.reduce((acc, answer) => {
        if (answer && answer.questionIndex !== undefined) {
            acc[answer.questionIndex] = answer.selectedOption;
        }
        return acc;
    }, {});

    // Render questions with auto-evaluation
    const questionsContainer = document.getElementById("questionsContainer");

    exam.questions.forEach((q, index) => {

        const studentAnswerIndex = mapAnswers[index];
        const studentAnswer =
            studentAnswerIndex !== null && studentAnswerIndex !== undefined
                ? q.options[studentAnswerIndex]
                : "Not Answered";

        const correctAnswerIndex = q.correctAnswer;
        const correctAnswer = q.options[correctAnswerIndex] || "Unknown";

        // Check if student answer is correct
        const isCorrect = studentAnswerIndex === correctAnswerIndex;
        const marks = isCorrect ? 1 : 0;

        // Display all options with styling
        const optionsHtml = q.options.map((option, optIndex) => {
            const isStudentAnswer = studentAnswerIndex === optIndex;
            const isCorrectAnswer = correctAnswerIndex === optIndex;
            let optionClass = "";
            let optionLabel = "";

            if (isStudentAnswer && isCorrectAnswer) {
                optionClass = "correct-student";
                optionLabel = " ✓ (Student - Correct)";
            } else if (isStudentAnswer) {
                optionClass = "student-answer";
                optionLabel = " ✗ (Student - Incorrect)";
            } else if (isCorrectAnswer) {
                optionClass = "correct-answer";
                optionLabel = " ✓ (Correct Answer)";
            }

            return `<li class="${optionClass}">${String.fromCharCode(65 + optIndex)}. ${option}${optionLabel}</li>`;
        }).join("");

        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question-card");
        questionDiv.style.borderLeft = isCorrect ? "4px solid #4caf50" : "4px solid #f44336";

        questionDiv.innerHTML = `
            <div class="question-header">
                <h4>Question ${index + 1} 
                    ${isCorrect ? '<span style="color: #4caf50; font-weight: bold;">✓ Correct</span>' : '<span style="color: #f44336; font-weight: bold;">✗ Incorrect</span>'}
                </h4>
            </div>

            <p><strong>Question:</strong> ${q.questionText}</p>

            <div class="options-list">
                <strong>Options:</strong>
                <ul>${optionsHtml}</ul>
            </div>

            <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                <p><strong>Mark:</strong> <span style="font-size: 18px; font-weight: bold; color: ${isCorrect ? '#4caf50' : '#f44336'};">${marks}</span> / 1</p>
            </div>
        `;

        questionsContainer.appendChild(questionDiv);
    });

    // Add back button
    const backButton = document.createElement("div");
    backButton.style.marginTop = "20px";
    backButton.innerHTML = `<button class="primary-btn" onclick="window.location.href='submissions.html'">Back to Submissions</button>`;
    questionsContainer.appendChild(backButton);

    console.log(`✅ Auto-evaluated submission viewed - Student: ${submission.student.email}, Score: ${submission.score}/${submission.totalQuestions}`);

});
