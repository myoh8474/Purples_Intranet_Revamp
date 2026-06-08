/* ========================================
   회원 히스토리 서비스 — Mock / Supabase 자동 전환
   - localStorage 기반 (Mock) / Supabase DB (API)
   ======================================== */
import { useMock } from './api.js';
import { supabase } from './supabase.js';

const STORAGE_KEY = 'purples_member_history';

/**
 * 히스토리 카테고리 (아이콘 + 색상)
 */
export const HISTORY_CATEGORIES = {
  '상태변경':   { icon: '', color: '#6366f1', label: '상태변경' },
  '미팅':       { icon: '', color: '#22c55e', label: '미팅' },
  '결제':       { icon: '', color: '#f59e0b', label: '결제' },
  '계약':       { icon: '', color: '#14b8a6', label: '계약' },
  '서류':       { icon: '', color: '#64748b', label: '서류' },
  'SMS':        { icon: '', color: '#475569', label: 'SMS' },
  '클레임':     { icon: '', color: '#ef4444', label: '클레임' },
  '탈회':       { icon: '', color: '#dc2626', label: '탈회' },
  '특이사항':   { icon: '', color: '#e11d48', label: '특이사항' },
  '상담매니저': { icon: '', color: '#7c3aed', label: '상담매니저' },
  '매칭매니저': { icon: '', color: '#0891b2', label: '매칭매니저' },
  '법무':       { icon: '', color: '#991b1b', label: '법무' },
  '성혼비':     { icon: '', color: '#b45309', label: '성혼비' },
};

// ── localStorage 헬퍼 (Mock 모드) ──
function getAllHistoryLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveAllHistoryLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 특정 회원의 히스토리 조회
 */
export async function getHistory(memberId, options = {}) {
  if (useMock()) {
    let list = getAllHistoryLocal().filter(h => String(h.memberId) === String(memberId));
    if (options.category && options.category !== '전체') list = list.filter(h => h.category === options.category);
    if (options.startDate) list = list.filter(h => h.date >= options.startDate);
    if (options.endDate) list = list.filter(h => h.date <= options.endDate + 'T23:59:59');
    if (options.keyword) {
      const kw = options.keyword.toLowerCase();
      list = list.filter(h =>
        (h.content && h.content.toLowerCase().includes(kw)) ||
        (h.processor && h.processor.toLowerCase().includes(kw)) ||
        (h.detail && h.detail.toLowerCase().includes(kw))
      );
    }
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    return list;
  }

  // ── Supabase ──
  let query = supabase.from('member_history').select('*')
    .eq('member_id', memberId)
    .order('date', { ascending: false });
  if (options.category && options.category !== '전체') query = query.eq('category', options.category);
  if (options.startDate) query = query.gte('date', options.startDate);
  if (options.endDate) query = query.lte('date', options.endDate + 'T23:59:59');

  const { data, error } = await query;
  if (error) { console.error('[HistoryService] getHistory error:', error); return []; }

  let list = data.map(h => ({
    id: h.id,
    memberId: h.member_id,
    memberType: h.member_type,
    category: h.category,
    content: h.content,
    detail: h.detail,
    processor: h.processor,
    date: h.date,
    createdAt: h.created_at,
  }));

  if (options.keyword) {
    const kw = options.keyword.toLowerCase();
    list = list.filter(h =>
      (h.content && h.content.toLowerCase().includes(kw)) ||
      (h.processor && h.processor.toLowerCase().includes(kw)) ||
      (h.detail && h.detail.toLowerCase().includes(kw))
    );
  }
  return list;
}

/**
 * 히스토리 1건 추가
 */
export async function addHistory(entry) {
  if (useMock()) {
    const all = getAllHistoryLocal();
    const newEntry = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      memberId: entry.memberId,
      category: entry.category || '메모',
      content: entry.content || '',
      detail: entry.detail || '',
      processor: entry.processor || '시스템',
      date: entry.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    all.push(newEntry);
    saveAllHistoryLocal(all);
    return newEntry;
  }

  const { data, error } = await supabase.from('member_history').insert({
    member_id: entry.memberId,
    member_type: entry.memberType || 'regular',
    category: entry.category || '메모',
    content: entry.content || '',
    detail: entry.detail || '',
    processor: entry.processor || '시스템',
    date: entry.date || new Date().toISOString(),
  }).select().single();
  if (error) { console.error('[HistoryService] addHistory error:', error); return null; }
  return { id: data.id, memberId: data.member_id, ...data };
}

/**
 * 히스토리 1건 수정
 */
export async function updateHistory(historyId, updates) {
  if (useMock()) {
    const all = getAllHistoryLocal();
    const idx = all.findIndex(h => h.id === historyId);
    if (idx === -1) return null;
    Object.assign(all[idx], updates, { updatedAt: new Date().toISOString() });
    saveAllHistoryLocal(all);
    return all[idx];
  }

  const { data, error } = await supabase.from('member_history')
    .update({ content: updates.content, detail: updates.detail, category: updates.category })
    .eq('id', historyId).select().single();
  if (error) { console.error('[HistoryService] updateHistory error:', error); return null; }
  return data;
}

/**
 * 히스토리 1건 삭제
 */
export async function deleteHistory(historyId) {
  if (useMock()) {
    const all = getAllHistoryLocal();
    const filtered = all.filter(h => h.id !== historyId);
    saveAllHistoryLocal(filtered);
    return filtered.length < all.length;
  }

  const { error } = await supabase.from('member_history').delete().eq('id', historyId);
  if (error) { console.error('[HistoryService] deleteHistory error:', error); return false; }
  return true;
}

/**
 * Mock 데이터에서 초기 히스토리 시딩 (Mock 모드 전용)
 */
export function seedHistoryFromMember(member) {
  if (!useMock()) return; // Supabase 모드에서는 DB에 이미 있음

  const all = getAllHistoryLocal();
  const existing = all.filter(h => String(h.memberId) === String(member.id));
  // 구 형식 데이터(content에 상태값 → 포함) 감지 시 재시딩
  const hasOldFormat = existing.some(h => h.category === '상태변경' && h.content && /→/.test(h.content));
  if (existing.length > 0 && !hasOldFormat) return;
  // 구 형식이면 해당 회원 데이터 삭제 후 재시딩
  if (hasOldFormat) {
    const cleaned = all.filter(h => String(h.memberId) !== String(member.id));
    saveAllHistoryLocal(cleaned);
  }

  const entries = [];

  if (member.statusHistory) {
    member.statusHistory.forEach(sh => {
      entries.push({
        memberId: member.id, category: '상태변경',
        content: sh.reason || '', detail: `${sh.from || '-'}→${sh.to}`,
        processor: sh.processor || '시스템', date: sh.date,
      });
    });
  }

  if (member.contactLogs) {
    member.contactLogs.forEach(cl => {
      entries.push({
        memberId: member.id,
        category: cl.processor === member.matchingManager ? '매칭매니저' : '상담매니저',
        content: cl.content, detail: cl.type, processor: cl.processor, date: cl.date,
      });
    });
  }

  if (member.payments) {
    member.payments.forEach(pay => {
      entries.push({
        memberId: member.id, category: '결제',
        content: `${pay.category} - ${pay.method} ${pay.amount.toLocaleString()}원 (${pay.status})`,
        detail: pay.note || '', processor: '시스템', date: pay.date,
      });
    });
  }

  entries.push({
    memberId: member.id, category: 'SMS',
    content: '신규인사 문자 발송',
    detail: `${member.program} 가입 환영 매니저 안내`,
    processor: '시스템', date: member.joinDate,
  });

  if (member.esignComplete) {
    entries.push({
      memberId: member.id, category: '계약',
      content: '전자서명 계약 완료', detail: `${member.program} 계약서 전자서명`,
      processor: member.consultantManager,
      date: new Date(new Date(member.joinDate).getTime() + 2 * 86400000).toISOString(),
    });
  }

  if (member.meetingCount > 0) {
    for (let i = 0; i < Math.min(member.meetingCount, 3); i++) {
      const meetDate = new Date(new Date(member.joinDate).getTime() + (30 + i * 20) * 86400000);
      entries.push({
        memberId: member.id, category: '미팅',
        content: `${i + 1}차 미팅 ${i < member.meetingCount - 1 ? '완료' : '예정'}`,
        detail: i < member.meetingCount - 1 ? '미팅 진행 완료' : '일정 조율 중',
        processor: member.matchingManager, date: meetDate.toISOString(),
      });
    }
  }

  if (member.consultComment) {
    entries.push({
      memberId: member.id, category: '상담매니저', content: member.consultComment,
      processor: member.consultantManager || '시스템',
      date: new Date(new Date(member.joinDate).getTime() + 7 * 86400000).toISOString(),
    });
  }

  if (member.matchComment) {
    entries.push({
      memberId: member.id, category: '매칭매니저', content: member.matchComment,
      processor: member.matchingManager || '시스템',
      date: new Date(new Date(member.joinDate).getTime() + 10 * 86400000).toISOString(),
    });
  }

  const currentAll = getAllHistoryLocal();
  entries.forEach(e => {
    currentAll.push({
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_' + Math.random().toString(36).substr(2, 3),
      ...e, createdAt: e.date,
    });
  });
  saveAllHistoryLocal(currentAll);
}

/**
 * 히스토리 통계
 */
export async function getHistoryStats(memberId) {
  const list = await getHistory(memberId);
  const stats = {};
  Object.keys(HISTORY_CATEGORIES).forEach(cat => {
    stats[cat] = list.filter(h => h.category === cat).length;
  });
  stats.total = list.length;
  stats.lastActivity = list.length > 0 ? list[0].date : null;
  return stats;
}
