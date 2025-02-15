import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function signUp() {
    const email = document.getElementById("signupEmail");
    const password = document.getElementById("signupPassword");

    if (!validateInput(email) || !validateInput(password)) {
        return;
    }

    createUserWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            email.classList.add("success");
            password.classList.add("success");
            // Hide signup modal and show login modal
            document.getElementById('signupModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
            showNotification("Signup Successful! Please log in.", "success");
        })
        .catch((error) => {
            email.classList.add("error", "shake");
            password.classList.add("error", "shake");
            setTimeout(() => {
                email.classList.remove("shake");
                password.classList.remove("shake");
            }, 500);
            showNotification("Enter valid credentials", "error");
        });
}

export function login() {
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");

    if (!validateInput(email) || !validateInput(password)) {
        return;
    }

    signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            email.classList.add("success");
            password.classList.add("success");
            showNotification("Login Successful! Redirecting...", "success");
            setTimeout(() => {
                window.location.href = "./crtEvt.html"; // Redirect to homepage
            }, 1000);
        })
        .catch((error) => {
            email.classList.add("error", "shake");
            password.classList.add("error", "shake");
            setTimeout(() => {
                email.classList.remove("shake");
                password.classList.remove("shake");
            }, 500);
            showNotification("Enter valid credentials", "error");
        });
}

// export function logout() {
//     signOut(auth)
//         .then(() => {
//             alert("Logged out successfully!");
//             window.location.href = "./login.html";
//         }).catch((error) => {
//             alert(error.message);
//         });
// }

export function resetPassword() {
    const email = document.getElementById("resetEmail");

    if (!validateInput(email)) {
        return;
    }

    sendPasswordResetEmail(auth, email.value)
        .then(() => {
            email.classList.add("success");
            showNotification("Password reset email sent! Check your inbox.", "success");
            setTimeout(() => {
                document.getElementById('resetModal').style.display = 'none';
                document.getElementById('loginModal').style.display = 'block';
            }, 1000);
        })
        .catch((error) => {
            email.classList.add("error", "shake");
            setTimeout(() => {
                email.classList.remove("shake");
            }, 500);
            showNotification("Enter valid credentials", "error");
        });
}

function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

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
