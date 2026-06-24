/* 추가정보 탭 렌더링 — 신상정보/가족관계/자녀정보/희망상대는 기본정보 탭으로 이동됨 */
import { Formatters } from '@utils/formatters.js';

const LBL = 'lbl';
const VAL = 'val';
const TBL = 'class="data-table data-table--bordered data-table--no-outer dtbl"';
const SEC = (t) => `<div class="sec"><div class="sec__header">${t}</div><div class="sec__body">`;
const SEC_END = '</div></div>';

export function renderExtraInfo(m) {
  return `
    <div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">
      추가정보 항목이 기본정보 탭으로 통합되었습니다.
    </div>
  `;
}
