/* ========================================
   정회원 상세 페이지 (6탭 · 1단 레이아웃)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars } from '@mock/regulars.js';
import { renderBasicInfo } from './detail-tab-basic.js';
import { renderExtraInfo } from './detail-tab-extra.js';
import { renderPayment } from './detail-tab-payment.js';
import { renderMatchingInfo } from './detail-tab-matching.js';
import { renderMeetingTab } from './detail-tab-meeting.js';
import { renderHistoryTab, initHistoryEvents } from './detail-tab-history.js';
import { addHistory, HISTORY_CATEGORIES } from '@services/history.js';

// Toast를 전역에 노출 (히스토리 탭에서 참조)
window.__Toast = Toast;

initLayout({ pageId: 'regular-detail', breadcrumbs: ['정회원 관리', '정회원 상세'] });

var content = document.getElementById('content');
var params = new URLSearchParams(window.location.search);
var memberId = parseInt(params.get('id')) || 1;
var m = MockRegulars.find(function(r) { return r.id === memberId; }) || MockRegulars[0];

// 프로필 사진
var photos = Array.isArray(m.photo) ? m.photo : (m.photo ? [m.photo] : []);
var photoHtml = '';
if (photos.length > 0) {
  photoHtml = '<img src="' + photos[0] + '" style="width:64px;height:80px;border-radius:6px;object-fit:cover;border:1px solid var(--border-light);cursor:pointer" id="header-photo">';
} else {
  photoHtml = '<div style="width:64px;height:80px;border-radius:6px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--text-muted);border:1px dashed var(--border-light);cursor:pointer" id="header-photo">사진</div>';
}

// 만료 D-day 계산
var dDay = '';
if (m.expiryDate) {
  var diff = Math.ceil((new Date(m.expiryDate) - new Date()) / 86400000);
  if (diff > 0) {
    dDay = 'D-' + diff;
  } else if (diff === 0) {
    dDay = 'D-Day';
  } else {
    dDay = 'D+' + Math.abs(diff);
  }
}

// 전체 HTML
content.innerHTML = ''
  // ── 헤더: 사진 + 이름/ID + 뱃지 + 버튼 ──
  + '<div class="card" style="margin-bottom:20px">'
  + '  <div class="card__body" style="padding:14px 20px">'
  + '    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">'
  // 왼쪽: 사진 + 이름 + 뱃지
  + '      <div style="display:flex;align-items:center;gap:14px">'
  + '        <div style="flex-shrink:0;cursor:pointer" id="btn-photo-more">'
  + photoHtml
  + '        </div>'
  + '        <div>'
  + '          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">'
  + '            <h2 style="font-size:var(--font-size-lg);font-weight:700;margin:0">' + m.name + '</h2>'
  + '            <span style="color:var(--text-muted);font-size:var(--font-size-sm)">' + m.memberId + '</span>'
  + '          </div>'
  + '          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
  + '            ' + Formatters.statusBadge(m.status, 'regular')
  + '            <span class="badge badge--purple">' + m.brand + '</span>'
  + '            <span class="badge badge--blue">' + m.program + '</span>'
  + (dDay ? '            <span class="badge badge--' + (dDay.startsWith('D+') ? 'red' : 'green') + '">만료 ' + dDay + '</span>' : '')
  + (m.noEvent ? '            <span class="badge badge--red">이벤트불가</span>' : '')
  + (m.noRejoin ? '            <span class="badge badge--red">재가입불가</span>' : '')
  + (m.difficultMatch ? '            <span class="badge badge--orange">난매칭</span>' : '')
  + (m.specialMember ? '            <span class="badge badge--gold">특별회원</span>' : '')
  + '          </div>'
  + '        </div>'
  + '      </div>'
  // 오른쪽: 액션 버튼
  + '      <div style="display:flex;gap:8px">'
  + '        <button class="btn btn--primary btn--sm" id="btn-edit">수정</button>'
  + '        <button class="btn btn--ghost btn--sm" id="btn-sms">SMS</button>'
  + '        <button class="btn btn--ghost btn--sm" id="btn-email">Email</button>'
  + '        <button class="btn btn--secondary btn--sm" id="btn-claim">클레임등록</button>'
  + '        <button class="btn btn--danger btn--sm" id="btn-leave">탈회접수</button>'
  + '      </div>'
  + '    </div>'
  + '  </div>'
  + '</div>'

  // ── 소개 프로필 ──
  + '<div class="card" style="margin-bottom:20px">'
  + '  <div class="card__body" style="padding:0">'
  + '    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--bg-secondary);border-radius:var(--radius-lg) var(--radius-lg) 0 0">'
  + '      <span style="font-size:13px;font-weight:700;color:var(--text-primary)">📋 소개 프로필</span>'
  + '      <button class="btn btn--primary btn--sm" id="btn-edit-intro">' + (m.introProfile ? '수정' : '등록') + '</button>'
  + '    </div>'
  + '    <div style="padding:14px 16px;font-size:13px;line-height:1.7;color:var(--text-primary);min-height:40px">'
  + (m.introProfile ? m.introProfile : '<span style="color:var(--text-muted)">등록된 소개 프로필이 없습니다.</span>')
  + '    </div>'
  + '  </div>'
  + '</div>'

  // ── 6탭 구조 ──
  + '<div class="card">'
  + '  <div class="card__header" style="padding-bottom:0;border-bottom:none">'
  + '    <div class="tabs__nav" id="detail-tabs" style="width:100%">'
  + '      <button class="tabs__btn active" data-tab="basic">기본정보</button>'
  + '      <button class="tabs__btn" data-tab="extra">추가정보</button>'
  + '      <button class="tabs__btn" data-tab="payment">결제정보</button>'
  + '      <button class="tabs__btn" data-tab="matching">소개관리</button>'
  + '      <button class="tabs__btn" data-tab="meeting">미팅관리</button>'
  + '      <button class="tabs__btn" data-tab="history">히스토리</button>'
  + '    </div>'
  + '  </div>'
  + '  <div class="card__body">'
  + '    <div class="tab-panel active" id="panel-basic">' + renderBasicInfo(m) + '</div>'
  + '    <div class="tab-panel" id="panel-extra">' + renderExtraInfo(m) + '</div>'
  + '    <div class="tab-panel" id="panel-payment">' + renderPayment(m) + '</div>'
  + '    <div class="tab-panel" id="panel-matching">' + renderMatchingInfo(m) + '</div>'
  + '    <div class="tab-panel" id="panel-meeting">' + renderMeetingTab(m) + '</div>'
  + '    <div class="tab-panel" id="panel-history">' + renderHistoryTab(m) + '</div>'
  + '  </div>'
  + '</div>';

/* ── 탭 전환 ── */
var historyInitialized = false;
document.getElementById('detail-tabs').addEventListener('click', function(e) {
  var btn = e.target.closest('.tabs__btn');
  if (!btn) return;
  document.querySelectorAll('.tabs__btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  // 히스토리 탭 최초 진입 시 이벤트 바인딩
  if (btn.dataset.tab === 'history' && !historyInitialized) {
    historyInitialized = true;
    initHistoryEvents(m.id);
  }
});

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
  var modal = document.getElementById('modal-root');

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

/* ── 변경내역 모달 ── */
function showChangeHistory(title, entries) {
  Modal.show({
    title: title + ' 변경내역',
    size: 'md',
    content: '<table class="data-table data-table--bordered" style="font-size:12px"><thead><tr><th>변경일</th><th>이전</th><th>변경후</th><th>변경사유</th><th>처리자</th></tr></thead><tbody>'
      + entries.map(function(e) {
        return '<tr><td>' + Formatters.date(e.date) + '</td><td>' + e.from + '</td><td>' + e.to + '</td><td>' + (e.reason || '-') + '</td><td>' + e.processor + '</td></tr>';
      }).join('')
      + '</tbody></table>',
  });
}

// 변경내역 링크 이벤트
var branchHistBtn = document.getElementById('btn-branch-hist');
if (branchHistBtn) branchHistBtn.addEventListener('click', function(e) {
  e.preventDefault();
  showChangeHistory('지사', [
    { date: m.joinDate, from: '-', to: m.branch, reason: '최초등록', processor: '시스템' },
  ]);
});

var pgmHistBtn = document.getElementById('btn-pgm-hist');
if (pgmHistBtn) pgmHistBtn.addEventListener('click', function(e) {
  e.preventDefault();
  showChangeHistory('프로그램', [
    { date: m.joinDate, from: '-', to: m.program, reason: '최초등록', processor: m.consultantManager },
  ]);
});

var consultHistBtn = document.getElementById('btn-consult-hist');
if (consultHistBtn) consultHistBtn.addEventListener('click', function(e) {
  e.preventDefault();
  showChangeHistory('상담매니저', [
    { date: m.joinDate, from: '-', to: m.consultantManager, reason: '최초배정', processor: '시스템' },
  ]);
});

var matchHistBtn = document.getElementById('btn-match-hist');
if (matchHistBtn) matchHistBtn.addEventListener('click', function(e) {
  e.preventDefault();
  showChangeHistory('매칭매니저', [
    { date: m.joinDate, from: '-', to: m.matchingManager, reason: '최초배정', processor: '시스템' },
  ]);
});

var expiryHistBtn = document.getElementById('btn-expiry-hist');
if (expiryHistBtn) expiryHistBtn.addEventListener('click', function(e) {
  e.preventDefault();
  var expiryHistory = [
    { date: m.joinDate, from: '-', to: m.expiryDate ? Formatters.date(m.expiryDate) : '-', reason: '최초등록', processor: '시스템' },
  ];
  Modal.show({
    title: '만료일 변경 / 내역',
    size: 'lg',
    content: '<div style="margin-bottom:20px;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md)">'
      + '<div style="font-size:13px;font-weight:700;margin-bottom:12px">만료일 변경</div>'
      + '<div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">'
      + '<div style="flex:1;min-width:130px"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">현재 만료일</label><input type="text" class="form-input" value="' + (m.expiryDate ? Formatters.date(m.expiryDate) : '-') + '" disabled style="font-size:13px;background:var(--bg-primary)"></div>'
      + '<div style="flex:1;min-width:130px"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">변경 만료일</label><input type="date" class="form-input" id="new-expiry-date" style="font-size:13px"></div>'
      + '<div style="flex:2;min-width:200px"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">변경 사유</label><input type="text" class="form-input" id="expiry-reason" placeholder="변경 사유를 입력하세요" style="font-size:13px"></div>'
      + '<button class="btn btn--primary btn--sm" id="btn-change-expiry" style="height:36px">변경</button>'
      + '</div></div>'
      + '<div style="font-size:13px;font-weight:700;margin-bottom:12px">변경내역</div>'
      + '<table class="data-table data-table--bordered" style="font-size:12px"><thead><tr><th>변경일</th><th>이전</th><th>변경후</th><th>변경사유</th><th>처리자</th></tr></thead><tbody>'
      + expiryHistory.map(function(e) {
          return '<tr><td>' + Formatters.date(e.date) + '</td><td>' + e.from + '</td><td>' + e.to + '</td><td>' + (e.reason || '-') + '</td><td>' + e.processor + '</td></tr>';
        }).join('')
      + '</tbody></table>',
  });
  setTimeout(function() {
    var changeBtn = document.getElementById('btn-change-expiry');
    if (changeBtn) changeBtn.addEventListener('click', function() {
      var newDate = document.getElementById('new-expiry-date').value;
      var reason = document.getElementById('expiry-reason').value.trim();
      if (!newDate) { Toast.show('변경 만료일을 선택해주세요.', 'warning'); return; }
      if (!reason) { Toast.show('변경 사유를 입력해주세요.', 'warning'); return; }
      Modal.hide();
      Toast.show('만료일이 변경되었습니다.', 'success');
    });
  }, 100);
});

/* ── 기타 버튼 이벤트 ── */
var editBtn = document.getElementById('btn-edit');
if (editBtn) editBtn.addEventListener('click', function() {
  var panel = document.getElementById('panel-basic');
  var isEditing = editBtn.dataset.editing === 'true';
  if (!isEditing) {
    // 읽기 → 편집모드
    editBtn.dataset.editing = 'true';
    editBtn.textContent = '저장';
    editBtn.insertAdjacentHTML('afterend', ' <button class="btn btn--ghost btn--sm" id="btn-edit-cancel">취소</button>');
    panel.querySelectorAll('td[data-editable]').forEach(function(td) {
      var val = td.textContent.trim();
      var field = td.dataset.editable;
      td.dataset.original = val;
      td.innerHTML = '<input type="text" class="form-input" value="' + val + '" data-field="' + field + '" style="font-size:12px;padding:4px 8px;width:100%">';
    });
    Toast.show('편집모드가 활성화되었습니다.', 'info');
  } else {
    // 편집모드 → 저장
    editBtn.dataset.editing = 'false';
    editBtn.textContent = '수정';
    var cancelBtn = document.getElementById('btn-edit-cancel');
    if (cancelBtn) cancelBtn.remove();
    panel.querySelectorAll('td[data-editable] input').forEach(function(input) {
      input.closest('td').textContent = input.value;
    });
    Toast.show('회원정보가 저장되었습니다.', 'success');
  }
});
document.addEventListener('click', function(ev) {
  if (ev.target.id === 'btn-edit-cancel') {
    editBtn.dataset.editing = 'false';
    editBtn.textContent = '수정';
    ev.target.remove();
    document.getElementById('panel-basic').querySelectorAll('td[data-editable]').forEach(function(td) {
      td.textContent = td.dataset.original || '';
    });
    Toast.show('편집이 취소되었습니다.', 'info');
  }
});

var smsBtn = document.getElementById('btn-sms');
if (smsBtn) smsBtn.addEventListener('click', function() { Toast.show('SMS 발송 화면으로 이동합니다.', 'info'); });

var emailBtn = document.getElementById('btn-email');
if (emailBtn) emailBtn.addEventListener('click', function() { Toast.show('Email 발송 화면으로 이동합니다.', 'info'); });

var claimBtn = document.getElementById('btn-claim');
if (claimBtn) claimBtn.addEventListener('click', function() { Toast.show('클레임 등록 모달을 엽니다.', 'info'); });

var leaveBtn = document.getElementById('btn-leave');
if (leaveBtn) leaveBtn.addEventListener('click', function() { Toast.show('탈회 접수 프로세스를 시작합니다.', 'warning'); });

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
  // 실매출액 자동계산
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
  // 등록
  var submitPayBtn = document.getElementById('btn-submit-payment');
  if (submitPayBtn) submitPayBtn.addEventListener('click', function() {
    var amt = document.getElementById('pay-amount').value;
    if (!amt || parseInt(amt) <= 0) { Toast.show('금액을 입력하세요.', 'error'); return; }
    Toast.show('매출이 등록되었습니다.', 'success');
    Modal.close();
  });
});

function openCommentModal(type) {
  Modal.show({
    title: type + '매니저 의견 등록',
    size: 'md',
    content: '<div style="margin-bottom:12px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">내용</label>'
      + '<textarea class="form-input" id="comment-content" rows="5" style="width:100%;font-size:13px;resize:vertical" placeholder="의견을 입력하세요..."></textarea></div>'
      + '<div style="text-align:right"><button class="btn btn--primary btn--sm" id="btn-submit-comment">등록</button></div>',
  });
  setTimeout(function() {
    var submitBtn = document.getElementById('btn-submit-comment');
    if (submitBtn) submitBtn.addEventListener('click', function() {
      var content = document.getElementById('comment-content').value.trim();
      if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }
      Modal.hide();
      Toast.show(type + '매니저 의견이 등록되었습니다.', 'success');
    });
  }, 100);
}

var addMatchCommentBtn = document.getElementById('btn-add-match-comment');
if (addMatchCommentBtn) addMatchCommentBtn.addEventListener('click', function() { openCommentModal('매칭'); });

var addConsultCommentBtn = document.getElementById('btn-add-consult-comment');
if (addConsultCommentBtn) addConsultCommentBtn.addEventListener('click', function() { openCommentModal('상담'); });

// 유의사항 등록
var addCautionBtn = document.getElementById('btn-add-caution');
if (addCautionBtn) addCautionBtn.addEventListener('click', function() {
  Modal.show({
    title: '유의사항 등록',
    size: 'md',
    content: '<div style="margin-bottom:14px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:8px">구분</label>'
      + '<div style="display:flex;gap:16px;flex-wrap:wrap">'
      + '<label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="checkbox" id="chk-no-event"' + (m.noEvent ? ' checked' : '') + '> 이벤트불가</label>'
      + '<label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="checkbox" id="chk-no-rejoin"' + (m.noRejoin ? ' checked' : '') + '> 재가입불가</label>'
      + '<label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="checkbox" id="chk-difficult"' + (m.difficultMatch ? ' checked' : '') + '> 난매칭</label>'
      + '<label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="checkbox" id="chk-special"' + (m.specialMember ? ' checked' : '') + '> 특별회원</label>'
      + '</div></div>'
      + '<div style="margin-bottom:12px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">유의사항 메모</label>'
      + '<textarea class="form-input" id="caution-content" rows="4" style="width:100%;font-size:13px;resize:vertical" placeholder="유의사항을 입력하세요..."></textarea></div>'
      + '<div style="text-align:right"><button class="btn btn--primary btn--sm" id="btn-submit-caution">등록</button></div>',
  });
  setTimeout(function() {
    var submitBtn = document.getElementById('btn-submit-caution');
    if (submitBtn) submitBtn.addEventListener('click', function() {
      var content = document.getElementById('caution-content').value.trim();
      if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }
      Modal.hide();
      Toast.show('유의사항이 등록되었습니다.', 'success');
    });
  }, 100);
});

// 의견·유의사항 수정/삭제 이벤트 위임
document.getElementById('panel-basic').addEventListener('click', function(ev) {
  var editBtn = ev.target.closest('.comment-edit-btn');
  if (editBtn) {
    var type = editBtn.dataset.type;
    var oldContent = editBtn.dataset.content || '';
    Modal.show({
      title: type + '매니저 의견 수정',
      size: 'md',
      content: '<div style="margin-bottom:12px">'
        + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">내용</label>'
        + '<textarea class="form-input" id="edit-comment-content" rows="5" style="width:100%;font-size:13px;resize:vertical">' + oldContent + '</textarea></div>'
        + '<div style="text-align:right"><button class="btn btn--primary btn--sm" id="btn-update-comment">수정</button></div>',
    });
    setTimeout(function() {
      var updateBtn = document.getElementById('btn-update-comment');
      if (updateBtn) updateBtn.addEventListener('click', function() {
        var content = document.getElementById('edit-comment-content').value.trim();
        if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }
        Modal.hide();
        Toast.show(type + '매니저 의견이 수정되었습니다.', 'success');
      });
    }, 100);
  }
  var delBtn = ev.target.closest('.comment-del-btn');
  if (delBtn) {
    var type = delBtn.dataset.type;
    if (confirm(type + '매니저 의견을 삭제하시겠습니까?')) {
      Toast.show(type + '매니저 의견이 삭제되었습니다.', 'info');
    }
  }
  // 유의사항 수정
  var cautionEditBtn = ev.target.closest('.caution-edit-btn');
  if (cautionEditBtn) {
    var oldC = cautionEditBtn.dataset.content || '';
    Modal.show({
      title: '유의사항 수정',
      size: 'md',
      content: '<div style="margin-bottom:12px">'
        + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">내용</label>'
        + '<textarea class="form-input" id="edit-caution-content" rows="4" style="width:100%;font-size:13px;resize:vertical">' + oldC + '</textarea></div>'
        + '<div style="text-align:right"><button class="btn btn--primary btn--sm" id="btn-update-caution">수정</button></div>',
    });
    setTimeout(function() {
      var updateBtn = document.getElementById('btn-update-caution');
      if (updateBtn) updateBtn.addEventListener('click', function() {
        var content = document.getElementById('edit-caution-content').value.trim();
        if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }
        Modal.hide();
        Toast.show('유의사항이 수정되었습니다.', 'success');
      });
    }, 100);
  }
  // 유의사항 삭제
  var cautionDelBtn = ev.target.closest('.caution-del-btn');
  if (cautionDelBtn) {
    if (confirm('유의사항을 삭제하시겠습니까?')) {
      Toast.show('유의사항이 삭제되었습니다.', 'info');
    }
  }
});

var saveExtraBtn = document.getElementById('btn-save-extra');
if (saveExtraBtn) saveExtraBtn.addEventListener('click', function() { Toast.show('추가정보가 저장되었습니다.', 'success'); });

var addLogBtn = document.getElementById('btn-add-log');
if (addLogBtn) addLogBtn.addEventListener('click', function() { Toast.show('컨텍 로그 추가 모달을 엽니다.', 'info'); });

/* ── 히스토리 등록 모달 (이벤트 위임) ── */
document.addEventListener('click', function(ev) {
  if (ev.target.id === 'btn-add-history') {
    var catOpts = Object.keys(HISTORY_CATEGORIES).map(function(cat) {
      var info = HISTORY_CATEGORIES[cat];
      return '<option value="' + cat + '">' + cat + '</option>';
    }).join('');
    Modal.show({
      title: '히스토리 등록',
      size: 'lg',
      content: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">'
        + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">카테고리</label>'
        + '<select class="form-input" id="hist-new-cat" style="width:100%">' + catOpts + '</select></div>'
        + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">일시</label>'
        + '<input type="datetime-local" class="form-input" id="hist-new-date" style="width:100%" value="' + new Date().toISOString().substring(0,16) + '"></div>'
        + '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">내용</label>'
        + '<input type="text" class="form-input" id="hist-new-content" placeholder="히스토리 내용을 입력하세요..." style="width:100%"></div>'
        + '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">상세 (선택)</label>'
        + '<textarea class="form-input" id="hist-new-detail" rows="3" style="width:100%;resize:vertical;font-size:13px" placeholder="상세 내용..."></textarea></div>'
        + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">담당자</label>'
        + '<input type="text" class="form-input" id="hist-new-processor" value="' + (m.consultantManager || '') + '" style="width:100%"></div>'
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
        addHistory({
          memberId: m.id,
          category: document.getElementById('hist-new-cat').value,
          content: content,
          detail: document.getElementById('hist-new-detail').value.trim(),
          processor: document.getElementById('hist-new-processor').value.trim() || '시스템',
          date: new Date(document.getElementById('hist-new-date').value).toISOString(),
        });
        Modal.hide();
        Toast.show('히스토리가 등록되었습니다.', 'success');
        // 히스토리 탭 새로고침
        if (historyInitialized) {
          var histEvents = initHistoryEvents(m.id);
          if (histEvents && histEvents.refreshTimeline) histEvents.refreshTimeline();
        }
      });
    }, 100);
  }
});
