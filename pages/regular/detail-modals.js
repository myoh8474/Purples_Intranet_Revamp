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
        var notesList = document.getElementById('notes-list');
        if (notesList) {
          var emptyMsg = notesList.querySelector('div[style*="text-align:center"]');
          if (emptyMsg) emptyMsg.remove();
          var colors = { '상담': { bg: '#fffbeb', border: '#fcd34d', icon: '📌', color: '#92400e' }, '매칭': { bg: '#f0f9ff', border: '#93c5fd', icon: '📋', color: '#1e40af' }, '주의': { bg: '#fef2f2', border: '#fca5a5', icon: '⚠️', color: '#991b1b' }, '기타': { bg: '#f5f3ff', border: '#c4b5fd', icon: '📝', color: '#5b21b6' } };
          var c = colors[type] || colors['기타'];
          var today = new Date().toISOString().split('T')[0];
          notesList.insertAdjacentHTML('afterbegin', '<div style="padding:8px 10px;background:' + c.bg + ';border:1px solid ' + c.border + ';margin-bottom:6px;border-radius:4px;font-size:12px;line-height:1.6">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
            + '  <span style="font-weight:700;color:' + c.color + '">' + c.icon + ' ' + type + '메모</span>'
            + '  <span style="font-size:10px;color:' + c.color + '">' + today + '</span>'
            + '</div>' + content + '</div>');
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
}
