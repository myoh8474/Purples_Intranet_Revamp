/* ========================================
   정회원 수정 페이지
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars, BRANCHES, PROGRAMS, MATCH_MANAGERS, CONSULTANTS } from '@mock/regulars.js';
import { REGULAR_STATUSES } from '@config/constants.js';

initLayout({ pageId: 'regular-edit', breadcrumbs: ['정회원 관리', '정회원 수정'] });

var content = document.getElementById('content');
var params = new URLSearchParams(window.location.search);
var memberId = parseInt(params.get('id')) || 1;
var m = MockRegulars.find(function(r) { return r.id === memberId; }) || MockRegulars[0];

if (!m) {
  content.innerHTML = '<div style="padding:60px;text-align:center;color:var(--text-muted)">회원 정보를 찾을 수 없습니다.</div>';
} else {

var LBL = 'background:var(--bg-secondary);width:120px;font-weight:600;font-size:12px;color:var(--text-secondary);text-align:center;white-space:nowrap;vertical-align:middle';
var VAL = 'font-size:13px;padding:6px 10px';
var INP = 'class="form-input" style="width:100%;font-size:13px;padding:4px 8px"';
var SEL = 'class="form-input" style="width:100%;font-size:13px;padding:4px 8px"';

function SEC(t) {
  return '<div style="font-size:13px;font-weight:700;color:var(--text-primary);margin:24px 0 12px">' + t + '</div>';
}

function makeOptions(arr, selected) {
  return arr.map(function(v) {
    return '<option value="' + v + '"' + (v === selected ? ' selected' : '') + '>' + v + '</option>';
  }).join('');
}

var RELIGIONS = ['무교','기독교','천주교','불교','기타'];
var EDUCATIONS = ['고졸','전문대졸','대졸','석사','박사'];
var REGIONS = ['서울','부산','대구','광주','인천','대전','울산','경기','강원','세종','충북','충남','경북','경남','전북','전남','제주'];

// 사진 영역
var photos = Array.isArray(m.photo) ? m.photo : (m.photo ? [m.photo] : []);
var photoHtml = '';
if (photos.length > 0) {
  photoHtml = '<img src="' + photos[0] + '" style="width:64px;height:80px;border-radius:6px;object-fit:cover;border:1px solid var(--border-light)">';
} else {
  photoHtml = '<div style="width:64px;height:80px;border-radius:6px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--text-muted);border:1px dashed var(--border-light)">사진</div>';
}

content.innerHTML = ''
  // 상단 헤더
  + '<div class="card" style="margin-bottom:20px">'
  + '  <div class="card__body" style="padding:14px 20px">'
  + '    <div style="display:flex;align-items:center;justify-content:space-between">'
  + '      <div style="display:flex;align-items:center;gap:14px">'
  + photoHtml
  + '        <div>'
  + '          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
  + '            <h2 style="font-size:var(--font-size-lg);font-weight:700;margin:0">' + m.name + ' 수정</h2>'
  + '            <span style="color:var(--text-muted);font-size:var(--font-size-sm)">' + m.memberId + '</span>'
  + '            ' + Formatters.statusBadge(m.status, 'regular')
  + '          </div>'
  + '        </div>'
  + '      </div>'
  + '      <div style="display:flex;gap:8px">'
  + '        <button class="btn btn--ghost btn--sm" id="btn-cancel">취소</button>'
  + '        <button class="btn btn--primary btn--sm" id="btn-save">저장</button>'
  + '      </div>'
  + '    </div>'
  + '  </div>'
  + '</div>'

  // 이름 변경
  + '<div class="card" style="margin-bottom:20px">'
  + '  <div class="card__body" style="padding:16px">'
  + SEC('이름 정보')
  + '    <table class="data-table data-table--bordered" style="font-size:13px"><tbody>'
  + '      <tr>'
  + '        <td style="' + LBL + '">구분</td>'
  + '        <td style="' + VAL + '"><select id="edit-name-type" ' + SEL + '><option value="본명" selected>본명</option><option value="개명">개명</option><option value="가명">가명</option></select></td>'
  + '        <td style="' + LBL + '">이름</td>'
  + '        <td style="' + VAL + '"><input type="text" id="edit-name" value="' + m.name + '" ' + INP + '></td>'
  + '        <td style="' + LBL + '">변경사유</td>'
  + '        <td style="' + VAL + '"><input type="text" id="edit-name-reason" placeholder="변경사유 입력" ' + INP + '></td>'
  + '      </tr>'
  + '    </tbody></table>'
  + '  </div>'
  + '</div>'

  // 인적사항
  + '<div class="card" style="margin-bottom:20px">'
  + '  <div class="card__body" style="padding:16px">'
  + SEC('인적사항')
  + '    <table class="data-table data-table--bordered" style="font-size:13px"><tbody>'
  + '      <tr>'
  + '        <td style="' + LBL + '">생년월일</td>'
  + '        <td style="' + VAL + '"><input type="date" id="edit-birth" value="' + (m.birthDate ? m.birthDate.substring(0,10) : '') + '" ' + INP + '></td>'
  + '        <td style="' + LBL + '">성별</td>'
  + '        <td style="' + VAL + '"><select id="edit-gender" ' + SEL + '><option' + (m.gender==='남'?' selected':'') + '>남</option><option' + (m.gender==='여'?' selected':'') + '>여</option></select></td>'
  + '        <td style="' + LBL + '">핸드폰</td>'
  + '        <td style="' + VAL + '"><input type="tel" id="edit-phone" value="' + (m.phone||'') + '" ' + INP + '></td>'
  + '      </tr>'
  + '      <tr>'
  + '        <td style="' + LBL + '">이메일</td>'
  + '        <td style="' + VAL + '"><input type="email" id="edit-email" value="' + (m.email||'') + '" ' + INP + '></td>'
  + '        <td style="' + LBL + '">결혼경력</td>'
  + '        <td style="' + VAL + '"><select id="edit-marital" ' + SEL + '>' + makeOptions(['미혼','재혼','사별','사실혼','삼혼이상'], m.maritalHistory) + '</select></td>'
  + '        <td style="' + LBL + '">자녀양육</td>'
  + '        <td style="' + VAL + '"><select id="edit-child" ' + SEL + '>' + makeOptions(['무','본인','전배우자','기타'], m.childCare) + '</select></td>'
  + '      </tr>'
  + '      <tr>'
  + '        <td style="' + LBL + '">해외</td>'
  + '        <td style="' + VAL + '"><select id="edit-overseas" ' + SEL + '>' + makeOptions(['없음','시민권자','영주권자'], m.overseas) + '</select></td>'
  + '        <td style="' + LBL + '">종교</td>'
  + '        <td style="' + VAL + '"><select id="edit-religion" ' + SEL + '>' + makeOptions(RELIGIONS, m.religion) + '</select></td>'
  + '        <td style="' + LBL + '"></td><td style="' + VAL + '"></td>'
  + '      </tr>'
  + '    </tbody></table>'
  + '  </div>'
  + '</div>'

  // 신체/성향
  + '<div class="card" style="margin-bottom:20px">'
  + '  <div class="card__body" style="padding:16px">'
  + SEC('신체 / 성향')
  + '    <table class="data-table data-table--bordered" style="font-size:13px"><tbody>'
  + '      <tr>'
  + '        <td style="' + LBL + '">키</td>'
  + '        <td style="' + VAL + '"><input type="number" id="edit-height" value="' + (m.height||'') + '" ' + INP + '></td>'
  + '        <td style="' + LBL + '">체중</td>'
  + '        <td style="' + VAL + '"><input type="number" id="edit-weight" value="' + (m.weight||'') + '" ' + INP + '></td>'
  + '        <td style="' + LBL + '">혈액형</td>'
  + '        <td style="' + VAL + '"><select id="edit-blood" ' + SEL + '>' + makeOptions(['A','B','O','AB'], m.bloodType) + '</select></td>'
  + '      </tr>'
  + '      <tr>'
  + '        <td style="' + LBL + '">흡연</td>'
  + '        <td style="' + VAL + '"><select id="edit-smoking" ' + SEL + '>' + makeOptions(['비흡연','흡연','가끔'], m.smoking) + '</select></td>'
  + '        <td style="' + LBL + '">음주</td>'
  + '        <td style="' + VAL + '"><select id="edit-drinking" ' + SEL + '>' + makeOptions(['안함','가끔','보통','자주'], m.drinking) + '</select></td>'
  + '        <td style="' + LBL + '"></td><td style="' + VAL + '"></td>'
  + '      </tr>'
  + '    </tbody></table>'
  + '  </div>'
  + '</div>'

  // 학력/직장
  + '<div class="card" style="margin-bottom:20px">'
  + '  <div class="card__body" style="padding:16px">'
  + SEC('학력 / 직장')
  + '    <table class="data-table data-table--bordered" style="font-size:13px"><tbody>'
  + '      <tr>'
  + '        <td style="' + LBL + '">학력</td>'
  + '        <td style="' + VAL + '"><select id="edit-edu" ' + SEL + '>' + makeOptions(EDUCATIONS, m.education) + '</select></td>'
  + '        <td style="' + LBL + '">학교</td>'
  + '        <td style="' + VAL + '"><input type="text" id="edit-school" value="' + (m.school||'') + '" ' + INP + '></td>'
  + '        <td style="' + LBL + '">직급</td>'
  + '        <td style="' + VAL + '"><input type="text" id="edit-position" value="' + (m.position||'') + '" ' + INP + '></td>'
  + '      </tr>'
  + '      <tr>'
  + '        <td style="' + LBL + '">직업</td>'
  + '        <td style="' + VAL + '"><input type="text" id="edit-job" value="' + (m.job||'') + '" ' + INP + '></td>'
  + '        <td style="' + LBL + '">직장</td>'
  + '        <td style="' + VAL + '"><input type="text" id="edit-company" value="' + (m.company||'') + '" ' + INP + '></td>'
  + '        <td style="' + LBL + '">연소득</td>'
  + '        <td style="' + VAL + '"><input type="text" id="edit-income" value="' + (m.income||'') + '" ' + INP + '></td>'
  + '      </tr>'
  + '    </tbody></table>'
  + '  </div>'
  + '</div>'

  // 거주/연락
  + '<div class="card" style="margin-bottom:20px">'
  + '  <div class="card__body" style="padding:16px">'
  + SEC('거주지 / 기타')
  + '    <table class="data-table data-table--bordered" style="font-size:13px"><tbody>'
  + '      <tr>'
  + '        <td style="' + LBL + '">지역</td>'
  + '        <td style="' + VAL + '"><select id="edit-region" ' + SEL + '>' + makeOptions(REGIONS, m.region) + '</select></td>'
  + '        <td style="' + LBL + '">본적지</td>'
  + '        <td style="' + VAL + '"><select id="edit-hometown" ' + SEL + '>' + makeOptions(REGIONS, m.hometown) + '</select></td>'
  + '        <td style="' + LBL + '">거주지 유동</td>'
  + '        <td style="' + VAL + '"><select id="edit-res-flex" ' + SEL + '><option' + (m.residenceFlexible?' selected':'') + '>가능</option><option' + (!m.residenceFlexible?' selected':'') + '>불가</option></select></td>'
  + '      </tr>'
  + '      <tr>'
  + '        <td style="' + LBL + '">직업 유동</td>'
  + '        <td style="' + VAL + '"><select id="edit-job-flex" ' + SEL + '><option' + (m.jobFlexible?' selected':'') + '>가능</option><option' + (!m.jobFlexible?' selected':'') + '>불가</option></select></td>'
  + '        <td style="' + LBL + '"></td><td style="' + VAL + '"></td>'
  + '        <td style="' + LBL + '"></td><td style="' + VAL + '"></td>'
  + '      </tr>'
  + '    </tbody></table>'
  + '  </div>'
  + '</div>'

  // 계약/관리
  + '<div class="card" style="margin-bottom:20px">'
  + '  <div class="card__body" style="padding:16px">'
  + SEC('계약 / 관리 정보')
  + '    <table class="data-table data-table--bordered" style="font-size:13px"><tbody>'
  + '      <tr>'
  + '        <td style="' + LBL + '">지사</td>'
  + '        <td style="' + VAL + '"><select id="edit-branch" ' + SEL + '>' + makeOptions(BRANCHES, m.branch) + '</select></td>'
  + '        <td style="' + LBL + '">프로그램</td>'
  + '        <td style="' + VAL + '"><select id="edit-program" ' + SEL + '>' + makeOptions(PROGRAMS, m.program) + '</select></td>'
  + '        <td style="' + LBL + '">계약형태</td>'
  + '        <td style="' + VAL + '"><select id="edit-contract" ' + SEL + '>' + makeOptions(['인증제','횟수제','기간제'], m.contractType) + '</select></td>'
  + '      </tr>'
  + '      <tr>'
  + '        <td style="' + LBL + '">상담매니저</td>'
  + '        <td style="' + VAL + '"><select id="edit-consultant" ' + SEL + '>' + makeOptions(CONSULTANTS, m.consultantManager) + '</select></td>'
  + '        <td style="' + LBL + '">매칭매니저</td>'
  + '        <td style="' + VAL + '"><select id="edit-matcher" ' + SEL + '>' + makeOptions(MATCH_MANAGERS, m.matchingManager) + '</select></td>'
  + '        <td style="' + LBL + '">회원상태</td>'
  + '        <td style="' + VAL + '"><select id="edit-status" ' + SEL + '>' + makeOptions(REGULAR_STATUSES, m.status) + '</select></td>'
  + '      </tr>'
  + '    </tbody></table>'
  + '  </div>'
  + '</div>'

  // 하단 버튼
  + '<div style="display:flex;justify-content:center;gap:12px;padding:20px 0">'
  + '  <button class="btn btn--ghost" id="btn-cancel-bottom">취소</button>'
  + '  <button class="btn btn--primary" id="btn-save-bottom">저장</button>'
  + '</div>';

/* ── 이벤트 ── */
// 취소 → 현재 탭 닫기 (상세 페이지는 이미 별도 탭에 존재)
function goBack() {
  window.close();
}
var cancelBtn = document.getElementById('btn-cancel');
if (cancelBtn) cancelBtn.addEventListener('click', goBack);
var cancelBtnBottom = document.getElementById('btn-cancel-bottom');
if (cancelBtnBottom) cancelBtnBottom.addEventListener('click', goBack);

// 저장
function handleSave() {
  var newName = document.getElementById('edit-name').value.trim();
  if (!newName) {
    Toast.show('이름을 입력해주세요.', 'warning');
    return;
  }
  var phone = document.getElementById('edit-phone').value.trim();
  if (!phone) {
    Toast.show('핸드폰 번호를 입력해주세요.', 'warning');
    return;
  }
  // 실제로는 API 호출
  Toast.show('회원 정보가 저장되었습니다.', 'success');
  setTimeout(function() {
    window.close();
  }, 1000);
}
var saveBtn = document.getElementById('btn-save');
if (saveBtn) saveBtn.addEventListener('click', handleSave);
var saveBtnBottom = document.getElementById('btn-save-bottom');
if (saveBtnBottom) saveBtnBottom.addEventListener('click', handleSave);

} // end if (!m)
