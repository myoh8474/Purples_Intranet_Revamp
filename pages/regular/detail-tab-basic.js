/* 기본정보 탭 렌더링 — 구성안 기반 (좌: 계약관리+자산정보+직업 / 우: 특이사항) */
import { Formatters } from '@utils/formatters.js';

const LBL = 'background:var(--bg-secondary);font-weight:600;font-size:14px;color:#888;text-align:center;white-space:nowrap;padding:6px 8px';
const VAL = 'font-size:14px;padding:6px 10px;color:#1e3a5f';
const TBL = 'class="data-table data-table--bordered data-table--no-outer" style="font-size:14px;table-layout:fixed;width:100%"';
const SEC = (t) => `<div style="margin-bottom:12px;background:#fff;border:1px solid var(--border-light);overflow:hidden"><div style="padding:10px 14px;border-bottom:1px solid #cbd5e1;font-weight:800;font-size:14px;color:#1e293b">${t}</div><div style="padding:0">`;
const SEC_END = '</div></div>';

export function renderBasicInfo(m) {
  var ctLabel = m.contractType === '횟수제' && m.contractCount ? m.contractType + '(' + m.contractCount + '회)' : (m.contractType || '-');

  // 전화번호 포맷
  function fmtPhone(p) {
    if (!p) return '-';
    var n = p.replace(/[^0-9]/g, '');
    if (n.length === 11) return n.substring(0,3) + '-' + n.substring(3,7) + '-' + n.substring(7);
    if (n.length === 10) return n.substring(0,3) + '-' + n.substring(3,6) + '-' + n.substring(6);
    return p;
  }

  // ── 좌측: 연락처/주소 + 계약관리 + 자산정보 + 직업 + 학력 ──
  var leftHtml = ''
    // 연락처/주소
    + SEC('연락처 / 주소')
    + `<table class="data-table data-table--bordered data-table--no-outer" style="font-size:14px;width:100%">
      <tbody>
        <tr><td style="${LBL}">직장주소</td><td style="${VAL}" colspan="3">${m.workAddress || '-'}</td></tr>
        <tr><td style="${LBL}">호적주소</td><td style="${VAL}" colspan="3">${m.registerAddress || m.hometown || '-'}</td></tr>
        <tr><td style="${LBL}">본인핸드폰</td><td style="${VAL}">${fmtPhone(m.phone)}</td><td style="${LBL}">자택전화</td><td style="${VAL}">${m.homePhone ? fmtPhone(m.homePhone) : '-'}</td></tr>
        <tr><td style="${LBL}">기타연락처</td><td style="${VAL}">${m.subPhone ? fmtPhone(m.subPhone) : '-'}</td><td style="${LBL}">직장전화</td><td style="${VAL}">${m.workPhone ? fmtPhone(m.workPhone) : '-'}</td></tr>
      </tbody>
    </table>` + SEC_END
    // 계약관리
    + SEC('계약관리')
    + `<table ${TBL}>
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td style="${LBL}">프로그램</td><td style="${VAL};cursor:pointer" data-history="프로그램" title="클릭하여 프로그램 변경이력 보기"><span style="color:#2563eb;text-decoration:underline">${m.program || '-'}</span></td><td style="${LBL}">가입일</td><td style="${VAL}">${Formatters.date(m.joinDate)}</td><td style="${LBL}">가입횟수</td><td style="${VAL};cursor:pointer" data-history="가입횟수" title="클릭하여 가입이력 보기"><span style="color:#2563eb;text-decoration:underline">${(m.rejoinCount || 1) + '가입'}</span></td><td style="${LBL}">재가입비</td><td style="${VAL}">${m.rejoinFee ? Formatters.money(m.rejoinFee) : '-'}</td></tr>
        <tr><td style="${LBL}">가입비</td><td style="${VAL}">${Formatters.money(m.programFee || 0)}</td><td style="${LBL}">성혼비</td><td style="${VAL}">${Formatters.money(m.marriageFee || 0)}</td><td style="${LBL}">계약형태</td><td style="${VAL}">${ctLabel}</td><td style="${LBL}">만료일</td><td style="${VAL};cursor:pointer" data-history="만료일" title="클릭하여 만료일 변경이력 보기"><span style="color:#2563eb;text-decoration:underline">${m.expiryDate ? Formatters.date(m.expiryDate) : '-'}</span></td></tr>
        <tr><td style="${LBL}">미팅횟수</td><td style="${VAL};cursor:pointer" data-history="미팅횟수" title="클릭하여 미팅횟수 변경이력 보기"><span style="color:#2563eb;text-decoration:underline">${m.meetingCount != null ? m.meetingCount + '회' : '-'}</span></td><td style="${LBL}">남은기간</td><td style="${VAL}">${m.expiryDate ? (() => { var d = Math.ceil((new Date(m.expiryDate) - new Date()) / 86400000); return d > 0 ? d + '일' : '만료'; })() : '-'}</td><td style="${LBL}">업그레이드</td><td style="${VAL}">${m.upgrade || '-'}</td><td style="${LBL}">결제방법</td><td style="${VAL}">${m.payMethod || '-'}</td></tr>
        <tr><td style="${LBL}">무이자</td><td style="${VAL}">${m.interestFree || '-'}</td><td style="${LBL}">할인율</td><td style="${VAL}">${m.discountRate || '-'}</td><td style="${LBL}"></td><td style="${VAL}"></td><td style="${LBL}"></td><td style="${VAL}"></td></tr>
      </tbody>
    </table>` + SEC_END

    // 자산정보
    + SEC('자산정보')
    + `<table class="data-table data-table--bordered data-table--no-outer" style="font-size:14px;table-layout:fixed;width:100%">
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:25%"><col style="width:12%"><col style="width:13%"><col style="width:25%"></colgroup>
      <tbody>
        <tr>
          <td style="${LBL};border-bottom:none" rowspan="4">본인재산</td>
          <td style="${LBL}">금융</td><td style="${VAL}">${m.selfFinance || '-'}</td>
          <td style="${LBL};border-bottom:none" rowspan="4">가족재산</td>
          <td style="${LBL}">금융</td><td style="${VAL}">${m.familyFinance || '-'}</td>
        </tr>
        <tr>
          <td style="${LBL}">부동산</td><td style="${VAL}">${m.selfRealEstate || m.realEstate || '-'}</td>
          <td style="${LBL}">부동산</td><td style="${VAL}">${m.familyRealEstate || '-'}</td>
        </tr>
        <tr>
          <td style="${LBL}">기타</td><td style="${VAL}">${m.selfOtherAsset || '-'}</td>
          <td style="${LBL}">기타</td><td style="${VAL}">${m.familyOtherAsset || '-'}</td>
        </tr>
        <tr>
          <td style="${LBL}">총</td><td style="${VAL};font-weight:700">${m.personalWealth || '-'}</td>
          <td style="${LBL}">총</td><td style="${VAL};font-weight:700">${m.familyWealth || '-'}</td>
        </tr>
      </tbody>
    </table>` + SEC_END

    // 직업
    + SEC('직업')
    + `<table ${TBL}>
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td style="${LBL}">직장명</td><td style="${VAL}">${m.company || '-'}</td><td style="${LBL}">업종</td><td style="${VAL}">${m.industry || '-'}</td><td style="${LBL}">직원수</td><td style="${VAL}">${m.employees || '-'}</td><td style="${LBL}">부서</td><td style="${VAL}">${m.department || '-'}</td></tr>
        <tr><td style="${LBL}">직위</td><td style="${VAL}">${m.position || '-'}</td><td style="${LBL}">입사년도</td><td style="${VAL}">${m.joinCompanyYear || '-'}</td><td style="${LBL}">담당업무</td><td style="${VAL}">${m.duty || '-'}</td><td style="${LBL}">연수입</td><td style="${VAL}">${m.income || '-'}</td></tr>
        <tr><td style="${LBL}">담당업무</td><td style="${VAL}">${m.subDuty || '-'}</td><td style="${LBL}"></td><td style="${VAL}"></td><td style="${LBL}">기업형태</td><td style="${VAL}">${m.companyType || '-'}</td><td style="${LBL}">기타수입</td><td style="${VAL}">${m.otherIncome || '-'}</td></tr>
        <tr><td style="${LBL}">업무설명</td><td style="${VAL}" colspan="3">${m.businessField || '-'}</td><td style="${LBL}">재직증명서</td><td style="${VAL}" colspan="3">${m.employmentCert || '-'}</td></tr>
      </tbody>
    </table>` + SEC_END

    // 학력
    + SEC('학력')
    + `<table ${TBL}>
      <colgroup><col style="width:10%"><col style="width:20%"><col style="width:15%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:10%"><col style="width:9%"></colgroup>
      <thead><tr>
        <th style="${LBL}">학력</th><th style="${LBL}">학교명</th><th style="${LBL}">전공</th><th style="${LBL}">입학년도</th><th style="${LBL}">졸업년도</th><th style="${LBL}">졸업여부</th><th style="${LBL}">소재지</th><th style="${LBL}">관리</th>
      </tr></thead>
      <tbody>
        ${(m.educationList || [
          { level: '고등학교', school: m.school || '-', major: '-', enterYear: '-', gradYear: '-', graduated: '졸업', location: '-' },
          { level: '대학교', school: m.university || '-', major: m.major || '-', enterYear: '-', gradYear: '-', graduated: '졸업', location: '-' }
        ]).map(function(e, i) {
          return '<tr><td style="' + VAL + ';text-align:center">' + (e.level || '-') + '</td><td style="' + VAL + '">' + (e.school || '-') + '</td><td style="' + VAL + '">' + (e.major || '-') + '</td><td style="' + VAL + ';text-align:center">' + (e.enterYear || '-') + '</td><td style="' + VAL + ';text-align:center">' + (e.gradYear || '-') + '</td><td style="' + VAL + ';text-align:center">' + (e.graduated || '-') + '</td><td style="' + VAL + ';text-align:center">' + (e.location || '-') + '</td><td style="text-align:center;padding:4px"><button class="btn btn--ghost btn--sm edu-del-btn" style="font-size:10px;padding:1px 4px;color:var(--status-red)">삭제</button></td></tr>';
        }).join('')}
    </table>` + SEC_END

    // 결혼경력
    + SEC('결혼경력')
    + `<table ${TBL}>
      <colgroup><col style="width:10%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:10%"><col style="width:32%"></colgroup>
      <thead><tr>
        <th style="${LBL}">구분</th><th style="${LBL}">결혼년도</th><th style="${LBL}">이혼년도</th><th style="${LBL}">결혼기간</th><th style="${LBL}">자녀양육</th><th style="${LBL}">자녀</th><th style="${LBL}">사유</th>
      </tr></thead>
      <tbody>
        ${(m.marriageList || [
          { type: '-', marriedYear: '-', divorceYear: '-', duration: '-', childCare: '-', children: '-', reason: '-' }
        ]).map(function(mr) {
          return '<tr><td style="' + VAL + ';text-align:center">' + (mr.type || '-') + '</td><td style="' + VAL + ';text-align:center">' + (mr.marriedYear || '-') + '</td><td style="' + VAL + ';text-align:center">' + (mr.divorceYear || '-') + '</td><td style="' + VAL + ';text-align:center">' + (mr.duration || '-') + '</td><td style="' + VAL + ';text-align:center">' + (mr.childCare || '-') + '</td><td style="' + VAL + ';text-align:center">' + (mr.children || '-') + '</td><td style="' + VAL + '">' + (mr.reason || '-') + '</td></tr>';
        }).join('')}
      </tbody>
    </table>` + SEC_END;


  // ── 우측: 특이사항 + 소개프로필 ──
  var specialNotes = m.specialNotes || [
    { no: 1, date: '26.05.06', writer: '이다슨', type: '관리', content: '강서구 한잉디블렌1101호 본인소유' },
    { no: 2, date: '26.05.06', writer: '이다슨', type: '상담', content: '상담 진행 완료' },
  ];

  var rightHtml = ''
    // 특이사항 카드
    + `<div style="margin-bottom:12px;background:#fff;border:1px solid var(--border-light);overflow:hidden">`
    + `<div style="padding:10px 14px;border-bottom:1px solid #cbd5e1;display:flex;align-items:center;justify-content:space-between">`
    + `<span style="font-weight:800;font-size:14px;color:#1e293b">특이사항</span>`
    + `<button class="btn btn--outline btn--sm" id="btn-add-special-note" style="font-size:11px;padding:2px 10px">등록</button>`
    + `</div><div>`
    + `<table class="data-table data-table--bordered data-table--no-outer" style="font-size:14px;table-layout:fixed;width:100%">
        <colgroup><col style="width:10%"><col style="width:18%"><col style="width:14%"><col style="width:58%"></colgroup>
        <thead><tr>
            <th style="padding:6px 4px;text-align:center;vertical-align:middle">번호</th>
            <th style="padding:6px 4px;text-align:center;vertical-align:middle">작성자</th>
            <th style="padding:6px 4px;text-align:center;vertical-align:middle">구분</th>
            <th style="padding:6px 4px;text-align:center;vertical-align:middle">내용</th>
        </tr></thead><tbody>`
    + specialNotes.map(function(n, i) {
      var isImp = n.important;
      return '<tr style="' + (isImp ? 'background:#fef2f2;' : '') + '"><td style="text-align:center;vertical-align:middle">' + (i+1) + '</td><td style="text-align:center;vertical-align:middle">' + (n.writer||'-') + '</td><td style="text-align:center;vertical-align:middle;font-weight:600;color:' + (n.type==='관리'?'#3b82f6':n.type==='상담'?'#10b981':n.type==='매칭'?'#f59e0b':'inherit') + '">' + (n.type||'-') + '</td><td style="line-height:1.5;vertical-align:middle">' + (n.content||'-') + (n.date ? ' <span style="color:#aaa;font-size:11px">' + n.date + '</span>' : '') + '</td></tr>';
    }).join('')
    + `</tbody></table></div></div>`
    // 소개프로필 카드
    + `<div style="background:#fff;border:1px solid var(--border-light);overflow:hidden">`
    + `<div style="padding:10px 14px;border-bottom:1px solid #cbd5e1;display:flex;align-items:center;justify-content:space-between">`
    + `<span style="font-weight:800;font-size:14px;color:#1e293b">소개프로필</span>`
    + `<button class="btn btn--outline btn--sm" id="btn-edit-intro" style="font-size:11px;padding:2px 10px">${m.introProfile ? '수정' : '등록'}</button>`
    + `</div>`
    + `<div style="padding:12px;font-size:12px;line-height:1.8;min-height:120px">`
    + (m.introProfile || '<span style="color:var(--text-muted)">등록된 소개 프로필이 없습니다.</span>')
    + `</div></div>`;

  return `<div style="display:grid;grid-template-columns:3fr 2fr;gap:16px;align-items:start">
    <div>${leftHtml}</div>
    <div>${rightHtml}</div>
  </div>`;
}
