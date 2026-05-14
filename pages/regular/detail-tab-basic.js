/* 기본정보 탭 렌더링 */
import { Formatters } from '@utils/formatters.js';

const LBL = 'background:var(--bg-secondary);font-weight:600;font-size:12px;color:var(--text-secondary);text-align:center;white-space:nowrap';
const VAL = 'font-size:13px;padding:8px 12px';
const TBL = 'class="data-table data-table--bordered" style="font-size:13px;table-layout:fixed;width:100%"';
const COL8 = '<colgroup><col style="width:10%"><col style="width:15%"><col style="width:10%"><col style="width:15%"><col style="width:10%"><col style="width:15%"><col style="width:10%"><col style="width:15%"></colgroup>';
const SEC = (t) => `<div style="font-size:13px;font-weight:700;color:var(--text-primary);margin:24px 0 12px">${t}</div>`;

export function renderBasicInfo(m) {
  var ctLabel = m.contractType === '횟수제' && m.contractCount ? m.contractType + '(' + m.contractCount + '회)' : (m.contractType || '-');
  var esign = m.esignComplete ? '<span class="badge badge--green">완료</span>' : '<span class="badge badge--red">미완료</span>';

  return `
    ${SEC('기본정보')}
    <table ${TBL}>${COL8}<tbody>
      <tr><td style="${LBL}">생년월일</td><td style="${VAL}">${Formatters.date(m.birthDate)} (${m.age}세)</td><td style="${LBL}">성별</td><td style="${VAL}">${m.gender}</td><td style="${LBL}">주민번호</td><td style="${VAL}">${m.ssn || '-'}</td><td style="${LBL}">결혼경력</td><td style="${VAL}" data-editable="maritalHistory">${m.maritalHistory}</td></tr>
      <tr><td style="${LBL}">핸드폰</td><td style="${VAL}" data-editable="phone">${Formatters.phone(m.phone)}</td><td style="${LBL}">자택전화</td><td style="${VAL}" data-editable="homePhone">${m.homePhone ? Formatters.phone(m.homePhone) : '-'}</td><td style="${LBL}">이메일</td><td style="${VAL}" data-editable="email">${m.email || '-'}</td><td style="${LBL}">최종컨텍</td><td style="${VAL}">${Formatters.date(m.lastContactDate)}</td></tr>
      <tr><td style="${LBL}">최종학력</td><td style="${VAL}" data-editable="education">${m.education}</td><td style="${LBL}">자녀양육</td><td style="${VAL}" data-editable="childCare">${m.childCare || '무'}</td><td style="${LBL}">해외</td><td style="${VAL}" data-editable="overseas">${m.overseas || '없음'}</td><td style="${LBL}">지역</td><td style="${VAL}" data-editable="region">${m.region}</td></tr>
      <tr><td style="${LBL}">자택주소</td><td style="${VAL}" colspan="7" data-editable="homeAddress">${m.homeAddress || '-'}</td></tr>
      <tr><td style="${LBL}">호적주소</td><td style="${VAL}" colspan="7" data-editable="registerAddress">${m.registerAddress || '-'}</td></tr>
      <tr><td style="${LBL}">본적지</td><td style="${VAL}" colspan="7" data-editable="hometown">${m.hometown || '-'}</td></tr>
    </tbody></table>

    ${SEC('계약 / 관리 정보')}
    <table ${TBL}>${COL8}<tbody>
      <tr><td style="${LBL}">브랜드</td><td style="${VAL}">${m.brand}</td><td style="${LBL}">지사</td><td style="${VAL}"><a href="#" id="btn-branch-hist" style="color:var(--accent);text-decoration:underline;cursor:pointer">${m.branch}</a></td><td style="${LBL}">프로그램</td><td style="${VAL}"><a href="#" id="btn-pgm-hist" style="color:var(--accent);text-decoration:underline;cursor:pointer">${m.program}</a></td><td style="${LBL}">계약형태</td><td style="${VAL}">${ctLabel}</td></tr>
      <tr><td style="${LBL}">가입차수</td><td style="${VAL}">${m.rejoinLabel || m.rejoinCount + '가입'}</td><td style="${LBL}">전자서명</td><td style="${VAL}">${esign}</td><td style="${LBL}">서류인증</td><td style="${VAL}">${m.docVerified ? '<span class="badge badge--green">인증완료</span>' : '<span class="badge badge--red">인증미완료</span>'}</td><td style="${LBL}">가입일</td><td style="${VAL}">${Formatters.date(m.joinDate)}</td></tr>
      <tr><td style="${LBL}">만료일</td><td style="${VAL}"><a href="#" id="btn-expiry-hist" style="color:var(--accent);text-decoration:underline;cursor:pointer">${m.expiryDate ? Formatters.date(m.expiryDate) : '-'}</a></td><td style="${LBL}">가입비</td><td style="${VAL}">${Formatters.money(m.programFee || 0)}</td><td style="${LBL}">성혼비</td><td style="${VAL}">${Formatters.money(m.marriageFee || 0)}</td><td style="${LBL}">재가입비</td><td style="${VAL}">${m.rejoinFee ? Formatters.money(m.rejoinFee) : '-'}</td></tr>
      <tr><td style="${LBL}">상담매니저</td><td style="${VAL}"><a href="#" id="btn-consult-hist" style="color:var(--accent);text-decoration:underline;cursor:pointer;font-weight:600">${m.consultantManager}</a></td><td style="${LBL}">매칭매니저</td><td style="${VAL}"><a href="#" id="btn-match-hist" style="color:var(--accent);text-decoration:underline;cursor:pointer;font-weight:600">${m.matchingManager}</a></td><td style="${LBL}"></td><td style="${VAL}"></td><td style="${LBL}"></td><td style="${VAL}"></td></tr>
    </tbody></table>

    ${SEC('신체 / 성향')}
    <table ${TBL}>${COL8}<tbody>
      <tr><td style="${LBL}">키</td><td style="${VAL}">${m.height}cm</td><td style="${LBL}">체중</td><td style="${VAL}">${m.weight||'-'}kg</td><td style="${LBL}">혈액형</td><td style="${VAL}">${m.bloodType||'-'}</td><td style="${LBL}">종교</td><td style="${VAL}">${m.religion}</td></tr>
      <tr><td style="${LBL}">흡연</td><td style="${VAL}">${m.smoking||'비흡연'}</td><td style="${LBL}">음주</td><td style="${VAL}">${m.drinking||'보통'}</td><td style="${LBL}"></td><td style="${VAL}"></td><td style="${LBL}"></td><td style="${VAL}"></td></tr>
    </tbody></table>

    <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin:24px 0 12px">학력</div>
    <table class="data-table data-table--bordered" style="font-size:13px;table-layout:fixed;width:100%">
      <colgroup><col style="width:22%"><col style="width:22%"><col style="width:14%"><col style="width:14%"><col style="width:14%"><col style="width:14%"></colgroup>
      <thead>
        <tr><th>학력상세</th><th>전공</th><th>소재지</th><th>졸업여부</th><th>입학년도</th><th>졸업년도</th></tr>
      </thead>
      <tbody>
        ${(m.educationList || [
          { level: '고등학교 - ' + (m.school || '천안여자고등학교'), major: '-', location: '천안', graduated: '졸업', enterYear: '-', gradYear: '2017' },
          { level: '대학교 - ' + (m.school || '동국대학교'), major: m.major || '컴퓨터공학', location: '서울', graduated: '졸업', enterYear: '2018', gradYear: '2024' },
          { level: '대학원(석사) - 동국대대학원', major: m.major || '컴퓨터공학', location: '서울', graduated: '졸업', enterYear: '2024', gradYear: '2026' }
        ]).map(function(e) {
          return '<tr><td>' + e.level + '</td><td>' + (e.major || '-') + '</td><td>' + (e.location || '-') + '</td><td>' + e.graduated + '</td><td>' + (e.enterYear || '-') + '</td><td>' + (e.gradYear || '-') + '</td></tr>';
        }).join('')}
      </tbody>
    </table>

    ${SEC('직장')}
    <table ${TBL}><colgroup><col style="width:10%"><col style="width:15%"><col style="width:10%"><col style="width:15%"><col style="width:10%"><col style="width:15%"><col style="width:10%"><col style="width:15%"></colgroup><tbody>
      <tr><td style="${LBL}">직장명</td><td style="${VAL}">${m.company||'-'}</td><td style="${LBL}">업종</td><td style="${VAL}">${m.industry||'-'}</td><td style="${LBL}">종업원수</td><td style="${VAL}">${m.employees||'-'}</td><td style="${LBL}">부서</td><td style="${VAL}">${m.department||'-'}</td></tr>
      <tr><td style="${LBL}">직위</td><td style="${VAL}">${m.position||'-'}</td><td style="${LBL}">담당업무</td><td style="${VAL}">${m.duty||'-'}</td><td style="${LBL}">입사</td><td style="${VAL}">${m.joinCompanyYear||'-'}</td><td style="${LBL}">소재지</td><td style="${VAL}">${m.workLocation||'-'}</td></tr>
      <tr><td style="${LBL}">직장전화</td><td style="${VAL}">${m.workPhone ? Formatters.phone(m.workPhone) : '-'}</td><td style="${LBL}">연소득</td><td style="${VAL}">${m.income||'-'}</td><td style="${LBL}"></td><td style="${VAL}"></td><td style="${LBL}"></td><td style="${VAL}"></td></tr>
      <tr><td style="${LBL}">직장주소</td><td style="${VAL}" colspan="7">${m.workAddress || '-'}</td></tr>
    </tbody></table>

    <div style="display:flex;align-items:center;justify-content:space-between;margin:24px 0 12px">
      <div style="font-size:13px;font-weight:700;color:var(--text-primary)">유의사항</div>
      <button class="btn btn--primary btn--sm" id="btn-add-caution">+ 등록</button>
    </div>
    <table class="data-table data-table--bordered" style="font-size:12px">
      <thead><tr><th style="width:90px;white-space:nowrap">작성일</th><th style="width:80px;white-space:nowrap">작성자</th><th>내용</th><th style="width:90px;white-space:nowrap">관리</th></tr></thead>
      <tbody>
        ${m.cautionMemo ? '<tr><td style="white-space:nowrap">' + Formatters.date(m.joinDate) + '</td><td>' + m.consultantManager + '</td><td style="text-align:left">' + m.cautionMemo + '</td><td style="white-space:nowrap"><button class="btn btn--ghost btn--sm caution-edit-btn" data-content="' + (m.cautionMemo||'').replace(/"/g,'&quot;') + '" style="font-size:10px;padding:1px 4px">수정</button> <button class="btn btn--ghost btn--sm caution-del-btn" style="font-size:10px;padding:1px 4px;color:var(--danger)">삭제</button></td></tr>' : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:16px">등록된 유의사항이 없습니다.</td></tr>'}
      </tbody>
    </table>

    <div style="display:flex;align-items:center;justify-content:space-between;margin:24px 0 12px">
      <div style="font-size:13px;font-weight:700;color:var(--text-primary)">매칭매니저 의견</div>
      <button class="btn btn--primary btn--sm" id="btn-add-match-comment">+ 의견 등록</button>
    </div>
    <table class="data-table data-table--bordered" style="font-size:12px">
      <thead><tr><th style="width:90px;white-space:nowrap">작성일</th><th style="width:80px;white-space:nowrap">작성자</th><th>내용</th><th style="width:90px;white-space:nowrap">관리</th></tr></thead>
      <tbody>
        ${m.matchComment ? '<tr><td style="white-space:nowrap">' + Formatters.date(m.joinDate) + '</td><td>' + m.matchingManager + '</td><td style="text-align:left">' + m.matchComment + '</td><td style="white-space:nowrap"><button class="btn btn--ghost btn--sm comment-edit-btn" data-type="매칭" data-content="' + (m.matchComment||'').replace(/"/g,'&quot;') + '" style="font-size:10px;padding:1px 4px">수정</button> <button class="btn btn--ghost btn--sm comment-del-btn" data-type="매칭" style="font-size:10px;padding:1px 4px;color:var(--danger)">삭제</button></td></tr>' : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:16px">등록된 의견이 없습니다.</td></tr>'}
      </tbody>
    </table>

    <div style="display:flex;align-items:center;justify-content:space-between;margin:24px 0 12px">
      <div style="font-size:13px;font-weight:700;color:var(--text-primary)">상담매니저 의견</div>
      <button class="btn btn--primary btn--sm" id="btn-add-consult-comment">+ 의견 등록</button>
    </div>
    <table class="data-table data-table--bordered" style="font-size:12px">
      <thead><tr><th style="width:90px;white-space:nowrap">작성일</th><th style="width:80px;white-space:nowrap">작성자</th><th>내용</th><th style="width:90px;white-space:nowrap">관리</th></tr></thead>
      <tbody>
        ${m.consultComment ? '<tr><td style="white-space:nowrap">' + Formatters.date(m.joinDate) + '</td><td>' + m.consultantManager + '</td><td style="text-align:left">' + m.consultComment + '</td><td style="white-space:nowrap"><button class="btn btn--ghost btn--sm comment-edit-btn" data-type="상담" data-content="' + (m.consultComment||'').replace(/"/g,'&quot;') + '" style="font-size:10px;padding:1px 4px">수정</button> <button class="btn btn--ghost btn--sm comment-del-btn" data-type="상담" style="font-size:10px;padding:1px 4px;color:var(--danger)">삭제</button></td></tr>' : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:16px">등록된 의견이 없습니다.</td></tr>'}
      </tbody>
    </table>
  `;
}
