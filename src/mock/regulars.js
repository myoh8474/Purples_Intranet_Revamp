/* ========================================
   더미 데이터 — 정회원 (ES Module)
   ======================================== */
import { Formatters } from '../utils/formatters.js';
import { PROGRAMS_FLAT } from '../config/constants.js';

const BRANDS = ['퍼플스','디노블','르매리'];
const PROGRAMS = PROGRAMS_FLAT;
const REG_STATUSES = ['신규','인증중','활동대기','활동','활동','활동','활동','임시교제','교제','외부교제','약정보류','임시보류','장기보류','강제보류','약정만료','자동만료','만료','탈회진행','탈회','결혼예정','성혼'];
const MATCH_MANAGERS = ['김태희','이수현','박지영','최은별','한서진','정유리','서다현','강보라'];

// 매니저 소속 브랜드/지사 테이블 (PRD_브랜드매출관리 설계 기준)
const MANAGER_DATA = [
  { name: '김태희', branch: '퍼플스본사', brand: '퍼플스' },
  { name: '이수현', branch: '퍼플스본사', brand: '퍼플스' },
  { name: '박지영', branch: '디노블본사', brand: '디노블' },
  { name: '최은별', branch: '퍼플스부산', brand: '퍼플스' },
  { name: '한서진', branch: '디노블부산', brand: '디노블' },
  { name: '정유리', branch: '르매리',     brand: '르매리' },
  { name: '서다현', branch: '퍼플스경기', brand: '퍼플스' },
  { name: '강보라', branch: '퍼플스대전', brand: '퍼플스' },  // 대전 → 무조건 퍼플스
];

function getManagerBrand(name) {
  var mgr = MANAGER_DATA.find(function(m) { return m.name === name; });
  return mgr ? mgr.brand : '퍼플스';
}
const RELIGIONS = ['무교','기독교','천주교','불교','기타'];
const CONSULTANTS = ['이지연','김민희','박수정','최영미','한소영','정다은','서윤아','강미래','윤하나','오세은'];
const EDUCATIONS = ['고졸','전문대졸','대졸','석사','박사'];
const JOBS = ['회사원','공무원','전문직','자영업','프리랜서','교육직','의료직','금융직','IT/개발','연구직'];
const REGIONS = ['서울','부산','대구','광주','인천','대전','울산','경기','강원','세종','충북','충남','경북','경남','전북','전남','제주'];
const BRANCHES = ['퍼플스본사','퍼플스부산','퍼플스대전','퍼플스대구','퍼플스광주','퍼플스경기','디노블본사','디노블부산','르매리'];

// 지사코드 매핑 (1~9)
const BRANCH_CODE_MAP = {
  '퍼플스본사': '1', '퍼플스부산': '2', '퍼플스대전': '3', '퍼플스대구': '4',
  '퍼플스광주': '5', '퍼플스경기': '6', '디노블본사': '7', '디노블부산': '8', '르매리': '9',
};
// 지사 → 브랜드
const BRANCH_BRAND_MAP = {
  '퍼플스본사': '퍼플스', '퍼플스부산': '퍼플스', '퍼플스대전': '퍼플스', '퍼플스대구': '퍼플스',
  '퍼플스광주': '퍼플스', '퍼플스경기': '퍼플스', '디노블본사': '디노블', '디노블부산': '디노블', '르매리': '르매리',
};

const NAMES_M = ['박서준','이정훈','정민호','한성민','김도현','강준혁','오시환','윤태민','조현우','송재원','배준서','류민재','남동현','임지호','권세진','김하늘','한유진'];
const NAMES_F = ['김하늘','최수아','한유진','조윤서','서다인','강예린','임소율','한나윤','박지유','송하린','오서윤','배민지','류지안','남수빈','정채원','박서준','김하늘'];
const SCHOOLS = ['서울대','연세대','고려대','성균관대','한양대','경희대','이화여대','숙명여대','중앙대','건국대'];
const COMPANIES = ['삼성전자','LG전자','현대자동차','네이버','카카오','쿠팡','토스','당근','라인','배민'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomPhone() { return '010' + String(Math.floor(Math.random()*90000000)+10000000); }

export { BRANDS, PROGRAMS, MATCH_MANAGERS, MANAGER_DATA, getManagerBrand, REGIONS, BRANCHES, CONSULTANTS };

export const MockRegulars = [];
for (let i = 0; i < 30; i++) {
  const gender = Math.random() > 0.45 ? '여' : '남';
  const names = gender === '남' ? NAMES_M : NAMES_F;
  const birth = randomDate(new Date(1984,0,1), new Date(1999,11,31));
  const joinDate = randomDate(new Date(2024,0,1), new Date(2026,2,15));
  const branch = randomPick(BRANCHES);
  const branchCode = BRANCH_CODE_MAP[branch];
  const genderCode = gender === '남' ? 'm' : 'f';
  const memberId = branchCode + genderCode + String(i + 1).padStart(5,'0');
  const brand = BRANCH_BRAND_MAP[branch];
  const status = randomPick(REG_STATUSES);
  const meetingCount = Math.floor(Math.random() * 12);
  const lastMeeting = meetingCount > 0 ? randomDate(new Date(2025,6,1), new Date(2026,3,10)) : null;
  const rc = randomPick([1,1,1,1,1,2,2,3,4,5,6]);
  const ct = randomPick(['인증제','횟수제','기간제']);

  // 결제 배열 미리 생성
  const totalContract = Math.floor(Math.random() * 5000000) + 5000000;
  const firstPay = Math.floor(totalContract * 0.5);
  const payArr = [
    { no: 1, date: new Date(joinDate.getTime() - 25*86400000).toISOString(), method: randomPick(['카드','현금','계좌이체']), amount: firstPay, category: '준회원 가입금', status: '완료', note: '최초결제' },
  ];
  if (Math.random() > 0.3) {
    payArr.push({ no: 2, date: joinDate.toISOString(), method: randomPick(['카드','현금','계좌이체']), amount: Math.floor(totalContract * 0.3), category: '정회원 전환금', status: '완료', note: '정회원 전환' });
  }
  if (Math.random() > 0.5) {
    payArr.push({ no: payArr.length + 1, date: new Date(joinDate.getTime() + 60*86400000).toISOString(), method: randomPick(['카드','현금','계좌이체']), amount: Math.floor(totalContract * 0.2), category: '잔금', status: randomPick(['완료','완료','미납']), note: randomPick(['잔금 완납','2차 잔금','-']) });
  }
  const paid = payArr.filter(function(p) { return p.status === '완료'; }).reduce(function(s, p) { return s + p.amount; }, 0);

  MockRegulars.push({
    id: i + 1,
    memberId: memberId,
    name: randomPick(names),
    phone: randomPhone(),
    email: randomPick(['user','member','info','hello','contact']) + (i+1) + '@' + randomPick(['gmail.com','naver.com','kakao.com','hanmail.net']),
    gender: gender,
    birthDate: birth.toISOString(),
    age: Formatters.age(birth.toISOString()),
    photo: (function() {
      var cnt = Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0;
      if (cnt === 0) return null;
      var colors = gender === '남' ? ['4f7cff','3b5cc6','5b8def','2d4ea0','6a9bff'] : ['f472b6','d946a8','f9a8d4','c026a3','fbb6ce'];
      var n = randomPick(names);
      return Array.from({length: cnt}, function(_, j) { return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(n) + '&size=200&background=' + colors[j] + '&color=fff&bold=true&font-size=0.4'; });
    })(),
    brand: brand,
    branch: branch,
    education: randomPick(EDUCATIONS),
    school: randomPick(SCHOOLS),
    job: randomPick(JOBS),
    company: randomPick(COMPANIES),
    region: randomPick(REGIONS),
    religion: randomPick(RELIGIONS),
    height: gender === '남' ? Math.floor(170 + Math.random() * 18) : Math.floor(155 + Math.random() * 16),
    maritalHistory: randomPick(['미혼','미혼','미혼','미혼','재혼','사별','사실혼','삼혼이상']),
    difficultMatch: Math.random() > 0.85,
    rejoinCount: rc,
    rejoinLabel: rc + '가입' + (rc % 2 === 0 ? '(보너스)' : (rc === 1 ? '(최초)' : '(재가입)')),
    childCare: randomPick(['무','무','무','본인','전배우자','기타']),
    hometown: randomPick(REGIONS),
    overseas: randomPick(['없음','없음','없음','없음','시민권자','영주권자']),
    residenceFlexible: Math.random() > 0.7,
    jobFlexible: Math.random() > 0.6,
    familyWealth: randomPick(['1억미만','1~5억','5~10억','10~30억','30~50억','50~100억','100억이상']),
    personalWealth: randomPick(['1억미만','1~3억','3~5억','5~10억','10억이상']),
    program: randomPick(PROGRAMS),
    contractType: ct,
    contractCount: ct === '횟수제' ? randomPick([4,6,8,10,12]) : null,
    esignComplete: Math.random() > 0.4,
    programFee: randomPick([3000000,5000000,7000000,10000000,15000000,20000000]),
    marriageFee: randomPick([1000000,2000000,3000000,5000000]),
    rejoinFee: rc > 1 ? randomPick([1000000,2000000,3000000]) : 0,
    status: status,
    consultantManager: randomPick(CONSULTANTS),
    matchingManager: randomPick(MATCH_MANAGERS),
    meetingCount: meetingCount,
    lastMeetingDate: lastMeeting ? lastMeeting.toISOString() : null,
    lastContactDate: randomDate(new Date(2026,1,1), new Date(2026,3,15)).toISOString(),
    joinDate: joinDate.toISOString(),
    expiryDate: new Date(joinDate.getTime() + 365 * 86400000).toISOString(),
    expiryStatus: randomPick(['없음','없음','없음','만료','횟수']),
    docReauth: Math.random() > 0.8,
    marriageConfirm: status === '성혼' ? '성혼' : status === '결혼예정' ? '확인중' : status === '외부교제' ? '외부결혼' : randomPick(['확인전','확인전','확인전','미혼','미혼','미팅중','확인중','위임서류 미비','성혼비 없음']),
    // 상세 페이지용 추가 필드
    weight: gender === '남' ? Math.floor(68 + Math.random() * 20) : Math.floor(45 + Math.random() * 15),
    bloodType: randomPick(['A','B','O','AB']),
    smoking: randomPick(['비흡연','비흡연','비흡연','흡연','가끔']),
    drinking: randomPick(['안함','가끔','보통','자주']),
    income: randomPick(['3천만원','5천만원','7천만원','1억','1.5억','2억이상']),
    position: randomPick(['사원','대리','과장','차장','부장','이사','대표','-']),
    paymentAmount: Math.floor(Math.random() * 5000000) + 3000000,
    remainingCount: Math.max(0, 6 - meetingCount),
    matchComment: randomPick(['성격이 밝고 활발함.','진지한 성향으로 신중한 매칭 필요.','외모 중시, 전문직 선호.','유머있고 소통 능력 우수.','조용한 편이나 대화 시 깊이 있음.', '']),
    consultComment: randomPick(['적극적으로 참여 의향 있음.','시간 조율이 까다로운 편.','매칭 결과에 만족도 높음.','빠른 결혼 희망.','여유있게 진행 원함.', '']),
    selfAppeal: '',
    futureVision: '',
    marriageValues: '',
    realEstate: randomPick(['-','아파트 1채','아파트 2채','주택 1채','오피스텔 1채']),
    vehicle: randomPick(['-','BMW','벤츠','아우디','테슬라','제네시스','국산차']),
    preferAge: randomPick(['25~30세','28~35세','30~38세','35~42세','-']),
    preferHeight: randomPick(['160~170cm','165~175cm','170~180cm','175~185cm','-']),
    preferEdu: randomPick(['대졸 이상','석사 이상','무관','-']),
    preferReligion: randomPick(['무관','기독교','천주교','무교','-']),
    preferJob: randomPick(['무관','전문직','공무원','대기업','-']),
    preferRegion: randomPick(['무관','서울','서울/경기','수도권','-']),
    preferMarital: randomPick(['무관','미혼만','재혼가능','-']),
    preferEtc: '',
    introProfile: '',
    statusHistory: [
      { date: new Date(joinDate.getTime() - 30*86400000).toISOString(), from: '-', to: '준회원', reason: '최초 상담', processor: randomPick(CONSULTANTS) },
      { date: joinDate.toISOString(), from: '준회원', to: '신규', reason: '전산생성', processor: '인포팀' },
    ],
    // 결제 정보
    totalContractAmount: totalContract,
    payments: payArr,
    paidAmount: paid,
    balance: Math.max(0, totalContract - paid),
    unpaidReason: randomPick(['', '', '', '분납 협의중', '카드 결제 실패', '잔금 입금 예정']),
    // 컨텍 로그
    contactLogs: (function() {
      var logCount = Math.floor(Math.random() * 5) + 1;
      return Array.from({length: logCount}, function(_, j) {
        return {
          date: new Date(joinDate.getTime() + (j+1)*15*86400000).toISOString(),
          type: randomPick(['전화','문자','상담','메모','건의']),
          content: randomPick([
            '활동 의향 확인, 적극적 참여 희망',
            '일정 조율 어려움, 다음주 재연락 예정',
            '매칭 결과 만족, 추가 소개 요청',
            '컨디션 안 좋아 보류 요청',
            '상대방 프로필 문의, 사진 요청',
            '미팅 후기 공유, 긍정적 반응',
            '서류 보완 요청 안내',
          ]),
          processor: randomPick(MATCH_MANAGERS.concat(CONSULTANTS)),
        };
      });
    })(),
  });

  // 상태이력 추가 (신규가 아닌 경우)
  if (status !== '신규') {
    MockRegulars[MockRegulars.length - 1].statusHistory.push({
      date: new Date(joinDate.getTime() + 7*86400000).toISOString(),
      from: '신규',
      to: status,
      reason: '상태 변경',
      processor: randomPick(MATCH_MANAGERS),
    });
  }
}
