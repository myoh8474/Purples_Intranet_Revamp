/* ========================================
   상세페이지 버튼 이벤트 바인딩
   — 수정/SMS/Email/탈회/학력/특이사항/토글
   ======================================== */
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';

/**
 * 기본 버튼 이벤트 바인딩
 * @param {Object} m - 회원 데이터
 */
export function bindEvents(m) {

  /* ── 수정 버튼 (편집/저장 토글) ── */
  var editBtn = document.getElementById('btn-edit');
  if (editBtn) editBtn.addEventListener('click', function() {
    var panel = document.getElementById('panel-basic');
    var isEditing = editBtn.dataset.editing === 'true';
    if (!isEditing) {
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

  /* ── 간단 버튼 이벤트 ── */
  var smsBtn = document.getElementById('btn-sms');
  if (smsBtn) smsBtn.addEventListener('click', function() { Toast.show('SMS 발송 화면으로 이동합니다.', 'info'); });

  var emailBtn = document.getElementById('btn-email');
  if (emailBtn) emailBtn.addEventListener('click', function() { Toast.show('Email 발송 화면으로 이동합니다.', 'info'); });

  var claimBtn = document.getElementById('btn-claim');
  if (claimBtn) claimBtn.addEventListener('click', function() { Toast.show('클레임 등록 모달을 엽니다.', 'info'); });

  var leaveBtn = document.getElementById('btn-leave');
  if (leaveBtn) leaveBtn.addEventListener('click', function() { Toast.show('탈회 접수 프로세스를 시작합니다.', 'warning'); });

  var saveExtraBtn = document.getElementById('btn-save-extra');
  if (saveExtraBtn) saveExtraBtn.addEventListener('click', function() { Toast.show('추가정보가 저장되었습니다.', 'success'); });


  /* ── 접기/펼치기 토글 ── */
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


  /* ── 학력 추가 ── */
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

  /* ── 학력 삭제 이벤트 위임 ── */
  var basicPanel = document.getElementById('panel-basic');
  if (basicPanel) basicPanel.addEventListener('click', function(ev) {
    var eduDelBtn = ev.target.closest('.edu-del-btn');
    if (eduDelBtn) {
      if (confirm('해당 학력을 삭제하시겠습니까?')) {
        eduDelBtn.closest('tr').remove();
        Toast.show('학력이 삭제되었습니다.', 'info');
      }
    }
  });

  /* ── 특이사항 등록 ── */
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

  /* ── 특이사항 삭제 이벤트 위임 ── */
  document.addEventListener('click', function(ev) {
    var cautionDelBtn = ev.target.closest('.caution-del-btn');
    if (cautionDelBtn) {
      if (confirm('특이사항을 삭제하시겠습니까?')) {
        cautionDelBtn.closest('div[style]').remove();
        Toast.show('특이사항이 삭제되었습니다.', 'info');
      }
    }
  });
}
