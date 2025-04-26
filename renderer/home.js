document.getElementById('logoutButton').addEventListener('click', async () => {
  await window.electron.logout();
  window.location.href = 'index.html';
});