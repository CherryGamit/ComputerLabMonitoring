// ==================================
// ELEMENTS
// ==================================
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const pageTitle = document.getElementById("pageTitle");
const switchText = document.getElementById("switchText");
const switchContainer = document.getElementById("switchContainer");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");
const errorIconTag = document.getElementById("errorIconTag");

// Login Inputs
const loginUsernameInput = document.getElementById("loginUsername");
const loginPasswordInput = document.getElementById("loginPassword");
const toggleLoginPassword = document.getElementById("toggleLoginPassword");
const loginEyeIcon = document.getElementById("loginEyeIcon");

// Register Inputs
const regFullnameInput = document.getElementById("regFullname");
const regUsernameInput = document.getElementById("regUsername");
const regEmailInput = document.getElementById("regEmail");
const regPasswordInput = document.getElementById("regPassword");
const toggleRegPassword = document.getElementById("toggleRegPassword");
const regEyeIcon = document.getElementById("regEyeIcon");

// Forgot Password Inputs
const forgotEmailInput = document.getElementById("forgotEmail");
const newPasswordInput = document.getElementById("newPassword");

// ==================================
// HELPER: CUSTOM NOTIFICATION
// ==================================
function showCustomMessage(message, type = "error") {
    errorText.textContent = message;
    if (type === "success") {
        errorMessage.style.background = "#e1fce8";
        errorMessage.style.borderColor = "#abefc6";
        errorMessage.style.color = "#027a48";
        errorIconTag.style.background = "#17b26a";
        errorIconTag.textContent = "✓";
    } else {
        errorMessage.style.background = "#ffe1e5";
        errorMessage.style.borderColor = "#ffb7c0";
        errorMessage.style.color = "#b42332";
        errorIconTag.style.background = "#d92d42";
        errorIconTag.textContent = "!";
    }
    errorMessage.classList.add("show");
}

// ==================================
// SWITCH BETWEEN FORMS (Login, Register, Forgot)
// ==================================
document.getElementById("showRegister").addEventListener("click", function (e) {
    e.preventDefault();
    errorMessage.classList.remove("show");

    loginForm.style.display = "none";
    forgotPasswordForm.style.display = "none";
    signupForm.style.display = "block";

    formTitle.textContent = "Create Account";
    formSubtitle.textContent = "Sign up to access the Laboratory System.";
    pageTitle.textContent = "Register | Computer Laboratory System";
    switchContainer.style.display = "block";
    switchText.innerHTML = `Already have an account? <a href="#" id="showLogin">Log in here</a>`;
    attachLoginLinkListener();
});

document.getElementById("showForgotPassword").addEventListener("click", function (e) {
    e.preventDefault();
    errorMessage.classList.remove("show");

    loginForm.style.display = "none";
    signupForm.style.display = "none";
    forgotPasswordForm.style.display = "block";

    formTitle.textContent = "Reset Password";
    formSubtitle.textContent = "Enter your email to update your password.";
    pageTitle.textContent = "Forgot Password | Computer Laboratory System";
    switchContainer.style.display = "none"; // Hide standard switch container
});

document.getElementById("backToLoginFromForgot").addEventListener("click", function (e) {
    e.preventDefault();
    location.reload(); // Refresh para bumalik sa malinis na state ng login
});

function attachLoginLinkListener() {
    const showLoginBtn = document.getElementById("showLogin");
    if (showLoginBtn) {
        showLoginBtn.addEventListener("click", function (e) {
            e.preventDefault();
            location.reload();
        });
    }
}

// ==================================
// SHOW / HIDE PASSWORD (LOGIN)
// ==================================
if (toggleLoginPassword) {
    toggleLoginPassword.addEventListener("click", function () {
        if (loginPasswordInput.type === "password") {
            loginPasswordInput.type = "text";
            loginEyeIcon.innerHTML = `
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M3 3l18 18"/>
            `;
        } else {
            loginPasswordInput.type = "password";
            loginEyeIcon.innerHTML = `
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
                <circle cx="12" cy="12" r="3"/>
            `;
        }
    });
}

// ==================================
// SHOW / HIDE PASSWORD (REGISTER)
// ==================================
if (toggleRegPassword) {
    toggleRegPassword.addEventListener("click", function () {
        if (regPasswordInput.type === "password") {
            regPasswordInput.type = "text";
            regEyeIcon.innerHTML = `
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M3 3l18 18"/>
            `;
        } else {
            regPasswordInput.type = "password";
            regEyeIcon.innerHTML = `
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
                <circle cx="12" cy="12" r="3"/>
            `;
        }
    });
}

// ==================================
// DEFAULT ACCOUNTS & LOCALSTORAGE
// ==================================
const defaultUsers = [
    {
        fullname: "Administrator",
        username: "admin",
        email: "admin@gmail.com",
        password: "admin123",
        role: "Administrator"
    },
    {
        fullname: "Lab Custodian",
        username: "custodian",
        email: "custodian@gmail.com",
        password: "custodian123",
        role: "Lab Custodian"
    }
];

function getUsers() {
    const savedUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    return [...defaultUsers, ...savedUsers];
}

// ==================================
// HANDLE LOGIN SUBMISSION
// ==================================
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = loginUsernameInput.value.trim().toLowerCase();
    const password = loginPasswordInput.value;

    if (username === "" || password === "") {
        showCustomMessage("Please enter your username and password.", "error");
        return;
    }

    const users = getUsers();
    const user = users.find(account => 
        (account.username.toLowerCase() === username || account.email.toLowerCase() === username) && 
        account.password === password
    );

    if (!user) {
        showCustomMessage("Invalid username or password. Please try again.", "error");
        loginPasswordInput.value = "";
        loginPasswordInput.focus();
        return;
    }

    // Save Session
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userRole", user.role);
    sessionStorage.setItem("username", user.username);
    sessionStorage.setItem("fullname", user.fullname);

    // Redirect to Dashboard
    window.location.href = "dash.html";
});

// ==================================
// HANDLE FORGOT PASSWORD SUBMISSION
// ==================================
forgotPasswordForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = forgotEmailInput.value.trim().toLowerCase();
    const newPassword = newPasswordInput.value;

    if (!email || !newPassword) {
        showCustomMessage("Please fill in all fields.", "error");
        return;
    }

    // Check kung kasama sa default users
    const defaultUserIndex = defaultUsers.findIndex(u => u.email.toLowerCase() === email);
    if (defaultUserIndex !== -1) {
        defaultUsers[defaultUserIndex].password = newPassword;
        showCustomMessage("Password updated successfully! You can now log in.", "success");
        setTimeout(() => location.reload(), 2000);
        return;
    }

    // Check sa registered users sa localStorage
    let savedUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const userIndex = savedUsers.findIndex(u => u.email.toLowerCase() === email);

    if (userIndex === -1) {
        showCustomMessage("Email address not found in the system.", "error");
        return;
    }

    // Update ang password ng user
    savedUsers[userIndex].password = newPassword;
    localStorage.setItem("registeredUsers", JSON.stringify(savedUsers));

    showCustomMessage("Password updated successfully! You can now log in.", "success");
    setTimeout(() => {
        location.reload();
    }, 2000);
});

// ==================================
// HANDLE REGISTER SUBMISSION
// ==================================
signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullname = regFullnameInput.value.trim();
    const username = regUsernameInput.value.trim().toLowerCase();
    const email = regEmailInput.value.trim().toLowerCase();
    const password = regPasswordInput.value;

    if (!fullname || !username || !email || !password) {
        showCustomMessage("Please fill in all required fields.", "error");
        return;
    }

    let savedUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const existingUser = savedUsers.find(u => u.email === email || u.username === username);

    if (existingUser) {
        showCustomMessage("Username or email already exists.", "error");
        return;
    }

    const newUser = {
        fullname,
        username,
        email,
        password,
        role: "Instructor" // Default role para sa mga nagre-register
    };

    savedUsers.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(savedUsers));

    showCustomMessage("Registration successful! Please log in.", "success");
    setTimeout(() => {
        location.reload();
    }, 2000);


// ==========================================
// DISPLAY LOGGED-IN USER PROFILE
// ==========================================

function displayLoggedInUser() {

    const fullname = sessionStorage.getItem("fullname") || "User";
    const username = sessionStorage.getItem("username") || "user";
    const userRole = sessionStorage.getItem("userRole") || "User";

    // Kunin ang initials
    const initials = fullname
        .trim()
        .split(/\s+/)
        .map(name => name.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

    // Palitan ang profile initials
    document.querySelectorAll("body *").forEach(element => {

        if (element.children.length === 0) {

            const text = element.textContent.trim();

            if (text === "AD") {
                element.textContent = initials;
            }

            if (text === "Admin") {
                element.textContent = fullname;
            }

            if (text === "Administrator" || text === "System Admin") {
                element.textContent = userRole;
            }
        }
    });

    // Palitan ang welcome message
    const welcomeHeading = document.querySelector("h1");

    if (welcomeHeading && welcomeHeading.textContent.includes("Welcome back")) {
        welcomeHeading.textContent = `Welcome back, ${fullname}!`;
    }
}

// CHECK LOGIN SESSION
if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
} else {
    displayLoggedInUser();
}

}); 