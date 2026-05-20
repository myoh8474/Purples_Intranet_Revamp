/* ========================================
   정회원 서비스 — Mock / Supabase 자동 전환
   ======================================== */
import { useMock } from './api.js';
import { supabase } from './supabase.js';
import { MockRegulars } from '../mock/regulars.js';

/**
 * Supabase snake_case → 프론트 camelCase 변환
 */
function toCamel(row) {
  const prefs = row.preferences || {};
  return {
    id: row.id,
    memberId: row.member_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    gender: row.gender,
    birthDate: row.birth_date,
    brand: row.brand,
    branch: row.branch,
    education: row.education,
    school: row.school,
    job: row.job,
    company: row.company,
    region: row.region,
    religion: row.religion,
    height: row.height,
    weight: row.weight,
    maritalHistory: row.marital_history,
    income: row.income,
    bloodType: row.blood_type,
    smoking: row.smoking,
    drinking: row.drinking,
    position: row.position,
    childCare: row.child_care,
    hometown: row.hometown,
    overseas: row.overseas,
    residenceFlexible: row.residence_flexible,
    jobFlexible: row.job_flexible,
    familyWealth: row.family_wealth,
    personalWealth: row.personal_wealth,
    realEstate: row.real_estate,
    vehicle: row.vehicle,
    program: row.program,
    contractType: row.contract_type,
    contractCount: row.contract_count,
    esignComplete: row.esign_complete,
    programFee: row.program_fee,
    marriageFee: row.marriage_fee,
    rejoinCount: row.rejoin_count,
    rejoinFee: row.rejoin_fee,
    status: row.status,
    consultantManager: row.consultant_manager,
    matchingManager: row.matching_manager,
    meetingCount: row.meeting_count,
    lastMeetingDate: row.last_meeting_date,
    lastContactDate: row.last_contact_date,
    joinDate: row.join_date,
    expiryDate: row.expiry_date,
    expiryStatus: row.expiry_status,
    docReauth: row.doc_reauth,
    marriageConfirm: row.marriage_confirm,
    difficultMatch: row.difficult_match,
    totalContractAmount: row.total_contract_amount,
    paidAmount: row.paid_amount,
    balance: row.balance,
    unpaidReason: row.unpaid_reason,
    matchComment: row.match_comment,
    consultComment: row.consult_comment,
    selfAppeal: row.self_appeal,
    // 선호 조건 (JSON → 개별 필드)
    preferAge: prefs.preferAge || '-',
    preferHeight: prefs.preferHeight || '-',
    preferEdu: prefs.preferEdu || '-',
    preferReligion: prefs.preferReligion || '-',
    preferJob: prefs.preferJob || '-',
    preferRegion: prefs.preferRegion || '-',
    preferMarital: prefs.preferMarital || '-',
    preferEtc: prefs.preferEtc || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 프론트 camelCase → Supabase snake_case 변환
 */
function toSnake(data) {
  const map = {
    memberId: 'member_id', birthDate: 'birth_date', maritalHistory: 'marital_history',
    bloodType: 'blood_type', childCare: 'child_care', residenceFlexible: 'residence_flexible',
    jobFlexible: 'job_flexible', familyWealth: 'family_wealth', personalWealth: 'personal_wealth',
    realEstate: 'real_estate', contractType: 'contract_type', contractCount: 'contract_count',
    esignComplete: 'esign_complete', programFee: 'program_fee', marriageFee: 'marriage_fee',
    rejoinCount: 'rejoin_count', rejoinFee: 'rejoin_fee', consultantManager: 'consultant_manager',
    matchingManager: 'matching_manager', meetingCount: 'meeting_count',
    lastMeetingDate: 'last_meeting_date', lastContactDate: 'last_contact_date',
    joinDate: 'join_date', expiryDate: 'expiry_date', expiryStatus: 'expiry_status',
    docReauth: 'doc_reauth', marriageConfirm: 'marriage_confirm', difficultMatch: 'difficult_match',
    totalContractAmount: 'total_contract_amount', paidAmount: 'paid_amount',
    unpaidReason: 'unpaid_reason', matchComment: 'match_comment', consultComment: 'consult_comment',
    selfAppeal: 'self_appeal',
  };

  // 선호 조건은 preferences JSON으로 병합
  const prefKeys = ['preferAge','preferHeight','preferEdu','preferReligion','preferJob','preferRegion','preferMarital','preferEtc'];
  const preferences = {};
  const result = {};

  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) continue;
    if (prefKeys.includes(key)) {
      preferences[key] = val;
    } else {
      result[map[key] || key] = val;
    }
  }
  if (Object.keys(preferences).length > 0) {
    result.preferences = preferences;
  }
  return result;
}

export const RegularService = {
  /**
   * 정회원 목록 조회
   */
  async getList(filters = {}) {
    if (useMock()) {
      let data = [...MockRegulars];
      if (filters.brand) data = data.filter(m => m.brand === filters.brand);
      if (filters.branch) data = data.filter(m => m.branch === filters.branch);
      if (filters.status) data = data.filter(m => m.status === filters.status);
      if (filters.matchingManager) data = data.filter(m => m.matchingManager === filters.matchingManager);
      if (filters.consultantManager) data = data.filter(m => m.consultantManager === filters.consultantManager);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(m => m.name.includes(q) || m.memberId.includes(q) || m.phone.includes(q));
      }
      return data;
    }

    // ── Supabase ──
    let query = supabase.from('regulars').select('*').order('join_date', { ascending: false });
    if (filters.brand) query = query.eq('brand', filters.brand);
    if (filters.branch) query = query.eq('branch', filters.branch);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.matchingManager) query = query.eq('matching_manager', filters.matchingManager);
    if (filters.consultantManager) query = query.eq('consultant_manager', filters.consultantManager);
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,member_id.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }
    const { data, error } = await query;
    if (error) { console.error('[RegularService] getList error:', error); return []; }
    return data.map(toCamel);
  },

  /**
   * 정회원 상세 조회
   */
  async getDetail(id) {
    if (useMock()) return MockRegulars.find(m => m.id === Number(id)) || null;

    const { data, error } = await supabase.from('regulars').select('*').eq('id', id).single();
    if (error) { console.error('[RegularService] getDetail error:', error); return null; }
    return toCamel(data);
  },

  /**
   * 정회원 수정
   */
  async update(id, updateData) {
    if (useMock()) {
      const idx = MockRegulars.findIndex(m => m.id === Number(id));
      if (idx >= 0) Object.assign(MockRegulars[idx], updateData);
      return MockRegulars[idx];
    }

    const { data, error } = await supabase
      .from('regulars')
      .update(toSnake(updateData))
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('[RegularService] update error:', error); return null; }
    return toCamel(data);
  },

  /**
   * 정회원 등록
   */
  async create(newData) {
    if (useMock()) {
      const newId = MockRegulars.length + 1;
      const record = { id: newId, ...newData };
      MockRegulars.push(record);
      return record;
    }

    const { data, error } = await supabase
      .from('regulars')
      .insert(toSnake(newData))
      .select()
      .single();
    if (error) { console.error('[RegularService] create error:', error); return null; }
    return toCamel(data);
  },

  /**
   * 정회원 결제 내역 조회
   */
  async getPayments(regularId) {
    if (useMock()) {
      const member = MockRegulars.find(m => m.id === Number(regularId));
      return member?.payments || [];
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('regular_id', regularId)
      .order('payment_no', { ascending: true });
    if (error) { console.error('[RegularService] getPayments error:', error); return []; }
    return data.map(p => ({
      no: p.payment_no,
      date: p.date,
      method: p.method,
      amount: p.amount,
      category: p.category,
      status: p.status,
      note: p.note,
    }));
  },
};
