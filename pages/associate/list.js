import { initLayout } from '@core/layout.js';
import { DataTable } from '@components/DataTable.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { AssociateService } from '@services/associate.service.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, ASSOCIATE_STATUSES, BRANCHES, CONSULTANT_BRANCH, EDUCATIONS, REGIONS, CHANNELS } from '@config/constants.js';
import { ManagerPicker, renderManagerPickerHTML, getManagerPickerStyles } from '@components/ManagerPicker.js';

initLayout({ pageId: 'associate-list', breadcrumbs: ['준회원 관리', '준회원 목록'] });
const content = document.getElementById('content');



function getRole(){ return localStorage.getItem('purples_role')||'admin'; }
function roleName(r){ return {admin:'관리자 (본사)',branch:'지사장',manager:'일반 매니저'}[r]||r; }
function roleButtons(role){
  if(role==='manager') return '';
  let b='';
  if(role==='admin') b+=`<button class="btn btn--outline" id="btn-bulk">일괄변경</button>`;
  b+=`<button class="btn btn--outline" id="btn-partial">일부변경</button>`;
  b+=`<button class="btn btn--outline" id="btn-status-chg">상태+담당자</button>`;
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
let mgrPicker=null;

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

<!-- 검색 영역 (std-table 형식) -->
<table class="std-table" id="filter-bar" style="margin-bottom:0;table-layout:fixed">
  <colgroup>
    <col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col>
  </colgroup>
  <tbody>
    <tr>
      <th>회원검색</th>
      <td colspan="3">
        <input type="text" class="form-input form-input--sm" id="f-keyword" placeholder="이름, 전화번호, 직장 검색" style="width:100%">
      </td>
      <th>성별</th>
      <td>
        <div class="ms-wrap" data-ms="f-gender">
          <div class="ms-display form-input--sm">성별 전체</div>
          <div class="ms-dropdown">
            ${['남','여'].map(v=>`<label class="ms-opt"><input type="checkbox" value="${v}"> ${v}</label>`).join('')}
          </div>
        </div>
      </td>
      <th>결혼여부</th>
      <td>
        <div class="ms-wrap" data-ms="f-marital">
          <div class="ms-display form-input--sm">전체</div>
          <div class="ms-dropdown">
            ${['초혼','재혼','사별'].map(v=>`<label class="ms-opt"><input type="checkbox" value="${v}"> ${v}</label>`).join('')}
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <th>학력</th>
      <td>
        <div class="ms-wrap" data-ms="f-edu">
          <div class="ms-display form-input--sm">학력 전체</div>
          <div class="ms-dropdown">
            ${EDUCATIONS.map(v=>`<label class="ms-opt"><input type="checkbox" value="${v}"> ${v}</label>`).join('')}
          </div>
        </div>
      </td>
      <th>상태</th>
      <td>
        <div class="ms-wrap" data-ms="f-status">
          <div class="ms-display form-input--sm">상태 전체</div>
          <div class="ms-dropdown">
            ${ASSOCIATE_STATUSES.map(v=>`<label class="ms-opt"><input type="checkbox" value="${v}"> ${v}</label>`).join('')}
          </div>
        </div>
      </td>
      <th>지역</th>
      <td>
        <div class="ms-wrap" data-ms="f-region">
          <div class="ms-display form-input--sm">지역 전체</div>
          <div class="ms-dropdown">
            ${REGIONS.map(v=>`<label class="ms-opt"><input type="checkbox" value="${v}"> ${v}</label>`).join('')}
          </div>
        </div>
      </td>
      <th>가입경로</th>
      <td>
        <div class="ms-wrap" data-ms="f-channel">
          <div class="ms-display form-input--sm">경로 전체</div>
          <div class="ms-dropdown">
            ${CHANNELS.map(v=>`<label class="ms-opt"><input type="checkbox" value="${v}"> ${v}</label>`).join('')}
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <th>지사</th>
      <td>
        <div class="ms-wrap" data-ms="f-branch">
          <div class="ms-display form-input--sm">지사 전체</div>
          <div class="ms-dropdown">
            ${BRANCHES.map(b=>`<label class="ms-opt"><input type="checkbox" value="${b.name}"> ${b.name}</label>`).join('')}
          </div>
        </div>
      </td>
      <th>매니저</th>
      <td colspan="5">
        ${renderManagerPickerHTML('amgr')}
      </td>
    </tr>
  </tbody>
</table>
<div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px">
  <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
  <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
</div>

<!-- 건수 + 버튼 영역 -->
<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0 6px">
  <div style="font-size:13px;font-weight:600;color:var(--text-secondary)">검색결과 <span id="member-count" style="color:var(--accent)">0</span>명</div>
  <div style="display:flex;gap:8px">${roleButtons(role)}</div>
</div>
<div id="tbl"></div>
<style>
${getManagerPickerStyles()}
.ms-wrap{position:relative;cursor:pointer}
.ms-display{border:1px solid var(--border-light);padding:4px 8px;font-size:12px;background:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:26px;display:flex;align-items:center}
.ms-display::after{content:'▾';margin-left:auto;padding-left:6px;font-size:10px;color:#888}
.ms-dropdown{display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid var(--border-light);box-shadow:0 3px 8px rgba(0,0,0,.15);z-index:100;max-height:200px;overflow-y:auto;min-width:120px}
.ms-wrap.open .ms-dropdown{display:block}
.ms-opt{display:flex;align-items:center;gap:5px;padding:4px 8px;font-size:12px;cursor:pointer;white-space:nowrap}
.ms-opt:hover{background:#f0f4ff}
.ms-opt input[type="checkbox"]{margin:0}
</style>`;

  const initData=getStatusData();

  // 건수 표시 업데이트 함수
  function updateCount(count){ document.getElementById('member-count').textContent = count; }
  updateCount(initData.length);

  table=DataTable.render('tbl',{
    columns:[
      {key:'_no',label:'번호',width:'45px',render:(v,r,i)=>i+1,sortable:false},
      {key:'branch',label:'지사',width:'55px'},
      {key:'registeredAt',label:'등록일',render:v=>Formatters.date(v),width:'90px',sortable:true},
      {key:'assignedAt',label:'분배일',render:v=>v?Formatters.date(v):'-',width:'90px',sortable:true},
      {key:'lastContactAt',label:'최종컨텍일',render:v=>v?Formatters.date(v):'-',width:'90px',sortable:true},
      {key:'name',label:'회원명',render:(v,r)=>`<a href="detail.html?id=${r.id}" target="_blank" style="font-weight:600;color:var(--accent);text-decoration:none" onclick="event.stopPropagation()">${v}</a>`},
      {key:'age',label:'생년',width:'50px',render:v=>{ const y=new Date().getFullYear()-parseInt(v)+1; return y+'년'; }},
      {key:'gender',label:'성별',width:'42px'},
      {key:'maritalStatus',label:'결혼',width:'45px'},
      {key:'channel',label:'가입경로',width:'70px'},
      {key:'education',label:'학력',width:'65px'},
      {key:'phone',label:'연락처',render:v=>Formatters.phone(v),sortable:false},
      {key:'job',label:'직업',width:'70px',render:v=>v||'-'},
      {key:'region',label:'지역',width:'55px'},
      {key:'status',label:'회원상태',render:v=>Formatters.statusBadge(v,'associate')},
      {key:'consultant',label:'담당자',width:'65px'},
    ],
    data:initData, pageSize:20, checkbox:true,
    onRowClick:r=>{ window.open(`detail.html?id=${r.id}`, '_blank'); },
  });

  function getCheckedValues(msName) {
    const wrap = document.querySelector(`[data-ms="${msName}"]`);
    if (!wrap) return [];
    return Array.from(wrap.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
  }

  function updateMsDisplay(wrap) {
    const display = wrap.querySelector('.ms-display');
    const checked = Array.from(wrap.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
    const defaultText = { 'f-gender':'성별 전체','f-marital':'전체','f-edu':'학력 전체','f-status':'상태 전체','f-region':'지역 전체','f-channel':'경로 전체','f-branch':'지사 전체' };
    const key = wrap.dataset.ms;
    if (checked.length === 0) display.textContent = defaultText[key] || '전체';
    else if (checked.length === 1) display.textContent = checked[0];
    else display.textContent = checked[0] + ' 외 ' + (checked.length - 1) + '건';
  }

  function applyFilters(){
    let d=getStatusData();
    const mv = id => getCheckedValues(id);
    const br = mv('f-branch');   if(br.length>0) d=d.filter(x=>br.includes(x.branch));
    const selMgrs = mgrPicker ? mgrPicker.getSelected() : [];
    if(selMgrs.length > 0) d=d.filter(x=>selMgrs.includes(x.consultant));
    const ge = mv('f-gender');   if(ge.length>0) d=d.filter(x=>ge.includes(x.gender));
    const ma = mv('f-marital');  if(ma.length>0) d=d.filter(x=>ma.includes(x.maritalStatus));
    const ed = mv('f-edu');      if(ed.length>0) d=d.filter(x=>ed.includes(x.education));
    const st = mv('f-status');   if(st.length>0) d=d.filter(x=>st.includes(x.status));
    const rg = mv('f-region');   if(rg.length>0) d=d.filter(x=>rg.includes(x.region));
    const ch = mv('f-channel');  if(ch.length>0) d=d.filter(x=>ch.includes(x.channel));
    const kw=(document.getElementById('f-keyword')?.value||'').toLowerCase();
    if(kw) d=d.filter(x=>x.name.includes(kw)||x.phone.includes(kw)||(x.company&&x.company.toLowerCase().includes(kw)));
    table.update(d);
    updateCount(d.length);
  }

  document.getElementById('btn-search').onclick=()=>{
    applyFilters();
  };

  // 멀티셀렉트 드롭다운 토글
  document.querySelectorAll('.ms-wrap').forEach(wrap => {
    const display = wrap.querySelector('.ms-display');
    display.addEventListener('click', (e) => {
      e.stopPropagation();
      // 다른 열린 드롭다운 닫기
      document.querySelectorAll('.ms-wrap.open').forEach(w => { if(w !== wrap) w.classList.remove('open'); });
      wrap.classList.toggle('open');
    });
    // 체크박스 변경 시 표시 업데이트 + 자동 검색
    wrap.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        updateMsDisplay(wrap);
        applyFilters();
      });
    });
  });
  // 바깥 클릭 시 닫기
  document.addEventListener('click', () => {
    document.querySelectorAll('.ms-wrap.open').forEach(w => w.classList.remove('open'));
  });

  // 매니저 Picker 초기화
  mgrPicker = new ManagerPicker({
    inputId: 'amgr-search-input',
    modalBtnId: 'amgr-open-modal',
    tagsId: 'amgr-tags',
    onChange: () => applyFilters()
  });
  document.getElementById('f-keyword').onkeydown=e=>{if(e.key==='Enter')applyFilters();};
  document.getElementById('btn-new').onclick=()=>{ window.location.href='register.html'; };
  document.getElementById('role-sw').onchange=e=>{localStorage.setItem('purples_role',e.target.value);render();Toast.show(`권한: ${roleName(e.target.value)}`,'info');};

  // 초기화 버튼
  document.getElementById('btn-reset')?.addEventListener('click',()=>{
    document.getElementById('f-keyword').value='';
    document.querySelectorAll('.ms-wrap input[type="checkbox"]').forEach(cb=>cb.checked=false);
    document.querySelectorAll('.ms-wrap').forEach(w=>updateMsDisplay(w));
    if(mgrPicker) mgrPicker.reset();
    applyFilters();
  });

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
    const rows=sel.map(m=>{ const by=new Date().getFullYear()-parseInt(m.age)+1; return `<tr><td>${m.name}</td><td>${m.gender}</td><td>${by}년</td><td>${m.region}</td><td>${Formatters.statusBadge(m.status,'associate')}</td><td>${m.consultant}</td></tr>`; }).join('');

    Modal.show({title:'✏️ 담당자 일부 변경',size:'lg',
      content:`<div style="padding:8px 0">
        <div style="margin-bottom:12px;padding:10px 12px;background:#d1ecf1;border:1px solid #bee5eb;font-size:12px;color:#0c5460">선택된 <strong>${ids.length}</strong>명 (남성 ${males}명, 여성 ${females}명)의 담당자를 변경합니다.</div>
        <div style="max-height:200px;overflow-y:auto;margin-bottom:16px"><table class="data-table" style="font-size:12px"><thead><tr><th>이름</th><th>성별</th><th>생년</th><th>지역</th><th>상태</th><th>현재 담당자</th></tr></thead><tbody>${rows}</tbody></table></div>
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
    const rows=sel.map(m=>{ const by=new Date().getFullYear()-parseInt(m.age)+1; return `<tr><td>${m.name}</td><td>${m.gender}</td><td>${by}년</td><td>${m.region}</td><td>${Formatters.statusBadge(m.status,'associate')}</td><td>${m.consultant}</td></tr>`; }).join('');

    Modal.show({title:'상태 + 담당자 변경',size:'lg',
      content:`<div style="padding:8px 0">
        <div style="margin-bottom:12px;padding:10px 12px;background:#e2e3f1;border:1px solid #c3c4e5;font-size:12px;color:#383d8a">선택된 <strong>${ids.length}</strong>명의 상태와 담당자를 동시에 변경합니다.</div>
        <div style="max-height:200px;overflow-y:auto;margin-bottom:16px"><table class="data-table" style="font-size:12px"><thead><tr><th>이름</th><th>성별</th><th>생년</th><th>지역</th><th>현재 상태</th><th>현재 담당자</th></tr></thead><tbody>${rows}</tbody></table></div>
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
