import { getAuth, onAuthStateChanged, signOut, updatePassword, deleteUser } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, orderBy, limit, getDocs, getCountFromServer, onSnapshot, Timestamp  } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core@6.1.8';
import dayGridPlugin from 'https://cdn.skypack.dev/@fullcalendar/daygrid@6.1.8';

// Firebase config
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
const auth = getAuth(app);
const db = getFirestore(app);

// Get elements
const sidebar = document.getElementById("sidebar");
const profileIcon = document.getElementById("profileIcon");
const profileAvatar = document.getElementById("profileAvatar");
const closeSidebar = document.getElementById("closeSidebar");
const logoutButton = document.getElementById("logoutButton");
const openSettingsModal = document.getElementById("openSettingsModal");
const closeSettingsModal = document.getElementById("closeSettingsModal");
const settingsModal = document.getElementById("settingsModal");
const userEmailDisplay = document.getElementById("userEmail");
const modalUserEmail = document.getElementById("modalUserEmail");
const updatePasswordBtn = document.getElementById("updatePasswordBtn");
const newPasswordInput = document.getElementById("newPassword");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const registeredEventsList = document.getElementById("registeredEventsList");
const upcomingEventsList = document.getElementById("upcomingEventsList");
const recentRegistrations = document.getElementById("recentRegistrations");

// Show sidebar when clicking profile icon
profileIcon.addEventListener("click", (event) => {
  sidebar.classList.add("open");
  event.stopPropagation(); // Prevent immediate closing when clicking the icon
});

// Hide sidebar when clicking close button
closeSidebar.addEventListener("click", () => {
  sidebar.classList.remove("open");
});

// Close sidebar when clicking outside of it
document.addEventListener("click", (event) => {
  if (sidebar.classList.contains("open") && 
      !sidebar.contains(event.target) && 
      !profileIcon.contains(event.target)) {
    sidebar.classList.remove("open");
  }
});

// Prevent sidebar from closing when clicking inside it
sidebar.addEventListener("click", (event) => {
  event.stopPropagation();
});

// Modified user data fetch
onAuthStateChanged(auth, async (user) => {
  // Cleanup previous listeners first
  eventsUnsubscribe();
  registrationsUnsubscribe();
  attendeesUnsubscribe();

  if (user) {
    userEmailDisplay.textContent = user.email;
    modalUserEmail.textContent = user.email;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        profileAvatar.src = userData.avatarUrl;
      }
      await initializeDashboard(user);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  } else {
    window.location.href = "./index.html";
  }
});

const stats = {
  totalEvents: document.getElementById("totalEvents"),
  totalRegistrations: document.getElementById("totalRegistrations"),
  upcomingCount: document.getElementById("upcomingCount")
};

// Add after auth state observer
async function initializeDashboard(user) {
  if (!user) return;
  
  try {
    await loadStats(user.uid);
    eventsUnsubscribe = loadUpcomingEvents(user.uid);
    registrationsUnsubscribe = loadRecentRegistrations(user.uid);
    attendeesUnsubscribe = loadRegisteredEvents(user.uid);
    await initializeCalendar(user.uid);
  } catch (error) {
    console.error("Dashboard initialization failed:", error);
    alert("Failed to load dashboard data. Please refresh.");
  }
}

// Update the cleanup
let eventsUnsubscribe = () => {};
let registrationsUnsubscribe = () => {};
let attendeesUnsubscribe = () => {};

async function loadStats(userId) {
  try {
    const eventsCol = collection(db, "events");
    const now = Timestamp.now();
    
    // Total Events
    const eventsQuery = query(eventsCol, where("userId", "==", userId));
    const eventsSnapshot = await getCountFromServer(eventsQuery);
    stats.totalEvents.textContent = eventsSnapshot.data().count;

    // Upcoming Events query
    const upcomingQuery = query(
      eventsCol,
      where("userId", "==", userId),
      where("eventDate", ">=", now),
      orderBy("eventDate")
    );
    const upcomingSnapshot = await getCountFromServer(upcomingQuery);
    stats.upcomingCount.textContent = upcomingSnapshot.data().count;

    // Organizer registrations count
    const organizerRegQuery = query(
      collection(db, "registrations"),
      where("organizerUserId", "==", userId)
    );
    const organizerRegSnapshot = await getCountFromServer(organizerRegQuery);
    
    // Attendee registrations count (if needed)
    const attendeeRegQuery = query(
      collection(db, "registrations"),
      where("attendeeUserId", "==", userId)
    );
    const attendeeRegSnapshot = await getCountFromServer(attendeeRegQuery);

    // Update stats based on your needs
    stats.totalRegistrations.textContent = organizerRegSnapshot.data().count + attendeeRegSnapshot.data().count;

  } catch (error) {
    console.error("Error loading stats:", error);
    stats.totalEvents.textContent = '0';
    stats.totalRegistrations.textContent = '0';
    stats.upcomingCount.textContent = '0';
  }
}

function loadUpcomingEvents(userId) {
  const eventsCol = collection(db, "events");
  const now = Timestamp.now();
  
  const eventsQuery = query(
    eventsCol,
    where("userId", "==", userId),
    where("eventDate", ">=", now),
    orderBy("eventDate", "asc"),
    limit(6)
  );

  return onSnapshot(eventsQuery, (snapshot) => {
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    if (snapshot.empty) {
      grid.innerHTML = '<p class="no-events">No upcoming events</p>';
    } else {
      snapshot.docs.forEach(doc => {
        const event = doc.data();
        event.id = doc.id; // Add document ID
        event.eventDate = event.eventDate.toDate();
        // Append the actual element (with its listeners)
        grid.appendChild(createEventElement(event, false));
      });
    }
    upcomingEventsList.innerHTML = '';
    upcomingEventsList.appendChild(grid);
  });
}

function loadRegisteredEvents(userId) {
  const registrationsQuery = query(
    collection(db, "registrations"),
    where("attendeeUserId", "==", userId),
    orderBy("registeredAt", "desc"),
    limit(6)
  );

  return onSnapshot(registrationsQuery, async (snapshot) => {
    const fullRegistrations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      registeredAt: doc.data().registeredAt?.toDate?.() || new Date(doc.data().registeredAt)
    }));

    const grid = document.createElement('div');
    grid.className = 'card-grid';

    // Get unique event IDs from registrations
    const eventIds = [...new Set(fullRegistrations.map(r => r.eventId))];

    if (eventIds.length === 0) {
      grid.innerHTML = '<p class="no-events">No registered events found</p>';
      registeredEventsList.innerHTML = '';
      registeredEventsList.appendChild(grid);
      return;
    }

    // Batch fetch events with improved error handling
    const events = [];
    const batchSize = 10;
    for (let i = 0; i < eventIds.length; i += batchSize) {
      const batch = eventIds.slice(i, i + batchSize);
      try {
        const q = query(collection(db, "events"), where("__name__", "in", batch));
        const batchSnapshot = await getDocs(q);
        events.push(...batchSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          eventDate: doc.data().eventDate?.toDate?.() || new Date(doc.data().eventDate)
        })));
      } catch (error) {
        console.error("Batch fetch error:", error);
      }
    }

    // Merge registration data with event data
    const enhancedEvents = fullRegistrations.map(reg => {
      const event = events.find(e => e.id === reg.eventId);
      return event ? { ...event, registrationDate: reg.registeredAt } : null;
    }).filter(Boolean);

    if (enhancedEvents.length === 0) {
      grid.innerHTML = '<p class="no-events">No registered events found</p>';
    } else {
      enhancedEvents.forEach(event => {
        grid.appendChild(createEventElement(event, false, false));
      });
    }
    registeredEventsList.innerHTML = '';
    registeredEventsList.appendChild(grid);
  }, (error) => {
    console.error("Registration listener error:", error);
    registeredEventsList.innerHTML = '<p class="error">Error loading registered events</p>';
  });
}

// loadRecentRegistrations function
function loadRecentRegistrations(userId) {
  const q = query(
    collection(db, "registrations"),
    where("organizerUserId", "==", userId),
    orderBy("registeredAt", "desc"),
    limit(6)
  );

  return onSnapshot(q, async (snapshot) => {
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    
    if (snapshot.empty) {
      grid.innerHTML = '<p class="no-events">No recent registrations</p>';
    } else {
      const registrationsWithAvatars = await Promise.all(
        snapshot.docs.map(async (registrationDoc) => {
          const registration = registrationDoc.data();
          registration.id = registrationDoc.id;
          registration.registeredAt = registration.registeredAt?.toDate?.() || new Date(registration.registeredAt);
          // Fetch attendee's avatar
          let avatarUrl = './images/main_logo.jpg'; // Default avatar
          if (registration.attendeeUserId) {
            try {
              const userDoc = await getDoc(doc(db, "users", registration.attendeeUserId));
              if (userDoc.exists()) {
                avatarUrl = userDoc.data().avatarUrl || avatarUrl;
              }
            } catch (error) {
              console.error("Error fetching user avatar:", error);
            }
          }
          return { ...registration, avatarUrl };
        })
      );
      registrationsWithAvatars.forEach(reg => {
        grid.appendChild(createRegistrationElement(reg));
      });
    }
    recentRegistrations.innerHTML = '';
    recentRegistrations.appendChild(grid);
  });
}

function createEventElement(event, isPast = false, showMetrics = true) {
  const element = document.createElement('div');
  element.className = `event-card ${isPast ? 'past' : ''} ${event.price !== "Free" ? 'paid' : ''}`;
  
  const eventDate = event.eventDate?.toDate ? event.eventDate.toDate() : new Date(event.eventDate);

  // Only include the metrics button if showMetrics is true, the event is paid, and the event has an ID
  let metricsButtonHTML = '';
  if (showMetrics && event.price !== "Free" && event.id) {
    metricsButtonHTML = `<button class="metrics-cta-btn">
                           <i class='bx bx-line-chart'></i>
                           View Metrics
                         </button>`;
  }

  element.innerHTML = `
    <div class="event-content">
      <div class="event-header">
        <h4 class="event-title">${event.eventName}</h4>
        ${event.price !== "Free" ? 
          '<span class="paid-indicator">💰 Paid Event</span>' : 
          '<span class="free-indicator">🎟️ Free</span>'}
      </div>
      <div class="event-details">
        <p class="event-venue">📍 ${event.venue}</p>
        <p class="event-price">💰 ${event.price}</p>
        <div class="event-meta">
          <span class="event-date">📅 ${eventDate.toLocaleDateString('en-GB')}</span>
          ${metricsButtonHTML}
        </div>
      </div>
    </div>
  `;

  // Attach the click listener only if the metrics button is rendered
  if (showMetrics && event.price !== "Free" && event.id) {
    const metricsBtn = element.querySelector('.metrics-cta-btn');
    if (metricsBtn) {
      metricsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openPaidEventMetricsModal(event.id);
      });
    }
  }
  return element;
}

function createRegistrationElement(registration) {
  const element = document.createElement('div');
  element.className = 'registration-card';
  const regDate = registration.registeredAt?.toDate?.() || new Date(registration.registeredAt);

  element.innerHTML = `
    <div class="registrant-info">
      <img src="${registration.avatarUrl}" class="registrant-avatar" alt="Avatar" />
      <h4 class="registrant-name">${registration.userName}</h4>
      <p class="registrant-email">📧 ${registration.userEmail}</p>
      ${registration.userPhone ? `<p class="registrant-phone">📱 ${registration.userPhone}</p>` : ''}
    </div>
    <div class="card-meta">
      <span class="registration-date">📅 Registered at:${regDate.toLocaleDateString('en-GB')}</span>
      ${registration.uniqueNumber ? 
        `<span class="unique-number">🔢 ${registration.uniqueNumber}</span>` : 
        '<span class="status-free">🎫 General</span>'}
    </div>
  `;
  return element;
}

// Open Account Settings Modal
openSettingsModal.addEventListener("click", () => {
  settingsModal.style.display = "flex";
});

// Close Account Settings Modal
closeSettingsModal.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

// Close Modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === settingsModal) {
    settingsModal.style.display = "none";
  }
});

// Update Password Functionality
updatePasswordBtn.addEventListener("click", async () => {
  const newPassword = newPasswordInput.value.trim();
  if (newPassword.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  const user = auth.currentUser;
  if (user) {
    try {
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");
      newPasswordInput.value = ""; // Clear input field
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Try again.");
    }
  }
});

// Logout functionality
logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Logged out successfully!");
    window.location.href = "./index.html"; // Redirect to home
  } catch (error) {
    console.error("Logout failed:", error);
  }
});

// Delete Account Functionality
deleteAccountBtn.addEventListener("click", async () => {
  const confirmation = confirm("Are you sure you want to delete your account? This action is irreversible.");
  if (!confirmation) return;

  const user = auth.currentUser;
  if (user) {
    try {
      await deleteUser(user);
      alert("Account deleted successfully.");
      window.location.href = "./index.html";
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Try logging in again.");
    }
  }
});

// Calendar initialization
async function initializeCalendar(userId) {
  try {
    // Get organized events
    const organizedEventsSnap = await getDocs(
      query(collection(db, "events"), where("userId", "==", userId))
    );
    
    // Get attended events through registrations
    const registrationsSnap = await getDocs(
      query(collection(db, "registrations"), 
      where("attendeeUserId", "==", userId))
    );
    
    // Get unique event IDs from registrations
    const attendedEventIds = [...new Set(
      registrationsSnap.docs.map(doc => doc.data().eventId)
    )];
    
    // Fetch attended events details
    const attendedEventsSnap = await getDocs(
      query(collection(db, "events"), 
      where("__name__", "in", attendedEventIds))
    );

    // Combine all events
    const calendarEvents = [
      ...organizedEventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'organized',
      })),
      ...attendedEventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'attending',
      }))
    ].map(event => {
      const eventDate = event.eventDate?.toDate?.() || new Date(event.eventDate);
      // Modify the event object in the calendarEvents map:
      return {
        title: event.eventName,
        start: eventDate.toISOString(),
        className: `calendar-event ${event.type}`, // Add this line
        extendedProps: {
          type: event.type === 'organized' ? 'My Event' : "I'm Attending",
          venue: event.venue,
          price: event.price
        },
        backgroundColor: event.type === 'organized' ? '#4299e1' : '#48bb78',
        borderColor: event.type === 'organized' ? '#3182ce' : '#38a169'
        }
      });

    const calendarEl = document.getElementById('calendar');
    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      events: calendarEvents,
      eventContent: (arg) => ({
        html: `<div class="fc-event-title">${arg.event.title}</div>
              <div class="fc-event-location">${arg.event.extendedProps.venue}</div>`
      })
    });
    calendar.render();
  } catch (error) {
    console.error("Calendar initialization error:", error);
    document.getElementById('calendar').innerHTML = '<p>Error loading calendar</p>';
  }
}

// banner adjustment
function adjustBannerMargin() {
  const header = document.querySelector('.header');
  const banner = document.querySelector('.banner');
  
  if (header && banner) {
    const headerHeight = header.offsetHeight;
    banner.style.marginTop = `${headerHeight + 10}px`; // 10px extra space
  }
}

// Run on load and resize
window.addEventListener('load', adjustBannerMargin);
window.addEventListener('resize', adjustBannerMargin);

// Add to the top with other DOM references
const viewAttendingLink = document.getElementById('viewAttending');
const attendingEventsModal = document.getElementById('attendingEventsModal');
const attendingUpcoming = document.getElementById('attendingUpcoming');
const attendingPast = document.getElementById('attendingPast');

// Add event listener for the view all link
viewAttendingLink.addEventListener('click', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  
  attendingEventsModal.style.display = 'block';
  await showAllAttendingEvents(user.uid);
});

// Add close handler
attendingEventsModal.querySelector('.close-modall').addEventListener('click', () => {
  attendingEventsModal.style.display = 'none';
});

//showAllAttendingEvents function
async function showAllAttendingEvents(userId) {
  try {
    // Clear previous content
    attendingUpcoming.innerHTML = '<div class="loading-spinner"></div>';
    attendingPast.innerHTML = '<div class="loading-spinner"></div>';

    //Get all registrations with validation
    const registrationsSnap = await getDocs(
      query(collection(db, "registrations"),
      where("attendeeUserId", "==", userId))
    );

    // Validate and extract event IDs
    const eventIds = registrationsSnap.docs
      .map(doc => doc.data().eventId)
      .filter(id => id && typeof id === 'string' && id.length > 0);

    if (eventIds.length === 0) {
      attendingUpcoming.innerHTML = '<p class="no-events">No events found</p>';
      return;
    }

    //Batch fetch events with error handling
    const events = [];
    const batchSize = 10;
    
    for (let i = 0; i < eventIds.length; i += batchSize) {
      const batch = eventIds.slice(i, i + batchSize);
      try {
        const q = query(collection(db, "events"), where("__name__", "in", batch));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          const eventData = doc.data();
          // Validate and convert date
          const eventDate = eventData.eventDate?.toDate 
            ? eventData.eventDate.toDate()
            : new Date(eventData.eventDate);
          
          if (isNaN(eventDate)) {
            console.warn('Invalid date for event:', doc.id);
            return;
          }
          
          events.push({
            id: doc.id,
            ...eventData,
            eventDate: eventDate
          });
        });
      } catch (error) {
        console.error("Error fetching batch:", batch, error);
      }
    }

    //Sort and categorize events
    const now = new Date();
    const upcoming = [];
    const past = [];
    
    // Sort events chronologically
    events.sort((a, b) => a.eventDate - b.eventDate);
    
    events.forEach(event => {
      if (event.eventDate >= now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    //Render events
    attendingUpcoming.innerHTML = upcoming.length > 0 
      ? upcoming.map(event => createEventElement(event, false, false).outerHTML).join('')
      : '<p class="no-events">No upcoming events</p>';
      
    attendingPast.innerHTML = past.length > 0 
      ? past.map(event => createEventElement(event, true).outerHTML).join('')
      : '<p class="no-events">No past events</p>';

      // attendingUpcoming.in

  } catch (error) {
    console.error("Error loading attending events:", error);
    attendingUpcoming.innerHTML = '<p class="error">Error loading events</p>';
  }
}

const registrantsViewAllLink = document.getElementById('view');
const registrationsModal = document.getElementById('registrationsModal');
const groupedRegistrations = document.getElementById('groupedRegistrations');
const closeModal = document.querySelector('.close-modall');

// View All functionality
registrantsViewAllLink.addEventListener('click', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  
  registrationsModal.style.display = 'block';
  await showGroupedRegistrations(user.uid);
});

// Close modal handlers
closeModal.addEventListener('click', () => {
  registrationsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === registrationsModal) {
    registrationsModal.style.display = 'none';
  }
});

let allRegistrations = null;
let eventsData = {}; // Global events cache

async function showGroupedRegistrations(userId) {
  try {
    groupedRegistrations.innerHTML = '<div class="loading-spinner"></div>';
    
    const q = query(
      collection(db, "registrations"),
      where("organizerUserId", "==", userId),
      orderBy("registeredAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    const registrations = await Promise.all(
      snapshot.docs.map(async (registrationDoc) => {
        const data = registrationDoc.data();
        let avatarUrl = './images/main_logo.jpg';
        
        if (data.attendeeUserId) {
          try {
            const userDoc = await getDoc(doc(db, "users", data.attendeeUserId));
            if (userDoc.exists()) {
              avatarUrl = userDoc.data().avatarUrl || avatarUrl;
            }
          } catch (error) {
            console.error("Error fetching user avatar:", error);
          }
        }
        
        return {
          id: registrationDoc.id,
          ...data,
          avatarUrl,
          registeredAt: data.registeredAt?.toDate?.()
        };
      })
    );

    // Get event names and cache them
    const eventIds = [...new Set(registrations.map(reg => reg.eventId))];
    const eventsSnapshot = await getDocs(query(
      collection(db, "events"),
      where("__name__", "in", eventIds)
    ));
    
    eventsData = eventsSnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data().eventName;
      return acc;
    }, {});

    allRegistrations = registrations.map(reg => ({
      ...reg,
      eventName: eventsData[reg.eventId] || 'Unknown Event'
    }));

    processAndRenderRegistrations();
    
    document.getElementById('registrationSearch').addEventListener('input', () => {
      processAndRenderRegistrations();
    });
    
    document.getElementById('sortRegistrations').addEventListener('change', () => {
      processAndRenderRegistrations();
    });

  } catch (error) {
    console.error("Error loading grouped registrations:", error);
    groupedRegistrations.innerHTML = '<p class="error">Error loading registrations</p>';
  }
}

function renderGroupedRegistrations(grouped) {
  groupedRegistrations.innerHTML = Object.entries(grouped)
    .map(([eventId, registrants]) => `
      <div class="event-group">
        <div class="event-group-header">
          <h3 class="event-group-title">${eventsData[eventId] || 'Unknown Event'} (${registrants.length})</h3>
        </div>
        ${registrants.map(reg => `
          <div class="registrant-item">
            ${createRegistrationElement(reg).innerHTML}
          </div>
        `).join('')}
      </div>
    `).join('') || '<p>No matching registrations found</p>';
}

function processAndRenderRegistrations() {
  const searchTerm = document.getElementById('registrationSearch').value.toLowerCase();
  const sortBy = document.getElementById('sortRegistrations').value;

  // Filter using the stored event names
  let filtered = allRegistrations.filter(reg => {
    return (
      reg.userName.toLowerCase().includes(searchTerm) ||
      reg.userEmail.toLowerCase().includes(searchTerm) ||
      reg.eventName.toLowerCase().includes(searchTerm) ||
      (reg.uniqueNumber || '').toLowerCase().includes(searchTerm) ||
      reg.registeredAt.toLocaleDateString('en-GB').includes(searchTerm)
    );
  });

  // Sort
  switch(sortBy) {
    case 'oldest':
      filtered.sort((a, b) => a.registeredAt - b.registeredAt);
      break;
    case 'name_asc':
      filtered.sort((a, b) => a.userName.localeCompare(b.userName));
      break;
    case 'name_desc':
      filtered.sort((a, b) => b.userName.localeCompare(a.userName));
      break;
    default: // 'newest' remains default
      filtered.sort((a, b) => b.registeredAt - a.registeredAt);
  }

  // Group filtered results
  const grouped = filtered.reduce((acc, reg) => {
    acc[reg.eventId] = acc[reg.eventId] || [];
    acc[reg.eventId].push(reg);
    return acc;
  }, {});

  // Render
  renderGroupedRegistrations(grouped);
}

const organizedEventsModal = document.getElementById("organizedEventsModal");
const organizedEventsList = document.getElementById("organizedEventsList");
const viewOrganizedEvents = document.getElementById("alll");

// Add event listener for the view all link
viewOrganizedEvents.addEventListener("click", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  
  organizedEventsModal.style.display = "block";
  await showAllOrganizedEvents(user.uid);
});

// Add close handler for the new modal
document.querySelectorAll(".close-modal").forEach(btn => {
  btn.addEventListener("click", () => {
    organizedEventsModal.style.display = "none";
  });
});

async function showAllOrganizedEvents(userId) {
  try {
    organizedEventsList.innerHTML = '<div class="loading-spinner"></div>';
    const container = document.createElement('div');
    
    const eventsCol = collection(db, "events");
    const q = query(
      eventsCol,
      where("userId", "==", userId),
      orderBy("eventDate", "asc")
    );

    const snapshot = await getDocs(q);
    const now = new Date();
    
    // Separate events into past and upcoming
    const allEvents = snapshot.docs.map(doc => {
      const event = doc.data();
      event.id = doc.id;
      event.eventDate = event.eventDate?.toDate?.() || new Date(event.eventDate);
      return event;
    });

    const upcomingEvents = allEvents.filter(event => event.eventDate >= now);
    const pastEvents = allEvents.filter(event => event.eventDate < now);

    // Build upcoming events section
    const upcomingSection = document.createElement('div');
    upcomingSection.className = 'event-section';
    const upcomingHeader = document.createElement('h3');
    upcomingHeader.textContent = `Upcoming Events (${upcomingEvents.length})`;
    upcomingSection.appendChild(upcomingHeader);
    if (upcomingEvents.length > 0) {
      upcomingEvents.forEach(event => {
        upcomingSection.appendChild(createEventElement(event, false));
      });
    } else {
      const noEventsMsg = document.createElement('p');
      noEventsMsg.className = 'no-events';
      noEventsMsg.textContent = 'No upcoming events';
      upcomingSection.appendChild(noEventsMsg);
    }

    // Build past events section
    const pastSection = document.createElement('div');
    pastSection.className = 'event-section past-events';
    const pastHeader = document.createElement('h3');
    pastHeader.textContent = `Past Events (${pastEvents.length})`;
    pastSection.appendChild(pastHeader);
    if (pastEvents.length > 0) {
      pastEvents.forEach(event => {
        pastSection.appendChild(createEventElement(event, true));
      });
    } else {
      const noEventsMsg = document.createElement('p');
      noEventsMsg.className = 'no-events';
      noEventsMsg.textContent = 'No past events';
      pastSection.appendChild(noEventsMsg);
    }

    container.appendChild(upcomingSection);
    container.appendChild(pastSection);
    organizedEventsList.innerHTML = '';
    organizedEventsList.appendChild(container);
  } catch (error) {
    console.error("Error loading organized events:", error);
    organizedEventsList.innerHTML = '<p class="error">Error loading events</p>';
  }
}

// Paid Event Metrics Functions
let registrationChart = null;
let timelineChart = null;

function updateMetricsDisplay(metrics) {
  document.getElementById('actualRegistrations').textContent = metrics.actual;
  document.getElementById('expectedRegistrations').textContent = metrics.expected;
  document.getElementById('conversionRate').textContent = 
    `${Math.round((metrics.actual / metrics.expected) * 100 || 0)}%`;
}

async function openPaidEventMetricsModal(eventId) {
  const modal = document.getElementById('paidEventMetricsModal');
  modal.style.display = 'block';
  
  try {
    // Fetch event data
    const eventDoc = await getDoc(doc(db, "events", eventId));
    const eventData = eventDoc.data();
    
    // Fetch registrations
    const registrationsSnap = await getDocs(query(
      collection(db, "registrations"),
      where("eventId", "==", eventId)
    ));
    
    // Process data
    const metrics = {
      actual: registrationsSnap.size,
      expected: eventData.expectedRegistrants || 0,
      registrations: registrationsSnap.docs
    };

    // Update UI
    updateMetricsDisplay(metrics);
    initRegistrationChart(metrics.actual, metrics.expected);
    initTimelineChart(metrics.registrations);
  } catch (error) {
    console.error("Error loading metrics:", error);
    alert("Error loading event metrics");
  }
}

function initRegistrationChart(actual, expected) {
  const ctx = document.getElementById('registrationProgressChart').getContext('2d');
  
  if (registrationChart) registrationChart.destroy();
  
  registrationChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Actual', 'Remaining'],
      datasets: [{
        data: [actual, Math.max(expected - actual, 0)],
        backgroundColor: ['#4CAF50', '#e0e0e0']
      }]
    }
  });
}

function initTimelineChart(registrations) {
  const ctx = document.getElementById('registrationTimelineChart').getContext('2d');
  
  if (timelineChart) timelineChart.destroy();
  
  // Process timeline data (grouping by day)
  const timelineData = registrations.reduce((acc, doc) => {
    const date = doc.data().registeredAt.toDate();
    const day = date.getDate(); // Extract only the day
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  timelineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(timelineData),
      datasets: [{
        label: 'Daily Registrations',
        data: Object.values(timelineData),
        borderColor: '#2196F3',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: {
          label: 'days',
          type: 'linear', // Use a linear scale since we are only showing days
          ticks: {
            callback: function(value) {
              return value; // Display only the day number
            }
          }
        }
      }
    }
  });
}

// Add modal closing handlers
document.querySelectorAll('#paidEventMetricsModal .close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('paidEventMetricsModal').style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('paidEventMetricsModal')) {
    document.getElementById('paidEventMetricsModal').style.display = 'none';
  }
});
