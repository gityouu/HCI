// Attach login modal triggers
const loginTriggers = document.querySelectorAll('.login-trigger');
loginTriggers.forEach(trigger => {
   trigger.addEventListener('click', (e) => {
     e.preventDefault();
     // Show login modal and hide other modals if open
     document.getElementById('loginModal').style.display = 'block';
     document.getElementById('signupModal').style.display = 'none';
     document.getElementById('resetModal').style.display = 'none';
   });
});

// Attach signup modal triggers (from within login modal)
const signupLink = document.getElementById('openSignup');
if (signupLink) {
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Hide login modal and show signup modal
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signupModal').style.display = 'block';
  });
}

// Attach reset modal triggers (from within login modal)
const resetLink = document.getElementById('openReset');
if (resetLink) {
  resetLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Hide login modal and show reset modal
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('resetModal').style.display = 'block';
  });
}

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

// Link from signup modal back to login modal
const loginLink = document.getElementById('openLogin');
if (loginLink) {
  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signupModal').style.display = 'none';
    document.getElementById('loginModal').style.display = 'block';
  });
}

// Link from reset modal back to login modal
const loginLinkFromReset = document.getElementById('openLoginFromReset');
if (loginLinkFromReset) {
  loginLinkFromReset.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('resetModal').style.display = 'none';
    document.getElementById('loginModal').style.display = 'block';
  });
}

// Close buttons for all modals
const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').style.display = 'none';
  });
});

// Close modal when clicking outside modal content
window.addEventListener('click', (e) => {
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  const resetModal = document.getElementById('resetModal');
  if (e.target == loginModal) {
    loginModal.style.display = 'none';
  }
  if (e.target == signupModal) {
    signupModal.style.display = 'none';
  }
  if (e.target == resetModal) {
    resetModal.style.display = 'none';
  }
});

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