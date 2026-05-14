/* ========================================
   차트 컴포넌트 (ES Module)
   ======================================== */

export const Chart = {
  /** 바 차트 */
  renderBar(containerId, data, options = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const max = Math.max(...data.map(d => d.value));
    const format = options.format || (v => v.toLocaleString());
    el.innerHTML = `
      <div class="chart-bar">
        <div class="chart-bar__bars">
          ${data.map(d => {
            const pct = max > 0 ? (d.value / max * 100) : 0;
            return `
              <div class="chart-bar__col">
                <div class="chart-bar__value">${format(d.value)}</div>
                <div class="chart-bar__track">
                  <div class="chart-bar__fill" style="height:${pct}%;background:${d.color || 'var(--accent)'}"></div>
                </div>
                <div class="chart-bar__label">${d.label}</div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  },

  /** 도넛 차트 */
  renderDonut(containerId, data, options = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const total = data.reduce((s, d) => s + d.value, 0);
    let cumPct = 0;
    const gradientParts = data.map(d => {
      const start = cumPct;
      cumPct += (d.value / total) * 100;
      return `${d.color} ${start}% ${cumPct}%`;
    });
    const centerLabel = options.centerLabel ?? total;
    const centerSub = options.centerSub ?? '';
    el.innerHTML = `
      <div class="chart-donut">
        <div class="chart-donut__ring" style="background:conic-gradient(${gradientParts.join(',')})">
          <div class="chart-donut__center">
            <div class="chart-donut__total">${centerLabel}</div>
            <div class="chart-donut__subtitle">${centerSub}</div>
          </div>
        </div>
        <div class="chart-donut__legend">
          ${data.map(d => `
            <div class="chart-donut__legend-item">
              <div class="chart-donut__legend-dot" style="background:${d.color}"></div>
              <span class="chart-donut__legend-label">${d.label}</span>
              <span class="chart-donut__legend-value">${d.value}</span>
            </div>`).join('')}
        </div>
      </div>`;
  },
};
