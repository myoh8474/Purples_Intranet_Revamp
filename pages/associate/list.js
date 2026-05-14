import { initLayout } from '@core/layout.js';
import { DataTable } from '@components/DataTable.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { AssociateService } from '@services/associate.service.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, ASSOCIATE_STATUSES } from '@config/constants.js';

initLayout({ pageId: 'associate-list', breadcrumbs: ['준회원 관리', '준회원 목록'] });
const content = document.getElementById('content');

const BRANCHES=['본사','경기','부산','대구','대전','광주'];
const REGIONS=['서울','부산','대구','광주','인천','대전','울산','경기','강원','세종','충북','충남','경북','경남','전북','전남','제주','해외','지역없음'];
const CHANNELS=['가입비견적','결혼테스트','네이버예약','네이버커플','무료상담','무료맞선권','블라인드커플','실시간상담','이상형매칭','카카오커플','카카오톡','MBTI테스트','TV광고','구글커플','메타커플','당근커플','렌딩-두두'];
const EDUCATIONS=['고졸','전문대졸','대졸','석사','박사'];

function getRole(){ return localStorage.getItem('purples_role')||'admin'; }
function roleName(r){ return {admin:'관리자 (본사)',branch:'지사장',manager:'일반 매니저'}[r]||r; }
function roleButtons(role){
  if(role==='manager') return '';
  let b='';
  if(role==='admin') b+=`<button class="btn btn--secondary" id="btn-bulk">일괄변경</button>`;
  b+=`<button class="btn btn--secondary" id="btn-partial">일부변경</button>`;
  b+=`<button class="btn btn--secondary" id="btn-status-chg">상태+담당자</button>`;
  return b;
}

function getStatusData(){
  let d=[...MockAssociates];
  try{ const u=JSON.parse(localStorage.getItem('purples_status_updates')||'{}'); d=d.map(x=>u[x.id]?{...x,status:typeof u[x.id]==='string'?u[x.id]:u[x.id].status||x.status}:x); }catch(e){}
  return d;
}

function saveChangeHistory(data){
  const role=getRole();
  const history=JSON.parse(localStorage.getItem('purples_change_history')||'[]');
  history.unshift({...data, changedAt:new Date().toISOString(), changedBy:roleName(role)});
  if(history.length>500) history.length=500;
  localStorage.setItem('purples_change_history',JSON.stringify(history));
}

let table=null;

async function render(){
  const role=getRole();
  content.innerHTML=`
<div class="page-header"><div><h1 class="page-header__title">준회원 관리</h1><p class="page-header__subtitle">준회원 리스트 조회 및 관리</p></div>
<div class="page-header__actions"><button class="btn btn--primary" id="btn-new">+ 신규 등록</button></div></div>
<div style="margin-bottom:12px;display:flex;align-items:center;gap:8px">
  <span style="font-size:11px;color:var(--text-muted)">권한 전환 (데모):</span>
  <select id="role-sw" class="form-select form-input--sm" style="width:auto;font-size:11px">
    <option value="admin" ${role==='admin'?'selected':''}>관리자 (본사)</option>
    <option value="branch" ${role==='branch'?'selected':''}>지사장</option>
    <option value="manager" ${role==='manager'?'selected':''}>일반 매니저</option>
  </select>
  <span style="font-size:11px;color:var(--text-secondary)">현재: <strong>${roleName(role)}</strong></span>
</div>
<div class="filter-bar"><div class="filter-bar__row">
  <div class="filter-bar__item"><label>지사</label><select class="form-select form-input--sm" id="f-branch"><option value="">전체</option>${BRANCHES.map(b=>`<option>${b}</option>`).join('')}</select></div>
  <div class="filter-bar__item"><label>상담매니저</label><select class="form-select form-input--sm" id="f-consult"><option value="">전체</option>${CONSULTANTS.map(c=>`<option>${c}</option>`).join('')}</select></div>
  <div class="filter-bar__item"><label>성별</label><select class="form-select form-input--sm" id="f-gender"><option value="">전체</option><option>남</option><option>여</option></select></div>
  <div class="filter-bar__item"><label>결혼여부</label><select class="form-select form-input--sm" id="f-marital"><option value="">전체</option><option>초혼</option><option>재혼</option></select></div>
  <div class="filter-bar__item"><label>학력</label><select class="form-select form-input--sm" id="f-edu"><option value="">전체</option>${EDUCATIONS.map(e=>`<option>${e}</option>`).join('')}</select></div>
  <div class="filter-bar__item"><label>상태</label><select class="form-select form-input--sm" id="f-status"><option value="">전체</option>${ASSOCIATE_STATUSES.map(s=>`<option>${s}</option>`).join('')}</select></div>
  <div class="filter-bar__item"><label>지역</label><select class="form-select form-input--sm" id="f-region"><option value="">전체</option>${REGIONS.map(r=>`<option>${r}</option>`).join('')}</select></div>
  <div class="filter-bar__item"><label>가입경로</label><select class="form-select form-input--sm" id="f-channel"><option value="">전체</option>${CHANNELS.map(c=>`<option>${c}</option>`).join('')}</select></div>
  <div class="filter-bar__search"><label>검색</label><input class="form-input form-input--sm" id="f-keyword" placeholder="이름, 전화번호, 직장 검색..."></div>
  <button class="btn btn--primary btn--sm" id="btn-search" style="align-self:flex-end">검색</button>
</div></div>
${roleButtons(role)?`<div style="display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-bottom:8px">${roleButtons(role)}</div>`:''}
<div id="tbl"></div>`;

  const initData=getStatusData();

  table=DataTable.render('tbl',{
    columns:[
      {key:'name',label:'이름',render:(v,r)=>`<a href="detail.html?id=${r.id}" target="_blank" style="font-weight:600;color:var(--accent);text-decoration:none" onclick="event.stopPropagation()">${v}</a>`},
      {key:'phone',label:'연락처',render:v=>Formatters.phone(v)},
      {key:'gender',label:'성별',width:'50px'},
      {key:'age',label:'나이',width:'50px',render:v=>v+'세'},
      {key:'status',label:'상태',render:v=>Formatters.statusBadge(v,'associate')},
      {key:'channel',label:'가입경로'},
      {key:'region',label:'지역',width:'60px'},
      {key:'maritalStatus',label:'결혼',width:'50px'},
      {key:'branch',label:'지사',width:'60px'},
      {key:'consultant',label:'담당자',width:'70px'},
      {key:'registeredAt',label:'등록일',render:v=>Formatters.date(v),width:'100px'},
      {key:'lastContactAt',label:'최종컨텍',render:v=>Formatters.date(v),width:'100px'},
    ],
    data:initData, pageSize:15, checkbox:true,
    onRowClick:r=>{ window.open(`detail.html?id=${r.id}`, '_blank'); },
  });

  function applyFilters(){
    let d=getStatusData();
    const gv=id=>document.getElementById(id)?.value||'';
    if(gv('f-branch')) d=d.filter(x=>x.branch===gv('f-branch'));
    if(gv('f-consult')) d=d.filter(x=>x.consultant===gv('f-consult'));
    if(gv('f-gender')) d=d.filter(x=>x.gender===gv('f-gender'));
    if(gv('f-marital')) d=d.filter(x=>x.maritalStatus===gv('f-marital'));
    if(gv('f-edu')) d=d.filter(x=>x.education===gv('f-edu'));
    if(gv('f-status')) d=d.filter(x=>x.status===gv('f-status'));
    if(gv('f-region')) d=d.filter(x=>x.region===gv('f-region'));
    if(gv('f-channel')) d=d.filter(x=>x.channel===gv('f-channel'));
    const kw=gv('f-keyword').toLowerCase();
    if(kw) d=d.filter(x=>x.name.includes(kw)||x.phone.includes(kw)||(x.company&&x.company.toLowerCase().includes(kw)));
    table.update(d);
  }

  document.getElementById('btn-search').onclick=applyFilters;
  document.getElementById('f-keyword').onkeydown=e=>{if(e.key==='Enter')applyFilters();};
  document.getElementById('btn-new').onclick=()=>{ window.location.href='register.html'; };
  document.getElementById('role-sw').onchange=e=>{localStorage.setItem('purples_role',e.target.value);render();Toast.show(`권한: ${roleName(e.target.value)}`,'info');};

  // ── 일괄변경 모달 (관리자 전용) ──
  document.getElementById('btn-bulk')?.addEventListener('click',()=>{
    const chkGroup=(label,group,items)=>`
      <div class="form-group"><label class="form-label">${label}</label>
      <div style="max-height:120px;overflow-y:auto;border:1px solid var(--border-light);padding:6px 8px">
        <div style="margin-bottom:4px">
          <button type="button" class="btn btn--ghost btn--sm" style="font-size:10px;padding:2px 6px" data-bulk-all="${group}">전체</button>
          <button type="button" class="btn btn--ghost btn--sm" style="font-size:10px;padding:2px 6px" data-bulk-clear="${group}">초기화</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px 12px">
          ${items.map(v=>`<label style="font-size:12px;display:flex;align-items:center;gap:3px;cursor:pointer"><input type="checkbox" value="${v}" data-bulk-group="${group}"> ${v}</label>`).join('')}
        </div>
      </div></div>`;

    Modal.show({title:'담당자 일괄 변경',size:'lg',
      content:`<div style="padding:8px 0">
        <div style="margin-bottom:16px;padding:10px 12px;background:#fff3cd;border:1px solid #ffc107;font-size:12px;color:#856404">⚠ 조건에 해당하는 <strong>모든 회원</strong>의 담당자가 변경됩니다. 신중하게 진행해 주세요.</div>
        <div style="font-size:13px;font-weight:700;margin-bottom:10px">변경 조건 설정</div>
        <div class="form-group"><label class="form-label">현재 담당자 *</label><select class="form-select" id="bk-from"><option value="">선택</option>${CONSULTANTS.map(c=>`<option>${c}</option>`).join('')}</select></div>
        ${chkGroup('지역','region',REGIONS)}
        ${chkGroup('상태','status',ASSOCIATE_STATUSES)}
        ${chkGroup('가입경로','channel',CHANNELS)}
        <button class="btn btn--secondary btn--sm" id="bk-preview" style="margin:16px 0">미리보기</button>
        <div id="bk-preview-result" style="margin-bottom:16px;font-size:12px"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div class="form-group"><label class="form-label">남성 이관 인원수</label><input type="number" class="form-input" id="bk-male" value="0" min="0"></div>
          <div class="form-group"><label class="form-label">여성 이관 인원수</label><input type="number" class="form-input" id="bk-female" value="0" min="0"></div>
        </div>
        <div style="border-top:1px solid var(--border-light);padding-top:16px">
          <div style="font-size:13px;font-weight:700;margin-bottom:10px">변경할 담당자</div>
          <div class="form-group"><label class="form-label">새로운 담당자 *</label><select class="form-select" id="bk-to"><option value="">선택</option>${CONSULTANTS.map(c=>`<option>${c}</option>`).join('')}</select></div>
          <div class="form-group" style="margin-top:12px"><label class="form-label">변경사유 *</label><textarea class="form-input" id="bk-reason" rows="3" placeholder="담당자 변경 사유를 입력하세요..."></textarea></div>
        </div></div>`,
      footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="bk-ok">일괄 변경 적용</button>'
    });

    setTimeout(()=>{
      // 전체/초기화 버튼
      document.querySelectorAll('[data-bulk-all]').forEach(b=>b.onclick=()=>document.querySelectorAll(`input[data-bulk-group="${b.dataset.bulkAll}"]`).forEach(c=>c.checked=true));
      document.querySelectorAll('[data-bulk-clear]').forEach(b=>b.onclick=()=>document.querySelectorAll(`input[data-bulk-group="${b.dataset.bulkClear}"]`).forEach(c=>c.checked=false));

      // 미리보기
      document.getElementById('bk-preview')?.addEventListener('click',()=>{
        const from=document.getElementById('bk-from').value;
        if(!from){Toast.show('현재 담당자를 선택하세요.','warning');return;}
        const getChecked=g=>Array.from(document.querySelectorAll(`input[data-bulk-group="${g}"]:checked`)).map(c=>c.value);
        const regions=getChecked('region'), statuses=getChecked('status'), channels=getChecked('channel');
        let filtered=MockAssociates.filter(m=>m.consultant===from);
        if(regions.length>0) filtered=filtered.filter(m=>regions.includes(m.region));
        if(statuses.length>0) filtered=filtered.filter(m=>statuses.includes(m.status));
        if(channels.length>0) filtered=filtered.filter(m=>channels.includes(m.channel));
        const males=filtered.filter(m=>m.gender==='남').length;
        const females=filtered.filter(m=>m.gender==='여').length;
        document.getElementById('bk-preview-result').innerHTML=`<div style="padding:10px 12px;background:var(--bg-secondary);border:1px solid var(--border-light)"><strong>대상 회원:</strong> 총 <strong>${filtered.length}</strong>명 (남성 <strong>${males}</strong>명, 여성 <strong>${females}</strong>명)</div>`;
        document.getElementById('bk-male').value=males;
        document.getElementById('bk-female').value=females;
      });

      // 적용
      document.getElementById('bk-ok')?.addEventListener('click',()=>{
        const f=document.getElementById('bk-from').value,t=document.getElementById('bk-to').value,r=document.getElementById('bk-reason').value.trim();
        if(!f){Toast.show('현재 담당자를 선택하세요.','warning');return;}
        if(!t){Toast.show('새로운 담당자를 선택하세요.','warning');return;}
        if(f===t){Toast.show('현재 담당자와 새 담당자가 같습니다.','warning');return;}
        if(!r){Toast.show('변경사유를 입력하세요.','warning');return;}
        if(confirm(`"${f}" → "${t}"(으)로 담당자를 일괄 변경하시겠습니까?`)){
          saveChangeHistory({type:'일괄변경',from:f,to:t,reason:r});
          Toast.show('담당자 일괄 변경이 완료되었습니다.','success');
          document.getElementById('modal-root').innerHTML='';
        }
      });
    },100);
  });

  // ── 일부변경 모달 (관리자+지사장) ──
  document.getElementById('btn-partial')?.addEventListener('click',()=>{
    const ids=table.getCheckedIds();
    if(ids.length===0){Toast.show('변경할 회원을 먼저 선택해 주세요.','warning');return;}
    const sel=MockAssociates.filter(m=>ids.includes(m.id));
    const males=sel.filter(m=>m.gender==='남').length, females=sel.filter(m=>m.gender==='여').length;
    const rows=sel.map(m=>`<tr><td>${m.name}</td><td>${m.gender}</td><td>${m.age}세</td><td>${m.region}</td><td>${Formatters.statusBadge(m.status,'associate')}</td><td>${m.consultant}</td></tr>`).join('');

    Modal.show({title:'✏️ 담당자 일부 변경',size:'lg',
      content:`<div style="padding:8px 0">
        <div style="margin-bottom:12px;padding:10px 12px;background:#d1ecf1;border:1px solid #bee5eb;font-size:12px;color:#0c5460">선택된 <strong>${ids.length}</strong>명 (남성 ${males}명, 여성 ${females}명)의 담당자를 변경합니다.</div>
        <div style="max-height:200px;overflow-y:auto;margin-bottom:16px"><table class="data-table" style="font-size:12px"><thead><tr><th>이름</th><th>성별</th><th>나이</th><th>지역</th><th>상태</th><th>현재 담당자</th></tr></thead><tbody>${rows}</tbody></table></div>
        <div style="border-top:1px solid var(--border-light);padding-top:16px">
          <div class="form-group"><label class="form-label">새로운 담당자 *</label><select class="form-select" id="pt-to"><option value="">선택</option>${CONSULTANTS.map(c=>`<option>${c}</option>`).join('')}</select></div>
          <div class="form-group" style="margin-top:12px"><label class="form-label">변경사유 *</label><textarea class="form-input" id="pt-reason" rows="3" placeholder="담당자 변경 사유를 입력하세요..."></textarea></div>
        </div></div>`,
      footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="pt-ok">변경 적용</button>'
    });
    setTimeout(()=>{
      document.getElementById('pt-ok')?.addEventListener('click',()=>{
        const t=document.getElementById('pt-to').value, r=document.getElementById('pt-reason').value.trim();
        if(!t){Toast.show('새로운 담당자를 선택하세요.','warning');return;}
        if(!r){Toast.show('변경사유를 입력하세요.','warning');return;}
        if(confirm(`선택된 ${ids.length}명의 담당자를 "${t}"(으)로 변경하시겠습니까?`)){
          ids.forEach(id=>saveChangeHistory({type:'일부변경',memberId:id,to:t,reason:r}));
          Toast.show(`${ids.length}명의 담당자가 "${t}"(으)로 변경되었습니다.`,'success');
          document.getElementById('modal-root').innerHTML='';
          table.clearChecks();
        }
      });
    },100);
  });

  // ── 상태+담당자 변경 모달 (관리자+지사장) ──
  document.getElementById('btn-status-chg')?.addEventListener('click',()=>{
    const ids=table.getCheckedIds();
    if(ids.length===0){Toast.show('변경할 회원을 먼저 선택해 주세요.','warning');return;}
    const sel=MockAssociates.filter(m=>ids.includes(m.id));
    const rows=sel.map(m=>`<tr><td>${m.name}</td><td>${m.gender}</td><td>${m.age}세</td><td>${m.region}</td><td>${Formatters.statusBadge(m.status,'associate')}</td><td>${m.consultant}</td></tr>`).join('');

    Modal.show({title:'상태 + 담당자 변경',size:'lg',
      content:`<div style="padding:8px 0">
        <div style="margin-bottom:12px;padding:10px 12px;background:#e2e3f1;border:1px solid #c3c4e5;font-size:12px;color:#383d8a">선택된 <strong>${ids.length}</strong>명의 상태와 담당자를 동시에 변경합니다.</div>
        <div style="max-height:200px;overflow-y:auto;margin-bottom:16px"><table class="data-table" style="font-size:12px"><thead><tr><th>이름</th><th>성별</th><th>나이</th><th>지역</th><th>현재 상태</th><th>현재 담당자</th></tr></thead><tbody>${rows}</tbody></table></div>
        <div style="border-top:1px solid var(--border-light);padding-top:16px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group"><label class="form-label">변경할 상태 *</label><select class="form-select" id="sc-status"><option value="">선택</option>${ASSOCIATE_STATUSES.map(s=>`<option>${s}</option>`).join('')}</select></div>
            <div class="form-group"><label class="form-label">새 담당자 *</label><select class="form-select" id="sc-to"><option value="">선택</option>${CONSULTANTS.map(c=>`<option>${c}</option>`).join('')}</select></div>
          </div>
          <div class="form-group" style="margin-top:12px"><label class="form-label">변경사유 *</label><textarea class="form-input" id="sc-reason" rows="3" placeholder="상태 및 담당자 변경 사유를 입력하세요..."></textarea></div>
        </div></div>`,
      footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="sc-ok">변경 적용</button>'
    });
    setTimeout(()=>{
      document.getElementById('sc-ok')?.addEventListener('click',()=>{
        const s=document.getElementById('sc-status').value, t=document.getElementById('sc-to').value, r=document.getElementById('sc-reason').value.trim();
        if(!s){Toast.show('변경할 상태를 선택하세요.','warning');return;}
        if(!t){Toast.show('새로운 담당자를 선택하세요.','warning');return;}
        if(!r){Toast.show('변경사유를 입력하세요.','warning');return;}
        if(confirm(`선택된 ${ids.length}명의 상태를 "${s}", 담당자를 "${t}"(으)로 변경하시겠습니까?`)){
          ids.forEach(id=>saveChangeHistory({type:'상태+담당자',memberId:id,to:t,newStatus:s,reason:r}));
          Toast.show(`${ids.length}명의 상태와 담당자가 변경되었습니다.`,'success');
          document.getElementById('modal-root').innerHTML='';
          table.clearChecks();
        }
      });
    },100);
  });
}

render();
