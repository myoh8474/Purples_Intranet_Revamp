/* ========================================
   준회원 서비스 — Mock / Supabase 자동 전환
   ======================================== */
import { useMock } from './api.js';
import { supabase } from './supabase.js';
import { MockAssociates } from '../mock/associates.js';

/**
 * Supabase snake_case → 프론트 camelCase 변환
 */
function toCamel(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    gender: row.gender,
    birthDate: row.birth_date,
    education: row.education,
    school: row.school,
    job: row.job,
    company: row.company,
    region: row.region,
    branch: row.branch,
    brand: row.brand,
    maritalStatus: row.marital_status,
    status: row.status,
    channel: row.channel,
    consultant: row.consultant,
    registeredAt: row.registered_at,
    distributedAt: row.distributed_at,
    lastContactAt: row.last_contact_at,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 프론트 camelCase → Supabase snake_case 변환
 */
function toSnake(data) {
  const map = {
    birthDate: 'birth_date',
    maritalStatus: 'marital_status',
    registeredAt: 'registered_at',
    distributedAt: 'distributed_at',
    lastContactAt: 'last_contact_at',
  };
  const result = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) continue;
    result[map[key] || key] = val;
  }
  return result;
}

export const AssociateService = {
  /**
   * 준회원 목록 조회
   */
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

    // ── Supabase ──
    let query = supabase.from('associates').select('*').order('registered_at', { ascending: false });
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.consultant) query = query.eq('consultant', filters.consultant);
    if (filters.branch) query = query.eq('branch', filters.branch);
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }
    const { data, error } = await query;
    if (error) { console.error('[AssociateService] getList error:', error); return []; }
    return data.map(toCamel);
  },

  /**
   * 준회원 상세 조회
   */
  async getDetail(id) {
    if (useMock()) return MockAssociates.find(m => m.id === Number(id)) || null;

    const { data, error } = await supabase.from('associates').select('*').eq('id', id).single();
    if (error) { console.error('[AssociateService] getDetail error:', error); return null; }
    return toCamel(data);
  },

  /**
   * 준회원 수정
   */
  async update(id, updateData) {
    if (useMock()) {
      const idx = MockAssociates.findIndex(m => m.id === Number(id));
      if (idx >= 0) Object.assign(MockAssociates[idx], updateData);
      return MockAssociates[idx];
    }

    const { data, error } = await supabase
      .from('associates')
      .update(toSnake(updateData))
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('[AssociateService] update error:', error); return null; }
    return toCamel(data);
  },

  /**
   * 준회원 등록 (신규)
   */
  async create(newData) {
    if (useMock()) {
      const newId = MockAssociates.length + 1;
      const record = { id: newId, ...newData };
      MockAssociates.push(record);
      return record;
    }

    const { data, error } = await supabase
      .from('associates')
      .insert(toSnake(newData))
      .select()
      .single();
    if (error) { console.error('[AssociateService] create error:', error); return null; }
    return toCamel(data);
  },

  /**
   * 준회원 삭제
   */
  async delete(id) {
    if (useMock()) {
      const idx = MockAssociates.findIndex(m => m.id === Number(id));
      if (idx >= 0) MockAssociates.splice(idx, 1);
      return true;
    }

    const { error } = await supabase.from('associates').delete().eq('id', id);
    if (error) { console.error('[AssociateService] delete error:', error); return false; }
    return true;
  },
};
