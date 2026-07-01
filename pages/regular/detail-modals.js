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


  /* ── 헤더 버튼 교체 헬퍼 ── */
  function replaceRecallButton(newId, label, bgColor) {
    // 현재 버튼 찾기 (3개 중 하나)
    var old = document.getElementById('btn-recall-send')
           || document.getElementById('btn-recall-waiting')
           || document.getElementById('btn-recall-complete');
    if (!old) return null;
    var btn = document.createElement('button');
    btn.className = 'btn btn--sm';
    btn.id = newId;
    btn.style.cssText = 'margin-left:6px;background:' + bgColor + ';border-color:' + bgColor + ';color:#fff;font-size:10px;padding:1px 8px;font-weight:700;vertical-align:middle;border-radius:3px';
    btn.textContent = label;
    old.parentNode.replaceChild(btn, old);
    return btn;
  }

  /* ── ① 연장신청서 발송 (리콜대기 + 미발송) ── */
  var recallSendBtn = document.getElementById('btn-recall-send');
  if (recallSendBtn) {
    recallSendBtn.addEventListener('click', function(e) {
      e.stopPropagation();

      // 연장기간 산정
      var contractMonths = 12;
      if (m.joinDate && m.expiryDate) {
        contractMonths = Math.round((new Date(m.expiryDate) - new Date(m.joinDate)) / (30.44 * 86400000));
      }
      var extensionMonths = Math.max(0, contractMonths - (m.meetingCount || 0));
      var curExpiry = m.expiryDate ? m.expiryDate.substring(0, 10) : '';
      var newExpiry = '';
      if (curExpiry && extensionMonths > 0) {
        var d = new Date(curExpiry);
        d.setMonth(d.getMonth() + extensionMonths);
        newExpiry = d.toISOString().substring(0, 10);
      }

      // 계약내용 확인 모달
      Modal.show({
        title: '전자서명 계약내용 확인',
        size: 'md',
        content: ''
          + '<div style="font-size:13px;margin-bottom:14px;color:var(--text-primary)">아래 내용으로 <b>' + m.name + '</b> 회원에게 기간연장 신청서를 발송합니다.</div>'
          + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
          + '<tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light);width:110px">회원명</td><td style="padding:8px 12px;border:1px solid var(--border-light)">' + m.name + '</td></tr>'
          + '<tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">계약기간</td><td style="padding:8px 12px;border:1px solid var(--border-light)">' + contractMonths + '개월</td></tr>'
          + '<tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">만남횟수</td><td style="padding:8px 12px;border:1px solid var(--border-light)">' + (m.meetingCount || 0) + '회</td></tr>'
          + '<tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">연장기간</td><td style="padding:8px 12px;border:1px solid var(--border-light);font-weight:700;color:#dc2626">' + extensionMonths + '개월</td></tr>'
          + '<tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">현재만료일</td><td style="padding:8px 12px;border:1px solid var(--border-light)">' + (curExpiry || '-') + '</td></tr>'
          + '<tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">변경만료일(예정)</td><td style="padding:8px 12px;border:1px solid var(--border-light);font-weight:700;color:#2563eb">' + (newExpiry || '-') + '</td></tr>'
          + '<tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">발송수단</td><td style="padding:8px 12px;border:1px solid var(--border-light)">모두싸인 (이메일)</td></tr>'
          + '</table>'
          + '<div style="font-size:11px;color:var(--text-muted);margin-top:10px">※ 확인 완료 후 회원에게 전자서명 요청이 발송됩니다.</div>'
          + '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:12px;border-top:1px solid var(--border-light)">'
          + '<button class="btn btn--sm" id="recall-confirm-send" style="background:#f59e0b;border-color:#f59e0b;color:#fff;font-size:12px;padding:4px 18px;font-weight:700">확인 및 발송</button>'
          + '<button class="btn btn--ghost btn--sm" id="recall-cancel" style="font-size:12px;padding:4px 14px">취소</button>'
          + '</div>',
      });

      setTimeout(function() {
        var cancelBtn = document.getElementById('recall-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

        var confirmBtn = document.getElementById('recall-confirm-send');
        if (confirmBtn) confirmBtn.addEventListener('click', async function() {
          confirmBtn.disabled = true;
          confirmBtn.textContent = '발송 중...';
          await new Promise(function(r) { setTimeout(r, 1500); });
          m._esignStatus = '발송완료';
          m._esignDocId = 'DOC-' + Date.now();
          m._esignSentAt = new Date().toISOString();
          m._esignMethod = '이메일';
          addHistory({ memberId: m.id, category: '상태변경', content: '기간연장 신청서 발송 (모두싸인)', detail: '연장기간: ' + extensionMonths + '개월', processor: 'CS팀', date: new Date().toISOString() });
          Modal.hide();
          Toast.show('전자서명 계약서가 발송되었습니다.', 'success');
          // DOM에서 버튼 교체 → 전자서명 대기중
          var newBtn = replaceRecallButton('btn-recall-waiting', '전자서명 대기중', '#8b5cf6');
          if (newBtn) bindWaitingHandler(newBtn);
        });
      }, 100);
    });
  }

  /* ── ② 전자서명 대기중 핸들러 바인딩 함수 ── */
  function bindWaitingHandler(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      alert('전자서명 대기중입니다.');
      // 프로토타입: 확인 후 서명완료로 전환
      m._esignStatus = '서명완료';
      m._esignSignedAt = new Date().toISOString();
      addHistory({ memberId: m.id, category: '상태변경', content: '기간연장 신청서 서명완료 (모두싸인)', detail: '', processor: '회원(전자서명)', date: new Date().toISOString() });
      var newBtn = replaceRecallButton('btn-recall-complete', '전자서명 완료', '#16a34a');
      if (newBtn) bindCompleteHandler(newBtn);
    });
  }

  // 페이지 로드 시 이미 대기중 버튼이 있으면 바인딩
  var recallWaitBtn = document.getElementById('btn-recall-waiting');
  if (recallWaitBtn) {
    bindWaitingHandler(recallWaitBtn);
  }

  /* ── ③ 전자서명 완료 핸들러 바인딩 함수 ── */
  function bindCompleteHandler(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();

      var contractMonths = 12;
      if (m.joinDate && m.expiryDate) {
        contractMonths = Math.round((new Date(m.expiryDate) - new Date(m.joinDate)) / (30.44 * 86400000));
      }
      var extensionMonths = Math.max(0, contractMonths - (m.meetingCount || 0));
      var curExpiry = m.expiryDate ? m.expiryDate.substring(0, 10) : '';
      var newExpiryDate = '';
      if (curExpiry && extensionMonths > 0) {
        var d = new Date(curExpiry);
        d.setMonth(d.getMonth() + extensionMonths);
        newExpiryDate = d.toISOString().substring(0, 10);
      }
      var esignDocId = m._esignDocId || '';

      Modal.show({
        title: '전자서명 완료 — ' + m.name,
        size: 'lg',
        content: ''
          + '<div style="margin-bottom:16px">'
          + '<div style="font-size:12px;font-weight:700;margin-bottom:6px">📎 서명 완료 서류</div>'
          + '<div style="padding:10px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;display:flex;align-items:center;gap:10px">'
          + '<span style="font-size:12px">📄 특별기간연장 신청서</span>'
          + '<span class="badge badge--green" style="font-size:10px">서명완료</span>'
          + '<button class="btn btn--ghost btn--sm" id="esign-doc-preview" style="font-size:10px;padding:1px 10px">미리보기</button>'
          + '<button class="btn btn--ghost btn--sm" id="esign-doc-download" style="font-size:10px;padding:1px 10px">다운로드</button>'
          + '</div></div>'
          + '<div style="margin-bottom:16px">'
          + '<div style="font-size:12px;font-weight:700;margin-bottom:6px">📅 만료일 변경</div>'
          + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
          + '<tr><td style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light);width:100px">연장기간</td><td style="padding:6px 10px;border:1px solid var(--border-light);font-weight:700;color:#dc2626">' + extensionMonths + '개월</td><td style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light);width:100px">현재만료일</td><td style="padding:6px 10px;border:1px solid var(--border-light)">' + (curExpiry || '-') + '</td></tr>'
          + '<tr><td style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">변경만료일</td><td colspan="3" style="padding:6px 10px;border:1px solid var(--border-light)"><input type="date" class="form-input" id="esign-new-expiry" value="' + newExpiryDate + '" style="font-size:12px;padding:3px 8px;width:160px"></td></tr>'
          + '</table></div>'
          + '<div style="margin-bottom:16px">'
          + '<div style="font-size:12px;font-weight:700;margin-bottom:6px">🔄 회원상태 변경</div>'
          + '<div style="display:flex;align-items:center;gap:8px;font-size:12px">'
          + '<span>' + m.status + '</span> <span style="color:var(--text-muted)">→</span> '
          + '<select class="form-input" id="esign-new-status" style="font-size:12px;padding:3px 8px;width:120px">'
          + '<option value="리콜" selected>리콜</option>'
          + '<option value="리콜대기">리콜대기(유지)</option>'
          + '</select></div></div>'
          + '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:12px;border-top:1px solid var(--border-light)">'
          + '<button class="btn btn--sm" id="esign-apply-changes" style="background:#16a34a;border-color:#16a34a;color:#fff;font-size:12px;padding:4px 18px;font-weight:700">변경사항 저장</button>'
          + '<button class="btn btn--ghost btn--sm" id="esign-close" style="font-size:12px;padding:4px 14px">닫기</button>'
          + '</div>',
      });

      setTimeout(function() {
        var closeBtn = document.getElementById('esign-close');
        if (closeBtn) closeBtn.addEventListener('click', function() { Modal.hide(); });

        var previewBtn = document.getElementById('esign-doc-preview');
        if (previewBtn) previewBtn.addEventListener('click', function() {
          Toast.show('서명 서류 미리보기를 불러옵니다...', 'info');
          window.open('https://modusign.co.kr/envelope/' + (esignDocId || 'preview'), '_blank');
        });

        var downloadBtn = document.getElementById('esign-doc-download');
        if (downloadBtn) downloadBtn.addEventListener('click', function() {
          Toast.show('서명 서류 PDF 다운로드를 시작합니다.', 'info');
        });

        var applyBtn = document.getElementById('esign-apply-changes');
        if (applyBtn) applyBtn.addEventListener('click', function() {
          var newExpiry = document.getElementById('esign-new-expiry')?.value;
          var newStatus = document.getElementById('esign-new-status')?.value;
          if (!newExpiry) { Toast.show('변경만료일을 선택해주세요.', 'warning'); return; }
          var msgs = [];
          if (newExpiry !== curExpiry) msgs.push('만료일: ' + curExpiry + ' → ' + newExpiry);
          if (newStatus !== m.status) msgs.push('상태: ' + m.status + ' → ' + newStatus);
          if (msgs.length === 0) { Toast.show('변경사항이 없습니다.', 'info'); return; }
          if (!confirm('아래 내용을 변경하시겠습니까?\n\n' + msgs.join('\n'))) return;
          if (newExpiry !== curExpiry) m.expiryDate = newExpiry;
          if (newStatus !== m.status) m.status = newStatus;
          addHistory({ memberId: m.id, category: '상태변경', content: msgs.join(' / '), detail: '', processor: '전략기획', date: new Date().toISOString() });
          Toast.show('변경사항이 저장되었습니다.', 'success');
          Modal.hide();
        });
      }, 100);
    });
  }

  // 페이지 로드 시 이미 완료 버튼이 있으면 바인딩
  var recallCompleteBtn = document.getElementById('btn-recall-complete');
  if (recallCompleteBtn) {
    bindCompleteHandler(recallCompleteBtn);
  }

  /* ── 탈회신청서 미리보기 새창 ── */
  var leaveFormBtn = document.getElementById('btn-leave-form');
  if (leaveFormBtn) {
    leaveFormBtn.addEventListener('click', function() {
      var contractMonths = 12;
      if (m.joinDate && m.expiryDate) {
        contractMonths = Math.round((new Date(m.expiryDate) - new Date(m.joinDate)) / (30.44 * 86400000));
      }
      var contractMeetings = m.totalMeetingCount || 12;
      var meetingCount = m.meetingCount || 0;
      var remainMeetings = Math.max(0, contractMeetings - meetingCount);
      var leaveData = m._leaveData || {};
      var today = new Date().toISOString().substring(0, 10);

      var win = window.open('', '_blank', 'width=900,height=1100,scrollbars=yes');
      if (!win) { Toast.show('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.', 'warning'); return; }

      var html = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>회원탈회 신청서 - ' + m.name + '</title>';
      html += '<style>';
      html += '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }';
      html += 'body { font-family: "Malgun Gothic", "맑은 고딕", sans-serif; padding: 40px 50px; background: #fff; color: #1a1a1a; font-size: 13px; line-height: 1.6; }';
      html += '.doc-container { max-width: 780px; margin: 0 auto; }';
      html += '.doc-title { text-align: center; font-size: 26px; font-weight: 800; letter-spacing: 8px; margin-bottom: 6px; padding-bottom: 10px; border-bottom: 3px double #333; }';
      html += '.doc-subtitle { text-align: center; font-size: 12px; color: #666; margin-bottom: 30px; }';
      html += '.doc-date { text-align: right; font-size: 12px; margin-bottom: 16px; color: #555; }';
      html += 'table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }';
      html += 'th, td { border: 1px solid #333; padding: 8px 12px; font-size: 12px; }';
      html += 'th { background: #f5f5f5; font-weight: 700; text-align: center; white-space: nowrap; width: 110px; }';
      html += '.section-title { font-size: 14px; font-weight: 700; margin: 28px 0 10px; padding-left: 8px; border-left: 4px solid #333; }';
      html += '.stamp-area { display: flex; justify-content: flex-end; gap: 30px; margin-top: 40px; margin-bottom: 30px; }';
      html += '.stamp-box { text-align: center; width: 100px; }';
      html += '.stamp-box .label { font-size: 11px; margin-bottom: 4px; color: #555; }';
      html += '.stamp-box .circle { width: 70px; height: 70px; border: 2px solid #ccc; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #aaa; }';
      html += '.agreement { font-size: 11px; line-height: 1.8; color: #333; margin: 20px 0; padding: 16px; background: #fafafa; border: 1px solid #e0e0e0; }';
      html += '.agreement li { margin-bottom: 4px; }';
      html += '.sign-area { margin-top: 40px; text-align: center; font-size: 14px; }';
      html += '.sign-area .date { margin-bottom: 20px; font-size: 13px; }';
      html += '.sign-area .signer { font-size: 15px; font-weight: 600; }';
      html += '.sign-area .seal { display: inline-block; width: 50px; height: 50px; border: 2px solid #ccc; border-radius: 50%; line-height: 46px; font-size: 10px; color: #aaa; margin-left: 10px; vertical-align: middle; }';
      html += '.company-info { text-align: center; margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 16px; }';
      html += '.no-print { margin-bottom: 20px; text-align: center; }';
      html += '.no-print button { padding: 8px 24px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; border-radius: 4px; margin: 0 4px; }';
      html += '.btn-print { background: #2563eb; color: #fff; }';
      html += '.btn-close { background: #e5e7eb; color: #333; }';
      html += '@media print { .no-print { display: none !important; } body { padding: 20px 30px; } }';
      html += '</style></head><body>';

      html += '<div class="doc-container">';

      // 인쇄/닫기 버튼
      html += '<div class="no-print">';
      html += '<button class="btn-print" onclick="window.print()">🖨️ 인쇄</button>';
      html += '<button class="btn-close" onclick="window.close()">닫기</button>';
      html += '</div>';

      // 제목
      html += '<div class="doc-title">회 원 탈 회 신 청 서</div>';
      html += '<div class="doc-subtitle">MEMBERSHIP WITHDRAWAL APPLICATION</div>';
      html += '<div class="doc-date">작성일: ' + today + '</div>';

      // 1. 회원정보
      html += '<div class="section-title">1. 회원정보</div>';
      html += '<table>';
      html += '<tr><th>회원명</th><td>' + (m.name || '-') + '</td><th>회원번호</th><td>' + (m.memberId || '-') + '</td></tr>';
      html += '<tr><th>생년월일</th><td>' + (m.birthDate ? Formatters.date(m.birthDate) : '-') + '</td><th>연락처</th><td>' + Formatters.phone(m.phone) + '</td></tr>';
      html += '<tr><th>프로그램</th><td>' + (m.program || '-') + '</td><th>지사</th><td>' + (m.branch || '-') + '</td></tr>';
      html += '<tr><th>상담매니저</th><td>' + (m.consultantManager || '-') + '</td><th>매칭매니저</th><td>' + (m.matchingManager || '-') + '</td></tr>';
      html += '</table>';

      // 2. 계약정보
      html += '<div class="section-title">2. 계약정보</div>';
      html += '<table>';
      html += '<tr><th>가입일</th><td>' + (m.joinDate ? Formatters.date(m.joinDate) : '-') + '</td><th>만료일</th><td>' + (m.expiryDate ? Formatters.date(m.expiryDate) : '-') + '</td></tr>';
      html += '<tr><th>계약기간</th><td>' + contractMonths + '개월</td><th>가입비</th><td>' + (m.programFee ? Number(m.programFee).toLocaleString() + '원' : '-') + '</td></tr>';
      html += '<tr><th>계약미팅</th><td>' + contractMeetings + '회</td><th>진행미팅</th><td>' + meetingCount + '회</td></tr>';
      html += '<tr><th>잔여미팅</th><td>' + remainMeetings + '회</td><th>결제방법</th><td>' + (m.paymentMethod || '-') + '</td></tr>';
      html += '</table>';

      // 3. 탈회내역
      html += '<div class="section-title">3. 탈회내역</div>';
      html += '<table>';
      html += '<tr><th>탈회사유</th><td colspan="3">' + (leaveData.reason || '') + '</td></tr>';
      html += '<tr><th>환불금액</th><td>' + (leaveData.refundAmount ? Number(leaveData.refundAmount).toLocaleString() + '원' : '') + '</td><th>프로필제공</th><td>' + (leaveData.profileCount || '0') + '회</td></tr>';
      html += '<tr><th>산출내역</th><td colspan="3" style="white-space:pre-wrap">' + (leaveData.calcDetail || '') + '</td></tr>';
      html += '</table>';

      // 4. 환불계좌정보
      html += '<div class="section-title">4. 환불계좌정보</div>';
      html += '<table>';
      html += '<tr><th>은행명</th><td>' + (leaveData.bank || '') + '</td><th>계좌번호</th><td>' + (leaveData.account || '') + '</td></tr>';
      html += '<tr><th>예금주</th><td colspan="3">' + (leaveData.accountName || m.name || '') + '</td></tr>';
      html += '</table>';

      // 동의사항
      html += '<div class="section-title">5. 동의사항</div>';
      html += '<div class="agreement">';
      html += '<ol>';
      html += '<li>본인은 상기 내용을 확인하였으며, 회원 탈회를 신청합니다.</li>';
      html += '<li>탈회 후 재가입 시 기존 계약조건이 적용되지 않을 수 있음을 확인합니다.</li>';
      html += '<li>탈회 처리 완료 후 개인정보는 관련 법령에 따라 보관 후 파기됩니다.</li>';
      html += '<li>환불금액은 「소비자분쟁해결기준」에 따라 산정되었으며, 이에 동의합니다.</li>';
      html += '<li>환불은 신청일로부터 영업일 기준 7일 이내 지정 계좌로 입금됩니다.</li>';
      html += '</ol>';
      html += '</div>';

      // 서명란
      html += '<div class="sign-area">';
      html += '<div class="date">' + new Date().getFullYear() + '년 ' + (new Date().getMonth() + 1) + '월 ' + new Date().getDate() + '일</div>';
      html += '<div class="signer">신청인: ' + (m.name || '________') + ' <span class="seal">(인)</span></div>';
      html += '</div>';

      // 결재란
      html += '<div class="stamp-area">';
      html += '<div class="stamp-box"><div class="label">담당</div><div class="circle"></div></div>';
      html += '<div class="stamp-box"><div class="label">팀장</div><div class="circle"></div></div>';
      html += '<div class="stamp-box"><div class="label">본부장</div><div class="circle"></div></div>';
      html += '</div>';

      // 회사정보
      html += '<div class="company-info">';
      html += '<strong>퍼플스</strong><br>';
      html += '서울특별시 강남구 | TEL: 02-000-0000 | FAX: 02-000-0001';
      html += '</div>';

      html += '</div></body></html>';

      win.document.write(html);
      win.document.close();
    });
  }

  /* ── 탈회접수 모달 ── */
  var leaveBtn = document.getElementById('btn-leave');
  if (leaveBtn) {
    leaveBtn.addEventListener('click', function() {
      var contractMonths = 12;
      if (m.joinDate && m.expiryDate) {
        contractMonths = Math.round((new Date(m.expiryDate) - new Date(m.joinDate)) / (30.44 * 86400000));
      }
      var contractMeetings = m.totalMeetingCount || 12;
      var meetingCount = m.meetingCount || 0;
      var remainMeetings = Math.max(0, contractMeetings - meetingCount);

      Modal.show({
        title: '탈회 접수 — ' + m.name,
        size: 'lg',
        content: ''
          // 탈회사유
          + '<div style="margin-bottom:14px">'
          + '<div style="font-size:12px;font-weight:700;margin-bottom:6px">탈회사유</div>'
          + '<select class="form-input" id="leave-reason" style="font-size:12px;padding:4px 8px;width:100%">'
          + '<option value="">선택하세요</option>'
          + '<option value="본인요청">본인요청</option>'
          + '<option value="부모요청">부모요청</option>'
          + '<option value="서비스불만">서비스불만</option>'
          + '<option value="매칭불만">매칭불만</option>'
          + '<option value="개인사정">개인사정(취업/유학/이민 등)</option>'
          + '<option value="건강문제">건강문제</option>'
          + '<option value="교제중">교제중(자체성사 포함)</option>'
          + '<option value="기타">기타</option>'
          + '</select>'
          + '</div>'
          // 탈회내역
          + '<div style="margin-bottom:14px">'
          + '<div style="font-size:12px;font-weight:700;margin-bottom:6px">탈회내역</div>'
          + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
          + '<tr>'
          + '<td class="lbl" style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light);width:120px">가입금액</td>'
          + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><input type="text" class="form-input" id="leave-amount" placeholder="0" style="font-size:12px;padding:3px 8px;width:140px;text-align:right"> 원</td>'
          + '<td class="lbl" style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light);width:120px">계약미팅횟수</td>'
          + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><input type="number" class="form-input" id="leave-contract-meetings" value="' + contractMeetings + '" style="font-size:12px;padding:3px 8px;width:80px;text-align:right"> 회</td>'
          + '</tr>'
          + '<tr>'
          + '<td class="lbl" style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">미팅횟수</td>'
          + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><input type="number" class="form-input" id="leave-meeting-count" value="' + meetingCount + '" style="font-size:12px;padding:3px 8px;width:80px;text-align:right"> 회</td>'
          + '<td class="lbl" style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">남은횟수</td>'
          + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><input type="number" class="form-input" id="leave-remain-meetings" value="' + remainMeetings + '" style="font-size:12px;padding:3px 8px;width:80px;text-align:right" readonly> 회</td>'
          + '</tr>'
          + '<tr>'
          + '<td class="lbl" style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">프로필제공횟수</td>'
          + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><input type="number" class="form-input" id="leave-profile-count" value="0" style="font-size:12px;padding:3px 8px;width:80px;text-align:right"> 회</td>'
          + '<td class="lbl" style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">환불금액</td>'
          + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><input type="text" class="form-input" id="leave-refund-amount" placeholder="0" style="font-size:12px;padding:3px 8px;width:140px;text-align:right"> 원</td>'
          + '</tr>'
          + '</table>'
          + '</div>'
          // 산출내역
          + '<div style="margin-bottom:14px">'
          + '<div style="font-size:12px;font-weight:700;margin-bottom:6px">산출내역</div>'
          + '<textarea class="form-input" id="leave-calc-detail" rows="3" style="width:100%;font-size:12px;resize:vertical" placeholder="환불금액 산출 근거를 입력하세요..."></textarea>'
          + '</div>'
          // 환불계좌정보
          + '<div style="margin-bottom:14px">'
          + '<div style="font-size:12px;font-weight:700;margin-bottom:6px">환불계좌정보</div>'
          + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
          + '<tr>'
          + '<td class="lbl" style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light);width:120px">은행명</td>'
          + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><select class="form-input" id="leave-bank" style="font-size:12px;padding:3px 8px;width:140px">'
          + '<option value="">선택</option><option>국민은행</option><option>신한은행</option><option>우리은행</option><option>하나은행</option><option>농협</option><option>기업은행</option><option>카카오뱅크</option><option>토스뱅크</option><option>기타</option>'
          + '</select></td>'
          + '<td class="lbl" style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light);width:120px">계좌번호</td>'
          + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><input type="text" class="form-input" id="leave-account" placeholder="계좌번호 입력" style="font-size:12px;padding:3px 8px;width:180px"></td>'
          + '</tr>'
          + '<tr>'
          + '<td class="lbl" style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">예금주</td>'
          + '<td colspan="3" style="padding:6px 10px;border:1px solid var(--border-light)"><input type="text" class="form-input" id="leave-account-name" value="' + (m.name || '') + '" style="font-size:12px;padding:3px 8px;width:140px"></td>'
          + '</tr>'
          + '</table>'
          + '</div>'
          // 버튼
          + '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:12px;border-top:1px solid var(--border-light)">'
          + '<button class="btn btn--sm" id="leave-submit" style="background:#dc2626;border-color:#dc2626;color:#fff;font-size:12px;padding:4px 18px;font-weight:700">탈회접수</button>'
          + '<button class="btn btn--ghost btn--sm" id="leave-cancel" style="font-size:12px;padding:4px 14px">취소</button>'
          + '</div>',
      });

      setTimeout(function() {
        // 남은횟수 자동 계산
        var contractInput = document.getElementById('leave-contract-meetings');
        var meetingInput = document.getElementById('leave-meeting-count');
        var remainInput = document.getElementById('leave-remain-meetings');
        function updateRemain() {
          var c = parseInt(contractInput?.value) || 0;
          var mt = parseInt(meetingInput?.value) || 0;
          if (remainInput) remainInput.value = Math.max(0, c - mt);
        }
        if (contractInput) contractInput.addEventListener('input', updateRemain);
        if (meetingInput) meetingInput.addEventListener('input', updateRemain);

        // 취소
        var cancelBtn = document.getElementById('leave-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

        // 탈회접수
        var submitBtn = document.getElementById('leave-submit');
        if (submitBtn) submitBtn.addEventListener('click', function() {
          var reason = document.getElementById('leave-reason')?.value;
          if (!reason) { Toast.show('탈회사유를 선택해주세요.', 'warning'); return; }

          var leaveData = {
            reason: reason,
            amount: document.getElementById('leave-amount')?.value || '',
            contractMeetings: document.getElementById('leave-contract-meetings')?.value || '',
            meetingCount: document.getElementById('leave-meeting-count')?.value || '',
            remainMeetings: document.getElementById('leave-remain-meetings')?.value || '',
            profileCount: document.getElementById('leave-profile-count')?.value || '',
            refundAmount: document.getElementById('leave-refund-amount')?.value || '',
            calcDetail: document.getElementById('leave-calc-detail')?.value || '',
            bank: document.getElementById('leave-bank')?.value || '',
            account: document.getElementById('leave-account')?.value || '',
            accountName: document.getElementById('leave-account-name')?.value || '',
          };

          alert('탈회접수 완료되었습니다.');

          // 회원 상태 변경 & 이력 저장
          m._leaveData = leaveData;
          m._leaveDate = new Date().toISOString();
          addHistory({ memberId: m.id, category: '상태변경', content: '탈회접수 (' + reason + ')', detail: '환불금액: ' + (leaveData.refundAmount || '-') + '원', processor: 'CS팀', date: new Date().toISOString() });

           Modal.hide();
          Toast.show('탈회 신청서가 회원에게 발송되었습니다.', 'success');
        });
      }, 100);
    });
  }

  /* ── 클레임등록 모달 ── */
  var claimBtn = document.getElementById('btn-claim');
  if (claimBtn) {
    claimBtn.addEventListener('click', function() {
      Modal.show({
        title: '클레임 접수 — ' + m.name,
        size: 'md',
        content: ''
          + '<div style="margin-bottom:14px">'
          + '<div style="font-size:12px;font-weight:700;margin-bottom:6px">클레임사유</div>'
          + '<select class="form-input" id="claim-reason" style="font-size:12px;padding:4px 8px;width:100%">'
          + '<option value="">선택하세요</option>'
          + '<option value="매칭불만">매칭불만</option>'
          + '<option value="서비스불만">서비스불만</option>'
          + '<option value="매니저불만">매니저불만</option>'
          + '<option value="일정불만">일정불만</option>'
          + '<option value="커뮤니케이션">커뮤니케이션 문제</option>'
          + '<option value="프로필불만">프로필불만</option>'
          + '<option value="환불요청">환불요청</option>'
          + '<option value="기타">기타</option>'
          + '</select>'
          + '</div>'
          + '<div style="margin-bottom:14px">'
          + '<div style="font-size:12px;font-weight:700;margin-bottom:6px">상세내용</div>'
          + '<textarea class="form-input" id="claim-detail" rows="4" style="width:100%;font-size:12px;resize:vertical" placeholder="클레임 상세 내용을 입력하세요..."></textarea>'
          + '</div>'
          + '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:12px;border-top:1px solid var(--border-light)">'
          + '<button class="btn btn--sm" id="claim-submit" style="background:#dc2626;border-color:#dc2626;color:#fff;font-size:12px;padding:4px 18px;font-weight:700">클레임접수</button>'
          + '<button class="btn btn--ghost btn--sm" id="claim-cancel" style="font-size:12px;padding:4px 14px">취소</button>'
          + '</div>',
      });

      setTimeout(function() {
        var cancelBtn = document.getElementById('claim-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

        var submitBtn = document.getElementById('claim-submit');
        if (submitBtn) submitBtn.addEventListener('click', function() {
          var reason = document.getElementById('claim-reason')?.value;
          if (!reason) { Toast.show('클레임사유를 선택해주세요.', 'warning'); return; }
          var detail = document.getElementById('claim-detail')?.value || '';

          alert('클레임 접수 완료되었습니다.');

          addHistory({ memberId: m.id, category: '클레임', content: '클레임접수 (' + reason + ')', detail: detail, processor: 'CS팀', date: new Date().toISOString() });
          Modal.hide();
        });
      }, 100);
    });
  }

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

  /* ── 탈회상세 조회 모달 ── */
  var leaveDetailBtn = document.getElementById('btn-leave-detail');
  if (leaveDetailBtn) {
    leaveDetailBtn.addEventListener('click', function(e) {
      e.stopPropagation();

      // 탈회 데이터 (탈회접수 시 저장된 데이터 또는 더미)
      var ld = m._leaveData || {};
      var leaveDate = m._leaveDate ? m._leaveDate.substring(0, 10) : (m.leaveDate || '-');
      var contractMeetings = m.totalMeetingCount || m.contractCount || 12;
      var meetingCount = m.meetingCount || 0;
      var remainMeetings = ld.remainMeetings || Math.max(0, contractMeetings - meetingCount);
      var refundAmount = ld.refundAmount || '0';
      var note = ld.calcDetail || ld.reason || '-';

      Modal.show({
        title: '탈회 상세정보 — ' + m.name,
        size: 'md',
        content: ''
          + '<table style="width:100%;border-collapse:collapse;font-size:13px">'
          + '<tr>'
          + '<td style="padding:10px 14px;background:#f8f9fa;font-weight:700;border:1px solid var(--border-light);width:120px;white-space:nowrap">탈회일</td>'
          + '<td style="padding:10px 14px;border:1px solid var(--border-light);font-weight:600">' + leaveDate + '</td>'
          + '</tr>'
          + '<tr>'
          + '<td style="padding:10px 14px;background:#f8f9fa;font-weight:700;border:1px solid var(--border-light);white-space:nowrap">남은횟수</td>'
          + '<td style="padding:10px 14px;border:1px solid var(--border-light)">' + remainMeetings + '회 <span style="font-size:11px;color:#888">(계약 ' + contractMeetings + '회 - 진행 ' + meetingCount + '회)</span></td>'
          + '</tr>'
          + '<tr>'
          + '<td style="padding:10px 14px;background:#f8f9fa;font-weight:700;border:1px solid var(--border-light);white-space:nowrap">환불금액</td>'
          + '<td style="padding:10px 14px;border:1px solid var(--border-light);font-weight:700;color:#dc2626">' + (refundAmount && refundAmount !== '0' ? Number(refundAmount).toLocaleString() + '원' : '-') + '</td>'
          + '</tr>'
          + '<tr>'
          + '<td style="padding:10px 14px;background:#f8f9fa;font-weight:700;border:1px solid var(--border-light);white-space:nowrap">비고</td>'
          + '<td style="padding:10px 14px;border:1px solid var(--border-light);white-space:pre-wrap">' + note + '</td>'
          + '</tr>'
          + '</table>'
          + '<div style="display:flex;justify-content:flex-end;margin-top:16px;padding-top:12px;border-top:1px solid var(--border-light)">'
          + '<button class="btn btn--ghost btn--sm" id="leave-detail-close" style="font-size:12px;padding:4px 14px">닫기</button>'
          + '</div>',
      });

      setTimeout(function() {
        var closeBtn = document.getElementById('leave-detail-close');
        if (closeBtn) closeBtn.addEventListener('click', function() { Modal.hide(); });
      }, 100);
    });
  }
}
