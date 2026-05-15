/* ========================================
   회원 히스토리 서비스
   - 모든 회원 활동/변경/메모를 통합 관리
   - localStorage 기반 영속화
   ======================================== */

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
};

/**
 * 전체 히스토리 조회
 */
function getAllHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

/**
 * 전체 히스토리 저장
 */
function saveAllHistory(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 특정 회원의 히스토리 조회
 * @param {number|string} memberId
 * @param {Object} options - { category, startDate, endDate, keyword }
 * @returns {Array}
 */
export function getHistory(memberId, options = {}) {
  let list = getAllHistory().filter(h => String(h.memberId) === String(memberId));

  if (options.category && options.category !== '전체') {
    list = list.filter(h => h.category === options.category);
  }
  if (options.startDate) {
    list = list.filter(h => h.date >= options.startDate);
  }
  if (options.endDate) {
    list = list.filter(h => h.date <= options.endDate + 'T23:59:59');
  }
  if (options.keyword) {
    const kw = options.keyword.toLowerCase();
    list = list.filter(h =>
      (h.content && h.content.toLowerCase().includes(kw)) ||
      (h.processor && h.processor.toLowerCase().includes(kw)) ||
      (h.detail && h.detail.toLowerCase().includes(kw))
    );
  }

  // 최신순 정렬
  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  return list;
}

/**
 * 히스토리 1건 추가
 * @param {Object} entry - { memberId, category, content, detail?, processor, date? }
 * @returns {Object} 생성된 히스토리 항목
 */
export function addHistory(entry) {
  const all = getAllHistory();
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
  saveAllHistory(all);
  return newEntry;
}

/**
 * 히스토리 1건 수정
 */
export function updateHistory(historyId, updates) {
  const all = getAllHistory();
  const idx = all.findIndex(h => h.id === historyId);
  if (idx === -1) return null;
  Object.assign(all[idx], updates, { updatedAt: new Date().toISOString() });
  saveAllHistory(all);
  return all[idx];
}

/**
 * 히스토리 1건 삭제
 */
export function deleteHistory(historyId) {
  const all = getAllHistory();
  const filtered = all.filter(h => h.id !== historyId);
  saveAllHistory(filtered);
  return filtered.length < all.length;
}

/**
 * Mock 데이터에서 초기 히스토리 시딩 (1회만)
 * 기존 contactLogs, statusHistory 등을 히스토리로 변환
 */
export function seedHistoryFromMember(member) {
  const existing = getHistory(member.id);
  if (existing.length > 0) return; // 이미 시딩됨

  const entries = [];

  // 상태이력 변환
  if (member.statusHistory) {
    member.statusHistory.forEach(sh => {
      entries.push({
        memberId: member.id,
        category: '상태변경',
        content: `${sh.from || '-'} → ${sh.to}`,
        detail: sh.reason || '',
        processor: sh.processor || '시스템',
        date: sh.date,
      });
    });
  }

  // 컨텍 로그 → 상담/매칭매니저로 변환
  if (member.contactLogs) {
    member.contactLogs.forEach(cl => {
      entries.push({
        memberId: member.id,
        category: cl.processor === member.matchingManager ? '매칭매니저' : '상담매니저',
        content: cl.content,
        detail: cl.type,
        processor: cl.processor,
        date: cl.date,
      });
    });
  }

  // 결제이력 변환
  if (member.payments) {
    member.payments.forEach(pay => {
      entries.push({
        memberId: member.id,
        category: '결제',
        content: `${pay.category} - ${pay.method} ${pay.amount.toLocaleString()}원 (${pay.status})`,
        detail: pay.note || '',
        processor: '시스템',
        date: pay.date,
      });
    });
  }

  // 가입일 기준 SMS 이벤트
  entries.push({
    memberId: member.id,
    category: 'SMS',
    content: '신규인사 문자 발송',
    detail: `${member.program} 가입 환영 매니저 안내`,
    processor: '시스템',
    date: member.joinDate,
  });

  // 서류인증
  if (member.docVerified) {
    entries.push({
      memberId: member.id,
      category: '서류',
      content: '서류인증 완료',
      detail: '전체 서류 인증 확인',
      processor: '인증팀',
      date: new Date(new Date(member.joinDate).getTime() + 5 * 86400000).toISOString(),
    });
  }

  // 전자서명
  if (member.esignComplete) {
    entries.push({
      memberId: member.id,
      category: '계약',
      content: '전자서명 계약 완료',
      detail: `${member.program} 계약서 전자서명`,
      processor: member.consultantManager,
      date: new Date(new Date(member.joinDate).getTime() + 2 * 86400000).toISOString(),
    });
  }

  // 미팅 기록 (횟수 기반)
  if (member.meetingCount > 0) {
    for (let i = 0; i < Math.min(member.meetingCount, 3); i++) {
      const meetDate = new Date(new Date(member.joinDate).getTime() + (30 + i * 20) * 86400000);
      entries.push({
        memberId: member.id,
        category: '미팅',
        content: `${i + 1}차 미팅 ${i < member.meetingCount - 1 ? '완료' : '예정'}`,
        detail: i < member.meetingCount - 1 ? '미팅 진행 완료' : '일정 조율 중',
        processor: member.matchingManager,
        date: meetDate.toISOString(),
      });
    }
  }

  // 특이사항
  if (member.cautionMemo) {
    entries.push({
      memberId: member.id,
      category: '특이사항',
      content: member.cautionMemo,
      detail: '',
      processor: member.consultantManager || '시스템',
      date: new Date(new Date(member.joinDate).getTime() + 3 * 86400000).toISOString(),
    });
  }

  // 상담매니저 의견
  if (member.consultComment) {
    entries.push({
      memberId: member.id,
      category: '상담매니저',
      content: member.consultComment,
      detail: '',
      processor: member.consultantManager || '시스템',
      date: new Date(new Date(member.joinDate).getTime() + 7 * 86400000).toISOString(),
    });
  }

  // 매칭매니저 의견
  if (member.matchComment) {
    entries.push({
      memberId: member.id,
      category: '매칭매니저',
      content: member.matchComment,
      detail: '',
      processor: member.matchingManager || '시스템',
      date: new Date(new Date(member.joinDate).getTime() + 10 * 86400000).toISOString(),
    });
  }

  // 일괄 저장
  const all = getAllHistory();
  entries.forEach(e => {
    all.push({
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_' + Math.random().toString(36).substr(2, 3),
      ...e,
      createdAt: e.date,
    });
  });
  saveAllHistory(all);
}

/**
 * 히스토리 통계
 */
export function getHistoryStats(memberId) {
  const list = getHistory(memberId);
  const stats = {};
  Object.keys(HISTORY_CATEGORIES).forEach(cat => {
    stats[cat] = list.filter(h => h.category === cat).length;
  });
  stats.total = list.length;
  stats.lastActivity = list.length > 0 ? list[0].date : null;
  return stats;
}
