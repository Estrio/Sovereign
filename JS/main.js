// ========== FIREBASE IMPORTS ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Firebase config (keep your existing one)
const firebaseConfig = {
  apiKey: "AIzaSyCagSfjutHNoHTfssxb_bzLIvXchlGGwmA",
  authDomain: "sovereign-afd67.firebaseapp.com",
  projectId: "sovereign-afd67",
  storageBucket: "sovereign-afd67.appspot.com",
  messagingSenderId: "498901354278",
  appId: "1:498901354278:web:efaeea15e4d2cff79563e7",
  measurementId: "G-53FJQYSDY5"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

    // ========== NAVIGATE TO GAME ==========
function openGame(game) {
  window.location.href = game + ".html";
}

// ========== PANEL SWITCH ==========
function switchPanel(from, to) {
  const fromPanel = document.getElementById(from + "-panel");
  const toPanel = document.getElementById(to + "-panel");

  fromPanel.classList.remove("show");
  setTimeout(() => {
    fromPanel.style.display = "none";
    toPanel.style.display = "flex";
    setTimeout(() => toPanel.classList.add("show"), 50);
  }, 300);
}

// ========== SPLASH VIDEO HANDLING ==========
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const video = splash?.querySelector("video");
  const loginPanel = document.getElementById("login-panel");
  const skipBtn = document.getElementById("skip-btn");

  function endSplash() {
    splash.classList.add("hidden");
    setTimeout(() => {
      splash.style.display = "none";
      loginPanel.style.display = "flex";
      setTimeout(() => loginPanel.classList.add("show"), 50);
    }, 800);
  }

  if (video) {
    video.play().catch(() => console.warn("Autoplay blocked, waiting for interaction."));
    video.onended = endSplash;
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", endSplash);
  }
});

// ========== REGISTER ==========
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Registered successfully! Please log in.");
    switchPanel("register", "login");
  } catch (error) {
    alert("❌ " + error.message);
  }
});

// ========== LOGIN ==========
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="text"], input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Logged in!");
  } catch (error) {
    alert("❌ " + error.message);
  }
});

// ========== AUTH STATE ==========
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Logged in
    document.getElementById("login-panel").style.display = "none";
    document.getElementById("register-panel").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
  } else {
    // Logged out
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("login-panel").style.display = "flex";
  }
});

// ========== LOGOUT ==========
function logout() {
  signOut(auth);
}
window.logout = logout;
window.switchPanel = switchPanel;