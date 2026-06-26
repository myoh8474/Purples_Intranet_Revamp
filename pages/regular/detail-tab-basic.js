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

  // ── 좌측: 연락처/주소 + 자산정보 + 직업 + 학력 ──
  var leftHtml = ''
    // 연락처/주소
    + SEC('연락처 / 주소')
    + `<table class="data-table data-table--bordered data-table--no-outer dtbl">
      <tbody>
        <tr><td class="${LBL}">핸드폰1</td><td class="${VAL}">${fmtPhone(m.phone)}</td><td class="${LBL}">핸드폰2</td><td class="${VAL}">${m.phone2 ? fmtPhone(m.phone2) : '-'}</td></tr>
        <tr><td class="${LBL}">핸드폰3</td><td class="${VAL}">${m.phone3 ? fmtPhone(m.phone3) : '-'}</td><td class="${LBL}">이메일</td><td class="${VAL}">${m.email ? '<a href="mailto:' + m.email + '" style="color:#1565c0;text-decoration:underline;cursor:pointer">' + m.email + '</a>' : '-'}</td></tr>
        <tr><td class="${LBL}">자택번호</td><td class="${VAL}">${m.homePhone ? fmtPhone(m.homePhone) : '-'}</td><td class="${LBL}">직장번호</td><td class="${VAL}">${m.workPhone ? fmtPhone(m.workPhone) : '-'}</td></tr>
        <tr><td class="${LBL}">통화희망자</td><td class="${VAL}">${m.callTarget || '본인'}</td><td class="${LBL}">소통방법</td><td class="${VAL}">${m.contactMethod || '문자+통화'}</td></tr>
        <tr><td class="${LBL}">연락가능시간</td><td class="${VAL}">${m.contactableTime || '-'}</td><td class="${LBL}">미팅가능시간</td><td class="${VAL}">${m.meetingAvailTime || '-'}</td></tr>
        <tr><td class="${LBL}">미팅가능지역</td><td class="${VAL}">${m.meetingAvailArea || '-'}</td><td class="${LBL}">현거주상태</td><td class="${VAL}">${m.livingStatus || '-'}</td></tr>
        <tr><td class="${LBL}">자택주소</td><td class="${VAL}" colspan="3">${m.homeAddress || m.address || '-'}</td></tr>
        <tr><td class="${LBL}">호적주소</td><td class="${VAL}" colspan="3">${m.registerAddress || m.hometown || '-'}</td></tr>
        <tr><td class="${LBL}">직장주소</td><td class="${VAL}" colspan="3">${m.workAddress || '-'}</td></tr>
        <tr><td class="${LBL}">결혼후거주희망지역</td><td class="${VAL}" colspan="3">${m.afterMarriageArea || '-'}</td></tr>
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
        <tr><td class="${LBL}">직장명</td><td class="${VAL}">${m.company || '-'}</td><td class="${LBL}">업종</td><td class="${VAL}">${m.industry || '-'}</td><td class="${LBL}">종업원수</td><td class="${VAL}">${m.employees || '-'}</td><td class="${LBL}">부서</td><td class="${VAL}">${m.department || '-'}</td></tr>
        <tr><td class="${LBL}">직위</td><td class="${VAL}">${m.position || '-'}</td><td class="${LBL}">담당업무</td><td class="${VAL}">${m.duty || '-'}</td><td class="${LBL}">입사년도</td><td class="${VAL}">${m.joinCompanyYear || '-'}</td><td class="${LBL}">소재지</td><td class="${VAL}">${m.companyLocation || '-'}</td></tr>
        <tr><td class="${LBL}">직업군</td><td class="${VAL}">${m.jobCategory || '-'}</td><td class="${LBL}">기업형태</td><td class="${VAL}">${m.companyType || '-'}</td><td class="${LBL}">소득종류</td><td class="${VAL}">${m.incomeType || '-'}</td><td class="${LBL}">연수입</td><td class="${VAL}">${m.income || '-'}</td></tr>
        <tr><td class="${LBL}">기타수입</td><td class="${VAL}">${m.otherIncome || '-'}</td><td class="${LBL}">업무설명</td><td class="${VAL}" colspan="5">${m.businessField || '-'}</td></tr>
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
      </tbody>
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

    // 신체정보
    + SEC('신체정보')
    + `<table ${TBL}>
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td class="${LBL}">시력</td><td class="${VAL}">${m.eyesight||'-'}</td><td class="${LBL}">안경</td><td class="${VAL}">${m.glasses||'-'}</td><td class="${LBL}">혈액형</td><td class="${VAL}">${m.bloodType||'-'}</td><td class="${LBL}">청력</td><td class="${VAL}">${m.hearing||'-'}</td></tr>
        <tr><td class="${LBL}">언어</td><td class="${VAL}">${m.language||'-'}</td><td class="${LBL}">건강</td><td class="${VAL}">${m.healthStatus||'-'}</td><td class="${LBL}">얼굴형</td><td class="${VAL}">${m.faceType||'-'}</td><td class="${LBL}">음주</td><td class="${VAL}">${m.drinking||'-'}</td></tr>
        <tr><td class="${LBL}">흡연</td><td class="${VAL}">${m.smoking||'-'}</td><td class="${LBL}">범죄이력</td><td class="${VAL}">${m.criminalRecord||'-'}</td><td class="${LBL}">신장</td><td class="${VAL}">${m.height ? m.height+'cm' : '-'}</td><td class="${LBL}">체중</td><td class="${VAL}">${m.weight ? m.weight+'kg' : '-'}</td></tr>
      </tbody>
    </table>` + SEC_END

    // 기타정보
    + SEC('기타정보')
    + `<table ${TBL}>
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td class="${LBL}">특기</td><td class="${VAL}">${m.specialty||'-'}</td><td class="${LBL}">병역</td><td class="${VAL}">${m.military||'-'}</td><td class="${LBL}">미필사유</td><td class="${VAL}">${m.militaryExempt||'-'}</td><td class="${LBL}">자격면허</td><td class="${VAL}">${m.license||'-'}</td></tr>
        <tr><td class="${LBL}">동성동본</td><td class="${VAL}">${m.sameClan||'-'}</td><td class="${LBL}">종교</td><td class="${VAL}">${m.religion||'-'}</td><td class="${LBL}">본인신앙</td><td class="${VAL}">${m.ownFaith||'-'}</td><td class="${LBL}">부모신앙</td><td class="${VAL}">${m.parentFaith||'-'}</td></tr>
        <tr><td class="${LBL}">맞벌이</td><td class="${VAL}">${m.dualIncome||'-'}</td><td class="${LBL}">상대방</td><td class="${VAL}">${m.partnerPref||'-'}</td><td class="${LBL}">연상연하</td><td class="${VAL}">${m.agePref||'-'}</td><td class="${LBL}"></td><td class="${VAL}"></td></tr>
      </tbody>
    </table>` + SEC_END

    // 가족관계
    + `<div class="sec"><div class="sec__header sec__header--flex"><span class="mcard__title">가족관계</span><span style="font-size:12px;color:var(--text-muted)">${m.familySummary || ''}</span></div><div class="sec__body">`
    + `<table ${TBL}>
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
    </table></div></div>`

    // 자녀정보
    + SEC('자녀정보')
    + `<table ${TBL}>
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
    </table>` + SEC_END

    // 희망상대
    + SEC('희망상대')
    + `<table class="data-table data-table--bordered data-table--no-outer dtbl">
      <colgroup><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"><col style="width:12%"><col style="width:13%"></colgroup>
      <tbody>
        <tr><td class="${LBL}">연수입</td><td class="${VAL}">${m.preferIncome || '-'}</td><td class="${LBL}">신장</td><td class="${VAL}">${m.preferHeight || '-'}</td><td class="${LBL}">연령</td><td class="${VAL}">${m.preferAge || '-'}</td><td class="${LBL}">학력</td><td class="${VAL}">${m.preferEdu || '-'}</td></tr>
        <tr><td class="${LBL}">기피종교</td><td class="${VAL}">${m.avoidReligion || '-'}</td><td class="${LBL}">혼인경력</td><td class="${VAL}">${m.preferMarital || '-'}</td><td class="${LBL}">상대자녀</td><td class="${VAL}">${m.acceptChildren || '-'}</td><td class="${LBL}">학력상세</td><td class="${VAL}">${m.preferEduDetail || '-'}</td></tr>
      </tbody>
    </table>` + SEC_END

    // 자기소개
    + SEC('자기소개')
    + `<table class="data-table data-table--bordered data-table--no-outer dtbl">
      <colgroup><col style="width:15%"><col style="width:35%"><col style="width:15%"><col style="width:35%"></colgroup>
      <tbody>
        <tr><td class="${LBL}">나의 이상형</td><td class="${VAL}">${m.idealType || '-'}</td><td class="${LBL}">본인의 매력은</td><td class="${VAL}">${m.myCharm || '-'}</td></tr>
        <tr><td class="${LBL}">성격 및 스타일</td><td class="${VAL}">${m.personalityStyle || '-'}</td><td class="${LBL}" style="white-space:normal">5~10년 후<br>나의 모습</td><td class="${VAL}">${m.futureVision || '-'}</td></tr>
        <tr><td class="${LBL}" style="white-space:normal">남들이 얘기하는<br>본인의 매력</td><td class="${VAL}">${m.othersView || '-'}</td><td class="${LBL}">특이사항</td><td class="${VAL}">${m.extraNote || '-'}</td></tr>
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

  return `<div style="display:grid;grid-template-columns:3fr 2fr;gap:8px;align-items:start">
    <div>${leftHtml}</div>
    <div>${rightHtml}</div>
  </div>`;
}
