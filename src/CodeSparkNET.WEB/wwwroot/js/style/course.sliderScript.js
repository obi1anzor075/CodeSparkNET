// image-slider-simple-overlay.js
// Упрощённый ImageSlider: по клику на картинку открывается overlay с этой картинкой (без навигации)
// Версия: 2025-11-20

// ========== SLIDER INITIALIZATION ==========
function initSliders() {
  const sliders = document.querySelectorAll('[data-fn="slider"]:not([data-slider-init])');

  sliders.forEach(slider => {
    slider.setAttribute('data-slider-init', 'true');
    slider.__imageSliderInstance = new ImageSlider(slider);
  });
}

class ImageSlider {
  constructor(container) {
    this.container = container;
    this.images = Array.from(container.querySelectorAll('img'));
    this.currentIndex = 0;
    this.autoplayInterval = null;
    this.autoplayDelay = 5000;
    this.isHovered = false;
    this.isFullscreen = false; // we still use flag while overlay open
    this.imagesLoaded = 0;
    this.isAnimating = false;
    this.touchStartX = 0;
    this.touchEndX = 0;

    // overlay refs
    this._overlayEl = null;
    this._overlayImg = null;
    this._closeBtn = null;
    this.escHandler = null;

    this._resizeHandler = this._resizeHandler.bind(this);

    if (this.images.length === 0) return;
    this.init();
  }

  init() {
    this.showLoader();
    this.loadImages();
    this.setupStructure();
    this.setupEventListeners();
  }

  showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.setAttribute('hover', '');
    this.container.appendChild(loader);
    this.loader = loader;
  }

  loadImages() {
    this.images.forEach((img) => {
      // minimal inline styles for slider flow
      img.style.display = 'block';
      img.style.flex = '0 0 100%';
      img.style.position = 'relative';

      if (img.complete && img.naturalWidth) {
        this.handleImageLoad();
      } else {
        const onFinish = () => {
          img.removeEventListener('load', onFinish);
          img.removeEventListener('error', onFinish);
          this.handleImageLoad();
        };
        img.addEventListener('load', onFinish);
        img.addEventListener('error', onFinish);
      }
    });
  }

  centerCurrentSlide() {
    if (!this.isFullscreen) return;

    setTimeout(() => {
      const img = this.overlayImg;
      if (!img) return;

      const containerHeight = window.innerHeight;
      const imgHeight = img.offsetHeight;

      const scrollTo = img.offsetTop - (containerHeight / 2) + (imgHeight / 2);

      window.scrollTo({
        top: scrollTo,
        behavior: "smooth"
      });
    }, 50);
  }


  handleImageLoad() {
    this.imagesLoaded++;
    if (this.imagesLoaded === this.images.length) {
      this.onAllImagesLoaded();
    }
  }

  onAllImagesLoaded() {
    if (this.loader) {
      this.loader.remove();
      this.loader = null;
    }

    // Build slides-wrapper if not present
    if (!this.container.querySelector('.slides-wrapper')) {
      const slidesWrapper = document.createElement('div');
      slidesWrapper.className = 'slides-wrapper';
      slidesWrapper.setAttribute('hover', '');
      this.images.forEach(img => slidesWrapper.appendChild(img));
      this.container.insertBefore(slidesWrapper, this.container.firstChild);
      this.slidesWrapper = slidesWrapper;
    } else {
      this.slidesWrapper = this.container.querySelector('.slides-wrapper');
    }

    this.applyTranslate();
    this.setWrapperHeightFromImage(this.images[this.currentIndex]);

    window.addEventListener('resize', this._resizeHandler);

    this.playInitialAnimation();
    this.startAutoplay();
  }

  playInitialAnimation() {
    if (this.slidesWrapper) this.slidesWrapper.style.animation = 'slideInitial 0.8s ease-out';
  }

  setupStructure() {
    // counter
    const counter = document.createElement('div');
    counter.className = 'slide-counter';
    counter.setAttribute('hover', '');
    counter.innerHTML = `<span class="current">1</span> / <span class="total">${this.images.length}</span>`;
    this.container.appendChild(counter);
    this.counter = counter;

    // next
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-ctrl next';
    nextBtn.setAttribute('hover', '');
    nextBtn.innerHTML = '›';
    nextBtn.setAttribute('aria-label', 'Next slide');
    this.container.appendChild(nextBtn);
    this.nextBtn = nextBtn;

    // prev
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-ctrl pre';
    prevBtn.setAttribute('hover', '');
    prevBtn.innerHTML = '‹';
    prevBtn.setAttribute('aria-label', 'Previous slide');
    this.container.appendChild(prevBtn);
    this.prevBtn = prevBtn;

    // pagination
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.setAttribute('hover', '');

    this.images.forEach((_, index) => {
      const btn = document.createElement('button');
      btn.setAttribute('hover', '');
      btn.setAttribute('aria-label', `Go to slide ${index + 1}`);
      if (index === 0) btn.classList.add('active');
      pagination.appendChild(btn);
    });

    this.container.appendChild(pagination);
    this.pagination = pagination;
    this.paginationBtns = Array.from(pagination.querySelectorAll('button'));
  }

  setupEventListeners() {
    // next/prev handlers
    this.nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });
    this.prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });

    // pagination
    this.paginationBtns.forEach((btn, index) => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); this.goToSlide(index); });
    });

    // hover classes
    this.setupHoverEvents(this.container);
    this.setupHoverEvents(this.nextBtn);
    this.setupHoverEvents(this.prevBtn);
    this.setupHoverEvents(this.counter);
    this.paginationBtns.forEach(btn => this.setupHoverEvents(btn));

    // autoplay pause on hover
    this.container.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.stopAutoplay();
    });
    this.container.addEventListener('mouseleave', () => {
      this.isHovered = false;
      if (!this.isFullscreen) this.startAutoplay();
    });

    // swipe
    this.container.addEventListener('touchstart', (e) => { this.touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      const diff = this.touchStartX - this.touchEndX;
      if (Math.abs(diff) > 50) { if (diff > 0) this.next(); else this.prev(); }
    }, { passive: true });

    // IMPORTANT: open overlay per-image click (simplified behavior)
    this.images.forEach((img, idx) => {
      const handler = (e) => {
        e.stopPropagation();
        // ensure src exists (lazy)
        const ds = img.getAttribute && (img.getAttribute('data-src') || img.getAttribute('data-lazy') || img.getAttribute('dataLazy'));
        if ((!img.src || img.src.trim() === '') && ds) img.src = ds;
        this.openImageOverlay(idx);
      };
      img.addEventListener('click', handler);
      // store handler pointer if need to remove later
      img._overlayClickHandler = handler;
    });
  }

  setupHoverEvents(el) {
    el.addEventListener('mouseenter', () => el.classList.add('hover'));
    el.addEventListener('mouseleave', () => el.classList.remove('hover'));
  }

  next() {
    if (this.isAnimating) return;
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    this.goToIndex(nextIndex);
  }

  prev() {
    if (this.isAnimating) return;
    const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.goToIndex(prevIndex);
  }

  goToSlide(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    this.goToIndex(index);
  }

  goToIndex(nextIndex) {
    this.isAnimating = true;
    const to = -nextIndex * 100;
    this.slidesWrapper.style.transition = 'transform 0.5s ease-in-out';
    this.slidesWrapper.style.transform = `translateX(${to}%)`;

    const onTransEnd = () => {
      this.slidesWrapper.removeEventListener('transitionend', onTransEnd);
      this.isAnimating = false;
      this.currentIndex = nextIndex;
      this.updateUI();
    };
    this.slidesWrapper.addEventListener('transitionend', onTransEnd);
    setTimeout(() => {
      if (this.isAnimating) {
        this.slidesWrapper.removeEventListener('transitionend', onTransEnd);
        this.isAnimating = false;
        this.currentIndex = nextIndex;
        this.updateUI();
      }
    }, 800);
  }

  applyTranslate() {
    if (!this.slidesWrapper) return;
    const x = -this.currentIndex * 100;
    this.slidesWrapper.style.transform = `translateX(${x}%)`;
  }

  updateUI() {
    this.paginationBtns.forEach((btn, idx) => idx === this.currentIndex ? btn.classList.add('active') : btn.classList.remove('active'));
    const cur = this.counter && this.counter.querySelector('.current');
    if (cur) cur.textContent = this.currentIndex + 1;
    this.setWrapperHeightFromImage(this.images[this.currentIndex]);
    this.resetAutoplay();
  }

  startAutoplay() {
    if (this.autoplayInterval || this.isFullscreen) return;
    this.autoplayInterval = setInterval(() => {
      if (!this.isHovered && !this.isFullscreen) this.next();
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayInterval) { clearInterval(this.autoplayInterval); this.autoplayInterval = null; }
  }

  resetAutoplay() {
    this.stopAutoplay();
    if (!this.isHovered && !this.isFullscreen) this.startAutoplay();
  }

  setWrapperHeightFromImage(img) {
    if (!img || !this.slidesWrapper) return;
    const w = img.naturalWidth, h = img.naturalHeight;
    const cw = this.slidesWrapper.clientWidth || this.container.clientWidth;
    if (w && h && cw) {
      const height = Math.round(cw * h / w);
      this.slidesWrapper.style.height = height + 'px';
      this.slidesWrapper.style.transition = 'height 0.25s ease';
    } else {
      const rect = img.getBoundingClientRect();
      if (rect && rect.height) this.slidesWrapper.style.height = Math.round(rect.height) + 'px';
    }
  }

  _resizeHandler() {
    if (this.slidesWrapper && this.images[this.currentIndex]) {
      this.setWrapperHeightFromImage(this.images[this.currentIndex]);
    }
  }

  // ----------------- SIMPLE OVERLAY (single image, no nav) -----------------
  openImageOverlay(index) {
    if (this._overlayEl) return; // already open
    this.isFullscreen = true;
    this.stopAutoplay();

    const srcImg = this.images[index];
    const src = (srcImg && (srcImg.src || srcImg.getAttribute && srcImg.getAttribute('data-src'))) || '';

    // create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'slider-overlay simple';
    // inline minimal styling so user doesn't need to change CSS
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(0,0,0,0.75)';
    overlay.style.zIndex = '10000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .25s ease';

    // image element
    const bigImg = document.createElement('img');
    bigImg.src = src || '';
    bigImg.loading = 'eager';
    bigImg.alt = srcImg && (srcImg.alt || `slide ${index + 1}`) || `slide ${index + 1}`;
    // style the big image (centered, max size)
    bigImg.style.maxWidth = '92vw';
    bigImg.style.maxHeight = '88vh';
    bigImg.style.width = 'auto';
    bigImg.style.height = 'auto';
    bigImg.style.display = 'block';
    bigImg.style.transform = 'translateY(20px) scale(.98)';
    bigImg.style.opacity = '0';
    bigImg.style.transition = 'transform .28s cubic-bezier(.2,.9,.2,1), opacity .28s ease';

    // close button (minimal)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'slider-close simple';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'fixed';
    closeBtn.style.top = '18px';
    closeBtn.style.right = '18px';
    closeBtn.style.width = '46px';
    closeBtn.style.height = '46px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'rgba(255,255,255,0.08)';
    closeBtn.style.color = '#fff';
    closeBtn.style.fontSize = '28px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '10001';
    closeBtn.style.backdropFilter = 'blur(6px)';
    closeBtn.style.transition = 'background .15s ease';

    closeBtn.addEventListener('mouseenter', () => closeBtn.style.background = 'rgba(255,255,255,0.14)');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.background = 'rgba(255,255,255,0.08)');

    // append
    overlay.appendChild(bigImg);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    // store refs
    this._overlayEl = overlay;
    this._overlayImg = bigImg;
    this._closeBtn = closeBtn;

    // block scroll
    document.body.style.overflow = 'hidden';

    // fade in overlay & animate image in next frame
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      bigImg.style.transform = 'translateY(0) scale(1)';
      bigImg.style.opacity = '1';
    });

    // click handlers: close on overlay click outside image and on button
    const overlayClick = (e) => { if (e.target === overlay) this.closeImageOverlay(); };
    overlay.addEventListener('click', overlayClick);

    const onCloseClick = (e) => { e.stopPropagation(); this.closeImageOverlay(); };
    closeBtn.addEventListener('click', onCloseClick);

    // esc to close
    this.escHandler = (e) => { if (e.key === 'Escape') this.closeImageOverlay(); };
    document.addEventListener('keydown', this.escHandler);

    // cleanup callback references
    this._overlayCleanup = () => {
      overlay.removeEventListener('click', overlayClick);
      closeBtn.removeEventListener('click', onCloseClick);
      document.removeEventListener('keydown', this.escHandler);
    };
  }

  closeImageOverlay() {
    if (!this._overlayEl) return;

    // reverse animation
    const overlay = this._overlayEl;
    const bigImg = this._overlayImg;

    overlay.style.opacity = '0';
    if (bigImg) {
      bigImg.style.transform = 'translateY(20px) scale(.98)';
      bigImg.style.opacity = '0';
    }

    // after animation remove
    setTimeout(() => {
      try {
        if (this._overlayCleanup) this._overlayCleanup();
      } catch (e) { }
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      this._overlayEl = null;
      this._overlayImg = null;
      this._closeBtn = null;
      this._overlayCleanup = null;

      document.body.style.overflow = '';
      this.isFullscreen = false;
      if (!this.isHovered) this.startAutoplay();
    }, 260);
  }

  // destroy: remove listeners etc.
  destroy() {
    this.stopAutoplay();
    window.removeEventListener('resize', this._resizeHandler);
    if (this.escHandler) { document.removeEventListener('keydown', this.escHandler); this.escHandler = null; }
    // remove image click handlers if present
    if (this.images && Array.isArray(this.images)) {
      this.images.forEach(img => {
        if (img._overlayClickHandler) {
          img.removeEventListener('click', img._overlayClickHandler);
          delete img._overlayClickHandler;
        }
      });
    }
    if (this.overlay) { this.overlay.remove(); this.overlay = null; }
    if (this.container) {
      this.container.removeAttribute('data-slider-init');
      try { delete this.container.__imageSliderInstance; } catch (e) { }
    }
  }
}

// initialize when DOM ready
window.addEventListener('DOMContentLoaded', () => initSliders());
window.initSliders = initSliders;