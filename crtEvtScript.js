const steps = document.querySelectorAll(".step");
const progressBar = document.querySelector(".progress-bar");
const formSteps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const submitBtn = document.querySelector(".submit-btn");

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
        if (!input.value.trim()) {
            input.style.border = "2px solid red"; // Turn red if empty
            input.classList.add("shake"); // Add shake effect
            setTimeout(() => input.classList.remove("shake"), 300); // Remove shake after animation
            allFilled = false;
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

// Submit button click (only allows submission when all fields are filled)
submitBtn.addEventListener("click", () => {
    if (areFieldsFilled(currentStep)) { // Allow submission only if fields are filled
        alert("Form submitted successfully!");
    }
});

// Real-time validation: Change border color dynamically
document.querySelectorAll("input[required], textarea[required]").forEach(input => {
    input.style.border = "2px solid black"; // Set initial border color to black

    input.addEventListener("input", () => {
        if (input.value.trim()) {
            input.style.border = "2px solid green"; // Green if filled
        } else {
            input.style.border = "2px solid red"; // Keep red if empty
        }
    });
});

// Initial form state
updateFormSteps();
