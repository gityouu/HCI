function signUp() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Signup Successful! Redirecting...");
            window.location.href = "./login.html"; // Redirect to login page
        })
        .catch((error) => {
            alert(error.message);
        });
}

function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Login Successful! Redirecting...");
            window.location.href = "./index.html"; // Redirect to homepage
        })
        .catch((error) => {
            alert(error.message);
        });
}

function logout() {
    firebase.auth().signOut().then(() => {
        alert("Logged out successfully!");
        window.location.href = "./login.html";
    }).catch((error) => {
        alert(error.message);
    });
}

function resetPassword() {
    const email = document.getElementById("resetEmail").value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("Password reset email sent! Check your inbox.");
        })
        .catch((error) => {
            alert(error.message);
        });
}
