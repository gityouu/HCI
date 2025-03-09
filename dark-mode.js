//dark mode script
document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const darkModeTooltip = document.getElementById('darkModeTooltip');

    // Load saved preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    darkModeToggle.addEventListener("mouseover", () => {
        if (document.body.classList.contains('dark-mode')) {
            darkModeTooltip.textContent = 'Switch to light mode';
        } else {
            darkModeTooltip.textContent = 'Switch to dark mode';
        }
    });

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
            darkModeToggle.classList.replace("bx-moon", "bx-sun");
            darkModeTooltip.textContent = 'Switch to light mode';
        } else {
            localStorage.setItem("darkMode", "disabled");
            darkModeToggle.classList.replace("bx-sun", "bx-moon");
            darkModeTooltip.textContent = 'Switch to dark mode';
        }
    });
});

//scrolling the header after some point script
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 400) { // Adjust the scroll position as needed
        header.classList.add('scrollable');
    } else {
        header.classList.remove('scrollable');
    }
});
