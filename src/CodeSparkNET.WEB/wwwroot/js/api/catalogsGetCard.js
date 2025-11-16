(function () {
  'use strict';

  const INITIAL_ITEMS = 4;
  const LOAD_MORE_ITEMS = 12;

  const groupVisibleItems = {};

  function getCatalogSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('catalogSlug');
  }

  async function loadCatalogData(catalogSlug) {
    try {
      const response = await fetch(`/Catalogs/Catalog/${catalogSlug}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки каталога');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка при загрузке каталога:', error);
      throw error;
    }
  }

  function groupProductsByGroup(products) {
    const grouped = {};

    products.forEach(product => {
      const groupName = product.group || 'Без группы';
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(product);
    });

    return grouped;
  }

  function createProductCard(product, catalogSlug) {
    const mainImage = product.productImages?.find(img => img.isMain);
    const imageUrl = mainImage?.url || product.productImages?.[0]?.url;

    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.productSlug = product.slug;

    const link = document.createElement('a');
    link.href = `/Catalogs/ProductDetails/${catalogSlug}/${product.slug}`;

    link.addEventListener('mouseenter', function () {
      this.classList.add('hover');
    });
    link.addEventListener('mouseleave', function () {
      this.classList.remove('hover');
    });

    const img = document.createElement('img');
    if (imageUrl) {
      img.src = imageUrl;
      img.alt = product.name || '';
    } else {
      img.src = '/assets/img/no-image.png';
      img.alt = 'no image';
      img.classList.add('no-image');
    }

    const overview = document.createElement('div');
    overview.className = 'overview-bg';

    const nameEl = document.createElement('h3');
    nameEl.className = 'name';
    nameEl.textContent = product.name || '';

    const descEl = document.createElement('p');
    descEl.textContent = product.shortDescription || '';

    overview.appendChild(nameEl);
    overview.appendChild(descEl);

    if (product.hasPrice) {
      const priceEl = document.createElement('h3');
      priceEl.className = 'cent';
      priceEl.textContent = `${product.price} ${product.currency || ''}`;
      overview.appendChild(priceEl);
    }

    link.appendChild(img);
    link.appendChild(overview);
    card.appendChild(link);

    return card;
  }

  function createLoadMoreButton(groupName, totalItems) {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'load-more-wrapper';

    const button = document.createElement('button');
    button.className = 'load-more-btn';
    button.setAttribute('hover', '');
    button.textContent = 'Показать ещё';
    button.dataset.group = groupName;

    button.addEventListener('click', function () {
      showMoreItems(groupName, totalItems);
    });

    buttonWrapper.appendChild(button);
    return buttonWrapper;
  }

  function showMoreItems(groupName, totalItems) {
    const currentVisible = groupVisibleItems[groupName] || INITIAL_ITEMS;
    const newVisible = Math.min(currentVisible + LOAD_MORE_ITEMS, totalItems);

    groupVisibleItems[groupName] = newVisible;

    const groupSection = document.querySelector(`[data-group-name="${groupName}"]`);
    if (!groupSection) return;

    const cards = groupSection.querySelectorAll('.card');
    cards.forEach((card, index) => {
      if (index < newVisible) {
        card.style.display = 'flex';
      }
    });

    if (newVisible >= totalItems) {
      const loadMoreBtn = groupSection.querySelector('.load-more-wrapper');
      if (loadMoreBtn) {
        loadMoreBtn.remove();
      }
    }
  }

  function renderProductGroup(groupName, products, catalogSlug) {
    const groupSection = document.createElement('div');
    groupSection.className = 'product-group';
    groupSection.dataset.groupName = groupName;

    const groupHeader = document.createElement('h2');
    groupHeader.className = 'group-header';
    groupHeader.textContent = groupName;

    const grid = document.createElement('div');
    grid.className = 'grid';

    groupVisibleItems[groupName] = INITIAL_ITEMS;

    products.forEach((product, index) => {
      const card = createProductCard(product, catalogSlug);

      if (index >= INITIAL_ITEMS) {
        card.style.display = 'none';
      }

      grid.appendChild(card);
    });

    groupSection.appendChild(groupHeader);
    groupSection.appendChild(grid);

    if (products.length > INITIAL_ITEMS) {
      const loadMoreBtn = createLoadMoreButton(groupName, products.length);
      groupSection.appendChild(loadMoreBtn);
    }

    return groupSection;
  }

  function renderCatalog(catalogData) {
    const container = document.getElementById('CatalogSectionOn');
    if (!container) return;

    const nameEl = container.querySelector('.name-catalog h1');
    if (nameEl) {
      nameEl.textContent = catalogData.name || 'Каталог';
      nameEl.classList.remove('catalog-loading');
    }

    const contentEl = container.querySelector('.catalog-content');
    if (!contentEl) return;

    contentEl.innerHTML = '';

    if (!catalogData.products || catalogData.products.length === 0) {
      showError('Неправильный URL курса', 'Товары курса не найдены.');
      return;
    }

    const groupedProducts = groupProductsByGroup(catalogData.products);

    Object.keys(groupedProducts).sort().forEach(groupName => {
      const groupSection = renderProductGroup(
        groupName,
        groupedProducts[groupName],
        catalogData.slug
      );
      contentEl.appendChild(groupSection);
    });

    const spinner = document.getElementById('LoaderSpinner');
    if (spinner) {
      spinner.style.display = 'none';
    }
  }

  function showError(layout, message) {
    const container = document.getElementById('CatalogSectionOn');

    const spinner = document.getElementById('LoaderSpinner');
    if (spinner) {
      spinner.style.display = 'none';
    }

    if (!container) return;

    const nameEl = container.querySelector('.name-catalog h1');
    if (nameEl) {
      nameEl.textContent = layout;
    }

    const contentEl = container.querySelector('.catalog-content');
    if (contentEl) {
      contentEl.innerHTML = `<p class="error-message">${message}</p>`;
    }

    createElement
  }

  async function init() {
    try {
      const catalogSlug = getCatalogSlugFromUrl();
      if (!catalogSlug) {
        throw new Error('Не удалось определить slug каталога');
      }

      const catalogData = await loadCatalogData(catalogSlug);
      renderCatalog(catalogData);
    } catch (error) {
      console.error('Ошибка инициализации каталога:', error);
      showError('Ошибка загрузки', 'Не удалось загрузить каталог. Попробуйте обновить страницу.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();