/* ========================================
   게시판 글쓰기 페이지 (공지사항 / 요청사항 / 교육자료 공용)
   URL: write.html?type=notice
        write.html?type=request&sub=general
        write.html?type=education
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';

const params = new URLSearchParams(location.search);
const type = params.get('type') || 'notice';
const sub = params.get('sub') || 'general';

const TYPE_META = {
  notice:    { label: '공지사항',       listUrl: './notice.html',    menuId: 'board-notice',    storageKey: 'purples_board_notice' },
  request:   { label: '요청사항',       listUrl: './request.html',   menuId: 'board-request',   storageKey: null },
  education: { label: '교육자료',       listUrl: './education.html', menuId: 'board-education',  storageKey: 'purples_board_education' },
};
const meta = TYPE_META[type] || TYPE_META.notice;
if (type === 'request') meta.storageKey = 'purples_board_req_' + sub;

const SUB_LABELS = { general: '일반 업무요청', privacy: '개인정보 삭제요청', cert: '인증요청' };

initLayout({ pageId: meta.menuId, breadcrumbs: ['게시판', meta.label, '등록'] });
const content = document.getElementById('content');

/* ── 옵션 데이터 ── */
const GEN_CATS = ['시스템 오류','데이터 수정','권한 요청','기타'];
const GEN_PRI = ['일반','긴급','최우선'];
const PRV_TYPES = ['회원 탈퇴 후 삭제','정정 요청','제3자 제공 철회','수신 거부','기타'];
const CRT_TYPES = ['서류인증 재요청','자동발급 오류','인증 만료 갱신','추가등록','기타'];
const CRT_DOCS = ['주민등록등본','가족관계증명서','재직증명서','소득금액증명','졸업증명서'];
const EDU_CATS = ['신입교육','매칭실무','상담기법','시스템교육','정책/규정','기타'];

/* ── 폼 HTML ── */
function formHtml() {
  if (type === 'notice') {
    return `
      <div class="form-group"><label class="form-label">제목 <span style="color:var(--status-red)">*</span></label>
        <input class="form-input" id="w-title" placeholder="공지 제목을 입력하세요"></div>
      <div class="form-group"><label class="form-label">내용</label>
        <textarea class="form-input" id="w-content" rows="10" placeholder="공지 내용을 입력하세요"></textarea></div>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-top:8px">
        <input type="checkbox" id="w-pinned"> 상단 고정</label>`;
  }
  if (type === 'education') {
    return `
      <div class="form-group"><label class="form-label">분류 <span style="color:var(--status-red)">*</span></label>
        <select class="form-select" id="w-cat">${EDU_CATS.map(c => `<option>${c}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">자료명 <span style="color:var(--status-red)">*</span></label>
        <input class="form-input" id="w-title" placeholder="자료 제목"></div>
      <div class="form-group"><label class="form-label">파일 형식</label>
        <select class="form-select" id="w-file"><option>PDF</option><option>PPT</option><option>Excel</option><option>Word</option></select></div>
      <div class="form-group"><label class="form-label">설명</label>
        <textarea class="form-input" id="w-content" rows="8" placeholder="자료에 대한 설명을 입력하세요"></textarea></div>`;
  }
  // 요청사항
  if (sub === 'general') {
    return `
      <div class="form-group"><label class="form-label">분류 <span style="color:var(--status-red)">*</span></label>
        <select class="form-select" id="w-cat">${GEN_CATS.map(c => `<option>${c}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">우선순위</label>
        <select class="form-select" id="w-pri">${GEN_PRI.map(p => `<option>${p}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">제목 <span style="color:var(--status-red)">*</span></label>
        <input class="form-input" id="w-title" placeholder="요청 제목"></div>
      <div class="form-group"><label class="form-label">내용</label>
        <textarea class="form-input" id="w-content" rows="8" placeholder="상세 내용을 입력하세요"></textarea></div>`;
  }
  if (sub === 'privacy') {
    return `
      <div class="form-group"><label class="form-label">회원명 <span style="color:var(--status-red)">*</span></label>
        <input class="form-input" id="w-name" placeholder="회원명"></div>
      <div class="form-group"><label class="form-label">회원ID</label>
        <input class="form-input" id="w-id" placeholder="P0000000"></div>
      <div class="form-group"><label class="form-label">삭제유형 <span style="color:var(--status-red)">*</span></label>
        <select class="form-select" id="w-type">${PRV_TYPES.map(t => `<option>${t}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">사유</label>
        <textarea class="form-input" id="w-reason" rows="5" placeholder="삭제 요청 사유를 입력하세요"></textarea></div>`;
  }
  // cert
  return `
    <div class="form-group"><label class="form-label">회원명 <span style="color:var(--status-red)">*</span></label>
      <input class="form-input" id="w-name" placeholder="회원명"></div>
    <div class="form-group"><label class="form-label">요청유형 <span style="color:var(--status-red)">*</span></label>
      <select class="form-select" id="w-type">${CRT_TYPES.map(t => `<option>${t}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">서류명</label>
      <select class="form-select" id="w-doc">${CRT_DOCS.map(d => `<option>${d}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">비고</label>
      <textarea class="form-input" id="w-note" rows="5" placeholder="추가 메모"></textarea></div>`;
}

/* ── 저장 ── */
function save() {
  let data = [];
  try { data = JSON.parse(localStorage.getItem(meta.storageKey) || '[]'); } catch(e){}
  const today = new Date().toISOString().slice(0, 10);
  const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;

  if (type === 'notice') {
    const title = document.getElementById('w-title')?.value.trim();
    if (!title) { Toast.show('제목을 입력하세요.', 'warning'); return; }
    data.unshift({ id: newId, title, category: '기타', pinned: document.getElementById('w-pinned')?.checked || false,
      writer: '관리자(admin)', createdAt: today, views: 0 });
  } else if (type === 'education') {
    const title = document.getElementById('w-title')?.value.trim();
    if (!title) { Toast.show('자료명을 입력하세요.', 'warning'); return; }
    data.unshift({ id: newId, title, category: document.getElementById('w-cat').value,
      fileType: document.getElementById('w-file').value, writer: '관리자(admin)', createdAt: today, views: 0, downloads: 0 });
  } else if (sub === 'general') {
    const title = document.getElementById('w-title')?.value.trim();
    if (!title) { Toast.show('제목을 입력하세요.', 'warning'); return; }
    data.unshift({ id: newId, title, category: document.getElementById('w-cat').value,
      priority: document.getElementById('w-pri').value, status: '접수', writer: '관리자(admin)', createdAt: today, replies: 0 });
  } else if (sub === 'privacy') {
    const name = document.getElementById('w-name')?.value.trim();
    if (!name) { Toast.show('회원명을 입력하세요.', 'warning'); return; }
    data.unshift({ id: newId, memberName: name, memberId: document.getElementById('w-id')?.value.trim() || '-',
      deleteType: document.getElementById('w-type').value, reason: document.getElementById('w-reason')?.value.trim() || '본인 요청',
      status: '접수', writer: '관리자(admin)', createdAt: today, completedAt: '' });
  } else {
    const name = document.getElementById('w-name')?.value.trim();
    if (!name) { Toast.show('회원명을 입력하세요.', 'warning'); return; }
    data.unshift({ id: newId, memberName: name, certType: document.getElementById('w-type').value,
      docName: document.getElementById('w-doc').value, status: '접수', writer: '관리자(admin)', createdAt: today,
      note: document.getElementById('w-note')?.value.trim() || '' });
  }

  localStorage.setItem(meta.storageKey, JSON.stringify(data));
  Toast.show('등록되었습니다.', 'success');
  setTimeout(() => location.href = meta.listUrl, 500);
}

/* ── 렌더링 ── */
const subtitle = type === 'request' ? (SUB_LABELS[sub] || '요청사항') + ' 등록' : meta.label + ' 등록';

content.innerHTML = `
  <div class="page-header">
    <div><h1 class="page-header__title">${subtitle}</h1>
    <p class="page-header__subtitle">새 게시글을 작성합니다</p></div>
    <div class="page-header__actions">
      <a class="btn btn--secondary btn--sm" href="${meta.listUrl}">취소</a>
    </div>
  </div>
  <div class="card">
    <div class="card__body">
      ${formHtml()}

      <div class="form-group" style="margin-top:20px">
        <label class="form-label">첨부파일</label>
        <div id="file-drop" style="border:2px dashed var(--border-light);padding:24px;text-align:center;cursor:pointer;transition:border-color .2s">
          <div style="font-size:13px;color:var(--text-muted)">파일을 드래그하거나 클릭하여 선택하세요</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">최대 10MB / 파일당, 5개까지 첨부 가능</div>
          <input type="file" id="w-files" multiple style="display:none">
        </div>
        <div id="file-list" style="margin-top:8px"></div>
      </div>

      <div style="margin-top:24px;display:flex;justify-content:flex-end;gap:8px">
        <a class="btn btn--secondary" href="${meta.listUrl}">취소</a>
        <button class="btn btn--primary" id="btn-save">등록</button>
      </div>
    </div>
  </div>
`;

/* ── 파일 첨부 ── */
const fileInput = document.getElementById('w-files');
const fileDrop = document.getElementById('file-drop');
const fileListEl = document.getElementById('file-list');
let attachedFiles = [];

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function renderFileList() {
  if (attachedFiles.length === 0) {
    fileListEl.innerHTML = '';
    return;
  }
  fileListEl.innerHTML = attachedFiles.map((f, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border:1px solid var(--border-light);margin-bottom:4px;font-size:12px">
      <span><span class="badge badge--gray" style="font-size:10px;margin-right:6px">${f.name.split('.').pop().toUpperCase()}</span>${f.name}</span>
      <span style="display:flex;align-items:center;gap:8px">
        <span class="text-muted">${formatSize(f.size)}</span>
        <button class="btn btn--sm" style="font-size:10px;padding:2px 6px;background:none;border:1px solid var(--border-light);color:var(--text-muted)" data-remove="${i}">삭제</button>
      </span>
    </div>
  `).join('');
  fileListEl.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      attachedFiles.splice(parseInt(btn.dataset.remove), 1);
      renderFileList();
    });
  });
}

function addFiles(files) {
  for (const f of files) {
    if (attachedFiles.length >= 5) { Toast.show('최대 5개까지 첨부 가능합니다.', 'warning'); break; }
    if (f.size > 10 * 1024 * 1024) { Toast.show(`${f.name}: 10MB 초과`, 'warning'); continue; }
    if (!attachedFiles.some(af => af.name === f.name && af.size === f.size)) {
      attachedFiles.push(f);
    }
  }
  renderFileList();
}

fileDrop.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });
fileDrop.addEventListener('dragover', e => { e.preventDefault(); fileDrop.style.borderColor = 'var(--accent)'; });
fileDrop.addEventListener('dragleave', () => { fileDrop.style.borderColor = 'var(--border-light)'; });
fileDrop.addEventListener('drop', e => { e.preventDefault(); fileDrop.style.borderColor = 'var(--border-light)'; addFiles(e.dataTransfer.files); });

document.getElementById('btn-save').addEventListener('click', save);
