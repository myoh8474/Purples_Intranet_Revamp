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

  // ── 헤더 바: 이름 + 뱃지 + 버튼 ──
  var html = ''
    + '<div class="detail-header-bar">'
    + '  <div class="detail-header-bar__left">'
    + '    <h2 class="detail-header-bar__name">' + m.name + '</h2>'
    + '    <span class="detail-header-bar__id">' + m.memberId + '</span>'
    // REQ-054: 유의사항 태그 상단 배치
    + (m.tags && m.tags.length ? m.tags.map(function(t){
        var colors = {'이벤트불가':'badge--red','재가입불가':'badge--red','난매칭':'badge--orange','미팅중':'badge--red','미소개':'badge--purple','탈회CS관리중':'badge--orange','소송중':'badge--red','소보원진행':'badge--orange','비밀상담':'badge--yellow'};
        return '    <span class="badge '+(colors[t]||'badge--gray')+'">' + t + '</span>';
      }).join('') : '<span class="badge badge--red">이벤트불가</span><span class="badge badge--red">재가입불가</span><span class="badge badge--orange">난매칭</span><span class="badge badge--red" style="background:#fee2e2;color:#dc2626">미팅중</span>')
    + '  </div>'
    + '  <div class="detail-header-bar__actions">'
    + '    <button class="btn btn--sm" id="btn-recall-esign" style="background:#f59e0b;border-color:#f59e0b;color:#fff;font-size:12px;padding:4px 14px;font-weight:700">연장신청서발송</button>'
    + '    <button class="btn btn--ghost btn--sm" id="btn-leave" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">탈회접수</button>'
    + '    <button class="btn btn--ghost btn--sm" id="btn-sms" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">SMS</button>'
    + '    <button class="btn btn--ghost btn--sm" id="btn-event-sms" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">이벤트문자발송</button>'
    + '    <button class="btn btn--ghost btn--sm" id="btn-email" style="border:1px solid #333;color:#333;font-size:12px;padding:4px 14px">Email</button>'
    + '    <button class="btn btn--secondary btn--sm" id="btn-claim" style="font-size:12px;padding:4px 14px">클레임등록</button>'
    + '    <button class="btn btn--primary btn--sm" id="btn-edit" style="font-size:12px;padding:4px 14px">수정</button>'
    + '  </div>'
    + '</div>'

    // REQ-055: 프로그램(상품)정보 상단 배치 + REQ-056: D-day + REQ-029: 약정진행률
    + (function(){
        var prog = m.program || '-';
        var jd = m.joinDate ? Formatters.date(m.joinDate) : '-';
        var ed = m.expiryDate ? Formatters.date(m.expiryDate) : '-';
        var dday = '';
        if (m.expiryDate) { var diff = Math.ceil((new Date(m.expiryDate) - new Date()) / 86400000); dday = diff > 0 ? 'D-' + diff : '<span style="color:#ef4444;font-weight:700">만료</span>'; }
        var ctLabel = m.contractType === '횟수제' && m.contractCount ? m.contractCount + '회' : (m.contractType || '-');
        var mtCount = m.meetingCount || 0;
        var mtTotal = m.contractCount || 12;
        var pct = Math.round((mtCount / mtTotal) * 100);
        return '<div style="display:flex;gap:12px;padding:10px 0 6px;flex-wrap:wrap;align-items:center;border-bottom:1px solid #e5e7eb;margin-bottom:12px">'
          + '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:#888">프로그램</span><span style="font-weight:700;color:#6a1b9a">' + prog + '</span></div>'
          + '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:#888">가입일</span><span style="font-weight:600">' + jd + '</span></div>'
          + '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:#888">만료일</span><span style="font-weight:600">' + ed + '</span>' + (dday ? '<span style="background:#fff3e0;color:#e65100;padding:1px 8px;border-radius:10px;font-size:11px;font-weight:700">' + dday + '</span>' : '') + '</div>'
          + '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:#888">미팅</span><span style="font-weight:700;color:#1565c0">' + mtCount + '/' + mtTotal + '</span>'
          + '<div style="width:80px;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden"><div style="width:' + Math.min(pct,100) + '%;height:100%;background:' + (pct>=100?'#ef4444':'#3b82f6') + ';border-radius:4px"></div></div>'
          + '<span style="font-size:10px;color:#888">' + pct + '%</span></div>'
          + '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:#888">계약</span><span style="font-weight:600">' + ctLabel + '</span></div>'
          + '</div>';
      })()

    // ── 상단: [사진] [기본정보] [유의사항] 3단 ──
    + '<div style="display:grid;grid-template-columns:auto 3fr 1fr;gap:14px;padding:8px 0 20px;align-items:start">'

    // 좌측: 사진
    + '  <div style="flex-shrink:0;cursor:pointer" id="btn-photo-more">'
    + (photos.length > 0
      ? '<img src="' + photos[0] + '" style="width:120px;height:150px;object-fit:cover;border:1px solid var(--border-light)" id="header-photo">'
      : '<div style="width:120px;height:150px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text-muted);border:1px dashed var(--border-light)" id="header-photo">사진</div>')
    + '  </div>'

    // 중앙: 기본정보 테이블 — CSS 클래스 적용 (.lbl, .val)
    + '  <div style="overflow:hidden">'
    + '    <table class="data-table data-table--bordered dtbl dtbl--white-lbl" style="white-space:nowrap"><colgroup><col style="width:12.5%"><col style="width:12.5%"><col style="width:12.5%"><col style="width:12.5%"><col style="width:12.5%"><col style="width:12.5%"><col style="width:12.5%"><col style="width:12.5%"></colgroup><tbody>'
    + '      <tr>'
    + '        <td class="lbl">상태</td><td class="val" data-history="상태변경">' + Formatters.statusBadge(m.status, 'regular') + '</td>'
    + '        <td class="lbl">지사</td><td class="val" data-history="지사">' + (m.branch || '-') + '</td>'
    + '        <td class="lbl">브랜드</td><td class="val">' + (m.brand || '-') + '</td>'
    + '        <td class="lbl">자녀양육</td><td class="val">' + (m.childCare || '-') + '</td>'
    + '      </tr>'
    + '      <tr>'
    + '        <td class="lbl">생년월일</td><td class="val">' + Formatters.date(m.birthDate) + '</td>'
    + '        <td class="lbl">생년월</td><td class="val">' + (m.birthDate ? new Date(m.birthDate).getFullYear() + '년 ' + String(new Date(m.birthDate).getMonth()+1).padStart(2,'0') + '월생' : '-') + '</td>'
    + '        <td class="lbl">성별</td><td class="val">' + (m.gender || '-') + '</td>'
    + '        <td class="lbl">결혼여부</td><td class="val">' + (m.maritalHistory || '-') + '</td>'
    + '      </tr>'
    + '      <tr>'
    + '        <td class="lbl">학력</td><td class="val">' + (m.education || '-') + '</td>'
    + '        <td class="lbl">상담매니저</td><td class="val" data-history="상담매니저">' + (m.consultantManager || '-') + '</td>'
    + '        <td class="lbl">매칭매니저</td><td class="val" data-history="매칭매니저">' + (m.matchingManager || '-') + '</td>'
    + '        <td class="lbl"></td><td class="val"></td>'
    + '      </tr>'
    + '      <tr>'
    + '        <td class="lbl">직업</td><td class="val">' + (m.job || '-') + '</td>'
    + '        <td class="lbl">직장</td><td class="val">' + (m.company || '-') + '</td>'
    + '        <td class="lbl">지역</td><td class="val">' + (m.region || '-') + '</td>'
    + '        <td class="lbl"></td><td class="val"></td>'
    + '      </tr>'
    + '      <tr>'
    + '        <td class="lbl">연락처</td><td class="val" colspan="3">' + Formatters.phone(m.phone) + '</td>'
    + '        <td class="lbl">이메일</td><td class="val" colspan="3">' + (m.email || '-') + '</td>'
    + '      </tr>'
    // REQ-061: 직장주소·자택주소·등본주소 구분
    + '      <tr>'
    + '        <td class="lbl">자택주소</td><td class="val" colspan="3">' + (m.homeAddress || '-') + '</td>'
    + '        <td class="lbl">직장주소</td><td class="val" colspan="3">' + (m.workAddress || '-') + '</td>'
    + '      </tr>'
    + '      <tr>'
    + '        <td class="lbl">등본주소</td><td class="val" colspan="7">' + (m.registerAddress || m.hometown || '-') + '</td>'
    + '      </tr>'
    + '    </tbody></table>'
    + '  </div>'

    // 우측: 유의사항
    + '  <div style="background:#fff;border:1px solid var(--border-light);padding:12px;height:100%">'
    + '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
    + '      <span class="mcard__title">유의사항</span>'
    + '      <button class="btn btn--sm" id="btn-add-note" style="font-size:11px;background:#fff;border:1px solid #ccc;color:#333">등록</button>'
    + '    </div>'
    + '    <div id="notes-list" style="font-size:12px;max-height:180px;overflow-y:auto">'
    + '      <div style="text-align:center;color:var(--text-muted);padding:20px;font-size:12px">등록된 유의사항이 없습니다.</div>'
    + '    </div>'
    + '  </div>'
    + '</div>'

    // ── 4탭 구조 ──
    + '<div style="margin-bottom:16px">'
    + '  <div class="tabs__nav" id="detail-tabs" style="width:100%">'
    + '    <button class="tabs__btn active" data-tab="basic">기본정보</button>'
    + '    <button class="tabs__btn" data-tab="extra">추가정보</button>'
    + '    <button class="tabs__btn" data-tab="payment">결제정보</button>'
    + '    <button class="tabs__btn" data-tab="matching">매칭관리</button>'
    + '  </div>'
    + '</div>'
    + '<div>'
    + '  <div class="tab-panel active" id="panel-basic">' + tabs.basic + '</div>'
    + '  <div class="tab-panel" id="panel-extra">' + tabs.extra + '</div>'
    + '  <div class="tab-panel" id="panel-payment">' + tabs.payment + '</div>'
    + '  <div class="tab-panel" id="panel-matching">' + tabs.matching + '</div>'
    + '</div>';

  return html;
}
