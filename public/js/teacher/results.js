document.addEventListener("DOMContentLoaded", function () {

    const tableBody = document.querySelector(".submission-table tbody");

    loadResults();

    function loadResults() {

        let evaluatedMarks = [];

        const submissions = JSON.parse(localStorage.getItem("submissions")) || [];
        const exams = JSON.parse(localStorage.getItem("exams")) || [];

        tableBody.innerHTML = "";

        if (exams.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        No exams available.
                    </td>
                </tr>
            `;
            return;
        }

        exams.forEach(exam => {

            const examSubs = submissions.filter(s => s.examId === exam.id);

            if (examSubs.length === 0) {

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>--</td>
                    <td>${exam.subject}</td>
                    <td>--</td>
                    <td><span class="status fail">Absent</span></td>
                    <td><span class="status pending">Not Attempted</span></td>
                `;

                tableBody.appendChild(row);
                return;
            }

            examSubs.forEach(sub => {

                const row = document.createElement("tr");

                const totalMarks = exam.questions ? exam.questions.length * 5 : 0;
                const obtained = sub.totalMarks ?? 0;

                if (sub.status === "Graded") {
                    evaluatedMarks.push(obtained);
                }

                const percentage = totalMarks > 0
                    ? Math.round((obtained / totalMarks) * 100)
                    : 0;

                const passed = percentage >= 40;

                row.innerHTML = `
                    <td>${sub.studentName}</td>
                    <td>${exam.subject}</td>
                    <td>${obtained} / ${totalMarks}</td>
                    <td><span class="status graded">Present</span></td>
                    <td>
                        <span class="status ${passed ? "graded" : "fail"}">
                            ${passed ? "Pass" : "Fail"}
                        </span>
                    </td>
                `;

                tableBody.appendChild(row);
            });

        });

        // ✅ NOW analytics correct
        calculateAnalytics(evaluatedMarks);
    }

    function calculateAnalytics(marksArray) {

        if (!marksArray || marksArray.length === 0) return;

        const avg = Math.round(
            marksArray.reduce((a, b) => a + b, 0) / marksArray.length
        );

        const highest = Math.max(...marksArray);
        const lowest = Math.min(...marksArray);

        document.getElementById("avgMarks").textContent = avg;
        document.getElementById("highestMarks").textContent = highest;
        document.getElementById("lowestMarks").textContent = lowest;
    }

});