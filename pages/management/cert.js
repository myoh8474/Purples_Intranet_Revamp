/* ========================================
   인증관리 - 서류인증 관리 페이지
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { MockAssociates } from '@mock/associates.js';
import { MockRegulars } from '@mock/regulars.js';

initLayout({ pageId: 'cert-dashboard', breadcrumbs: ['인증관리', '서류인증 관리'] });

const content = document.getElementById('content');

// localStorage에서 모든 회원의 인증서류 데이터 수집
const allCerts = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('purples_cert_docs_')) {
    const memberId = key.replace('purples_cert_docs_', '');
    try {
      const docs = JSON.parse(localStorage.getItem(key));
      const memberInfo = findMember(memberId);
      allCerts.push({
        memberId,
        memberName: memberInfo ? memberInfo.name : memberId,
        consultant: memberInfo ? (memberInfo.consultant || memberInfo.consultantManager) : '-',
        phone: memberInfo ? memberInfo.phone : '-',
        docs,
        totalDocs: docs.length,
        doneDocs: docs.filter(d => d.status === 'done').length,
      });
    } catch(e) { /* ignore */ }
  }
}

function findMember(id) {
  const assoc = MockAssociates.find(m => String(m.id) === String(id));
  if (assoc) return assoc;
  return MockRegulars.find(m => String(m.id) === String(id)) || null;
}

function toggleSub(idx) {
  document.querySelectorAll('.cert-sub-' + idx).forEach(r => {
    r.style.display = r.style.display === 'none' ? '' : 'none';
  });
}
// 전역 노출 (onclick에서 사용)
window.toggleCertSub = toggleSub;
window.certToast = (msg, type) => Toast.show(msg, type);

content.innerHTML = `
  <div class="card" style="margin-bottom:20px">
    <div class="card__header">
      <h3 class="card__title">📋 서류인증 관리</h3>
      <div style="display:flex;gap:8px">
        <span class="badge badge--blue" style="font-size:12px;padding:4px 12px">전체 ${allCerts.length}건</span>
        <span class="badge badge--green" style="font-size:12px;padding:4px 12px">인증완료 ${allCerts.filter(c => c.totalDocs > 0 && c.doneDocs === c.totalDocs).length}건</span>
        <span class="badge badge--amber" style="font-size:12px;padding:4px 12px">진행중 ${allCerts.filter(c => c.doneDocs > 0 && c.doneDocs < c.totalDocs).length}건</span>
        <span class="badge badge--red" style="font-size:12px;padding:4px 12px">미등록 ${allCerts.filter(c => c.doneDocs === 0).length}건</span>
      </div>
    </div>
    <div class="card__body">
      ${allCerts.length === 0 ? `
        <div style="text-align:center;padding:40px;color:var(--text-muted)">
          <div style="font-size:48px;margin-bottom:12px">📋</div>
          <p style="font-size:14px">등록된 인증서류 데이터가 없습니다.</p>
          <p style="font-size:12px;margin-top:4px">준회원 상세페이지에서 서류등록을 시작하세요.</p>
        </div>
      ` : `
        <table class="data-table" style="font-size:12px">
          <thead><tr>
            <th style="width:40px">No</th><th>회원명</th><th>연락처</th><th>상담매니저</th>
            <th>전체서류</th><th>등록완료</th><th>미등록</th>
            <th style="width:100px">진행률</th><th style="width:90px">상태</th>
          </tr></thead>
          <tbody>
            ${allCerts.map((c, idx) => {
              const pct = c.totalDocs > 0 ? Math.round(c.doneDocs / c.totalDocs * 100) : 0;
              const statusBadge = pct === 100
                ? '<span class="badge badge--green" style="font-size:10px;padding:2px 8px">인증완료</span>'
                : pct > 0
                ? '<span class="badge badge--amber" style="font-size:10px;padding:2px 8px">진행중</span>'
                : '<span class="badge badge--red" style="font-size:10px;padding:2px 8px">미등록</span>';
              const subRows = c.docs.map(doc => {
                const pdfBtn = doc.status === 'done'
                  ? '<button class="btn btn--sm" style="font-size:10px;background:#fff;border:1px solid #ccc;color:#333;padding:2px 8px" onclick="certToast(\'PDF 다운로드 준비 중...\',\'info\')">📄 다운로드</button>'
                  : '<span style="color:#94a3b8;font-size:11px">-</span>';
                return `<tr class="cert-sub-row cert-sub-${idx}" style="display:none;background:#f8fafc">
                  <td></td>
                  <td style="padding-left:24px;font-size:11px">└ ${doc.name}</td>
                  <td style="text-align:center;font-size:11px">${doc.date ? Formatters.date(doc.date) : '-'}</td>
                  <td style="font-size:11px">${doc.issuer || '-'}</td>
                  <td style="text-align:center">${pdfBtn}</td>
                  <td></td><td></td><td></td><td></td></tr>`;
              }).join('');
              return `<tr style="cursor:pointer" onclick="toggleCertSub(${idx})">
                <td style="text-align:center">${idx + 1}</td>
                <td><strong>${c.memberName}</strong> <span style="font-size:10px;color:#94a3b8">▼</span></td>
                <td>${Formatters.phone(c.phone)}</td>
                <td>${c.consultant}</td>
                <td style="text-align:center">${c.totalDocs}건</td>
                <td style="text-align:center;color:#16a34a;font-weight:600">${c.doneDocs}건</td>
                <td style="text-align:center;color:#dc2626;font-weight:600">${c.totalDocs - c.doneDocs}건</td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <div style="flex:1;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden">
                      <div style="width:${pct}%;height:100%;background:${pct === 100 ? '#16a34a' : pct > 0 ? '#f59e0b' : '#e5e7eb'};border-radius:3px;transition:width 0.3s"></div>
                    </div>
                    <span style="font-size:10px;font-weight:600;color:${pct === 100 ? '#16a34a' : '#64748b'}">${pct}%</span>
                  </div>
                </td>
                <td style="text-align:center">${statusBadge}</td>
              </tr>` + subRows;
            }).join('')}
          </tbody>
        </table>
      `}
    </div>
  </div>
`;
