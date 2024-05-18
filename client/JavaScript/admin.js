const profileBtn = document.getElementById("profileBtn");
const settingsBtn = document.getElementById("settingsBtn");

function redirectToProfileAdmin() {
  window.location.href = "http://localhost:5000/HTML/Admin/profileAdmin.html";
}

function redirectToAccessSettings() {
  window.location.href = "http://localhost:5000/HTML/Admin/accessSettings.html";
}

profileBtn.addEventListener("click", redirectToProfileAdmin);
settingsBtn.addEventListener("click", redirectToAccessSettings);
