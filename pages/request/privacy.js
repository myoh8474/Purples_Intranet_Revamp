/* ========================================
   개인정보 삭제요청 업무
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';

initLayout({ pageId: 'request-privacy', breadcrumbs: ['업무요청 게시판', '개인정보 삭제요청'] });
const content = document.getElementById('content');

const DELETE_TYPES = ['회원 탈퇴 후 개인정보 삭제','개인정보 정정 요청','제3자 제공 철회','마케팅 수신 거부','기타'];
const STATUSES = ['접수','검토중','삭제완료','반려'];

function generateData() {
  const stored = localStorage.getItem('purples_request_privacy');
  if (stored) { try { return JSON.parse(stored); } catch(e){} }
  const names = ['김서연','박지은','이하은','최수아','강예린','한유진','정태우','윤하린'];
  const requesters = ['이지연','김민희','박수정','최영미'];
  const data = [];
  for (let i = 0; i < 10; i++) {
    const member = names[Math.floor(Math.random() * names.length)];
    data.push({
      id: i + 1,
      memberName: member,
      memberId: 'P' + String(2024000 + Math.floor(Math.random() * 999)).padStart(7, '0'),
      deleteType: DELETE_TYPES[Math.floor(Math.random() * DELETE_TYPES.length)],
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      requester: requesters[Math.floor(Math.random() * requesters.length)],
      reason: ['본인 요청','법정 보유기간 만료','동의 철회','기타'][Math.floor(Math.random() * 4)],
      createdAt: new Date(2026, 4, Math.floor(Math.random() * 13) + 1).toISOString().slice(0, 10),
      completedAt: Math.random() > 0.5 ? new Date(2026, 4, Math.floor(Math.random() * 13) + 1).toISOString().slice(0, 10) : '',
    });
  }
  data.sort((a, b) => b.id - a.id);
  localStorage.setItem('purples_request_privacy', JSON.stringify(data));
  return data;
}

function statusBadge(s) {
  const map = { '접수':'blue', '검토중':'amber', '삭제완료':'green', '반려':'red' };
  return `<span class="badge badge--${map[s] || 'gray'}">${s}</span>`;
}

function render() {
  let data = generateData();

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">개인정보 삭제요청</h1>
      <p class="page-header__subtitle">회원 개인정보 삭제 및 정정 요청을 관리합니다</p></div>
      <div class="page-header__actions"><button class="btn btn--primary btn--sm" id="btn-new">+ 삭제요청 등록</button></div>
    </div>

    <div class="summary-grid">
      <div class="summary-card"><div class="summary-card__value">${data.length}</div><div class="summary-card__label">전체 요청</div></div>
      <div class="summary-card"><div class="summary-card__value">${data.filter(d=>d.status==='접수').length}</div><div class="summary-card__label">접수</div></div>
      <div class="summary-card"><div class="summary-card__value">${data.filter(d=>d.status==='검토중').length}</div><div class="summary-card__label">검토중</div></div>
      <div class="summary-card"><div class="summary-card__value">${data.filter(d=>d.status==='삭제완료').length}</div><div class="summary-card__label">삭제완료</div></div>
    </div>

    <div class="filter-bar"><div class="filter-bar__row">
      <div class="filter-bar__item"><label>상태</label>
        <select class="form-select form-input--sm" id="f-status"><option value="">전체</option>${STATUSES.map(s => `<option>${s}</option>`).join('')}</select>
      </div>
      <div class="filter-bar__item"><label>검색</label>
        <input class="form-input form-input--sm" id="f-keyword" placeholder="회원명, ID 검색...">
      </div>
      <button class="btn btn--primary btn--sm" id="btn-search">검색</button>
    </div></div>

    <div class="card">
      <div class="card__body" style="padding:0;overflow-x:auto">
        <table class="std-table"><thead><tr>
          <th style="width:45px">번호</th><th>회원명</th><th>회원ID</th><th>삭제유형</th>
          <th>사유</th><th>상태</th><th>요청자</th><th>요청일</th><th>완료일</th>
        </tr></thead><tbody id="req-tbody"></tbody></table>
      </div>
    </div>
  `;

  function applyFilters() {
    let filtered = [...data];
    const status = document.getElementById('f-status')?.value;
    const kw = (document.getElementById('f-keyword')?.value || '').toLowerCase();
    if (status) filtered = filtered.filter(d => d.status === status);
    if (kw) filtered = filtered.filter(d => d.memberName.includes(kw) || d.memberId.toLowerCase().includes(kw));

    document.getElementById('req-tbody').innerHTML = filtered.map(d => `<tr>
      <td class="tc col-no">${d.id}</td>
      <td class="tc col-name">${d.memberName}</td>
      <td class="tc" style="font-size:11px;color:var(--text-muted)">${d.memberId}</td>
      <td class="tl">${d.deleteType}</td>
      <td class="tc">${d.reason}</td>
      <td class="tc">${statusBadge(d.status)}</td>
      <td class="tc">${d.requester}</td>
      <td class="tc">${d.createdAt}</td>
      <td class="tc">${d.completedAt || '-'}</td>
    </tr>`).join('') || '<tr><td colspan="9" class="tc text-muted" style="padding:30px">등록된 요청이 없습니다.</td></tr>';
  }

  applyFilters();
  document.getElementById('btn-search').addEventListener('click', applyFilters);
  document.getElementById('f-keyword').addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
  document.getElementById('btn-new').addEventListener('click', () => {
    Modal.show({
      title: '개인정보 삭제요청 등록',
      content: `
        <div class="form-group"><label class="form-label">회원명</label><input class="form-input" id="m-name" placeholder="회원명"></div>
        <div class="form-group"><label class="form-label">회원ID</label><input class="form-input" id="m-id" placeholder="P0000000"></div>
        <div class="form-group"><label class="form-label">삭제유형</label>
          <select class="form-select" id="m-type">${DELETE_TYPES.map(t => `<option>${t}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">사유</label>
          <textarea class="form-input" id="m-reason" rows="3" placeholder="삭제 요청 사유"></textarea></div>
      `,
      footer: `<button class="btn btn--secondary" onclick="document.getElementById('modal-root').innerHTML=''">취소</button>
        <button class="btn btn--primary" id="m-submit">등록</button>`,
    });
    document.getElementById('m-submit')?.addEventListener('click', () => {
      const name = document.getElementById('m-name').value.trim();
      if (!name) { Toast.show('회원명을 입력하세요.', 'warning'); return; }
      data.unshift({
        id: data.length + 1, memberName: name,
        memberId: document.getElementById('m-id').value.trim() || '-',
        deleteType: document.getElementById('m-type').value,
        reason: document.getElementById('m-reason').value.trim() || '본인 요청',
        status: '접수', requester: '나',
        createdAt: new Date().toISOString().slice(0, 10), completedAt: ''
      });
      localStorage.setItem('purples_request_privacy', JSON.stringify(data));
      document.getElementById('modal-root').innerHTML = '';
      Toast.show('삭제요청이 등록되었습니다.', 'success');
      render();
    });
  });
}

render();
