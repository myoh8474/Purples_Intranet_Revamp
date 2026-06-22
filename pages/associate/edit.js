import '@styles/variables.css';
import '@styles/base.css';
import '@styles/layout.css';
import '@styles/components.css';
import '@styles/main.css';
import { Toast } from '@components/Toast.js';
import { Formatters } from '@utils/formatters.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, ASSOCIATE_STATUSES, REGIONS, EDUCATIONS, JOB_TREE } from '@config/constants.js';

const params = new URLSearchParams(window.location.search);
const memberId = parseInt(params.get('id'));
const m = MockAssociates.find(a => a.id === memberId);

document.body.style.cssText = 'background:#f5f5f5;margin:0';
document.getElementById('app').style.cssText = 'max-width:1400px;margin:0 auto;padding:16px 20px;min-height:100vh';
const content = document.getElementById('app');

if (!m) {
  content.innerHTML = `<div style="text-align:center;padding:80px"><div style="font-size:24px;margin-bottom:12px">⚠️</div><div style="font-size:16px;font-weight:600">회원을 찾을 수 없습니다.</div><p style="margin-top:8px;color:#888">ID: ${memberId || '없음'}</p><button class="mb" style="margin-top:16px;padding:4px 14px" onclick="window.location.href='detail.html?id='+${memberId}">← 돌아가기</button></div>`;
} else {

  /* ── 옵션 헬퍼 ── */
  const sel = (arr, cur) => arr.map(v => `<option${v === cur ? ' selected' : ''}>${v}</option>`).join('');
  const BRANCHES = [{ code: '1', name: '본사' }, { code: '8', name: '경기' }, { code: '3', name: '대전' }, { code: '4', name: '대구' }, { code: '2', name: '부산' }, { code: '5', name: '광주' }];
  const JOBS_CAT = Object.keys(JOB_TREE);
  const RELATIONS = ['본인', '모친', '부친', '기타'];

  /* ── 연락처 파싱 (010-1234-5678 → 3칸) ── */
  function splitPhone(ph) {
    if (!ph) return ['', '', ''];
    const clean = ph.replace(/[^0-9]/g, '');
    if (clean.length === 11) return [clean.slice(0, 3), clean.slice(3, 7), clean.slice(7, 11)];
    if (clean.length === 10) return [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6, 10)];
    return [clean, '', ''];
  }
  const ph1 = splitPhone(m.phone);
  const ph2 = splitPhone(m.phone2);
  const ph3 = splitPhone(m.phone3);

  /* ── 생년월일 파싱 ── */
  let birthY = '', birthM = '', birthD = '';
  if (m.birthDate) {
    const bd = new Date(m.birthDate);
    if (!isNaN(bd)) { birthY = bd.getFullYear(); birthM = String(bd.getMonth() + 1).padStart(2, '0'); birthD = String(bd.getDate()).padStart(2, '0'); }
  }

  /* ── 스타일 ── */
  const S = `<style>
.ef{width:100%;border-collapse:collapse;font-size:12px;background:#fff}
.ef+.ef{border-top:none}
.ef+.ef tr:first-child th,.ef+.ef tr:first-child td{border-top:none}
.ef th{background:#dde1e6;font-weight:900;font-size:12px;color:#000;text-align:center;white-space:nowrap;padding:6px 8px;border:1px solid #bbb;line-height:1.6}
.ef td{font-size:12px;padding:6px 8px;color:#333;border:1px solid #bbb;line-height:1.6;font-weight:400;background:#fff}
.ef .rth{color:#c62828;background:#dde1e6;font-weight:900;text-align:center;white-space:nowrap}
.ef input[type="text"],.ef input[type="number"],.ef input[type="email"],.ef select{border:1px solid #aaa;padding:3px 6px;font-size:12px;font-family:inherit;box-sizing:border-box}
.ef textarea{border:1px solid #aaa;padding:5px 8px;font-size:12px;font-family:inherit;box-sizing:border-box;resize:vertical;width:100%}
.ef input:focus,.ef select:focus,.ef textarea:focus{outline:none;border-color:#1565c0;box-shadow:0 0 0 1px rgba(21,101,192,0.2)}
.ph-cell{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.ph-cell input[type="text"]{width:58px;text-align:center}
.ph-cell span{font-size:11px;color:#666}
.rel-sel{border:1px solid #aaa;padding:2px 4px;font-size:11px;font-family:inherit}
.rep-radio{margin:0 2px 0 0}
.btn-bar{display:flex;justify-content:center;gap:12px;margin-top:20px;padding:10px 0}
.btn-bar button{padding:5px 24px;font-size:12px;font-weight:700;border:1px solid #888;background:#f0f0f0;cursor:pointer;font-family:inherit}
.btn-bar button.pr{background:#3366cc;color:#fff;border-color:#3366cc}
.btn-bar button:hover{opacity:0.85}
.sms-chk{display:flex;align-items:center;gap:3px;font-size:11px;white-space:nowrap}
</style>`;

  content.innerHTML = S + `
<!-- 페이지 헤더 -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;margin-bottom:2px">
  <div style="display:flex;align-items:center;gap:10px">
    <span style="font-size:16px;font-weight:900;color:#1a1a1a">회원 기본정보 수정</span>
    <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;color:#e65100;font-weight:600">
      <input type="checkbox" id="e-secret" checked> 비밀회원
    </label>
  </div>
  <button type="button" id="btn-back" style="padding:3px 10px;font-size:12px;border:1px solid #888;background:#f0f0f0;cursor:pointer;font-family:inherit">← 이전</button>
</div>

<!-- 1행: 성명, 담당매니저, 성별 -->
<table class="ef">
<colgroup><col style="width:7%"><col style="width:18%"><col style="width:7%"><col style="width:18%"><col style="width:7%"><col style="width:18%"><col style="width:7%"><col style="width:18%"></colgroup>
<tbody>
  <tr>
    <th class="rth">성 명</th>
    <td><input type="text" id="e-name" value="${m.name}" style="width:100%"></td>
    <th>직 장 명</th>
    <td><input type="text" id="e-company" value="${m.company || ''}" style="width:100%"></td>
    <th class="rth">담당매니저</th>
    <td><div style="display:flex;gap:4px;align-items:center"><select id="e-consultant" style="flex:1"><option value="">미배정</option>${CONSULTANTS.map(c => `<option${c === m.consultant ? ' selected' : ''}>${c}</option>`).join('')}</select><button type="button" id="btn-change-mgr" style="padding:1px 6px;font-size:11px;border:1px solid #888;background:#f0f0f0;cursor:pointer;white-space:nowrap;font-family:inherit">담당자변경</button></div></td>
    <th class="rth">성 별</th>
    <td>
      <label style="display:inline-flex;align-items:center;gap:3px;margin-right:10px;font-size:12px"><input type="radio" name="e-gender" value="남"${m.gender === '남' ? ' checked' : ''}> 남</label>
      <label style="display:inline-flex;align-items:center;gap:3px;font-size:12px"><input type="radio" name="e-gender" value="여"${m.gender === '여' ? ' checked' : ''}> 여</label>
    </td>
  </tr>
  <tr>
    <th class="rth">결혼여부</th>
    <td>
      <select id="e-marital" style="width:100%">
        <option${(m.maritalStatus || '') === '초혼' ? ' selected' : ''}>초혼</option>
        <option${(m.maritalStatus || '') === '재혼' ? ' selected' : ''}>재혼</option>
        <option${(m.maritalStatus || '') === '사별' ? ' selected' : ''}>사별</option>
      </select>
    </td>
    <th>지 역</th>
    <td><select id="e-region" style="width:100%"><option value="">선택</option>${sel(REGIONS, m.region)}</select></td>
    <th class="rth">회원상태</th>
    <td><select id="e-status" style="width:100%">${ASSOCIATE_STATUSES.map(s => `<option${s === m.status ? ' selected' : ''}>${s}</option>`).join('')}</select></td>
    <th>생년월일</th>
    <td>
      <input type="date" id="e-birth" value="${birthY && birthM && birthD ? birthY + '-' + String(birthM).padStart(2, '0') + '-' + String(birthD).padStart(2, '0') : ''}" style="width:100%;font-family:inherit;font-size:12px">
    </td>
  </tr>
</tbody>
</table>

<!-- 2행: 학력/직업/신체 -->
<table class="ef">
<colgroup><col style="width:7%"><col style="width:18%"><col style="width:7%"><col style="width:18%"><col style="width:7%"><col style="width:18%"><col style="width:7%"><col style="width:18%"></colgroup>
<tbody>
  <tr>
    <th>최종학력</th>
    <td><select id="e-edu" style="width:100%"><option value="">학력선택</option>${sel(EDUCATIONS, m.education)}</select></td>
    <th>학 교 명</th>
    <td><input type="text" id="e-school" value="${m.school || ''}" style="width:100%"></td>
    <th>신 장</th>
    <td><input type="number" id="e-height" value="${m.height || ''}" style="width:60px"> cm</td>
    <th>체 중</th>
    <td><input type="number" id="e-weight" value="${m.weight || ''}" style="width:60px"> kg</td>
  </tr>
  <tr>
    <th>직업군</th>
    <td colspan="3"><div style="display:flex;gap:6px"><select id="e-job-cat" style="width:50%"><option value="">대분류 선택</option>${JOBS_CAT.map(j => `<option${j === m.jobCategory ? ' selected' : ''}>${j}</option>`).join('')}</select><select id="e-job-sub" style="width:50%"><option value="">소분류 선택</option></select></div></td>
    <th>이메일</th>
    <td colspan="3"><div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap"><input type="text" id="e-email-id" value="${(m.email || '').split('@')[0] || ''}" style="width:110px" placeholder="아이디"><span style="font-size:12px">@</span><input type="text" id="e-email-domain" value="${(m.email || '').split('@')[1] || ''}" style="width:110px" placeholder="도메인"><select id="e-email-sel" style="font-size:11px;padding:2px 3px" onchange="if(this.value){document.getElementById('e-email-domain').value=this.value;document.getElementById('e-email-domain').readOnly=true}else{document.getElementById('e-email-domain').value='';document.getElementById('e-email-domain').readOnly=false;document.getElementById('e-email-domain').focus()}"><option value="">직접입력</option><option value="naver.com">naver.com</option><option value="gmail.com">gmail.com</option><option value="daum.net">daum.net</option><option value="hanmail.net">hanmail.net</option><option value="nate.com">nate.com</option><option value="kakao.com">kakao.com</option><option value="hotmail.com">hotmail.com</option></select><label style="font-size:11px;white-space:nowrap;display:flex;align-items:center;gap:3px"><input type="checkbox" id="e-mail-deny"> 수신거부</label></div></td>
  </tr>
</tbody>
</table>

<!-- 4행: 집주소/연락처/기타사항/희망상대/기타 통합 -->
<table class="ef">
<colgroup><col style="width:7%"><col style="width:18%"><col style="width:7%"><col style="width:18%"><col style="width:7%"><col style="width:18%"><col style="width:7%"><col style="width:18%"></colgroup>
<tbody>
  <tr>
    <th rowspan="3" style="vertical-align:middle">집 주 소</th>
    <td rowspan="3" colspan="3" style="vertical-align:top">
      <div style="display:flex;gap:4px;margin-bottom:2px">
        <input type="text" id="e-zipcode" value="" style="width:70px" placeholder="우편번호" readonly>
        <button type="button" id="btn-postcode" style="padding:1px 8px;font-size:11px;border:1px solid #888;background:#f0f0f0;cursor:pointer;white-space:nowrap;font-family:inherit">우편번호 찾기</button>
      </div>
      <input type="text" id="e-addr1" value="${m.region || ''}" style="width:100%;margin-bottom:2px" placeholder="기본주소" readonly>
      <input type="text" id="e-addr2" value="${m.address || ''}" style="width:100%" placeholder="상세주소">
    </td>
    <th>자 택</th>
    <td colspan="3">
      <div class="ph-cell">
        <input type="text" id="e-tel-h1" value="" style="width:45px"> <span>-</span>
        <input type="text" id="e-tel-h2" value="" style="width:55px"> <span>-</span>
        <input type="text" id="e-tel-h3" value="" style="width:55px">
      </div>
    </td>
  </tr>
  <tr>
    <th>직 장</th>
    <td colspan="3">
      <div class="ph-cell">
        <input type="text" id="e-tel-w1" value="" style="width:45px"> <span>-</span>
        <input type="text" id="e-tel-w2" value="" style="width:55px"> <span>-</span>
        <input type="text" id="e-tel-w3" value="" style="width:55px">
      </div>
    </td>
  </tr>
  <tr>
    <th>핸드폰1</th>
    <td colspan="3">
      <div class="ph-cell">
        <input type="text" id="e-ph1-1" value="${ph1[0]}" style="width:45px"> <span>-</span>
        <input type="text" id="e-ph1-2" value="${ph1[1]}" style="width:55px"> <span>-</span>
        <input type="text" id="e-ph1-3" value="${ph1[2]}" style="width:55px">
        <select id="e-ph1-rel" class="rel-sel">${RELATIONS.map((r, i) => `<option${(m.phoneRelation1 || '본인') === r || (!m.phoneRelation1 && i === 0) ? ' selected' : ''}>${r}</option>`).join('')}</select>
        <label title="대표번호 지정" class="sms-chk" style="margin-left:10px"><input type="radio" name="e-rep" value="1" class="rep-radio" checked> 대표번호 설정</label>
        <button type="button" class="btn-ph-search" style="padding:1px 6px;font-size:11px;border:1px solid #888;background:#f0f0f0;cursor:pointer;margin-left:4px;font-family:inherit">중복확인</button>
        <label class="sms-chk" style="margin-left:8px"><input type="checkbox" id="e-sms-deny1"> 수신거부</label>
      </div>
    </td>
  </tr>
  <tr>
    <th rowspan="2" style="vertical-align:middle">희망 상대</th>
    <td rowspan="2" colspan="3" style="vertical-align:top"><textarea id="e-hope" rows="3" style="height:100%;min-height:56px" placeholder="희망 상대 조건을 입력하세요">${m.hope || ''}</textarea></td>
    <th>핸드폰2</th>
    <td colspan="3">
      <div class="ph-cell">
        <input type="text" id="e-ph2-1" value="${ph2[0]}" style="width:45px"> <span>-</span>
        <input type="text" id="e-ph2-2" value="${ph2[1]}" style="width:55px"> <span>-</span>
        <input type="text" id="e-ph2-3" value="${ph2[2]}" style="width:55px">
        <select id="e-ph2-rel" class="rel-sel">${RELATIONS.map((r, i) => `<option${(m.phone2Relation || '모친') === r ? ' selected' : ''}>${r}</option>`).join('')}</select>
        <label title="대표번호 지정" class="sms-chk" style="margin-left:10px"><input type="radio" name="e-rep" value="2" class="rep-radio"> 대표번호 설정</label>
        <button type="button" class="btn-ph-search" style="padding:1px 6px;font-size:11px;border:1px solid #888;background:#f0f0f0;cursor:pointer;margin-left:4px;font-family:inherit">중복확인</button>
        <label class="sms-chk" style="margin-left:8px"><input type="checkbox" id="e-sms-deny2"> 수신거부</label>
      </div>
    </td>
  </tr>
  <tr>
    <th>핸드폰3</th>
    <td colspan="3">
      <div class="ph-cell">
        <input type="text" id="e-ph3-1" value="${ph3[0]}" style="width:45px"> <span>-</span>
        <input type="text" id="e-ph3-2" value="${ph3[1]}" style="width:55px"> <span>-</span>
        <input type="text" id="e-ph3-3" value="${ph3[2]}" style="width:55px">
        <select id="e-ph3-rel" class="rel-sel">${RELATIONS.map((r, i) => `<option${(m.phone3Relation || '부친') === r ? ' selected' : ''}>${r}</option>`).join('')}</select>
        <label title="대표번호 지정" class="sms-chk" style="margin-left:10px"><input type="radio" name="e-rep" value="3" class="rep-radio"> 대표번호 설정</label>
        <button type="button" class="btn-ph-search" style="padding:1px 6px;font-size:11px;border:1px solid #888;background:#f0f0f0;cursor:pointer;margin-left:4px;font-family:inherit">중복확인</button>
        <label class="sms-chk" style="margin-left:8px"><input type="checkbox" id="e-sms-deny3"> 수신거부</label>
      </div>
    </td>
  </tr>
  <tr>
    <th>메 모</th>
    <td colspan="3"><textarea id="e-memo-short" rows="3" style="min-height:56px" placeholder="ex)어머니 (50자이내)"></textarea></td>
    <th>선호통화</th>
    <td colspan="3">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="checkbox" class="e-calltime" value="오전(09~12)" ${(m.preferCallTime||'').includes('오전') ? 'checked' : ''}> 오전(09~12)</label>
        <label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="checkbox" class="e-calltime" value="점심(12~14)" ${(m.preferCallTime||'').includes('점심') ? 'checked' : ''}> 점심(12~14)</label>
        <label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="checkbox" class="e-calltime" value="오후(14~18)" ${(m.preferCallTime||'').includes('오후') ? 'checked' : ''}> 오후(14~18)</label>
        <label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="checkbox" class="e-calltime" value="저녁(18~21)" ${(m.preferCallTime||'').includes('저녁') ? 'checked' : ''}> 저녁(18~21)</label>
        <label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="checkbox" class="e-calltime" value="야간(21시~)" ${(m.preferCallTime||'').includes('야간') ? 'checked' : ''}> 야간(21시~)</label>
        <label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer;white-space:nowrap;flex:1"><input type="checkbox" id="e-calltime-chk" value="직접입력"> 직접입력 <input type="text" id="e-calltime-custom" value="" style="flex:1;min-width:60px;font-size:12px;padding:3px 6px;border:1px solid #aaa;box-sizing:border-box" placeholder="시간 입력" disabled></label>
      </div>
    </td>
  </tr>
  <tr>
    <th>기타 사항</th>
    <td colspan="7"><textarea id="e-etc" rows="2" style="min-height:40px" placeholder="기타 사항을 입력하세요">${m.memo||''}</textarea></td>
  </tr>
</tbody>
</table>

<!-- 버튼 -->
<div class="btn-bar">
  <button class="pr" id="btn-save">수 정</button>
  <button id="btn-cancel">취 소</button>
</div>
`;

/* ── 담당매니저 변경 모달 (body에 직접 삽입) ── */
document.body.insertAdjacentHTML('beforeend', `
<div id="modal-mgr-overlay" class="modal-overlay">
  <div class="modal" style="width:380px">
    <div class="modal__header">
      <span class="modal__title">담당매니저 변경</span>
      <button id="modal-mgr-close" class="modal__close">×</button>
    </div>
    <div class="modal__body">
      <table class="ef" style="margin:0">
        <tr>
          <th style="width:30%">현재 담당자</th>
          <td id="modal-mgr-current" style="font-weight:700">${m.consultant||'미배정'}</td>
        </tr>
        <tr>
          <th>변경 담당자</th>
          <td>
            <select id="modal-mgr-select" style="width:100%;font-size:12px;font-family:inherit;padding:3px 6px">
              <option value="">선택</option>
              ${CONSULTANTS.map(c=>`<option>${c}</option>`).join('')}
            </select>
          </td>
        </tr>
        <tr>
          <th style="vertical-align:top">변경 사유</th>
          <td>
            <textarea id="modal-mgr-reason" rows="3" style="width:100%;font-size:12px;font-family:inherit;padding:5px 8px;border:1px solid #aaa;box-sizing:border-box;resize:vertical" placeholder="변경 사유를 입력하세요"></textarea>
          </td>
        </tr>
      </table>
    </div>
    <div class="modal__footer">
      <button id="modal-mgr-save" class="btn btn--primary btn--sm">저 장</button>
      <button id="modal-mgr-cancel" class="btn btn--outline btn--sm">취 소</button>
    </div>
  </div>
</div>
`);

  /* ── 이벤트 바인딩 ── */

  /* 선호통화 직접입력 토글 */
  document.getElementById('e-calltime-chk')?.addEventListener('change', function() {
    const custom = document.getElementById('e-calltime-custom');
    custom.disabled = !this.checked;
    if (!this.checked) { custom.value = ''; }
    else { custom.focus(); }
  });

  /* 이전 버튼 */
  document.getElementById('btn-back').addEventListener('click', () => {
    window.location.href = 'detail.html?id=' + memberId;
  });

  /* 핸드폰 중복확인 */
  document.querySelectorAll('.btn-ph-search').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const n = idx + 1;
      const p1 = document.getElementById(`e-ph${n}-1`).value.trim();
      const p2 = document.getElementById(`e-ph${n}-2`).value.trim();
      const p3 = document.getElementById(`e-ph${n}-3`).value.trim();
      if (!p1 || !p2 || !p3) { alert('전화번호를 입력해 주세요.'); return; }
      const phone = `${p1}-${p2}-${p3}`;
      const dup = MockAssociates.find(a => a.id !== memberId && (a.phone === phone || a.phone2 === phone || a.phone3 === phone));
      if (dup) {
        alert('중복회원입니다.');
      } else {
        alert('신규회원입니다.');
      }
    });
  });

  /* 담당매니저 변경 모달 */
  const mgrOverlay = document.getElementById('modal-mgr-overlay');
  document.getElementById('btn-change-mgr').addEventListener('click', () => {
    document.getElementById('modal-mgr-current').textContent = document.getElementById('e-consultant').value || '미배정';
    document.getElementById('modal-mgr-select').value = '';
    document.getElementById('modal-mgr-reason').value = '';
    mgrOverlay.classList.add('active');
  });
  document.getElementById('modal-mgr-close').addEventListener('click', () => { mgrOverlay.classList.remove('active'); });
  document.getElementById('modal-mgr-cancel').addEventListener('click', () => { mgrOverlay.classList.remove('active'); });
  mgrOverlay.addEventListener('click', (e) => { if (e.target === mgrOverlay) mgrOverlay.classList.remove('active'); });

  document.getElementById('modal-mgr-save').addEventListener('click', () => {
    const newMgr = document.getElementById('modal-mgr-select').value;
    const reason = document.getElementById('modal-mgr-reason').value.trim();
    if (!newMgr) { alert('변경할 매니저를 선택해 주세요.'); return; }
    if (!reason) { alert('변경 사유를 입력해 주세요.'); return; }
    if (confirm('상담매니져를 변경하시겠습니까?')) {
      document.getElementById('e-consultant').value = newMgr;
      mgrOverlay.classList.remove('active');
      Toast.show(`담당매니저가 ${newMgr}(으)로 변경되었습니다.`, 'success');
    }
  });

  /* 직업군 대분류 → 소분류 연동 */
  function updateJobSub(cat, selectedSub) {
    const subSel = document.getElementById('e-job-sub');
    subSel.innerHTML = '<option value="">소분류 선택</option>';
    if (cat && JOB_TREE[cat]) {
      JOB_TREE[cat].forEach(s => {
        const opt = document.createElement('option');
        opt.value = s; opt.textContent = s;
        if (s === selectedSub) opt.selected = true;
        subSel.appendChild(opt);
      });
    }
  }
  document.getElementById('e-job-cat').addEventListener('change', function () {
    updateJobSub(this.value, '');
  });
  // 초기 로딩: 기존 데이터 반영
  updateJobSub(m.jobCategory || '', m.job || '');

  /* 다음 우편번호 찾기 */
  document.getElementById('btn-postcode').addEventListener('click', () => {
    new daum.Postcode({
      oncomplete: function (data) {
        document.getElementById('e-zipcode').value = data.zonecode;
        document.getElementById('e-addr1').value = data.roadAddress || data.jibunAddress;
        document.getElementById('e-addr2').value = '';
        document.getElementById('e-addr2').focus();
      }
    }).open();
  });

  document.getElementById('btn-cancel').addEventListener('click', () => {
    if (confirm('수정 내용이 저장되지 않습니다. 취소하시겠습니까?')) {
      window.location.href = 'detail.html?id=' + memberId;
    }
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    const name = document.getElementById('e-name').value.trim();
    if (!name) { alert('성명을 입력해 주세요.'); return; }

    const repNo = document.querySelector('input[name="e-rep"]:checked')?.value || '1';
    const getPhone = (n) => {
      const p1 = document.getElementById(`e-ph${n}-1`).value.trim();
      const p2 = document.getElementById(`e-ph${n}-2`).value.trim();
      const p3 = document.getElementById(`e-ph${n}-3`).value.trim();
      return (p1 && p2 && p3) ? `${p1}-${p2}-${p3}` : '';
    };

    if (confirm(`${name}님의 정보를 저장하시겠습니까?`)) {
      const by = birthY || document.getElementById('e-birth-y').value;
      const bm = document.getElementById('e-birth-m').value;
      const bd = document.getElementById('e-birth-d').value;
      const birthDate = (by && bm && bd) ? `${by}-${String(bm).padStart(2, '0')}-${String(bd).padStart(2, '0')}` : '';

      const edits = JSON.parse(localStorage.getItem('purples_member_edits') || '{}');
      edits[m.id] = {
        name,
        gender: document.getElementById('e-gender').value,
        birthDate,
        maritalStatus: document.getElementById('e-marital').value,
        region: document.getElementById('e-region').value,
        status: document.getElementById('e-status').value,
        education: document.getElementById('e-edu').value,
        school: document.getElementById('e-school').value.trim(),
        job: document.getElementById('e-job-etc').value.trim(),
        company: document.getElementById('e-company').value.trim(),
        phone: getPhone('1'),
        phone2: getPhone('2'),
        phone3: getPhone('3'),
        phoneRelation1: document.getElementById('e-ph1-rel').value,
        phone2Relation: document.getElementById('e-ph2-rel').value,
        phone3Relation: document.getElementById('e-ph3-rel').value,
        primaryPhone: repNo,
        consultant: document.getElementById('e-consultant').value,
        email: (document.getElementById('e-email-id').value.trim() && document.getElementById('e-email-domain').value.trim()) ? document.getElementById('e-email-id').value.trim() + '@' + document.getElementById('e-email-domain').value.trim() : '',
        memo: document.getElementById('e-etc').value.trim(),
        hope: document.getElementById('e-hope').value.trim(),
        height: document.getElementById('e-height').value,
        weight: document.getElementById('e-weight').value,
        editedAt: new Date().toISOString()
      };
      localStorage.setItem('purples_member_edits', JSON.stringify(edits));

      Toast.show(`${name}님의 회원정보가 수정되었습니다.`, 'success');
      setTimeout(() => window.location.href = 'detail.html?id=' + memberId, 800);
    }
  });

} // end if(m)
