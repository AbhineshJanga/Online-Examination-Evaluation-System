document.addEventListener("DOMContentLoaded", function () {

    const tableBody = document.querySelector(".submission-table tbody");
    const API_BASE_URL = "/api";
    let authToken = localStorage.getItem("token");

    if (!authToken) {
        alert("Please login");
        window.location.href = "../login.html";
        return;
    }

    loadExams();

    async function loadExams() {
        try {
            const response = await fetch(`${API_BASE_URL}/exams`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch exams');
            }

            const data = await response.json();
            const exams = data.exams || [];

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
                    <td>${exam.title}</td>
                    <td>${exam.description || 'N/A'}</td>
                    <td>${exam.questions ? exam.questions.length : 0} questions</td>
                    <td>${new Date(exam.createdAt).toLocaleDateString()}</td>
                    <td>${exam.duration} mins</td>
                    <td>
                        <span class="status ${exam.isPublished ? "graded" : "pending"}">
                            ${exam.isPublished ? "Published" : "Draft"}
                        </span>
                    </td>
                    <td>
                        <a href="edit-exam.html?id=${exam._id}" class="action-btn">Edit</a>

                        ${
                            !exam.isPublished
                            ? `<button class="action-btn publish-btn" data-id="${exam._id}">
                                   Publish
                               </button>`
                            : ""
                        }

                        <button class="action-btn delete-btn" data-id="${exam._id}">
                            Delete
                        </button>
                    </td>
                `;

                tableBody.appendChild(row);
            });

            attachDeleteEvents();
            attachPublishEvents();

        } catch (error) {
            console.error('Error loading exams:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; color: red;">
                        Error loading exams. Please try again.
                    </td>
                </tr>
            `;
        }
    }

    function attachDeleteEvents() {
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async function () {
                const examId = this.dataset.id;

                if (!confirm("Are you sure you want to delete this exam? This action cannot be undone.")) {
                    return;
                }

                try {
                    console.log(`🗑️ Attempting to delete exam: ${examId}`);
                    
                    const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        console.error('❌ Delete error:', data);
                        throw new Error(data.message || 'Failed to delete exam');
                    }

                    console.log('✅ Exam deleted successfully:', data);
                    alert(data.message || "Exam deleted successfully!");
                    loadExams();

                } catch (error) {
                    console.error('Error deleting exam:', error);
                    alert(`Error deleting exam: ${error.message}`);
                }
            });
        });
    }

    function attachPublishEvents() {
        document.querySelectorAll(".publish-btn").forEach(btn => {
            btn.addEventListener("click", async function () {
                const examId = this.dataset.id;

                try {
                    const response = await fetch(`${API_BASE_URL}/exams/${examId}/publish`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to publish exam');
                    }

                    alert("Exam published successfully!");
                    loadExams();

                } catch (error) {
                    console.error('Error publishing exam:', error);
                    alert(`Error publishing exam: ${error.message}`);
                }
            });
        });
    }

});
