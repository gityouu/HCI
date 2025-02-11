const steps = document.querySelectorAll(".step");
const progressBar = document.querySelector(".progress-bar");
const formSteps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const submitBtn = document.querySelector(".submit-btn");
const paidEventCheckbox = document.getElementById('paidEvent');
const priceContainer = document.getElementById('priceContainer');
const priceInput = document.getElementById('eventPrice');
const termsCheckbox = document.getElementById('termsCheckbox');

let currentStep = 0;

document.addEventListener('DOMContentLoaded', function () {
    // Initially hide the price input
    priceContainer.style.display = 'none';

    // Add event listener to the checkbox
    paidEventCheckbox.addEventListener('change', function () {
        if (paidEventCheckbox.checked) {
            priceContainer.style.display = 'block';
            priceContainer.style.display = 'flex';
            priceInput.setAttribute('required', 'required'); // Make price input required
        } else {
            priceContainer.style.display = 'none';
            priceInput.removeAttribute('required'); // Remove required attribute
        }
    });
});

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
submitBtn.addEventListener("click", (event) => {
    if (!termsCheckbox.checked) {
        event.preventDefault(); // Prevent form submission
        termsCheckbox.classList.add("shake"); // Add shake effect
        setTimeout(() => termsCheckbox.classList.remove("shake"), 300); // Remove shake after animation
    } else {
        if (areFieldsFilled(currentStep)) { // Allow submission only if fields are filled
            alert("Form submitted successfully!");
        }
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

// Include price input in real-time validation
priceInput.style.border = "2px solid black"; // Set initial border color to black

priceInput.addEventListener("input", () => {
    if (priceInput.value.trim()) {
        priceInput.style.border = "2px solid green"; // Green if filled
    } else {
        priceInput.style.border = "2px solid red"; // Keep red if empty
    }
});

// Initial form state
updateFormSteps();
