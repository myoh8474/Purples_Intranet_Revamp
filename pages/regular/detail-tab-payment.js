/* 결제정보 탭 렌더링 */
import { Formatters } from '@utils/formatters.js';

const SEC = (t) => `<div class="sec"><div class="sec__header">${t}</div><div class="sec__body">`;
const SEC_END = '</div></div>';

export function renderPayment(m) {
  const payments = m.payments || [];
  const paidAmt = payments.filter(p => p.status === '완료').reduce((s,p) => s + p.amount, 0);
  const totalAmt = m.totalContractAmount || 0;
  const bal = Math.max(0, totalAmt - paidAmt);
  const hasUnpaid = payments.some(p => p.status === '미납');
  // D-day 계산 (결제예정일 기준)
  var dDay = '';
  if (hasUnpaid) {
    var unpaidP = payments.find(p => p.status === '미납');
    var dueDate = unpaidP && unpaidP.dueDate ? new Date(unpaidP.dueDate) : (m.paymentDueDate ? new Date(m.paymentDueDate) : null);
    if (dueDate) {
      var diff = Math.ceil((dueDate - new Date()) / 86400000);
      if (diff > 0) dDay = '<div style="font-size:12px;color:#d97706;margin-top:4px">D-' + diff + '</div>';
      else if (diff === 0) dDay = '<div style="font-size:12px;color:#dc2626;margin-top:4px;font-weight:700">D-DAY</div>';
      else dDay = '<div style="font-size:12px;color:#dc2626;margin-top:4px;font-weight:700">D+' + Math.abs(diff) + ' 연체</div>';
    }
  }

  return `
    ${SEC('결제 요약')}
    <div style="padding:14px">
    <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:var(--radius-sm);border:1px solid ${m.noInterest?'#dc2626':'#e9e5f0'};background:${m.noInterest?'#fef2f2':'#fff'}">
        <span style="font-size:12px;font-weight:600;color:${m.noInterest?'#dc2626':'var(--text-muted)'}">무이자</span>
        <span style="font-weight:700;color:${m.noInterest?'#dc2626':'var(--text-muted)'}">${m.noInterest?'✕':'○'}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:var(--radius-sm);border:1px solid ${m.discountRate?'#d97706':'#e9e5f0'};background:${m.discountRate?'#fffbeb':'#fff'}">
        <span style="font-size:12px;font-weight:600;color:${m.discountRate?'#d97706':'var(--text-muted)'}">할인율</span>
        <span style="font-weight:700;color:${m.discountRate?'#d97706':'var(--text-muted)'}">${m.discountRate?m.discountRate+'%':'-'}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:var(--radius-sm);border:1px solid ${m.upgraded?'#2563eb':'#e9e5f0'};background:${m.upgraded?'#eff6ff':'#fff'}">
        <span style="font-size:12px;font-weight:600;color:${m.upgraded?'#2563eb':'var(--text-muted)'}">업그레이드</span>
        <span style="font-weight:700;color:${m.upgraded?'#2563eb':'var(--text-muted)'}">${m.upgraded?'✕':'○'}</span>
      </div>
    </div>
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px">
      <div style="flex:1;min-width:160px;background:var(--bg-secondary);padding:16px;border-radius:var(--radius-lg);text-align:center">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">총 계약금</div>
        <div style="font-size:18px;font-weight:700">${Formatters.money(totalAmt)}</div>
      </div>
      <div style="flex:1;min-width:160px;background:#ecfdf5;padding:16px;border-radius:var(--radius-lg);text-align:center">
        <div style="font-size:11px;color:#059669;margin-bottom:4px">기납부액</div>
        <div style="font-size:18px;font-weight:700;color:#059669">${Formatters.money(paidAmt)}</div>
      </div>
      <div style="flex:1;min-width:160px;background:${bal>0?'#fef3c7':'var(--bg-secondary)'};padding:16px;border-radius:var(--radius-lg);text-align:center">
        <div style="font-size:11px;color:${bal>0?'#d97706':'var(--text-muted)'};margin-bottom:4px">잔금</div>
        <div style="font-size:18px;font-weight:700;color:${bal>0?'#d97706':'var(--text-muted)'}">${bal>0?Formatters.money(bal):'-'}</div>
      </div>
      <div style="flex:1;min-width:160px;background:${hasUnpaid?'#fef2f2':'var(--bg-secondary)'};padding:16px;border-radius:var(--radius-lg);text-align:center">
        <div style="font-size:11px;color:${hasUnpaid?'#dc2626':'var(--text-muted)'};margin-bottom:4px">미납여부</div>
        <div style="font-size:18px;font-weight:700;color:${hasUnpaid?'#dc2626':'var(--text-muted)'}">${hasUnpaid?'미납':'없음'}</div>
        ${dDay}
      </div>
    </div>
    ${m.unpaidReason ? `<div style="font-size:12px;color:#d97706;margin-bottom:12px">${m.unpaidReason}</div>` : ''}
    <div style="text-align:right"><button class="btn btn--primary btn--sm" id="btn-add-payment">+ 잔금 입금 등록</button></div>
    </div>
    ${SEC_END}

    <div class="sec">
    <div class="sec__header">결제 내역</div>
    <div class="sec__body">
    <table class="data-table data-table--bordered data-table--no-outer dtbl" style="font-size:12px">
      <thead><tr><th>No</th><th>결제일</th><th>분류</th><th>가입프로그램</th><th>결제수단</th><th>금액</th><th>수당옵션</th><th>쉐어매니저</th><th>쉐어비율</th><th>실매출액</th><th>상태</th><th>비고</th></tr></thead>
      <tbody>
        ${payments.length === 0 ? '<tr><td colspan="12" style="text-align:center;color:var(--text-muted);padding:20px">결제 내역이 없습니다.</td></tr>' :
          payments.map((p, i) => {
            var sr = p.shareRate || 0;
            var rs = p.amount - Math.round(p.amount * sr / 100);
            return `<tr>
            <td style="text-align:center">${i+1}</td>
            <td>${Formatters.date(p.date)}</td>
            <td>${p.category||'-'}</td>
            <td>${p.program||m.program||'-'}</td>
            <td>${p.method}</td>
            <td style="font-weight:700">${Formatters.money(p.amount)}</td>
            <td>${p.feeOption||'-'}</td>
            <td>${p.shareManager||'-'}</td>
            <td>${sr ? sr+'%' : '-'}</td>
            <td style="font-weight:700">${Formatters.money(rs)}</td>
            <td><span class="badge badge--${p.status==='완료'?'green':'red'}">${p.status}</span></td>
            <td>${p.note||'-'}</td>
          </tr>`}).join('')}
      </tbody>
    </table>
    </div></div>
  `;
}
