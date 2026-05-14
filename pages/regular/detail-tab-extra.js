/* 추가정보 탭 렌더링 */
import { Formatters } from '@utils/formatters.js';

const LBL = 'background:var(--bg-secondary);font-weight:600;font-size:12px;color:var(--text-secondary);text-align:center;white-space:nowrap';
const VAL = 'font-size:13px;padding:8px 12px';
const TBL = 'class="data-table data-table--bordered" style="font-size:13px;table-layout:fixed;width:100%"';
const COL8 = '<colgroup><col style="width:10%"><col style="width:15%"><col style="width:10%"><col style="width:15%"><col style="width:10%"><col style="width:15%"><col style="width:10%"><col style="width:15%"></colgroup>';
const SEC = (t) => `<div style="font-size:13px;font-weight:700;color:var(--text-primary);margin:24px 0 12px">${t}</div>`;

export function renderExtraInfo(m) {
  return `
    ${SEC('자산 정보')}
    <table ${TBL}><colgroup><col style="width:12%"><col style="width:38%"><col style="width:12%"><col style="width:38%"></colgroup><tbody>
      <tr><td style="${LBL}">본인재산</td><td style="${VAL}">${m.personalWealth||'-'}</td><td style="${LBL}">가족재산</td><td style="${VAL}">${m.familyWealth||'-'}</td></tr>
      <tr><td style="${LBL}">부동산</td><td style="${VAL}">${m.realEstate||'-'}</td><td style="${LBL}">차량</td><td style="${VAL}">${m.vehicle||'-'}</td></tr>
    </tbody></table>

    ${SEC('가족 구성원')}
    <table class="data-table data-table--bordered" style="font-size:12px">
      <thead><tr><th>관계</th><th>성명</th><th>년생</th><th>직업</th><th>학력</th><th>동거여부</th><th>결혼여부</th><th>거주지</th><th>비고</th></tr></thead>
      <tbody>
        <tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:20px">가족 구성원 정보가 등록되지 않았습니다.<br><button class="btn btn--ghost btn--sm" style="margin-top:8px">+ 가족 추가</button></td></tr>
      </tbody>
    </table>

    ${SEC('희망 상대 조건')}
    <table ${TBL}>${COL8}<tbody>
      <tr><td style="${LBL}">나이</td><td style="${VAL}">${m.preferAge||'-'}</td><td style="${LBL}">키</td><td style="${VAL}">${m.preferHeight||'-'}</td><td style="${LBL}">학력</td><td style="${VAL}">${m.preferEdu||'-'}</td><td style="${LBL}">종교</td><td style="${VAL}">${m.preferReligion||'무관'}</td></tr>
      <tr><td style="${LBL}">직업</td><td style="${VAL}">${m.preferJob||'무관'}</td><td style="${LBL}">지역</td><td style="${VAL}">${m.preferRegion||'무관'}</td><td style="${LBL}">결혼경력</td><td style="${VAL}">${m.preferMarital||'무관'}</td><td style="${LBL}">기타</td><td style="${VAL}">${m.preferEtc||'-'}</td></tr>
    </tbody></table>

    ${SEC('성격 및 스타일 / 가치관')}
    <table ${TBL}>${COL8}<tbody>
      <tr><td style="${LBL}">성격</td><td style="${VAL}">${m.personality||'-'}</td><td style="${LBL}">스타일</td><td style="${VAL}">${m.style||'-'}</td><td style="${LBL}">취미</td><td style="${VAL}">${m.hobby||'-'}</td><td style="${LBL}">특기</td><td style="${VAL}">${m.specialty||'-'}</td></tr>
      <tr><td style="${LBL}">관심사</td><td style="${VAL}">${m.interest||'-'}</td><td style="${LBL}">좋아하는 음식</td><td style="${VAL}">${m.favoriteFood||'-'}</td><td style="${LBL}">반려동물</td><td style="${VAL}">${m.pet||'없음'}</td><td style="${LBL}">운동</td><td style="${VAL}">${m.exercise||'-'}</td></tr>
    </tbody></table>
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">본인 매력 어필</div>
      <textarea class="form-input" rows="4" style="resize:vertical;font-size:13px;width:100%" placeholder="본인 매력 어필...">${m.selfAppeal||''}</textarea>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">10년 후 모습</div>
      <textarea class="form-input" rows="4" style="resize:vertical;font-size:13px;width:100%" placeholder="10년 후 모습...">${m.futureVision||''}</textarea>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">결혼관 / 가치관</div>
      <textarea class="form-input" rows="4" style="resize:vertical;font-size:13px;width:100%" placeholder="결혼에 대한 가치관...">${m.marriageValues||''}</textarea>
    </div>
    <div style="text-align:right;margin-top:12px"><button class="btn btn--primary btn--sm" id="btn-save-extra">추가정보 저장</button></div>
  `;
}
