// ================= ADMIN AUTH CHECK =================

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

if (!token || user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "../login.html";
}
