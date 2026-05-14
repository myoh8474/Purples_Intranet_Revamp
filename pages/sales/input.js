/* ========================================
   매출 현황 조회
   PRD 2.1 기반 - 조회/필터 전용 (매출 입력은 정회원 상세에서)
   재무팀: 리스트에서 직접 최종입금액 입력
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars, MATCH_MANAGERS, MANAGER_DATA, getManagerBrand } from '@mock/regulars.js';

initLayout({ pageId: 'sales-input', breadcrumbs: ['매출 및 통계 관리', '재무/정산', '매출 현황 조회'] });

var content = document.getElementById('content');

// TODO: 실제 구현 시 로그인 세션에서 가져올 것
var currentUserRole = 'FIN'; // 'FIN' | 'MGR' | 'TL' | 'ADMIN' 등
var canConfirm = (currentUserRole === 'FIN' || currentUserRole === 'ADMIN');

var BRANDS = ['퍼플스','디노블','르매리'];
var SPLIT_TYPES = ['일시불','계약금','중도금','잔금','업그레이드'];
var JOIN_ORDERS = ['1가입','2가입'];

var splitColors = { '일시불':'green','계약금':'blue','중도금':'amber','잔금':'purple','업그레이드':'accent' };
var joinColors = { '1가입':'green','2가입':'amber' };

// Mock 데이터
var salesData = [];
for (var i = 0; i < 30; i++) {
  var d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 30));
  var dateStr = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  var cd = new Date(d); cd.setDate(cd.getDate() - Math.floor(Math.random() * 5));
  var contractDate = cd.getFullYear()+'-'+String(cd.getMonth()+1).padStart(2,'0')+'-'+String(cd.getDate()).padStart(2,'0');
  var mIdx = i % MockRegulars.length;
  var splitType = SPLIT_TYPES[i % 5];
  var amount = splitType==='업그레이드' ? (300+Math.floor(Math.random()*200))*10000 : (500+Math.floor(Math.random()*500))*10000;
  var joinOrder = JOIN_ORDERS[i % 2];
  var isPro = i % 5 === 0;
  var isWealth = i % 7 === 0;
  var hasPromo = i % 8 === 0;
  var maleType = hasPromo ? '프로모션' : isWealth ? '재력가' : isPro ? '전문직' : '';
  var hasSharing = i % 3 === 0;
  var shareManager = hasSharing ? MATCH_MANAGERS[(i+3) % MATCH_MANAGERS.length] : '';
  var shareRatio = hasSharing ? (30 + Math.floor(Math.random() * 40)) : 0;
  var finalAmount = amount;
  var isModified = i % 5 === 0 && amount > 5000000;
  if (isModified) finalAmount = amount - Math.floor(Math.random()*3)*100000;
  var confirmed = i % 3 !== 0; // 일부는 확인완료
  var mainMgr = MATCH_MANAGERS[i % MATCH_MANAGERS.length];
  var mainBrand = getManagerBrand(mainMgr);
  var shareBrand = shareManager ? getManagerBrand(shareManager) : '';
  salesData.push({
    id: i+1, payDate: dateStr, contractDate: contractDate,
    manager: mainMgr, managerBrand: mainBrand,
    member: MockRegulars[mIdx].name, brand: mainBrand,
    splitType: splitType, amount: amount, joinOrder: joinOrder,
    maleType: maleType,
    shareManager: shareManager, shareBrand: shareBrand, shareRatio: shareRatio,
    finalAmount: finalAmount, confirmed: confirmed,
  });
}
salesData.sort(function(a,b){return b.payDate.localeCompare(a.payDate)});

function formatMoney(v){ return v.toLocaleString()+'원'; }

function buildTable(data) {
  var brandBarColors = { '퍼플스':'#7c3aed','디노블':'#2563eb','르매리':'#d97706' };
  var brandBadgeColors = { '퍼플스':'purple','디노블':'blue','르매리':'amber' };

  // 쉐어 건을 각각 별도 행으로 풀기
  var rows = [];
  data.forEach(function(r) {
    var hasShare = r.shareManager && r.shareRatio;
    var selfRatio = hasShare ? (100 - r.shareRatio) : 100;
    var selfAmt = Math.round(r.amount * selfRatio / 100);
    // 메인 매니저 행
    rows.push({
      original: r, brand: r.managerBrand, manager: r.manager,
      ratio: selfRatio, realAmount: selfAmt, isShare: false,
      shareGroup: hasShare ? r.id : null
    });
    // 쉐어 매니저 행
    if (hasShare) {
      var shareAmt = r.amount - selfAmt;
      rows.push({
        original: r, brand: r.shareBrand, manager: r.shareManager,
        ratio: r.shareRatio, realAmount: shareAmt, isShare: true,
        shareGroup: r.id
      });
    }
  });

  return '<table class="data-table data-table--compact" style="font-size:11px;width:100%;white-space:nowrap">'
    +'<thead><tr>'
    +'<th style="text-align:center;width:30px">No</th>'
    +'<th style="text-align:center">브랜드</th>'
    +'<th style="text-align:center">입금일</th>'
    +'<th style="text-align:center">계약일</th>'
    +'<th style="text-align:center">회원명</th>'
    +'<th style="text-align:center">분할매출</th>'
    +'<th style="text-align:center">가입순서</th>'
    +'<th style="text-align:center">남성수당</th>'
    +'<th style="text-align:center">상담매니저</th>'
    +'<th style="text-align:center">비율</th>'
    +'<th style="text-align:center">실매출</th>'
    +'<th style="border-left:2px solid var(--border-light);text-align:center">입금액</th>'
    +'</tr>'
    +'</thead><tbody>'
    + rows.map(function(row, idx){
      var r = row.original;
      var barColor = brandBarColors[row.brand] || '#94a3b8';
      var maleColors = { '전문직':'blue','재력가':'amber','프로모션':'purple' };
      var maleHtml = r.maleType
        ? '<span class="badge badge--'+(maleColors[r.maleType]||'gray')+'" style="font-size:9px">'+r.maleType+'</span>'
        : '<span style="color:var(--text-muted)">-</span>';

      // 쉐어 행이면 회원정보 컬럼은 빈칸으로 (그루핑 효과)
      var memberCell, dateCell, contractCell, splitCell, joinCell, maleCell, finalCell;
      if (row.isShare) {
        memberCell = '<td style="text-align:center;color:var(--text-muted);font-size:10px">↳ 쉐어</td>';
        dateCell = '<td></td>';
        contractCell = '<td></td>';
        splitCell = '<td></td>';
        joinCell = '<td></td>';
        maleCell = '<td></td>';
        finalCell = '<td style="border-left:2px solid var(--border-light)"></td>';
      } else {
        // 최종입금액: input + 확인 버튼
        var btnVis = (!r.confirmed && canConfirm) ? '' : 'visibility:hidden;';
        var inputDisabled = r.confirmed ? 'disabled ' : '';
        var inputStyle = r.confirmed
          ? 'width:110px;font-size:11px;font-weight:700;text-align:left;padding:2px 6px;background:#f0f0f0;color:#999;border-color:#ddd'
          : 'width:110px;font-size:11px;font-weight:700;text-align:left;padding:2px 6px';
        var finalHtml = '<span style="display:inline-flex;align-items:center">'
          +'<input class="form-input" type="text" value="'+formatMoney(r.finalAmount)+'" data-final-id="'+r.id+'" '
          +inputDisabled+'style="'+inputStyle+'">'
          +'<button class="btn btn--primary btn-confirm" data-cid="'+r.id+'" style="font-size:9px;padding:1px 6px;margin-left:4px;'+btnVis+'">확인</button>'
          +'</span>';
        memberCell = '<td style="text-align:center">'+r.member+'</td>';
        dateCell = '<td style="text-align:center">'+r.payDate+'</td>';
        contractCell = '<td style="text-align:center">'+r.contractDate+'</td>';
        splitCell = '<td style="text-align:center"><span class="badge badge--'+(splitColors[r.splitType]||'gray')+'" style="font-size:9px">'+r.splitType+'</span></td>';
        joinCell = '<td style="text-align:center"><span class="badge badge--'+(joinColors[r.joinOrder]||'gray')+'" style="font-size:9px">'+r.joinOrder+'</span></td>';
        maleCell = '<td style="text-align:center">'+maleHtml+'</td>';
        finalCell = '<td style="border-left:2px solid var(--border-light);text-align:center">'+finalHtml+'</td>';
      }

      var shareRowStyle = row.isShare ? 'background:var(--bg-secondary);' : '';

      return '<tr style="border-left:3px solid '+barColor+';'+shareRowStyle+'">'
        +'<td style="text-align:center;color:var(--text-muted)">'+(row.isShare ? '' : (idx+1))+'</td>'
        +'<td style="text-align:center"><span class="badge badge--'+(brandBadgeColors[row.brand]||'gray')+'" style="font-size:9px">'+row.brand+'</span></td>'
        +dateCell+contractCell+memberCell+splitCell+joinCell+maleCell
        +'<td style="text-align:center">'+row.manager+'</td>'
        +'<td style="text-align:center">'+row.ratio+'%</td>'
        +'<td style="text-align:center;font-weight:700">'+formatMoney(row.realAmount)+'</td>'
        +finalCell
        +'</tr>';
    }).join('')
    +'</tbody></table>';
}

// 합계 계산
function calcTotals() {
  var tAmount = 0, tFinal = 0, cConfirmed = 0;
  salesData.forEach(function(r){
    tAmount += r.amount;
    if (r.finalAmount !== null) { tFinal += r.finalAmount; cConfirmed++; }
  });
  return { totalAmount: tAmount, totalFinal: tFinal, confirmed: cConfirmed, pending: salesData.length - cConfirmed };
}

var now = new Date();
var monthStart = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-01';
var today = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
var managerSet = [];
MATCH_MANAGERS.forEach(function(m){ if(managerSet.indexOf(m)===-1) managerSet.push(m); });

var totals = calcTotals();

content.innerHTML =
  '<div class="page-header">'
  +'<div><h1 class="page-header__title">매출 현황 조회</h1>'
  +'<p class="page-header__subtitle">가입비 수납 내역 조회 (매출 입력은 정회원 상세 페이지에서 진행)</p></div>'
  +'<div class="page-header__actions"><button class="btn btn--outline" id="btn-excel">엑셀저장</button></div></div>'

  // 필터
  +'<div class="filter-bar" style="margin-bottom:12px"><div class="filter-bar__row">'
  +'<div class="filter-bar__item"><label>브랜드</label><select class="form-select" id="f-brand"><option value="">전체</option>'+BRANDS.map(function(b){return '<option>'+b+'</option>'}).join('')+'</select></div>'
  +'<div class="filter-bar__item"><label>기간</label><div style="display:flex;gap:4px"><input class="form-input" type="date" id="f-from" value="'+monthStart+'" style="width:130px"><span style="line-height:32px">~</span><input class="form-input" type="date" id="f-to" value="'+today+'" style="width:130px"></div></div>'
  +'<div class="filter-bar__item"><label>분할매출</label><select class="form-select" id="f-split"><option value="">전체</option>'+SPLIT_TYPES.map(function(s){return '<option>'+s+'</option>'}).join('')+'</select></div>'
  +'<div class="filter-bar__item"><label>가입순서</label><select class="form-select" id="f-join"><option value="">전체</option>'+JOIN_ORDERS.map(function(j){return '<option>'+j+'</option>'}).join('')+'</select></div>'
  +'<div class="filter-bar__item"><label>남성수당</label><select class="form-select" id="f-male"><option value="">전체</option><option>전문직</option><option>재력가</option><option>프로모션</option></select></div>'
  +'<div class="filter-bar__item"><label>상태</label><select class="form-select" id="f-status"><option value="">전체</option><option value="confirmed">확인완료</option><option value="pending">확인필요</option></select></div>'
  +'<div class="filter-bar__item"><label>담당</label><select class="form-select" id="f-mgr"><option value="">전체</option>'+managerSet.map(function(m){return '<option>'+m+'</option>'}).join('')+'</select></div>'
  +'<div class="filter-bar__search"><label>검색</label><input class="form-input" id="f-keyword" placeholder="회원명"></div>'
  +'</div></div>'

  // 요약
  +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
  +'<h2 style="font-size:14px;font-weight:700">'+now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+' 매출 현황</h2>'
  +'<div id="summary" style="font-size:12px;color:var(--text-muted)"></div>'
  +'</div>'


  // 테이블
  +'<div class="card"><div class="card__body" style="overflow-x:auto;padding:0" id="table-area">'+buildTable(salesData)+'</div></div>';

function updateSummary(data) {
  var tFinal = 0, cConfirmed = 0;
  data.forEach(function(r){
    if (r.finalAmount !== null) { tFinal += r.finalAmount; cConfirmed++; }
  });
  document.getElementById('summary').innerHTML =
    '총 <strong>'+data.length+'</strong>건 '
    +'| 입금액 <strong style="color:var(--accent)">'+formatMoney(tFinal)+'</strong> '
    +'| 확인완료 <strong style="color:#2e7d32">'+cConfirmed+'</strong> '
    +'/ 확인필요 <strong style="color:#e65100">'+(data.length - cConfirmed)+'</strong>';
}
updateSummary(salesData);

// 필터
function applyFilter() {
  var brand = document.getElementById('f-brand').value;
  var split = document.getElementById('f-split').value;
  var join = document.getElementById('f-join').value;
  var male = document.getElementById('f-male').value;
  var status = document.getElementById('f-status').value;
  var mgr = document.getElementById('f-mgr').value;
  var kw = document.getElementById('f-keyword').value.toLowerCase();
  var filtered = salesData.filter(function(r){
    // 브랜드 필터: 매니저 소속 브랜드 기준 (쉐어 매니저 포함)
    if (brand && r.managerBrand!==brand && r.shareBrand!==brand) return false;
    if (split && r.splitType!==split) return false;
    if (join && r.joinOrder!==join) return false;
    if (male && r.maleType!==male) return false;
    if (status==='confirmed' && r.finalAmount===null) return false;
    if (status==='pending' && r.finalAmount!==null) return false;
    if (mgr && r.manager!==mgr) return false;
    if (kw && r.member.toLowerCase().indexOf(kw)===-1) return false;
    return true;
  });
  document.getElementById('table-area').innerHTML = buildTable(filtered);
  updateSummary(filtered);
  bindFinalInputs();
}
['f-brand','f-split','f-join','f-male','f-status','f-mgr'].forEach(function(id){
  document.getElementById(id).addEventListener('change', applyFilter);
});
document.getElementById('f-keyword').addEventListener('input', applyFilter);

// 재무팀 확인/수정 버튼 이벤트
function bindFinalInputs() {
  // [확인] 버튼: 입력값 저장 + 잠금
  document.querySelectorAll('.btn-confirm').forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = parseInt(this.getAttribute('data-cid'));
      var record = salesData.find(function(r){ return r.id === id; });
      if (!record) return;
      var input = document.querySelector('[data-final-id="'+id+'"]');
      if (input) {
        var val = parseInt(input.value);
        if (isNaN(val) || val <= 0) { Toast.show('올바른 금액을 입력해주세요','error'); return; }
        record.finalAmount = val;
      }
      record.confirmed = true;
      Toast.show(record.member+' — 최종입금액 '+formatMoney(record.finalAmount)+' 확인완료','success');
      applyFilter();
    });
  });
}
bindFinalInputs();

// 엑셀
document.getElementById('btn-excel').addEventListener('click', function(){
  Toast.show('엑셀 다운로드 기능은 추후 연동 예정입니다','info');
});
