import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';
import { Formatters } from '@utils/formatters.js';
import { CONSULTANTS } from '@config/constants.js';

initLayout({ pageId: 'associate-register', breadcrumbs: ['준회원 관리', '신규 등록'] });
const content = document.getElementById('content');

const BRANCHES_FULL = [
  {code:'1',name:'본사'},{code:'8',name:'경기'},{code:'3',name:'대전'},
  {code:'4',name:'대구'},{code:'2',name:'부산'},{code:'5',name:'광주'}
];
const REGIONS = ['서울','부산','대구','광주','인천','대전','울산','경기','강원','세종','충북','충남','경북','경남','전북','전남','제주','해외','지역없음'];
const CHANNELS = ['가입비견적','결혼테스트','네이버예약','네이버커플','무료상담','블라인드커플','실시간상담','이상형매칭','카카오커플','MBTI테스트','TV광고','구글커플','메타커플','당근커플','대표와상담','문의전화+미래배우자','기타'];
const EDUCATIONS = ['고졸','전문대졸','대졸','석사','박사'];
const JOBS = ['회사원','공무원','전문직','자영업','프리랜서','교육직','의료직','금융직','IT/개발','연구직','학생','무직','기타'];

const today = new Date().toISOString().split('T')[0];

content.innerHTML = `
<style>
  .reg-form { max-width: 960px; margin: 0 auto; }
  .reg-section { margin-bottom: 24px; }
  .reg-section__title { font-size: 14px; font-weight: 700; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid var(--border-light); display:flex; align-items:center; gap:6px; }
  .reg-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .reg-table td { padding: 8px 10px; border: 1px solid var(--border-light); vertical-align: middle; }
  .reg-table .lb { background: var(--bg-secondary); font-weight: 600; white-space: nowrap; text-align: center; color: var(--text-secondary); width: 110px; font-size: 12px; }
  .reg-table input:not([type="radio"]):not([type="checkbox"]), .reg-table select, .reg-table textarea {
    width: 100%; padding: 6px 8px; border: 1px solid #ccc; font-size: 12px; box-sizing: border-box; font-family: inherit;
  }
  .reg-table input:focus, .reg-table select:focus, .reg-table textarea:focus { outline: none; border-color: var(--accent); }
  .reg-table input[type="radio"], .reg-table input[type="checkbox"] { width: auto; margin: 0; }
  .rg { display: flex; gap: 20px; flex-wrap: wrap; }
  .rg label { display: flex; align-items: center; gap: 4px; font-size: 12px; cursor: pointer; white-space: nowrap; }
  .req { color: #e53e3e; font-size: 10px; margin-left: 2px; }
  .form-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 20px 0; border-top: 2px solid var(--border-light); margin-top: 32px; }
</style>

<div class="reg-form">
  <div class="page-header">
    <div>
      <h1 class="page-header__title">준회원 신규 등록</h1>
      <p class="page-header__subtitle">신규 준회원 정보를 입력하여 등록합니다</p>
    </div>
  </div>

  <!-- 기본정보 -->
  <div class="reg-section">
    <div class="reg-section__title">기본정보</div>
    <table class="reg-table"><tbody>
      <tr>
        <td class="lb">회원명 <span class="req">*</span></td>
        <td><input type="text" id="r-name" placeholder="이름 입력" /></td>
        <td class="lb">성별 <span class="req">*</span></td>
        <td>
          <div class="rg">
            <label><input type="radio" name="r-gender" value="남" /> 남</label>
            <label><input type="radio" name="r-gender" value="여" /> 여</label>
          </div>
        </td>
      </tr>
      <tr>
        <td class="lb">생년월일 <span class="req">*</span></td>
        <td><input type="date" id="r-birth" /></td>
        <td class="lb">핸드폰 <span class="req">*</span></td>
        <td><input type="tel" id="r-phone" placeholder="01012345678" maxlength="11" /></td>
      </tr>
      <tr>
        <td class="lb">결혼형태</td>
        <td>
          <div class="rg">
            <label><input type="radio" name="r-marriage" value="초혼" checked /> 초혼</label>
            <label><input type="radio" name="r-marriage" value="재혼" /> 재혼</label>
            <label><input type="radio" name="r-marriage" value="사별" /> 사별</label>
          </div>
        </td>
        <td class="lb">지역 <span class="req">*</span></td>
        <td>
          <select id="r-region">
            <option value="">선택</option>
            ${REGIONS.map(r=>`<option>${r}</option>`).join('')}
          </select>
        </td>
      </tr>
      <tr>
        <td class="lb">이메일</td>
        <td><input type="email" id="r-email" placeholder="example@email.com" /></td>
        <td class="lb">직장/회사</td>
        <td><input type="text" id="r-company" placeholder="직장명" /></td>
      </tr>
    </tbody></table>
  </div>

  <!-- 학력/직업 -->
  <div class="reg-section">
    <div class="reg-section__title">학력·직업</div>
    <table class="reg-table"><tbody>
      <tr>
        <td class="lb">학력 <span class="req">*</span></td>
        <td>
          <select id="r-edu">
            <option value="">선택</option>
            ${EDUCATIONS.map(e=>`<option>${e}</option>`).join('')}
          </select>
        </td>
        <td class="lb">학교명</td>
        <td><input type="text" id="r-school" placeholder="최종학교명" /></td>
      </tr>
      <tr>
        <td class="lb">직업 <span class="req">*</span></td>
        <td>
          <select id="r-job">
            <option value="">선택</option>
            ${JOBS.map(j=>`<option>${j}</option>`).join('')}
          </select>
        </td>
        <td class="lb">직장번호</td>
        <td><input type="tel" id="r-work-phone" placeholder="02-0000-0000" /></td>
      </tr>
    </tbody></table>
  </div>

  <!-- 유입정보 -->
  <div class="reg-section">
    <div class="reg-section__title">유입정보</div>
    <table class="reg-table"><tbody>
      <tr>
        <td class="lb">가입경로 <span class="req">*</span></td>
        <td>
          <select id="r-channel">
            <option value="">선택</option>
            ${CHANNELS.map(c=>`<option>${c}</option>`).join('')}
          </select>
        </td>
        <td class="lb">등록일</td>
        <td><input type="date" id="r-reg-date" value="${today}" /></td>
      </tr>
      <tr>
        <td class="lb">지사 <span class="req">*</span></td>
        <td>
          <select id="r-branch">
            <option value="">선택</option>
            ${BRANCHES_FULL.map(b=>`<option value="${b.code}">${b.code} - ${b.name}</option>`).join('')}
          </select>
        </td>
        <td class="lb">담당 매니저</td>
        <td>
          <select id="r-consultant">
            <option value="">미배정</option>
            ${CONSULTANTS.map(c=>`<option>${c}</option>`).join('')}
          </select>
        </td>
      </tr>
    </tbody></table>
  </div>

  <!-- 메모 -->
  <div class="reg-section">
    <div class="reg-section__title">메모</div>
    <table class="reg-table"><tbody>
      <tr>
        <td class="lb">상담메모</td>
        <td colspan="3"><textarea id="r-memo" rows="4" placeholder="상담 내용이나 특이사항을 입력하세요..."></textarea></td>
      </tr>
    </tbody></table>
  </div>

  <!-- 액션 -->
  <div class="form-actions">
    <button class="btn btn--secondary" id="btn-cancel">취소</button>
    <button class="btn btn--reset" id="btn-reset">초기화</button>
    <button class="btn btn--primary" id="btn-submit">준회원 등록</button>
  </div>
</div>
`;

// ── 이벤트 ──
document.getElementById('btn-cancel').addEventListener('click', () => {
  if (confirm('작성 중인 내용이 사라집니다. 취소하시겠습니까?')) {
    window.close();
  }
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if (confirm('입력한 내용을 모두 초기화하시겠습니까?')) {
    document.querySelectorAll('.reg-form input:not([type="radio"]):not([type="date"]), .reg-form textarea').forEach(el => el.value = '');
    document.querySelectorAll('.reg-form select').forEach(el => el.selectedIndex = 0);
    Toast.show('입력 내용이 초기화되었습니다.', 'info');
  }
});

document.getElementById('btn-submit').addEventListener('click', () => {
  const name = document.getElementById('r-name').value.trim();
  const gender = document.querySelector('input[name="r-gender"]:checked')?.value;
  const birth = document.getElementById('r-birth').value;
  const phone = document.getElementById('r-phone').value.trim();
  const region = document.getElementById('r-region').value;
  const edu = document.getElementById('r-edu').value;
  const job = document.getElementById('r-job').value;
  const channel = document.getElementById('r-channel').value;
  const branch = document.getElementById('r-branch').value;

  // 필수값 검증
  const missing = [];
  if (!name) missing.push('회원명');
  if (!gender) missing.push('성별');
  if (!birth) missing.push('생년월일');
  if (!phone) missing.push('핸드폰');
  if (!region) missing.push('지역');
  if (!edu) missing.push('학력');
  if (!job) missing.push('직업');
  if (!channel) missing.push('가입경로');
  if (!branch) missing.push('지사');

  if (missing.length > 0) {
    alert(`필수 항목을 입력하세요:\n${missing.join(', ')}`);
    return;
  }

  // 전화번호 형식
  if (!/^01[0-9]{8,9}$/.test(phone)) {
    Toast.show('핸드폰 번호 형식이 올바르지 않습니다. (예: 01012345678)', 'warning');
    return;
  }

  if (confirm(`"${name}" 준회원을 등록하시겠습니까?`)) {
    // localStorage에 저장 (데모)
    const newMember = {
      id: Date.now(),
      name,
      gender,
      birthDate: new Date(birth).toISOString(),
      age: Formatters.age(new Date(birth).toISOString()),
      phone,
      region,
      education: edu,
      job,
      school: document.getElementById('r-school').value.trim(),
      company: document.getElementById('r-company').value.trim(),
      email: document.getElementById('r-email').value.trim(),
      channel,
      branch: document.getElementById('r-branch').selectedOptions[0]?.text.split(' - ')[1] || '',
      consultant: document.getElementById('r-consultant').value || '미배정',
      maritalStatus: document.querySelector('input[name="r-marriage"]:checked')?.value || '초혼',
      status: '컨텍전',
      registeredAt: document.getElementById('r-reg-date').value + 'T00:00:00.000Z',
      distributedAt: new Date().toISOString(),
      lastContactAt: new Date().toISOString(),
      memo: document.getElementById('r-memo').value.trim(),
      duplicateEntries: [],
      contactHistory: [],
      sales: []
    };

    // localStorage에 신규 회원 저장
    const custom = JSON.parse(localStorage.getItem('purples_custom_members') || '[]');
    custom.push(newMember);
    localStorage.setItem('purples_custom_members', JSON.stringify(custom));

    Toast.show(`"${name}" 준회원이 등록되었습니다!`, 'success');

    setTimeout(() => {
      if (confirm('목록 페이지로 이동하시겠습니까?')) {
        window.location.href = 'list.html';
      }
    }, 500);
  }
});
