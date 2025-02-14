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

// exports into index.html
export function signUp() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Signup Successful! Please log in.");
            // Hide signup modal and show login modal
            document.getElementById('signupModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
        })
        .catch((error) => {
            alert(error.message);
        });
}

export function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Login Successful! Redirecting...");
            window.location.href = "./crtEvt.html"; // Redirect to homepage
        })
        .catch((error) => {
            alert(error.message);
        });
}

export function logout() {
    signOut(auth)
        .then(() => {
            alert("Logged out successfully!");
            window.location.href = "./login.html";
        }).catch((error) => {
            alert(error.message);
        });
}

export function resetPassword() {
    const email = document.getElementById("resetEmail").value;

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("Password reset email sent! Check your inbox.");
        })
        .catch((error) => {
            alert(error.message);
        });
}
