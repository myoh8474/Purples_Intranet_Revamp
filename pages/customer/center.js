/* ========================================
   고객센터 (표준 디자인 시스템)
   회원 직접 등록: 칭찬/제안/불편 접수
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { MockAssociates } from '@mock/associates.js';

initLayout({ pageId: 'customer-center', breadcrumbs: ['고객관리', '고객센터'] });
const content = document.getElementById('content');

const TYPES = [
  { key: 'praise', label: '칭찬접수', icon: '', variant: 'green' },
  { key: 'suggest', label: '제안접수', icon: '', variant: 'blue' },
  { key: 'complaint', label: '불편접수', icon: '', variant: 'red' },
];
const STATUSES = ['접수','검토중','처리중','완료','반려'];

function generateData() {
  const stored = localStorage.getItem('purples_customer_center');
  if (stored) { try { return JSON.parse(stored); } catch(e){} }
  const members = MockAssociates.slice(0, 30);
  const subjects = {
    praise: ['김지연 매니저님 정말 친절해요','상담이 너무 만족스러웠습니다','꼼꼼한 매칭 감사합니다','빠른 응대에 감동했어요'],
    suggest: ['주말 상담도 가능하면 좋겠어요','매칭 결과 알림 문자 서비스','앱으로도 프로필 확인 희망','화상 미팅 옵션 추가 요청'],
    complaint: ['연락이 너무 늦어요','약속 시간에 매니저 부재','프로필 사진이 실물과 달라요','환불 절차가 복잡해요','매칭 상대 정보 부정확'],
  };
  const data = [];
  for (let i = 0; i < 25; i++) {
    const type = TYPES[Math.floor(Math.random() * 3)];
    const m = members[Math.floor(Math.random() * members.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const subjectList = subjects[type.key];
    const daysAgo = Math.floor(Math.random() * 30);
    data.push({ id: i + 1, type: type.key, memberName: m.name, phone: m.phone,
      subject: subjectList[Math.floor(Math.random() * subjectList.length)],
      status, registeredAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      processedAt: status === '완료' ? new Date(Date.now() - (daysAgo - 2) * 86400000).toISOString() : '',
      handler: status !== '접수' ? m.consultant : '' });
  }
  data.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
  localStorage.setItem('purples_customer_center', JSON.stringify(data));
  return data;
}

let activeType = '';

function typeBadge(key) {
  const t = TYPES.find(x => x.key === key);
  if (!t) return key;
  return `<span class="badge badge--${t.variant}">${t.icon} ${t.label}</span>`;
}

function statusBadge(s) {
  const map = { '접수':'gray','검토중':'amber','처리중':'blue','완료':'green','반려':'red' };
  return `<span class="badge badge--${map[s] || 'gray'}">${s}</span>`;
}

function render() {
  const data = generateData();
  const counts = { all: data.length };
  TYPES.forEach(t => { counts[t.key] = data.filter(d => d.type === t.key).length; });

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">고객센터</h1>
      <p class="page-header__subtitle">회원이 직접 등록한 칭찬 · 제안 · 불편 접수를 관리합니다</p></div>
    </div>

    <div class="summary-grid">
      <div class="summary-card summary-card--clickable summary-card--purple ${activeType === '' ? 'active' : ''}" data-type="">
        <div class="summary-card__icon"></div>
        <div class="summary-card__value">${counts.all}</div>
        <div class="summary-card__label">전체</div>
      </div>
      ${TYPES.map(t => `
        <div class="summary-card summary-card--clickable summary-card--${t.variant} ${activeType === t.key ? 'active' : ''}" data-type="${t.key}">
          <div class="summary-card__icon">${t.icon}</div>
          <div class="summary-card__value">${counts[t.key]}</div>
          <div class="summary-card__label">${t.label}</div>
        </div>`).join('')}
    </div>

    <div class="filter-bar">
      <div class="filter-bar__row">
        <div class="filter-bar__item"><label>상태</label>
          <select class="form-select form-input--sm" id="f-status"><option value="">전체</option>${STATUSES.map(s => `<option>${s}</option>`).join('')}</select>
        </div>
        <div class="filter-bar__search"><label>검색</label>
          <input class="form-input form-input--sm" id="f-keyword" placeholder="회원명, 제목 검색...">
        </div>
        <button class="btn btn--primary btn--sm" id="btn-search">검색</button>
      </div>
    </div>

    <div class="card"><div class="card__body" style="padding:0;overflow-x:auto">
      <table class="std-table"><thead><tr>
        <th style="width:40px">No</th><th>유형</th><th>회원명</th><th>제목</th>
        <th>접수일</th><th>상태</th><th>담당자</th><th>처리일</th>
      </tr></thead><tbody id="cc-tbody"></tbody></table>
    </div></div>
  `;

  renderTable(data);
  document.querySelectorAll('.summary-card--clickable').forEach(el => {
    el.addEventListener('click', () => { activeType = el.dataset.type; render(); });
  });
  document.getElementById('btn-search').addEventListener('click', () => renderTable(data));
  document.getElementById('f-keyword').addEventListener('keydown', e => { if (e.key === 'Enter') renderTable(data); });
  document.getElementById('f-status').addEventListener('change', () => renderTable(data));
}

function renderTable(allData) {
  let data = [...allData];
  if (activeType) data = data.filter(d => d.type === activeType);
  const status = document.getElementById('f-status')?.value;
  if (status) data = data.filter(d => d.status === status);
  const kw = (document.getElementById('f-keyword')?.value || '').toLowerCase();
  if (kw) data = data.filter(d => d.memberName.includes(kw) || d.subject.includes(kw));

  document.getElementById('cc-tbody').innerHTML = data.map((d, i) => `<tr>
    <td class="tc col-no">${data.length - i}</td>
    <td class="tc">${typeBadge(d.type)}</td>
    <td class="tc col-name">${d.memberName}</td>
    <td class="tl">${d.subject}</td>
    <td class="tc">${Formatters.date(d.registeredAt)}</td>
    <td class="tc">${statusBadge(d.status)}</td>
    <td class="tc">${d.handler || '-'}</td>
    <td class="tc">${d.processedAt ? Formatters.date(d.processedAt) : '-'}</td>
  </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;padding:30px" class="text-muted">접수된 건이 없습니다.</td></tr>';
}

render();
