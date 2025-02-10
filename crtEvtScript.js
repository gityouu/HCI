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

    progressBar.style.width = `${(currentStep / (steps.length - 1)) * 100}%`;

    // Disable "Next" button until fields are valid
    updateNextButtonState();
}

// Function to validate required fields with custom rules
function validateFields(stepIndex) {
    const inputs = formSteps[stepIndex].querySelectorAll("input[required], textarea[required]");
    let isValid = true;

    inputs.forEach(input => {
        const errorMsg = input.nextElementSibling;

        // Remove existing messages
        if (errorMsg && (errorMsg.classList.contains("error-msg") || errorMsg.classList.contains("success-msg"))) {
            errorMsg.remove();
        }

        // General Required Field Check
        if (!input.value.trim()) {
            showError(input, "This field is required");
            isValid = false;
            return;
        }

        // Custom Validations
        if (input.type === "text" && input.name === "eventName") {
            if (input.value.length < 3 || input.value.length > 50) {
                showError(input, "Event Name must be between 3 and 50 characters");
                isValid = false;
            }
        }

        if (input.type === "email") {
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailPattern.test(input.value)) {
                showError(input, "Enter a valid email address");
                isValid = false;
            }
        }

        if (input.type === "time") {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const selectedTime = parseInt(input.value.split(":")[0]) * 60 + parseInt(input.value.split(":")[1]);

            if (selectedTime < currentTime) {
                showError(input, "Event time cannot be in the past");
                isValid = false;
            }
        }

        // Show success message if valid
        if (isValid) {
            showSuccess(input, "Looks good!");
        }
    });

    updateNextButtonState();
    return isValid;
}

// Function to show error message and highlight field
function showError(input, message) {
    input.style.border = "2px solid red";
    const errorText = document.createElement("span");
    errorText.classList.add("error-msg");
    errorText.style.color = "red";
    errorText.style.fontSize = "14px";
    errorText.textContent = message;
    input.after(errorText);
}

// Function to show success message and highlight field
function showSuccess(input, message) {
    input.style.border = "2px solid green";
    const successText = document.createElement("span");
    successText.classList.add("success-msg");
    successText.style.color = "green";
    successText.style.fontSize = "14px";
    successText.textContent = message;
    input.after(successText);
}

// Function to update the Next button's disabled state
function updateNextButtonState() {
    const nextBtn = formSteps[currentStep].querySelector(".next-btn");
    nextBtn.disabled = !validateFields(currentStep);
}

// Next button click
nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (validateFields(currentStep)) {
            if (currentStep < formSteps.length - 1) {
                currentStep++;
                updateFormSteps();
            }
        }
    });
});

// Previous button click
prevBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            updateFormSteps();
        }
    });
});

// Real-time validation to enable Next button when valid
document.querySelectorAll("input[required], textarea[required]").forEach(input => {
    input.addEventListener("input", () => {
        validateFields(currentStep);
    });
});

// Initial form state
updateFormSteps();
