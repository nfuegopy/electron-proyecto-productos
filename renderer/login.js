document.addEventListener('DOMContentLoaded', () => {
  // Cargar credenciales guardadas desde localStorage, si existen
  const savedEmail = localStorage.getItem('savedEmail');
  const savedPassword = localStorage.getItem('savedPassword');
  if (savedEmail && savedPassword) {
    document.getElementById('email').value = savedEmail;
    document.getElementById('password').value = savedPassword;
    document.getElementById('rememberMe').checked = true;
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  const errorMessage = document.getElementById('errorMessage');

  // Guardar credenciales en localStorage si el usuario marcó "Recordar usuario"
  if (rememberMe) {
    localStorage.setItem('savedEmail', email);
    localStorage.setItem('savedPassword', password);
  } else {
    // Limpiar credenciales guardadas si la casilla no está marcada
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');
  }

  try {
    const result = await window.electron.login(email, password);
    if (result.success) {
      window.location.href = 'dashboard.html';
    } else {
      errorMessage.textContent = result.error;
      errorMessage.style.display = 'block';
    }
  } catch (error) {
    errorMessage.textContent = 'Error inesperado: ' + error.message;
    errorMessage.style.display = 'block';
  }
});