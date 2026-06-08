/* ========================================
   인증요청 업무
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';

initLayout({ pageId: 'request-cert', breadcrumbs: ['업무요청 게시판', '인증요청 업무'] });
const content = document.getElementById('content');

const CERT_TYPES = ['서류인증 재요청','자동발급 오류','인증 만료 갱신','인증서류 추가등록','기타'];
const STATUSES = ['접수','처리중','완료','반려'];
const DOC_TYPES = ['주민등록등본','가족관계증명서','재직증명서','소득금액증명','졸업증명서','건강보험자격확인서'];

function generateData() {
  const stored = localStorage.getItem('purples_request_cert');
  if (stored) { try { return JSON.parse(stored); } catch(e){} }
  const members = ['김서연','박지은','이하은','최수아','강예린','한유진','정태우','윤하린','배준서','민유진'];
  const requesters = ['이지연','김민희','박수정','최영미','한소영'];
  const data = [];
  for (let i = 0; i < 12; i++) {
    data.push({
      id: i + 1,
      memberName: members[Math.floor(Math.random() * members.length)],
      certType: CERT_TYPES[Math.floor(Math.random() * CERT_TYPES.length)],
      docName: DOC_TYPES[Math.floor(Math.random() * DOC_TYPES.length)],
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      requester: requesters[Math.floor(Math.random() * requesters.length)],
      createdAt: new Date(2026, 4, Math.floor(Math.random() * 13) + 1).toISOString().slice(0, 10),
      note: ['스크래핑 오류 발생','만료일 초과','회원 요청','담당자 확인 필요',''][Math.floor(Math.random() * 5)],
    });
  }
  data.sort((a, b) => b.id - a.id);
  localStorage.setItem('purples_request_cert', JSON.stringify(data));
  return data;
}

function statusBadge(s) {
  const map = { '접수':'blue', '처리중':'amber', '완료':'green', '반려':'red' };
  return `<span class="badge badge--${map[s] || 'gray'}">${s}</span>`;
}

function render() {
  let data = generateData();

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">인증요청 업무</h1>
      <p class="page-header__subtitle">서류인증 관련 요청 업무를 관리합니다</p></div>
      <div class="page-header__actions"><button class="btn btn--primary btn--sm" id="btn-new">+ 인증요청 등록</button></div>
    </div>

    <div class="summary-grid">
      <div class="summary-card"><div class="summary-card__value">${data.length}</div><div class="summary-card__label">전체</div></div>
      <div class="summary-card"><div class="summary-card__value">${data.filter(d=>d.status==='접수').length}</div><div class="summary-card__label">접수</div></div>
      <div class="summary-card"><div class="summary-card__value">${data.filter(d=>d.status==='처리중').length}</div><div class="summary-card__label">처리중</div></div>
      <div class="summary-card"><div class="summary-card__value">${data.filter(d=>d.status==='완료').length}</div><div class="summary-card__label">완료</div></div>
    </div>

    <div class="filter-bar"><div class="filter-bar__row">
      <div class="filter-bar__item"><label>요청유형</label>
        <select class="form-select form-input--sm" id="f-type"><option value="">전체</option>${CERT_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
      </div>
      <div class="filter-bar__item"><label>상태</label>
        <select class="form-select form-input--sm" id="f-status"><option value="">전체</option>${STATUSES.map(s => `<option>${s}</option>`).join('')}</select>
      </div>
      <div class="filter-bar__item"><label>검색</label>
        <input class="form-input form-input--sm" id="f-keyword" placeholder="회원명 검색...">
      </div>
      <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
    </div></div>

    <div class="card">
      <div class="card__body" style="padding:0;overflow-x:auto">
        <table class="std-table"><thead><tr>
          <th style="width:45px">번호</th><th>회원명</th><th>요청유형</th><th>서류명</th>
          <th>상태</th><th>요청자</th><th>요청일</th><th>비고</th>
        </tr></thead><tbody id="req-tbody"></tbody></table>
      </div>
    </div>
  `;

  function applyFilters() {
    let filtered = [...data];
    const type = document.getElementById('f-type')?.value;
    const status = document.getElementById('f-status')?.value;
    const kw = (document.getElementById('f-keyword')?.value || '').toLowerCase();
    if (type) filtered = filtered.filter(d => d.certType === type);
    if (status) filtered = filtered.filter(d => d.status === status);
    if (kw) filtered = filtered.filter(d => d.memberName.includes(kw));

    document.getElementById('req-tbody').innerHTML = filtered.map(d => `<tr>
      <td class="tc col-no">${d.id}</td>
      <td class="tc col-name">${d.memberName}</td>
      <td class="tl">${d.certType}</td>
      <td class="tc">${d.docName}</td>
      <td class="tc">${statusBadge(d.status)}</td>
      <td class="tc">${d.requester}</td>
      <td class="tc">${d.createdAt}</td>
      <td class="tl ellipsis">${d.note || '-'}</td>
    </tr>`).join('') || '<tr><td colspan="8" class="tc text-muted" style="padding:30px">등록된 요청이 없습니다.</td></tr>';
  }

  applyFilters();
  document.getElementById('btn-search').addEventListener('click', applyFilters);
  document.getElementById('f-keyword').addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
  document.getElementById('btn-new').addEventListener('click', () => {
    Modal.show({
      title: '인증요청 등록',
      content: `
        <div class="form-group"><label class="form-label">회원명</label><input class="form-input" id="m-name" placeholder="회원명"></div>
        <div class="form-group"><label class="form-label">요청유형</label>
          <select class="form-select" id="m-type">${CERT_TYPES.map(t => `<option>${t}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">서류명</label>
          <select class="form-select" id="m-doc">${DOC_TYPES.map(d => `<option>${d}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">비고</label>
          <textarea class="form-input" id="m-note" rows="3" placeholder="추가 메모"></textarea></div>
      `,
      footer: `<button class="btn btn--secondary" onclick="document.getElementById('modal-root').innerHTML=''">취소</button>
        <button class="btn btn--primary" id="m-submit">등록</button>`,
    });
    document.getElementById('m-submit')?.addEventListener('click', () => {
      const name = document.getElementById('m-name').value.trim();
      if (!name) { Toast.show('회원명을 입력하세요.', 'warning'); return; }
      data.unshift({
        id: data.length + 1, memberName: name,
        certType: document.getElementById('m-type').value,
        docName: document.getElementById('m-doc').value,
        status: '접수', requester: '나',
        createdAt: new Date().toISOString().slice(0, 10),
        note: document.getElementById('m-note').value.trim()
      });
      localStorage.setItem('purples_request_cert', JSON.stringify(data));
      document.getElementById('modal-root').innerHTML = '';
      Toast.show('인증요청이 등록되었습니다.', 'success');
      render();
    });
  });
}

render();
