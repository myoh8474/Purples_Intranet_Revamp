/* 기본정보 탭 렌더링 — 구성안 기반 (좌: 계약관리+자산정보+직업 / 우: 특이사항) */
import { Formatters } from '@utils/formatters.js';

const LBL = 'lbl';
const VAL = 'val';
const TBL = 'class="data-table data-table--bordered data-table--no-outer dtbl"';
const SEC = (t) => `<div class="sec"><div class="sec__header">${t}</div><div class="sec__body">`;
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
    + `<table class="data-table data-table--bordered data-table--no-outer dtbl">
      <tbody>
        <tr><td class="${LBL}">직장주소</td><td class="${VAL}" colspan="3">${m.workAddress || '-'}</td></tr>
        <tr><td class="${LBL}">호적주소</td><td class="${VAL}" colspan="3">${m.registerAddress || m.hometown || '-'}</td></tr>
        <tr><td class="${LBL}">본인핸드폰</td><td class="${VAL}">${fmtPhone(m.phone)}</td><td class="${LBL}">자택전화</td><td class="${VAL}">${m.homePhone ? fmtPhone(m.homePhone) : '-'}</td></tr>
        <tr><td class="${LBL}">기타연락처</td><td class="${VAL}">${m.subPhone ? fmtPhone(m.subPhone) : '-'}</td><td class="${LBL}">직장전화</td><td class="${VAL}">${m.workPhone ? fmtPhone(m.workPhone) : '-'}</td></tr>
        <tr><td class="${LBL}">통화희망자</td><td class="${VAL}">${m.callTarget || '본인'}</td><td class="${LBL}">소통방법</td><td class="${VAL}">${m.contactMethod || '문자+통화'}</td></tr>
      </tbody>
    </table>` + SEC_END
    // 계약관리
    + `<div class="sec"><div class="sec__header sec__header--flex">계약관리<div style="display:flex;gap:6px"><button class="btn btn--ghost btn--sm" id="btn-contract-view" style="font-size:11px;padding:3px 10px;border:1px solid #333;color:#333">계약서확인</button></div></div><div class="sec__body">`
    + `<table ${TBL}>
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td class="${LBL}">프로그램</td><td class="${VAL}" data-history="프로그램">${m.program || '-'}</td><td class="${LBL}">가입일</td><td class="${VAL}">${Formatters.date(m.joinDate)}</td><td class="${LBL}">가입횟수</td><td class="${VAL}" data-history="가입횟수">${(m.rejoinCount || 1) + '가입'}</td><td class="${LBL}">재가입비</td><td class="${VAL}">${m.rejoinFee ? Formatters.money(m.rejoinFee) : '-'}</td></tr>
        <tr><td class="${LBL}">가입비</td><td class="${VAL}">${Formatters.money(m.programFee || 0)}</td><td class="${LBL}">성혼비</td><td class="${VAL}">${Formatters.money(m.marriageFee || 0)}</td><td class="${LBL}">계약형태</td><td class="${VAL}">${ctLabel}</td><td class="${LBL}">만료일</td><td class="${VAL}" data-history="만료일">${m.expiryDate ? Formatters.date(m.expiryDate) : '-'}</td></tr>
        <tr><td class="${LBL}">미팅횟수</td><td class="${VAL}" data-history="미팅횟수">${m.meetingCount != null ? m.meetingCount + '회' : '-'}</td><td class="${LBL}">남은기간</td><td class="${VAL}">${m.expiryDate ? (() => { var d = Math.ceil((new Date(m.expiryDate) - new Date()) / 86400000); return d > 0 ? d + '일' : '만료'; })() : '-'}</td><td class="${LBL}">업그레이드</td><td class="${VAL}">${m.upgrade || '-'}</td><td class="${LBL}">결제방법</td><td class="${VAL}">${m.payMethod || '-'}</td></tr>
        <tr><td class="${LBL}">무이자</td><td class="${VAL}">${m.interestFree || '-'}</td><td class="${LBL}">할인율</td><td class="${VAL}">${m.discountRate || '-'}</td><td class="${LBL}"></td><td class="${VAL}"></td><td class="${LBL}"></td><td class="${VAL}"></td></tr>
      </tbody>
    </table>` + SEC_END

    // 자산정보
    + SEC('자산정보')
    + `<table class="data-table data-table--bordered data-table--no-outer dtbl">
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:25%"><col style="width:12%"><col style="width:13%"><col style="width:25%"></colgroup>
      <tbody>
        <tr>
          <td class="${LBL}" style="border-bottom:none" rowspan="4">본인재산</td>
          <td class="${LBL}">금융</td><td class="${VAL}">${m.selfFinance || '-'}</td>
          <td class="${LBL}" style="border-bottom:none" rowspan="4">가족재산</td>
          <td class="${LBL}">금융</td><td class="${VAL}">${m.familyFinance || '-'}</td>
        </tr>
        <tr>
          <td class="${LBL}">부동산</td><td class="${VAL}">${m.selfRealEstate || m.realEstate || '-'}</td>
          <td class="${LBL}">부동산</td><td class="${VAL}">${m.familyRealEstate || '-'}</td>
        </tr>
        <tr>
          <td class="${LBL}">기타</td><td class="${VAL}">${m.selfOtherAsset || '-'}</td>
          <td class="${LBL}">기타</td><td class="${VAL}">${m.familyOtherAsset || '-'}</td>
        </tr>
        <tr>
          <td class="${LBL}">총</td><td class="${VAL}" style="font-weight:700">${m.personalWealth || '-'}</td>
          <td class="${LBL}">총</td><td class="${VAL}" style="font-weight:700">${m.familyWealth || '-'}</td>
        </tr>
      </tbody>
    </table>` + SEC_END

    // 직업
    + SEC('직업')
    + `<table ${TBL}>
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td class="${LBL}">직장명</td><td class="${VAL}">${m.company || '-'}</td><td class="${LBL}">업종</td><td class="${VAL}">${m.industry || '-'}</td><td class="${LBL}">직원수</td><td class="${VAL}">${m.employees || '-'}</td><td class="${LBL}">부서</td><td class="${VAL}">${m.department || '-'}</td></tr>
        <tr><td class="${LBL}">직위</td><td class="${VAL}">${m.position || '-'}</td><td class="${LBL}">입사년도</td><td class="${VAL}">${m.joinCompanyYear || '-'}</td><td class="${LBL}">담당업무</td><td class="${VAL}">${m.duty || '-'}</td><td class="${LBL}">연수입</td><td class="${VAL}">${m.income || '-'}</td></tr>
        <tr><td class="${LBL}">담당업무</td><td class="${VAL}">${m.subDuty || '-'}</td><td class="${LBL}"></td><td class="${VAL}"></td><td class="${LBL}">기업형태</td><td class="${VAL}">${m.companyType || '-'}</td><td class="${LBL}">기타수입</td><td class="${VAL}">${m.otherIncome || '-'}</td></tr>
        <tr><td class="${LBL}">업무설명</td><td class="${VAL}" colspan="3">${m.businessField || '-'}</td><td class="${LBL}">재직증명서</td><td class="${VAL}" colspan="3">${m.employmentCert || '-'}</td></tr>
      </tbody>
    </table>` + SEC_END

    // 학력
    + SEC('학력')
    + `<table ${TBL}>
      <colgroup><col style="width:10%"><col style="width:22%"><col style="width:18%"><col style="width:13%"><col style="width:13%"><col style="width:12%"><col style="width:12%"></colgroup>
      <thead><tr>
        <th class="${LBL}">학력</th><th class="${LBL}">학교명</th><th class="${LBL}">전공</th><th class="${LBL}">입학년도</th><th class="${LBL}">졸업년도</th><th class="${LBL}">졸업여부</th><th class="${LBL}">소재지</th>
      </tr></thead>
      <tbody>
        ${(m.educationList || [
          { level: '고등학교', school: m.school || '-', major: '-', enterYear: '-', gradYear: '-', graduated: '졸업', location: '-' },
          { level: '대학교', school: m.university || '-', major: m.major || '-', enterYear: '-', gradYear: '-', graduated: '졸업', location: '-' }
        ]).map(function(e, i) {
          return '<tr><td class="' + VAL + '" style="text-align:center">' + (e.level || '-') + '</td><td class="' + VAL + '">' + (e.school || '-') + '</td><td class="' + VAL + '">' + (e.major || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (e.enterYear || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (e.gradYear || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (e.graduated || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (e.location || '-') + '</td></tr>';
        }).join('')}
    </table>` + SEC_END

    // 결혼경력
    + SEC('결혼경력')
    + `<table ${TBL}>
      <colgroup><col style="width:10%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:10%"><col style="width:32%"></colgroup>
      <thead><tr>
        <th class="${LBL}">구분</th><th class="${LBL}">결혼년도</th><th class="${LBL}">이혼년도</th><th class="${LBL}">결혼기간</th><th class="${LBL}">자녀양육</th><th class="${LBL}">자녀</th><th class="${LBL}">사유</th>
      </tr></thead>
      <tbody>
        ${(m.marriageList || [
          { type: '-', marriedYear: '-', divorceYear: '-', duration: '-', childCare: '-', children: '-', reason: '-' }
        ]).map(function(mr) {
          return '<tr><td class="' + VAL + '" style="text-align:center">' + (mr.type || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (mr.marriedYear || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (mr.divorceYear || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (mr.duration || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (mr.childCare || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (mr.children || '-') + '</td><td class="' + VAL + '">' + (mr.reason || '-') + '</td></tr>';
        }).join('')}
      </tbody>
    </table>` + SEC_END

    // 서류인증
    + `<div class="sec"><div class="sec__header sec__header--flex">서류인증<button class="btn btn--primary btn--sm" id="btn-add-doc" style="font-size:11px;padding:2px 10px">서류등록</button></div><div class="sec__body">`
    + `<table ${TBL}>
      <colgroup><col style="width:15%"><col style="width:20%"><col style="width:15%"><col style="width:15%"><col style="width:15%"><col style="width:20%"></colgroup>
      <thead><tr>
        <th class="${LBL}">서류명</th><th class="${LBL}">인증상태</th><th class="${LBL}">제출일</th><th class="${LBL}">만료일</th><th class="${LBL}">재인증</th><th class="${LBL}">비고</th>
      </tr></thead>
      <tbody>
        ${(m.docList || [
          { name: '신분증', status: '인증완료', submitDate: '2025-04-17', expiryDate: '-', reauth: '-', note: '-' },
          { name: '졸업증명서', status: '인증완료', submitDate: '2025-04-17', expiryDate: '-', reauth: '-', note: '-' },
          { name: '재직증명서', status: '인증완료', submitDate: '2025-04-20', expiryDate: '2026-04-20', reauth: '필요', note: '1년 갱신' },
          { name: '혼인관계증명서', status: '미제출', submitDate: '-', expiryDate: '-', reauth: '-', note: '-' },
        ]).map(function(d) {
          var stColor = d.status === '인증완료' ? '#10b981' : d.status === '미제출' ? '#ef4444' : '#f59e0b';
          var reauthColor = d.reauth === '필요' ? '#ef4444' : 'inherit';
          return '<tr><td class="' + VAL + '" style="text-align:center">' + d.name + '</td><td class="' + VAL + '" style="text-align:center;color:' + stColor + ';font-weight:600">' + d.status + '</td><td class="' + VAL + '" style="text-align:center">' + (d.submitDate || '-') + '</td><td class="' + VAL + '" style="text-align:center">' + (d.expiryDate || '-') + '</td><td class="' + VAL + '" style="text-align:center;color:' + reauthColor + ';font-weight:600">' + (d.reauth || '-') + '</td><td class="' + VAL + '">' + (d.note || '-') + '</td></tr>';
        }).join('')}
      </tbody>
    </table>` + SEC_END;


  // ── 우측: 특이사항 + 소개프로필 ──
  var specialNotes = m.specialNotes || [
    { no: 1, date: '26.05.06', rawDate: '2026-05-06', writer: '이다슨', type: '관리', content: '강서구 한잉디블렌1101호 본인소유' },
    { no: 2, date: '26.05.06', rawDate: '2026-05-06', writer: '이다슨', type: '상담', content: '상담 진행 완료' },
    { no: 3, date: '26.04.20', rawDate: '2026-04-20', writer: '오영수', type: '매칭', content: '정씨 성을 가진분 기피 (전배우자)' },
    { no: 4, date: '26.04.15', rawDate: '2026-04-15', writer: '김지현', type: '관리', content: '어머니 통화 - 아들 진행상황 문의' },
  ];

  var rightHtml = ''
    // 특이사항 카드
    + '<div class="sec" style="margin-bottom:12px">'
    + '<div class="sec__header sec__header--flex">'
    + '<span class="mcard__title">특이사항</span>'
    + '<button class="btn btn--outline btn--sm" id="btn-add-special-note-basic" style="font-size:11px;padding:2px 10px">등록</button>'
    + '</div>'
    + '<div class="mcard__filter" style="display:flex;gap:6px;align-items:center;padding:6px 10px;border-bottom:1px solid var(--border-light)">'
    + '<select class="form-input" id="sn-basic-filter" style="padding:3px 6px;width:100px;font-size:12px">'
    + '<option value="전체">구분: 전체</option><option value="관리">관리</option><option value="상담">상담</option><option value="매칭">매칭</option>'
    + '</select></div>'
    + '<div>'
    + '<table class="data-table data-table--bordered data-table--no-outer dtbl" id="tbl-sn-basic">'
    + '<colgroup><col style="width:8%"><col style="width:14%"><col style="width:10%"><col style="width:16%"><col style="width:52%"></colgroup>'
    + '<thead><tr>'
    + '<th style="padding:6px 4px;text-align:center;vertical-align:middle">번호</th>'
    + '<th style="padding:6px 4px;text-align:center;vertical-align:middle">작성자</th>'
    + '<th style="padding:6px 4px;text-align:center;vertical-align:middle">구분</th>'
    + '<th style="padding:6px 4px;text-align:center;vertical-align:middle">일시</th>'
    + '<th style="padding:6px 4px;text-align:center;vertical-align:middle">내용</th>'
    + '</tr></thead><tbody>'
    + specialNotes.map(function(n, i) {
      var typeColor = n.type === '관리' ? '#3b82f6' : n.type === '상담' ? '#10b981' : n.type === '매칭' ? '#f59e0b' : 'inherit';
      return '<tr class="sn-basic-row" data-sn-type="' + (n.type || '') + '">'
        + '<td style="text-align:center;vertical-align:middle">' + (i+1) + '</td>'
        + '<td style="text-align:center;vertical-align:middle">' + (n.writer||'-') + '</td>'
        + '<td style="text-align:center;vertical-align:middle;font-weight:600;color:' + typeColor + '">' + (n.type||'-') + '</td>'
        + '<td style="text-align:center;vertical-align:middle;white-space:nowrap;font-size:12px;color:#666">' + (n.date||'-') + '</td>'
        + '<td style="line-height:1.5;vertical-align:middle">' + (n.content||'-') + '</td>'
        + '</tr>';
    }).join('')
    + '</tbody></table></div></div>'
    // 소개프로필 카드
    + `<div class="sec">`
    + `<div class="sec__header sec__header--flex">`
    + `<span class="mcard__title">소개프로필</span>`
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
