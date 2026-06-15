/* ========================================
   ManagerPicker — 매니저 검색 공통 컴포넌트
   기능: 자동완성 입력 + 모달(지사별 선택) + 칩 태그
   사용법:
     import { ManagerPicker } from '@components/ManagerPicker.js';
     const picker = new ManagerPicker({
       inputId: 'mgr-search-input',
       modalBtnId: 'btn-open-mgr-modal',
       tagsId: 'mgr-tags',
       onChange: (selectedManagers) => { ... }
     });
   ======================================== */
import { CONSULTANTS, BRANCHES, CONSULTANT_BRANCH } from '@config/constants.js';

/**
 * 매니저 검색 필터 HTML을 생성합니다
 * @param {string} prefix - 고유 접두사 (중복 방지)
 * @returns {string} HTML 문자열
 */
export function renderManagerPickerHTML(prefix = 'mgr') {
  return `
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      <div style="position:relative;display:inline-block">
        <input type="text" class="form-input form-input--sm" id="${prefix}-search-input" placeholder="매니저 이름 입력" style="width:140px">
        <div class="mgr-autocomplete" id="${prefix}-autocomplete"></div>
      </div>
      <button class="mgr-modal-btn" id="${prefix}-open-modal">매니저 선택</button>
      <div class="mgr-tags" id="${prefix}-tags"></div>
    </div>`;
}

/**
 * 매니저 검색 스타일 (페이지에 1번만 삽입)
 */
export function getManagerPickerStyles() {
  return `
    .mgr-modal-btn {
      border: 1px solid var(--border-light); background: #fff; color: var(--text-primary);
      font-size: 11px; padding: 0 10px; height: 28px;
      cursor: pointer; border-radius: 2px; font-weight: 600;
      font-family: inherit; transition: background 0.1s;
    }
    .mgr-modal-btn:hover { background: #f1f3f5; border-color: var(--border-dark); }
    .mgr-autocomplete {
      position: absolute; top: 100%; left: 0; width: 180px;
      background: #fff; border: 1px solid var(--border-medium);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 100;
      max-height: 180px; overflow-y: auto; display: none;
    }
    .mgr-autocomplete.visible { display: block; }
    .mgr-ac-item {
      padding: 6px 10px; font-size: 11px; cursor: pointer;
      display: flex; align-items: center; gap: 6px;
      border-bottom: 1px solid #f1f3f5;
    }
    .mgr-ac-item:hover { background: #f0f4f8; }
    .mgr-ac-item__tag {
      font-size: 9px; color: #666; background: #f1f3f5;
      padding: 1px 4px;
    }
    .mgr-tags {
      display: flex; flex-wrap: wrap; gap: 3px; align-items: center;
    }
    .mgr-tag {
      display: inline-flex; align-items: center; gap: 3px;
      font-size: 10px; font-weight: 500; padding: 2px 8px;
      background: #e9ecef; color: var(--text-primary);
      border: 1px solid var(--border-light);
    }
    .mgr-tag__x {
      cursor: pointer; font-size: 11px; color: #888;
      margin-left: 2px; font-weight: 700; line-height: 1;
    }
    .mgr-tag__x:hover { color: #c53030; }

    /* ── 매니저 모달 ── */
    .mgr-modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
    }
    .mgr-modal {
      background: #fff; border: 1px solid #999; width: 520px; max-height: 80vh;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15); display: flex; flex-direction: column;
    }
    .mgr-modal__head {
      padding: 10px 16px; border-bottom: 1px solid var(--border-light);
      display: flex; align-items: center; justify-content: space-between;
      background: #f8f9fa;
    }
    .mgr-modal__title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .mgr-modal__close {
      width: 28px; height: 28px; border: none; background: none;
      cursor: pointer; font-size: 14px; color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
    }
    .mgr-modal__close:hover { color: var(--text-primary); }
    .mgr-modal__body { display: flex; flex: 1; min-height: 0; }
    .mgr-modal__col { display: flex; flex-direction: column; flex: 1; }
    .mgr-modal__col--left { border-right: 1px solid var(--border-light); background: #f8f9fa; }
    .mgr-modal__col-head {
      padding: 6px 14px; font-size: 11px; font-weight: 700; color: var(--text-secondary);
      border-bottom: 1px solid var(--border-light); background: #f1f3f5;
    }
    .mgr-modal__scroll { overflow-y: auto; max-height: 320px; }
    .mgr-modal__item {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 14px; font-size: 12px; cursor: pointer;
      border-bottom: 1px solid #f1f3f5; transition: background 0.1s;
      user-select: none; color: var(--text-primary);
    }
    .mgr-modal__item:hover { background: #f0f4f8; }
    .mgr-modal__item input[type="checkbox"] {
      width: 15px; height: 15px; accent-color: var(--accent); cursor: pointer;
    }
    .mgr-modal__item-name { flex: 1; font-weight: 500; }
    .mgr-modal__item-count {
      font-size: 10px; color: #888; background: #f1f3f5;
      padding: 1px 6px;
    }
    .mgr-modal__item-tag {
      font-size: 10px; color: var(--accent); background: #e9ecef;
      padding: 1px 6px;
    }
    .mgr-modal__item.checked { background: #f0f4f8; }
    .mgr-modal__empty {
      padding: 30px; text-align: center; font-size: 12px;
      color: #888;
    }
    .mgr-modal__foot {
      padding: 10px 16px; border-top: 1px solid var(--border-light);
      display: flex; align-items: center; justify-content: space-between;
      background: #f8f9fa;
    }
    .mgr-modal__foot-info { font-size: 11px; color: #666; }
    .mgr-modal__foot-info strong { color: var(--accent); }
  `;
}

/** 지사 약칭 변환 */
function shortBranch(name) {
  if (!name) return '';
  return name.replace('퍼플스','P.').replace('디노블','D.').replace('르매리','LM');
}

/**
 * ManagerPicker 클래스
 */
export class ManagerPicker {
  /**
   * @param {Object} opts
   * @param {string} opts.inputId - 자동완성 입력 필드 ID
   * @param {string} opts.modalBtnId - 모달 버튼 ID
   * @param {string} opts.tagsId - 칩 태그 컨테이너 ID
   * @param {Function} opts.onChange - 선택 변경 시 콜백 (selectedManagers: string[])
   * @param {string[]} [opts.consultants] - 매니저 목록 (기본: CONSULTANTS)
   */
  constructor(opts) {
    this.inputId = opts.inputId;
    this.modalBtnId = opts.modalBtnId;
    this.tagsId = opts.tagsId;
    this.onChange = opts.onChange || (() => {});
    this.consultants = opts.consultants || CONSULTANTS;
    this.selectedManagers = [];

    this._bindAutocomplete();
    this._bindModalBtn();
  }

  /** 선택된 매니저 목록 반환 */
  getSelected() {
    return [...this.selectedManagers];
  }

  /** 선택 초기화 */
  reset() {
    this.selectedManagers = [];
    this._renderTags();
    this.onChange(this.selectedManagers);
  }

  /** ── 자동완성 바인딩 ── */
  _bindAutocomplete() {
    const input = document.getElementById(this.inputId);
    const acEl = document.getElementById(this.inputId.replace('-search-input', '-autocomplete'));
    if (!input || !acEl) return;

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { acEl.classList.remove('visible'); return; }
      const matches = this.consultants.filter(c =>
        c.toLowerCase().includes(q) && !this.selectedManagers.includes(c)
      );
      if (matches.length === 0) { acEl.classList.remove('visible'); return; }

      acEl.innerHTML = matches.map(c => {
        const branch = BRANCHES.find(b => b.code === CONSULTANT_BRANCH[c]);
        return `<div class="mgr-ac-item" data-mgr="${c}">
          <span>${c}</span>
          <span class="mgr-ac-item__tag">${shortBranch(branch?.name) || ''}</span>
        </div>`;
      }).join('');
      acEl.classList.add('visible');

      acEl.querySelectorAll('.mgr-ac-item').forEach(item => {
        item.addEventListener('click', () => {
          if (!this.selectedManagers.includes(item.dataset.mgr)) {
            this.selectedManagers.push(item.dataset.mgr);
          }
          input.value = '';
          acEl.classList.remove('visible');
          this._renderTags();
          this.onChange(this.selectedManagers);
        });
      });
    });

    input.addEventListener('blur', () => {
      setTimeout(() => acEl.classList.remove('visible'), 150);
    });
  }

  /** ── 모달 버튼 바인딩 ── */
  _bindModalBtn() {
    const btn = document.getElementById(this.modalBtnId);
    if (!btn) return;
    btn.addEventListener('click', () => this._openModal());
  }

  /** ── 칩 태그 렌더 ── */
  _renderTags() {
    const tagsEl = document.getElementById(this.tagsId);
    if (!tagsEl) return;
    if (this.selectedManagers.length > 0) {
      tagsEl.innerHTML = this.selectedManagers.map(m =>
        `<span class="mgr-tag">${m}<span class="mgr-tag__x" data-mgr="${m}">×</span></span>`
      ).join('');
      tagsEl.querySelectorAll('.mgr-tag__x').forEach(x => {
        x.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectedManagers = this.selectedManagers.filter(m => m !== x.dataset.mgr);
          this._renderTags();
          this.onChange(this.selectedManagers);
        });
      });
    } else {
      tagsEl.innerHTML = '';
    }
  }

  /** ── 매니저 선택 모달 ── */
  _openModal() {
    let tempSelected = [...this.selectedManagers];
    let checkedBranches = [];

    const overlay = document.createElement('div');
    overlay.className = 'mgr-modal-overlay';
    overlay.innerHTML = `
      <div class="mgr-modal">
        <div class="mgr-modal__head">
          <div class="mgr-modal__title">매니저 선택</div>
          <button class="mgr-modal__close" id="mgr-modal-close-x">✕</button>
        </div>
        <div class="mgr-modal__body">
          <div class="mgr-modal__col mgr-modal__col--left">
            <div class="mgr-modal__col-head">지사 선택</div>
            <div class="mgr-modal__scroll" id="mm-branch-scroll-d">
              ${BRANCHES.map(b => {
                const cnt = this.consultants.filter(c => CONSULTANT_BRANCH[c] === b.code).length;
                return `<label class="mgr-modal__item">
                  <input type="checkbox" class="mm-branch-chk" value="${b.code}">
                  <span class="mgr-modal__item-name">${b.name}</span>
                  <span class="mgr-modal__item-count">${cnt}명</span>
                </label>`;
              }).join('')}
            </div>
          </div>
          <div class="mgr-modal__col">
            <div class="mgr-modal__col-head">소속 매니저</div>
            <div class="mgr-modal__scroll" id="mm-mgr-scroll-d">
              <div class="mgr-modal__empty">지사를 선택하세요</div>
            </div>
          </div>
        </div>
        <div class="mgr-modal__foot">
          <div class="mgr-modal__foot-info" id="mm-foot-d">선택된 매니저 없음</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn--sm" id="mm-reset-d" style="font-size:11px;background:#f1f5f9;border:1px solid #e2e8f0;color:#475569">초기화</button>
            <button class="btn btn--sm" id="mm-confirm-d" style="font-size:11px;background:#0369a1;color:#fff;border:none;padding:6px 16px">선택 완료</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const self = this;

    function refreshMgrList() {
      const scroll = overlay.querySelector('#mm-mgr-scroll-d');
      if (checkedBranches.length === 0) {
        scroll.innerHTML = '<div class="mgr-modal__empty">← 지사를 선택하세요</div>';
        updateFoot();
        return;
      }
      let html = '';
      checkedBranches.forEach(code => {
        const branch = BRANCHES.find(b => b.code === code);
        self.consultants.filter(c => CONSULTANT_BRANCH[c] === code).forEach(mgr => {
          const checked = tempSelected.includes(mgr);
          html += `<label class="mgr-modal__item${checked ? ' checked' : ''}">
            <input type="checkbox" class="mm-mgr-chk" value="${mgr}" ${checked ? 'checked' : ''}>
            <span class="mgr-modal__item-name">${mgr}</span>
            <span class="mgr-modal__item-tag">${shortBranch(branch?.name) || ''}</span>
          </label>`;
        });
      });
      scroll.innerHTML = html || '<div class="mgr-modal__empty">소속 매니저 없음</div>';
      scroll.querySelectorAll('.mm-mgr-chk').forEach(cb => {
        cb.addEventListener('change', function() {
          const mgr = this.value;
          if (this.checked) { if (!tempSelected.includes(mgr)) tempSelected.push(mgr); }
          else { tempSelected = tempSelected.filter(m => m !== mgr); }
          this.closest('.mgr-modal__item').classList.toggle('checked', this.checked);
          updateFoot();
        });
      });
      updateFoot();
    }

    function updateFoot() {
      const el = overlay.querySelector('#mm-foot-d');
      if (!el) return;
      if (tempSelected.length > 0) {
        el.innerHTML = `<strong>${tempSelected.length}명</strong> 선택: ${tempSelected.slice(0, 3).join(', ')}${tempSelected.length > 3 ? ` 외 ${tempSelected.length - 3}명` : ''}`;
      } else {
        el.textContent = '선택된 매니저 없음';
      }
    }

    // 지사 체크 이벤트
    overlay.querySelectorAll('.mm-branch-chk').forEach(cb => {
      cb.addEventListener('change', function() {
        if (this.checked) checkedBranches.push(this.value);
        else checkedBranches = checkedBranches.filter(c => c !== this.value);
        refreshMgrList();
      });
    });

    // 닫기
    overlay.querySelector('#mgr-modal-close-x').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    // 초기화
    overlay.querySelector('#mm-reset-d').addEventListener('click', () => {
      tempSelected = [];
      checkedBranches = [];
      overlay.querySelectorAll('.mm-branch-chk').forEach(cb => { cb.checked = false; });
      refreshMgrList();
    });

    // 선택 완료
    overlay.querySelector('#mm-confirm-d').addEventListener('click', () => {
      this.selectedManagers = [...tempSelected];
      this._renderTags();
      this.onChange(this.selectedManagers);
      overlay.remove();
    });
  }
}
