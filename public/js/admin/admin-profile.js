/* =========================
   IMPORT DATA
========================= */

import { adminProfile } from "./admin-data.js";


/* =========================
   DOM
========================= */

const avatarEl = document.getElementById("profileAvatar");
const detailsEl = document.getElementById("profileDetails");
const editBtn = document.getElementById("editProfileBtn");
const passwordBtn = document.getElementById("changePasswordBtn");

let editMode = false;


/* =========================
   AVATAR INITIALS
========================= */

function renderAvatar() {
    const initials = adminProfile.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase();

    avatarEl.textContent = initials;
}


/* =========================
   VIEW MODE RENDER
========================= */

function renderView() {

    detailsEl.innerHTML = `
        <p><strong>Full Name:</strong> ${adminProfile.name}</p>
        <p><strong>Email:</strong> ${adminProfile.email}</p>
        <p><strong>Role:</strong> ${adminProfile.role}</p>
        <p><strong>Department:</strong> ${adminProfile.department}</p>
        <p><strong>Contact:</strong> ${adminProfile.contact}</p>
        <p><strong>Joined:</strong> ${adminProfile.joined}</p>
    `;

    editBtn.textContent = "Edit Profile";
    editMode = false;
}


/* =========================
   EDIT MODE RENDER
========================= */

function renderEdit() {

    detailsEl.innerHTML = `
        <p><strong>Full Name:</strong> <input id="nameInput" value="${adminProfile.name}"></p>
        <p><strong>Email:</strong> <input id="emailInput" value="${adminProfile.email}"></p>
        <p><strong>Department:</strong> <input id="deptInput" value="${adminProfile.department}"></p>
        <p><strong>Contact:</strong> <input id="contactInput" value="${adminProfile.contact}"></p>
    `;

    editBtn.textContent = "Save Profile";
    editMode = true;
}


/* =========================
   SAVE PROFILE
========================= */

function saveProfile() {

    adminProfile.name = document.getElementById("nameInput").value;
    adminProfile.email = document.getElementById("emailInput").value;
    adminProfile.department = document.getElementById("deptInput").value;
    adminProfile.contact = document.getElementById("contactInput").value;

    renderAvatar();
    renderView();
}


/* =========================
   BUTTON EVENTS
========================= */

editBtn.onclick = () => {

    if (!editMode) {
        renderEdit();
    } else {
        saveProfile();
    }
};

passwordBtn.onclick = () => {
    alert("Change password feature will be handled in backend");
};


/* =========================
   INIT
========================= */

renderAvatar();
renderView();