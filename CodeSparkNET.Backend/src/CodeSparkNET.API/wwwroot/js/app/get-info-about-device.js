(function () {
  'use strict';

  const html = document.documentElement;

  function setDevice() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const deviceWidth = window.screen.width;

    if (isTouch || deviceWidth <= 540) {
      html.setAttribute('data-device', 'mobile');
    } else {
      html.setAttribute('data-device', 'desktop');
    }
  }

  setDevice();

  window.addEventListener('orientationchange', setDevice);
})();