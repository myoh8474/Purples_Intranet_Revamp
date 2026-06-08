/* ========================================
   리콜 관리 (정회원 > 리콜관리)
   - 회원분배 > 기간만료 탭에서 [리콜대기등록]으로 진입
   - 리콜대기 → 신청서 발송 → 승인/거절 → 리콜(활동)
   - 승인 시 만료일+상태 원스톱 변경
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';
import { Modal } from '@components/Modal.js';
import { Formatters } from '@utils/formatters.js';
import { MockRegulars } from '@mock/regulars.js';

initLayout({ pageId: 'regular-recall', breadcrumbs: ['정회원 관리', '리콜 관리'] });
const root = document.getElementById('content');

/* ── 유틸 ── */
function getContractMonths(m) {
  if (m.contract2 && m.contract2.contractPeriod) {
    var mt = m.contract2.contractPeriod.match(/(\d+)/);
    if (mt) return parseInt(mt[1]);
  }
  if (m.joinDate && m.expiryDate) {
    return Math.round((new Date(m.expiryDate) - new Date(m.joinDate)) / (30.44 * 86400000));
  }
  return 12;
}
function calcExtension(months, meetings) { return Math.max(0, months - meetings); }

function calcExtendedExpiry(m, extMonths) {
  var base = m.expiryDate ? new Date(m.expiryDate) : new Date();
  base.setMonth(base.getMonth() + extMonths);
  return base.toISOString().slice(0,10);
}

/* ── 모두싸인 API (Mock) ── */
const ModusignService = {
  async sendExtensionRequest(member, extensionMonths) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          documentId: 'DOC-' + Date.now(),
          status: 'SENT',
          sentAt: new Date().toISOString(),
        });
      }, 1500);
    });
  },
  async checkSignStatus(documentId) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ documentId, status: 'COMPLETED', completedAt: new Date().toISOString() });
      }, 500);
    });
  },
};

/* ── 필터 상태 ── */
let filterName = '', filterManager = '', filterStatus = '';

/* ── 데이터 ── */
function getRecallList() {
  return MockRegulars.filter(m => m.status === '리콜대기' || m.status === '리콜' || m.status === '리콜불가');
}

/* ── 메인 렌더 ── */
function render() {
  var list = getRecallList();
  if (filterName) list = list.filter(m => m.name.indexOf(filterName) !== -1);
  if (filterManager) list = list.filter(m => (m.matchingManager||'').indexOf(filterManager) !== -1);
  if (filterStatus) list = list.filter(m => m.status === filterStatus);

  root.innerHTML = `
    <div class="page-header" style="margin-bottom:20px"><div>
      <h1 class="page-header__title">리콜 관리</h1>
      <p class="page-header__subtitle">2가입 만료 회원 기간연장 관리 · 회원분배에서 리콜대기 등록된 회원 목록</p>
    </div></div>

    <table class="std-table" style="margin-bottom:0;table-layout:fixed">
      <colgroup><col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col></colgroup>
      <tbody><tr>
        <th>회원명</th>
        <td><input type="text" class="form-input form-input--sm" id="f-name" placeholder="회원명" style="width:100%" value="${filterName}"></td>
        <th>매칭매니저</th>
        <td><input type="text" class="form-input form-input--sm" id="f-mgr" placeholder="매니저명" style="width:100%" value="${filterManager}"></td>
        <th>상태</th>
        <td>
          <select class="form-select form-input--sm" id="f-status" style="width:100%">
            <option value="">전체</option>
            <option value="리콜대기"${filterStatus==='리콜대기'?' selected':''}>리콜대기</option>
            <option value="리콜"${filterStatus==='리콜'?' selected':''}>리콜</option>
            <option value="리콜불가"${filterStatus==='리콜불가'?' selected':''}>리콜불가</option>
          </select>
        </td>
      </tr></tbody>
    </table>
    <div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;gap:12px">
      <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
      <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0 6px;margin-top:12px">
      <div style="font-size:13px;font-weight:600;color:var(--text-secondary)">조회 결과 ${list.length}건</div>
    </div>
    <div style="overflow-x:auto">
      <table class="std-table" style="white-space:nowrap;font-size:12px">
        <thead><tr>
          <th style="width:40px">번호</th>
          <th>회원명</th>
          <th>상태</th>
          <th>진행상태</th>
          <th>리콜대기 등록일</th>
          <th>매칭매니저</th>
          <th>계약기간</th>
          <th>연장기간</th>
          <th>연장 만료일</th>
          <th>미팅횟수</th>
          <th>기간연장 신청서</th>
          <th style="width:120px">관리</th>
        </tr></thead>
        <tbody id="recall-tbody"></tbody>
      </table>
    </div>
  `;

  renderRows(list);
  bindEvents();
}

/* ── 행 렌더링 ── */
function renderRows(list) {
  var tbody = document.getElementById('recall-tbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="12" class="tc text-muted" style="padding:40px">리콜 관리 대상 회원이 없습니다.<br>회원분배 > 기간만료 탭에서 [리콜대기 등록]으로 추가하세요.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(function(m, i) {
    var cm = getContractMonths(m);
    var ext = calcExtension(cm, m.meetingCount || 0);
    var step = m._recallStep || 'review';
    var regDate = m._recallRegisteredAt ? Formatters.date(m._recallRegisteredAt) : '-';

    // 상태 뱃지
    var statusBadge = '';
    if (m.status === '리콜대기') statusBadge = '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">리콜대기</span>';
    else if (m.status === '리콜') statusBadge = '<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">리콜</span>';
    else if (m.status === '리콜불가') statusBadge = '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">리콜불가</span>';

    // 진행상태 뱃지
    var stepLabels = { review:'심사중', confirmed:'승인대기', approved:'승인완료', sent:'발송완료', signed:'서명완료', completed:'완료', rejected:'불가' };
    var stepColors = { review:'#64748b', confirmed:'#f59e0b', approved:'#3b82f6', sent:'#8b5cf6', signed:'#06b6d4', completed:'#22c55e', rejected:'#ef4444' };
    var stepLabel = stepLabels[step] || step;
    var stepColor = stepColors[step] || '#64748b';
    var stepBadge = '<span style="color:' + stepColor + ';font-weight:600;font-size:11px">' + stepLabel + '</span>';

    // 연장 만료일 (확정 후에만 표시)
    var showExpiry = (step === 'confirmed' || step === 'approved' || step === 'sent' || step === 'signed' || step === 'completed');
    var extExpiry = showExpiry ? (m._recallNewExpiry || calcExtendedExpiry(m, ext)) : '-';

    // 기간연장 신청서 컬럼
    var esignHtml = '-';
    if (step === 'approved') {
      esignHtml = '<button class="btn btn--primary btn--sm btn-send" data-id="' + m.id + '" style="font-size:11px;padding:2px 8px">신청서 발송</button>';
    } else if (step === 'sent' || step === 'signed' || step === 'completed') {
      var sentDate = m._esignSentAt ? Formatters.date(m._esignSentAt) : '-';
      esignHtml = '<span style="font-weight:600;font-size:11px">발송완료</span> '
        + '<a href="#" class="btn-esign-view" data-id="' + m.id + '" style="color:#3b82f6;font-size:11px;cursor:pointer;text-decoration:underline">' + sentDate + '</a>';
    }

    // 관리 컬럼
    var actionHtml = '';
    if (step === 'review') {
      actionHtml = '<button class="btn btn--outline btn--sm btn-review-pass" data-id="' + m.id + '" data-ext="' + ext + '" style="font-size:10px;padding:2px 6px;margin-right:2px">연장확정</button>'
        + '<button class="btn btn--sm btn-review-fail" data-id="' + m.id + '" style="font-size:10px;padding:2px 6px;background:#ef4444;color:#fff;border:none">불가</button>';
    } else if (step === 'confirmed') {
      actionHtml = '<button class="btn btn--outline btn--sm btn-approve" data-id="' + m.id + '" style="font-size:11px;padding:2px 8px">승인</button>';
    } else if (step === 'sent') {
      actionHtml = '<span style="font-size:11px;color:#64748b">서명대기</span>';
    } else if (step === 'signed') {
      actionHtml = '<button class="btn btn--outline btn--sm btn-convert" data-id="' + m.id + '" style="font-size:11px;padding:2px 8px">리콜전환</button>';
    } else if (step === 'completed') {
      actionHtml = '<span style="font-size:11px;font-weight:600">완료</span>';
    } else if (step === 'rejected') {
      actionHtml = '<a href="#" class="btn-reject-reason" data-id="' + m.id + '" style="font-size:11px;color:#ef4444;cursor:pointer;text-decoration:underline">사유보기</a>';
    }

    return '<tr>'
      + '<td class="tc">' + (i+1) + '</td>'
      + '<td class="tc"><a href="/pages/regular/detail.html?id=' + m.id + '" target="_blank" style="color:var(--accent);font-weight:600;text-decoration:none">' + m.name + '</a></td>'
      + '<td class="tc">' + statusBadge + '</td>'
      + '<td class="tc">' + stepBadge + '</td>'
      + '<td class="tc">' + regDate + '</td>'
      + '<td class="tc">' + (m.matchingManager || '-') + '</td>'
      + '<td class="tc">' + cm + '개월</td>'
      + '<td class="tc" style="color:var(--accent);font-weight:700">' + ext + '개월</td>'
      + '<td class="tc">' + extExpiry + '</td>'
      + '<td class="tc"><span style="color:var(--accent);font-weight:700">' + (m.meetingCount || 0) + '회</span> / ' + cm + '회</td>'
      + '<td class="tc">' + esignHtml + '</td>'
      + '<td class="tc" style="white-space:nowrap">' + actionHtml + '</td>'
      + '</tr>';
  }).join('');

  bindRowEvents();
}

/* ── 행 이벤트 ── */
function bindRowEvents() {
  // ② 연장확정 (매칭팀+CS팀 → 연장횟수/날짜 입력)
  document.querySelectorAll('.btn-review-pass').forEach(btn => {
    btn.onclick = function() {
      var id = +btn.dataset.id, ext = +btn.dataset.ext;
      var m = MockRegulars.find(r => r.id === id);
      if (!m) return;
      var cm = getContractMonths(m);
      var suggestedExpiry = calcExtendedExpiry(m, ext);
      Modal.show({
        title: '연장확정 — ' + m.name, size: 'md',
        content: '<div style="font-size:13px;line-height:1.8">'
          + '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">'
          + '<tr><td style="border:1px solid #ddd;padding:6px 10px;background:#f8f9fa;font-weight:600;width:30%">회원명</td><td style="border:1px solid #ddd;padding:6px 10px">' + m.name + '</td></tr>'
          + '<tr><td style="border:1px solid #ddd;padding:6px 10px;background:#f8f9fa;font-weight:600">계약기간 / 미팅</td><td style="border:1px solid #ddd;padding:6px 10px">' + cm + '개월 / ' + (m.meetingCount||0) + '회</td></tr>'
          + '<tr><td style="border:1px solid #ddd;padding:6px 10px;background:#f8f9fa;font-weight:600">연장기간</td><td style="border:1px solid #ddd;padding:6px 10px;color:var(--accent);font-weight:700">' + ext + '개월</td></tr>'
          + '<tr><td style="border:1px solid #ddd;padding:6px 10px;background:#f8f9fa;font-weight:600">현재 만료일</td><td style="border:1px solid #ddd;padding:6px 10px">' + (m.expiryDate||'').slice(0,10) + '</td></tr>'
          + '<tr><td style="border:1px solid #ddd;padding:6px 10px;background:#f8f9fa;font-weight:600">연장 만료일</td><td style="border:1px solid #ddd;padding:6px 10px">'
          + '<input type="date" class="form-input form-input--sm" id="confirm-expiry" value="' + suggestedExpiry + '" style="width:160px"></td></tr>'
          + '</table>'
          + '<div style="text-align:center"><button class="btn btn--primary btn--sm" id="btn-do-confirm" style="padding:6px 20px;font-weight:700">연장확정</button></div></div>',
      });
      setTimeout(function() {
        var b = document.getElementById('btn-do-confirm');
        if (b) b.onclick = function() {
          var newExp = document.getElementById('confirm-expiry').value;
          if (!newExp) { Toast.show('연장 만료일을 입력해주세요.', 'warning'); return; }
          m._recallStep = 'confirmed';
          m._recallNewExpiry = newExp;
          m.expiryDate = newExp;
          if (!m.statusHistory) m.statusHistory = [];
          m.statusHistory.push({ date: new Date().toISOString(), from: m.status, to: m.status, reason: '리콜 심사통과 (연장확정, 만료일: ' + newExp + ')', processor: 'CS팀' });
          Modal.hide();
          Toast.show(m.name + ' 연장이 확정되었습니다. 영업기획팀 승인을 진행해주세요.', 'success');
          render();
        };
      }, 100);
    };
  });

  // ②-B 심사불가
  document.querySelectorAll('.btn-review-fail').forEach(btn => {
    btn.onclick = function() {
      var id = +btn.dataset.id;
      var m = MockRegulars.find(r => r.id === id);
      if (!m) return;
      Modal.show({
        title: '리콜 불가 — ' + m.name, size: 'sm',
        content: '<div style="font-size:13px">'
          + '<p style="margin-bottom:8px;font-weight:600">불가사유를 입력해주세요.</p>'
          + '<textarea id="reject-reason" class="form-input" rows="4" style="width:100%;font-size:12px" placeholder="예: 미팅 횟수 부족, 활동 이력 미달 등"></textarea>'
          + '<div style="text-align:center;margin-top:12px"><button class="btn btn--sm" id="btn-do-reject" style="padding:6px 20px;background:#ef4444;color:#fff;border:none;font-weight:700">불가 처리</button></div></div>',
      });
      setTimeout(function() {
        var b = document.getElementById('btn-do-reject');
        if (b) b.onclick = function() {
          var reason = (document.getElementById('reject-reason').value || '').trim();
          if (!reason) { Toast.show('불가사유를 입력해주세요.', 'warning'); return; }
          m._recallStep = 'rejected';
          m._recallRejectReason = reason;
          m.status = '리콜불가';
          if (!m.statusHistory) m.statusHistory = [];
          m.statusHistory.push({ date: new Date().toISOString(), from: '리콜대기', to: '리콜불가', reason: '리콜 심사불가: ' + reason, processor: 'CS팀' });
          Modal.hide();
          Toast.show(m.name + ' 리콜 불가 처리되었습니다.', 'info');
          render();
        };
      }, 100);
    };
  });

  // ③ 승인 (영업기획팀)
  document.querySelectorAll('.btn-approve').forEach(btn => {
    btn.onclick = function() {
      var id = +btn.dataset.id;
      var m = MockRegulars.find(r => r.id === id);
      if (!m) return;
      if (!confirm(m.name + ' 회원의 연장을 승인하시겠습니까?\n연장 만료일: ' + (m._recallNewExpiry||''))) return;
      m._recallStep = 'approved';
      if (!m.statusHistory) m.statusHistory = [];
      m.statusHistory.push({ date: new Date().toISOString(), from: m.status, to: m.status, reason: '영업기획팀 승인완료 (만료일: ' + m._recallNewExpiry + ')', processor: '영업기획' });
      Toast.show(m.name + ' 승인완료. CS팀에서 신청서를 발송해주세요.', 'success');
      render();
    };
  });

  // ④ 신청서 발송 (CS팀 → 모두싸인)
  document.querySelectorAll('.btn-send').forEach(btn => {
    btn.onclick = async function() {
      var id = +btn.dataset.id;
      var m = MockRegulars.find(r => r.id === id);
      if (!m) return;
      if (!confirm(m.name + ' 회원에게 신청서를 발송하시겠습니까?')) return;
      btn.disabled = true; btn.textContent = '발송중...';
      var ext = calcExtension(getContractMonths(m), m.meetingCount||0);
      try {
        var res = await ModusignService.sendExtensionRequest(m, ext);
        if (res.success) {
          m._recallStep = 'sent';
          m._esignStatus = '발송완료';
          m._esignDocId = res.documentId;
          m._esignSentAt = res.sentAt;
          if (!m.statusHistory) m.statusHistory = [];
          m.statusHistory.push({ date: new Date().toISOString(), from: m.status, to: m.status, reason: '기간연장 신청서 발송 (모두싸인)', processor: 'CS팀' });
          Toast.show(m.name + ' 신청서가 발송되었습니다.', 'success');
        }
      } catch(e) { Toast.show('발송 오류: ' + e.message, 'error'); }
      render();
    };
  });

  // ⑥ 리콜전환 (전략기획팀)
  document.querySelectorAll('.btn-convert').forEach(btn => {
    btn.onclick = function() {
      var id = +btn.dataset.id;
      var m = MockRegulars.find(r => r.id === id);
      if (!m) return;
      if (!confirm(m.name + ' 회원을 리콜 상태로 전환하시겠습니까?')) return;
      m._recallStep = 'completed';
      m.status = '리콜';
      if (!m.statusHistory) m.statusHistory = [];
      m.statusHistory.push({ date: new Date().toISOString(), from: '리콜대기', to: '리콜', reason: '리콜 전환 (연장 만료일: ' + (m._recallNewExpiry||'') + ')', processor: '전략기획' });
      Toast.show(m.name + ' 리콜 전환 완료. 매칭이 재시작됩니다.', 'success');
      render();
    };
  });

  // 불가사유 보기
  document.querySelectorAll('.btn-reject-reason').forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      var m = MockRegulars.find(r => r.id === +link.dataset.id);
      if (!m) return;
      Modal.show({ title: '리콜 불가사유 — ' + m.name, size: 'sm',
        content: '<div style="padding:12px;font-size:13px;line-height:1.8;background:#fef2f2;border:1px solid #fecaca;border-radius:8px">' + (m._recallRejectReason||'-') + '</div>'
          + '<div style="text-align:center;margin-top:12px"><button class="btn btn--ghost btn--sm" onclick="Modal.hide()" style="padding:6px 20px">닫기</button></div>' });
    };
  });

  // 발송일 클릭 → 신청서 조회
  document.querySelectorAll('.btn-esign-view').forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      var m = MockRegulars.find(r => r.id === +link.dataset.id);
      if (!m) return;
      var ext = calcExtension(getContractMonths(m), m.meetingCount||0);
      Modal.show({ title: '📄 특별기간연장 신청서', size: 'lg',
        content: '<div style="max-height:500px;overflow-y:auto;background:#f5f5f5;padding:20px;border-radius:8px">'
          + '<div style="border:1px solid #e5e7eb;border-radius:8px;background:#fff;padding:28px 32px;font-size:13px;line-height:2">'
          + '<div style="text-align:center;margin-bottom:20px"><div style="font-size:18px;font-weight:800;letter-spacing:2px">특별기간연장 신청서</div>'
          + '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">문서번호: ' + (m._esignDocId||'-') + '</div></div>'
          + '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">'
          + '<tr><td style="border:1px solid #ddd;padding:6px 10px;background:#f8f9fa;width:25%;font-weight:600">회원명</td><td style="border:1px solid #ddd;padding:6px 10px">' + m.name + '</td>'
          + '<td style="border:1px solid #ddd;padding:6px 10px;background:#f8f9fa;width:25%;font-weight:600">회원번호</td><td style="border:1px solid #ddd;padding:6px 10px">' + (m.memberId||'-') + '</td></tr>'
          + '<tr><td style="border:1px solid #ddd;padding:6px 10px;background:#f8f9fa;font-weight:600">프로그램</td><td style="border:1px solid #ddd;padding:6px 10px">' + (m.program||'-') + '</td>'
          + '<td style="border:1px solid #ddd;padding:6px 10px;background:#f8f9fa;font-weight:600">연장기간</td><td style="border:1px solid #ddd;padding:6px 10px;color:var(--accent);font-weight:700">' + ext + '개월</td></tr>'
          + '<tr><td style="border:1px solid #ddd;padding:6px 10px;background:#f8f9fa;font-weight:600">연장 만료일</td><td colspan="3" style="border:1px solid #ddd;padding:6px 10px;font-weight:700">' + (m._recallNewExpiry||'-') + '</td></tr>'
          + '</table>'
          + '<div style="display:flex;justify-content:space-between;align-items:end;margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb">'
          + '<div style="font-size:11px;color:var(--text-muted)">발송일: ' + (m._esignSentAt ? Formatters.date(m._esignSentAt) : '-') + '</div>'
          + '<div style="text-align:right"><div style="font-size:12px;margin-bottom:4px">신청인: ' + m.name + '</div>'
          + '<div style="font-size:18px;font-family:cursive;color:#1e40af">' + m.name + ' (전자서명)</div></div></div>'
          + '</div></div>'
          + '<div style="display:flex;gap:8px;justify-content:center;margin-top:16px">'
          + '<button class="btn btn--primary btn--sm" onclick="Toast.show(\'PDF 다운로드를 시작합니다.\',\'success\')" style="padding:6px 20px">PDF 다운로드</button>'
          + '<button class="btn btn--ghost btn--sm" onclick="Modal.hide()" style="padding:6px 20px">닫기</button></div>' });
    };
  });
}

/* ── 이벤트 ── */
function bindEvents() {
  var bs = document.getElementById('btn-search');
  if (bs) bs.onclick = function() {
    filterName = (document.getElementById('f-name').value || '').trim();
    filterManager = (document.getElementById('f-mgr').value || '').trim();
    filterStatus = (document.getElementById('f-status').value || '');
    render();
  };
  var br = document.getElementById('btn-reset');
  if (br) br.onclick = function() {
    filterName = ''; filterManager = ''; filterStatus = '';
    render();
  };
  // 상태 드롭다운 즉시 필터
  var fs = document.getElementById('f-status');
  if (fs) fs.onchange = function() {
    filterStatus = fs.value;
    render();
  };
}

render();
