/* ========================================
   공지사항 게시판
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';

initLayout({ pageId: 'board-notice', breadcrumbs: ['게시판', '공지사항'] });
const content = document.getElementById('content');

const NOTICE_CATS = ['전체','인사','시스템','정책','이벤트','기타'];

function generateData() {
  const stored = localStorage.getItem('purples_board_notice');
  if (stored) { try { return JSON.parse(stored); } catch(e){} }
  const items = [
    { title: '2026년 5월 매니저 교육 일정 안내', cat: '인사', pinned: true },
    { title: '인트라넷 시스템 정기 점검 안내 (5/20)', cat: '시스템', pinned: true },
    { title: '개인정보 처리방침 개정 안내', cat: '정책', pinned: false },
    { title: '성혼비 정산 기준 변경 안내', cat: '정책', pinned: false },
    { title: '퍼플스 창립기념일 행사 안내', cat: '이벤트', pinned: false },
    { title: '5월 매출 목표 달성 현황 공유', cat: '기타', pinned: false },
    { title: '신규 매칭 시스템 업데이트 안내', cat: '시스템', pinned: false },
    { title: '하반기 인사평가 기준 공지', cat: '인사', pinned: false },
    { title: '지사별 실적 보고 양식 변경', cat: '정책', pinned: false },
    { title: '고객 만족도 조사 결과 공유', cat: '기타', pinned: false },
    { title: '여름 휴가 일정 신청 안내', cat: '인사', pinned: false },
    { title: '매니저 클레임 처리 절차 개선', cat: '정책', pinned: false },
  ];
  const writers = ['관리자','인사팀','시스템팀','경영지원'];
  const data = items.map((item, i) => ({
    id: i + 1,
    title: item.title,
    category: item.cat,
    pinned: item.pinned,
    writer: writers[Math.floor(Math.random() * writers.length)],
    createdAt: new Date(2026, 4, 13 - i).toISOString().slice(0, 10),
    views: Math.floor(Math.random() * 200) + 5,
  }));
  localStorage.setItem('purples_board_notice', JSON.stringify(data));
  return data;
}

function render() {
  const data = generateData();

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">공지사항</h1>
      <p class="page-header__subtitle">사내 공지사항을 확인하세요</p></div>
      <div class="page-header__actions"><button class="btn btn--primary btn--sm" id="btn-new">+ 공지 등록</button></div>
    </div>

    <div class="filter-bar"><div class="filter-bar__row">
      <div class="filter-bar__item"><label>검색</label>
        <input class="form-input form-input--sm" id="f-keyword" placeholder="제목, 작성자 검색...">
      </div>
      <button class="btn btn--primary btn--sm" id="btn-search">검색</button>
    </div></div>

    <div class="card">
      <div class="card__header"><h3 class="card__title" style="font-size:14px">공지 목록</h3>
      <span style="font-size:12px;color:var(--text-muted)" id="notice-count">${data.length}건</span></div>
      <div class="card__body" style="padding:0;overflow-x:auto">
        <table class="std-table" style="table-layout:fixed"><thead><tr>
          <th style="width:60px">번호</th><th>제목</th>
          <th style="width:70px">작성자</th><th style="width:90px">등록일</th><th style="width:50px">조회</th>
        </tr></thead><tbody id="notice-tbody"></tbody></table>
      </div>
    </div>
  `;

  function applyFilters() {
    let filtered = [...data];
    const kw = (document.getElementById('f-keyword')?.value || '').toLowerCase();
    if (kw) filtered = filtered.filter(d => d.title.toLowerCase().includes(kw) || d.writer.includes(kw));

    // 고정글 상단
    const pinned = filtered.filter(d => d.pinned);
    const normal = filtered.filter(d => !d.pinned);

    document.getElementById('notice-count').textContent = filtered.length + '건';
    document.getElementById('notice-tbody').innerHTML = [...pinned, ...normal].map(d => `<tr data-href="./detail.html?type=notice&id=${d.id}"${d.pinned ? ' style="background:var(--accent-bg-light)"' : ''}>
      <td class="tc col-no">${d.pinned ? '<span class="badge badge--accent" style="font-size:9px">고정</span>' : d.id}</td>
      <td class="tl ellipsis" style="font-weight:${d.pinned ? '700' : '600'};max-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.title}</td>
      <td class="tc">${d.writer}</td>
      <td class="tc" style="white-space:nowrap">${d.createdAt}</td>
      <td class="tc">${d.views}</td>
    </tr>`).join('') || '<tr><td colspan="5" class="tc text-muted" style="padding:30px">등록된 공지가 없습니다.</td></tr>';
    document.querySelectorAll('#notice-tbody tr[data-href]').forEach(tr => {
      tr.addEventListener('click', () => location.href = tr.dataset.href);
    });
  }

  applyFilters();
  document.getElementById('btn-search').addEventListener('click', applyFilters);
  document.getElementById('f-keyword')?.addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
  document.getElementById('btn-new').addEventListener('click', () => {
    location.href = './write.html?type=notice';
  });
}

render();
