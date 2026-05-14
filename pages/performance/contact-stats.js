/* ========================================
   회원 컨텍 현황 (표준 디자인 시스템)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MockAssociates } from '@mock/associates.js';

initLayout({ pageId: 'perf-contact-stats', breadcrumbs: ['매니저 관리', '회원 컨텍 현황'] });
const content = document.getElementById('content');

function render() {
  const consultants = [...new Set(MockAssociates.map(m => m.consultant))];
  const branches = {};
  MockAssociates.forEach(m => { branches[m.consultant] = m.branch; });
  const now = new Date();

  const data = consultants.map(name => {
    const totalDB = MockAssociates.filter(m => m.consultant === name).length;
    const calls = Math.floor(Math.random() * 50) + 5;
    const sms = Math.floor(Math.random() * 30);
    const contacted = Math.floor(Math.random() * calls);
    return { branch: branches[name] || '본사', consultant: name, totalDB, calls, sms,
      contacted, noAnswer: calls - contacted, newContact: Math.floor(Math.random() * 10),
      totalContact: calls + sms,
      contactRate: totalDB > 0 ? Math.round((contacted / totalDB) * 100) : 0 };
  }).sort((a, b) => b.totalContact - a.totalContact);

  const rows = data.map((d, i) => `<tr>
    <td class="tc col-no">${i + 1}</td><td class="tc">${d.branch}</td>
    <td class="tc col-name">${d.consultant}</td><td class="tr">${d.totalDB}</td>
    <td class="tr" style="color:var(--status-blue);font-weight:700">${d.calls}</td>
    <td class="tr">${d.sms}</td><td class="tr" style="font-weight:700">${d.totalContact}</td>
    <td class="tr col-good">${d.contacted}</td><td class="tr col-bad">${d.noAnswer}</td>
    <td class="tr">${d.newContact}</td>
    <td class="tr ${d.contactRate >= 50 ? 'col-good' : ''}">${d.contactRate}%</td>
  </tr>`).join('');

  content.innerHTML = `
    <div class="page-header"><div><h1 class="page-header__title">회원 컨텍 현황</h1>
    <p class="page-header__subtitle">${now.getFullYear()}년 ${now.getMonth()+1}월 매니저별 컨텍 실적</p></div></div>
    <div class="card"><div class="card__body" style="padding:0;overflow-x:auto">
    <table class="std-table"><thead><tr>
      <th style="width:40px">순위</th><th>지사</th><th>매니저</th><th>보유DB</th>
      <th>통화</th><th>문자</th><th>총컨텍</th><th>연결</th><th>부재중</th><th>신규</th><th>컨텍율</th>
    </tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
render();
