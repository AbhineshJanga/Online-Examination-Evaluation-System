document.addEventListener("DOMContentLoaded", function () {

    const tableBody = document.querySelector(".submission-table tbody");

    loadSubmissions();

    function loadSubmissions() {

        const submissions = JSON.parse(localStorage.getItem("submissions")) || [];
        const exams = JSON.parse(localStorage.getItem("exams")) || [];

        tableBody.innerHTML = "";

        if (submissions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No submissions available.
                    </td>
                </tr>
            `;
            return;
        }

        submissions.forEach(sub => {

            const exam = exams.find(e => e.id === sub.examId);

            const examName = exam ? exam.subject : "Unknown Exam";

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${sub.studentName}</td>
                <td>${examName}</td>
                <td>${new Date(sub.submittedAt).toLocaleString()}</td>
                <td>${sub.totalMarks !== null ? sub.totalMarks : "--"}</td>
                <td>
                    <span class="status ${sub.status === "Pending" ? "pending" : "graded"}">
                        ${sub.status}
                    </span>
                </td>
                <td>
                    <a href="evaluate-submission.html?id=${sub.id}" class="action-btn">
                        ${sub.status === "Pending" ? "Evaluate" : "View"}
                    </a>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

});
