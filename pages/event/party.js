/* ========================================
   파티/행사 관리
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';

initLayout({ pageId: 'event-party', breadcrumbs: ['행사관리', '파티/행사 관리'] });
var root = document.getElementById('content');

var SK = 'purples_party_v4';
var MK = 'purples_party_mdb_v4';

/* ── 회원 DB ── */
function getMembers() {
  var s = localStorage.getItem(MK);
  if (s) try { return JSON.parse(s); } catch(e){}
  var db = [
    {id:'P2024001',name:'김수진',gender:'여',birth:1997,phone:'010-1234-5678',mgr:'박매니저'},
    {id:'P2024008',name:'최동우',gender:'남',birth:1992,phone:'010-2345-6789',mgr:'이매니저'},
    {id:'P2024015',name:'박준혁',gender:'남',birth:1994,phone:'010-3456-7890',mgr:'박매니저'},
    {id:'P2024019',name:'윤지아',gender:'여',birth:1998,phone:'010-4567-8901',mgr:'김매니저'},
    {id:'P2024023',name:'이하은',gender:'여',birth:1999,phone:'010-5678-9012',mgr:'이매니저'},
    {id:'P2024033',name:'배유나',gender:'여',birth:1997,phone:'010-6789-0123',mgr:'박매니저'},
    {id:'P2024037',name:'강태현',gender:'남',birth:1991,phone:'010-7890-1234',mgr:'김매니저'},
    {id:'P2024042',name:'정예린',gender:'여',birth:1995,phone:'010-8901-2345',mgr:'이매니저'},
    {id:'P2024044',name:'조현우',gender:'남',birth:1996,phone:'010-9012-3456',mgr:'박매니저'},
    {id:'P2024055',name:'한서연',gender:'여',birth:1996,phone:'010-0123-4567',mgr:'김매니저'},
    {id:'P2024056',name:'문지원',gender:'여',birth:1994,phone:'010-1111-2222',mgr:'이매니저'},
    {id:'P2024061',name:'송민재',gender:'남',birth:1993,phone:'010-2222-3333',mgr:'박매니저'},
    {id:'P2024067',name:'신동건',gender:'남',birth:1998,phone:'010-3333-4444',mgr:'김매니저'},
    {id:'P2024072',name:'오수빈',gender:'여',birth:2000,phone:'010-4444-5555',mgr:'이매니저'},
    {id:'P2024078',name:'류서영',gender:'여',birth:1999,phone:'010-5555-6666',mgr:'박매니저'},
    {id:'P2024088',name:'임도현',gender:'남',birth:1995,phone:'010-6666-7777',mgr:'김매니저'},
    {id:'P2024089',name:'황재민',gender:'남',birth:1993,phone:'010-7777-8888',mgr:'이매니저'},
    {id:'P2024095',name:'나은채',gender:'여',birth:2001,phone:'010-8888-9999',mgr:'박매니저'},
    {id:'P2024102',name:'서지훈',gender:'남',birth:1990,phone:'010-9999-0000',mgr:'김매니저'},
    {id:'P2024110',name:'장하린',gender:'여',birth:1998,phone:'010-1010-2020',mgr:'이매니저'},
  ];
  localStorage.setItem(MK, JSON.stringify(db));
  return db;
}

/* ── 파티 데이터 ── */
function loadParties() {
  var s = localStorage.getItem(SK);
  if (s) try { return JSON.parse(s); } catch(e){}
  var d = [
    {id:1,name:'2026 봄맞이 싱글 파티',date:'2026-04-12',time:'14:00',loc:'서울 강남 퍼플스홀',type:'정기파티',fee:50000,cap:30,status:'완료',
     att:[
       {id:'P2024001',name:'김수진',gender:'여',birth:1997,mgr:'박매니저',pay:'이니페이',amt:50000,ps:'완료',reg:'인포(admin)',rd:'2026-04-10'},
       {id:'P2024015',name:'박준혁',gender:'남',birth:1994,mgr:'박매니저',pay:'무통장입금',amt:50000,ps:'완료',reg:'인포(admin)',rd:'2026-04-10'},
     ]},
    {id:2,name:'5월 프리미엄 디너 파티',date:'2026-05-17',time:'18:30',loc:'서울 청담 르메르디앙',type:'프리미엄',fee:80000,cap:20,status:'예정',
     att:[
       {id:'P2024055',name:'한서연',gender:'여',birth:1996,mgr:'김매니저',pay:'이니페이',amt:80000,ps:'완료',reg:'인포(admin)',rd:'2026-05-10'},
       {id:'P2024037',name:'강태현',gender:'남',birth:1991,mgr:'김매니저',pay:'',amt:0,ps:'미결제',reg:'인포(admin)',rd:'2026-05-13'},
     ]},
    {id:3,name:'6월 야외 와인 파티',date:'2026-06-14',time:'16:00',loc:'경기 하남 스타필드 루프탑',type:'특별행사',fee:60000,cap:40,status:'예정',att:[]},
    {id:4,name:'7월 여름 비치 파티',date:'2026-07-19',time:'15:00',loc:'부산 해운대 그랜드호텔',type:'정기파티',fee:70000,cap:50,status:'예정',att:[]},
  ];
  localStorage.setItem(SK, JSON.stringify(d));
  return d;
}
function save(d) { localStorage.setItem(SK, JSON.stringify(d)); }

function bdg(s) {
  var c = {'예정':'blue','완료':'green','진행중':'amber','취소':'red','미결제':'red'};
  return '<span class="badge badge--'+(c[s]||'gray')+'">'+s+'</span>';
}
function won(n) { return n ? n.toLocaleString()+'원' : '-'; }

/* ── 렌더 ── */
function renderPage() {
  var parties = loadParties();

  var h = '<div class="page-header"><div>';
  h += '<h1 class="page-header__title">파티/행사 관리</h1>';
  h += '<p class="page-header__subtitle">파티 선택 후 참석 회원을 조회하고 등록합니다</p>';
  h += '</div></div>';

  h += '<div class="card"><div class="card__body" style="display:flex;align-items:center;gap:12px">';
  h += '<label class="form-label" style="margin:0;white-space:nowrap;font-weight:600">파티 선택</label>';
  h += '<select class="form-select" id="psel" style="flex:1;max-width:500px">';
  h += '<option value="">-- 파티를 선택하세요 --</option>';
  for (var i = 0; i < parties.length; i++) {
    var p = parties[i];
    h += '<option value="'+p.id+'">['+p.type+'] '+p.name+' ('+p.date+')</option>';
  }
  h += '</select></div></div>';
  h += '<div id="pdetail"><div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px">파티를 선택하세요</div></div>';

  root.innerHTML = h;
  document.getElementById('psel').addEventListener('change', showParty);
}

function showParty() {
  var parties = loadParties();
  var id = parseInt(document.getElementById('psel').value);
  var area = document.getElementById('pdetail');

  if (!id) { area.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px">파티를 선택하세요</div>'; return; }

  var p = null;
  for (var i = 0; i < parties.length; i++) { if (parties[i].id === id) { p = parties[i]; break; } }
  if (!p) return;

  var mc=0,fc=0,pc=0,tot=0;
  for (var j=0;j<p.att.length;j++) {
    if(p.att[j].gender==='남')mc++; else fc++;
    if(p.att[j].ps==='완료'){pc++;tot+=p.att[j].amt;}
  }

  var h = '<div class="card" style="margin-top:12px">';
  h += '<div class="card__header"><h3 class="card__title" style="font-size:14px">파티 정보</h3>'+bdg(p.status)+'</div>';
  h += '<div class="card__body" style="padding:12px 16px"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px 16px">';
  h += '<div class="detail-field"><span class="detail-field__label">행사명</span><span style="font-weight:600">'+p.name+'</span></div>';
  h += '<div class="detail-field"><span class="detail-field__label">유형</span><span class="badge badge--gray">'+p.type+'</span></div>';
  h += '<div class="detail-field"><span class="detail-field__label">일시</span><span>'+p.date+' '+p.time+'</span></div>';
  h += '<div class="detail-field"><span class="detail-field__label">장소</span><span>'+p.loc+'</span></div>';
  h += '<div class="detail-field"><span class="detail-field__label">참가비</span><span>'+won(p.fee)+'</span></div>';
  h += '<div class="detail-field"><span class="detail-field__label">정원</span><span>'+p.cap+'명</span></div>';
  h += '</div></div></div>';

  h += '<div class="card" style="margin-top:12px">';
  h += '<div class="card__header"><h3 class="card__title" style="font-size:14px">참석 회원</h3>';
  h += '<div style="display:flex;align-items:center;gap:8px">';
  h += '<span style="font-size:12px;color:var(--text-muted)">'+p.att.length+'명 / '+p.cap+'명</span>';
  h += '<button class="btn btn--primary btn--sm" id="btn-reg">+ 참석인원 등록</button>';
  h += '</div></div>';
  h += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:10px 16px;background:var(--bg-secondary);border-bottom:1px solid var(--border-light);font-size:12px">';
  h += '<div><span class="text-muted">남성</span> <strong>'+mc+'명</strong></div>';
  h += '<div><span class="text-muted">여성</span> <strong>'+fc+'명</strong></div>';
  h += '<div><span class="text-muted">결제완료</span> <strong>'+pc+'명</strong></div>';
  h += '<div><span class="text-muted">미결제</span> <strong style="color:var(--status-red)">'+(p.att.length-pc)+'명</strong></div>';
  h += '<div><span class="text-muted">수금합계</span> <strong>'+tot.toLocaleString()+'원</strong></div>';
  h += '</div>';
  h += '<div class="card__body" style="padding:0;overflow-x:auto">';
  h += '<table class="std-table" style="font-size:12px"><thead><tr>';
  h += '<th style="width:35px">No</th><th style="width:60px">회원명</th><th style="width:80px">회원ID</th>';
  h += '<th style="width:40px">성별</th><th style="width:65px">출생년도</th><th style="width:70px">결제방법</th>';
  h += '<th style="width:70px">결제금액</th><th style="width:55px">결제상태</th><th style="width:80px">등록일</th>';
  h += '</tr></thead><tbody>';
  if (p.att.length > 0) {
    for (var k=0;k<p.att.length;k++) {
      var a = p.att[k];
      h += '<tr><td class="tc">'+(k+1)+'</td>';
      h += '<td class="tc col-name">'+a.name+'</td>';
      h += '<td class="tc" style="font-size:11px;color:var(--text-muted)">'+a.id+'</td>';
      h += '<td class="tc">'+a.gender+'</td>';
      h += '<td class="tc">'+(a.birth||'-')+'</td>';
      h += '<td class="tc">'+(a.pay||'-')+'</td>';
      h += '<td class="tc">'+won(a.amt)+'</td>';
      h += '<td class="tc">'+bdg(a.ps)+'</td>';
      h += '<td class="tc" style="white-space:nowrap">'+(a.rd||'-')+'</td></tr>';
    }
  } else {
    h += '<tr><td colspan="9" class="tc text-muted" style="padding:20px">등록된 참석자가 없습니다</td></tr>';
  }
  h += '</tbody></table></div></div>';

  area.innerHTML = h;

  document.getElementById('btn-reg').addEventListener('click', function() {
    showRegForm(p, parties);
  });
}

/* ── 등록 모달 (커스텀) ── */
function showRegForm(party, allData) {
  var members = getMembers();
  var existIds = [];
  for (var i=0;i<party.att.length;i++) existIds.push(party.att[i].id);

  // 모달 HTML — CSS 클래스 충돌 방지를 위해 인라인 스타일만 사용
  var h = '<div id="reg-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)">';
  h += '<div style="background:#fff;border-radius:12px;width:520px;max-width:92vw;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)" onclick="event.stopPropagation()">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e5e7eb">';
  h += '<h3 style="margin:0;font-size:15px;font-weight:700">참석인원 등록</h3>';
  h += '<button id="reg-close" style="background:none;border:none;font-size:18px;cursor:pointer;color:#999;padding:4px">✕</button>';
  h += '</div>';
  h += '<div style="padding:20px">';

  // 이름 + 조회
  h += '<div style="margin-bottom:12px"><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#555">이름</label>';
  h += '<div style="display:flex;gap:6px">';
  h += '<input type="text" id="rn" placeholder="회원명 입력" style="flex:1;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;outline:none">';
  h += '<button type="button" id="rs" style="padding:6px 14px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:6px;font-size:12px;cursor:pointer;white-space:nowrap">조회</button>';
  h += '</div></div>';

  // 검색 결과
  h += '<div id="rr" style="max-height:200px;overflow-y:auto;border:1px solid #e5e7eb;display:none;margin-bottom:12px"></div>';

  // 회원정보 (자동표시)
  h += '<div id="ri" style="display:none">';
  h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px;background:#f9fafb;margin-bottom:12px;border-radius:6px">';
  h += '<div><span style="font-size:11px;color:#888">성별</span><div style="font-size:13px;font-weight:600" id="rg">-</div></div>';
  h += '<div><span style="font-size:11px;color:#888">출생년도</span><div style="font-size:13px;font-weight:600" id="rb">-</div></div>';
  h += '<div><span style="font-size:11px;color:#888">휴대폰</span><div style="font-size:13px;font-weight:600" id="rp">-</div></div>';
  h += '</div>';

  // 결제정보
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
  h += '<div style="margin-bottom:8px"><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#555">결제방법</label>';
  h += '<select id="rpm" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;background:#fff"><option>선택</option><option>카드결제</option><option>이니페이</option><option>무통장입금</option><option>온라인결제</option><option>상품권</option><option>무료</option></select></div>';
  h += '<div style="margin-bottom:8px"><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#555">결제금액</label>';
  h += '<input type="number" id="ra" value="'+party.fee+'" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box"></div>';
  h += '</div>';
  h += '</div>';

  // 푸터
  h += '<div style="display:flex;justify-content:flex-end;gap:8px;padding:12px 20px;border-top:1px solid #e5e7eb">';
  h += '<button type="button" id="reg-cancel" style="padding:8px 18px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-size:13px">취소</button>';
  h += '<button type="button" id="rsubmit" disabled style="padding:8px 18px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;opacity:0.5">등록</button>';
  h += '</div>';

  h += '</div></div>';

  // body에 직접 삽입 (modal-root 우회)
  var modalEl = document.createElement('div');
  modalEl.id = 'party-modal-wrap';
  modalEl.innerHTML = h;
  document.body.appendChild(modalEl);

  function closeModal() {
    var el = document.getElementById('party-modal-wrap');
    if (el) el.remove();
  }

  var chosen = null;

  // 닫기 / 취소
  document.getElementById('reg-close').onclick = closeModal;
  document.getElementById('reg-cancel').onclick = closeModal;
  document.getElementById('reg-overlay').onclick = function(e) {
    if (e.target.id === 'reg-overlay') closeModal();
  };

  // 검색
  function search() {
    var q = document.getElementById('rn').value.trim().toLowerCase();
    var box = document.getElementById('rr');
    if (q.length < 1) { box.style.display = 'none'; return; }

    var list = [];
    for (var i = 0; i < members.length; i++) {
      var m = members[i];
      if (existIds.indexOf(m.id) >= 0) continue;
      if (m.name.toLowerCase().indexOf(q) >= 0
        || m.id.toLowerCase().indexOf(q) >= 0
        || String(m.birth).indexOf(q) >= 0
        || m.phone.indexOf(q) >= 0) {
        list.push(m);
      }
      if (list.length >= 10) break;
    }

    if (list.length === 0) {
      box.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text-muted)">검색 결과가 없습니다</div>';
    } else {
      var t = '<table style="width:100%;font-size:12px;border-collapse:collapse">';
      t += '<thead><tr style="background:var(--bg-secondary)">';
      t += '<th style="padding:6px 10px;text-align:left">이름</th>';
      t += '<th style="padding:6px 10px;text-align:center">출생년도</th>';
      t += '<th style="padding:6px 10px;text-align:center">아이디</th>';
      t += '<th style="padding:6px 10px;text-align:center">핸드폰번호</th>';
      t += '</tr></thead><tbody>';
      for (var j = 0; j < list.length; j++) {
        var mm = list[j];
        t += '<tr data-mid="'+mm.id+'" style="cursor:pointer;border-bottom:1px solid var(--border-light)">';
        t += '<td style="padding:6px 10px;font-weight:500">'+mm.name+'</td>';
        t += '<td style="padding:6px 10px;text-align:center">'+mm.birth+'</td>';
        t += '<td style="padding:6px 10px;text-align:center;color:var(--text-muted)">'+mm.id+'</td>';
        t += '<td style="padding:6px 10px;text-align:center">'+mm.phone+'</td>';
        t += '</tr>';
      }
      t += '</tbody></table>';
      box.innerHTML = t;
    }
    box.style.display = 'block';
  }

  document.getElementById('rs').onclick = search;
  document.getElementById('rn').oninput = search;
  document.getElementById('rn').onkeydown = function(e) { if(e.key==='Enter'){e.preventDefault();search();} };

  // 결과 클릭
  document.getElementById('rr').onclick = function(e) {
    var tr = e.target;
    while (tr && tr.tagName !== 'TR') tr = tr.parentElement;
    if (!tr || !tr.getAttribute('data-mid')) return;

    var mid = tr.getAttribute('data-mid');
    chosen = null;
    for (var i = 0; i < members.length; i++) {
      if (members[i].id === mid) { chosen = members[i]; break; }
    }
    if (!chosen) return;

    document.getElementById('rr').style.display = 'none';
    document.getElementById('rn').value = chosen.name;
    document.getElementById('rn').readOnly = true;
    document.getElementById('rg').textContent = chosen.gender === '여' ? '여성' : '남성';
    document.getElementById('rb').textContent = chosen.birth + '년';
    document.getElementById('rp').textContent = chosen.phone;
    document.getElementById('ri').style.display = 'block';
    document.getElementById('rsubmit').disabled = false;
    document.getElementById('rsubmit').style.opacity = '1';
  };

  // 등록
  document.getElementById('rsubmit').onclick = function() {
    if (!chosen) return;
    var pm = document.getElementById('rpm').value;
    var amt = parseInt(document.getElementById('ra').value) || 0;

    party.att.push({
      id: chosen.id,
      name: chosen.name,
      gender: chosen.gender,
      birth: chosen.birth,
      mgr: chosen.mgr,
      pay: pm === '선택' ? '' : pm,
      amt: amt,
      ps: (pm && pm !== '선택' && pm !== '무료' && amt > 0) ? '완료' : (pm === '무료' ? '완료' : '미결제'),
      reg: '인포(admin)',
      rd: new Date().toISOString().slice(0, 10),
    });
    save(allData);
    closeModal();
    Toast.show(chosen.name + ' 회원이 등록되었습니다.', 'success');
    showParty();
  };
}

renderPage();
