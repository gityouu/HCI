// Import Firestore functions from Firebase v11
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";

// Your Firebase configuration 
const firebaseConfig = {
    apiKey: "AIzaSyD7ki8anhI7dJaDYAH_qPqscI5zg56C4ZE",
    authDomain: "hcii-eb2c9.firebaseapp.com",
    projectId: "hcii-eb2c9",
    storageBucket: "hcii-eb2c9.firebasestorage.app",
    messagingSenderId: "292510882725",
    appId: "1:292510882725:web:d9dd306aca2bed236a264c",
    measurementId: "G-FP25ZSWPHW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to show the loading spinner
function showLoadingSpinner() {
  document.getElementById('loadingSpinner').style.display = 'flex';
}

// Function to hide the loading spinner
function hideLoadingSpinner() {
  document.getElementById('loadingSpinner').style.display = 'none';
}

// Variable declarations
const steps = document.querySelectorAll(".step");
const progressBar = document.querySelector(".progress-bar");
const formSteps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const submitBtn = document.querySelector(".submit-btn");
const paidEventCheckbox = document.getElementById('paidEvent');
const priceContainer = document.getElementById('priceContainer');
const attendeesContainer = document.getElementById('attendeesContainer');
const priceInput = document.getElementById('eventPrice');
const eventDate = document.getElementById('eventDate');
const eventEndDate = document.getElementById('eventEndDate');
const termsCheckbox = document.getElementById('termsCheckbox');
const termsLabel = termsCheckbox.parentElement;
const eventNameInput = document.querySelector('input[name="eventName"]');
const descriptionInput = document.querySelector('textarea[placeholder="Description"]');
const venueInput = document.querySelector('input[placeholder="Venue/Location"]');
const imageInput = document.getElementById('imageInput');
const modal = document.getElementById('eventModal');
const modalEventName = document.getElementById('modalEventName');
const modalDescription = document.getElementById('modalDescription');
const modalVenue = document.getElementById('modalVenue');
const modalEventDateFrom = document.getElementById('modalEventDateFrom');
const modalEventDateTo = document.getElementById('modalEventDateTo');
const modalImage = document.getElementById('modalImage');
const modalOkBtn = document.getElementById('modalOkBtn');
const closeBtn = document.querySelector('.close-btn');

let currentStep = 0;
let imageDataUrl = '';

document.addEventListener('DOMContentLoaded', function () {
    // Initially hide the price and attendees input
    priceContainer.style.display = 'none';
    attendeesContainer.style.display = 'none';

    // Add event listener to the checkbox
    paidEventCheckbox.addEventListener('change', function () {
        if (paidEventCheckbox.checked) {
            priceContainer.style.display = 'block';
            attendeesContainer.style.display = 'block';
            priceContainer.style.display = 'flex';
            attendeesContainer.style.display = 'flex';
            priceInput.style.border = "1px solid #555"
            priceInput.setAttribute('required', 'required'); // Make price input required
            attendeesContainer.setAttribute('required', 'required'); // Make attendees input required
        } else {
            priceContainer.style.display = 'none';
            attendeesContainer.style.display = 'none';
            priceInput.removeAttribute('required'); // Remove required attribute
            attendeesContainer.removeAttribute('required'); // Remove required attribute
        }
    });

    // Remove all past days from the date inputs
    let today = new Date().toISOString().slice(0, 16);
    eventDate.setAttribute("min", today);
    eventEndDate.setAttribute("min", today); // Apply the same logic to the end date input
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
            input.style.border = "1px solid #ff6666"; // Turn red if empty
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
        setTimeout(() => {
            termsCheckbox.classList.remove("shake");
        }, 300); // Remove shake after animation
    } else {
        if (areFieldsFilled(currentStep)) { // Allow submission only if fields are filled
            // Display the modal with event details
            modalEventName.textContent = eventNameInput.value;
            modalDescription.textContent = descriptionInput.value;
            modalVenue.textContent = venueInput.value;
            modalEventDateFrom.textContent = eventDate.value;
            modalEventDateTo.textContent = eventEndDate.value;

            // Display the uploaded image
            const file = imageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    modalImage.src = e.target.result;
                    imageDataUrl = e.target.result; // Store the image data URL
                };
                reader.readAsDataURL(file);
            } else {
                modalImage.src = '';
                imageDataUrl = ''; // Clear the image data URL
            }

            modal.style.display = 'block';
            event.preventDefault(); // Prevent form submission
        }
    }
});

// Real-time validation: Change border color dynamically
document.querySelectorAll("input[required], textarea[required]").forEach(input => {
    input.style.border = "1px solid #555"; // Set initial border color to black

    input.addEventListener("input", () => {
        if (input.value.trim()) {
            input.style.border = "1px solid green"; // Green if filled
        } else {
            input.style.border = "1px solid #ff6666"; // Keep red if empty
        }
    });
});

// Include price input in real-time validation
priceInput.style.border = "2px solid black"; // Set initial border color to black

priceInput.addEventListener("input", () => {
    if (priceInput.value.trim()) {
        priceInput.style.border = "1px solid green"; // Green if filled
    } else {
        priceInput.style.border = "1px solid #ff6666"; // Keep red if empty
    }
});

// Image input validation
imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const fileType = file.type;
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(fileType)) {
            alert('Please upload a valid image file (JPEG, PNG, GIF).');
            this.value = ''; // Clear the input
        }
    }
});

// Close the modal when the close button or OK button is clicked
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

modalOkBtn.addEventListener('click', async () => {
    // Gather event data from the form fields
    const eventData = {
        eventName: eventNameInput.value,
        organizer: document.querySelector('input[placeholder="Organizer Name"]').value,
        eventDate: eventDate.value,
        eventEndDate: eventEndDate.value,
        venue: venueInput.value,
        description: descriptionInput.value,
        price: paidEventCheckbox.checked ? priceInput.value : "Free",
        expectedAttendees: paidEventCheckbox.checked ? document.getElementById('expectedAttendees').value : null,
        createdAt: new Date(),
        imageDataUrl: imageDataUrl // Include the image data URL
    };

    showLoadingSpinner(); // Show loading spinner

    try {
        // Save the event data to Firestore in the "events" collection
        const docRef = await addDoc(collection(db, "events"), eventData);
        alert("Event created successfully! Document ID: " + docRef.id);
        window.location.href = "./dashboard.html"
    } catch (e) {
        alert("Error creating event: " + e.message);
        return;
    } finally {
        hideLoadingSpinner(); // Hide loading spinner
    }
    
    // Close the modal after saving the event
    modal.style.display = 'none';
});

// Initial form state
updateFormSteps();
