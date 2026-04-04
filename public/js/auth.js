const API_URL = "/api/auth";

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed");
            return;
        }

        localStorage.setItem("token", data.token);

        // 🔥 IMPORTANT FIX
        const userData = {
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role
        };

        localStorage.setItem("user", JSON.stringify(userData));

        // Redirect
        if (userData.role === "student") {
            window.location.href = "../student/dashboard.html";
        } else if (userData.role === "teacher") {
            window.location.href = "../teacher/dashboard.html";
        } else if (userData.role === "admin") {
            window.location.href = "../admin/dashboard.html";
        }

    } catch (error) {
        console.error(error);
        alert("Server error");
    }
}