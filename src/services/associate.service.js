/* ========================================
   준회원 서비스 — Mock/API 자동 전환
   ======================================== */
import { apiRequest, useMock } from './api.js';
import { MockAssociates } from '../mock/associates.js';

export const AssociateService = {
  async getList(filters = {}) {
    if (useMock()) {
      let data = [...MockAssociates];
      if (filters.status) data = data.filter(m => m.status === filters.status);
      if (filters.consultant) data = data.filter(m => m.consultant === filters.consultant);
      if (filters.branch) data = data.filter(m => m.branch === filters.branch);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(m => m.name.includes(q) || m.phone.includes(q));
      }
      return data;
    }
    return apiRequest('/api/associates', { method: 'GET' });
  },

  async getDetail(id) {
    if (useMock()) return MockAssociates.find(m => m.id === Number(id)) || null;
    return apiRequest(`/api/associates/${id}`);
  },

  async update(id, data) {
    if (useMock()) {
      const idx = MockAssociates.findIndex(m => m.id === Number(id));
      if (idx >= 0) Object.assign(MockAssociates[idx], data);
      return MockAssociates[idx];
    }
    return apiRequest(`/api/associates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
};
