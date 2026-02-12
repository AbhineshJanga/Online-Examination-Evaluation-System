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
