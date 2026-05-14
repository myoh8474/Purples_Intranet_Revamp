/* ========================================
   정회원 등록 페이지 (ES Module)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { CONSULTANTS } from '@mock/regulars.js';

initLayout({ pageId: 'regular-register', breadcrumbs: ['정회원 관리', '정회원 등록'] });

const content = document.getElementById('content');

const programs = ['기타','전문직','브론즈','파타상품','준전문직','실버(에메랄드)','골드(사파이어)','플래티늄(루비)','다이아몬드','시크릿','블랙클럽','로얄클럽'];
const programGrades = {
  '실버(에메랄드)': [{ value:'플러스', label:'실버 플러스' },{ value:'A', label:'실버 A' },{ value:'B', label:'실버 B' }],
  '골드(사파이어)': [{ value:'A', label:'골드 A' },{ value:'B', label:'골드 B' },{ value:'C', label:'골드 C' }],
  '플래티늄(루비)': [{ value:'기본', label:'플래티늄' },{ value:'A', label:'플래티늄 A' },{ value:'B', label:'플래티늄 B' }],
  '다이아몬드': [{ value:'A', label:'다이아 A' },{ value:'B', label:'다이아 B' },{ value:'C', label:'다이아 C' }],
  '시크릿': [{ value:'A', label:'시크릿 A' },{ value:'B', label:'시크릿 B' }],
  '블랙클럽': [{ value:'A', label:'블랙클럽 A' },{ value:'B', label:'블랙클럽 B' }],
};
const branches = ['서울','부산','대구','인천','광주','대전','울산','세종'];
const regions = ['서울','경기','부산','인천','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'];
const eduRows = ['고등학교','전문대학교','대학교','대학원(석사)','대학원(박사)','기타','유학','어학연수'];

let selectedProgram = '골드(사파이어)';
let selectedGrade = '';
let idCheckPassed = false;

content.innerHTML = `
  <style>
    .reg-section { background:var(--bg-primary);border:1px solid var(--border-light);margin-bottom:20px; }
    .reg-section__header { display:flex;align-items:center;gap:10px;padding:12px 20px;background:var(--bg-secondary);border-bottom:1px solid var(--border-light); }
    .reg-section__number { display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:var(--accent);color:white;font-size:12px;font-weight:700; }
    .reg-section__title { font-size:14px;font-weight:700; }
    .reg-section__body { padding:20px; }
    .reg-table { border-collapse:collapse;font-size:13px;width:100%; }
    .reg-table td, .reg-table th { padding:7px 10px;border:1px solid var(--border-light);vertical-align:middle; }
    .reg-label { background:var(--bg-secondary);font-weight:600;white-space:nowrap;color:var(--text-secondary);text-align:center;font-size:12px;width:110px; }
    .required { color:#e53e3e;font-size:11px; }
    .reg-input { padding:6px 8px;border:1px solid var(--border-light);font-size:12px;box-sizing:border-box;background:#fff;outline:none;width:100%; }
    .reg-input:focus { border-color:var(--accent);box-shadow:0 0 0 2px rgba(85,85,85,0.1); }
    .reg-select { width:100%;padding:6px 8px;border:1px solid var(--border-light);font-size:12px;background:#fff;cursor:pointer; }
    .radio-pills { display:flex;gap:6px;flex-wrap:wrap; }
    .radio-pill { cursor:pointer; }
    .radio-pill input { display:none; }
    .radio-pill span { display:inline-block;padding:4px 12px;font-size:12px;border:1px solid var(--border-light);background:var(--bg-primary);transition:all 0.15s;user-select:none; }
    .radio-pill input:checked + span { background:var(--accent);color:white;border-color:var(--accent); }
    .program-chips { display:flex;flex-wrap:wrap;gap:8px; }
    .program-chip { padding:8px 16px;border:1px solid var(--border-light);background:var(--bg-primary);font-size:12px;cursor:pointer;transition:all 0.15s;font-family:var(--font-family); }
    .program-chip:hover { border-color:var(--accent);background:var(--accent-bg); }
    .program-chip.active { background:var(--accent);color:white;border-color:var(--accent); }
    .grade-selector { display:none;margin-top:0;padding:16px;background:var(--bg-secondary);border:1px solid var(--border-light); }
    .grade-selector.visible { display:block; }
    .grade-chips { display:flex;flex-wrap:wrap;gap:8px; }
    .grade-chip { cursor:pointer; }
    .grade-chip input { display:none; }
    .grade-chip__label { display:inline-block;padding:7px 20px;font-size:12px;border:1px solid var(--border-medium);background:var(--bg-primary);transition:all 0.15s;user-select:none; }
    .grade-chip.active .grade-chip__label { background:var(--accent);color:white;border-color:var(--accent);font-weight:700; }
    .split-layout { display:flex;gap:20px; }
    .split-layout > div { flex:1; }
    .id-check-wrap { max-width:500px; }
    .id-input-group { display:flex;gap:6px;align-items:stretch; }
    .id-input-group .reg-input { flex:1; }
    .id-feedback { min-height:20px;font-size:11px;padding:3px 0 0; }
    .id-feedback--success { color:#16a34a;font-weight:600; }
    .id-feedback--error { color:#dc2626;font-weight:600; }
    .id-feedback--info { color:var(--accent); }
  </style>

  <div class="page-header">
    <div style="display:flex;align-items:center;gap:12px">
      <button class="btn btn--secondary btn--sm" id="btn-back-list">← 목록</button>
      <div>
        <h1 class="page-header__title">정회원 등록</h1>
        <p class="page-header__subtitle">신규 정회원 등록</p>
      </div>
    </div>
    <div class="page-header__actions">
      <button class="btn btn--secondary" id="btn-register-cancel">취소</button>
      <button class="btn btn--primary" id="btn-register-submit">💎 정회원 등록</button>
    </div>
  </div>

  <!-- 1. 기본정보 -->
  <div class="reg-section">
    <div class="reg-section__header"><span class="reg-section__number">1</span><span class="reg-section__title">기본정보</span></div>
    <div class="reg-section__body">
      <table class="reg-table"><tbody>
        <tr><td class="reg-label">회원명 <span class="required">*</span></td><td><input type="text" class="reg-input" id="reg-name" placeholder="성명을 입력하세요" /></td>
            <td class="reg-label">주민번호</td><td><div style="display:flex;gap:4px;align-items:center"><input type="text" class="reg-input" maxlength="6" style="width:90px" placeholder="앞자리" /> <span style="color:var(--text-muted)">-</span> <input type="password" class="reg-input" maxlength="7" style="width:100px" placeholder="뒷자리" /></div></td></tr>
        <tr><td class="reg-label">아이디 <span class="required">*</span></td><td colspan="3"><div class="id-check-wrap"><div class="id-input-group"><input type="text" class="reg-input" id="reg-member-id" placeholder="영문, 숫자 조합 4~20자" /><button class="btn btn--sm btn--secondary" id="btn-id-check">중복확인</button></div><div class="id-feedback" id="id-feedback"></div></div></td></tr>
        <tr><td class="reg-label">지사코드 <span class="required">*</span></td><td><select class="reg-select" id="reg-branch"><option value="">지사 선택</option>${branches.map(b=>`<option>${b}</option>`).join('')}</select></td>
            <td class="reg-label">결혼형태</td><td><div class="radio-pills">${['미혼','재혼','사별'].map((v,i)=>`<label class="radio-pill"><input type="radio" name="marriage" value="${v}" ${i===0?'checked':''} /><span>${v}</span></label>`).join('')}</div></td></tr>
      </tbody></table>
    </div>
  </div>

  <!-- 2. 프로그램 선택 -->
  <div class="reg-section">
    <div class="reg-section__header"><span class="reg-section__number">2</span><span class="reg-section__title">프로그램 선택</span></div>
    <div class="reg-section__body">
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px">프로그램 <span class="required">*</span></div>
        <div class="program-chips" id="program-chips">
          ${programs.map(p=>`<button type="button" class="program-chip ${p===selectedProgram?'active':''}" data-program="${p}">${p}${programGrades[p]?' ▾':''}</button>`).join('')}
        </div>
      </div>
      <div class="grade-selector ${programGrades[selectedProgram]?'visible':''}" id="grade-selector">
        <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px">등급 선택 <span class="required">*</span></div>
        <div class="grade-chips" id="grade-chips"></div>
      </div>
    </div>
  </div>

  <!-- 3. 가입/서비스/결제 -->
  <div class="reg-section">
    <div class="reg-section__header"><span class="reg-section__number">3</span><span class="reg-section__title">가입 / 서비스 / 결제</span></div>
    <div class="reg-section__body">
      <div class="split-layout">
        <div><table class="reg-table"><tbody>
          <tr><td class="reg-label">가입일 <span class="required">*</span></td><td><input type="date" class="reg-input" value="${new Date().toISOString().slice(0,10)}" /></td></tr>
          <tr><td class="reg-label">서비스</td><td>
            <div style="display:flex;gap:20px;margin-bottom:8px">
              ${['기간제','횟수제','인증제'].map((v,i)=>`<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="radio" name="service" value="${v}" ${i===1?'checked':''} /> ${v}</label>`).join('')}
            </div>
            <div style="display:flex;gap:8px;align-items:center;font-size:12px">횟수: <input type="number" class="reg-input" style="width:60px" value="6" /> 회</div>
          </td></tr>
        </tbody></table></div>
        <div><table class="reg-table"><tbody>
          <tr><td class="reg-label">주가입</td><td><input type="number" class="reg-input" placeholder="원" /></td></tr>
          <tr><td class="reg-label">성혼비</td><td><input type="number" class="reg-input" placeholder="원" /></td></tr>
        </tbody></table></div>
      </div>
    </div>
  </div>

  <!-- 4. 연락처 -->
  <div class="reg-section">
    <div class="reg-section__header"><span class="reg-section__number">4</span><span class="reg-section__title">연락처</span></div>
    <div class="reg-section__body">
      <table class="reg-table"><tbody>
        <tr><td class="reg-label">컨설턴트</td><td><select class="reg-select"><option value="">컨설턴트 선택</option>${CONSULTANTS.map(c=>`<option>${c}</option>`).join('')}</select></td>
            <td class="reg-label">핸드폰 <span class="required">*</span></td><td><input type="text" class="reg-input" id="reg-phone" placeholder="010-0000-0000" /></td></tr>
        <tr><td class="reg-label">자택번호</td><td><input type="text" class="reg-input" placeholder="000-0000-0000" /></td>
            <td class="reg-label">e-mail</td><td><input type="email" class="reg-input" placeholder="email@example.com" /></td></tr>
      </tbody></table>
    </div>
  </div>

  <!-- 5. 학력/직업 -->
  <div class="reg-section">
    <div class="reg-section__header"><span class="reg-section__number">5</span><span class="reg-section__title">학력 / 직업</span></div>
    <div class="reg-section__body">
      <table class="reg-table" style="margin-bottom:16px"><tbody>
        <tr><td class="reg-label">학 력</td><td><select class="reg-select"><option value="">최종학력</option><option>고졸</option><option>전문대졸</option><option>대졸</option><option>석사</option><option>박사</option></select></td>
            <td class="reg-label">직 업</td><td><select class="reg-select"><option value="">직업</option><option>회사원</option><option>공무원</option><option>전문직</option><option>자영업</option><option>기타</option></select></td></tr>
      </tbody></table>
      <table class="reg-table">
        <thead><tr><th style="width:100px">구분</th><th>학교명</th><th>전공</th><th style="width:70px">졸업여부</th><th style="width:70px">입학년도</th><th style="width:70px">졸업년도</th></tr></thead>
        <tbody>${eduRows.map(row=>`<tr><td style="background:var(--bg-secondary);font-weight:600;font-size:12px;text-align:center">${row}</td><td><input type="text" class="reg-input" /></td><td><input type="text" class="reg-input" /></td><td><select class="reg-select"><option>선택</option><option>졸업</option><option>재학</option><option>중퇴</option></select></td><td><input type="text" class="reg-input" maxlength="4" placeholder="YYYY" /></td><td><input type="text" class="reg-input" maxlength="4" placeholder="YYYY" /></td></tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
`;

// 이벤트 바인딩
document.getElementById('btn-back-list')?.addEventListener('click', () => {
  window.location.href = '../regular/list.html';
});
document.getElementById('btn-register-cancel')?.addEventListener('click', () => {
  if (confirm('작성 중인 내용이 사라집니다. 취소하시겠습니까?')) window.location.href = '../regular/list.html';
});

// 프로그램 칩 선택
document.getElementById('program-chips')?.addEventListener('click', e => {
  const chip = e.target.closest('.program-chip');
  if (!chip) return;
  selectedProgram = chip.dataset.program;
  selectedGrade = '';
  document.querySelectorAll('.program-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  updateGradeChips();
});

function updateGradeChips() {
  const selectorEl = document.getElementById('grade-selector');
  const chipsEl = document.getElementById('grade-chips');
  const grades = programGrades[selectedProgram];
  if (!grades) { selectorEl.classList.remove('visible'); chipsEl.innerHTML = ''; return; }
  selectorEl.classList.add('visible');
  chipsEl.innerHTML = grades.map(g => `<label class="grade-chip"><input type="radio" name="grade" value="${g.value}" /><span class="grade-chip__label">${g.label}</span></label>`).join('');
  chipsEl.querySelectorAll('input[name="grade"]').forEach(r => {
    r.addEventListener('change', e => {
      selectedGrade = e.target.value;
      chipsEl.querySelectorAll('.grade-chip').forEach(c => c.classList.remove('active'));
      e.target.closest('.grade-chip').classList.add('active');
    });
  });
}
updateGradeChips();

// 아이디 중복 확인
document.getElementById('btn-id-check')?.addEventListener('click', () => {
  const val = document.getElementById('reg-member-id').value.trim();
  const fb = document.getElementById('id-feedback');
  if (val.length < 4) { fb.textContent = '⚠ 아이디를 4자 이상 입력해 주세요'; fb.className = 'id-feedback id-feedback--error'; return; }
  idCheckPassed = true;
  fb.textContent = '✓ 사용 가능한 아이디입니다'; fb.className = 'id-feedback id-feedback--success';
  Toast.show('사용 가능한 아이디입니다.', 'success');
});

// 등록 제출
document.getElementById('btn-register-submit')?.addEventListener('click', () => {
  const name = document.getElementById('reg-name')?.value.trim();
  if (!name) { Toast.show('회원명을 입력해 주세요.', 'warning'); return; }
  if (!idCheckPassed) { Toast.show('아이디 중복확인을 진행해 주세요.', 'warning'); return; }
  const phone = document.getElementById('reg-phone')?.value.trim();
  if (!phone) { Toast.show('핸드폰 번호를 입력해 주세요.', 'warning'); return; }
  const progText = selectedGrade ? `${selectedProgram} ${selectedGrade}` : selectedProgram;
  if (confirm(`${name}님을 [${progText}] 프로그램으로 정회원 등록하시겠습니까?`)) {
    Toast.show('정회원 등록이 완료되었습니다.', 'success');
    setTimeout(() => { window.location.href = '../regular/list.html'; }, 1500);
  }
});
