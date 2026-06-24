/* ========================================
   서류인증 모달 — 인증 프로세스 관리
   ========================================
   프로세스 흐름:
   1. 매칭매니저 배정 + 활동개시일 설정
   2. 1~3회 미팅일자 설정
   3. 인증서류 확인 (상태값 저장)
   4. 모든 서류 완료 → [서류인증 완료] → 회원상태 '활동중' 자동변경
   5. 가입확인 메시지 전송
   ======================================== */
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { Formatters } from '@utils/formatters.js';

// ── 서류 카테고리 및 상태값 정의 ──
var DOC_CATEGORIES = [
  {
    key: 'familyReg',
    label: '호적증명서',
    statuses: ['서류없음','미등록','대행시작','누락','불가','완료'],
    completeVal: '완료'
  },
  {
    key: 'graduation',
    label: '졸업증명서',
    statuses: ['서류없음','미등록','대행시작','누락','불가','완료'],
    completeVal: '완료'
  },
  {
    key: 'employment',
    label: '재직증명서',
    statuses: ['서류없음','본인첨부','재직증명서','의료보험증','명함','재직증명확인서','무직','학생','상관무','사업자등록증'],
    completeVal: function(v) { return v !== '서류없음' && v !== ''; }
  },
  {
    key: 'photo',
    label: '사진',
    statuses: ['본인첨부','디카','이메일'],
    completeVal: function(v) { return !!v; }
  },
  {
    key: 'contract',
    label: '계약서',
    statuses: ['서류없음','발송','자필서명완료'],
    completeVal: '자필서명완료'
  }
];

// ── 매니저 목록 ──
var MANAGER_LIST = ['박수진','김지현','이다손','오세은','정하나','최예린','김유나','송미라'];

// ── 완료 판정 ──
function isDocComplete(cat, value) {
  if (typeof cat.completeVal === 'function') return cat.completeVal(value);
  return value === cat.completeVal;
}

function isAllDocsComplete(m) {
  var docs = m.docAuth || {};
  return DOC_CATEGORIES.every(function(cat) {
    return isDocComplete(cat, docs[cat.key] || '');
  });
}

// ── 모달 렌더링 ──
function renderDocAuthModal(m) {
  var docs = m.docAuth || {};
  var files = m.docFiles || {};

  // ─── STEP 1: 매칭매니저 배정 + 활동개시일 ───
  var step1 = '<div style="margin-bottom:14px">'
    + '<div style="font-weight:700;font-size:13px;margin-bottom:6px;padding:4px 8px;background:none;border-radius:4px;color:#1d4ed8">매칭매니저 배정 및 활동개시일 설정</div>'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px"><tbody>'
    + '<tr>'
    + '<td style="padding:5px 8px;background:#f8f9fa;font-weight:600;width:80px;border:1px solid var(--border-light);white-space:nowrap">매칭매니저</td>'
    + '<td style="padding:5px 8px;border:1px solid var(--border-light)">'
    + '<select class="form-input" id="auth-match-manager" style="font-size:12px;padding:3px 6px;width:100%">'
    + '<option value="">선택</option>' + MANAGER_LIST.map(function(n) { return '<option' + (n === m.matchingManager ? ' selected' : '') + '>' + n + '</option>'; }).join('')
    + '</select></td>'
    + '<td style="padding:5px 8px;background:#f8f9fa;font-weight:600;width:80px;border:1px solid var(--border-light);white-space:nowrap">활동개시일</td>'
    + '<td style="padding:5px 8px;border:1px solid var(--border-light)">'
    + '<input type="date" class="form-input" id="auth-service-start" value="' + (m.serviceStartDate || '') + '" style="font-size:12px;padding:3px 6px;width:100%"></td>'
    + '<td style="padding:5px 8px;border:1px solid var(--border-light);text-align:center;white-space:nowrap"><button class="btn btn--primary btn--sm" id="btn-auth-step1-save" style="font-size:11px;padding:3px 14px;white-space:nowrap">저장</button></td>'
    + '</tr>'
    + '</tbody></table>'
    + '</div>';

  // ─── STEP 2: 미팅일자 설정 ───
  var step2 = '<div style="margin-bottom:14px">'
    + '<div style="font-weight:700;font-size:13px;margin-bottom:6px;padding:4px 8px;background:none;border-radius:4px;color:#1d4ed8">미팅대상일 설정</div>'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px"><tbody>'
    + '<tr>'
    + '<td style="padding:4px 6px;background:#f8f9fa;font-weight:600;width:30px;border:1px solid var(--border-light);text-align:center;font-size:11px;white-space:nowrap">1회</td>'
    + '<td style="padding:5px 8px;border:1px solid var(--border-light)"><input type="date" class="form-input" id="auth-meeting1" value="' + (m.meetingDate1 || '') + '" style="font-size:12px;padding:3px 6px;width:100%"></td>'
    + '<td style="padding:4px 6px;background:#f8f9fa;font-weight:600;width:30px;border:1px solid var(--border-light);text-align:center;font-size:11px;white-space:nowrap">2회</td>'
    + '<td style="padding:5px 8px;border:1px solid var(--border-light)"><input type="date" class="form-input" id="auth-meeting2" value="' + (m.meetingDate2 || '') + '" style="font-size:12px;padding:3px 6px;width:100%"></td>'
    + '<td style="padding:4px 6px;background:#f8f9fa;font-weight:600;width:30px;border:1px solid var(--border-light);text-align:center;font-size:11px;white-space:nowrap">3회</td>'
    + '<td style="padding:5px 8px;border:1px solid var(--border-light)"><input type="date" class="form-input" id="auth-meeting3" value="' + (m.meetingDate3 || '') + '" style="font-size:12px;padding:3px 6px;width:100%"></td>'
    + '<td style="padding:5px 8px;border:1px solid var(--border-light);text-align:center;white-space:nowrap"><button class="btn btn--primary btn--sm" id="btn-auth-setting-save" style="font-size:11px;padding:3px 14px;white-space:nowrap">저장</button></td>'
    + '</tr>'
    + '</tbody></table>'
    + '</div>';

  // ─── STEP 3: 인증서류 확인 ───
  var docRows = DOC_CATEGORIES.map(function(cat) {
    var currentStatus = docs[cat.key] || '';
    var catFiles = files[cat.key] || [];

    // 라디오 버튼 생성
    var radioHtml = '<div style="display:flex;flex-wrap:wrap;gap:2px 10px">'
      + cat.statuses.map(function(s) {
        var id = 'radio-' + cat.key + '-' + s.replace(/\s/g, '');
        var checked = (s === currentStatus) ? ' checked' : '';
        var isComplete = (s === cat.completeVal || (cat.key === 'employment' && s !== '서류없음') || (cat.key === 'photo'));
        var labelColor = (s === currentStatus && isComplete) ? 'color:#15803d;font-weight:700' : (s === currentStatus ? 'color:#1d4ed8;font-weight:700' : 'color:#555');
        return '<label for="' + id + '" style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;' + labelColor + '">'
          + '<input type="radio" name="doc-' + cat.key + '" id="' + id + '" value="' + s + '"' + checked + ' class="doc-radio" data-doc-key="' + cat.key + '" style="margin:0;accent-color:#1d4ed8">'
          + s + '</label>';
      }).join('')
      + '</div>';

    // 첨부파일 다운로드 (있는 경우만)
    var fileHtml = '';
    if (catFiles.length > 0) {
      fileHtml = catFiles.map(function(f, i) {
        return '<a href="#" class="doc-download" data-doc-key="' + cat.key + '" data-file-idx="' + i + '" style="font-size:11px;color:#3b82f6;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:3px">📄 ' + f.name + '</a>';
      }).join('<br>');
    }

    return '<tr>'
      + '<td style="padding:6px 10px;border:1px solid var(--border-light);font-weight:600;background:#f8f9fa;text-align:center;white-space:nowrap;vertical-align:top">' + cat.label + '</td>'
      + '<td style="padding:6px 10px;border:1px solid var(--border-light)">' + radioHtml + '</td>'
      + '<td style="padding:6px 10px;border:1px solid var(--border-light);vertical-align:middle">' + (fileHtml || '<span style="font-size:11px;color:var(--text-muted)">—</span>') + '</td>'
      + '</tr>';
  }).join('');

  var step3 = '<div style="margin-bottom:14px">'
    + '<div style="font-weight:700;font-size:13px;margin-bottom:6px;padding:4px 8px;background:none;border-radius:4px;color:#1d4ed8">인증서류 확인</div>'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr>'
    + '<th style="padding:5px 10px;background:var(--bg-secondary);border:1px solid var(--border-light);font-size:12px;width:90px">서류항목</th>'
    + '<th style="padding:5px 10px;background:var(--bg-secondary);border:1px solid var(--border-light);font-size:12px">상태</th>'
    + '<th style="padding:5px 10px;background:var(--bg-secondary);border:1px solid var(--border-light);font-size:12px;width:170px">첨부파일</th>'
    + '</tr></thead>'
    + '<tbody>' + docRows + '</tbody>'
    + '</table>'
    + '<div style="text-align:right;margin-top:8px">'
    + '<button class="btn btn--sm" id="btn-auth-doc-save" style="background:#6b7280;border-color:#6b7280;color:#fff;font-size:12px;padding:4px 16px">서류상태 저장</button>'
    + '</div>'
    + '</div>';

  // ─── STEP 4: 인증완료 처리 ───
  var allComplete = isAllDocsComplete(m);
  var completedCount = DOC_CATEGORIES.filter(function(cat) { return isDocComplete(cat, docs[cat.key] || ''); }).length;

  var step4 = '<div style="border-top:2px solid #1d4ed8;padding-top:12px">'
    + '<div style="font-weight:700;font-size:13px;margin-bottom:8px;padding:4px 8px;background:' + (allComplete ? '#dcfce7' : '#fef3c7') + ';border-radius:4px;color:' + (allComplete ? '#15803d' : '#92400e') + '">'
    + '서류인증 완료 처리 (' + completedCount + '/' + DOC_CATEGORIES.length + ')</div>'
    + '<div style="display:flex;align-items:center;justify-content:space-between">'
    + '<div style="font-size:12px;color:#666">'
    + (allComplete ? '✅ 모든 서류가 완료되었습니다. 인증완료 처리가 가능합니다.' : '⚠️ 미완료 서류가 있습니다. 모든 서류를 완료 처리해주세요.')
    + '</div>'
    + '<button class="btn btn--sm" id="btn-auth-complete" style="background:' + (allComplete ? '#15803d' : '#9ca3af') + ';border-color:' + (allComplete ? '#15803d' : '#9ca3af') + ';color:#fff;font-size:13px;padding:6px 24px;font-weight:700;cursor:' + (allComplete ? 'pointer' : 'not-allowed') + '"' + (allComplete ? '' : ' disabled') + '>서류인증 완료</button>'
    + '</div>'
    + '</div>';

  return step1 + step2 + step3 + step4;
}


// ── 이벤트 바인딩 ──
export function bindDocAuth(m) {
  var btn = document.getElementById('btn-doc-auth');
  if (!btn) return;

  btn.addEventListener('click', function() {
    // docAuth 초기화
    if (!m.docAuth) {
      m.docAuth = {};
    }
    if (!m.docFiles) {
      m.docFiles = {
        familyReg: [{ name: '호적등본_스캔.pdf', uploadDate: '2024-03-10', uploader: '서울지사' }],
        graduation: [{ name: '졸업증명서.pdf', uploadDate: '2024-03-11', uploader: '서울지사' }],
        employment: [],
        photo: [{ name: '증명사진_정면.jpg', uploadDate: '2024-03-09', uploader: '본인첨부' }],
        contract: [{ name: '가입계약서_서명본.pdf', uploadDate: '2024-03-12', uploader: '서울지사' }]
      };
    }

    Modal.show({
      title: '<span style="color:#1d4ed8;font-weight:700">서류인증</span> — ' + (m.name || '회원'),
      size: 'xxl',
      content: '<div style="padding:4px">' + renderDocAuthModal(m) + '</div>',
    });

    setTimeout(function() { bindModalEvents(m); }, 100);
  });
}


// ── 모달 내부 이벤트 ──
function bindModalEvents(m) {

  // ── 매칭매니저 + 활동개시일 저장 ──
  var step1SaveBtn = document.getElementById('btn-auth-step1-save');
  if (step1SaveBtn) {
    step1SaveBtn.addEventListener('click', function() {
      var matchManager = document.getElementById('auth-match-manager').value;
      var serviceStart = document.getElementById('auth-service-start').value;

      if (!matchManager) { Toast.show('매칭매니저를 선택해주세요.', 'warning'); return; }
      if (!serviceStart) { Toast.show('활동개시일을 입력해주세요.', 'warning'); return; }

      m.matchingManager = matchManager;
      m.serviceStartDate = serviceStart;

      // 신규 → 인증중 자동변경
      if (m.status === '신규') {
        m.status = '인증중';
        var badge = document.querySelector('.badge.badge--green, .badge.badge--amber, .badge.badge--blue, .badge.badge--red, .badge.badge--orange, .badge.badge--pink, .badge.badge--gray');
        if (badge) badge.outerHTML = Formatters.statusBadge('인증중', 'regular');
      }

      Toast.show('매칭매니저 및 활동개시일이 저장되었습니다.', 'success');
    });
  }

  // ── 미팅대상일 저장 ──
  var saveSettingBtn = document.getElementById('btn-auth-setting-save');
  if (saveSettingBtn) {
    saveSettingBtn.addEventListener('click', function() {
      m.meetingDate1 = document.getElementById('auth-meeting1').value;
      m.meetingDate2 = document.getElementById('auth-meeting2').value;
      m.meetingDate3 = document.getElementById('auth-meeting3').value;
      Toast.show('미팅대상일이 저장되었습니다.', 'success');
    });
  }

  // ── 서류 상태 라디오 실시간 감지 ──
  document.querySelectorAll('.doc-radio').forEach(function(radio) {
    radio.addEventListener('change', function() {
      m.docAuth[radio.dataset.docKey] = radio.value;
      // 선택된 라디오 레이블 강조
      var row = radio.closest('tr');
      if (row) {
        row.querySelectorAll('label').forEach(function(lbl) {
          lbl.style.color = '#555';
          lbl.style.fontWeight = 'normal';
        });
        var selected = radio.closest('label');
        if (selected) {
          selected.style.color = '#1d4ed8';
          selected.style.fontWeight = '700';
        }
      }
      refreshCompleteUI(m);
    });
  });

  // ── 서류상태 저장 ──
  var saveDocBtn = document.getElementById('btn-auth-doc-save');
  if (saveDocBtn) {
    saveDocBtn.addEventListener('click', function() {
      document.querySelectorAll('.doc-radio:checked').forEach(function(radio) {
        m.docAuth[radio.dataset.docKey] = radio.value;
      });
      Toast.show('서류 상태가 저장되었습니다.', 'success');
    });
  }

  // ── 서류인증 완료 ──
  var completeBtn = document.getElementById('btn-auth-complete');
  if (completeBtn) {
    completeBtn.addEventListener('click', function() {
      if (completeBtn.disabled) return;
      if (!confirm('모든 서류 인증이 완료되었습니다.\n서류인증 완료 처리를 진행하시겠습니까?')) return;

      // 인증완료 → 회원상태 '활동중' 변경
      m.certStatus = '인증완료';
      m.status = '활동';
      m.certDate = new Date().toISOString().split('T')[0];

      // 상태 뱃지 갱신
      var badge = document.querySelector('.badge.badge--green, .badge.badge--amber, .badge.badge--blue, .badge.badge--red, .badge.badge--orange, .badge.badge--pink, .badge.badge--gray');
      if (badge) badge.outerHTML = Formatters.statusBadge('활동', 'regular');

      Modal.hide();
      Toast.show('서류인증이 완료되었습니다. 회원상태: 활동', 'success');

      // 가입확인 메시지 전송 안내
      setTimeout(function() {
        if (confirm('가입확인 메시지를 ' + (m.name || '회원') + '님에게 전송하시겠습니까?')) {
          Toast.show(m.name + '님에게 가입확인 메시지가 전송되었습니다.', 'success');
        }
      }, 500);
    });
  }

  // ── 파일 다운로드 ──
  var modal = document.getElementById('modal-root');
  if (modal) {
    modal.addEventListener('click', function(e) {
      var link = e.target.closest('.doc-download');
      if (link) {
        e.preventDefault();
        var key = link.dataset.docKey;
        var idx = parseInt(link.dataset.fileIdx, 10);
        var file = (m.docFiles[key] || [])[idx];
        if (file) {
          Toast.show(file.name + ' 다운로드를 시작합니다.', 'info');
        }
      }
    });
  }
}


// ── 완료 상태 UI 갱신 ──
function refreshCompleteUI(m) {
  var allComplete = isAllDocsComplete(m);
  var completeBtn = document.getElementById('btn-auth-complete');
  if (completeBtn) {
    completeBtn.disabled = !allComplete;
    completeBtn.style.background = allComplete ? '#15803d' : '#9ca3af';
    completeBtn.style.borderColor = allComplete ? '#15803d' : '#9ca3af';
    completeBtn.style.cursor = allComplete ? 'pointer' : 'not-allowed';
  }
}
