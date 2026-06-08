/* ========================================
   정회원 상세 페이지 (4탭 · 1단 레이아웃)
   - 사이드바 없이 새 탭에서 노출
   ======================================== */
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars } from '@mock/regulars.js';
import { renderBasicInfo } from './detail-tab-basic.js';
import { renderExtraInfo } from './detail-tab-extra.js';
import { renderPayment } from './detail-tab-payment.js';
import { renderMatchingInfo } from './detail-tab-matching.js';


import { addHistory } from '@services/history.js';
import { supabase } from '@services/supabase.js';

// 독립 팝업 페이지 (사이드바 없음)

var content = document.getElementById('content');
var params = new URLSearchParams(window.location.search);
var rawId = params.get('id');

// UUID 판별
var isUUID = rawId && rawId.length > 10 && rawId.indexOf('-') > -1;

async function loadMember() {
  try {
    if (isUUID) {
      // Supabase에서 직접 조회
      const { data, error } = await supabase
        .from('regulars')
        .select('*')
        .eq('id', rawId)
        .single();

      if (!error && data) {
        // snake_case → camelCase 변환
        const prefs = typeof data.preferences === 'string' ? JSON.parse(data.preferences || '{}') : (data.preferences || {});
        return {
          id: data.id,
          memberId: data.member_id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          gender: data.gender,
          birthDate: data.birth_date,
          age: data.birth_date ? Formatters.age(data.birth_date) : '',
          brand: data.brand,
          branch: data.branch,
          education: data.education,
          school: data.school,
          job: data.job,
          company: data.company,
          region: data.region,
          religion: data.religion,
          height: data.height,
          weight: data.weight,
          maritalHistory: data.marital_history,
          income: data.income,
          bloodType: data.blood_type,
          smoking: data.smoking,
          drinking: data.drinking,
          position: data.position,
          childCare: data.child_care,
          hometown: data.hometown,
          overseas: data.overseas,
          residenceFlexible: data.residence_flexible,
          jobFlexible: data.job_flexible,
          familyWealth: data.family_wealth,
          personalWealth: data.personal_wealth,
          realEstate: data.real_estate,
          vehicle: data.vehicle,
          program: data.program,
          contractType: data.contract_type,
          contractCount: data.contract_count,
          esignComplete: data.esign_complete,
          programFee: data.program_fee,
          marriageFee: data.marriage_fee,
          rejoinCount: data.rejoin_count,
          rejoinFee: data.rejoin_fee,
          status: data.status,
          consultantManager: data.consultant_manager,
          matchingManager: data.matching_manager,
          meetingCount: data.meeting_count,
          lastMeetingDate: data.last_meeting_date,
          lastContactDate: data.last_contact_date,
          joinDate: data.join_date,
          expiryDate: data.expiry_date,
          expiryStatus: data.expiry_status,
          docReauth: data.doc_reauth,
          marriageConfirm: data.marriage_confirm,
          difficultMatch: data.difficult_match,
          totalContractAmount: data.total_contract_amount,
          paidAmount: data.paid_amount,
          balance: data.balance,
          unpaidReason: data.unpaid_reason,
          matchComment: data.match_comment,
          consultComment: data.consult_comment,
          selfAppeal: data.self_appeal,
          preferAge: prefs.preferAge || '-',
          preferHeight: prefs.preferHeight || '-',
          preferEdu: prefs.preferEdu || '-',
          preferReligion: prefs.preferReligion || '-',
          preferJob: prefs.preferJob || '-',
          preferRegion: prefs.preferRegion || '-',
          preferMarital: prefs.preferMarital || '-',
          preferEtc: prefs.preferEtc || '',
          introProfile: '',
          statusHistory: [],
          payments: [],
          contactLogs: [],
          matchHistory: [],
          photo: [],
        };
      } else {
        console.error('[Regular Detail] Supabase 조회 오류:', error);
      }
    }
  } catch (e) {
    console.error('[Regular Detail] loadMember 오류:', e);
  }
  // Mock 폴백
  var numId = parseInt(rawId) || 1;
  return MockRegulars.find(function(r) { return r.id === numId || String(r.id) === rawId; }) || MockRegulars[0] || { name: '데이터 없음', memberId: '-', status: '-', brand: '-', program: '-', photo: [] };
}

var m = await loadMember();
console.log('[Regular Detail] 로드된 회원:', m?.name);

// ── 소송중 블라인드 처리 (법무팀/admin 제외) ──
const currentUserRole = localStorage.getItem('purples_user_role') || 'admin';
const LEGAL_SAFE_ROLES = ['admin', 'legal', 'director'];
if (m.marriageConfirm === '소송중' && !LEGAL_SAFE_ROLES.includes(currentUserRole)) {
  content.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
      <div style="background:#fff;border:2px solid #dc2626;border-radius:16px;padding:48px;text-align:center;max-width:480px;box-shadow:0 8px 32px rgba(220,38,38,.15)">
        <div style="font-size:48px;margin-bottom:16px">🔒</div>
        <div style="font-size:20px;font-weight:800;color:#dc2626;margin-bottom:12px">법무팀 전담 응대 회원</div>
        <div style="font-size:14px;color:#991b1b;line-height:1.8;margin-bottom:24px">
          해당 회원은 현재 <strong>법무팀 전담 관리</strong> 상태입니다.<br>
          <strong>연락 및 결제 진행을 즉시 중단</strong>하시고,<br>
          법무팀에 문의해 주세요.
        </div>
        <div style="background:#fef2f2;border-radius:8px;padding:12px;font-size:12px;color:#b91c1c;margin-bottom:24px">
          ⚠️ 무단 응대 시 사규에 따라 조치될 수 있습니다.
        </div>
        <button class="btn btn--primary" onclick="history.back()" style="background:#dc2626;border-color:#dc2626">← 목록으로 돌아가기</button>
      </div>
    </div>
  `;
  throw new Error('LEGAL_BLOCK');
}

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



// ── 탭 렌더링 (에러 방지) ──
function safeRender(name, fn) {
  try { var result = fn(); console.log('[Detail] ✅ ' + name + ' 렌더 성공'); return result || ''; }
  catch(e) { console.error('[Detail] ❌ ' + name + ' 렌더 실패:', e); return '<div style="padding:20px;color:#ef4444;font-size:13px">⚠ ' + name + ' 렌더링 오류: ' + (e.message||e) + '</div>'; }
}
var tabBasicHtml = safeRender('기본정보', function(){ return renderBasicInfo(m); });
var tabExtraHtml = safeRender('추가정보', function(){ return renderExtraInfo(m); });
var tabPaymentHtml = safeRender('결제정보', function(){ return renderPayment(m); });
var tabMatchingHtml = safeRender('매칭관리', function(){ return renderMatchingInfo(m); });

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
  + (m.status === '활동' && m.marriageConfirm !== '소송중' ? '            <span style="color:#ef4444;font-size:11px;font-weight:700;border:1px solid #ef4444;padding:1px 6px;border-radius:4px">● 미팅중</span>' : '')
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
  + '      <div style="display:flex;gap:6px;align-items:center">'
  + (m.status === '리콜대기' ? '        <button class="btn btn--sm" id="btn-recall-esign" style="background:#f59e0b;border-color:#f59e0b;color:#fff;font-size:12px;padding:4px 14px;font-weight:700">기간연장 신청서 발송</button>' : '')
  + '        <button class="btn btn--ghost btn--sm" id="btn-leave" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">탈회접수</button>'
  + '        <button class="btn btn--ghost btn--sm" id="btn-sms" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">SMS</button>'
  + '        <button class="btn btn--ghost btn--sm" id="btn-email" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">Email</button>'
  + '        <button class="btn btn--secondary btn--sm" id="btn-claim" style="font-size:12px;padding:4px 14px">클레임등록</button>'
  + '        <button class="btn btn--primary btn--sm" id="btn-edit" style="font-size:12px;padding:4px 14px">수정</button>'
  + '      </div>'
  + '    </div>'
  + '  </div>'
  + '</div>'


  // ── 4탭 구조 ──
  + '<div class="card">'
  + '  <div class="card__header" style="padding-bottom:0;border-bottom:none">'
  + '    <div class="tabs__nav" id="detail-tabs" style="width:100%">'
  + '      <button class="tabs__btn active" data-tab="basic">기본정보</button>'
  + '      <button class="tabs__btn" data-tab="extra">추가정보</button>'
  + '      <button class="tabs__btn" data-tab="payment">결제정보</button>'
  + '      <button class="tabs__btn" data-tab="matching">매칭관리</button>'
  + '    </div>'
  + '  </div>'
  + '  <div class="card__body">'
  + '    <div class="tab-panel active" id="panel-basic">' + tabBasicHtml + '</div>'
  + '    <div class="tab-panel" id="panel-extra">' + tabExtraHtml + '</div>'
  + '    <div class="tab-panel" id="panel-payment">' + tabPaymentHtml + '</div>'
  + '    <div class="tab-panel" id="panel-matching">' + tabMatchingHtml + '</div>'
  + '  </div>'
  + '</div>';

/* ── 탭 전환 ── */

document.getElementById('detail-tabs').addEventListener('click', function(e) {
  var btn = e.target.closest('.tabs__btn');
  if (!btn) return;
  document.querySelectorAll('.tabs__btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
});



/* ── 리콜대기: 기간연장 신청서 발송 (모두싸인 API) ── */
var recallEsignBtn = document.getElementById('btn-recall-esign');
if (recallEsignBtn) {
  recallEsignBtn.addEventListener('click', async function() {
    if (!confirm(m.name + ' 회원에게 기간연장 신청서를 발송하시겠습니까?\n\n모두싸인을 통해 전자서명 요청이 발송됩니다.')) return;
    recallEsignBtn.disabled = true;
    recallEsignBtn.textContent = '발송 중...';
    // Mock API 호출 (실서비스: 모두싸인 REST API)
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

      });
    }, 100);
  }
});

/* ── 변경이력 팝업 (data-history 셀 클릭) ── */
document.addEventListener('click', async function(ev) {
  var cell = ev.target.closest('[data-history]');
  if (!cell) return;
  var category = cell.getAttribute('data-history');
  var allCats = {
    '상태변경': { label: '상태변경', color: '#ef4444' },
    '프로그램': { label: '프로그램', color: '#6366f1' },
    '미팅횟수': { label: '미팅횟수', color: '#f59e0b' },
    '만료일': { label: '만료일', color: '#10b981' },
    '매칭매니저': { label: '매칭매니저', color: '#8b5cf6' },
    '상담매니저': { label: '상담매니저', color: '#06b6d4' },
    '지사': { label: '지사', color: '#64748b' },
  };
  var catInfo = allCats[category] || { label: category, color: '#64748b' };
  var list = (m.statusHistory || []).filter(function(h) {
    return !category || category === '상태변경' || h.content.indexOf(category) > -1;
  });

  function getAttachment(h) {
    var c = (h.content || '').toLowerCase();
    if ((c.indexOf('리콜') > -1 && c.indexOf('서명') > -1) || c.indexOf('기간연장') > -1) {
      return { name: '특별기간연장 신청서', type: 'recall', docId: 'MS-RECALL-' + m.memberId };
    }
    if (c.indexOf('2가입') > -1 || c.indexOf('전환') > -1) {
      return { name: '2가입 계약서', type: 'contract', docId: 'MS-CONTRACT-' + m.memberId };
    }
    return null;
  }

  // 상태변경 카테고리일 때만 수동 변경 폼
  var isStatusChange = (category === '상태변경');
  var statusOptions = [
    '신규', '인증중', '활동대기', '활동',
    '임시교제', '교제', '외부교제',
    '약정보류', '임시보류', '장기보류', '강제보류',
    '약정만료', '자동만료', '만료',
    '리콜대기', '리콜',
    '탈회진행', '탈회'
  ];
  var statusForm = '';
  if (isStatusChange) {
    statusForm = ''
      + '<div style="margin-bottom:16px;padding:0">'
      + '<table style="width:100%;border-collapse:collapse;font-size:12px"><tbody>'
      + '<tr>'
      + '<td style="padding:6px 10px;background:#f8f9fa;font-weight:600;width:90px;border:1px solid var(--border-light)">회원상태</td>'
      + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><select class="form-input" id="status-change-select" style="width:200px;font-size:12px;padding:3px 8px">' + statusOptions.map(function(s) { return '<option' + (s === m.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td>'
      + '</tr>'
      + '<tr>'
      + '<td style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">예약날짜</td>'
      + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><div style="display:flex;gap:6px;align-items:center"><input type="date" class="form-input" id="status-date-from" style="font-size:12px;padding:3px 8px"> <span>~</span> <input type="date" class="form-input" id="status-date-to" style="font-size:12px;padding:3px 8px"></div><div style="font-size:10px;color:var(--text-muted);margin-top:4px">※ 보류/교제로 변경시 입력 (연장기한 Or 다음 컨텍일)</div></td>'
      + '</tr>'
      + '<tr>'
      + '<td style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">변경사유</td>'
      + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><div style="display:flex;gap:8px"><input type="text" class="form-input" id="status-change-reason" placeholder="변경 사유를 입력하세요" style="flex:1;font-size:12px;padding:3px 8px"><button class="btn btn--primary btn--sm" id="btn-status-change-confirm" style="font-size:12px;padding:4px 16px;white-space:nowrap">확인</button></div></td>'
      + '</tr>'
      + '</tbody></table>'
      + '</div>';
  }

  // 첨부서류 컬럼 포함 이력 테이블
  var rows = list.length > 0
    ? list.slice(0, 20).map(function(h) {
        var att = getAttachment(h);
        var attHtml = att
          ? '<a href="#" class="att-view" data-doc-id="' + att.docId + '" data-doc-name="' + att.name + '" data-doc-type="' + att.type + '" style="color:#3b82f6;text-decoration:none;font-weight:600;font-size:11px">[첨부서류 다운로드]</a>'
          : '<span style="color:var(--text-muted)">—</span>';
        return '<tr>'
          + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;white-space:nowrap">' + Formatters.date(h.date) + '</td>'
          + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px">' + (h.content || '-') + '</td>'
          + (isStatusChange ? '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.reserveDate || '-') + '</td>' : '')
          + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px">' + (h.detail || '-') + '</td>'
          + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.processor || '-') + '</td>'
          + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + attHtml + '</td>'
          + '</tr>';
      }).join('')
    : '<tr><td colspan="' + (isStatusChange ? '6' : '5') + '" style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px">변경 이력이 없습니다.</td></tr>';

  Modal.show({
    title: '<span style="color:' + catInfo.color + ';font-weight:700">' + catInfo.label + '</span> 변경이력',
    size: 'xl',
    content: statusForm
      + '<div style="max-height:' + (isStatusChange ? '380px' : '450px') + ';overflow-y:auto">'
      + '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;border-collapse:collapse"><thead><tr>'
      + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경일</th>'
      + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">' + (isStatusChange ? '변경사유' : '내용') + '</th>'
      + (isStatusChange ? '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">예약일</th>' : '')
      + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경전→변경후</th>'
      + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">매니저</th>'
      + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px;width:24%">첨부</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table></div>',
  });

  // 상태 변경 확인 이벤트
  setTimeout(function() {
    var confirmBtn = document.getElementById('btn-status-change-confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        var newStatus = document.getElementById('status-change-select').value;
        var reason = document.getElementById('status-change-reason').value.trim();
        if (!reason) { Toast.show('변경 사유를 입력해주세요.', 'warning'); return; }
        if (newStatus === m.status) { Toast.show('현재 상태와 동일합니다.', 'warning'); return; }
        var oldStatus = m.status;
        m.status = newStatus;
        addHistory({ memberId: m.id, category: '상태변경', content: reason, detail: oldStatus + '→' + newStatus, processor: m.consultantManager || '시스템', date: new Date().toISOString() });
        var badgeArea = document.querySelector('.badge.badge--green, .badge.badge--amber, .badge.badge--blue, .badge.badge--red, .badge.badge--orange, .badge.badge--pink');
        if (badgeArea) badgeArea.outerHTML = Formatters.statusBadge(newStatus, 'regular');
        Modal.hide();
        Toast.show('회원 상태가 ' + newStatus + '(으)로 변경되었습니다.', 'success');
      });
    }

    // 첨부서류 다운로드 미리보기 모달
    var modal = document.getElementById('modal-root');
    if (modal) {
      modal.addEventListener('click', function(e) {
        var attLink = e.target.closest('.att-view');
        if (!attLink) return;
        e.preventDefault();
        var docName = attLink.dataset.docName;
        var docId = attLink.dataset.docId;
        var docType = attLink.dataset.docType;
        var previewContent = '';
        if (docType === 'recall') {
          previewContent = '<div style="padding:24px;border:1px solid var(--border-light);border-radius:8px;background:#fefce8">'
            + '<div style="text-align:center;margin-bottom:20px"><div style="font-size:18px;font-weight:800;color:#92400e">특별기간연장 신청서</div><div style="font-size:12px;color:#a16207;margin-top:4px">PURPLES 매칭 서비스</div></div>'
            + '<table style="width:100%;font-size:12px;border-collapse:collapse"><tbody>'
            + '<tr><td style="padding:6px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;width:30%">회원명</td><td style="padding:6px;border:1px solid #e5e7eb">' + m.name + '</td></tr>'
            + '<tr><td style="padding:6px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600">회원번호</td><td style="padding:6px;border:1px solid #e5e7eb">' + m.memberId + '</td></tr>'
            + '<tr><td style="padding:6px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600">프로그램</td><td style="padding:6px;border:1px solid #e5e7eb">' + m.program + '</td></tr>'
            + '<tr><td style="padding:6px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600">브랜드</td><td style="padding:6px;border:1px solid #e5e7eb">' + m.brand + '</td></tr>'
            + '<tr><td style="padding:6px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600">만료일</td><td style="padding:6px;border:1px solid #e5e7eb">' + (m.expiryDate ? Formatters.date(m.expiryDate) : '-') + '</td></tr>'
            + '</tbody></table>'
            + '<div style="margin-top:16px;padding:12px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;font-size:11px;line-height:1.8;color:#374151">본인은 상기 내용을 확인하였으며, 특별기간연장 서비스에 동의합니다.</div>'
            + '<div style="margin-top:16px;text-align:right"><span style="background:#dcfce7;color:#166534;padding:4px 12px;border-radius:4px;font-size:11px;font-weight:700">✅ 서명 완료</span></div>'
            + '</div>';
        } else {
          previewContent = '<div style="padding:24px;border:1px solid var(--border-light);border-radius:8px;background:#eff6ff">'
            + '<div style="text-align:center;margin-bottom:20px"><div style="font-size:18px;font-weight:800;color:#1e40af">2가입 계약서</div><div style="font-size:12px;color:#3b82f6;margin-top:4px">PURPLES 매칭 서비스</div></div>'
            + '<table style="width:100%;font-size:12px;border-collapse:collapse"><tbody>'
            + '<tr><td style="padding:6px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;width:30%">회원명</td><td style="padding:6px;border:1px solid #e5e7eb">' + m.name + '</td></tr>'
            + '<tr><td style="padding:6px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600">회원번호</td><td style="padding:6px;border:1px solid #e5e7eb">' + m.memberId + '</td></tr>'
            + '<tr><td style="padding:6px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600">프로그램</td><td style="padding:6px;border:1px solid #e5e7eb">' + m.program + '</td></tr>'
            + '</tbody></table>'
            + '<div style="margin-top:16px;text-align:right"><span style="background:#dcfce7;color:#166534;padding:4px 12px;border-radius:4px;font-size:11px;font-weight:700">✅ 서명 완료</span></div>'
            + '</div>';
        }

        Modal.show({
          title: '📄 ' + docName + ' — 미리보기',
          size: 'xl',
          content: previewContent
            + '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">'
            + '<button class="btn btn--ghost btn--sm" onclick="Toast.show(\'모두싸인 문서 뷰어로 이동합니다.\', \'info\')">모두싸인에서 보기</button>'
            + '<button class="btn btn--primary btn--sm" onclick="Toast.show(\'PDF 다운로드를 시작합니다.\', \'success\')">다운로드 (PDF)</button></div>',
        });
      });
    }
  }, 100);
});
