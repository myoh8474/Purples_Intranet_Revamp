const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// ── 기능구분 자동 분류 ──
function classifyType(name, detail) {
  const t = (name + ' ' + detail).toLowerCase();
  if (/알림|sms|문자\s*발송|푸시|예약\s*알림|리마인드|주기\s*sms/.test(t)) return '알림';
  if (/db\s*분배|분배\s*통계|분배\s*이력|자동분배|수동분배|이관|재분배|소스아웃|중복\s*db|중복\s*처리|데이터\s*이관|db\s*포기|마스킹|학력\s*기반/.test(t)) return 'DB';
  if (/통계|대시보드|유입통계/.test(t)) return '개발';
  if (/정책|권한|승인|차단|불가\s*상태|제어|일원화|분리\s*유지|재인증|폐지|정의/.test(t)) return '정책';
  if (/표시|표기|구분\s*필터|태그|색상|컬러|d-day|위치\s*조정|상단|하단|병렬|필터|다중선택|정렬|검색|스크롤|분리|탭|메모장|캘린더|범례/.test(t)) return 'UI';
  if (/자동|연동|전산화|추적|기록|등록|계산|생성|이력|처리|프로세스|체크|감지|설계|도입|개선|관리\s*기능|전산|영수증/.test(t)) return '개발';
  return '개발';
}

// ── 엑셀 파일 로딩 ──
const dir = __dirname;
const xlsxFiles = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));
if (!xlsxFiles.length) { console.error('❌ docs/ 폴더에 .xlsx 파일이 없습니다.'); process.exit(1); }
const xlPath = path.join(dir, xlsxFiles[0]);
console.log('📂 소스 파일:', xlsxFiles[0]);

const wb = XLSX.readFile(xlPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const all = [];
for (let i = 4; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[1]) continue;
  const name = String(r[2] || '').trim();
  const detail = String(r[3] || '').trim();
  const type = r[4] ? String(r[4]).trim() : classifyType(name, detail);
  all.push({
    code: String(r[1]).trim(),
    name, detail, type,
    page: String(r[5] || '-').replace(/\t/g, '').trim(),
    dept: String(r[6] || '-').trim(),
    status: String(r[7] || '진행전').trim(),
    policy: String(r[8] || '').trim(),
    priority: String(r[9] || '중').trim(),
    notes: String(r[10] || '').trim(),
    source: String(r[11] || '').trim()
  });
}

const dataJSON = JSON.stringify(all);
const pages = [...new Set(all.map(d=>d.page))].sort();
const depts = [...new Set(all.map(d=>d.dept))].sort();
const pageOpts = '<option value="-">선택</option>' + pages.map(p=>'<option>'+p+'</option>').join('');
const deptOpts = '<option value="-">선택</option>' + depts.map(p=>'<option>'+p+'</option>').join('');
const html = `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8">
<title>퍼플스 인트라넷 — 통합 요구사항 관리</title>
<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Malgun Gothic',sans-serif;background:#f4f5f7;color:#222}
.hd{background:linear-gradient(135deg,#1a237e,#4a148c);color:#fff;padding:20px 28px}
.hd h1{font-size:20px;margin-bottom:4px}.hd p{font-size:12px;opacity:.8}
/* 전체 진행율 */
.progress-bar-wrap{margin:8px 0 0;background:rgba(255,255,255,.15);border-radius:6px;height:22px;overflow:hidden;position:relative}
.progress-bar-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,#66bb6a,#43a047);transition:width .4s;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;min-width:40px}
/* 통계 카드 */
.stats{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;padding:16px 28px}
.stat{background:#fff;border-radius:8px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,.08);text-align:center}
.stat .num{font-size:26px;font-weight:700;color:#1a237e}.stat .label{font-size:11px;color:#666;margin-top:4px}
/* 차트 */
.charts{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:0 28px 16px}
.chart-box{background:#fff;border-radius:8px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.chart-box h3{font-size:13px;margin-bottom:10px;color:#333}
.bar-row{display:flex;align-items:center;gap:6px;margin-bottom:5px;font-size:11px}
.bar-label{width:60px;text-align:right;flex-shrink:0;font-size:10px}
.bar-track{flex:1;height:14px;background:#f0f0f0;border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px;display:flex;align-items:center;padding-left:5px;color:#fff;font-size:9px;font-weight:600;min-width:14px}
.bar-pct{width:38px;text-align:right;font-weight:600;font-size:10px}
/* 툴바 */
.toolbar{padding:12px 28px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.toolbar select,.toolbar input{padding:6px 10px;border:1px solid #ccc;border-radius:4px;font-size:12px}
.toolbar input{width:200px}
.btn{padding:7px 16px;border:none;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer;transition:.2s}
.btn-green{background:#1b5e20;color:#fff}.btn-green:hover{background:#2e7d32}
.btn-blue{background:#1565c0;color:#fff}.btn-blue:hover{background:#1976d2}
/* 테이블 */
.wrap{padding:0 28px 28px;overflow-x:auto}
table{width:100%;border-collapse:collapse;background:#fff;font-size:11px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
th{background:#37474f;color:#fff;padding:7px 8px;text-align:left;white-space:nowrap;position:sticky;top:0;z-index:1}
td{padding:5px 8px;border-bottom:1px solid #eee;vertical-align:top;line-height:1.4}
tr:hover{background:#f5f5f5}tr.dup{background:#fff8e1}
.tag{display:inline-block;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:600}
.tag-ui{background:#e3f2fd;color:#1565c0}.tag-dev{background:#f3e5f5;color:#7b1fa2}
.tag-db{background:#e8f5e9;color:#2e7d32}.tag-noti{background:#fff3e0;color:#e65100}
.tag-policy{background:#fce4ec;color:#c62828}.tag-etc{background:#f5f5f5;color:#616161}
.pri-h{color:#c62828;font-weight:700}.pri-m{color:#f57f17}.pri-l{color:#999}
.src{font-size:10px;padding:2px 6px;border-radius:10px;font-weight:600}
.src-1{background:#e8eaf6;color:#283593}.src-2{background:#e0f2f1;color:#00695c}
.src-3{background:#fce4ec;color:#880e4f}.src-4{background:#f3e5f5;color:#6a1b9a}.src-5{background:#fff8e1;color:#f57f17}
/* 상태 드롭다운 */
select.st{padding:3px 6px;border-radius:4px;font-size:11px;font-weight:600;border:1px solid #ccc;cursor:pointer}
select.st-done{background:#e8f5e9;color:#2e7d32;border-color:#a5d6a7}
select.st-ing{background:#e3f2fd;color:#1565c0;border-color:#90caf9}
select.st-hold{background:#fff3e0;color:#e65100;border-color:#ffcc80}
select.st-wait{background:#f5f5f5;color:#616161;border-color:#e0e0e0}
/* 비고 */
.note-cell{min-width:160px;max-width:220px;cursor:pointer;position:relative}
.note-cell:hover{background:#f5f5f5}
.note-preview{font-size:10px;color:#333;white-space:pre-line;max-height:40px;overflow:hidden}
.note-badge{display:inline-block;background:#e3f2fd;color:#1565c0;border-radius:10px;padding:1px 6px;font-size:9px;font-weight:600;margin-left:4px}
.note-add{color:#999;font-size:10px;cursor:pointer}.note-add:hover{color:#1565c0}
/* 모달 */
.modal-bg{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.4);z-index:100;align-items:center;justify-content:center}
.modal-bg.show{display:flex}
.modal{background:#fff;border-radius:10px;width:480px;max-height:80vh;box-shadow:0 8px 30px rgba(0,0,0,.2);display:flex;flex-direction:column}
.modal-hd{padding:16px 20px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center}
.modal-hd h3{font-size:15px;color:#222}.modal-hd .close{cursor:pointer;font-size:20px;color:#999;border:none;background:none}
.modal-body{padding:16px 20px;overflow-y:auto;flex:1}
.modal-body textarea{width:100%;height:60px;border:1px solid #ccc;border-radius:6px;padding:8px;font-size:12px;resize:vertical;font-family:inherit}
.modal-body .add-btn{margin-top:8px;padding:6px 14px;background:#1565c0;color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer}
.modal-body .add-btn:hover{background:#1976d2}
.history{margin-top:14px;border-top:1px solid #eee;padding-top:10px}
.history h4{font-size:12px;color:#666;margin-bottom:8px}
.history-item{padding:8px 10px;border-left:3px solid #1565c0;margin-bottom:6px;background:#f8f9fa;border-radius:0 4px 4px 0}
.history-item .hi-date{font-size:10px;color:#999;margin-bottom:2px}
.history-item .hi-text{font-size:11px;color:#333;white-space:pre-wrap}
.history-item .hi-del{float:right;color:#ccc;cursor:pointer;font-size:11px;border:none;background:none}.history-item .hi-del:hover{color:#c62828}
.del-btn{background:none;border:1px solid #e0e0e0;color:#999;border-radius:3px;padding:2px 6px;font-size:10px;cursor:pointer;transition:.2s}.del-btn:hover{background:#ffebee;color:#c62828;border-color:#ef9a9a}
.btn-purple{background:#6a1b9a;color:#fff}.btn-purple:hover{background:#8e24aa}
.btn-teal{background:#00695c;color:#fff}.btn-teal:hover{background:#00897b}
/* 추가등록 모달 */
.add-modal{width:560px}
.add-modal .form-grid{display:grid;grid-template-columns:100px 1fr;gap:8px 12px;font-size:12px;align-items:center}
.add-modal .form-grid label{font-weight:600;text-align:right;color:#555}
.add-modal .form-grid input,.add-modal .form-grid select,.add-modal .form-grid textarea{padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:12px;font-family:inherit}
.add-modal .form-grid textarea{height:60px;resize:vertical;grid-column:2}
.add-modal .form-actions{margin-top:14px;text-align:right;display:flex;gap:8px;justify-content:flex-end}
.upload-area{border:2px dashed #ccc;border-radius:8px;padding:20px;text-align:center;color:#999;font-size:12px;cursor:pointer;transition:.2s;margin-bottom:12px}
.upload-area:hover{border-color:#6a1b9a;color:#6a1b9a;background:#faf5ff}
.upload-area input{display:none}
.restore-btn{background:#fff3e0;color:#e65100;border:1px solid #ffcc80;border-radius:3px;padding:2px 6px;font-size:10px;cursor:pointer}.restore-btn:hover{background:#ffe0b2}
tr.deleted{opacity:.4;text-decoration:line-through}
.btn-orange{background:#e65100;color:#fff}.btn-orange:hover{background:#f57c00}
@media print{.toolbar,.btn,.modal-bg{display:none}}
</style></head><body>
<div class="hd">
  <h1>📋 퍼플스 인트라넷 — 통합 요구사항 관리</h1>
  <p>1차리뷰·2차리뷰·분배회의·매칭전략회의·인증회의 | 총 <span id="totalCount"></span>건</p>
  <div class="progress-bar-wrap"><div class="progress-bar-fill" id="totalProgress">0%</div></div>
</div>
<div class="stats" id="statsArea"></div>
<div class="charts" id="chartsArea"></div>
<div class="toolbar">
  <select id="fSource"><option value="">출처 전체</option></select>
  <select id="fType"><option value="">기능구분 전체</option></select>
  <select id="fPriority"><option value="">중요도 전체</option></select>
  <select id="fStatus"><option value="">진행상태 전체</option><option>진행전</option><option>진행중</option><option>완료</option><option>보류</option></select>
  <input type="text" id="fSearch" placeholder="🔍 기능명/요구사항 검색...">
  <button class="btn btn-purple" onclick="openAddModal()">➕ 요구사항 등록</button>
  <button class="btn btn-teal" onclick="document.getElementById('xlUpload').click()">📤 엑셀 업로드</button>
  <input type="file" id="xlUpload" accept=".xlsx,.xls,.csv" style="display:none" onchange="uploadExcel(this)">
  <button class="btn btn-green" onclick="downloadExcel()">📥 엑셀 다운로드</button>
  <button class="btn btn-blue" onclick="resetFilters()">↺ 초기화</button>
  <button class="btn btn-orange" id="toggleDeleted" onclick="toggleDeleted()" style="display:none">🗑️ 삭제항목 보기 (0건)</button>
  <span id="filterCount" style="font-size:12px;color:#666;margin-left:8px"></span>
</div>
<div class="wrap"><table><thead><tr>
  <th>코드</th><th>기능명</th><th>상세 요구사항</th><th>기능구분</th><th>관련페이지</th>
  <th>관련부서</th><th>진행상태</th><th>정책확인</th><th>중요도</th><th>비고</th><th>출처</th><th>관리</th>
</tr></thead><tbody id="tbody"></tbody></table></div>
<div class="modal-bg" id="noteModal">
  <div class="modal">
    <div class="modal-hd"><h3 id="noteModalTitle">비고 작성</h3><button class="close" onclick="closeNoteModal()">&times;</button></div>
    <div class="modal-body">
      <textarea id="noteInput" placeholder="메모를 입력하세요..."></textarea>
      <button class="add-btn" onclick="addNote()">✏️ 메모 추가</button>
      <div class="history" id="noteHistory"></div>
    </div>
  </div>
</div>
<div class="modal-bg" id="addModal">
  <div class="modal add-modal">
    <div class="modal-hd"><h3>➕ 요구사항 등록</h3><button class="close" onclick="closeAddModal()">&times;</button></div>
    <div class="modal-body">
      <div class="upload-area" onclick="document.getElementById('xlUpload2').click()">
        📤 엑셀 파일을 클릭하여 업로드 (여러 건 일괄 등록)<br>
        <small>컬럼: 기능명, 상세요구사항, 기능구분, 관련페이지, 관련부서, 출처</small>
        <input type="file" id="xlUpload2" accept=".xlsx,.xls,.csv" onchange="uploadExcel(this);closeAddModal()">
      </div>
      <hr style="margin:12px 0;border:none;border-top:1px solid #eee">
      <div class="form-grid">
        <label>기능명 *</label><input id="addName" placeholder="필수">
        <label>상세요구사항 *</label><textarea id="addDetail" placeholder="필수"></textarea>
        <label>기능구분</label><select id="addType"><option>UI</option><option>개발</option><option>DB</option><option>알림</option><option>정책</option><option>기타</option></select>
        <label>관련페이지</label><select id="addPage">${pageOpts}</select>
        <label>관련부서</label><select id="addDept">${deptOpts}</select>
        <label>중요도</label><select id="addPri"><option>중</option><option>상</option><option>하</option></select>
        <label>출처</label><input id="addSource" placeholder="예: 추가요청" value="추가요청">
      </div>
      <div class="form-actions">
        <button class="btn btn-blue" onclick="closeAddModal()">취소</button>
        <button class="btn btn-purple" onclick="submitAddReq()">등록</button>
      </div>
    </div>
  </div>
</div>
<script>
const DATA = ${dataJSON};
// localStorage에서 사용자 추가 요구사항 병합
const customReqs = JSON.parse(localStorage.getItem('req_custom')||'[]');
customReqs.forEach(d => DATA.push(d));
// localStorage에서 상태+비고 복원
const saved = JSON.parse(localStorage.getItem('req_status')||'{}');
const savedNotes = JSON.parse(localStorage.getItem('req_notes')||'{}');
const deletedSet = new Set(JSON.parse(localStorage.getItem('req_deleted')||'[]'));
DATA.forEach(d => { if (saved[d.code]) d.status = saved[d.code]; });
function getNoteHistory(code) { return savedNotes[code] || []; }
function saveNotes() { localStorage.setItem('req_notes', JSON.stringify(savedNotes)); }
function saveDeleted() { localStorage.setItem('req_deleted', JSON.stringify([...deletedSet])); }
function saveCustom() { localStorage.setItem('req_custom', JSON.stringify(customReqs)); }
function nextCode() {
  const nums = DATA.map(d=>parseInt(d.code.replace('REQ-',''))).filter(n=>!isNaN(n));
  return 'REQ-'+String(Math.max(...nums)+1).padStart(3,'0');
}
let currentNoteCode = null;
let showDeleted = false;
function getActiveData() { return showDeleted ? DATA : DATA.filter(d => !deletedSet.has(d.code)); }

const tbody = document.getElementById('tbody');
document.getElementById('totalCount').textContent = DATA.length;

const tagClass = {UI:'tag-ui','개발':'tag-dev',DB:'tag-db','알림':'tag-noti','정책':'tag-policy'};
const srcClass = {'1차리뷰':'src-1','2차리뷰':'src-2','분배회의':'src-3','매칭전략':'src-4','인증회의':'src-5'};
const stClass = {'완료':'st-done','진행중':'st-ing','보류':'st-hold','진행전':'st-wait'};
const statuses = ['진행전','진행중','완료','보류'];
const colors6 = ['#1565c0','#2e7d32','#c62828','#6a1b9a','#e65100','#00838f','#37474f','#ad1457'];

function saveStatus() {
  const m = {};
  DATA.forEach(d => m[d.code] = d.status);
  localStorage.setItem('req_status', JSON.stringify(m));
}

function calcProgress(items) {
  if (!items.length) return 0;
  const done = items.filter(d => d.status === '완료').length;
  const ing = items.filter(d => d.status === '진행중').length;
  return Math.round((done * 1 + ing * 0.3) / items.length * 100);
}

function buildStats() {
  const area = document.getElementById('statsArea');
  const done = DATA.filter(d=>d.status==='완료').length;
  const ing = DATA.filter(d=>d.status==='진행중').length;
  const hold = DATA.filter(d=>d.status==='보류').length;
  const wait = DATA.filter(d=>d.status==='진행전').length;
  const policyN = DATA.filter(d=>d.policy==='Y').length;
  const pct = calcProgress(DATA);
  area.innerHTML = [
    {num:DATA.length,label:'전체 요구사항'},
    {num:done,label:'✅ 완료'},
    {num:ing,label:'🔄 진행중'},
    {num:wait,label:'⏳ 진행전'},
    {num:hold,label:'⏸️ 보류'},
    {num:pct+'%',label:'📊 전체 진행율'},
  ].map(s=>'<div class="stat"><div class="num">'+s.num+'</div><div class="label">'+s.label+'</div></div>').join('');
  // 전체 진행 바
  const bar = document.getElementById('totalProgress');
  bar.style.width = Math.max(pct,3)+'%'; bar.textContent = pct+'%';
}

function buildCharts() {
  const area = document.getElementById('chartsArea');
  function countBy(key) {
    const m = {}; DATA.forEach(d => m[d[key]]=(m[d[key]]||0)+1);
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  }
  function barChart(title, entries, max, showPct) {
    let h = '<div class="chart-box"><h3>'+title+'</h3>';
    entries.forEach(([k,v],i) => {
      const pct = Math.round(v/max*100);
      let extra = '';
      if (showPct) {
        const items = DATA.filter(d=>d.dept===k);
        const p = calcProgress(items);
        extra = '<div class="bar-pct">진행 '+p+'%</div>';
      }
      h += '<div class="bar-row"><div class="bar-label">'+k+'</div><div class="bar-track"><div class="bar-fill" style="width:'+Math.max(pct,5)+'%;background:'+colors6[i%8]+'">'+v+'</div></div>'+extra+'</div>';
    });
    return h + '</div>';
  }
  const bySrc = countBy('source');
  const byType = countBy('type');
  const byDept = countBy('dept');
  // 진행상태 분포
  const byStatus = countBy('status');
  area.innerHTML =
    barChart('출처별 분포', bySrc, DATA.length, false) +
    barChart('기능구분별 분포', byType, DATA.length, false) +
    barChart('부서별 요구사항 (진행율 포함)', byDept, DATA.length, true) +
    barChart('진행상태 분포', byStatus, DATA.length, false);
}

function buildFilters() {
  ['source','type'].forEach(key => {
    const vals = [...new Set(DATA.map(d=>d[key]))].sort();
    const id = key==='source'?'fSource':'fType';
    const sel = document.getElementById(id);
    vals.forEach(v => { const o = document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o); });
  });
  const priSel = document.getElementById('fPriority');
  ['상','중','하'].forEach(v => { const o = document.createElement('option'); o.value=v; o.textContent=v; priSel.appendChild(o); });
}

function render(items) {
  tbody.innerHTML = items.map(d => {
    const tc = tagClass[d.type]||'tag-etc';
    const sc = srcClass[d.source]||'src-1';
    const pc = d.priority==='상'?'pri-h':d.priority==='중'?'pri-m':'pri-l';
    const dup = '';
    const stCls = stClass[d.status]||'st-wait';
    const opts = statuses.map(s => '<option'+(s===d.status?' selected':'')+'>'+s+'</option>').join('');
    return '<tr'+dup+'>'
      +'<td><b>'+d.code+'</b></td>'
      +'<td>'+d.name+'</td>'
      +'<td style="max-width:400px">'+d.detail+'</td>'
      +'<td><span class="tag '+tc+'">'+d.type+'</span></td>'
      +'<td>'+d.page+'</td>'
      +'<td>'+d.dept+'</td>'
      +'<td><select class="st '+stCls+'" data-code="'+d.code+'" onchange="changeStatus(this.dataset.code,this)">'+opts+'</select></td>'
      +'<td>'+(d.policy||'—')+'</td>'
      +'<td class="'+pc+'">'+d.priority+'</td>'
      +'<td class="note-cell" data-code="'+d.code+'" onclick="openNoteModal(this.dataset.code)">' + renderNoteCell(d.code, d.notes) + '</td>'
      +'<td><span class="src '+sc+'">'+d.source+'</span></td>'
      +'<td>'+(deletedSet.has(d.code)?'<button class="restore-btn" data-code="'+d.code+'" onclick="restoreReq(this.dataset.code);event.stopPropagation()">복원</button>':'<button class="del-btn" data-code="'+d.code+'" onclick="deleteReq(this.dataset.code);event.stopPropagation()">삭제</button>')+'</td></tr>';
  }).join('');
  document.getElementById('filterCount').textContent = items.length<DATA.length?'필터 결과: '+items.length+'건':'';
}

window.changeStatus = function(code, sel) {
  const d = DATA.find(x=>x.code===code);
  if (d) { d.status = sel.value; saveStatus(); buildStats(); buildCharts(); }
  sel.className = 'st '+(stClass[sel.value]||'st-wait');
};

window.deleteReq = function(code) {
  if (!confirm(code + ' 요구사항을 삭제하시겠습니까?')) return;
  deletedSet.add(code); saveDeleted(); updateDeletedBtn(); applyFilters(); buildStats(); buildCharts();
};
window.restoreReq = function(code) {
  deletedSet.delete(code); saveDeleted(); updateDeletedBtn(); applyFilters(); buildStats(); buildCharts();
};
window.toggleDeleted = function() {
  showDeleted = !showDeleted;
  document.getElementById('toggleDeleted').textContent = showDeleted ? '✅ 활성항목만 보기' : '🗑️ 삭제항목 보기 ('+deletedSet.size+'건)';
  applyFilters();
};
function updateDeletedBtn() {
  const btn = document.getElementById('toggleDeleted');
  btn.style.display = deletedSet.size ? '' : 'none';
  btn.textContent = showDeleted ? '✅ 활성항목만 보기' : '🗑️ 삭제항목 보기 ('+deletedSet.size+'건)';
}

function renderNoteCell(code, baseNote) {
  const hist = getNoteHistory(code);
  const latest = hist.length ? hist[0].text : '';
  const badge = hist.length ? '<span class="note-badge">'+hist.length+'</span>' : '';
  const preview = latest || baseNote || '<span class="note-add">+ 메모 추가</span>';
  return '<div class="note-preview">'+(latest||baseNote||'')+'</div>'+badge+((!latest&&!baseNote)?'<span class="note-add">+ 메모 추가</span>':'');
}

window.openNoteModal = function(code) {
  currentNoteCode = code;
  const d = DATA.find(x=>x.code===code);
  document.getElementById('noteModalTitle').textContent = code + ' — ' + (d?d.name:'') + ' 비고';
  document.getElementById('noteInput').value = '';
  renderHistory();
  document.getElementById('noteModal').classList.add('show');
  document.getElementById('noteInput').focus();
};
window.closeNoteModal = function() {
  document.getElementById('noteModal').classList.remove('show');
  currentNoteCode = null;
  applyFilters();
};
window.addNote = function() {
  const text = document.getElementById('noteInput').value.trim();
  if (!text || !currentNoteCode) return;
  if (!savedNotes[currentNoteCode]) savedNotes[currentNoteCode] = [];
  const now = new Date();
  const dateStr = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  savedNotes[currentNoteCode].unshift({ date: dateStr, text: text });
  saveNotes();
  document.getElementById('noteInput').value = '';
  renderHistory();
};
window.deleteNote = function(idx) {
  if (!currentNoteCode || !savedNotes[currentNoteCode]) return;
  savedNotes[currentNoteCode].splice(idx, 1);
  saveNotes();
  renderHistory();
};
function renderHistory() {
  const el = document.getElementById('noteHistory');
  const hist = getNoteHistory(currentNoteCode);
  const d = DATA.find(x=>x.code===currentNoteCode);
  const base = d ? d.notes : '';
  let h = '<h4>📝 히스토리 ('+hist.length+'건'+(base?', 기본: '+base:'')+')</h4>';
  if (!hist.length && !base) { h += '<div style="color:#999;font-size:11px">아직 메모가 없습니다.</div>'; }
  hist.forEach((item, i) => {
    h += '<div class="history-item"><button class="hi-del" onclick="deleteNote('+i+')">✕</button><div class="hi-date">'+item.date+'</div><div class="hi-text">'+item.text+'</div></div>';
  });
  el.innerHTML = h;
}

function applyFilters() {
  const src=document.getElementById('fSource').value;
  const type=document.getElementById('fType').value;
  const pri=document.getElementById('fPriority').value;
  const st=document.getElementById('fStatus').value;
  const q=document.getElementById('fSearch').value.toLowerCase();
  render(getActiveData().filter(d => {
    if(src&&d.source!==src) return false;
    if(type&&d.type!==type) return false;
    if(pri&&d.priority!==pri) return false;
    if(st&&d.status!==st) return false;
    if(q&&!(d.name+d.detail).toLowerCase().includes(q)) return false;
    return true;
  }));
}
function resetFilters() {
  ['fSource','fType','fPriority','fStatus'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('fSearch').value='';
  render(getActiveData());
}
function downloadExcel() {
  const headers = ['요구사항코드','기능명','상세요구사항','기능구분','관련페이지','관련부서','진행상태','정책확인필요','중요도','비고','출처'];
  const rows = [headers];
  DATA.forEach(d=>{
    const hist = getNoteHistory(d.code);
    const noteText = hist.length ? hist.map(h=>h.date+': '+h.text).join(String.fromCharCode(10)) + (d.notes?String.fromCharCode(10)+'[기본] '+d.notes:'') : d.notes;
    rows.push([d.code,d.name,d.detail,d.type,d.page,d.dept,d.status,d.policy,d.priority,noteText,d.source]);
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols']=[{wch:10},{wch:22},{wch:60},{wch:8},{wch:16},{wch:10},{wch:8},{wch:8},{wch:6},{wch:30},{wch:10}];
  XLSX.utils.book_append_sheet(wb,ws,'통합요구사항');
  XLSX.writeFile(wb,'퍼플스_통합요구사항_'+new Date().toISOString().slice(0,10)+'.xlsx');
}
// 추가 등록 모달
window.openAddModal = function() { document.getElementById('addModal').classList.add('show'); };
window.closeAddModal = function() { document.getElementById('addModal').classList.remove('show'); };
window.submitAddReq = function() {
  const name = document.getElementById('addName').value.trim();
  const detail = document.getElementById('addDetail').value.trim();
  if (!name || !detail) { alert('기능명과 상세요구사항은 필수입니다.'); return; }
  const d = {
    code: nextCode(), name: name, detail: detail,
    type: document.getElementById('addType').value,
    page: document.getElementById('addPage').value.trim()||'-',
    dept: document.getElementById('addDept').value.trim()||'-',
    status: '진행전', policy: '', priority: document.getElementById('addPri').value,
    notes: '', source: document.getElementById('addSource').value.trim()||'추가요청'
  };
  DATA.push(d); customReqs.push(d); saveCustom();
  document.getElementById('addName').value='';
  document.getElementById('addDetail').value='';
  document.getElementById('addPage').value='-';
  document.getElementById('addDept').value='-';
  closeAddModal();
  document.getElementById('totalCount').textContent = DATA.length;
  buildStats(); buildCharts(); applyFilters();
  alert(d.code + ' 등록 완료!');
};
window.uploadExcel = function(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const wb = XLSX.read(e.target.result, {type:'array'});
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, {header:1});
    if (rows.length < 2) { alert('데이터가 없습니다.'); return; }
    const hdr = rows[0].map(h=>String(h).trim());
    let added = 0;
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]; if (!r || !r[0]) continue;
      const getName = (keys) => { for (const k of keys) { const idx = hdr.indexOf(k); if (idx>=0 && r[idx]) return String(r[idx]).trim(); } return ''; };
      const name = getName(['기능명','기능','name']) || String(r[0]||'').trim();
      const detail = getName(['상세요구사항','상세 요구사항','detail']) || String(r[1]||'').trim();
      if (!name) continue;
      const d = {
        code: nextCode(), name: name, detail: detail||name,
        type: getName(['기능구분','type']) || '개발',
        page: getName(['관련페이지','관련 메뉴','관련메뉴','page']) || '-',
        dept: getName(['관련부서','요청 부서','부서','dept']) || '-',
        status: getName(['진행상태','status']) || '진행전',
        policy: '', priority: getName(['중요도','priority']) || '중',
        notes: '', source: getName(['출처','source']) || '엑셀업로드'
      };
      DATA.push(d); customReqs.push(d); added++;
    }
    saveCustom(); input.value = '';
    document.getElementById('totalCount').textContent = DATA.length;
    buildStats(); buildCharts(); applyFilters();
    alert(added + '건 업로드 완료!');
  };
  reader.readAsArrayBuffer(file);
};
['fSource','fType','fPriority','fStatus'].forEach(id=>document.getElementById(id).addEventListener('change',applyFilters));
document.getElementById('fSearch').addEventListener('input',applyFilters);
buildStats(); buildCharts(); buildFilters(); updateDeletedBtn(); render(getActiveData());
<\/script></body></html>`;

fs.writeFileSync(path.join(dir, '요구사항_통합.html'), html, 'utf8');
console.log('✅ 생성 완료: 요구사항_통합.html (' + all.length + '건)');
const uiCount = all.filter(d=>d.type==='UI').length;
console.log('   UI 항목(진행중): ' + uiCount + '건');
console.log('   진행전: ' + all.filter(d=>d.status==='진행전').length + '건');
