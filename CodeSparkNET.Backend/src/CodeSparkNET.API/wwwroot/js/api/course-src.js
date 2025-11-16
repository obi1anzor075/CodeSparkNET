(function () {
  const courseSlug = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop());

  const modulesListEl = document.getElementById('modules-list');
  const modulesListMobileEl = document.getElementById('modules-list-mobile');
  const courseTitleEl = document.getElementById('course-title');
  const offcanvasCourseTitleEl = document.getElementById('offcanvas-course-title');
  const courseShortEl = document.getElementById('course-shortdesc');
  const courseHeroEl = document.getElementById('course-hero');
  const lessonTitleEl = document.getElementById('lesson-title');
  const lessonBodyEl = document.getElementById('lesson-body');
  const sidebarEl = document.getElementById('sidebarOffcanvas');
  const menuBtn = document.getElementById('menuBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');

  let currentLessonSlug = null;

  // ========== UTILITY FUNCTIONS ==========
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[&<"'>]/g, m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])
    );
  }

  function escapeHtmlSimple(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function scrollToTopElement() {
    try {
      const scrollTo = document.getElementById('scrollTo');
      if (!scrollTo) return;
      scrollTo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      console.warn('scrollToTopElement failed', e);
    }
  }

  // ========== CODE HIGHLIGHTING ==========
  function highlight(code, lang) {
    if (!code) return '';

    if (lang === 'json') {
      return escapeHtmlSimple(code)
        .replace(/(\".*?\")/g, '<span class="token-string">$1</span>')
        .replace(/(:\s*)(-?\d+\.?\d*)/g, '$1<span class="token-number">$2</span>');
    }

    if (lang === 'html') {
      return escapeHtmlSimple(code)
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token-comment">$1</span>')
        .replace(/(&lt;\/?[a-zA-Z0-9-]+)/g, '<span class="token-keyword">$1</span>')
        .replace(/([a-zA-Z-:]+)=/g, '<span class="token-attr">$1</span>=');
    }

    if (lang === 'js' || lang === 'javascript') {
      const kw = ['function', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'new', 'class', 'extends', 'try', 'catch', 'throw', 'console', 'async', 'await', 'import', 'export', 'default'];
      let out = escapeHtmlSimple(code);
      out = out.replace(/(\".*?\"|'.*?'|`[\s\S]*?`)/g, '<span class="token-string">$1</span>');
      out = out.replace(/(\/\/.*?$)/gm, '<span class="token-comment">$1</span>');
      out = out.replace(new RegExp('\\b(' + kw.join('|') + ')\\b', 'g'), '<span class="token-keyword">$1</span>');
      out = out.replace(/(\d+\.?\d*)/g, '<span class="token-number">$1</span>');
      return out;
    }

    if (lang === 'css') {
      let out = escapeHtmlSimple(code);
      out = out.replace(/\/\*[\s\S]*?\*\//g, '<span class="token-comment">$&</span>');
      out = out.replace(/([a-z-]+)(\s*:\s*)/gi, '<span class="token-keyword">$1</span>$2');
      return out;
    }

    if (lang === 'c-sharp' || lang === 'csharp' || lang === 'cs') {
      let out = escapeHtmlSimple(code);
      out = out.replace(/(\/\/.*?$)/gm, '<span class="token-comment">$1</span>');
      out = out.replace(/(".*?")/g, '<span class="token-string">$1</span>');
      out = out.replace(/\b(int|string|bool|void|class|public|private|protected|using|namespace|return|new|var|async|await)\b/g, '<span class="token-keyword">$1</span>');
      return out;
    }

    if (lang === 'python') {
      let out = escapeHtmlSimple(code);
      out = out.replace(/(#.*?$)/gm, '<span class="token-comment">$1</span>');
      out = out.replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, '<span class="token-string">$1</span>');
      out = out.replace(/\b(def|class|return|import|from|as|if|elif|else|for|while|try|except|with|lambda|True|False|None)\b/g, '<span class="token-keyword">$1</span>');
      return out;
    }

    return escapeHtmlSimple(code);
  }

  // ========== CREATE CONSOLE ==========
  function createConsole(pre, kind) {
    const wrapper = document.createElement('div');
    wrapper.className = `console ${kind}`;

    const top = document.createElement('div');
    top.className = 'mac-top';
    top.innerHTML = '<span class="mac-dot"></span><span class="mac-dot"></span><span class="mac-dot"></span>';

    const content = document.createElement('pre');
    content.textContent = pre.textContent;

    wrapper.appendChild(top);
    wrapper.appendChild(content);

    pre.replaceWith(wrapper);
  }

  // ========== CREATE EDITOR ==========
  function createEditor(pre, lang) {
    const wrapper = document.createElement('div');
    wrapper.className = 'editor code';
    wrapper.setAttribute('data-lang', lang);

    const bar = document.createElement('div');
    bar.className = 'editor-bar';

    const left = document.createElement('div');
    left.className = 'left';
    const badge = document.createElement('div');
    badge.className = 'lang-badge';
    badge.innerHTML = `<span style="width:10px;height:10px;border-radius:3px;background:var(--accent);display:inline-block;margin-right:6px"></span><span class="lang-label">${lang}</span>`;
    left.appendChild(badge);

    const controls = document.createElement('div');
    controls.className = 'controls';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy';
    controls.appendChild(copyBtn);

    bar.appendChild(left);
    bar.appendChild(controls);

    const preEl = document.createElement('pre');
    const code = pre.textContent;
    preEl.innerHTML = highlight(code, lang);

    wrapper.appendChild(bar);
    wrapper.appendChild(preEl);

    // Copy behaviour
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        copyBtn.textContent = 'Copied';
        setTimeout(() => copyBtn.textContent = 'Copy', 1500);
      } catch (e) {
        console.warn('copy failed', e);
        copyBtn.textContent = 'Error';
        setTimeout(() => copyBtn.textContent = 'Copy', 1500);
      }
    });

    pre.replaceWith(wrapper);
  }

  // ========== PROCESS CODE BLOCKS ==========
  function processCodeBlocks() {
    document.querySelectorAll('pre[data-editor]').forEach(pre => {
      const mode = pre.getAttribute('data-editor');
      if (mode === 'output') {
        createConsole(pre, 'output');
      } else if (mode === 'console') {
        createConsole(pre, 'input');
      } else if (mode === 'code') {
        const ln = (pre.getAttribute('data-ln') || 'text').toLowerCase();
        createEditor(pre, ln);
      }
    });
  }

  // ========== MOBILE SIDEBAR ==========
  menuBtn.addEventListener('click', () => {
    if (sidebarEl.classList.contains('show')) {
      menuBtn.classList.remove('active');
      menuBtn.classList.add('unactive');
      sidebarEl.classList.remove('show');
      mobileOverlay.classList.remove('show');
      setTimeout(() => {
        menuBtn.classList.remove('unactive');
      }, 400);
    } else {
      menuBtn.classList.add('active');
      sidebarEl.classList.add('show');
      mobileOverlay.classList.add('show');
    }
  });

  closeSidebarBtn.addEventListener('click', () => {
    menuBtn.classList.remove('active');
    menuBtn.classList.add('unactive');
    sidebarEl.classList.remove('show');
    mobileOverlay.classList.remove('show');
    setTimeout(() => {
      menuBtn.classList.remove('unactive');
    }, 400);
  });

  mobileOverlay.addEventListener('click', () => {
    menuBtn.classList.remove('active');
    menuBtn.classList.add('unactive');
    sidebarEl.classList.remove('show');
    mobileOverlay.classList.remove('show');
    setTimeout(() => {
      menuBtn.classList.remove('unactive');
    }, 400);
  });

  // ========== LOAD COURSE ==========
  async function loadCourse() {
    try {
      const res = await fetch(`/Courses/GetCourseBySlug/${encodeURIComponent(courseSlug)}`);
      if (!res.ok) throw new Error('Course not found');
      const course = await res.json();
      renderCourse(course);
    } catch (err) {
      courseTitleEl.textContent = 'Курс не найден';
      courseShortEl.textContent = '';
      modulesListEl.innerHTML = '<div>Ошибка загрузки курса</div>';
      console.error(err);
    }
  }

  function renderCourse(course) {
    courseTitleEl.textContent = course.name;
    offcanvasCourseTitleEl.textContent = course.name;
    courseShortEl.textContent = course.shortDescription || '';

    if (course.images && course.images.length) {
      const hero = course.images.find(i => i.isMain) || course.images[0];
      if (hero && hero.url) {
        courseHeroEl.src = hero.url;
        courseHeroEl.style.display = 'block';
      }
    }

    modulesListEl.innerHTML = '';
    modulesListMobileEl.innerHTML = '';
    if (!course.modules || course.modules.length === 0) {
      modulesListEl.innerHTML = '<div>Нет модулей.</div>';
      modulesListMobileEl.innerHTML = modulesListEl.innerHTML;
      return;
    }

    course.modules.forEach((module) => {
      const moduleHeader = document.createElement('div');
      moduleHeader.innerHTML = `
          <div><strong>${escapeHtml(module.title)}</strong></div>
          <div>${escapeHtml(module.description || '')}</div>
          <div>${module.lessons.length} уроков</div>
        `;
      modulesListEl.appendChild(moduleHeader);

      const ul = document.createElement('ul');
      module.lessons.forEach(lesson => {
        const li = document.createElement('li');
        li.dataset.lessonSlug = lesson.slug;
        li.innerHTML = `<span>${escapeHtml(lesson.title)}</span> ${lesson.durationMinutes ? lesson.durationMinutes + ' мин' : ''}`;
        li.addEventListener('click', onLessonClick);
        ul.appendChild(li);
      });
      modulesListEl.appendChild(ul);

      const mobileGroup = document.createElement('div');
      mobileGroup.innerHTML = `<div>${escapeHtml(module.title)} (${module.lessons.length})</div>`;
      module.lessons.forEach(lesson => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.lessonSlug = lesson.slug;
        btn.textContent = `${lesson.title} ${lesson.durationMinutes ? ' — ' + lesson.durationMinutes + ' мин' : ''}`;
        btn.addEventListener('click', function () {
          menuBtn.classList.remove('active');
          menuBtn.classList.add('unactive');
          sidebarEl.classList.remove('show');
          mobileOverlay.classList.remove('show');
          setTimeout(() => {
            menuBtn.classList.remove('unactive');
          }, 400);
          onLessonClick({ currentTarget: this });
        });
        mobileGroup.appendChild(btn);
      });
      modulesListMobileEl.appendChild(mobileGroup);
    });

    const firstItem = document.querySelector('[data-lesson-slug]');
    if (firstItem) simulateClick(firstItem);
  }

  function simulateClick(el) {
    el.classList.add('active');
    onLessonClick({ currentTarget: el });
  }

  async function onLessonClick(e) {
    const el = e.currentTarget;
    const lessonSlug = el.dataset.lessonSlug;

    if (!lessonSlug) return;

    document.querySelectorAll('[data-lesson-slug]').forEach(x => x.classList.remove('active'));
    el.classList.add('active');
    currentLessonSlug = lessonSlug;

    scrollToTopElement();

    await loadLessonBySlug(lessonSlug);

    try {
      const url = new URL(location.href);
      url.searchParams.set('lesson', lessonSlug);
      history.replaceState(null, '', url);
    } catch { }
  }

  async function loadLessonBySlug(lessonSlug) {
    try {
      lessonTitleEl.textContent = 'Загрузка...';
      lessonBodyEl.innerHTML = '';

      const res = await fetch(`/Courses/GetLessonContent/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}`);
      if (!res.ok) throw new Error('Урок не найден');
      const lesson = await res.json();

      lessonTitleEl.textContent = lesson.title;
      lessonBodyEl.innerHTML = lesson.body || '<p>Нет содержимого.</p>';

      // ВАЖНО: обрабатываем code blocks ПОСЛЕ загрузки содержимого
      setTimeout(() => processCodeBlocks(), 100);

    } catch (err) {
      lessonTitleEl.textContent = 'Ошибка загрузки урока';
      lessonBodyEl.innerHTML = '<div>Не удалось загрузить содержимое.</div>';
      console.error(err);
    }
  }

  // ========== INITIAL LOAD ==========
  loadCourse();

  const urlParams = new URLSearchParams(location.search);
  const presetLesson = urlParams.get('lesson');
  if (presetLesson) {
    const tryOpen = () => {
      const el = document.querySelector(`[data-lesson-slug="${presetLesson}"]`);
      if (el) simulateClick(el);
      else setTimeout(tryOpen, 300);
    };
    setTimeout(tryOpen, 400);
  }
})();