/**
 * UI KIT - JavaScript Components & Utilities
 * GOV.BR Pattern Design + SMEDU Custom
 */

(function (global) {
  'use strict';

  const UIKit = {
    version: '1.0.0',
    initialized: false,

    /**
     * Initialize UI Kit components
     */
    init() {
      if (this.initialized) {
        console.warn('UIKit already initialized');
        return;
      }

      this.setupEventListeners();
      this.setupAccessibility();
      this.setupResponsiveness();
      
      this.initialized = true;
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
      // Close modals on ESC key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          this.closeAllModals();
        }
      });

      // Handle modal backdrop clicks
      document.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-overlay')) {
          this.closeAllModals();
        }
      });

      // Handle responsive menu on resize
      window.addEventListener('resize', () => {
        this.handleResponsiveMenu();
      });
    },

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
      // Add ARIA labels where missing
      const closeButtons = document.querySelectorAll('.close-button');
      closeButtons.forEach((btn) => {
        if (!btn.getAttribute('aria-label')) {
          btn.setAttribute('aria-label', 'Fechar');
        }
      });

      // Ensure all buttons have proper roles
      const buttons = document.querySelectorAll('[role="button"]');
      buttons.forEach((btn) => {
        if (!btn.getAttribute('tabindex')) {
          btn.setAttribute('tabindex', '0');
        }
      });
    },

    /**
     * Setup responsive behavior
     */
    setupResponsiveness() {
      this.handleResponsiveMenu();
      this.handleTableScroll();
    },

    /**
     * Handle responsive menu visibility
     */
    handleResponsiveMenu() {
      const sidebar = document.querySelector('.side-menu');
      const isMobile = window.innerWidth <= 768;

      if (sidebar) {
        if (isMobile) {
          sidebar.classList.remove('open');
        }
      }
    },

    /**
     * Handle table responsiveness
     */
    handleTableScroll() {
      const tables = document.querySelectorAll('table');
      tables.forEach((table) => {
        if (!table.parentElement.classList.contains('table-container')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'table-container';
          table.parentElement.insertBefore(wrapper, table);
          wrapper.appendChild(table);
        }
      });
    },

    /**
     * Toggle menu visibility
     */
    toggleMenu() {
      const sidebar = document.querySelector('.side-menu');
      if (sidebar) {
        sidebar.classList.toggle('open');
      }
    },

    /**
     * Close all modals
     */
    closeAllModals() {
      const selectors = '.modal-overlay.visible, .process-modal.visible, .modal.visible, .success-modal.visible';
      const modals = document.querySelectorAll(selectors);
      
      modals.forEach((modal) => {
        modal.classList.remove('visible');
        // Ensure hidden even if display was set inline
        setTimeout(() => {
          if (!modal.classList.contains('visible')) {
            modal.style.display = 'none';
            modal.style.opacity = '0';
          }
        }, 300);
      });

      // Also hide the shared overlay
      const overlay = document.getElementById('overlay');
      if (overlay) {
        overlay.classList.remove('visible');
        setTimeout(() => {
          if (!overlay.classList.contains('visible')) {
            overlay.style.display = 'none';
          }
        }, 300);
      }
    },

    /**
     * Open a modal
     * @param {string} modalId - ID of the modal element
     */
    openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('visible');
        // Set focus to first interactive element
        const firstFocusable = modal.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    },

    /**
     * Close a modal
     * @param {string} modalId - ID of the modal element
     */
    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('visible');
        // Final hide after transition
        setTimeout(() => {
          if (!modal.classList.contains('visible')) {
            modal.style.display = 'none';
            modal.style.opacity = '0';
          }
        }, 300);
      }
      
      // Auto-hide overlay if this was the last modal
      const selectors = '.modal-overlay.visible, .process-modal.visible, .modal.visible, .success-modal.visible';
      if (document.querySelectorAll(selectors).length === 0) {
        const overlay = document.getElementById('overlay');
        if (overlay) {
          overlay.classList.remove('visible');
          setTimeout(() => {
            if (!overlay.classList.contains('visible')) overlay.style.display = 'none';
          }, 300);
        }
      }
    },

    /**
     * Show success modal
     * @param {string} title - Modal title
     * @param {string} message - Modal message
     * @param {function} callback - Callback on button click
     */
    showSuccessModal(title, message, callback) {
      let successModal = document.querySelector('.success-modal');
      
      if (!successModal) {
        successModal = document.createElement('div');
        successModal.className = 'success-modal';
        successModal.innerHTML = `
          <div class="success-modal-content">
            <div class="success-modal-icon">
              <i class="fas fa-check"></i>
            </div>
            <h2 class="success-modal-title"></h2>
            <p class="success-modal-text"></p>
            <button class="success-modal-btn">Continuar</button>
          </div>
        `;
        document.body.appendChild(successModal);
      }

      successModal.querySelector('.success-modal-title').textContent = title;
      successModal.querySelector('.success-modal-text').textContent = message;
      successModal.classList.add('visible');

      const button = successModal.querySelector('.success-modal-btn');
      button.onclick = () => {
        successModal.classList.remove('visible');
        if (callback && typeof callback === 'function') {
          callback();
        }
      };
    },

    /**
     * Add form validation styles
     * @param {HTMLFormElement} form - Form element
     */
    validateForm(form) {
      let isValid = true;

      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach((input) => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          input.classList.add('is-invalid');
          isValid = false;
        } else {
          input.classList.remove('is-invalid');
        }
      });

      return isValid;
    },

    /**
     * Format currency value
     * @param {number} value - Value to format
     * @param {string} currency - Currency code (default: BRL)
     * @returns {string} Formatted currency
     */
    formatCurrency(value, currency = 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
      }).format(value);
    },

    /**
     * Format date
     * @param {Date} date - Date to format
     * @param {string} format - Format string (default: 'pt-BR')
     * @returns {string} Formatted date
     */
    formatDate(date, format = 'pt-BR') {
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      return new Intl.DateTimeFormat(format, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    },

    /**
     * Show loading spinner
     * @param {string} message - Loading message
     * @returns {HTMLElement} Spinner element
     */
    showLoading(message = 'Carregando...') {
      let loader = document.querySelector('.ui-loader');
      
      if (!loader) {
        loader = document.createElement('div');
        loader.className = 'ui-loader';
        loader.innerHTML = `
          <div class="loader-content">
            <i class="fas fa-spinner fa-spin"></i>
            <p>${message}</p>
          </div>
        `;
        document.body.appendChild(loader);
      }

      loader.classList.add('visible');
      return loader;
    },

    /**
     * Hide loading spinner
     */
    hideLoading() {
      const loader = document.querySelector('.ui-loader');
      if (loader) {
        loader.classList.remove('visible');
      }
    },

    /**
     * Create alert notification
     * @param {string} message - Alert message
     * @param {string} type - Alert type (success, error, warning, info)
     * @param {number} duration - Duration in ms (0 = persistent)
     */
    showAlert(message, type = 'info', duration = 3000) {
      const alertContainer = document.querySelector('.alerts-container') ||
        (() => {
          const container = document.createElement('div');
          container.className = 'alerts-container';
          document.body.appendChild(container);
          return container;
        })();

      const alert = document.createElement('div');
      alert.className = `alert alert-${type}`;
      alert.innerHTML = `
        <div class="alert-content">
          <i class="alert-icon fas fa-${this._getAlertIcon(type)}"></i>
          <span>${message}</span>
          <button class="alert-close" aria-label="Fechar alerta">&times;</button>
        </div>
      `;

      alertContainer.appendChild(alert);

      const closeBtn = alert.querySelector('.alert-close');
      closeBtn.onclick = () => alert.remove();

      if (duration > 0) {
        setTimeout(() => {
          if (alert.parentElement) {
            alert.remove();
          }
        }, duration);
      }

      return alert;
    },

    /**
     * Get icon for alert type
     * @private
     */
    _getAlertIcon(type) {
      const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle',
      };
      return icons[type] || icons.info;
    },

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
      return isDarkMode;
    },

    /**
     * Initialize dark mode from localStorage
     */
    initDarkMode() {
      const darkMode = localStorage.getItem('darkMode') === 'true';
      if (darkMode) {
        document.body.classList.add('dark-mode');
      }
    },

    /**
     * Debounce function execution
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {function} Debounced function
     */
    debounce(func, wait = 300) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Throttle function execution
     * @param {function} func - Function to throttle
     * @param {number} limit - Limit in ms
     * @returns {function} Throttled function
     */
    throttle(func, limit = 300) {
      let inThrottle;
      return function (...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => {
            inThrottle = false;
          }, limit);
        }
      };
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Failed to copy:', err);
        return false;
      }
    },
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      UIKit.init();
    });
  } else {
    UIKit.init();
  }

  // Export to global scope
  global.UIKit = UIKit;
  
  // Also expose common functions to window for backward compatibility
  global.toggleMenu = () => UIKit.toggleMenu();
  global.closeAllModals = () => UIKit.closeAllModals();
  global.openModal = (id) => UIKit.openModal(id);
  global.closeModal = (id) => UIKit.closeModal(id);
})(window);
