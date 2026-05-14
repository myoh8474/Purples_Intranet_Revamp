/* ========================================
   게시판 상세 페이지 (공지사항 / 요청사항 / 교육자료 공용)
   URL: detail.html?type=notice&id=1
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';

const params = new URLSearchParams(location.search);
const type = params.get('type') || 'notice';
const id = parseInt(params.get('id'), 10);

const TYPE_MAP = {
  notice:    { label: '공지사항',   storageKey: 'purples_board_notice',      listUrl: './notice.html',    menuId: 'board-notice' },
  request:   { label: '요청사항',   storageKey: null,                        listUrl: './request.html',   menuId: 'board-request' },
  education: { label: '교육자료',   storageKey: 'purples_board_education',   listUrl: './education.html', menuId: 'board-education' },
};
const meta = TYPE_MAP[type] || TYPE_MAP.notice;

// 요청사항은 sub 파라미터로 구분
const sub = params.get('sub') || 'general';
if (type === 'request') {
  meta.storageKey = 'purples_board_req_' + sub;
}

initLayout({ pageId: meta.menuId, breadcrumbs: ['게시판', meta.label, '상세보기'] });
const content = document.getElementById('content');

function loadItem() {
  try {
    const data = JSON.parse(localStorage.getItem(meta.storageKey) || '[]');
    return data.find(d => d.id === id);
  } catch (e) { return null; }
}

function renderNotice(item) {
  return `
    <div class="detail-field"><span class="detail-field__label">작성자</span><span>${item.writer}</span></div>
    <div class="detail-field"><span class="detail-field__label">등록일</span><span>${item.createdAt}</span></div>
    <div class="detail-field"><span class="detail-field__label">조회수</span><span>${item.views}</span></div>
    ${item.pinned ? '<div class="detail-field"><span class="detail-field__label">고정</span><span class="badge badge--accent">상단 고정</span></div>' : ''}
    <div class="detail-content">
      <p>본 공지는 프로토타입 환경의 더미 데이터입니다.</p>
      <p>${item.title}에 대한 상세 내용이 이곳에 표시됩니다. 실제 서비스에서는 에디터를 통해 작성된 본문이 출력됩니다.</p>
    </div>`;
}

function renderRequest(item) {
  if (item.title) {
    // 일반 업무요청
    return `
      <div class="detail-field"><span class="detail-field__label">분류</span><span class="badge badge--gray">${item.category}</span></div>
      <div class="detail-field"><span class="detail-field__label">상태</span><span class="badge badge--${({접수:'blue',처리중:'amber',완료:'green',반려:'red'})[item.status]||'gray'}">${item.status}</span></div>
      <div class="detail-field"><span class="detail-field__label">작성자</span><span>${item.writer}</span></div>
      <div class="detail-field"><span class="detail-field__label">등록일</span><span>${item.createdAt}</span></div>
      <div class="detail-content"><p>${item.title}에 대한 상세 요청 내용이 이곳에 표시됩니다.</p></div>`;
  }
  if (item.deleteType) {
    // 개인정보 삭제요청
    return `
      <div class="detail-field"><span class="detail-field__label">회원명</span><span>${item.memberName}</span></div>
      <div class="detail-field"><span class="detail-field__label">회원ID</span><span>${item.memberId}</span></div>
      <div class="detail-field"><span class="detail-field__label">삭제유형</span><span>${item.deleteType}</span></div>
      <div class="detail-field"><span class="detail-field__label">사유</span><span>${item.reason}</span></div>
      <div class="detail-field"><span class="detail-field__label">상태</span><span class="badge badge--${({접수:'blue',검토중:'amber',삭제완료:'green',반려:'red'})[item.status]||'gray'}">${item.status}</span></div>
      <div class="detail-field"><span class="detail-field__label">요청자</span><span>${item.writer}</span></div>
      <div class="detail-field"><span class="detail-field__label">요청일</span><span>${item.createdAt}</span></div>
      ${item.completedAt ? `<div class="detail-field"><span class="detail-field__label">완료일</span><span>${item.completedAt}</span></div>` : ''}
      <div class="detail-content"><p>개인정보 삭제요청에 대한 처리 내역이 이곳에 표시됩니다.</p></div>`;
  }
  // 인증요청
  return `
    <div class="detail-field"><span class="detail-field__label">회원명</span><span>${item.memberName}</span></div>
    <div class="detail-field"><span class="detail-field__label">요청유형</span><span>${item.certType}</span></div>
    <div class="detail-field"><span class="detail-field__label">서류명</span><span>${item.docName}</span></div>
    <div class="detail-field"><span class="detail-field__label">상태</span><span class="badge badge--${({접수:'blue',처리중:'amber',완료:'green',반려:'red'})[item.status]||'gray'}">${item.status}</span></div>
    <div class="detail-field"><span class="detail-field__label">요청자</span><span>${item.writer}</span></div>
    <div class="detail-field"><span class="detail-field__label">요청일</span><span>${item.createdAt}</span></div>
    ${item.note ? `<div class="detail-field"><span class="detail-field__label">비고</span><span>${item.note}</span></div>` : ''}
    <div class="detail-content"><p>인증요청에 대한 처리 내역이 이곳에 표시됩니다.</p></div>`;
}

function renderEducation(item) {
  return `
    <div class="detail-field"><span class="detail-field__label">분류</span><span class="badge badge--gray">${item.category}</span></div>
    <div class="detail-field"><span class="detail-field__label">파일형식</span><span class="badge badge--gray">${item.fileType}</span></div>
    <div class="detail-field"><span class="detail-field__label">작성자</span><span>${item.writer}</span></div>
    <div class="detail-field"><span class="detail-field__label">등록일</span><span>${item.createdAt}</span></div>
    <div class="detail-field"><span class="detail-field__label">조회</span><span>${item.views}</span></div>
    <div class="detail-field"><span class="detail-field__label">다운로드</span><span>${item.downloads}</span></div>
    <div class="detail-content">
      <p>${item.title}에 대한 교육자료 상세 내용이 이곳에 표시됩니다.</p>
      <p>실제 서비스에서는 첨부 파일 다운로드 및 본문 미리보기가 제공됩니다.</p>
    </div>
    <div style="margin-top:16px">
      <button class="btn btn--primary btn--sm" onclick="Toast.show('파일 다운로드는 서버 연동 후 제공됩니다.','info')">다운로드</button>
    </div>`;
}

function loadList() {
  try { return JSON.parse(localStorage.getItem(meta.storageKey) || '[]'); } catch(e) { return []; }
}

function buildDetailUrl(itemId) {
  let url = `./detail.html?type=${type}&id=${itemId}`;
  if (type === 'request') url += `&sub=${sub}`;
  return url;
}

function getItemTitle(item) {
  return item.title || item.memberName || item.certType || '-';
}

function renderPrevNext(list) {
  const idx = list.findIndex(d => d.id === id);
  if (idx === -1) return '';
  const prev = idx < list.length - 1 ? list[idx + 1] : null;
  const next = idx > 0 ? list[idx - 1] : null;

  return `
    <div class="post-nav">
      <div class="post-nav__item">
        ${prev
          ? `<a href="${buildDetailUrl(prev.id)}"><span class="post-nav__label">이전글</span><span class="post-nav__title">${getItemTitle(prev)}</span></a>`
          : `<span class="post-nav__empty"><span class="post-nav__label">이전글</span><span class="text-muted">이전 게시글이 없습니다</span></span>`}
      </div>
      <div class="post-nav__item">
        ${next
          ? `<a href="${buildDetailUrl(next.id)}"><span class="post-nav__label">다음글</span><span class="post-nav__title">${getItemTitle(next)}</span></a>`
          : `<span class="post-nav__empty"><span class="post-nav__label">다음글</span><span class="text-muted">다음 게시글이 없습니다</span></span>`}
      </div>
    </div>`;
}
/* ── 답글 (요청사항 전용, 대댓글 지원) ── */
const REPLY_KEY = type === 'request' ? `purples_board_reply_${sub}_${id}` : null;

function loadReplies() {
  if (!REPLY_KEY) return [];
  try { return JSON.parse(localStorage.getItem(REPLY_KEY) || '[]'); } catch(e) { return []; }
}

function countAll(replies) {
  return replies.reduce((sum, r) => sum + 1 + (r.children ? countAll(r.children) : 0), 0);
}

function saveReplies(replies) {
  if (!REPLY_KEY) return;
  localStorage.setItem(REPLY_KEY, JSON.stringify(replies));
  try {
    const list = JSON.parse(localStorage.getItem(meta.storageKey) || '[]');
    const item = list.find(d => d.id === id);
    if (item) { item.replies = countAll(replies); localStorage.setItem(meta.storageKey, JSON.stringify(list)); }
  } catch(e){}
}

function nextId(replies) {
  let max = 0;
  for (const r of replies) {
    if (r.id > max) max = r.id;
    if (r.children) { const cm = nextId(r.children); if (cm > max) max = cm; }
  }
  return max + 1;
}

function renderReplyItem(r, depth) {
  const indent = depth * 24;
  const children = (r.children || []).map(c => renderReplyItem(c, depth + 1)).join('');
  return `
    <div class="reply-item" style="padding-left:${16 + indent}px">
      ${depth > 0 ? '<span class="reply-item__arrow">└</span>' : ''}
      <div class="reply-item__header">
        <span class="reply-item__writer">${r.writer}</span>
        <span style="display:flex;align-items:center;gap:8px">
          <span class="reply-item__date">${r.createdAt}</span>
          <button class="btn-reply-to" data-reply-id="${r.id}">답글</button>
        </span>
      </div>
      <div class="reply-item__body">${r.content}</div>
      <div class="reply-inline-form" id="reply-form-${r.id}" style="display:none;margin-top:8px">
        <textarea class="form-input" rows="2" placeholder="답글을 입력하세요" style="resize:vertical;font-size:12px"></textarea>
        <div style="margin-top:4px;display:flex;justify-content:flex-end;gap:4px">
          <button class="btn btn--sm btn-cancel-reply" data-reply-id="${r.id}" style="font-size:11px">취소</button>
          <button class="btn btn--primary btn--sm btn-submit-reply" data-reply-id="${r.id}" style="font-size:11px">등록</button>
        </div>
      </div>
    </div>
    ${children}`;
}

function renderReplies() {
  const replies = loadReplies();
  const total = countAll(replies);
  return `
    <div class="card" style="margin-top:var(--spacing-md)">
      <div class="card__header">
        <h3 class="card__title" style="font-size:14px">답글 <span style="font-weight:400;color:var(--text-muted)">${total}</span></h3>
      </div>
      <div class="card__body" style="padding:0">
        ${total > 0 ? replies.map(r => renderReplyItem(r, 0)).join('')
          : '<div style="padding:20px;text-align:center;font-size:13px;color:var(--text-muted)">등록된 답글이 없습니다</div>'}
      </div>
    </div>
    <div class="card" style="margin-top:var(--spacing-sm)">
      <div class="card__body">
        <textarea class="form-input" id="reply-content" rows="3" placeholder="답글을 입력하세요" style="resize:vertical"></textarea>
        <div style="margin-top:8px;display:flex;justify-content:flex-end">
          <button class="btn btn--primary btn--sm" id="btn-reply">답글 등록</button>
        </div>
      </div>
    </div>`;
}

function findAndAddChild(replies, parentId, child) {
  for (const r of replies) {
    if (r.id === parentId) { if (!r.children) r.children = []; r.children.push(child); return true; }
    if (r.children && findAndAddChild(r.children, parentId, child)) return true;
  }
  return false;
}

function bindReplyEvents() {
  document.querySelectorAll('.btn-reply-to').forEach(btn => {
    btn.addEventListener('click', () => {
      const rid = btn.dataset.replyId;
      document.querySelectorAll('.reply-inline-form').forEach(f => { if (f.id !== `reply-form-${rid}`) f.style.display = 'none'; });
      const form = document.getElementById(`reply-form-${rid}`);
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
      if (form.style.display === 'block') form.querySelector('textarea')?.focus();
    });
  });
  document.querySelectorAll('.btn-cancel-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById(`reply-form-${btn.dataset.replyId}`).style.display = 'none';
    });
  });
  document.querySelectorAll('.btn-submit-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const rid = parseInt(btn.dataset.replyId, 10);
      const form = document.getElementById(`reply-form-${rid}`);
      const txt = form.querySelector('textarea')?.value.trim();
      if (!txt) { Toast.show('답글 내용을 입력하세요.', 'warning'); return; }
      const replies = loadReplies();
      findAndAddChild(replies, rid, {
        id: nextId(replies), content: txt, writer: '관리자(admin)',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '), children: []
      });
      saveReplies(replies);
      Toast.show('답글이 등록되었습니다.', 'success');
      render();
    });
  });
  document.getElementById('btn-reply')?.addEventListener('click', () => {
    const txt = document.getElementById('reply-content')?.value.trim();
    if (!txt) { Toast.show('답글 내용을 입력하세요.', 'warning'); return; }
    const replies = loadReplies();
    replies.push({
      id: nextId(replies), content: txt, writer: '관리자(admin)',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '), children: []
    });
    saveReplies(replies);
    Toast.show('답글이 등록되었습니다.', 'success');
    render();
  });
}

function render() {
  const list = loadList();
  const item = list.find(d => d.id === id);

  if (!item) {
    content.innerHTML = `
      <div class="page-header"><div><h1 class="page-header__title">${meta.label}</h1></div></div>
      <div class="card"><div class="card__body" style="text-align:center;padding:40px">
        <p class="text-muted">게시글을 찾을 수 없습니다.</p>
        <a class="btn btn--outline" href="${meta.listUrl}">목록으로</a>
      </div></div>`;
    return;
  }

  const title = getItemTitle(item);
  let bodyHtml = '';
  if (type === 'notice') bodyHtml = renderNotice(item);
  else if (type === 'request') bodyHtml = renderRequest(item);
  else bodyHtml = renderEducation(item);

  const replySection = type === 'request' ? renderReplies() : '';

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">${title}</h1>
      <p class="page-header__subtitle">${meta.label} 상세보기</p></div>
      <div class="page-header__actions">
        <a class="btn btn--secondary btn--sm" href="${meta.listUrl}">목록</a>
      </div>
    </div>
    <div class="card">
      <div class="card__body">${bodyHtml}</div>
    </div>
    ${replySection}
    ${renderPrevNext(list)}`;

  if (type === 'request') bindReplyEvents();
}

window.Toast = Toast;
render();

