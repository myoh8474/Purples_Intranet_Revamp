/* ========================================
   트리니티 관리
   - 다이아몬드 이상 정회원 바우처 발송 목록
   - 기간 검색, 엑셀 저장
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';

initLayout({ pageId: 'regular-trinity', breadcrumbs: ['정회원 관리', '트리니티 관리'] });
var root = document.getElementById('content');

var SK = 'purples_trinity_v2';

/* ── 더미 데이터 ── */
function loadData() {
  var s = localStorage.getItem(SK);
  if (s) try { return JSON.parse(s); } catch(e){}

  var data = [
    {id:1,branch:'본사',name:'김수진',gender:'여',birth:'1997-03-15',program:'다이아몬드 A',phone:'010-1234-5678',cMgr:'이지연',mMgr:'정다은',joinDate:'2026-01-10',voucherDate:'2026-01-12',meeting1:'2026-02-05',receipt:'2026-01-14',gift:'2026-01-20',memo:'VIP 전환 예정'},
    {id:2,branch:'경기',name:'최동우',gender:'남',birth:'1992-08-22',program:'로얄 다이아',phone:'010-2345-6789',cMgr:'박수정',mMgr:'오세훈',joinDate:'2026-01-15',voucherDate:'2026-01-17',meeting1:'2026-02-10',receipt:'2026-01-19',gift:'',memo:''},
    {id:3,branch:'본사',name:'박준혁',gender:'남',birth:'1994-11-03',program:'다이아몬드 프리미엄',phone:'010-3456-7890',cMgr:'이지연',mMgr:'이민지',joinDate:'2026-02-01',voucherDate:'2026-02-03',meeting1:'2026-03-01',receipt:'2026-02-05',gift:'2026-02-10',memo:'상품권 수령 확인'},
    {id:4,branch:'부산',name:'윤지아',gender:'여',birth:'1998-05-28',program:'다이아몬드 A',phone:'010-4567-8901',cMgr:'한소영',mMgr:'박지훈',joinDate:'2026-02-10',voucherDate:'2026-02-12',meeting1:'',receipt:'',gift:'',memo:'미팅 일정 조율 중'},
    {id:5,branch:'본사',name:'이하은',gender:'여',birth:'1999-07-14',program:'VIP 프로그램',phone:'010-5678-9012',cMgr:'최영미',mMgr:'송예린',joinDate:'2026-02-20',voucherDate:'2026-02-22',meeting1:'2026-03-15',receipt:'2026-02-24',gift:'',memo:''},
    {id:6,branch:'대전',name:'배유나',gender:'여',birth:'1997-12-01',program:'다이아몬드 A',phone:'010-6789-0123',cMgr:'최영미',mMgr:'정다은',joinDate:'2026-03-05',voucherDate:'2026-03-07',meeting1:'2026-04-01',receipt:'2026-03-09',gift:'2026-03-15',memo:''},
    {id:7,branch:'경기',name:'강태현',gender:'남',birth:'1991-02-18',program:'VVIP 프로그램',phone:'010-7890-1234',cMgr:'박수정',mMgr:'오세훈',joinDate:'2026-03-10',voucherDate:'2026-03-12',meeting1:'2026-04-05',receipt:'',gift:'',memo:'수령증 발송 예정'},
    {id:8,branch:'본사',name:'정예린',gender:'여',birth:'1995-09-07',program:'로얄 다이아',phone:'010-8901-2345',cMgr:'이지연',mMgr:'이민지',joinDate:'2026-03-20',voucherDate:'2026-03-22',meeting1:'',receipt:'',gift:'',memo:''},
    {id:9,branch:'대구',name:'조현우',gender:'남',birth:'1996-04-25',program:'다이아몬드 프리미엄',phone:'010-9012-3456',cMgr:'김태희',mMgr:'박지훈',joinDate:'2026-04-01',voucherDate:'2026-04-03',meeting1:'2026-04-20',receipt:'2026-04-05',gift:'2026-04-10',memo:''},
    {id:10,branch:'광주',name:'한서연',gender:'여',birth:'1996-06-30',program:'다이아몬드 A',phone:'010-0123-4567',cMgr:'김태희',mMgr:'송예린',joinDate:'2026-04-10',voucherDate:'2026-04-12',meeting1:'2026-05-01',receipt:'2026-04-14',gift:'',memo:''},
    {id:11,branch:'본사',name:'문지원',gender:'여',birth:'1994-01-11',program:'VIP 프로그램',phone:'010-1111-2222',cMgr:'이지연',mMgr:'정다은',joinDate:'2026-04-15',voucherDate:'2026-04-17',meeting1:'',receipt:'',gift:'',memo:'연락 대기'},
    {id:12,branch:'부산',name:'송민재',gender:'남',birth:'1993-10-20',program:'다이아몬드 A',phone:'010-2222-3333',cMgr:'한소영',mMgr:'오세훈',joinDate:'2026-04-25',voucherDate:'2026-04-27',meeting1:'2026-05-10',receipt:'2026-04-29',gift:'2026-05-05',memo:''},
    {id:13,branch:'경기',name:'신동건',gender:'남',birth:'1998-03-09',program:'로얄 다이아',phone:'010-3333-4444',cMgr:'박수정',mMgr:'이민지',joinDate:'2026-05-01',voucherDate:'2026-05-03',meeting1:'',receipt:'',gift:'',memo:''},
    {id:14,branch:'본사',name:'오수빈',gender:'여',birth:'2000-08-16',program:'다이아몬드 프리미엄',phone:'010-4444-5555',cMgr:'최영미',mMgr:'박지훈',joinDate:'2026-05-05',voucherDate:'2026-05-07',meeting1:'',receipt:'',gift:'',memo:'바우처 발송 완료'},
    {id:15,branch:'대전',name:'류서영',gender:'여',birth:'1999-11-22',program:'다이아몬드 A',phone:'010-5555-6666',cMgr:'김태희',mMgr:'송예린',joinDate:'2026-05-10',voucherDate:'2026-05-12',meeting1:'',receipt:'',gift:'',memo:''},
  ];
  localStorage.setItem(SK, JSON.stringify(data));
  return data;
}
function save(d) { localStorage.setItem(SK, JSON.stringify(d)); }

/* ── 렌더 ── */
function render() {
  var data = loadData();

  var today = new Date().toISOString().slice(0,10);
  var yearStart = today.slice(0,4) + '-01-01';

  var h = '<div class="page-header" style="margin-bottom:20px;"><div>';
  h += '<h1 class="page-header__title">트리니티 관리</h1>';
  h += '<p class="page-header__subtitle">다이아몬드 이상 바우처 발송 회원 관리</p>';
  h += '</div></div>';

  // 검색 필터 (std-table 형식)
  h += '<table class="std-table" style="margin-bottom:0;table-layout:fixed;">';
  h += '<colgroup><col style="width:80px"><col><col style="width:80px"><col></colgroup>';
  h += '<tbody>';
  h += '<tr>';
  h += '<th>회원명</th>';
  h += '<td><input type="text" class="form-input form-input--sm" id="f-name" placeholder="회원명 검색" style="width:100%;"></td>';
  h += '<th>바우처발송일</th>';
  h += '<td>';
  h += '<div style="display:flex;align-items:center;gap:4px;">';
  h += '<input type="date" class="form-input form-input--sm" id="f-start" value="'+yearStart+'" style="width:130px;">';
  h += '<span style="font-size:11px;color:#94a3b8;">~</span>';
  h += '<input type="date" class="form-input form-input--sm" id="f-end" value="'+today+'" style="width:130px;">';
  h += '</div>';
  h += '</td>';
  h += '</tr>';
  h += '</tbody></table>';
  h += '<div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px;">';
  h += '<button class="btn btn--secondary btn--sm" id="btn-search">검색</button>';
  h += '<button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>';
  h += '</div>';

  // 결과 건수
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0 6px;">';
  h += '<div style="font-size:13px;font-weight:600;color:var(--text-secondary);">조회 결과 <span style="color:var(--accent);" id="total-count">'+data.length+'</span>건</div>';
  h += '<button class="btn btn--outline btn--sm" id="btn-excel">엑셀 다운로드</button>';
  h += '</div>';

  // 리스트 테이블
  h += '<table class="std-table" style="white-space:nowrap;font-size:12px;" id="trinity-table"><thead><tr>';
  h += '<th style="width:40px">No</th>';
  h += '<th style="width:55px">지사</th>';
  h += '<th style="width:65px">회원명</th>';
  h += '<th style="width:35px">성별</th>';
  h += '<th style="width:80px">생년월일</th>';
  h += '<th style="width:110px">프로그램명</th>';
  h += '<th style="width:110px">연락처</th>';
  h += '<th style="width:65px">상담매니저</th>';
  h += '<th style="width:65px">매칭매니저</th>';
  h += '<th style="width:85px">가입일</th>';
  h += '<th style="width:85px">바우처발송일</th>';
  h += '<th style="width:85px">1회미팅일</th>';
  h += '<th style="width:80px">수령증발송</th>';
  h += '<th style="width:80px">상품권발송</th>';
  h += '<th style="min-width:120px">메모</th>';
  h += '</tr></thead><tbody id="tbody"></tbody></table>';

  root.innerHTML = h;

  renderTable(data);

  document.getElementById('btn-search').onclick = function() {
    var s = document.getElementById('f-start').value;
    var e = document.getElementById('f-end').value;
    var nameVal = (document.getElementById('f-name').value || '').trim();
    var filtered = data.filter(function(d) {
      if (nameVal && d.name.indexOf(nameVal) === -1) return false;
      if (!d.voucherDate) return false;
      if (s && d.voucherDate < s) return false;
      if (e && d.voucherDate > e) return false;
      return true;
    });
    renderTable(filtered);
  };

  document.getElementById('btn-reset').onclick = function() {
    document.getElementById('f-name').value = '';
    document.getElementById('f-start').value = yearStart;
    document.getElementById('f-end').value = today;
    renderTable(data);
  };

  document.getElementById('btn-excel').onclick = function() {
    exportExcel();
  };
}

function renderTable(list) {
  var tbody = document.getElementById('tbody');

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="15" class="tc text-muted" style="padding:24px">데이터가 없습니다</td></tr>';
    document.getElementById('total-count').textContent = '0';
    return;
  }

  var h = '';
  for (var i = 0; i < list.length; i++) {
    var d = list[i];
    h += '<tr>';
    h += '<td class="tc">'+(i+1)+'</td>';
    h += '<td class="tc">'+d.branch+'</td>';
    h += '<td class="tc col-name" style="cursor:pointer;color:var(--accent)">'+d.name+'</td>';
    h += '<td class="tc">'+d.gender+'</td>';
    h += '<td class="tc">'+d.birth+'</td>';
    h += '<td class="tc" style="font-size:11px">'+d.program+'</td>';
    h += '<td class="tc">'+d.phone+'</td>';
    h += '<td class="tc">'+d.cMgr+'</td>';
    h += '<td class="tc">'+d.mMgr+'</td>';
    h += '<td class="tc" style="white-space:nowrap">'+d.joinDate+'</td>';
    h += '<td class="tc" style="white-space:nowrap">'+d.voucherDate+'</td>';
    h += '<td class="tc" style="white-space:nowrap">'+(d.meeting1 || '<span class="text-muted">-</span>')+'</td>';
    // 수령증 발송
    if (d.receipt && d.receipt !== 'N') {
      h += '<td class="tc" style="white-space:nowrap;font-size:11px"><span class="badge badge--green" style="font-size:10px">'+d.receipt+'</span></td>';
    } else {
      h += '<td class="tc"><button class="btn btn--primary btn--sm" data-receipt-id="'+d.id+'" style="font-size:11px;padding:2px 10px">발송</button></td>';
    }
    // 상품권 발송
    if (d.gift && d.gift !== 'N') {
      h += '<td class="tc" style="white-space:nowrap;font-size:11px"><span class="badge badge--green" style="font-size:10px">'+d.gift+'</span></td>';
    } else {
      h += '<td class="tc"><button class="btn btn--primary btn--sm" data-gift-id="'+d.id+'" style="font-size:11px;padding:2px 10px">발송</button></td>';
    }
    // 메모 — 텍스트 직접 표시 + 수정 버튼
    h += '<td style="font-size:11px;padding:4px 8px;max-width:180px">';
    if (d.memo) {
      h += '<span style="color:var(--text-primary)">'+d.memo+'</span> ';
    }
    h += '<button class="btn btn--secondary btn--sm" data-memo-id="'+d.id+'" style="font-size:10px;padding:1px 6px">'+(d.memo ? '수정' : '추가')+'</button>';
    h += '</td>';
    h += '</tr>';
  }
  tbody.innerHTML = h;
  document.getElementById('total-count').textContent = list.length;

  // 이벤트 위임
  tbody.onclick = function(e) {
    var memoBtn = e.target.closest('[data-memo-id]');
    if (memoBtn) {
      var mid = parseInt(memoBtn.getAttribute('data-memo-id'));
      openMemoModal(mid);
      return;
    }
    var recBtn = e.target.closest('[data-receipt-id]');
    if (recBtn) {
      var rid = parseInt(recBtn.getAttribute('data-receipt-id'));
      handleSend('receipt', rid, '수령증');
      return;
    }
    var giftBtn = e.target.closest('[data-gift-id]');
    if (giftBtn) {
      var gid = parseInt(giftBtn.getAttribute('data-gift-id'));
      handleSend('gift', gid, '상품권');
      return;
    }
  };
}

/* ── 수령증/상품권 발송 처리 ── */
function handleSend(type, id, label) {
  var data = loadData();
  var item = null;
  for (var i = 0; i < data.length; i++) {
    if (data[i].id === id) { item = data[i]; break; }
  }
  if (!item) return;

  if (!confirm(item.name + ' 회원에게 ' + label + '을 발송하시겠습니까?')) return;

  var today = new Date().toISOString().slice(0,10);
  if (type === 'receipt') item.receipt = today;
  else item.gift = today;

  save(data);
  Toast.show(item.name + ' 회원에게 ' + label + ' 발송이 완료되었습니다.', 'success');
  document.getElementById('btn-search').click();
}

/* ── 메모 모달 ── */
function openMemoModal(id) {
  var data = loadData();
  var item = null;
  for (var i = 0; i < data.length; i++) {
    if (data[i].id === id) { item = data[i]; break; }
  }
  if (!item) return;

  var wrap = document.createElement('div');
  wrap.id = 'memo-modal';
  var mh = '<div id="memo-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.4);z-index:9000;display:flex;align-items:center;justify-content:center">';
  mh += '<div style="background:#fff;border-radius:10px;width:400px;max-width:90vw;box-shadow:0 15px 40px rgba(0,0,0,.25)" onclick="event.stopPropagation()">';
  mh += '<div style="padding:14px 18px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">';
  mh += '<h3 style="margin:0;font-size:14px;font-weight:700">메모 - '+item.name+'</h3>';
  mh += '<button id="memo-close" style="background:none;border:none;font-size:14px;cursor:pointer;color:#999;padding:4px">X</button>';
  mh += '</div>';
  mh += '<div style="padding:18px">';
  mh += '<textarea id="memo-text" style="width:100%;height:100px;padding:10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;resize:vertical;box-sizing:border-box">'+(item.memo||'')+'</textarea>';
  mh += '</div>';
  mh += '<div style="padding:10px 18px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:8px">';
  mh += '<button id="memo-cancel" class="btn btn--secondary btn--sm">취소</button>';
  mh += '<button id="memo-save" class="btn btn--primary btn--sm">저장</button>';
  mh += '</div>';
  mh += '</div></div>';
  wrap.innerHTML = mh;
  document.body.appendChild(wrap);

  function close() { var el = document.getElementById('memo-modal'); if(el) el.remove(); }

  document.getElementById('memo-close').onclick = close;
  document.getElementById('memo-cancel').onclick = close;
  document.getElementById('memo-overlay').onclick = function(e) { if(e.target.id==='memo-overlay') close(); };

  document.getElementById('memo-save').onclick = function() {
    var text = document.getElementById('memo-text').value.trim();
    item.memo = text;
    save(data);
    close();
    Toast.show('메모가 저장되었습니다.', 'success');
    document.getElementById('btn-search').click();
  };
}

/* ── 엑셀 저장 ── */
function exportExcel() {
  var table = document.getElementById('trinity-table');
  if (!table) return;

  var rows = table.querySelectorAll('tr');
  var csv = '\uFEFF';

  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].querySelectorAll('th, td');
    var row = [];
    for (var j = 0; j < cells.length; j++) {
      var text = cells[j].textContent.replace(/"/g, '""').trim();
      row.push('"' + text + '"');
    }
    csv += row.join(',') + '\n';
  }

  var today = new Date().toISOString().slice(0,10).replace(/-/g,'');
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = '트리니티회원_' + today + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  Toast.show('엑셀 파일이 다운로드됩니다.', 'success');
}

render();
