document.addEventListener("DOMContentLoaded", function () {
    initDarkMode();
});

function initDarkMode() {

    // Apply saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }

    // Delegated click handler
    document.addEventListener("click", function (e) {

        const toggle = e.target.closest(".dark-toggle");
        if (!toggle) return;

        e.preventDefault();

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });
}