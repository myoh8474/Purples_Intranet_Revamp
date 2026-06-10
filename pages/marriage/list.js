/* ========================================
   성혼 관리 리스트 페이지
   - 성혼사례금 및 법무 진행 통합 관리
   - 자체 더미데이터 포함 프로토타입
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';

initLayout({ pageId: 'marriage-list', breadcrumbs: ['정회원 관리', '성혼 현황'] });

const content = document.getElementById('content');

// ── 성혼확인 상태값 (기존 운영 기준) ──
const CONFIRM_STATUSES = ['확인전','미혼','미팅중','확인중','소송중','위임서류 미비','성혼','외부결혼','성혼비 없음','만기','중복'];

const BRANDS = ['퍼플스','디노블','르매리'];
const BRANCHES = ['본사','경기','대전','대구','부산','광주'];

// ── 더미 데이터 ──
const DUMMY = [
  { id: 'M001', name: '이상훈', gender: '남', age: 38, brand: '퍼플스', branch: '본사', program: '다이아몬드 A', status: '소송중', marriageConfirm: '소송중', memberId: '1m00901', matchingManager: '김태희', consultantManager: '이지연', meetingCount: 8, contractType: '횟수제', contractCount: 12, joinDate: '2025-03-15', region: '서울', phone: '010-9999-0001', paymentStatus: '소송진행', marriageFee: 10000000, history:[{date:'2025-10-01',from:'확인전',to:'확인중',by:'김태희'},{date:'2025-12-15',from:'확인중',to:'성혼비 없음',by:'법무팀'},{date:'2026-02-10',from:'성혼비 없음',to:'소송중',by:'법무팀'}], legalMemos:[{date:'2026-02-10',type:'법무',writer:'법무팀 김법무',content:'성혼비 납부 거부, 소송 절차 착수'},{date:'2026-03-05',type:'성혼비',writer:'법무팀 김법무',content:'1차 내용증명 발송 완료'},{date:'2026-04-15',type:'법무',writer:'법무팀 김법무',content:'민사소송 접수 (서울중앙지법)'}], callLogs:[{date:'2026-01-20',time:'14:30',callType:'납부안내',result:'통화완료',caller:'법무팀 김법무',content:'성혼비 1,000만원 납부 안내, 회원 납부 거부 의사 표명'},{date:'2026-02-05',time:'10:15',callType:'법적안내',result:'통화완료',caller:'법무팀 김법무',content:'내용증명 발송 예정 안내, 최종 납부 기한 2월 28일까지 안내'},{date:'2026-03-15',time:'16:00',callType:'법적안내',result:'부재중',caller:'법무팀 김법무',content:'소송 접수 안내 시도, 부재중 — 문자 발송'}] },
  { id: 'M002', name: '박소영', gender: '여', age: 34, brand: '퍼플스', branch: '본사', program: '플래티늄(루비) A', status: '소송중', marriageConfirm: '소송중', memberId: '1f00902', matchingManager: '이수현', consultantManager: '김민희', meetingCount: 5, contractType: '횟수제', contractCount: 8, joinDate: '2025-06-20', region: '경기', phone: '010-9999-0002', paymentStatus: '소송진행', marriageFee: 8000000, history:[{date:'2026-01-10',from:'확인전',to:'확인중',by:'이수현'},{date:'2026-03-20',from:'확인중',to:'소송중',by:'법무팀'}], legalMemos:[{date:'2026-03-20',type:'법무',writer:'법무팀 이법무',content:'혼인신고 확인, 성혼비 납부 안내 통화'},{date:'2026-04-01',type:'성혼비',writer:'법무팀 이법무',content:'납부 거부 의사 확인, 소송 진행 결정'}] },
  { id: 'M003', name: '김민수', gender: '남', age: 41, brand: '디노블', branch: '본사', program: '시크릿 A', status: '성혼', marriageConfirm: '성혼', memberId: '7m00903', matchingManager: '박지영', consultantManager: '박수정', meetingCount: 10, contractType: '횟수제', contractCount: 10, joinDate: '2024-11-05', region: '서울', phone: '010-9999-0003', paymentStatus: '납부완료', marriageFee: 15000000, history:[{date:'2025-06-01',from:'확인전',to:'미팅중',by:'박지영'},{date:'2025-09-10',from:'미팅중',to:'확인중',by:'박지영'},{date:'2025-11-20',from:'확인중',to:'성혼',by:'회장님 승인'}], legalMemos:[{date:'2025-11-15',type:'성혼비',writer:'법무팀 김법무',content:'성혼비 1,500만원 납부 완료 확인'},{date:'2025-11-20',type:'법무',writer:'법무팀 김법무',content:'회장님 승인 완료, 최종 성혼 확정'}], callLogs:[{date:'2025-10-20',time:'09:30',callType:'납부안내',result:'통화완료',caller:'법무팀 김법무',content:'성혼비 1,500만원 납부 안내, 회원 납부 동의'},{date:'2025-11-10',time:'14:00',callType:'지급요청',result:'통화완료',caller:'법무팀 김법무',content:'납부 계좌 안내 및 입금 확인 요청'}] },
  { id: 'M004', name: '최서연', gender: '여', age: 32, brand: '퍼플스', branch: '부산', program: '골드(사파이어) A', status: '결혼예정', marriageConfirm: '확인중', memberId: '2f00904', matchingManager: '최은별', consultantManager: '최영미', meetingCount: 6, contractType: '횟수제', contractCount: 8, joinDate: '2025-01-10', region: '부산', phone: '010-9999-0004', paymentStatus: '미정', marriageFee: 5000000 },
  { id: 'M005', name: '정태호', gender: '남', age: 36, brand: '퍼플스', branch: '경기', program: '플래티늄(루비) B', status: '교제', marriageConfirm: '성혼비 없음', memberId: '6m00905', matchingManager: '서다현', consultantManager: '한소영', meetingCount: 7, contractType: '기간제', contractCount: 12, joinDate: '2025-04-22', region: '경기', phone: '010-9999-0005', paymentStatus: '미납', marriageFee: 8000000 },
  { id: 'M006', name: '한채원', gender: '여', age: 29, brand: '르매리', branch: '본사', program: '골드(사파이어) B', status: '성혼', marriageConfirm: '성혼', memberId: '9f00906', matchingManager: '정유리', consultantManager: '정다은', meetingCount: 9, contractType: '횟수제', contractCount: 10, joinDate: '2024-09-18', region: '서울', phone: '010-9999-0006', paymentStatus: '납부완료', marriageFee: 5000000 },
  { id: 'M007', name: '오진우', gender: '남', age: 43, brand: '퍼플스', branch: '본사', program: '블랙클럽 A', status: '만료', marriageConfirm: '만기', memberId: '1m00907', matchingManager: '김태희', consultantManager: '서윤아', meetingCount: 12, contractType: '횟수제', contractCount: 12, joinDate: '2024-05-10', region: '서울', phone: '010-9999-0007', paymentStatus: '미정', marriageFee: 20000000 },
  { id: 'M008', name: '송하림', gender: '여', age: 31, brand: '퍼플스', branch: '대전', program: '실버(에메랄드) A', status: '외부교제', marriageConfirm: '외부결혼', memberId: '3f00908', matchingManager: '강보라', consultantManager: '강미래', meetingCount: 3, contractType: '횟수제', contractCount: 6, joinDate: '2025-08-01', region: '대전', phone: '010-9999-0008', paymentStatus: '미정', marriageFee: 3000000 },
  { id: 'M009', name: '배준서', gender: '남', age: 37, brand: '디노블', branch: '부산', program: '다이아몬드 B', status: '활동', marriageConfirm: '위임서류 미비', memberId: '8m00909', matchingManager: '한서진', consultantManager: '윤하나', meetingCount: 4, contractType: '기간제', contractCount: 18, joinDate: '2025-07-15', region: '부산', phone: '010-9999-0009', paymentStatus: '미정', marriageFee: 10000000 },
  { id: 'M010', name: '류지안', gender: '여', age: 35, brand: '퍼플스', branch: '본사', program: '플래티늄(루비) A', status: '활동', marriageConfirm: '미팅중', memberId: '1f00910', matchingManager: '이수현', consultantManager: '오세은', meetingCount: 5, contractType: '횟수제', contractCount: 8, joinDate: '2025-09-01', region: '서울', phone: '010-9999-0010', paymentStatus: '미정', marriageFee: 8000000 },
  { id: 'M011', name: '남동현', gender: '남', age: 40, brand: '퍼플스', branch: '본사', program: '시크릿 B', status: '활동', marriageConfirm: '확인전', memberId: '1m00911', matchingManager: '김태희', consultantManager: '이지연', meetingCount: 2, contractType: '횟수제', contractCount: 10, joinDate: '2026-01-05', region: '서울', phone: '010-9999-0011', paymentStatus: '미정', marriageFee: 15000000 },
  { id: 'M012', name: '임서진', gender: '여', age: 33, brand: '디노블', branch: '본사', program: '골드(사파이어) A', status: '성혼', marriageConfirm: '중복', memberId: '7f00912', matchingManager: '박지영', consultantManager: '김민희', meetingCount: 7, contractType: '횟수제', contractCount: 8, joinDate: '2024-12-20', region: '경기', phone: '010-9999-0012', paymentStatus: '확인필요', marriageFee: 5000000 },
];

// 상태별 스타일
const CONFIRM_STYLES = {
  '확인전':     { color: '#6b7280', bg: '#f3f4f6' },
  '미혼':       { color: '#6b7280', bg: '#f3f4f6' },
  '미팅중':     { color: '#3b82f6', bg: '#eff6ff' },
  '확인중':     { color: '#f59e0b', bg: '#fffbeb' },
  '소송중':     { color: '#dc2626', bg: '#fef2f2' },
  '위임서류 미비': { color: '#ea580c', bg: '#fff7ed' },
  '성혼':       { color: '#16a34a', bg: '#f0fdf4' },
  '외부결혼':   { color: '#2563eb', bg: '#eff6ff' },
  '성혼비 없음': { color: '#ef4444', bg: '#fef2f2' },
  '만기':       { color: '#78716c', bg: '#f5f5f4' },
  '중복':       { color: '#a855f7', bg: '#faf5ff' },
};

function confirmBadge(confirm) {
  return `<span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;color:#374151;background:#f3f4f6;white-space:nowrap">${confirm}</span>`;
}

function payBadge(status) {
  const map = {
    '납부완료': 'badge--green', '미납': 'badge--red', '소송진행': 'badge--red',
    '확인필요': 'badge--orange', '미정': 'badge--gray', '승인대기': 'badge--orange',
  };
  return `<span class="badge ${map[status] || 'badge--gray'}" style="font-size:11px">${status}</span>`;
}

// ── 상태별 카운트 ──
function getCounts(data) {
  const c = {};
  CONFIRM_STATUSES.forEach(s => { c[s] = data.filter(d => d.marriageConfirm === s).length; });
  return c;
}

// ── 페이지 HTML ──
content.innerHTML = `
  <div class="page-header" style="margin-bottom:24px">
    <div>
      <h1 class="page-header__title">성혼 관리</h1>
      <p class="page-header__subtitle">성혼사례금 납부 및 법무 진행 통합 관리</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn--secondary btn--sm" id="btn-export">CSV 내보내기</button>
    </div>
  </div>

  <!-- 필터 (한 줄) -->
  <div class="filter-bar" style="margin-bottom:16px">
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:nowrap">
      <select class="form-select form-input--sm" id="f-confirm" style="font-size:12px;width:130px;min-width:130px">
        <option value="">성혼확인 전체</option>
        ${CONFIRM_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <select class="form-select form-input--sm" id="f-brand" style="font-size:12px;width:110px;min-width:110px">
        <option value="">브랜드 전체</option>
        ${BRANDS.map(b => `<option value="${b}">${b}</option>`).join('')}
      </select>
      <select class="form-select form-input--sm" id="f-gender" style="font-size:12px;width:90px;min-width:90px">
        <option value="">성별</option>
        <option>남</option><option>여</option>
      </select>
      <select class="form-select form-input--sm" id="f-pay" style="font-size:12px;width:110px;min-width:110px">
        <option value="">납부 전체</option>
        <option>납부완료</option><option>미납</option><option>소송진행</option><option>미정</option>
      </select>
      <input type="text" class="form-input form-input--sm" id="f-keyword" placeholder="이름, ID 검색..." style="flex:1;min-width:120px;font-size:12px">
      <button class="btn btn--secondary btn--sm" id="btn-search" style="white-space:nowrap">검색</button>
    </div>
  </div>

  <!-- 건수 -->
  <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text-secondary)" id="m-count"></div>

  <!-- 테이블 -->
  <div style="background:#fff;border:1px solid var(--border-light);border-radius:var(--radius-lg);overflow-x:auto">
    <table class="data-table" style="font-size:12px;white-space:nowrap">
      <thead>
        <tr>
          <th style="width:28px"><input type="checkbox" id="chk-all"></th>
          <th>이름/ID</th>
          <th>성별</th>
          <th>나이</th>
          <th>브랜드</th>
          <th>프로그램</th>
          <th>성혼확인</th>
          <th>성혼비</th>
          <th>납부상태</th>
          <th>매칭매니저</th>
          <th>지역</th>
          <th>가입일</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody id="m-tbody"></tbody>
    </table>
  </div>
  <div id="m-pagination" class="pagination"></div>
`;

// ── 렌더링 ──
const PAGE_SIZE = 20;
let currentPage = 1;
let activeCard = '';

function render(resetPage) {
  if (resetPage) currentPage = 1;
  let data = [...DUMMY];

  // 필터
  const confirm = document.getElementById('f-confirm').value;
  const brand = document.getElementById('f-brand').value;
  const gender = document.getElementById('f-gender').value;
  const pay = document.getElementById('f-pay').value;
  const keyword = document.getElementById('f-keyword').value.trim().toLowerCase();

  if (confirm) data = data.filter(d => d.marriageConfirm === confirm);
  if (brand) data = data.filter(d => d.brand === brand);
  if (gender) data = data.filter(d => d.gender === gender);
  if (pay) data = data.filter(d => d.paymentStatus === pay);
  if (keyword) data = data.filter(d => d.name.includes(keyword) || d.memberId.toLowerCase().includes(keyword));
  if (activeCard) data = data.filter(d => d.marriageConfirm === activeCard);

  // 건수
  document.getElementById('m-count').textContent = `검색결과 ${data.length}건`;

  // 테이블
  const tbody = document.getElementById('m-tbody');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:40px;color:var(--text-muted)">해당 조건의 회원이 없습니다.</td></tr>';
    document.getElementById('m-pagination').innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = data.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = paged.map(m => `<tr style="${m.marriageConfirm === '소송중' ? 'background:#fef2f2' : ''}">
    <td style="text-align:center" onclick="event.stopPropagation()"><input type="checkbox" class="m-chk" value="${m.id}"></td>
    <td><div style="font-weight:600;color:${m.marriageConfirm === '소송중' ? '#dc2626' : 'var(--text-primary)'}">${m.name}</div><div style="font-size:11px;color:var(--text-muted)">${m.memberId}</div></td>
    <td style="text-align:center">${m.gender}</td>
    <td style="text-align:center">${m.age}세</td>
    <td><span style="font-weight:600;color:${m.brand==='퍼플스'?'#7c3aed':m.brand==='디노블'?'#b8860b':'#db2777'}">${m.brand}</span></td>
    <td>${m.program}</td>
    <td style="text-align:center">${confirmBadge(m.marriageConfirm)}</td>
    <td style="text-align:right;font-weight:600">${m.marriageFee ? m.marriageFee.toLocaleString() + '원' : '-'}</td>
    <td style="text-align:center">${payBadge(m.paymentStatus)}</td>
    <td>${m.matchingManager}</td>
    <td>${m.region}</td>
    <td>${Formatters.date(m.joinDate)}</td>
    <td style="text-align:center"><button class="btn btn--outline btn--sm btn-act" data-id="${m.id}" style="font-size:11px;padding:3px 10px">처리</button></td>
  </tr>`).join('');

  // 처리 버튼
  tbody.querySelectorAll('.btn-act').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const m = DUMMY.find(d => d.id === btn.dataset.id);
      if (m) showActionModal(m);
    });
  });

  // 페이지네이션
  const pagEl = document.getElementById('m-pagination');
  if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
  let ph = `<button class="pagination__btn" ${currentPage===1?'disabled':''} data-p="${currentPage-1}">◀</button>`;
  for (let p = 1; p <= totalPages; p++) ph += `<button class="pagination__btn${p===currentPage?' active':''}" data-p="${p}">${p}</button>`;
  ph += `<button class="pagination__btn" ${currentPage===totalPages?'disabled':''} data-p="${currentPage+1}">▶</button>`;
  pagEl.innerHTML = ph;
  pagEl.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { currentPage = parseInt(b.dataset.p); render(); }));
}

// ── 처리 모달 ──
function showActionModal(m) {
  const opts = CONFIRM_STATUSES.map(s => `<option value="${s}" ${s === m.marriageConfirm ? 'selected' : ''}>${s}</option>`).join('');
  const hist = (m.history || []);
  const memos = (m.legalMemos || []);
  const calls = (m.callLogs || []);

  // 이력조회: 모든 기록을 날짜순 통합 타임라인
  const allLogs = [
    ...hist.map(h => ({date: h.date, sort: h.date, category: '상태변경', html: `<span style="color:#ef4444;text-decoration:line-through">${h.from}</span> <span style="color:var(--text-muted)">→</span> <strong>${h.to}</strong> <span style="color:var(--text-muted);margin-left:auto">${h.by}</span>`})),
    ...calls.map(c => ({date: c.date, sort: c.date + (c.time||''), category: '통화', html: `<span class="badge badge--blue" style="font-size:10px;padding:1px 6px">${c.callType}</span> <span style="color:var(--text-muted)">${c.time||''}</span> <span style="margin-left:auto;font-weight:600">${c.caller}</span><br><span style="color:var(--text-muted)">응대: <strong style="color:var(--text-primary)">${c.result}</strong></span><br>${c.content}`})),
    ...memos.map(l => ({date: l.date, sort: l.date, category: '메모', html: `<span class="badge ${l.type==='법무'?'badge--red':'badge--orange'}" style="font-size:10px;padding:1px 6px">${l.type}</span> <span style="font-weight:600;margin-left:auto">${l.writer}</span><br>${l.content}`})),
  ].sort((a,b) => b.sort.localeCompare(a.sort));

  const categoryStyle = {'상태변경':'border-left:3px solid #6b7280','통화':'border-left:3px solid #3b82f6','메모':'border-left:3px solid #f59e0b'};
  const categoryBadge = {'상태변경':'badge--gray','통화':'badge--blue','메모':'badge--orange'};

  const timelineHtml = allLogs.length ? allLogs.map(l =>
    `<div style="padding:8px 10px;border-bottom:1px solid #f3f4f6;font-size:12px;${categoryStyle[l.category]||''}">
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:4px">
        <span class="badge ${categoryBadge[l.category]}" style="font-size:10px;padding:1px 6px">${l.category}</span>
        <span style="color:var(--text-muted)">${l.date}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;line-height:1.6">${l.html}</div>
    </div>`
  ).join('') : '<div style="font-size:12px;color:var(--text-muted);padding:20px;text-align:center">기록이 없습니다.</div>';

  Modal.show({
    title: `성혼 처리 — ${m.name}`,
    width: '620px',
    content: `
      <div style="background:var(--bg-secondary);border-radius:8px;padding:12px;margin-bottom:16px">
          <div style="font-size:11px;color:var(--text-muted)">성혼확인</div>
          <div style="font-size:14px;font-weight:700;margin-top:4px">${m.marriageConfirm}</div>
      </div>
      ${m.marriageConfirm === '소송중' ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:11px;color:#991b1b;font-weight:600">소송중 — 일반 매니저 접근 차단 상태</div>` : ''}
      <!-- 2탭 -->
      <div style="display:flex;gap:0;border-bottom:2px solid var(--border-light);margin:0 0 0">
        <button class="md-tab active" data-tab="edit" style="padding:8px 16px;border:none;background:none;font-size:12px;font-weight:700;cursor:pointer;border-bottom:2px solid var(--accent);margin-bottom:-2px;color:var(--accent)">이력변경</button>
        <button class="md-tab" data-tab="view" style="padding:8px 16px;border:none;background:none;font-size:12px;font-weight:700;cursor:pointer;color:var(--text-muted);margin-bottom:-2px">이력조회</button>
      </div>
      <!-- 이력변경 탭 -->
      <div id="tab-edit" style="padding:12px 0">
        <div class="form-group" style="margin-bottom:14px">
          <label class="form-label" style="font-size:11px;font-weight:700">성혼확인 상태 변경</label>
          <select class="form-select form-input--sm" id="md-confirm">${opts}</select>
        </div>
        <div style="background:var(--bg-secondary);border-radius:8px;padding:12px;margin-bottom:12px">
          <div style="font-size:11px;font-weight:700;margin-bottom:8px">통화기록 작성</div>
          <div style="display:flex;gap:6px;margin-bottom:6px">
            <select class="form-select form-input--sm" id="md-call-type" style="width:90px;font-size:11px"><option>납부안내</option><option>지급요청</option><option>법적안내</option><option>기타</option></select>
            <select class="form-select form-input--sm" id="md-call-result" style="width:90px;font-size:11px"><option>통화완료</option><option>부재중</option><option>거부</option><option>보류</option></select>
            <input class="form-input form-input--sm" id="md-call-caller" placeholder="담당자" value="법무팀" style="flex:1;font-size:11px">
          </div>
          <textarea class="form-input" id="md-call-content" rows="2" placeholder="통화 내용 입력..." style="resize:vertical;font-size:12px"></textarea>
        </div>
        <div style="background:var(--bg-secondary);border-radius:8px;padding:12px">
          <div style="font-size:11px;font-weight:700;margin-bottom:8px">메모 작성</div>
          <div style="display:flex;gap:6px;margin-bottom:6px">
            <select class="form-select form-input--sm" id="md-memo-type" style="width:80px;font-size:11px"><option>법무</option><option>성혼비</option></select>
            <input class="form-input form-input--sm" id="md-memo-writer" placeholder="작성자" value="법무팀" style="flex:1;font-size:11px">
          </div>
          <textarea class="form-input" id="md-memo-content" rows="2" placeholder="법무/성혼 관련 메모 입력..." style="resize:vertical;font-size:12px"></textarea>
        </div>
      </div>
      <!-- 이력조회 탭 -->
      <div id="tab-view" style="max-height:360px;overflow-y:auto;padding:8px 0;display:none">
        ${timelineHtml}
      </div>
    `,
    footer: `
      <button class="btn btn--secondary" onclick="document.getElementById('modal-root').innerHTML=''">취소</button>
      <button class="btn btn--accent" id="md-report" style="background:#7c3aed;color:#fff">납부완료 보고</button>
      <button class="btn btn--primary" id="md-save">저장</button>
    `,
  });

  setTimeout(() => {
    document.querySelectorAll('.md-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.md-tab').forEach(t => { t.style.borderBottom='2px solid transparent'; t.style.color='var(--text-muted)'; });
        tab.style.borderBottom='2px solid var(--accent)'; tab.style.color='var(--accent)';
        document.getElementById('tab-edit').style.display = tab.dataset.tab==='edit'?'block':'none';
        document.getElementById('tab-view').style.display = tab.dataset.tab==='view'?'block':'none';
      });
    });
    document.getElementById('md-save')?.addEventListener('click', () => {
      const newVal = document.getElementById('md-confirm').value;
      const memoContent = document.getElementById('md-memo-content')?.value?.trim();
      const callContent = document.getElementById('md-call-content')?.value?.trim();
      const oldVal = m.marriageConfirm;
      if (newVal !== oldVal) {
        if (!m.history) m.history = [];
        m.history.push({date: new Date().toISOString().substring(0,10), from: oldVal, to: newVal, by: '현재 사용자'});
        m.marriageConfirm = newVal;
      }
      if (callContent) {
        if (!m.callLogs) m.callLogs = [];
        m.callLogs.push({date: new Date().toISOString().substring(0,10), time: new Date().toTimeString().substring(0,5), callType: document.getElementById('md-call-type').value, result: document.getElementById('md-call-result').value, caller: document.getElementById('md-call-caller').value, content: callContent});
      }
      if (memoContent) {
        if (!m.legalMemos) m.legalMemos = [];
        m.legalMemos.push({date: new Date().toISOString().substring(0,10), type: document.getElementById('md-memo-type').value, writer: document.getElementById('md-memo-writer').value, content: memoContent});
      }
      Modal.hide();
      Toast.show(`${m.name}님 처리 완료`, 'success');
      render();
    });
    document.getElementById('md-report')?.addEventListener('click', () => {
      m.paymentStatus = '승인대기';
      Modal.hide();
      Toast.show(`${m.name}님 납부완료 보고 완료`, 'success');
      render();
    });
  }, 100);

}


// ── 이벤트 ──
render(true);

// ── 페이지 진입 안내 팝업 ──
(function showGuide() {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position:'fixed',top:'0',left:'0',width:'100%',height:'100%',
    background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',
    justifyContent:'center',zIndex:'9999',opacity:'0',transition:'opacity .2s',
  });
  const card = document.createElement('div');
  Object.assign(card.style, {
    background:'#fff',borderRadius:'16px',padding:'36px 32px',
    maxWidth:'520px',width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,.2)',
    transform:'scale(.92)',transition:'transform .2s',
  });
  card.innerHTML = `
    <div style="font-size:20px;font-weight:800;color:var(--text-primary);margin-bottom:6px">성혼 관리 페이지 안내</div>
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px">성혼사례금 및 법무 진행을 위한 전용 관리 페이지입니다.</div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="flex-shrink:0;width:28px;height:28px;border-radius:8px;background:#fef2f2;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#dc2626">1</span>
        <div><div style="font-size:13px;font-weight:700">소송중 회원 접근 차단</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px">소송중 상태의 회원은 일반 매니저의 상세 페이지 접근이 차단됩니다.</div></div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="flex-shrink:0;width:28px;height:28px;border-radius:8px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#16a34a">2</span>
        <div><div style="font-size:13px;font-weight:700">성혼확인 상태 관리</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px">확인전, 확인중, 성혼, 소송중 등 11단계 상태를 관리합니다.</div></div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="flex-shrink:0;width:28px;height:28px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#2563eb">3</span>
        <div><div style="font-size:13px;font-weight:700">성혼비 납부 관리</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px">프로그램별 성혼비 납부 현황 확인 및 납부완료 보고가 가능합니다.</div></div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="flex-shrink:0;width:28px;height:28px;border-radius:8px;background:#faf5ff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#7c3aed">4</span>
        <div><div style="font-size:13px;font-weight:700">회장님 승인 플로우</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px">납부완료 보고 시 회장님 대시보드로 자동 상신, 승인 시 최종 성혼 확정됩니다.</div></div>
      </div>
    </div>
    <div style="text-align:right">
      <button id="guide-close" style="padding:10px 28px;border:none;border-radius:8px;background:var(--accent);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">확인</button>
    </div>
  `;
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity='1'; card.style.transform='scale(1)'; });
  function close() {
    overlay.style.opacity='0'; card.style.transform='scale(.92)';
    setTimeout(() => overlay.remove(), 200);
  }
  document.getElementById('guide-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
})();

document.getElementById('btn-search').addEventListener('click', () => { activeCard = ''; render(true); });
document.getElementById('f-keyword').addEventListener('keydown', e => { if (e.key === 'Enter') { activeCard = ''; render(true); } });
document.getElementById('chk-all').addEventListener('change', function() {
  document.querySelectorAll('.m-chk').forEach(c => { c.checked = this.checked; });
});

// CSV
document.getElementById('btn-export').addEventListener('click', () => {
  const csv = ['이름,ID,성별,나이,브랜드,프로그램,성혼확인,성혼비,납부상태,매칭매니저,지역,가입일',
    ...DUMMY.map(m => `"${m.name}","${m.memberId}","${m.gender}","${m.age}","${m.brand}","${m.program}","${m.marriageConfirm}","${m.marriageFee}","${m.paymentStatus}","${m.matchingManager}","${m.region}","${m.joinDate}"`)
  ].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'}));
  a.download = `성혼관리_${new Date().toISOString().substring(0,10)}.csv`;
  a.click();
  Toast.show('CSV 다운로드 완료', 'success');
});









































