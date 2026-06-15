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

const params = new URLSearchParams(window.location.search);
const memberId = parseInt(params.get('id'));
document.body.style.cssText = 'background:#f5f5f5;margin:0';
document.getElementById('app').style.cssText = 'max-width:1400px;margin:0 auto;padding:16px 20px;min-height:100vh';
const content = document.getElementById('app');
const CALL_RESULTS = ['부재중','낮음(컨텍)','중간(컨텍)','높음(컨텍)','장기상담','방문상담'];
let selectedProgram = '골드(사파이어)', selectedGrade = '', regIdOk = false;

function getCallHist(id){ try{ return JSON.parse(localStorage.getItem('purples_call_history_'+id)||'[]'); }catch(e){ return []; } }
function saveCallHist(id,r){ const h=getCallHist(id); h.unshift(r); localStorage.setItem('purples_call_history_'+id, JSON.stringify(h)); }
function getMeetHist(id){ try{ return JSON.parse(localStorage.getItem('purples_meeting_history_'+id)||'[]'); }catch(e){ return []; } }
function saveMeetHist(id,r){ const h=getMeetHist(id); h.unshift(r); localStorage.setItem('purples_meeting_history_'+id, JSON.stringify(h)); }

function renderCallTable(m){
  const all=[...getCallHist(m.id),...(m.contactHistory||[]).filter(h=>!getCallHist(m.id).find(s=>s.id===h.id))].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!all.length) return '<tr><td colspan="8" style="text-align:center;padding:12px;color:#888">전화상담 내역이 없습니다.</td></tr>';
  return all.map((h,i)=>`<tr><td style="text-align:center">${all.length-i}</td><td>${h.date?h.date.slice(2,10).replace(/-/g,'-'):'-'}</td><td>${h.time||''}</td><td>${h.consultant||m.consultant}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${h.content||'-'}</td><td>-</td><td>${h.result||'-'}</td><td>${h.date?h.date.slice(2,10).replace(/-/g,'-'):'-'}</td></tr>`).join('');
}

function renderMeetTable(m){
  const mt=getMeetHist(m.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!mt.length) return '<tr><td colspan="6" style="text-align:center;padding:12px;color:#888">미팅상담 내역이 없습니다.</td></tr>';
  return mt.map((h,i)=>{
    const badge=s=>{const c={예약:'background:#dbeafe;color:#1e40af',완료:'background:#dcfce7;color:#166534',취소:'background:#fee2e2;color:#991b1b'}; return `<span style="padding:1px 6px;font-size:10px;font-weight:600;${c[s]||'background:#f3f4f6;color:#374151'}">${s}</span>`;};
    return `<tr><td style="text-align:center">${mt.length-i}</td><td>${h.date?h.date.slice(0,10):'-'}</td><td>${h.date?h.date.slice(0,10):'-'}</td><td>${badge(h.status)}</td><td>${h.date?h.date.slice(0,10):'-'}</td><td>${h.consultant||m.consultant}</td></tr>`;
  }).join('');
}
async function render(){
  const m = await AssociateService.getDetail(memberId);
  if(!m){ content.innerHTML='<div style="padding:40px;text-align:center"><h3>회원을 찾을 수 없습니다</h3><a href="list.html">목록으로</a></div>'; return; }
  document.title=`준회원 상세 - ${m.name}`;
  const birthFull = m.birthDate ? `${new Date(m.birthDate).getFullYear()}년 ${String(new Date(m.birthDate).getMonth()+1).padStart(2,'0')}월 ${String(new Date(m.birthDate).getDate()).padStart(2,'0')}일` : '-';

  const S=`<style>
.crm-hdr{display:flex;align-items:center;gap:6px;padding:5px 8px;flex-wrap:wrap;font-size:12px;border-bottom:2px solid #666;background:#fff;margin-bottom:2px}
.crm-hdr label{font-weight:600;white-space:nowrap}
.crm-hdr input[type="text"],.crm-hdr select{border:1px solid #aaa;padding:2px 4px;font-size:12px;font-family:inherit}
.crm-hdr .rg{display:flex;gap:6px;align-items:center;font-size:11px}
.crm-hdr .rg label{font-weight:400;display:flex;align-items:center;gap:2px;cursor:pointer}
.crm-sec{font-size:13px;font-weight:900;padding:5px 0 3px;margin-top:14px;display:flex;align-items:center;justify-content:space-between}
.crm-sec .sb{display:flex;gap:3px;flex-wrap:wrap}
.crm-sec .sb button{font-size:11px;padding:2px 8px;border:1px solid #888;background:#fff;cursor:pointer;font-family:inherit;white-space:nowrap}
.crm-sec .sb button:hover{background:#eee}
.crm-sec .sb button.pr{background:#3366cc;color:#fff;border-color:#3366cc}
.crm-info{display:flex;align-items:center;gap:10px;padding:4px 8px;font-size:12px;background:#f8f9fa;border:1px solid #ccc;border-top:none}
.ct{width:100%;border-collapse:collapse;font-size:12px;background:#fff}
.ct th{background:#f1f3f5;font-weight:700;font-size:12px;color:#333;text-align:center;white-space:nowrap;padding:4px 6px;border:1px solid #bbb}
.ct td{font-size:12px;padding:4px 6px;color:#1a1a1a;border:1px solid #bbb}
.ct .ty{background:#fffde7;font-weight:700;text-align:center;white-space:nowrap}
.ct .hn{background:#ffffcc;font-weight:700;color:#c00}
.ct .hs{background:#ccffcc}
.ct .hm{background:#ffcccc}
.mb{font-size:10px;padding:1px 5px;border:1px solid #aaa;background:#f0f0f0;cursor:pointer;font-family:inherit}
.mb:hover{background:#ddd}
</style>`;

  content.innerHTML=S+`
<!-- 상단 헤더 바 -->
<div class="crm-hdr">
  <label>회원명:</label><input type="text" value="${m.name}" style="width:60px" readonly>
  <label>매니저:</label><input type="text" value="${m.consultant||'-'}" style="width:60px" readonly>
  <select style="width:50px"><option>기타</option></select>
  <div class="rg">
    <label><input type="radio" name="pct" checked> 90%</label>
    <label><input type="radio" name="pct"> 100%</label>
    <label>금액:</label><input type="text" style="width:60px" placeholder="0">
  </div>
  <div style="width:1px;height:18px;background:#ccc;margin:0 4px"></div>
  <div class="rg">
    <label><input type="radio" name="send" checked> 휴대폰</label>
    <label><input type="radio" name="send"> 메일</label>
    <label><input type="radio" name="send"> 연락처1</label>
    <label><input type="radio" name="send"> 연락처2</label>
  </div>
  <button style="margin-left:auto;padding:3px 10px;border:1px solid #c00;background:#fff;color:#c00;font-weight:700;font-size:11px;cursor:pointer" id="btn-withdraw">달회 접수</button>
  <button style="padding:3px 10px;border:1px solid #333;background:#333;color:#fff;font-weight:700;font-size:11px;cursor:pointer" id="btn-status">회원상태 수정</button>
</div>

<!-- 회원 기본정보 섹션 -->
<div class="crm-sec" style="margin-top:8px">
  <div style="display:flex;align-items:center;gap:6px">
    <span>회원 기본정보</span>
    <div class="sb">
      <button id="btn-reg">결제</button>
      <button>클레임/환불</button>
    </div>
  </div>
  <div class="sb">
    <button id="btn-edit-info">회원정보 수정</button>
  </div>
</div>
<div class="crm-info">
  <span>등록일 : <strong>${Formatters.date(m.registeredAt)}</strong></span>
  <span>|</span>
  <span>분배일 : <strong>${Formatters.date(m.distributedAt)}</strong></span>
</div>

<!-- 기본정보 테이블 -->
<table class="ct">
  <colgroup><col style="width:80px"><col><col style="width:60px"><col><col style="width:70px"><col><col style="width:70px"><col></colgroup>
  <tbody>
    <tr>
      <th>컨설턴트</th><td><strong>${m.consultant||'-'}</strong></td>
      <th>상 태</th><td class="hs">${m.status}</td>
      <th>경로</th><td>[${m.channel?m.channel.charAt(0):'-'}]</td>
      <th>주민번호</th><td>${m.birthDate?new Date(m.birthDate).getFullYear().toString().slice(2)+new Date(m.birthDate).toISOString().slice(5,10).replace('-',''):'-'}-*******</td>
    </tr>
    <tr>
      <th class="hn">회 원 명</th><td class="hn">${m.name} (${m.gender})</td>
      <th>메모</th><td>${m.memo||'-'}</td>
      <th>생년월일</th><td>${birthFull}</td>
      <th class="hm">결혼여부</th><td class="hm">${m.maritalStatus||'초혼'}</td>
    </tr>
    <tr>
      <th>지 역</th><td>${m.region||'-'}</td>
      <th>직 업</th><td>${m.job||'-'}</td>
      <th>최종학력</th><td>${m.education||'-'}</td>
      <th>학 교</th><td>${m.school||'-'}</td>
    </tr>
    <tr>
      <th>집 주 소</th><td colspan="3">${m.address||'-'}</td>
      <th>신 장</th><td>${m.height?m.height+'cm':'-'}</td>
      <th>체 중</th><td>${m.weight?m.weight+'kg':'-'}</td>
    </tr>
    <tr>
      <th>직 장 명</th><td>${m.company||'-'}</td>
      <th>부서</th><td>-</td>
      <td rowspan="3" colspan="2" style="vertical-align:top;padding:0">
        <table class="ct" style="border:none"><tbody>
          <tr><th style="width:50px;border-top:none;border-left:none">자 녀</th><td style="border-top:none;border-right:none">${m.children||'-'}</td></tr>
          <tr><th style="border-left:none;border-bottom:none">직 장</th><td style="border-right:none;border-bottom:none">-</td></tr>
        </tbody></table>
      </td>
      <td rowspan="3" colspan="2" style="vertical-align:top;padding:0">
        <table class="ct" style="border:none"><tbody>
          <tr><th style="width:50px;border-top:none;border-left:none">관계</th><td style="border-top:none;border-right:none">-</td></tr>
        </tbody></table>
      </td>
    </tr>
    <tr>
      <th>이 메 일</th><td colspan="2">${m.email||'-'}</td>
    </tr>
    <tr>
      <th>수신여부</th><td colspan="2" style="font-size:11px">핸드폰1 Sms:수신 / 핸드폰2 Sms:수신 / Mail:수신</td>
    </tr>
    <tr>
      <th>연 락 처</th>
      <td colspan="3" style="padding:3px 6px">
        핸드폰: <strong>${Formatters.phone(m.phone)}</strong>
        <button class="mb" id="btn-call-direct">통화</button>
        &nbsp; 핸드폰2: ${m.phone2?Formatters.phone(m.phone2):'--'}
      </td>
      <th>취미</th><td>${m.hobby||'-'}</td>
      <th>종교</th><td>${m.religion||'-'}</td>
    </tr>
    <tr>
      <th>기타사항</th><td colspan="3">${m.memo||'-'}</td>
      <th class="ty">희망 상대</th><td colspan="3" style="font-size:11px;line-height:1.5">${m.hope||'-'}</td>
    </tr>
    <tr>
      <th class="ty">매니저 의견</th><td colspan="7" style="font-size:11px;line-height:1.5">-</td>
    </tr>
  </tbody>
</table>

<!-- DB중복 신청현황 -->
<div style="margin-top:6px;padding:4px 8px;border:1px solid #ccc;font-size:12px;background:#f8f9fa">
  <strong>DB중복 신청현황</strong> &nbsp; [${Formatters.date(m.registeredAt)}] ${m.channel||'-'}
</div>

<!-- 가입 내역 -->
<div class="crm-sec"><span>가입 내역</span></div>
<table class="ct" style="margin-top:4px">
  <thead><tr><th>번호</th><th>상담자</th><th colspan="4">가입 내역 결과</th></tr></thead>
  <tbody>
    <tr><td colspan="6" style="text-align:center;padding:14px;color:#888">가입내역이 없습니다.</td></tr>
  </tbody>
</table>

<!-- 미팅상담 내역 -->
<div class="crm-sec">
  <div style="display:flex;align-items:center;gap:6px">
    <span>미팅상담 내역</span>
    <div class="sb">
      <button>무료상담부재 SMS</button>
      <button>파티부재 SMS</button>
      <button>기타부재중 SMS</button>
      <button>통화후 SMS</button>
    </div>
  </div>
  <div class="sb">
    <button class="pr" id="btn-sales">매출입력</button>
    <button id="btn-meeting">미팅상담약속 기록</button>
  </div>
</div>
<table class="ct" style="margin-top:4px">
  <thead><tr><th style="width:40px">No</th><th>등록일</th><th>미팅약속일</th><th>결과</th><th>결과등록일</th><th>작성자</th></tr></thead>
  <tbody id="meeting-area">${renderMeetTable(m)}</tbody>
</table>

<!-- 전화상담 내역 -->
<div class="crm-sec">
  <div style="display:flex;align-items:center;gap:6px">
    <span>전화상담 내역</span>
    <div class="sb">
      <button>연락전송</button>
      <button>SMS전송</button>
      <button>SMS전송결과</button>
      <button>주소안내</button>
    </div>
  </div>
  <div class="sb">
    <button class="pr" id="btn-call">전화상담내역 기록</button>
  </div>
</div>

<table class="ct" style="margin-top:4px">
  <thead><tr><th style="width:40px">번호</th><th>상담일</th><th>시간</th><th>상담자</th><th>내용</th><th>약속일</th><th>결과</th><th>결과일</th></tr></thead>
  <tbody id="call-area">${renderCallTable(m)}</tbody>
</table>
`;

  window.Toast = Toast;

  // 버튼 이벤트
  document.getElementById('btn-sales')?.addEventListener('click',()=>Toast.show('매출이 등록되었습니다.','success'));
  document.getElementById('btn-meeting')?.addEventListener('click',()=>showMeetingModal(m));
  document.getElementById('btn-withdraw')?.addEventListener('click',()=>Toast.show('달회 접수 (기능 준비중)','info'));
  document.getElementById('btn-edit-info')?.addEventListener('click',()=>Toast.show('회원정보 수정 (기능 준비중)','info'));
  document.getElementById('btn-call-direct')?.addEventListener('click',()=>Toast.show('전화 연결 (기능 준비중)','info'));
  document.getElementById('btn-status')?.addEventListener('click',()=>Toast.show('회원상태 수정 (기능 준비중)','info'));
  document.getElementById('btn-reg')?.addEventListener('click',()=>showRegModal(m));
  document.getElementById('btn-call')?.addEventListener('click',()=>showCallModal(m));
}

function showMeetingModal(m){
  const today=new Date().toISOString().slice(0,10);
  const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
  Modal.show({ title:'미팅상담 약속 기록', size:'md',
    content:`<div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">미팅약속일 *</label><input type="date" id="mt-date" value="${tomorrow}" class="form-input"></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">시간</label><input type="time" id="mt-time" value="14:00" class="form-input"></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">장소</label><input type="text" id="mt-place" placeholder="예: 본사 상담실" class="form-input"></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">비고</label><textarea id="mt-content" class="form-input" rows="3" placeholder="메모를 입력하세요"></textarea></div>
    </div>`,
    footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="btn-mt-ok">등록</button>'
  });
  setTimeout(()=>{
    document.getElementById('btn-mt-ok')?.addEventListener('click',()=>{
      const dt=document.getElementById('mt-date')?.value;
      if(!dt){Toast.show('미팅약속일을 입력해 주세요.','warning');return;}
      saveMeetHist(m.id,{id:Date.now(),date:dt,time:document.getElementById('mt-time')?.value||'',place:document.getElementById('mt-place')?.value||'',consultant:m.consultant,status:'예약',content:document.getElementById('mt-content')?.value||'',createdAt:new Date().toISOString()});
      document.getElementById('meeting-area').innerHTML=renderMeetTable(m);
      Toast.show('미팅상담 약속이 등록되었습니다.','success');
      document.getElementById('modal-root').innerHTML='';
    });
  },100);
}

function showCallModal(m){
  const today=new Date().toISOString().slice(0,10);
  Modal.show({ title:'전화상담 내역 기록', size:'lg',
    content:`<div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">상담일 *</label><input type="date" id="cr-date" value="${today}" class="form-input"></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">상담자</label><input type="text" value="${m.consultant}" disabled class="form-input"></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">상담결과 *</label><select id="cr-result" class="form-select"><option value="">-- 선택 --</option>${CALL_RESULTS.map(s=>`<option>${s}</option>`).join('')}</select></div>
      <div id="cr-visit" style="display:none;padding:10px;background:#f0f7ff;border:1px solid #93c5fd">
        <div style="padding:6px;background:#dbeafe;border:1px solid #93c5fd;font-size:11px;color:#1e40af;margin-bottom:8px">방문상담 일정을 등록해 주세요.</div>
        <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center;margin-bottom:6px"><label style="font-size:12px;font-weight:600">방문일자 *</label><input type="date" id="cr-vdate" class="form-input"></div>
        <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center;margin-bottom:6px"><label style="font-size:12px;font-weight:600">방문시간</label><input type="time" id="cr-vtime" value="14:00" class="form-input"></div>
        <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">방문장소</label><input type="text" id="cr-vplace" placeholder="예: 본사 상담실" class="form-input"></div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">상담내용</label><textarea id="cr-content" class="form-input" rows="4" placeholder="상담 내용을 입력하세요"></textarea></div>
    </div>`,
    footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="btn-cr-ok">등록</button>'
  });
  setTimeout(()=>{
    document.getElementById('cr-result')?.addEventListener('change',e=>{
      const v=document.getElementById('cr-visit');
      if(e.target.value==='방문상담'){v.style.display='block';const t=new Date();t.setDate(t.getDate()+1);document.getElementById('cr-vdate').value=t.toISOString().slice(0,10);}
      else v.style.display='none';
    });
    document.getElementById('btn-cr-ok')?.addEventListener('click',()=>{
      const date=document.getElementById('cr-date')?.value,result=document.getElementById('cr-result')?.value,txt=document.getElementById('cr-content')?.value?.trim()||'';
      if(!date){Toast.show('상담일을 입력해 주세요.','warning');return;}
      if(!result){Toast.show('상담결과를 선택해 주세요.','warning');return;}
      if(result==='방문상담'){
        const vd=document.getElementById('cr-vdate')?.value;
        if(!vd){Toast.show('방문상담일자를 입력해 주세요.','warning');return;}
        saveMeetHist(m.id,{id:Date.now()+1,date:vd,time:document.getElementById('cr-vtime')?.value||'',place:document.getElementById('cr-vplace')?.value||'',type:'방문상담',consultant:m.consultant,status:'예약',content:txt||'전화상담을 통한 방문상담 예약',createdAt:new Date().toISOString()});
        Toast.show(`방문상담이 ${Formatters.date(vd)}에 예약되었습니다.`,'success');
      }
      const rec={id:Date.now(),date,consultant:m.consultant,result,content:txt||`${result} - 전화상담 진행`,createdAt:new Date().toISOString()};
      if(m.contactHistory) m.contactHistory.unshift(rec);
      saveCallHist(m.id,rec);
      const sm={'부재중':'부재중(미컨텍)','낮음(컨텍)':'낮음(컨텍)','중간(컨텍)':'보통(컨텍)','높음(컨텍)':'높음(컨텍)','장기상담':'장기상담(컨텍)','방문상담':'방문상담'};
      if(sm[result]&&m.status!==sm[result]){m.status=sm[result];const u=JSON.parse(localStorage.getItem('purples_status_updates')||'{}');u[m.id]=sm[result];localStorage.setItem('purples_status_updates',JSON.stringify(u));}
      document.getElementById('call-area').innerHTML=renderCallTable(m);
      document.getElementById('meeting-area').innerHTML=renderMeetTable(m);
      Toast.show('전화상담 내역이 등록되었습니다.','success');
      document.getElementById('modal-root').innerHTML='';
    });
  },100);
}
function showRegModal(m){
  selectedProgram='골드(사파이어)';selectedGrade='';regIdOk=false;
  Modal.show({title:'정회원 등록',size:'xl',
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