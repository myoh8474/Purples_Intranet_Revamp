/* ========================================
   권한 필터링 — 메뉴 및 페이지 접근 제어
   ======================================== */

import { ROLE_PERMISSIONS } from '../config/roles.js';

/**
 * pageId가 허용 목록에 포함되는지 확인
 */
function isAllowed(pageId, allowedList) {
  if (allowedList.includes('*')) return true;
  if (allowedList.includes(pageId)) return true;
  // 와일드카드 매칭: 'stats/*' → 'sales-report' (stats 카테고리 하위)
  return allowedList.some(pattern => {
    if (!pattern.endsWith('/*')) return false;
    const prefix = pattern.replace('/*', '');
    return pageId.startsWith(prefix);
  });
}

/**
 * 사용자 역할에 따라 메뉴를 필터링
 * @param {Array} menuItems - menu.js에서 가져온 메뉴 배열
 * @param {string} userRole - 사용자 역할 (admin, manager, etc.)
 * @returns {Array} 필터링된 메뉴
 */
export function filterMenuByRole(menuItems, userRole) {
  const allowed = ROLE_PERMISSIONS[userRole];
  if (!allowed) return [];
  if (allowed.includes('*')) return menuItems;

  return menuItems
    .map(item => {
      if (item.children) {
        // 1단계: 권한 필터링 (그룹 헤더는 일단 유지)
        const preFiltered = item.children.filter(c =>
          c.type === 'group' || isAllowed(c.id, allowed)
        );
        // 2단계: 빈 그룹 헤더 제거 (뒤에 링크 항목이 없는 그룹 헤더)
        const filtered = preFiltered.filter((c, i, arr) => {
          if (c.type !== 'group') return true;
          // 이 그룹 뒤에 다음 그룹 또는 끝까지 사이에 링크가 있는지 확인
          for (let j = i + 1; j < arr.length; j++) {
            if (arr[j].type === 'group') break;
            if (arr[j].href) return true;
          }
          return false;
        });
        return filtered.length > 0 ? { ...item, children: filtered } : null;
      }
      return isAllowed(item.id, allowed) ? item : null;
    })
    .filter(Boolean);
}

/**
 * 특정 페이지에 접근 가능한지 확인
 * @param {string} pageId
 * @param {string} userRole
 * @returns {boolean}
 */
export function canAccess(pageId, userRole) {
  const allowed = ROLE_PERMISSIONS[userRole];
  if (!allowed) return false;
  return isAllowed(pageId, allowed);
}
