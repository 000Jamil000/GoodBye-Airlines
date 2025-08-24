// Переключение между формами входа и регистрации
function toggleAuthForm() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authTitle = document.getElementById('authTitle');
  const toggleText = document.getElementById('toggleText');
  const toggleLink = document.getElementById('toggleLink');

  if (loginForm.style.display === 'none') {
    // Показать форму входа
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authTitle.textContent = 'Вход в систему';
    toggleText.textContent = 'Еще нет аккаунта? ';
    toggleLink.textContent = 'Зарегистрироваться';
  } else {
    // Показать форму регистрации
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    authTitle.textContent = 'Регистрация';
    toggleText.textContent = 'Уже есть аккаунт? ';
    toggleLink.textContent = 'Войти';
  }
}

// Обработка входа в систему
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showMessage('Пожалуйста, заполните все поля', 'error');
    return;
  }

  try {
    showLoading('loginBtn', true);
    
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Сохраняем токен
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      showMessage('Успешный вход в систему!', 'success');
      
      // Перенаправляем через 1 секунду
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      showMessage(data.error || 'Ошибка входа в систему', 'error');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    showMessage('Ошибка соединения с сервером', 'error');
  } finally {
    showLoading('loginBtn', false);
  }
}

// Обработка регистрации
async function handleRegister(event) {
  event.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  
  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    showMessage('Пожалуйста, заполните все поля', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Пароли не совпадают', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('Пароль должен содержать минимум 6 символов', 'error');
    return;
  }

  try {
    showLoading('registerBtn', true);
    
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Сохраняем токен
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      showMessage('Регистрация прошла успешно!', 'success');
      
      // Перенаправляем через 1 секунду
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      showMessage(data.error || 'Ошибка регистрации', 'error');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    showMessage('Ошибка соединения с сервером', 'error');
  } finally {
    showLoading('registerBtn', false);
  }
}

// Отображение сообщений
function showMessage(message, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  // Скрываем сообщение через 5 секунд
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Показать/скрыть загрузку
function showLoading(buttonId, show) {
  const button = document.getElementById(buttonId);
  if (show) {
    button.textContent = 'Загрузка...';
    button.disabled = true;
  } else {
    button.textContent = buttonId === 'loginBtn' ? 'Войти' : 'Зарегистрироваться';
    button.disabled = false;
  }
}

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('authToken');
  if (token) {
    // Если пользователь уже авторизован, перенаправляем на главную
    window.location.href = '/';
  }
});