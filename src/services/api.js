/* ========================================
   API 통신 공통 모듈
   ======================================== */

const BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  try {
    const auth = JSON.parse(localStorage.getItem('purples_auth') || '{}');
    return auth.token || '';
  } catch { return ''; }
}

class ApiError extends Error {
  constructor(response) {
    super(`API Error: ${response.status} ${response.statusText}`);
    this.status = response.status;
    this.response = response;
  }
}

/**
 * API 요청 래퍼
 * @param {string} endpoint - API 경로 (예: '/api/associates')
 * @param {Object} options - fetch 옵션
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) throw new ApiError(response);
  return response.json();
}

/** Mock 모드 여부 */
export function useMock() {
  return import.meta.env.VITE_USE_MOCK === 'true';
}
