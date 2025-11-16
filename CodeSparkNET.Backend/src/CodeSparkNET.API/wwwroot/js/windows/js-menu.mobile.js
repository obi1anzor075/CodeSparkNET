document.addEventListener("DOMContentLoaded", () => {
  const mm_openBtn = document.querySelector("[open-menu-mobile]");
  const mm_menu = document.querySelector("[menu-mobile]");
  const mm_preMenu = document.querySelector("[premenu]");
  const mm_closeBtn = document.querySelector("[close-menu-btn]");

  if (mm_preMenu) {
    mm_preMenu.style.opacity = '0';
    mm_preMenu.style.visibility = 'hidden';
  }

  function mm_openMenu() {
    mm_menu.classList.add("visible");
    mm_openBtn.classList.add("active");
    mm_openBtn.classList.remove("unactive");

    if (mm_preMenu) {
      mm_preMenu.style.opacity = '0.45';
      mm_preMenu.style.visibility = 'visible';
    }
  }

  function mm_closeMenu() {
    mm_menu.classList.remove("visible");
    mm_openBtn.classList.remove("active");
    mm_openBtn.classList.add("unactive");
    setTimeout(() => mm_openBtn.classList.remove("unactive"), 400);

    if (mm_preMenu) {
      mm_preMenu.style.opacity = '0';
      mm_preMenu.style.visibility = 'hidden';
    }
  }

  function mm_toggleMenu() {
    if (mm_menu.classList.contains("visible")) {
      mm_closeMenu();
    } else {
      mm_openMenu();
    }
  }

  mm_openBtn.addEventListener("click", mm_toggleMenu);
  if (mm_preMenu) mm_preMenu.addEventListener("click", mm_closeMenu);
  if (mm_closeBtn) mm_closeBtn.addEventListener("click", mm_closeMenu);

  const mm_menuBtns = document.querySelectorAll(
    "[js-menu-catalog-btn], [js-menu-documents-btn], [js-menu-socials-btn]"
  );

  mm_menuBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mm_targetAttr = btn.getAttributeNames().find(attr => attr.startsWith("js-menu-") && attr.endsWith("-btn"));
      if (!mm_targetAttr) return;

      const mm_targetSelector = mm_targetAttr.replace("-btn", "");
      const mm_targetMenu = mm_menu.querySelector(`[${mm_targetSelector}]`);

      const mm_isActive = btn.classList.contains("active");

      mm_menuBtns.forEach(b => b.classList.remove("active"));
      mm_menu.querySelectorAll("[js-menu-catalog], [js-menu-documents], [js-menu-socials]")
        .forEach(m => {
          m.classList.add("hidden");
          m.classList.remove("visible");
        });

      if (!mm_isActive) {
        btn.classList.add("active");
        mm_targetMenu.classList.remove("hidden");
        mm_targetMenu.classList.add("visible");
      }
    });
  });
});