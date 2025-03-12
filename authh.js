import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
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

// Initialize Firebase and get authentication instance
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// List of random avatar images
const avatarImages = [
  "/images/avatars/3d-music-related-scene.jpg",
  "/images/avatars/124599.jpg",
  "/images/avatars/cute-lion-studio.jpg",
  "/images/avatars/cute-rat-posing-studio.jpg",
  "/images/avatars/fun-3d-cartoon-orang-outan.jpg"
];

// Function to get a random avatar
function getRandomAvatar() {
  return avatarImages[Math.floor(Math.random() * avatarImages.length)];
}

function showButtonLoading(button) {
  button.innerHTML = `<div class="button-spinner"></div>`;
  button.disabled = true;
}

function hideButtonLoading(button, originalText) {
  button.innerHTML = originalText;
  button.disabled = false;
}

function showFormMessage(elementId, message, type) {
  const messageDiv = document.getElementById(elementId);
  messageDiv.textContent = message;
  messageDiv.className = `form-message ${type}`;
  setTimeout(() => messageDiv.textContent = '', 3000);
}


// Function to handle login
export function login() {
  const emailElem = document.getElementById("loginEmail");
  const passwordElem = document.getElementById("loginPassword");
  const loginButton = document.getElementById("login");
  const originalText = loginButton.innerHTML;

  if (!validateInput(emailElem) || !validateInput(passwordElem)) {
    showFormMessage('loginMessage', 'Please fill in all required fields', 'error');
    return;
  }

  showButtonLoading(loginButton);

  signInWithEmailAndPassword(auth, emailElem.value, passwordElem.value)
    .then((userCredential) => {
      emailElem.classList.add("success");
      passwordElem.classList.add("success");
      showFormMessage('loginMessage', 'Login successful', 'success');

      // Retrieve redirection info from localStorage
      let targetPage = "./index.html"; // Default fallback page
      const storedData = localStorage.getItem("redirectAfterLogin");

      if (storedData) {
        try {
          const redirectData = JSON.parse(storedData);

          // Ensure the stored data hasn't expired
          if (Date.now() < redirectData.expires) {
            targetPage = redirectData.redirect;
          }

          // Remove the stored data after use to prevent incorrect redirects
          localStorage.removeItem("redirectAfterLogin");

        } catch (e) {
          console.error("Error parsing redirect data:", e);
        }
      }
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = targetPage;
      }, 1000);
    })
    .catch((error) => {
      emailElem.classList.add("error", "shake");
      passwordElem.classList.add("error", "shake");
      setTimeout(() => { 
        emailElem.classList.remove("shake");
        passwordElem.classList.remove("shake");
      }, 500);
      showFormMessage('loginMessage', 'Invalid email or password', 'error');
    })
    .finally(() => {
      hideButtonLoading(loginButton, originalText);
    });
}

// Function to handle sign up
export function signUp() {
  const emailElem = document.getElementById("signupEmail");
  const passwordElem = document.getElementById("signupPassword");
  const signupButton = document.getElementById("signup");
  const originalText = signupButton.innerHTML;

  if (!validateInput(emailElem) || !validateInput(passwordElem)) {
    showFormMessage('signupMessage', 'Please fill in all required fields', 'error');
    return;
  }

  showButtonLoading(signupButton);

  createUserWithEmailAndPassword(auth, emailElem.value, passwordElem.value)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const avatarUrl = getRandomAvatar(); // Directly use the URL

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        avatarUrl: avatarUrl
      });

      emailElem.classList.add("success");
      passwordElem.classList.add("success");

      document.getElementById('signupModal').style.display = 'none';
      document.getElementById('loginModal').style.display = 'block';
      showFormMessage('signupMessage', 'SignUp successful, please login', 'success');
    })
    .catch((error) => {
      const message = error.code === 'auth/email-already-in-use' 
        ? 'Email already registered' 
        : 'Password should be at least 6 characters';
      emailElem.classList.add("error", "shake");
      passwordElem.classList.add("error", "shake");
      setTimeout(() => {
        emailElem.classList.remove("shake");
        passwordElem.classList.remove("shake");
      }, 500);
      showFormMessage('signupMessage', message, 'error');
    })
    .finally(() => {
      hideButtonLoading(signupButton, originalText);
    });
}

// Function to handle password reset
export function resetPassword() {
  const emailElem = document.getElementById("resetEmail");
  const originalText = resetButton.innerHTML;

  if (!validateInput(emailElem)) {
    showFormMessage('resetMessage', 'Please enter your email address', 'error');
    return;
  }

  showButtonLoading(resetButton);

  sendPasswordResetEmail(auth, emailElem.value)
    .then(() => {
      emailElem.classList.add("success");
      showFormMessage('resetMessage', 'Password reset email sent!', 'success');
      setTimeout(() => {
        document.getElementById('resetModal').style.display = 'none';
        document.getElementById('loginModal').style.display = 'block';
      }, 1000);
    })
    .catch((error) => {
      emailElem.classList.add("error", "shake");
      setTimeout(() => {
        emailElem.classList.remove("shake");
      }, 500);
      showFormMessage('resetMessage', 'Error sending reset email', 'error');
    })
    .finally(() => {
      hideButtonLoading(resetButton, originalText);
    });
}

// Helper function to validate input fields
function validateInput(input) {
  if (input.value.trim() === "") {
    input.classList.add("error", "shake");
    setTimeout(() => {
      input.classList.remove("shake");
    }, 500);
    return false;
  } else {
    input.classList.remove("error");
    input.classList.add("success");
    return true;
  }
}

// Redirect users if not logged in
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("dashboard.html")) {
    window.location.href = "index.html";
  }
});
