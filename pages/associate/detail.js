import '@styles/variables.css';
import '@styles/base.css';
import '@styles/layout.css';
import '@styles/components.css';
import '@styles/main.css';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { Formatters } from '@utils/formatters.js';
import { AssociateService } from '@services/associate.service.js';
import { CONSULTANTS, PROGRAMS, PROGRAM_GRADES } from '@config/constants.js';
import { renderBasicTab, renderSalesTab, renderConsultTab } from './detail-tabs.js';

const params = new URLSearchParams(window.location.search);
const memberId = parseInt(params.get('id'));

// 독립 새 탭 페이지 — 사이드바/헤더 없음
document.body.style.cssText = 'background:#f5f5f5;margin:0';
document.getElementById('app').style.cssText = 'max-width:1400px;margin:0 auto;padding:20px 24px;min-height:100vh';
const content = document.getElementById('app');
const CALL_RESULTS = ['부재중','낮음(컨텍)','중간(컨텍)','높음(컨텍)','장기상담','방문상담'];
let selectedProgram = '골드(사파이어)', selectedGrade = '', regIdOk = false;

function getCallHist(id){ try{ return JSON.parse(localStorage.getItem('purples_call_history_'+id)||'[]'); }catch(e){ return []; } }
function saveCallHist(id,r){ const h=getCallHist(id); h.unshift(r); localStorage.setItem('purples_call_history_'+id, JSON.stringify(h)); }
function getMeetHist(id){ try{ return JSON.parse(localStorage.getItem('purples_meeting_history_'+id)||'[]'); }catch(e){ return []; } }
function saveMeetHist(id,r){ const h=getMeetHist(id); h.unshift(r); localStorage.setItem('purples_meeting_history_'+id, JSON.stringify(h)); }

function renderCallTable(m){
  const all=[...getCallHist(m.id),...m.contactHistory.filter(h=>!getCallHist(m.id).find(s=>s.id===h.id))].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!all.length) return '<div style="padding:20px;text-align:center;color:var(--text-muted);background:var(--bg-secondary);border-radius:8px">전화상담 내역이 없습니다.</div>';
  return `<table class="data-table" style="font-size:12px"><thead><tr><th>상담일</th><th>상담자</th><th>결과</th><th>내용</th></tr></thead><tbody>${all.map(h=>`<tr><td>${Formatters.date(h.date)}</td><td>${h.consultant||m.consultant}</td><td>${h.result?Formatters.statusBadge(h.result,'associate'):'-'}</td><td>${h.content}</td></tr>`).join('')}</tbody></table>`;
}
function renderMeetTable(m){
  const mt=getMeetHist(m.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!mt.length) return '<div style="padding:20px;text-align:center;color:var(--text-muted);background:var(--bg-secondary);border-radius:8px">미팅상담 내역이 없습니다.</div>';
  const badge=s=>{const c={예약:'#dbeafe;color:#1e40af',완료:'#dcfce7;color:#166534',취소:'#fee2e2;color:#991b1b'}; return `<span style="padding:2px 8px;font-size:11px;font-weight:600;background:${c[s]||'#f3f4f6;color:#374151'}">${s}</span>`;};
  return `<table class="data-table" style="font-size:12px"><thead><tr><th>방문일</th><th>시간</th><th>상담자</th><th>상태</th><th>장소</th><th>비고</th></tr></thead><tbody>${mt.map(h=>`<tr><td>${Formatters.date(h.date)}</td><td>${h.time||'-'}</td><td>${h.consultant||m.consultant}</td><td>${badge(h.status)}</td><td>${h.place||'-'}</td><td>${h.content||'-'}</td></tr>`).join('')}</tbody></table>`;
}

async function render(){
  const m = await AssociateService.getDetail(memberId);
  if(!m){ content.innerHTML='<div class="coming-soon"><div class="coming-soon__title">회원을 찾을 수 없습니다</div><a class="btn btn--outline" href="list.html">목록으로</a></div>'; return; }
  document.title=`준회원 상세 - ${m.name}`;

  const _LBL = 'background:var(--bg-secondary);font-weight:600;font-size:13px;color:#888;text-align:center;white-space:nowrap;padding:6px 8px';
  const _VAL = 'font-size:13px;padding:6px 10px;color:#1e3a5f;white-space:nowrap';

  content.innerHTML=`
  <!-- ═══ 상단: 헤더 바 ═══ -->
  <div style="padding:14px 0;margin-bottom:0;border-bottom:1px solid #cbd5e1;display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:48px;height:48px;border-radius:50%;background:${m.gender==='남'?'#dbeafe':'#fce7f3'};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:${m.gender==='남'?'#1e40af':'#be185d'}">${m.gender==='남'?'M':'F'}</div>
      <h2 style="font-size:20px;font-weight:900;margin:0">${m.name}</h2>
      <span style="font-size:13px;color:var(--text-muted);font-weight:400">${m.gender} / ${m.age}세</span>
      ${Formatters.statusBadge(m.status, 'associate')}
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn btn--ghost btn--sm" onclick="window.location.href='list.html'" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">목록</button>
      <button class="btn btn--ghost btn--sm" id="btn-sms" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">SMS</button>
      <button class="btn btn--ghost btn--sm" id="btn-card" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">명함전송</button>
      <button class="btn btn--primary btn--sm" id="btn-reg" style="font-size:12px;padding:4px 14px">정회원 등록</button>
    </div>
  </div>

  <!-- ═══ 기본정보 카드 ═══ -->
  <div style="padding:16px 0 20px">
    <table class="data-table data-table--bordered" style="font-size:13px;width:100%;background:#fff">
      <tbody>
        <tr>
          <td style="${_LBL}">상태</td><td style="${_VAL}">${Formatters.statusBadge(m.status,'associate')}</td>
          <td style="${_LBL}">지사</td><td style="${_VAL}">${m.branch||'-'}</td>
          <td style="${_LBL}">브랜드</td><td style="${_VAL}">${m.brand||'-'}</td>
          <td style="${_LBL}">담당자</td><td style="${_VAL}">${m.consultant||'-'}</td>
        </tr>
        <tr>
          <td style="${_LBL}">생년월일</td><td style="${_VAL}">${Formatters.date(m.birthDate)} (${m.age}세)</td>
          <td style="${_LBL}">결혼여부</td><td style="${_VAL}">${m.maritalStatus||'-'}</td>
          <td style="${_LBL}">가입경로</td><td style="${_VAL}">${m.channel||'-'}</td>
          <td style="${_LBL}">등록일</td><td style="${_VAL}">${Formatters.date(m.registeredAt)}</td>
        </tr>
        <tr>
          <td style="${_LBL}">연락처</td><td style="${_VAL}">${Formatters.phone(m.phone)}</td>
          <td style="${_LBL}">지역</td><td style="${_VAL}">${m.region||'-'}</td>
          <td style="${_LBL}">학력</td><td style="${_VAL}">${m.education||'-'} / ${m.school||'-'}</td>
          <td style="${_LBL}">최종컨텍</td><td style="${_VAL}">${Formatters.date(m.lastContactAt)}</td>
        </tr>
        <tr>
          <td style="${_LBL}">직업</td><td style="${_VAL}">${m.job||'-'}</td>
          <td style="${_LBL}">직장</td><td style="${_VAL}" colspan="5">${m.company||'-'}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ═══ 하단: 3탭 구조 ═══ -->
  <div>
    <div style="margin-bottom:16px">
      <div class="tabs__nav" id="detail-tabs" style="width:100%">
        <button class="tabs__btn active" data-tab="basic" style="color:#e53e3e;border-bottom-color:#e53e3e">기본정보</button>
        <button class="tabs__btn" data-tab="sales">결제/매출</button>
        <button class="tabs__btn" data-tab="consult">상담이력</button>
      </div>
    </div>
    <div>
      <div class="tab-panel active" id="panel-basic">${renderBasicTab(m)}</div>
      <div class="tab-panel" id="panel-sales">${renderSalesTab(m)}</div>
      <div class="tab-panel" id="panel-consult">${renderConsultTab(m, renderCallTable, renderMeetTable)}</div>
    </div>
  </div>`;

  window.Toast = Toast;

  // 탭 이벤트
  document.querySelectorAll('#detail-tabs .tabs__btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#detail-tabs .tabs__btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });

  // 버튼 이벤트
  document.getElementById('btn-sales')?.addEventListener('click',()=>Toast.show('매출이 등록되었습니다.','success'));
  document.getElementById('btn-meeting')?.addEventListener('click',()=>Toast.show('미팅상담 약속 기록','info'));
  document.getElementById('btn-card')?.addEventListener('click',()=>Toast.show('명함전송 (API 연동 예정)','info'));
  document.getElementById('btn-sms')?.addEventListener('click',()=>Toast.show('SMS전송 (API 연동 예정)','info'));
  document.getElementById('btn-reg')?.addEventListener('click',()=>showRegModal(m));
  document.getElementById('btn-call')?.addEventListener('click',()=>showCallModal(m));
}

function showCallModal(m){
  const today=new Date().toISOString().slice(0,10);
  Modal.show({ title:'전화상담 내역 기록', size:'lg',
    content:`<div style="display:flex;flex-direction:column;gap:14px">
      <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;align-items:center"><label style="font-size:12px;font-weight:600">상담일 *</label><input type="date" id="cr-date" value="${today}" class="form-input"></div>
      <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;align-items:center"><label style="font-size:12px;font-weight:600">상담자</label><input type="text" value="${m.consultant}" disabled class="form-input"></div>
      <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;align-items:center"><label style="font-size:12px;font-weight:600">상담결과 *</label><select id="cr-result" class="form-select"><option value="">-- 선택 --</option>${CALL_RESULTS.map(s=>`<option>${s}</option>`).join('')}</select></div>
      <div id="cr-visit" style="display:none;padding:14px;background:var(--bg-secondary);border:1px solid var(--border-light)">
        <div style="padding:8px;background:#dbeafe;border:1px solid #93c5fd;font-size:11px;color:#1e40af;margin-bottom:10px">방문상담 일정을 등록해 주세요.</div>
        <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;align-items:center;margin-bottom:8px"><label style="font-size:12px;font-weight:600">방문일자 *</label><input type="date" id="cr-vdate" class="form-input"></div>
        <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;align-items:center;margin-bottom:8px"><label style="font-size:12px;font-weight:600">방문시간</label><input type="time" id="cr-vtime" value="14:00" class="form-input"></div>
        <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;align-items:center"><label style="font-size:12px;font-weight:600">방문장소</label><input type="text" id="cr-vplace" placeholder="예: 본사 상담실" class="form-input"></div>
      </div>
      <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;align-items:center"><label style="font-size:12px;font-weight:600">상담내용</label><textarea id="cr-content" class="form-input" rows="4" placeholder="상담 내용을 입력하세요"></textarea></div>
    </div>`,
    footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="btn-cr-ok">등록</button>'
  });
  setTimeout(()=>{
    document.getElementById('cr-result')?.addEventListener('change',e=>{
      const v=document.getElementById('cr-visit');
      if(e.target.value==='방문상담'){ v.style.display='block'; const t=new Date(); t.setDate(t.getDate()+1); document.getElementById('cr-vdate').value=t.toISOString().slice(0,10); }
      else v.style.display='none';
    });
    document.getElementById('btn-cr-ok')?.addEventListener('click',()=>{
      const date=document.getElementById('cr-date')?.value, result=document.getElementById('cr-result')?.value, txt=document.getElementById('cr-content')?.value?.trim()||'';
      if(!date){ Toast.show('상담일을 입력해 주세요.','warning'); return; }
      if(!result){ Toast.show('상담결과를 선택해 주세요.','warning'); return; }
      if(result==='방문상담'){
        const vd=document.getElementById('cr-vdate')?.value;
        if(!vd){ Toast.show('방문상담일자를 입력해 주세요.','warning'); return; }
        saveMeetHist(m.id,{ id:Date.now()+1, date:vd, time:document.getElementById('cr-vtime')?.value||'', place:document.getElementById('cr-vplace')?.value||'', type:'방문상담', consultant:m.consultant, status:'예약', content:txt||'전화상담을 통한 방문상담 예약', createdAt:new Date().toISOString() });
        Toast.show(`방문상담이 ${Formatters.date(vd)}에 예약되었습니다.`,'success');
      }
      const rec={ id:Date.now(), date, consultant:m.consultant, result, content:txt||`${result} - 전화상담 진행`, createdAt:new Date().toISOString() };
      m.contactHistory.unshift(rec); saveCallHist(m.id,rec);
      const sm={부재중:'부재중(미컨텍)','낮음(컨텍)':'낮음(컨텍)','중간(컨텍)':'보통(컨텍)','높음(컨텍)':'높음(컨텍)',장기상담:'장기상담(컨텍)',방문상담:'방문상담'};
      if(sm[result]&&m.status!==sm[result]){ m.status=sm[result]; const u=JSON.parse(localStorage.getItem('purples_status_updates')||'{}'); u[m.id]=sm[result]; localStorage.setItem('purples_status_updates',JSON.stringify(u)); }
      document.getElementById('call-area').innerHTML=renderCallTable(m);
      document.getElementById('meeting-area').innerHTML=renderMeetTable(m);
      Toast.show('전화상담 내역이 등록되었습니다.','success');
      document.getElementById('modal-root').innerHTML='';
    });
  },100);
}

function showRegModal(m){
  selectedProgram='골드(사파이어)'; selectedGrade=''; regIdOk=false;
  Modal.show({ title:'정회원 등록', size:'xl',
    content:`<style>.rr-chip{padding:6px 14px;border:1px solid var(--border-light);background:var(--bg-primary);font-size:11px;cursor:pointer;transition:all .15s;font-family:var(--font-family)}.rr-chip:hover{border-color:var(--accent)}.rr-chip.active{background:var(--accent);color:#fff;border-color:var(--accent);font-weight:700}.rr-gc{display:none;padding:10px;background:var(--bg-secondary);border:1px solid var(--border-light);margin-top:8px}.rr-gc.show{display:block}.rr-t{width:100%;border-collapse:collapse;font-size:12px}.rr-t td{padding:5px 8px;border:1px solid var(--border-light);vertical-align:middle}.rr-t .lb{background:var(--bg-secondary);font-weight:600;white-space:nowrap;text-align:center;color:var(--text-secondary);width:90px}.rr-t input,.rr-t select{width:100%;padding:3px 5px;border:1px solid #ccc;font-size:11px;box-sizing:border-box}</style>
      <div style="margin-bottom:16px"><div style="font-size:13px;font-weight:700;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--border-light)">기본정보</div>
        <table class="rr-t"><tbody><tr><td class="lb">회원명</td><td><input value="${m.name}" disabled /></td><td class="lb">주민번호</td><td><div style="display:flex;gap:3px"><input maxlength="6" style="width:70px" /> - <input type="password" maxlength="7" style="width:80px" /></div></td></tr>
        <tr><td class="lb">아이디 <span style="color:#e53e3e;font-size:10px">*</span></td><td colspan="3"><div style="max-width:400px"><div style="display:flex;gap:4px"><input id="rr-id" placeholder="영문, 숫자 조합 4~20자" style="flex:1" /><button class="btn btn--sm" id="btn-rr-id" style="font-size:10px;white-space:nowrap">중복확인</button></div><div id="rr-id-msg" style="min-height:18px;font-size:11px;padding:2px 0"></div></div></td></tr>
        <tr><td class="lb">결혼형태</td><td><div style="display:flex;gap:12px;font-size:11px"><label><input type="radio" name="rr-m" checked /> 미혼</label><label><input type="radio" name="rr-m" /> 재혼</label><label><input type="radio" name="rr-m" /> 사별</label></div></td><td class="lb">지사코드</td><td><select><option>지사선택</option><option>서울</option><option>부산</option><option>대구</option></select></td></tr></tbody></table></div>
      <div style="margin-bottom:16px"><div style="font-size:13px;font-weight:700;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--border-light)">프로그램 선택</div>
        <table class="rr-t"><tbody><tr><td class="lb">프로그램</td><td colspan="3"><div style="display:flex;flex-wrap:wrap;gap:6px" id="rr-pgm"></div><div class="rr-gc" id="rr-ga"><div style="font-size:11px;font-weight:600;margin-bottom:6px">등급 선택 *</div><div style="display:flex;flex-wrap:wrap;gap:6px" id="rr-gc"></div></div></td></tr></tbody></table></div>
      <div style="margin-bottom:16px"><div style="font-size:13px;font-weight:700;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--border-light)">서비스 / 결제</div>
        <div style="display:flex;gap:16px"><div style="flex:1"><table class="rr-t"><tbody>
          <tr><td class="lb">가입일</td><td><input type="date" value="${new Date().toISOString().slice(0,10)}" /></td></tr>
          <tr><td class="lb">계약구분</td><td><select><option>1가입</option><option>2가입</option><option>3가입</option></select></td></tr>
          <tr><td class="lb">서비스</td><td><div style="display:flex;gap:12px;font-size:11px;margin-bottom:6px"><label><input type="radio" name="rr-svc" value="기간제" checked /> 기간제</label><label><input type="radio" name="rr-svc" value="횟수제" /> 횟수제</label></div><div>개월: <select><option>12</option><option selected>24</option><option>36</option></select> 개월</div></td></tr>
        </tbody></table></div><div style="flex:1"><table class="rr-t"><tbody>
          <tr><td class="lb">주가입</td><td><input type="text" placeholder="0" style="text-align:right" /> 원</td></tr>
          <tr><td class="lb">성혼비</td><td><input type="text" placeholder="0" style="text-align:right" /> 원</td></tr>
          <tr><td class="lb">무이자</td><td><select><option>없음</option><option>3개월</option><option>6개월</option><option>12개월</option></select></td></tr>
        </tbody></table></div></div></div>
      <div><div style="font-size:13px;font-weight:700;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--border-light)">연락처</div>
        <table class="rr-t"><tbody><tr><td class="lb">컨설턴트</td><td><input value="${m.consultant}" /></td><td class="lb">핸드폰</td><td><input value="${Formatters.phone(m.phone)}" /></td></tr><tr><td class="lb">이메일</td><td><input type="email" /></td><td class="lb">본적지</td><td><input /></td></tr></tbody></table></div>`,
    footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="btn-rr-ok">정회원 등록</button>'
  });
  setTimeout(()=>{
    const pc=document.getElementById('rr-pgm');
    if(pc) pc.innerHTML=PROGRAMS.map(p=>`<button type="button" class="rr-chip ${p===selectedProgram?'active':''}" data-p="${p}">${p}${PROGRAM_GRADES[p]?' ▾':''}</button>`).join('');
    function updGrade(){
      const ga=document.getElementById('rr-ga'),gc=document.getElementById('rr-gc');
      const gr=PROGRAM_GRADES[selectedProgram];
      if(!gr){ga.classList.remove('show');gc.innerHTML='';return;}
      ga.classList.add('show');
      gc.innerHTML=gr.map(g=>`<button type="button" class="rr-chip ${selectedGrade===g?'active':''}" data-g="${g}">${g}</button>`).join('');
      gc.querySelectorAll('.rr-chip').forEach(c=>c.onclick=()=>{selectedGrade=c.dataset.g;gc.querySelectorAll('.rr-chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');});
    }
    pc?.querySelectorAll('.rr-chip').forEach(c=>c.onclick=()=>{selectedProgram=c.dataset.p;selectedGrade='';pc.querySelectorAll('.rr-chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');updGrade();});
    updGrade();
    document.getElementById('btn-rr-id')?.addEventListener('click',()=>{
      const v=document.getElementById('rr-id').value.trim(),msg=document.getElementById('rr-id-msg');
      if(v.length<4){msg.textContent='4자 이상 입력';msg.style.color='#dc2626';return;}
      regIdOk=true;msg.textContent='사용 가능';msg.style.color='#16a34a';Toast.show('사용 가능한 아이디입니다.','success');
    });
    document.getElementById('btn-rr-ok')?.addEventListener('click',()=>{
      if(!regIdOk){Toast.show('아이디 중복확인을 진행해 주세요.','warning');return;}
      if(PROGRAM_GRADES[selectedProgram]&&!selectedGrade){Toast.show('등급을 선택해 주세요.','warning');return;}
      const pt=selectedGrade||selectedProgram;
      if(confirm(`${m.name}님을 [${pt}] 프로그램으로 정회원 등록하시겠습니까?`)){Toast.show('정회원 등록이 완료되었습니다.','success');document.getElementById('modal-root').innerHTML='';}
    });
  },100);
}

render();
