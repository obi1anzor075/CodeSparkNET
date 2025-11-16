document.addEventListener('DOMContentLoaded', () => {
  const editBtn = document.querySelector('[data-function="edit-username"]');

  // ===== Локальное хранение блокировки кнопки =====
  function checkCooldown() {
    const cooldownUntil = localStorage.getItem('usernameCooldownUntil');
    if (!cooldownUntil) return;

    const now = Date.now();
    if (now < cooldownUntil) {
      const diffMs = cooldownUntil - now;
      const diffMinutes = Math.floor(diffMs / 1000 / 60);
      let text;

      if (diffMinutes < 1) {
        text = `Вы уже изменили имя, следующее изменение доступно через ${Math.floor(diffMs / 1000)} секунд`;
      } else if (diffMinutes < 60 * 24) {
        text = `Вы уже изменили имя, следующее изменение доступно через ${diffMinutes} минут`;
      } else {
        text = `Вы уже изменили имя, следующее изменение доступно через ${Math.floor(diffMinutes / 60 / 24)} дней`;
      }

      editBtn.disabled = true;
      editBtn.title = text;
    } else {
      localStorage.removeItem('usernameCooldownUntil');
      editBtn.disabled = false;
      editBtn.removeAttribute('title');
    }
  }

  checkCooldown();

  // ====== Делегирование кликов ======
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-function]');
    if (!btn) return;

    const fn = btn.dataset.function;
    if (fn === 'edit-username') {
      initUsernameModal(); // инициализация модалки при первом открытии
    }
  });

  // ====== Инициализация модалки ======
  function initUsernameModal() {
    const modal = document.querySelector('.js-window[js-window-update-profile-name]');
    if (!modal) return; // если окна нет — не ломаем скрипт

    const description = modal.querySelector('.description');
    const updateProfileForm = modal.querySelector('#UpdateProfileUserName');
    const step3 = modal.querySelector('.main-content.step3');

    function openModal() {
      document.body.style.paddingRight = "calc(clamp(0.375rem, 0.2079rem + 0.495vw, 1rem) + 4.5px)";
      document.body.style.overflow = "hidden";
      modal.classList.remove('hidden');
      modal.classList.add('visible');
      description.setAttribute('step', '1');
    }

    function closeModal() {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
      modal.classList.remove('visible');
      modal.classList.add('hidden');
    }

    function goToStep(step) {
      description.setAttribute('step', step);
    }

    // ===== Обработчики кнопок внутри модалки =====
    modal.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-function]');
      if (!btn) return;

      const fn = btn.dataset.function;
      switch (fn) {
        case 'next-step-JS-UPName':
          goToStep('2');
          break;

        case 'close-js-window-update-profile-name':
          closeModal();
          break;

        case 'js-window-update-profile-name-final':
          goToStep('final');
          setTimeout(() => {
            closeModal();
            setTimeout(() => {
              window.location.reload();
            }, 300); // перезагрузка через 300ms после закрытия
          }, 400); // сначала закрытие через 400ms
          break;

        case 'js-window-update-profile-name-return':
          goToStep('2');
          break;
      }
    });

    // ===== Сабмит формы =====
    updateProfileForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!jQuery(updateProfileForm).valid())
        return;

      const formData = new FormData(updateProfileForm);
      const tokenInput = updateProfileForm.querySelector('input[name="__RequestVerificationToken"]');
      const antiForgeryToken = tokenInput ? tokenInput.value : null;

      const headers = {};
      if (antiForgeryToken) headers['RequestVerificationToken'] = antiForgeryToken;

      try {
        const response = await fetch(updateProfileForm.action || window.location.pathname, {
          method: 'POST',
            headers: {
                ...headers,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            },
            body: formData
        });

        const result = await response.json();
        step3.innerHTML = ""; // очистка
        goToStep('3');

        if (result.success) {
          step3.setAttribute('success', 'true');
          step3.innerHTML = `
  <h3 class="headline">${result.message}</h3>
  <span class="desc">${result.desc}</span>
  <div class="button-block">
    <button hover data-style="hyper-button" data-function="js-window-update-profile-name-final"><span>Выход</span></button>
  </div>
  `;

          // Устанавливаем блокировку кнопки (7 дней)
          const cooldownMs = 7 * 24 * 60 * 60 * 1000;
          localStorage.setItem('usernameCooldownUntil', Date.now() + cooldownMs);
          checkCooldown();

        } else {
          step3.setAttribute('success', 'false');
          step3.innerHTML = `
  <h3 class="headline">${result.message}</h3>
  <span class="desc">${result.desc}</span>
  <div class="button-block">
    <button hover data-style="hyper-button" data-function="js-window-update-profile-name-return"><span>Повторить</span></button>
    <button class="backlink" hover data-style="link" type="button" data-function="close-js-window-update-profile-name">Отмена</button>
  </div>
  `;
        }
      } catch (error) {
        console.error('Произошла ошибка:', error);
        step3.setAttribute('success', 'false');
        step3.innerHTML = `
  <h3 class="headline">Ошибка</h3>
  <span class="desc">Произошла ошибка при обработке запроса. Попробуйте позже.</span>
  <div class="button-block">
    <button class="backlink" hover data-style="link" type="button" data-function="close-js-window-update-profile-name">Закрыть</button>
  </div>
  `;
      }
    });

    // открыть окно сразу
    openModal();
  }
});