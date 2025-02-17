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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference to the events collection
const eventsCol = collection(db, "events");

// Create a query to order events (for example, by date)
const eventsQuery = query(eventsCol, orderBy("eventDate", "asc"));

// Listen to realtime updates
onSnapshot(eventsQuery, (snapshot) => {
  const eventsGrid = document.querySelector(".events-grid");
  eventsGrid.innerHTML = ""; // Clear previous content

  snapshot.forEach((doc) => {
    const event = doc.data();
    // Create an event card (customize HTML as needed)
    const card = document.createElement("div");
    card.classList.add("event-card");
    card.innerHTML = `
      <img src="path/to/default-event-image.jpg" alt="${event.eventName}">
      <div class="event-info">
        <h3>${event.eventName}</h3>
        <p>Date: ${new Date(event.eventDate).toLocaleDateString()}</p>
        <p>Location: ${event.venue}</p>
        <p>Price: ${event.price ? "$" + event.price : "Free"}</p>
        <a href="#" class="details-btn">View Details</a>
      </div>
    `;
    eventsGrid.appendChild(card);
  });
});
