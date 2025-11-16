(() => {
  const appsMap = {
    "js-app-shedule": {
      img: { src: "https://raw.githubusercontent.com/Inseliq/CodeSpark/8633b29b08a4bd886344157ee4ee0b5aca5705a4/blob-assets/icons/header-menu/canvas.site.app-shedule-temp.svg", alt: "Курсы" },
      windowBg: "url(https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/images/banner.png?raw=true)",
      headline: "Шаблоны",
      description: "Заготовки для сайтов. Шаблоны сайтов.",
      links: [
        { href: "/", title: "..." },
        { href: "/", title: "..." }
      ]
    },
    "js-app-course-work": {
      img: { src: "https://raw.githubusercontent.com/Inseliq/CodeSpark/34f7ef0985499b70c41040dab31a501380cf0ca9/blob-assets/icons/header-menu/canvas.site.app-course-work-temp.svg", alt: "Курсовые работы" },
      windowBg: "url(https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/images/banner.png?raw=true)",
      headline: "Курсовые работы",
      description: "Выполнение курсовых и дипломных работ.",
      links: [
        { href: "/", title: "Курсовые работы" },
        { href: "/", title: " Дипломные работы" }
      ]
    },
    "js-app-library": {
      img: { src: "https://raw.githubusercontent.com/Inseliq/CodeSpark/34f7ef0985499b70c41040dab31a501380cf0ca9/blob-assets/icons/header-menu/canvas.site.app-library-temp.svg", alt: "Библиотека" },
      windowBg: "url(https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/images/banner.png?raw=true)",
      headline: "Библиотека знаний",
      description: "Материалы и руководства по программированию.",
      links: [
        { href: "/Catalogs/Catalog/library", title: "Перейти в библиотеку" },
        { href: "/Catalog/ProductDetails/library/keras-tutorial", title: "Keras" },
        { href: "/Catalog/ProductDetails/library/mlnet-tutorial", title: "ML.NET" }
      ]
    },
    // "js-app-ai": {
    //   img: { src: "https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/icons/header-menu/iq.tag.png?raw=true", alt: "AI" },
    //   windowBg: "url(https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/images/banner.png?raw=true)",
    //   headline: "Искусственный интеллект",
    //   description: "Инструменты на базе ИИ.",
    //   links: [
    //     { href: "/ai/tools", title: "Инструменты" }
    //   ]
    // },
    "js-app-create-site": {
      img: { src: "https://raw.githubusercontent.com/Inseliq/CodeSpark/34f7ef0985499b70c41040dab31a501380cf0ca9/blob-assets/icons/header-menu/canvas.site.app-create-site-temp.svg", alt: "Создание сайтов" },
      windowBg: "url(https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/images/banner.png?raw=true)",
      headline: "Создание сайтов",
      description: "Разработка сайтов под ключ. Фронтенд. Бэкенд. Дизайн.",
      links: [
        { href: "/", title: "Каталог услуг" },
        { href: "/", title: "Сайт под ключ" },
        { href: "/", title: "Лендинг" },
        { href: "/", title: "Дизайн сайта" },
        { href: "/", title: "Вёрстка" }
      ]
    }
  };

  const servicesMap = {
    // "js-service-prime-store": {
    //   img: { src: "https://raw.githubusercontent.com/Inseliq/CodeSpark/07f260353cd0c4ed02804a8b29254a67a17b4f71/blob-assets/icons/header-menu/icon.prime-shop.svg", alt: "Премиум магазин" },
    //   windowBg: "url(https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/images/banner.png?raw=true)",
    //   headline: "Премиум магазин",
    //   description: "Эксклюзивные товары и наборы.",
    //   links: [
    //     { href: "/store/premium", title: "Открыть магазин" }
    //   ]
    // },
    // "js-service-prime": {
    //   img: { src: "https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/icons/header-menu/iq.tag.png?raw=true", alt: "Prime подписка" },
    //   windowBg: "url(https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/images/banner.png?raw=true)",
    //   headline: "Prime подписка",
    //   description: "Подписка с дополнительными преимуществами.",
    //   links: [
    //     { href: "/prime/subscription", title: "Оформить" }
    //   ]
    // },
    "js-service-pattern": {
      img: { src: "https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/icons/header-menu/iq.tag.png?raw=true", alt: "Шаблоны сайтов" },
      windowBg: "url(https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/images/banner.png?raw=true)",
      headline: "Заготовки сайтов",
      description: "Коллекция шаблонов для быстрого старта.",
      links: [
        { href: "/", title: "Просмотреть шаблоны" }
      ]
    },
    // "js-service-library-pack": {
    //   img: { src: "https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/icons/header-menu/iq.tag.png?raw=true", alt: "Библиотеки" },
    //   windowBg: "url(https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/images/banner.png?raw=true)",
    //   headline: "Библиотеки",
    //   description: "Пакеты и наборы библиотек.",
    //   links: [
    //     { href: "/libraries/packs", title: "Пакеты" }
    //   ]
    // },
    "js-service-documets": {
      img: { src: "https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/icons/header-menu/iq.tag.png?raw=true", alt: "Документация" },
      windowBg: "url(https://github.com/Inseliq/CodeSpark/blob/main/blob-assets/images/banner.png?raw=true)",
      headline: "Документация",
      description: "Полная документация CodeSpark™",
      links: [
        { href: "/", title: "Документация" },
        { href: "/", title: "О нас" },
        { href: "/", title: "Политика конфи..." },
        { href: "/", title: "Руководство пользователя" },
        { href: "/", title: "Лицензионное соглашение" }
      ]
    }
  };

  function getAppKeyFromButton(btn) {
    for (let i = 0; i < btn.attributes.length; i++) {
      const name = btn.attributes[i].name;
      if (name.startsWith('js-app-') || name.startsWith('js-service-')) return name;
    }
    return null;
  }

  function createWindowController({ toggleSelector, windowSelector, map }) {
    const toggleBtn = document.querySelector(toggleSelector);
    const windowEl = document.querySelector(windowSelector);
    if (!toggleBtn || !windowEl) return null;

    const topButtons = Array.from(windowEl.querySelectorAll('.top-block button'));
    const imgEl = windowEl.querySelector('img');
    const headlineEl = windowEl.querySelector('.headline');
    const descEl = windowEl.querySelector('.description');
    const linkContainer = windowEl.querySelector('.third-block') || windowEl.querySelector('[js-link-container-app]') || windowEl.querySelector('[js-link-container-service]');

    function renderByKey(key) {
      const data = map[key];
      if (!data) return;

      if (data.windowBg) windowEl.style.setProperty('--window-bg', data.windowBg);
      else windowEl.style.removeProperty('--window-bg');

      if (imgEl) { imgEl.src = data.img?.src || ""; imgEl.alt = data.img?.alt || ""; }
      if (headlineEl) headlineEl.textContent = data.headline || "";
      if (descEl) descEl.textContent = data.description || "";

      if (linkContainer) {
        linkContainer.innerHTML = "";
        if (Array.isArray(data.links)) {
          data.links.forEach(link => {
            const a = document.createElement("a");
            a.href = link.href;
            a.textContent = link.title;
            a.setAttribute("data-style", "link");
            a.setAttribute("hover", "");
            linkContainer.appendChild(a);
          });
        }
      }
    }

    function setActiveTopButton(btn) {
      topButtons.forEach(b => b.classList.toggle('active', b === btn));
    }

    function open() {
      windowEl.classList.remove('hidden');
      windowEl.classList.add('visible');
      toggleBtn.classList.add('active');
      const first = topButtons[0];
      if (first) {
        setActiveTopButton(first);
        const key = getAppKeyFromButton(first);
        renderByKey(key);
      }
    }

    function close() {
      windowEl.classList.add('hidden');
      windowEl.classList.remove('visible');
      toggleBtn.classList.remove('active');
      topButtons.forEach(b => b.classList.remove('active'));
    }

    function toggle() {
      if (windowEl.classList.contains('visible')) close();
      else open();
    }

    // ВАЖНО: **не** добавляем слушатель toggleBtn здесь,
    // чтобы избежать дублирования — внешний код добавляет логику переключения.

    topButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = getAppKeyFromButton(btn);
        if (!key) return;
        setActiveTopButton(btn);
        renderByKey(key);
      });
    });

    windowEl.addEventListener('click', (e) => e.stopPropagation());

    return {
      toggleBtn,
      windowEl,
      open,
      close,
      toggle,
      isOpen: () => windowEl.classList.contains('visible')
    };
  }

  // Создаём контроллеры
  const appController = createWindowController({
    toggleSelector: '[select-btn-app]',
    windowSelector: '[js-window-select-app]',
    map: appsMap
  });

  const serviceController = createWindowController({
    toggleSelector: '[select-btn-service]',
    windowSelector: '[js-window-select-service]',
    map: servicesMap
  });

  if (!appController || !serviceController) {
    console.warn('App или Service контроллер не инициализирован (проверь селекторы).');
    return;
  }

  function openWithSwitch(targetCtrl, otherCtrl) {
    if (otherCtrl.isOpen()) {
      otherCtrl.close();
      setTimeout(() => {
        targetCtrl.open();
      }, 400);
    } else {
      targetCtrl.toggle();
    }
  }

  appController.toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!appController.isOpen() && serviceController.isOpen()) {
      openWithSwitch(appController, serviceController);
    } else {
      appController.toggle();
    }
  });

  serviceController.toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!serviceController.isOpen() && appController.isOpen()) {
      openWithSwitch(serviceController, appController);
    } else {
      serviceController.toggle();
    }
  });

  // закрытие при клике вне обоих окон
  document.addEventListener('click', (e) => {
    const clickedInsideApp = appController.windowEl.contains(e.target) || appController.toggleBtn.contains(e.target);
    const clickedInsideService = serviceController.windowEl.contains(e.target) || serviceController.toggleBtn.contains(e.target);

    if (!clickedInsideApp && appController.isOpen()) appController.close();
    if (!clickedInsideService && serviceController.isOpen()) serviceController.close();
  });

  // Escape закрывает любое открытое окно
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (appController.isOpen()) appController.close();
      if (serviceController.isOpen()) serviceController.close();
    }
  });

})();