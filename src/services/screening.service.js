/* ========================================
   유입DB 스크리닝 서비스 v3 (최종 확정안)
   ─────────────────────────────────
   시스템 자동 처리: 전화번호 형식 오류만
   나머지(나이/학력/중복): 차단 안 함 → 분류 정보만 반환
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
 * 중복 DB 검증 (현재 진행 중 회원과 동일 번호)
 * - 차단하지 않고, 중복 정보만 반환
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
 * 기간만료(재컨텍) 여부 판단
 * - 과거 정회원 계약 종료 후 재유입
 * @param {object} member - 회원 데이터
 * @returns {{ isRecontact: boolean, pastHistory?: object }}
 */
export function checkRecontact(member) {
  if (member.channel === '기간만료(재컨텍)') {
    return {
      isRecontact: true,
      pastHistory: {
        program: member.pastProgram || '-',
        meetingCount: member.pastMeetings || 0,
        totalPayment: member.pastTotalPayment || 0,
        hasClaim: member.pastClaim || false,
      },
    };
  }
  return { isRecontact: false };
}

/**
 * 자동 분배 채널 판단
 * @param {object} member - 회원 데이터
 * @returns {{ type: 'auto_roundrobin'|'auto_direct'|'manual', directManager?: string }}
 */
export function checkAutoDistribute(member) {
  // 홈페이지 담당자 지정 상담 → 다이렉트 배정
  if (member.channel === '실시간상담' && member.designatedManager) {
    return { type: 'auto_direct', directManager: member.designatedManager };
  }

  // 랜딩페이지 채널 (CPA/SNS 등) 완전 신규 → 자동 순번 분배
  const landingChannels = [
    '카카오커플', '네이버커플', '구글커플', '블라인드커플', '당근커플',
    '인스타리어', 'SNS기타', 'TV광고', '커플테스타', 'MBTI테스트',
    '사주궁합운세', '타겟팅', '렌딩-두두',
  ];

  if (landingChannels.includes(member.channel)) {
    return { type: 'auto_roundrobin' };
  }

  // 나머지 → 관리자 수동 분배
  return { type: 'manual' };
}

/**
 * 유입 DB 종합 스크리닝 (메인 함수)
 * ─────────────────────────────────
 * 최종 확정안:
 *  - 자동 차단: 전화번호 형식 오류만
 *  - 분류: 신규(new) / 중복(duplicate) / 기간만료 재컨텍(recontact)
 *  - 나이/학력: 차단하지 않음, 데이터 그대로 팀장 판단
 * 
 * @param {object} member - 회원 데이터
 * @returns {{ 
 *   action: 'block'|'pass',
 *   routeTo: 'new'|'duplicate'|'recontact'|null,
 *   reasons: string[],
 *   duplicateInfo?: object,
 *   recontactInfo?: object,
 *   autoDistribute?: object
 * }}
 */
export function screenIncomingDB(member) {
  const result = {
    action: 'pass',
    routeTo: null,
    reasons: [],
    duplicateInfo: null,
    recontactInfo: null,
    autoDistribute: null,
  };

  // ── 1. 전화번호 형식 검증 (형식오류 → 자동 소스외) ──
  const phoneCheck = validatePhone(member.phone);
  if (!phoneCheck.valid) {
    result.action = 'block';
    result.reasons.push(phoneCheck.reason);
    return result;
  }

  // ── 2. 기간만료(재컨텍) 체크 → 탭3 ──
  const recontactCheck = checkRecontact(member);
  if (recontactCheck.isRecontact) {
    result.routeTo = 'recontact';
    result.recontactInfo = recontactCheck.pastHistory;
    return result;
  }

  // ── 3. 중복 체크 → 탭2 (차단 아님, 분류만) ──
  const dupCheck = checkDuplicate(member.phone, member.id);
  if (dupCheck.duplicate) {
    result.routeTo = 'duplicate';
    result.duplicateInfo = {
      existingMember: dupCheck.existingMember,
      existingManager: dupCheck.existingMember?.consultant || '미배정',
      existingStatus: dupCheck.existingMember?.status || '-',
      lastContactAt: dupCheck.existingMember?.lastContactAt || '',
    };
    result.reasons.push(dupCheck.reason);
    return result;
  }

  // ── 4. 신규 → 탭1 (자동/수동 분배 판단) ──
  result.routeTo = 'new';
  result.autoDistribute = checkAutoDistribute(member);

  return result;
}
