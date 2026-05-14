/* ========================================
   데이터 테이블 컴포넌트 (ES Module)
   정렬, 페이징, 체크박스, 클릭 이벤트 지원
   ======================================== */

export const DataTable = {
  /**
   * @param {string} containerId - 테이블을 렌더링할 컨테이너 ID
   * @param {Object} options
   * @param {Array<{key, label, width?, render?, sortable?}>} options.columns
   * @param {Array} options.data
   * @param {number} [options.pageSize=20]
   * @param {Function} [options.onRowClick] - 행 클릭 콜백
   * @param {boolean} [options.compact=false]
   * @param {boolean} [options.checkbox=false] - 체크박스 열 표시
   */
  render(containerId, { columns, data, pageSize = 20, onRowClick, compact = false, checkbox = false }) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let currentPage = 1;
    let sortKey = null;
    let sortDir = 'asc';
    let sortedData = [...data];
    let checkedSet = new Set();

    function sort(key) {
      if (sortKey === key) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey = key;
        sortDir = 'asc';
      }
      sortedData.sort((a, b) => {
        const va = a[key], vb = b[key];
        if (va == null) return 1;
        if (vb == null) return -1;
        const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
        return sortDir === 'asc' ? cmp : -cmp;
      });
      currentPage = 1;
      draw();
    }

    function draw() {
      const total = sortedData.length;
      const totalPages = Math.ceil(total / pageSize);
      const start = (currentPage - 1) * pageSize;
      const pageData = sortedData.slice(start, start + pageSize);
      const compactClass = compact ? ' data-table--compact' : '';

      // 현재 페이지의 체크 상태
      const pageIds = pageData.map(r => r.id);
      const allPageChecked = pageIds.length > 0 && pageIds.every(id => checkedSet.has(id));

      let html = `<div style="overflow-x:auto"><table class="data-table${compactClass}" style="font-size:11px;white-space:nowrap"><thead><tr>`;

      // 체크박스 헤더
      if (checkbox) {
        html += `<th style="width:36px;text-align:center"><input type="checkbox" class="dt-check-all" ${allPageChecked ? 'checked' : ''} /></th>`;
      }

      columns.forEach(col => {
        const w = col.width ? ` style="width:${col.width}"` : '';
        const sortIcon = sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
        const sortAttr = col.sortable !== false ? ` data-sort="${col.key}" style="cursor:pointer${col.width ? ';width:' + col.width : ''}"` : w;
        html += `<th${sortAttr}>${col.label}${sortIcon}</th>`;
      });
      html += '</tr></thead><tbody>';

      if (pageData.length === 0) {
        const colSpan = columns.length + (checkbox ? 1 : 0);
        html += `<tr><td colspan="${colSpan}" style="text-align:center;padding:40px;color:var(--text-muted)">데이터가 없습니다</td></tr>`;
      } else {
        pageData.forEach((row, idx) => {
          const clickAttr = onRowClick ? ' style="cursor:pointer"' : '';
          html += `<tr data-idx="${start + idx}" data-id="${row.id}"${clickAttr}>`;

          // 체크박스 셀
          if (checkbox) {
            html += `<td style="text-align:center" onclick="event.stopPropagation()"><input type="checkbox" class="dt-check-row" data-id="${row.id}" ${checkedSet.has(row.id) ? 'checked' : ''} /></td>`;
          }

          columns.forEach(col => {
            const value = col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-');
            html += `<td>${value}</td>`;
          });
          html += '</tr>';
        });
      }
      html += '</tbody></table></div>';

      // 체크된 건수 표시
      if (checkbox && checkedSet.size > 0) {
        html += `<div style="padding:6px 12px;background:var(--accent-bg);border:1px solid var(--accent);font-size:12px;margin-top:4px;display:flex;justify-content:space-between;align-items:center">
          <span>✅ <strong>${checkedSet.size}</strong>건 선택됨</span>
          <button class="btn btn--ghost btn--sm dt-clear-checks" style="font-size:11px">선택 해제</button>
        </div>`;
      }

      // 페이지네이션
      if (totalPages > 1) {
        html += `<div class="table-footer"><span>전체 ${total}건</span><div class="pagination">`;
        html += `<button class="pagination__btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>`;
        for (let p = 1; p <= totalPages; p++) {
          if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
            if (p === currentPage - 3 || p === currentPage + 3) html += '<span style="padding:0 4px;color:var(--text-muted)">…</span>';
            continue;
          }
          html += `<button class="pagination__btn${p === currentPage ? ' active' : ''}" data-page="${p}">${p}</button>`;
        }
        html += `<button class="pagination__btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>`;
        html += '</div></div>';
      } else {
        html += `<div class="table-footer"><span>전체 ${total}건</span></div>`;
      }

      container.innerHTML = html;

      // 이벤트 바인딩 — 정렬
      container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => sort(th.dataset.sort));
      });

      // 이벤트 바인딩 — 페이지네이션
      container.querySelectorAll('.pagination__btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = btn.dataset.page;
          if (p === 'prev') currentPage = Math.max(1, currentPage - 1);
          else if (p === 'next') currentPage = Math.min(totalPages, currentPage + 1);
          else currentPage = parseInt(p);
          draw();
        });
      });

      // 이벤트 바인딩 — 행 클릭
      if (onRowClick) {
        container.querySelectorAll('tbody tr[data-idx]').forEach(tr => {
          tr.addEventListener('click', () => onRowClick(sortedData[parseInt(tr.dataset.idx)]));
        });
      }

      // 이벤트 바인딩 — 체크박스
      if (checkbox) {
        // 전체 선택/해제
        const checkAll = container.querySelector('.dt-check-all');
        if (checkAll) {
          checkAll.addEventListener('change', () => {
            pageData.forEach(row => {
              if (checkAll.checked) checkedSet.add(row.id);
              else checkedSet.delete(row.id);
            });
            draw();
          });
        }

        // 개별 체크박스
        container.querySelectorAll('.dt-check-row').forEach(cb => {
          cb.addEventListener('change', () => {
            const id = parseInt(cb.dataset.id) || cb.dataset.id;
            if (cb.checked) checkedSet.add(id);
            else checkedSet.delete(id);
            draw();
          });
        });

        // 선택 해제 버튼
        const clearBtn = container.querySelector('.dt-clear-checks');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            checkedSet.clear();
            draw();
          });
        }
      }
    }

    draw();

    // 외부 API
    return {
      update(newData) {
        sortedData = [...newData];
        currentPage = 1;
        draw();
      },
      getCheckedIds() {
        return Array.from(checkedSet);
      },
      clearChecks() {
        checkedSet.clear();
        draw();
      },
    };
  },
};
