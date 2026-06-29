/* ========================================
   상세페이지 헤더 렌더링 (사진 + 기본정보 테이블 + 유의사항)
   ======================================== */
import { Formatters } from '@utils/formatters.js';

/**
 * 헤더 바 (이름/뱃지/버튼) + 상단 3단(사진/기본정보/유의사항) + 탭 HTML 생성
 * @param {Object} m - 회원 데이터
 * @param {Object} tabs - { basic, extra, payment, matching } HTML 문자열
 * @returns {string} 전체 HTML
 */
export function renderDetailPage(m, tabs) {
  // 프로필 사진
  var photos = Array.isArray(m.photo) ? m.photo : (m.photo ? [m.photo] : []);

  // 연장신청서 발송 버튼 렌더링 (조건은 실제 개발 시 적용)
  var recallBtnHtml = '';
  var es = m._esignStatus || '';
  if (!es) {
    recallBtnHtml = ' <button class="btn btn--sm" id="btn-recall-send" style="margin-left:6px;background:#f59e0b;border-color:#f59e0b;color:#fff;font-size:10px;padding:1px 8px;font-weight:700;vertical-align:middle;border-radius:3px">연장신청서 발송</button>';
  } else if (es === '발송완료') {
    recallBtnHtml = ' <button class="btn btn--sm" id="btn-recall-waiting" style="margin-left:6px;background:#8b5cf6;border-color:#8b5cf6;color:#fff;font-size:10px;padding:1px 8px;font-weight:700;vertical-align:middle;border-radius:3px">전자서명 대기중</button>';
  } else if (es === '서명완료') {
    recallBtnHtml = ' <button class="btn btn--sm" id="btn-recall-complete" style="margin-left:6px;background:#16a34a;border-color:#16a34a;color:#fff;font-size:10px;padding:1px 8px;font-weight:700;vertical-align:middle;border-radius:3px">전자서명 완료</button>';
  }

  // ── 헤더 바: 이름 + 뱃지 + 버튼 ──
  var html = ''
    + '<div class="detail-header-bar">'
    + '  <div class="detail-header-bar__left">'
    + '    <h2 class="detail-header-bar__name">' + m.name + '</h2>'
    + '    <span class="detail-header-bar__id">' + m.memberId + '</span>'
    // REQ-054: 유의사항 태그 상단 배치 (플래그 기반 자동 생성)
    + (function() {
        var tags = m.tags && m.tags.length ? m.tags : [];
        if (!tags.length) {
          if (m.flagNoEvent) tags.push('이벤트불가');
          if (m.flagSecret) tags.push('비밀상담');
          if (m.flagNoRejoin) tags.push('재가입불가');
          if (m.flagDifficult) tags.push('난매칭');
        }
        if (!tags.length) return '';
        var colors = {'이벤트불가':'badge--red','재가입불가':'badge--red','난매칭':'badge--orange','미팅중':'badge--red','미소개':'badge--purple','탈회CS관리중':'badge--orange','소송중':'badge--red','소보원진행':'badge--orange','비밀상담':'badge--yellow'};
        return tags.map(function(t) { return '    <span class="badge '+(colors[t]||'badge--gray')+'">' + t + '</span>'; }).join('');
      })()
    + '  </div>'
    + '  <div class="detail-header-bar__actions">'

    + '    <button class="btn btn--ghost btn--sm" id="btn-leave-form" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">탈회신청서</button>'
    + '    <button class="btn btn--ghost btn--sm" id="btn-leave" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">탈회접수</button>'

    + '    <button class="btn btn--ghost btn--sm" id="btn-event-sms" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">이벤트문자발송</button>'

    + '    <button class="btn btn--sm" id="btn-cert-attach" style="background:#3b82f6;border-color:#3b82f6;color:#fff;font-size:12px;padding:4px 14px;font-weight:700">인증서류첨부</button>'
    + '    <button class="btn btn--secondary btn--sm" id="btn-claim" style="font-size:12px;padding:4px 14px">클레임등록</button>'
    + '    <button class="btn btn--primary btn--sm" id="btn-edit" style="font-size:12px;padding:4px 14px">수정</button>'
    + '  </div>'
    + '</div>'

    // ── 상단: 기본정보(좌) + 결제정보(우) 좌우 분리 ──
    + '<div style="display:grid;grid-template-columns:3fr 2fr;gap:8px;margin-bottom:4px;align-items:stretch">'

    // ──── 좌측: 기본정보 ────
    + '<div class="sec" style="margin-bottom:0">'
    + '<div class="sec__header">기본정보</div>'
    + '<div class="sec__body">'
    + '<table class="data-table data-table--bordered data-table--no-outer dtbl dtbl--white-lbl" style="table-layout:fixed">'
    + '<colgroup><col style="width:90px"><col style="width:12%"><col style="width:18%"><col style="width:12%"><col style="width:18%"><col style="width:12%"><col style="width:18%"></colgroup>'
    + '<tbody>'
    + '<tr>'
    + '  <td rowspan="6" style="vertical-align:middle;cursor:pointer;padding:6px" id="btn-photo-more">'
    + (photos.length > 0
      ? '<img src="' + photos[0] + '" style="width:85px;height:110px;object-fit:cover;border:1px solid #d1d5db" id="header-photo">'
      : '<div style="width:85px;height:110px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;border:1px dashed #ccc" id="header-photo">사진</div>')
    + '  </td>'
    + '  <td class="lbl" style="padding:2px 4px !important">상담매니저</td><td class="val hist-link" id="hdr-consultant" data-history="상담매니저" style="text-align:left;cursor:pointer;color:#1565c0">' + (m.consultantManager || '-') + '</td>'
    + '  <td class="lbl" style="padding:2px 4px !important">매칭매니저</td><td class="val hist-link" data-history="매칭매니저" style="text-align:left;cursor:pointer;color:#1565c0">' + (m.matchingManager || '-') + '</td>'
    + '  <td class="lbl" style="padding:2px 4px !important">프로그램</td><td class="val hist-link" id="hdr-program" data-history="프로그램" style="text-align:left;cursor:pointer;color:#1565c0">' + (m.program || '-') + '</td>'
    + '</tr>'
    + '<tr>'
    + '  <td class="lbl" style="padding:2px 4px !important">서비스개시일</td><td class="val" style="text-align:left">' + (m.serviceStartDate ? Formatters.date(m.serviceStartDate) : '-') + '</td>'
    + '  <td class="lbl" style="padding:2px 4px !important">회원상태</td><td class="val hist-link" data-history="상태변경" colspan="3" style="text-align:left;cursor:pointer;color:#1565c0">' + (m.status || '-') + recallBtnHtml + '</td>'
    + '</tr>'
    + '<tr>'
    + '  <td class="lbl" style="padding:2px 4px !important">생년월일</td><td class="val" style="text-align:left">' + Formatters.date(m.birthDate) + '</td>'
    + '  <td class="lbl" style="padding:2px 4px !important">주민번호</td><td class="val" style="text-align:left">' + (m.ssn || '-') + '</td>'
    + '  <td class="lbl" style="padding:2px 4px !important">결혼경력</td><td class="val" style="text-align:left">' + (m.maritalHistory || '-') + '</td>'
    + '</tr>'
    + '<tr>'
    + '  <td class="lbl" style="padding:2px 4px !important">본인가입사실</td><td class="val" style="text-align:left">' + (m.selfAware || '-') + '</td>'
    + '  <td class="lbl" style="padding:2px 4px !important">대표연락처</td><td class="val" colspan="3" style="text-align:left;white-space:nowrap">'
    + Formatters.phone(m.phone) + ' <span style="font-size:11px;color:#888">(' + (m.preferredCaller === '부모' || m.preferredCaller === '부' ? '부' : m.preferredCaller === '모' ? '모' : '본인') + ')</span>'
    + ' <button class="btn btn--sm" id="btn-sms-inline" style="margin-left:6px;background:#3b82f6;border-color:#3b82f6;color:#fff;font-size:10px;padding:1px 8px;font-weight:700;vertical-align:middle;border-radius:3px">SMS</button></td>'
    + '</tr>'
    + '<tr>'
    + '  <td class="lbl" style="padding:2px 4px !important">미팅횟수</td><td class="val hist-link" id="hdr-meeting-count" data-history="미팅횟수" style="text-align:left;font-weight:700;cursor:pointer;color:#1565c0">' + (m.meetingCount != null ? m.meetingCount + '/' + (m.totalMeetingCount || 12) + '회' : '-') + '</td>'
    + '  <td class="lbl" style="padding:2px 4px !important">인증상태</td><td class="val" id="btn-doc-auth" style="text-align:left;font-weight:700;cursor:pointer;text-decoration:underline;color:' + (m.certStatus === '인증완료' ? '#10b981' : '#ef4444') + '">' + (m.certStatus || '인증전') + '</td>'
    + '  <td class="lbl" style="padding:2px 4px !important">가입차수</td><td class="val hist-link" data-history="가입횟수" style="text-align:left;font-weight:700;cursor:pointer;color:#1565c0">' + (m.rejoinLabel || m.rejoinCount + '가입' || '-') + '</td>'
    + '</tr>'
    + '<tr>'
    + '  <td class="lbl" style="padding:2px 4px !important">가입일/만료일</td><td class="val" id="hdr-expiry-cell" colspan="3" style="text-align:left;white-space:nowrap;font-size:11px">' + Formatters.date(m.joinDate) + (m.expiryDate ? ' - <span class="hist-link" id="hdr-expiry" data-history="만료일" style="cursor:pointer;color:#1565c0;text-decoration:underline">' + Formatters.date(m.expiryDate) + '</span>' : '') + (m.expiryDate ? (function(){ var d = Math.ceil((new Date(m.expiryDate) - new Date()) / 86400000); return ' <span style="font-weight:700;color:' + (d > 30 ? '#2563eb' : d > 0 ? '#f59e0b' : '#dc2626') + ';font-size:11px">(D' + (d > 0 ? '-' + d : d === 0 ? '-Day' : '+' + Math.abs(d)) + ')</span>'; })() : '') + '</td>'
    + '  <td class="lbl" style="padding:2px 4px !important">지사</td><td class="val hist-link" id="hdr-branch" data-history="지사" style="text-align:left;cursor:pointer;color:#1565c0">' + (m.branch || '-') + '</td>'
    + '</tr>'
    + '</tbody></table>'
    + '</div></div>'

    // ──── 우측: 결제정보 ────
    + '<div class="sec" style="display:flex;flex-direction:column;margin-bottom:0">'
    + '<div class="sec__header">결제정보</div>'
    + '<div class="sec__body" style="flex:1;display:flex;flex-direction:column">'
    + '<table class="data-table data-table--bordered data-table--no-outer dtbl dtbl--white-lbl" style="table-layout:fixed;flex:1">'
    + '<colgroup>'
    + '  <col style="width:14%"><col style="width:19%">'
    + '  <col style="width:14%"><col style="width:19%">'
    + '  <col style="width:14%"><col style="width:19%">'
    + '</colgroup>'
    + '<tbody>'
    + '<tr style="height:24px">'
    + '  <td class="lbl">가입비</td><td class="val" style="text-align:left;font-weight:700;color:#c62828">' + (m.programFee ? Number(m.programFee).toLocaleString() + '원' : '-') + '</td>'
    + '  <td class="lbl">무이자</td><td class="val" style="text-align:left">' + (m.interestFree || '-') + '</td>'
    + '</tr>'
    + '<tr style="height:24px">'
    + '  <td class="lbl">재가입비</td><td class="val" style="text-align:left">' + (m.rejoinFee ? Number(m.rejoinFee).toLocaleString() + '원' : '-') + '</td>'
    + '  <td class="lbl">결제방법</td><td class="val" style="text-align:left">' + (m.paymentMethod || '-') + '</td>'
    + '  <td class="lbl">할인명</td><td class="val" style="text-align:left">' + (m.discountName || '-') + '</td>'
    + '</tr>'
    + '<tr style="height:24px">'
    + '  <td class="lbl">성혼비</td><td class="val" style="text-align:left">' + (m.marriageFee ? Number(m.marriageFee).toLocaleString() + '원' : '-') + '</td>'
    + '  <td class="lbl">업그레이드</td><td class="val" style="text-align:left">' + (m.upgrade || '-') + '</td>'
    + '</tr>'
    + '<tr>'
    + '  <td class="lbl">비고</td><td class="val" colspan="5" style="text-align:left">' + (m.matchComment || '-') + '</td>'
    + '</tr>'
    + '</tbody></table>'
    + '</div></div>'
    + '</div>'

    // ── 탭 구조 ──
    + '<div style="margin-bottom:0">'
    + '  <div class="tabs__nav" id="detail-tabs" style="width:100%;margin-bottom:0">'
    + '    <button class="tabs__btn active" data-tab="basic">회원정보</button>'
    + '    <button class="tabs__btn" data-tab="payment">결제정보</button>'
    + '    <button class="tabs__btn" data-tab="matching">매칭관리</button>'
    + '    <button class="tabs__btn" data-tab="consult">상담관리</button>'
    + '  </div>'
    + '</div>'

    // ── 탭 패널 ──
    + '<div>'
    + '  <div class="tab-panel active" id="panel-basic">' + tabs.basic + '</div>'
    + '  <div class="tab-panel" id="panel-payment">' + tabs.payment + '</div>'
    + '  <div class="tab-panel" id="panel-matching">' + tabs.matching + '</div>'
    + '  <div class="tab-panel" id="panel-consult">' + tabs.consult + '</div>'
    + '</div>';

  return html;
}
