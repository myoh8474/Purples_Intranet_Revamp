-- ============================================
-- 테스트 데이터 보강 — 준회원 필드 채우기
-- ============================================

-- 준회원 1: 김민준
UPDATE associates SET
  memo = '삼성전자 대리. 결혼 의향 높음. 주말 상담 선호.',
  distributed_at = registered_at + interval '2 days',
  last_contact_at = now() - interval '3 days'
WHERE name = '김민준';

-- 준회원 2: 이서연
UPDATE associates SET
  memo = '고려대 로스쿨 출신. 전문직 선호. 서울 거주 필수.',
  distributed_at = registered_at + interval '1 day',
  last_contact_at = now() - interval '5 days'
WHERE name = '이서연';

-- 준회원 3: 박도윤
UPDATE associates SET
  memo = 'KB은행 과장. 연봉 8천. 진지한 만남 원함.',
  distributed_at = registered_at + interval '3 days',
  last_contact_at = now() - interval '1 day'
WHERE name = '박도윤';

-- 준회원 4: 최수아
UPDATE associates SET
  memo = '카카오 개발자. 활발한 성격. MBTI: ENFP. 관심도 높음.',
  distributed_at = registered_at + interval '2 days',
  last_contact_at = now() - interval '7 days'
WHERE name = '최수아';

-- 준회원 5~10: 일괄 업데이트
UPDATE associates SET
  distributed_at = registered_at + interval '2 days',
  last_contact_at = now() - interval '4 days'
WHERE distributed_at IS NULL;

UPDATE associates SET memo = '초기 상담 진행 중. 관심도 보통.' WHERE memo IS NULL;

-- ============================================
-- 테스트 데이터 보강 — 정회원 상세 필드 채우기
-- ============================================

-- 박서준 (1m00001)
UPDATE regulars SET
  smoking = '비흡연', drinking = '가끔', blood_type = 'A',
  position = '대리', hometown = '서울', child_care = '무',
  family_wealth = '10~30억', personal_wealth = '1~3억',
  real_estate = '아파트 1채', vehicle = '제네시스 G80',
  match_comment = '성격이 밝고 활발함. 외모 준수. 대화 능력 우수.',
  consult_comment = '적극적으로 참여 의향 있음. 주말 미팅 선호.',
  self_appeal = '성실하고 유머있는 성격. 요리와 운동을 좋아합니다.',
  last_contact_date = CURRENT_DATE - 3
WHERE member_id = '1m00001';

-- 김하늘 (1f00002)
UPDATE regulars SET
  smoking = '비흡연', drinking = '안함', blood_type = 'B',
  position = '변호사', hometown = '서울', child_care = '무',
  family_wealth = '30~50억', personal_wealth = '5~10억',
  real_estate = '아파트 2채', vehicle = 'BMW 5시리즈',
  match_comment = '지적이고 세련된 분위기. 전문직 선호 강함.',
  consult_comment = '매칭 결과에 만족도 높음. 빠른 결혼 희망.',
  self_appeal = '법률 전문가. 독서와 와인을 좋아합니다.',
  last_contact_date = CURRENT_DATE - 2
WHERE member_id = '1f00002';

-- 이정훈 (7m00003)
UPDATE regulars SET
  smoking = '비흡연', drinking = '보통', blood_type = 'O',
  position = '차장', hometown = '부산', child_care = '무',
  family_wealth = '50~100억', personal_wealth = '5~10억',
  real_estate = '아파트 1채', vehicle = '벤츠 E클래스',
  match_comment = '진지한 성향. 재력 우수. 외모 관리 잘함.',
  consult_comment = '시간 조율이 까다로운 편. 평일 저녁 선호.',
  self_appeal = '금융 전문가. 와인과 골프를 즐깁니다.',
  last_contact_date = CURRENT_DATE - 5
WHERE member_id = '7m00003';

-- 한유진 (2f00004)
UPDATE regulars SET
  smoking = '비흡연', drinking = '가끔', blood_type = 'AB',
  position = '교사', hometown = '부산', child_care = '무',
  family_wealth = '5~10억', personal_wealth = '1~3억',
  real_estate = '오피스텔 1채', vehicle = '국산차',
  match_comment = '차분하고 따뜻한 성격. 안정적인 직업.',
  consult_comment = '여유있게 진행 원함. 부산 거주 선호.',
  self_appeal = '아이들을 좋아하고 가정적인 성격입니다.',
  last_contact_date = CURRENT_DATE - 1
WHERE member_id = '2f00004';

-- 정민호 (1m00005)
UPDATE regulars SET
  smoking = '비흡연', drinking = '안함', blood_type = 'A',
  position = '선임연구원', hometown = '서울', child_care = '무',
  family_wealth = '10~30억', personal_wealth = '3~5억',
  real_estate = '아파트 1채', vehicle = '테슬라 모델3',
  match_comment = '조용한 편이나 대화 시 깊이 있음. 지적.',
  consult_comment = '적극적으로 참여 의향 있음. 연구소 일정 고려.',
  self_appeal = '과학자. 클래식 음악과 등산을 좋아합니다.',
  last_contact_date = CURRENT_DATE - 4
WHERE member_id = '1m00005';

-- 서다인 (9f00006)
UPDATE regulars SET
  smoking = '비흡연', drinking = '가끔', blood_type = 'O',
  position = '시니어개발자', hometown = '인천', child_care = '무',
  family_wealth = '5~10억', personal_wealth = '3~5억',
  real_estate = '-', vehicle = '아우디 A4',
  match_comment = 'IT업계 종사. 논리적이고 독립적.',
  consult_comment = '빠른 결혼 희망. 수도권 거주 선호.',
  self_appeal = '개발자. 고양이 두마리와 함께 살고 있어요.',
  last_contact_date = CURRENT_DATE - 2
WHERE member_id = '9f00006';

-- 강준혁 (4m00007)
UPDATE regulars SET
  smoking = '가끔', drinking = '자주', blood_type = 'B',
  position = '대표', hometown = '대구', child_care = '전배우자',
  family_wealth = '50~100억', personal_wealth = '10억이상',
  real_estate = '아파트 2채', vehicle = '벤츠 S클래스',
  match_comment = '재력 우수. 재혼이지만 적극적. 자녀 1명(전배우자).',
  consult_comment = '주말 미팅만 가능. 대구/서울 모두 가능.',
  self_appeal = '사업가. 골프와 여행을 좋아합니다.',
  last_contact_date = CURRENT_DATE - 6
WHERE member_id = '4m00007';

-- 임소율 (8f00008)
UPDATE regulars SET
  smoking = '비흡연', drinking = '안함', blood_type = 'A',
  position = '프리랜서', hometown = '부산', child_care = '무',
  family_wealth = '1~5억', personal_wealth = '1억미만',
  real_estate = '-', vehicle = '-',
  match_comment = '밝고 긍정적. 예술적 감각 뛰어남.',
  consult_comment = '인증 서류 진행 중. 다음주 완료 예정.',
  self_appeal = '일러스트레이터. 카페와 전시회를 좋아해요.',
  last_contact_date = CURRENT_DATE - 3
WHERE member_id = '8f00008';

-- 오시환 (6m00009)
UPDATE regulars SET
  smoking = '비흡연', drinking = '보통', blood_type = 'AB',
  position = '수석연구원', hometown = '서울', child_care = '무',
  family_wealth = '30~50억', personal_wealth = '5~10억',
  real_estate = '아파트 1채', vehicle = '테슬라 모델Y',
  match_comment = '최우수 매칭 회원. 스펙 탑클래스. 미팅 8회.',
  consult_comment = '매칭 결과에 만족도 높음. 적극 참여.',
  self_appeal = '에너지 분야 연구자. 독서와 등산, 요리를 합니다.',
  last_contact_date = CURRENT_DATE - 1
WHERE member_id = '6m00009';

-- 조윤서 (3f00010)
UPDATE regulars SET
  smoking = '비흡연', drinking = '가끔', blood_type = 'O',
  position = '주무관', hometown = '대전', child_care = '무',
  family_wealth = '5~10억', personal_wealth = '1~3억',
  real_estate = '아파트 1채', vehicle = '국산차',
  match_comment = '안정적이고 성실함. 대전 거주 선호.',
  consult_comment = '활동 시작. 첫 미팅 대기 중.',
  self_appeal = '공무원. 안정적인 생활을 추구합니다.',
  last_contact_date = CURRENT_DATE - 2
WHERE member_id = '3f00010';

-- ============================================
-- 히스토리 데이터 추가 (더 풍성하게)
-- ============================================

-- 활동 회원들에 대한 미팅 히스토리
INSERT INTO member_history (member_id, member_type, category, content, detail, processor, date)
SELECT r.id, 'regular', '미팅', '1차 미팅 완료', '상대방 호감. 재미팅 의향 있음.', r.matching_manager,
       (r.join_date + interval '30 days')::timestamptz
FROM regulars r WHERE r.meeting_count >= 1;

INSERT INTO member_history (member_id, member_type, category, content, detail, processor, date)
SELECT r.id, 'regular', '미팅', '2차 미팅 완료', '양측 긍정적 반응. 교제 가능성 탐색.', r.matching_manager,
       (r.join_date + interval '50 days')::timestamptz
FROM regulars r WHERE r.meeting_count >= 2;

INSERT INTO member_history (member_id, member_type, category, content, detail, processor, date)
SELECT r.id, 'regular', '미팅', '3차 미팅 완료', '호감도 높음. 자연스러운 만남 진행 중.', r.matching_manager,
       (r.join_date + interval '70 days')::timestamptz
FROM regulars r WHERE r.meeting_count >= 3;

-- SMS 발송 이력
INSERT INTO member_history (member_id, member_type, category, content, detail, processor, date)
SELECT r.id, 'regular', 'SMS', '신규인사 문자 발송', r.program || ' 가입 환영 안내', '시스템', r.join_date::timestamptz
FROM regulars r;

-- 상담매니저 코멘트
INSERT INTO member_history (member_id, member_type, category, content, detail, processor, date)
SELECT r.id, 'regular', '상담매니저', r.consult_comment, '정기 상담 메모', r.consultant_manager,
       (r.join_date + interval '7 days')::timestamptz
FROM regulars r WHERE r.consult_comment IS NOT NULL AND r.consult_comment != '';

-- 매칭매니저 코멘트
INSERT INTO member_history (member_id, member_type, category, content, detail, processor, date)
SELECT r.id, 'regular', '매칭매니저', r.match_comment, '매칭 평가 메모', r.matching_manager,
       (r.join_date + interval '10 days')::timestamptz
FROM regulars r WHERE r.match_comment IS NOT NULL AND r.match_comment != '';

-- 서류 이력
INSERT INTO member_history (member_id, member_type, category, content, detail, processor, date)
SELECT r.id, 'regular', '서류', '재직증명서 제출 완료', '서류 인증 처리', '인포팀',
       (r.join_date + interval '5 days')::timestamptz
FROM regulars r;
