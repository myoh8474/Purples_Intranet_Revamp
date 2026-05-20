/* ========================================
   유입DB 소스외 자동 분류 서비스
   - 자동 소스외: 즉시 차단 (중복/학력/나이/형식오류)
   - 알림 분배: 정상 분배 + 이력 태그 노출
   ======================================== */
import { MockAssociates } from '@mock/associates.js';

/**
 * 전화번호 형식 검증
 * @param {string} phone - 전화번호 (하이픈 없는 숫자)
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validatePhone(phone) {
  if (!phone) return { valid: false, reason: '전화번호 없음' };
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length < 10 || cleaned.length > 11) {
    return { valid: false, reason: '전화번호 자릿수 오류' };
  }
  if (!cleaned.startsWith('010') && !cleaned.startsWith('011') && !cleaned.startsWith('016') && !cleaned.startsWith('017') && !cleaned.startsWith('018') && !cleaned.startsWith('019')) {
    return { valid: false, reason: '전화번호 형식 오류 (010 외)' };
  }
  // 테스트/스팸 패턴
  const spamPatterns = ['01000000000', '01011111111', '01012345678', '01099999999'];
  if (spamPatterns.includes(cleaned)) {
    return { valid: false, reason: '스팸/테스트 번호' };
  }
  return { valid: true };
}

/**
 * 나이 부적격 검증
 * @param {number} age - 만 나이
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateAge(age) {
  if (!age && age !== 0) return { valid: true }; // 나이 정보 없으면 SKIP
  if (age < 19) return { valid: false, reason: `연령 부적격 (${age}세 - 19세 미만)` };
  if (age >= 65) return { valid: false, reason: `연령 부적격 (${age}세 - 65세 이상)` };
  return { valid: true };
}

/**
 * 학력/성별 검증 (남성 고졸 이하만 제외)
 * @param {string} gender - '남' | '여'
 * @param {string} education - 학력
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateEducation(gender, education) {
  if (!gender || !education) return { valid: true }; // 정보 없으면 SKIP
  if (gender === '남' && education === '고졸') {
    return { valid: false, reason: '남성 고졸 이하 분배 제외' };
  }
  return { valid: true };
}

/**
 * 중복 DB 검증 (현재 진행 중 회원과 동일 번호)
 * @param {string} phone - 전화번호
 * @param {number} [excludeId] - 자기 자신 제외용 ID
 * @returns {{ duplicate: boolean, existingMember?: object, reason?: string }}
 */
export function checkDuplicate(phone, excludeId) {
  if (!phone) return { duplicate: false };
  const cleaned = phone.replace(/[^0-9]/g, '');

  // 현재 MockAssociates에서 같은 번호의 진행 중인 회원 찾기
  const existing = MockAssociates.find(m => {
    if (excludeId && m.id === excludeId) return false;
    const mPhone = (m.phone || '').replace(/[^0-9]/g, '');
    return mPhone === cleaned && !['소스외', '불가', '기간만료(재컨텍)'].includes(m.status);
  });

  if (existing) {
    return {
      duplicate: true,
      existingMember: existing,
      reason: `중복 DB - 기존 담당: ${existing.consultant || '미배정'} (상태: ${existing.status})`,
    };
  }

  // 정회원 DB에서도 체크 (localStorage 기반)
  try {
    const regulars = JSON.parse(localStorage.getItem('purples_regulars_cache') || '[]');
    const regMatch = regulars.find(r => {
      const rPhone = (r.phone || '').replace(/[^0-9]/g, '');
      return rPhone === cleaned;
    });
    if (regMatch) {
      return {
        duplicate: true,
        existingMember: regMatch,
        reason: `중복 DB - 정회원 ${regMatch.name} (${regMatch.status || '활동'})`,
      };
    }
  } catch (e) {}

  return { duplicate: false };
}

/**
 * 과거 이력 조회 (알림 분배용 태그)
 * @param {string} phone - 전화번호
 * @returns {{ hasHistory: boolean, tags: Array<{type: string, label: string, date: string}> }}
 */
export function checkPastHistory(phone) {
  if (!phone) return { hasHistory: false, tags: [] };
  const cleaned = phone.replace(/[^0-9]/g, '');
  const tags = [];

  // 과거 불가 상태 이력 체크
  const pastBlocked = MockAssociates.filter(m => {
    const mPhone = (m.phone || '').replace(/[^0-9]/g, '');
    return mPhone === cleaned && ['불가', '소스외'].includes(m.status);
  });

  // localStorage에서 상태 업데이트 이력 확인
  try {
    const updates = JSON.parse(localStorage.getItem('purples_status_updates') || '{}');
    Object.entries(updates).forEach(([id, update]) => {
      const member = MockAssociates.find(m => m.id === parseInt(id));
      if (!member) return;
      const mPhone = (member.phone || '').replace(/[^0-9]/g, '');
      if (mPhone !== cleaned) return;

      const status = typeof update === 'string' ? update : update.status;
      if (['불가', '소스외'].includes(status)) {
        const reason = typeof update === 'object' ? update.reason : '';
        tags.push({
          type: 'blocked',
          label: `과거 '${status}${reason ? ' - ' + reason : ''}' 이력`,
          date: typeof update === 'object' && update.date ? update.date : '',
        });
      }
    });
  } catch (e) {}

  // 과거 인증 반려 이력 체크 (localStorage)
  try {
    const certHistory = JSON.parse(localStorage.getItem('purples_cert_reject_history') || '[]');
    certHistory.forEach(entry => {
      const ePhone = (entry.phone || '').replace(/[^0-9]/g, '');
      if (ePhone === cleaned) {
        tags.push({
          type: 'cert_reject',
          label: `과거 인증 반려 (${entry.reason || '사유 미상'})`,
          date: entry.date || '',
        });
      }
    });
  } catch (e) {}

  // pastBlocked에서도 태그 생성
  pastBlocked.forEach(m => {
    if (!tags.find(t => t.label.includes(m.status))) {
      tags.push({
        type: 'blocked',
        label: `과거 '${m.status}' 상태 이력`,
        date: m.registeredAt || '',
      });
    }
  });

  return { hasHistory: tags.length > 0, tags };
}

/**
 * 유입 DB 종합 소스외 체크 (메인 함수)
 * @param {object} member - 회원 데이터 { phone, gender, age, education, ... }
 * @returns {{ action: 'block'|'alert'|'pass', reasons: string[], tags: Array, existingMember?: object }}
 */
export function screenIncomingDB(member) {
  const result = { action: 'pass', reasons: [], tags: [], existingMember: null };

  // ── 1단계: 자동 소스외 (즉시 차단) ──

  // ① 전화번호 형식 검증
  const phoneCheck = validatePhone(member.phone);
  if (!phoneCheck.valid) {
    result.action = 'block';
    result.reasons.push(phoneCheck.reason);
    return result; // 즉시 리턴 (더 체크할 필요 없음)
  }

  // ② 중복 DB (현재 진행 중 회원)
  const dupCheck = checkDuplicate(member.phone, member.id);
  if (dupCheck.duplicate) {
    result.action = 'block';
    result.reasons.push(dupCheck.reason);
    result.existingMember = dupCheck.existingMember;
    return result;
  }

  // ③ 나이 체크 (정보 있을 때만)
  const ageCheck = validateAge(member.age);
  if (!ageCheck.valid) {
    result.action = 'block';
    result.reasons.push(ageCheck.reason);
    return result;
  }

  // ④ 학력/성별 체크 (정보 있을 때만)
  const eduCheck = validateEducation(member.gender, member.education);
  if (!eduCheck.valid) {
    result.action = 'block';
    result.reasons.push(eduCheck.reason);
    return result;
  }

  // ── 2단계: 알림 분배 (차단 X, 이력 태그) ──
  const historyCheck = checkPastHistory(member.phone);
  if (historyCheck.hasHistory) {
    result.action = 'alert';
    result.tags = historyCheck.tags;
  }

  return result;
}
