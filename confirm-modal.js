/**
 * Accessible Confirmation Modal
 * Replaces native confirm() dialogs with accessible custom modals
 */

(function (global) {
  'use strict';

  const ConfirmModal = {
    modalId: 'confirm-modal',
    resolveCallback: null,

    /**
     * Initialize confirmation modal component
     */
    init() {
      if (document.getElementById(this.modalId)) {
        return; // Already initialized
      }

      const modal = document.createElement('div');
       modal.id = this.modalId;
       modal.className = 'modal-overlay';
       modal.setAttribute('role', 'alertdialog');
       modal.setAttribute('aria-modal', 'true');
       modal.setAttribute('aria-labelledby', 'confirm-modal-title');
       modal.style.display = 'none'; // Garante que comece escondido

      modal.innerHTML = `
        <div class="modal-content confirm-modal-content">
          <div class="modal-header">
            <h2 id="confirm-modal-title" class="modal-title">Confirmação</h2>
            <button 
              class="close-button" 
              aria-label="Fechar"
              onclick="window.ConfirmModal.cancel()"
            >
              &times;
            </button>
          </div>
          <div class="modal-body">
            <p id="confirm-modal-message"></p>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-secondary btn-cancel-confirm"
              onclick="window.ConfirmModal.cancel()"
            >
              Cancelar
            </button>
            <button 
              class="btn btn-danger btn-confirm-confirm"
              onclick="window.ConfirmModal.confirm()"
            >
              Confirmar
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Close modal on ESC key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('visible')) {
          this.cancel();
        }
      });

      // Close modal on backdrop click
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          this.cancel();
        }
      });
    },

    /**
     * Show confirmation modal
     * @param {string} message - Confirmation message
     * @param {object} options - Options {title, confirmText, cancelText}
     * @returns {Promise<boolean>} Resolves true if confirmed, false if cancelled
     */
    async show(message, options = {}) {
      this.init();

      const modal = document.getElementById(this.modalId);
      const titleEl = document.getElementById('confirm-modal-title');
      const messageEl = document.getElementById('confirm-modal-message');
      const confirmBtn = document.querySelector('.btn-confirm-confirm');
      const cancelBtn = document.querySelector('.btn-cancel-confirm');

      // Set content
      titleEl.textContent = options.title || 'Confirmação';
      messageEl.textContent = message;
      confirmBtn.textContent = options.confirmText || 'Confirmar';
      cancelBtn.textContent = options.cancelText || 'Cancelar';

      // Show modal - garante que está visível
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.classList.add('visible');
      }, 10);

      // Set danger style for destructive actions
      if (options.isDangerous) {
        confirmBtn.classList.remove('btn-danger');
        confirmBtn.classList.add('btn-danger');
      } else {
        confirmBtn.classList.remove('btn-danger');
        confirmBtn.classList.add('btn-primary');
      }

      // Focus on cancel button for safety
      cancelBtn.focus();

      // Return promise
      return new Promise((resolve) => {
        this.resolveCallback = resolve;
      });
    },

    /**
     * Confirm action
     */
    confirm() {
      const modal = document.getElementById(this.modalId);
      modal.classList.remove('visible');
      
      // Aguarda transição antes de esconder completamente
      setTimeout(() => {
        if (!modal.classList.contains('visible')) {
          modal.style.display = 'none';
        }
      }, 300);

      if (this.resolveCallback) {
        this.resolveCallback(true);
        this.resolveCallback = null;
      }
    },

    /**
     * Cancel action
     */
    cancel() {
      const modal = document.getElementById(this.modalId);
      modal.classList.remove('visible');
      
      // Aguarda transição antes de esconder completamente
      setTimeout(() => {
        if (!modal.classList.contains('visible')) {
          modal.style.display = 'none';
        }
      }, 300);

      if (this.resolveCallback) {
        this.resolveCallback(false);
        this.resolveCallback = null;
      }
    },

    /**
     * Simple confirm replacement for synchronous code
     * @deprecated Use show() instead for better async handling
     */
    simpleConfirm(message, title = 'Confirmação') {
      // This is called immediately and blocks, but we show the modal
      // For now, return true to not break existing code
      // This should be refactored to use the async version
      if (AppConfig && !AppConfig.isProduction()) {
        console.log('[ConfirmModal] simpleConfirm called - should refactor to async');
      }
      return true;
    },
  };

  // Export to global scope
  global.ConfirmModal = ConfirmModal;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ConfirmModal.init();
    });
  } else {
    ConfirmModal.init();
  }
})(window);
