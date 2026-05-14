/* ========================================
   매칭 대상자 검색 페이지 (MN-310)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MockRegulars } from '@mock/regulars.js';

initLayout({ pageId: 'matching-search', breadcrumbs: ['정회원 관리', '매칭 대상자 검색'] });

const content = document.getElementById('content');
const currentGrade = '골드';

function getNextGrade(grade) {
  const grades = ['브론즈', '실버', '골드', '다이아', '블랙', '시크릿'];
  const idx = grades.indexOf(grade);
  return idx < grades.length - 1 ? grades[idx + 1] : grade;
}

const activeMembers = MockRegulars.filter(m => m.status === '활동');

content.innerHTML = `
  <div class="page-header">
    <div>
      <h1 class="page-header__title">매칭 대상자 검색</h1>
      <p class="page-header__subtitle">등급별 +1단계 제한 룰이 자동 적용됩니다 (§12.2)</p>
    </div>
  </div>

  <!-- 등급 필터 안내 -->
  <div class="card card--warning">
    <div class="card__body">
      <div class="grade-filter-info">
        <div class="grade-filter-info__badge">🔒 자동 필터링 적용중</div>
        <div class="grade-filter-info__desc">
          현재 요청 회원 등급: <strong class="text-accent">${currentGrade}</strong>
          → 검색 가능 범위: <strong>${currentGrade} ~ ${getNextGrade(currentGrade)}</strong> (+1단계 제한)
        </div>
      </div>
    </div>
  </div>

  <div class="matching-layout">
    <!-- 좌측: 필터 패널 -->
    <div class="matching-filter-panel">
      <div class="card">
        <div class="card__header"><h3 class="card__title">🔍 검색 조건</h3></div>
        <div class="card__body">
          <div class="form-group">
            <label class="form-label">성별</label>
            <select class="form-select" id="filter-gender">
              <option value="">전체</option><option value="남">남성</option><option value="여">여성</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">나이 범위</label>
            <div class="form-row">
              <input type="number" class="form-input" placeholder="최소" id="filter-age-min">
              <span class="form-separator">~</span>
              <input type="number" class="form-input" placeholder="최대" id="filter-age-max">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">지역</label>
            <select class="form-select" id="filter-region">
              <option value="">전체</option>
              <option>서울</option><option>경기</option><option>인천</option>
              <option>부산</option><option>대구</option><option>대전</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">학력</label>
            <select class="form-select" id="filter-education">
              <option value="">전체</option>
              <option>대졸</option><option>석사</option><option>박사</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">프로그램/등급</label>
            <select class="form-select" id="filter-grade" disabled>
              <option>${currentGrade} ~ ${getNextGrade(currentGrade)}</option>
            </select>
            <div class="form-hint">🔒 시스템 자동 적용 (변경 불가)</div>
          </div>
          <button class="btn btn--primary btn--full" id="btn-search">검색</button>
        </div>
      </div>
    </div>

    <!-- 우측: 결과 목록 -->
    <div class="matching-results">
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">검색 결과</h3>
          <span class="badge badge--accent">${activeMembers.length}명</span>
        </div>
        <div class="card__body">
          <div class="member-cards">
            ${activeMembers.map(m => `
              <div class="member-card">
                <div class="member-card__header">
                  <div class="member-card__avatar">${m.gender === '남' ? '👨' : '👩'}</div>
                  <div class="member-card__info">
                    <div class="member-card__name">${m.name}</div>
                    <div class="member-card__meta">${m.age}세 · ${m.region} · ${m.education}</div>
                  </div>
                  <span class="badge badge--purple">${m.program}</span>
                </div>
                <div class="member-card__details">
                  <div class="member-card__detail"><span>직업</span><span>${m.job}</span></div>
                  <div class="member-card__detail"><span>키</span><span>${m.height || '-'}cm</span></div>
                  <div class="member-card__detail"><span>미팅수</span><span>${m.meetingCount}회</span></div>
                </div>
                <div class="member-card__actions">
                  <button class="btn btn--sm btn--primary">프로필 발송</button>
                  <button class="btn btn--sm btn--outline">상세보기</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>
`;
