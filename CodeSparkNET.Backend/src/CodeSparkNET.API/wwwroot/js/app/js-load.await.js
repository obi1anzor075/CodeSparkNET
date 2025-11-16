(function () {
  'use strict';

  // --- Конфиг ---
  const cfg = {
    getInfo: '/js/app/get-info-about-device.js',
    assembleJs: '/js/app/assemble.js',
    assembleCss: '/css/Root/assemble.css',
    markupCss: '/css/Markup/layout-markup.css',
    tolerateFailures: true
  };

  // --- утилиты ---
  function log(...a) { console.log('[app-loader]', ...a); }
  function warn(...a) { console.warn('[app-loader]', ...a); }
  function fail(...a) { console.error('[app-loader]', ...a); }

  function loadScript(url, { async = true } = {}) {
    return new Promise((resolve, reject) => {
      if (!url) return reject(new Error('empty script url'));
      const s = document.createElement('script');
      s.src = url;
      if (!async) s.async = false;
      s.onload = () => resolve(url);
      s.onerror = () => reject(new Error('Failed to load script: ' + url));
      document.head.appendChild(s);
    });
  }

  function loadCss(url) {
    return new Promise((resolve, reject) => {
      if (!url) return reject(new Error('empty css url'));
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = url;
      l.onload = () => resolve(url);
      l.onerror = () => reject(new Error('Failed to load css: ' + url));
      document.head.appendChild(l);
    });
  }

  function createBigLoader() {
    const loadPage = document.createElement('div');
    loadPage.setAttribute('js-load-page', '');

    const loader = document.createElement('div');
    loader.setAttribute('js-loader', '');

    loadPage.appendChild(loader);
    document.body.style.overflow = 'hidden';

    return loadPage;
  }

  // --- извлечение ресурсов, указанных в Razor секциях ---
  function extractResources() {
    const res = { styles: [], scriptsMain: [], scriptsAdditions: [] };

    const stylesContainer = document.getElementById('page-styles-container');
    if (stylesContainer) {
      const links = Array.from(stylesContainer.querySelectorAll('link[href]'));
      links.forEach(l => {
        const href = l.getAttribute('href') || l.getAttribute('data-href');
        if (href) res.styles.push(href);
        try { l.remove(); } catch (e) { }
      });
      const styleBlocks = Array.from(stylesContainer.querySelectorAll('style'));
      styleBlocks.forEach(s => {
        res.styles.push({ inline: true, content: s.textContent });
        try { s.remove(); } catch (e) { }
      });
    }

    // Функция для обработки скрипта
    function processScript(s, priority) {
      const dataSrc = s.getAttribute('data-src');
      const src = s.getAttribute('src');
      const type = (s.getAttribute('type') || '').toLowerCase();

      let scriptData = null;
      if (dataSrc) {
        scriptData = dataSrc;
      } else if (src && type !== 'module' && type !== 'text/javascript' && type !== '') {
        scriptData = { inline: true, content: s.textContent };
      } else if (src && !dataSrc) {
        scriptData = src;
      } else if (s.textContent.trim()) {
        scriptData = { inline: true, content: s.textContent };
      }

      if (scriptData) {
        if (priority === 'addition' || priority === 'async') {
          res.scriptsAdditions.push(scriptData);
        } else {
          // По умолчанию main или если указано 'main'
          res.scriptsMain.push(scriptData);
        }
      }

      try { s.remove(); } catch (e) { }
    }

    // Основные скрипты из контейнера
    const scriptsMainContainer = document.getElementById('page-scriptsMain-container');
    if (scriptsMainContainer) {
      const scripts = Array.from(scriptsMainContainer.querySelectorAll('script'));
      scripts.forEach(s => {
        const priority = s.getAttribute('data-load-priority');
        processScript(s, priority);
      });
    }

    // Дополнительные скрипты из контейнера
    const scriptsAdditionsContainer = document.getElementById('page-scriptsAdditions-container');
    if (scriptsAdditionsContainer) {
      const scripts = Array.from(scriptsAdditionsContainer.querySelectorAll('script'));
      scripts.forEach(s => {
        const priority = s.getAttribute('data-load-priority');
        // Для этого контейнера по умолчанию additions, но можно переопределить
        processScript(s, priority || 'addition');
      });
    }

    // Обрабатываем скрипты из body с атрибутом data-load-priority
    const priorityScripts = Array.from(document.querySelectorAll('script[data-load-priority]'));
    priorityScripts.forEach(s => {
      // Проверяем, что скрипт не был уже обработан из контейнеров
      if (s.parentElement && !s.parentElement.id?.includes('page-scripts')) {
        const priority = s.getAttribute('data-load-priority');
        processScript(s, priority);
      }
    });

    return res;
  }

  // execute inline script
  function execInline(js) {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.text = js;
    document.body.appendChild(s);
    return s;
  }

  // --- основная последовательность ---
  async function run() {
    const start = Date.now();
    const MIN_SHOW = 250;
    const SHOW_ERROR_AFTER = 7500;
    let errorShown = false;

    const bigLoader = createBigLoader();
    document.body.appendChild(bigLoader);

    function showBadLoadMessage(text) {
      if (errorShown) return;
      errorShown = true;

      const section = document.createElement('section');
      section.setAttribute('js-bad-load-visible', '');

      const badLoad = document.createElement('div');
      badLoad.setAttribute('js-bad-load', '');

      const article = document.createElement('article');
      article.textContent = text;

      section.appendChild(badLoad);
      section.appendChild(article);

      const loader = bigLoader.querySelector('[js-loader]');
      bigLoader.insertBefore(section, loader);
      if (loader) loader.style.top = '70%';
    }

    function hideLoader() {
      const elapsed = Date.now() - start;
      const wait = elapsed < MIN_SHOW ? MIN_SHOW - elapsed : 0;
      setTimeout(() => {
        bigLoader.style.opacity = '0';
        document.body.style.overflow = '';
        setTimeout(() => { if (bigLoader.parentNode) bigLoader.remove(); }, 600);
      }, wait);
    }

    const errorTimeout = setTimeout(() => {
      if (document.readyState !== 'complete') {
        const msg = navigator.onLine
          ? 'Плохое интернет соединение'
          : 'Плохое интернет соединение';
        showBadLoadMessage(msg);
      }
    }, SHOW_ERROR_AFTER);

    const resources = extractResources();
    log('extracted resources', resources);

    try {
      // 1) get-info
      try {
        await loadScript(cfg.getInfo, { async: false });
        log('get-info loaded');
      } catch (e) {
        warn('get-info failed', e);
        if (!cfg.tolerateFailures) throw e;
      }

      // 2) assemble.js
      try {
        await loadScript(cfg.assembleJs, { async: false });
        log('assemble loaded');
      } catch (e) {
        warn('assemble.js failed', e);
        if (!cfg.tolerateFailures) throw e;
      }

      // 3) load ONLY MAIN page scripts (synchronously, in order)
      for (const sc of resources.scriptsMain) {
        if (typeof sc === 'string') {
          try {
            const path = sc.replace(/^~\//, '/');
            await loadScript(path, { async: false });
            log('loaded main page script', path);
          } catch (e) {
            warn('main page src script failed:', sc, e);
          }
        } else if (sc.inline) {
          execInline(sc.content);
          log('executed inline main script');
        }
      }

      // 4) load assemble.css -> markup -> page css (in this order)
      try {
        await loadCss(cfg.assembleCss);
        log('assemble css loaded');
      } catch (e) {
        warn('assemble css not loaded', e);
      }

      try {
        await loadCss(cfg.markupCss);
        log('markup/layout css loaded');
      } catch (e) {
        warn('markup css not loaded', e);
      }

      // load per-page css (from resources.styles)
      for (const st of resources.styles) {
        if (typeof st === 'string') {
          try {
            const href = st.replace(/^~\//, '/');
            await loadCss(href);
            log('page style loaded:', href);
          } catch (e) {
            warn('page style failed:', st, e);
          }
        } else if (st.inline) {
          const el = document.createElement('style');
          el.textContent = st.content;
          document.head.appendChild(el);
          log('inline style inserted');
        }
      }

      // 5) main resources done — hide loader and reveal app
      clearTimeout(errorTimeout);
      const app = document.getElementById('app-root');
      if (app) {
        document.body.classList.remove('not-ready');
        app.classList.add('ready');
        hideLoader();
      }

      // 6) progressively: ADDITIONS scripts (do not block UX)
      (async function progressive() {
        try {
          // Загружаем additions scripts асинхронно
          const additionsPromises = resources.scriptsAdditions.map(async (sc) => {
            if (typeof sc === 'string') {
              try {
                const path = sc.replace(/^~\//, '/');
                await loadScript(path, { async: true });
                log('loaded additions script', path);
              } catch (e) {
                warn('additions script failed:', sc, e);
              }
            } else if (sc.inline) {
              execInline(sc.content);
              log('executed inline additions script');
            }
          });

          // Дожидаемся завершения всех additions scripts
          await Promise.all(additionsPromises);
          log('all additions scripts loaded');

        } catch (e) {
          warn('progressive load error', e);
        }
      })();

    } catch (e) {
      fail('Loader fatal error', e);
      clearTimeout(errorTimeout);
      const app = document.getElementById('app-root');
      if (app) {
        app.classList.add('ready');
        document.body.classList.remove('not-ready');
        hideLoader();
      }
    }
  }

  // start loader when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // expose simple API to load a module on demand
  window.appLoader = window.appLoader || {};
  window.appLoader.loadModule = async function (src) {
    if (!src) return Promise.reject(new Error('empty src'));
    const path = src.replace(/^~\//, '/');
    return loadScript(path);
  };

})();