/* 미팅관리 탭 — 조회 전용 리스트 + 통합 관리 모달 */
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { Modal } from '@components/Modal.js';
import { PlaceSearch } from '@components/PlaceSearch.js';

var CS='padding:4px 6px;text-align:center;white-space:nowrap';

function meetBadge(r){
  if(!r) return '<span style="color:var(--text-muted)">-</span>';
  var m={'펑크':'red','취소':'amber','호감':'blue','매우호감':'green','보통':'gray','비호감':'red'};
  return '<span class="badge badge--'+(m[r]||'gray')+'" style="font-size:11px">'+r+'</span>';
}
function progBadge(p,wd){
  if(!p) return '<span style="color:var(--text-muted)">-</span>';
  var c={'임시교제':'blue','교제':'primary','결혼예정':'amber','성혼':'green'};
  var h='<span class="badge badge--'+(c[p]||'gray')+'" style="font-size:11px">'+p+'</span>';
  if(p==='성혼'&&wd) h+='<div style="font-size:9px;color:var(--text-muted);margin-top:1px">'+Formatters.date(wd)+'</div>';
  return h;
}
function renderSmsInline(sms){
  if(!sms) return '<span style="color:var(--text-muted)">-</span>';
  return '<div style="line-height:1.4;color:var(--text-secondary);word-break:break-all">'+sms+'</div>';
}

function genMeetings(m){
  return [
    {id:1,myName:m.name,myMgr:m.matchingManager||'-',tgtId:2,tgtName:'최서연',tgtMgr:'이수현',
     date:'2026-03-20',time:'14:00',place:'갓포준 (강남구 논현로163길 10 B1)',
     history:[{date:'2026-03-18',time:'15:00',place:'소소한연 (강남구 도산대로53길 13)',by:'김태희',
       sms:'[디노블] 최서연님(95년) 안심번호:070-4501-3013 / 3월 18일 (화) 오후 3시 소소한연/ 서울 강남구 도산대로53길 13/압구정역 4번출구 /주차,발렛 * 안내드린 안심번호가 후스콜, T전화, 단말기 자체에서 차단이 되어있는 경우에는 서비스 이용이 불가하오니 차단 유무를 확인해 주시기 바랍니다.'}],
     sms:'[디노블] 최서연님(95년) 안심번호:070-4501-3013 / 3월 20일 (금) 오후 2시 갓포준/ 서울 강남구 논현로163길 10 B1/압구정역 4번출구 /주차,발렛 * 안내드린 안심번호가 후스콜, T전화, 단말기 자체에서 차단이 되어있는 경우에는 서비스 이용이 불가하오니 차단 유무를 확인해 주시기 바랍니다.',
     sent:true,sentAt:'2026-03-18',myResult:'호감',tgtResult:'매우호감',progress:'교제',myFeel:'밝고 대화가 잘 통했어요.',myFeelAt:'2026-03-22',tgtFeel:'호감이 갑니다.',tgtFeelAt:'2026-03-21',punkBy:null,reason:'',wDate:null},
    {id:2,myName:m.name,myMgr:m.matchingManager||'-',tgtId:12,tgtName:'류민재',tgtMgr:'서다현',
     date:'2026-05-01',time:'18:30',place:'알베르 (강남구 선릉로162길 15)',history:[],
     sms:'[디노블] 류민재님(93년) 안심번호:070-4501-8102 / 5월 1일 (목) 오후 6시 30분 알베르/ 서울 강남구 선릉로162길 15/선릉역 3번출구 /주차가능',
     sent:true,sentAt:'2026-04-28',myResult:'호감',tgtResult:'보통',progress:'임시교제',myFeel:'좋은 분위기.',myFeelAt:'2026-05-03',tgtFeel:'재미있었습니다.',tgtFeelAt:'2026-05-02',punkBy:null,reason:'',wDate:null},
    {id:3,myName:m.name,myMgr:m.matchingManager||'-',tgtId:4,tgtName:'한도윤',tgtMgr:'박지영',
     date:'2026-04-15',time:'15:00',place:'카페온더플레인 (송파구 올림픽로 300)',history:[],sms:'',
     sent:true,sentAt:'2026-04-13',myResult:'펑크',tgtResult:'펑크',progress:null,myFeel:'',myFeelAt:'',tgtFeel:'',tgtFeelAt:'',punkBy:'상대',reason:'갑작스런 일정 변동',wDate:null},
    {id:4,myName:m.name,myMgr:m.matchingManager||'-',tgtId:6,tgtName:'강예진',tgtMgr:'최은별',
     date:'2026-04-25',time:'12:00',place:'라망떼 (서초구 서초중앙로 68)',history:[],sms:'',
     sent:true,sentAt:'2026-04-23',myResult:'취소',tgtResult:'취소',progress:null,myFeel:'',myFeelAt:'',tgtFeel:'',tgtFeelAt:'',punkBy:'본인',reason:'개인 사정',wDate:null},
    {id:5,myName:m.name,myMgr:m.matchingManager||'-',tgtId:10,tgtName:'배소율',tgtMgr:'정유리',
     date:'2026-05-10',time:'14:30',place:'서울 잠실 카페',history:[],sms:'',
     sent:false,sentAt:null,myResult:null,tgtResult:null,progress:null,myFeel:'',myFeelAt:'',tgtFeel:'',tgtFeelAt:'',punkBy:null,reason:'',wDate:null},
  ];
}

export function renderMeetingTab(m){ return renderMeetingList(m); }

export function renderMeetingList(m){
  var list=genMeetings(m), html='';
  html+='<div style="margin-bottom:10px"><div style="display:flex;align-items:center;justify-content:space-between;min-height:32px"><div style="font-size:12px;font-weight:700;color:var(--text-primary)">미팅 리스트 <span class="badge badge--accent" style="font-size:10px;margin-left:6px">총 '+list.length+'건</span></div></div></div>';
  html+='<div style="border:1px solid var(--border-color);border-radius:var(--radius-sm)">';
  html+='<table class="data-table data-table--bordered" style="font-size:10px;table-layout:fixed;width:100%">';
  html+='<colgroup><col style="width:5%"><col style="width:8%"><col style="width:8%"><col style="width:20%"><col style="width:10%"><col style="width:10%"><col style="width:20%"><col style="width:6%"></colgroup>';
  html+='<thead style="position:sticky;top:0;z-index:1;background:var(--bg-primary)"><tr>';
  ['번호','성명','담당매니저','미팅약속(일시/장소)','만남결과','진행상태','미팅 후기','관리'].forEach(function(t){html+='<th style="text-align:center">'+t+'</th>';});
  html+='</tr></thead><tbody>';

  list.forEach(function(mt,i){
    // 약속 셀: 일시+장소 통합
    var apptH=Formatters.date(mt.date)+' '+mt.time+'<div style="margin-top:2px">'+mt.place+'</div>';
    if(mt.sent) apptH+='<div style="font-size:9px;color:var(--text-muted);margin-top:1px">발송: '+Formatters.date(mt.sentAt)+'</div>';

    // row1: 본인
    html+='<tr style="border-bottom:none">';
    html+='<td rowspan="2" style="'+CS+';vertical-align:middle;font-weight:700;border-bottom:1px solid var(--border-color)">'+(i+1)+'</td>';
    html+='<td style="'+CS+'" class="fw-600">'+mt.myName+'</td>';
    html+='<td style="'+CS+'">'+mt.myMgr+'</td>';
    html+='<td rowspan="2" style="padding:4px 6px;text-align:center;vertical-align:middle;border-bottom:1px solid var(--border-color)">'+apptH+'</td>';
    html+='<td style="'+CS+'">'+meetBadge(mt.myResult)+'</td>';
    html+='<td rowspan="2" style="'+CS+';vertical-align:middle;border-bottom:1px solid var(--border-color)">'+progBadge(mt.progress,mt.wDate)+'</td>';
    var myReviewH=mt.myFeel?mt.myFeel+'<div style="font-size:9px;color:var(--text-muted);margin-top:1px">'+Formatters.date(mt.myFeelAt)+'</div>':(mt.punkBy?mt.reason:'-');
    html+='<td style="padding:4px 6px;text-align:center;font-size:10px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis" title="'+(mt.myFeel||mt.reason||'')+'">'+myReviewH+'</td>';
    html+='<td rowspan="2" style="'+CS+';vertical-align:middle;border-bottom:1px solid var(--border-color)"><button class="btn btn--outline btn--xs btn-manage" data-idx="'+i+'" style="font-size:10px;padding:2px 8px">관리</button></td>';
    html+='</tr>';

    // row2: 상대
    html+='<tr style="border-bottom:1px solid var(--border-color)">';
    html+='<td style="'+CS+'" class="fw-600"><a href="/pages/regular/detail.html?id='+mt.tgtId+'" target="_blank" style="color:var(--primary);text-decoration:underline">'+mt.tgtName+'</a></td>';
    html+='<td style="'+CS+'">'+mt.tgtMgr+'</td>';
    html+='<td style="'+CS+'">'+meetBadge(mt.tgtResult)+'</td>';
    var tgtReviewH=mt.tgtFeel?mt.tgtFeel+'<div style="font-size:9px;color:var(--text-muted);margin-top:1px">'+Formatters.date(mt.tgtFeelAt)+'</div>':'-';
    html+='<td style="padding:4px 6px;text-align:center;font-size:10px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis" title="'+(mt.tgtFeel||'')+'">'+tgtReviewH+'</td>';
    html+='</tr>';
  });
  html+='</tbody></table></div>';
  setTimeout(function(){bindEvents(m,list);},120);
  return html;
}

function bindEvents(m,list){
  document.querySelectorAll('.btn-manage').forEach(function(b){
    b.addEventListener('click',function(){
      showManageModal(m,list[parseInt(this.dataset.idx)],parseInt(this.dataset.idx),list);
    });
  });
}

/* ═══════════════════════════════════════════
   통합 관리 모달
   ═══════════════════════════════════════════ */
function showManageModal(m,mt,idx,list){
  var feelOpts='<option value="">선택</option><option value="호감">호감</option><option value="매우호감">매우호감</option><option value="보통">보통</option><option value="비호감">비호감</option>';
  var progOpts='<option value="">선택</option><option value="임시교제">임시교제</option><option value="교제">교제</option><option value="결혼예정">결혼예정</option><option value="성혼">성혼</option>';
  // 현재 상태 판별
  var curOutcome=mt.punkBy?((mt.myResult==='펑크'||mt.tgtResult==='펑크')?'펑크':'취소'):(mt.myResult?'만남성사':'');

  var body='';

  // ── 모달 내 탭 네비게이션 ──
  body+='<div style="display:flex;border-bottom:2px solid var(--border-color);margin-bottom:16px">';
  body+='<button class="mg-tab active" data-target="mg-tab-appt" style="flex:1;padding:10px 0;font-size:13px;font-weight:700;border:none;background:none;cursor:pointer;border-bottom:2px solid var(--primary);margin-bottom:-2px;color:var(--primary)">약속정보관리</button>';
  body+='<button class="mg-tab" data-target="mg-tab-result" style="flex:1;padding:10px 0;font-size:13px;font-weight:700;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;color:var(--text-muted)">결과관리</button>';
  body+='</div>';

  // ══════ 탭1: 약속정보관리 ══════
  body+='<div id="mg-tab-appt" class="mg-tab-panel">';
  body+='<div style="border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px;margin-bottom:16px">';
  body+='<div style="font-size:12px;font-weight:700;margin-bottom:10px;color:var(--text-primary)">약속 등록/변경</div>';
  body+='<div style="display:flex;gap:10px;margin-bottom:10px"><div style="flex:1"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px">미팅일</label><input type="date" class="form-input" id="mg-date" value="'+mt.date+'" style="font-size:12px;padding:6px 10px"></div>';
  body+='<div style="flex:0 0 55px"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px">시</label><input type="number" class="form-input" id="mg-hour" value="'+(mt.time?mt.time.split(':')[0]:'14')+'" min="0" max="23" style="font-size:12px;padding:6px 10px;text-align:center"></div>';
  body+='<div style="flex:0 0 55px"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px">분</label><input type="number" class="form-input" id="mg-min" value="'+(mt.time?mt.time.split(':')[1]:'00')+'" min="0" max="59" step="10" style="font-size:12px;padding:6px 10px;text-align:center"></div></div>';
  body+='<div style="margin-bottom:10px"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px">장 소</label><div style="display:flex;gap:6px"><input type="text" class="form-input" id="mg-place" value="'+mt.place+'" placeholder="만남 장소 입력" style="font-size:12px;padding:6px 10px;flex:1"><button type="button" class="btn btn--outline btn--sm" id="mg-place-search" style="font-size:11px;white-space:nowrap">장소검색</button></div></div>';
  body+='<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><label style="font-size:11px;cursor:pointer"><input type="checkbox" id="mg-safe" style="margin-right:4px"> 안심번호 사용</label><label style="font-size:11px;cursor:pointer;color:var(--text-muted)"><input type="checkbox" id="mg-exclude" style="margin-right:4px"> 자동발송 제외</label></div>';
  body+='<div style="text-align:right"><button class="btn btn--primary btn--sm" id="mg-appt-save" style="font-size:11px">'+(mt.sent?'약속 변경':'약속 등록')+'</button></div>';
  body+='</div>';
  // 약속 이력
  body+='<div style="border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px">';
  body+='<div style="font-size:12px;font-weight:700;margin-bottom:8px;color:var(--text-primary)">약속 이력</div>';
  if(mt.sent){
    body+='<table class="data-table data-table--bordered" style="font-size:10px;width:100%"><thead><tr><th style="width:30%">약속장소 및 일시</th><th style="text-align:center;width:12%">변경일</th><th style="text-align:center;width:10%">변경자</th><th style="width:48%">발송문자</th></tr></thead><tbody>';
    body+='<tr style="background:var(--bg-secondary)"><td style="padding:6px 8px"><div class="fw-600">'+mt.place+'</div><div style="margin-top:2px;color:var(--text-secondary)">'+Formatters.date(mt.date)+' '+mt.time+'</div></td><td style="'+CS+'">'+Formatters.date(mt.sentAt)+' <span class="badge badge--blue" style="font-size:9px">현재</span></td><td style="'+CS+'">'+mt.myMgr+'</td><td style="padding:6px 8px">'+renderSmsInline(mt.sms)+'</td></tr>';
    if(mt.history&&mt.history.length>0){ mt.history.forEach(function(h){
      body+='<tr><td style="padding:6px 8px"><div>'+h.place+'</div><div style="margin-top:2px;color:var(--text-secondary)">'+Formatters.date(h.date)+' '+h.time+'</div></td><td style="'+CS+'">'+Formatters.date(h.date)+'</td><td style="'+CS+'">'+h.by+'</td><td style="padding:6px 8px">'+renderSmsInline(h.sms)+'</td></tr>';
    });}
    body+='</tbody></table>';
  } else {
    body+='<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;background:var(--bg-secondary);border-radius:var(--radius-sm)">약속 등록 후 이력이 표시됩니다.</div>';
  }
  body+='</div></div>';

  // ══════ 탭2: 결과관리 ══════
  body+='<div id="mg-tab-result" class="mg-tab-panel" style="display:none">';
  // 만남결과
  body+='<div style="border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px;margin-bottom:16px">';
  body+='<div style="font-size:12px;font-weight:700;margin-bottom:10px;color:var(--text-primary)">만남결과</div>';
  // 결과유형 선택
  body+='<div style="margin-bottom:12px"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px">결과 유형</label>';
  body+='<div style="display:flex;gap:8px" id="mg-outcome-btns">';
  ['만남성사','펑크','취소'].forEach(function(o){
    var sel=curOutcome===o?' btn--primary':' btn--outline';
    body+='<button class="btn btn--sm mg-outcome-btn'+sel+'" data-val="'+o+'" style="font-size:11px;flex:1">'+o+'</button>';
  });
  body+='</div></div>';
  // 만남성사 영역
  body+='<div id="mg-success-area" style="'+(curOutcome==='만남성사'?'':'display:none;')+'">';
  body+='<table class="data-table" style="font-size:12px;width:100%"><tbody>';
  body+='<tr><td style="background:var(--bg-secondary);font-weight:600;width:70px;text-align:center">'+mt.myName+'</td>';
  body+='<td style="width:100px;text-align:center"><select class="form-input" id="mg-my-feel-sel" style="font-size:11px;padding:4px 6px">'+feelOpts.replace('value="'+((!mt.punkBy&&mt.myResult)||'')+'"','value="'+((!mt.punkBy&&mt.myResult)||'')+'" selected')+'</select></td>';
  body+='<td><input type="text" class="form-input" id="mg-my-feel" value="'+(mt.myFeel||'')+'" placeholder="만남 소감" style="font-size:11px;padding:4px 8px"></td></tr>';
  body+='<tr><td style="background:var(--bg-secondary);font-weight:600;text-align:center">'+mt.tgtName+'</td>';
  body+='<td style="text-align:center"><select class="form-input" id="mg-tgt-feel-sel" style="font-size:11px;padding:4px 6px">'+feelOpts.replace('value="'+((!mt.punkBy&&mt.tgtResult)||'')+'"','value="'+((!mt.punkBy&&mt.tgtResult)||'')+'" selected')+'</select></td>';
  body+='<td><input type="text" class="form-input" id="mg-tgt-feel" value="'+(mt.tgtFeel||'')+'" placeholder="만남 소감" style="font-size:11px;padding:4px 8px"></td></tr>';
  body+='</tbody></table></div>';
  // 펑크/취소 영역
  var isPunk=curOutcome==='펑크'||curOutcome==='취소';
  body+='<div id="mg-punk-area" style="'+(isPunk?'':'display:none;')+'">';
  body+='<div style="display:flex;gap:10px;margin-bottom:10px">';
  body+='<div style="flex:1"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px" id="mg-punk-label">'+(curOutcome==='취소'?'취소신청인':'펑크신청인')+'</label><select class="form-input" id="mg-punk-by" style="font-size:11px;padding:6px 10px"><option value="">선택</option><option value="본인"'+(mt.punkBy==='본인'?' selected':'')+'>'+mt.myName+' (본인)</option><option value="상대"'+(mt.punkBy==='상대'?' selected':'')+'>'+mt.tgtName+' (상대)</option></select></div>';
  body+='</div>';
  body+='<div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px">사유</label><input type="text" class="form-input" id="mg-punk-reason" value="'+(mt.reason||'')+'" placeholder="사유를 입력해주세요" style="font-size:11px;padding:6px 10px"></div>';
  body+='</div>';
  body+='<div style="text-align:right;margin-top:10px"><button class="btn btn--primary btn--sm" id="mg-result-save" style="font-size:11px">결과 저장</button></div>';
  body+='</div>';
  // 진행상태
  body+='<div style="border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px">';
  body+='<div style="font-size:12px;font-weight:700;margin-bottom:10px;color:var(--text-primary)">진행상태</div>';
  body+='<div style="display:flex;gap:10px;align-items:flex-end">';
  body+='<div style="flex:1"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px">현재 상태</label><select class="form-input" id="mg-prog" style="font-size:12px;padding:6px 10px">'+progOpts.replace('value="'+(mt.progress||'')+'"','value="'+(mt.progress||'')+'" selected')+'</select></div>';
  body+='<div id="mg-wd-wrap" style="flex:1;'+(mt.progress==='성혼'?'':'display:none;')+'"><label style="font-size:11px;font-weight:600;display:block;margin-bottom:3px">결혼 날짜</label><input type="date" class="form-input" id="mg-wd" value="'+(mt.wDate||'')+'" style="font-size:12px;padding:6px 10px"></div>';
  body+='<button class="btn btn--primary btn--sm" id="mg-prog-save" style="font-size:11px">상태 변경</button></div>';
  body+='</div></div>';

  Modal.show({title:'미팅관리 — '+mt.myName+' / '+mt.tgtName,content:body,size:'lg',
    footer:'<button class="btn btn--ghost" id="mg-close">닫기</button>'});

  // ── 탭 전환 이벤트 ──
  document.querySelectorAll('.mg-tab').forEach(function(tab){
    tab.addEventListener('click',function(){
      document.querySelectorAll('.mg-tab').forEach(function(t){
        t.style.borderBottomColor='transparent';t.style.color='var(--text-muted)';t.classList.remove('active');
      });
      this.style.borderBottomColor='var(--primary)';this.style.color='var(--primary)';this.classList.add('active');
      document.querySelectorAll('.mg-tab-panel').forEach(function(p){p.style.display='none';});
      document.getElementById(this.dataset.target).style.display='block';
    });
  });

  // ── 이벤트 바인딩 ──
  document.getElementById('mg-place-search').addEventListener('click',function(){
    PlaceSearch.open(function(sel){document.getElementById('mg-place').value=sel.name+' ('+sel.addr+')';},document.getElementById('mg-place').value);
  });
  document.getElementById('mg-close').addEventListener('click',function(){Modal.hide();});

  // 약속 등록/변경
  document.getElementById('mg-appt-save').addEventListener('click',function(){
    var d=document.getElementById('mg-date').value,h=document.getElementById('mg-hour').value.padStart(2,'0'),mn=document.getElementById('mg-min').value.padStart(2,'0'),p=document.getElementById('mg-place').value.trim();
    if(!d){Toast.show('미팅일을 입력해주세요.','warning');return;}
    if(!p){Toast.show('장소를 입력해주세요.','warning');return;}
    var isNew=!mt.sent;
    if(mt.sent){mt.history.push({date:mt.date,time:mt.time,place:mt.place,by:mt.myMgr,sms:mt.sms});}
    mt.date=d;mt.time=h+':'+mn;mt.place=p;mt.sent=true;mt.sentAt=new Date().toISOString().slice(0,10);
    Modal.hide();
    refreshList(m,list);
    Toast.show(mt.myName+' / '+mt.tgtName+' '+(isNew?'약속이 등록':'약속이 변경')+'되었습니다.','success');
  });

  // 결과유형 토글
  var selOutcome=curOutcome;
  document.querySelectorAll('.mg-outcome-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      selOutcome=this.dataset.val;
      document.querySelectorAll('.mg-outcome-btn').forEach(function(b){b.className='btn btn--sm btn--outline mg-outcome-btn';});
      this.className='btn btn--sm btn--primary mg-outcome-btn';
      document.getElementById('mg-success-area').style.display=selOutcome==='만남성사'?'block':'none';
      document.getElementById('mg-punk-area').style.display=(selOutcome==='펑크'||selOutcome==='취소')?'block':'none';
      var lbl=document.getElementById('mg-punk-label');
      if(lbl) lbl.textContent=selOutcome==='취소'?'취소신청인':'펑크신청인';
    });
  });

  // 결과 저장
  document.getElementById('mg-result-save').addEventListener('click',function(){
    if(!selOutcome){Toast.show('결과 유형을 선택해주세요.','warning');return;}
    if(selOutcome==='만남성사'){
      mt.myResult=document.getElementById('mg-my-feel-sel').value||null;
      mt.myFeel=document.getElementById('mg-my-feel').value;
      mt.tgtResult=document.getElementById('mg-tgt-feel-sel').value||null;
      mt.tgtFeel=document.getElementById('mg-tgt-feel').value;
      mt.punkBy=null;mt.reason='';
    } else {
      mt.myResult=selOutcome;mt.tgtResult=selOutcome;
      mt.punkBy=document.getElementById('mg-punk-by').value||null;
      mt.reason=document.getElementById('mg-punk-reason').value;
      mt.myFeel='';mt.tgtFeel='';
      if(!mt.punkBy){Toast.show((selOutcome==='취소'?'취소':'펑크')+'신청인을 선택해주세요.','warning');return;}
    }
    Modal.hide();
    refreshList(m,list);
    Toast.show('만남결과가 저장되었습니다.','success');
  });

  // 진행상태 변경
  document.getElementById('mg-prog').addEventListener('change',function(){
    document.getElementById('mg-wd-wrap').style.display=this.value==='성혼'?'block':'none';
  });
  document.getElementById('mg-prog-save').addEventListener('click',function(){
    mt.progress=document.getElementById('mg-prog').value||null;
    mt.wDate=mt.progress==='성혼'?(document.getElementById('mg-wd').value||null):null;
    Modal.hide();
    refreshList(m,list);
    Toast.show('진행상태가 변경되었습니다.','success');
  });
}

function refreshList(m,list){
  var panel=document.getElementById('panel-meeting');
  if(panel){ panel.innerHTML=renderMeetingList(m); }
}
