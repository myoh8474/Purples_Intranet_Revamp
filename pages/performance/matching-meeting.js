/* ========================================
   매칭 미팅 등록 현황 (표준 디자인 시스템)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MockAssociates } from '@mock/associates.js';

initLayout({ pageId: 'perf-matching-meeting', breadcrumbs: ['매니저 관리', '매칭 미팅 등록 현황'] });
const content = document.getElementById('content');

function render() {
  const consultants = [...new Set(MockAssociates.map(m => m.consultant))];
  const branches = {};
  MockAssociates.forEach(m => { branches[m.consultant] = m.branch; });
  const now = new Date();

  const data = consultants.map(name => {
    const registered = Math.floor(Math.random() * 20) + 1;
    const completed = Math.floor(Math.random() * registered);
    const cancelled = Math.floor(Math.random() * 5);
    return { branch: branches[name] || '본사', consultant: name,
      registered, completed, cancelled, pending: Math.max(0, registered - completed - cancelled),
      completionRate: registered > 0 ? Math.round((completed / registered) * 100) : 0 };
  }).sort((a, b) => b.registered - a.registered);

  const rows = data.map((d, i) => `<tr>
    <td class="tc col-no">${i + 1}</td><td class="tc">${d.branch}</td>
    <td class="tc col-name">${d.consultant}</td>
    <td class="tr" style="font-weight:700">${d.registered}</td>
    <td class="tr col-good">${d.completed}</td>
    <td class="tr col-bad">${d.cancelled}</td>
    <td class="tr col-warn">${d.pending}</td>
    <td class="tr ${d.completionRate >= 60 ? 'col-good' : ''}">${d.completionRate}%</td>
  </tr>`).join('');

  content.innerHTML = `
    <div class="page-header"><div><h1 class="page-header__title">매칭 미팅 등록 현황</h1>
    <p class="page-header__subtitle">${now.getFullYear()}년 ${now.getMonth()+1}월 매칭매니저 미팅 실적</p></div></div>
    <div class="card"><div class="card__body" style="padding:0;overflow-x:auto">
    <table class="std-table" style="max-width:800px"><thead><tr>
      <th style="width:40px">순위</th><th>지사</th><th>매니저</th>
      <th>등록건수</th><th>완료</th><th>취소</th><th>대기</th><th>완료율</th>
    </tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
render();
