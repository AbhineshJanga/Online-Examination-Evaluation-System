const faculty = JSON.parse(localStorage.getItem("facultyProfile")) || {
    name: "Dr. Faculty Name",
    email: "faculty@example.com",
    empId: "FAC1023",
    department: "Computer Science",
    designation: "Assistant Professor",
    phone: "9876543210",
    doj: "DD-MM-YYYY"
};
function renderProfile() {

    const container = document.getElementById("profileDetails");

    container.innerHTML = `
        <p><strong>Full Name:</strong> ${faculty.name}</p>
        <p><strong>Email:</strong> ${faculty.email}</p>
        <p><strong>Employee ID:</strong> ${faculty.empId}</p>
        <p><strong>Department:</strong> ${faculty.department}</p>
        <p><strong>Designation:</strong> ${faculty.designation}</p>
        <p><strong>Phone:</strong> ${faculty.phone}</p>
        <p><strong>Date of Joining:</strong> ${faculty.doj}</p>
    `;
    document.querySelector(".profile-avatar").textContent =
        faculty.name.charAt(0).toUpperCase();
}
function enableEdit() {

    const container = document.getElementById("profileDetails");

    container.innerHTML = `
        <label>Name</label>
        <input id="name" value="${faculty.name}">

        <label>Email</label>
        <input id="email" value="${faculty.email}">

        <label>Department</label>
        <input id="department" value="${faculty.department}">

        <label>Phone</label>
        <input id="phone" value="${faculty.phone}">

        <button id="saveProfile" class="nav-btn primary">Save</button>
    `;

    document.getElementById("saveProfile").addEventListener("click", saveProfile);
}
function saveProfile() {

    faculty.name = document.getElementById("name").value;
    faculty.email = document.getElementById("email").value;
    faculty.department = document.getElementById("department").value;
    faculty.phone = document.getElementById("phone").value;

    localStorage.setItem("facultyProfile", JSON.stringify(faculty));

    renderProfile();
}
document.addEventListener("DOMContentLoaded", () => {

    renderProfile();

    document.getElementById("editProfileBtn")
        .addEventListener("click", enableEdit);
});