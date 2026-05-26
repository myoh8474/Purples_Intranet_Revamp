/* ========================================
   준회원 서비스 — Mock / Supabase 자동 전환
   ======================================== */
import { useMock } from './api.js';
import { supabase } from './supabase.js';
import { MockAssociates } from '../mock/associates.js';

/**
 * Supabase (associate_mem) → 프론트 camelCase 변환
 * DB 컬럼명은 기존 시스템과 동일하게 유지
 */
function toCamel(row) {
  return {
    id: row.id,
    name: row.uname,                   // DB: uname
    phone: row.tel_hand,               // DB: tel_hand
    phone2: row.tel_eto || '',         // DB: tel_eto
    gender: row.sex,                   // DB: sex
    birthDate: row.birthday,           // DB: birthday
    age: row.age,
    education: row.school,             // DB: school (학력)
    school: row.school_name,           // DB: school_name
    job: row.job_name,                 // DB: job_name
    company: row.office,               // DB: office
    region: row.live_local,            // DB: live_local
    branch: row.branch,
    brand: row.brand,
    maritalStatus: row.married,        // DB: married
    status: row.state,                 // DB: state
    channel: row.etc,                  // DB: etc
    consultant: row.course,            // DB: course
    registeredAt: row.find_date,       // DB: find_date
    distributedAt: row.input_date,     // DB: input_date
    lastContactAt: row.last_counsel,   // DB: last_counsel
    email: row.email || '',
    telHome: row.tel_home || '',
    telOffice: row.tel_office || '',
    height: row.height || 0,
    weight: row.weight || 0,
    bloodType: row.bloodtype || '',     // DB: bloodtype
    children: row.children || '',
    religion: row.religion || '',
    hobby: row.hobby || '',
    hope: row.hope || '',
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 프론트 camelCase → Supabase (associate_mem) 컬럼명 변환
 */
function toSnake(data) {
  const map = {
    name: 'uname',
    phone: 'tel_hand',
    phone2: 'tel_eto',
    gender: 'sex',
    birthDate: 'birthday',
    education: 'school',
    school: 'school_name',
    job: 'job_name',
    company: 'office',
    region: 'live_local',
    maritalStatus: 'married',
    status: 'state',
    channel: 'etc',
    consultant: 'course',
    registeredAt: 'find_date',
    distributedAt: 'input_date',
    lastContactAt: 'last_counsel',
    telHome: 'tel_home',
    telOffice: 'tel_office',
    bloodType: 'bloodtype',
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
    let query = supabase.from('associate_mem').select('*').order('find_date', { ascending: false });
    if (filters.status) query = query.eq('state', filters.status);
    if (filters.consultant) query = query.eq('course', filters.consultant);
    if (filters.branch) query = query.eq('branch', filters.branch);
    if (filters.search) {
      query = query.or(`uname.ilike.%${filters.search}%,tel_hand.ilike.%${filters.search}%`);
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

    const { data, error } = await supabase.from('associate_mem').select('*').eq('id', id).single();
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
      .from('associate_mem')
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
      .from('associate_mem')
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

    const { error } = await supabase.from('associate_mem').delete().eq('id', id);
    if (error) { console.error('[AssociateService] delete error:', error); return false; }
    return true;
  },
};
