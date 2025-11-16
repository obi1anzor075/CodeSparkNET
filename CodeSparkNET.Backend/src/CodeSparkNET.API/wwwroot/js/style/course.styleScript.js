(function () {
  // Parallax эффект для фона
  document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    document.body.style.backgroundPosition = `${moveX}px ${moveY}px`;
  });

  // Плавное появление элементов при прокрутке
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Наблюдаем за элементами уроков
  setTimeout(() => {
    document.querySelectorAll('#modules-list li').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'all 0.5s ease';
      observer.observe(el);
    });
  }, 500);

  // Добавляем ripple эффект на кнопки
  function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'ripple 0.6s ease-out';

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  const style = document.createElement('style');
  style.textContent = `
  @@keyframes ripple {
    from {
    transform: scale(0);
  opacity: 1;
        }
  to {
    transform: scale(2);
  opacity: 0;
        }
      }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', createRipple);
  });

  // Динамическое изменение цвета заголовка при прокрутке
  let hue = 0;
  setInterval(() => {
    hue = (hue + 1) % 360;
    const lessonTitle = document.getElementById('lesson-title');
    if (lessonTitle && lessonTitle.textContent !== 'Выберите урок слева') {
      lessonTitle.style.filter = `hue-rotate(${hue * 0.1}deg)`;
    }
  }, 25);
})();