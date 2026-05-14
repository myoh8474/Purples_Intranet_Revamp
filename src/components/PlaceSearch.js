/* 장소 검색 모달 컴포넌트 */

const MOCK_PLACES = [
  {name:'갓포준',addr:'서울 강남구 논현로163길 10 B1',near:'압구정역 4번 214m',cat:'일식',parking:true},
  {name:'소소한연',addr:'서울 강남구 도산대로53길 13 2F',near:'압구정역 6번 350m',cat:'한식',parking:false},
  {name:'알베르',addr:'서울 강남구 선릉로162길 15',near:'압구정로데오역 5번 180m',cat:'양식',parking:true},
  {name:'라망떼',addr:'서울 서초구 서초중앙로 68 1F',near:'서초역 3번 120m',cat:'프렌치',parking:true},
  {name:'리코스테이크',addr:'서울 강남구 테헤란로4길 15',near:'역삼역 3번 200m',cat:'스테이크',parking:true},
  {name:'카페 드 마고',addr:'서울 강남구 압구정로 29길 42',near:'압구정역 3번 300m',cat:'카페',parking:false},
  {name:'스시마루',addr:'서울 서초구 강남대로 373',near:'서초역 1번 50m',cat:'일식',parking:true},
  {name:'더플레이스',addr:'서울 강남구 역삼로 115',near:'선릉역 2번 150m',cat:'양식',parking:true},
  {name:'봄날의보리밥',addr:'서울 종로구 북촌로 5길 23',near:'안국역 2번 180m',cat:'한식',parking:false},
  {name:'트라토리아 에쿠스',addr:'서울 용산구 이태원로 234',near:'이태원역 1번 100m',cat:'이탈리안',parking:false},
  {name:'레스토랑 에일',addr:'서울 마포구 와우산로 21길 19-18',near:'홍대입구역 9번 400m',cat:'프렌치',parking:false},
  {name:'카페온더플레인',addr:'서울 송파구 올림픽로 300',near:'잠실역 4번 250m',cat:'카페',parking:true},
  {name:'할매순대국',addr:'서울 종로구 종로 38길 7',near:'종로3가역 6번 80m',cat:'한식',parking:false},
  {name:'안동찜닭',addr:'서울 마포구 양화로 45',near:'합정역 2번 200m',cat:'한식',parking:false},
  {name:'투썸플레이스 선릉점',addr:'서울 강남구 역삼로 180',near:'선릉역 5번 50m',cat:'카페',parking:false},
  {name:'폴바셋 역삼점',addr:'서울 강남구 테헤란로 131 1F',near:'역삼역 2번 100m',cat:'카페',parking:false},
  {name:'라운지바 블랑',addr:'서울 강남구 청담동 118-17',near:'청담역 1번 300m',cat:'바/라운지',parking:true},
  {name:'오스테리아 오르조',addr:'서울 용산구 녹사평대로 244',near:'녹사평역 3번 120m',cat:'이탈리안',parking:false},
  {name:'더리버사이드호텔 로비라운지',addr:'서울 영등포구 여의도동 양화대교 남단',near:'여의나루역 1번 400m',cat:'호텔라운지',parking:true},
  {name:'그랜드 인터컨티넨탈 로비라운지',addr:'서울 강남구 봉은사로 524',near:'삼성역 5번 200m',cat:'호텔라운지',parking:true},
];

export const PlaceSearch = {
  /**
   * 장소 검색 모달을 띄우고, 선택 시 콜백 호출
   * @param {function} onSelect - (place) => {} 선택된 장소 객체 전달
   * @param {string} [keyword] - 초기 검색어
   */
  open(onSelect, keyword) {
    var overlay = document.createElement('div');
    overlay.id = 'place-search-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.45);z-index:10001;display:flex;align-items:center;justify-content:center;animation:fadeIn .15s ease';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-primary,#fff);border-radius:var(--radius-md,8px);width:520px;max-height:75vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.25);overflow:hidden';

    // 헤더
    var hdr = document.createElement('div');
    hdr.style.cssText = 'padding:14px 16px;border-bottom:1px solid var(--border-color,#e5e7eb);display:flex;align-items:center;justify-content:space-between';
    hdr.innerHTML = '<span style="font-size:14px;font-weight:700;color:var(--text-primary)">📍 장소 검색</span><button id="ps-close" style="border:none;background:none;font-size:18px;cursor:pointer;color:var(--text-muted,#999);padding:0;line-height:1">&times;</button>';
    modal.appendChild(hdr);

    // 검색 입력
    var searchWrap = document.createElement('div');
    searchWrap.style.cssText = 'padding:10px 16px;border-bottom:1px solid var(--border-color,#e5e7eb)';
    searchWrap.innerHTML = '<div style="display:flex;gap:6px"><input type="text" class="form-input" id="ps-keyword" placeholder="장소명, 주소, 카테고리 검색" value="'+(keyword||'')+'" style="font-size:12px;padding:6px 10px;flex:1"><button class="btn btn--primary btn--sm" id="ps-search-btn" style="font-size:11px;white-space:nowrap">검색</button></div>';
    modal.appendChild(searchWrap);

    // 결과 리스트
    var listWrap = document.createElement('div');
    listWrap.style.cssText = 'flex:1;overflow-y:auto;padding:0';
    listWrap.id = 'ps-results';
    modal.appendChild(listWrap);

    // 안내
    var foot = document.createElement('div');
    foot.style.cssText = 'padding:8px 16px;border-top:1px solid var(--border-color,#e5e7eb);font-size:10px;color:var(--text-muted,#999);text-align:center';
    foot.textContent = '※ 장소를 클릭하면 자동 입력됩니다.';
    modal.appendChild(foot);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 렌더
    function render(kw) {
      var filtered = MOCK_PLACES;
      if (kw && kw.trim()) {
        var q = kw.trim().toLowerCase();
        filtered = MOCK_PLACES.filter(function(p) {
          return p.name.toLowerCase().includes(q) || p.addr.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.near.toLowerCase().includes(q);
        });
      }
      var html = '';
      if (filtered.length === 0) {
        html = '<div style="padding:40px 16px;text-align:center;color:var(--text-muted,#999);font-size:12px">검색 결과가 없습니다.</div>';
      } else {
        html = '<table style="width:100%;font-size:11px;border-collapse:collapse">';
        html += '<thead><tr style="background:var(--bg-secondary,#f9fafb)">';
        html += '<th style="padding:6px 10px;text-align:left;font-weight:600;width:22%">장소명</th>';
        html += '<th style="padding:6px 10px;text-align:left;font-weight:600;width:38%">주소</th>';
        html += '<th style="padding:6px 10px;text-align:left;font-weight:600;width:22%">가까운 역</th>';
        html += '<th style="padding:6px 10px;text-align:center;font-weight:600;width:10%">분류</th>';
        html += '<th style="padding:6px 10px;text-align:center;font-weight:600;width:8%">주차</th>';
        html += '</tr></thead><tbody>';
        filtered.forEach(function(p, i) {
          html += '<tr class="ps-row" data-idx="'+i+'" style="cursor:pointer;border-bottom:1px solid var(--border-color,#e5e7eb);transition:background .12s">';
          html += '<td style="padding:8px 10px;font-weight:600;color:var(--primary,#6366f1)">'+p.name+'</td>';
          html += '<td style="padding:8px 10px;color:var(--text-secondary,#6b7280);font-size:10px">'+p.addr+'</td>';
          html += '<td style="padding:8px 10px;font-size:10px;color:var(--text-muted,#999)">'+p.near+'</td>';
          html += '<td style="padding:8px 10px;text-align:center"><span style="background:var(--bg-secondary,#f3f4f6);padding:1px 6px;border-radius:4px;font-size:10px">'+p.cat+'</span></td>';
          html += '<td style="padding:8px 10px;text-align:center;font-size:10px">'+(p.parking?'<span style="color:#059669">✓</span>':'<span style="color:#d1d5db">—</span>')+'</td>';
          html += '</tr>';
        });
        html += '</tbody></table>';
      }
      listWrap.innerHTML = html;

      // 행 클릭
      listWrap.querySelectorAll('.ps-row').forEach(function(row) {
        row.addEventListener('mouseenter', function(){this.style.background='var(--bg-secondary,#f3f4f6)';});
        row.addEventListener('mouseleave', function(){this.style.background='';});
        row.addEventListener('click', function() {
          var idx = parseInt(this.dataset.idx);
          var sel = filtered[idx];
          close();
          if (onSelect) onSelect(sel);
        });
      });
    }

    function close() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    // 이벤트
    overlay.querySelector('#ps-close').addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });

    var input = overlay.querySelector('#ps-keyword');
    overlay.querySelector('#ps-search-btn').addEventListener('click', function() { render(input.value); });
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); render(input.value); } });

    // 초기 렌더
    render(keyword || '');
    setTimeout(function() { input.focus(); input.select(); }, 100);
  }
};
