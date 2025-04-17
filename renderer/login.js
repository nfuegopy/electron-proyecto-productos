document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
  
    const result = await window.electron.login(email, password);
    if (result.success) {
      window.location.href = 'dashboard.html';
    } else {
      errorMessage.textContent = result.error;
      errorMessage.style.display = 'block';
    }
  });