/* ========================================
   모달 컴포넌트 (ES Module)
   ======================================== */

export const Modal = {
  show({ title, content, size, footer, onClose }) {
    const root = document.getElementById('modal-root');
    const sizeClass = size === 'lg' ? 'modal--lg' : size === 'xl' ? 'modal--xl' : '';
    root.innerHTML = `
      <div class="modal-overlay active" id="modal-overlay">
        <div class="modal ${sizeClass}">
          <div class="modal__header">
            <h3 class="modal__title">${title}</h3>
            <button class="modal__close" id="modal-close">✕</button>
          </div>
          <div class="modal__body">${content}</div>
          ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
        </div>
      </div>`;
    document.getElementById('modal-close').addEventListener('click', () => this.hide());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') this.hide();
    });
    if (onClose) this._onClose = onClose;
  },

  hide() {
    const root = document.getElementById('modal-root');
    root.innerHTML = '';
    if (this._onClose) { this._onClose(); this._onClose = null; }
  },
};
