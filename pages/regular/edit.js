/* ========================================
   정회원 수정 페이지 (레거시 CRM 스타일)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars, BRANCHES, PROGRAMS, MATCH_MANAGERS, CONSULTANTS, REGIONS } from '@mock/regulars.js';
import { REGULAR_STATUSES } from '@config/constants.js';

initLayout({ pageId: 'regular-edit', breadcrumbs: ['정회원 관리', '정회원 수정'] });

/* ── 사이드바 숨기고 전체 폭 사용 ── */
var sidebar = document.getElementById('sidebar');
if (sidebar) sidebar.style.display = 'none';
var mainEl = document.querySelector('.main');
if (mainEl) mainEl.style.marginLeft = '0';

/* ── 데이터 ── */
var content = document.getElementById('content');
var params = new URLSearchParams(window.location.search);
var memberId = parseInt(params.get('id')) || 1;
var m = MockRegulars.find(function(r) { return r.id === memberId; }) || MockRegulars[0];

if (!m) {
  content.innerHTML = '<div style="padding:60px;text-align:center;color:#999">회원 정보를 찾을 수 없습니다.</div>';
} else {

/* ── 스타일 상수 ── */
var L = 'background:#f5f5f5;font-weight:600;font-size:11px;color:#333;text-align:center;white-space:nowrap;vertical-align:middle;border:1px solid #ddd;padding:5px 8px';
var V = 'font-size:12px;padding:4px 8px;border:1px solid #ddd;vertical-align:middle';
var I = 'style="width:100%;font-size:12px;padding:2px 5px;border:1px solid #bbb;box-sizing:border-box"';
var S = 'style="width:100%;font-size:12px;padding:2px 5px;border:1px solid #bbb;box-sizing:border-box"';

function opts(arr, sel) {
  return arr.map(function(v) {
    return '<option' + (v === sel ? ' selected' : '') + '>' + v + '</option>';
  }).join('');
}

function secHdr(title) {
  return '<div style="font-size:12px;font-weight:700;color:#333;padding:6px 0 4px 2px;margin-top:16px">' + title + '</div>';
}

/* ── 렌더링 ── */
content.style.padding = '12px 16px';
content.style.background = '#fff';

content.innerHTML = ''

  /* ===== 상단 타이틀 바 ===== */
  + '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;margin-bottom:12px;border-bottom:2px solid #333">'
  + '  <div style="display:flex;align-items:center;gap:10px">'
  + '    <span style="font-size:15px;font-weight:700;color:#222">회원정보 수정</span>'
  + '    <span style="font-size:13px;font-weight:600;color:#1a3a5c">' + m.name + '</span>'
  + '    <span style="font-size:11px;color:#888">(' + m.memberId + ')</span>'
  + '    ' + Formatters.statusBadge(m.status, 'regular')
  + '  </div>'
  + '  <div style="display:flex;gap:6px">'
  + '    <button class="btn btn--ghost btn--sm" id="btn-cancel" style="font-size:11px;padding:3px 18px;border:1px solid #aaa;background:#fff">취소</button>'
  + '    <button class="btn btn--primary btn--sm" id="btn-save" style="font-size:11px;padding:3px 18px;background:#1a3a5c;border-color:#1a3a5c">저장하기</button>'
  + '  </div>'
  + '</div>'

  /* ===== 탭 네비게이션 ===== */
  + '<div style="display:flex;gap:0;margin-bottom:0;border-bottom:2px solid #1a3a5c">'
  + '  <button type="button" class="edit-tab" data-tab="tab-member" style="font-size:12px;font-weight:700;padding:7px 24px;border:1px solid #1a3a5c;border-bottom:none;background:#1a3a5c;color:#fff;cursor:pointer;border-radius:4px 4px 0 0;margin-right:2px">회원정보</button>'
  + '  <button type="button" class="edit-tab" data-tab="tab-family" style="font-size:12px;font-weight:700;padding:7px 24px;border:1px solid #ccc;border-bottom:none;background:#f0f0f0;color:#555;cursor:pointer;border-radius:4px 4px 0 0;margin-right:2px">가족정보</button>'
  + '  <button type="button" class="edit-tab" data-tab="tab-partner" style="font-size:12px;font-weight:700;padding:7px 24px;border:1px solid #ccc;border-bottom:none;background:#f0f0f0;color:#555;cursor:pointer;border-radius:4px 4px 0 0">희망상대</button>'
  + '</div>'

  /* ===== 탭1: 회원정보 ===== */
  + '<div id="tab-member" class="edit-tab-panel" style="padding-top:12px">'

  /* ===== 가입정보 + 결제정보 (2열 배치) ===== */
  + '<div style="display:flex;gap:16px;align-items:flex-start">'

  /* ── 가입정보 (좌측) ── */
  + '<div style="flex:1">'
  + secHdr('가입정보')
  + '<table style="width:100%;border-collapse:collapse;margin-top:4px">'
  + '<tbody>'

  // 1행: 상담매니저, 매칭매니저, 프로그램
  + '<tr>'
  + '  <td style="' + L + ';width:80px">상담매니저</td>'
  + '  <td style="' + V + '"><select id="edit-consultant" ' + S + '>' + opts(CONSULTANTS, m.consultantManager) + '</select></td>'
  + '  <td style="' + L + ';width:80px">매칭매니저</td>'
  + '  <td style="' + V + '"><select id="edit-matcher" ' + S + '>' + opts(MATCH_MANAGERS, m.matchingManager) + '</select></td>'
  + '  <td style="' + L + ';width:70px">프로그램</td>'
  + '  <td style="' + V + '"><select id="edit-program" ' + S + '>' + opts(PROGRAMS, m.program) + '</select></td>'
  + '</tr>'

  // 2행: 회원상태, 지사, 가입일
  + '<tr>'
  + '  <td style="' + L + '">회원상태</td>'
  + '  <td style="' + V + '"><select id="edit-status" ' + S + '>' + opts(REGULAR_STATUSES, m.status) + '</select></td>'
  + '  <td style="' + L + '">지사</td>'
  + '  <td style="' + V + '"><select id="edit-branch" ' + S + '>' + opts(BRANCHES, m.branch) + '</select></td>'
  + '  <td style="' + L + '">가입일</td>'
  + '  <td style="' + V + '"><input type="date" id="edit-join-date" value="' + (m.joinDate ? m.joinDate.substring(0,10) : '') + '" ' + I + '></td>'
  + '</tr>'

  // 3행: 서비스, 재가입, 본인가입사실
  + '<tr>'
  + '  <td style="' + L + '">서비스</td>'
  + '  <td style="' + V + '"><select id="edit-contract" ' + S + '>' + opts(['인증제','횟수제','기간제'], m.contractType) + '</select></td>'
  + '  <td style="' + L + '">아이디</td>'
  + '  <td style="' + V + '"><span style="font-size:12px;font-weight:600">' + m.memberId + '</span></td>'
  + '  <td style="' + L + '">본인가입사실</td>'
  + '  <td style="' + V + '"><select id="edit-self-aware" ' + S + '><option></option><option>인지</option><option>비인지</option></select></td>'
  + '</tr>'

  + '</tbody></table>'
  + '</div>'

  /* ── 결제정보 (우측) ── */
  + '<div style="flex:0 0 380px">'
  + secHdr('결제정보')
  + '<table style="width:100%;border-collapse:collapse;margin-top:4px">'
  + '<tbody>'

  // 1행: 주가입비, 무이자
  + '<tr>'
  + '  <td style="' + L + ';width:80px">주가입비</td>'
  + '  <td style="' + V + '"><input type="text" id="edit-program-fee" value="' + Formatters.money(m.programFee) + '" ' + I + '></td>'
  + '  <td style="' + L + ';width:70px">무이자</td>'
  + '  <td style="' + V + ';width:80px"><select id="edit-interest" ' + S + '><option>-</option><option>3개월</option><option>6개월</option><option>12개월</option></select></td>'
  + '</tr>'

  // 2행: 재가입비, 결제방법
  + '<tr>'
  + '  <td style="' + L + '">재가입비</td>'
  + '  <td style="' + V + '"><input type="text" id="edit-rejoin-fee" value="' + Formatters.money(m.rejoinFee) + '" ' + I + '></td>'
  + '  <td style="' + L + '">결제방법</td>'
  + '  <td style="' + V + '"><select id="edit-pay-method" ' + S + '><option>카드</option><option>현금</option><option>계좌이체</option><option>복합</option></select></td>'
  + '</tr>'

  // 3행: 성혼비, 할인명
  + '<tr>'
  + '  <td style="' + L + '">성혼비</td>'
  + '  <td style="' + V + '"><input type="text" id="edit-marriage-fee" value="' + Formatters.money(m.marriageFee) + '" ' + I + '></td>'
  + '  <td style="' + L + '">할인명</td>'
  + '  <td style="' + V + '"><input type="text" id="edit-discount" value="-" ' + I + '></td>'
  + '</tr>'

  + '</tbody></table>'
  + '</div>'

  + '</div>' // end flex row

  /* ===== 개인정보 ===== */
  + secHdr('개인정보')
  + '<table style="width:100%;border-collapse:collapse;margin-top:4px;table-layout:fixed">'
  + '<colgroup><col style="width:7%"><col style="width:9.7%"><col style="width:7%"><col style="width:9.7%"><col style="width:7%"><col style="width:9.7%"><col style="width:7%"><col style="width:9.7%"><col style="width:7%"><col style="width:9.7%"><col style="width:7%"><col style="width:9.7%"></colgroup>'
  + '<tbody>'

  // 1행: 이름, 본관, 성별, 생년월일, 주민번호, 나이
  + '<tr>'
  + '  <td style="' + L + '">이름</td>'
  + '  <td style="' + V + '"><input type="text" id="edit-name" value="' + m.name + '" ' + I + '></td>'
  + '  <td style="' + L + '">본관</td>'
  + '  <td style="' + V + '"><input type="text" id="edit-clan" value="" ' + I + '></td>'
  + '  <td style="' + L + '">성별</td>'
  + '  <td style="' + V + '">'
  + '    <label style="font-size:11px;margin-right:6px"><input type="radio" name="edit-gender" value="남"' + (m.gender==='남'?' checked':'') + '> 남</label>'
  + '    <label style="font-size:11px"><input type="radio" name="edit-gender" value="여"' + (m.gender==='여'?' checked':'') + '> 여</label>'
  + '  </td>'
  + '  <td style="' + L + '">생년월일</td>'
  + '  <td style="' + V + '"><input type="date" id="edit-birth" value="' + (m.birthDate ? m.birthDate.substring(0,10) : '') + '" ' + I + '></td>'
  + '  <td style="' + L + '">주민번호</td>'
  + '  <td style="' + V + '"><input type="text" id="edit-ssn" value="" ' + I + '></td>'
  + '  <td style="' + L + '">나이</td>'
  + '  <td style="' + V + '"><span style="font-size:12px">' + (m.age || Formatters.age(m.birthDate)) + '</span></td>'
  + '</tr>'

  // 2행: 결혼경력, 해외거주정보
  + '<tr>'
  + '  <td style="' + L + '">결혼경력</td>'
  + '  <td style="' + V + '" colspan="5">'
  + '    <label style="font-size:11px;margin-right:8px"><input type="radio" name="edit-marital" value="미혼"' + (m.maritalHistory==='미혼'?' checked':'') + '> 미혼</label>'
  + '    <label style="font-size:11px;margin-right:8px"><input type="radio" name="edit-marital" value="재혼"' + (m.maritalHistory==='재혼'?' checked':'') + '> 재혼</label>'
  + '    <label style="font-size:11px;margin-right:8px"><input type="radio" name="edit-marital" value="사별"' + (m.maritalHistory==='사별'?' checked':'') + '> 사별</label>'
  + '    <label style="font-size:11px;margin-right:8px"><input type="radio" name="edit-marital" value="사실혼"' + (m.maritalHistory==='사실혼'?' checked':'') + '> 사실혼</label>'
  + '    <label style="font-size:11px"><input type="radio" name="edit-marital" value="삼혼이상"' + (m.maritalHistory==='삼혼이상'?' checked':'') + '> 삼혼이상</label>'
  + '  </td>'
  + '  <td style="' + L + '">해외거주정보</td>'
  + '  <td style="' + V + '" colspan="5">'
  + '    <label style="font-size:11px;margin-right:8px"><input type="radio" name="edit-overseas" value="시민권자"' + (m.overseas==='시민권자'?' checked':'') + '> 시민권자</label>'
  + '    <label style="font-size:11px;margin-right:8px"><input type="radio" name="edit-overseas" value="영주권자"' + (m.overseas==='영주권자'?' checked':'') + '> 영주권자</label>'
  + '    <label style="font-size:11px"><input type="radio" name="edit-overseas" value="없음"' + (m.overseas==='없음'?' checked':'') + '> 없음</label>'
  + '  </td>'
  + '</tr>'

  + '</tbody></table>'

  /* ===== 연락처/ 주소 (단일 12열 테이블) ===== */
  + secHdr('연락처/ 주소')
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:4px">'
  + '<colgroup>'
  + '<col style="width:8%">'   // C1: 라벨(회원거주지, 통화희망자, 연락가능시간, 현거주상태)
  + '<col style="width:6%">'   // C2: 값/주소
  + '<col style="width:7%">'   // C3: 라벨(소통방법, 프로필제공, 미팅가능시간)
  + '<col style="width:6%">'   // C4: 값
  + '<col style="width:7%">'   // C5: 라벨(홍보, 미팅가능시간, 가입자)
  + '<col style="width:6%">'   // C6: 값
  + '<col style="width:7%">'   // C7: 라벨(안심번호)
  + '<col style="width:6%">'   // C8: 값
  + '<col style="width:9%">'   // C9: 라벨(연락처, 미팅가능지역, 결혼후거주희망지역)
  + '<col style="width:5%">'   // C10: 값(본인▼)
  + '<col style="width:16%">'  // C11: 값(전화)
  + '<col style="width:17%">'  // C12: 값(전화)
  + '</colgroup><tbody>'

  // ── Row1: 회원거주지 | 주소flex(C2-C8) | 연락처1 | 본인▼ | 전화(C11-C12)
  + '<tr>'
  + '<td style="' + L + '">회원거주지</td>'
  + '<td style="' + V + '" colspan="7"><div style="display:flex;gap:2px;align-items:center">'
  +   '<input type="text" id="edit-addr1-1" value="" style="width:15%;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<input type="text" id="edit-addr1-2" value="" style="width:35%;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<input type="text" id="edit-addr1-3" value="" style="width:25%;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<button type="button" style="font-size:10px;padding:1px 4px;border:1px solid #999;background:#e0e0e0;cursor:pointer;white-space:nowrap">우편번호</button>'
  + '</div></td>'
  + '<td style="' + L + '">연락처1</td>'
  + '<td style="' + V + '"><select id="edit-contact1-who" ' + S + '><option>본인</option><option>부</option><option>모</option><option>기타</option></select></td>'
  + '<td style="' + V + '" colspan="2"><input type="text" id="edit-contact1" value="' + (m.phone || '') + '" ' + I + '></td>'
  + '</tr>'

  // ── Row2: 본적지 | 주소flex+(호주)(C2-C8) | 연락처2 | 본인▼ | 전화(C11-C12)
  + '<tr>'
  + '<td style="' + L + '">본적지</td>'
  + '<td style="' + V + '" colspan="7"><div style="display:flex;gap:2px;align-items:center">'
  +   '<input type="text" id="edit-addr2-1" value="" style="width:15%;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<input type="text" id="edit-addr2-2" value="" style="width:35%;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<input type="text" id="edit-addr2-3" value="" style="width:25%;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<button type="button" style="font-size:10px;padding:1px 4px;border:1px solid #999;background:#e0e0e0;cursor:pointer;white-space:nowrap">우편번호</button>'
  +   '<span style="font-size:11px;padding:0 2px;white-space:nowrap;color:#555">(호주)</span>'
  +   '<input type="text" id="edit-householder" value="" style="width:10%;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  + '</div></td>'
  + '<td style="' + L + '">연락처2</td>'
  + '<td style="' + V + '"><select id="edit-contact2-who" ' + S + '><option>본인</option><option>부</option><option>모</option><option>기타</option></select></td>'
  + '<td style="' + V + '" colspan="2"><input type="text" id="edit-contact2" value="" ' + I + '></td>'
  + '</tr>'

  // ── Row3: 직장주소 | 주소flex(C2-C8) | 연락처3 | 본인▼ | 전화(C11-C12)
  + '<tr>'
  + '<td style="' + L + '">직장주소</td>'
  + '<td style="' + V + '" colspan="7"><div style="display:flex;gap:2px;align-items:center">'
  +   '<input type="text" id="edit-addr3-1" value="" style="width:15%;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<input type="text" id="edit-addr3-2" value="" style="width:35%;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<input type="text" id="edit-addr3-3" value="" style="width:25%;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<button type="button" style="font-size:10px;padding:1px 4px;border:1px solid #999;background:#e0e0e0;cursor:pointer;white-space:nowrap">우편번호</button>'
  + '</div></td>'
  + '<td style="' + L + '">연락처3</td>'
  + '<td style="' + V + '"><select id="edit-contact3-who" ' + S + '><option>본인</option><option>부</option><option>모</option><option>기타</option></select></td>'
  + '<td style="' + V + '" colspan="2"><input type="text" id="edit-contact3" value="" ' + I + '></td>'
  + '</tr>'

  // ── Row4: e-mail(C1) | input(C2-C4) | 소통방법(C5) | select(C6-C8) | 자택(C9) | phone(C10-C12)
  + '<tr>'
  + '<td style="' + L + '">e-mail</td>'
  + '<td style="' + V + '" colspan="3"><input type="text" id="edit-email" value="' + (m.email || '') + '" ' + I + '></td>'
  + '<td style="' + L + '">소통방법</td>'
  + '<td style="' + V + '" colspan="3"><select id="edit-comm-method" ' + S + '><option>전화+문자</option><option>전화</option><option>문자</option><option>카카오톡</option></select></td>'
  + '<td style="' + L + '">자택</td>'
  + '<td style="' + V + '" colspan="3"><input type="text" id="edit-home-phone" value="" ' + I + '></td>'
  + '</tr>'

  // ── Row5(기준행): 통화희망자|sel|프로필제공|sel|홍보|sel|안심번호|sel|직장|phone(C10-C12)
  + '<tr>'
  + '<td style="' + L + '">통화희망자</td>'
  + '<td style="' + V + '"><select id="edit-call-person" ' + S + '><option>본인</option><option>부</option><option>모</option><option>기타</option></select></td>'
  + '<td style="' + L + '">프로필제공</td>'
  + '<td style="' + V + '"><select id="edit-profile-share" ' + S + '><option>본인</option><option>부</option><option>모</option><option>기타</option></select></td>'
  + '<td style="' + L + '">홍보</td>'
  + '<td style="' + V + '"><select id="edit-promo" ' + S + '><option>본인</option><option>부</option><option>모</option><option>기타</option></select></td>'
  + '<td style="' + L + '">안심번호</td>'
  + '<td style="' + V + '"><select id="edit-safe-num" ' + S + '><option>본인</option><option>부</option><option>모</option><option>기타</option></select></td>'
  + '<td style="' + L + '">직장</td>'
  + '<td style="' + V + '" colspan="3"><input type="text" id="edit-work-phone" value="" ' + I + '></td>'
  + '</tr>'

  // ── Row6: 연락가능시간(C1) | input(C2-C4) | 미팅가능시간(C5) | input(C6-C8) | 미팅가능지역(C9) | input(C10-C12)
  + '<tr>'
  + '<td style="' + L + '">연락가능시간</td>'
  + '<td style="' + V + '" colspan="3"><input type="text" id="edit-contact-time" value="" ' + I + '></td>'
  + '<td style="' + L + '">미팅가능시간</td>'
  + '<td style="' + V + '" colspan="3"><input type="text" id="edit-meeting-time" value="" ' + I + '></td>'
  + '<td style="' + L + '">미팅가능지역</td>'
  + '<td style="' + V + '" colspan="3"><input type="text" id="edit-meeting-area" value="" ' + I + '></td>'
  + '</tr>'

  // ── Row7: 현거주상태(C1) | select(C2-C4) | 가입자(C5) | select(C6-C8) | 결혼후거주희망지역(C9) | input(C10-C12)
  + '<tr>'
  + '<td style="' + L + '">현거주상태</td>'
  + '<td style="' + V + '" colspan="3"><select id="edit-live-status" ' + S + '><option></option><option>자가</option><option>전세</option><option>월세</option><option>기타</option></select></td>'
  + '<td style="' + L + '">가입자</td>'
  + '<td style="' + V + '" colspan="3"><select id="edit-subscriber" ' + S + '><option></option><option>본인</option><option>부</option><option>모</option><option>기타</option></select></td>'
  + '<td style="' + L + '">결혼후거주희망지역</td>'
  + '<td style="' + V + '" colspan="3"><input type="text" id="edit-marriage-area" value="" ' + I + '></td>'
  + '</tr>'

  + '</tbody></table>'

  /* ===== 자산정보 ===== */
  + secHdr('자산정보')
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:4px">'
  + '<colgroup><col style="width:10%"><col style="width:40%"><col style="width:10%"><col style="width:40%"></colgroup>'
  + '<tbody>'

  // Row1: 현거주상태 | [select + 기타 + 거주주택] | 결혼후거주 | [select + 기타 + 거주주택]
  + '<tr>'
  + '<td style="' + L + '">현거주상태</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:3px;align-items:center">'
  +   '<select id="edit-asset-live-status" ' + S + '><option>선택</option><option>자가</option><option>전세</option><option>월세</option><option>기타</option></select>'
  +   '<span style="font-size:11px;white-space:nowrap">기타:</span>'
  +   '<input type="text" id="edit-asset-live-etc" value="" style="width:60px;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<span style="font-size:11px;white-space:nowrap">거주주택:</span>'
  +   '<select id="edit-asset-house-type" ' + S + '><option>선택</option><option>아파트</option><option>주택</option><option>빌라</option><option>오피스텔</option></select>'
  + '</div></td>'
  + '<td style="' + L + '">결혼후거주</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:3px;align-items:center">'
  +   '<select id="edit-asset-marry-live" ' + S + '><option>선택</option><option>자가</option><option>전세</option><option>월세</option><option>기타</option></select>'
  +   '<span style="font-size:11px;white-space:nowrap">기타:</span>'
  +   '<input type="text" id="edit-asset-marry-etc" value="" style="width:60px;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  +   '<span style="font-size:11px;white-space:nowrap">거주주택:</span>'
  +   '<select id="edit-asset-marry-house" ' + S + '><option>선택</option><option>아파트</option><option>주택</option><option>빌라</option><option>오피스텔</option></select>'
  + '</div></td>'
  + '</tr>'

  // Row2: 본인재산 | [금융자산 억원 부동산 억원 기타 억원] | 본인(구체적) | [select 평 차량보유 select 차종]
  + '<tr>'
  + '<td style="' + L + '">본인재산</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:2px;align-items:center">'
  +   '<span style="font-size:11px;white-space:nowrap">금융자산</span>'
  +   '<input type="text" id="edit-asset-fin" value="0" style="width:40px;padding:1px 3px;font-size:11px;border:1px solid #bbb;text-align:right">'
  +   '<span style="font-size:11px;white-space:nowrap">억원</span>'
  +   '<span style="font-size:11px;white-space:nowrap">부동산</span>'
  +   '<input type="text" id="edit-asset-real" value="0" style="width:40px;padding:1px 3px;font-size:11px;border:1px solid #bbb;text-align:right">'
  +   '<span style="font-size:11px;white-space:nowrap">억원</span>'
  +   '<span style="font-size:11px;white-space:nowrap">기타</span>'
  +   '<input type="text" id="edit-asset-etc" value="0" style="width:40px;padding:1px 3px;font-size:11px;border:1px solid #bbb;text-align:right">'
  +   '<span style="font-size:11px;white-space:nowrap">억원</span>'
  + '</div></td>'
  + '<td style="' + L + '">본인(구체적)</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:2px;align-items:center">'
  +   '<select id="edit-asset-own-detail" ' + S + '><option>선택</option></select>'
  +   '<input type="text" id="edit-asset-own-size" value="0" style="width:35px;padding:1px 3px;font-size:11px;border:1px solid #bbb;text-align:right">'
  +   '<span style="font-size:11px;white-space:nowrap">평</span>'
  +   '<span style="font-size:11px;white-space:nowrap">차량보유</span>'
  +   '<select id="edit-asset-car" ' + S + '><option>선택</option><option>유</option><option>무</option></select>'
  +   '<span style="font-size:11px;white-space:nowrap">차종:</span>'
  +   '<input type="text" id="edit-asset-car-model" value="" style="width:60px;padding:1px 3px;font-size:11px;border:1px solid #bbb">'
  + '</div></td>'
  + '</tr>'

  // Row3: 본인재산(구체적) | [주거양식: input] | 인증틈 | [input]
  + '<tr>'
  + '<td style="' + L + '">본인재산(구체적)</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:3px;align-items:center">'
  +   '<span style="font-size:11px;white-space:nowrap">주거양식:</span>'
  +   '<input type="text" id="edit-asset-housing-style" value="" ' + I + '>'
  + '</div></td>'
  + '<td style="' + L + '">인증틈</td>'
  + '<td style="' + V + '"><input type="text" id="edit-asset-cert-gap" value="" ' + I + '></td>'
  + '</tr>'

  // Row4: 가족재산 | [금융자산 억원 부동산 억원 기타 억원] | 가족재산(구체적) | [input]
  + '<tr>'
  + '<td style="' + L + '">가족재산</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:2px;align-items:center">'
  +   '<span style="font-size:11px;white-space:nowrap">금융자산</span>'
  +   '<input type="text" id="edit-asset-fam-fin" value="0" style="width:40px;padding:1px 3px;font-size:11px;border:1px solid #bbb;text-align:right">'
  +   '<span style="font-size:11px;white-space:nowrap">억원</span>'
  +   '<span style="font-size:11px;white-space:nowrap">부동산</span>'
  +   '<input type="text" id="edit-asset-fam-real" value="0" style="width:40px;padding:1px 3px;font-size:11px;border:1px solid #bbb;text-align:right">'
  +   '<span style="font-size:11px;white-space:nowrap">억원</span>'
  +   '<span style="font-size:11px;white-space:nowrap">기타</span>'
  +   '<input type="text" id="edit-asset-fam-etc" value="0" style="width:40px;padding:1px 3px;font-size:11px;border:1px solid #bbb;text-align:right">'
  +   '<span style="font-size:11px;white-space:nowrap">억원</span>'
  + '</div></td>'
  + '<td style="' + L + '">가족재산(구체적)</td>'
  + '<td style="' + V + '"><input type="text" id="edit-asset-fam-detail" value="" ' + I + '></td>'
  + '</tr>'

  // Row5: 가족재산(인증틈) | input (colspan=3)
  + '<tr>'
  + '<td style="' + L + '">가족재산(인증틈)</td>'
  + '<td style="' + V + '" colspan="3"><input type="text" id="edit-asset-fam-cert" value="" ' + I + '></td>'
  + '</tr>'

  + '</tbody></table>'

  /* ===== 학력 ===== */
  + secHdr('학력')

  // ── 추가 버튼 영역
  + '<div style="display:flex;align-items:center;justify-content:flex-end;margin:4px 0 2px">'
  + '  <button type="button" id="btn-add-edu" style="font-size:11px;padding:2px 12px;border:1px solid #1a3a5c;background:#1a3a5c;color:#fff;cursor:pointer;border-radius:2px">+ 추가하기</button>'
  + '</div>'

  // ── 학력 테이블
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup>'
  + '<col style="width:12%">'  // 구분
  + '<col style="width:18%">'  // 학교명
  + '<col style="width:14%">'  // 전공
  + '<col style="width:12%">'  // 소재지
  + '<col style="width:8%">'   // 졸업여부
  + '<col style="width:10%">'  // 입학년도
  + '<col style="width:10%">'  // 졸업년도
  + '<col style="width:8%">'   // 기간
  + '<col style="width:8%">'   // 삭제
  + '</colgroup>'
  + '<thead>'
  + '<tr>'
  + '  <th style="' + L + '">구분</th>'
  + '  <th style="' + L + '">학교명</th>'
  + '  <th style="' + L + '">전공</th>'
  + '  <th style="' + L + '">소재지</th>'
  + '  <th style="' + L + '">졸업여부</th>'
  + '  <th style="' + L + '">입학년도</th>'
  + '  <th style="' + L + '">졸업년도</th>'
  + '  <th style="' + L + '">기간</th>'
  + '  <th style="' + L + '">삭제</th>'
  + '</tr>'
  + '</thead>'
  + '<tbody id="edu-table-body">'
  + '</tbody>'
  + '</table>'

  // ── 어학연수정보
  + '<div style="display:flex;align-items:center;justify-content:space-between;margin:10px 0 2px">'
  + '  <span style="font-size:12px;font-weight:600;color:#333;border-left:3px solid #1a3a5c;padding-left:6px">어학연수</span>'
  + '  <button type="button" id="btn-add-lang" style="font-size:11px;padding:2px 12px;border:1px solid #1a3a5c;background:#1a3a5c;color:#fff;cursor:pointer;border-radius:2px">+ 추가하기</button>'
  + '</div>'
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup>'
  + '<col style="width:15%">'  // 국가
  + '<col style="width:12%">'  // 시작년도
  + '<col style="width:12%">'  // 종료년도
  + '<col style="width:8%">'   // 기간
  + '<col style="width:43%">'  // 연수학교명
  + '<col style="width:10%">'  // 삭제
  + '</colgroup>'
  + '<thead>'
  + '<tr>'
  + '  <th style="' + L + '">국가</th>'
  + '  <th style="' + L + '">시작년도</th>'
  + '  <th style="' + L + '">종료년도</th>'
  + '  <th style="' + L + '">기간</th>'
  + '  <th style="' + L + '">연수학교명</th>'
  + '  <th style="' + L + '">삭제</th>'
  + '</tr>'
  + '</thead>'
  + '<tbody id="lang-table-body">'
  + '</tbody>'
  + '</table>'

  /* ===== 직장 ===== */
  + secHdr('직장')

  // ── 소득종류 / 연수입 / 기타수입 (1행 6열)
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:4px">'
  + '<colgroup><col style="width:8%"><col style="width:27%"><col style="width:7%"><col style="width:18%"><col style="width:8%"><col style="width:32%"></colgroup>'
  + '<tbody>'
  + '<tr>'
  + '<td style="' + L + '">소득종류</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:6px;align-items:center">'
  +   '<select id="edit-income-type" style="font-size:11px;padding:1px 3px;border:1px solid #bbb;width:90px"><option>급여소득자</option><option>사업소득자</option><option>기타소득</option><option>무소득</option></select>'
  +   '<label style="font-size:11px;white-space:nowrap;margin-left:8px"><input type="radio" name="edit-employ-type" value="정규직"> 정규직</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="radio" name="edit-employ-type" value="비정규직"> 비정규직</label>'
  + '</div></td>'
  + '<td style="' + L + '">연수입</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:3px;align-items:center"><input type="text" id="edit-annual-income" value="0" style="flex:1;padding:1px 3px;font-size:11px;border:1px solid #bbb;text-align:right"><span style="font-size:11px;white-space:nowrap">만원</span></div></td>'
  + '<td style="' + L + '">기타수입</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:3px;align-items:center"><input type="text" id="edit-other-income" value="" style="flex:1;padding:1px 3px;font-size:11px;border:1px solid #bbb"><span style="font-size:11px;white-space:nowrap">원</span></div></td>'
  + '</tr>'
  + '</tbody></table>'

  // ── 추가 버튼 영역
  + '<div style="display:flex;align-items:center;justify-content:flex-end;margin:4px 0 2px">'
  + '  <button type="button" id="btn-add-job" style="font-size:11px;padding:2px 12px;border:1px solid #1a3a5c;background:#1a3a5c;color:#fff;cursor:pointer;border-radius:2px">+ 추가하기</button>'
  + '</div>'

  // ── 직장 테이블
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup>'
  + '<col style="width:14%">'  // 직장명
  + '<col style="width:10%">'  // 업종
  + '<col style="width:8%">'   // 종업원수
  + '<col style="width:8%">'   // 부서
  + '<col style="width:8%">'   // 직위
  + '<col style="width:9%">'   // 입사년월
  + '<col style="width:10%">'  // 소재지
  + '<col style="width:9%">'   // 기업형태
  + '<col style="width:18%">'  // 구체적인 설명
  + '<col style="width:6%">'   // 삭제
  + '</colgroup>'
  + '<thead>'
  + '<tr>'
  + '  <th style="' + L + '">직장명</th>'
  + '  <th style="' + L + '">업종</th>'
  + '  <th style="' + L + '">종업원수</th>'
  + '  <th style="' + L + '">부서</th>'
  + '  <th style="' + L + '">직위</th>'
  + '  <th style="' + L + '">입사년월</th>'
  + '  <th style="' + L + '">소재지</th>'
  + '  <th style="' + L + '">기업형태</th>'
  + '  <th style="' + L + '">구체적인 설명</th>'
  + '  <th style="' + L + '">삭제</th>'
  + '</tr>'
  + '</thead>'
  + '<tbody id="job-table-body">'
  + '</tbody>'
  + '</table>'

  /* ===== 신체정보 ===== */
  + secHdr('신체정보')
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup><col style="width:9%"><col style="width:16%"><col style="width:9%"><col style="width:16%"><col style="width:9%"><col style="width:16%"><col style="width:9%"><col style="width:16%"></colgroup>'
  + '<tbody>'

  // Row1: 시력 / 안경 / 혈액형 / 청력
  + '<tr>'
  + '<td style="' + L + '">시력</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:4px;align-items:center">'
  +   '<span style="font-size:11px;white-space:nowrap">좌:</span><input type="text" id="edit-sight-l" value="" style="width:30px;font-size:11px;padding:1px 2px;border:1px solid #bbb;text-align:center">'
  +   '<span style="font-size:11px;white-space:nowrap">우:</span><input type="text" id="edit-sight-r" value="" style="width:30px;font-size:11px;padding:1px 2px;border:1px solid #bbb;text-align:center">'
  + '</div></td>'
  + '<td style="' + L + '">안경</td>'
  + '<td style="' + V + '"><select id="edit-glasses" ' + S + '><option>선택</option><option>미착용</option><option>착용</option><option>콘택트</option></select></td>'
  + '<td style="' + L + '">혈액형</td>'
  + '<td style="' + V + '"><select id="edit-blood" ' + S + '><option>선택</option><option>A</option><option>B</option><option>O</option><option>AB</option></select></td>'
  + '<td style="' + L + '">청력</td>'
  + '<td style="' + V + '"><select id="edit-hearing" ' + S + '><option>선택</option><option>정상</option><option>이상</option></select></td>'
  + '</tr>'

  // Row2: 건강 / 언어 / 얼굴형 / 음주
  + '<tr>'
  + '<td style="' + L + '">건강</td>'
  + '<td style="' + V + '"><select id="edit-health" ' + S + '><option>선택</option><option>건강</option><option>보통</option><option>허약</option></select></td>'
  + '<td style="' + L + '">언어</td>'
  + '<td style="' + V + '"><select id="edit-language" ' + S + '><option>선택</option><option>영어가능</option><option>일어가능</option><option>중국어가능</option><option>기타</option><option>해당없음</option></select></td>'
  + '<td style="' + L + '">얼굴형</td>'
  + '<td style="' + V + '"><select id="edit-face" ' + S + '><option>선택</option><option>둥근형</option><option>계란형</option><option>각진형</option><option>긴형</option><option>기타</option></select></td>'
  + '<td style="' + L + '">음주</td>'
  + '<td style="' + V + '"><select id="edit-drink" ' + S + '><option>선택</option><option>안함</option><option>가끔</option><option>자주</option></select></td>'
  + '</tr>'

  // Row3: 흡연 / 범죄이력 / 신장 / 체중
  + '<tr>'
  + '<td style="' + L + '">흡연</td>'
  + '<td style="' + V + '"><select id="edit-smoke" ' + S + '><option>선택</option><option>안한다</option><option>한다</option></select></td>'
  + '<td style="' + L + '">범죄이력</td>'
  + '<td style="' + V + '"><select id="edit-crime" ' + S + '><option>선택</option><option>없다</option><option>있다</option></select></td>'
  + '<td style="' + L + '">신장</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:3px;align-items:center"><input type="text" id="edit-height" value="" style="flex:1;font-size:11px;padding:1px 3px;border:1px solid #bbb;text-align:right"><span style="font-size:11px">cm</span></div></td>'
  + '<td style="' + L + '">체중</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:3px;align-items:center"><input type="text" id="edit-weight" value="" style="flex:1;font-size:11px;padding:1px 3px;border:1px solid #bbb;text-align:right"><span style="font-size:11px">kg</span></div></td>'
  + '</tr>'

  + '</tbody></table>'

  /* ===== 기타정보 ===== */
  + secHdr('기타정보')
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup><col style="width:9%"><col style="width:16%"><col style="width:9%"><col style="width:16%"><col style="width:9%"><col style="width:16%"><col style="width:9%"><col style="width:16%"></colgroup>'
  + '<tbody>'

  // Row1: 특기 / 병역 / 미필사유 / 자격면허
  + '<tr>'
  + '<td style="' + L + '">특기</td>'
  + '<td style="' + V + '"><input type="text" id="edit-specialty" value="" ' + I + '></td>'
  + '<td style="' + L + '">병역</td>'
  + '<td style="' + V + '"><select id="edit-military" ' + S + '><option>선택</option><option>무관</option><option>필</option><option>미필</option><option>면제</option></select></td>'
  + '<td style="' + L + '">미필사유</td>'
  + '<td style="' + V + '"><input type="text" id="edit-military-reason" value="" ' + I + '></td>'
  + '<td style="' + L + '">자격면허</td>'
  + '<td style="' + V + '"><input type="text" id="edit-license" value="" ' + I + '></td>'
  + '</tr>'

  // Row2: 동성동본 / 종교 / 본인신앙 / 부모신앙
  + '<tr>'
  + '<td style="' + L + '">동성동본</td>'
  + '<td style="' + V + '"><select id="edit-same-clan" ' + S + '><option>선택</option><option>상관없음</option><option>안됨</option></select></td>'
  + '<td style="' + L + '">종교</td>'
  + '<td style="' + V + '"><select id="edit-religion" ' + S + '><option>선택</option><option>무교</option><option>기독교</option><option>천주교</option><option>불교</option><option>기타</option></select></td>'
  + '<td style="' + L + '">본인신앙</td>'
  + '<td style="' + V + '"><select id="edit-self-faith" ' + S + '><option>선택</option><option>있음</option><option>없음</option></select></td>'
  + '<td style="' + L + '">부모신앙</td>'
  + '<td style="' + V + '"><select id="edit-parent-faith" ' + S + '><option>선택</option><option>있음</option><option>없음</option></select></td>'
  + '</tr>'

  // Row3: 맞벌이 / 상대방 / 연상연하
  + '<tr>'
  + '<td style="' + L + '">맞벌이</td>'
  + '<td style="' + V + '"><select id="edit-dual-income" ' + S + '><option>선택</option><option>본인:선택</option><option>상대방:선택</option></select></td>'
  + '<td style="' + L + '">상대방</td>'
  + '<td style="' + V + '"><select id="edit-partner-pref" ' + S + '><option>선택</option></select></td>'
  + '<td style="' + L + '">연상연하</td>'
  + '<td style="' + V + '"><select id="edit-age-pref" ' + S + '><option>선택</option><option>연상</option><option>연하</option><option>동갑</option><option>상관없음</option></select></td>'
  + '<td colspan="2" style="' + V + '"></td>'
  + '</tr>'

  // Row4: 소개가능지역 (체크박스)
  + '<tr>'
  + '<td style="' + L + '">소개가능<br>지역</td>'
  + '<td colspan="7" style="' + V + '"><div style="display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center">'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-intro-area" value="크게중요치않다"> 크게중요치않다</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-intro-area" value="서울(경기/인천)"> 서울(경기/인천)</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-intro-area" value="대전,충청"> 대전,충청</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-intro-area" value="대구,경북"> 대구,경북</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-intro-area" value="부산,경남"> 부산,경남</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-intro-area" value="광주,전라"> 광주,전라</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-intro-area" value="강원도"> 강원도</label>'
  + '</div></td>'
  + '</tr>'

  // Row5: 결혼후 거주가능지역 (체크박스)
  + '<tr>'
  + '<td style="' + L + '">결혼후<br>거주가능<br>지역</td>'
  + '<td colspan="7" style="' + V + '"><div style="display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center">'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-marry-area" value="크게중요치않다"> 크게중요치않다</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-marry-area" value="서울(경기/인천)"> 서울(경기/인천)</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-marry-area" value="대전,충청"> 대전,충청</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-marry-area" value="대구,경북"> 대구,경북</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-marry-area" value="부산,경남"> 부산,경남</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-marry-area" value="광주,전라"> 광주,전라</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-marry-area" value="강원도"> 강원도</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-marry-area" value="기타,해외"> 기타,해외</label>'
  + '</div></td>'
  + '</tr>'

  + '</tbody></table>'

  + '</div>' /* end tab-member */

  /* ===== 탭2: 가족정보 ===== */
  + '<div id="tab-family" class="edit-tab-panel" style="display:none;padding-top:12px">'

  /* ===== 가족사항 ===== */
  + secHdr('가족사항')

  // ── 추가 버튼 영역
  + '<div style="display:flex;align-items:center;justify-content:flex-end;margin:4px 0 2px">'
  + '  <button type="button" id="btn-add-family" style="font-size:11px;padding:2px 12px;border:1px solid #1a3a5c;background:#1a3a5c;color:#fff;cursor:pointer;border-radius:2px">+ 추가하기</button>'
  + '</div>'

  // ── 가족사항 테이블
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup>'
  + '<col style="width:10%">'  // 가족관계
  + '<col style="width:9%">'   // 성명
  + '<col style="width:7%">'   // 년도
  + '<col style="width:10%">'  // 학력
  + '<col style="width:15%">'  // 직업
  + '<col style="width:8%">'   // 동거여부
  + '<col style="width:8%">'   // 결혼여부
  + '<col style="width:12%">'  // 거주지
  + '<col style="width:13%">'  // 비고
  + '<col style="width:8%">'   // 삭제
  + '</colgroup>'
  + '<thead>'
  + '<tr>'
  + '  <th style="' + L + '">가족관계</th>'
  + '  <th style="' + L + '">성명</th>'
  + '  <th style="' + L + '">년도</th>'
  + '  <th style="' + L + '">학력</th>'
  + '  <th style="' + L + '">직업</th>'
  + '  <th style="' + L + '">동거여부</th>'
  + '  <th style="' + L + '">결혼여부</th>'
  + '  <th style="' + L + '">거주지</th>'
  + '  <th style="' + L + '">비고</th>'
  + '  <th style="' + L + '">삭제</th>'
  + '</tr>'
  + '</thead>'
  + '<tbody id="family-table-body">'
  + '</tbody>'
  + '</table>'

  /* ===== 재혼정보 ===== */
  + secHdr('재혼정보')

  // ── 추가 버튼 영역
  + '<div style="display:flex;align-items:center;justify-content:flex-end;margin:4px 0 2px">'
  + '  <button type="button" id="btn-add-remarry" style="font-size:11px;padding:2px 12px;border:1px solid #1a3a5c;background:#1a3a5c;color:#fff;cursor:pointer;border-radius:2px">+ 추가하기</button>'
  + '</div>'

  // ── 재혼정보 테이블
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup>'
  + '<col style="width:9%">'   // 구분
  + '<col style="width:9%">'   // 결혼년도
  + '<col style="width:14%">'  // 결혼기간
  + '<col style="width:16%">'  // 이혼사유
  + '<col style="width:12%">'  // 자녀
  + '<col style="width:10%">'  // 자녀양육
  + '<col style="width:22%">'  // 추가사항
  + '<col style="width:8%">'   // 삭제
  + '</colgroup>'
  + '<thead>'
  + '<tr>'
  + '  <th style="' + L + '">구분</th>'
  + '  <th style="' + L + '">결혼년도</th>'
  + '  <th style="' + L + '">결혼기간</th>'
  + '  <th style="' + L + '">이혼사유</th>'
  + '  <th style="' + L + '">자녀</th>'
  + '  <th style="' + L + '">자녀양육</th>'
  + '  <th style="' + L + '">추가사항</th>'
  + '  <th style="' + L + '">삭제</th>'
  + '</tr>'
  + '</thead>'
  + '<tbody id="remarry-table-body">'
  + '</tbody>'
  + '</table>'

  /* ===== 자녀정보 ===== */
  + secHdr('자녀정보')

  + '<div style="display:flex;align-items:center;justify-content:flex-end;margin:4px 0 2px">'
  + '  <button type="button" id="btn-add-child" style="font-size:11px;padding:2px 12px;border:1px solid #1a3a5c;background:#1a3a5c;color:#fff;cursor:pointer;border-radius:2px">+ 추가하기</button>'
  + '</div>'

  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup>'
  + '<col style="width:6%">'
  + '<col style="width:8%">'
  + '<col style="width:8%">'
  + '<col style="width:8%">'
  + '<col style="width:10%">'
  + '<col style="width:8%">'
  + '<col style="width:7%">'
  + '<col style="width:11%">'
  + '<col style="width:8%">'
  + '<col style="width:8%">'
  + '<col style="width:12%">'
  + '<col style="width:6%">'
  + '</colgroup>'
  + '<thead>'
  + '<tr>'
  + '  <th style="' + L + '">성별</th>'
  + '  <th style="' + L + '">성명</th>'
  + '  <th style="' + L + '">출생년도</th>'
  + '  <th style="' + L + '">학력</th>'
  + '  <th style="' + L + '">직업</th>'
  + '  <th style="' + L + '">동거여부</th>'
  + '  <th style="' + L + '">결혼</th>'
  + '  <th style="' + L + '">거주지</th>'
  + '  <th style="' + L + '">양육권</th>'
  + '  <th style="' + L + '">친권</th>'
  + '  <th style="' + L + '">비고</th>'
  + '  <th style="' + L + '">삭제</th>'
  + '</tr>'
  + '</thead>'
  + '<tbody id="child-table-body">'
  + '</tbody>'
  + '</table>'

  + '</div>' /* end tab-family */

  /* ===== 탭3: 희망상대 ===== */
  + '<div id="tab-partner" class="edit-tab-panel" style="display:none;padding-top:12px">'

  /* ── 희망상대 조건 ── */
  + secHdr('희망 상대 조건')
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup><col style="width:9%"><col style="width:16%"><col style="width:9%"><col style="width:16%"><col style="width:9%"><col style="width:16%"><col style="width:9%"><col style="width:16%"></colgroup>'
  + '<tbody>'

  // Row1: 희망나이 / 희망신장
  + '<tr>'
  + '<td style="' + L + '">희망나이</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:3px;align-items:center"><input type="text" id="edit-hope-age-min" value="" style="width:35px;font-size:11px;padding:1px 3px;border:1px solid #bbb;text-align:center"><span style="font-size:11px">~</span><input type="text" id="edit-hope-age-max" value="" style="width:35px;font-size:11px;padding:1px 3px;border:1px solid #bbb;text-align:center"><span style="font-size:11px">세</span></div></td>'
  + '<td style="' + L + '">희망신장</td>'
  + '<td style="' + V + '"><div style="display:flex;gap:3px;align-items:center"><input type="text" id="edit-hope-height-min" value="" style="width:35px;font-size:11px;padding:1px 3px;border:1px solid #bbb;text-align:center"><span style="font-size:11px">~</span><input type="text" id="edit-hope-height-max" value="" style="width:35px;font-size:11px;padding:1px 3px;border:1px solid #bbb;text-align:center"><span style="font-size:11px">cm</span></div></td>'
  + '<td style="' + L + '">희망체형</td>'
  + '<td style="' + V + '"><select id="edit-hope-body" ' + S + '><option>선택</option><option>마름</option><option>보통</option><option>건장</option><option>통통</option><option>상관없음</option></select></td>'
  + '<td style="' + L + '">희망학력</td>'
  + '<td style="' + V + '"><select id="edit-hope-edu" ' + S + '><option>선택</option><option>고졸이상</option><option>전문대졸이상</option><option>대졸이상</option><option>석사이상</option><option>상관없음</option></select></td>'
  + '</tr>'

  // Row2: 희망종교 / 흡연 / 음주 / 혈액형
  + '<tr>'
  + '<td style="' + L + '">희망종교</td>'
  + '<td style="' + V + '"><select id="edit-hope-religion" ' + S + '><option>선택</option><option>무교</option><option>기독교</option><option>천주교</option><option>불교</option><option>상관없음</option></select></td>'
  + '<td style="' + L + '">흡연</td>'
  + '<td style="' + V + '"><select id="edit-hope-smoke" ' + S + '><option>선택</option><option>안한다</option><option>상관없음</option></select></td>'
  + '<td style="' + L + '">음주</td>'
  + '<td style="' + V + '"><select id="edit-hope-drink" ' + S + '><option>선택</option><option>안함</option><option>가끔</option><option>상관없음</option></select></td>'
  + '<td style="' + L + '">혈액형</td>'
  + '<td style="' + V + '"><select id="edit-hope-blood" ' + S + '><option>선택</option><option>A</option><option>B</option><option>O</option><option>AB</option><option>상관없음</option></select></td>'
  + '</tr>'

  // Row3: 희망연수입 / 재혼여부 / 자녀여부 / 결혼시기
  + '<tr>'
  + '<td style="' + L + '">희망연수입</td>'
  + '<td style="' + V + '"><select id="edit-hope-income" ' + S + '><option>선택</option><option>2,000만원이상</option><option>3,000만원이상</option><option>4,000만원이상</option><option>5,000만원이상</option><option>7,000만원이상</option><option>1억이상</option><option>상관없음</option></select></td>'
  + '<td style="' + L + '">재혼여부</td>'
  + '<td style="' + V + '"><select id="edit-hope-remarry" ' + S + '><option>선택</option><option>초혼만</option><option>재혼가능</option><option>상관없음</option></select></td>'
  + '<td style="' + L + '">자녀여부</td>'
  + '<td style="' + V + '"><select id="edit-hope-child" ' + S + '><option>선택</option><option>무자녀만</option><option>자녀있어도됨</option><option>상관없음</option></select></td>'
  + '<td style="' + L + '">결혼시기</td>'
  + '<td style="' + V + '"><select id="edit-hope-marry-time" ' + S + '><option>선택</option><option>6개월이내</option><option>1년이내</option><option>2년이내</option><option>미정</option></select></td>'
  + '</tr>'

  + '</tbody></table>'

  /* ── 희망직업 ── */
  + secHdr('희망 직업')
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup><col style="width:9%"><col style="width:91%"></colgroup>'
  + '<tbody>'
  + '<tr>'
  + '<td style="' + L + '">직업</td>'
  + '<td style="' + V + '"><div style="display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center">'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="공무원"> 공무원</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="공기업"> 공기업</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="대기업"> 대기업</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="중견기업"> 중견기업</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="중소기업"> 중소기업</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="전문직"> 전문직(의사,변호사,회계사)</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="의료인"> 의료인(의사,치과,한의사)</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="교수"> 교수,강사</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="교사"> 교사(초/중/고)</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="금융"> 금융/증권/보험</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="IT"> IT/개발</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="자영업"> 자영업</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="프리랜서"> 프리랜서</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="연구원"> 연구원/연구직</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="외국계"> 외국계</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-hope-job" value="기타"> 기타</label>'
  + '</div></td>'
  + '</tr>'
  + '</tbody></table>'

  /* ── 선호하는 비교순 ── */
  + secHdr('선호하는 비교 우선순위')
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup><col style="width:5%"><col style="width:95%"></colgroup>'
  + '<tbody>'
  + '<tr><td style="' + L + '">1순위</td><td style="' + V + '"><input type="text" id="edit-hope-pri1" value="" placeholder="외모(얼굴,키,몸매 등) / 성격,인성 / 직업,능력 / 학벌 / 재력 / 집안 등" ' + I + '></td></tr>'
  + '<tr><td style="' + L + '">2순위</td><td style="' + V + '"><input type="text" id="edit-hope-pri2" value="" placeholder="" ' + I + '></td></tr>'
  + '<tr><td style="' + L + '">3순위</td><td style="' + V + '"><input type="text" id="edit-hope-pri3" value="" placeholder="" ' + I + '></td></tr>'
  + '</tbody></table>'

  /* ── 자신의 PR ── */
  + secHdr('자신의 PR')
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup><col style="width:50%"><col style="width:50%"></colgroup>'
  + '<tbody>'
  + '<tr>'
  + '<td style="' + V + ';vertical-align:top">'
  + '<div style="font-size:11px;font-weight:700;color:#333;margin-bottom:4px">본인의 PR · 어필포인트</div>'
  + '<textarea id="edit-pr-self" rows="5" style="width:100%;font-size:11px;padding:4px;border:1px solid #bbb;resize:vertical" placeholder="본인의 장점, 성격, 매력포인트 등을 자유롭게 작성하세요"></textarea>'
  + '<div style="font-size:11px;font-weight:700;color:#333;margin:8px 0 4px">본인의 성격 및 스타일</div>'
  + '<textarea id="edit-pr-personality" rows="3" style="width:100%;font-size:11px;padding:4px;border:1px solid #bbb;resize:vertical" placeholder="성격, 생활 패턴, 연애 스타일 등"></textarea>'
  + '<div style="font-size:11px;font-weight:700;color:#333;margin:8px 0 4px">좋아하거나 가장 자신있는 것?</div>'
  + '<textarea id="edit-pr-best" rows="3" style="width:100%;font-size:11px;padding:4px;border:1px solid #bbb;resize:vertical" placeholder=""></textarea>'
  + '<div style="font-size:11px;font-weight:700;color:#333;margin:8px 0 4px">남들이 어기다는 본인의 매력은?</div>'
  + '<textarea id="edit-pr-charm" rows="3" style="width:100%;font-size:11px;padding:4px;border:1px solid #bbb;resize:vertical" placeholder=""></textarea>'
  + '</td>'
  + '<td style="' + V + ';vertical-align:top">'
  + '<div style="font-size:11px;font-weight:700;color:#333;margin-bottom:4px">커플되는 여건</div>'
  + '<table style="width:100%;border-collapse:collapse">'
  + '<tr><td style="font-size:11px;padding:3px 4px;border:1px solid #ddd;width:80px;background:#f5f5f5">집</td><td style="font-size:11px;padding:3px 4px;border:1px solid #ddd"><div style="display:flex;gap:6px;align-items:center"><select id="edit-cpl-house-type" style="font-size:11px;padding:1px 3px;border:1px solid #bbb"><option>선택</option><option>매매</option><option>전세</option><option>월세</option></select><input type="text" id="edit-cpl-house" style="flex:1;font-size:11px;padding:1px 3px;border:1px solid #bbb" placeholder="상세"></div></td></tr>'
  + '<tr><td style="font-size:11px;padding:3px 4px;border:1px solid #ddd;background:#f5f5f5">생활 및 교통비</td><td style="font-size:11px;padding:3px 4px;border:1px solid #ddd"><input type="text" id="edit-cpl-living" style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb" placeholder=""></td></tr>'
  + '<tr><td style="font-size:11px;padding:3px 4px;border:1px solid #ddd;background:#f5f5f5">차량 및 수입차</td><td style="font-size:11px;padding:3px 4px;border:1px solid #ddd"><input type="text" id="edit-cpl-car" style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb" placeholder=""></td></tr>'
  + '</table>'
  + '<div style="font-size:11px;font-weight:700;color:#333;margin:8px 0 4px">취미사항</div>'
  + '<textarea id="edit-pr-hobby" rows="3" style="width:100%;font-size:11px;padding:4px;border:1px solid #bbb;resize:vertical" placeholder="취미, 관심사 등"></textarea>'
  + '</td>'
  + '</tr>'
  + '</tbody></table>'

  /* ── 매체를 알게된 경위 ── */
  + secHdr('매체를 알게된 경위')
  + '<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px">'
  + '<colgroup><col style="width:9%"><col style="width:91%"></colgroup>'
  + '<tbody>'
  + '<tr>'
  + '<td style="' + L + '">경위</td>'
  + '<td style="' + V + '"><div style="display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center">'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-media" value="지인소개"> 지인소개</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-media" value="관리컨설팅"> 관리컨설팅</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-media" value="SNS"> SNS</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-media" value="지면광고"> 지면광고</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-media" value="TV방송"> TV방송</label>'
  +   '<label style="font-size:11px;white-space:nowrap"><input type="checkbox" name="edit-media" value="외부협업"> 외부협업</label>'
  + '</div></td>'
  + '</tr>'
  + '<tr>'
  + '<td style="' + L + '">기타</td>'
  + '<td style="' + V + '"><input type="text" id="edit-media-etc" value="" ' + I + '></td>'
  + '</tr>'
  + '</tbody></table>'

  + '</div>' /* end tab-partner */

  + '<div style="display:flex;justify-content:center;gap:10px;padding:20px 0;margin-top:24px">'
  + '  <button class="btn btn--ghost" id="btn-cancel-bottom" style="font-size:12px;padding:5px 28px;border:1px solid #aaa">취소</button>'
  + '  <button class="btn btn--primary" id="btn-save-bottom" style="font-size:12px;padding:5px 28px;background:#1a3a5c;border-color:#1a3a5c">저장하기</button>'
  + '</div>';

/* ── 탭 전환 이벤트 ── */
document.querySelectorAll('.edit-tab').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var target = this.getAttribute('data-tab');
    document.querySelectorAll('.edit-tab-panel').forEach(function(p) {
      p.style.display = p.id === target ? '' : 'none';
    });
    document.querySelectorAll('.edit-tab').forEach(function(t) {
      var isActive = t.getAttribute('data-tab') === target;
      t.style.background = isActive ? '#1a3a5c' : '#f0f0f0';
      t.style.color = isActive ? '#fff' : '#555';
      t.style.borderColor = isActive ? '#1a3a5c' : '#ccc';
    });
  });
});

/* ── 이벤트 ── */
function goBack() {
  window.location.href = '/pages/regular/detail.html?id=' + m.id;
}

document.getElementById('btn-cancel').addEventListener('click', goBack);
document.getElementById('btn-cancel-bottom').addEventListener('click', goBack);

function handleSave() {
  m.consultantManager = document.getElementById('edit-consultant').value;
  m.matchingManager = document.getElementById('edit-matcher').value;
  m.program = document.getElementById('edit-program').value;
  m.status = document.getElementById('edit-status').value;
  m.branch = document.getElementById('edit-branch').value;
  m.joinDate = document.getElementById('edit-join-date').value || m.joinDate;
  m.contractType = document.getElementById('edit-contract').value;

  Toast.show('회원 정보가 저장되었습니다.', 'success');
  setTimeout(goBack, 1000);
}

document.getElementById('btn-save').addEventListener('click', handleSave);
document.getElementById('btn-save-bottom').addEventListener('click', handleSave);

/* ── 년도 옵션 생성 + 기간 계산 공용 ── */
var yearOpts = '<option value="">선택</option>';
for (var yy = 2035; yy >= 1980; yy--) { yearOpts += '<option value="' + yy + '">' + yy + '</option>'; }
var SEL_Y = 'style="width:100%;font-size:11px;padding:1px 2px;border:1px solid #bbb"';

function calcYearPeriod(startEl, endEl, cell) {
  var s = parseInt(startEl.value), e = parseInt(endEl.value);
  if (!s || !e) { cell.textContent = '-'; return; }
  var diff = e - s;
  cell.textContent = diff > 0 ? diff + '년' : '-';
}

/* ── 학력 행 추가/삭제 ── */
(function() {
  var eduIdx = 0;
  var eduBody = document.getElementById('edu-table-body');
  var V = 'font-size:11px;padding:3px 4px;border:1px solid #ddd;vertical-align:middle';

  document.getElementById('btn-add-edu').addEventListener('click', function() {
    eduIdx++;
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td style="' + V + '">'
      + '<select style="width:100%;font-size:11px;padding:1px 2px;border:1px solid #bbb">'
      + '<option>선택</option><option>고등학교</option><option>전문대학교</option><option>대학교</option>'
      + '<option>대학원(석사)</option><option>대학원(박사)</option><option>기타</option><option>유학</option>'
      + '</select></td>'
      + '<td style="' + V + '"><input type="text" style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb"></td>'
      + '<td style="' + V + '"><input type="text" style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb"></td>'
      + '<td style="' + V + '"><input type="text" style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb"></td>'
      + '<td style="' + V + '">'
      + '<select style="width:100%;font-size:11px;padding:1px 2px;border:1px solid #bbb">'
      + '<option>선택</option><option>졸업</option><option>재학</option><option>중퇴</option><option>휴학</option><option>수료</option>'
      + '</select></td>'
      + '<td style="' + V + '"><select class="edu-start" ' + SEL_Y + '>' + yearOpts + '</select></td>'
      + '<td style="' + V + '"><select class="edu-end" ' + SEL_Y + '>' + yearOpts + '</select></td>'
      + '<td style="' + V + ';text-align:center" class="edu-period">-</td>'
      + '<td style="' + V + ';text-align:center"><button type="button" class="btn-del-edu" style="font-size:10px;padding:1px 8px;border:1px solid #c00;background:#fff;color:#c00;cursor:pointer;border-radius:2px">삭제</button></td>';

    eduBody.appendChild(tr);
    var sEl = tr.querySelector('.edu-start'), eEl = tr.querySelector('.edu-end'), pEl = tr.querySelector('.edu-period');
    sEl.addEventListener('change', function() { calcYearPeriod(sEl, eEl, pEl); });
    eEl.addEventListener('change', function() { calcYearPeriod(sEl, eEl, pEl); });
    tr.querySelector('.btn-del-edu').addEventListener('click', function() { tr.remove(); });
  });
})();

/* ── 어학연수 행 추가/삭제 ── */
(function() {
  var langBody = document.getElementById('lang-table-body');
  var V = 'font-size:11px;padding:3px 4px;border:1px solid #ddd;vertical-align:middle';

  document.getElementById('btn-add-lang').addEventListener('click', function() {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td style="' + V + '"><input type="text" placeholder="국가" style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb"></td>'
      + '<td style="' + V + '"><select class="lang-start" ' + SEL_Y + '>' + yearOpts + '</select></td>'
      + '<td style="' + V + '"><select class="lang-end" ' + SEL_Y + '>' + yearOpts + '</select></td>'
      + '<td style="' + V + ';text-align:center" class="lang-period">-</td>'
      + '<td style="' + V + '"><input type="text" placeholder="학교/기관명" style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb"></td>'
      + '<td style="' + V + ';text-align:center"><button type="button" class="btn-del-lang" style="font-size:10px;padding:1px 8px;border:1px solid #c00;background:#fff;color:#c00;cursor:pointer;border-radius:2px">삭제</button></td>';

    langBody.appendChild(tr);
    var sEl = tr.querySelector('.lang-start'), eEl = tr.querySelector('.lang-end'), pEl = tr.querySelector('.lang-period');
    sEl.addEventListener('change', function() { calcYearPeriod(sEl, eEl, pEl); });
    eEl.addEventListener('change', function() { calcYearPeriod(sEl, eEl, pEl); });
    tr.querySelector('.btn-del-lang').addEventListener('click', function() { tr.remove(); });
  });
})();

/* ── 직장 행 추가/삭제 ── */
(function() {
  var jobBody = document.getElementById('job-table-body');
  var V = 'font-size:11px;padding:3px 4px;border:1px solid #ddd;vertical-align:middle';
  var TI = 'style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb"';

  document.getElementById('btn-add-job').addEventListener('click', function() {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td style="' + V + '"><input type="text" placeholder="직장명" ' + TI + '></td>'
      + '<td style="' + V + '"><input type="text" placeholder="업종" ' + TI + '></td>'
      + '<td style="' + V + '"><input type="text" placeholder="명" ' + TI + '></td>'
      + '<td style="' + V + '"><input type="text" placeholder="부서" ' + TI + '></td>'
      + '<td style="' + V + '"><input type="text" placeholder="직위" ' + TI + '></td>'
      + '<td style="' + V + '"><select class="job-year" ' + SEL_Y + '>' + yearOpts + '</select></td>'
      + '<td style="' + V + '"><input type="text" placeholder="소재지" ' + TI + '></td>'
      + '<td style="' + V + '">'
      + '<select ' + TI + '>'
      + '<option>선택</option><option>대기업</option><option>중견기업</option><option>중소기업</option>'
      + '<option>공기업</option><option>공무원</option><option>전문직</option><option>자영업</option><option>스타트업</option><option>외국계</option><option>기타</option>'
      + '</select></td>'
      + '<td style="' + V + '"><input type="text" placeholder="구체적인 설명" ' + TI + '></td>'
      + '<td style="' + V + ';text-align:center"><button type="button" class="btn-del-job" style="font-size:10px;padding:1px 8px;border:1px solid #c00;background:#fff;color:#c00;cursor:pointer;border-radius:2px">삭제</button></td>';

    jobBody.appendChild(tr);
    tr.querySelector('.btn-del-job').addEventListener('click', function() { tr.remove(); });
  });
})();

/* ── 가족사항 행 추가/삭제 ── */
(function() {
  var famBody = document.getElementById('family-table-body');
  var V = 'font-size:11px;padding:3px 4px;border:1px solid #ddd;vertical-align:middle';
  var TI = 'style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb"';

  document.getElementById('btn-add-family').addEventListener('click', function() {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td style="' + V + '">'
      + '<select ' + TI + '>'
      + '<option>선택</option><option>부</option><option>모</option><option>형</option><option>누나/언니</option>'
      + '<option>동생</option><option>남동생</option><option>여동생</option><option>조부</option><option>조모</option><option>기타</option>'
      + '</select></td>'
      + '<td style="' + V + '"><input type="text" placeholder="성명" ' + TI + '></td>'
      + '<td style="' + V + '"><select class="fam-year" ' + SEL_Y + '>' + yearOpts + '</select></td>'
      + '<td style="' + V + '">'
      + '<select ' + TI + '>'
      + '<option>선택</option><option>고졸</option><option>전문대졸</option><option>대졸</option><option>석사</option><option>박사</option><option>기타</option>'
      + '</select></td>'
      + '<td style="' + V + ';overflow:hidden"><div style="display:flex;gap:2px;min-width:0"><input type="text" placeholder="직업" style="flex:1;min-width:0;font-size:11px;padding:1px 3px;border:1px solid #bbb"><select style="flex-shrink:0;font-size:11px;padding:1px 1px;border:1px solid #bbb;width:42px"><option>현직</option><option>전직</option><option>퇴직</option></select></div></td>'
      + '<td style="' + V + '">'
      + '<select ' + TI + '><option>선택</option><option>동거</option><option>비동거</option></select></td>'
      + '<td style="' + V + '">'
      + '<select ' + TI + '><option>선택</option><option>기혼</option><option>미혼</option><option>이혼</option><option>사별</option></select></td>'
      + '<td style="' + V + '"><input type="text" placeholder="거주지" ' + TI + '></td>'
      + '<td style="' + V + '"><input type="text" placeholder="비고" ' + TI + '></td>'
      + '<td style="' + V + ';text-align:center"><button type="button" class="btn-del-fam" style="font-size:10px;padding:1px 8px;border:1px solid #c00;background:#fff;color:#c00;cursor:pointer;border-radius:2px">삭제</button></td>';

    famBody.appendChild(tr);
    tr.querySelector('.btn-del-fam').addEventListener('click', function() { tr.remove(); });
  });
})();

/* ── 재혼정보 행 추가/삭제 ── */
(function() {
  var rmBody = document.getElementById('remarry-table-body');
  var V = 'font-size:11px;padding:3px 4px;border:1px solid #ddd;vertical-align:middle';
  var TI = 'style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb"';

  document.getElementById('btn-add-remarry').addEventListener('click', function() {
    var tr = document.createElement('tr');
    tr.innerHTML =
      // 구분
      '<td style="' + V + '">'
      + '<select ' + TI + '><option>선택</option><option>이혼</option><option>사별</option><option>사실혼</option></select></td>'
      // 결혼년도
      + '<td style="' + V + '"><select class="rm-year" ' + SEL_Y + '>' + yearOpts + '</select></td>'
      // 결혼기간 (--년 --개월)
      + '<td style="' + V + '"><div style="display:flex;gap:2px;align-items:center">'
      + '<input type="text" placeholder="0" style="width:25px;font-size:11px;padding:1px 2px;border:1px solid #bbb;text-align:center">'
      + '<span style="font-size:11px;white-space:nowrap">년</span>'
      + '<input type="text" placeholder="0" style="width:25px;font-size:11px;padding:1px 2px;border:1px solid #bbb;text-align:center">'
      + '<span style="font-size:11px;white-space:nowrap">개월</span>'
      + '</div></td>'
      // 이혼사유
      + '<td style="' + V + '"><input type="text" placeholder="이혼사유" ' + TI + '></td>'
      // 자녀 (-남 -녀)
      + '<td style="' + V + '"><div style="display:flex;gap:2px;align-items:center">'
      + '<input type="text" placeholder="0" style="width:22px;font-size:11px;padding:1px 2px;border:1px solid #bbb;text-align:center">'
      + '<span style="font-size:11px;white-space:nowrap">남</span>'
      + '<input type="text" placeholder="0" style="width:22px;font-size:11px;padding:1px 2px;border:1px solid #bbb;text-align:center">'
      + '<span style="font-size:11px;white-space:nowrap">녀</span>'
      + '</div></td>'
      // 자녀양육
      + '<td style="' + V + '">'
      + '<select ' + TI + '><option>선택</option><option>본인</option><option>전배우자</option><option>공동</option></select></td>'
      // 추가사항
      + '<td style="' + V + '"><input type="text" placeholder="추가사항" ' + TI + '></td>'
      // 삭제
      + '<td style="' + V + ';text-align:center"><button type="button" class="btn-del-rm" style="font-size:10px;padding:1px 8px;border:1px solid #c00;background:#fff;color:#c00;cursor:pointer;border-radius:2px">삭제</button></td>';

    rmBody.appendChild(tr);
    tr.querySelector('.btn-del-rm').addEventListener('click', function() { tr.remove(); });
  });
})();

/* ── 자녀정보 행 추가/삭제 ── */
(function() {
  var chBody = document.getElementById('child-table-body');
  var V = 'font-size:11px;padding:3px 4px;border:1px solid #ddd;vertical-align:middle';
  var TI = 'style="width:100%;font-size:11px;padding:1px 3px;border:1px solid #bbb"';

  document.getElementById('btn-add-child').addEventListener('click', function() {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td style="' + V + '"><select ' + TI + '><option>선택</option><option>남</option><option>녀</option></select></td>'
      + '<td style="' + V + '"><input type="text" placeholder="성명" ' + TI + '></td>'
      + '<td style="' + V + '"><select class="child-year" ' + SEL_Y + '>' + yearOpts + '</select></td>'
      + '<td style="' + V + '"><select ' + TI + '><option>선택</option><option>고졸</option><option>전문대졸</option><option>대졸</option><option>석사</option><option>박사</option><option>기타</option></select></td>'
      + '<td style="' + V + '"><input type="text" placeholder="직업" ' + TI + '></td>'
      + '<td style="' + V + '"><select ' + TI + '><option>선택</option><option>동거</option><option>비동거</option></select></td>'
      + '<td style="' + V + '"><select ' + TI + '><option>선택</option><option>기혼</option><option>미혼</option></select></td>'
      + '<td style="' + V + '"><input type="text" placeholder="거주지" ' + TI + '></td>'
      + '<td style="' + V + '"><select ' + TI + '><option>선택</option><option>본인</option><option>배우자</option><option>공동</option></select></td>'
      + '<td style="' + V + '"><select ' + TI + '><option>선택</option><option>본인</option><option>배우자</option><option>공동</option></select></td>'
      + '<td style="' + V + '"><input type="text" placeholder="비고" ' + TI + '></td>'
      + '<td style="' + V + ';text-align:center"><button type="button" class="btn-del-child" style="font-size:10px;padding:1px 8px;border:1px solid #c00;background:#fff;color:#c00;cursor:pointer;border-radius:2px">삭제</button></td>';

    chBody.appendChild(tr);
    tr.querySelector('.btn-del-child').addEventListener('click', function() { tr.remove(); });
  });
})();

} // end if (!m)
