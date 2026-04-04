const API_BASE = "";
const form = document.querySelector(".exam-form");
const questionsContainer = document.getElementById("questionsContainer");
const addQuestionBtn = document.getElementById("addQuestionBtn");

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

const params = new URLSearchParams(window.location.search);
const examId = params.get("id");

if (!examId) {
    alert("Invalid exam ID.");
    window.location.href = "manage-exams.html";
}

async function fetchExam() {
    try {
        const response = await fetch(`${API_BASE}/api/exams/${examId}`, {
            method: "GET",
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load exam.");
        }

        return data.exam;
    } catch (err) {
        console.error(err);
        alert(err.message || "Unable to fetch exam details.");
        window.location.href = "manage-exams.html";
    }
}

function clearQuestions() {
    questionsContainer.innerHTML = "";
}

function buildQuestionCard(q, idx) {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question-card");
    questionDiv.dataset.index = idx;

    const optionsHtml = q.options
        .map((option, oi) => `<input type="text" class="option-input" value="${option}" data-option-index="${oi}" />`)
        .join("");

    questionDiv.innerHTML = `
        <div class="question-header">
            <h4>Question ${idx + 1}</h4>
            <button type="button" class="remove-btn">Remove</button>
        </div>
        <div class="form-group">
            <label>Question Text</label>
            <textarea rows="3" class="question-text">${q.questionText}</textarea>
        </div>
        <div class="options-grid">
            ${optionsHtml}
        </div>
        <div class="form-group">
            <label>Correct Option Index (0-3)</label>
            <input type="number" class="correct-answer" min="0" max="3" value="${q.correctAnswer}" />
        </div>
    `;

    questionDiv.querySelector(".remove-btn").addEventListener("click", () => {
        questionDiv.remove();
        updateQuestionHeaders();
    });

    return questionDiv;
}

function updateQuestionHeaders() {
    document.querySelectorAll(".question-card").forEach((card, idx) => {
        const h4 = card.querySelector("h4");
        if (h4) h4.textContent = `Question ${idx + 1}`;
    });
}

function addQuestion() {
    const newQuestion = {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0
    };

    const card = buildQuestionCard(newQuestion, document.querySelectorAll(".question-card").length);
    questionsContainer.appendChild(card);
}

async function populateForm(exam) {
    form.querySelector("input[name='title']").value = exam.title || "";
    form.querySelector("textarea[name='description']").value = exam.description || "";
    form.querySelector("input[name='duration']").value = exam.duration || 0;

    clearQuestions();
    (exam.questions || []).forEach((q, idx) => {
        questionsContainer.appendChild(buildQuestionCard(q, idx));
    });
}

function collectQuestions() {
    return Array.from(document.querySelectorAll(".question-card")).map((card) => {
        const questionText = card.querySelector(".question-text").value.trim();
        const options = Array.from(card.querySelectorAll(".option-input")).map((opt) => opt.value.trim());
        const correctAnswer = Number(card.querySelector(".correct-answer").value);

        return { questionText, options, correctAnswer };
    });
}

addQuestionBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addQuestion();
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = form.querySelector("input[name='title']").value.trim();
    const description = form.querySelector("textarea[name='description']").value.trim();
    const duration = Number(form.querySelector("input[name='duration']").value);

    if (!title || !duration || duration <= 0) {
        alert("Title and duration are required.");
        return;
    }

    const questions = collectQuestions();
    if (questions.length === 0) {
        alert("Add at least one question.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/exams/${examId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, description, duration, questions })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to update exam.");
        }

        alert("Exam updated successfully.");
        window.location.href = "manage-exams.html";
    } catch (err) {
        console.error(err);
        alert(err.message || "Failed to update exam.");
    }
});

(async () => {
    const exam = await fetchExam();
    if (exam) {
        // Build simple form fields if not already present
        let titleInput = form.querySelector("input[name='title']");
        if (!titleInput) {
            const titleField = document.createElement("div");
            titleField.innerHTML = `<div class="form-group"><label>Title</label><input type="text" name="title" required /></div>`;
            form.insertBefore(titleField, form.querySelector(".form-grid"));
            titleInput = titleField.querySelector("input");
        }

        let descriptionTextarea = form.querySelector("textarea[name='description']");
        if (!descriptionTextarea) {
            const descField = document.createElement("div");
            descField.innerHTML = `<div class="form-group"><label>Description</label><textarea name="description"></textarea></div>`;
            form.insertBefore(descField, form.querySelector(".form-grid"));
            descriptionTextarea = descField.querySelector("textarea");
        }

        let durationInput = form.querySelector("input[name='duration']");
        if (!durationInput) {
            const durationField = document.createElement("div");
            durationField.innerHTML = `<div class="form-group"><label>Duration</label><input type="number" name="duration" min="1" required /></div>`;
            form.insertBefore(durationField, form.querySelector(".form-grid"));
            durationInput = durationField.querySelector("input");
        }

        titleInput.value = exam.title || "";
        descriptionTextarea.value = exam.description || "";
        durationInput.value = exam.duration || 0;

        populateForm(exam);
    }
})();
