let currentUser = null;
let selectedFlight = null;
let selectedSeats = [];
let passengerCount = 1;

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadFlightData();
    updatePassengerForms();
    generateSeatMap();
});

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Необходимо войти в систему');
        window.location.href = '/HTML/Autorization.html';
        return;
    }

    fetch('/api/users/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Token expired');
        }
    })
    .then(user => {
        currentUser = user;
        document.getElementById('userGreeting').textContent = `Привет, ${user.firstName}!`;
    })
    .catch(error => {
        localStorage.removeItem('authToken');
        alert('Необходимо войти в систему');
        window.location.href = '/HTML/Autorization.html';
    });
}

async function loadFlightData() {
    const flightId = localStorage.getItem('selectedFlightId');
    if (!flightId) {
        alert('Рейс не выбран');
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch(`/api/flights/${flightId}`);
        if (!response.ok) {
            throw new Error('Рейс не найден');
        }

        selectedFlight = await response.json();
        displayFlightInfo();
        updateTotalPrice();
    } catch (error) {
        alert('Ошибка загрузки данных рейса');
        window.location.href = '/';
    }
}

function displayFlightInfo() {
    const flightDetails = document.getElementById('flightDetails');
    const departureDate = new Date(selectedFlight.departureDate);
    const formattedDate = departureDate.toLocaleDateString('ru-RU');

    flightDetails.innerHTML = `
        <div class="flight-card">
            <div class="flight-route">
                <div class="departure">
                    <h3>${selectedFlight.departureCity}</h3>
                    <p class="time">${selectedFlight.departureTime}</p>
                    <p class="date">${formattedDate}</p>
                </div>
                <div class="flight-arrow">
                    <span>✈️</span>
                    <p class="flight-number">${selectedFlight.flightNumber}</p>
                </div>
                <div class="arrival">
                    <h3>${selectedFlight.arrivalCity}</h3>
                    <p class="time">${selectedFlight.arrivalTime}</p>
                    <p class="date">${formattedDate}</p>
                </div>
            </div>
            <div class="flight-details">
                <p><strong>Авиакомпания:</strong> ${selectedFlight.airline}</p>
                <p><strong>Самолет:</strong> ${selectedFlight.aircraft}</p>
                <p><strong>Класс:</strong> ${selectedFlight.serviceClass}</p>
                <p><strong>Цена за билет:</strong> ${selectedFlight.price.toLocaleString('ru-RU')} ₽</p>
            </div>
        </div>
    `;
}

function updatePassengerForms() {
    passengerCount = parseInt(document.getElementById('passengerCount').value);
    const passengerForms = document.getElementById('passengerForms');
    
    let formsHTML = '';
    for (let i = 0; i < passengerCount; i++) {
        formsHTML += `
            <div class="passenger-form">
                <h3>Пассажир ${i + 1}</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="firstName_${i}">Имя *</label>
                        <input type="text" id="firstName_${i}" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName_${i}">Фамилия *</label>
                        <input type="text" id="lastName_${i}" required>
                    </div>
                    <div class="form-group">
                        <label for="passport_${i}">Номер паспорта *</label>
                        <input type="text" id="passport_${i}" required>
                    </div>
                    <div class="form-group">
                        <label for="birthDate_${i}">Дата рождения *</label>
                        <input type="date" id="birthDate_${i}" required>
                    </div>
                    <div class="form-group">
                        <label for="nationality_${i}">Гражданство *</label>
                        <select id="nationality_${i}" required>
                            <option value="">Выберите</option>
                            <option value="Россия">Россия</option>
                            <option value="Беларусь">Беларусь</option>
                            <option value="Казахстан">Казахстан</option>
                            <option value="Украина">Украина</option>
                            <option value="Другое">Другое</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
    
    passengerForms.innerHTML = formsHTML;
    
    // Сбрасываем выбранные места при изменении количества пассажиров
    selectedSeats = [];
    updateSelectedSeats();
    updateTotalPrice();
    generateSeatMap();
}

function generateSeatMap() {
    const seatMap = document.getElementById('seatMap');
    const rows = 25; // Количество рядов
    const seatsPerRow = 6; // Места в ряду (A, B, C, D, E, F)
    const seatLabels = ['A', 'B', 'C', '', 'D', 'E', 'F']; // Пустая строка для прохода
    
    let mapHTML = '<div class="seat-map-container">';
    
    // Заголовок с буквами мест
    mapHTML += '<div class="seat-row header-row">';
    mapHTML += '<div class="row-number">Ряд</div>';
    seatLabels.forEach(label => {
        if (label === '') {
            mapHTML += '<div class="aisle"></div>';
        } else {
            mapHTML += `<div class="seat-label">${label}</div>`;
        }
    });
    mapHTML += '</div>';
    
    for (let row = 1; row <= rows; row++) {
        mapHTML += `<div class="seat-row">`;
        mapHTML += `<div class="row-number">${row}</div>`;
        
        seatLabels.forEach(label => {
            if (label === '') {
                mapHTML += '<div class="aisle"></div>';
            } else {
                const seatNumber = `${row}${label}`;
                const isOccupied = Math.random() < 0.3; // 30% мест занято
                const seatClass = isOccupied ? 'seat occupied' : 'seat available';
                
                mapHTML += `<div class="${seatClass}" data-seat="${seatNumber}" onclick="toggleSeat('${seatNumber}')">${seatNumber}</div>`;
            }
        });
        
        mapHTML += '</div>';
    }
    
    mapHTML += '</div>';
    
    // Легенда
    mapHTML += `
        <div class="seat-legend">
            <div class="legend-item">
                <div class="seat available"></div>
                <span>Свободно</span>
            </div>
            <div class="legend-item">
                <div class="seat occupied"></div>
                <span>Занято</span>
            </div>
            <div class="legend-item">
                <div class="seat selected"></div>
                <span>Выбрано</span>
            </div>
        </div>
    `;
    
    seatMap.innerHTML = mapHTML;
}

function toggleSeat(seatNumber) {
    const seatElement = document.querySelector(`[data-seat="${seatNumber}"]`);
    
    if (seatElement.classList.contains('occupied')) {
        return; // Нельзя выбрать занятое место
    }
    
    if (selectedSeats.includes(seatNumber)) {
        // Убираем место из выбранных
        selectedSeats = selectedSeats.filter(seat => seat !== seatNumber);
        seatElement.classList.remove('selected');
        seatElement.classList.add('available');
    } else {
        // Проверяем, не превышает ли количество выбранных мест количество пассажиров
        if (selectedSeats.length >= passengerCount) {
            alert(`Вы можете выбрать максимум ${passengerCount} мест`);
            return;
        }
        
        // Добавляем место в выбранные
        selectedSeats.push(seatNumber);
        seatElement.classList.remove('available');
        seatElement.classList.add('selected');
    }
    
    updateSelectedSeats();
}

function updateSelectedSeats() {
    const selectedSeatsDiv = document.getElementById('selectedSeats');
    if (selectedSeats.length === 0) {
        selectedSeatsDiv.innerHTML = '<p>Места не выбраны</p>';
    } else {
        selectedSeatsDiv.innerHTML = selectedSeats.map(seat => 
            `<span class="selected-seat-badge">${seat}</span>`
        ).join('');
    }
}

function updateTotalPrice() {
    if (!selectedFlight) return;
    
    const ticketPrice = selectedFlight.price * passengerCount;
    const fees = Math.round(ticketPrice * 0.1); // 10% сборы и налоги
    const total = ticketPrice + fees;
    
    document.getElementById('ticketsPrice').textContent = ticketPrice.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('fees').textContent = fees.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('totalPrice').textContent = total.toLocaleString('ru-RU') + ' ₽';
}

function validatePassengerData() {
    const passengers = [];
    
    for (let i = 0; i < passengerCount; i++) {
        const firstName = document.getElementById(`firstName_${i}`).value.trim();
        const lastName = document.getElementById(`lastName_${i}`).value.trim();
        const passport = document.getElementById(`passport_${i}`).value.trim();
        const birthDate = document.getElementById(`birthDate_${i}`).value;
        const nationality = document.getElementById(`nationality_${i}`).value;
        
        if (!firstName || !lastName || !passport || !birthDate || !nationality) {
            showMessage(`Пожалуйста, заполните все поля для пассажира ${i + 1}`, 'error');
            return null;
        }
        
        passengers.push({
            firstName,
            lastName,
            passportNumber: passport,
            dateOfBirth: new Date(birthDate),
            nationality
        });
    }
    
    return passengers;
}

async function proceedToPayment() {
    // Валидация данных
    const passengers = validatePassengerData();
    if (!passengers) return;
    
    if (selectedSeats.length !== passengerCount) {
        showMessage(`Пожалуйста, выберите ${passengerCount} мест`, 'error');
        return;
    }
    
    // Создаем бронирование
    const bookingData = {
        userId: currentUser._id,
        flightId: selectedFlight._id,
        passengers,
        seatNumbers: selectedSeats
    };
    
    try {
        showLoading(true);
        
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Сохраняем ID бронирования и переходим к оплате
            localStorage.setItem('bookingId', result._id);
            localStorage.removeItem('selectedFlightId');
            window.location.href = '/HTML/payment.html';
        } else {
            showMessage(result.error || 'Ошибка создания бронирования', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка соединения с сервером', 'error');
    } finally {
        showLoading(false);
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function showLoading(show) {
    const bookBtn = document.getElementById('bookBtn');
    if (show) {
        bookBtn.textContent = 'Создание бронирования...';
        bookBtn.disabled = true;
    } else {
        bookBtn.textContent = 'Перейти к оплате';
        bookBtn.disabled = false;
    }
}

function goBack() {
    window.location.href = '/';
}

function redirectToProfile() {
    window.location.href = '/HTML/profilePerson.html';
}

// Обновляем цену при изменении количества пассажиров
document.getElementById('passengerCount').addEventListener('change', updateTotalPrice);