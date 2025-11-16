(function () {
  'use strict';

  const html = document.documentElement;

  function initHoverEffects() {
    if (html.dataset.device === 'desktop') {
      document.addEventListener('mouseover', e => {
        const el = e.target.closest('[hover]');
        if (el) {
          el.classList.add('hover');
        }
      });

      document.addEventListener('mouseout', e => {
        const el = e.target.closest('[hover]');
        if (el) {
          el.classList.remove('hover');
        }
      });

      console.log('[assemble] Hover effects enabled for desktop');
    }
  }

  initHoverEffects();
})();