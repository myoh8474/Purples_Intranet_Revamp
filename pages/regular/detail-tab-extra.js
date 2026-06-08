/* 추가정보 탭 렌더링 */
import { Formatters } from '@utils/formatters.js';

const LBL = 'background:var(--bg-secondary);font-weight:600;font-size:14px;color:#888;text-align:center;white-space:nowrap;padding:6px 8px';
const VAL = 'font-size:14px;padding:6px 10px;color:#1e3a5f';
const TBL = 'class="data-table data-table--bordered data-table--no-outer" style="font-size:14px;table-layout:fixed;width:100%"';
const SEC = (t) => `<div style="margin-bottom:12px;background:#fff;border:1px solid var(--border-light);overflow:hidden"><div style="padding:10px 14px;border-bottom:1px solid #cbd5e1;font-weight:800;font-size:14px;color:#1e293b">${t}</div><div style="padding:0">`;
const SEC_END = '</div></div>';

export function renderExtraInfo(m) {
  return `
    ${SEC('신상정보')}
    <table ${TBL}>
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td style="${LBL}">시력</td><td style="${VAL}">${m.eyesight||'-'}</td><td style="${LBL}">안경</td><td style="${VAL}">${m.glasses||'-'}</td><td style="${LBL}">혈액형</td><td style="${VAL}">${m.bloodType||'-'}</td><td style="${LBL}">건강상태</td><td style="${VAL}">${m.healthStatus||'-'}</td></tr>
        <tr><td style="${LBL}">청력</td><td style="${VAL}">${m.hearing||'-'}</td><td style="${LBL}">언어</td><td style="${VAL}">${m.language||'-'}</td><td style="${LBL}">얼굴형</td><td style="${VAL}">${m.faceType||'-'}</td><td style="${LBL}">범죄이력</td><td style="${VAL}">${m.criminalRecord||'-'}</td></tr>
        <tr><td style="${LBL}">음주</td><td style="${VAL}">${m.drinking||'-'}</td><td style="${LBL}">흡연</td><td style="${VAL}">${m.smoking||'-'}</td><td style="${LBL}">신장</td><td style="${VAL}">${m.height ? m.height+'cm' : '-'}</td><td style="${LBL}">체중</td><td style="${VAL}">${m.weight ? m.weight+'kg' : '-'}</td></tr>
        <tr><td style="${LBL}">병역</td><td style="${VAL}">${m.military||'-'}</td><td style="${LBL}">종교</td><td style="${VAL}">${m.religion||'-'}</td><td style="${LBL}">본인신앙</td><td style="${VAL}">${m.ownFaith||'-'}</td><td style="${LBL}">부모신앙</td><td style="${VAL}">${m.parentFaith||'-'}</td></tr>
        <tr><td style="${LBL}">동성동본</td><td style="${VAL}">${m.sameClan||'-'}</td><td style="${LBL}">미팅사유</td><td style="${VAL}">${m.meetingReason||'-'}</td><td style="${LBL}">특기</td><td style="${VAL}">${m.specialty||'-'}</td><td style="${LBL}">보유면허증</td><td style="${VAL}">${m.license||'-'}</td></tr>
      </tbody>
    </table>${SEC_END}

    <div style="margin-bottom:12px;background:#fff;border:1px solid var(--border-light);overflow:hidden">
    <div style="padding:10px 14px;border-bottom:1px solid #cbd5e1;display:flex;align-items:center;justify-content:space-between">
      <span style="font-weight:800;font-size:14px;color:#1e293b">가족관계</span>
      <span style="font-size:12px;color:var(--text-muted)">${m.familySummary || ''}</span>
    </div><div style="padding:0">
    <table ${TBL}>
      <colgroup><col style="width:8%"><col style="width:10%"><col style="width:12%"><col style="width:10%"><col style="width:14%"><col style="width:8%"><col style="width:8%"><col style="width:14%"><col style="width:16%"></colgroup>
      <thead><tr>
        <th style="${LBL}">관계</th><th style="${LBL}">성명</th><th style="${LBL}">생년월일</th><th style="${LBL}">학력</th><th style="${LBL}">직업</th><th style="${LBL}">동거</th><th style="${LBL}">결혼</th><th style="${LBL}">거주지</th><th style="${LBL}">비고</th>
      </tr></thead>
      <tbody>
        ${(m.familyList || [
          { relation: '부', name: '-', birth: '-', edu: '-', job: '-', cohabit: '-', married: '-', residence: '-', note: '' },
          { relation: '모', name: '-', birth: '-', edu: '-', job: '-', cohabit: '-', married: '-', residence: '-', note: '' }
        ]).map(function(f) {
          return '<tr><td style="' + VAL + ';text-align:center">' + (f.relation || '-') + '</td><td style="' + VAL + ';text-align:center">' + (f.name || '-') + '</td><td style="' + VAL + ';text-align:center">' + (f.birth || '-') + '</td><td style="' + VAL + ';text-align:center">' + (f.edu || '-') + '</td><td style="' + VAL + '">' + (f.job || '-') + '</td><td style="' + VAL + ';text-align:center">' + (f.cohabit || '-') + '</td><td style="' + VAL + ';text-align:center">' + (f.married || '-') + '</td><td style="' + VAL + '">' + (f.residence || '-') + '</td><td style="' + VAL + '">' + (f.note || '-') + '</td></tr>';
        }).join('')}
      </tbody>
    </table></div></div>

    ${SEC('자녀정보')}
    <table ${TBL}>
      <colgroup><col style="width:7%"><col style="width:8%"><col style="width:10%"><col style="width:8%"><col style="width:10%"><col style="width:7%"><col style="width:7%"><col style="width:10%"><col style="width:8%"><col style="width:8%"><col style="width:17%"></colgroup>
      <thead><tr>
        <th style="${LBL}">관계</th><th style="${LBL}">성명</th><th style="${LBL}">생년월일</th><th style="${LBL}">학력</th><th style="${LBL}">직업</th><th style="${LBL}">동거</th><th style="${LBL}">결혼</th><th style="${LBL}">거주지</th><th style="${LBL}">양육권</th><th style="${LBL}">친권</th><th style="${LBL}">비고</th>
      </tr></thead>
      <tbody>
        ${(m.childrenList || [
          { relation: '-', name: '-', birth: '-', edu: '-', job: '-', cohabit: '-', married: '-', residence: '-', custody: '-', parental: '-', note: '' }
        ]).map(function(c) {
          return '<tr><td style="' + VAL + ';text-align:center">' + (c.relation || '-') + '</td><td style="' + VAL + ';text-align:center">' + (c.name || '-') + '</td><td style="' + VAL + ';text-align:center">' + (c.birth || '-') + '</td><td style="' + VAL + ';text-align:center">' + (c.edu || '-') + '</td><td style="' + VAL + '">' + (c.job || '-') + '</td><td style="' + VAL + ';text-align:center">' + (c.cohabit || '-') + '</td><td style="' + VAL + ';text-align:center">' + (c.married || '-') + '</td><td style="' + VAL + '">' + (c.residence || '-') + '</td><td style="' + VAL + ';text-align:center">' + (c.custody || '-') + '</td><td style="' + VAL + ';text-align:center">' + (c.parental || '-') + '</td><td style="' + VAL + '">' + (c.note || '-') + '</td></tr>';
        }).join('')}
      </tbody>
    </table>${SEC_END}

    ${SEC('희망상대')}
    <table class="data-table data-table--bordered data-table--no-outer" style="font-size:14px;table-layout:fixed;width:100%">
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td style="${LBL}">연수입</td><td style="${VAL}">${m.preferIncome || '-'}</td><td style="${LBL}">신장</td><td style="${VAL}">${m.preferHeight || '-'}</td><td style="${LBL}">연령</td><td style="${VAL}">${m.preferAge || '-'}</td><td style="${LBL}">학력</td><td style="${VAL}">${m.preferEdu || '-'}</td></tr>
        <tr><td style="${LBL}">기피종교</td><td style="${VAL}">${m.avoidReligion || '-'}</td><td style="${LBL}">혼인경력</td><td style="${VAL}">${m.preferMarital || '-'}</td><td style="${LBL}">상대자녀</td><td style="${VAL}">${m.acceptChildren || '-'}</td><td style="${LBL}">학력상세</td><td style="${VAL}">${m.preferEduDetail || '-'}</td></tr>
      </tbody>
    </table>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border-top:1px solid var(--border-light)">
      <div style="border-right:1px solid var(--border-light);border-bottom:1px solid var(--border-light)"><div style="${LBL};text-align:center;padding:6px;border-bottom:1px solid var(--border-light)">나의 이상형</div><div style="padding:8px;font-size:12px;line-height:1.6;min-height:55px;color:#1e3a5f">${m.idealType || ''}</div></div>
      <div style="border-right:1px solid var(--border-light);border-bottom:1px solid var(--border-light)"><div style="${LBL};text-align:center;padding:6px;border-bottom:1px solid var(--border-light)">본인의 매력은</div><div style="padding:8px;font-size:12px;line-height:1.6;min-height:55px;color:#1e3a5f">${m.myCharm || ''}</div></div>
      <div style="border-bottom:1px solid var(--border-light)"><div style="${LBL};text-align:center;padding:6px;border-bottom:1px solid var(--border-light)">성격 및 스타일</div><div style="padding:8px;font-size:12px;line-height:1.6;min-height:55px;color:#1e3a5f">${m.personalityStyle || ''}</div></div>
      <div style="border-right:1px solid var(--border-light)"><div style="${LBL};text-align:center;padding:6px;border-bottom:1px solid var(--border-light)">5~10년 후 나의 모습</div><div style="padding:8px;font-size:12px;line-height:1.6;min-height:55px;color:#1e3a5f">${m.futureVision || ''}</div></div>
      <div style="border-right:1px solid var(--border-light)"><div style="${LBL};text-align:center;padding:6px;border-bottom:1px solid var(--border-light)">남들이 얘기하는 본인의 매력</div><div style="padding:8px;font-size:12px;line-height:1.6;min-height:55px;color:#1e3a5f">${m.othersView || ''}</div></div>
      <div><div style="${LBL};text-align:center;padding:6px;border-bottom:1px solid var(--border-light)">특이사항</div><div style="padding:8px;font-size:12px;line-height:1.6;min-height:55px;color:#1e3a5f">${m.extraNote || ''}</div></div>
    </div>
    ${SEC_END}

    <div style="text-align:right;margin-top:16px"><button class="btn btn--primary btn--sm" id="btn-save-extra">추가정보 저장</button></div>
  `;
}
