// -- Login modal trigger --
document.addEventListener("DOMContentLoaded", () => {
  const loginTriggers = document.querySelectorAll('.login-trigger');
  loginTriggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      // Get the redirection target from data attribute; default to "./regEvt.html"
      const redirectTarget = trigger.getAttribute("data-redirect") || "./regEvt.html";
      // Set expiration time to 15 seconds from now (in milliseconds)
      const expires = Date.now() + 15 * 1000;
      // Store as a JSON string
      localStorage.setItem("redirectAfterLogin", JSON.stringify({ redirect: redirectTarget, expires }));
      
      // Open the login modal or redirect to login page...
      const loginModal = document.getElementById("loginModal");
      if (loginModal) {
        loginModal.style.display = "block";
      } else {
        window.location.href = "./login.html";
      }
    });
  });
});

// --- Signup Modal Trigger (from within the login modal) ---
const signupLink = document.getElementById("openSignup");
if (signupLink) {
  signupLink.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("signupModal").style.display = "block";
  });
}

// --- Reset Modal Trigger (from within the login modal) ---
const resetLink = document.getElementById("openReset");
if (resetLink) {
  resetLink.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("resetModal").style.display = "block";
  });
}

// --- Link from Signup Modal back to Login Modal ---
const loginLink = document.getElementById("openLogin");
if (loginLink) {
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("signupModal").style.display = "none";
    document.getElementById("loginModal").style.display = "block";
  });
}

// --- Link from Reset Modal back to Login Modal ---
const loginLinkFromReset = document.getElementById("openLoginFromReset");
if (loginLinkFromReset) {
  loginLinkFromReset.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("resetModal").style.display = "none";
    document.getElementById("loginModal").style.display = "block";
  });
}

// --- Close Buttons for All Modals ---
const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').style.display = 'none';
  });
});

// --- Close Modals When Clicking Outside Modal Content ---
window.addEventListener('click', (e) => {
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  const resetModal = document.getElementById('resetModal');
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
  }
  if (e.target === signupModal) {
    signupModal.style.display = 'none';
  }
  if (e.target === resetModal) {
    resetModal.style.display = 'none';
  }
});

// Toggle password visibility
const togglePasswordVisibility = (toggleId, passwordId) => {
  const togglePassword = document.getElementById(toggleId);
  const password = document.getElementById(passwordId);
  if (togglePassword && password) {
    togglePassword.addEventListener("click", function () {
      const type = password.getAttribute("type") === "password" ? "text" : "password";
      password.setAttribute("type", type);
      this.classList.toggle("bx-show");
    });
  }
};

togglePasswordVisibility("toggleLoginPassword", "loginPassword");
togglePasswordVisibility("toggleSignupPassword", "signupPassword");

// Validation and shake animation
const validateInput = (input) => {
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
};

const clearValidation = (input) => {
  input.classList.remove("error", "success");
};

// Attach validation to login, signup, and reset buttons
document.getElementById("login").addEventListener("click", () => {
  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  validateInput(email);
  validateInput(password);
});

document.getElementById("signup").addEventListener("click", () => {
  const email = document.getElementById("signupEmail");
  const password = document.getElementById("signupPassword");
  validateInput(email);
  validateInput(password);
});

document.getElementById("resetButton").addEventListener("click", () => {
  const email = document.getElementById("resetEmail");
  validateInput(email);
});

// Clear validation when input is empty
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", () => {
    if (input.value.trim() === "") {
      clearValidation(input);
    }
  });
});