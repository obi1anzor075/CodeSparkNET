document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetForm');
  const successWindow = document.querySelector('[js-window-successful-restore-sc]');
  const errorWindow = document.querySelector('[js-window-successful-restore-er]');
  const closeBtn = errorWindow?.querySelector('[close-window-er]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!jQuery(form).valid())
      return;

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

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccessWindow();
      } else {
        showErrorWindow();
      }
    } catch {
      showErrorWindow();
    }
  });

  function showSuccessWindow() {
    if (!successWindow) return;
    successWindow.classList.remove('hidden');
    successWindow.classList.add('visible');
    document.body.style.overflow = "hidden"; // убираем скролл
  }

  function showErrorWindow() {
    if (!errorWindow) return;
    errorWindow.classList.remove('hidden');
    errorWindow.classList.add('visible');
    document.body.style.overflow = "hidden"; // убираем скролл
  }

  function closeErrorWindow() {
    if (!errorWindow) return;
    errorWindow.classList.remove('visible');
    errorWindow.classList.add('hidden');
    document.body.style.overflow = ""; // возвращаем скролл
  }

  // Закрытие окна по кнопке
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeErrorWindow();
    });
  }

  // Закрытие по клику на фон окна
  if (errorWindow) {
    errorWindow.addEventListener('click', (e) => {
      if (e.target === errorWindow) {
        closeErrorWindow();
      }
    });
  }
});