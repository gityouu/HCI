// Attach event listeners to all elements that should trigger login modal
const loginTriggers = document.querySelectorAll('.login-trigger');
loginTriggers.forEach(trigger => {
trigger.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginModal').style.display = 'block';
    })
});

//toggle login password to hide and unhide
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("loginPassword");
    togglePassword.addEventListener("click", function () {
        const type = password.getAttribute("type") === "password" ? "text" : "password";
        password.setAttribute("type", type);
        this.classList.toggle("bx-show");
});

// Close modal when clicking the close button
const closeModal = document.getElementById('closeModal');
if (closeModal) {
closeModal.addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'none';
    })
};

// Close modal when clicking outside modal content
window.addEventListener('click', (e) => {
const modal = document.getElementById('loginModal');
if (e.target == modal) {
    modal.style.display = 'none';
    }
});