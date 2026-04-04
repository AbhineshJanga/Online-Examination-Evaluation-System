document.addEventListener("DOMContentLoaded", function () {

    const tableBody = document.querySelector(".submission-table tbody");
    const API_BASE_URL = "/api";
    let authToken = localStorage.getItem("token");

    if (!authToken) {
        alert("Please login");
        window.location.href = "../login.html";
        return;
    }

    loadResults();

    async function loadResults() {
        try {
            console.log('📥 Fetching submissions...');
            
            const submissionsResponse = await fetch(`${API_BASE_URL}/exams/submissions`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!submissionsResponse.ok) {
                const err = await submissionsResponse.json();
                throw new Error(err.message || 'Failed to fetch submissions');
            }

            const submissionsData = await submissionsResponse.json();
            const submissions = submissionsData.submissions || [];
            console.log('✅ Submissions loaded:', submissions.length);
            console.log('Submission details:', submissions);

            tableBody.innerHTML = "";

            if (submissions.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center;">
                            No submissions available yet.
                        </td>
                    </tr>
                `;
                calculateAnalytics([]);
                return;
            }

            let evaluatedMarks = [];

            submissions.forEach(sub => {
                // Validate submission has required data
                if (!sub.student) {
                    console.warn('⚠️ Submission missing student:', sub);
                    return;
                }
                if (!sub.exam) {
                    console.warn('⚠️ Submission missing exam:', sub);
                    return;
                }

                const row = document.createElement("tr");

                const totalMarks = sub.totalQuestions;
                const obtained = sub.score;

                // ALL submissions are now auto-graded, so collect all marks
                evaluatedMarks.push(obtained);

                const percentage = totalMarks > 0
                    ? Math.round((obtained / totalMarks) * 100)
                    : 0;

                const passed = percentage >= 40;

                row.innerHTML = `
                    <td>${sub.student.name}</td>
                    <td>${sub.exam.title}</td>
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

            // Calculate analytics
            calculateAnalytics(evaluatedMarks);

        } catch (error) {
            console.error('❌ Error loading results:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; color: red;">
                        Error: ${error.message}
                    </td>
                </tr>
            `;
        }
    }

    function calculateAnalytics(marksArray) {
        console.log('📊 Calculating analytics for marks array:', marksArray);
        
        if (!marksArray || marksArray.length === 0) {
            console.warn('⚠️ No marks to analyze');
            document.getElementById("avgMarks").textContent = "--";
            document.getElementById("highestMarks").textContent = "--";
            document.getElementById("lowestMarks").textContent = "--";
            return;
        }

        const sum = marksArray.reduce((a, b) => a + b, 0);
        const avg = (sum / marksArray.length).toFixed(2);
        const highest = Math.max(...marksArray);
        const lowest = Math.min(...marksArray);

        console.log(`✅ Analytics - Count: ${marksArray.length}, Avg: ${avg}, Highest: ${highest}, Lowest: ${lowest}`);

        document.getElementById("avgMarks").textContent = avg;
        document.getElementById("highestMarks").textContent = highest;
        document.getElementById("lowestMarks").textContent = lowest;
    }

});