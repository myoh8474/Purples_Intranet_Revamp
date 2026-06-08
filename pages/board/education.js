/* ========================================
   퍼플스 교육 자료
   - 이미지 참고 디자인: 분류명 / 설명 / 유효 기간 / 보기
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';

initLayout({ pageId: 'board-education', breadcrumbs: ['게시판', '교육자료'] });
const content = document.getElementById('content');

/* ── 교육자료 데이터 ── */
function generateData() {
  const stored = localStorage.getItem('purples_board_education');
  if (stored) { try { return JSON.parse(stored); } catch(e){} }
  const items = [
    { id: 1,  category: '매니저교육자료-고객만족실',  title: '[매니저교육자료]고객만족실_컴플레인,탈퇴 사례 교육(저용량)', expiry: '2025-12-30' },
    { id: 2,  category: '매니저교육자료-매칭센터',    title: '[매니저교육자료]매칭센터_매칭 프로세스(저용량)', expiry: '2025-12-30' },
    { id: 3,  category: '매니저교육자료-법무팀',      title: '[매니저교육자료]법무팀_계약 체결 시 주의점,결혼중개업법 안내(저용량)', expiry: '2025-12-30' },
    { id: 4,  category: '매니저교육자료-영업기획팀',   title: '[매니저교육자료]영업기획팀_DB 관리(저용량)', expiry: '2025-12-30' },
    { id: 5,  category: '매니저교육자료-영업본부',    title: '[매니저교육자료]영업본부_고객 상담 시 거절 처리 화법(저용량)', expiry: '2025-12-30' },
    { id: 6,  category: '매니저교육자료-영업본부',    title: '[매니저교육자료]영업본부_세일즈의 기본 판매 프로세스(저용량)', expiry: '2025-12-30' },
    { id: 7,  category: '매니저교육자료-인사총무팀',   title: '[매니저교육자료]인사총무팀_인사총무팀 사내교육(저용량)', expiry: '2025-12-30' },
    { id: 8,  category: '매니저교육자료-재무본부',    title: '[매니저교육자료]재무본부_계약서 작성과 결제(저용량)', expiry: '2025-12-30' },
    { id: 9,  category: '매니저교육자료-전략기획팀',   title: '[매니저교육자료]전략기획팀_신규 가입 프로세스(저용량)', expiry: '2025-12-30' },
    { id: 10, category: '매니저교육자료-회원인증팀',   title: '[매니저교육자료]회원인증팀_인증 업무 프로세스(저용량)', expiry: '2025-12-30' },
  ];
  localStorage.setItem('purples_board_education', JSON.stringify(items));
  return items;
}

function render() {
  const data = generateData();

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">퍼플스 교육 자료</h1>
      <p class="page-header__subtitle">매니저 교육 및 업무 참고 자료를 관리합니다</p></div>
      <div class="page-header__actions"><button class="btn btn--primary btn--sm" id="btn-new">+ 자료 등록</button></div>
    </div>

    <div class="filter-bar"><div class="filter-bar__row">
      <div class="filter-bar__item"><label>검색</label>
        <input class="form-input form-input--sm" id="f-keyword" placeholder="분류명, 설명 검색...">
      </div>
      <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
    </div></div>

    <div class="card">
      <div class="card__header"><h3 class="card__title" style="font-size:14px">자료 목록</h3>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;color:var(--text-muted)" id="edu-count">0건</span>
      </div></div>
      <div class="card__body" style="padding:0;overflow-x:auto">
        <table class="std-table" style="table-layout:fixed">
          <thead>
            <tr>
              <th style="width:180px">분류명</th>
              <th>설명</th>
              <th style="width:100px">유효 기간</th>
              <th style="width:70px">보기</th>
            </tr>
          </thead>
          <tbody id="edu-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  function applyFilters() {
    let filtered = [...data];
    const kw = (document.getElementById('f-keyword')?.value || '').toLowerCase();
    if (kw) filtered = filtered.filter(d => d.category.toLowerCase().includes(kw) || d.title.toLowerCase().includes(kw));

    document.getElementById('edu-count').textContent = filtered.length + '건';
    document.getElementById('edu-tbody').innerHTML = filtered.map(d => `
      <tr>
        <td class="tl" style="font-weight:500;white-space:nowrap">${d.category}</td>
        <td class="tl ellipsis" style="max-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.title}</td>
        <td class="tc" style="white-space:nowrap">${d.expiry}</td>
        <td class="tc"><button class="btn btn--primary btn--sm btn-edu-view" data-id="${d.id}" style="font-size:11px;padding:3px 12px">보기</button></td>
      </tr>
    `).join('') || '<tr><td colspan="4" class="tc text-muted" style="padding:30px">등록된 자료가 없습니다.</td></tr>';

    document.querySelectorAll('.btn-edu-view').forEach(btn => {
      btn.addEventListener('click', () => {
        location.href = `./detail.html?type=education&id=${btn.dataset.id}`;
      });
    });
  }

  applyFilters();
  document.getElementById('btn-search').addEventListener('click', applyFilters);
  document.getElementById('f-keyword')?.addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
  document.getElementById('btn-new').addEventListener('click', () => {
    location.href = './write.html?type=education';
  });
}

render();
