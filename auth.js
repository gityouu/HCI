import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
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
const auth = getAuth(app);



// Function to handle login
export function login() {
    const emailElem = document.getElementById("loginEmail");
    const passwordElem = document.getElementById("loginPassword");
  
    if (!validateInput(emailElem) || !validateInput(passwordElem)) {
      return;
    }
  
    signInWithEmailAndPassword(auth, emailElem.value, passwordElem.value)
      .then((userCredential) => {
        emailElem.classList.add("success");
        passwordElem.classList.add("success");
        showNotification("Login Successful! Redirecting...", "success");
  
        // Retrieve and check the stored redirect info
        let targetPage = "./regEvt.html"; // default target page
        const storedData = localStorage.getItem("redirectAfterLogin");
        if (storedData) {
          try {
            const redirectData = JSON.parse(storedData);
            // Check if current time is less than the expiration timestamp
            if (Date.now() < redirectData.expires) {
              targetPage = redirectData.redirect;
            } else {
              // If expired, remove it from localStorage
              localStorage.removeItem("redirectAfterLogin");
            }
          } catch (e) {
            targetPage = "./regEvt.html";
          }
        }
  
        setTimeout(() => {
          window.location.href = targetPage; // Redirect accordingly
        }, 1000);
      })
      .catch((error) => {
        emailElem.classList.add("error", "shake");
        passwordElem.classList.add("error", "shake");
        setTimeout(() => {
          emailElem.classList.remove("shake");
          passwordElem.classList.remove("shake");
        }, 500);
        showNotification("Enter valid credentials", "error");
      });
  }
  

// Function to handle sign up
export function signUp() {
    const emailElem = document.getElementById("signupEmail");
    const passwordElem = document.getElementById("signupPassword");

    if (!validateInput(emailElem) || !validateInput(passwordElem)) {
        return;
    }

    createUserWithEmailAndPassword(auth, emailElem.value, passwordElem.value)
        .then((userCredential) => {
            emailElem.classList.add("success");
            passwordElem.classList.add("success");
            // Hide signup modal and show login modal (assuming modals exist)
            document.getElementById('signupModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
            showNotification("Signup Successful! Please log in.", "success");
        })
        .catch((error) => {
            emailElem.classList.add("error", "shake");
            passwordElem.classList.add("error", "shake");
            setTimeout(() => {
                emailElem.classList.remove("shake");
                passwordElem.classList.remove("shake");
        }, 500);
            showNotification("Enter valid credentials", "error");
        });
}

// Function to handle password reset
export function resetPassword() {
    const emailElem = document.getElementById("resetEmail");

    if (!validateInput(emailElem)) {
        return;
    }

    sendPasswordResetEmail(auth, emailElem.value)
        .then(() => {
        emailElem.classList.add("success");
        showNotification("Password reset email sent! Check your inbox.", "success");
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
        showNotification("Enter valid credentials", "error");
        });
}

// Helper function to show notifications
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
