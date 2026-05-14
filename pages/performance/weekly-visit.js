/* ========================================
   주간 방문상담 현황 (표준 디자인 시스템)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MockAssociates } from '@mock/associates.js';

initLayout({ pageId: 'perf-weekly-visit', breadcrumbs: ['매니저 관리', '주간 방문상담 현황'] });
const content = document.getElementById('content');

function render() {
  const consultants = [...new Set(MockAssociates.map(m => m.consultant))];
  const branches = {};
  MockAssociates.forEach(m => { branches[m.consultant] = m.branch; });
  const now = new Date();
  const weekNum = Math.ceil(now.getDate() / 7);

  const data = consultants.map(name => {
    const reserved = Math.floor(Math.random() * 8);
    const visited = Math.min(reserved, Math.floor(Math.random() * (reserved + 1)));
    const visitRate = reserved > 0 ? Math.round((visited / reserved) * 100 * 100) / 100 : 0;
    const contracts = Math.min(visited, Math.floor(Math.random() * 3));
    const contractRate = visited > 0 ? Math.round((contracts / visited) * 100) : 0;
    const newRevenue = contracts > 0 ? contracts * (Math.floor(Math.random() * 5) + 3) * 1000000 : 0;
    const totalRevenue = newRevenue + Math.floor(Math.random() * 3000000);
    const convertedRevenue = contracts > 0 ? Math.floor(totalRevenue * (0.8 + Math.random() * 0.5)) : 0;
    return { branch: branches[name] || '본사', consultant: name,
      team: Math.random() > 0.5 ? '상담1팀' : '상담2팀',
      reserved, visited, visitRate, contracts, contractRate, newRevenue, totalRevenue, convertedRevenue };
  }).sort((a, b) => a.branch.localeCompare(b.branch));

  const totals = data.reduce((a, d) => {
    a.reserved += d.reserved; a.visited += d.visited; a.contracts += d.contracts;
    a.newRevenue += d.newRevenue; a.totalRevenue += d.totalRevenue; a.convertedRevenue += d.convertedRevenue;
    return a;
  }, { reserved:0, visited:0, contracts:0, newRevenue:0, totalRevenue:0, convertedRevenue:0 });
  totals.visitRate = totals.reserved > 0 ? Math.round((totals.visited / totals.reserved) * 100 * 100) / 100 : 0;
  totals.contractRate = totals.visited > 0 ? Math.round((totals.contracts / totals.visited) * 100) : 0;

  const rows = data.map(d => `<tr>
    <td class="tc">${d.branch}</td><td class="tc col-name">${d.consultant}</td><td class="tc">${d.team}</td>
    <td class="tr">${d.reserved}</td><td class="tr">${d.visited}</td>
    <td class="tr ${d.visitRate >= 50 ? 'col-good' : ''}">${d.visitRate}</td>
    <td class="tr">${d.contracts}</td><td class="tr ${d.contractRate >= 30 ? 'col-good' : ''}">${d.contractRate}</td>
    <td class="tr">${d.newRevenue ? d.newRevenue.toLocaleString() : '0'}</td>
    <td class="tr">${d.totalRevenue ? d.totalRevenue.toLocaleString() : '0'}</td>
    <td class="tr">${d.convertedRevenue ? d.convertedRevenue.toLocaleString() : '0'}</td>
  </tr>`).join('');

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">매니저 주간 방문상담</h1>
      <p class="page-header__subtitle">${now.getFullYear()}년 ${now.getMonth()+1}월 ${weekNum}주차</p></div>
      <div class="page-header__actions">
        <select class="form-select form-input--sm" style="width:auto">
          ${[1,2,3,4,5].map(w => `<option ${w === weekNum ? 'selected' : ''}>${w}주차</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="card"><div class="card__body" style="padding:0;overflow-x:auto">
      <table class="std-table"><thead><tr>
        <th>지사</th><th>매니저</th><th>소속</th>
        <th>총 방문<br>예약건수</th><th>실제<br>방문건수</th><th>실방문율<br>(%)</th>
        <th>계약건수</th><th>계약율<br>(%)</th><th>신규매출<br>(1가입)</th>
        <th>총 매출금액</th><th>환산매출</th>
      </tr></thead><tbody>${rows}
        <tr class="row-total"><td class="tc" colspan="3" style="font-weight:800">합계</td>
          <td class="tr">${totals.reserved}</td><td class="tr">${totals.visited}</td>
          <td class="tr">${totals.visitRate}</td><td class="tr">${totals.contracts}</td>
          <td class="tr">${totals.contractRate}</td><td class="tr">${totals.newRevenue.toLocaleString()}</td>
          <td class="tr">${totals.totalRevenue.toLocaleString()}</td><td class="tr">${totals.convertedRevenue.toLocaleString()}</td>
        </tr>
      </tbody></table>
    </div></div>`;
}
render();
