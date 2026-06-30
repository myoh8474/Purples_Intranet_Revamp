/* ═══════════════════════════════════════════
   미팅관리 모달 — 3탭 구성
   탭1: 연락관리 / 탭2: 만남약속관리 / 탭3: 만남후기관리
   ═══════════════════════════════════════════ */
import { Toast } from '@components/Toast.js';
import { Modal } from '@components/Modal.js';
import { PlaceSearch } from '@components/PlaceSearch.js';

var LB = 'background:var(--bg-secondary);font-weight:600;text-align:center;white-space:nowrap';
var VL = 'padding:6px 12px';

/* ── 탭 공통 헤더 (대상자 표출 + 연락대상 구분) ── */
function memberHeader(name1, name2, ct1, ct2, id1, id2) {
  var h = '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed;margin-bottom:12px">';
  h += '<colgroup><col style="width:90px"><col><col style="width:90px"><col></colgroup>';
  h += '<tbody>';
  h += '<tr>';
  h += '<td style="' + LB + '">담당회원</td><td style="' + VL + ';font-weight:700;color:var(--primary)">' + name1 + ' <span style="font-size:11px;font-weight:400;color:var(--text-muted)">(' + id1 + ')</span></td>';
  h += '<td style="' + LB + '">상대회원</td><td style="' + VL + ';font-weight:700;color:#ef4444">' + name2 + ' <span style="font-size:11px;font-weight:400;color:var(--text-muted)">(' + id2 + ')</span></td>';
  h += '</tr>';
  h += '<tr>';
  h += '<td style="' + LB + '">연락대상</td><td style="' + VL + ';font-weight:600">' + ct1 + '</td>';
  h += '<td style="' + LB + '">연락대상</td><td style="' + VL + ';font-weight:600">' + ct2 + '</td>';
  h += '</tr>';
  h += '</tbody></table>';
  return h;
}

/* ── 연락내역 더미 데이터 ── */
function getDummyHistory(name2, mgr, dateTime, place) {
  return [
    { no:6, type:'etc', writer: mgr, receiver:'본인', content:'사진보다 괜찮은분은 처음', date:'05.27 10:42' },
    { no:5, type:'sms', writer: mgr, receiver:'부', content:'[퍼플스] ' + name2 + '님 안심번호:070-4501-3015 / ' + dateTime + ' ' + place, date:'05.26 11:03' },
    { no:4, type:'tel', writer: mgr, receiver:'모', content:'미팅 컨펌 완료, 일정 확정', date:'05.26 11:03' },
    { no:3, type:'sms', writer: mgr, receiver:'부', content:'[퍼플스] ' + name2 + '님 안심번호:070-4501-3015 / ' + dateTime + ' ' + place, date:'05.21 11:25' },
    { no:2, type:'sms', writer: mgr, receiver:'본인', content:'[퍼플스] ' + name2 + '님 안심번호:070-4501-3015 / ' + dateTime + ' ' + place, date:'05.21 11:25' },
    { no:1, type:'tel', writer: mgr, receiver:'본인', content:'미팅 일정 확인 통화 완료', date:'05.21 11:25' },
  ];
}

/* ══════════════════════════════════════
   탭1: 연락관리
   ══════════════════════════════════════ */
function buildContactTab(name1, name2, m, mt, ct1, ct2, id1, id2) {
  var myPhone = m.phone || '010-0000-0000';
  var body = '';

  /* 대상자 헤더 */
  body += memberHeader(name1, name2, ct1, ct2, id1, id2);

  /* 통합 입력 테이블 */
  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:80px"><col></colgroup><tbody>';

  // 전화 확인
  body += '<tr><td style="' + LB + '">전화확인</td>';
  body += '<td style="' + VL + '"><input type="text" class="form-input" id="mm-tel-confirm" style="font-size:12px;padding:4px 8px;width:100%" placeholder="전화 확인 내용 입력"></td></tr>';

  // 수신자
  body += '<tr><td style="' + LB + '">수신자</td><td style="' + VL + '">';
  body += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">';
  body += '<input type="text" class="form-input" id="mm-recv-phone" value="' + myPhone + '" style="font-size:12px;padding:4px 8px;width:150px" readonly>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-recv-type" value="본인" checked> 본인</label>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-recv-type" value="부"> 부</label>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-recv-type" value="모"> 모</label>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-recv-type" value="기타"> 기타</label>';
  body += '</div></td></tr>';

  // CallBack
  body += '<tr><td style="' + LB + '">CallBack</td><td style="' + VL + '">';
  body += '<div style="display:flex;gap:8px;align-items:center">';
  body += '<input type="text" class="form-input" id="mm-callback" value="02-518-9160" style="font-size:12px;padding:4px 8px;width:150px" readonly>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-cb-type" value="사무실" checked> 사무실</label>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-cb-type" value="법인폰"> 법인폰</label>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-cb-type" value="전국대표"> 전국대표</label>';
  body += '</div></td></tr>';

  // 전송방법
  body += '<tr><td style="' + LB + '">전송방법</td><td style="' + VL + '">';
  body += '<div style="display:flex;gap:8px;align-items:center">';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-send-method" value="즉시" checked> 즉시</label>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-send-method" value="예약"> 예약</label>';
  body += '<input type="datetime-local" class="form-input" id="mm-send-reserve" style="font-size:11px;padding:3px 6px;width:180px;display:none">';
  body += '</div></td></tr>';

  // 내용
  body += '<tr><td style="' + LB + '">내 용</td>';
  body += '<td style="' + VL + '"><textarea class="form-input" id="mm-content" rows="3" style="font-size:12px;padding:6px 8px;width:100%;resize:vertical" placeholder="내용을 입력하세요"></textarea></td></tr>';

  // 비고
  body += '<tr><td style="' + LB + '">비 고</td>';
  body += '<td style="' + VL + '"><input type="text" class="form-input" id="mm-note" style="font-size:12px;padding:4px 8px;width:100%" placeholder="비고 입력"></td></tr>';

  body += '</tbody></table>';

  /* 등록 버튼 */
  body += '<div style="display:flex;justify-content:center;padding:12px 0">';
  body += '<button class="btn btn--primary btn--sm" id="mm-contact-register" style="font-size:12px;padding:6px 24px">등 록 하 기</button>';
  body += '</div>';

  /* 연락 내역 히스토리 */
  body += '<div style="border-top:2px solid var(--border-color);padding-top:12px">';
  body += '<div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#333">연락 내역</div>';
  body += '<table class="data-table data-table--bordered" id="mm-contact-history" style="font-size:11px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:30px"><col style="width:40px"><col style="width:40px"><col style="width:65px"><col><col style="width:95px"></colgroup>';
  body += '<thead><tr>';
  body += '<th style="' + LB + ';font-size:11px">No</th>';
  body += '<th style="' + LB + ';font-size:11px">구분</th>';
  body += '<th style="' + LB + ';font-size:11px">수신자</th>';
  body += '<th style="' + LB + ';font-size:11px">상담매니저</th>';
  body += '<th style="' + LB + ';font-size:11px">내용</th>';
  body += '<th style="' + LB + ';font-size:11px">등록일</th>';
  body += '</tr></thead><tbody id="mm-contact-history-body">';

  var mgr = m.matchingManager || '매니저';
  var history = getDummyHistory(name2, mgr, mt.dateTime || '', mt.place || '');
  var typeMap = { tel:'전화', sms:'SMS', etc:'비고' };
  var typeColor = { tel:'#3b82f6', sms:'#10b981', etc:'#f59e0b' };
  history.forEach(function(h) {
    body += '<tr>';
    body += '<td style="text-align:center">' + h.no + '</td>';
    body += '<td style="text-align:center;font-weight:600;color:' + (typeColor[h.type]||'#666') + '">' + (typeMap[h.type]||h.type) + '</td>';
    body += '<td style="text-align:center">' + (h.receiver||'본인') + '</td>';
    body += '<td style="text-align:center">' + h.writer + '</td>';
    body += '<td style="padding:4px 8px;line-height:1.4;word-break:break-all">' + h.content + '</td>';
    body += '<td style="text-align:center;white-space:nowrap;color:var(--text-muted)">' + h.date + '</td>';
    body += '</tr>';
  });

  body += '</tbody></table></div>';
  return body;
}

/* ── 연락관리 탭 이벤트 바인딩 ── */
function bindContactEvents(m) {
  var myPhone = m.phone || '010-0000-0000';
  var CB_MAP = { '사무실':'02-518-9160', '법인폰':'010-8888-9160', '전국대표':'1588-9160' };
  var historyNo = 7;

  // 수신자 전환
  document.querySelectorAll('input[name="mm-recv-type"]').forEach(function(r) {
    r.addEventListener('change', function() {
      var ph = document.getElementById('mm-recv-phone');
      if (this.value === '본인') { ph.value = myPhone; ph.readOnly = true; }
      else if (this.value === '부') { ph.value = m.fatherPhone || ''; ph.readOnly = true; }
      else if (this.value === '모') { ph.value = m.motherPhone || ''; ph.readOnly = true; }
      else { ph.value = ''; ph.readOnly = false; ph.placeholder = '번호 입력'; ph.focus(); }
    });
  });

  // CallBack 전환
  document.querySelectorAll('input[name="mm-cb-type"]').forEach(function(r) {
    r.addEventListener('change', function() {
      document.getElementById('mm-callback').value = CB_MAP[this.value] || '';
    });
  });

  // 전송방법 즉시/예약
  document.querySelectorAll('input[name="mm-send-method"]').forEach(function(r) {
    r.addEventListener('change', function() {
      document.getElementById('mm-send-reserve').style.display = this.value === '예약' ? '' : 'none';
    });
  });

  // 등록하기
  var regBtn = document.getElementById('mm-contact-register');
  if (regBtn) regBtn.addEventListener('click', function() {
    var commType = 'tel';
    var content = (document.getElementById('mm-content').value || '').trim();
    var note = (document.getElementById('mm-note').value || '').trim();

    if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }
    var fullContent = note ? content + ' [비고: ' + note + ']' : content;

    var typeMap = { tel:'전화', sms:'SMS' };
    var typeColor = { tel:'#3b82f6', sms:'#10b981' };
    var now = new Date();
    var dateStr = (now.getMonth()+1).toString().padStart(2,'0') + '.' + now.getDate().toString().padStart(2,'0') + ' ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    var writer = m.matchingManager || '매니저';

    var tbody = document.getElementById('mm-contact-history-body');
    if (tbody) {
      var nr = document.createElement('tr');
      nr.style.background = '#fffbeb';
      var recvType = document.querySelector('input[name="mm-recv-type"]:checked');
      var recvLabel = recvType ? recvType.value : '본인';
      nr.innerHTML = '<td style="text-align:center">' + historyNo + '</td>'
        + '<td style="text-align:center;font-weight:600;color:' + (typeColor[commType]||'#666') + '">' + (typeMap[commType]||commType) + '</td>'
        + '<td style="text-align:center">' + recvLabel + '</td>'
        + '<td style="text-align:center">' + writer + '</td>'
        + '<td style="padding:4px 8px;line-height:1.4;word-break:break-all">' + fullContent + '</td>'
        + '<td style="text-align:center;white-space:nowrap;color:var(--text-muted)">' + dateStr + '</td>';
      tbody.insertBefore(nr, tbody.firstChild);
      historyNo++;
    }

    document.getElementById('mm-content').value = '';
    document.getElementById('mm-note').value = '';

    Toast.show(commType === 'sms' ? 'SMS가 발송되었습니다.' : '전화 확인 이력이 등록되었습니다.', 'success');
  });
}

/* ── 안심번호 자동 생성 (더미) ── */
function generateSafeNumber() {
  var n1 = Math.floor(1000 + Math.random() * 9000);
  var n2 = Math.floor(1000 + Math.random() * 9000);
  return '070-' + n1 + '-' + n2;
}

/* ── SMS 미리보기 텍스트 생성 ── */
function buildMeetingSms(targetName, safeNum, dateStr, timeStr, placeName, placeAddr) {
  var msg = '[퍼플스] ' + targetName + '님 안심번호:' + safeNum + ' / ';
  msg += dateStr + ' ' + timeStr + ' ';
  msg += (placeName || '장소미정') + '/ ';
  msg += (placeAddr || '') + ' ';
  msg += '* 안내드린 안심번호가 후스콜, T전화, 단말기 자체에서 차단이 되어있는 경우에는 서비스 이용이 불가하오니 차단 유무를 확인해 주시기 바랍니다.';
  return msg;
}

/* ── 날짜/시간 포맷 헬퍼 ── */
function formatMeetingDateTime(dateVal, hourVal, minVal) {
  var d = new Date(dateVal);
  var days = ['일','월','화','수','목','금','토'];
  var dateStr = (d.getMonth()+1) + '월 ' + d.getDate() + '일 (' + days[d.getDay()] + ')';
  var h = parseInt(hourVal) || 14;
  var mm = parseInt(minVal) || 0;
  var ampm = h < 12 ? '오전' : '오후';
  var dh = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  var timeStr = ampm + ' ' + dh + '시' + (mm > 0 ? ' ' + mm + '분' : '');
  return { dateStr: dateStr, timeStr: timeStr };
}

/* ══════════════════════════════════════
   탭2: 만남약속관리
   ══════════════════════════════════════ */
function buildAppointmentTab(name1, name2, m, mt, ct1, ct2, id1, id2) {
  var body = '';

  /* 대상자 헤더 */
  body += memberHeader(name1, name2, ct1, ct2, id1, id2);

  /* 미팅 정보 입력 테이블 */
  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:90px"><col><col style="width:90px"><col></colgroup>';
  body += '<tbody>';

  // 미팅일자
  body += '<tr><td style="' + LB + '">미팅일자</td>';
  body += '<td style="' + VL + '"><input type="date" class="form-input" id="mm-appt-date" style="font-size:12px;padding:4px 8px;width:100%"></td>';
  // 미팅시간
  body += '<td style="' + LB + '">미팅시간</td>';
  body += '<td style="' + VL + '"><div style="display:flex;gap:4px;align-items:center">';
  body += '<input type="number" class="form-input" id="mm-appt-hour" value="14" min="0" max="23" style="font-size:12px;padding:4px 6px;width:50px;text-align:center">';
  body += '<span style="color:var(--text-muted)">시</span>';
  body += '<input type="number" class="form-input" id="mm-appt-min" value="00" min="0" max="59" step="10" style="font-size:12px;padding:4px 6px;width:50px;text-align:center">';
  body += '<span style="color:var(--text-muted)">분</span>';
  body += '</div></td></tr>';

  // 미팅장소
  body += '<tr><td style="' + LB + '">미팅장소</td>';
  body += '<td colspan="3" style="' + VL + '"><div style="display:flex;gap:6px;align-items:center">';
  body += '<input type="text" class="form-input" id="mm-appt-place-name" placeholder="장소명 (검색 후 자동입력)" style="font-size:12px;padding:4px 8px;flex:1" readonly>';
  body += '<button type="button" class="btn btn--outline btn--sm" id="mm-appt-place-search" style="font-size:11px;white-space:nowrap">장소검색</button>';
  body += '</div></td></tr>';

  // 안심번호
  body += '<tr><td style="' + LB + '">안심번호</td>';
  body += '<td colspan="3" style="' + VL + '">';
  body += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">';
  body += '<span id="mm-appt-safe-num" style="font-weight:700;font-size:13px;color:var(--primary)">070-7947-3821</span>';
  body += '<span style="font-size:11px;color:var(--text-muted)">' + name1 + '측: <b style="color:#1e3a5f">' + ct1 + '</b> / ' + name2 + '측: <b style="color:#ef4444">' + ct2 + '</b></span>';
  body += '<button type="button" class="btn btn--outline btn--sm" id="mm-appt-gen-safe" style="font-size:11px">안심번호발급</button>';
  body += '<button type="button" class="btn btn--outline btn--sm" id="mm-appt-chk-safe" style="font-size:11px">안심번호확인</button>';
  body += '</div>';
  body += '</td></tr>';

  // 자동발송제외
  body += '<tr><td style="' + LB + '">자동발송</td>';
  body += '<td colspan="3" style="' + VL + '">';
  body += '<label style="font-size:12px;cursor:pointer;display:flex;align-items:center;gap:5px">';
  body += '<input type="checkbox" id="mm-appt-no-auto-send"> 자동발송 제외';
  body += '</label>';
  body += '<div style="font-size:10px;color:var(--text-muted);margin-top:2px;text-align:left">* 체크 시 안내 SMS가 자동 발송되지 않으며, 수동 발송으로 전환됩니다.</div>';
  body += '</td></tr>';

  body += '</tbody></table>';

  /* SMS 미리보기 (미팅일 선택 시 표시) */
  body += '<div id="mm-appt-sms-preview" style="margin-top:10px;display:none">';
  body += '<div style="font-size:11px;font-weight:700;color:#333;margin-bottom:6px">발송 예정 문자 미리보기</div>';

  // 본인 회원 SMS
  body += '<div style="margin-bottom:8px">';
  body += '<div style="font-size:10px;font-weight:600;color:var(--primary);margin-bottom:3px">▸ ' + name1 + '님에게 발송</div>';
  body += '<div id="mm-appt-sms-text1" style="padding:8px 12px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:var(--radius-sm);font-size:11px;line-height:1.5;color:#0c4a6e;word-break:break-all"></div>';
  body += '</div>';

  // 상대 회원 SMS
  body += '<div>';
  body += '<div style="font-size:10px;font-weight:600;color:#ef4444;margin-bottom:3px">▸ ' + name2 + '님에게 발송</div>';
  body += '<div id="mm-appt-sms-text2" style="padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius-sm);font-size:11px;line-height:1.5;color:#991b1b;word-break:break-all"></div>';
  body += '</div>';
  body += '</div>';

  /* 등록 버튼 */
  body += '<div style="display:flex;justify-content:center;gap:8px;padding:16px 0">';
  body += '<button class="btn btn--ghost btn--sm" id="mm-appt-cancel" style="font-size:12px">취소</button>';
  body += '<button class="btn btn--primary btn--sm" id="mm-appt-submit" style="font-size:12px;padding:6px 28px">미팅 등록</button>';
  body += '</div>';

  return body;
}

/* ── 만남약속관리 탭 이벤트 바인딩 ── */
function bindAppointmentEvents(m, mt, name1, name2, mgr1, mgr2) {
  var selectedPlace = null;
  var safeNum = null;

  // 안심번호발급 버튼
  var genBtn = document.getElementById('mm-appt-gen-safe');
  if (genBtn) genBtn.addEventListener('click', function() {
    safeNum = generateSafeNumber();
    document.getElementById('mm-appt-safe-num').textContent = safeNum;
    document.getElementById('mm-appt-safe-num').style.color = 'var(--primary)';
    Toast.show('안심번호가 발급되었습니다: ' + safeNum, 'success');
    updateSmsPreview();
  });

  // 안심번호확인 버튼
  var chkBtn = document.getElementById('mm-appt-chk-safe');
  if (chkBtn) chkBtn.addEventListener('click', function() {
    var num = document.getElementById('mm-appt-safe-num').textContent;
    if (!num || num === '미발급') {
      Toast.show('발급된 안심번호가 없습니다.', 'warning');
      return;
    }
    Toast.show('안심번호 [' + num + '] 유효 상태 확인 완료', 'success');
  });

  // SMS 미리보기 업데이트
  function updateSmsPreview() {
    var dateVal = document.getElementById('mm-appt-date').value;
    var previewWrap = document.getElementById('mm-appt-sms-preview');
    if (!dateVal) { previewWrap.style.display = 'none'; return; }

    // 미리보기용 임시 안심번호 표시
    var previewSafe = safeNum || '(D-1 생성 예정)';
    var hourVal = document.getElementById('mm-appt-hour').value;
    var minVal = document.getElementById('mm-appt-min').value;
    var pName = selectedPlace ? selectedPlace.name : (document.getElementById('mm-appt-place-name').value || '');
    var pAddr = selectedPlace ? selectedPlace.addr : '';

    var fmt = formatMeetingDateTime(dateVal, hourVal, minVal);

    var sms1 = buildMeetingSms(name2, previewSafe, fmt.dateStr, fmt.timeStr, pName, pAddr);
    var sms2 = buildMeetingSms(name1, previewSafe, fmt.dateStr, fmt.timeStr, pName, pAddr);

    document.getElementById('mm-appt-sms-text1').textContent = sms1;
    document.getElementById('mm-appt-sms-text2').textContent = sms2;
    previewWrap.style.display = 'block';
  }

  // 미팅일/시간 변경 시 업데이트
  ['mm-appt-date','mm-appt-hour','mm-appt-min'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', updateSmsPreview);
  });

  // 장소 검색
  var placeBtn = document.getElementById('mm-appt-place-search');
  if (placeBtn) placeBtn.addEventListener('click', function() {
    PlaceSearch.open(function(sel) {
      selectedPlace = sel;
      document.getElementById('mm-appt-place-name').value = sel.name;
      updateSmsPreview();
    }, document.getElementById('mm-appt-place-name').value || '');
  });

  // 취소
  var cancelBtn = document.getElementById('mm-appt-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

  // 미팅 등록
  var submitBtn = document.getElementById('mm-appt-submit');
  if (submitBtn) submitBtn.addEventListener('click', function() {
    var dateVal = document.getElementById('mm-appt-date').value;
    var hourVal = document.getElementById('mm-appt-hour').value;
    var minVal = document.getElementById('mm-appt-min').value;
    var placeName = document.getElementById('mm-appt-place-name').value.trim();

    if (!dateVal) { Toast.show('미팅일자를 선택해주세요.', 'warning'); return; }
    if (!placeName) { Toast.show('미팅 장소를 검색해주세요.', 'warning'); return; }

    var fmt = formatMeetingDateTime(dateVal, hourVal, minVal);
    var noAutoSend = document.getElementById('mm-appt-no-auto-send').checked;

    Modal.hide();
    Toast.show('미팅이 등록되었습니다. (' + fmt.dateStr + ' ' + fmt.timeStr + ' ' + placeName + ')', 'success');

    if (noAutoSend) {
      setTimeout(function() {
        Toast.show('자동발송 제외 — 안내 SMS는 수동 발송으로 전환됩니다.', 'warning');
      }, 500);
    } else {
      setTimeout(function() {
        Toast.show('양측 회원에게 안내 SMS가 자동 발송됩니다.', 'info');
      }, 500);
    }
  });
}

/* ══════════════════════════════════════
   탭3: 만남후기관리
   ══════════════════════════════════════ */
function buildReviewTab(name1, name2, m, mt, ct1, ct2, id1, id2) {
  var body = '';
  var remain1 = m.remainCount != null ? m.remainCount : 5;
  var total1 = m.totalCount != null ? m.totalCount : 10;

  /* 대상자 헤더 (만남후기 전용 — 연락대상 대신 미팅횟수) */
  var h = '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed;margin-bottom:12px">';
  h += '<colgroup><col style="width:90px"><col><col style="width:90px"><col></colgroup>';
  h += '<tbody>';
  h += '<tr>';
  h += '<td style="' + LB + '">담당회원</td><td style="' + VL + ';font-weight:700;color:var(--primary)">' + name1 + ' <span style="font-size:11px;font-weight:400;color:var(--text-muted)">(' + id1 + ')</span></td>';
  h += '<td style="' + LB + '">상대회원</td><td style="' + VL + ';font-weight:700;color:#ef4444">' + name2 + ' <span style="font-size:11px;font-weight:400;color:var(--text-muted)">(' + id2 + ')</span></td>';
  h += '</tr>';
  h += '<tr>';
  var remain2 = mt.members[1].remainCount != null ? mt.members[1].remainCount : 4;
  var total2 = mt.members[1].totalCount != null ? mt.members[1].totalCount : 8;
  h += '<td style="' + LB + '">미팅횟수</td><td style="' + VL + ';font-weight:700;color:var(--primary)">' + remain1 + '회 / ' + total1 + '회</td>';
  h += '<td style="' + LB + '">미팅횟수</td><td style="' + VL + ';font-weight:700;color:#ef4444">' + remain2 + '회 / ' + total2 + '회</td>';
  h += '</tr>';
  h += '</tbody></table>';
  body += h;

  // 입력구분
  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:90px"><col></colgroup><tbody>';
  body += '<tr><td style="' + LB + '">입력구분</td>';
  body += '<td style="' + VL + '">';
  body += '<div style="display:flex;gap:10px">';
  body += '<label style="font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="radio" name="mm-review-status" value="confirm" checked> 결과확인</label>';
  body += '<label style="font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="radio" name="mm-review-status" value="noshow"> 펑크</label>';
  body += '<label style="font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="radio" name="mm-review-status" value="cancel"> 취소</label>';
  body += '</div></td></tr>';
  body += '</tbody></table>';

  /* ── 결과확인 영역 ── */
  body += '<div id="mm-review-confirm-area" style="margin-top:12px">';
  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:90px"><col></colgroup><tbody>';
  body += '<tr><td style="' + LB + ';color:var(--primary)">' + name1 + '<br>피드백</td>';
  body += '<td style="' + VL + '"><textarea class="form-input" id="mm-review-feedback1" rows="3" style="font-size:12px;padding:6px 8px;width:100%;resize:vertical" placeholder="' + name1 + '님의 미팅 피드백을 입력하세요"></textarea></td></tr>';
  body += '<tr><td style="' + LB + ';color:#ef4444">' + name2 + '<br>피드백</td>';
  body += '<td style="' + VL + '"><textarea class="form-input" id="mm-review-feedback2" rows="3" style="font-size:12px;padding:6px 8px;width:100%;resize:vertical" placeholder="' + name2 + '님의 미팅 피드백을 입력하세요"></textarea></td></tr>';
  body += '<tr><td style="' + LB + '">매니저<br>종합메모</td>';
  body += '<td style="' + VL + '"><textarea class="form-input" id="mm-review-memo" rows="2" style="font-size:12px;padding:6px 8px;width:100%;resize:vertical" placeholder="매니저 종합 메모 (선택)"></textarea></td></tr>';
  body += '</tbody></table></div>';

  /* ── 펑크/취소 영역 ── */
  body += '<div id="mm-review-fault-area" style="display:none;margin-top:12px">';
  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:90px"><col></colgroup><tbody>';
  body += '<tr><td style="' + LB + '">귀책당사자</td><td style="' + VL + '">';
  body += '<div style="display:flex;gap:10px">';
  body += '<label style="font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="radio" name="mm-fault-person" value="self"> ' + name1 + '</label>';
  body += '<label style="font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="radio" name="mm-fault-person" value="target"> ' + name2 + '</label>';
  body += '</div></td></tr>';
  body += '<tr><td style="' + LB + '">사유구분</td><td style="' + VL + '">';
  body += '<select class="form-input" id="mm-fault-reason" style="font-size:12px;padding:4px 8px;width:100%">';
  body += '<option value="">-- 선택 --</option><option value="일정변경">일정변경 (개인 사정)</option><option value="연락두절">연락두절</option><option value="프로필불만">프로필 불만</option><option value="건강사유">건강 사유</option><option value="가족사유">가족 사유</option><option value="기타">기타</option>';
  body += '</select></td></tr>';
  body += '<tr><td style="' + LB + '">상세사유</td>';
  body += '<td style="' + VL + '"><textarea class="form-input" id="mm-fault-detail" rows="2" style="font-size:12px;padding:6px 8px;width:100%;resize:vertical" placeholder="상세 사유를 입력하세요 (필수)"></textarea></td></tr>';
  body += '</tbody></table>';
  body += '<div id="mm-fault-penalty-info" style="margin-top:8px;padding:8px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:var(--radius-sm);font-size:11px;line-height:1.6;color:#9a3412;display:none"></div>';
  body += '</div>';

  /* 등록 버튼 */
  body += '<div style="display:flex;justify-content:center;gap:8px;padding:16px 0">';
  body += '<button class="btn btn--ghost btn--sm" id="mm-review-cancel" style="font-size:12px">취소</button>';
  body += '<button class="btn btn--primary btn--sm" id="mm-review-submit" style="font-size:12px;padding:6px 28px">후기 등록</button>';
  body += '</div>';

  return body;
}

/* ── 만남후기관리 탭 이벤트 바인딩 ── */
function bindReviewEvents(m, mt, name1, name2) {
  var confirmArea = document.getElementById('mm-review-confirm-area');
  var faultArea = document.getElementById('mm-review-fault-area');
  var penaltyInfo = document.getElementById('mm-fault-penalty-info');

  // 입력구분 변경 → 영역 분기
  document.querySelectorAll('input[name="mm-review-status"]').forEach(function(r) {
    r.addEventListener('change', function() {
      var isFault = this.value === 'noshow' || this.value === 'cancel';
      confirmArea.style.display = isFault ? 'none' : 'block';
      faultArea.style.display = isFault ? 'block' : 'none';
    });
    if (r.checked) r.dispatchEvent(new Event('change'));
  });

  // 귀책 당사자 선택 → 페널티 안내
  document.querySelectorAll('input[name="mm-fault-person"]').forEach(function(r) {
    r.addEventListener('change', function() {
      var status = document.querySelector('input[name="mm-review-status"]:checked').value;
      var statusLabel = status === 'noshow' ? '펑크' : '취소';
      var faultName = this.value === 'self' ? name1 : name2;
      var victimName = this.value === 'self' ? name2 : name1;
      penaltyInfo.style.display = 'block';
      penaltyInfo.innerHTML = '<div style="font-weight:700;margin-bottom:4px">횟수 차감/원복 자동 정산 안내</div>'
        + '<div>• <b style="color:#dc2626">' + faultName + '</b> (귀책자): ' + statusLabel + ' 페널티로 <b>1회 차감 유지</b></div>'
        + '<div>• <b style="color:#16a34a">' + victimName + '</b> (피해자): 차감 횟수 <b style="color:#16a34a">1회 원복(복구)</b> 처리</div>'
        + '<div style="margin-top:4px;font-size:10px;color:#78350f">* 등록 완료 시 시스템에서 자동 처리됩니다.</div>';
    });
  });

  // 취소
  var cancelBtn = document.getElementById('mm-review-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

  // 후기 등록
  var submitBtn = document.getElementById('mm-review-submit');
  if (submitBtn) submitBtn.addEventListener('click', function() {
    var status = document.querySelector('input[name="mm-review-status"]:checked').value;
    var isFault = status === 'noshow' || status === 'cancel';
    var statusLabel = { noshow:'펑크', cancel:'취소', confirm:'결과확인' };

    if (isFault) {
      var faultPerson = document.querySelector('input[name="mm-fault-person"]:checked');
      if (!faultPerson) { Toast.show('귀책 당사자를 선택해주세요.', 'warning'); return; }
      var reason = document.getElementById('mm-fault-reason').value;
      if (!reason) { Toast.show('사유구분을 선택해주세요.', 'warning'); return; }
      var detail = (document.getElementById('mm-fault-detail').value || '').trim();
      if (!detail) { Toast.show('상세 사유를 입력해주세요.', 'warning'); return; }
    }

    if (status === 'confirm') {
      var fb1 = (document.getElementById('mm-review-feedback1').value || '').trim();
      var fb2 = (document.getElementById('mm-review-feedback2').value || '').trim();
      if (!fb1 && !fb2) { Toast.show('최소 한 명의 피드백을 입력해주세요.', 'warning'); return; }
    }

    Modal.hide();
    Toast.show('만남후기가 등록되었습니다. [' + statusLabel[status] + ']', 'success');

    if (isFault) {
      var fName = faultPerson.value === 'self' ? name1 : name2;
      var vName = faultPerson.value === 'self' ? name2 : name1;
      setTimeout(function() { Toast.show(fName + ' 1회 차감 유지 (페널티)', 'warning'); }, 500);
      setTimeout(function() { Toast.show(vName + ' 1회 원복 완료 (피해자 보호)', 'success'); }, 1000);
    } else if (status === 'confirm') {
      setTimeout(function() { Toast.show('양측 회원 각 1회 정상 차감 처리 완료', 'info'); }, 500);
    }
  });
}

/* ══════════════════════════════════════
   메인: 미팅관리 모달 (3탭)
   ══════════════════════════════════════ */
var MGR_MAP = {'김영희':'서다현','박서연':'정유리','이지은':'강보라','한소희':'최은별','윤지아':'서다현','최민아':'정유리','정다은':'강보라','오수진':'최은별','임하윤':'서다현','송예린':'정유리','이영수':'박지영','임지호':'서다현','정우진':'정유리','김도윤':'강보라','오태현':'최은별','박민수':'서다현','최성준':'정유리','한재원':'강보라','강현우':'최은별','윤시우':'서다현','김미봉':'서다현','최서연':'정유리','박하은':'강보라','이지아':'최은별','정수민':'서다현','한예진':'정유리','오다은':'강보라','윤서영':'최은별','장민지':'서다현','송지우':'정유리'};

export function showMeetingManageModal(mt, m) {
  var name1 = mt.members[0].name;
  var name2 = mt.members[1].name;
  var mgr1 = m.matchingManager || '-';
  var mgr2 = MGR_MAP[name2] || '-';

  /* 연락대상 구분 — 대표연락처 기준 (DB에서 가져올 값, 현재 더미) */
  var ct1 = m.contactTarget || '부';   // 담당회원 연락대상
  var ct2 = mt.members[1].contactTarget || '본인'; // 상대회원 연락대상

  /* 회원 ID */
  var ID_MAP = {'최서연':'2f00904','정수민':'1m00905','박서연':'1f00902','김영희':'2f00901','이지은':'1f00903','한소희':'2f00906','윤지아':'1f00907','최민아':'2f00908','정다은':'1f00909','오수진':'2f00910','임하윤':'1f00911','송예린':'2f00912','이영수':'1m00913','임지호':'1m00914','정우진':'1m00915','김도윤':'1m00916','오태현':'1m00917','박민수':'1m00918','최성준':'1m00919','한재원':'1m00920','강현우':'1m00921','윤시우':'1m00922'};
  var id1 = m.memberId || mt.members[0].memberId || ID_MAP[name1] || '-';
  var id2 = mt.members[1].memberId || ID_MAP[name2] || '-';

  var body = '';

  /* 탭 네비게이션 — 인트라넷 표준 tabs__nav / tabs__btn */
  body += '<div class="tabs__nav" style="margin-bottom:10px">';
  body += '<button class="tabs__btn active" data-target="mm-tab-contact">연락관리</button>';
  body += '<button class="tabs__btn" data-target="mm-tab-appt">만남약속관리</button>';
  body += '<button class="tabs__btn" data-target="mm-tab-review">만남후기관리</button>';
  body += '</div>';

  /* 탭 패널 */
  body += '<div id="mm-tab-contact" class="tab-panel active">' + buildContactTab(name1, name2, m, mt, ct1, ct2, id1, id2) + '</div>';
  body += '<div id="mm-tab-appt" class="tab-panel">' + buildAppointmentTab(name1, name2, m, mt, ct1, ct2, id1, id2) + '</div>';
  body += '<div id="mm-tab-review" class="tab-panel">' + buildReviewTab(name1, name2, m, mt, ct1, ct2, id1, id2) + '</div>';

  Modal.show({
    title: '미팅관리 — ' + name1 + ' / ' + name2,
    size: 'lg',
    content: body
  });

  setTimeout(function() {
    /* 탭 전환 — 표준 클래스 기반 */
    var modalEl = document.querySelector('.modal__body') || document;
    modalEl.querySelectorAll('.tabs__btn').forEach(function(tab) {
      tab.addEventListener('click', function() {
        modalEl.querySelectorAll('.tabs__btn').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        modalEl.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
        var target = document.getElementById(this.dataset.target);
        if (target) target.classList.add('active');
      });
    });

    bindContactEvents(m);
    bindAppointmentEvents(m, mt, name1, name2, mgr1, mgr2);
    bindReviewEvents(m, mt, name1, name2);
  }, 120);
}
