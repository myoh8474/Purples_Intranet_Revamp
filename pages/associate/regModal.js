import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { Formatters } from '@utils/formatters.js';
import { PROGRAMS, PROGRAM_GRADES, EDUCATIONS, JOB_TREE, BRANCHES } from '@config/constants.js';

let selectedProgram = '골드(사파이어)', selectedGrade = '', regNameOk = false;

const STYLE = `<style>
.rr-chip{padding:6px 14px;border:1px solid var(--border-light,#ddd);background:var(--bg-primary,#fff);font-size:11px;cursor:pointer;transition:all .15s;font-family:inherit}
.rr-chip:hover{border-color:var(--accent,#7c3aed)}
.rr-chip.active{background:var(--accent,#7c3aed);color:#fff;border-color:var(--accent,#7c3aed);font-weight:700}
.rr-gc{display:none;padding:10px;background:var(--bg-secondary,#f8f9fa);border:1px solid var(--border-light,#ddd);margin-top:8px}
.rr-gc.show{display:block}
.rr-t{width:100%;border-collapse:collapse;font-size:12px}
.rr-t td{padding:5px 8px;border:1px solid var(--border-light,#ddd);vertical-align:middle}
.rr-t .lb{background:var(--bg-secondary,#f8f9fa);font-weight:600;white-space:nowrap;text-align:center;color:var(--text-secondary,#555);width:90px}
.rr-t input,.rr-t select{width:100%;padding:3px 5px;border:1px solid #ccc;font-size:11px;box-sizing:border-box;font-family:inherit}
.rr-t > tbody > tr > td > table td{border:none}
.rr-t table input[type="number"],.rr-t table input[type="text"]{width:auto}
.rr-sec{font-size:13px;font-weight:700;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--border-light,#ddd)}
.rr-photo-box{width:90px;height:110px;border:2px dashed #ccc;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:10px;color:#999;gap:4px;background:#fafafa}
.rr-photo-box:hover{border-color:#7c3aed;color:#7c3aed}
.rr-note{font-size:11px;color:#888;margin-top:4px}
.rr-note.warn{color:#1565c0}
</style>`;

function buildContent(m) {
  const today = new Date().toISOString().slice(0,10);
  const reDate = new Date(); reDate.setFullYear(reDate.getFullYear()+2);
  const reDay = reDate.toISOString().slice(0,10);

  return STYLE + `
<!-- 기본정보 -->
<div style="margin-bottom:16px"><div class="rr-sec">기본정보</div>
<table class="rr-t"><tbody>
  <tr>
    <td class="lb">회원명</td><td><input id="rr-name" value="${m.name}" /></td>
    <td class="lb">주민번호 <span style="color:#e53e3e">*</span></td>
    <td><div style="display:flex;gap:3px;align-items:center">
      <input id="rr-ssn1" maxlength="6" style="width:70px" /> - <input id="rr-ssn2" type="password" maxlength="7" style="width:80px" />
      <button class="btn btn--sm" id="btn-rr-name-check" style="font-size:10px;white-space:nowrap;margin-left:4px">실명확인</button>
    </div><div id="rr-name-msg" style="min-height:16px;font-size:11px;padding:2px 0"></div></td>
  </tr>
  <tr>
    <td class="lb">지사 <span style="color:#e53e3e">*</span></td>
    <td><select id="rr-branch"><option>지사선택</option>${BRANCHES.map(b=>`<option>${b.name}</option>`).join('')}</select></td>
    <td class="lb">성별 <span style="color:#e53e3e">*</span></td>
    <td><div style="display:flex;gap:12px;font-size:11px"><label><input type="radio" name="rr-gender" value="남" ${m.gender==='남'?'checked':''} /> 남</label><label><input type="radio" name="rr-gender" value="여" ${m.gender==='여'?'checked':''} /> 여</label></div></td>
  </tr>
  <tr>
    <td class="lb">회원번호</td>
    <td colspan="3"><div style="display:flex;gap:4px;max-width:300px"><input id="rr-memno" placeholder="" style="flex:1" /><button class="btn btn--sm" id="btn-rr-memno" style="font-size:10px;white-space:nowrap">자동채번</button></div>
    <div class="rr-note">지사·성별 선택 후 [자동채번] 필수</div></td>
  </tr>
  <tr>
    <td class="lb">결혼형태</td>
    <td colspan="3"><div style="display:flex;gap:12px;font-size:11px">
      <label><input type="radio" name="rr-m" value="미혼" checked /> 미혼</label>
      <label><input type="radio" name="rr-m" value="재혼" /> 재혼</label>
      <label><input type="radio" name="rr-m" value="사별" /> 사별</label>
      <label><input type="radio" name="rr-m" value="사실혼" /> 사실혼</label>
    </div></td>
  </tr>
  <tr>
    <td class="lb">사진등록 <span style="color:#e53e3e">*</span></td>
    <td colspan="3">
      <div style="display:flex;gap:12px;margin-bottom:4px">
        <div class="rr-photo-box" id="rr-photo1"><span>📷</span><span>프로필 사진</span></div>
        <div class="rr-photo-box" id="rr-photo2"><span>📷</span><span>전신 사진</span></div>
        <div class="rr-photo-box" id="rr-photo3"><span>📷</span><span>추가 사진</span></div>
      </div>
      <div class="rr-note">* 클릭하여 사진을 업로드하세요 (JPG, PNG / 최대 5MB)</div>
    </td>
  </tr>
  <tr><td class="lb">핸드폰1</td><td><div style="display:flex;gap:3px;align-items:center"><select style="width:55px"><option>본인</option><option>모친</option><option>부친</option><option>기타</option></select><input id="rr-phone" value="${Formatters.phone(m.phone)}" style="flex:1" /><label style="display:flex;align-items:center;gap:2px;font-size:10px;white-space:nowrap;cursor:pointer"><input type="radio" name="rr-primary-phone" value="1" checked style="margin:0" />대표</label></div></td><td class="lb">핸드폰2</td><td><div style="display:flex;gap:3px;align-items:center"><select style="width:55px"><option>모친</option><option>본인</option><option>부친</option><option>기타</option></select><input value="${m.phone2?Formatters.phone(m.phone2):''}" style="flex:1" /><label style="display:flex;align-items:center;gap:2px;font-size:10px;white-space:nowrap;cursor:pointer"><input type="radio" name="rr-primary-phone" value="2" style="margin:0" />대표</label></div></td></tr>
  <tr><td class="lb">핸드폰3</td><td><div style="display:flex;gap:3px;align-items:center"><select style="width:55px"><option>본인</option><option>모친</option><option>부친</option><option>기타</option></select><input value="${m.phone3?Formatters.phone(m.phone3):''}" style="flex:1" /><label style="display:flex;align-items:center;gap:2px;font-size:10px;white-space:nowrap;cursor:pointer"><input type="radio" name="rr-primary-phone" value="3" style="margin:0" />대표</label></div></td><td class="lb">직장연락처</td><td><input placeholder="02-0000-0000" value="${m.telOffice||''}" /></td></tr>
  <tr><td class="lb">자택연락처</td><td><input placeholder="02-0000-0000" value="${m.telHome||''}" /></td><td class="lb">이메일</td><td><input id="rr-email" value="${m.email||''}" placeholder="example@email.com" /></td></tr>
  <tr><td class="lb">본적지</td><td colspan="3"><div style="display:flex;gap:4px"><input id="rr-addr" style="flex:1" readonly placeholder="주소검색 버튼을 클릭하세요" /><button class="btn btn--sm" id="btn-rr-addr" style="font-size:10px;white-space:nowrap">주소검색</button></div><input id="rr-addr-detail" style="margin-top:4px;width:100%" placeholder="상세주소 입력" /></td></tr>
</tbody></table></div>

<!-- 학력 / 직업 -->
<div style="margin-bottom:16px"><div class="rr-sec">학력 / 직업</div>
<table class="rr-t"><tbody>
  <tr>
    <td class="lb">최종학력 <span style="color:#e53e3e">*</span></td>
    <td><select><option>선택</option>${EDUCATIONS.map(e=>`<option>${e}</option>`).join('')}</select></td>
    <td class="lb">직업 <span style="color:#e53e3e">*</span></td>
    <td><select><option>선택</option>${Object.entries(JOB_TREE).map(([cat,jobs])=>`<optgroup label="${cat}">${jobs.map(j=>`<option>${j}</option>`).join('')}</optgroup>`).join('')}</select></td>
  </tr>
</tbody></table>
<div class="rr-note warn">* 학력 상세 정보는 정회원 등록 후 회원정보 수정페이지에서 기재할 수 있습니다.</div>
</div>

<!-- 담당 컨설턴트 -->
<div style="margin-bottom:16px"><div class="rr-sec">담당 컨설턴트</div>
<table class="rr-t"><tbody>
  <tr><td class="lb">컨설턴트</td><td colspan="3"><input id="rr-consultant" value="${m.consultant||''}" /></td></tr>
</tbody></table></div>

<!-- 프로그램 선택 -->
<div style="margin-bottom:16px"><div class="rr-sec">프로그램 선택</div>
<table class="rr-t"><tbody>
  <tr><td class="lb">프로그램</td><td colspan="3">
    <div style="display:flex;flex-wrap:wrap;gap:6px" id="rr-pgm"></div>
    <div class="rr-gc" id="rr-ga"><div style="font-size:11px;font-weight:600;margin-bottom:6px">등급 선택 *</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px" id="rr-gc"></div></div>
  </td></tr>
</tbody></table></div>

<!-- 서비스 선택 -->
<div style="margin-bottom:16px"><div class="rr-sec">서비스 선택</div>
<table class="rr-t"><tbody>
  <tr><td class="lb">가입일</td><td><input type="date" id="rr-join-date" value="${today}" /></td><td class="lb">재가입일</td><td><input type="date" id="rr-rejoin-date" value="${reDay}" /></td></tr>
  <tr><td class="lb" style="vertical-align:middle">서비스선택</td><td colspan="3" style="padding:6px 8px">
    <div id="rr-svc-cert-notice" style="display:none;font-size:10px;color:#1565c0;margin-bottom:4px">* 인증제 / 단일인증제는 준전문직·전문직·파타상품 선택 시 활성화됩니다.</div>
    <table style="width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed">
      <colgroup><col style="width:100px"><col></colgroup>
      <tr>
        <td style="padding:5px 8px 5px 0 !important;white-space:nowrap;vertical-align:middle"><label style="cursor:pointer;display:flex;align-items:center;gap:4px"><input type="radio" name="rr-svc" value="기간제" checked /> 기간제</label></td>
        <td style="padding:5px 0 5px 16px !important;white-space:nowrap;vertical-align:middle">미팅횟수 <input type="number" id="rr-svc-meeting" value="1" min="1" style="width:50px;text-align:center" /> 회 &nbsp;+ 보너스기간 <input type="number" id="rr-svc-bonus-month" value="0" min="0" style="width:50px;text-align:center" /> 개월</td>
      </tr>
      <tr>
        <td style="padding:5px 8px 5px 0 !important;white-space:nowrap;vertical-align:middle"><label style="cursor:pointer;display:flex;align-items:center;gap:4px"><input type="radio" name="rr-svc" value="횟수제" /> 횟수제</label></td>
        <td style="padding:5px 0 5px 16px !important;white-space:nowrap;vertical-align:middle">미팅횟수 <input type="number" id="rr-svc-meeting2" value="1" min="1" style="width:50px;text-align:center" /> 회 &nbsp;+ 보너스횟수 <input type="number" id="rr-svc-bonus-count" value="0" min="0" style="width:50px;text-align:center" /> 회</td>
      </tr>
      <tr>
        <td style="padding:5px 8px 5px 0 !important;white-space:nowrap;vertical-align:middle"><label style="cursor:pointer;opacity:0.4;display:flex;align-items:center;gap:4px" id="lbl-svc-cert"><input type="radio" name="rr-svc" value="인증제" disabled /> 인증제</label></td>
        <td style="padding:5px 0 5px 16px !important;white-space:nowrap;vertical-align:middle">1차기간 <input type="number" id="rr-cert-period1" value="12" min="1" style="width:50px;text-align:center" /> 개월 &nbsp;+ 2차기간 <input type="number" id="rr-cert-period2" value="12" min="0" style="width:50px;text-align:center" /> 개월</td>
      </tr>
      <tr>
        <td style="padding:5px 8px 5px 0 !important;white-space:nowrap;vertical-align:middle"><label style="cursor:pointer;opacity:0.4;display:flex;align-items:center;gap:4px" id="lbl-svc-single"><input type="radio" name="rr-svc" value="단일인증제" disabled /> 단일인증제</label></td>
        <td style="padding:5px 0 5px 16px !important;white-space:nowrap;vertical-align:middle">미팅기간 <input type="number" id="rr-single-period" value="24" min="1" style="width:50px;text-align:center" /> 개월</td>
      </tr>
    </table>
  </td></tr>
</tbody></table></div>

<!-- 매출정보 입력 -->
<div style="margin-bottom:8px"><div class="rr-sec">매출정보 입력</div>
<table class="rr-t"><tbody>
  <tr>
    <td class="lb">주가입비 <span style="color:#e53e3e">*</span></td>
    <td><input type="text" id="rr-fee" placeholder="0" style="text-align:right" /></td>
    <td class="lb">재가입비</td>
    <td><input type="text" id="rr-rejoin-fee" placeholder="0" style="text-align:right" /><div class="rr-note" id="rr-rejoin-fee-note">* 1가입인 경우 미표기</div></td>
  </tr>
  <tr>
    <td class="lb">할인율</td>
    <td><div style="display:flex;gap:4px;align-items:center"><input type="number" id="rr-discount" value="0" min="0" max="100" style="width:60px;text-align:right" /> %</div></td>
    <td class="lb">성혼비</td>
    <td><input type="text" id="rr-marriage-fee" placeholder="0" style="text-align:right" /></td>
  </tr>
  <tr>
    <td class="lb">입금일 <span style="color:#e53e3e">*</span></td>
    <td><input type="date" id="rr-pay-date" value="${today}" /></td>
    <td class="lb">결제수단 <span style="color:#e53e3e">*</span></td>
    <td><select id="rr-paymethod"><option value="현금">현금</option><option value="카드">카드</option><option value="계좌이체">계좌이체</option><option value="복합결제">복합결제</option></select></td>
  </tr>
  <tr>
    <td class="lb">카드사</td>
    <td><input id="rr-card" placeholder="카드사 입력" disabled style="opacity:0.4" /></td>
    <td class="lb">분할납부</td>
    <td><select id="rr-installment"><option>일시불</option><option>2개월</option><option>3개월</option><option>6개월</option><option>12개월</option><option>무이자 2개월</option><option>무이자 3개월</option><option>무이자 6개월</option><option>무이자 12개월</option></select></td>
  </tr>
  <tr style="background:#f0f7ff">
    <td class="lb" style="font-weight:700">입금액 <span style="color:#e53e3e">*</span></td>
    <td colspan="3"><input type="text" id="rr-pay-amount" placeholder="0" style="text-align:right;font-weight:700;font-size:13px" /><div class="rr-note">* 주가입비 - 할인율 자동계산 (수정 가능)</div></td>
  </tr>
  <tr>
    <td class="lb">비고</td>
    <td colspan="3"><input id="rr-sales-memo" style="width:100%" /></td>
  </tr>
</tbody></table></div>

<!-- 서류인증 -->
<div style="margin-bottom:8px"><div class="rr-sec">서류인증</div>
<table class="rr-t"><tbody>
  <tr><td class="lb" style="vertical-align:middle">필수서류</td><td colspan="3">
    <div id="rr-doc-required" style="display:flex;flex-direction:column;gap:6px;font-size:11px">
      <div class="rr-doc-row" data-doc="신분증(주민등록증)">
        <span style="min-width:130px;display:inline-block">신분증(주민등록증)</span>
        <input type="file" accept="image/*,.pdf" style="font-size:11px" />
        <span class="rr-doc-status" style="color:#999;font-size:10px;margin-left:4px"></span>
      </div>
      <div class="rr-doc-row" data-doc="재직증명서">
        <span style="min-width:130px;display:inline-block">재직증명서</span>
        <input type="file" accept="image/*,.pdf" style="font-size:11px" />
        <span class="rr-doc-status" style="color:#999;font-size:10px;margin-left:4px"></span>
      </div>
      <div class="rr-doc-row" data-doc="졸업증명서">
        <span style="min-width:130px;display:inline-block">졸업증명서</span>
        <input type="file" accept="image/*,.pdf" style="font-size:11px" />
        <span class="rr-doc-status" style="color:#999;font-size:10px;margin-left:4px"></span>
      </div>
      <div class="rr-doc-row" data-doc="가족관계증명서">
        <span style="min-width:130px;display:inline-block">가족관계증명서</span>
        <input type="file" accept="image/*,.pdf" style="font-size:11px" />
        <span class="rr-doc-status" style="color:#999;font-size:10px;margin-left:4px"></span>
      </div>
    </div>
  </td></tr>
  <tr><td class="lb" style="vertical-align:top">추가서류</td><td colspan="3">
    <div id="rr-doc-extra" style="display:flex;flex-direction:column;gap:6px;font-size:11px"></div>
    <button type="button" id="btn-rr-doc-add" style="margin-top:6px;font-size:11px;padding:3px 10px;cursor:pointer;border:1px dashed #aaa;background:#fafafa;border-radius:3px">+ 추가서류 등록</button>
  </td></tr>
</tbody></table></div>`;
}

export function showRegModal(m) {
  selectedProgram = '골드(사파이어)'; selectedGrade = ''; regNameOk = false;

  Modal.show({ title: '정회원 등록', size: 'xl',
    content: buildContent(m),
    footer: '<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="btn-rr-ok">정회원 등록</button>'
  });

  setTimeout(() => {
    // 프로그램 칩
    const pc = document.getElementById('rr-pgm');
    if (pc) pc.innerHTML = PROGRAMS.map(p => `<button type="button" class="rr-chip ${p===selectedProgram?'active':''}" data-p="${p}">${p}${PROGRAM_GRADES[p]?' ▾':''}</button>`).join('');
    function updGrade() {
      const ga = document.getElementById('rr-ga'), gc = document.getElementById('rr-gc');
      const gr = PROGRAM_GRADES[selectedProgram];
      if (!gr) { ga.classList.remove('show'); gc.innerHTML = ''; return; }
      ga.classList.add('show');
      gc.innerHTML = gr.map(g => `<button type="button" class="rr-chip ${selectedGrade===g?'active':''}" data-g="${g}">${g}</button>`).join('');
      gc.querySelectorAll('.rr-chip').forEach(c => c.onclick = () => { selectedGrade = c.dataset.g; gc.querySelectorAll('.rr-chip').forEach(x => x.classList.remove('active')); c.classList.add('active'); });
    }
    pc?.querySelectorAll('.rr-chip').forEach(c => c.onclick = () => { selectedProgram = c.dataset.p; selectedGrade = ''; pc.querySelectorAll('.rr-chip').forEach(x => x.classList.remove('active')); c.classList.add('active'); updGrade(); });
    updGrade();

    // 자동채번
    document.getElementById('btn-rr-memno')?.addEventListener('click', () => {
      const branch = document.getElementById('rr-branch')?.value;
      const gender = document.querySelector('input[name="rr-gender"]:checked')?.value;
      if (!branch || branch === '지사선택') { Toast.show('지사를 선택해 주세요.', 'warning'); return; }
      if (!gender) { Toast.show('성별을 선택해 주세요.', 'warning'); return; }
      const prefix = branch === '서울' ? 'S' : branch === '부산' ? 'B' : 'D';
      const gCode = gender === '남' ? 'M' : 'F';
      const num = String(Math.floor(Math.random() * 9000) + 1000);
      document.getElementById('rr-memno').value = `${prefix}${gCode}-${num}`;
      Toast.show('회원번호가 자동 채번되었습니다.', 'success');
    });

    // 실명확인
    document.getElementById('btn-rr-name-check')?.addEventListener('click', () => {
      const name = document.getElementById('rr-name')?.value?.trim();
      const ssn1 = document.getElementById('rr-ssn1')?.value?.trim();
      const ssn2 = document.getElementById('rr-ssn2')?.value?.trim();
      const msg = document.getElementById('rr-name-msg');
      if (!name) { msg.textContent = '회원명을 입력해 주세요.'; msg.style.color = '#dc2626'; return; }
      if (!ssn1 || ssn1.length !== 6 || !/^\d{6}$/.test(ssn1)) { msg.textContent = '주민번호 앞자리 6자리를 정확히 입력해 주세요.'; msg.style.color = '#dc2626'; return; }
      if (!ssn2 || ssn2.length !== 7 || !/^\d{7}$/.test(ssn2)) { msg.textContent = '주민번호 뒷자리 7자리를 정확히 입력해 주세요.'; msg.style.color = '#dc2626'; return; }
      msg.textContent = '확인 중...'; msg.style.color = '#555';
      setTimeout(() => {
        regNameOk = true;
        msg.innerHTML = '<span style="color:#16a34a;font-weight:600">✓ 실명확인 완료</span> <span style="color:#555">(' + name + ')</span>';
        Toast.show(`${name}님 실명확인이 완료되었습니다.`, 'success');
      }, 500);
    });

    // 사진 업로드 (클릭 시 파일 선택)
    ['rr-photo1','rr-photo2','rr-photo3'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', function() {
        const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
        inp.onchange = (e) => {
          const file = e.target.files[0]; if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            this.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover" />`;
          };
          reader.readAsDataURL(file);
        };
        inp.click();
      });
    });

    // 주소검색 (다음 우편번호 API)
    document.getElementById('btn-rr-addr')?.addEventListener('click', () => {
      if (!window.daum || !window.daum.Postcode) {
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = () => openPostcode();
        document.head.appendChild(script);
      } else { openPostcode(); }
      function openPostcode() {
        new daum.Postcode({ oncomplete: (data) => {
          const addr = data.roadAddress || data.jibunAddress;
          document.getElementById('rr-addr').value = addr;
          document.getElementById('rr-addr-detail').focus();
        }}).open();
      }
    });

    // 서비스 타입 전환
    const CERT_PROGRAMS = ['준전문직', '전문직', '파타상품'];
    function updateCertAvail() {
      const isCertOk = CERT_PROGRAMS.includes(selectedProgram);
      const lblCert = document.getElementById('lbl-svc-cert');
      const lblSingle = document.getElementById('lbl-svc-single');
      const certRadio = lblCert?.querySelector('input');
      const singleRadio = lblSingle?.querySelector('input');
      if (lblCert) lblCert.style.opacity = isCertOk ? '1' : '0.4';
      if (lblSingle) lblSingle.style.opacity = isCertOk ? '1' : '0.4';
      if (certRadio) certRadio.disabled = !isCertOk;
      if (singleRadio) singleRadio.disabled = !isCertOk;
      document.getElementById('rr-svc-cert-notice').style.display = isCertOk ? 'none' : 'block';
      // 비활성 상태에서 인증제/단일인증제 선택된 경우 기간제로 복귀
      if (!isCertOk) {
        const cur = document.querySelector('input[name="rr-svc"]:checked')?.value;
        if (cur === '인증제' || cur === '단일인증제') {
          document.querySelector('input[name="rr-svc"][value="기간제"]').checked = true;
          updateSvcUI();
        }
      }
    }

    function updateSvcUI() {
      calcRejoinDate();
    }
    document.querySelectorAll('input[name="rr-svc"]').forEach(r => r.addEventListener('change', updateSvcUI));

    // 프로그램 선택 시 인증제 활성화 체크
    const origPcClick = pc?.onclick;
    pc?.addEventListener('click', (e) => {
      const chip = e.target.closest('.rr-chip');
      if (chip) setTimeout(updateCertAvail, 50);
    });
    updateCertAvail();

    // 재가입일 자동 계산
    function calcRejoinDate() {
      const joinEl = document.getElementById('rr-join-date');
      const rejoinEl = document.getElementById('rr-rejoin-date');
      if (!joinEl?.value) return;
      const svcType = document.querySelector('input[name="rr-svc"]:checked')?.value;
      const base = new Date(joinEl.value);
      if (svcType === '기간제') {
        const bonus = parseInt(document.getElementById('rr-svc-bonus-month')?.value || '0');
        base.setFullYear(base.getFullYear() + 2);
        base.setMonth(base.getMonth() + bonus);
      } else if (svcType === '인증제') {
        const p1 = parseInt(document.getElementById('rr-cert-period1')?.value || '12');
        const p2 = parseInt(document.getElementById('rr-cert-period2')?.value || '12');
        base.setMonth(base.getMonth() + p1 + p2);
      } else if (svcType === '단일인증제') {
        const p = parseInt(document.getElementById('rr-single-period')?.value || '24');
        base.setMonth(base.getMonth() + p);
      } else {
        base.setFullYear(base.getFullYear() + 2);
      }
      rejoinEl.value = base.toISOString().slice(0, 10);
    }
    document.getElementById('rr-join-date')?.addEventListener('change', calcRejoinDate);
    document.getElementById('rr-svc-bonus-month')?.addEventListener('input', calcRejoinDate);
    document.getElementById('rr-cert-period1')?.addEventListener('input', calcRejoinDate);
    document.getElementById('rr-cert-period2')?.addEventListener('input', calcRejoinDate);
    document.getElementById('rr-single-period')?.addEventListener('input', calcRejoinDate);

    // 매출정보: 입금액 자동계산 (주가입비 - 할인율)
    function calcPayAmount() {
      const feeVal = parseInt(document.getElementById('rr-fee')?.value?.replace(/[^0-9]/g, '') || '0');
      const disc = parseInt(document.getElementById('rr-discount')?.value || '0');
      const amount = Math.round(feeVal * (1 - disc / 100));
      document.getElementById('rr-pay-amount').value = amount > 0 ? amount.toLocaleString() : '';
    }
    document.getElementById('rr-fee')?.addEventListener('input', calcPayAmount);
    document.getElementById('rr-discount')?.addEventListener('input', calcPayAmount);

    // 매출정보: 결제수단에 따른 카드사 활성/비활성
    function toggleCard() {
      const method = document.getElementById('rr-paymethod')?.value;
      const cardEl = document.getElementById('rr-card');
      const isCard = method === '카드' || method === '복합결제';
      if (cardEl) { cardEl.disabled = !isCard; cardEl.style.opacity = isCard ? '1' : '0.4'; }
    }
    document.getElementById('rr-paymethod')?.addEventListener('change', toggleCard);

    // 매출정보: 단일인증제 시 재가입비 비활성
    function toggleRejoinFee() {
      const svcType = document.querySelector('input[name="rr-svc"]:checked')?.value;
      const el = document.getElementById('rr-rejoin-fee');
      const isSingle = svcType === '단일인증제';
      if (el) { el.disabled = isSingle; el.style.opacity = isSingle ? '0.4' : '1'; }
    }
    document.querySelectorAll('input[name="rr-svc"]').forEach(r => r.addEventListener('change', toggleRejoinFee));
    toggleRejoinFee();

    // 인증제: 결제금액 100만원 미만 경고
    document.getElementById('rr-fee')?.addEventListener('change', () => {
      const svcType = document.querySelector('input[name="rr-svc"]:checked')?.value;
      if (svcType === '인증제') {
        const fee = parseInt(document.getElementById('rr-fee').value.replace(/[^0-9]/g, '') || '0');
        if (fee > 0 && fee < 1000000) {
          Toast.show('100만원 이상 결제 서비스입니다.', 'warning');
        }
      }
    });

    // 서류인증: 필수서류 파일 선택 시 상태 업데이트
    document.querySelectorAll('#rr-doc-required .rr-doc-row input[type="file"]').forEach(inp => {
      inp.addEventListener('change', function() {
        const status = this.closest('.rr-doc-row').querySelector('.rr-doc-status');
        if (this.files.length > 0) {
          const name = this.files[0].name;
          status.innerHTML = `<span style="color:#16a34a">✓ ${name}</span> <button type="button" class="rr-doc-del" style="font-size:9px;color:#e53e3e;background:none;border:none;cursor:pointer;margin-left:4px">삭제</button>`;
          status.querySelector('.rr-doc-del').addEventListener('click', () => {
            inp.value = '';
            status.innerHTML = '<span style="color:#999">미등록</span>';
          });
        }
      });
    });

    // 서류인증: 추가서류 등록
    let extraDocIdx = 0;
    document.getElementById('btn-rr-doc-add')?.addEventListener('click', () => {
      extraDocIdx++;
      const container = document.getElementById('rr-doc-extra');
      const row = document.createElement('div');
      row.className = 'rr-doc-row';
      row.style.cssText = 'display:flex;align-items:center;gap:6px';
      row.innerHTML = `
        <input type="text" placeholder="서류명 입력" style="width:130px;font-size:11px" />
        <input type="file" accept="image/*,.pdf" style="font-size:11px" />
        <span class="rr-doc-status" style="color:#999;font-size:10px"></span>
        <button type="button" class="rr-doc-remove" style="font-size:10px;color:#e53e3e;background:none;border:1px solid #e53e3e;border-radius:3px;padding:1px 6px;cursor:pointer">삭제</button>
      `;
      container.appendChild(row);
      // 파일 선택 시 상태
      row.querySelector('input[type="file"]').addEventListener('change', function() {
        const st = row.querySelector('.rr-doc-status');
        if (this.files.length > 0) {
          st.innerHTML = `<span style="color:#16a34a">✓ ${this.files[0].name}</span>`;
        }
      });
      // 행 삭제
      row.querySelector('.rr-doc-remove').addEventListener('click', () => row.remove());
    });

    // 정회원 등록
    document.getElementById('btn-rr-ok')?.addEventListener('click', () => {
      if (!regNameOk) { Toast.show('실명확인을 진행해 주세요.', 'warning'); return; }
      if (PROGRAM_GRADES[selectedProgram] && !selectedGrade) { Toast.show('등급을 선택해 주세요.', 'warning'); return; }
      const pt = selectedGrade || selectedProgram;
      const name = document.getElementById('rr-name')?.value?.trim() || m.name;
      if (confirm(`${name}님을 [${pt}] 프로그램으로 정회원 등록하시겠습니까?`)) {
        Toast.show('정회원 등록이 완료되었습니다.', 'success');
        document.getElementById('modal-root').innerHTML = '';
      }
    });
  }, 100);
}
