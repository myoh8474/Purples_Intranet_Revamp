/* 상담관리 탭 — 준회원 시절부터의 상담 내역 관리 */
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { Auth } from '@core/auth.js';

var LBL = 'lbl';
var VAL = 'val';

/* ── 더미 상담 데이터 ── */
function generateConsultData(m) {
  var names = ['이다슨','오영수','김지현','박소연','최민호','정유진'];
  var types = ['방문상담','전화상담'];
  var VISIT_RESULTS = ['기타','취소','변경','보류','가입'];
  var CALL_RESULTS = ['부재중','낮음(컨텍)','중간(컨텍)','높음(컨텍)','장기상담','방문상담'];
  var contents = [
    '결혼 의향 및 서비스 소개, 프로그램 안내 진행',
    '어머니 통화 - 자녀 결혼 의향 확인, 방문 일정 조율',
    '본인 내방 - 프로필 작성 및 서류 접수 안내',
    '전화 상담 - 서비스 진행 상황 문의 및 매칭 희망사항 전달',
    '방문 상담 - 프로그램 변경 상담 및 추가 결제 안내',
    '부모님 동반 방문 - 서비스 전반 설명 및 계약 진행',
    '유선 상담 - 매칭 결과 피드백 및 향후 일정 안내',
    '재상담 - 이전 미팅 결과 확인 및 보완 사항 논의',
  ];
  var list = m.consultList || [];
  if (list.length === 0) {
    var count = 5 + Math.floor(Math.random() * 6);
    var baseDate = new Date();
    for (var i = 0; i < count; i++) {
      var d = new Date(baseDate);
      d.setDate(d.getDate() - (i * 7 + Math.floor(Math.random() * 5)));
      var hrs = 9 + Math.floor(Math.random() * 9);
      var mins = Math.floor(Math.random() * 60);
      list.push({
        no: i + 1,
        date: d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2),
        time: ('0' + hrs).slice(-2) + ':' + ('0' + mins).slice(-2),
        type: types[Math.floor(Math.random() * types.length)],
        writer: names[Math.floor(Math.random() * names.length)],
        content: contents[Math.floor(Math.random() * contents.length)],
        result: '',  // 아래에서 type에 따라 설정
      });
    }
    // type에 따라 결과 설정
    list.forEach(function(item) {
      var pool = item.type === '방문상담' ? VISIT_RESULTS : CALL_RESULTS;
      item.result = pool[Math.floor(Math.random() * pool.length)];
    });
    m.consultList = list;
  }
  return list;
}


/* ── 상담관리 탭 렌더 ── */
export function renderConsultInfo(m) {
  var consultList = generateConsultData(m);

  var typeColor = { '방문상담': '#3b82f6', '전화상담': '#10b981' };
  var resultColor = {
    '기타': '#6b7280', '취소': '#ef4444', '변경': '#f59e0b', '보류': '#9ca3af', '가입': '#059669',
    '부재중': '#ef4444', '낮음(컨텍)': '#f97316', '중간(컨텍)': '#f59e0b', '높음(컨텍)': '#10b981', '장기상담': '#6366f1', '방문상담': '#3b82f6'
  };

  var html = '';

  // ── 상담조회 섹션 ──
  html += '<div class="sec" style="margin-bottom:12px">';
  html += '<div class="sec__header sec__header--flex">';
  html += '<span class="mcard__title">상담조회</span>';
  html += '<div style="display:flex;gap:6px;align-items:center">';
  html += '<select class="form-input" id="consult-type-filter" style="padding:3px 6px;width:110px;font-size:12px">';
  html += '<option value="전체">유형: 전체</option><option value="방문상담">방문상담</option><option value="전화상담">전화상담</option>';
  html += '</select>';
  html += '<button class="btn btn--outline btn--sm" id="btn-add-consult" style="font-size:11px;padding:2px 10px">등록</button>';
  html += '</div></div>';

  html += '<div class="sec__body" style="padding:0">';
  html += '<table class="data-table data-table--bordered data-table--no-outer dtbl" id="tbl-consult-list">';
  html += '<colgroup><col style="width:6%"><col style="width:15%"><col style="width:10%"><col style="width:10%"><col style="width:42%"><col style="width:12%"></colgroup>';
  html += '<thead><tr>';
  html += '<th style="padding:6px 4px;text-align:center;vertical-align:middle">번호</th>';
  html += '<th style="padding:6px 4px;text-align:center;vertical-align:middle">상담일시</th>';
  html += '<th style="padding:6px 4px;text-align:center;vertical-align:middle">상담유형</th>';
  html += '<th style="padding:6px 4px;text-align:center;vertical-align:middle">작성자</th>';
  html += '<th style="padding:6px 4px;text-align:center;vertical-align:middle">상담내용</th>';
  html += '<th style="padding:6px 4px;text-align:center;vertical-align:middle">상담결과</th>';
  html += '</tr></thead><tbody>';

  consultList.forEach(function(c, i) {
    var tColor = typeColor[c.type] || '#666';
    var rColor = resultColor[c.result] || '#666';
    html += '<tr class="consult-row" data-consult-type="' + c.type + '">';
    html += '<td style="text-align:center;vertical-align:middle">' + (i + 1) + '</td>';
    html += '<td style="text-align:center;vertical-align:middle;white-space:nowrap;font-size:12px">' + c.date + ' ' + c.time + '</td>';
    html += '<td style="text-align:center;vertical-align:middle;font-weight:600;color:' + tColor + '">' + c.type + '</td>';
    html += '<td style="text-align:center;vertical-align:middle">' + c.writer + '</td>';
    html += '<td style="text-align:left;vertical-align:middle;line-height:1.5">' + c.content + '</td>';
    html += '<td style="text-align:center;vertical-align:middle;font-weight:600;color:' + rColor + '">' + c.result + '</td>';
    html += '</tr>';
  });

  html += '</tbody></table></div></div>';

  return html;
}


/* ── 상담관리 탭 이벤트 바인딩 ── */
export function bindConsultEvents(m) {
  // 유형 필터
  var filterSel = document.getElementById('consult-type-filter');
  if (filterSel) filterSel.addEventListener('change', function() {
    var val = this.value;
    document.querySelectorAll('.consult-row').forEach(function(row) {
      row.style.display = (val === '전체' || row.getAttribute('data-consult-type') === val) ? '' : 'none';
    });
  });

  // 등록 버튼
  var addBtn = document.getElementById('btn-add-consult');
  if (addBtn) addBtn.addEventListener('click', function() {
    showConsultModal(m);
  });
}


/* ── 상담 등록 모달 ── */
function showConsultModal(m) {
  var LB = 'background:var(--bg-secondary);font-weight:600;width:80px;text-align:center;white-space:nowrap';
  var VL = 'padding:6px 12px';

  var user = Auth.getUser() || { name: '관리자', role: 'admin' };
  var userName = user.name || '매니저';

  var ROLE_TYPE = { admin: '관리', director: '관리', consultant: '상담', manager: '관리', cert: '인증', legal: '관리' };
  var snType = ROLE_TYPE[user.role] || '관리';

  var body = '';
  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:80px"><col></colgroup>';
  body += '<tbody>';

  // 작성자
  body += '<tr><td style="' + LB + '">작성자</td>';
  body += '<td style="' + VL + ';text-align:left">' + snType + '(' + userName + ')</td></tr>';

  // 상담일시
  body += '<tr><td style="' + LB + '">상담일시</td>';
  body += '<td style="' + VL + '"><input type="datetime-local" class="form-input" id="consult-datetime" style="font-size:12px;padding:3px 6px;width:220px"></td></tr>';

  // 상담유형
  body += '<tr><td style="' + LB + '">상담유형</td>';
  body += '<td style="' + VL + '">';
  body += '<label style="font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:3px;margin-right:16px"><input type="radio" name="consult-type" value="방문상담" checked> 방문상담</label>';
  body += '<label style="font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:3px"><input type="radio" name="consult-type" value="전화상담"> 전화상담</label>';
  body += '</td></tr>';

  // 상담내용
  body += '<tr><td style="' + LB + '">상담내용</td>';
  body += '<td style="' + VL + '"><textarea class="form-input" id="consult-content" rows="4" style="font-size:12px;padding:6px 8px;width:100%;resize:vertical" placeholder="상담 내용을 입력하세요"></textarea></td></tr>';

  // 상담결과 (유형에 따라 동적 변경)
  var VISIT_RESULTS = ['기타','취소','변경','보류','가입'];
  var CALL_RESULTS = ['부재중','낮음(컨텍)','중간(컨텍)','높음(컨텍)','장기상담','방문상담'];
  body += '<tr><td style="' + LB + '">상담결과</td>';
  body += '<td style="' + VL + '"><select class="form-input" id="consult-result" style="font-size:12px;padding:3px 6px;width:160px">';
  body += '<option value="">-- 선택 --</option>';
  VISIT_RESULTS.forEach(function(r) { body += '<option value="' + r + '">' + r + '</option>'; });
  body += '</select></td></tr>';

  body += '</tbody></table>';

  // 하단 버튼
  body += '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px">';
  body += '<button class="btn btn--ghost btn--sm" id="consult-cancel" style="font-size:12px">취소</button>';
  body += '<button class="btn btn--primary btn--sm" id="consult-submit" style="font-size:12px;padding:6px 20px">등록</button>';
  body += '</div>';

  Modal.show({ title: '상담 등록', size: 'md', content: body });

  // 기본 날짜 설정
  setTimeout(function() {
    var VISIT_R = ['기타','취소','변경','보류','가입'];
    var CALL_R = ['부재중','낮음(컨텍)','중간(컨텍)','높음(컨텍)','장기상담','방문상담'];

    var dtInput = document.getElementById('consult-datetime');
    if (dtInput) {
      var now = new Date();
      var local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      dtInput.value = local.toISOString().slice(0, 16);
    }

    // 상담유형 변경 시 결과 select 동적 전환
    var typeRadios = document.querySelectorAll('input[name="consult-type"]');
    var resultSel = document.getElementById('consult-result');
    function updateResultOptions() {
      var checked = document.querySelector('input[name="consult-type"]:checked');
      var items = (checked && checked.value === '전화상담') ? CALL_R : VISIT_R;
      resultSel.innerHTML = '<option value="">-- 선택 --</option>';
      items.forEach(function(r) {
        var opt = document.createElement('option');
        opt.value = r; opt.textContent = r;
        resultSel.appendChild(opt);
      });
    }
    typeRadios.forEach(function(radio) {
      radio.addEventListener('change', updateResultOptions);
    });

    var cancelBtn = document.getElementById('consult-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

    var submitBtn = document.getElementById('consult-submit');
    if (submitBtn) submitBtn.addEventListener('click', function() {
      var content = document.getElementById('consult-content').value.trim();
      if (!content) { Toast.show('상담 내용을 입력하세요.', 'warning'); return; }

      var dtVal = document.getElementById('consult-datetime').value;
      var typeEl = document.querySelector('input[name="consult-type"]:checked');
      var consultType = typeEl ? typeEl.value : '방문상담';
      var result = document.getElementById('consult-result').value;
      if (!result) { Toast.show('상담결과를 선택하세요.', 'warning'); return; }

      var datePart = dtVal ? dtVal.substring(0, 10) : new Date().toISOString().substring(0, 10);
      var timePart = dtVal ? dtVal.substring(11, 16) : '09:00';

      var typeColor = { '방문상담': '#3b82f6', '전화상담': '#10b981' };
      var resultColor = {
        '기타': '#6b7280', '취소': '#ef4444', '변경': '#f59e0b', '보류': '#9ca3af', '가입': '#059669',
        '부재중': '#ef4444', '낮음(컨텍)': '#f97316', '중간(컨텍)': '#f59e0b', '높음(컨텍)': '#10b981', '장기상담': '#6366f1', '방문상담': '#3b82f6'
      };

      // 테이블에 행 추가
      var tbl = document.getElementById('tbl-consult-list');
      if (tbl) {
        var tbody = tbl.querySelector('tbody');
        if (tbody) {
          var rc = tbody.querySelectorAll('tr').length;
          var nr = document.createElement('tr');
          nr.className = 'consult-row';
          nr.setAttribute('data-consult-type', consultType);
          nr.style.background = '#fffbeb';
          nr.innerHTML = '<td style="text-align:center;vertical-align:middle">' + (rc + 1) + '</td>'
            + '<td style="text-align:center;vertical-align:middle;white-space:nowrap;font-size:12px">' + datePart + ' ' + timePart + '</td>'
            + '<td style="text-align:center;vertical-align:middle;font-weight:600;color:' + (typeColor[consultType] || '#666') + '">' + consultType + '</td>'
            + '<td style="text-align:center;vertical-align:middle">' + userName + '</td>'
            + '<td style="text-align:left;vertical-align:middle;line-height:1.5">' + content + '</td>'
            + '<td style="text-align:center;vertical-align:middle;font-weight:600;color:' + (resultColor[result] || '#666') + '">' + result + '</td>';
          tbody.insertBefore(nr, tbody.firstChild);
        }
      }

      // 데이터에도 추가
      if (!m.consultList) m.consultList = [];
      m.consultList.unshift({
        no: m.consultList.length + 1,
        date: datePart,
        time: timePart,
        type: consultType,
        writer: userName,
        content: content,
        result: result,
      });

      Modal.hide();
      Toast.show('상담이 등록되었습니다.', 'success');
    });
  }, 100);
}
