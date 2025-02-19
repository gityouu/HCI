document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("darkModeToggle");

    // Load saved preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
            darkModeToggle.classList.replace("bx-moon", "bx-sun");
        } else {
            localStorage.setItem("darkMode", "disabled");
            darkModeToggle.classList.replace("bx-sun", "bx-moon");
        }
    });
});
