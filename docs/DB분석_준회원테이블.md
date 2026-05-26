# 준회원 테이블 분석 (기존 시스템)

> 원본 테이블: `[dbo].[associate_mem]` (DB: clubmember)
> 분석일: 2026-05-22
> 목적: 기존 → 신규 시스템 마이그레이션 기준 정리

---

## 1. 컬럼 현황 전체 (약 80개)

### 1.1 기본정보

| 컬럼명 | 정의 | 현재상태 | To-Be | 필수 | 비고 |
|--------|------|:--------:|:-----:|:----:|------|
| `uname` | 회원명 | 사용중 | Y | Y | ⭐ |
| `relation` | ? | ? | | | 모친/레이나 박 등 기준없는 데이터 존재 |
| `sex` | 성별 (1:남 2:여) | 사용중 | Y | | |
| `age` | 나이 | | Y | | |
| `birthday` | 생년월일 | | Y | | 준회원은 주민번호 입력불가 → 생년월일로 통일 |
| `married` | 결혼이부 (1:미혼 2:재혼) | 사용중 | Y | | |
| `live_local` | 지역코드 | | | | |

### 1.2 주민번호 (폐지 예정)

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `jumin1` | 주민번호 앞자리 | 사용중 | **N** | 준회원은 주민번호 정보 입력불가 / 생년월일로 통일 |
| `jumin2` | 주민번호 뒷자리 | 사용중 | **N** | 동일 |
| `jumin_ok` | 주민번호 체크 | | **N** | |

### 1.3 일자 관련

| 컬럼명 | 정의 | 현재상태 | To-Be | 필수 | 비고 |
|--------|------|:--------:|:-----:|:----:|------|
| `find_date` | 등록일 | 사용중 | Y | Y | |
| `input_date` | 분배일 | 사용중 | Y | Y | |
| `reg_date` | ? | NULL | - | - | 미사용 |
| `last_counsel` | 최종상담일 | | Y | | |
| `last_update` | 최종업데이트 | | Y | | |
| `last_stop` | ?? | | ? | | 용도 불명 |

### 1.4 상담/매니저

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `course` | 상담매니저? | | ? | |
| `tel_course` | ? | | ? | |
| `course_coop` | ?(100?) | | ? | |
| `course_code` | ? | | ? | |
| `counselor` | ?? | | ? | |
| `counselor_tm` | ? | | ? | |

### 1.5 회원 상태

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `state` | 회원상태 | | ? | |
| `mem_state` | ?? | | ? | state와 역할 구분 필요 |

### 1.6 학력/직업

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `school` | 학력 | | Y | ⚠️ **학력으로 변경예정** — 현재 자유입력 데이터, 드롭다운 13개 옵션으로 정형화 필요 |
| `school_name` | 학교명 | | Y | |
| `office` | | | | |
| `grade` | | | | |
| `job_sub` | | | | |
| `job_sub1` | | | | |
| `job_name` | | | | |
| `job_code_new` | 직장코드 | NULL | ? | 필요한가요? |

### 1.7 신체/기타

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `height` | 키 | | Y | |
| `weight` | 몸무게 | | Y | |
| `children` | 자녀 | 사용중 | Y | |
| `bloodtype` | 혈액형 | 사용중 | Y | |
| `hobby` | 취미 | 사용중 | Y | |
| `religion` | 종교 | 사용중 | Y | |
| `hope` | 희망사항 | | Y | |

### 1.8 연락처 (통합 예정)

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `tel_hand1` | 핸드폰 앞자리 | | Y | 🔀 **통합예정** (hand1+hand2+hand3 → phone) |
| `tel_hand2` | 핸드폰 중간자리 | | | |
| `tel_hand3` | 핸드폰 끝자리 | | | |
| `tel_home1` | 자택전화 | | Y | 🔀 **통합예정** (home1+home2+home3 → tel_home) |
| `tel_home2` | 자택전화 | | | |
| `tel_home3` | 자택전화 | | | |
| `tel_office1` | 직장전화 | | Y | 🔀 **통합예정** (office1+office2+office3 → tel_office) |
| `tel_office2` | 직장전화 | | | |
| `tel_office3` | 직장전화 | | | |
| `tel_eto1` | 핸드폰2 | | Y | 🔀 **통합예정** (eto1+eto2+eto3 → phone2) |
| `tel_eto2` | 핸드폰2 | | | |
| `tel_eto3` | 핸드폰2 | | | |
| `email` | 이메일 | | Y | |

### 1.9 주소

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `addr1` | 주소1 | | **N** | |
| `addr2` | 주소2 | | **N** | |
| `address` | 주소 | | | ⚠️ 주소이지만 회원상담이력(?)이 존재함 — 데이터 확인 필요 |

### 1.10 유입/경로

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `etc` | 유입경로 | | Y | |
| `gubun` | ? | | ? | |
| `rtype` | ? | | ? | |

### 1.11 외부 연동 / 레거시 (대부분 NULL → 폐지 후보)

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `last_entry` | ?? | NULL | N | |
| `sms` | ?? | NULL | N | |
| `mailing` | ?? | NULL | N | |
| `daks_idx` | ?? | NULL | N | |
| `lis_idx` | ?? | NULL | N | |
| `hellodaks_idx` | ?? | NULL | N | |
| `service_idx` | ?? | NULL | N | |
| `event_idx` | ?? | | ? | |
| `sms2` | ? | 사용중 | N | |
| `hp_relation` | ? | 사용중 | N | |
| `hp_relation2` | ? | 사용중 | N | |
| `rdates` | ? | NULL | N | |
| `reChk` | ? | NULL | N | |
| `mdName` | ? | NULL | N | |

### 1.12 분배/기타

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `associate_provide_idx` | 분배이력코드?? | | ? | 분배 테이블(FK) 연결 추정 |
| `wish_time` | 기타? | | ? | 기타라고 작성되어있는데 사용되는 항목인가요? |
| `other` | ?? | | | |

### 1.13 시스템 감사 (Audit)

| 컬럼명 | 정의 | 현재상태 | To-Be | 비고 |
|--------|------|:--------:|:-----:|------|
| `CREATE_USER` | ? | NULL | N | |
| `CREATE_DT` | ? | NULL | N | |
| `EDIT_USER` | ? | NULL | N | |
| `EDIT_DT` | ? | NULL | N | |
| `USE_YN` | ? | NULL | N | |
| `PAGE_ID` | ? | NULL | N | |

---

## 2. 마이그레이션 핵심 이슈

### 🔴 데이터 정형화 필요
| 항목 | 현재 | 신규 |
|------|------|------|
| 학력 (`school`) | 자유입력 ("OO대학졸업" 등) | 드롭다운 13개 옵션 |
| 성별 (`sex`) | 코드 (1:남 2:여) | 문자열 ("남"/"여") |
| 결혼 (`married`) | 코드 (1:미혼 2:재혼) | 문자열 ("초혼"/"재혼") |
| 주민번호 | jumin1 + jumin2 | **폐지** → birthday로 통일 |

### 🔴 컬럼 통합 필요 (전화번호)
| 현재 (3분할) | 신규 (통합) |
|-------------|-----------|
| tel_hand1 + tel_hand2 + tel_hand3 | `phone` (단일 필드) |
| tel_home1 + tel_home2 + tel_home3 | `tel_home` |
| tel_office1 + tel_office2 + tel_office3 | `tel_office` |
| tel_eto1 + tel_eto2 + tel_eto3 | `phone2` |

### 🟡 용도 불명 컬럼 (개발자 확인 필요)
- `relation` — 모친/레이나 박 등 기준없는 데이터
- `course` vs `counselor` — 상담매니저 중복?
- `state` vs `mem_state` — 상태 컬럼 2개, 역할 차이?
- `address` — 주소인데 회원상담이력이 들어있음
- `wish_time` — 기타라고 되어있는데 실제 사용?
- `associate_provide_idx` — 분배이력 FK?

### ⬜ NULL 컬럼 (폐지 후보: 약 20개)
`reg_date`, `last_entry`, `sms`, `mailing`, `daks_idx`, `lis_idx`, `hellodaks_idx`, `service_idx`, `rdates`, `reChk`, `mdName`, `CREATE_USER`, `CREATE_DT`, `EDIT_USER`, `EDIT_DT`, `USE_YN`, `PAGE_ID`

---

## 3. 신규 스키마 매핑 (To-Be 요약)

> 테이블명: `associate_mem` (기존과 동일)
> 원칙: **기존 컬럼명 유지**, 전화번호만 3분할→통합, 주민번호 폐지

| Supabase 컬럼 | 원본 컬럼 | 변환 |
|--------------|----------|------|
| `id` | (신규) | UUID |
| `uname` | `uname` | 그대로 |
| `sex` | `sex` | 1:남 2:여 → 텍스트('남'/'여')로 변경 |
| `age` | `age` | 그대로 |
| `birthday` | `birthday` | 날짜 포맷 통일 |
| `married` | `married` | 1:미혼 2:재혼 → 텍스트로 변경 |
| `tel_hand` | `tel_hand1`+`2`+`3` | 3분할 → 통합 |
| `tel_eto` | `tel_eto1`+`2`+`3` | 3분할 → 통합 |
| `tel_home` | `tel_home1`+`2`+`3` | 3분할 → 통합 |
| `tel_office` | `tel_office1`+`2`+`3` | 3분할 → 통합 |
| `email` | `email` | 그대로 |
| `live_local` | `live_local` | 그대로 |
| `school` | `school` | ⚠️ 자유입력→정형화 |
| `school_name` | `school_name` | 그대로 |
| `job_name` | `job_name` | 그대로 |
| `office` | `office` | 그대로 |
| `etc` | `etc` | 유입경로 |
| `state` | `state` | 그대로 |
| `course` | `course` | 담당매니저 |
| `find_date` | `find_date` | 등록일 |
| `input_date` | `input_date` | 분배일 |
| `last_counsel` | `last_counsel` | 최종상담일 |
| `height` | `height` | 그대로 |
| `weight` | `weight` | 그대로 |
| `bloodtype` | `bloodtype` | 그대로 |
| `children` | `children` | 그대로 |
| `religion` | `religion` | 그대로 |
| `hobby` | `hobby` | 그대로 |
| `hope` | `hope` | 그대로 |

