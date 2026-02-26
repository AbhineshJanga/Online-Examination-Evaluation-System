/* =========================
   MOCK STUDENT DATA
========================= */

let student = {
    name: "Rahul Sharma",
    email: "rahul@example.com",
    course: "B.Tech CSE",
    year: "3rd Year",
    contact: "+91 9876543210"
};


/* =========================
   DOM
========================= */

const avatarEl = document.getElementById("profileAvatar");
const detailsEl = document.getElementById("profileDetails");
const editBtn = document.getElementById("editProfileBtn");
const passwordBtn = document.getElementById("changePasswordBtn");

let editMode = false;


/* =========================
   AVATAR
========================= */

function renderAvatar() {
    const initials = student.name.split(" ").map(n => n[0]).join("").toUpperCase();
    avatarEl.textContent = initials;
}


/* =========================
   VIEW MODE
========================= */

function renderView() {

    detailsEl.innerHTML = `
        <p><strong>Name:</strong> ${student.name}</p>
        <p><strong>Email:</strong> ${student.email}</p>
        <p><strong>Course:</strong> ${student.course}</p>
        <p><strong>Year:</strong> ${student.year}</p>
        <p><strong>Contact:</strong> ${student.contact}</p>
    `;

    editBtn.textContent = "Edit Profile";
    editMode = false;
}


/* =========================
   EDIT MODE
========================= */

function renderEdit() {

    detailsEl.innerHTML = `
        <p><strong>Name:</strong> <input id="nameInput" value="${student.name}"></p>
        <p><strong>Email:</strong> <input id="emailInput" value="${student.email}"></p>
        <p><strong>Course:</strong> <input id="courseInput" value="${student.course}"></p>
        <p><strong>Year:</strong> <input id="yearInput" value="${student.year}"></p>
        <p><strong>Contact:</strong> <input id="contactInput" value="${student.contact}"></p>
    `;

    editBtn.textContent = "Save Profile";
    editMode = true;
}


/* =========================
   SAVE
========================= */

function saveProfile() {

    student.name = document.getElementById("nameInput").value;
    student.email = document.getElementById("emailInput").value;
    student.course = document.getElementById("courseInput").value;
    student.year = document.getElementById("yearInput").value;
    student.contact = document.getElementById("contactInput").value;

    renderAvatar();
    renderView();
}


/* =========================
   EVENTS
========================= */

editBtn.onclick = () => {
    if (!editMode) renderEdit();
    else saveProfile();
};

passwordBtn.onclick = () => {
    alert("Change password will be implemented in backend");
};


/* =========================
   INIT
========================= */

renderAvatar();
renderView();