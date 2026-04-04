document.addEventListener("DOMContentLoaded", function () {

    const tableBody = document.querySelector(".submission-table tbody");

    loadSubmissions();

    async function loadSubmissions() {

        tableBody.innerHTML = "";

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login to view submissions.");
                window.location.href = "../login.html";
                return;
            }

            const response = await fetch("/api/exams/submissions", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to load submissions");
            }

            const submissions = data.submissions;

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
                const examName = sub.exam?.title || "Unknown Exam";
                const studentName = sub.student?.name || "Unknown Student";
                const submittedAt = sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "Unknown Date";
                const totalQuestions = sub.totalQuestions || 0;
                const marksDisplay = sub.score !== undefined ? sub.score : "--";

                if (!sub.exam || !sub.student) {
                    console.warn("⚠️ Submission missing relations:", sub);
                }

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${studentName}</td>
                    <td>${examName}</td>
                    <td>${submittedAt}</td>
                    <td>${marksDisplay}/${totalQuestions}</td>
                    <td>
                        <span class="status graded">
                            ✓ Graded
                        </span>
                    </td>
                    <td>
                        <a href="evaluate-submission.html?id=${sub._id}" class="action-btn">
                            View
                        </a>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Cannot load submissions:", error);
            tableBody.innerHTML = `
                <tr><td colspan="6" style="text-align:center;">Unable to fetch submissions.</td></tr>
            `;
        }
    }

});
