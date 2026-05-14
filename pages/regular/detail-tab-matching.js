/* 소개관리 탭 — 조회 전용 리스트 + [관리] 모달 (답변등록) */
import { Formatters } from '@utils/formatters.js';
import { MockRegulars } from '@mock/regulars.js';
import { Toast } from '@components/Toast.js';
import { Modal } from '@components/Modal.js';

function fbBadge(fb) {
  var m = {'승낙':'green','거절':'red','보류':'amber','미소개':'gray','의논후결정':'amber','일정조율':'blue','소개용의':'green'};
  return '<span class="badge badge--' + (m[fb]||'gray') + '" style="font-size:11px">' + (fb||'대기') + '</span>';
}

function profileCell(sent, sentAt, rowId, fbDone) {
  if (!sent) return '<button class="btn btn--primary btn--xs btn-send-profile" data-row="' + rowId + '" style="padding:3px 6px;line-height:1;font-size:11px;white-space:nowrap">발송</button>';
  if (fbDone) return '<span class="badge badge--blue" style="font-size:11px">발송완료</span><div style="font-size:10px;color:var(--text-muted);margin-top:1px">' + Formatters.date(sentAt) + '</div>';
  return '<button class="btn btn--outline btn--xs btn-resend-profile" data-row="' + rowId + '" style="padding:3px 6px;line-height:1;font-size:11px;white-space:nowrap;color:var(--primary);border-color:var(--primary)">재발송</button><div style="font-size:9px;color:var(--text-muted);margin-top:1px">' + Formatters.date(sentAt) + '</div>';
}

function resultCell(fb, sent) {
  if (fb !== '대기중') return fbBadge(fb);
  if (!sent) return '<span style="color:var(--text-muted)">-</span>';
  return '<span class="badge badge--gray" style="font-size:11px">대기</span>';
}

function generateMatchData(m) {
  var data = [
    { tgtId:2,n:'최서연',mg:'이수현',reg:'2026-03-10',ms:true,msa:'2026-03-11',mse:'김태희',ts:true,tsa:'2026-03-12',tse:'이수현',mf:'승낙',mfa:'2026-03-13',mc:'좋은 분이신 것 같아요.',tf:'승낙',tfa:'2026-03-14',tc:'호감이 갑니다.' },
    { tgtId:4,n:'한도윤',mg:'박지영',reg:'2026-03-25',ms:true,msa:'2026-03-26',mse:'이수현',ts:true,tsa:'2026-03-27',tse:'박지영',mf:'승낙',mfa:'2026-03-28',mc:'',tf:'거절',tfa:'2026-03-30',tc:'이상형과 다릅니다.' },
    { tgtId:6,n:'강예진',mg:'최은별',reg:'2026-04-05',ms:true,msa:'2026-04-06',mse:'한서진',ts:true,tsa:'2026-04-07',tse:'최은별',mf:'거절',mfa:'2026-04-10',mc:'나이 차이가 큽니다.',tf:'승낙',tfa:'2026-04-12',tc:'' },
    { tgtId:8,n:'오준혁',mg:'한서진',reg:'2026-04-20',ms:false,msa:null,mse:'-',ts:false,tsa:null,tse:'-',mf:'대기중',mfa:null,mc:'',tf:'대기중',tfa:null,tc:'' },
    { tgtId:10,n:'배소율',mg:'정유리',reg:'2026-04-14',ms:true,msa:'2026-04-15',mse:'김태희',ts:false,tsa:null,tse:'-',mf:'보류',mfa:'2026-04-18',mc:'조건은 맞으나 고민 중',tf:'대기중',tfa:null,tc:'' },
    { tgtId:12,n:'류민재',mg:'서다현',reg:'2026-04-22',ms:true,msa:'2026-04-23',mse:'박지영',ts:true,tsa:'2026-04-24',tse:'서다현',mf:'승낙',mfa:'2026-04-25',mc:'직업이 안정적이네요.',tf:'승낙',tfa:'2026-04-27',tc:'프로필이 마음에 듭니다.' },
    { tgtId:14,n:'남수빈',mg:'강보라',reg:'2026-04-08',ms:true,msa:'2026-04-10',mse:'최은별',ts:true,tsa:'2026-04-10',tse:'강보라',mf:'대기중',mfa:null,mc:'',tf:'대기중',tfa:null,tc:'' },
  ];
  return data.map(function(d,i){return{id:i+1,myName:m.name,myMgr:m.matchingManager||'-',tgtId:d.tgtId,tgtName:d.n,tgtMgr:d.mg,regAt:d.reg,myS:d.ms,mySA:d.msa,mySE:d.mse,tgtS:d.ts,tgtSA:d.tsa,tgtSE:d.tse,myFb:d.mf,myFA:d.mfa,myCmt:d.mc||'',tgtFb:d.tf,tgtFA:d.tfa,tgtCmt:d.tc||''};});
}

var CS='padding:4px 6px;text-align:center;white-space:nowrap';

export function renderMatchingInfo(m) {
  var mt_list = generateMatchData(m);
  var stats={'승낙':0,'거절':0,'보류':0,'미소개':0,'의논후결정':0,'일정조율':0,'소개용의':0};
  mt_list.forEach(function(mt){if(stats[mt.myFb]!==undefined)stats[mt.myFb]++;if(stats[mt.tgtFb]!==undefined)stats[mt.tgtFb]++;});

  var html='';
  // ── 헤더 ──
  html+='<div style="margin-bottom:20px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;min-height:32px">';
  html+='<div style="font-size:12px;font-weight:700;color:var(--text-primary)">소개장 등록 리스트 <span class="badge badge--accent" style="font-size:10px;margin-left:6px">총 '+mt_list.length+'건</span></div>';
  html+='<button class="btn btn--primary btn--sm" id="btn-open-intro-modal" style="font-size:10px">+ 소개장 등록</button></div>';




  // ── 테이블 ──
  html+='<div style="border:1px solid var(--border-color);border-radius:var(--radius-sm)">';
  html+='<table class="data-table data-table--bordered" style="font-size:10px;table-layout:fixed;width:100%">';
  html+='<colgroup><col style="width:6%"><col style="width:8%"><col style="width:8%"><col style="width:9%"><col style="width:14%"><col style="width:9%"><col style="width:9%"><col style="width:6%"></colgroup>';
  html+='<thead style="position:sticky;top:0;z-index:1;background:var(--bg-primary)"><tr>';
  ['번호','성명','담당매니저','등록일','프로필','결과','답변일','관리'].forEach(function(t){html+='<th style="text-align:center">'+t+'</th>';});
  html+='</tr></thead><tbody>';

  mt_list.forEach(function(mt,i){
    var both=mt.myFb==='승낙'&&mt.tgtFb==='승낙';
    var bg=both?'background:#f0fdf4;':'';
    var numHtml=(i+1)+'';
    if(both) numHtml+='<div style="margin-top:3px"><span class="badge badge--green" style="font-size:9px;padding:1px 4px">성사</span></div>';

    // row1: 본인
    html+='<tr style="border-bottom:none;'+bg+'">';
    html+='<td rowspan="2" style="'+CS+';vertical-align:middle;font-weight:700;border-bottom:1px solid var(--border-color);'+bg+'">'+numHtml+'</td>';
    html+='<td style="'+CS+';'+bg+'" class="fw-600">'+mt.myName+'</td>';
    html+='<td style="'+CS+';'+bg+'">'+mt.myMgr+'</td>';
    html+='<td rowspan="2" style="'+CS+';vertical-align:middle;border-bottom:1px solid var(--border-color);'+bg+'">'+Formatters.date(mt.regAt)+'</td>';
    html+='<td style="'+CS+';'+bg+'">'+profileCell(mt.myS,mt.mySA,mt.id+'-my',mt.myFb!=='대기중')+'</td>';
    html+='<td style="'+CS+';'+bg+'">'+resultCell(mt.myFb,mt.myS)+'</td>';
    html+='<td style="'+CS+';'+bg+'">'+(mt.myFA?Formatters.date(mt.myFA):'-')+'</td>';
    html+='<td rowspan="2" style="'+CS+';vertical-align:middle;border-bottom:1px solid var(--border-color);'+bg+'"><button class="btn btn--outline btn--xs btn-intro-manage" data-idx="'+i+'" style="font-size:10px;padding:2px 8px">관리</button></td>';
    html+='</tr>';

    // row2: 상대
    html+='<tr style="border-bottom:1px solid var(--border-color);'+bg+'">';
    html+='<td style="'+CS+';'+bg+'" class="fw-600"><a href="/pages/regular/detail.html?id='+mt.tgtId+'" target="_blank" style="color:var(--primary);text-decoration:underline">'+mt.tgtName+'</a></td>';
    html+='<td style="'+CS+';'+bg+'">'+mt.tgtMgr+'</td>';
    html+='<td style="'+CS+';'+bg+'">'+profileCell(mt.tgtS,mt.tgtSA,mt.id+'-tgt',mt.tgtFb!=='대기중')+'</td>';
    html+='<td style="'+CS+';'+bg+'">'+resultCell(mt.tgtFb,mt.tgtS)+'</td>';
    html+='<td style="'+CS+';'+bg+'">'+(mt.tgtFA?Formatters.date(mt.tgtFA):'-')+'</td>';
    html+='</tr>';
  });
  html+='</tbody></table></div></div>';

  setTimeout(function(){bindEvents(m, mt_list);},100);
  return html;
}

function bindEvents(m, mt_list) {
  var opts='<option value="">선택</option><option value="승낙">승낙</option><option value="거절">거절</option><option value="보류">보류</option><option value="미소개">미소개</option><option value="의논후결정">의논후결정</option><option value="일정조율">일정조율</option><option value="소개용의">소개용의</option>';
  var today=new Date().toISOString().slice(0,10);

  // [관리] 모달
  document.querySelectorAll('.btn-intro-manage').forEach(function(btn){
    btn.addEventListener('click',function(){
      var idx=parseInt(this.dataset.idx);
      var mt=mt_list[idx];
      showIntroManageModal(m, mt, idx, mt_list, opts, today);
    });
  });

  // 소개장 등록 모달
  var openBtn=document.getElementById('btn-open-intro-modal');
  if(openBtn) openBtn.addEventListener('click',function(){
    var body='<div style="margin-bottom:12px"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">회원 검색 (이름 또는 회원번호)</label><div style="display:flex;gap:8px"><input type="text" class="form-input" id="modal-search-input" placeholder="이름 또는 회원번호 입력" style="font-size:12px;padding:6px 10px;flex:1"><button class="btn btn--primary btn--sm" id="modal-search-btn" style="white-space:nowrap">검색</button></div></div><div id="modal-search-result" style="max-height:320px;overflow-y:auto"></div>';
    Modal.show({title:'소개장 등록 — 회원 검색',content:body,size:'lg',footer:'<button class="btn btn--ghost" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">닫기</button>'});
    var mI=document.getElementById('modal-search-input'),mB=document.getElementById('modal-search-btn'),mR=document.getElementById('modal-search-result');
    function doS(){
      var q=(mI.value||'').trim();if(!q){Toast.show('검색어를 입력해주세요.','warning');return;}
      var f=MockRegulars.filter(function(r){return r.id!==m.id&&(r.name.indexOf(q)>=0||r.memberId.indexOf(q)>=0);});
      if(!f.length){mR.innerHTML='<div style="text-align:center;padding:24px;color:var(--text-muted)">검색 결과가 없습니다.</div>';return;}
      var h='';
      if(f.length>1) h+='<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:var(--radius-sm);padding:8px 10px;margin-bottom:10px;font-size:11px;color:#1d4ed8">동명이인이 <strong>'+f.length+'명</strong> 검색되었습니다.</div>';
      h+='<table class="data-table data-table--bordered" style="font-size:11px;text-align:center"><thead><tr><th>회원명</th><th>아이디</th><th>생년월일</th><th>담당매칭매니저</th><th>회원상태</th><th style="width:60px">선택</th></tr></thead><tbody>';
      f.forEach(function(r){h+='<tr><td class="fw-600">'+r.name+'</td><td style="font-family:monospace;color:var(--text-muted)">'+r.memberId+'</td><td>'+Formatters.date(r.birthDate)+'</td><td>'+r.matchingManager+'</td><td>'+Formatters.statusBadge(r.status,'regular')+'</td><td style="white-space:nowrap"><button class="btn btn--primary btn--xs btn-select-member" data-name="'+r.name+'" data-mid="'+r.memberId+'" style="font-size:11px;padding:2px 8px;white-space:nowrap">선택</button></td></tr>';});
      h+='</tbody></table>';mR.innerHTML=h;
    }
    if(mB)mB.addEventListener('click',doS);
    if(mI){mI.addEventListener('keydown',function(e){if(e.key==='Enter')doS();});mI.focus();}
    if(mR)mR.addEventListener('click',function(e){var b=e.target.closest('.btn-select-member');if(!b)return;if(confirm(m.name+' <> '+b.dataset.name+' ('+b.dataset.mid+')\n소개장을 등록하시겠습니까?')){Toast.show(b.dataset.name+' 소개장이 등록되었습니다.','success');document.getElementById('modal-root').innerHTML='';}});
  });

  // 프로필 발송
  document.querySelectorAll('.btn-send-profile').forEach(function(btn){
    btn.addEventListener('click',function(){if(confirm('프로필을 발송하시겠습니까?')){var t=new Date().toISOString().slice(0,10);btn.outerHTML='<span class="badge badge--blue" style="font-size:11px">발송완료</span><div style="font-size:10px;color:var(--text-muted);margin-top:1px">'+t+'</div><button class="btn btn--ghost btn--xs btn-resend-profile" style="font-size:9px;padding:1px 4px;margin-top:2px;color:var(--primary)">재발송</button>';Toast.show('프로필이 발송되었습니다. ('+t+')','success');}});
  });
  // 프로필 재발송
  document.addEventListener('click',function(e){
    var rb=e.target.closest('.btn-resend-profile');
    if(!rb) return;
    if(confirm('프로필을 재발송하시겠습니까?')){
      var t=new Date().toISOString().slice(0,10);
      var cell=rb.closest('td');
      if(cell) cell.innerHTML='<span class="badge badge--blue" style="font-size:11px">발송완료</span><div style="font-size:10px;color:var(--text-muted);margin-top:1px">'+t+' (재발송)</div><button class="btn btn--ghost btn--xs btn-resend-profile" style="font-size:9px;padding:1px 4px;margin-top:2px;color:var(--primary)">재발송</button>';
      Toast.show('프로필이 재발송되었습니다. ('+t+')','success');
    }
  });
}

/* ═══════════════════════════════════════════
   통합 관리 모달 — 답변등록
   ═══════════════════════════════════════════ */
function showIntroManageModal(m, mt, idx, mt_list, opts, today){
  var myDone=mt.myFb!=='대기중', tgtDone=mt.tgtFb!=='대기중';

  var body='';
  body+='<div style="border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px;margin-bottom:16px">';
  body+='<div style="font-size:12px;font-weight:700;margin-bottom:10px;color:var(--text-primary)">답변등록</div>';
  body+='<div style="display:flex;gap:12px;flex-wrap:wrap">';

  // 본인 섹션
  body+=renderFbSection(mt.myName, 'my', myDone, mt.myFb, mt.myFA, mt.myCmt, mt.mySA, opts, today);
  // 상대 섹션
  body+=renderFbSection(mt.tgtName, 'tgt', tgtDone, mt.tgtFb, mt.tgtFA, mt.tgtCmt, mt.tgtSA, opts, today);

  body+='</div></div>';

  // 소개 요약 정보
  body+='<div style="border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px">';
  body+='<div style="font-size:12px;font-weight:700;margin-bottom:8px;color:var(--text-primary)">소개 정보</div>';
  body+='<table class="data-table" style="font-size:11px;width:100%"><tbody>';
  body+='<tr><td style="background:var(--bg-secondary);font-weight:600;width:80px;text-align:center">등록일</td><td>'+Formatters.date(mt.regAt)+'</td>';
  body+='<td style="background:var(--bg-secondary);font-weight:600;width:80px;text-align:center">담당(본인)</td><td>'+mt.myMgr+'</td></tr>';
  body+='<tr><td style="background:var(--bg-secondary);font-weight:600;text-align:center">프로필(본인)</td><td>'+(mt.myS?'발송완료 ('+Formatters.date(mt.mySA)+')':'미발송')+'</td>';
  body+='<td style="background:var(--bg-secondary);font-weight:600;text-align:center">프로필(상대)</td><td>'+(mt.tgtS?'발송완료 ('+Formatters.date(mt.tgtSA)+')':'미발송')+'</td></tr>';
  body+='</tbody></table></div>';

  Modal.show({title:'소개관리 — '+mt.myName+' / '+mt.tgtName,content:body,size:'lg',
    footer:'<button class="btn btn--ghost" id="intro-mg-cancel">닫기</button> <button class="btn btn--primary" id="intro-mg-save">저장</button>'});

  // 결과 선택 시 결과내용 영역 토글
  document.querySelectorAll('.fb-sel').forEach(function(sel){
    sel.addEventListener('change',function(){
      var side=this.dataset.side;
      var cmtWrap=document.getElementById('fb-cmt-wrap-'+side);
      var cmtLabel=document.getElementById('fb-cmt-label-'+side);
      if(cmtWrap) cmtWrap.style.display=this.value?'block':'none';
      if(cmtLabel) cmtLabel.textContent=this.value==='거절'?'거절 사유 (필수)':'결과내용 (선택)';
    });
  });

  document.getElementById('intro-mg-cancel').addEventListener('click',function(){Modal.hide();});
  document.getElementById('intro-mg-save').addEventListener('click',function(){
    var saved=false;
    var hasErr=false;
    ['my','tgt'].forEach(function(side){
      var sel=document.querySelector('.fb-sel[data-side="'+side+'"]');
      if(!sel) return;
      var val=sel.value;
      if(!val) return;
      var dt=document.querySelector('.fb-date[data-side="'+side+'"]').value;
      var cmt=document.querySelector('.fb-cmt[data-side="'+side+'"]').value;
      if(!dt){Toast.show('답변일을 입력해주세요.','warning');hasErr=true;return;}
      if(val==='거절'&&!cmt.trim()){Toast.show('거절 사유를 입력해주세요.','warning');hasErr=true;return;}
      if(side==='my'){mt.myFb=val;mt.myFA=dt;mt.myCmt=cmt;}
      else{mt.tgtFb=val;mt.tgtFA=dt;mt.tgtCmt=cmt;}
      saved=true;
    });
    if(hasErr) return;
    if(saved){
      if(mt.myFb==='승낙'&&mt.tgtFb==='승낙') Toast.show('양측 승낙 — 매칭 성사!','success');
      else Toast.show('답변이 저장되었습니다.','success');
      Modal.hide();
      refreshIntroList(m);
    }
  });
}

function renderFbSection(name, side, done, fb, fbDate, cmt, sentAt, opts, today){
  var days=sentAt?Math.floor((new Date()-new Date(sentAt))/86400000):0;
  var h='<div style="flex:1;min-width:220px;padding:12px;border:1px solid var(--border-color);border-radius:var(--radius-sm)">';
  h+='<div style="font-size:12px;font-weight:700;margin-bottom:8px;text-align:center;padding-bottom:6px;border-bottom:1px solid var(--border-color)">'+name+'</div>';
  if(done){
    h+='<div style="text-align:center;padding:8px 0">'+fbBadge(fb);
    if(fbDate) h+='<div style="font-size:10px;color:var(--text-muted);margin-top:4px">'+Formatters.date(fbDate)+'</div>';
    h+='</div>';
    if(cmt) h+='<div style="background:var(--bg-secondary);border-radius:var(--radius-sm);padding:8px 10px;font-size:11px;color:var(--text-secondary);margin-top:6px">'+(fb==='거절'?'<span style="color:#dc2626;font-weight:600">[거절 사유]</span> ':'')+cmt+'</div>';
  } else {
    if(days>=7) h+='<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius-sm);padding:6px 8px;margin-bottom:8px;font-size:10px;color:#dc2626">발송 후 <strong>'+days+'일</strong> 경과</div>';
    h+='<div style="margin-bottom:8px"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px">결과</label>';
    h+='<select class="form-input fb-sel" data-side="'+side+'" style="font-size:12px;padding:4px 8px">'+opts+'</select></div>';
    h+='<div style="margin-bottom:8px"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px">답변일</label>';
    h+='<input type="date" class="form-input fb-date" data-side="'+side+'" value="'+today+'" style="font-size:12px;padding:4px 8px"></div>';
    h+='<div id="fb-cmt-wrap-'+side+'" style="display:none"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px" id="fb-cmt-label-'+side+'">결과내용 (선택)</label>';
    h+='<textarea class="form-input fb-cmt" data-side="'+side+'" rows="2" placeholder="결과내용을 입력해주세요" style="font-size:12px;padding:4px 8px;resize:vertical"></textarea></div>';
  }
  h+='</div>';
  return h;
}

function refreshIntroList(m){
  var panel=document.getElementById('panel-matching');
  if(panel){ panel.innerHTML=renderMatchingInfo(m); }
}
