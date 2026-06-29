/* ========================================
   정회원 리스트 페이지
   - 기본 필터 (항상 노출) + 상세 필터 (접기/펼치기)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars, BRANDS, MATCH_MANAGERS, REGIONS, BRANCHES, CONSULTANTS } from '@mock/regulars.js';
import { REGULAR_STATUSES, PROGRAMS_FLAT, JOB_TREE, JOBS, JOB_CATEGORIES, EDUCATIONS } from '@config/constants.js';

initLayout({ pageId: 'regular-list', breadcrumbs: ['정회원 관리', '정회원 목록'] });

const content = document.getElementById('content');

const MARITAL_OPTIONS = ['상관없음','미혼','재혼','사별','사실혼','삼혼이상'];
const CHILD_OPTIONS = ['무','본인','전배우자','기타'];

const RELIGION_OPTIONS = ['무교','기독교','천주교','불교','기타'];
const WEALTH_OPTIONS = ['10억미만','10~20억','20~30억','30~50억','50~100억','100~200억','200~300억','300~500억','500억이상'];
const OVERSEAS_OPTIONS = ['없음','시민권자','영주권자'];
const REJOIN_OPTIONS = [1,2,3,4,5,6];


function selectHtml(id, label, options, w) {
  return `<div class="select-wrap"><select class="form-select form-input--sm" id="${id}" style="width:100%;font-size:12px">
      <option value="">${label} 전체</option>
      ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
    </select></div>`;
}

function multiSelectHtml(id, label, options) {
  return `<div class="multi-select" id="${id}-wrap" style="position:relative">
    <button type="button" class="form-select form-input--sm" id="${id}-btn" data-label="${label}" style="width:100%;font-size:12px;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center"><span class="ms-label">${label} 전체</span><span class="ms-arrow" style="font-size:9px;color:#999;margin-left:4px;flex-shrink:0">▼</span></button>
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
    const catId = 'jcat-' + cat.replace(/[^a-zA-Z가-힣]/g, '');
    inner += `<div class="job-cat-header" data-target="${catId}" style="padding:5px 12px;font-size:11px;font-weight:700;color:var(--accent);margin-top:0;border-top:1px solid var(--border-light);cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background=''">
      <span>${cat}</span><span class="job-cat-arrow" style="font-size:9px;color:#999;transition:transform .2s">▶</span>
    </div>`;
    inner += `<div class="job-cat-items" id="${catId}" style="display:none">`;
    inner += jobs.map(j => `<label style="display:flex;align-items:center;gap:6px;padding:3px 12px 3px 20px;font-size:12px;cursor:pointer;white-space:nowrap" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background=''">
      <input type="checkbox" class="rf-job-chk" value="${j}" style="accent-color:var(--accent)">${j}
    </label>`).join('');
    inner += '</div>';
  }
  return `<div class="multi-select" id="rf-job-wrap" style="position:relative">
    <button type="button" class="form-select form-input--sm" id="rf-job-btn" style="width:100%;font-size:12px;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center">직업 전체 <span style="font-size:9px;color:#666">▼</span></button>
    <div class="multi-select__dropdown" id="rf-job-dropdown" style="display:none;position:absolute;top:100%;left:0;z-index:100;background:#fff;border:1px solid var(--border-medium);border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.12);max-height:360px;overflow-y:auto;width:100%;padding:6px 0;margin-top:2px">
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
  </div>

  <!-- 통합 필터 테이블 -->
  <table class="std-table" id="filter-table" style="margin-bottom:0;table-layout:fixed">
    <colgroup>
      <col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col>
    </colgroup>
    <tbody>
      <tr>
        <th>통합검색</th>
        <td colspan="3"><input type="text" class="form-input form-input--sm" id="rf-keyword" placeholder="이름, 전화번호, ID 검색..." style="width:100%"></td>
        <th>상태</th>
        <td colspan="3">${multiSelectHtml('rf-status','상태',REGULAR_STATUSES)}</td>
      </tr>
      <tr>
        <th>브랜드</th>
        <td>${multiSelectHtml('rf-brand','브랜드',BRANDS)}</td>
        <th>지사</th>
        <td>${multiSelectHtml('rf-branch','지사',BRANCHES)}</td>
        <th>상담자</th>
        <td>${multiSelectHtml('rf-consultant','상담자',CONSULTANTS)}</td>
        <th>커플매니저</th>
        <td>${multiSelectHtml('rf-match-mgr','커플매니저',MATCH_MANAGERS)}</td>
      </tr>
    </tbody>
    <!-- 상세 필터 행 (기본 숨김) -->
    <tbody id="adv-rows" style="display:none">
      <tr>
        <th>성별</th>
        <td>${multiSelectHtml('rf-gender','성별',['남','여'])}</td>
        <th>결혼경력</th>
        <td>${multiSelectHtml('rf-marital','결혼경력',MARITAL_OPTIONS)}</td>
        <th>나이</th>
        <td><div style="display:flex;gap:4px;align-items:center"><input type="number" class="form-input form-input--sm" id="rf-age-min" placeholder="최소" style="width:55px"><span>~</span><input type="number" class="form-input form-input--sm" id="rf-age-max" placeholder="최대" style="width:55px"></div></td>
        <th>키</th>
        <td><div style="display:flex;gap:4px;align-items:center"><input type="number" class="form-input form-input--sm" id="rf-height-min" placeholder="최소" style="width:55px"><span>~</span><input type="number" class="form-input form-input--sm" id="rf-height-max" placeholder="최대" style="width:55px"></div></td>
      </tr>
      <tr>
        <th>학력</th>
        <td>${multiSelectHtml('rf-edu','학력',EDUCATIONS)}</td>
        <th>종교</th>
        <td>${multiSelectHtml('rf-religion','종교',RELIGION_OPTIONS)}</td>
        <th>직업</th>
        <td>${jobTreeSelectHtml()}</td>
        <th>해외</th>
        <td>${multiSelectHtml('rf-overseas','해외',OVERSEAS_OPTIONS)}</td>
      </tr>
      <tr>
        <th>자녀양육</th>
        <td>${multiSelectHtml('rf-child','자녀양육',CHILD_OPTIONS)}</td>
        <th>프로그램</th>
        <td>${multiSelectHtml('rf-program','프로그램명',PROGRAMS_FLAT)}</td>
        <th>재가입</th>
        <td>${multiSelectHtml('rf-rejoin','재가입횟수',REJOIN_OPTIONS.map(n => n+'가입'))}</td>
        <th>난매칭</th>
        <td>${multiSelectHtml('rf-difficult','난매칭여부',['해당','미해당'])}</td>
      </tr>
      <tr>
        <th>본적지</th>
        <td>${multiSelectHtml('rf-hometown','본적지',REGIONS)}</td>
        <th>거주지역</th>
        <td>${multiSelectHtml('rf-region','거주지역',[...REGIONS,'거주지역 상관없음'])}</td>
        <th>본인재산</th>
        <td>${multiSelectHtml('rf-p-wealth','본인재산',WEALTH_OPTIONS)}</td>
        <th>가족재산</th>
        <td>${multiSelectHtml('rf-f-wealth','가족재산',WEALTH_OPTIONS)}</td>
      </tr>
    </tbody>
  </table>

  <!-- 토글/검색/초기화 바 -->
  <div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px">
    <button id="btn-toggle-open" style="background:none;border:none;cursor:pointer;font-size:12px;font-weight:600;color:var(--accent);font-family:inherit">▼ 상세검색 펼치기</button>
    <button id="btn-toggle-close" style="display:none;background:none;border:none;cursor:pointer;font-size:12px;font-weight:600;color:var(--accent);font-family:inherit">▲ 상세검색 접기</button>
    <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
    <button class="btn btn--reset btn--sm" id="btn-reset" style="display:none">초기화</button>
  </div>

  <div style="display:flex;justify-content:space-between;align-items:center;margin:16px 0 8px;flex-wrap:wrap;gap:8px">
    <div style="display:flex;align-items:center;gap:12px">
      <span style="font-size:12px;font-weight:600;color:var(--text-secondary)" id="reg-count"></span>
      <button class="btn btn--outline btn--sm" id="btn-reg-manager" style="font-size:11px;padding:3px 10px">매칭매니져 변경</button>
    </div>
    <div style="display:flex;gap:14px;align-items:center;font-size:11px;color:#555">
      <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:2px;background:#fde2e2;border:1px solid #f87171;display:inline-block"></span>최종미팅 30일 초과</span>
      <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:2px;background:#fef3c7;border:1px solid #f59e0b;display:inline-block"></span>소개장 30일 초과</span>
    </div>
  </div>

  <div style="overflow-x:auto">
    <table class="std-table" style="white-space:nowrap">
      <thead>
        <tr>
          <th style="width:28px"><input type="checkbox" id="reg-check-all"></th>
          <th>번호</th>
          <th>사진</th>
          <th>성별</th>
          <th>이름</th>
          <th>아이디</th>
          <th>지역</th>
          <th>생년월일</th>
          <th>직업</th>
          <th>회원종류</th>
          <th>회원상태</th>
          <th>상담매니져</th>
          <th>매칭매니져</th>
          <th>미팅횟수</th>
          <th>최종미팅일</th>
          <th>최종컨택일</th>
          <th>만료확인</th>
        </tr>
      </thead>
      <tbody id="reg-tbody"></tbody>
    </table>
  </div>
  <div id="reg-pagination" class="pagination"></div>
`;

// ── 상세필터 토글 ──
const advRows = document.getElementById('adv-rows');
const btnOpen = document.getElementById('btn-toggle-open');
const btnClose = document.getElementById('btn-toggle-close');
const btnReset = document.getElementById('btn-reset');

function openAdvFilters() {
  advRows.style.display = '';
  btnOpen.style.display = 'none';
  btnClose.style.display = '';
  btnReset.style.display = '';
}
function closeAdvFilters() {
  advRows.style.display = 'none';
  btnOpen.style.display = '';
  btnClose.style.display = 'none';
  btnReset.style.display = 'none';
}

btnOpen.addEventListener('click', openAdvFilters);
btnClose.addEventListener('click', closeAdvFilters);

// ── 필터 초기화 ──
btnReset.addEventListener('click', () => {
  document.querySelectorAll('.multi-select input[type="checkbox"]').forEach(c => c.checked = false);
  document.querySelectorAll('input[type="number"], #rf-keyword').forEach(i => i.value = '');
  document.querySelectorAll('.multi-select button[id$="-btn"]').forEach(btn => {
    const label = btn.dataset.label || '';
    const labelSpan = btn.querySelector('.ms-label');
    if (labelSpan) labelSpan.textContent = label + ' 전체';
  });
  applyFilters(true);
});

// ── 직업 카테고리 아코디언 ──
document.querySelectorAll('.job-cat-header').forEach(header => {
  header.addEventListener('click', () => {
    const target = document.getElementById(header.dataset.target);
    const arrow = header.querySelector('.job-cat-arrow');
    if (target.style.display === 'none') {
      target.style.display = '';
      arrow.textContent = '▼';
    } else {
      target.style.display = 'none';
      arrow.textContent = '▶';
    }
  });
});

// ── 페이징 + 정렬 ──
const PAGE_SIZE = 20;
let currentPage = 1;
let sortDesc = true; // 가입일 최신순

// ── 다중선택 헬퍼 ──
function chk(id) { return [...document.querySelectorAll(`.${id}-chk:checked`)].map(c => c.value); }

// ── 필터 + 렌더링 ──
function applyFilters(resetPage) {
  if (resetPage) currentPage = 1;
  let data = [...MockRegulars];

  // 기본 필터 (다중선택)
  const brandSel = chk('rf-brand');
  const branchSel = chk('rf-branch');
  const consultantSel = chk('rf-consultant');
  const matchMgrSel = chk('rf-match-mgr');
  const statusSel = chk('rf-status');
  const keyword = document.getElementById('rf-keyword').value.trim().toLowerCase();

  if (brandSel.length) data = data.filter(d => brandSel.includes(d.brand));
  if (branchSel.length) data = data.filter(d => branchSel.includes(d.branch));
  if (consultantSel.length) data = data.filter(d => consultantSel.includes(d.consultantManager));
  if (matchMgrSel.length) data = data.filter(d => matchMgrSel.includes(d.matchingManager));
  if (statusSel.length) data = data.filter(d => statusSel.includes(d.status));
  if (keyword) data = data.filter(d =>
    d.name.includes(keyword) || d.phone.includes(keyword) || d.memberId.toLowerCase().includes(keyword)
  );

  // 상세 필터 (다중선택)
  const genderSel = chk('rf-gender');
  const maritalSel = chk('rf-marital');
  const ageMin = parseInt(document.getElementById('rf-age-min')?.value);
  const ageMax = parseInt(document.getElementById('rf-age-max')?.value);
  const heightMin = parseInt(document.getElementById('rf-height-min')?.value);
  const heightMax = parseInt(document.getElementById('rf-height-max')?.value);
  const childSel = chk('rf-child');
  const eduSel = chk('rf-edu');
  const religionSel = chk('rf-religion');
  const jobSel = chk('rf-job');
  const overseasSel = chk('rf-overseas');
  const programSel = chk('rf-program');
  const rejoinSel = chk('rf-rejoin');
  const difficultSel = chk('rf-difficult');
  const hometownSel = chk('rf-hometown');
  const regionSel = chk('rf-region');
  const pWealthSel = chk('rf-p-wealth');
  const fWealthSel = chk('rf-f-wealth');

  if (genderSel.length) data = data.filter(d => genderSel.includes(d.gender));
  if (maritalSel.length) data = data.filter(d => maritalSel.includes(d.maritalHistory));
  if (!isNaN(ageMin)) data = data.filter(d => d.age >= ageMin);
  if (!isNaN(ageMax)) data = data.filter(d => d.age <= ageMax);
  if (!isNaN(heightMin)) data = data.filter(d => d.height >= heightMin);
  if (!isNaN(heightMax)) data = data.filter(d => d.height <= heightMax);
  if (childSel.length) data = data.filter(d => childSel.includes(d.childCare));
  if (eduSel.length) data = data.filter(d => eduSel.includes(d.education));
  if (religionSel.length) data = data.filter(d => religionSel.includes(d.religion));
  if (jobSel.length) {
    if (jobSel.includes('직업상관없음')) data = data.filter(d => d.jobFlexible || jobSel.includes(d.job));
    else data = data.filter(d => jobSel.includes(d.job));
  }
  if (overseasSel.length) data = data.filter(d => overseasSel.includes(d.overseas));
  if (programSel.length) data = data.filter(d => programSel.includes(d.program));
  if (rejoinSel.length) {
    const nums = rejoinSel.map(r => parseInt(r));
    data = data.filter(d => nums.includes(d.rejoinCount));
  }
  if (difficultSel.length) {
    const wantYes = difficultSel.includes('해당'), wantNo = difficultSel.includes('미해당');
    if (wantYes && !wantNo) data = data.filter(d => d.difficultMatch);
    else if (wantNo && !wantYes) data = data.filter(d => !d.difficultMatch);
  }
  if (hometownSel.length) data = data.filter(d => hometownSel.includes(d.hometown));
  if (regionSel.length) {
    if (regionSel.includes('거주지역 상관없음')) data = data.filter(d => d.residenceFlexible || regionSel.includes(d.region));
    else data = data.filter(d => regionSel.includes(d.region));
  }
  if (pWealthSel.length) data = data.filter(d => pWealthSel.includes(d.personalWealth));
  if (fWealthSel.length) data = data.filter(d => fWealthSel.includes(d.familyWealth));

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
    tbody.innerHTML = '<tr><td colspan="22" style="text-align:center;padding:30px;color:var(--text-muted)">조건에 맞는 회원이 없습니다.</td></tr>';
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
        <img src="${first}" style="width:28px;height:28px;object-fit:cover">
      </div>`;
    }
    return `<div style="width:28px;height:28px;background:#d1d5db;cursor:pointer" class="photo-thumb" data-mid="${m.id}"></div>`;
  };

  const isMeeting = (m) => m.status === '활동' && m.marriageConfirm !== '소송중';
  const now = new Date();
  const DAY_MS = 86400000;

  // 30일 초과 판별
  function isMeetingOver30(m) {
    if (!m.lastMeetingDate || m.status !== '활동') return false;
    return Math.floor((now - new Date(m.lastMeetingDate)) / DAY_MS) > 30;
  }
  function isIntroOver30(m) {
    if (!m.lastIntroDate) return false;
    return Math.floor((now - new Date(m.lastIntroDate)) / DAY_MS) > 30;
  }

  // 행 구분 클래스: 30일 초과만 적용 (미팅 > 소개장)
  function rowClass(m) {
    if (isMeetingOver30(m)) return 'row-meeting-over';
    if (isIntroOver30(m)) return 'row-intro-over';
    return '';
  }

  // 미팅등록 여부 셀
  function meetingRegHtml(m) {
    return m.lastMeetingDate ? 'Y' : 'N';
  }
  // 소개장등록 여부 셀
  function introRegHtml(m) {
    return m.lastIntroDate ? 'Y' : 'N';
  }

  // 회원유의 뱃지 헬퍼
  function flagBadges(m) {
    var badges = '';
    var flagMap = [
      { key: 'flagNoEvent', label: '이벤트불가', bg: '#fee2e2', color: '#dc2626' },
      { key: 'flagSecret', label: '비밀상담', bg: '#fef9c3', color: '#a16207' },
      { key: 'flagNoRejoin', label: '재가입불가', bg: '#fee2e2', color: '#dc2626' },
      { key: 'flagDifficult', label: '난매칭', bg: '#ffedd5', color: '#ea580c' },
    ];
    flagMap.forEach(function(f) {
      if (m[f.key]) badges += ' <span style="display:inline-block;background:' + f.bg + ';color:' + f.color + ';font-size:9px;font-weight:600;padding:1px 4px;border-radius:2px;line-height:13px;vertical-align:middle">' + f.label + '</span>';
    });
    // tags 기반 (플래그가 없을 때)
    if (!badges && m.tags && m.tags.length) {
      var colorMap = {'이벤트불가':['#fee2e2','#dc2626'],'재가입불가':['#fee2e2','#dc2626'],'난매칭':['#ffedd5','#ea580c'],'비밀상담':['#fef9c3','#a16207']};
      m.tags.forEach(function(t) {
        var c = colorMap[t] || ['#f3f4f6','#374151'];
        badges += ' <span style="display:inline-block;background:' + c[0] + ';color:' + c[1] + ';font-size:9px;font-weight:600;padding:1px 4px;border-radius:2px;line-height:13px;vertical-align:middle">' + t + '</span>';
      });
    }
    return badges;
  }

  tbody.innerHTML = paged.map((m, i) => `<tr data-id="${m.id}" class="${rowClass(m)}">
    <td class="tc" onclick="event.stopPropagation()"><input type="checkbox" class="reg-check" value="${m.id}"></td>
    <td class="tc" style="font-size:11px;color:var(--text-muted)">${m.id || '-'}</td>
    <td class="tc">${photoHtml(m)}</td>
    <td class="tc">${m.gender}</td>
    <td><a href="${detailUrl(m.id)}" target="_blank" style="text-decoration:none" class="member-link col-link" data-confirm="${m.marriageConfirm || ''}" data-name="${m.name}" onclick="event.stopPropagation()"><span style="color:${m.marriageConfirm === '소송중' ? '#dc2626' : 'var(--accent)'};font-weight:600">${m.marriageConfirm === '소송중' ? '🔒 ' : ''}${m.name}${isMeeting(m) ? ' <span style="display:inline-block;background:#ef4444;color:#fff;font-size:10px !important;font-weight:600;padding:1px 5px;border-radius:3px;line-height:14px;vertical-align:middle">미팅중</span>' : ''}</span></a>${flagBadges(m)}</td>
    <td class="tc" style="font-size:11px;color:var(--text-muted)">${m.memberId}</td>
    <td class="tc">${m.region || '-'}</td>
    <td class="tc">${m.birthDate ? new Date(m.birthDate).getFullYear() + '.' + String(new Date(m.birthDate).getMonth()+1).padStart(2,'0') + '.' + String(new Date(m.birthDate).getDate()).padStart(2,'0') : '-'}</td>
    <td class="tc">${m.job || '-'}</td>
    <td class="tc">${m.program}</td>
    <td class="tc">${['임시교제','교제','외부교제'].includes(m.status) ? `<a href="${detailUrl(m.id)}" target="_blank" style="color:#6366f1;text-decoration:underline;font-weight:600;cursor:pointer">${m.status}</a>` : m.status}</td>
    <td class="tc">${m.consultantManager || '-'}</td>
    <td class="tc">${m.matchingManager || '-'}</td>
    <td class="tc">${(m.meetingCount || 0) + '/' + (m.contractCount || 12)}</td>
    <td class="tc">${m.lastMeetingDate ? Formatters.date(m.lastMeetingDate) : '-'}</td>
    <td class="tc">${m.lastContactDate ? Formatters.date(m.lastContactDate) : (m.lastIntroDate ? Formatters.date(m.lastIntroDate) : '-')}</td>
    <td class="tc">${m.expiryStatus === '없음' || !m.expiryStatus ? '-' : `<span class="col-bad">${m.expiryStatus}</span>`}</td>
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



// ── 범용 멀티셀렉트 드롭다운 초기화 ──
const ALL_MS_IDS = [
  'rf-status','rf-brand','rf-branch','rf-consultant','rf-match-mgr',
  'rf-gender','rf-marital','rf-edu','rf-religion','rf-overseas',
  'rf-child','rf-program','rf-rejoin','rf-difficult',
  'rf-hometown','rf-region','rf-p-wealth','rf-f-wealth','rf-job'
];

ALL_MS_IDS.forEach(id => {
  const btn = document.getElementById(`${id}-btn`);
  const drop = document.getElementById(`${id}-dropdown`);
  if (!btn || !drop) return;

  // 원본 라벨 저장
  btn.dataset.label = btn.textContent.replace(' 전체', '');

  // 토글
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    // 다른 드롭다운 닫기
    ALL_MS_IDS.forEach(otherId => {
      if (otherId !== id) {
        const otherDrop = document.getElementById(`${otherId}-dropdown`);
        if (otherDrop) otherDrop.style.display = 'none';
      }
    });
    drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
  });

  // 체크 변경 → 버튼 텍스트 업데이트
  drop.addEventListener('change', () => {
    const checked = [...drop.querySelectorAll('input[type="checkbox"]:checked')].map(c => c.value);
    const label = btn.dataset.label;
    const labelSpan = btn.querySelector('.ms-label');
    if (!labelSpan) return;
    if (checked.length === 0) labelSpan.textContent = label + ' 전체';
    else if (checked.length === 1) labelSpan.textContent = checked[0];
    else labelSpan.textContent = `${checked[0]} 외 ${checked.length - 1}건`;
  });
});

// 외부 클릭 시 모든 드롭다운 닫기
document.addEventListener('click', (e) => {
  ALL_MS_IDS.forEach(id => {
    const wrap = document.getElementById(`${id}-wrap`);
    const drop = document.getElementById(`${id}-dropdown`);
    if (wrap && drop && !wrap.contains(e.target)) drop.style.display = 'none';
  });
});

// ── 담당자 변경 모달 ──
document.getElementById('btn-reg-manager').addEventListener('click', () => {
  const checks = document.querySelectorAll('.reg-check:checked');
  if (checks.length === 0) { Toast.show('변경할 회원을 선택하세요.', 'warning'); return; }

  // 선택된 회원 이름 목록
  const selectedNames = Array.from(checks).map(c => {
    const row = c.closest('tr');
    const link = row?.querySelector('.member-link');
    return link ? link.textContent.trim().replace('🔒 ', '').replace('미팅중', '').trim() : '';
  }).filter(Boolean);
  const namePreview = selectedNames.length <= 3 
    ? selectedNames.join(', ') 
    : selectedNames.slice(0,3).join(', ') + ` 외 ${selectedNames.length - 3}명`;

  Modal.show({
    title: `매칭매니져 변경`,
    content: `
      <div style="padding:10px 14px;background:var(--bg-secondary);border:1px solid var(--border-light);margin-bottom:16px;font-size:12px">
        <strong>선택 회원 (${checks.length}명):</strong> <span style="color:var(--text-secondary)">${namePreview}</span>
      </div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label" style="font-size:12px;font-weight:700;margin-bottom:6px;display:block">변경할 매칭매니져 <span style="color:#e53e3e">*</span></label>
        <select class="form-select" id="modal-match-mgr" style="width:100%">
          <option value="">매칭매니져를 선택하세요</option>
          ${MATCH_MANAGERS.map(m=>`<option>${m}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" style="font-size:12px;font-weight:700;margin-bottom:6px;display:block">변경사유 <span style="color:#e53e3e">*</span></label>
        <select class="form-select" id="modal-change-reason" style="width:100%">
          <option value="">변경사유를 선택하세요</option>
          <option>담당매니져 퇴사</option>
          <option>지사로 이관</option>
          <option>팀 변동으로 인한 이관</option>
          <option>지사내 매칭업무 분할</option>
        </select>
      </div>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="document.getElementById('modal-root').innerHTML=''">취소</button>
      <button class="btn btn--primary" id="btn-modal-change" onclick="
        var mgr = document.getElementById('modal-match-mgr').value;
        var reason = document.getElementById('modal-change-reason').value;
        if(!mgr){ alert('변경할 매칭매니져를 선택하세요.'); return; }
        if(!reason){ alert('변경사유를 선택하세요.'); return; }
        alert('매칭매니져가 변경되었습니다.');
        document.getElementById('modal-root').innerHTML='';
      ">저장</button>
    `,
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
