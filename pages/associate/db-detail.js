/* ========================================
   보유DB 상세 (DB Detail)
   
   db-status에서 매니저 이름 클릭 시 표시
   해당 매니저가 보유한 준회원 DB 전체 리스트
   — 준회원 목록(list.js)과 동일한 컬럼/DataTable 사용
   ======================================== */
import { initLayout } from '@core/layout.js';
import { DataTable } from '@components/DataTable.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { Modal } from '@components/Modal.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, ASSOCIATE_STATUSES } from '@config/constants.js';

const params = new URLSearchParams(window.location.search);
const managerName = params.get('manager') || '';

initLayout({ pageId: 'associate-db-status', breadcrumbs: ['준회원 관리', '보유DB 현황', managerName] });
const content = document.getElementById('content');

const BRANCHES = ['본사','경기','부산','대구','대전','광주'];
const REGIONS = ['서울','부산','대구','광주','인천','대전','울산','경기','강원','세종','충북','충남','경북','경남','전북','전남','제주'];
const CHANNELS = ['가입비견적','결혼테스트','네이버예약','네이버커플','무료상담','무료맞선권','블라인드커플','실시간상담','이상형매칭','카카오커플','카카오톡','MBTI테스트','TV광고','구글커플','인스타그램'];
const EDUCATIONS = ['고졸','전문대졸','대졸','석사','박사'];

let table = null;

/* ── 데이터 가져오기 ── */
function getManagerMembers() {
  let d = [...MockAssociates];
  try {
    const u = JSON.parse(localStorage.getItem('purples_status_updates') || '{}');
    d = d.map(x => u[x.id] ? { ...x, status: typeof u[x.id] === 'string' ? u[x.id] : u[x.id].status || x.status } : x);
  } catch (e) {}
  return d.filter(m => m.consultant === managerName);
}

/* ── 메인 렌더 ── */
function render() {
  document.title = `${managerName} 보유DB - 퍼플스 인트라넷`;
  const allData = getManagerMembers();

  content.innerHTML = `
    <a class="back-link" href="db-status.html">← 보유DB 현황</a>

    <div class="page-header">
      <div>
        <h1 class="page-header__title">${managerName} 보유DB</h1>
        <p class="page-header__subtitle">총 ${allData.length}건의 준회원 DB를 보유하고 있습니다.</p>
      </div>
    </div>

    <!-- 필터 (공통 search-table) -->
    <table class="search-table">
      <tbody>
        <tr>
          <th class="search-table__th">상세검색</th>
          <td class="search-table__td">
            <select class="form-input form-input--sm fi" id="f-branch" style="width:80px"><option value="">지사</option>${BRANCHES.map(b => `<option>${b}</option>`).join('')}</select>
            <select class="form-input form-input--sm fi" id="f-gender" style="width:70px"><option value="">성별</option><option>남</option><option>여</option></select>
            <select class="form-input form-input--sm fi" id="f-marital" style="width:80px"><option value="">결혼여부</option><option>초혼</option><option>재혼</option></select>
            <select class="form-input form-input--sm fi" id="f-edu" style="width:80px"><option value="">학력</option>${EDUCATIONS.map(e => `<option>${e}</option>`).join('')}</select>
            <select class="form-input form-input--sm fi" id="f-status" style="width:120px"><option value="">상태 전체</option>${ASSOCIATE_STATUSES.map(s => `<option>${s}</option>`).join('')}</select>
            <select class="form-input form-input--sm fi" id="f-region" style="width:80px"><option value="">지역</option>${REGIONS.map(r => `<option>${r}</option>`).join('')}</select>
            <select class="form-input form-input--sm fi" id="f-channel" style="width:100px"><option value="">경로 전체</option>${CHANNELS.map(c => `<option>${c}</option>`).join('')}</select>
            <input class="form-input form-input--sm fi" id="f-keyword" placeholder="이름, 전화번호, 직장 검색..." style="width:180px">
          </td>
        </tr>
      </tbody>
    </table>
    <div class="search-actions">
      <button class="btn btn--sm search-btn" id="btn-search">검색</button>
    </div>

    <div id="tbl"></div>
  `;

  // DataTable — 준회원 목록(list.js)과 동일한 컬럼
  table = DataTable.render('tbl', {
    columns: [
      { key: 'name', label: '이름', render: (v, r) => `<a href="detail.html?id=${r.id}" target="_blank" style="font-weight:600;color:var(--accent);text-decoration:none" onclick="event.stopPropagation()">${v}</a>` },
      { key: 'phone', label: '연락처', render: v => Formatters.phone(v) },
      { key: 'gender', label: '성별', width: '50px' },
      { key: 'age', label: '나이', width: '50px', render: v => v + '세' },
      { key: 'status', label: '상태', render: v => Formatters.statusBadge(v, 'associate') },
      { key: 'channel', label: '가입경로' },
      { key: 'region', label: '지역', width: '60px' },
      { key: 'maritalStatus', label: '결혼', width: '50px' },
      { key: 'branch', label: '지사', width: '60px' },
      { key: 'consultant', label: '담당자', width: '70px' },
      { key: 'registeredAt', label: '등록일', render: v => Formatters.date(v), width: '100px' },
      { key: 'lastContactAt', label: '최종컨텍', render: v => Formatters.date(v), width: '100px' },
    ],
    data: allData,
    pageSize: 20,
    checkbox: true,
    onRowClick: r => { window.open(`detail.html?id=${r.id}`, '_blank'); },
  });

  // 필터 적용
  function applyFilters() {
    let d = getManagerMembers();
    const gv = id => document.getElementById(id)?.value || '';
    if (gv('f-branch')) d = d.filter(x => x.branch === gv('f-branch'));
    if (gv('f-gender')) d = d.filter(x => x.gender === gv('f-gender'));
    if (gv('f-marital')) d = d.filter(x => x.maritalStatus === gv('f-marital'));
    if (gv('f-edu')) d = d.filter(x => x.education === gv('f-edu'));
    if (gv('f-status')) d = d.filter(x => x.status === gv('f-status'));
    if (gv('f-region')) d = d.filter(x => x.region === gv('f-region'));
    if (gv('f-channel')) d = d.filter(x => x.channel === gv('f-channel'));
    const kw = gv('f-keyword').toLowerCase();
    if (kw) d = d.filter(x => x.name.includes(kw) || x.phone.includes(kw) || (x.company && x.company.toLowerCase().includes(kw)));
    table.update(d);
  }

  document.getElementById('btn-search').onclick = applyFilters;
  document.getElementById('f-keyword').onkeydown = e => { if (e.key === 'Enter') applyFilters(); };
}

if (!managerName) {
  content.innerHTML = `<div style="padding:60px;text-align:center">
    <div style="font-size:24px;margin-bottom:12px">⚠️</div>
    <div style="font-size:16px;font-weight:600">매니저를 선택해 주세요.</div>
    <a href="db-status.html" style="color:var(--accent);margin-top:12px;display:inline-block">보유DB 현황으로</a>
  </div>`;
} else {
  render();
}
