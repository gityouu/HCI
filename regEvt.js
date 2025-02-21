import { getFirestore, collection, query, orderBy, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
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

// initialize firebase and firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference to the events collection
const eventsCol = collection(db, "events");

// Create a query to order events by date (ascending)
const eventsQuery = query(eventsCol, orderBy("eventDate", "asc"));

// Get container elements for upcoming and previous events
const upcomingEventsContainer = document.getElementById("upcoming-events");
const previousEventsContainer = document.getElementById("previous-events");

// Listen to realtime updates
onSnapshot(eventsQuery, (snapshot) => {
  // Clear previous content
  upcomingEventsContainer.innerHTML = "";
  previousEventsContainer.innerHTML = "";

  const now = new Date();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

  let hasUpcomingEvents = false;
  let hasPreviousEvents = false;

  snapshot.forEach((doc) => {
    const event = doc.data();
    const eventDateObj = new Date(event.eventDate);

    // Create an event card
    const card = document.createElement("div");
    card.classList.add("event-card");
    card.innerHTML = `
      <img src="${event.imageDataUrl ? event.imageDataUrl : './images/odiseo-castrejon-1CsaVdwfIew-unsplash.jpg'}" alt="${event.eventName}">
      <div class="event-info">
        <div class="text-content">
          <h3>${event.eventName}</h3>
          <p>Date: ${eventDateObj.toLocaleDateString()}</p>
          <p>Location: ${event.venue}</p>
          <p>Price: ${event.price && event.price !== "Free" ? "$" + event.price : "Free"}</p>
        </div>
        <a href="#" class="details-btn" data-event-id="${doc.id}" data-event-price="${event.price}" data-event-date="${event.eventDate}">Register Here</a>
      </div>
      <div class="event-description">
        <h3>${event.eventName}</h3>
        <p>${event.description}</p>
        <p>Date: ${eventDateObj.toLocaleDateString()}</p>
      </div>
    `;

    // If the event date is in the future, add to upcoming events.
    if (eventDateObj > now) {
      upcomingEventsContainer.appendChild(card);
      hasUpcomingEvents = true;
    } 
    // If the event is in the past but not older than 3 days, add to previous events.
    else if ((now - eventDateObj) <= threeDaysMs) {
      previousEventsContainer.appendChild(card);
      hasPreviousEvents = true;
    }
    // Otherwise, events older than 3 days are not displayed.

    // Attach event listener to the "Register Details" button
    const registerBtn = card.querySelector(".details-btn");
    registerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const eventId = registerBtn.getAttribute("data-event-id");
      const eventPrice = registerBtn.getAttribute("data-event-price");
      const eventDate = new Date(registerBtn.getAttribute("data-event-date"));

      // If the event is in the past, registration is closed.
      if (eventDate < now) {
        alert("Registration for this event is closed.");
      } else {
        openRegisterModal(eventId, eventPrice);
      }
    });
  });

  // Display message if there are no upcoming events
  if (!hasUpcomingEvents) {
    const noUpcomingEventsMessage = document.createElement("p");
    noUpcomingEventsMessage.textContent = "No upcoming events...";
    noUpcomingEventsMessage.style.textAlign = "center";
    noUpcomingEventsMessage.style.marginTop = "20px";
    noUpcomingEventsMessage.style.marginBottom = "20px";
    noUpcomingEventsMessage.style.fontSize = "1.3rem";
    upcomingEventsContainer.appendChild(noUpcomingEventsMessage);
  }

  // Display message if there are no previous events
  if (!hasPreviousEvents) {
    const noPreviousEventsMessage = document.createElement("p");
    noPreviousEventsMessage.textContent = "No previous events...";
    noPreviousEventsMessage.style.textAlign = "center";
    noPreviousEventsMessage.style.marginTop = "20px";
    noPreviousEventsMessage.style.fontSize = "1.3rem";
    noPreviousEventsMessage.style.marginBottom = "20px";
    previousEventsContainer.appendChild(noPreviousEventsMessage);
  }
});

// Attach close event listener for the register modal (once)
document.addEventListener("DOMContentLoaded", () => {
  const registerModal = document.getElementById("registerModal");
  const closeRegisterBtn = document.querySelector("#registerModal .close-btn");
  if (closeRegisterBtn) {
    closeRegisterBtn.addEventListener("click", () => {
      registerModal.style.display = "none";
    });
  }

  // Also close modal when clicking outside modal content
  window.addEventListener("click", (e) => {
    if (e.target === registerModal) {
      registerModal.style.display = "none";
    }
  });
});

// Function to open the registration modal
function openRegisterModal(eventId, eventPrice) {
  const registerModal = document.getElementById("registerModal");

  registerModal.style.display = "block";

  // Attach form submission event listener
  const registerForm = document.getElementById("registerForm");
  // Remove previous listeners to avoid duplicates
  registerForm.replaceWith(registerForm.cloneNode(true));
  const newRegisterForm = document.getElementById("registerForm");

  newRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userName = document.getElementById("userName").value;
    const userEmail = document.getElementById("userEmail").value;
    const userPhone = document.getElementById("userPhone").value;

    // Generate a unique number only if the event is paid
    const uniqueNumber = eventPrice && eventPrice !== "Free" ? generateUniqueNumber() : null;

    const registrationData = {
      eventId,
      userName,
      userEmail,
      userPhone,
      uniqueNumber,
      registeredAt: new Date()
    };

    try {
      await addDoc(collection(db, "registrations"), registrationData);
      alert(`Registration successful!${uniqueNumber ? ` Your unique number is: ${uniqueNumber}` : ''}`);
      registerModal.style.display = "none";
    } catch (error) {
      console.error("Error registering for event: ", error);
      alert("Error registering for event. Please try again.");
    }
  });
}

// Function to generate a unique number
function generateUniqueNumber() {
  return "UN" + Math.floor(Math.random() * 1000000);
}
