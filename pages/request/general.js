/* ========================================
   일반 업무요청 게시판
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';

initLayout({ pageId: 'request-general', breadcrumbs: ['업무요청 게시판', '일반 업무요청'] });
const content = document.getElementById('content');

const CATEGORIES = ['전체','시스템 오류','데이터 수정','권한 요청','기타'];
const PRIORITY = ['일반','긴급','최우선'];
const STATUSES = ['접수','처리중','완료','반려'];

function generateData() {
  const stored = localStorage.getItem('purples_request_general');
  if (stored) { try { return JSON.parse(stored); } catch(e){} }
  const titles = [
    '회원 상태 일괄 변경 요청','시스템 접근 권한 추가 요청','매출 데이터 오류 수정',
    '보고서 양식 변경 요청','신규 메뉴 추가 건의','DB 백업 요청',
    '엑셀 다운로드 기능 개선','알림 설정 변경 요청','대시보드 데이터 오류',
    '회원 정보 수정 요청','지사별 통계 조회 오류','매칭 로직 개선 건의',
  ];
  const writers = ['이지연','김민희','박수정','최영미','한소영','강태우'];
  const data = titles.map((t, i) => ({
    id: i + 1,
    title: t,
    category: CATEGORIES[1 + Math.floor(Math.random() * 4)],
    priority: PRIORITY[Math.floor(Math.random() * 3)],
    status: STATUSES[Math.floor(Math.random() * 4)],
    writer: writers[Math.floor(Math.random() * writers.length)],
    createdAt: new Date(2026, 4, Math.floor(Math.random() * 13) + 1).toISOString().slice(0, 10),
    replies: Math.floor(Math.random() * 5),
  }));
  data.sort((a, b) => b.id - a.id);
  localStorage.setItem('purples_request_general', JSON.stringify(data));
  return data;
}

function statusBadge(s) {
  const map = { '접수':'blue', '처리중':'amber', '완료':'green', '반려':'red' };
  return `<span class="badge badge--${map[s] || 'gray'}">${s}</span>`;
}
function priorityBadge(p) {
  if (p === '긴급') return '<span class="badge badge--red">긴급</span>';
  if (p === '최우선') return '<span class="badge badge--red" style="font-weight:800">최우선</span>';
  return '<span class="text-muted">일반</span>';
}

function render() {
  let data = generateData();
  const gv = id => document.getElementById(id)?.value || '';

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">일반 업무요청</h1>
      <p class="page-header__subtitle">시스템 오류, 데이터 수정, 권한 요청 등 일반 업무를 요청합니다</p></div>
      <div class="page-header__actions"><button class="btn btn--primary btn--sm" id="btn-new">+ 업무요청 등록</button></div>
    </div>

    <div class="filter-bar"><div class="filter-bar__row">
      <div class="filter-bar__item"><label>분류</label>
        <select class="form-select form-input--sm" id="f-cat">${CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select>
      </div>
      <div class="filter-bar__item"><label>상태</label>
        <select class="form-select form-input--sm" id="f-status"><option value="">전체</option>${STATUSES.map(s => `<option>${s}</option>`).join('')}</select>
      </div>
      <div class="filter-bar__item"><label>검색</label>
        <input class="form-input form-input--sm" id="f-keyword" placeholder="제목, 작성자 검색...">
      </div>
      <button class="btn btn--primary btn--sm" id="btn-search">검색</button>
    </div></div>

    <div class="card">
      <div class="card__header"><h3 class="card__title" style="font-size:14px">요청 목록</h3>
      <span style="font-size:12px;color:var(--text-muted)" id="req-count">${data.length}건</span></div>
      <div class="card__body" style="padding:0;overflow-x:auto">
        <table class="std-table"><thead><tr>
          <th style="width:45px">번호</th><th>분류</th><th>제목</th><th>우선순위</th>
          <th>상태</th><th>작성자</th><th>등록일</th><th>답변</th>
        </tr></thead><tbody id="req-tbody"></tbody></table>
      </div>
    </div>
  `;

  function applyFilters() {
    let filtered = [...data];
    const cat = gv('f-cat');
    const status = gv('f-status');
    const kw = gv('f-keyword').toLowerCase();
    if (cat && cat !== '전체') filtered = filtered.filter(d => d.category === cat);
    if (status) filtered = filtered.filter(d => d.status === status);
    if (kw) filtered = filtered.filter(d => d.title.toLowerCase().includes(kw) || d.writer.includes(kw));

    document.getElementById('req-count').textContent = filtered.length + '건';
    document.getElementById('req-tbody').innerHTML = filtered.map(d => `<tr>
      <td class="tc col-no">${d.id}</td>
      <td class="tc"><span class="badge badge--gray">${d.category}</span></td>
      <td class="tl" style="font-weight:600">${d.title}</td>
      <td class="tc">${priorityBadge(d.priority)}</td>
      <td class="tc">${statusBadge(d.status)}</td>
      <td class="tc">${d.writer}</td>
      <td class="tc">${d.createdAt}</td>
      <td class="tc">${d.replies > 0 ? d.replies : '-'}</td>
    </tr>`).join('') || '<tr><td colspan="8" class="tc text-muted" style="padding:30px">등록된 업무요청이 없습니다.</td></tr>';
  }

  applyFilters();
  document.getElementById('btn-search').addEventListener('click', applyFilters);
  document.getElementById('f-keyword').addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
  document.getElementById('btn-new').addEventListener('click', () => {
    Modal.show({
      title: '업무요청 등록',
      content: `
        <div class="form-group"><label class="form-label">분류</label>
          <select class="form-select" id="m-cat">${CATEGORIES.filter(c=>c!=='전체').map(c => `<option>${c}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">우선순위</label>
          <select class="form-select" id="m-priority">${PRIORITY.map(p => `<option>${p}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">제목</label>
          <input class="form-input" id="m-title" placeholder="요청 제목을 입력하세요"></div>
        <div class="form-group"><label class="form-label">내용</label>
          <textarea class="form-input" id="m-content" rows="5" placeholder="요청 내용을 상세히 기술하세요"></textarea></div>
      `,
      footer: `<button class="btn btn--secondary" onclick="document.getElementById('modal-root').innerHTML=''">취소</button>
        <button class="btn btn--primary" id="m-submit">등록</button>`,
    });
    document.getElementById('m-submit')?.addEventListener('click', () => {
      const title = document.getElementById('m-title').value.trim();
      if (!title) { Toast.show('제목을 입력하세요.', 'warning'); return; }
      data.unshift({
        id: data.length + 1, title,
        category: document.getElementById('m-cat').value,
        priority: document.getElementById('m-priority').value,
        status: '접수', writer: '나', createdAt: new Date().toISOString().slice(0, 10), replies: 0
      });
      localStorage.setItem('purples_request_general', JSON.stringify(data));
      document.getElementById('modal-root').innerHTML = '';
      Toast.show('업무요청이 등록되었습니다.', 'success');
      applyFilters();
    });
  });
}

render();
