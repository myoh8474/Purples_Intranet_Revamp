/* ========================================
   보유DB 현황 — 탭 전환 UI
   브랜드별 매니저 보유 DB 갯수 조회
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MockAssociates } from '@mock/associates.js';

initLayout({ pageId: 'associate-db-status', breadcrumbs: ['준회원 관리', '보유DB 현황'] });
const content = document.getElementById('content');

function getStatusData() {
  let d = [...MockAssociates];
  try {
    const u = JSON.parse(localStorage.getItem('purples_status_updates') || '{}');
    d = d.map(x => u[x.id] ? { ...x, status: typeof u[x.id] === 'string' ? u[x.id] : u[x.id].status || x.status } : x);
  } catch (e) {}
  return d;
}

function buildBrandStats(data) {
  const brandNames = ['퍼플스', '디노블', '르매리'];
  const result = {};

  for (const brand of brandNames) {
    const brandData = data.filter(m => m.brand === brand);
    const stats = {};
    brandData.forEach(m => {
      if (!stats[m.consultant]) stats[m.consultant] = { name: m.consultant, count: 0 };
      stats[m.consultant].count++;
    });

    const branchStats = {};
    brandData.forEach(m => {
      const bk = m.branch + '지사';
      if (!branchStats[bk]) branchStats[bk] = { name: bk, count: 0, isBranch: true };
      branchStats[bk].count++;
    });

    const managers = Object.values(stats).sort((a, b) => a.name.localeCompare(b.name));
    const branchList = Object.values(branchStats).sort((a, b) => a.name.localeCompare(b.name));
    const combined = [...managers, ...branchList].sort((a, b) => a.name.localeCompare(b.name));
    combined.push({ name: brand + ' 합계', count: brandData.length, isTotal: true });
    result[brand] = { list: combined, total: brandData.length };
  }
  return result;
}

function renderBrandTable(brandData) {
  const rows = brandData.list.map((item, i) => {
    if (item.isTotal) {
      return `<tr class="row-total">
        <td class="tc"></td>
        <td class="tc" style="font-weight:800">${item.name}</td>
        <td class="tr" style="font-weight:800;font-size:13px">${item.count.toLocaleString()}</td>
      </tr>`;
    }
    if (item.isBranch) {
      return `<tr style="background:var(--bg-tertiary)">
        <td class="tc col-no">${i + 1}</td>
        <td class="tc" style="font-weight:700">${item.name}</td>
        <td class="tr" style="font-weight:700">${item.count.toLocaleString()}</td>
      </tr>`;
    }
    return `<tr>
      <td class="tc col-no">${i + 1}</td>
      <td class="tc"><a href="db-detail.html?manager=${encodeURIComponent(item.name)}" target="_blank" class="col-link">${item.name}</a></td>
      <td class="tr">${item.count.toLocaleString()}</td>
    </tr>`;
  }).join('');

  return `
    <table class="std-table">
      <thead><tr>
        <th style="width:60px">순번</th><th>매니저</th><th style="width:100px">보유 갯수</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function render() {
  const data = getStatusData();
  const brandStats = buildBrandStats(data);
  const grandTotal = Object.values(brandStats).reduce((sum, b) => sum + b.total, 0);
  const brands = ['퍼플스', '디노블', '르매리'];

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">보유DB 현황</h1>
      <p class="page-header__subtitle">브랜드별 매니저 보유 준회원 DB 현황</p></div>
    </div>

    <div class="summary-grid">
      <div class="summary-card summary-card--purple">
        <div class="summary-card__value">${brandStats['퍼플스'].total.toLocaleString()}</div>
        <div class="summary-card__label">퍼플스</div>
      </div>
      <div class="summary-card summary-card--green">
        <div class="summary-card__value">${brandStats['디노블'].total.toLocaleString()}</div>
        <div class="summary-card__label">디노블</div>
      </div>
      <div class="summary-card summary-card--amber">
        <div class="summary-card__value">${brandStats['르매리'].total.toLocaleString()}</div>
        <div class="summary-card__label">르매리</div>
      </div>
      <div class="summary-card summary-card--blue">
        <div class="summary-card__value">${grandTotal.toLocaleString()}</div>
        <div class="summary-card__label">전체 합계</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:0">
      <div class="card__header" style="padding-bottom:0;border-bottom:none">
        <div class="db-tabs" id="db-tabs">
          ${brands.map((b, i) => `
            <button class="db-tab${i === 0 ? ' active' : ''}" data-brand="${b}">
              ${b} <span class="db-tab__count">${brandStats[b].total}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="card__body" style="padding:0">
        <div id="db-table-area">
          ${renderBrandTable(brandStats['퍼플스'])}
        </div>
      </div>
    </div>

    <style>
      .db-tabs { display: flex; gap: 4px; }
      .db-tab {
        padding: 8px 20px;
        border: none;
        background: none;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-muted);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.15s ease;
        font-family: inherit;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .db-tab:hover { color: var(--text-primary); }
      .db-tab.active {
        color: var(--accent);
        font-weight: 700;
        border-bottom-color: var(--accent);
      }
      .db-tab__count {
        font-size: 11px;
        font-weight: 600;
        background: var(--bg-tertiary);
        padding: 1px 7px;
        border-radius: 10px;
      }
      .db-tab.active .db-tab__count {
        background: var(--accent-bg);
        color: var(--accent);
      }
    </style>
  `;

  // 탭 전환 이벤트
  document.querySelectorAll('.db-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.db-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const brand = tab.dataset.brand;
      document.getElementById('db-table-area').innerHTML = renderBrandTable(brandStats[brand]);
    });
  });
}

render();
