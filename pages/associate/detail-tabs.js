/* 준회원 상세 탭 렌더링 */
import { Formatters } from '@utils/formatters.js';
import { CONSULTANTS } from '@config/constants.js';

const LBL = 'background:var(--bg-secondary);width:120px;font-weight:600;font-size:12px;color:var(--text-secondary);text-align:center;white-space:nowrap';
const VAL = 'font-size:13px;padding:8px 12px';
const SEC = (t) => `<div style="font-size:13px;font-weight:700;color:var(--text-primary);margin:24px 0 12px">${t}</div>`;

export function renderBasicTab(m) {
  return `
    ${SEC('인적사항')}
    <table class="data-table data-table--bordered" style="font-size:13px"><tbody>
      <tr><td style="${LBL}">회원명</td><td style="${VAL}">${m.name}</td><td style="${LBL}">성별</td><td style="${VAL}">${m.gender}</td><td style="${LBL}">상태</td><td style="${VAL}">${Formatters.statusBadge(m.status,'associate')}</td></tr>
      <tr><td style="${LBL}">생년월일</td><td style="${VAL}">${Formatters.date(m.birthDate)} (${m.age}세)</td><td style="${LBL}">핸드폰</td><td style="${VAL}">${Formatters.phone(m.phone)}</td><td style="${LBL}">결혼여부</td><td style="${VAL}">${m.maritalStatus}</td></tr>
      <tr><td style="${LBL}">학력</td><td style="${VAL}">${m.education} / ${m.school}</td><td style="${LBL}">직업</td><td style="${VAL}">${m.job}</td><td style="${LBL}">직장</td><td style="${VAL}">${m.company||'-'}</td></tr>
      <tr><td style="${LBL}">지역</td><td style="${VAL}">${m.region}</td><td style="${LBL}">가입경로</td><td style="${VAL}">${m.channel}</td><td style="${LBL}">컨설턴트</td><td style="${VAL}">${m.consultant}</td></tr>
    </tbody></table>

    ${SEC('등록 정보')}
    <table class="data-table data-table--bordered" style="font-size:13px"><tbody>
      <tr><td style="${LBL}">등록일</td><td style="${VAL}">${Formatters.date(m.registeredAt)}</td><td style="${LBL}">분배일</td><td style="${VAL}">${Formatters.date(m.distributedAt)}</td><td style="${LBL}">최종컨텍</td><td style="${VAL}">${Formatters.date(m.lastContactAt)}</td></tr>
      <tr><td style="${LBL}">지사</td><td style="${VAL}">${m.branch}</td><td style="${LBL}">브랜드</td><td style="${VAL}">${m.brand||'-'}</td><td style="${LBL}"></td><td style="${VAL}"></td></tr>
    </tbody></table>
  `;
}

export function renderSalesTab(m) {
  return `
    ${SEC('매출 입력')}
    <div style="background:var(--bg-secondary);padding:16px;border-radius:8px">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:12px">
        <div class="form-group" style="margin:0"><label class="form-label" style="font-size:11px">입금일 *</label><input type="date" class="form-input form-input--sm" id="sales-date"></div>
        <div class="form-group" style="margin:0"><label class="form-label" style="font-size:11px">계약일 *</label><input type="date" class="form-input form-input--sm" id="sales-contract-date"></div>
        <div class="form-group" style="margin:0"><label class="form-label" style="font-size:11px">분할매출 *</label><select class="form-select form-input--sm" id="sales-split"><option>일시불</option><option>계약금</option><option>중도금</option><option>잔금</option></select></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:12px">
        <div class="form-group" style="margin:0"><label class="form-label" style="font-size:11px">입금액 *</label><input type="number" class="form-input form-input--sm" placeholder="0" id="sales-amount"></div>
        <div class="form-group" style="margin:0"><label class="form-label" style="font-size:11px">남성수당</label><select class="form-select form-input--sm"><option>없음</option><option>전문직</option><option>준전문직</option></select></div>
        <div class="form-group" style="margin:0"><label class="form-label" style="font-size:11px">쉐어 매니저</label><select class="form-select form-input--sm"><option value="">없음</option>${CONSULTANTS.map(c=>`<option>${c}</option>`).join('')}</select></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:12px">
        <div class="form-group" style="margin:0"><label class="form-label" style="font-size:11px">쉐어 비율</label><select class="form-select form-input--sm"><option>50%</option><option>40%</option><option>30%</option></select></div>
        <div class="form-group" style="margin:0"><label class="form-label" style="font-size:11px">실매출</label><input type="text" class="form-input form-input--sm" value="자동계산" disabled></div>
      </div>
      <button class="btn btn--primary btn--sm" id="btn-sales">매출 등록</button>
    </div>

    ${SEC('가입 내역')}
    <div style="padding:20px;text-align:center;color:var(--text-muted);background:var(--bg-secondary);border-radius:8px">가입내역이 없습니다.</div>
  `;
}

export function renderConsultTab(m, renderCallTable, renderMeetTable) {
  return `
    ${SEC('미팅상담 내역')}
    <div style="text-align:right;margin-bottom:8px"><button class="btn btn--primary btn--sm" id="btn-meeting">미팅상담 약속 기록</button></div>
    <div id="meeting-area">${renderMeetTable(m)}</div>

    ${SEC('전화상담 내역')}
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:8px">
      <button class="btn btn--ghost btn--sm" id="btn-card">명함전송</button>
      <button class="btn btn--ghost btn--sm" id="btn-sms">SMS전송</button>
      <button class="btn btn--primary btn--sm" id="btn-call">전화상담 내역 기록</button>
    </div>
    <div id="call-area">${renderCallTable(m)}</div>
  `;
}
