-- ============================================
-- 퍼플스 인트라넷 — Supabase 테이블 생성 SQL
-- 대상: 준회원(associates) + 정회원(regulars) + 히스토리(member_history)
-- Supabase 대시보드 > SQL Editor 에서 실행
-- ============================================

-- ============================================
-- 1. 준회원 테이블
-- ============================================
CREATE TABLE associates (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text NOT NULL,
  phone         text NOT NULL,
  gender        text CHECK (gender IN ('남','여')),
  birth_date    date,
  education     text,
  school        text,
  job           text,
  company       text,
  region        text,
  branch        text,
  brand         text DEFAULT '퍼플스',
  marital_status text DEFAULT '초혼',
  status        text DEFAULT '컨텍전',
  channel       text,
  consultant    text,
  registered_at timestamptz DEFAULT now(),
  distributed_at timestamptz,
  last_contact_at timestamptz,
  memo          text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- 검색 성능용 인덱스
CREATE INDEX idx_associates_status ON associates(status);
CREATE INDEX idx_associates_branch ON associates(branch);
CREATE INDEX idx_associates_phone ON associates(phone);

-- ============================================
-- 2. 정회원 테이블
-- ============================================
CREATE TABLE regulars (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id             text UNIQUE NOT NULL,  -- 전산 아이디 (1m00001 등)
  name                  text NOT NULL,
  phone                 text,
  email                 text,
  gender                text CHECK (gender IN ('남','여')),
  birth_date            date,
  brand                 text DEFAULT '퍼플스',
  branch                text,
  education             text,
  school                text,
  job                   text,
  company               text,
  region                text,
  religion              text,
  height                int,
  weight                int,
  marital_history       text DEFAULT '미혼',
  income                text,
  blood_type            text,
  smoking               text,
  drinking              text,
  position              text,
  child_care            text DEFAULT '무',
  hometown              text,
  overseas              text DEFAULT '없음',
  residence_flexible    boolean DEFAULT false,
  job_flexible          boolean DEFAULT false,
  family_wealth         text,
  personal_wealth       text,
  real_estate           text,
  vehicle               text,
  -- 프로그램/계약
  program               text,
  contract_type         text,
  contract_count        int,
  esign_complete        boolean DEFAULT false,
  program_fee           bigint DEFAULT 0,
  marriage_fee          bigint DEFAULT 0,
  rejoin_count          int DEFAULT 1,
  rejoin_fee            bigint DEFAULT 0,
  -- 상태/매니저
  status                text DEFAULT '신규',
  consultant_manager    text,
  matching_manager      text,
  meeting_count         int DEFAULT 0,
  last_meeting_date     date,
  last_contact_date     date,
  join_date             date,
  expiry_date           date,
  expiry_status         text DEFAULT '없음',
  doc_reauth            boolean DEFAULT false,
  marriage_confirm      text DEFAULT '확인전',
  difficult_match       boolean DEFAULT false,
  -- 금액
  total_contract_amount bigint DEFAULT 0,
  paid_amount           bigint DEFAULT 0,
  balance               bigint DEFAULT 0,
  unpaid_reason         text,
  -- 선호 조건 (JSON으로 유연하게)
  preferences           jsonb DEFAULT '{}',
  -- 매칭 코멘트
  match_comment         text,
  consult_comment       text,
  self_appeal           text,
  -- 시스템
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX idx_regulars_member_id ON regulars(member_id);
CREATE INDEX idx_regulars_status ON regulars(status);
CREATE INDEX idx_regulars_branch ON regulars(branch);
CREATE INDEX idx_regulars_brand ON regulars(brand);

-- ============================================
-- 3. 통합 히스토리 테이블
-- ============================================
CREATE TABLE member_history (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id     uuid NOT NULL,
  member_type   text NOT NULL CHECK (member_type IN ('associate','regular')),
  category      text NOT NULL,
  content       text,
  detail        text,
  processor     text,
  date          timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_history_member ON member_history(member_id, member_type);
CREATE INDEX idx_history_category ON member_history(category);
CREATE INDEX idx_history_date ON member_history(date);

-- ============================================
-- 4. 결제 테이블 (정회원 결제 이력)
-- ============================================
CREATE TABLE payments (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  regular_id    uuid REFERENCES regulars(id) ON DELETE CASCADE,
  payment_no    int,
  date          timestamptz,
  method        text,
  amount        bigint DEFAULT 0,
  category      text,
  status        text DEFAULT '완료',
  note          text,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_payments_regular ON payments(regular_id);

-- ============================================
-- 5. updated_at 자동 갱신 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_associates_updated
  BEFORE UPDATE ON associates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_regulars_updated
  BEFORE UPDATE ON regulars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. RLS (Row Level Security) — 일단 비활성
--    추후 인증 시스템 추가 시 활성화
-- ============================================
-- ALTER TABLE associates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE regulars ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE member_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. 테스트 데이터 삽입 — 준회원 10건
-- ============================================
INSERT INTO associates (name, phone, gender, birth_date, education, school, job, company, region, branch, brand, marital_status, status, channel, consultant) VALUES
('김민준', '01012345678', '남', '1992-03-15', '대졸', '연세대', '회사원', '삼성전자', '서울', '본사', '퍼플스', '초혼', '컨텍전', '네이버커플', '이지연'),
('이서연', '01023456789', '여', '1994-07-22', '석사', '고려대', '전문직', '네이버', '경기', '경기', '퍼플스', '초혼', '부재중(미컨텍)', '카카오커플', '김민희'),
('박도윤', '01034567890', '남', '1990-11-08', '대졸', '한양대', '금융직', 'KB은행', '서울', '본사', '디노블', '초혼', '높음(컨텍)', '가입비견적', '박수정'),
('최수아', '01045678901', '여', '1993-05-30', '대졸', '이화여대', 'IT/개발', '카카오', '서울', '본사', '퍼플스', '초혼', '방문상담', '무료상담', '최영미'),
('정우진', '01056789012', '남', '1988-09-12', '박사', '서울대', '연구직', 'KAIST', '대전', '대전', '퍼플스', '초혼', '장기상담(컨텍)', 'TV광고', '한소영'),
('강예린', '01067890123', '여', '1995-01-25', '대졸', '성균관대', '교육직', '서울시교육청', '서울', '본사', '르매리', '초혼', '컨텍전', '결혼테스트', '정다은'),
('조현우', '01078901234', '남', '1991-06-18', '대졸', '경희대', '자영업', '개인사업', '부산', '부산', '퍼플스', '재혼', '가입보류(컨텍)', '당근커플', '서윤아'),
('윤다인', '01089012345', '여', '1996-12-03', '전문대졸', '한양대', '프리랜서', '프리랜서', '대구', '대구', '퍼플스', '초혼', '보통(컨텍)', '인스타리어', '강미래'),
('한성민', '01090123456', '남', '1987-04-20', '석사', '연세대', '의료직', '서울아산병원', '서울', '본사', '디노블', '초혼', '가입중', 'MBTI테스트', '윤하나'),
('송하린', '01001234567', '여', '1994-08-14', '대졸', '중앙대', '공무원', '행정안전부', '세종', '대전', '퍼플스', '초혼', '낮음(컨텍)', 'SNS기타', '오세은');

-- ============================================
-- 8. 테스트 데이터 삽입 — 정회원 10건
-- ============================================
INSERT INTO regulars (member_id, name, phone, email, gender, birth_date, brand, branch, education, school, job, company, region, religion, height, weight, marital_history, income, program, contract_type, contract_count, program_fee, marriage_fee, status, consultant_manager, matching_manager, meeting_count, join_date, expiry_date, total_contract_amount, paid_amount, balance, preferences) VALUES
('1m00001', '박서준', '01011112222', 'park1@gmail.com', '남', '1990-05-12', '퍼플스', '퍼플스본사', '대졸', '연세대', '회사원', '삼성전자', '서울', '무교', 178, 75, '미혼', '7천만원', 'Purple A', '횟수제', 12, 15000000, 3000000, '활동', '이지연', '김태희', 3, '2025-08-01', '2026-08-01', 18000000, 15000000, 3000000, '{"preferAge":"28~35세","preferHeight":"160~170cm","preferEdu":"대졸 이상"}'),
('1f00002', '김하늘', '01022223333', 'kim2@naver.com', '여', '1993-09-20', '퍼플스', '퍼플스본사', '석사', '고려대', '전문직', '법률사무소', '서울', '기독교', 165, 52, '미혼', '1억', 'Purple S', '인증제', NULL, 20000000, 5000000, '활동', '김민희', '이수현', 5, '2025-06-15', '2026-06-15', 25000000, 25000000, 0, '{"preferAge":"30~38세","preferJob":"전문직"}'),
('7m00003', '이정훈', '01033334444', 'lee3@gmail.com', '남', '1988-02-28', '디노블', '디노블본사', '대졸', '한양대', '금융직', 'KB증권', '서울', '무교', 182, 80, '미혼', '1.5억', 'Denoble Premium', '횟수제', 8, 30000000, 5000000, '임시교제', '박수정', '박지영', 7, '2025-03-10', '2026-03-10', 35000000, 30000000, 5000000, '{"preferAge":"25~30세"}'),
('2f00004', '한유진', '01044445555', 'han4@kakao.com', '여', '1995-11-05', '퍼플스', '퍼플스부산', '대졸', '부산대', '교육직', '부산시교육청', '부산', '천주교', 162, 48, '미혼', '5천만원', 'Purple B', '기간제', NULL, 10000000, 2000000, '활동대기', '최영미', '최은별', 0, '2026-01-20', '2027-01-20', 12000000, 10000000, 2000000, '{}'),
('1m00005', '정민호', '01055556666', 'jung5@hanmail.net', '남', '1991-07-14', '퍼플스', '퍼플스본사', '석사', '서울대', '연구직', 'KIST', '서울', '무교', 175, 70, '미혼', '1억', 'Purple A', '횟수제', 10, 15000000, 3000000, '활동', '한소영', '김태희', 2, '2025-11-01', '2026-11-01', 18000000, 18000000, 0, '{"preferReligion":"무관","preferRegion":"수도권"}'),
('9f00006', '서다인', '01066667777', 'seo6@gmail.com', '여', '1994-03-18', '르매리', '르매리', '대졸', '이화여대', 'IT/개발', '네이버', '경기', '무교', 168, 55, '미혼', '7천만원', 'Le-Marie Classic', '인증제', NULL, 12000000, 3000000, '신규', '정다은', '정유리', 0, '2026-04-01', '2027-04-01', 15000000, 12000000, 3000000, '{}'),
('4m00007', '강준혁', '01077778888', 'kang7@naver.com', '남', '1987-12-25', '퍼플스', '퍼플스대구', '대졸', '경북대', '자영업', '개인사업', '대구', '불교', 180, 82, '재혼', '2억이상', 'Purple S', '횟수제', 6, 20000000, 5000000, '약정보류', '서윤아', '김태희', 4, '2025-05-20', '2026-05-20', 25000000, 20000000, 5000000, '{"preferMarital":"재혼가능"}'),
('8f00008', '임소율', '01088889999', 'lim8@kakao.com', '여', '1996-06-08', '디노블', '디노블부산', '전문대졸', '동의대', '프리랜서', '프리랜서', '부산', '기독교', 158, 45, '미혼', '3천만원', 'Denoble Basic', '기간제', NULL, 8000000, 2000000, '인증중', '강미래', '한서진', 0, '2026-03-15', '2027-03-15', 10000000, 8000000, 2000000, '{}'),
('6m00009', '오시환', '01099990000', 'oh9@gmail.com', '남', '1989-10-30', '퍼플스', '퍼플스경기', '박사', '카이스트', '연구직', 'LG에너지솔루션', '경기', '무교', 176, 73, '미혼', '1.5억', 'Purple Premium', '횟수제', 12, 25000000, 5000000, '활동', '윤하나', '서다현', 8, '2025-01-10', '2026-01-10', 30000000, 30000000, 0, '{"preferAge":"28~35세","preferEdu":"석사 이상"}'),
('3f00010', '조윤서', '01000001111', 'cho10@naver.com', '여', '1992-08-22', '퍼플스', '퍼플스대전', '대졸', '충남대', '공무원', '대전시청', '대전', '천주교', 164, 50, '미혼', '5천만원', 'Purple B', '횟수제', 8, 10000000, 2000000, '활동', '오세은', '강보라', 1, '2025-12-01', '2026-12-01', 12000000, 10000000, 2000000, '{"preferRegion":"대전"}');

-- 정회원 결제 데이터
INSERT INTO payments (regular_id, payment_no, date, method, amount, category, status, note)
SELECT r.id, 1, (r.join_date - interval '25 days')::timestamptz, '카드', r.paid_amount * 0.5, '준회원 가입금', '완료', '최초결제'
FROM regulars r;

INSERT INTO payments (regular_id, payment_no, date, method, amount, category, status, note)
SELECT r.id, 2, r.join_date::timestamptz, '계좌이체', r.paid_amount * 0.3, '정회원 전환금', '완료', '정회원 전환'
FROM regulars r;

-- 히스토리 데이터 (정회원 가입 이력)
INSERT INTO member_history (member_id, member_type, category, content, detail, processor, date)
SELECT r.id, 'regular', '상태변경', '- → 신규', '전산생성', '인포팀', r.join_date::timestamptz
FROM regulars r;

INSERT INTO member_history (member_id, member_type, category, content, detail, processor, date)
SELECT r.id, 'regular', '계약', '전자서명 계약 완료', r.program || ' 계약서 전자서명', r.consultant_manager, (r.join_date + interval '2 days')::timestamptz
FROM regulars r WHERE r.esign_complete = true;
