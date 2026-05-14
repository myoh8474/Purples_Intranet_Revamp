/* ========================================
   매니저 순위 — 통합 랭킹 페이지
   7개 순위를 탭으로 전환 (표준 디자인 시스템)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MockAssociates } from '@mock/associates.js';

initLayout({ pageId: 'perf-ranking', breadcrumbs: ['매니저 관리', '매니저 순위'] });
const content = document.getElementById('content');

const RANKING_TABS = [
  { key: 'revenue', label: '매출 순위', icon: '', unit: '원' },
  { key: 'marriage', label: '성혼비 순위', icon: '', unit: '원' },
  { key: 'contact', label: '컨텍 순위', icon: '', unit: '건' },
  { key: 'meeting', label: '환산미팅 순위', icon: '', unit: '건' },
  { key: 'male', label: '남성회원 순위', icon: '', unit: '명' },
  { key: 'consult_withdraw', label: '상담탈회 순위', icon: '', unit: '건' },
  { key: 'match_withdraw', label: '매칭탈회 순위', icon: '', unit: '건' },
];

function generateRankingData() {
  const consultants = [...new Set(MockAssociates.map(m => m.consultant))];
  const branches = {};
  MockAssociates.forEach(m => { branches[m.consultant] = m.branch; });
  const rankings = {};
  RANKING_TABS.forEach(tab => {
    const data = consultants.map(name => {
      let value;
      if (tab.key === 'revenue') value = Math.floor(Math.random() * 50000000) + 1000000;
      else if (tab.key === 'marriage') value = Math.floor(Math.random() * 30000000);
      else if (tab.key === 'contact') value = Math.floor(Math.random() * 200) + 10;
      else if (tab.key === 'meeting') value = Math.floor(Math.random() * 50) + 1;
      else if (tab.key === 'male') value = Math.floor(Math.random() * 80) + 5;
      else value = Math.floor(Math.random() * 30);
      return { name, branch: branches[name] || '본사', value, prev: value + Math.floor(Math.random() * 10) - 5 };
    });
    data.sort((a, b) => b.value - a.value);
    rankings[tab.key] = data;
  });
  return rankings;
}

let activeTab = 'revenue';
let rankings = {};

function medalEmoji(rank) { return rank; }

function formatValue(val, key) {
  if (key === 'revenue' || key === 'marriage') return val.toLocaleString() + '원';
  return val.toLocaleString() + (RANKING_TABS.find(t => t.key === key)?.unit || '');
}

function renderRanking() {
  const data = rankings[activeTab] || [];
  const tab = RANKING_TABS.find(t => t.key === activeTab);

  const rows = data.map((d, i) => {
    const rank = i + 1;
    const diff = d.value - d.prev;
    const arrow = diff > 0 ? `<span class="col-good" style="font-size:10px">▲${Math.abs(diff).toLocaleString()}</span>` :
                  diff < 0 ? `<span class="col-bad" style="font-size:10px">▼${Math.abs(diff).toLocaleString()}</span>` :
                  '<span class="text-muted" style="font-size:10px">-</span>';
    return `<tr class="${rank <= 3 ? 'row-highlight' : ''}">
      <td class="tc" style="font-size:14px">${medalEmoji(rank)}</td>
      <td class="tc">${d.branch}</td>
      <td class="tc col-name">${d.name}</td>
      <td class="tr" style="font-weight:700;font-size:13px">${formatValue(d.value, activeTab)}</td>
      <td class="tc">${arrow}</td>
    </tr>`;
  }).join('');

  document.getElementById('ranking-body').innerHTML = rows;
  document.getElementById('ranking-title').textContent = `${tab.icon} ${tab.label}`;
  document.querySelectorAll('.tab-pill').forEach(el => {
    el.classList.toggle('active', el.dataset.key === activeTab);
  });
}

function render() {
  rankings = generateRankingData();
  const now = new Date();

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-header__title">매니저 순위</h1>
        <p class="page-header__subtitle">${now.getFullYear()}년 ${now.getMonth() + 1}월 기준 매니저별 성과 순위</p>
      </div>
    </div>

    <div class="tab-pills">
      ${RANKING_TABS.map(t => `<div class="tab-pill ${t.key === activeTab ? 'active' : ''}" data-key="${t.key}">${t.icon} ${t.label}</div>`).join('')}
    </div>

    <div class="card">
      <div class="card__header"><h3 class="card__title" id="ranking-title" style="font-size:14px">${RANKING_TABS[0].icon} ${RANKING_TABS[0].label}</h3></div>
      <div class="card__body" style="padding:0">
        <table class="std-table" style="max-width:700px">
          <thead><tr>
            <th style="width:50px">순위</th><th style="width:70px">지사</th>
            <th style="width:90px">매니저</th><th>실적</th><th style="width:80px">전월대비</th>
          </tr></thead>
          <tbody id="ranking-body"></tbody>
        </table>
      </div>
    </div>
  `;

  renderRanking();
  document.querySelectorAll('.tab-pill').forEach(el => {
    el.addEventListener('click', () => { activeTab = el.dataset.key; renderRanking(); });
  });
}

render();
