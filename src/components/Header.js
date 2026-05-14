/* ========================================
   헤더 컴포넌트 (ES Module)
   ※ layout.js가 초기 헤더를 렌더링하지만,
     페이지 내에서 동적으로 헤더를 업데이트할 때 사용
   ======================================== */

export const Header = {
  render(breadcrumbs) {
    const header = document.getElementById('header');
    if (!header) return;
    const crumbs = breadcrumbs || [{ text: '대시보드' }];
    header.innerHTML = `
      <div class="header__left">
        <div class="header__breadcrumb">
          ${crumbs.map((c, i) => `
            <span class="header__breadcrumb-item">${c.text}</span>
            ${i < crumbs.length - 1 ? '<span class="header__breadcrumb-sep">›</span>' : ''}
          `).join('')}
        </div>
      </div>
      <div class="header__right">
        <button class="header__action" title="알림">🔔<span class="header__action-badge"></span></button>
        <button class="header__action" title="설정">⚙️</button>
      </div>
    `;
  },
};
