/* 추가정보 탭 렌더링 */
import { Formatters } from '@utils/formatters.js';

const LBL = 'lbl';
const VAL = 'val';
const TBL = 'class="data-table data-table--bordered data-table--no-outer dtbl"';
const SEC = (t) => `<div class="sec"><div class="sec__header">${t}</div><div class="sec__body">`;
const SEC_END = '</div></div>';

export function renderExtraInfo(m) {
  return `
    ${SEC('신상정보')}
    <table ${TBL}>
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td class="${LBL}">시력</td><td class="${VAL}">${m.eyesight||'-'}</td><td class="${LBL}">안경</td><td class="${VAL}">${m.glasses||'-'}</td><td class="${LBL}">혈액형</td><td class="${VAL}">${m.bloodType||'-'}</td><td class="${LBL}">건강상태</td><td class="${VAL}">${m.healthStatus||'-'}</td></tr>
        <tr><td class="${LBL}">청력</td><td class="${VAL}">${m.hearing||'-'}</td><td class="${LBL}">언어</td><td class="${VAL}">${m.language||'-'}</td><td class="${LBL}">얼굴형</td><td class="${VAL}">${m.faceType||'-'}</td><td class="${LBL}">범죄이력</td><td class="${VAL}">${m.criminalRecord||'-'}</td></tr>
        <tr><td class="${LBL}">음주</td><td class="${VAL}">${m.drinking||'-'}</td><td class="${LBL}">흡연</td><td class="${VAL}">${m.smoking||'-'}</td><td class="${LBL}">신장</td><td class="${VAL}">${m.height ? m.height+'cm' : '-'}</td><td class="${LBL}">체중</td><td class="${VAL}">${m.weight ? m.weight+'kg' : '-'}</td></tr>
        <tr><td class="${LBL}">병역</td><td class="${VAL}">${m.military||'-'}</td><td class="${LBL}">종교</td><td class="${VAL}">${m.religion||'-'}</td><td class="${LBL}">본인신앙</td><td class="${VAL}">${m.ownFaith||'-'}</td><td class="${LBL}">부모신앙</td><td class="${VAL}">${m.parentFaith||'-'}</td></tr>
        <tr><td class="${LBL}">동성동본</td><td class="${VAL}">${m.sameClan||'-'}</td><td class="${LBL}">미팅사유</td><td class="${VAL}">${m.meetingReason||'-'}</td><td class="${LBL}">특기</td><td class="${VAL}">${m.specialty||'-'}</td><td class="${LBL}">보유면허증</td><td class="${VAL}">${m.license||'-'}</td></tr>
      </tbody>
    </table>${SEC_END}

    <div class="sec">
    <div class="sec__header sec__header--flex">
      <span class="mcard__title">가족관계</span>
      <span style="font-size:12px;color:var(--text-muted)">${m.familySummary || ''}</span>
    </div><div class="sec__body">
    <table ${TBL}>
      <colgroup><col style="width:8%"><col style="width:10%"><col style="width:12%"><col style="width:10%"><col style="width:14%"><col style="width:8%"><col style="width:8%"><col style="width:14%"><col style="width:16%"></colgroup>
      <thead><tr>
        <th class="${LBL}">관계</th><th class="${LBL}">성명</th><th class="${LBL}">생년월일</th><th class="${LBL}">학력</th><th class="${LBL}">직업</th><th class="${LBL}">동거</th><th class="${LBL}">결혼</th><th class="${LBL}">거주지</th><th class="${LBL}">비고</th>
      </tr></thead>
      <tbody>
        ${(m.familyList || [
          { relation: '부', name: '-', birth: '-', edu: '-', job: '-', cohabit: '-', married: '-', residence: '-', note: '' },
          { relation: '모', name: '-', birth: '-', edu: '-', job: '-', cohabit: '-', married: '-', residence: '-', note: '' }
        ]).map(function(f) {
          return '<tr><td class="' + VAL + '" style="text-align:center">' + (f.relation || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (f.name || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (f.birth || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (f.edu || '-') + '</td><td class="' + VAL + '">' + (f.job || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (f.cohabit || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (f.married || '-') + '</td><td class="' + VAL + '">' + (f.residence || '-') + '</td><td class="' + VAL + '">' + (f.note || '-') + '</td></tr>';
        }).join('')}
      </tbody>
    </table></div></div>

    ${SEC('자녀정보')}
    <table ${TBL}>
      <colgroup><col style="width:7%"><col style="width:8%"><col style="width:10%"><col style="width:8%"><col style="width:10%"><col style="width:7%"><col style="width:7%"><col style="width:10%"><col style="width:8%"><col style="width:8%"><col style="width:17%"></colgroup>
      <thead><tr>
        <th class="${LBL}">관계</th><th class="${LBL}">성명</th><th class="${LBL}">생년월일</th><th class="${LBL}">학력</th><th class="${LBL}">직업</th><th class="${LBL}">동거</th><th class="${LBL}">결혼</th><th class="${LBL}">거주지</th><th class="${LBL}">양육권</th><th class="${LBL}">친권</th><th class="${LBL}">비고</th>
      </tr></thead>
      <tbody>
        ${(m.childrenList || [
          { relation: '-', name: '-', birth: '-', edu: '-', job: '-', cohabit: '-', married: '-', residence: '-', custody: '-', parental: '-', note: '' }
        ]).map(function(c) {
          return '<tr><td class="' + VAL + '" style="text-align:center">' + (c.relation || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (c.name || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (c.birth || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (c.edu || '-') + '</td><td class="' + VAL + '">' + (c.job || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (c.cohabit || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (c.married || '-') + '</td><td class="' + VAL + '">' + (c.residence || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (c.custody || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (c.parental || '-') + '</td><td class="' + VAL + '">' + (c.note || '-') + '</td></tr>';
        }).join('')}
      </tbody>
    </table>${SEC_END}

    ${SEC('희망상대')}
    <table class="data-table data-table--bordered data-table--no-outer dtbl">
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td class="${LBL}">연수입</td><td class="${VAL}">${m.preferIncome || '-'}</td><td class="${LBL}">신장</td><td class="${VAL}">${m.preferHeight || '-'}</td><td class="${LBL}">연령</td><td class="${VAL}">${m.preferAge || '-'}</td><td class="${LBL}">학력</td><td class="${VAL}">${m.preferEdu || '-'}</td></tr>
        <tr><td class="${LBL}">기피종교</td><td class="${VAL}">${m.avoidReligion || '-'}</td><td class="${LBL}">혼인경력</td><td class="${VAL}">${m.preferMarital || '-'}</td><td class="${LBL}">상대자녀</td><td class="${VAL}">${m.acceptChildren || '-'}</td><td class="${LBL}">학력상세</td><td class="${VAL}">${m.preferEduDetail || '-'}</td></tr>
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


  `;
}
