/* ========================================
   상세페이지 모달 핸들러
   — 유의사항 / 소개프로필 / 사진관리 / 매출입력 / 히스토리 등록
   ======================================== */
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { addHistory } from '@services/history.js';

/**
 * 모든 모달 이벤트 바인딩
 * @param {Object} m - 회원 데이터
 */
export function bindModals(m) {

  /* ── 유의사항 등록 ── */
  var addNoteBtn = document.getElementById('btn-add-note');
  if (addNoteBtn) addNoteBtn.addEventListener('click', function() {
    Modal.show({
      title: '유의사항 등록',
      content: '<div style="margin-bottom:12px">'
        + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">태그 설정</label>'
        + '<div style="display:flex;gap:14px;padding:8px 0">'
        + '  <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="note-tag-difficult" style="accent-color:#f59e0b"> 난매칭</label>'
        + '  <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="note-tag-no-event" style="accent-color:#dc2626"> 이벤트불가</label>'
        + '  <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="note-tag-no-rejoin" style="accent-color:#dc2626"> 재가입불가</label>'
        + '</div></div>'
        + '<div style="margin-bottom:12px">'
        + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">구분</label>'
        + '<select class="form-input" id="note-type" style="width:100%;font-size:13px">'
        + '  <option value="상담">상담메모</option>'
        + '  <option value="매칭">매칭메모</option>'
        + '  <option value="주의">주의사항</option>'
        + '  <option value="기타">기타</option>'
        + '</select></div>'
        + '<div style="margin-bottom:12px">'
        + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">내용</label>'
        + '<textarea class="form-input" id="note-content" rows="4" style="width:100%;font-size:13px;resize:vertical" placeholder="유의사항을 입력하세요..."></textarea></div>'
        + '<div style="text-align:right"><button class="btn btn--primary btn--sm" id="btn-submit-note">등록</button></div>',
    });
    setTimeout(function() {
      var submitBtn = document.getElementById('btn-submit-note');
      if (submitBtn) submitBtn.addEventListener('click', function() {
        var content = document.getElementById('note-content').value.trim();
        if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }
        var type = document.getElementById('note-type').value;

        // 태그 설정 반영
        var tagDifficult = document.getElementById('note-tag-difficult')?.checked;
        var tagNoEvent = document.getElementById('note-tag-no-event')?.checked;
        var tagNoRejoin = document.getElementById('note-tag-no-rejoin')?.checked;

        var headerLeft = document.querySelector('.detail-header-bar__left');
        if (headerLeft) {
          // 기존 태그 제거
          headerLeft.querySelectorAll('.badge-tag-dynamic').forEach(function(el) { el.remove(); });
          // 선택된 태그 추가
          var idSpan = headerLeft.querySelector('.detail-header-bar__id');
          var ref = idSpan?.nextSibling;
          if (tagNoEvent) {
            var b1 = document.createElement('span');
            b1.className = 'badge badge--red badge-tag-dynamic';
            b1.textContent = '이벤트불가';
            headerLeft.insertBefore(b1, headerLeft.querySelector('.badge:not(.badge-tag-dynamic)') || null);
          }
          if (tagNoRejoin) {
            var b2 = document.createElement('span');
            b2.className = 'badge badge--red badge-tag-dynamic';
            b2.textContent = '재가입불가';
            headerLeft.appendChild(b2);
          }
          if (tagDifficult) {
            var b3 = document.createElement('span');
            b3.className = 'badge badge--orange badge-tag-dynamic';
            b3.textContent = '난매칭';
            headerLeft.appendChild(b3);
          }
        }

        var notesList = document.getElementById('notes-list');
        if (notesList) {
          var emptyMsg = notesList.querySelector('div[style*="text-align:center"]');
          if (emptyMsg) emptyMsg.remove();
          var colors = { '상담': { bg: '#fffbeb', border: '#fcd34d', icon: '📌', color: '#92400e' }, '매칭': { bg: '#f0f9ff', border: '#93c5fd', icon: '📋', color: '#1e40af' }, '주의': { bg: '#fef2f2', border: '#fca5a5', icon: '⚠️', color: '#991b1b' }, '기타': { bg: '#f5f3ff', border: '#c4b5fd', icon: '📝', color: '#5b21b6' } };
          var c = colors[type] || colors['기타'];
          var today = new Date().toISOString().split('T')[0];
          var tagLabels = [];
          if (tagDifficult) tagLabels.push('<span class="badge badge--orange" style="font-size:10px">난매칭</span>');
          if (tagNoEvent) tagLabels.push('<span class="badge badge--red" style="font-size:10px">이벤트불가</span>');
          if (tagNoRejoin) tagLabels.push('<span class="badge badge--red" style="font-size:10px">재가입불가</span>');
          var tagHtml = tagLabels.length > 0 ? '<div style="margin-bottom:4px;display:flex;gap:4px">' + tagLabels.join('') + '</div>' : '';
          notesList.insertAdjacentHTML('afterbegin', '<div style="padding:8px 10px;background:' + c.bg + ';border:1px solid ' + c.border + ';margin-bottom:6px;border-radius:4px;font-size:12px;line-height:1.6">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
            + '  <span style="font-weight:700;color:' + c.color + '">' + c.icon + ' ' + type + '메모</span>'
            + '  <span style="font-size:10px;color:' + c.color + '">' + today + '</span>'
            + '</div>' + tagHtml + content + '</div>');
        }
        Modal.hide();
        Toast.show('유의사항이 등록되었습니다.', 'success');
      });
    }, 100);
  });


  /* ── 리콜대기: 기간연장 신청서 발송 ── */
  var recallEsignBtn = document.getElementById('btn-recall-esign');
  if (recallEsignBtn) {
    recallEsignBtn.addEventListener('click', async function() {
      if (!confirm(m.name + ' 회원에게 기간연장 신청서를 발송하시겠습니까?\n\n모두싸인을 통해 전자서명 요청이 발송됩니다.')) return;
      recallEsignBtn.disabled = true;
      recallEsignBtn.textContent = '발송 중...';
      await new Promise(function(r) { setTimeout(r, 1500); });
      recallEsignBtn.textContent = '발송완료 (서명 대기중)';
      recallEsignBtn.style.background = '#3b82f6';
      recallEsignBtn.style.borderColor = '#3b82f6';
      recallEsignBtn.insertAdjacentHTML('afterend', ' <span style="font-size:11px;background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:4px;font-weight:600">서명 대기중</span>');
      Toast.show('기간연장 신청서가 발송되었습니다.', 'success');
      addHistory({ memberId: m.id, category: '상태변경', content: '기간연장 신청서 발송 (모두싸인)', detail: '', processor: '시스템', date: new Date().toISOString() });
    });
  }

  /* ── 소개 프로필 등록/수정 모달 ── */
  var editIntroBtn = document.getElementById('btn-edit-intro');
  if (editIntroBtn) editIntroBtn.addEventListener('click', function() {
    Modal.show({
      title: '소개 프로필 ' + (m.introProfile ? '수정' : '등록'),
      size: 'lg',
      content: '<div style="margin-bottom:12px">'
        + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">소개 프로필</label>'
        + '<textarea class="form-input" id="modal-intro-text" rows="8" style="width:100%;font-size:13px;resize:vertical" placeholder="매칭 시 상대방에게 전달되는 소개 프로필을 작성하세요...">' + (m.introProfile || '') + '</textarea></div>'
        + '<div style="text-align:right"><button class="btn btn--primary btn--sm" id="btn-submit-intro">저장</button></div>',
    });
    setTimeout(function() {
      var submitBtn = document.getElementById('btn-submit-intro');
      if (submitBtn) submitBtn.addEventListener('click', function() {
        var text = document.getElementById('modal-intro-text').value.trim();
        if (!text) { Toast.show('프로필 내용을 입력해주세요.', 'warning'); return; }
        Modal.hide();
        Toast.show('소개 프로필이 저장되었습니다.', 'success');
      });
    }, 100);
  });


  /* ── 사진 관리 모달 ── */
  function showPhotoModal() {
    var currentPhotos = Array.isArray(m.photo) ? m.photo.slice() : (m.photo ? [m.photo] : []);
    var repIdx = 0;

    function renderGrid() {
      if (currentPhotos.length === 0) {
        return '<div style="padding:40px;text-align:center;color:var(--text-muted)">등록된 사진이 없습니다.</div>';
      }
      return '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">'
        + currentPhotos.map(function(p, i) {
          return '<div style="position:relative">'
            + '<img src="' + p + '" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;border:2px solid ' + (i === repIdx ? 'var(--accent)' : 'var(--border-light)') + '">'
            + (i === repIdx ? '<div style="position:absolute;top:4px;left:4px;background:var(--accent);color:#fff;font-size:10px;padding:2px 6px;border-radius:8px">대표</div>' : '')
            + '<div style="position:absolute;top:4px;right:4px;display:flex;gap:4px">'
            + (i !== repIdx ? '<button class="btn btn--ghost btn--sm photo-rep-btn" data-idx="' + i + '" style="font-size:10px;padding:1px 4px;background:rgba(255,255,255,0.9)">대표</button>' : '')
            + '<button class="btn btn--ghost btn--sm photo-del-btn" data-idx="' + i + '" style="font-size:10px;padding:1px 4px;background:rgba(255,255,255,0.9);color:var(--danger)">삭제</button>'
            + '</div></div>';
        }).join('') + '</div>';
    }

    Modal.show({
      title: '사진 관리 (' + currentPhotos.length + '장)',
      size: 'lg',
      content: renderGrid() + '<div style="text-align:center;margin-top:16px"><button class="btn btn--primary btn--sm" id="btn-add-photo">+ 사진 추가</button></div>',
    });

    document.getElementById('modal-root').addEventListener('click', function(ev) {
      var repBtn = ev.target.closest('.photo-rep-btn');
      if (repBtn) {
        repIdx = parseInt(repBtn.dataset.idx);
        document.querySelector('#modal-root .modal__body').innerHTML = renderGrid() + '<div style="text-align:center;margin-top:16px"><button class="btn btn--primary btn--sm" id="btn-add-photo">+ 사진 추가</button></div>';
        Toast.show('대표 사진이 변경되었습니다.', 'success');
      }
      var delBtn = ev.target.closest('.photo-del-btn');
      if (delBtn) {
        var idx = parseInt(delBtn.dataset.idx);
        if (confirm((idx === repIdx ? '대표 사진입니다. ' : '') + '삭제하시겠습니까?')) {
          currentPhotos.splice(idx, 1);
          if (repIdx >= currentPhotos.length) repIdx = 0;
          document.querySelector('#modal-root .modal__body').innerHTML = renderGrid() + '<div style="text-align:center;margin-top:16px"><button class="btn btn--primary btn--sm" id="btn-add-photo">+ 사진 추가</button></div>';
          Toast.show('사진이 삭제되었습니다.', 'info');
        }
      }
      if (ev.target.id === 'btn-add-photo') {
        Toast.show('사진 업로드 기능은 API 연동 후 활성화됩니다.', 'info');
      }
    });
  }

  var photoEl = document.getElementById('header-photo');
  if (photoEl) photoEl.addEventListener('click', showPhotoModal);
  var photoMoreEl = document.getElementById('btn-photo-more');
  if (photoMoreEl) photoMoreEl.addEventListener('click', showPhotoModal);


  /* ── 매출 입력 모달 ── */
  var payBtn = document.getElementById('btn-add-payment');
  if (payBtn) payBtn.addEventListener('click', function() {
    Modal.show({
      title: '매출 입력',
      size: 'lg',
      content: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">'
        + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">결제일</label><input type="date" class="form-input" id="pay-date" style="width:100%"></div>'
        + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">분류</label><select class="form-input" id="pay-category" style="width:100%"><option>가입비</option><option>성혼비</option><option>재가입비</option><option>잔금</option><option>기타</option></select></div>'
        + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">결제수단</label><select class="form-input" id="pay-method" style="width:100%"><option>카드</option><option>현금</option><option>계좌이체</option></select></div>'
        + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">금액</label><input type="number" class="form-input" id="pay-amount" placeholder="0" style="width:100%"></div>'
        + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">수당옵션</label><select class="form-input" id="pay-fee-option" style="width:100%"><option>-</option><option>전문직</option><option>준전문직</option><option>프로모션</option></select></div>'
        + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">쉐어매니저</label><input type="text" class="form-input" id="pay-share-mgr" placeholder="매니저명" style="width:100%"></div>'
        + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">쉐어비율 (%)</label><input type="number" class="form-input" id="pay-share-rate" placeholder="0" min="0" max="100" style="width:100%"></div>'
        + '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">비고</label><input type="text" class="form-input" id="pay-note" placeholder="비고 사항" style="width:100%"></div>'
        + '</div>'
        + '<div style="background:var(--bg-secondary);padding:12px;border-radius:var(--radius);margin-top:16px;display:flex;justify-content:space-between;font-size:13px">'
        + '<span style="font-weight:600">실매출액</span><span id="pay-real-sales" style="font-weight:700;color:var(--accent)">₩0</span></div>'
        + '<div style="text-align:right;margin-top:16px"><button class="btn btn--ghost btn--sm" onclick="Modal.close()" style="margin-right:8px">취소</button><button class="btn btn--primary btn--sm" id="btn-submit-payment">등록</button></div>',
    });
    function calcReal() {
      var amt = parseInt(document.getElementById('pay-amount').value) || 0;
      var rate = parseInt(document.getElementById('pay-share-rate').value) || 0;
      var real = amt - Math.round(amt * rate / 100);
      document.getElementById('pay-real-sales').textContent = '₩' + real.toLocaleString();
    }
    var amtInput = document.getElementById('pay-amount');
    var rateInput = document.getElementById('pay-share-rate');
    if (amtInput) amtInput.addEventListener('input', calcReal);
    if (rateInput) rateInput.addEventListener('input', calcReal);
    var submitPayBtn = document.getElementById('btn-submit-payment');
    if (submitPayBtn) submitPayBtn.addEventListener('click', function() {
      var amt = document.getElementById('pay-amount').value;
      if (!amt || parseInt(amt) <= 0) { Toast.show('금액을 입력하세요.', 'error'); return; }
      Toast.show('매출이 등록되었습니다.', 'success');
      Modal.close();
    });
  });


  /* ── 히스토리 등록 모달 (이벤트 위임) ── */
  document.addEventListener('click', function(ev) {
    if (ev.target.id === 'btn-add-history') {
      var currentManager = m.consultantManager || '시스템';
      Modal.show({
        title: '히스토리 등록',
        size: 'lg',
        content: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">'
          + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">구분</label>'
          + '<select class="form-input" id="hist-new-cat" style="width:100%">'
          + '<option value="통화내역">통화내역</option>'
          + '<option value="기타">기타 의견</option>'
          + '</select></div>'
          + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">일시</label>'
          + '<input type="datetime-local" class="form-input" id="hist-new-date" style="width:100%" value="' + new Date().toISOString().substring(0,16) + '"></div>'
          + '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">내용</label>'
          + '<textarea class="form-input" id="hist-new-content" rows="4" style="width:100%;resize:vertical;font-size:13px" placeholder="내용을 입력하세요..."></textarea></div>'
          + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">담당자</label>'
          + '<input type="text" class="form-input" id="hist-new-processor" value="' + currentManager + '" style="width:100%;background:var(--bg-secondary)" readonly></div>'
          + '</div>'
          + '<div style="text-align:right;margin-top:16px"><button class="btn btn--ghost btn--sm" id="hist-new-cancel" style="margin-right:8px">취소</button>'
          + '<button class="btn btn--primary btn--sm" id="hist-new-submit">등록</button></div>',
      });
      setTimeout(function() {
        var cancelBtn = document.getElementById('hist-new-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });
        var submitBtn = document.getElementById('hist-new-submit');
        if (submitBtn) submitBtn.addEventListener('click', function() {
          var content = document.getElementById('hist-new-content').value.trim();
          if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }
          var finalCat = currentManager === m.matchingManager ? '매칭매니저' : '상담매니저';
          addHistory({
            memberId: m.id,
            category: finalCat,
            content: content,
            detail: '',
            processor: currentManager,
            date: new Date(document.getElementById('hist-new-date').value).toISOString(),
          });
          Modal.hide();
          Toast.show('히스토리가 등록되었습니다.', 'success');
        });
      }, 100);
    }
  });

  /* ── 계약서확인 모달 ── */
  var contractViewBtn = document.getElementById('btn-contract-view');
  if (contractViewBtn) contractViewBtn.addEventListener('click', function() {
    var contractDate = m.joinDate ? Formatters.date(m.joinDate) : '-';
    var expiryDate = m.expiryDate ? Formatters.date(m.expiryDate) : '-';
    var contractPeriod = contractDate + ' ~ ' + expiryDate;

    var R = '<tr>';
    var L = '<td style="padding:8px 12px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light);white-space:nowrap;width:10%">';
    var V = '<td style="padding:8px 12px;border:1px solid var(--border-light)">';
    var E = '</td>';

    Modal.show({
      title: '계약 정보',
      size: 'lg',
      content: '<table style="width:100%;border-collapse:collapse;font-size:13px"><tbody>'
        + R + L+'이름'+E + V + (m.name || '-') + E + L+'아이디'+E + V + (m.memberId || '-') + E + L+'생년월일'+E + V + Formatters.date(m.birthDate) + E + L+'계약일'+E + V + contractDate + E + '</tr>'
        + R + L+'계약기간'+E + '<td colspan="3" style="padding:8px 12px;border:1px solid var(--border-light)">' + contractPeriod + E + L+'가입금'+E + V + Formatters.money(m.programFee || 0) + E + L+'성혼비'+E + V + Formatters.money(m.marriageFee || 0) + E + '</tr>'
        + R + L+'횟수'+E + V + (m.meetingCount != null ? m.meetingCount + '회' : '0') + E + L+'이메일'+E + '<td colspan="3" style="padding:8px 12px;border:1px solid var(--border-light)">' + (m.email || '-') + E + L+'전화번호'+E + V + Formatters.phone(m.phone) + E + '</tr>'
        + R + L+'브랜드'+E + V + (m.brand || '-') + E + L+'프로그램'+E + V + (m.program || '-') + E + L+'매니저'+E + V + (m.consultantManager || '-') + E + L+'지사'+E + V + (m.branch || '-') + E + '</tr>'
        + R + L+'대리인'+E + V + (m.agent || '-') + E + L+'관계'+E + V + (m.agentRelation || '본인') + E + L+'국제'+E + V + (m.international || '국내') + E + L+'국가'+E + V + (m.country || '대한민국') + E + '</tr>'
        + R + L+'주소'+E + '<td colspan="7" style="padding:8px 12px;border:1px solid var(--border-light)">' + (m.homeAddress || '-') + E + '</tr>'
        + '</tbody></table>'
        + '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">'
        + '<button class="btn btn--ghost btn--sm" id="btn-contract-confirm" style="border:1px solid #333;color:#333">확인</button>'
        + '<button class="btn btn--primary btn--sm" id="btn-contract-send-action">계약서발송</button>'
        + '</div>',
    });
    document.getElementById('modal-root').addEventListener('click', function(e) {
      if (e.target.id === 'btn-contract-confirm') {
        Modal.hide();
      }
      if (e.target.id === 'btn-contract-send-action') {
        e.stopPropagation();
        var msg = m.name + ' 님에게 계약서가 발송됩니다. 계약정보를 확인해주세요.';
        if (window.confirm(msg)) {
          Modal.hide();
          Toast.show('계약서가 발송되었습니다.', 'success');
        }
      }
    });
  });


  /* ── 서류등록 모달 (준회원과 동일) ── */
  var CERT_DOC_TYPES = {
    'common': [
      { name: '신분증 사본', required: true },
      { name: '졸업증명서', required: false },
      { name: '사진(3x4)', required: true }
    ],
    '전문직': [
      { name: '자격증 사본', required: true },
      { name: '재직증명서', required: true },
      { name: '사업자등록증', required: false },
      { name: '소득증명원', required: false }
    ],
    '준전문직': [
      { name: '자격증 사본', required: true },
      { name: '재직증명서', required: true }
    ],
    '브론즈': [
      { name: '재직증명서', required: false }
    ],
    '실버(에메랄드)': [
      { name: '재직증명서', required: false },
      { name: '소득증명원', required: false }
    ],
    '골드(사파이어)': [
      { name: '재직증명서', required: true },
      { name: '소득증명원', required: true }
    ]
  };

  var certDocFiles = {};
  var selectedAuth = '';
  var selectedAutoDocs = [];

  function getCertDocsForProgram(pgm) {
    var docs = [];
    var common = CERT_DOC_TYPES['common'] || [];
    for (var i = 0; i < common.length; i++) docs.push({ name: common[i].name, required: common[i].required });
    var pgmDocs = CERT_DOC_TYPES[pgm] || [];
    for (var j = 0; j < pgmDocs.length; j++) {
      var exists = false;
      for (var k = 0; k < docs.length; k++) { if (docs[k].name === pgmDocs[j].name) { exists = true; if (pgmDocs[j].required) docs[k].required = true; break; } }
      if (!exists) docs.push({ name: pgmDocs[j].name, required: pgmDocs[j].required });
    }
    return docs;
  }

  var addDocBtn = document.getElementById('btn-add-doc');
  if (addDocBtn) addDocBtn.addEventListener('click', function() {
    var pgm = m.program || '기타';
    var docs = getCertDocsForProgram(pgm);
    var certKey = 'purples_cert_docs_reg_' + (m.id || m.memberId);
    var saved = [];
    try { saved = JSON.parse(localStorage.getItem(certKey) || '[]'); } catch (e) { }

    var h = '';
    h += '<div style="margin-bottom:12px;padding:10px 12px;background:var(--bg-secondary);border:1px solid var(--border-light);font-size:12px">';
    h += '<strong>' + m.name + '</strong> (' + Formatters.phone(m.phone) + ') · 프로그램: <strong>' + pgm + '</strong>';
    h += '</div>';
    h += '<div style="margin-bottom:12px">';
    h += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">인증방법 선택</label>';
    h += '<div style="display:flex;gap:16px;flex-wrap:wrap">';
    h += '<label style="cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px"><input type="radio" name="r-cert-method-reg" value="manager" checked /> 매니저 직접등록</label>';
    h += '<label style="cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px"><input type="radio" name="r-cert-method-reg" value="auto" /> 회원 자동인증</label>';
    h += '</div></div>';
    h += '<div id="cert-method-area-reg">';

    // 매니저 직접등록
    h += '<div id="cert-area-manager-reg">';
    h += '<table class="data-table" style="font-size:12px"><thead><tr>';
    h += '<th style="width:30px">No</th><th style="width:120px">구분</th><th style="width:100px">발급일자</th><th>발급처</th><th>파일</th>';
    h += '</tr></thead><tbody id="cert-doc-list-reg"></tbody></table>';
    h += '<div style="margin-top:8px;text-align:right"><button class="btn btn--sm" id="btn-add-cert-row" style="font-size:11px;background:#fff;border:1px solid #ccc;color:#333">+ 서류 추가</button></div>';
    h += '</div>';

    // 자동인증
    h += '<div id="cert-area-auto-reg" style="display:none">';
    h += '<div style="padding:20px;background:#f0f9ff;border:1px solid #bae6fd">';
    h += '<div style="font-size:14px;font-weight:600;color:#0369a1;margin-bottom:14px">간편인증 자동발급 (스크래핑 API)</div>';
    h += '<div style="margin-bottom:14px"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">인증수단 선택</label>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    h += '<button class="btn btn--sm cert-auth-btn-reg" data-auth="pass" style="font-size:11px;background:#fff;border:2px solid #6366f1;color:#6366f1;padding:6px 14px;font-weight:600">PASS 인증</button>';
    h += '<button class="btn btn--sm cert-auth-btn-reg" data-auth="kakao" style="font-size:11px;background:#fff;border:2px solid #fbbf24;color:#92400e;padding:6px 14px;font-weight:600">카카오 인증</button>';
    h += '<button class="btn btn--sm cert-auth-btn-reg" data-auth="naver" style="font-size:11px;background:#fff;border:2px solid #16a34a;color:#16a34a;padding:6px 14px;font-weight:600">네이버 인증</button>';
    h += '<button class="btn btn--sm cert-auth-btn-reg" data-auth="toss" style="font-size:11px;background:#fff;border:2px solid #3b82f6;color:#3b82f6;padding:6px 14px;font-weight:600">토스 인증</button>';
    h += '</div></div>';
    h += '<div style="margin-bottom:14px"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">발급 서류 선택</label>';
    h += '<div id="cert-auto-docs-reg" style="display:flex;flex-wrap:wrap;gap:8px"></div></div>';
    h += '<div style="margin-bottom:14px"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">발송수단 선택</label>';
    h += '<div style="display:flex;gap:8px">';
    h += '<label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="r-send-method-reg" value="kakao" checked /> 카카오톡 알림톡</label>';
    h += '<label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="r-send-method-reg" value="sms" /> SMS 문자</label>';
    h += '</div></div>';
    h += '<div style="border-top:1px solid #bae6fd;padding-top:14px;margin-top:14px">';
    h += '<button class="btn btn--primary" id="auto-scraping-btn-reg" style="width:100%;font-size:13px;padding:10px" disabled>인증안내 발송</button>';
    h += '<p style="font-size:10px;color:#64748b;margin-top:6px;text-align:center">회원에게 인증안내가 발송되며, 회원이 인증 완료 시 서류가 자동 발급됩니다.</p>';
    h += '</div>';
    h += '<div id="auto-scraping-progress-reg" style="display:none;margin-top:14px">';
    h += '<div style="margin-bottom:8px;font-size:12px;font-weight:600;color:#0369a1" id="auto-progress-title-reg">인증 진행 중...</div>';
    h += '<div style="width:100%;height:8px;background:#e0f2fe;border-radius:4px;overflow:hidden;margin-bottom:8px"><div id="auto-progress-bar-reg" style="width:0%;height:100%;background:#0369a1;border-radius:4px;transition:width 0.5s"></div></div>';
    h += '<div id="auto-progress-log-reg" style="font-size:11px;color:#475569;max-height:120px;overflow-y:auto"></div>';
    h += '</div>';
    h += '<div id="auto-scraping-result-reg" style="display:none;margin-top:14px"></div>';
    h += '</div></div>';
    h += '</div>';

    Modal.show({
      title: '인증서류 등록',
      size: 'lg',
      content: h
        + '<div style="text-align:right;margin-top:16px"><button class="btn btn--ghost btn--sm" id="cert-cancel-btn" style="margin-right:8px">취소</button>'
        + '<button class="btn btn--primary btn--sm" id="cert-save-btn">저장</button></div>',
    });

    setTimeout(function() {
      // 서류 테이블 렌더링
      var tbody = document.getElementById('cert-doc-list-reg');
      if (tbody) {
        var html = '';
        for (var i = 0; i < docs.length; i++) {
          var d = docs[i];
          html += '<tr data-doc-name="' + d.name + '">'
            + '<td style="text-align:center">' + (i + 1) + '</td>'
            + '<td>' + d.name + '</td>'
            + '<td><input type="date" class="cert-issue-date" style="font-size:11px;width:100%" /></td>'
            + '<td><input type="text" class="cert-issuer" placeholder="예: 대법원" style="font-size:11px;width:100%" /></td>'
            + '<td><input type="file" accept="image/*,.pdf" style="font-size:11px;width:100%" /></td>'
            + '</tr>';
        }
        tbody.innerHTML = html;
        // 기존 저장 상태 표시
        for (var s = 0; s < saved.length; s++) {
          var rows = tbody.querySelectorAll('tr');
          for (var r = 0; r < rows.length; r++) {
            if (rows[r].getAttribute('data-doc-name') === saved[s].name && saved[s].status === 'done') {
              var lastCell = rows[r].cells[rows[r].cells.length - 1];
              if (lastCell) lastCell.innerHTML = '<span class="badge" style="background:#dcfce7;color:#16a34a;font-size:10px;padding:2px 8px">등록완료</span>';
            }
          }
        }
      }

      // 자동인증 서류 목록
      var autoContainer = document.getElementById('cert-auto-docs-reg');
      if (autoContainer) {
        var autoScrapable = ['졸업증명서', '재직증명서', '자격증 사본', '소득증명원', '가족관계증명서', '신분증 사본', '사업자등록증'];
        var autoHtml = '';
        for (var a = 0; a < docs.length; a++) {
          var canAuto = autoScrapable.indexOf(docs[a].name) !== -1;
          autoHtml += '<label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:' + (canAuto ? 'pointer' : 'not-allowed') + ';opacity:' + (canAuto ? '1' : '0.5') + '">';
          autoHtml += '<input type="checkbox" class="auto-doc-chk-reg" value="' + docs[a].name + '"' + (canAuto ? ' checked' : ' disabled') + ' /> ' + docs[a].name;
          autoHtml += '</label>';
        }
        autoContainer.innerHTML = autoHtml;
      }

      // 인증방법 전환
      document.querySelectorAll('input[name="r-cert-method-reg"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
          var mgrArea = document.getElementById('cert-area-manager-reg');
          var autoArea = document.getElementById('cert-area-auto-reg');
          if (this.value === 'manager') {
            if (mgrArea) mgrArea.style.display = 'block';
            if (autoArea) autoArea.style.display = 'none';
          } else {
            if (mgrArea) mgrArea.style.display = 'none';
            if (autoArea) autoArea.style.display = 'block';
          }
        });
      });

      // 인증수단 선택
      document.querySelectorAll('.cert-auth-btn-reg').forEach(function(btn) {
        btn.addEventListener('click', function() {
          selectedAuth = this.dataset.auth;
          document.querySelectorAll('.cert-auth-btn-reg').forEach(function(b) { b.style.background = '#fff'; b.style.fontWeight = '600'; });
          var colors = { pass: '#6366f1', kakao: '#fbbf24', naver: '#16a34a', toss: '#3b82f6' };
          this.style.background = colors[selectedAuth] || '#6366f1';
          this.style.color = '#fff';
          var scrapBtn = document.getElementById('auto-scraping-btn-reg');
          if (scrapBtn) scrapBtn.disabled = false;
        });
      });

      // 자동발급 실행
      var scrapBtn = document.getElementById('auto-scraping-btn-reg');
      if (scrapBtn) scrapBtn.addEventListener('click', function() {
        selectedAutoDocs = [];
        document.querySelectorAll('.auto-doc-chk-reg:checked').forEach(function(chk) { selectedAutoDocs.push(chk.value); });
        if (selectedAutoDocs.length === 0) { Toast.show('발급할 서류를 선택해주세요.', 'warning'); return; }

        scrapBtn.disabled = true;
        scrapBtn.textContent = '발급 진행 중...';
        var progress = document.getElementById('auto-scraping-progress-reg');
        if (progress) progress.style.display = 'block';

        var bar = document.getElementById('auto-progress-bar-reg');
        var title = document.getElementById('auto-progress-title-reg');
        var log = document.getElementById('auto-progress-log-reg');
        var result = document.getElementById('auto-scraping-result-reg');
        var issuers = { '졸업증명서': '학교알리미', '재직증명서': '국민건강보험공단', '자격증 사본': '한국산업인력공단', '소득증명원': '국세청 홈택스', '가족관계증명서': '대법원 전산정보센터', '신분증 사본': '행정안전부', '사업자등록증': '국세청 홈택스' };

        var steps = [
          { pct: 10, title: '인증안내 발송 중...', log: '→ 회원 ' + Formatters.phone(m.phone) + '에 인증안내 발송' },
          { pct: 30, title: '회원 인증 대기 중...', log: '→ 회원 핸드폰에 인증 요청 도착' },
          { pct: 50, title: '본인인증 완료!', log: '→ 인증 토큰 수신 완료' },
          { pct: 60, title: '스크래핑 API 호출 중...', log: '→ 공공기관 시스템 접속 중...' }
        ];
        var docSteps = [];
        for (var di = 0; di < selectedAutoDocs.length; di++) {
          var pct = 60 + Math.round(35 * (di + 1) / selectedAutoDocs.length);
          var issuer = issuers[selectedAutoDocs[di]] || '공공기관';
          docSteps.push({ pct: pct, title: selectedAutoDocs[di] + ' 발급 중...', log: '→ [' + issuer + '] ' + selectedAutoDocs[di] + ' PDF 수신 완료' });
        }
        var allSteps = steps.concat(docSteps);
        allSteps.push({ pct: 100, title: '자동발급 완료!', log: '→ 총 ' + selectedAutoDocs.length + '건 서류 자동 등록 완료' });

        function runStep(idx) {
          if (idx >= allSteps.length) {
            scrapBtn.textContent = '자동발급 완료';
            scrapBtn.style.background = '#16a34a';
            if (result) {
              var rhtml = '<div style="padding:12px;background:#dcfce7;border:1px solid #86efac;border-radius:4px">';
              rhtml += '<div style="font-size:13px;font-weight:700;color:#16a34a;margin-bottom:8px">자동발급 완료</div>';
              var today = new Date().toISOString().substring(0, 10);
              for (var ri = 0; ri < selectedAutoDocs.length; ri++) {
                rhtml += '<div style="font-size:11px;padding:2px 0">- ' + selectedAutoDocs[ri] + ' (' + (issuers[selectedAutoDocs[ri]] || '-') + ') ' + today + '</div>';
              }
              rhtml += '</div>';
              result.style.display = 'block';
              result.innerHTML = rhtml;
            }
            // localStorage 저장
            var existing = [];
            try { existing = JSON.parse(localStorage.getItem(certKey) || '[]'); } catch (e) {}
            var today2 = new Date().toISOString().substring(0, 10);
            for (var sj = 0; sj < selectedAutoDocs.length; sj++) {
              var dn = selectedAutoDocs[sj];
              var found = false;
              for (var sk = 0; sk < existing.length; sk++) {
                if (existing[sk].name === dn) { existing[sk].status = 'done'; existing[sk].date = today2; found = true; break; }
              }
              if (!found) existing.push({ name: dn, status: 'done', method: 'auto', date: today2 });
            }
            try { localStorage.setItem(certKey, JSON.stringify(existing)); } catch (e) {}
            Toast.show(selectedAutoDocs.length + '건 서류가 자동 발급되었습니다!', 'success');
            return;
          }
          var s = allSteps[idx];
          if (bar) bar.style.width = s.pct + '%';
          if (title) title.textContent = s.title;
          if (log) log.innerHTML += '<div style="padding:2px 0">' + s.log + '</div>';
          if (log) log.scrollTop = log.scrollHeight;
          setTimeout(function() { runStep(idx + 1); }, 800 + Math.random() * 600);
        }
        runStep(0);
      });

      // 서류 추가 행
      var addRowBtn = document.getElementById('btn-add-cert-row');
      if (addRowBtn) addRowBtn.addEventListener('click', function() {
        var tbody2 = document.getElementById('cert-doc-list-reg');
        if (!tbody2) return;
        var idx = tbody2.rows.length;
        var row = tbody2.insertRow();
        row.innerHTML = '<td style="text-align:center">' + (idx + 1) + '</td>'
          + '<td><input type="text" placeholder="서류명 입력" style="font-size:11px;width:100%" /></td>'
          + '<td><input type="date" class="cert-issue-date" style="font-size:11px;width:100%" /></td>'
          + '<td><input type="text" class="cert-issuer" placeholder="발급처 입력" style="font-size:11px;width:100%" /></td>'
          + '<td><input type="file" accept="image/*,.pdf" style="font-size:11px;width:100%" /></td>';
      });

      // 취소/저장
      var cancelBtn = document.getElementById('cert-cancel-btn');
      if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

      var saveBtn = document.getElementById('cert-save-btn');
      if (saveBtn) saveBtn.addEventListener('click', function() {
        var tbody3 = document.getElementById('cert-doc-list-reg');
        if (!tbody3) { Modal.hide(); return; }
        var docArr = [];
        var rows = tbody3.querySelectorAll('tr');
        for (var ri = 0; ri < rows.length; ri++) {
          var docName = rows[ri].getAttribute('data-doc-name') || '';
          var fileInput = rows[ri].querySelector('input[type=file]');
          var hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
          docArr.push({ name: docName, status: hasFile ? 'done' : 'pending', method: 'manager', date: hasFile ? new Date().toISOString().substring(0, 10) : null });
        }
        try { localStorage.setItem(certKey, JSON.stringify(docArr)); } catch (e) {}
        Modal.hide();
        Toast.show('서류 인증 정보가 저장되었습니다.', 'success');
      });
    }, 100);
  });
}
