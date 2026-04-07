// UI Kit JS: toasts simples e utilidades leves
(function () {
  const ICONS = {
    success: 'fa-check-circle',
    warning: 'fa-exclamation-triangle',
    danger: 'fa-circle-xmark',
    info: 'fa-circle-info'
  };

  function ensureContainer() {
    let container = document.querySelector('.ui-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'ui-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function closeToast(el) {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px) scale(0.98)';
    setTimeout(() => el.remove(), 180);
  }

  function showToast({ title = 'Pronto', description = '', type = 'info', duration = 3500 } = {}) {
    const container = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `ui-toast ${type}`;

    toast.innerHTML = `
      <div class="ui-toast__icon"><i class="fa-solid ${ICONS[type] || ICONS.info}"></i></div>
      <div class="ui-toast__body">
        <div class="ui-toast__title">${title}</div>
        ${description ? `<div class="ui-toast__desc">${description}</div>` : ''}
      </div>
      <button class="ui-toast__close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
    `;

    toast.querySelector('.ui-toast__close').addEventListener('click', () => closeToast(toast));

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => closeToast(toast), duration);
    }

    return toast;
  }

  // Expor helper global
  window.uiToast = showToast;
})();
