/* ========================================
   요청사항 게시판 — 통합 (3가지 구분)
   구분: 일반 업무요청 / 개인정보 삭제요청 / 인증요청
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';

initLayout({ pageId: 'board-request', breadcrumbs: ['게시판', '요청사항'] });
const content = document.getElementById('content');

const SECTIONS = [
  { key: 'general', label: '일반 업무요청' },
  { key: 'privacy', label: '개인정보 삭제요청' },
  { key: 'cert',    label: '인증요청' },
];
const STATUSES = ['접수','처리중','완료','반려'];
const WRITERS = ['이지연','김민희','박수정','최영미','한소영'];
const MEMBERS = ['김서연','박지은','이하은','최수아','강예린','한유진'];
const GEN_CATS = ['시스템 오류','데이터 수정','권한 요청','기타'];
const GEN_PRI = ['일반','긴급','최우선'];
const PRV_TYPES = ['회원 탈퇴 후 삭제','정정 요청','제3자 제공 철회','수신 거부','기타'];
const CRT_TYPES = ['서류인증 재요청','자동발급 오류','인증 만료 갱신','추가등록','기타'];
const CRT_DOCS = ['주민등록등본','가족관계증명서','재직증명서','소득금액증명','졸업증명서'];

let activeSection = 'general';

function rnd(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function loadData(sec){
  const k='purples_board_req_'+sec;
  try{ const s=localStorage.getItem(k); if(s) return JSON.parse(s); } catch(e){}
  const data=[];
  for(let i=0;i<10;i++){
    const b={id:i+1,status:rnd(STATUSES),writer:rnd(WRITERS),createdAt:new Date(2026,4,Math.floor(Math.random()*13)+1).toISOString().slice(0,10)};
    if(sec==='general') Object.assign(b,{title:['회원 상태 변경','시스템 권한 추가','매출 데이터 수정','보고서 양식 변경','DB 백업 요청','알림 설정 변경','엑셀 기능 개선','메뉴 추가 건의'][i%8],category:rnd(GEN_CATS),priority:rnd(GEN_PRI),replies:Math.floor(Math.random()*5)});
    else if(sec==='privacy') Object.assign(b,{memberName:rnd(MEMBERS),memberId:'P'+String(2024000+Math.floor(Math.random()*999)),deleteType:rnd(PRV_TYPES),reason:rnd(['본인 요청','보유기간 만료','동의 철회','기타']),completedAt:Math.random()>.5?'2026-05-'+String(10+Math.floor(Math.random()*4)):''});
    else Object.assign(b,{memberName:rnd(MEMBERS),certType:rnd(CRT_TYPES),docName:rnd(CRT_DOCS),note:rnd(['스크래핑 오류','만료일 초과','회원 요청',''])});
    data.push(b);
  }
  data.sort((a,b)=>b.id-a.id);
  localStorage.setItem(k,JSON.stringify(data));
  return data;
}
function saveData(sec,d){ localStorage.setItem('purples_board_req_'+sec,JSON.stringify(d)); }

function stBadge(s){ return `<span class="badge badge--${{접수:'blue',처리중:'amber',완료:'green',반려:'red'}[s]||'gray'}">${s}</span>`; }
function prBadge(p){ return p==='긴급'?'<span class="badge badge--red">긴급</span>':p==='최우선'?'<span class="badge badge--red" style="font-weight:800">최우선</span>':'<span class="text-muted">일반</span>'; }

function theadHtml(s){
  if(s==='general') return '<th style="width:40px">번호</th><th>분류</th><th>제목</th><th>상태</th><th>작성자</th><th>등록일</th><th>답변</th>';
  if(s==='privacy') return '<th style="width:40px">번호</th><th>회원명</th><th>회원ID</th><th>삭제유형</th><th>사유</th><th>상태</th><th>요청자</th><th>요청일</th><th>완료일</th>';
  return '<th style="width:40px">번호</th><th>회원명</th><th>요청유형</th><th>서류명</th><th>상태</th><th>요청자</th><th>요청일</th><th>비고</th>';
}
function rowHtml(d,s){
  if(s==='general') return `<td class="tc col-no">${d.id}</td><td class="tc"><span class="badge badge--gray">${d.category}</span></td><td class="tl" style="font-weight:600">${d.title}</td><td class="tc">${stBadge(d.status)}</td><td class="tc">${d.writer}</td><td class="tc">${d.createdAt}</td><td class="tc">${d.replies||'-'}</td>`;
  if(s==='privacy') return `<td class="tc col-no">${d.id}</td><td class="tc col-name">${d.memberName}</td><td class="tc" style="font-size:11px;color:var(--text-muted)">${d.memberId}</td><td class="tl">${d.deleteType}</td><td class="tc">${d.reason}</td><td class="tc">${stBadge(d.status)}</td><td class="tc">${d.writer}</td><td class="tc">${d.createdAt}</td><td class="tc">${d.completedAt||'-'}</td>`;
  return `<td class="tc col-no">${d.id}</td><td class="tc col-name">${d.memberName}</td><td class="tl">${d.certType}</td><td class="tc">${d.docName}</td><td class="tc">${stBadge(d.status)}</td><td class="tc">${d.writer}</td><td class="tc">${d.createdAt}</td><td class="tl ellipsis">${d.note||'-'}</td>`;
}

function renderTable(){
  const data=loadData(activeSection);
  const st=document.getElementById('f-status')?.value||'';
  const kw=(document.getElementById('f-keyword')?.value||'').toLowerCase();
  let f=[...data];
  if(st) f=f.filter(d=>d.status===st);
  if(kw) f=f.filter(d=>(d.title||'').toLowerCase().includes(kw)||(d.memberName||'').includes(kw)||(d.writer||'').includes(kw));
  const cols=activeSection==='privacy'?9:8;
  document.getElementById('req-summary').innerHTML=`
    <div class="summary-card"><div class="summary-card__value">${data.length}</div><div class="summary-card__label">전체</div></div>
    <div class="summary-card"><div class="summary-card__value">${data.filter(d=>d.status==='접수').length}</div><div class="summary-card__label">접수</div></div>
    <div class="summary-card"><div class="summary-card__value">${data.filter(d=>d.status==='처리중').length}</div><div class="summary-card__label">처리중</div></div>
    <div class="summary-card"><div class="summary-card__value">${data.filter(d=>d.status==='완료').length}</div><div class="summary-card__label">완료</div></div>`;
  document.getElementById('req-thead').innerHTML=`<tr>${theadHtml(activeSection)}</tr>`;
  document.getElementById('req-tbody').innerHTML=f.map(d=>`<tr data-href="./detail.html?type=request&sub=${activeSection}&id=${d.id}">${rowHtml(d,activeSection)}</tr>`).join('')||`<tr><td colspan="${cols}" class="tc text-muted" style="padding:30px">등록된 요청이 없습니다.</td></tr>`;
  document.getElementById('req-count').textContent=f.length+'건';
  document.querySelectorAll('#req-tbody tr[data-href]').forEach(tr=>{
    tr.addEventListener('click',()=>location.href=tr.dataset.href);
  });
}



function render(){
  content.innerHTML=`
    <div class="page-header">
      <div><h1 class="page-header__title">요청사항</h1>
      <p class="page-header__subtitle">업무요청, 개인정보 삭제요청, 인증요청을 관리합니다</p></div>
    </div>
    <div class="tab-pills" style="margin-bottom:16px">
      ${SECTIONS.map(s=>`<div class="tab-pill${s.key===activeSection?' active':''}" data-key="${s.key}">${s.label}</div>`).join('')}
    </div>
    <div class="summary-grid" id="req-summary"></div>
    <div class="filter-bar"><div class="filter-bar__row">
      <div class="filter-bar__item"><label>상태</label>
        <select class="form-select form-input--sm" id="f-status"><option value="">전체</option>${STATUSES.map(s=>`<option>${s}</option>`).join('')}</select></div>
      <div class="filter-bar__item"><label>검색</label>
        <input class="form-input form-input--sm" id="f-keyword" placeholder="제목, 회원명, 작성자..."></div>
      <button class="btn btn--primary btn--sm" id="btn-search">검색</button>
    </div></div>
    <div class="card">
      <div class="card__header"><h3 class="card__title" style="font-size:14px">요청 목록</h3>
      <div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--text-muted)" id="req-count">0건</span>
      <button class="btn btn--primary btn--sm" id="btn-new">+ 요청 등록</button></div></div>
      <div class="card__body" style="padding:0;overflow-x:auto">
        <table class="std-table"><thead id="req-thead"></thead><tbody id="req-tbody"></tbody></table>
      </div>
    </div>`;

  renderTable();
  document.querySelectorAll('.tab-pill').forEach(el=>{
    el.addEventListener('click',()=>{
      activeSection=el.dataset.key;
      document.querySelectorAll('.tab-pill').forEach(t=>t.classList.toggle('active',t.dataset.key===activeSection));
      if(document.getElementById('f-status')) document.getElementById('f-status').value='';
      if(document.getElementById('f-keyword')) document.getElementById('f-keyword').value='';
      renderTable();
    });
  });
  document.getElementById('btn-search').addEventListener('click',renderTable);
  document.getElementById('f-keyword')?.addEventListener('keydown',e=>{if(e.key==='Enter')renderTable();});
  document.getElementById('btn-new').addEventListener('click',()=>{
    location.href='./write.html?type=request&sub='+activeSection;
  });
}

render();
