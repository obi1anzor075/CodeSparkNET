document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotForm');
  const summaryEl = document.querySelector('.error_message_form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!jQuery(form).valid())
      return;

    showForgotPasswordResultModal();

    const formData = new FormData(form);
    const tokenInput = form.querySelector('input[name="__RequestVerificationToken"]');
    const antiForgeryToken = tokenInput ? tokenInput.value : null;

    const headers = {};
    if (antiForgeryToken) headers['RequestVerificationToken'] = antiForgeryToken;

    try {
      const response = await fetch(form.action || window.location.pathname, {
        method: 'POST',
        credentials: 'same-origin',
        headers: headers,
        body: formData
      });
    } catch (err) {
      console.error(err);
      summaryEl.textContent = 'Ошибка сети. Попробуйте ещё раз.';
    }
  });

  function showForgotPasswordResultModal() {
    const modalWindow = document.querySelector('[js-window-restore-password]');

    if (!modalWindow) {
      return;
    }
    modalWindow.classList.replace('hidden', 'visible');
  }
});