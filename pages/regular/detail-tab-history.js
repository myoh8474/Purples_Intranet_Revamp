/* ========================================
   정회원 상세 — 히스토리 탭
   모든 회원 활동 이력을 타임라인 형태로 표시
   ======================================== */
import { Formatters } from '@utils/formatters.js';
import { HISTORY_CATEGORIES, getHistory, addHistory, deleteHistory, seedHistoryFromMember, getHistoryStats } from '@services/history.js';

/**
 * 히스토리 탭 렌더링 (초기 HTML)
 */
export async function renderHistoryTab(m) {
  // 최초 진입 시 Mock → 히스토리 시딩
  seedHistoryFromMember(m);

  const stats = getHistoryStats(m.id);

  // 카테고리 필터 버튼
  const categoryBtns = ['전체', ...Object.keys(HISTORY_CATEGORIES)]
    .map(cat => {
      const info = HISTORY_CATEGORIES[cat];
      const count = cat === '전체' ? stats.total : (stats[cat] || 0);
      return `<button class="btn btn--${cat === '전체' ? 'primary' : 'outline'} btn--sm hist-cat-btn" 
                data-category="${cat}" style="font-size:11px;padding:3px 10px;gap:4px;display:inline-flex;align-items:center">
                ${cat}
                <span class="badge badge--gray" style="font-size:10px;padding:1px 5px;margin-left:2px">${count}</span>
              </button>`;
    })
    .filter(Boolean)
    .join('');

  return `

    <!-- 필터 영역 -->
    <div style="background:var(--bg-secondary);padding:14px 16px;border-radius:var(--radius-lg);margin-bottom:16px">
      <!-- 카테고리 필터 -->
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px" id="hist-cat-filters">
        ${categoryBtns}
      </div>
      <!-- 날짜 + 키워드 필터 -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <div style="display:flex;align-items:center;gap:4px;font-size:12px">
          <span style="color:var(--text-muted);white-space:nowrap">기간</span>
          <input type="date" class="form-input" id="hist-start-date" style="font-size:11px;padding:4px 8px;width:130px">
          <span style="color:var(--text-muted)">~</span>
          <input type="date" class="form-input" id="hist-end-date" style="font-size:11px;padding:4px 8px;width:130px">
        </div>
        <div style="flex:1;min-width:180px">
          <input type="text" class="form-input" id="hist-keyword" placeholder="내용·담당자 검색..." style="font-size:12px;padding:5px 10px;width:100%">
        </div>
        <button class="btn btn--ghost btn--sm" id="hist-filter-reset" style="font-size:11px;white-space:nowrap">초기화</button>
      </div>
    </div>

    <!-- 타임라인 목록 -->
    <div id="hist-timeline-wrap">
      ${await renderTimeline(m.id, {})}
    </div>
  `;
}

/**
 * 타임라인 렌더링 (필터 적용)
 */
async function renderTimeline(memberId, filters) {
  const list = await getHistory(memberId, filters);

  if (list.length === 0) {
    return `
      <div style="text-align:center;padding:50px 20px;color:var(--text-muted)">
        <div style="font-size:14px;margin-bottom:12px;color:var(--text-muted)">—</div>
        <div style="font-size:14px;font-weight:600;margin-bottom:4px">기록이 없습니다</div>
        <div style="font-size:12px">해당 조건에 맞는 히스토리가 없습니다.</div>
      </div>`;
  }

  // 날짜별 그룹핑
  const groups = {};
  list.forEach(h => {
    const d = h.date ? h.date.substring(0, 10) : 'unknown';
    if (!groups[d]) groups[d] = [];
    groups[d].push(h);
  });

  let html = '<div class="hist-timeline">';

  Object.keys(groups).sort((a, b) => b.localeCompare(a)).forEach(dateKey => {
    const items = groups[dateKey];
    const dateLabel = formatDateLabel(dateKey);

    html += `
      <div class="hist-date-group">
        <div class="hist-date-label">${dateLabel}</div>
        <div class="hist-date-items">`;

    items.forEach(h => {
      const cat = HISTORY_CATEGORIES[h.category] || HISTORY_CATEGORIES['상담매니저'];
      html += `
          <div class="hist-item" data-id="${h.id}">
            <div class="hist-item__icon" style="background:${cat.color}15;color:${cat.color};border:1.5px solid ${cat.color}30;font-size:11px;font-weight:700">
              ${cat.label.substring(0,1)}
            </div>
            <div class="hist-item__body">
              <div class="hist-item__header">
                <span class="hist-item__cat" style="background:${cat.color}15;color:${cat.color}">${cat.label}</span>
                <span class="hist-item__time">${formatTime(h.date)}</span>
                <span class="hist-item__processor">${h.processor}</span>
              </div>
              <div class="hist-item__content">${escapeHtml(h.content)}</div>
              ${h.detail ? `<div class="hist-item__detail">${escapeHtml(h.detail)}</div>` : ''}
            </div>
            <div class="hist-item__actions">
              <button class="btn btn--ghost btn--sm hist-del-btn" data-id="${h.id}" style="font-size:10px;padding:2px 6px;color:var(--danger)" title="삭제">✕</button>
            </div>
          </div>`;
    });

    html += '</div></div>';
  });

  html += '</div>';
  html += `<div style="text-align:center;padding:12px;font-size:11px;color:var(--text-muted)">총 ${list.length}건의 히스토리</div>`;

  return html;
}

function formatDateLabel(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - d) / 86400000);

    const ymd = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[d.getDay()];

    if (diff === 0) return `오늘 (${ymd} ${dayName})`;
    if (diff === 1) return `어제 (${ymd} ${dayName})`;
    if (diff <= 7) return `${diff}일 전 (${ymd} ${dayName})`;
    return `${ymd} (${dayName})`;
  } catch (e) {
    return dateStr;
  }
}

function formatTime(dateStr) {
  try {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch (e) {
    return '';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * 히스토리 탭 이벤트 바인딩
 * detail.js에서 호출
 */
export function initHistoryEvents(memberId) {
  const wrap = document.getElementById('hist-timeline-wrap');
  if (!wrap) return;

  async function refreshTimeline() {
    const category = document.querySelector('.hist-cat-btn.active-cat')?.dataset.category || '전체';
    const startDate = document.getElementById('hist-start-date')?.value || '';
    const endDate = document.getElementById('hist-end-date')?.value || '';
    const keyword = document.getElementById('hist-keyword')?.value || '';

    wrap.innerHTML = await renderTimeline(memberId, {
      category: category !== '전체' ? category : null,
      startDate,
      endDate,
      keyword,
    });

    // 건수 업데이트
    const stats = getHistoryStats(memberId);
    const badge = document.querySelector('#toggle-history .badge.badge--accent') || document.querySelector('.badge.badge--accent');
    if (badge) badge.textContent = stats.total + '건';
  }

  // 카테고리 필터 클릭
  const catFilters = document.getElementById('hist-cat-filters');
  if (catFilters) {
    catFilters.addEventListener('click', function (e) {
      const btn = e.target.closest('.hist-cat-btn');
      if (!btn) return;
      catFilters.querySelectorAll('.hist-cat-btn').forEach(b => {
        b.className = 'btn btn--outline btn--sm hist-cat-btn';
      });
      btn.className = 'btn btn--primary btn--sm hist-cat-btn active-cat';
      refreshTimeline();
    });
    // 첫 번째 버튼 활성화
    const firstBtn = catFilters.querySelector('.hist-cat-btn');
    if (firstBtn) firstBtn.classList.add('active-cat');
  }

  // 날짜/키워드 필터
  ['hist-start-date', 'hist-end-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', refreshTimeline);
  });

  const keywordInput = document.getElementById('hist-keyword');
  if (keywordInput) {
    let debounce;
    keywordInput.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(refreshTimeline, 300);
    });
  }

  // 초기화
  const resetBtn = document.getElementById('hist-filter-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      document.getElementById('hist-start-date').value = '';
      document.getElementById('hist-end-date').value = '';
      document.getElementById('hist-keyword').value = '';
      const catFilters = document.getElementById('hist-cat-filters');
      if (catFilters) {
        catFilters.querySelectorAll('.hist-cat-btn').forEach(b => {
          b.className = 'btn btn--outline btn--sm hist-cat-btn';
        });
        const firstBtn = catFilters.querySelector('.hist-cat-btn');
        if (firstBtn) firstBtn.className = 'btn btn--primary btn--sm hist-cat-btn active-cat';
      }
      refreshTimeline();
    });
  }

  // 삭제 (이벤트 위임)
  wrap.addEventListener('click', function (e) {
    const delBtn = e.target.closest('.hist-del-btn');
    if (delBtn) {
      if (confirm('이 히스토리를 삭제하시겠습니까?')) {
        deleteHistory(delBtn.dataset.id);
        refreshTimeline();
        if (window.__Toast) window.__Toast.show('히스토리가 삭제되었습니다.', 'info');
      }
    }
  });

  // 내보내기
  const exportBtn = document.getElementById('btn-export-history');
  if (exportBtn) {
    exportBtn.addEventListener('click', async function () {
      const list = await getHistory(memberId);
      const csv = [
        '날짜,카테고리,내용,상세,담당자',
        ...list.map(h =>
          `"${h.date}","${h.category}","${(h.content || '').replace(/"/g, '""')}","${(h.detail || '').replace(/"/g, '""')}","${h.processor}"`
        ),
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `member_history_${memberId}_${new Date().toISOString().substring(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      if (window.__Toast) window.__Toast.show('히스토리가 CSV로 다운로드됩니다.', 'success');
    });
  }

  return { refreshTimeline, addEntry: addHistory };
}
