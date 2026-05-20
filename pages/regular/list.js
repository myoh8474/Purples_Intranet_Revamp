/* ========================================
   정회원 리스트 페이지
   - 기본 필터 (항상 노출) + 상세 필터 (접기/펼치기)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars, BRANDS, MATCH_MANAGERS, REGIONS, BRANCHES, CONSULTANTS } from '@mock/regulars.js';
import { REGULAR_STATUSES, PROGRAMS_FLAT } from '@config/constants.js';

initLayout({ pageId: 'regular-list', breadcrumbs: ['정회원 관리', '정회원 목록'] });

const content = document.getElementById('content');

const MARITAL_OPTIONS = ['상관없음','미혼','재혼','사별','사실혼','삼혼이상'];
const CHILD_OPTIONS = ['무','본인','전배우자','기타'];
const EDUCATION_OPTIONS = ['고졸','전문대졸','대졸','석사','박사'];
const RELIGION_OPTIONS = ['무교','기독교','천주교','불교','기타'];
const WEALTH_OPTIONS = ['10억미만','10~20억','20~30억','30~50억','50~100억','100~200억','200~300억','300~500억','500억이상'];
const OVERSEAS_OPTIONS = ['없음','시민권자','영주권자'];
const REJOIN_OPTIONS = [1,2,3,4,5,6];
const JOB_TREE = {
  '전문직': ['의사','치과의사','한의사','약사','변호사','판검사','회계사','세무사','변리사','법무사','감정평가사','관세사','노무사','건축사','수의사'],
  '의료직': ['간호사','물리치료사','방사선사','임상병리사','치위생사','작업치료사','의료기사'],
  '교육직': ['교수','교사','강사','학원장','유치원교사','특수교육교사'],
  '금융직': ['은행원','증권사','보험사','자산운용','펀드매니저','애널리스트','보험설계사'],
  '공무원': ['일반행정','경찰','소방','군인','외교관','검찰','교정','세관','우정'],
  '대기업': ['삼성','LG','현대','SK','롯데','포스코','한화','GS','CJ','두산','KT','네이버','카카오'],
  '공기업': ['한전','가스공사','수자원공사','도로공사','철도공사','토지공사','인천공항'],
  'IT/개발': ['SW개발','프론트엔드','백엔드','데이터분석','AI/ML','보안','DBA','PM/PO','UX/UI'],
  '자영업': ['자영업','프랜차이즈','온라인쇼핑몰','요식업','카페','병원경영','학원경영'],
  '사업가': ['대표이사','이사','법인대표','스타트업','투자'],
  '방송/예체능': ['방송인','배우','모델','음악가','체육인','무용가','디자이너','사진작가'],
  '연구직': ['연구원','박사후연구원','국책연구소','기업연구소'],
  '일반사무': ['회사원','사무직','경리','인사','영업','마케팅','무역','비서','총무'],
  '기타': ['프리랜서','주부','무직','기타'],
};
const JOB_OPTIONS = Object.values(JOB_TREE).flat();
const JOB_CATEGORIES = Object.keys(JOB_TREE);

function selectHtml(id, label, options, w) {
  return `<select class="form-select form-input--sm" id="${id}" style="width:auto;font-size:12px">
      <option value="">${label} 전체</option>
      ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
    </select>`;
}

function multiSelectHtml(id, label, options) {
  return `<div class="multi-select" id="${id}-wrap" style="position:relative">
    <button type="button" class="form-select form-input--sm" id="${id}-btn" style="width:auto;font-size:12px;text-align:left;cursor:pointer;min-width:100px">${label} 전체</button>
    <div class="multi-select__dropdown" id="${id}-dropdown" style="display:none;position:absolute;top:100%;left:0;z-index:100;background:#fff;border:1px solid var(--border-medium);border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.12);max-height:320px;overflow-y:auto;min-width:200px;padding:6px 0;margin-top:2px">
      ${options.map(o => `<label style="display:flex;align-items:center;gap:6px;padding:4px 12px;font-size:12px;cursor:pointer;white-space:nowrap" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background=''">
        <input type="checkbox" class="${id}-chk" value="${o}" style="accent-color:var(--accent)">${o}
      </label>`).join('')}
    </div>
  </div>`;
}

function jobTreeSelectHtml() {
  let inner = '';
  for (const [cat, jobs] of Object.entries(JOB_TREE)) {
    inner += `<div style="padding:4px 12px 2px;font-size:11px;font-weight:700;color:var(--accent);margin-top:4px;border-top:1px solid var(--border-light)">${cat}</div>`;
    inner += jobs.map(j => `<label style="display:flex;align-items:center;gap:6px;padding:3px 12px 3px 20px;font-size:12px;cursor:pointer;white-space:nowrap" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background=''">
      <input type="checkbox" class="rf-job-chk" value="${j}" style="accent-color:var(--accent)">${j}
    </label>`).join('');
  }
  return `<div class="multi-select" id="rf-job-wrap" style="position:relative">
    <button type="button" class="form-select form-input--sm" id="rf-job-btn" style="width:auto;font-size:12px;text-align:left;cursor:pointer;min-width:120px">직업 전체</button>
    <div class="multi-select__dropdown" id="rf-job-dropdown" style="display:none;position:absolute;top:100%;left:0;z-index:100;background:#fff;border:1px solid var(--border-medium);border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.12);max-height:360px;overflow-y:auto;min-width:220px;padding:6px 0;margin-top:2px">
      ${inner}
    </div>
  </div>`;
}

content.innerHTML = `
  <div class="page-header" style="margin-bottom:24px">
    <div>
      <h1 class="page-header__title">정회원 관리</h1>
      <p class="page-header__subtitle">정회원 리스트 조회 및 관리</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn--secondary btn--sm" id="btn-reg-manager">담당자 일부변경</button>
    </div>
  </div>

  <!-- 기본 필터 (항상 노출) -->
  <div class="filter-bar" style="margin-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0">
    <div class="filter-bar__row">
      ${selectHtml('rf-brand','브랜드',BRANDS)}
      ${selectHtml('rf-branch','지사',BRANCHES)}
      ${selectHtml('rf-consultant','상담자',CONSULTANTS)}
      ${selectHtml('rf-match-mgr','커플매니저',MATCH_MANAGERS)}
      ${selectHtml('rf-status','상태',REGULAR_STATUSES)}
      <input type="text" class="form-input form-input--sm" id="rf-keyword" placeholder="이름, 전화번호, ID 검색..." style="flex:1;min-width:150px">
      <button class="btn btn--primary btn--sm" id="btn-search" style="align-self:flex-end">검색</button>
    </div>
  </div>

  <!-- 기본 필터 하단: 상세검색 펼치기 (접힌 상태에서만 보임) -->
  <div id="adv-toggle-closed" style="background:#fff;border:1px solid var(--border-light);border-top:1px dashed var(--border-light);padding:6px 0;text-align:center;border-radius:0 0 var(--radius-lg) var(--radius-lg)">
    <button id="btn-toggle-open" style="background:none;border:none;cursor:pointer;font-size:12px;font-weight:600;color:var(--accent);font-family:inherit">▼ 상세검색 펼치기</button>
  </div>

  <!-- 상세 필터 영역 (기본 숨김) -->
  <div id="adv-filters" style="display:none;margin-top:-1px">
    <!-- 인적사항 -->
    <div style="background:#fff;border:1px solid var(--border-light);padding:16px 20px;margin-bottom:-1px">
      <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">인적사항</div>
      <div class="filter-bar__row">
        ${selectHtml('rf-gender','성별',['남','여'])}
        ${selectHtml('rf-marital','결혼경력',MARITAL_OPTIONS)}
        <div style="display:flex;gap:4px;align-items:center">
          <span style="font-size:11px;color:var(--text-muted);white-space:nowrap">나이</span>
          <input type="number" class="form-input form-input--sm" id="rf-age-min" placeholder="최소" style="width:60px">
          <span style="color:var(--text-muted)">~</span>
          <input type="number" class="form-input form-input--sm" id="rf-age-max" placeholder="최대" style="width:60px">
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          <span style="font-size:11px;color:var(--text-muted);white-space:nowrap">키</span>
          <input type="number" class="form-input form-input--sm" id="rf-height-min" placeholder="최소" style="width:60px">
          <span style="color:var(--text-muted)">~</span>
          <input type="number" class="form-input form-input--sm" id="rf-height-max" placeholder="최대" style="width:60px">
        </div>
        ${selectHtml('rf-child','자녀양육',CHILD_OPTIONS)}
      </div>
    </div>

    <!-- 스펙 -->
    <div style="background:#fff;border:1px solid var(--border-light);padding:16px 20px;margin-bottom:-1px">
      <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">스펙</div>
      <div class="filter-bar__row">
        ${selectHtml('rf-edu','학력',EDUCATION_OPTIONS)}
        ${selectHtml('rf-religion','종교',RELIGION_OPTIONS)}
        ${jobTreeSelectHtml()}
        ${selectHtml('rf-overseas','해외',OVERSEAS_OPTIONS)}
      </div>
    </div>

    <!-- 프로그램 -->
    <div style="background:#fff;border:1px solid var(--border-light);padding:16px 20px;margin-bottom:-1px">
      <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">프로그램</div>
      <div class="filter-bar__row">
        ${selectHtml('rf-program','프로그램명',PROGRAMS_FLAT)}
        ${selectHtml('rf-rejoin','재가입횟수',REJOIN_OPTIONS.map(n => n+'가입'))}
        ${selectHtml('rf-difficult','난매칭여부',['해당','미해당'])}
      </div>
    </div>

    <!-- 지역/재산 -->
    <div style="background:#fff;border:1px solid var(--border-light);padding:16px 20px;margin-bottom:-1px">
      <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">지역 / 재산</div>
      <div class="filter-bar__row">
        ${selectHtml('rf-hometown','본적지',REGIONS)}
        ${selectHtml('rf-region','거주지역',[...REGIONS,'거주지역 상관없음'])}
        ${selectHtml('rf-p-wealth','본인재산',WEALTH_OPTIONS)}
        ${selectHtml('rf-f-wealth','가족재산',WEALTH_OPTIONS)}
      </div>
    </div>

    <!-- 상세 필터 하단: 접기 + 초기화 -->
    <div style="background:#fff;border:1px solid var(--border-light);border-top:1px dashed var(--border-light);padding:6px 20px;text-align:center;border-radius:0 0 var(--radius-lg) var(--radius-lg);display:flex;justify-content:center;align-items:center;gap:16px">
      <button id="btn-toggle-close" style="background:none;border:none;cursor:pointer;font-size:12px;font-weight:600;color:var(--accent);font-family:inherit">▲ 상세검색 접기</button>
      <button class="btn btn--secondary btn--sm" id="btn-reset" style="font-size:11px">초기화</button>
    </div>
  </div>

  <!-- 건수 + 테이블 -->
  <div style="font-size:12px;font-weight:600;margin:16px 0 8px;color:var(--text-secondary)" id="reg-count"></div>

  <div style="background:#fff;border:1px solid var(--border-light);border-radius:var(--radius-lg);overflow-x:auto">
    <table class="data-table" style="font-size:12px;white-space:nowrap">
      <thead>
        <tr>
          <th style="width:28px"><input type="checkbox" id="reg-check-all"></th>
          <th style="width:45px">No.</th>
          <th>사진</th>
          <th>이름/ID</th>
          <th>성별</th>
          <th>나이</th>
          <th>브랜드</th>
          <th>상태</th>
          <th>회원종류</th>
          <th>가입차수</th>
          <th>지역</th>
          <th>결혼</th>
          <th>지사</th>
          <th>매칭매니저</th>
          <th>상담자</th>
          <th id="th-join" style="cursor:pointer">가입일 ▼</th>
          <th>계약</th>
          <th>미팅(횟수)</th>
          <th>최종미팅</th>
          <th>만료</th>
          <th>서류재인증</th>
        </tr>
      </thead>
      <tbody id="reg-tbody"></tbody>
    </table>
  </div>
  <div id="reg-pagination" class="pagination"></div>
`;

// ── 상세필터 토글 ──
const advEl = document.getElementById('adv-filters');
const toggleClosed = document.getElementById('adv-toggle-closed');

function openAdvFilters() {
  advEl.style.display = 'block';
  toggleClosed.style.display = 'none';
}
function closeAdvFilters() {
  advEl.style.display = 'none';
  toggleClosed.style.display = 'block';
}

document.getElementById('btn-toggle-open').addEventListener('click', openAdvFilters);
document.getElementById('btn-toggle-close').addEventListener('click', closeAdvFilters);

// ── 필터 초기화 ──
document.getElementById('btn-reset').addEventListener('click', () => {
  document.querySelectorAll('#adv-filters select').forEach(s => s.value = '');
  document.querySelectorAll('#adv-filters input').forEach(i => i.value = '');
  applyFilters(true);
});

// ── 페이징 + 정렬 ──
const PAGE_SIZE = 20;
let currentPage = 1;
let sortDesc = true; // 가입일 최신순

// ── 필터 + 렌더링 ──
function applyFilters(resetPage) {
  if (resetPage) currentPage = 1;
  let data = [...MockRegulars];
  console.log('[DEBUG] 활동(미팅중) 회원:', data.filter(d => d.status === '활동').map(d => d.name + '/' + d.status));

  // 기본 필터
  const brand = document.getElementById('rf-brand').value;
  const branch = document.getElementById('rf-branch').value;
  const consultant = document.getElementById('rf-consultant').value;
  const matchMgr = document.getElementById('rf-match-mgr').value;
  const status = document.getElementById('rf-status').value;
  const keyword = document.getElementById('rf-keyword').value.trim().toLowerCase();

  if (brand) data = data.filter(d => d.brand === brand);
  if (branch) data = data.filter(d => d.branch === branch);
  if (consultant) data = data.filter(d => d.consultantManager === consultant);
  if (matchMgr) data = data.filter(d => d.matchingManager === matchMgr);
  if (status) data = data.filter(d => d.status === status);
  if (keyword) data = data.filter(d =>
    d.name.includes(keyword) || d.phone.includes(keyword) || d.memberId.toLowerCase().includes(keyword)
  );

  // 상세 필터 (열려있을 때만)
  const gender = document.getElementById('rf-gender')?.value;
  const marital = document.getElementById('rf-marital')?.value;
  const ageMin = parseInt(document.getElementById('rf-age-min')?.value);
  const ageMax = parseInt(document.getElementById('rf-age-max')?.value);
  const heightMin = parseInt(document.getElementById('rf-height-min')?.value);
  const heightMax = parseInt(document.getElementById('rf-height-max')?.value);
  const child = document.getElementById('rf-child')?.value;
  const edu = document.getElementById('rf-edu')?.value;
  const religion = document.getElementById('rf-religion')?.value;
  const jobChecks = [...document.querySelectorAll('.rf-job-chk:checked')].map(c => c.value);
  const overseas = document.getElementById('rf-overseas')?.value;
  const program = document.getElementById('rf-program')?.value;
  const rejoin = document.getElementById('rf-rejoin')?.value;
  const difficult = document.getElementById('rf-difficult')?.value;
  const hometown = document.getElementById('rf-hometown')?.value;
  const region = document.getElementById('rf-region')?.value;
  const pWealth = document.getElementById('rf-p-wealth')?.value;
  const fWealth = document.getElementById('rf-f-wealth')?.value;

  if (gender) data = data.filter(d => d.gender === gender);
  if (marital && marital !== '상관없음') data = data.filter(d => d.maritalHistory === marital);
  if (!isNaN(ageMin)) data = data.filter(d => d.age >= ageMin);
  if (!isNaN(ageMax)) data = data.filter(d => d.age <= ageMax);
  if (!isNaN(heightMin)) data = data.filter(d => d.height >= heightMin);
  if (!isNaN(heightMax)) data = data.filter(d => d.height <= heightMax);
  if (child) data = data.filter(d => d.childCare === child);
  if (edu) data = data.filter(d => d.education === edu);
  if (religion) data = data.filter(d => d.religion === religion);
  if (jobChecks.length > 0) {
    if (jobChecks.includes('직업상관없음')) data = data.filter(d => d.jobFlexible || jobChecks.includes(d.job));
    else data = data.filter(d => jobChecks.includes(d.job));
  }
  if (overseas && overseas !== '없음') data = data.filter(d => d.overseas === overseas);
  if (overseas === '없음') data = data.filter(d => d.overseas === '없음');
  if (program) data = data.filter(d => d.program === program);
  if (rejoin) { const n = parseInt(rejoin); data = data.filter(d => d.rejoinCount === n); }
  if (difficult === '해당') data = data.filter(d => d.difficultMatch);
  if (difficult === '미해당') data = data.filter(d => !d.difficultMatch);
  if (hometown) data = data.filter(d => d.hometown === hometown);
  if (region === '거주지역 상관없음') data = data.filter(d => d.residenceFlexible);
  else if (region) data = data.filter(d => d.region === region);
  if (pWealth) data = data.filter(d => d.personalWealth === pWealth);
  if (fWealth) data = data.filter(d => d.familyWealth === fWealth);

  // 가입일 정렬
  data.sort((a, b) => {
    const diff = new Date(a.joinDate) - new Date(b.joinDate);
    return sortDesc ? -diff : diff;
  });

  // 건수
  const countEl = document.getElementById('reg-count');
  if (countEl) countEl.textContent = `검색결과 ${data.length}건`;

  // 테이블 렌더링
  const tbody = document.getElementById('reg-tbody');
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="21" style="text-align:center;padding:30px;color:var(--text-muted)">조건에 맞는 회원이 없습니다.</td></tr>';
    document.getElementById('reg-pagination').innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = data.slice(start, start + PAGE_SIZE);

  // 사진 데이터를 JS Map에 저장 (HTML 속성 인코딩 문제 방지)
  const photoMap = new Map();
  paged.forEach(m => {
    const photos = Array.isArray(m.photo) ? m.photo : (m.photo ? [m.photo] : []);
    photoMap.set(String(m.id), { photos, name: m.name, memberId: m.memberId });
  });

  const detailUrl = (id) => `../regular/detail.html?id=${id}`;
  const photoHtml = (m) => {
    const photos = Array.isArray(m.photo) ? m.photo : (m.photo ? [m.photo] : []);
    const first = photos[0];
    if (first) {
      return `<div style="width:28px;height:28px;cursor:pointer" class="photo-thumb" data-mid="${m.id}">
        <img src="${first}" style="width:28px;height:28px;border-radius:50%;object-fit:cover">
      </div>`;
    }
    return `<div style="width:28px;height:28px;border-radius:50%;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text-muted);cursor:pointer" class="photo-thumb" data-mid="${m.id}">${m.gender === '남' ? '👨' : '👩'}</div>`;
  };

  const isMeeting = (m) => m.status === '활동' && m.marriageConfirm !== '소송중';

  tbody.innerHTML = paged.map((m, i) => `<tr data-id="${m.id}" class="${isMeeting(m) ? 'meeting-active' : ''}" style="${m.marriageConfirm === '소송중' ? 'background:#fef2f2' : ''}">
    <td style="text-align:center" onclick="event.stopPropagation()"><input type="checkbox" class="reg-check" value="${m.id}"></td>
    <td style="text-align:center">${start + i + 1}</td>
    <td style="text-align:center">${photoHtml(m)}</td>
    <td><a href="${detailUrl(m.id)}" target="_blank" style="text-decoration:none" class="member-link" data-confirm="${m.marriageConfirm || ''}" data-name="${m.name}" onclick="event.stopPropagation()"><div style="font-weight:600;color:${m.marriageConfirm === '소송중' ? '#dc2626' : 'var(--accent)'};line-height:1.3">${m.marriageConfirm === '소송중' ? '🔒 ' : ''}${m.name}${isMeeting(m) ? ' <span style="color:#ef4444;font-size:10px;font-weight:700">● 미팅중</span>' : ''}</div><div style="font-size:11px;color:var(--text-muted)">${m.memberId}</div></a></td>
    <td style="text-align:center">${m.gender}</td>
    <td style="text-align:center">${m.age}세</td>
    <td><span style="font-weight:600;color:${m.brand==='퍼플스'?'#7c3aed':m.brand==='디노블'?'#b8860b':'#db2777'}">${m.brand}</span></td>
    <td>${Formatters.statusBadge(m.status, 'regular')}</td>
    <td><span class="badge badge--blue">${m.program}</span></td>
    <td style="text-align:center"><span class="badge badge--${(m.rejoinCount || 1) >= 2 ? 'orange' : 'gray'}" style="font-size:11px">${m.rejoinCount || 1}가입</span></td>
    <td>${m.region || '-'}</td>
    <td>${m.maritalHistory || '-'}</td>
    <td>${m.branch || '-'}</td>
    <td>${m.matchingManager || '-'}</td>
    <td>${m.consultantManager || '-'}</td>
    <td>${Formatters.date(m.joinDate)}</td>
    <td style="text-align:center;font-weight:600">${m.contractType === '기간제' ? `${m.contractCount || 12}개월` : `${m.contractCount || '-'}회`}</td>
    <td style="text-align:center;font-weight:600;color:${(m.meetingCount || 0) > 0 ? 'var(--accent)' : 'var(--text-muted)'}">${m.meetingCount || 0}회</td>
    <td>${m.lastMeetingDate ? Formatters.date(m.lastMeetingDate) : '-'}</td>
    <td style="text-align:center">${m.expiryStatus === '없음' || !m.expiryStatus ? '-' : `<span style="color:var(--danger);font-weight:600">${m.expiryStatus}</span>`}</td>
    <td style="text-align:center">${m.docReauth ? '<span style="color:var(--warning);font-weight:600">필요</span>' : '-'}</td>
  </tr>`).join('');

  // 소송중 회원 클릭 시 경고 팝업
  tbody.querySelectorAll('.member-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.dataset.confirm === '소송중') {
        e.preventDefault();
        e.stopPropagation();
        showLegalWarning(link.dataset.name);
      }
    });
  });

  // 사진 클릭 → 모달 오버레이
  tbody.querySelectorAll('.photo-thumb').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const info = photoMap.get(el.dataset.mid);
      if (info) showPhotoModal(info.photos, info.name, info.memberId);
    });
  });

  // 페이지네이션
  const pagEl = document.getElementById('reg-pagination');
  if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
  let pagHtml = `<button class="pagination__btn" ${currentPage===1?'disabled':''} data-page="${currentPage-1}">◀ 이전</button>`;
  for (let p = 1; p <= totalPages; p++) {
    pagHtml += `<button class="pagination__btn${p===currentPage?' active':''}" data-page="${p}">${p}</button>`;
  }
  pagHtml += `<button class="pagination__btn" ${currentPage===totalPages?'disabled':''} data-page="${currentPage+1}">다음 ▶</button>`;
  pagEl.innerHTML = pagHtml;
  pagEl.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); applyFilters(); });
  });
}

// ── 소송중 경고 팝업 ──
function showLegalWarning(name) {
  const existing = document.getElementById('legal-warning-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'legal-warning-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: '9999',
    opacity: '0', transition: 'opacity .2s ease',
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    background: '#fff', borderRadius: '16px', padding: '40px',
    textAlign: 'center', maxWidth: '440px', width: '90%',
    border: '2px solid #dc2626',
    boxShadow: '0 20px 60px rgba(220,38,38,.25)',
    transform: 'scale(.9)', transition: 'transform .2s ease',
  });

  card.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px">⛔</div>
    <div style="font-size:18px;font-weight:800;color:#dc2626;margin-bottom:16px">법무팀 전담 응대 회원</div>
    <div style="font-size:14px;color:#1f2937;line-height:1.8;margin-bottom:8px">
      <strong>${name}</strong> 회원은 현재 <strong style="color:#dc2626">소송중</strong>으로<br>
      <strong>법무팀 전담 응대 회원</strong>입니다.
    </div>
    <div style="background:#fef2f2;border-radius:8px;padding:14px;margin:16px 0;font-size:13px;color:#991b1b;font-weight:600;line-height:1.6">
      연락 및 결제 진행을 즉시 중단하세요.
    </div>
    <button id="legal-warn-close" style="margin-top:8px;padding:10px 32px;border:none;border-radius:8px;background:#dc2626;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">확인</button>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    card.style.transform = 'scale(1)';
  });

  function close() {
    overlay.style.opacity = '0';
    card.style.transform = 'scale(.9)';
    setTimeout(() => overlay.remove(), 200);
  }

  document.getElementById('legal-warn-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

applyFilters(true);

// ── 이벤트 바인딩 ──
document.getElementById('btn-search').addEventListener('click', () => applyFilters(true));
document.getElementById('rf-keyword').addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(true); });
document.getElementById('reg-check-all').addEventListener('change', function() {
  document.querySelectorAll('.reg-check').forEach(c => { c.checked = this.checked; });
});

// 가입일 정렬 토글
document.getElementById('th-join').addEventListener('click', () => {
  sortDesc = !sortDesc;
  document.getElementById('th-join').textContent = `가입일 ${sortDesc ? '▼' : '▲'}`;
  applyFilters(true);
});

// ── 직업 멀티셀렉트 드롭다운 ──
const jobBtn = document.getElementById('rf-job-btn');
const jobDrop = document.getElementById('rf-job-dropdown');

jobBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  jobDrop.style.display = jobDrop.style.display === 'none' ? 'block' : 'none';
});

// 체크 변경 시 버튼 텍스트 업데이트
jobDrop.addEventListener('change', () => {
  const checked = [...document.querySelectorAll('.rf-job-chk:checked')].map(c => c.value);
  if (checked.length === 0) jobBtn.textContent = '직업 전체';
  else if (checked.length <= 2) jobBtn.textContent = checked.join(', ');
  else jobBtn.textContent = `${checked[0]} 외 ${checked.length - 1}건`;
});

// 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
  if (!document.getElementById('rf-job-wrap')?.contains(e.target)) {
    jobDrop.style.display = 'none';
  }
});

// ── 담당자 변경 모달 ──
document.getElementById('btn-reg-manager').addEventListener('click', () => {
  const checks = document.querySelectorAll('.reg-check:checked');
  if (checks.length === 0) { Toast.show('변경할 회원을 선택하세요.', 'warning'); return; }

  Modal.show({
    title: `담당자 일부변경 (${checks.length}명)`,
    content: `
      <p style="margin-bottom:16px;color:var(--text-secondary);font-size:var(--font-size-sm)">선택된 회원의 담당자를 변경합니다.</p>
      <div class="form-group"><label class="form-label">매칭 매니저</label><select class="form-select" id="modal-match-mgr">${MATCH_MANAGERS.map(m=>`<option>${m}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">변경사유</label><select class="form-select"><option>담당자 변경</option><option>지사 이동</option><option>매니저 퇴사</option><option>기타</option></select></div>
    `,
    footer: `<button class="btn btn--secondary" onclick="document.getElementById('modal-root').innerHTML=''">취소</button><button class="btn btn--primary" onclick="document.getElementById('modal-root').innerHTML='';alert('변경 완료')">변경</button>`,
  });
});

// ── 사진 모달 오버레이 (슬라이드) ──
function showPhotoModal(photos, name, memberId) {
  const existing = document.getElementById('photo-modal-overlay');
  if (existing) existing.remove();

  let currentIdx = 0;

  const overlay = document.createElement('div');
  overlay.id = 'photo-modal-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: '9999', cursor: 'pointer',
    opacity: '0', transition: 'opacity .2s ease',
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    background: '#fff', borderRadius: '16px', padding: '24px',
    textAlign: 'center', maxWidth: '420px', width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,.3)', cursor: 'default',
    transform: 'scale(.9)', transition: 'transform .2s ease',
  });

  // 닫기 (먼저 선언)
  function close() {
    overlay.style.opacity = '0';
    card.style.transform = 'scale(.9)';
    setTimeout(() => overlay.remove(), 200);
    document.removeEventListener('keydown', onKey);
  }

  // 키보드
  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft' && photos && photos.length > 1) { currentIdx = (currentIdx - 1 + photos.length) % photos.length; renderPhoto(); }
    if (e.key === 'ArrowRight' && photos && photos.length > 1) { currentIdx = (currentIdx + 1) % photos.length; renderPhoto(); }
  }

  function renderPhoto() {
    const hasPhotos = photos && photos.length > 0;
    const multi = hasPhotos && photos.length > 1;

    const photoArea = hasPhotos
      ? `<img src="${photos[currentIdx]}" style="width:240px;height:240px;border-radius:12px;object-fit:cover;border:2px solid #eee">`
      : `<div style="width:240px;height:240px;border-radius:12px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;border:2px dashed #d1d5db">
           <span style="font-size:14px;color:#9ca3af">📷 등록된 사진이 없습니다</span>
         </div>`;

    const prevBtn = multi
      ? `<button class="pm-prev" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,.5);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">❮</button>`
      : '';
    const nextBtn = multi
      ? `<button class="pm-next" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,.5);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">❯</button>`
      : '';
    const indicator = hasPhotos
      ? `<div style="font-size:11px;color:#9ca3af;margin-top:8px">${currentIdx + 1} / ${photos.length} (최대 5장)</div>`
      : '';

    card.innerHTML = `
      <div style="position:relative;display:inline-block;margin-bottom:12px">
        ${photoArea}
        ${prevBtn}
        ${nextBtn}
      </div>
      ${indicator}
      <div style="font-size:16px;font-weight:700;margin-top:4px">${name}</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:4px">${memberId}</div>
      <button class="pm-close" style="margin-top:16px;padding:6px 24px;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer;font-size:12px;font-family:inherit;color:#6b7280">닫기</button>
    `;

    // 버튼 이벤트
    card.querySelector('.pm-close').addEventListener('click', close);
    const prevEl = card.querySelector('.pm-prev');
    const nextEl = card.querySelector('.pm-next');
    if (prevEl) prevEl.addEventListener('click', (e) => { e.stopPropagation(); currentIdx = (currentIdx - 1 + photos.length) % photos.length; renderPhoto(); });
    if (nextEl) nextEl.addEventListener('click', (e) => { e.stopPropagation(); currentIdx = (currentIdx + 1) % photos.length; renderPhoto(); });
  }

  overlay.appendChild(card);
  document.body.appendChild(overlay);
  renderPhoto();

  // 애니메이션
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    card.style.transform = 'scale(1)';
  });

  overlay.addEventListener('click', close);
  card.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('keydown', onKey);
}
