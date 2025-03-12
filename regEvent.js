// Import Firebase modules
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7ki8anhI7dJaDYAH_qPqscI5zg56C4ZE",
  authDomain: "hcii-eb2c9.firebaseapp.com",
  projectId: "hcii-eb2c9",
  storageBucket: "hcii-eb2c9.firebasestorage.app",
  messagingSenderId: "292510882725",
  appId: "1:292510882725:web:d9dd306aca2bed236a264c",
  measurementId: "G-FP25ZSWPHW"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Reference to the events collection, ordered by date
const eventsCol = collection(db, "events");
const eventsQuery = query(eventsCol, orderBy("eventDate", "asc"));

// Get containers for events
const upcomingEventsContainer = document.getElementById("upcoming-events");
const previousEventsContainer = document.getElementById("previous-events");

const showSectionSpinners = () => {
  document.querySelectorAll('.events-container').forEach(container => {
    container.classList.add('loading');
  });
  document.querySelectorAll('.section-spinner').forEach(spinner => {
    spinner.style.display = 'block';
  });
};

const hideSectionSpinners = () => {
  document.querySelectorAll('.events-container').forEach(container => {
    container.classList.remove('loading');
  });
  document.querySelectorAll('.section-spinner').forEach(spinner => {
    spinner.style.display = 'none';
  });
};

// Updated spinner functions
function showButtonLoading(button) {
  // Save original button content in a data attribute
  button.dataset.originalText = button.innerHTML;
  // Replace content with spinner HTML
  button.innerHTML = `<div class="button-spinner"></div>`;
  button.disabled = true;
}

function hideButtonLoading(button) {
  // Restore the original content if available
  if (button.dataset.originalText) {
    button.innerHTML = button.dataset.originalText;
    delete button.dataset.originalText;
  }
  button.disabled = false;
}

// Function to generate a unique number
const generateUniqueNumber = () => "UN" + Math.floor(Math.random() * 1000000);

// Function to open registration modal
function openRegisterModal(eventId, eventPrice) {
  const registerModal = document.getElementById("registerModal");
  const registerForm = document.getElementById("registerForm");

  registerForm.reset(); // Reset form before displaying
  registerModal.style.display = "block";

  // Remove previous event listeners to prevent duplicates
  registerForm.replaceWith(registerForm.cloneNode(true));
  const newRegisterForm = document.getElementById("registerForm");

  newRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    handleRegistration(newRegisterForm, eventId, eventPrice);
  });
}

// Function to handle registration
async function handleRegistration(form, eventId, eventPrice) {
  const submitButton = form.querySelector("button[type='submit']");
  const originalText = submitButton.innerHTML;
  
  try {
    showButtonLoading(submitButton);
    
    // Check if user is logged in FIRST
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to register for events");
      window.location.href = "/login.html"; // Redirect to login
      return;
    }

    const userName = document.getElementById("userName").value;
    const userEmail = document.getElementById("userEmail").value;
    const userPhone = document.getElementById("userPhone").value;
    
    const eventDoc = await getDoc(doc(db, "events", eventId));
    if (!eventDoc.exists()) {
      alert("Event no longer exists");
      window.location.reload(); // Refresh events list
      return;
    }
    
    const organizerUserId = eventDoc.data().userId;
    if (!organizerUserId) {
      alert("Invalid event configuration. Please contact support.");
      console.error("Event missing organizer ID:", eventId);
      return;
    }
    
    // Generate unique number if needed
    const uniqueNumber = eventPrice && eventPrice !== "Free" ? generateUniqueNumber() : null;
    
    // Create registration data
    const registrationData = {
      eventId,
      attendeeUserId: user.uid,
      organizerUserId,
      userName,
      userEmail,
      userPhone,
      uniqueNumber,
      registeredAt: Timestamp.now()
    };
    
    await addDoc(collection(db, "registrations"), registrationData);
    alert(`Registration successful!${uniqueNumber ? ` Your unique number is: ${uniqueNumber}` : ''}`);
    window.location.href = "./dashboard.html";
  } catch (error) {
    console.error("Registration error:", error);
    alert(`Registration failed: ${error.message}`);
  } finally {
    hideButtonLoading(submitButton, originalText);
  }
}

let isInitialLoad = true;
let hasLoadingError = false;

showSectionSpinners(); // Show before initial load
onSnapshot(eventsQuery, (snapshot) => {
  try {
    hasLoadingError = false;
    allEvents = snapshot.docs.map(doc => {
      const data = doc.data();
    return {
      id: doc.id,
      ...data,
      eventDate: data.eventDate?.toDate ? data.eventDate.toDate() : new Date(data.eventDate),
      numericPrice: convertPrice(data.price)
      }
    });
    processAndDisplayEvents();
  } catch (error) {
    hasLoadingError = true;
    console.error("Error loading events:", error);
    updateEventsDisplay([], upcomingEventsContainer, 'load-error');
    updateEventsDisplay([], previousEventsContainer, 'load-error');
  } finally {
    isInitialLoad = false;
    hideSectionSpinners();
  } 
  },
  (error) => {
    hasLoadingError = true;
    console.error("Event listener error:", error);
    updateEventsDisplay([], upcomingEventsContainer, 'load-error');
    updateEventsDisplay([], previousEventsContainer, 'load-error');
    hideSectionSpinners();
  }
);

// Close modal on button click or outside click
document.addEventListener("DOMContentLoaded", () => {
  const registerModal = document.getElementById("registerModal");
  const closeRegisterBtn = document.querySelector("#registerModal .close-btn");

  if (closeRegisterBtn) {
    closeRegisterBtn.addEventListener("click", () => registerModal.style.display = "none");
  }

  window.addEventListener("click", (e) => {
    if (e.target === registerModal) registerModal.style.display = "none";
  });
});

// Add these variables at the top
let allEvents = [];
const searchInput = document.querySelector('.search-input');
const sortSelect = document.querySelector('.sort-select');

// Add event listeners for search and sort
searchInput.addEventListener('input', () => processAndDisplayEvents());
sortSelect.addEventListener('change', () => processAndDisplayEvents());

// Helper functions
function convertPrice(price) {
  return price === 'Free' ? 0 : parseFloat(price.replace('$', '')) || 0;
}

function processAndDisplayEvents() {
  showSectionSpinners();
  const searchTerm = searchInput.value.toLowerCase();
  const sortValue = sortSelect.value;

  // Filter events
  const filteredEvents = allEvents.filter(event => {
    const searchContent = `${event.eventName} ${event.venue}`.toLowerCase();
    return searchContent.includes(searchTerm);
  });

  // Sort events
  const sortedEvents = filteredEvents.sort((a, b) => {
    switch(sortValue) {
      case 'date-asc': return a.eventDate - b.eventDate;
      case 'date-desc': return b.eventDate - a.eventDate;
      case 'price-asc': return a.numericPrice - b.numericPrice;
      case 'price-desc': return b.numericPrice - a.numericPrice;
      default: return 0;
    }
  });

  // Separate into upcoming/previous
  const now = new Date();
  const threeDaysMs = 7 * 24 * 60 * 60 * 1000;
  
  const upcoming = sortedEvents.filter(e => e.eventDate > now);
  const previous = sortedEvents.filter(e => 
    e.eventDate <= now && (now - e.eventDate) <= threeDaysMs
  );

  // Update displays
  updateEventsDisplay(upcoming, upcomingEventsContainer);
  updateEventsDisplay(previous, previousEventsContainer);

  hideSectionSpinners();
}

function updateEventsDisplay(events, container, errorType) {
  if (hasLoadingError && isInitialLoad) {
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Network Error</h3>
        <p>Could not load events. Please check your connection and try again.</p>
      </div>
    `;
    return;
  }

  if (events.length === 0) {
    const message = errorType === 'load-error' ? 
      `Temporary issue loading events. Please refresh the page.` :
      `No events found.`;

    container.innerHTML = `
      <div class="no-events-message">
        ${errorType === 'load-error' ? 
          '<i class="fas fa-exclamation-circle"></i>' : 
          '<i class="fas fa-search"></i>'}
        <p>${message}</p>
      </div>
    `;
    return;
  }
  container.innerHTML = events.map(event => createEventCard(event)).join('');

  // Reattach event listeners to new elements
  container.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const eventId = btn.dataset.eventId;
      const eventPrice = btn.dataset.eventPrice;
      const eventDate = new Date(btn.dataset.eventDate);

      if (eventDate < new Date()) {
        alert("Registration for this event is closed.");
      } else {
        openRegisterModal(eventId, eventPrice);
      }
    });
  });
}

function createEventCard(event) {
  const eventDate = event.eventDate.toLocaleDateString();
  const price = event.price === 'Free' ? 'Free' : `$${event.price}`;

  return `
    <div class="event-card">
      <img src="${event.imageDataUrl || './images/default-event.jpg'}" alt="${event.eventName}">
      <div class="event-info">
        <div class="text-content">
          <h3>${event.eventName}</h3>
          <p>Date: ${eventDate}</p>
          <p>Location: ${event.venue}</p>
          <p>Price: ${price}</p>
        </div>
        <a href="#" class="details-btn" 
           data-event-id="${event.id}" 
           data-event-price="${event.price}" 
           data-event-date="${event.eventDate.toISOString()}">
          Register Here
        </a>
      </div>
      <div class="event-description">
        <h3>${event.eventName}</h3>
        <p>${event.description}</p>
        <p>Date: ${eventDate}</p>
      </div>
    </div>
  `;
}
