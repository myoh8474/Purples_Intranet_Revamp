import '@styles/variables.css';
import '@styles/base.css';
import '@styles/layout.css';
import '@styles/components.css';
import '@styles/main.css';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { Formatters } from '@utils/formatters.js';
import { AssociateService } from '@services/associate.service.js';
import { DocService, DOC_TYPES } from '@services/doc.service.js';
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
// 서류인증은 DocService API를 사용 (Mock/Supabase 자동 전환)

function renderCallTable(m){
  const all=[...getCallHist(m.id),...(m.contactHistory||[]).filter(h=>!getCallHist(m.id).find(s=>s.id===h.id))].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!all.length) return '<tr><td colspan="9" style="text-align:center;padding:12px;color:#888">전화상담 내역이 없습니다.</td></tr>';
  return all.map((h,i)=>`<tr><td style="text-align:center">${all.length-i}</td><td>${h.date?h.date.slice(2,10).replace(/-/g,'-'):'-'}</td><td>${h.time||''}</td><td>${h.subject||'본인'}</td><td>${h.consultant||m.consultant}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${h.content||'-'}</td><td>-</td><td>${h.result||'-'}</td><td>${h.date?h.date.slice(2,10).replace(/-/g,'-'):'-'}</td></tr>`).join('');
}

function renderMeetTable(m){
  const mt=getMeetHist(m.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!mt.length) return '<tr><td colspan="6" style="text-align:center;padding:12px;color:#888">방문상담 내역이 없습니다.</td></tr>';
  return mt.map((h,i)=>{
    const idx=mt.length-i;
    const dateStr=h.date?h.date.slice(0,10):'-';
    const resultBadge=h.result?`<span style="padding:1px 6px;font-size:10px;font-weight:600;background:#dcfce7;color:#166534">${h.result}</span>`:'<span style="color:#aaa;font-size:11px">미등록</span>';
    return `<tr><td>${idx}</td><td>${h.regDate||dateStr}</td><td><a href="#" class="mt-result-link" data-mid="${m.id}" data-idx="${i}" style="color:#1565c0;text-decoration:underline;cursor:pointer">${dateStr}</a></td><td>${resultBadge}</td><td>${h.resultDate||''}</td><td>${h.consultant||m.consultant}</td></tr>`;
  }).join('');
}

async function renderDocTable(m){
  const docs = await DocService.getList(m.id);
  if(!docs.length) return '<tr><td colspan="7" style="text-align:center;padding:12px;color:#888">등록된 서류인증 내역이 없습니다.</td></tr>';
  return docs.map((d,i)=>{
    const stMap = {'대기':'background:#fef3c7;color:#92400e','완료':'background:#dcfce7;color:#166534','반려':'background:#fee2e2;color:#991b1b','미제출':'background:#f3f4f6;color:#6b7280'};
    const stStyle = stMap[d.status] || 'background:#f3f4f6;color:#374151';
    return `<tr><td style="text-align:center">${i+1}</td><td>${d.docType||'-'}</td><td style="text-align:center"><span style="padding:1px 6px;font-size:10px;font-weight:600;${stStyle}">${d.status}</span></td><td>${d.submitDate?d.submitDate.slice(2,10).replace(/-/g,'-'):'-'}</td><td>${d.confirmDate?d.confirmDate.slice(2,10).replace(/-/g,'-'):'-'}</td><td>${d.confirmer||'-'}</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis">${d.memo||'-'}</td></tr>`;
  }).join('');
}

async function render(){
  const m = await AssociateService.getDetail(memberId);
  if(!m){ content.innerHTML='<div style="padding:40px;text-align:center"><h3>회원을 찾을 수 없습니다</h3><a href="list.html">목록으로</a></div>'; return; }
  document.title=`준회원 상세 - ${m.name}`;
  const birthFull = m.birthDate ? `${new Date(m.birthDate).getFullYear()}년 ${String(new Date(m.birthDate).getMonth()+1).padStart(2,'0')}월 ${String(new Date(m.birthDate).getDate()).padStart(2,'0')}일` : '-';

  const S=`<style>
.crm-hdr{display:flex;align-items:center;gap:6px;padding:5px 8px;flex-wrap:wrap;font-size:12px;border-bottom:2px solid #666;margin-bottom:2px}
.crm-hdr label{font-weight:600;white-space:nowrap}
.crm-hdr input[type="text"],.crm-hdr select{border:1px solid #aaa;padding:2px 4px;font-size:12px;font-family:inherit}
.crm-hdr .rg{display:flex;gap:6px;align-items:center;font-size:11px}
.crm-hdr .rg label{font-weight:400;display:flex;align-items:center;gap:2px;cursor:pointer}
.crm-sec{font-size:13px;padding:5px 0 3px;margin-top:14px;display:flex;align-items:center;justify-content:space-between}
.crm-sec span{font-weight:700;font-size:14px}
.crm-sec .sb{display:flex;gap:3px;flex-wrap:wrap}
.crm-sec .sb button{font-size:11px;padding:2px 8px;border:1px solid #888;background:#fff;cursor:pointer;font-family:inherit;white-space:nowrap;height:24px;line-height:1;box-sizing:border-box}
.crm-sec .sb button:hover{background:#eee}
.crm-sec .sb button.pr{background:#3366cc;color:#fff;border-color:#3366cc}
.crm-info{display:flex;align-items:center;gap:10px;padding:4px 8px;font-size:12px;background:#f8f9fa;border:1px solid #ccc;border-top:none}
.ct{width:100%;border-collapse:collapse;font-size:12px;background:#fff}
.ct th{background:#dde1e6;font-weight:900;font-size:12px;color:#000;text-align:center;white-space:nowrap;padding:3px 5px;border:1px solid #bbb;line-height:1.4}
.ct td{font-size:12px;padding:3px 5px;color:#333;border:1px solid #bbb;text-align:center;line-height:1.4;font-weight:400;background:#fff}
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
  <span style="font-size:20px;font-weight:900;color:#1a1a1a">${m.name}</span>
  <span style="font-size:11px;color:#555">등록일 <strong>${Formatters.date(m.registeredAt)}</strong></span>
  <span style="font-size:11px;color:#ccc">|</span>
  <span style="font-size:11px;color:#555">분배일 <strong>${Formatters.date(m.distributedAt)}</strong></span>
  <!-- REQ-046: 비밀 상담 표시 -->
  ${m.isSecret ? '<div style="background:#fff3e0;border:2px solid #ff9800;padding:6px 12px;font-size:12px;font-weight:700;color:#e65100;text-align:center;margin-bottom:2px">🔒 비밀 상담 회원 (본인 모르게 진행)</div>' : ''}
  <button style="margin-left:auto;padding:3px 10px;border:1px solid #1565c0;background:#fff;color:#1565c0;font-weight:700;font-size:11px;cursor:pointer" id="btn-payment-info">결제정보</button>
  <button style="padding:3px 10px;border:1px solid #c00;background:#fff;color:#c00;font-weight:700;font-size:11px;cursor:pointer" id="btn-withdraw">탈회 접수</button>
  <button style="padding:3px 10px;border:1px solid #e65100;background:#fff;color:#e65100;font-weight:700;font-size:11px;cursor:pointer" id="btn-claim">클레임</button>
  <button style="padding:3px 10px;border:1px solid #333;background:#333;color:#fff;font-weight:700;font-size:11px;cursor:pointer" id="btn-status">회원상태 수정</button>
  <button style="padding:3px 10px;border:1px solid #2e7d32;background:#2e7d32;color:#fff;font-weight:700;font-size:11px;cursor:pointer" id="btn-register-regular">정회원 등록</button>
</div>

<!-- 회원 기본정보 섹션 -->
<div class="crm-sec" style="margin-top:8px">
  <div style="display:flex;align-items:center;gap:6px">
    <span>회원 기본정보</span>
    <div class="sb">
    </div>
  </div>
</div>

<!-- 기본정보 테이블 -->
<table class="ct">
  <colgroup><col style="width:8%"><col style="width:17%"><col style="width:8%"><col style="width:17%"><col style="width:8%"><col style="width:17%"><col style="width:8%"><col style="width:17%"></colgroup>
  <tbody>
    <tr>
      <th style="color:#c62828">컨설턴트</th><td style="font-weight:700">${m.consultant||''}</td>
      <th style="color:#c62828">상 태</th><td style="font-weight:700">${m.status}</td>
      <th style="color:#c62828">경로</th><td style="font-weight:700">[${m.channel?m.channel.charAt(0):''}]</td>
      <th style="color:#c62828">생년월일</th><td style="font-weight:700">${m.birthDate ? Formatters.date(m.birthDate) : ''}</td>
    </tr>
    <tr>
      <th style="color:#c62828">회 원 명</th><td style="font-weight:700">${m.name} (${m.gender})</td>
      <th>결혼여부</th><td>${m.maritalStatus||'초혼'}</td>
      <th>지 역</th><td>${m.region||''}</td>
      <th>최종학력</th><td>${m.education||''}</td>
    </tr>
    <tr>
      <th>직 업</th><td>${m.job||''}</td>
      <th>학 교</th><td>${m.school||''}</td>
      <th>신 장</th><td>${m.height?m.height+'cm':''}</td>
      <th>체 중</th><td>${m.weight?m.weight+'kg':''}</td>
    </tr>
    <tr>
      <th>집 주 소</th><td colspan="3">${m.address||''}</td>
      <th>이 메 일</th><td colspan="3">${m.email||''}</td>
    </tr>
    <!-- REQ-045: 연락처 5개 지원 -->
    <tr>
      <th>자택연락처</th><td colspan="3">${m.telHome||''}</td>
      <th>직장연락처</th><td colspan="3">${m.telOffice||''}</td>
    </tr>
    <tr>
      <th>핸드폰1</th><td colspan="3">${m.phoneRelation1||'본인'} : <strong>${Formatters.phone(m.phone)}</strong> <button class="mb" id="btn-call-direct">통화</button></td>
      <th>핸드폰2</th><td colspan="3">${m.phone2?(m.phone2Relation||'모친')+' : '+Formatters.phone(m.phone2):''}</td>
    </tr>
    <tr>
      <th>핸드폰3</th><td colspan="3">${m.phone3?(m.phone3Relation||'본인')+' : '+Formatters.phone(m.phone3):''}</td>
      <th>수신여부</th><td colspan="3" style="font-size:11px">핸드폰1 Sms:수신 / 핸드폰2 Sms:수신 / Mail:수신 리텐션:O</td>
    </tr>
    <tr>
      <th>자 녀</th><td>${m.children||''}</td>
      <th>혈액형</th><td>${m.bloodType||''}</td>
      <th>취미</th><td>${m.hobby||''}</td>
      <th>종교</th><td>${m.religion||''}
    </tr>
    <tr>
      <th>기타사항</th><td colspan="3">${m.memo||''}</td>
      <th>매니저 지정</th><td>${m.consultant||''}</td>
      <th>희망 상대</th><td style="font-size:11px;line-height:1.5">${m.hope||''}
    </tr>
    <tr>
      <th style="color:#c62828">메모</th><td colspan="7" style="font-weight:700">${m.memo||''} <button class="mb" id="btn-memo-add">메모등록</button></td>
    </tr>
  </tbody>
</table>

<!-- DB중복 신청현황 -->
<div class="crm-sec"><span>DB중복 신청현황</span></div>
<table class="ct" style="margin-top:4px">
  <thead><tr><th>No</th><th>신청일</th><th>경로</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>${Formatters.date(m.registeredAt)}</td><td>${m.channel||''}</td></tr>
  </tbody>
</table>

<!-- 가입 내역 (기존 가입이력 조회) -->
<div class="crm-sec"><span>가입 내역</span></div>
<table class="ct" style="margin-top:4px">
  <thead><tr><th>가입차수</th><th>가입일</th><th>종료일</th><th>프로그램</th><th>브랜드</th><th>담당매니저</th><th>최종미팅횟수</th></tr></thead>
  <tbody>
    <tr><td>1가입</td><td>2024-05-12</td><td>2024-11-30</td><td>다이아몬드</td><td>퍼플스</td><td>김매니저</td><td>5/12</td></tr>
    <tr><td>2가입</td><td>2025-11-03</td><td>2026-05-03</td><td>전문직</td><td>디노블</td><td>이매니저</td><td>3/8</td></tr>
  </tbody>
</table>

<!-- 방문상담 내역 -->
<div class="crm-sec">
  <span>방문상담 내역</span>
  <div class="sb">
    <button class="pr" id="btn-meeting">방문상담약속 기록</button>
    <button id="btn-sms-visit">SMS전송</button>
  </div>
</div>
<table class="ct" style="margin-top:4px">
  <thead><tr><th style="width:40px">No</th><th>등록일</th><th>방문약속일</th><th>결과</th><th>결과등록일</th><th>작성자</th></tr></thead>
  <tbody id="meeting-area">${renderMeetTable(m)}</tbody>
</table>

<!-- 전화상담 내역 -->
<div class="crm-sec">
  <span>전화상담 내역</span>
  <div class="sb">
    <button class="pr" id="btn-call">전화상담내역 기록</button>
    <button id="btn-sms-call">SMS전송</button>
  </div>
</div>

<table class="ct" style="margin-top:4px">
  <thead><tr><th style="width:40px">번호</th><th>상담일</th><th>시간</th><th>상담주체</th><th>상담자</th><th>내용</th><th>약속일</th><th>결과</th><th>결과일</th></tr></thead>
  <tbody id="call-area">${renderCallTable(m)}</tbody>
</table>

<!-- 서류인증 -->
<div class="crm-sec">
  <div style="display:flex;align-items:center;gap:6px">
    <span>서류인증</span>
    <div class="sb">
      <button id="btn-doc-remind">서류독촉 SMS</button>
    </div>
  </div>
  <div class="sb">
    <button class="pr" id="btn-doc-add">인증등록</button>
    <button id="btn-doc-all">일괄인증</button>
  </div>
</div>
<table class="ct" style="margin-top:4px">
  <thead><tr><th style="width:40px">No</th><th>서류종류</th><th>인증상태</th><th>제출일</th><th>확인일</th><th>확인자</th><th>비고</th></tr></thead>
  <tbody id="doc-area">${await renderDocTable(m)}</tbody>
</table>
`;

  window.Toast = Toast;

  // 버튼 이벤트
  document.getElementById('btn-sales')?.addEventListener('click',()=>Toast.show('매출이 등록되었습니다.','success'));
  document.getElementById('btn-meeting')?.addEventListener('click',()=>showMeetingModal(m));
  document.getElementById('btn-payment-info')?.addEventListener('click',()=>showPaymentModal(m));
  document.getElementById('btn-withdraw')?.addEventListener('click',()=>showWithdrawModal(m));
  document.getElementById('btn-claim')?.addEventListener('click',()=>Toast.show('클레임 접수 (기능 준비중)','info'));
  document.getElementById('btn-memo-add')?.addEventListener('click',()=>showMemoModal(m));

  // SMS전송 모달
  function showSmsModal(smsTypes){
    const phone = m.phone||'010-0000-0000';
    const typeOpts = smsTypes.map((t,i)=>`<option value="${t}"${i===0?' selected':''}>${t}</option>`).join('');
    Modal.show({title:'핸드폰 문자 메시지 전송',size:'md',
      content:`<div style="display:flex;flex-direction:column;gap:10px;font-size:12px">
        <div style="display:flex;align-items:center;gap:8px">
          <label style="font-weight:600">수신번호</label>
          <span style="background:#f0f0f0;padding:3px 10px;border:1px solid #ccc;font-weight:700">${phone}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <label style="font-weight:600">전송유형</label>
          <select id="sms-type-sel" class="form-input" style="width:auto;min-width:160px">${typeOpts}</select>
        </div>
        <div>
          <textarea id="sms-content" style="width:100%;height:120px;padding:8px;font-size:12px;border:1px solid #bbb;font-family:inherit;resize:vertical;box-sizing:border-box">고객님 무료상담 문의 감사합니다.^^

부재 중 이셔서 문자 남깁니다.

대한민국 최초 최고 상류층 결혼정보회사 퍼플스 입니다.

전화와 문자, 카톡으로도 언제든 문의가 가능합니다.

결혼 잘하는 비법이 궁금하시면 편하실때 연락 부탁 드립니다.^^

퍼플스 운영팀 부장 직통전화

02-518-9160

www.purples.co.kr</textarea>
          <div style="text-align:right;font-size:11px;color:#888"><span id="sms-byte">0</span> / 2000 byte</div>
        </div>
        <div style="border-top:1px solid #ddd;padding-top:8px;display:flex;align-items:center;gap:8px">
          <label style="font-weight:600">매니저 연락처 :</label>
          <label style="cursor:pointer"><input type="radio" name="mgr-phone" value="office" checked style="margin:0"> 사무실</label>
          <label style="cursor:pointer"><input type="radio" name="mgr-phone" value="mobile" style="margin:0"> 핸드폰</label>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          <input type="text" id="sms-p1" value="02" style="width:50px;text-align:center;padding:3px;border:1px solid #bbb;font-size:12px">
          <span>-</span>
          <input type="text" id="sms-p2" value="518" style="width:60px;text-align:center;padding:3px;border:1px solid #bbb;font-size:12px">
          <span>-</span>
          <input type="text" id="sms-p3" value="9160" style="width:60px;text-align:center;padding:3px;border:1px solid #bbb;font-size:12px">
        </div>
      </div>`,
      footer:'<button class="btn btn--primary" id="btn-sms-ok">OK</button><button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">NO</button>'
    });
    setTimeout(()=>{
      const ta=document.getElementById('sms-content');
      ta?.addEventListener('input',()=>{document.getElementById('sms-byte').textContent=new Blob([ta.value]).size;});
      document.getElementById('btn-sms-ok')?.addEventListener('click',()=>{
        const type=document.getElementById('sms-type-sel').value;
        document.getElementById('modal-root').innerHTML='';
        Toast.show(type+' 전송 완료','success');
      });
    },100);
  }
  document.getElementById('btn-sms-visit')?.addEventListener('click',()=>showSmsModal(['무료상담부재 SMS','파티부재 SMS','기타부재중 SMS','통화후 SMS']));
  document.getElementById('btn-sms-call')?.addEventListener('click',()=>showSmsModal(['연락전송','SMS전송','SMS전송결과','주소안내']));

  document.getElementById('btn-call-direct')?.addEventListener('click',()=>Toast.show('전화 연결 (기능 준비중)','info'));
  document.getElementById('btn-status')?.addEventListener('click',()=>Toast.show('회원상태 수정 (기능 준비중)','info'));
  document.getElementById('btn-register-regular')?.addEventListener('click',()=>showRegModal(m));
  document.getElementById('btn-reg')?.addEventListener('click',()=>showRegModal(m));
  document.getElementById('btn-call')?.addEventListener('click',()=>showCallModal(m));

  // 미팅약속일 클릭 → 미팅결과 등록 모달
  document.getElementById('meeting-area')?.addEventListener('click',(e)=>{
    const link=e.target.closest('.mt-result-link');
    if(!link) return;
    e.preventDefault();
    const idx=parseInt(link.dataset.idx);
    const mt=getMeetHist(m.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
    const h=mt[idx];
    if(!h) return;
    Modal.show({title:'방문상담 결과 등록',size:'md',
      content:`<div style="display:flex;flex-direction:column;gap:10px">
        <div style="font-size:12px;background:#f8f9fa;padding:8px;border:1px solid #ddd">약속일: <strong>${h.date?h.date.slice(0,10):'-'}</strong></div>
        <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">결과 *</label><select id="mtr-result" class="form-input"><option value="가입완료">가입완료</option><option value="가입중">가입중</option><option value="가입보류">가입보류</option><option value="미팅취소">미팅취소</option><option value="미팅일변경">미팅일변경</option><option value="기타">기타</option></select></div>
        <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">내용입력</label><textarea id="mtr-memo" class="form-input" rows="3" placeholder="결과 내용을 입력하세요"></textarea></div>
      </div>`,
      footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="btn-mtr-ok">등록</button>'
    });
    setTimeout(()=>{
      document.getElementById('btn-mtr-ok')?.addEventListener('click',()=>{
        const result=document.getElementById('mtr-result').value;
        const today=new Date().toISOString().slice(0,10);
        h.result=result;
        h.resultDate=today;
        const key=`meetHist_${m.id}`;
        localStorage.setItem(key,JSON.stringify(getMeetHist(m.id)));
        document.getElementById('modal-root').innerHTML='';
        document.getElementById('meeting-area').innerHTML=renderMeetTable(m);
        Toast.show('방문상담 결과가 등록되었습니다.','success');
      });
    },100);
  });
  document.getElementById('btn-doc-add')?.addEventListener('click',()=>showDocModal(m));
  document.getElementById('btn-doc-all')?.addEventListener('click',async ()=>{
    const docs = await DocService.getList(m.id);
    if(!docs.length){ Toast.show('등록된 서류가 없습니다.','warning'); return; }
    const pending = docs.filter(d=>d.status==='대기');
    if(!pending.length){ Toast.show('대기 중인 서류가 없습니다.','info'); return; }
    if(confirm(`대기 중인 서류 ${pending.length}건을 모두 인증 완료 처리하시겠습니까?`)){
      const count = await DocService.bulkApprove(m.id, m.consultant||'-');
      document.getElementById('doc-area').innerHTML = await renderDocTable(m);
      Toast.show(`${count}건의 서류가 인증 완료되었습니다.`,'success');
    }
  });
  document.getElementById('btn-doc-remind')?.addEventListener('click',()=>Toast.show('서류독촉 SMS가 발송되었습니다.','success'));
}

function getMemos(memberId){
  return JSON.parse(localStorage.getItem(`memos_assoc_${memberId}`)||'[]');
}
function saveMemos(memberId,list){
  localStorage.setItem(`memos_assoc_${memberId}`,JSON.stringify(list));
}

function showMemoModal(m){
  const currentUser = JSON.parse(localStorage.getItem('currentUser')||'{}');
  const author = currentUser.name||'관리자';

  Modal.show({ title:`메모 등록 - ${m.name}`, size:'md',
    content:`<div>
      <textarea id="memo-input" class="form-input" rows="3" placeholder="메모를 입력하세요" style="width:100%"></textarea>
    </div>`,
    footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="btn-memo-save">등록</button>'
  });

  setTimeout(()=>{
    document.getElementById('btn-memo-save')?.addEventListener('click',()=>{
      const val = document.getElementById('memo-input')?.value?.trim();
      if(!val){Toast.show('메모 내용을 입력하세요.','warning');return;}
      const memos = getMemos(m.id);
      memos.unshift({ content:val, author, date:new Date().toISOString().slice(0,10) });
      saveMemos(m.id, memos);
      m.memo = memos.map(x=>`[${x.date} ${x.author}] ${x.content}`).join(' / ');
      document.getElementById('modal-root').innerHTML='';
      Toast.show('메모가 등록되었습니다.','success');
      loadDetail(m.id);
    });
  },100);
}

function showPaymentModal(m){
  const payments = m.payments || [
    { date:'2025-04-10', type:'카드', program:'골드(사파이어)', amount:3500000, status:'완료', note:'-' },
  ];
  const rows = payments.map((p,i)=>`<tr>
    <td style="text-align:center">${i+1}</td>
    <td>${p.date||'-'}</td>
    <td>${p.type||'-'}</td>
    <td>${p.program||'-'}</td>
    <td style="text-align:right;font-weight:600">${p.amount ? Number(p.amount).toLocaleString()+'원' : '-'}</td>
    <td style="text-align:center">${p.status||'-'}</td>
    <td>${p.note||'-'}</td>
  </tr>`).join('');

  Modal.show({ title:`결제정보 - ${m.name}`, size:'lg',
    content:`<div style="font-size:12px;color:#888;margin-bottom:10px">정회원 전산 생성 전 결제 내역입니다.</div>
    <table class="ct" style="margin-top:4px">
      <thead><tr><th style="width:40px">No</th><th>결제일</th><th>결제수단</th><th>프로그램</th><th>결제금액</th><th>상태</th><th>비고</th></tr></thead>
      <tbody>${rows.length ? rows : '<tr><td colspan="7" style="text-align:center;padding:14px;color:#888">결제 내역이 없습니다.</td></tr>'}</tbody>
    </table>`,
    footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">닫기</button>'
  });
}

function showWithdrawModal(m){
  const WITHDRAW_REASONS = ['단순변심','서비스 불만족','매칭 불만족','경제적 사유','타사 이용','개인사정','기타'];
  Modal.show({ title:'탈회 접수', size:'md',
    content:`<div style="display:flex;flex-direction:column;gap:14px">
      <div style="padding:10px 14px;border:1px solid #ccc;border-radius:6px;font-size:12px;font-weight:600">
        <strong>${m.name}</strong> 회원의 탈회 접수를 진행합니다.
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700">탈회금 비율 *</label>
        <div style="display:flex;gap:12px;font-size:12px">
          <label style="display:flex;align-items:center;gap:3px;cursor:pointer"><input type="radio" name="wd-pct" value="90" checked> 90%</label>
          <label style="display:flex;align-items:center;gap:3px;cursor:pointer"><input type="radio" name="wd-pct" value="100"> 100%</label>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700">탈회금액 *</label>
        <div style="display:flex;align-items:center;gap:4px"><input type="text" id="wd-amount" class="form-input" placeholder="0" style="width:140px;text-align:right"> <span style="font-size:12px">원</span></div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700">발송방법 *</label>
        <div style="display:flex;gap:10px;font-size:12px;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:3px;cursor:pointer"><input type="radio" name="wd-send" value="휴대폰" checked> 휴대폰</label>
          <label style="display:flex;align-items:center;gap:3px;cursor:pointer"><input type="radio" name="wd-send" value="메일"> 메일</label>
          <label style="display:flex;align-items:center;gap:3px;cursor:pointer"><input type="radio" name="wd-send" value="연락처1"> 연락처1</label>
          <label style="display:flex;align-items:center;gap:3px;cursor:pointer"><input type="radio" name="wd-send" value="연락처2"> 연락처2</label>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700">탈회사유 *</label>
        <select id="wd-reason" class="form-select">${WITHDRAW_REASONS.map(r=>'<option>'+r+'</option>').join('')}</select>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:start">
        <label style="font-size:12px;font-weight:700">상세사유</label>
        <textarea id="wd-detail" class="form-input" rows="3" placeholder="탈회 상세 사유를 입력하세요"></textarea>
      </div>
    </div>`,
    footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn" id="btn-wd-ok" style="background:#dc2626;color:#fff;border-color:#dc2626;font-weight:700">탈회신청서 발송</button>'
  });
  setTimeout(()=>{
    document.getElementById('btn-wd-ok')?.addEventListener('click',()=>{
      const amt=document.getElementById('wd-amount')?.value?.trim();
      const reason=document.getElementById('wd-reason')?.value;
      const detail=document.getElementById('wd-detail')?.value?.trim()||'';
      const pct=document.querySelector('input[name="wd-pct"]:checked')?.value||'90';
      const send=document.querySelector('input[name="wd-send"]:checked')?.value||'휴대폰';
      if(!amt||amt==='0'){Toast.show('탈회금액을 입력해 주세요.','warning');return;}
      if(confirm(`${m.name} 회원에게 탈회신청서를 [${send}]으로 발송하시겠습니까?\\n탈회금: ${Number(amt).toLocaleString()}원 (${pct}%)\\n사유: ${reason}`)){
        Toast.show(`탈회신청서가 [${send}]으로 발송되었습니다.`,'success');
        document.getElementById('modal-root').innerHTML='';
      }
    });
  },100);
}

function showMeetingModal(m){
  const today=new Date().toISOString().slice(0,10);
  const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
  Modal.show({ title:'미팅상담 약속 기록', size:'md',
    content:`<div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">미팅약속일 *</label><input type="date" id="mt-date" value="${tomorrow}" class="form-input"></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">시간</label><input type="time" id="mt-time" value="14:00" class="form-input"></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">방문유형 *</label><select id="mt-type" class="form-input"><option value="방문(퍼플스)">방문(퍼플스)</option><option value="방문예정">방문예정</option><option value="출장">출장</option><option value="기타">기타</option></select></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">내용입력</label><textarea id="mt-content" class="form-input" rows="3" placeholder="메모를 입력하세요"></textarea></div>
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
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">상담주체 *</label><select id="cr-subject" class="form-select"><option value="본인">본인</option><option value="모친">모친</option><option value="부친">부친</option><option value="기타">기타</option></select></div>
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
      const subject=document.getElementById('cr-subject')?.value||'본인';
      const rec={id:Date.now(),date,consultant:m.consultant,subject,result,content:txt||`${result} - 전화상담 진행`,createdAt:new Date().toISOString()};
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

async function showDocModal(m){
  const today=new Date().toISOString().slice(0,10);
  const existDocs = await DocService.getList(m.id);
  const usedTypes = existDocs.map(d=>d.docType);
  const availTypes = DOC_TYPES.filter(t=>!usedTypes.includes(t));

  Modal.show({ title:'서류인증 등록', size:'md',
    content:`<div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">서류종류 *</label><select id="dc-type" class="form-select">${availTypes.length?availTypes.map(t=>`<option>${t}</option>`).join(''):'<option value="">모든 서류 등록완료</option>'}</select></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">제출일 *</label><input type="date" id="dc-date" value="${today}" class="form-input"></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">인증상태</label><select id="dc-status" class="form-select"><option>대기</option><option>완료</option><option>반려</option><option>미제출</option></select></div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center"><label style="font-size:12px;font-weight:600">비고</label><textarea id="dc-memo" class="form-input" rows="2" placeholder="특이사항을 입력하세요"></textarea></div>
    </div>`,
    footer:'<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="btn-dc-ok">등록</button>'
  });
  setTimeout(()=>{
    document.getElementById('btn-dc-ok')?.addEventListener('click',async ()=>{
      const docType = document.getElementById('dc-type')?.value;
      const submitDate = document.getElementById('dc-date')?.value;
      const status = document.getElementById('dc-status')?.value || '대기';
      const memo = document.getElementById('dc-memo')?.value?.trim() || '';
      if(!docType){ Toast.show('서류종류를 선택해 주세요.','warning'); return; }
      if(!submitDate){ Toast.show('제출일을 입력해 주세요.','warning'); return; }
      const confirmDate = status==='완료' ? today : '';
      const confirmer = status==='완료' ? (m.consultant||'-') : '';
      const result = await DocService.add(m.id, { docType, submitDate, status, confirmDate, confirmer, memo });
      if(result){
        document.getElementById('doc-area').innerHTML = await renderDocTable(m);
        Toast.show(`[${docType}] 서류가 등록되었습니다.`,'success');
        document.getElementById('modal-root').innerHTML='';
      } else {
        Toast.show('서류 등록에 실패했습니다.','error');
      }
    });
  },100);
}

render();