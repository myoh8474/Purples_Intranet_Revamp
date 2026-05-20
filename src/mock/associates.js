/* ========================================
   더미 데이터 — 준회원 (ES Module)
   Mock / Supabase 자동 전환 지원
   ======================================== */
import { Formatters } from '../utils/formatters.js';
import { useMock } from '../services/api.js';

const BRANCH_LIST = ['본사','경기','부산','대구','대전','광주'];
const BRANDS = ['퍼플스','디노블','르매리'];

function regionToBranch(region) {
  const map = {
    '서울': '본사', '인천': '본사', '경기': '경기', '강원': '경기',
    '부산': '부산', '울산': '부산', '경남': '부산',
    '대구': '대구', '경북': '대구',
    '대전': '대전', '세종': '대전', '충북': '대전', '충남': '대전',
    '광주': '광주', '전북': '광주', '전남': '광주', '제주': '광주',
  };
  return map[region] || '본사';
}

const CHANNELS = [
  '가입비견적','결혼테스트','글ON','구글커플','네이버예약','네이버커플',
  '기간만료(재컨텍)','기타','당근커플','렌딩-두두','무료맞선권','무료상담',
  '블라인드커플','사주궁합운세','실시간상담','이상형매칭','인스타리어',
  '자녀결혼','카카오커플','카카오톡','커플테스타','타겟팅','파티신청',
  'MBTI테스트','SNS기타','TV광고',
];
const ASSOC_STATUSES = ['컨텍전','부재중(미컨텍)','장기상담(컨텍)','낮음(컨텍)','보통(컨텍)','높음(컨텍)','가입보류(컨텍)','방문상담','가입중','변경','기간만료(재컨텍)'];
const CONSULTANT_LIST = ['이지연','김민희','박수정','최영미','한소영','정다은','서윤아','강미래','윤하나','오세은'];
const EDUCATIONS = ['고졸','전문대졸','대졸','석사','박사'];
const JOBS = ['회사원','공무원','전문직','자영업','프리랜서','교육직','의료직','금융직','IT/개발','연구직'];
const REGIONS = ['서울','부산','대구','광주','인천','대전','울산','경기','강원','세종','충북','충남','경북','경남','전북','전남','제주'];
const NAMES_M = ['김민준','이서준','박도윤','최하준','정우진','강건우','조현우','윤태민','임지호','한성민','송재원','오승현','배준서','류민재','남동현'];
const NAMES_F = ['김서연','이하은','박지유','최수아','정채원','강예린','조윤서','윤다인','임소율','한나윤','송하린','오서윤','배민지','류지안','남수빈'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomPhone() { return '010' + String(Math.floor(Math.random()*90000000)+10000000); }

/**
 * Supabase row → camelCase 변환
 */
function toCamel(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    gender: row.gender,
    birthDate: row.birth_date,
    age: row.birth_date ? Formatters.age(row.birth_date) : '',
    education: row.education,
    school: row.school,
    job: row.job,
    company: row.company,
    region: row.region,
    branch: row.branch,
    brand: row.brand,
    maritalStatus: row.marital_status,
    status: row.status,
    channel: row.channel,
    consultant: row.consultant,
    registeredAt: row.registered_at,
    distributedAt: row.distributed_at,
    lastContactAt: row.last_contact_at,
    memo: row.memo,
    duplicateEntries: [],
    contactHistory: [],
    sales: [],
  };
}

// ── 데이터 배열 생성 ──
export const MockAssociates = [];

if (useMock()) {
  // ── Mock 모드: 랜덤 데이터 생성 (기존 로직) ──
  for (let i = 0; i < 25; i++) {
    const gender = Math.random() > 0.45 ? '여' : '남';
    const names = gender === '남' ? NAMES_M : NAMES_F;
    const birth = randomDate(new Date(1985,0,1), new Date(2000,11,31));
    const regDate = randomDate(new Date(2025,6,1), new Date(2026,3,15));
    const distDate = new Date(regDate.getTime() + Math.random() * 3 * 86400000);
    const lastContact = new Date(distDate.getTime() + Math.random() * 30 * 86400000);
    const region = randomPick(REGIONS);
    MockAssociates.push({
      id: i + 1,
      name: randomPick(names),
      phone: randomPhone(),
      gender,
      birthDate: birth.toISOString(),
      age: Formatters.age(birth.toISOString()),
      education: randomPick(EDUCATIONS),
      school: randomPick(['서울대','연세대','고려대','성균관대','한양대','경희대','중앙대','건국대','이화여대','숙명여대']),
      job: randomPick(JOBS),
      company: randomPick(['삼성전자','LG전자','현대자동차','SK하이닉스','네이버','카카오','쿠팡','배민','토스','당근']),
      region,
      branch: regionToBranch(region),
      brand: randomPick(BRANDS),
      maritalStatus: Math.random() > 0.15 ? '초혼' : '재혼',
      status: randomPick(ASSOC_STATUSES.slice(0, 8)),
      channel: randomPick(CHANNELS),
      consultant: randomPick(CONSULTANT_LIST),
      registeredAt: regDate.toISOString(),
      distributedAt: distDate.toISOString(),
      lastContactAt: lastContact.toISOString(),
      duplicateEntries: [],
      contactHistory: [
        { date: lastContact.toISOString(), type: '통화', content: '초기 상담 진행. 관심도 높음.', result: '상담중' },
      ],
      sales: [],
    });
  }

  // ── 미분배 신규 유입 DB (소스외 테스트용 포함) ──
  const newDbBase = MockAssociates.length;
  const NEW_DB = [
    // 정상 분배 대기 (5건)
    { name: '김하늘', phone: '01033445566', gender: '여', birth: '1995-03-15', edu: '대졸', channel: '카카오커플', status: '컨텍전' },
    { name: '이준호', phone: '01044556677', gender: '남', birth: '1990-07-22', edu: '석사', channel: '네이버커플', status: '컨텍전' },
    { name: '박서현', phone: '01055667788', gender: '여', birth: '1993-11-08', edu: '전문대졸', channel: '인스타리어', status: '컨텍전' },
    { name: '정다윤', phone: '01066778899', gender: '여', birth: '1997-01-30', edu: '대졸', channel: 'MBTI테스트', status: '컨텍전' },
    { name: '강현우', phone: '01077889900', gender: '남', birth: '1988-09-12', edu: '대졸', channel: 'TV광고', status: '컨텍전' },
    // 소스외 대상 - 남성 고졸 (2건)
    { name: '조민수', phone: '01088990011', gender: '남', birth: '1992-05-20', edu: '고졸', channel: '무료상담', status: '컨텍전' },
    { name: '한동진', phone: '01099001122', gender: '남', birth: '1994-12-03', edu: '고졸', channel: '커플테스타', status: '컨텍전' },
    // 소스외 대상 - 65세 이상 (1건)
    { name: '김영수', phone: '01011223344', gender: '남', birth: '1958-04-10', edu: '대졸', channel: '자녀결혼', status: '컨텍전' },
    // 소스외 대상 - 19세 미만 (1건)
    { name: '최수진', phone: '01022334455', gender: '여', birth: '2009-08-25', edu: '고졸', channel: 'SNS기타', status: '컨텍전' },
    // 소스외 대상 - 전화번호 형식 오류 (1건)
    { name: '박진영', phone: '0201234', gender: '남', birth: '1991-06-15', edu: '대졸', channel: '기타', status: '컨텍전' },
    // 소스외 대상 - 중복 (기존 1번 회원과 동일 번호)
    { name: '김서연B', phone: MockAssociates[0]?.phone || '01012345678', gender: '여', birth: '1993-02-14', edu: '대졸', channel: '카카오톡', status: '컨텍전' },
    // 정상 분배 대기 추가 (4건)
    { name: '윤서영', phone: '01033557799', gender: '여', birth: '1996-04-18', edu: '대졸', channel: '블라인드커플', status: '컨텍전' },
    { name: '임태현', phone: '01044668800', gender: '남', birth: '1989-10-07', edu: '석사', channel: '실시간상담', status: '컨텍전' },
    { name: '송미래', phone: '01055779911', gender: '여', birth: '1994-07-22', edu: '전문대졸', channel: '이상형매칭', status: '컨텍전' },
    { name: '배성호', phone: '01066880022', gender: '남', birth: '1991-03-30', edu: '박사', channel: '가입비견적', status: '컨텍전' },
  ];

  NEW_DB.forEach((d, idx) => {
    const region = randomPick(REGIONS);
    MockAssociates.push({
      id: newDbBase + idx + 1,
      name: d.name,
      phone: d.phone,
      gender: d.gender,
      birthDate: d.birth + 'T00:00:00.000Z',
      age: Formatters.age(d.birth + 'T00:00:00.000Z'),
      education: d.edu,
      school: '-',
      job: '-',
      company: '-',
      region,
      branch: regionToBranch(region),
      brand: randomPick(BRANDS),
      maritalStatus: '초혼',
      status: d.status,
      channel: d.channel,
      consultant: '',    // 미분배
      registeredAt: new Date().toISOString(),
      distributedAt: '',
      lastContactAt: '',
      duplicateEntries: [],
      contactHistory: [],
      sales: [],
    });
  });
} else {
  // ── Supabase 모드: DB에서 데이터 로드 ──
  try {
    const { supabase } = await import('../services/supabase.js');

    const { data, error } = await supabase
      .from('associates')
      .select('*')
      .order('registered_at', { ascending: false });

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
