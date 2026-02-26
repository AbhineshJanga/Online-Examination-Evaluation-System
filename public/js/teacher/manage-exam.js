document.addEventListener("DOMContentLoaded", function () {

    const tableBody = document.querySelector(".submission-table tbody");

    loadExams();

    function loadExams() {

        const exams = JSON.parse(localStorage.getItem("exams")) || [];

        tableBody.innerHTML = "";

        if (exams.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;">
                        No exams created yet.
                    </td>
                </tr>
            `;
            return;
        }

        exams.forEach(exam => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${exam.subject}</td>
                <td>${exam.courseId}</td>
                <td>${exam.format}</td>
                <td>${exam.date}</td>
                <td>${exam.duration} mins</td>
                <td>
                    <span class="status ${exam.status === "Draft" ? "pending" : "graded"}">
                        ${exam.status}
                    </span>
                </td>
                <td>
                    <a href="edit-exam.html?id=${exam.id}" class="action-btn">Edit</a>

                    ${
                        exam.status === "Draft"
                        ? `<button class="action-btn publish-btn" data-id="${exam.id}">
                               Publish
                           </button>`
                        : ""
                    }

                    <button class="action-btn delete-btn" data-id="${exam.id}">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        attachDeleteEvents();
        attachPublishEvents();
    }

    function attachDeleteEvents() {

        document.querySelectorAll(".delete-btn").forEach(btn => {

            btn.addEventListener("click", function () {

                const examId = Number(this.dataset.id);

                if (!confirm("Are you sure you want to delete this exam?")) {
                    return;
                }

                let exams = JSON.parse(localStorage.getItem("exams")) || [];

                exams = exams.filter(exam => exam.id !== examId);

                localStorage.setItem("exams", JSON.stringify(exams));

                loadExams();
            });
        });
    }

    function attachPublishEvents() {

        document.querySelectorAll(".publish-btn").forEach(btn => {

            btn.addEventListener("click", function () {

                const examId = Number(this.dataset.id);

                let exams = JSON.parse(localStorage.getItem("exams")) || [];

                const exam = exams.find(e => e.id === examId);

                if (!exam) return;

                exam.status = "Published";

                localStorage.setItem("exams", JSON.stringify(exams));

                alert("Exam published successfully!");

                loadExams();
            });
        });
    }

});
