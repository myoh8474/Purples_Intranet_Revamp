import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';
import { Formatters } from '@utils/formatters.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS } from '@config/constants.js';

const params = new URLSearchParams(window.location.search);
const memberId = parseInt(params.get('id'));
const m = MockAssociates.find(a => a.id === memberId);

initLayout({ pageId: 'associate-detail', breadcrumbs: ['준회원 관리', '회원정보 수정'] });
const content = document.getElementById('content');

if (!m) {
  content.innerHTML = `<div style="text-align:center;padding:80px"><div style="font-size:24px;margin-bottom:12px">⚠️</div><div style="font-size:16px;font-weight:600">회원을 찾을 수 없습니다.</div><p style="margin-top:8px;color:var(--text-muted)">ID: ${memberId || '없음'}</p><button class="btn btn--secondary" style="margin-top:16px" onclick="window.location.href='detail.html?id='+memberId">← 돌아가기</button></div>`;
} else {

const REGIONS = ['서울','부산','대구','광주','인천','대전','울산','경기','강원','세종','충북','충남','경북','경남','전북','전남','제주','해외','지역없음'];
const EDUCATIONS = ['고졸','전문대졸','대졸','석사','박사'];
const JOBS = ['회사원','공무원','전문직','자영업','프리랜서','교육직','의료직','금융직','IT/개발','연구직','학생','무직','기타'];
const CHANNELS = ['가입비견적','결혼테스트','네이버예약','네이버커플','무료상담','블라인드커플','실시간상담','이상형매칭','카카오커플','MBTI테스트','TV광고','구글커플','메타커플','당근커플','대표와상담','기타'];
const BRANCHES = [{code:'1',name:'퍼플스본사'},{code:'2',name:'퍼플스부산'},{code:'3',name:'퍼플스대전'},{code:'4',name:'퍼플스대구'},{code:'5',name:'퍼플스광주'},{code:'8',name:'퍼플스경기'},{code:'6',name:'디노블본사'},{code:'7',name:'디노블부산'},{code:'9',name:'르매리'}];

const sel = (arr, cur) => arr.map(v => `<option${v===cur?' selected':''}>${v}</option>`).join('');

content.innerHTML = `
<style>
  .edit-form { max-width: 960px; margin: 0 auto; }
  .edit-header { display:flex; align-items:center; justify-content:space-between; padding-bottom:16px; border-bottom:2px solid var(--border-light); margin-bottom:24px; }
  .edit-header__left { display:flex; align-items:center; gap:12px; }
  .edit-header__name { font-size:20px; font-weight:800; }
  .edit-header__meta { font-size:12px; color:var(--text-muted); }
  .edit-section { margin-bottom:24px; }
  .edit-section__title { font-size:14px; font-weight:700; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid var(--accent); color:var(--accent); display:flex; align-items:center; gap:6px; }
  .edit-table { width:100%; border-collapse:collapse; font-size:12px; }
  .edit-table td { padding:6px 10px; border:1px solid var(--border-light); vertical-align:middle; }
  .edit-table .lb { background:var(--bg-secondary); font-weight:600; white-space:nowrap; text-align:center; color:var(--text-secondary); width:100px; }
  .edit-table input:not([type="radio"]):not([type="checkbox"]), .edit-table select, .edit-table textarea {
    width:100%; padding:5px 8px; border:1px solid #ccc; font-size:12px; box-sizing:border-box; font-family:inherit; border-radius:3px;
  }
  .edit-table input:focus, .edit-table select:focus, .edit-table textarea:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 2px rgba(99,102,241,0.1); }
  .edit-table textarea { resize:vertical; min-height:60px; }
  .edit-table input[type="radio"], .edit-table input[type="checkbox"] { width:auto; margin:0; }
  .rg { display:flex; gap:16px; flex-wrap:wrap; }
  .rg label { display:flex; align-items:center; gap:4px; font-size:12px; cursor:pointer; white-space:nowrap; }
  .btn-bar { display:flex; justify-content:center; gap:12px; margin-top:32px; padding-top:20px; border-top:1px solid var(--border-light); }
  .req { color:#e53e3e; font-size:10px; }
</style>

<div class="edit-form">
  <!-- 헤더 -->
  <div class="edit-header">
    <div class="edit-header__left">
      <button class="btn btn--secondary btn--sm" id="btn-back">← 뒤로</button>
      <div>
        <div class="edit-header__name">회원정보 수정</div>
        <div class="edit-header__meta">${m.name} (${m.gender} · ${m.age}세) · ${Formatters.statusBadge(m.status,'associate')}</div>
      </div>
    </div>
  </div>

  <!-- 기본정보 -->
  <div class="edit-section">
    <div class="edit-section__title">기본정보</div>
    <table class="edit-table"><tbody>
      <tr>
        <td class="lb">회원명 <span class="req">*</span></td>
        <td><input type="text" id="e-name" value="${m.name}" /></td>
        <td class="lb">성별</td>
        <td>
          <div class="rg">
            <label><input type="radio" name="e-gender" value="남" ${m.gender==='남'?'checked':''} /> 남</label>
            <label><input type="radio" name="e-gender" value="여" ${m.gender==='여'?'checked':''} /> 여</label>
          </div>
        </td>
      </tr>
      <tr>
        <td class="lb">생년월일</td>
        <td><input type="date" id="e-birth" value="${m.birthDate?m.birthDate.split('T')[0]:''}" /></td>
        <td class="lb">결혼여부</td>
        <td>
          <select id="e-marital">
            <option${m.maritalStatus==='초혼'?' selected':''}>초혼</option>
            <option${m.maritalStatus==='재혼'?' selected':''}>재혼</option>
            <option${m.maritalStatus==='사별'?' selected':''}>사별</option>
          </select>
        </td>
      </tr>
      <tr>
        <td class="lb">지역</td>
        <td><select id="e-region"><option value="">선택</option>${sel(REGIONS, m.region)}</select></td>
        <td class="lb">가입경로</td>
        <td><input type="text" value="${m.channel}" readonly style="background:#f1f5f9" /></td>
      </tr>
      <tr>
        <td class="lb">지사</td>
        <td><select id="e-branch">${BRANCHES.map(b=>`<option value="${b.code}"${m.branch&&m.branch.includes(b.name.replace('퍼플스','').replace('디노블','').replace('르매리',''))?' selected':''}>${b.code} - ${b.name}</option>`).join('')}</select></td>
        <td class="lb">담당 매니저</td>
        <td><select id="e-consultant"><option value="">미배정</option>${CONSULTANTS.map(c=>`<option${c===m.consultant?' selected':''}>${c}</option>`).join('')}</select></td>
      </tr>
    </tbody></table>
  </div>

  <!-- 연락처 -->
  <div class="edit-section">
    <div class="edit-section__title">연락처</div>
    <table class="edit-table"><tbody>
      <tr>
        <td class="lb">핸드폰1 <span class="req">*</span></td>
        <td><input type="text" id="e-phone" value="${Formatters.phone(m.phone)}" /></td>
        <td class="lb">핸드폰2</td>
        <td><input type="text" id="e-phone2" placeholder="010-0000-0000" /></td>
      </tr>
      <tr>
        <td class="lb">자택번호</td>
        <td><input type="text" id="e-home-tel" placeholder="02-0000-0000" /></td>
        <td class="lb">직장번호</td>
        <td><input type="text" id="e-work-tel" placeholder="02-0000-0000" /></td>
      </tr>
      <tr>
        <td class="lb">이메일</td>
        <td><input type="email" id="e-email" placeholder="example@email.com" /></td>
        <td class="lb">집주소</td>
        <td><input type="text" id="e-address" placeholder="주소를 입력하세요" /></td>
      </tr>
      <tr>
        <td class="lb">수신설정</td>
        <td colspan="3">
          <div class="rg">
            <label><input type="checkbox" id="e-sms" checked /> SMS 수신</label>
            <label><input type="checkbox" id="e-mail-opt" checked /> 메일 수신</label>
            <label><input type="checkbox" id="e-retention" checked /> 리텐션 동의</label>
          </div>
        </td>
      </tr>
    </tbody></table>
  </div>

  <!-- 학력/직업 -->
  <div class="edit-section">
    <div class="edit-section__title">학력 / 직업</div>
    <table class="edit-table"><tbody>
      <tr>
        <td class="lb">최종학력 <span class="req">*</span></td>
        <td><select id="e-edu"><option value="">선택</option>${sel(EDUCATIONS, m.education)}</select></td>
        <td class="lb">학교명</td>
        <td><input type="text" id="e-school" value="${m.school||''}" /></td>
      </tr>
      <tr>
        <td class="lb">직업 <span class="req">*</span></td>
        <td><select id="e-job"><option value="">선택</option>${sel(JOBS, m.job)}</select></td>
        <td class="lb">직장명</td>
        <td><input type="text" id="e-company" value="${m.company||''}" /></td>
      </tr>
    </tbody></table>
  </div>

  <!-- 신체/기타 -->
  <div class="edit-section">
    <div class="edit-section__title">신체 / 기타</div>
    <table class="edit-table"><tbody>
      <tr>
        <td class="lb">신장</td>
        <td><input type="number" id="e-height" placeholder="cm" style="width:80px" /> cm</td>
        <td class="lb">체중</td>
        <td><input type="number" id="e-weight" placeholder="kg" style="width:80px" /> kg</td>
      </tr>
      <tr>
        <td class="lb">혈액형</td>
        <td>
          <select id="e-blood">
            <option value="">선택</option>
            <option>A형</option><option>B형</option><option>O형</option><option>AB형</option>
          </select>
        </td>
        <td class="lb">자녀</td>
        <td>
          <select id="e-children">
            <option>없음</option><option>1명</option><option>2명</option><option>3명 이상</option>
          </select>
        </td>
      </tr>
      <tr>
        <td class="lb">종교</td>
        <td>
          <select id="e-religion">
            <option value="">선택</option>
            <option>무교</option><option>기독교</option><option>천주교</option><option>불교</option><option>기타</option>
          </select>
        </td>
        <td class="lb">취미</td>
        <td><input type="text" id="e-hobby" placeholder="취미를 입력하세요" /></td>
      </tr>
      <tr>
        <td class="lb">희망 상대</td>
        <td colspan="3"><textarea id="e-preference" placeholder="희망 상대 조건을 입력하세요"></textarea></td>
      </tr>
    </tbody></table>
  </div>

  <!-- 메모 -->
  <div class="edit-section">
    <div class="edit-section__title">메모</div>
    <table class="edit-table"><tbody>
      <tr>
        <td class="lb">상담메모</td>
        <td colspan="3"><textarea id="e-memo" placeholder="메모를 입력하세요">${m.memo||''}</textarea></td>
      </tr>
    </tbody></table>
  </div>

  <!-- 버튼 -->
  <div class="btn-bar">
    <button class="btn btn--secondary" id="btn-cancel" style="min-width:120px">취소</button>
    <button class="btn btn--primary" id="btn-save" style="min-width:120px">저장</button>
  </div>
</div>
`;

// ── 이벤트 ──
document.getElementById('btn-back').addEventListener('click', () => window.location.href='detail.html?id='+memberId);
document.getElementById('btn-cancel').addEventListener('click', () => {
  if (confirm('수정 내용이 저장되지 않습니다. 취소하시겠습니까?')) window.location.href='detail.html?id='+memberId;
});

document.getElementById('btn-save').addEventListener('click', () => {
  const name = document.getElementById('e-name').value.trim();
  const phone = document.getElementById('e-phone').value.trim();

  if (!name) { alert('회원명을 입력해 주세요.'); return; }
  if (!phone) { alert('핸드폰 번호를 입력해 주세요.'); return; }

  if (confirm(`${name}님의 정보를 저장하시겠습니까?`)) {
    // localStorage에 수정 데이터 저장
    const edits = JSON.parse(localStorage.getItem('purples_member_edits') || '{}');
    edits[m.id] = {
      name,
      gender: document.querySelector('input[name="e-gender"]:checked')?.value || m.gender,
      birthDate: document.getElementById('e-birth').value,
      maritalStatus: document.getElementById('e-marital').value,
      region: document.getElementById('e-region').value,
      education: document.getElementById('e-edu').value,
      job: document.getElementById('e-job').value,
      school: document.getElementById('e-school').value.trim(),
      company: document.getElementById('e-company').value.trim(),
      phone: phone.replace(/-/g, ''),
      consultant: document.getElementById('e-consultant').value,
      editedAt: new Date().toISOString()
    };
    localStorage.setItem('purples_member_edits', JSON.stringify(edits));

    Toast.show(`${name}님의 회원정보가 수정되었습니다.`, 'success');
    setTimeout(() => window.location.href='detail.html?id='+memberId, 800);
  }
});

} // end if(m)
