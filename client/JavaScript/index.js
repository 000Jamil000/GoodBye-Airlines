flatpickr("#departureDate", {
  dateFormat: "Y-m-d",
  minDate: "today",
});
flatpickr("#arrivalDate", {
  dateFormat: "Y-m-d",
  minDate: "today",
});

const ticketList = document.getElementById("ticketList");

function redirectToProfile() {
  window.location.href = "http://localhost:5000/HTML/profilePerson.html";
}
