/* compat/toast.js — Toast를 전역 노출 */
var Toast = {
  show: function(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) { alert(message); return; }
    var colors = { success:'#16a34a', error:'#dc2626', warning:'#d97706', info:'#2563eb' };
    var bg = colors[type] || colors.info;
    var el = document.createElement('div');
    el.style.cssText = 'padding:10px 16px;margin-bottom:8px;color:#fff;font-size:13px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);background:'+bg+';opacity:0;transition:opacity 0.3s;';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function(){ el.style.opacity = '1'; }, 10);
    setTimeout(function(){ el.style.opacity = '0'; setTimeout(function(){ el.remove(); }, 300); }, 3000);
  }
};
