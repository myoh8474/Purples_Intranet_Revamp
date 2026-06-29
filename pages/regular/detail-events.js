/* ========================================
   상세페이지 버튼 이벤트 바인딩
   — 수정/SMS/Email/탈회/학력/특이사항/토글
   ======================================== */
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { showSpecialNoteModal } from './detail-tab-matching.js';

/**
 * 기본 버튼 이벤트 바인딩
 * @param {Object} m - 회원 데이터
 */
export function bindEvents(m) {

  /* ── 수정 버튼 → 수정 페이지 이동 ── */
  var editBtn = document.getElementById('btn-edit');
  if (editBtn) editBtn.addEventListener('click', function() {
    window.location.href = '/pages/regular/edit.html?id=' + m.id;
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
  var smsInlineBtn = document.getElementById('btn-sms-inline');
  if (smsInlineBtn) smsInlineBtn.addEventListener('click', function() { Toast.show('SMS 발송 화면으로 이동합니다.', 'info'); });

  var emailBtn = document.getElementById('btn-email');
  if (emailBtn) emailBtn.addEventListener('click', function() { Toast.show('Email 발송 화면으로 이동합니다.', 'info'); });

  // 클레임등록 → detail-modals.js에서 처리

  // 탈회접수 → detail-modals.js에서 처리

  var saveExtraBtn = document.getElementById('btn-save-extra');
  if (saveExtraBtn) saveExtraBtn.addEventListener('click', function() { Toast.show('추가정보가 저장되었습니다.', 'success'); });

  /* ── 인증서류첨부 모달 ── */
  var certAttachBtn = document.getElementById('btn-cert-attach');
  if (certAttachBtn) certAttachBtn.addEventListener('click', function() {
    var DOC_ITEMS = ['호적등본', '졸업증명서', '재직증명서', '계약서'];
    var rowsHtml = DOC_ITEMS.map(function(name, idx) {
      return '<tr>'
        + '<td style="padding:8px 12px;border:1px solid var(--border-light);text-align:center;font-weight:600;background:#f8f9fa;white-space:nowrap">' + (idx + 1) + '</td>'
        + '<td style="padding:8px 12px;border:1px solid var(--border-light);font-weight:600;background:#f8f9fa;white-space:nowrap">' + name + '</td>'
        + '<td style="padding:8px 12px;border:1px solid var(--border-light)">'
        + '<input type="file" class="cert-file-input" data-doc-name="' + name + '" accept="image/*,.pdf,.jpg,.jpeg,.png" style="font-size:12px;width:100%">'
        + '</td>'
        + '<td style="padding:8px 12px;border:1px solid var(--border-light);text-align:center" id="cert-status-' + idx + '">'
        + '<span style="font-size:11px;color:var(--text-muted)">미첨부</span>'
        + '</td>'
        + '</tr>';
    }).join('');

    Modal.show({
      title: '인증서류 첨부',
      size: 'lg',
      content: '<div style="margin-bottom:12px;padding:10px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:4px;font-size:12px;color:#1e40af">'
        + '회원 인증에 필요한 서류를 첨부해주세요. (지원 형식: PDF, JPG, PNG)'
        + '</div>'
        + '<table style="width:100%;border-collapse:collapse;font-size:13px">'
        + '<thead><tr>'
        + '<th style="padding:8px 12px;background:var(--bg-secondary);border:1px solid var(--border-light);font-size:12px;width:40px">No</th>'
        + '<th style="padding:8px 12px;background:var(--bg-secondary);border:1px solid var(--border-light);font-size:12px;width:110px">서류항목</th>'
        + '<th style="padding:8px 12px;background:var(--bg-secondary);border:1px solid var(--border-light);font-size:12px">파일선택</th>'
        + '<th style="padding:8px 12px;background:var(--bg-secondary);border:1px solid var(--border-light);font-size:12px;width:80px">상태</th>'
        + '</tr></thead>'
        + '<tbody>' + rowsHtml + '</tbody>'
        + '</table>'
        + '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">'
        + '<button class="btn btn--ghost btn--sm" id="cert-attach-cancel" style="font-size:12px;padding:5px 18px">취소</button>'
        + '<button class="btn btn--primary btn--sm" id="cert-attach-save" style="font-size:12px;padding:5px 18px;font-weight:700">저장</button>'
        + '</div>',
    });

    setTimeout(function() {
      // 파일 선택 시 상태 업데이트
      document.querySelectorAll('.cert-file-input').forEach(function(input, idx) {
        input.addEventListener('change', function() {
          var statusCell = document.getElementById('cert-status-' + idx);
          if (statusCell) {
            if (input.files && input.files.length > 0) {
              var fileName = input.files[0].name;
              var fileSize = (input.files[0].size / 1024).toFixed(1);
              statusCell.innerHTML = '<span style="font-size:11px;color:#15803d;font-weight:600">✔ 첨부완료</span>'
                + '<div style="font-size:10px;color:#64748b;margin-top:2px">' + fileName + ' (' + fileSize + 'KB)</div>';
            } else {
              statusCell.innerHTML = '<span style="font-size:11px;color:var(--text-muted)">미첨부</span>';
            }
          }
        });
      });

      // 취소 버튼
      var cancelBtn = document.getElementById('cert-attach-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

      // 저장 버튼
      var saveBtn = document.getElementById('cert-attach-save');
      if (saveBtn) saveBtn.addEventListener('click', function() {
        var hasFile = false;
        document.querySelectorAll('.cert-file-input').forEach(function(input) {
          if (input.files && input.files.length > 0) hasFile = true;
        });
        if (!hasFile) {
          Toast.show('첨부된 파일이 없습니다. 파일을 선택해주세요.', 'warning');
          return;
        }
        if (window.confirm('파일이 저장되었습니다')) {
          Modal.hide();
          Toast.show('인증서류가 저장되었습니다.', 'success');
        }
      });
    }, 100);
  });

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

  /* ── 기본정보 특이사항 필터 ── */
  var snBasicFilter = document.getElementById('sn-basic-filter');
  if (snBasicFilter) snBasicFilter.addEventListener('change', function() {
    var catVal = snBasicFilter.value;
    document.querySelectorAll('.sn-basic-row').forEach(function(row) {
      var type = row.getAttribute('data-sn-type') || '';
      row.style.display = (catVal === '전체' || type === catVal) ? '' : 'none';
    });
  });

  /* ── 기본정보 특이사항 등록 → 공용 모달 호출 ── */
  var snBasicAddBtn = document.getElementById('btn-add-special-note-basic');
  if (snBasicAddBtn) snBasicAddBtn.addEventListener('click', function() {
    showSpecialNoteModal(m);
  });
}
