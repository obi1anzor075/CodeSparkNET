document.addEventListener('DOMContentLoaded', () => {
  const hasLoginContainer = document.querySelector('.__container.login') !== null;

  const loginLink = document.querySelector('a[login-async]');
  const registerLink = document.querySelector('a[register-async]');

  if (!loginLink || !registerLink) return;

  if (hasLoginContainer) {
    loginLink.style.display = 'none';
    registerLink.style.display = 'flex';
  } else {
    loginLink.style.display = 'flex';
    registerLink.style.display = 'none';
  }
});