const profileBtn = document.getElementById("profileBtn");
const settingsBtn = document.getElementById("settingsBtn");

function redirectToProfileManager() {
  window.location.href =
    "http://localhost:5000/HTML/Manager/profileManager.html";
}

function redirectToRouteManagement() {
  window.location.href =
    "http://localhost:5000/HTML/Manager/routeManagement.html";
}

profileBtn.addEventListener("click", redirectToProfileManager);
settingsBtn.addEventListener("click", redirectToRouteManagement);

flatpickr("#departureDate", {
  dateFormat: "Y-m-d",
  minDate: "today",
});
flatpickr("#arrivalDate", {
  dateFormat: "Y-m-d",
  minDate: "today",
});
