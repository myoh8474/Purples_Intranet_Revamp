/* ========================================
   서류인증 서비스 — Mock / Supabase 자동 전환
   ─────────────────────────────────
   방식 B: associate_mem 테이블의 doc_verify (JSONB) 컬럼 사용
   - Supabase 모드: associate_mem.doc_verify 에 JSON 배열 저장
   - Mock 모드: localStorage('purples_doc_history_{id}') 폴백
   ======================================== */
import { useMock } from './api.js';
import { supabase } from './supabase.js';

/** 서류 종류 상수 */
export const DOC_TYPES = ['재직증명서', '졸업증명서', '주민등록등본', '사진', '기타'];

/** 인증 상태 상수 */
export const DOC_STATUSES = ['대기', '완료', '반려', '미제출'];

// ── localStorage 헬퍼 (Mock 전용) ──
function _localGet(memberId) {
  try {
    return JSON.parse(localStorage.getItem(`purples_doc_history_${memberId}`) || '[]');
  } catch { return []; }
}
function _localSave(memberId, list) {
  localStorage.setItem(`purples_doc_history_${memberId}`, JSON.stringify(list));
}

export const DocService = {
  /**
   * 서류인증 내역 조회
   * @param {number|string} memberId - 회원 ID
   * @returns {Promise<Array>} 서류인증 목록
   */
  async getList(memberId) {
    if (useMock()) {
      return _localGet(memberId);
    }

    // ── Supabase: doc_verify JSONB 컬럼 조회 ──
    const { data, error } = await supabase
      .from('associate_mem')
      .select('doc_verify')
      .eq('id', memberId)
      .single();

    if (error) {
      console.error('[DocService] getList error:', error);
      return [];
    }
    return data?.doc_verify || [];
  },

  /**
   * 서류 1건 등록
   * @param {number|string} memberId - 회원 ID
   * @param {object} doc - { docType, submitDate, status, memo, confirmer, confirmDate }
   * @returns {Promise<object|null>} 등록된 서류 객체
   */
  async add(memberId, doc) {
    const record = {
      id: Date.now(),
      docType: doc.docType,
      submitDate: doc.submitDate,
      status: doc.status || '대기',
      confirmDate: doc.confirmDate || '',
      confirmer: doc.confirmer || '',
      memo: doc.memo || '',
      createdAt: new Date().toISOString(),
    };

    if (useMock()) {
      const list = _localGet(memberId);
      list.push(record);
      _localSave(memberId, list);
      return record;
    }

    // ── Supabase: 기존 배열에 추가 후 업데이트 ──
    const existing = await this.getList(memberId);
    existing.push(record);

    const { error } = await supabase
      .from('associate_mem')
      .update({ doc_verify: existing })
      .eq('id', memberId);

    if (error) {
      console.error('[DocService] add error:', error);
      return null;
    }
    return record;
  },

  /**
   * 서류 1건 상태 변경
   * @param {number|string} memberId - 회원 ID
   * @param {number} docId - 서류 ID (timestamp)
   * @param {object} updates - { status, confirmDate, confirmer, memo }
   * @returns {Promise<boolean>}
   */
  async update(memberId, docId, updates) {
    if (useMock()) {
      const list = _localGet(memberId);
      const idx = list.findIndex(d => d.id === docId);
      if (idx >= 0) {
        Object.assign(list[idx], updates);
        _localSave(memberId, list);
      }
      return idx >= 0;
    }

    // ── Supabase ──
    const existing = await this.getList(memberId);
    const idx = existing.findIndex(d => d.id === docId);
    if (idx < 0) return false;

    Object.assign(existing[idx], updates);

    const { error } = await supabase
      .from('associate_mem')
      .update({ doc_verify: existing })
      .eq('id', memberId);

    if (error) {
      console.error('[DocService] update error:', error);
      return false;
    }
    return true;
  },

  /**
   * 서류 1건 삭제
   * @param {number|string} memberId - 회원 ID
   * @param {number} docId - 서류 ID
   * @returns {Promise<boolean>}
   */
  async remove(memberId, docId) {
    if (useMock()) {
      const list = _localGet(memberId);
      const filtered = list.filter(d => d.id !== docId);
      _localSave(memberId, filtered);
      return true;
    }

    // ── Supabase ──
    const existing = await this.getList(memberId);
    const filtered = existing.filter(d => d.id !== docId);

    const { error } = await supabase
      .from('associate_mem')
      .update({ doc_verify: filtered })
      .eq('id', memberId);

    if (error) {
      console.error('[DocService] remove error:', error);
      return false;
    }
    return true;
  },

  /**
   * 일괄 인증 완료 (대기 → 완료)
   * @param {number|string} memberId - 회원 ID
   * @param {string} confirmer - 확인자 이름
   * @returns {Promise<number>} 처리된 건수
   */
  async bulkApprove(memberId, confirmer) {
    const today = new Date().toISOString().slice(0, 10);

    if (useMock()) {
      const list = _localGet(memberId);
      let count = 0;
      list.forEach(d => {
        if (d.status === '대기') {
          d.status = '완료';
          d.confirmDate = today;
          d.confirmer = confirmer || '-';
          count++;
        }
      });
      _localSave(memberId, list);
      return count;
    }

    // ── Supabase ──
    const existing = await this.getList(memberId);
    let count = 0;
    existing.forEach(d => {
      if (d.status === '대기') {
        d.status = '완료';
        d.confirmDate = today;
        d.confirmer = confirmer || '-';
        count++;
      }
    });

    if (count > 0) {
      const { error } = await supabase
        .from('associate_mem')
        .update({ doc_verify: existing })
        .eq('id', memberId);

      if (error) {
        console.error('[DocService] bulkApprove error:', error);
        return 0;
      }
    }
    return count;
  },

  /**
   * 전체 저장 (목록 교체)
   * @param {number|string} memberId - 회원 ID
   * @param {Array} list - 서류 목록
   * @returns {Promise<boolean>}
   */
  async saveAll(memberId, list) {
    if (useMock()) {
      _localSave(memberId, list);
      return true;
    }

    const { error } = await supabase
      .from('associate_mem')
      .update({ doc_verify: list })
      .eq('id', memberId);

    if (error) {
      console.error('[DocService] saveAll error:', error);
      return false;
    }
    return true;
  },
};
