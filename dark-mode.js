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
            darkModeToggle.innerHTML = "<i class='bx bx-sun'></i> Light mode";
        } else {
            localStorage.setItem("darkMode", "disabled");
            darkModeToggle.innerHTML = "<i class='bx bx-moon'></i> Dark mode";
        }
    });
});
