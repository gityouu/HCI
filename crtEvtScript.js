const steps = document.querySelectorAll(".step");
const progressBar = document.querySelector(".progress-bar");
const formSteps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");

let currentStep = 0;

// Function to update form step visibility
function updateFormSteps() {
    formSteps.forEach((step, index) => {
        step.classList.toggle("active", index === currentStep);
    });

    steps.forEach((step, index) => {
        step.classList.toggle("active", index <= currentStep);
    });

    progressBar.style.width = `${(currentStep / (steps.length - 1)) * 50}%`;
}

// Function to check if all required fields in a step are filled
function areFieldsFilled(stepIndex) {
    const inputs = formSteps[stepIndex].querySelectorAll("input[required], textarea[required]");
    let allFilled = true;

    inputs.forEach(input => {
        const warningIcon = input.parentElement.querySelector(".warning-icon");

        if (!input.value.trim()) {
            input.classList.add("red-border", "shake"); // Add fade-in & shake effect
            setTimeout(() => input.classList.remove("shake"), 300); // Remove shake after animation
            warningIcon.style.display = "inline"; // Show warning icon
            allFilled = false;
        } else {
            input.classList.remove("red-border"); // Remove red border if fixed
            warningIcon.style.display = "none"; // Hide warning icon
        }
    });

    return allFilled; // Return true if all fields are filled, false otherwise
}

// Next button click (only allows navigation when fields are filled)
nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (areFieldsFilled(currentStep)) { // Allow navigation only if fields are filled
            if (currentStep < formSteps.length - 1) {
                currentStep++;
                updateFormSteps();
            }
        }
    });
});

// Previous button click (always allows going back)
prevBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            updateFormSteps();
        }
    });
});

// Real-time validation: Change border color dynamically
document.querySelectorAll("input[required], textarea[required]").forEach(input => {
    input.style.border = "2px solid black"; // Set initial border color to black

    input.addEventListener("input", () => {
        const warningIcon = input.parentElement.querySelector(".warning-icon");
        if (input.value.trim()) {
            input.style.border = "2px solid green"; // Green if filled
            warningIcon.style.display = "none"; // Hide warning icon
        } else {
            input.style.border = "2px solid black"; // Reset to black if empty
        }
    });
});

// Initial form state
updateFormSteps();
