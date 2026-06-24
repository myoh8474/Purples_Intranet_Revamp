/* ========================================
   변경이력 팝업 + 상태변경 + 첨부서류 미리보기
   ======================================== */
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { addHistory } from '@services/history.js';

/**
 * 변경이력 셀 클릭 및 간단 변경내역 모달 바인딩
 * @param {Object} m - 회원 데이터
 */
export function bindHistoryPopup(m) {

  /* ── 간단 변경내역 모달 ── */
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

  // 간단 변경내역 버튼들
  var branchHistBtn = document.getElementById('btn-branch-hist');
  if (branchHistBtn) branchHistBtn.addEventListener('click', function(e) { e.preventDefault(); showChangeHistory('지사', [{ date: m.joinDate, from: '-', to: m.branch, reason: '최초등록', processor: '시스템' }]); });

  var pgmHistBtn = document.getElementById('btn-pgm-hist');
  if (pgmHistBtn) pgmHistBtn.addEventListener('click', function(e) { e.preventDefault(); showChangeHistory('프로그램', [{ date: m.joinDate, from: '-', to: m.program, reason: '최초등록', processor: m.consultantManager }]); });

  var consultHistBtn = document.getElementById('btn-consult-hist');
  if (consultHistBtn) consultHistBtn.addEventListener('click', function(e) { e.preventDefault(); showChangeHistory('상담매니저', [{ date: m.joinDate, from: '-', to: m.consultantManager, reason: '최초배정', processor: '시스템' }]); });

  var matchHistBtn = document.getElementById('btn-match-hist');
  if (matchHistBtn) matchHistBtn.addEventListener('click', function(e) { e.preventDefault(); showChangeHistory('매칭매니저', [{ date: m.joinDate, from: '-', to: m.matchingManager, reason: '최초배정', processor: '시스템' }]); });

  var expiryHistBtn = document.getElementById('btn-expiry-hist');
  if (expiryHistBtn) expiryHistBtn.addEventListener('click', function(e) {
    e.preventDefault();
    var expiryHistory = [{ date: m.joinDate, from: '-', to: m.expiryDate ? Formatters.date(m.expiryDate) : '-', reason: '최초등록', processor: '시스템' }];
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
        + expiryHistory.map(function(e) { return '<tr><td>' + Formatters.date(e.date) + '</td><td>' + e.from + '</td><td>' + e.to + '</td><td>' + (e.reason || '-') + '</td><td>' + e.processor + '</td></tr>'; }).join('')
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
      '가입횟수': { label: '가입횟수', color: '#ec4899' },
    };
    var catInfo = allCats[category] || { label: category, color: '#64748b' };

    // 카테고리별 데이터 소스 매핑
    var list = [];
    if (category === '상태변경') {
      list = (m.statusHistory || []).map(function(h) { return { date: h.date, before: h.from || '-', after: h.to || '-', reason: h.reason || '-', processor: h.processor || '-' }; });
    } else if (category === '프로그램') {
      list = (m.programHistory || [
        { date: '2024-03-15', before: '-', after: '다이아몬드 B', reason: '최초등록', changer: '박수진' },
        { date: '2025-01-10', before: '다이아몬드 B', after: '다이아몬드 C', reason: '업그레이드', changer: '김지현' },
      ]).map(function(h) { return { date: h.date, before: h.before || '-', after: h.after || h.program || '-', reason: h.reason || h.note || '-', processor: h.changer || '-' }; });
    } else if (category === '미팅횟수') {
      list = (m.meetingCountHistory || [
        { date: '2024-06-20', before: 5, after: 7, changer: '박수진' },
        { date: '2025-01-15', before: 7, after: 10, changer: '김지현' },
        { date: '2025-08-10', before: 10, after: 12, changer: '이다슨' },
      ]).map(function(h) { return { date: h.date, before: (h.before != null ? h.before + '회' : '-'), after: (h.after != null ? h.after + '회' : '-'), processor: h.changer || '-' }; });
    } else if (category === '만료일') {
      list = (m.expiryHistory || [
        { date: '2024-03-15', beforeDate: '2025.03.14', afterDate: '2025.06.14', reason: '특별기간연장 (신청서 서명완료)', processor: '박수진' },
        { date: '2025-06-10', beforeDate: '2025.06.14', afterDate: '2025.09.14', reason: '횟수 미소진 연장', processor: '이다슨' },
        { date: '2025-09-01', beforeDate: '2025.09.14', afterDate: '2026.03.31', reason: '재계약 연장', processor: '오세은' },
      ]).map(function(h) { return { date: h.date, beforeDate: h.beforeDate || '-', afterDate: h.afterDate || '-', reason: h.reason || '-', processor: h.processor || '-' }; });
    } else if (category === '가입횟수') {
      list = (m.rejoinHistory || [
        { date: '2020-06-10', no: 1, contractType: '횟수제', period: '2020.06.10 ~ 2021.06.09', meetingCount: 5, manager: '박수진' },
        { date: '2021-08-20', no: 2, contractType: '기간제', period: '2021.08.20 ~ 2022.08.19', meetingCount: 4, manager: '김지현' },
        { date: '2022-11-05', no: 3, contractType: '횟수제', period: '2022.11.05 ~ 2023.11.04', meetingCount: 6, manager: '김지현' },
        { date: '2024-03-15', no: 4, contractType: '인증제', period: '2024.03.15 ~ 2025.03.14', meetingCount: 3, manager: '이다슨' },
        { date: '2025-04-01', no: 5, contractType: '기간제', period: '2025.04.01 ~ 2026.03.31', meetingCount: 2, manager: '오세은' },
      ]).map(function(h) { return { joinDate: h.date, no: h.no, contractType: h.contractType || '-', period: h.period || '-', meetingCount: h.meetingCount != null ? h.meetingCount + '회' : '-', manager: h.manager || '-' }; });
    } else if (category === '매칭매니저' || category === '상담매니저' || category === '지사') {
      var currentVal = category === '매칭매니저' ? m.matchingManager : category === '상담매니저' ? m.consultantManager : m.branch;
      var dummyHistory = category === '상담매니저' ? [
        { date: '2024-03-15', before: '-', after: '박수진', reason: '최초배정', processor: '시스템' },
        { date: '2025-06-10', before: '박수진', after: currentVal, reason: '담당자 변경', processor: '김지현' },
      ] : category === '매칭매니저' ? [
        { date: '2024-03-15', before: '-', after: '이다손', reason: '최초배정', processor: '시스템' },
        { date: '2025-04-20', before: '이다손', after: currentVal, reason: '매칭 담당자 변경', processor: '박수진' },
      ] : [
        { date: '2024-03-15', before: '-', after: currentVal, reason: '최초등록', processor: '시스템' },
      ];
      list = (m[category + 'History'] || dummyHistory).map(function(h) {
        return { date: h.date, before: h.before || h.from || '-', after: h.after || h.to || '-', reason: h.reason || '-', processor: h.processor || '-' };
      });
    }

    function getAttachment(h) {
      var c = (h.content || '').toLowerCase();
      var d = (h.detail || '');
      // 기간만료→리콜대기: 연장신청서 다운로드
      if (d.indexOf('기간만료') > -1 && d.indexOf('리콜대기') > -1) return { name: '연장신청서', type: 'recall', docId: 'MS-RECALL-' + m.memberId };
      if (d.indexOf('만료') > -1 && d.indexOf('리콜') > -1) return { name: '연장신청서', type: 'recall', docId: 'MS-RECALL-' + m.memberId };
      // 활동대기→활동: 계약정보서류 다운로드
      if (d.indexOf('활동대기') > -1 && d.indexOf('활동') > -1 && d.indexOf('리콜') === -1) return { name: '계약정보서류', type: 'contract', docId: 'MS-CONTRACT-' + m.memberId };
      // 기존 조건 유지
      if ((c.indexOf('리콜') > -1 && c.indexOf('서명') > -1) || c.indexOf('기간연장') > -1) return { name: '특별기간연장 신청서', type: 'recall', docId: 'MS-RECALL-' + m.memberId };
      if (c.indexOf('2가입') > -1 || c.indexOf('전환') > -1) return { name: '2가입 계약서', type: 'contract', docId: 'MS-CONTRACT-' + m.memberId };
      return null;
    }

    var isStatusChange = (category === '상태변경');
    var statusOptions = ['신규','인증중','활동대기','활동','임시교제','교제','외부교제','약정보류','임시보류','장기보류','강제보류','약정만료','자동만료','만료','리콜대기','리콜','탈회진행','탈회'];
    var statusForm = '';
    if (isStatusChange) {
      statusForm = '<div style="margin-bottom:16px;padding:0">'
        + '<table style="width:100%;border-collapse:collapse;font-size:12px"><tbody>'
        + '<tr><td style="padding:6px 10px;background:#f8f9fa;font-weight:600;width:90px;border:1px solid var(--border-light)">회원상태</td>'
        + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><select class="form-input" id="status-change-select" style="width:200px;font-size:12px;padding:3px 8px">' + statusOptions.map(function(s) { return '<option' + (s === m.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td></tr>'
        + '<tr id="hold-period-row" style="opacity:0.4"><td style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">보류기간</td>'
        + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><div style="display:flex;gap:6px;align-items:center"><input type="date" class="form-input" id="status-date-from" disabled style="font-size:12px;padding:3px 8px;background:#f0f0f0"> <span>~</span> <input type="date" class="form-input" id="status-date-to" disabled style="font-size:12px;padding:3px 8px;background:#f0f0f0"></div><div style="font-size:10px;color:var(--text-muted);margin-top:4px">※ 보류 상태 선택 시 활성화</div></td></tr>'
        + '<tr><td style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">변경사유</td>'
        + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><div style="display:flex;gap:8px"><input type="text" class="form-input" id="status-change-reason" placeholder="변경 사유를 입력하세요" style="flex:1;font-size:12px;padding:3px 8px"><button class="btn btn--primary btn--sm" id="btn-status-change-confirm" style="font-size:12px;padding:4px 16px;white-space:nowrap">확인</button></div></td></tr>'
        + '</tbody></table></div>';
    }

    var isMatchManager = (category === '매칭매니저');
    var matchManagerForm = '';
    if (isMatchManager) {
      var managerList = ['박수진','김지현','이다손','오세은','정하나','최예린','김유나','송미라'];
      matchManagerForm = '<div style="margin-bottom:16px;padding:0">'
        + '<table style="width:100%;border-collapse:collapse;font-size:12px"><tbody>'
        + '<tr><td style="padding:6px 10px;background:#f8f9fa;font-weight:600;width:100px;border:1px solid var(--border-light)">매칭매니저</td>'
        + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><select class="form-input" id="match-manager-select" style="width:200px;font-size:12px;padding:3px 8px">' + managerList.map(function(n) { return '<option' + (n === m.matchingManager ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></td></tr>'
        + '<tr><td style="padding:6px 10px;background:#f8f9fa;font-weight:600;border:1px solid var(--border-light)">변경사유</td>'
        + '<td style="padding:6px 10px;border:1px solid var(--border-light)"><div style="display:flex;gap:8px"><input type="text" class="form-input" id="match-manager-reason" placeholder="변경 사유를 입력하세요" style="flex:1;font-size:12px;padding:3px 8px"><button class="btn btn--primary btn--sm" id="btn-match-manager-confirm" style="font-size:12px;padding:4px 16px;white-space:nowrap">확인</button></div></td></tr>'
        + '</tbody></table></div>';
    }

    var isRejoin = (category === '가입횟수');
    var isExpiry = (category === '만료일');
    var isMeeting = (category === '미팅횟수');
    var isSimpleChange = (category === '매칭매니저' || category === '상담매니저' || category === '지사' || category === '프로그램');
    var colCount = isStatusChange ? 6 : isRejoin ? 6 : isExpiry ? 5 : isMeeting ? 4 : isSimpleChange ? 5 : 4;
    var rows = '';

    if (isRejoin) {
      rows = list.length > 0
        ? list.slice(0, 20).map(function(h) {
            return '<tr>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center;white-space:nowrap">' + (h.joinDate ? Formatters.date(h.joinDate) : '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center;font-weight:600">' + (h.no || '-') + '가입</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.contractType || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.period || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.meetingCount || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.manager || '-') + '</td>'
              + '</tr>';
          }).join('')
        : '<tr><td colspan="6" style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px">변경 이력이 없습니다.</td></tr>';
    } else if (isMeeting) {
      rows = list.length > 0
        ? list.slice(0, 20).map(function(h) {
            return '<tr>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center;white-space:nowrap">' + Formatters.date(h.date) + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.before || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center;font-weight:600;color:#f59e0b">' + (h.after || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.processor || '-') + '</td>'
              + '</tr>';
          }).join('')
        : '<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px">변경 이력이 없습니다.</td></tr>';
    } else if (isExpiry) {
      rows = list.length > 0
        ? list.slice(0, 20).map(function(h) {
            return '<tr>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center;white-space:nowrap">' + Formatters.date(h.date) + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.beforeDate || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center;font-weight:600;color:#10b981">' + (h.afterDate || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px">' + (h.reason || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.processor || '-') + '</td>'
              + '</tr>';
          }).join('')
        : '<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px">변경 이력이 없습니다.</td></tr>';
    } else if (isSimpleChange) {
      rows = list.length > 0
        ? list.slice(0, 20).map(function(h) {
            return '<tr>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center;white-space:nowrap">' + Formatters.date(h.date) + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.before || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center;font-weight:600;color:' + catInfo.color + '">' + (h.after || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px">' + (h.reason || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.processor || '-') + '</td>'
              + '</tr>';
          }).join('')
        : '<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px">변경 이력이 없습니다.</td></tr>';
    } else {
      rows = list.length > 0
        ? list.slice(0, 20).map(function(h) {
            var attHtml = '';
            if (isStatusChange) {
              var att = getAttachment(h);
              attHtml = att
                ? '<a href="#" class="att-view" data-doc-id="' + att.docId + '" data-doc-name="' + att.name + '" data-doc-type="' + att.type + '" style="color:#3b82f6;text-decoration:none;font-weight:600;font-size:11px">[첨부서류 다운로드]</a>'
                : '<span style="color:var(--text-muted)">—</span>';
            }
            return '<tr>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;white-space:nowrap">' + Formatters.date(h.date) + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.before || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center;font-weight:600;color:#ef4444">' + (h.after || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px">' + (h.reason || h.content || '-') + '</td>'
              + '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + (h.processor || '-') + '</td>'
              + (isStatusChange ? '<td style="padding:6px 8px;border:1px solid var(--border-light);font-size:12px;text-align:center">' + attHtml + '</td>' : '')
              + '</tr>';
          }).join('')
        : '<tr><td colspan="' + colCount + '" style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px">변경 이력이 없습니다.</td></tr>';
    }

    // 테이블 헤더 결정
    var thead = '';
    if (isRejoin) {
      thead = '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">가입일</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">가입차수</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">계약형태</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">기간</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">미팅횟수</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">상담매니저</th>';
    } else if (isMeeting) {
      thead = '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경일</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경 전 미팅횟수</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경 후 미팅횟수</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">처리자</th>';
    } else if (isExpiry) {
      thead = '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경일</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경전 날짜</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경된 날짜</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경사유</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">처리자</th>';
    } else if (isSimpleChange) {
      thead = '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경일</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경전</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경후</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경사유</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">처리자</th>';
    } else {
      thead = '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경일</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경전</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경후</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">변경사유</th>'
        + '<th style="padding:8px;background:var(--bg-secondary);font-size:12px">처리자</th>'
        + (isStatusChange ? '<th style="padding:8px;background:var(--bg-secondary);font-size:12px;width:20%">첨부</th>' : '');
    }

    Modal.show({
      title: isRejoin ? '<span style="color:' + catInfo.color + ';font-weight:700">가입이력</span>' : '<span style="color:' + catInfo.color + ';font-weight:700">' + catInfo.label + '</span> 변경이력',
      size: 'xl',
      content: statusForm + matchManagerForm
        + '<div style="max-height:' + (isStatusChange || isMatchManager ? '380px' : '450px') + ';overflow-y:auto">'
        + '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;border-collapse:collapse"><thead><tr>'
        + thead
        + '</tr></thead><tbody>' + rows + '</tbody></table></div>',
    });

    setTimeout(function() {
      // 보류기간 활성화/비활성화 제어
      var statusSelect = document.getElementById('status-change-select');
      if (statusSelect) {
        var holdStatuses = ['임시보류','약정보류','장기보류','강제보류'];
        function toggleHoldPeriod() {
          var isHold = holdStatuses.indexOf(statusSelect.value) > -1;
          var row = document.getElementById('hold-period-row');
          var fromInput = document.getElementById('status-date-from');
          var toInput = document.getElementById('status-date-to');
          if (row) row.style.opacity = isHold ? '1' : '0.4';
          if (fromInput) { fromInput.disabled = !isHold; fromInput.style.background = isHold ? '#fff' : '#f0f0f0'; }
          if (toInput) { toInput.disabled = !isHold; toInput.style.background = isHold ? '#fff' : '#f0f0f0'; }
        }
        statusSelect.addEventListener('change', toggleHoldPeriod);
        toggleHoldPeriod();
      }
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

      // 매칭매니저 변경 확인
      var matchConfirmBtn = document.getElementById('btn-match-manager-confirm');
      if (matchConfirmBtn) {
        matchConfirmBtn.addEventListener('click', function() {
          var newManager = document.getElementById('match-manager-select').value;
          var reason = document.getElementById('match-manager-reason').value.trim();
          if (!reason) { Toast.show('변경 사유를 입력해주세요.', 'warning'); return; }
          if (newManager === m.matchingManager) { Toast.show('현재 매칭매니저와 동일합니다.', 'warning'); return; }
          var oldManager = m.matchingManager;
          m.matchingManager = newManager;
          addHistory({ memberId: m.id, category: '매칭매니저', content: reason, detail: oldManager + '→' + newManager, processor: m.consultantManager || '시스템', date: new Date().toISOString() });
          Modal.hide();
          Toast.show('매칭매니저가 변경되었습니다.', 'success');
        });
      }

      // 첨부서류 미리보기
      var modal = document.getElementById('modal-root');
      if (modal) {
        modal.addEventListener('click', function(e) {
          var attLink = e.target.closest('.att-view');
          if (!attLink) return;
          e.preventDefault();
          var docName = attLink.dataset.docName;
          var docType = attLink.dataset.docType;
          var previewContent = '';
          if (docType === 'recall') {
            previewContent = '<div style="padding:32px;border:1px solid #ccc;border-radius:4px;background:#fff;font-family:serif">'
              + '<div style="text-align:center;margin-bottom:24px"><div style="font-size:22px;font-weight:800;letter-spacing:8px">특별기간 연장신청서</div></div>'
              + '<table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:24px"><tbody>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600;width:15%">회원명</td><td style="padding:6px 10px;border:1px solid #999;width:35%">' + m.name + '</td><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600;width:15%">생년월일</td><td style="padding:6px 10px;border:1px solid #999;width:35%">' + Formatters.date(m.birthDate) + '</td></tr>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600">주소</td><td colspan="3" style="padding:6px 10px;border:1px solid #999">' + (m.homeAddress || '-') + '</td></tr>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600">연락처</td><td colspan="3" style="padding:6px 10px;border:1px solid #999">' + Formatters.phone(m.phone) + '</td></tr>'
              + '</tbody></table>'
              + '<div style="font-size:13px;line-height:2;margin-bottom:16px"><b>1.</b> 상기 회원은 ' + Formatters.date(m.joinDate) + ' 회원가입계약(본 계약)에 대하여 약정기간을 아래와 같이 변경하여 연장하는 것을 신청합니다.<br>'
              + '<div style="margin-left:16px;margin-top:4px">☑ <b>변경된 기간</b> ' + (m.expiryDate ? Formatters.date(m.expiryDate) : '-') + ' ~ (연장 후 만료일)</div></div>'
              + '<div style="font-size:13px;line-height:2;margin-bottom:16px"><b>2.</b> 본계약의 내용은 위 연장기간까지 효력이 유지됩니다(성혼사례금, 회원약관 등, 이외 계약에 따른 필수적 내용) 확인합니다. 다만 신청일 이후 계약해지로 탈회가 발생한 경우에는 <b>회원가입비 환급금은 발생하지 않음</b>을 확인합니다.</div>'
              + '<div style="font-size:13px;line-height:2;margin-bottom:16px"><b>3.</b> 상기 회원의 현재 신상정보 변동여부(변동시 서류제출)'
              + '<table style="width:80%;font-size:12px;border-collapse:collapse;margin:8px auto"><tbody>'
              + '<tr><td style="padding:4px 8px;border:1px solid #ccc">1) 결혼정보, 교제 현황 등</td><td style="padding:4px 8px;border:1px solid #ccc;width:40%">☑ 동일 &nbsp; ☐ 변동( )</td></tr>'
              + '<tr><td style="padding:4px 8px;border:1px solid #ccc">2) 직업, 재직 현황 등</td><td style="padding:4px 8px;border:1px solid #ccc">☐ 동일 &nbsp; ☑ 변동( )</td></tr>'
              + '</tbody></table></div>'
              + '<div style="font-size:11px;color:#666;line-height:1.8;margin-bottom:20px;padding:8px;background:#f9f9f9;border:1px solid #e5e7eb;border-radius:4px">'
              + '※ 주의 사항<br>① 신상정보가 변동된 경우 사실에 따라 회사에 알려주셔야 하며, 이로 인하여 발생한 회사의 손해는 상기 회원에게 책임이 있습니다.<br>'
              + '② 기간연장 신청후에도 회사의 결정에 따라서 최종 기간연장이 거부될 수 있습니다.</div>'
              + '<div style="font-size:13px;margin-bottom:8px">위 내용을 명확히 확인하였으며, 제출된 신청서의 기재내용은 사실과 같음을 확인합니다.</div>'
              + '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;font-size:13px"><span>' + Formatters.date(new Date().toISOString()) + '</span><span>신청인 <b>' + m.name + '</b> <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;margin-left:8px">서명완료</span></span></div>'
              + '<div style="text-align:center;margin-top:24px;font-size:15px;font-weight:700;letter-spacing:4px">퍼플스 주식회사 귀중</div>'
              + '<div style="margin-top:16px;font-size:10px;color:#999;text-align:center">Modusign Document ID : MS-RECALL-' + m.memberId + '</div>'
              + '</div>';
          } else {
            previewContent = '<div style="padding:32px;border:1px solid #ccc;border-radius:4px;background:#fff;font-family:serif">'
              + '<div style="text-align:center;margin-bottom:24px"><div style="font-size:22px;font-weight:800;letter-spacing:8px">회원가입 계약정보</div></div>'
              + '<table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:24px"><tbody>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600;width:15%">회원명</td><td style="padding:6px 10px;border:1px solid #999;width:35%">' + m.name + '</td><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600;width:15%">생년월일</td><td style="padding:6px 10px;border:1px solid #999;width:35%">' + Formatters.date(m.birthDate) + '</td></tr>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600">회원번호</td><td style="padding:6px 10px;border:1px solid #999">' + m.memberId + '</td><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600">브랜드</td><td style="padding:6px 10px;border:1px solid #999">' + (m.brand || '-') + '</td></tr>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600">주소</td><td colspan="3" style="padding:6px 10px;border:1px solid #999">' + (m.homeAddress || '-') + '</td></tr>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600">연락처</td><td style="padding:6px 10px;border:1px solid #999">' + Formatters.phone(m.phone) + '</td><td style="padding:6px 10px;border:1px solid #999;background:#e8f4fd;font-weight:600">이메일</td><td style="padding:6px 10px;border:1px solid #999">' + (m.email || '-') + '</td></tr>'
              + '</tbody></table>'
              + '<div style="font-size:14px;font-weight:700;margin-bottom:12px;border-bottom:2px solid #333;padding-bottom:4px">계약 내역</div>'
              + '<table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:20px"><tbody>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#f9fafb;font-weight:600;width:20%">프로그램</td><td style="padding:6px 10px;border:1px solid #999">' + (m.program || '-') + '</td><td style="padding:6px 10px;border:1px solid #999;background:#f9fafb;font-weight:600;width:20%">계약일</td><td style="padding:6px 10px;border:1px solid #999">' + (m.joinDate ? Formatters.date(m.joinDate) : '-') + '</td></tr>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#f9fafb;font-weight:600">계약기간</td><td colspan="3" style="padding:6px 10px;border:1px solid #999">' + (m.joinDate ? Formatters.date(m.joinDate) : '-') + ' ~ ' + (m.expiryDate ? Formatters.date(m.expiryDate) : '-') + '</td></tr>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#f9fafb;font-weight:600">가입금</td><td style="padding:6px 10px;border:1px solid #999">' + Formatters.money(m.programFee || 0) + '</td><td style="padding:6px 10px;border:1px solid #999;background:#f9fafb;font-weight:600">성혼비</td><td style="padding:6px 10px;border:1px solid #999">' + Formatters.money(m.marriageFee || 0) + '</td></tr>'
              + '<tr><td style="padding:6px 10px;border:1px solid #999;background:#f9fafb;font-weight:600">만남횟수</td><td style="padding:6px 10px;border:1px solid #999">' + (m.meetingCount != null ? m.meetingCount + '회' : '-') + '</td><td style="padding:6px 10px;border:1px solid #999;background:#f9fafb;font-weight:600">담당매니저</td><td style="padding:6px 10px;border:1px solid #999">' + (m.consultantManager || '-') + '</td></tr>'
              + '</tbody></table>'
              + '<div style="font-size:11px;color:#666;line-height:1.8;margin-bottom:20px;padding:10px;background:#f9f9f9;border:1px solid #e5e7eb;border-radius:4px">'
              + '※ 본 계약정보는 회원가입 시 체결한 계약서의 요약본이며, 원본은 모두싸인 전자문서 보관함에서 확인하실 수 있습니다.<br>'
              + '※ 계약 내용에 대한 문의사항은 담당 상담매니저에게 연락해 주시기 바랍니다.</div>'
              + '<div style="font-size:13px;margin-bottom:8px">상기 회원은 위 내용으로 퍼플스 매칭 서비스에 가입하였음을 확인합니다.</div>'
              + '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;font-size:13px"><span>' + (m.joinDate ? Formatters.date(m.joinDate) : '-') + '</span><span>회원 <b>' + m.name + '</b> <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;margin-left:8px">서명완료</span></span></div>'
              + '<div style="text-align:center;margin-top:24px;font-size:15px;font-weight:700;letter-spacing:4px">퍼플스 주식회사 귀중</div>'
              + '<div style="margin-top:16px;font-size:10px;color:#999;text-align:center">Modusign Document ID : MS-CONTRACT-' + m.memberId + '</div>'
              + '</div>';
          }

          // 독립 오버레이로 표시 (변경이력 모달 유지)
          var overlay = document.createElement('div');
          overlay.id = 'att-preview-overlay';
          overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center';
          overlay.innerHTML = '<div style="background:#fff;border-radius:8px;width:720px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border-light)">'
            + '<h3 style="font-size:15px;font-weight:700;margin:0">' + docName + ' — 미리보기</h3>'
            + '<button id="att-preview-close" style="background:none;border:none;font-size:18px;cursor:pointer;padding:4px 8px">✕</button></div>'
            + '<div style="padding:20px">' + previewContent
            + '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">'
            + '<button class="btn btn--ghost btn--sm" id="att-btn-modusign">모두싸인에서 보기</button>'
            + '<button class="btn btn--primary btn--sm" id="att-btn-download">다운로드 (PDF)</button></div>'
            + '</div></div>';
          document.body.appendChild(overlay);
          // 닫기
          overlay.querySelector('#att-preview-close').addEventListener('click', function() { overlay.remove(); });
          overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
          // 버튼
          overlay.querySelector('#att-btn-modusign').addEventListener('click', function() { Toast.show('모두싸인 문서 뷰어로 이동합니다.', 'info'); });
          overlay.querySelector('#att-btn-download').addEventListener('click', function() { Toast.show('PDF 다운로드를 시작합니다.', 'success'); });
        });
      }
    }, 100);
  });
}
