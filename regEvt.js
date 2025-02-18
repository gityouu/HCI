import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
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

  snapshot.forEach((doc) => {
    const event = doc.data();
    const eventDateObj = new Date(event.eventDate);

    // Create an event card
    const card = document.createElement("div");
    card.classList.add("event-card");
    card.innerHTML = `
      <img src="${event.imageURL ? event.imageURL : './images/odiseo-castrejon-1CsaVdwfIew-unsplash.jpg'}" alt="${event.eventName}">
      <div class="event-info">
        <h3>${event.eventName}</h3>
        <p>Date: ${eventDateObj.toLocaleDateString()}</p>
        <p>Location: ${event.venue}</p>
        <p>Price: ${event.price && event.price !== "Free" ? "$" + event.price : "Free"}</p>
        <a href="#" class="details-btn">View Details</a>
      </div>
    `;

    // If the event date is in the future, add to upcoming events.
    if (eventDateObj > now) {
      upcomingEventsContainer.appendChild(card);
    } 
    // If the event is in the past but not older than 3 days, add to previous events.
    else if ((now - eventDateObj) <= threeDaysMs) {
      previousEventsContainer.appendChild(card);
    }
    // Otherwise, events older than 3 days are not displayed.
  });
});
