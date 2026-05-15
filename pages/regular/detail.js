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

  // ── 소개 프로필 + 특이사항 (2단) ──
  + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">'
  // 좌: 소개 프로필
  + '  <div class="card" style="margin:0">'
  + '    <div class="card__body" style="padding:0">'
  + '      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--bg-secondary);border-radius:var(--radius-lg) var(--radius-lg) 0 0">'
  + '        <span style="font-size:13px;font-weight:700;color:var(--text-primary)">소개 프로필</span>'
  + '        <button class="btn btn--outline btn--sm" id="btn-edit-intro">' + (m.introProfile ? '수정' : '등록') + '</button>'
  + '      </div>'
  + '      <div style="padding:14px 16px;font-size:13px;line-height:1.7;color:var(--text-primary);min-height:80px">'
  + (m.introProfile ? m.introProfile : '<span style="color:var(--text-muted)">등록된 소개 프로필이 없습니다.</span>')
  + '      </div>'
  + '    </div>'
  + '  </div>'
  // 우: 특이사항
  + '  <div class="card" style="margin:0">'
  + '    <div class="card__body" style="padding:0">'
  + '      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--bg-secondary);border-radius:var(--radius-lg) var(--radius-lg) 0 0">'
  + '        <span style="font-size:13px;font-weight:700;color:var(--text-primary)">특이사항</span>'
  + '        <button class="btn btn--outline btn--sm" id="btn-add-caution">+ 등록</button>'
  + '      </div>'
  + '      <div style="padding:10px 16px;min-height:80px" id="caution-area">'
  + (m.cautionMemo ? '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--bg-secondary);font-size:12px;line-height:1.6"><div style="flex:1;color:var(--text-primary)">' + m.cautionMemo + '</div><button class="btn btn--ghost btn--sm caution-del-btn" style="font-size:10px;padding:1px 6px;color:var(--danger);white-space:nowrap;margin-left:8px">삭제</button></div>' : '<div style="text-align:center;color:var(--text-muted);padding:16px;font-size:12px">등록된 특이사항이 없습니다.</div>')
  + '      </div>'
  + '    </div>'
  + '  </div>'
  + '</div>'

  // ── 히스토리 (접기/펼치기) ──
  + '<div class="card" style="margin-bottom:20px">'
  + '  <div class="card__body" style="padding:0">'
  + '    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--bg-secondary);border-radius:var(--radius-lg) var(--radius-lg) 0 0;cursor:pointer" id="toggle-history">'
  + '      <span style="font-size:13px;font-weight:700;color:var(--text-primary)">히스토리</span>'
  + '      <div style="display:flex;align-items:center;gap:8px">'
  + '        <button class="btn btn--outline btn--sm" id="btn-add-history">+ 등록</button>'
  + '        <span id="toggle-history-icon" style="font-size:12px;color:var(--text-muted)">▼</span>'
  + '      </div>'
  + '    </div>'
  + '    <div id="history-body" style="padding:10px 16px;max-height:500px;overflow-y:auto">'
  + renderHistoryTab(m)
  + '    </div>'
  + '  </div>'
  + '</div>'

  // ── 5탭 구조 ──
  + '<div class="card">'
  + '  <div class="card__header" style="padding-bottom:0;border-bottom:none">'
  + '    <div class="tabs__nav" id="detail-tabs" style="width:100%">'
  + '      <button class="tabs__btn active" data-tab="basic">기본정보</button>'
  + '      <button class="tabs__btn" data-tab="extra">추가정보</button>'
  + '      <button class="tabs__btn" data-tab="payment">결제정보</button>'
  + '      <button class="tabs__btn" data-tab="matching">소개관리</button>'
  + '      <button class="tabs__btn" data-tab="meeting">미팅관리</button>'
  + '    </div>'
  + '  </div>'
  + '  <div class="card__body">'
  + '    <div class="tab-panel active" id="panel-basic">' + renderBasicInfo(m) + '</div>'
  + '    <div class="tab-panel" id="panel-extra">' + renderExtraInfo(m) + '</div>'
  + '    <div class="tab-panel" id="panel-payment">' + renderPayment(m) + '</div>'
  + '    <div class="tab-panel" id="panel-matching">' + renderMatchingInfo(m) + '</div>'
  + '    <div class="tab-panel" id="panel-meeting">' + renderMeetingTab(m) + '</div>'
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
});

// 히스토리 이벤트 바인딩 (상단 카드이므로 즉시 초기화)
initHistoryEvents(m.id);

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



// 접기/펼치기 토글
function setupToggle(toggleId, bodyId, iconId) {
  var toggle = document.getElementById(toggleId);
  if (toggle) toggle.addEventListener('click', function(e) {
    if (e.target.closest('.btn')) return;
    var body = document.getElementById(bodyId);
    var icon = document.getElementById(iconId);
    if (body) {
      var isHidden = body.style.display === 'none';
      body.style.display = isHidden ? 'block' : 'none';
      if (icon) icon.textContent = isHidden ? '▼' : '▶';
    }
  });
}
setupToggle('toggle-history', 'history-body', 'toggle-history-icon');



// 학력 추가
var addEduBtn = document.getElementById('btn-add-edu');
if (addEduBtn) addEduBtn.addEventListener('click', function() {
  var curYear = new Date().getFullYear();
  var yearOpts = '<option value="">선택</option>';
  for (var y = curYear; y >= 1960; y--) yearOpts += '<option>' + y + '</option>';
  Modal.show({
    title: '학력 추가',
    size: 'md',
    content: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">'
      + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">구분 <span style="color:#e53e3e">*</span></label>'
      + '<select class="form-input" id="edu-level" style="width:100%"><option value="">선택</option><option>고등학교</option><option>전문대학교</option><option>대학교</option><option>대학원(석사)</option><option>대학원(박사)</option><option>기타</option><option>유학</option><option>어학연수</option></select></div>'
      + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">학교명 <span style="color:#e53e3e">*</span></label>'
      + '<input type="text" class="form-input" id="edu-school" placeholder="학교명 입력" style="width:100%"></div>'
      + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">전공</label>'
      + '<input type="text" class="form-input" id="edu-major" placeholder="전공" style="width:100%"></div>'
      + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">소재지</label>'
      + '<input type="text" class="form-input" id="edu-location" placeholder="소재지" style="width:100%"></div>'
      + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">졸업여부</label>'
      + '<select class="form-input" id="edu-graduated" style="width:100%"><option>선택</option><option>졸업</option><option>재학</option><option>중퇴</option></select></div>'
      + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">입학년도</label>'
      + '<select class="form-input" id="edu-enter-year" style="width:100%">' + yearOpts + '</select></div>'
      + '<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">졸업년도</label>'
      + '<select class="form-input" id="edu-grad-year" style="width:100%">' + yearOpts + '</select></div>'
      + '</div>'
      + '<div style="text-align:right;margin-top:16px"><button class="btn btn--ghost btn--sm" id="edu-cancel" style="margin-right:8px">취소</button><button class="btn btn--primary btn--sm" id="edu-submit">추가</button></div>',
  });
  setTimeout(function() {
    var cancelBtn = document.getElementById('edu-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });
    var submitBtn = document.getElementById('edu-submit');
    if (submitBtn) submitBtn.addEventListener('click', function() {
      var level = document.getElementById('edu-level').value;
      var school = document.getElementById('edu-school').value.trim();
      if (!level) { Toast.show('구분을 선택해주세요.', 'warning'); return; }
      if (!school) { Toast.show('학교명을 입력해주세요.', 'warning'); return; }
      var major = document.getElementById('edu-major').value.trim() || '-';
      var location = document.getElementById('edu-location').value.trim() || '-';
      var graduated = document.getElementById('edu-graduated').value;
      if (graduated === '선택') graduated = '-';
      var enterYear = document.getElementById('edu-enter-year').value || '-';
      var gradYear = document.getElementById('edu-grad-year').value || '-';
      var levelText = level + ' - ' + school;
      var tbody = document.querySelector('#edu-table tbody');
      if (tbody) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + levelText + '</td><td>' + major + '</td><td>' + location + '</td><td>' + graduated + '</td><td>' + enterYear + '</td><td>' + gradYear + '</td><td style="text-align:center"><button class="btn btn--ghost btn--sm edu-del-btn" style="font-size:10px;padding:1px 4px;color:var(--status-red)">삭제</button></td>';
        tbody.appendChild(tr);
      }
      Modal.hide();
      Toast.show('학력이 추가되었습니다.', 'success');
    });
  }, 100);
});

// 학력삭제 이벤트 위임
document.getElementById('panel-basic').addEventListener('click', function(ev) {
  var eduDelBtn = ev.target.closest('.edu-del-btn');
  if (eduDelBtn) {
    if (confirm('해당 학력을 삭제하시겠습니까?')) {
      eduDelBtn.closest('tr').remove();
      Toast.show('학력이 삭제되었습니다.', 'info');
    }
    return;
  }
});

// 특이사항 등록
var addCautionBtn = document.getElementById('btn-add-caution');
if (addCautionBtn) addCautionBtn.addEventListener('click', function() {
  Modal.show({
    title: '특이사항 등록',
    size: 'md',
    content: '<div style="margin-bottom:12px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">특이사항 메모</label>'
      + '<textarea class="form-input" id="caution-content" rows="4" style="width:100%;font-size:13px;resize:vertical" placeholder="특이사항을 입력하세요..."></textarea></div>'
      + '<div style="text-align:right"><button class="btn btn--primary btn--sm" id="btn-submit-caution">등록</button></div>',
  });
  setTimeout(function() {
    var submitBtn = document.getElementById('btn-submit-caution');
    if (submitBtn) submitBtn.addEventListener('click', function() {
      var content = document.getElementById('caution-content').value.trim();
      if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }
      Modal.hide();
      Toast.show('특이사항이 등록되었습니다.', 'success');
    });
  }, 100);
});

// 특이사항 삭제 이벤트 위임
document.addEventListener('click', function(ev) {
  var cautionDelBtn = ev.target.closest('.caution-del-btn');
  if (cautionDelBtn) {
    if (confirm('특이사항을 삭제하시겠습니까?')) {
      cautionDelBtn.closest('div[style]').remove();
      Toast.show('특이사항이 삭제되었습니다.', 'info');
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
    // 로그인 매니저 정보 (실서비스에서는 세션에서 가져옴)
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
        var selectedCat = document.getElementById('hist-new-cat').value;
        // 매니저 역할에 따라 자동 분류
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
        // 히스토리 영역 전체 리렌더링
        var histBody = document.getElementById('history-body');
        if (histBody) {
          histBody.innerHTML = renderHistoryTab(m);
          initHistoryEvents(m.id);
        }
      });
    }, 100);
  }
});
