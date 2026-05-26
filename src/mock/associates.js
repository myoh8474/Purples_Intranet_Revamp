/* ========================================
   더미 데이터 — 준회원 (ES Module)
   Mock / Supabase 자동 전환 지원
   ======================================== */
import { Formatters } from '../utils/formatters.js';
import { useMock } from '../services/api.js';
import { CONSULTANTS, CONSULTANT_BRANCH, BRANCHES } from '../config/constants.js';

function regionToBranch(region) {
  const map = {
    '서울': '1', '인천': '1', '경기': '8', '강원': '8',
    '부산': '2', '울산': '2', '경남': '2',
    '대구': '4', '경북': '4',
    '대전': '3', '세종': '3', '충북': '3', '충남': '3',
    '광주': '5', '전북': '5', '전남': '5', '제주': '5',
  };
  return map[region] || '1';
}

const CHANNELS = [
  '카카오커플','네이버커플','구글커플','블라인드커플','실시간상담',
  '전화문의','지인소개','무료상담','커플테스타','이상형매칭',
  'MBTI테스트','인스타리어','가입비견적','SNS기타','TV광고',
  '당근커플','무료맞선권','자녀결혼','파티신청','타겟팅',
];
const EDUCATIONS = ['고졸','전문대졸','대졸','석사','박사'];
const JOBS = ['회사원','공무원','전문직','자영업','프리랜서','교육직','의료직','금융직','IT/개발','연구직'];
const REGIONS = ['서울','부산','대구','광주','인천','대전','울산','경기','강원','세종','충북','충남','경북','경남','전북','전남','제주'];
const BRANDS = ['퍼플스','디노블','르매리'];
const SCHOOLS = ['서울대','연세대','고려대','성균관대','한양대','경희대','중앙대','건국대','이화여대','숙명여대','서강대','홍익대','국민대','세종대','숭실대'];
const COMPANIES = ['삼성전자','LG전자','현대자동차','SK하이닉스','네이버','카카오','쿠팡','배달의민족','토스','당근','라인','NHN','한화','포스코','CJ'];
const BLOODS = ['A','B','O','AB'];
const RELIGIONS = ['무교','기독교','천주교','불교','기타'];
const HOBBIES = ['등산','독서','운동','영화','여행','요리','음악','골프','테니스','수영','카페탐방','사진'];

const NAMES_M = [
  '김민준','이서준','박도윤','최하준','정우진','강건우','조현우','윤태민','임지호','한성민',
  '송재원','오승현','배준서','류민재','남동현','신준혁','권태영','문성훈','양재혁','홍지훈',
];
const NAMES_F = [
  '김서연','이하은','박지유','최수아','정채원','강예린','조윤서','윤다인','임소율','한나윤',
  '송하린','오서윤','배민지','류지안','남수빈','신예나','권소희','문다현','양서진','홍유나',
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomPhone() { return '010' + String(Math.floor(Math.random()*90000000)+10000000); }

/**
 * Supabase row (associate_mem) → camelCase 변환
 * DB 컬럼명은 기존 시스템과 동일하게 유지
 */
function toCamel(row) {
  return {
    id: row.id,
    name: row.uname,                                       // DB: uname
    phone: row.tel_hand,                                   // DB: tel_hand (통합)
    phone2: row.tel_eto || '',                             // DB: tel_eto (통합)
    gender: row.sex,                                       // DB: sex
    birthDate: row.birthday,                               // DB: birthday
    age: row.birthday ? Formatters.age(row.birthday) : '', 
    education: row.school,                                 // DB: school (학력)
    school: row.school_name,                               // DB: school_name (학교명)
    job: row.job_name,                                     // DB: job_name
    company: row.office,                                   // DB: office
    region: row.live_local,                                // DB: live_local
    branch: row.branch,
    brand: row.brand,
    maritalStatus: row.married,                            // DB: married
    status: row.state,                                     // DB: state
    channel: row.etc,                                      // DB: etc (유입경로)
    consultant: row.course,                                // DB: course
    registeredAt: row.find_date,                           // DB: find_date
    distributedAt: row.input_date,                         // DB: input_date
    lastContactAt: row.last_counsel,                       // DB: last_counsel
    email: row.email || '',
    telHome: row.tel_home || '',
    telOffice: row.tel_office || '',
    height: row.height || 0,
    weight: row.weight || 0,
    bloodType: row.bloodtype || '',                         // DB: bloodtype
    children: row.children || '',
    religion: row.religion || '',
    hobby: row.hobby || '',
    hope: row.hope || '',
    memo: row.memo,
    duplicateEntries: [],
    contactHistory: [],
    sales: [],
  };
}

// ── 데이터 배열 생성 ──
export const MockAssociates = [];

if (useMock()) {
  const ASSOC_STATUSES = ['부재중(미컨텍)','장기상담(컨텍)','낮음(컨텍)','보통(컨텍)','높음(컨텍)','가입보류(컨텍)','방문상담','가입중'];
  let idSeq = 1;

  // ========================================
  // 1. 분배 완료 회원 (30명) — 각 매니저에 3명씩 배정
  // ========================================
  CONSULTANTS.forEach((mgr, mIdx) => {
    for (let j = 0; j < 3; j++) {
      const gender = Math.random() > 0.45 ? '여' : '남';
      const names = gender === '남' ? NAMES_M : NAMES_F;
      const birth = randomDate(new Date(1985,0,1), new Date(2000,11,31));
      const regDate = randomDate(new Date(2025,10,1), new Date(2026,3,15));
      const distDate = new Date(regDate.getTime() + Math.random() * 3 * 86400000);
      const lastContact = new Date(distDate.getTime() + Math.random() * 30 * 86400000);
      const region = randomPick(REGIONS);
      MockAssociates.push({
        id: idSeq++,
        name: randomPick(names),
        phone: randomPhone(),
        gender,
        birthDate: birth.toISOString(),
        age: Formatters.age(birth.toISOString()),
        education: randomPick(EDUCATIONS.slice(2)), // 대졸 이상
        school: randomPick(SCHOOLS),
        job: randomPick(JOBS),
        company: randomPick(COMPANIES),
        region,
        branch: regionToBranch(region),
        brand: randomPick(BRANDS),
        maritalStatus: Math.random() > 0.15 ? '초혼' : '재혼',
        status: randomPick(ASSOC_STATUSES),
        channel: randomPick(CHANNELS.slice(0, 10)),
        consultant: mgr,
        registeredAt: regDate.toISOString(),
        distributedAt: distDate.toISOString(),
        lastContactAt: lastContact.toISOString(),
        // 신체/기타
        height: gender === '남' ? (170 + Math.floor(Math.random() * 15)) : (155 + Math.floor(Math.random() * 15)),
        weight: gender === '남' ? (65 + Math.floor(Math.random() * 20)) : (45 + Math.floor(Math.random() * 15)),
        bloodType: randomPick(BLOODS),
        children: Math.random() > 0.85 ? '있음' : '없음',
        religion: randomPick(RELIGIONS),
        hobby: randomPick(HOBBIES),
        hope: '',
        // 연락처 확장
        email: '',
        telHome: '',
        telOffice: '',
        phone2: '',
        duplicateEntries: [],
        contactHistory: [
          { date: lastContact.toISOString(), type: '통화', content: '초기 상담 진행.', result: '상담중' },
        ],
        sales: [],
      });
    }
  });

  // ========================================
  // 2. 미분배 신규 유입 DB (15명) — 분배 대기
  // ========================================
  const NEW_DB = [
    { name: '김하늘', phone: '01033445566', gender: '여', birth: '1995-03-15', edu: '대졸', channel: '카카오커플' },
    { name: '이준호', phone: '01044556677', gender: '남', birth: '1990-07-22', edu: '석사', channel: '네이버커플' },
    { name: '박서현', phone: '01055667788', gender: '여', birth: '1993-11-08', edu: '전문대졸', channel: '인스타리어' },
    { name: '정다윤', phone: '01066778899', gender: '여', birth: '1997-01-30', edu: '대졸', channel: 'MBTI테스트' },
    { name: '강현우', phone: '01077889900', gender: '남', birth: '1988-09-12', edu: '대졸', channel: 'TV광고' },
    { name: '윤서영', phone: '01033557799', gender: '여', birth: '1996-04-18', edu: '대졸', channel: '블라인드커플' },
    { name: '임태현', phone: '01044668800', gender: '남', birth: '1989-10-07', edu: '석사', channel: '실시간상담' },
    { name: '송미래', phone: '01055779911', gender: '여', birth: '1994-07-22', edu: '전문대졸', channel: '이상형매칭' },
    { name: '배성호', phone: '01066880022', gender: '남', birth: '1991-03-30', edu: '박사', channel: '가입비견적' },
    { name: '문하영', phone: '01077991133', gender: '여', birth: '1998-06-11', edu: '대졸', channel: '구글커플' },
    { name: '양동규', phone: '01088002244', gender: '남', birth: '1992-02-28', edu: '대졸', channel: '전화문의' },
    { name: '홍수진', phone: '01099113355', gender: '여', birth: '1995-09-03', edu: '대졸', channel: '지인소개' },
    { name: '신재민', phone: '01011224466', gender: '남', birth: '1993-12-20', edu: '석사', channel: '커플테스타' },
    { name: '권예슬', phone: '01022335577', gender: '여', birth: '1996-08-07', edu: '대졸', channel: '당근커플' },
    { name: '류건호', phone: '01033446688', gender: '남', birth: '1990-05-14', edu: '대졸', channel: '무료맞선권' },
  ];
  NEW_DB.forEach(d => {
    const region = randomPick(REGIONS);
    MockAssociates.push({
      id: idSeq++,
      name: d.name, phone: d.phone, gender: d.gender,
      birthDate: d.birth + 'T00:00:00.000Z',
      age: Formatters.age(d.birth + 'T00:00:00.000Z'),
      education: d.edu, school: '-', job: '-', company: '-',
      region, branch: regionToBranch(region), brand: randomPick(BRANDS),
      maritalStatus: '초혼', status: '컨텍전', channel: d.channel,
      consultant: '', registeredAt: new Date().toISOString(),
      distributedAt: '', lastContactAt: '',
      height: d.gender === '남' ? (170 + Math.floor(Math.random() * 15)) : (155 + Math.floor(Math.random() * 15)),
      weight: d.gender === '남' ? (65 + Math.floor(Math.random() * 20)) : (45 + Math.floor(Math.random() * 15)),
      bloodType: randomPick(BLOODS), children: '없음', religion: randomPick(RELIGIONS),
      hobby: randomPick(HOBBIES), hope: '', email: '', telHome: '', telOffice: '', phone2: '',
      duplicateEntries: [], contactHistory: [], sales: [],
    });
  });

  // ========================================
  // 3. 소스외 대상 (4명) — 전화번호 오류, 연령 초과 등
  // ========================================
  const SOURCEOUT = [
    { name: '조민수', phone: '01088990011', gender: '남', birth: '1992-05-20', edu: '고졸', channel: '무료상담' },
    { name: '한동진', phone: '01099001122', gender: '남', birth: '1994-12-03', edu: '고졸', channel: '커플테스타' },
    { name: '김영수', phone: '01011223344', gender: '남', birth: '1958-04-10', edu: '대졸', channel: '자녀결혼' },
    { name: '박진영', phone: '0201234', gender: '남', birth: '1991-06-15', edu: '대졸', channel: '기타' },
  ];
  SOURCEOUT.forEach(d => {
    const region = randomPick(REGIONS);
    MockAssociates.push({
      id: idSeq++,
      name: d.name, phone: d.phone, gender: d.gender,
      birthDate: d.birth + 'T00:00:00.000Z',
      age: Formatters.age(d.birth + 'T00:00:00.000Z'),
      education: d.edu, school: '-', job: '-', company: '-',
      region, branch: regionToBranch(region), brand: randomPick(BRANDS),
      maritalStatus: '초혼', status: '컨텍전', channel: d.channel,
      consultant: '', registeredAt: new Date().toISOString(),
      distributedAt: '', lastContactAt: '',
      height: 0, weight: 0, bloodType: '', children: '', religion: '', hobby: '', hope: '',
      email: '', telHome: '', telOffice: '', phone2: '',
      duplicateEntries: [], contactHistory: [], sales: [],
    });
  });

  // ========================================
  // 4. 중복 회원 (2명) — 기존 회원과 동일 번호
  // ========================================
  const DUP = [
    { name: '김서연B', phone: MockAssociates[0]?.phone || '01012345678', gender: '여', birth: '1993-02-14', edu: '대졸', channel: '카카오톡' },
    { name: '최수아B', phone: MockAssociates[1]?.phone || '01098765432', gender: '여', birth: '1995-07-19', edu: '대졸', channel: '네이버커플' },
  ];
  DUP.forEach(d => {
    const region = randomPick(REGIONS);
    MockAssociates.push({
      id: idSeq++,
      name: d.name, phone: d.phone, gender: d.gender,
      birthDate: d.birth + 'T00:00:00.000Z',
      age: Formatters.age(d.birth + 'T00:00:00.000Z'),
      education: d.edu, school: '-', job: '-', company: '-',
      region, branch: regionToBranch(region), brand: randomPick(BRANDS),
      maritalStatus: '초혼', status: '컨텍전', channel: d.channel,
      consultant: '', registeredAt: new Date().toISOString(),
      distributedAt: '', lastContactAt: '',
      height: 0, weight: 0, bloodType: '', children: '', religion: '', hobby: '', hope: '',
      email: '', telHome: '', telOffice: '', phone2: '',
      duplicateEntries: [], contactHistory: [], sales: [],
    });
  });

  // ========================================
  // 5. 재컨텍 대상 (5명) — 기간만료 후 재유입
  // ========================================
  const RECONTACT = [
    { name: '장윤정', phone: '01077112233', gender: '여', birth: '1991-08-14', edu: '대졸', pastMgr: '김지은', pastProgram: '실버(에메랄드)', meetings: 5, totalPay: 3500000, claim: false },
    { name: '오동현', phone: '01088223344', gender: '남', birth: '1987-02-28', edu: '석사', pastMgr: '정민수', pastProgram: '골드(사파이어)', meetings: 8, totalPay: 5800000, claim: true },
    { name: '한지민', phone: '01099334455', gender: '여', birth: '1993-12-05', edu: '대졸', pastMgr: '최유리', pastProgram: '브론즈', meetings: 2, totalPay: 1200000, claim: false },
    { name: '신동욱', phone: '01011445566', gender: '남', birth: '1989-06-17', edu: '박사', pastMgr: '한소희', pastProgram: '플래티늄(루비)', meetings: 12, totalPay: 9500000, claim: false },
    { name: '류하영', phone: '01022556677', gender: '여', birth: '1995-10-22', edu: '전문대졸', pastMgr: '강다연', pastProgram: '전문직', meetings: 3, totalPay: 2000000, claim: true },
  ];
  RECONTACT.forEach(d => {
    const region = randomPick(REGIONS);
    MockAssociates.push({
      id: idSeq++,
      name: d.name, phone: d.phone, gender: d.gender,
      birthDate: d.birth + 'T00:00:00.000Z',
      age: Formatters.age(d.birth + 'T00:00:00.000Z'),
      education: d.edu, school: '-', job: '-', company: '-',
      region, branch: regionToBranch(region), brand: randomPick(BRANDS),
      maritalStatus: '초혼', status: '컨텍전',
      channel: '기간만료(재컨텍)',
      consultant: '', registeredAt: new Date().toISOString(),
      distributedAt: '', lastContactAt: '',
      height: d.gender === '남' ? (170 + Math.floor(Math.random() * 15)) : (155 + Math.floor(Math.random() * 15)),
      weight: d.gender === '남' ? (65 + Math.floor(Math.random() * 20)) : (45 + Math.floor(Math.random() * 15)),
      bloodType: randomPick(BLOODS), children: '없음', religion: randomPick(RELIGIONS),
      hobby: randomPick(HOBBIES), hope: '', email: '', telHome: '', telOffice: '', phone2: '',
      pastConsultant: d.pastMgr,
      pastProgram: d.pastProgram,
      pastMeetings: d.meetings,
      pastTotalPayment: d.totalPay,
      pastClaim: d.claim,
      duplicateEntries: [], contactHistory: [], sales: [],
    });
  });

  console.log(`[Mock] 더미 데이터 ${MockAssociates.length}명 생성 완료`);

  // ── localStorage에서 분배 변경 내역 복원 ──
  try {
    const saved = JSON.parse(localStorage.getItem('purples_dist_changes') || '{}');
    Object.entries(saved).forEach(([id, changes]) => {
      const m = MockAssociates.find(a => a.id === parseInt(id));
      if (m) Object.assign(m, changes);
    });
    if (Object.keys(saved).length > 0) {
      console.log(`[Mock] localStorage에서 분배 변경 ${Object.keys(saved).length}건 복원`);
    }
  } catch(e) {}

} else {
  // ── Supabase 모드: DB에서 데이터 로드 ──
  try {
    const { supabase } = await import('../services/supabase.js');

    const { data, error } = await supabase
      .from('associate_mem')
      .select('*')
      .order('find_date', { ascending: false });

    if (!error && data) {
      data.forEach(row => MockAssociates.push(toCamel(row)));
      console.log(`[Associates] Supabase에서 ${data.length}건 로드 완료`);
    } else {
      console.error('[Associates] Supabase 로드 실패:', error);
    }
  } catch (e) {
    console.error('[Associates] Supabase 연결 오류:', e);
  }
}

/**
 * 회원 데이터 변경 시 localStorage에 저장 (페이지 간 동기화)
 * @param {number} memberId
 * @param {object} changes - { consultant, status, ... }
 */
export function saveMemberChange(memberId, changes) {
  try {
    const saved = JSON.parse(localStorage.getItem('purples_dist_changes') || '{}');
    saved[memberId] = { ...(saved[memberId] || {}), ...changes };
    localStorage.setItem('purples_dist_changes', JSON.stringify(saved));
  } catch(e) {}
}

