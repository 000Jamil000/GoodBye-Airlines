// Global variables
let currentUser = null;
let passengerCounts = { adults: 1, children: 0, infants: 0 };

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  setupDatePickers();
  setupEventListeners();
  setupAnimations();
  checkAuth();
}

// Setup date pickers with enhanced configuration
function setupDatePickers() {
  const departurePicker = flatpickr("#departureDate", {
    dateFormat: "d.m.Y",
    minDate: "today",
    locale: "ru",
    onChange: function(selectedDates) {
      if (selectedDates.length > 0) {
        returnPicker.set('minDate', selectedDates[0]);
      }
    }
  });

  const returnPicker = flatpickr("#arrivalDate", {
    dateFormat: "d.m.Y",
    minDate: "today",
    locale: "ru"
  });
}

// Setup all event listeners
function setupEventListeners() {
  // Search form
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }

  // Trip type radio buttons
  const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
  tripTypeRadios.forEach(radio => {
    radio.addEventListener('change', handleTripTypeChange);
  });

  // Swap cities button
  const swapButton = document.getElementById('swapCities');
  if (swapButton) {
    swapButton.addEventListener('click', swapCities);
  }

  // Passengers selector
  const passengersInput = document.getElementById('passengers');
  const passengersDropdown = document.getElementById('passengersDropdown');
  
  if (passengersInput && passengersDropdown) {
    passengersInput.addEventListener('click', togglePassengersDropdown);
    
    // Counter buttons
    const counterButtons = document.querySelectorAll('.counter-btn');
    counterButtons.forEach(button => {
      button.addEventListener('click', handlePassengerCount);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!passengersInput.contains(e.target) && !passengersDropdown.contains(e.target)) {
        passengersDropdown.classList.remove('active');
      }
    });
  }

  // Header scroll effect
  window.addEventListener('scroll', handleHeaderScroll);
}

// Animation setup
function setupAnimations() {
  // Add fade-in animation to feature cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${Math.random() * 0.5}s`;
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => observer.observe(card));
}

// Authentication check
function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (token) {
    fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        localStorage.removeItem('authToken');
        throw new Error('Token expired');
      }
    })
    .then(user => {
      currentUser = user;
      updateAuthUI();
    })
    .catch(error => {
      console.log('Пользователь не авторизован');
    });
  }
}

function updateAuthUI() {
  const profileIcon = document.querySelector('.profile-icon span');
  if (currentUser && profileIcon) {
    profileIcon.textContent = `${currentUser.firstName}`;
  }
}

// Event handlers
function handleSearch(e) {
  e.preventDefault();
  searchFlights();
}

function handleTripTypeChange(e) {
  const returnDateGroup = document.getElementById('returnDateGroup');
  const returnDateInput = document.getElementById('arrivalDate');
  
  if (e.target.value === 'oneway') {
    returnDateGroup.style.display = 'none';
    returnDateInput.removeAttribute('required');
  } else {
    returnDateGroup.style.display = 'flex';
    returnDateInput.setAttribute('required', 'required');
  }
}

function swapCities() {
  const cityFrom = document.getElementById('cityFrom');
  const destination = document.getElementById('destination');
  
  const temp = cityFrom.value;
  cityFrom.value = destination.value;
  destination.value = temp;
  
  // Add animation effect
  const swapButton = document.getElementById('swapCities');
  swapButton.style.transform = 'rotate(180deg)';
  setTimeout(() => {
    swapButton.style.transform = 'rotate(0deg)';
  }, 300);
}

function togglePassengersDropdown() {
  const dropdown = document.getElementById('passengersDropdown');
  dropdown.classList.toggle('active');
}

function handlePassengerCount(e) {
  e.preventDefault();
  const type = e.target.dataset.type;
  const action = e.target.dataset.action;
  
  if (action === 'plus') {
    if (type === 'adults' && passengerCounts.adults < 9) {
      passengerCounts.adults++;
    } else if (type === 'children' && passengerCounts.children < 8) {
      passengerCounts.children++;
    } else if (type === 'infants' && passengerCounts.infants < passengerCounts.adults) {
      passengerCounts.infants++;
    }
  } else if (action === 'minus') {
    if (type === 'adults' && passengerCounts.adults > 1) {
      passengerCounts.adults--;
      // Infants cannot exceed adults
      if (passengerCounts.infants > passengerCounts.adults) {
        passengerCounts.infants = passengerCounts.adults;
      }
    } else if (type === 'children' && passengerCounts.children > 0) {
      passengerCounts.children--;
    } else if (type === 'infants' && passengerCounts.infants > 0) {
      passengerCounts.infants--;
    }
  }
  
  updatePassengerDisplay();
  updateCounterButtons();
}

function updatePassengerDisplay() {
  document.getElementById('adultsCount').textContent = passengerCounts.adults;
  document.getElementById('childrenCount').textContent = passengerCounts.children;
  document.getElementById('infantsCount').textContent = passengerCounts.infants;
  
  // Update input display
  const total = passengerCounts.adults + passengerCounts.children + passengerCounts.infants;
  let displayText = '';
  
  if (passengerCounts.adults > 0) {
    displayText += `${passengerCounts.adults} взрослый${passengerCounts.adults > 1 ? (passengerCounts.adults < 5 ? 'а' : 'ых') : ''}`;
  }
  if (passengerCounts.children > 0) {
    if (displayText) displayText += ', ';
    displayText += `${passengerCounts.children} ребенок${passengerCounts.children > 1 ? (passengerCounts.children < 5 ? 'а' : 'ов') : ''}`;
  }
  if (passengerCounts.infants > 0) {
    if (displayText) displayText += ', ';
    displayText += `${passengerCounts.infants} младенец${passengerCounts.infants > 1 ? (passengerCounts.infants < 5 ? 'а' : 'ев') : ''}`;
  }
  
  document.getElementById('passengers').value = displayText;
}

function updateCounterButtons() {
  // Adults buttons
  const adultsMinusBtn = document.querySelector('[data-type="adults"][data-action="minus"]');
  const adultsPlusBtn = document.querySelector('[data-type="adults"][data-action="plus"]');
  adultsMinusBtn.disabled = passengerCounts.adults <= 1;
  adultsPlusBtn.disabled = passengerCounts.adults >= 9;
  
  // Children buttons
  const childrenMinusBtn = document.querySelector('[data-type="children"][data-action="minus"]');
  const childrenPlusBtn = document.querySelector('[data-type="children"][data-action="plus"]');
  childrenMinusBtn.disabled = passengerCounts.children <= 0;
  childrenPlusBtn.disabled = passengerCounts.children >= 8;
  
  // Infants buttons
  const infantsMinusBtn = document.querySelector('[data-type="infants"][data-action="minus"]');
  const infantsPlusBtn = document.querySelector('[data-type="infants"][data-action="plus"]');
  infantsMinusBtn.disabled = passengerCounts.infants <= 0;
  infantsPlusBtn.disabled = passengerCounts.infants >= passengerCounts.adults;
}

function handleHeaderScroll() {
  const header = document.querySelector('.header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(255, 255, 255, 0.98)';
    header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
  } else {
    header.style.background = 'rgba(255, 255, 255, 0.95)';
    header.style.boxShadow = 'none';
  }
}

// Search functionality
async function searchFlights() {
  const departureCity = document.getElementById('cityFrom').value.trim();
  const arrivalCity = document.getElementById('destination').value.trim();
  const departureDate = document.getElementById('departureDate').value;
  const tripType = document.querySelector('input[name="tripType"]:checked').value;

  if (!departureCity || !arrivalCity || !departureDate) {
    showNotification('Пожалуйста, заполните все обязательные поля', 'error');
    return;
  }

  if (tripType === 'roundtrip') {
    const returnDate = document.getElementById('arrivalDate').value;
    if (!returnDate) {
      showNotification('Пожалуйста, выберите дату возвращения', 'error');
      return;
    }
  }

  try {
    showLoading(true);
    
    const searchParams = new URLSearchParams({
      departureCity,
      arrivalCity,
      departureDate
    });

    const response = await fetch(`/api/flights/search?${searchParams}`);
    
    if (!response.ok) {
      throw new Error('Ошибка сервера');
    }
    
    const flights = await response.json();
    displayFlights(flights);
    
    // Scroll to results
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('Ошибка поиска рейсов:', error);
    showNotification('Ошибка при поиске рейсов. Попробуйте еще раз.', 'error');
  } finally {
    showLoading(false);
  }
}

function displayFlights(flights) {
  const ticketList = document.getElementById('ticketList');
  
  if (flights.length === 0) {
    ticketList.innerHTML = `
      <div class="no-flights">
        <i class="fas fa-plane-slash" style="font-size: 3rem; color: #6b7280; margin-bottom: 1rem;"></i>
        <h3>Рейсы не найдены</h3>
        <p>Попробуйте изменить параметры поиска или выберите другие даты</p>
        <button class="search-btn" onclick="clearSearch()" style="margin-top: 1rem;">
          <i class="fas fa-redo"></i>
          Изменить поиск
        </button>
      </div>
    `;
    return;
  }

  const flightsHTML = flights.map((flight, index) => {
    const departureDate = new Date(flight.departureDate);
    const arrivalDate = new Date(flight.arrivalDate);
    const formattedDepDate = departureDate.toLocaleDateString('ru-RU');
    const formattedArrDate = arrivalDate.toLocaleDateString('ru-RU');
    
    // Calculate flight duration
    const duration = Math.round((arrivalDate - departureDate) / (1000 * 60 * 60));
    const hours = Math.floor(duration);
    const minutes = (duration % 1) * 60;
    
    return `
      <div class="flight-card fade-in" data-flight-id="${flight._id}" style="animation-delay: ${index * 0.1}s">
        <div class="flight-info">
          <div class="flight-route">
            <div class="departure">
              <h3>${flight.departureCity}</h3>
              <p class="time">${flight.departureTime}</p>
              <p class="date">${formattedDepDate}</p>
            </div>
            <div class="flight-arrow">
              <div class="flight-path">
                <span class="flight-icon">✈️</span>
                <div class="flight-line"></div>
              </div>
              <p class="flight-number">${flight.flightNumber}</p>
              <p class="flight-duration">${hours}ч ${minutes > 0 ? Math.round(minutes) + 'м' : ''}</p>
            </div>
            <div class="arrival">
              <h3>${flight.arrivalCity}</h3>
              <p class="time">${flight.arrivalTime}</p>
              <p class="date">${formattedArrDate}</p>
            </div>
          </div>
          
          <div class="flight-details">
            <div class="airline-info">
              <div class="airline-logo">
                <i class="fas fa-plane"></i>
              </div>
              <div>
                <p><strong>${flight.airline}</strong></p>
                <p class="aircraft">${flight.aircraft}</p>
              </div>
            </div>
            <div class="flight-specs">
              <span class="service-class ${flight.serviceClass.toLowerCase()}">${flight.serviceClass}</span>
              <p class="seats-left">
                <i class="fas fa-users"></i>
                ${flight.availableSeats} мест
              </p>
            </div>
          </div>
          
          <div class="flight-price">
            <div class="price-info">
              <p class="price">${flight.price.toLocaleString('ru-RU')} ₽</p>
              <p class="price-per-person">за человека</p>
            </div>
            <button class="book-btn" onclick="selectFlight('${flight._id}')" 
                    ${flight.availableSeats === 0 ? 'disabled' : ''}>
              <i class="fas fa-check"></i>
              ${flight.availableSeats === 0 ? 'Нет мест' : 'Выбрать'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  ticketList.innerHTML = `
    <div class="flights-results">
      <div class="results-header">
        <h2>Найденные рейсы</h2>
        <div class="results-count">
          <i class="fas fa-plane"></i>
          ${flights.length} ${flights.length === 1 ? 'рейс' : flights.length < 5 ? 'рейса' : 'рейсов'}
        </div>
      </div>
      <div class="sort-options">
        <button class="sort-btn active" onclick="sortFlights('price')">
          <i class="fas fa-sort-amount-down"></i>
          По цене
        </button>
        <button class="sort-btn" onclick="sortFlights('duration')">
          <i class="fas fa-clock"></i>
          По времени
        </button>
        <button class="sort-btn" onclick="sortFlights('departure')">
          <i class="fas fa-plane-departure"></i>
          По вылету
        </button>
      </div>
      <div class="flights-list">
        ${flightsHTML}
      </div>
    </div>
  `;
}

function selectFlight(flightId) {
  if (!currentUser) {
    showNotification('Для бронирования необходимо войти в систему', 'warning');
    setTimeout(() => {
      window.location.href = 'Autorization.html';
    }, 2000);
    return;
  }

  // Show selection animation
  const flightCard = document.querySelector(`[data-flight-id="${flightId}"]`);
  flightCard.style.transform = 'scale(0.98)';
  flightCard.style.background = '#e0f2fe';
  
  setTimeout(() => {
    // Сохраняем выбранный рейс и переходим к бронированию
    localStorage.setItem('selectedFlightId', flightId);
    localStorage.setItem('passengerCounts', JSON.stringify(passengerCounts));
    window.location.href = 'booking.html';
  }, 300);
}

function clearSearch() {
  document.getElementById('cityFrom').value = '';
  document.getElementById('destination').value = '';
  document.getElementById('departureDate').value = '';
  document.getElementById('arrivalDate').value = '';
  
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.style.display = 'none';
  
  // Scroll back to search form
  document.querySelector('.search-container').scrollIntoView({ behavior: 'smooth' });
}

function sortFlights(criteria) {
  // This function would re-sort the displayed flights
  // Implementation depends on storing flight data
  console.log('Sorting by:', criteria);
  
  // Update active sort button
  document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  showNotification(`Сортировка по ${criteria === 'price' ? 'цене' : criteria === 'duration' ? 'времени полета' : 'времени вылета'}`, 'info');
}

function showLoading(show) {
  const searchButton = document.getElementById('BtnSearchTicket');
  const searchIcon = searchButton.querySelector('i');
  
  if (show) {
    searchIcon.className = 'fas fa-spinner fa-spin';
    searchButton.querySelector('span') ? searchButton.querySelector('span').textContent = 'Поиск...' : 
      searchButton.childNodes[searchButton.childNodes.length - 1].textContent = ' Поиск...';
    searchButton.disabled = true;
    searchButton.classList.add('loading');
  } else {
    searchIcon.className = 'fas fa-search';
    searchButton.querySelector('span') ? searchButton.querySelector('span').textContent = 'Найти рейсы' : 
      searchButton.childNodes[searchButton.childNodes.length - 1].textContent = ' Найти рейсы';
    searchButton.disabled = false;
    searchButton.classList.remove('loading');
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add to body
  document.body.appendChild(notification);
  
  // Show animation
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 4000);
}

function redirectToProfile() {
  if (currentUser) {
    window.location.href = "profilePerson.html";
  } else {
    window.location.href = "Autorization.html";
  }
}

// Initialize passenger counter buttons on load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    updateCounterButtons();
  }, 100);
});
