/* ========================================
   매니저 클레임 관리 (표준 디자인 시스템)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { MockAssociates } from '@mock/associates.js';

initLayout({ pageId: 'manager-claim', breadcrumbs: ['고객관리', '매니저 클레임 관리'] });
const content = document.getElementById('content');

const CLAIM_TYPES = ['서비스불만','매칭불만','일정변경','환불요청','기타'];
const STATUSES = ['등록','처리중','완료'];

function generateData() {
  const stored = localStorage.getItem('purples_manager_claims');
  if (stored) { try { return JSON.parse(stored); } catch(e){} }
  const members = MockAssociates.slice(0, 20);
  const data = [];
  for (let i = 0; i < 20; i++) {
    const m = members[Math.floor(Math.random() * members.length)];
    const type = CLAIM_TYPES[Math.floor(Math.random() * CLAIM_TYPES.length)];
    const status = STATUSES[Math.floor(Math.random() * 3)];
    const daysAgo = Math.floor(Math.random() * 30);
    data.push({ id: i+1, memberName: m.name, branch: m.branch, consultant: m.consultant,
      type, status, content: '클레임 상세 내용입니다.',
      action: status === '완료' ? '처리 완료' : '',
      registeredAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      processedAt: status === '완료' ? new Date(Date.now() - (daysAgo-1) * 86400000).toISOString() : '' });
  }
  data.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
  localStorage.setItem('purples_manager_claims', JSON.stringify(data));
  return data;
}

function statusBadge(s) {
  const map = { '등록':'amber','처리중':'blue','완료':'green' };
  return `<span class="badge badge--${map[s] || 'gray'}">${s}</span>`;
}

function render() {
  const data = generateData();
  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">매니저 클레임 관리</h1>
      <p class="page-header__subtitle">매니저가 내부적으로 등록한 클레임을 관리합니다</p></div>
      <div class="page-header__actions"><button class="btn btn--primary btn--sm" id="btn-new">+ 클레임 등록</button></div>
    </div>

    <div class="filter-bar"><div class="filter-bar__row">
      <div class="filter-bar__item"><label>유형</label>
        <select class="form-select form-input--sm" id="f-type"><option value="">전체</option>${CLAIM_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
      </div>
      <div class="filter-bar__item"><label>상태</label>
        <select class="form-select form-input--sm" id="f-status"><option value="">전체</option>${STATUSES.map(s => `<option>${s}</option>`).join('')}</select>
      </div>
      <div class="filter-bar__search"><label>검색</label>
        <input class="form-input form-input--sm" id="f-keyword" placeholder="회원명, 매니저 검색...">
      </div>
      <button class="btn btn--primary btn--sm" id="btn-search">검색</button>
    </div></div>

    <div class="card"><div class="card__body" style="padding:0;overflow-x:auto">
      <table class="std-table"><thead><tr>
        <th style="width:40px">No</th><th>지사</th><th>매니저</th><th>회원명</th>
        <th>유형</th><th>내용</th><th>등록일</th><th>상태</th><th>처리내용</th><th>처리일</th>
      </tr></thead><tbody id="mc-tbody"></tbody></table>
    </div></div>
  `;
  renderTable(data);
  document.getElementById('btn-search').addEventListener('click', () => renderTable(data));
  document.getElementById('f-keyword').addEventListener('keydown', e => { if (e.key === 'Enter') renderTable(data); });
  document.getElementById('btn-new').addEventListener('click', () => Toast.show('클레임 등록 기능은 추후 구현 예정입니다.', 'info'));
}

function renderTable(allData) {
  let data = [...allData];
  const type = document.getElementById('f-type')?.value;
  const status = document.getElementById('f-status')?.value;
  const kw = (document.getElementById('f-keyword')?.value || '').toLowerCase();
  if (type) data = data.filter(d => d.type === type);
  if (status) data = data.filter(d => d.status === status);
  if (kw) data = data.filter(d => d.memberName.includes(kw) || d.consultant.includes(kw));

  document.getElementById('mc-tbody').innerHTML = data.map((d, i) => `<tr>
    <td class="tc col-no">${data.length - i}</td><td class="tc">${d.branch}</td>
    <td class="tc col-name">${d.consultant}</td><td class="tc">${d.memberName}</td>
    <td class="tc"><span class="badge badge--amber">${d.type}</span></td>
    <td class="tl ellipsis">${d.content}</td>
    <td class="tc">${Formatters.date(d.registeredAt)}</td>
    <td class="tc">${statusBadge(d.status)}</td>
    <td class="tl">${d.action || '-'}</td>
    <td class="tc">${d.processedAt ? Formatters.date(d.processedAt) : '-'}</td>
  </tr>`).join('') || '<tr><td colspan="10" style="text-align:center;padding:30px" class="text-muted">등록된 클레임이 없습니다.</td></tr>';
}
render();
