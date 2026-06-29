/* ========================================
   더미 데이터 — 정회원 (ES Module)
   Mock / Supabase 자동 전환 지원
   ======================================== */
import { Formatters } from '../utils/formatters.js';
import { PROGRAMS_FLAT } from '../config/constants.js';
import { useMock } from '../services/api.js';

const BRANDS = ['퍼플스','디노블','르매리'];
const PROGRAMS = PROGRAMS_FLAT;
const REG_STATUSES = ['신규','인증중','활동대기','활동','활동','활동','활동','임시교제','교제','외부교제','약정보류','임시보류','장기보류','강제보류','약정만료','자동만료','만료','탈회진행','탈회','결혼예정','성혼','리콜대기','리콜'];
const MATCH_MANAGERS = ['김태희','이수현','박지영','최은별','한서진','정유리','서다현','강보라'];

const MANAGER_DATA = [
  { name: '김태희', branch: '본사', brand: '퍼플스' },
  { name: '이수현', branch: '본사', brand: '퍼플스' },
  { name: '박지영', branch: '본사', brand: '디노블' },
  { name: '최은별', branch: '부산', brand: '퍼플스' },
  { name: '한서진', branch: '부산', brand: '디노블' },
  { name: '정유리', branch: '본사', brand: '르매리' },
  { name: '서다현', branch: '경기', brand: '퍼플스' },
  { name: '강보라', branch: '대전', brand: '퍼플스' },
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
const BRANCHES = ['본사','경기','대전','대구','부산','광주'];

const BRANCH_CODE_MAP = {
  '본사': '1', '경기': '8', '대전': '3', '대구': '4',
  '부산': '2', '광주': '5',
};
const BRANCH_BRAND_MAP = {
  '본사': '퍼플스', '경기': '퍼플스', '대전': '퍼플스', '대구': '퍼플스',
  '부산': '퍼플스', '광주': '퍼플스',
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

/**
 * Supabase row → camelCase 변환
 */
function toCamel(row) {
  const prefs = row.preferences || {};
  const rc = row.rejoin_count || 1;
  return {
    id: row.id,
    memberId: row.member_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    gender: row.gender,
    birthDate: row.birth_date,
    age: row.birth_date ? Formatters.age(row.birth_date) : '',
    photo: null,
    brand: row.brand,
    branch: row.branch,
    education: row.education,
    school: row.school,
    job: row.job,
    company: row.company,
    region: row.region,
    religion: row.religion,
    height: row.height,
    weight: row.weight,
    maritalHistory: row.marital_history || '미혼',
    income: row.income,
    bloodType: row.blood_type,
    smoking: row.smoking,
    drinking: row.drinking,
    position: row.position,
    difficultMatch: row.difficult_match || false,
    rejoinCount: rc,
    rejoinLabel: rc + '가입' + (rc % 2 === 0 ? '(보너스)' : (rc === 1 ? '(최초)' : '(재가입)')),
    childCare: row.child_care || '무',
    hometown: row.hometown,
    overseas: row.overseas || '없음',
    residenceFlexible: row.residence_flexible || false,
    jobFlexible: row.job_flexible || false,
    familyWealth: row.family_wealth,
    personalWealth: row.personal_wealth,
    realEstate: row.real_estate || '-',
    vehicle: row.vehicle || '-',
    program: row.program,
    contractType: row.contract_type,
    contractCount: row.contract_count,
    esignComplete: row.esign_complete || false,
    programFee: row.program_fee || 0,
    marriageFee: row.marriage_fee || 0,
    rejoinFee: row.rejoin_fee || 0,
    status: row.status,
    consultantManager: row.consultant_manager,
    matchingManager: row.matching_manager,
    meetingCount: row.meeting_count || 0,
    lastMeetingDate: row.last_meeting_date,
    lastContactDate: row.last_contact_date,
    joinDate: row.join_date,
    expiryDate: row.expiry_date,
    expiryStatus: row.expiry_status || '없음',
    docReauth: row.doc_reauth || false,
    marriageConfirm: row.marriage_confirm || '확인전',
    totalContractAmount: row.total_contract_amount || 0,
    paidAmount: row.paid_amount || 0,
    balance: row.balance || 0,
    unpaidReason: row.unpaid_reason || '',
    matchComment: row.match_comment || '',
    consultComment: row.consult_comment || '',
    selfAppeal: row.self_appeal || '',
    futureVision: '',
    marriageValues: '',
    introProfile: '성격이 밝고 활발하며, 대화를 즐기는 편입니다. 요리와 여행을 좋아하고, 주말에는 카페에서 독서를 즐깁니다. 가족을 소중히 여기며, 상대방의 이야기에 귀 기울일 줄 아는 따뜻한 성격입니다. 건강관리에 관심이 많아 주 3회 요가를 하고 있으며, 향후 안정적인 가정을 꾸리고 싶어 가입하셨습니다.',
    cautionNote: '※ 첫 만남 시 식사보다 카페 미팅 선호<br>※ 주말 오후 2시 이후 통화 가능<br>※ 상대방 나이 ±3세 이내 희망 (강하게 요청)',
    cautionMemo: '2025.05.15 - 이전 매칭(M-20250401) 시 상대방 지각 이슈로 불만 접수됨. 다음 매칭 시 시간 엄수 안내 필수. / 담당: 김매니저',
    paymentAmount: row.paid_amount || 0,
    remainingCount: Math.max(0, (row.contract_count || 6) - (row.meeting_count || 0)),
    // 선호 조건
    preferAge: prefs.preferAge || '-',
    preferHeight: prefs.preferHeight || '-',
    preferEdu: prefs.preferEdu || '-',
    preferReligion: prefs.preferReligion || '-',
    preferJob: prefs.preferJob || '-',
    preferRegion: prefs.preferRegion || '-',
    preferMarital: prefs.preferMarital || '-',
    preferEtc: prefs.preferEtc || '',
    // 이력 (Supabase에서는 별도 테이블이므로 빈 배열)
    statusHistory: [],
    payments: [],
    contactLogs: [],
  };
}

// ── 데이터 배열 생성 ──
export const MockRegulars = [];

if (useMock()) {
  // ── Mock 모드: 랜덤 데이터 생성 (기존 로직) ──
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
      fatherPhone: Math.random() > 0.4 ? randomPhone() : '',
      motherPhone: Math.random() > 0.4 ? randomPhone() : '',
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
      meetingActive: status === '활동',
      meetingCount: meetingCount,
      lastMeetingDate: lastMeeting ? lastMeeting.toISOString() : null,
      lastIntroDate: (function() {
        if (status === '신규' || status === '인증중' || status === '활동대기') return null;
        if (Math.random() > 0.4) {
          var daysAgo = Math.floor(Math.random() * 60) + 5;
          return new Date(Date.now() - daysAgo * 86400000).toISOString();
        }
        return null;
      })(),
      lastContactDate: randomDate(new Date(2026,1,1), new Date(2026,3,15)).toISOString(),
      joinDate: joinDate.toISOString(),
      expiryDate: new Date(joinDate.getTime() + 365 * 86400000).toISOString(),
      expiryStatus: randomPick(['없음','없음','없음','만료','횟수']),
      docReauth: Math.random() > 0.8,
      marriageConfirm: status === '성혼' ? '성혼' : status === '결혼예정' ? '확인중' : status === '외부교제' ? '외부결혼' : randomPick(['확인전','확인전','확인전','미혼','미혼','미팅중','확인중','위임서류 미비','성혼비 없음']),
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
        { date: new Date(joinDate.getTime() + 3*86400000).toISOString(), from: '신규', to: '활동대기', reason: '서류접수 완료', processor: '인포팀' },
        { date: new Date(joinDate.getTime() + 7*86400000).toISOString(), from: '활동대기', to: '활동', reason: '인증 완료 (계약정보 확인)', processor: randomPick(CONSULTANTS) },
        { date: new Date(joinDate.getTime() + 365*86400000).toISOString(), from: '기간만료', to: '리콜대기', reason: '계약기간 만료 → 연장심사', processor: '시스템' },
      ],
      totalContractAmount: totalContract,
      payments: payArr,
      paidAmount: paid,
      balance: Math.max(0, totalContract - paid),
      unpaidReason: randomPick(['', '', '', '분납 협의중', '카드 결제 실패', '잔금 입금 예정']),
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
      // ── 학력 ──
      educationList: (function() {
        var list = [{ level: '고등학교', school: randomPick(['한영고','서울고','경기고','부산고','대전고','천안여고']) + '등학교', major: '-', enterYear: String(2000 + Math.floor(Math.random()*10)), gradYear: String(2003 + Math.floor(Math.random()*10)), graduated: '졸업', location: randomPick(REGIONS) }];
        list.push({ level: '대학교', school: randomPick(SCHOOLS), major: randomPick(['경영학','컴퓨터공학','법학','간호학','영문학','식품영양학','국어교육','건축학','디자인','심리학']), enterYear: String(parseInt(list[0].gradYear)), gradYear: String(parseInt(list[0].gradYear) + 4), graduated: '졸업', location: randomPick(REGIONS) });
        if (Math.random() > 0.6) list.push({ level: '대학원(석사)', school: randomPick(SCHOOLS) + '대학원', major: list[1].major, enterYear: list[1].gradYear, gradYear: String(parseInt(list[1].gradYear) + 2), graduated: randomPick(['졸업','재학']), location: randomPick(REGIONS) });
        return list;
      })(),
      university: randomPick(SCHOOLS),
      major: randomPick(['경영학','컴퓨터공학','법학','간호학','영문학','식품영양학','국어교육','건축학']),
      // ── 가족관계 ──
      familySummary: randomPick(['1남 1녀(한녀)','2남(한남)','1남 2녀(한녀)','2남 1녀(한남)','외동','1남 1녀(장남)','3녀(막내)']),
      familyList: (function() {
        var fList = [];
        fList.push({ relation: '부', name: randomPick(NAMES_M).charAt(0) + randomPick(['영호','상철','대식','건우','병수']), birth: randomPick(['1958','1960','1962','1965','1968']), edu: randomPick(['고졸','대졸','석사']), job: randomPick(['자영업','회사원','공무원','퇴직','교수']), cohabit: randomPick(['동거','별거']), married: '기혼', residence: randomPick(REGIONS), note: '' });
        fList.push({ relation: '모', name: randomPick(NAMES_F).charAt(0) + randomPick(['영숙','미자','순이','정희','은주']), birth: randomPick(['1960','1962','1964','1966','1970']), edu: randomPick(['고졸','대졸']), job: randomPick(['주부','자영업','회사원','교사','간호사']), cohabit: fList[0].cohabit, married: '기혼', residence: fList[0].residence, note: '' });
        var siblings = Math.floor(Math.random() * 3);
        for (var s = 0; s < siblings; s++) {
          var sg = randomPick(['남','여']);
          fList.push({ relation: sg === '남' ? randomPick(['형','남동생','오빠']) : randomPick(['누나','여동생','언니']), name: randomPick(sg === '남' ? NAMES_M : NAMES_F), birth: String(1988 + Math.floor(Math.random()*8)), edu: randomPick(EDUCATIONS), job: randomPick(JOBS), cohabit: randomPick(['동거','별거']), married: randomPick(['미혼','기혼']), residence: randomPick(REGIONS), note: '' });
        }
        return fList;
      })(),
      // ── 결혼경력 ──
      marriageList: (function() {
        if (randomPick(['미혼','미혼','미혼','재혼']) === '미혼') return [{ type: '-', marriedYear: '-', divorceYear: '-', duration: '-', childCare: '-', children: '-', reason: '-' }];
        return [{ type: '초혼', marriedYear: String(2015 + Math.floor(Math.random()*5)), divorceYear: String(2020 + Math.floor(Math.random()*3)), duration: Math.floor(Math.random()*5+1) + '년', childCare: randomPick(['본인','전배우자','없음']), children: randomPick(['0명','1명','2명']), reason: randomPick(['성격차이','경제적 사유','기타']) }];
      })(),
      // ── 자녀정보 ──
      childrenList: (function() {
        if (Math.random() > 0.3) return [{ relation: '-', name: '-', birth: '-', edu: '-', job: '-', cohabit: '-', married: '-', residence: '-', custody: '-', parental: '-', note: '' }];
        return [{ relation: '자녀', name: randomPick(['김민준','이서윤','박하준','최지안']), birth: String(2015 + Math.floor(Math.random()*5)), edu: randomPick(['유치원','초등','중등']), job: '-', cohabit: '동거', married: '-', residence: randomPick(REGIONS), custody: '본인', parental: '본인', note: '' }];
      })(),
      // ── 자산정보 상세 ──
      selfFinance: randomPick(['-','5천만원','1억','2억','3억']),
      selfRealEstate: randomPick(['-','아파트 1채','아파트 2채','오피스텔 1채']),
      selfOtherAsset: randomPick(['-','자동차','기타']),
      familyFinance: randomPick(['-','1억','3억','5억','10억']),
      familyRealEstate: randomPick(['-','아파트 1채','아파트 2채','빌라 1채','주택 1채']),
      familyOtherAsset: randomPick(['-','토지','상가','기타']),
      // ── 직업 상세 ──
      industry: randomPick(['IT','금융','제조','서비스','교육','의료','공공','유통','-']),
      employees: randomPick(['-','50명이하','100명','500명','1000명이상','대기업']),
      department: randomPick(['-','개발팀','기획팀','영업팀','마케팅팀','경영지원']),
      duty: randomPick(['-','개발','기획','영업','디자인','마케팅','회계','연구']),
      subDuty: randomPick(['-','프론트엔드','백엔드','PM','데이터분석']),
      joinCompanyYear: randomPick(['-','2018','2019','2020','2021','2022','2023']),
      companyType: randomPick(['-','대기업','중견기업','중소기업','스타트업','공기업','외국계']),
      otherIncome: randomPick(['-','부동산 임대','주식 배당','프리랜서 부업']),
      businessField: randomPick(['-','소프트웨어 개발','금융 컨설팅','마케팅 전략','의료 서비스','교육 콘텐츠']),
      employmentCert: randomPick(['-','제출완료','미제출']),
      workAddress: randomPick(['-','서울시 강남구 테헤란로 123','서울시 종로구 세종대로 100','경기도 성남시 분당구 판교로 200']),
      workPhone: randomPick(['','02-1234-5678','02-9876-5432','']),
      // ── 소개 프로필 ──
      introProfile: randomPick([
        '서울 마포구 거주\n이화여자대학교 식품영양학과졸업\n부산교육대학교 국어교육과 졸업\n현재 교원 근무/편한 기간제교사\n연봉3,300만원\n186cm\n본인자산 6억정도\n가족자산 50억정도(가입시 기재기준)\n자녀-1녀 본인양육(2008년생)(부산거주)\n가족관계 형1녀(미혼)\n스타일은 좋으시고 밝고 사명감 같이 돌보이는 매력적인 분입니다.\n상대방 배려를 잘 하시고 공감 능력이 뛰어나며 대화를 잘 이끌어가시고\n여성스럽고 차분한 성격의 매력이 있으신 여성분이십니다.',
        '서울 강남구 거주\n연세대학교 경영학과 졸업\n삼성전자 마케팅팀 재직 중\n연봉 7,000만원\n178cm / 72kg\n본인자산 3억 (아파트 전세)\n가족자산 30억 이상\n미혼, 자녀 없음\n성격이 밝고 유머감각이 뛰어나며\n주말에는 등산이나 골프를 즐기는 활동적인 분입니다.',
        '',
      ]),
      // ── 특이사항 더미 ──
      specialNotes: (function() {
        var cnt = Math.floor(Math.random() * 8) + 8;
        var contents = [
          '강서구 한잉디블렌1101호 본인소유 (시세9.5 근저당x)',
          '부모님 강남 아파트 소유 (30평대, 시세 15억)',
          '본인 차량 제네시스 G80 보유',
          '연봉 확인 완료 (재직증명서 제출)',
          '매칭 시 식사보다 카페 미팅 선호',
          '주말 오후 2시 이후 통화 가능',
          '상대방 나이 ±3세 이내 희망 (강하게 요청)',
          '첫 만남 장소 강남역 인근 선호',
          '이전 매칭 상대방 지각으로 불만 접수',
          '외국계 기업 근무, 영어 능통',
          '부모님 사업가, 가족자산 검증 완료',
          '본인 아파트 전세 거주 (보증금 3억)',
          '종교 활동 적극적, 교회 출석 매주일',
          '반려동물 거부 의사 있음 (알레르기)',
          '해외 출장 잦음 (월 1~2회)',
          '주 3회 헬스, 체형 관리 철저',
          '요리를 즐기며 건강식 선호',
          '결혼 후 맞벌이 희망',
        ];
        return Array.from({length: cnt}, function(_, j) {
          return { no: j+1, date: '2026.' + randomPick(['03','04','05']) + '.' + String(Math.floor(Math.random()*28)+1).padStart(2,'0'), writer: randomPick(MATCH_MANAGERS), type: randomPick(['관리','상담','매칭']), content: contents[j % contents.length], important: j === 0 || j === 4 || j === 6 || Math.random() > 0.7 };
        });
      })(),
      // ── 기타 플래그 ──
      noEvent: Math.random() > 0.8,
      noRejoin: Math.random() > 0.85,
      specialMember: Math.random() > 0.9,
      ssn: (function() { var y = String(84 + Math.floor(Math.random()*16)); var m = String(Math.floor(Math.random()*12)+1).padStart(2,'0'); var d = String(Math.floor(Math.random()*28)+1).padStart(2,'0'); return y + m + d + '-' + (gender === '남' ? '1' : '2') + '******'; })(),
      homeAddress: randomPick(['서울시 강남구 역삼동 123-45','서울시 마포구 상수동 67-8','경기도 성남시 분당구 서현동 200','부산시 해운대구 우동 500','-']),
      registerAddress: randomPick(REGIONS),
      homePhone: randomPick(['','02-555-1234','02-777-9876','']),
      subPhone: randomPick(['','010-9999-8888','']),
      contactMethod: randomPick(['전화+문자','문자만','카카오톡','전화만']),
      preferredCaller: randomPick(['본인','부모','기타']),
      docVerified: Math.random() > 0.4,
      // ── 인증서류 ──
      certDocs: (function() {
        var isVerified = Math.random() > 0.4;
        var docNames = ['졸업증명서','재직증명서','소득증명서','혼인관계증명서'];
        var certStatuses = isVerified ? ['완료','완료','완료','완료'] : ['완료','완료', randomPick(['대기','반려','접수중']), randomPick(['대기','반려','접수중'])];
        if (!isVerified && Math.random() > 0.5) certStatuses[2] = '완료';
        return docNames.map(function(name, idx) {
          var st = certStatuses[idx];
          var certDate = st === '완료' ? new Date(joinDate.getTime() + (idx + 1) * 5 * 86400000).toISOString() : null;
          return {
            no: idx + 1,
            name: name,
            status: st,
            certDate: certDate,
            processor: st === '완료' ? randomPick(['김인증','박검증','이확인','최서류']) : null,
            rejectReason: st === '반려' ? randomPick(['서류 불선명','유효기간 만료','정보 불일치','서류 누락']) : null,
            fileUrl: st === '완료' ? '/files/cert/' + (idx + 1) + '_' + name + '.pdf' : null,
            uploadDate: st !== '대기' ? new Date(joinDate.getTime() + idx * 3 * 86400000).toISOString() : null,
          };
        });
      })(),
      // ── 인증서류 변경이력 ──
      certHistory: (function() {
        var hist = [];
        var certProcessors = ['김인증','박검증','이확인','최서류'];
        var docNames = ['졸업증명서','재직증명서','소득증명서','혼인관계증명서'];
        var count = Math.floor(Math.random() * 6) + 2;
        for (var ch = 0; ch < count; ch++) {
          var d = new Date(joinDate.getTime() + (ch + 1) * 4 * 86400000);
          hist.push({
            date: d.toISOString(),
            docName: randomPick(docNames),
            status: randomPick(['접수','검토중','완료','반려','재접수','완료']),
            processor: randomPick(certProcessors),
            note: randomPick(['서류 접수 완료','인증 심사 진행','인증 완료 처리','서류 불선명으로 반려','재접수 확인','최종 승인']),
          });
        }
        return hist.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
      })(),
      // ── 신상정보 ──
      eyesight: randomPick(['-','1.0','0.8','0.5','라식','라섹']),
      glasses: randomPick(['-','무','유(안경)','유(렌즈)']),
      hearing: randomPick(['-','정상','양호']),
      language: randomPick(['-','한국어','영어가능','일본어가능','중국어가능']),
      healthStatus: randomPick(['-','양호','보통','건강']),
      faceType: randomPick(['-','둥근형','계란형','갸름형','각진형','하트형']),
      criminalRecord: randomPick(['-','없음','없음','없음']),
      specialty: randomPick(['-','피아노','골프','요리','수영','테니스','독서','사진촬영']),
      military: gender === '남' ? randomPick(['군필(육군)','군필(해군)','군필(공군)','면제','미필']) : '-',
      meetingReason: randomPick(['-','결혼희망','진지한 만남','부모님 권유']),
      license: randomPick(['-','운전면허 1종보통','운전면허 2종보통','운전면허+자격증']),
      sameClan: randomPick(['-','없음','없음','해당']),
      ownFaith: randomPick(['-','무','유(깊음)','유(보통)','유(약함)']),
      parentFaith: randomPick(['-','무','유(깊음)','유(보통)']),
      // ── 희망상대 ──
      preferIncome: randomPick(['-','3천만원 이상','5천만원 이상','7천만원 이상','1억 이상']),
      avoidReligion: randomPick(['-','없음','기독교','천주교','불교']),
      acceptChildren: randomPick(['-','불가','가능','협의']),
      preferEduDetail: randomPick(['-','대졸 이상 선호, 명문대 우대','학력 무관','석사 이상 선호']),
      // ── 텍스트 영역 ──
      idealType: randomPick([
        '1. 유머감각이 있고 대화가 통하는 사람\n2. 상대방을 배려할 줄 아는 따뜻한 사람\n3. 자기관리를 잘하는 사람',
        '1. 가정적이고 책임감 있는 분\n2. 건강하고 활동적인 분\n3. 솔직하고 진실된 분',
        '',
      ]),
      myCharm: randomPick([
        '밝은 성격이 가장 큰 매력이고, 누구와든 편하게 대화할 수 있습니다.\n요리를 잘하고, 상대방의 이야기를 잘 들어주는 편입니다.',
        '성실하고 책임감이 강하며, 한번 시작한 일은 끝까지 마무리합니다.\n주변에서 든든하다는 말을 자주 듣습니다.',
        '',
      ]),
      personalityStyle: randomPick([
        '외향적이면서도 섬세한 편입니다.\n패션에 관심이 많고 깔끔한 스타일을 추구합니다.\n주말에는 카페에서 독서하거나 전시회를 관람합니다.',
        '차분하고 조용한 성격이지만, 친해지면 유머러스합니다.\n캐주얼한 스타일을 좋아하고, 자연스러운 분위기를 선호합니다.',
        '',
      ]),
      futureVision: randomPick([
        '안정적인 가정을 꾸리고, 주말마다 가족과 함께 여행을 다니고 싶습니다.\n배우자와 함께 성장하며 서로를 응원하는 관계가 되고 싶습니다.',
        '경제적으로 안정된 가정을 이루고 싶습니다.\n자녀 교육에 관심이 많으며, 좋은 부모가 되는 것이 목표입니다.',
        '',
      ]),
      othersView: randomPick([
        '주변에서 항상 밝고 에너지가 넘친다고 합니다.\n배려심이 깊어서 함께 있으면 편안하다는 말을 자주 듣습니다.',
        '진지하면서도 유머가 있어 대화가 즐겁다고 합니다.\n신뢰감을 주는 타입이라는 평가를 많이 받습니다.',
        '',
      ]),
      extraNote: randomPick([
        '매칭 시 첫 만남 장소를 카페로 선호하며, 식사는 2~3번째 만남부터 희망합니다.\n주말 오후 시간대 미팅 선호.',
        '상대방 흡연 절대 불가. 음주는 가끔 정도 괜찮음.\n반려동물에 대한 거부감 없음.',
        '',
      ]),
      // ── 프로그램 변경이력 ──
      programHistory: (function() {
        var hist = [{ date: joinDate.toISOString(), changer: randomPick(CONSULTANTS), program: randomPick(PROGRAMS), totalFee: randomPick([3000000,5000000,7000000,10000000]), addFee: 0, payMethod: randomPick(['카드','현금','계좌이체']), note: '최초 가입' }];
        if (Math.random() > 0.5) {
          hist.push({ date: new Date(joinDate.getTime() + 90*86400000).toISOString(), changer: randomPick(CONSULTANTS), program: randomPick(PROGRAMS), totalFee: hist[0].totalFee + randomPick([2000000,3000000,5000000]), addFee: randomPick([2000000,3000000,5000000]), payMethod: randomPick(['카드','현금','계좌이체']), note: '업그레이드' });
        }
        if (Math.random() > 0.7) {
          hist.push({ date: new Date(joinDate.getTime() + 180*86400000).toISOString(), changer: randomPick(CONSULTANTS), program: randomPick(PROGRAMS), totalFee: (hist[hist.length-1].totalFee) + randomPick([1000000,2000000]), addFee: randomPick([1000000,2000000]), payMethod: randomPick(['카드','계좌이체']), note: '재업그레이드' });
        }
        return hist;
      })(),
      // ── 미팅횟수 변경이력 ──
      meetingCountHistory: (function() {
        if (meetingCount === 0) return [];
        var hist = [];
        var prev = 0;
        for (var mc = 0; mc < Math.min(meetingCount, 4); mc++) {
          hist.push({ date: new Date(joinDate.getTime() + (30 + mc * 25) * 86400000).toISOString(), changer: randomPick(MATCH_MANAGERS), before: prev, after: prev + randomPick([1,1,1,2]), reason: randomPick(['미팅 완료','추가 미팅 진행','보너스 미팅 부여','횟수 조정']) });
          prev = hist[hist.length-1].after;
        }
        return hist;
      })(),
      // ── 가입이력 ──
      rejoinHistory: (function() {
        var cnt = rc || 1;
        var hist = [];
        for (var ri = 0; ri < cnt; ri++) {
          var rDate = new Date(joinDate.getTime() - (cnt - 1 - ri) * 365 * 86400000);
          var rEnd = new Date(rDate.getTime() + 365 * 86400000);
          var rPeriod = rDate.toISOString().substring(0,10).replace(/-/g,'.') + ' ~ ' + rEnd.toISOString().substring(0,10).replace(/-/g,'.');
          var rMeetCount = Math.floor(Math.random() * 8) + 2;
          hist.push({ no: ri + 1, date: rDate.toISOString(), program: randomPick(PROGRAMS), fee: randomPick([3000000,5000000,7000000,10000000]), contractType: randomPick(['횟수제','기간제','인증제']), period: rPeriod, meetingCount: rMeetCount, manager: randomPick(CONSULTANTS), status: ri < cnt - 1 ? randomPick(['만료','약정만료','탈회']) : status });
        }
        return hist;
      })(),
    });

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

  // ── 성혼/소송 관련 회원 (명시적 데이터) ──
  const marriageMembers = [
    { id: 901, name: '이상훈', gender: '남', age: 38, brand: '퍼플스', branch: '본사', program: '다이아몬드 A', status: '성혼', marriageConfirm: '소송중', memberId: '1m00901', matchingManager: '김태희', consultantManager: '이지연', meetingCount: 8, contractType: '횟수제', contractCount: 12, joinDate: '2025-03-15', region: '서울', maritalHistory: '미혼', phone: '01099990001', rejoinCount: 1 },
    { id: 902, name: '박지영', gender: '여', age: 34, brand: '퍼플스', branch: '본사', program: '플래티늄(루비) A', status: '활동', marriageConfirm: '소송중', memberId: '1f00902', matchingManager: '이수현', consultantManager: '김민희', meetingCount: 5, contractType: '횟수제', contractCount: 8, joinDate: '2025-06-20', region: '경기', maritalHistory: '미혼', phone: '01099990002', rejoinCount: 1 },
    { id: 903, name: '김민수', gender: '남', age: 41, brand: '디노블', branch: '본사', program: '시크릿 A', status: '성혼', marriageConfirm: '성혼', memberId: '7m00903', matchingManager: '박지영', consultantManager: '박수정', meetingCount: 10, contractType: '횟수제', contractCount: 10, joinDate: '2024-11-05', region: '서울', maritalHistory: '미혼', phone: '01099990003', rejoinCount: 1 },
    { id: 904, name: '최서연', gender: '여', age: 32, brand: '퍼플스', branch: '부산', program: '골드(사파이어) A', status: '결혼예정', marriageConfirm: '확인중', memberId: '2f00904', matchingManager: '최은별', consultantManager: '최영미', meetingCount: 6, contractType: '횟수제', contractCount: 8, joinDate: '2025-01-10', region: '부산', maritalHistory: '미혼', phone: '01099990004', rejoinCount: 1 },
    { id: 905, name: '정태호', gender: '남', age: 36, brand: '퍼플스', branch: '경기', program: '플래티늄(루비) B', status: '교제', marriageConfirm: '성혼비 없음', memberId: '6m00905', matchingManager: '서다현', consultantManager: '한소영', meetingCount: 7, contractType: '기간제', contractCount: 12, joinDate: '2025-04-22', region: '경기', maritalHistory: '미혼', phone: '01099990005', rejoinCount: 2 },
  ];

  marriageMembers.forEach(mm => {
    MockRegulars.push({
      ...mm,
      email: mm.name.toLowerCase().replace(/\s/g,'') + '@gmail.com',
      photo: null,
      birthDate: null,
      education: randomPick(EDUCATIONS),
      school: randomPick(SCHOOLS),
      job: randomPick(JOBS),
      company: randomPick(COMPANIES),
      religion: randomPick(RELIGIONS),
      height: mm.gender === '남' ? 178 : 165,
      weight: mm.gender === '남' ? 75 : 52,
      difficultMatch: false,
      rejoinLabel: mm.rejoinCount + '가입(최초)',
      childCare: '무',
      hometown: mm.region,
      overseas: '없음',
      residenceFlexible: false,
      jobFlexible: false,
      familyWealth: '10~30억',
      personalWealth: '3~5억',
      esignComplete: true,
      programFee: 10000000,
      marriageFee: 5000000,
      rejoinFee: 0,
      lastMeetingDate: '2026-03-01',
      lastContactDate: '2026-04-10',
      expiryDate: '2027-03-15',
      expiryStatus: '없음',
      docReauth: false,
      bloodType: 'A',
      smoking: '비흡연',
      drinking: '가끔',
      income: '1억',
      position: '과장',
      totalContractAmount: 10000000,
      paidAmount: 10000000,
      balance: 0,
      unpaidReason: '',
      matchComment: '',
      consultComment: '',
      selfAppeal: '',
      futureVision: '',
      marriageValues: '',
      realEstate: '아파트 1채',
      vehicle: '제네시스',
      paymentAmount: 10000000,
      remainingCount: 0,
      preferAge: '-', preferHeight: '-', preferEdu: '-', preferReligion: '-',
      preferJob: '-', preferRegion: '-', preferMarital: '-', preferEtc: '',
      introProfile: '',
      statusHistory: [],
      payments: [],
      contactLogs: [],
    });
  });

  // ── 활동대기 상태 회원 (2가입 진행용) ──
  const waitingMembers = [
    {
      id: 801,
      memberId: '1m00801',
      name: '김진우',
      gender: '남',
      age: 35,
      phone: '01055551234',
      email: 'kimjw801@gmail.com',
      brand: '퍼플스',
      branch: '본사',
      program: '플래티늄(루비) A',
      status: '활동대기',
      matchingManager: '김태희',
      consultantManager: '이지연',
      meetingCount: 6,
      contractType: '횟수제',
      contractCount: 6,
      joinDate: '2025-03-01',
      expiryDate: '2026-03-01',
      region: '서울',
      maritalHistory: '미혼',
      rejoinCount: 1,
      // 2가입 계약정보 확인용 데이터
      contractConfirmed: false,
      esignSent: false,
      esignComplete: false,
      // 2가입 계약 상세
      contract2: {
        contractDate: '2026-06-01',
        contractPeriod: '12개월',
        programFee: 10000000,
        marriageFee: 5000000,
        meetingCount: 8,
        contractType: '횟수제',
        program: '다이아몬드 A',
        agent: '김영숙',
        agentRelation: '모',
        international: false,
        country: '대한민국',
        address: '서울시 강남구 역삼동 123-45',
      },
    },
    {
      id: 802,
      memberId: '2f00802',
      name: '박소연',
      gender: '여',
      age: 31,
      phone: '01066665678',
      email: 'parksoyeon802@naver.com',
      brand: '디노블',
      branch: '본사',
      program: '골드(사파이어) B',
      status: '활동대기',
      matchingManager: '박지영',
      consultantManager: '김민희',
      meetingCount: 4,
      contractType: '기간제',
      contractCount: null,
      joinDate: '2025-06-15',
      expiryDate: '2026-06-15',
      region: '경기',
      maritalHistory: '미혼',
      rejoinCount: 1,
      contractConfirmed: true,
      esignSent: true,
      esignComplete: false,
      contract2: {
        contractDate: '2026-06-02',
        contractPeriod: '12개월',
        programFee: 7000000,
        marriageFee: 3000000,
        meetingCount: null,
        contractType: '기간제',
        program: '플래티늄(루비) B',
        agent: '-',
        agentRelation: '-',
        international: false,
        country: '대한민국',
        address: '경기도 성남시 분당구 서현동 200',
      },
    },
  ];

  waitingMembers.forEach(wm => {
    MockRegulars.push({
      ...wm,
      photo: null,
      birthDate: wm.gender === '남' ? '1991-05-15' : '1995-08-22',
      education: wm.gender === '남' ? '대졸' : '석사',
      school: wm.gender === '남' ? '연세대' : '이화여대',
      job: wm.gender === '남' ? '회사원' : '전문직',
      company: wm.gender === '남' ? '삼성전자' : 'LG전자',
      religion: '무교',
      height: wm.gender === '남' ? 180 : 165,
      weight: wm.gender === '남' ? 75 : 52,
      difficultMatch: false,
      rejoinLabel: wm.rejoinCount + '가입(최초)',
      childCare: '무',
      hometown: wm.region,
      overseas: '없음',
      residenceFlexible: false,
      jobFlexible: false,
      familyWealth: '5~10억',
      personalWealth: '1~3억',
      programFee: wm.contract2.programFee,
      marriageFee: wm.contract2.marriageFee,
      rejoinFee: 0,
      meetingActive: false,
      lastMeetingDate: '2026-02-15',
      lastContactDate: '2026-05-28',
      expiryStatus: '만료',
      docReauth: false,
      marriageConfirm: '확인전',
      bloodType: 'A',
      smoking: '비흡연',
      drinking: '가끔',
      income: wm.gender === '남' ? '7천만원' : '5천만원',
      position: wm.gender === '남' ? '대리' : '과장',
      totalContractAmount: wm.contract2.programFee,
      paidAmount: 0,
      balance: wm.contract2.programFee,
      unpaidReason: '2가입 진행중',
      matchComment: '1가입 만료, 2가입 진행 예정',
      consultComment: '',
      selfAppeal: '',
      futureVision: '',
      marriageValues: '',
      realEstate: wm.gender === '남' ? '아파트 1채' : '-',
      vehicle: wm.gender === '남' ? 'BMW' : '-',
      paymentAmount: 0,
      remainingCount: wm.contract2.meetingCount || 0,
      preferAge: '-', preferHeight: '-', preferEdu: '-', preferReligion: '-',
      preferJob: '-', preferRegion: '-', preferMarital: '-', preferEtc: '',
      introProfile: '',
      statusHistory: [
        { date: wm.joinDate, from: '-', to: '신규', reason: '전산생성', processor: '인포팀' },
        { date: new Date(new Date(wm.joinDate).getTime() + 14*86400000).toISOString(), from: '신규', to: '활동', reason: '인증 완료', processor: '인증팀' },
        { date: wm.expiryDate, from: '활동', to: '활동대기', reason: '1가입 만료일 도래 (자동전환)', processor: '시스템' },
      ],
      payments: [
        { no: 1, date: new Date(new Date(wm.joinDate).getTime() - 25*86400000).toISOString(), method: '카드', amount: Math.floor(wm.contract2.programFee * 0.5), category: '준회원 가입금', status: '완료', note: '1가입 최초결제' },
        { no: 2, date: wm.joinDate, method: '계좌이체', amount: Math.floor(wm.contract2.programFee * 0.5), category: '정회원 전환금', status: '완료', note: '1가입 잔금' },
      ],
      contactLogs: [
        { date: wm.expiryDate, type: '전화', content: '1가입 만료 안내, 2가입 진행 의향 확인', processor: wm.matchingManager },
        { date: '2026-05-30', type: '문자', content: '2가입 계약 안내 문자 발송', processor: wm.matchingManager },
      ],
      specialNotes: [
        { no: 1, date: '2026.06.01', writer: wm.matchingManager, type: '관리', content: '1가입 만료, 2가입 진행 의향 확인 완료. 계약정보 확인 예정.', important: true },
        { no: 2, date: wm.expiryDate.replace(/-/g,'.'), writer: '시스템', type: '관리', content: '1가입 만료일 도래로 활동대기 상태로 자동 전환됨.', important: true },
      ],
    });
  });

  // ── 리콜대기 / 리콜 / 리콜불가 상태 회원 (명시적 데이터) ──
  const recallMembers = [
    // ① 미발송 (발송 버튼 표시)
    { id: 701, memberId: '1m00701', name: '장현우', gender: '남', age: 37,
      phone: '01088810001', email: 'janghw701@gmail.com',
      brand: '퍼플스', branch: '본사',
      program: '다이아몬드 A', status: '리콜대기',
      matchingManager: '김태희', consultantManager: '이지연',
      meetingCount: 4, contractType: '횟수제', contractCount: 12,
      joinDate: '2025-01-10', expiryDate: '2026-01-10',
      region: '서울', maritalHistory: '미혼', rejoinCount: 2,
      _esignStatus: null, _esignDocId: null,
      _recallRegisteredAt: '2026-05-25T10:00:00Z' },
    // ② 서명진행중 (발송완료 상태)
    { id: 702, memberId: '2f00702', name: '윤서영', gender: '여', age: 33,
      phone: '01088820002', email: 'yoonsy702@naver.com',
      brand: '디노블', branch: '본사',
      program: '플래티늄(루비) A', status: '리콜대기',
      matchingManager: '박지영', consultantManager: '김민희',
      meetingCount: 3, contractType: '기간제', contractCount: null,
      joinDate: '2025-02-15', expiryDate: '2026-08-15',
      region: '경기', maritalHistory: '미혼', rejoinCount: 2,
      _recallNewExpiry: '2026-08-15',
      _esignStatus: '발송완료', _esignDocId: 'DOC-17805501', _esignSentAt: '2026-06-01T11:00:00Z',
      _esignMethod: '이메일',
      _recallRegisteredAt: '2026-05-20T14:30:00Z' },
    // ③ 서명완료
    { id: 703, memberId: '1f00703', name: '이수빈', gender: '여', age: 30,
      phone: '01088830003', email: 'leesb703@kakao.com',
      brand: '퍼플스', branch: '부산',
      program: '골드(사파이어) A', status: '리콜대기',
      matchingManager: '최은별', consultantManager: '최영미',
      meetingCount: 5, contractType: '횟수제', contractCount: 12,
      joinDate: '2025-03-01', expiryDate: '2026-10-01',
      region: '부산', maritalHistory: '미혼', rejoinCount: 2,
      _recallNewExpiry: '2026-10-01',
      _esignStatus: '서명완료', _esignDocId: 'DOC-17805502', _esignSentAt: '2026-05-18T09:00:00Z',
      _esignSignedAt: '2026-05-20T14:30:00Z', _esignMethod: '문자(본인)',
      _recallRegisteredAt: '2026-05-18T09:00:00Z' },
    // ④ 리콜 완료
    { id: 705, memberId: '2f00705', name: '박하은', gender: '여', age: 35,
      phone: '01088850005', email: 'parkhe705@naver.com',
      brand: '르매리', branch: '본사',
      program: '플래티늄(루비) B', status: '리콜',
      matchingManager: '정유리', consultantManager: '정다은',
      meetingCount: 6, contractType: '기간제', contractCount: null,
      joinDate: '2025-04-01', expiryDate: '2026-10-01',
      region: '서울', maritalHistory: '재혼', rejoinCount: 3,
      _recallNewExpiry: '2026-10-01',
      _esignStatus: '서명완료', _esignDocId: 'DOC-17805503', _esignSentAt: '2026-05-25T14:00:00Z',
      _esignSignedAt: '2026-06-01T09:45:00Z', _esignMethod: '이메일',
      _recallRegisteredAt: '2026-05-22T16:00:00Z' },
    // ⑤ 리콜불가
    { id: 706, memberId: '1m00706', name: '최준혁', gender: '남', age: 41,
      phone: '01088860006', email: 'choijh706@gmail.com',
      brand: '퍼플스', branch: '본사',
      program: '다이아몬드 A', status: '리콜불가',
      matchingManager: '김태희', consultantManager: '이지연',
      meetingCount: 1, contractType: '횟수제', contractCount: 12,
      joinDate: '2025-01-15', expiryDate: '2026-01-15',
      region: '서울', maritalHistory: '미혼', rejoinCount: 2,
      _recallRejectReason: '회원 활동 이력 부족 (미팅 1회), 리콜 기준 미달',
      _esignStatus: null, _esignDocId: null,
      _recallRegisteredAt: '2026-05-28T09:00:00Z' },
  ];

  recallMembers.forEach(rm => {
    var cm = 12;
    if (rm.joinDate && rm.expiryDate) {
      cm = Math.round((new Date(rm.expiryDate) - new Date(rm.joinDate)) / (30.44 * 86400000));
    }
    var ext = Math.max(0, cm - (rm.meetingCount || 0));

    MockRegulars.push({
      ...rm,
      photo: null,
      birthDate: rm.gender === '남' ? '1989-03-12' : '1993-07-25',
      education: rm.gender === '남' ? '대졸' : '석사',
      school: rm.gender === '남' ? '고려대' : '이화여대',
      job: rm.gender === '남' ? '회사원' : '전문직',
      company: rm.gender === '남' ? '현대자동차' : '삼성서울병원',
      religion: '무교',
      height: rm.gender === '남' ? 179 : 164,
      weight: rm.gender === '남' ? 76 : 50,
      difficultMatch: false,
      rejoinLabel: rm.rejoinCount + '가입(재가입)',
      childCare: '무',
      hometown: rm.region,
      overseas: '없음',
      residenceFlexible: false,
      jobFlexible: false,
      familyWealth: '5~10억',
      personalWealth: '1~3억',
      programFee: 10000000,
      marriageFee: 3000000,
      rejoinFee: 2000000,
      meetingActive: false,
      lastMeetingDate: rm.expiryDate,
      lastContactDate: '2026-06-01',
      expiryStatus: '만료',
      docReauth: false,
      marriageConfirm: '확인전',
      bloodType: randomPick(['A','B','O','AB']),
      smoking: '비흡연',
      drinking: '가끔',
      income: rm.gender === '남' ? '7천만원' : '5천만원',
      position: rm.gender === '남' ? '과장' : '대리',
      totalContractAmount: 10000000,
      paidAmount: 10000000,
      balance: 0,
      unpaidReason: '',
      matchComment: '리콜 대상 회원 — 계약기간 ' + cm + '개월 대비 만남횟수 ' + rm.meetingCount + '회 (연장 ' + ext + '개월 산정)',
      consultComment: '',
      selfAppeal: '',
      futureVision: '',
      marriageValues: '',
      realEstate: rm.gender === '남' ? '아파트 1채' : '-',
      vehicle: rm.gender === '남' ? '제네시스' : '-',
      paymentAmount: 10000000,
      remainingCount: Math.max(0, (rm.contractCount || 12) - rm.meetingCount),
      preferAge: '-', preferHeight: '-', preferEdu: '-', preferReligion: '-',
      preferJob: '-', preferRegion: '-', preferMarital: '-', preferEtc: '',
      introProfile: '',
      enrollmentHistory: [
        { seq: 1, label: '1가입', program: rm.gender === '남' ? '골드(사파이어) A' : '플래티늄(루비) A',
          contractType: '횟수제', contractCount: 12,
          joinDate: new Date(new Date(rm.joinDate).getTime() - 365*86400000).toISOString().slice(0,10),
          expiryDate: rm.joinDate,
          meetingCount: rm.gender === '남' ? 8 : 6, status: '만료',
          matchingManager: rm.matchingManager },
        { seq: 2, label: '2가입(재가입)', program: rm.program,
          contractType: rm.contractType, contractCount: rm.contractCount || 12,
          joinDate: rm.joinDate, expiryDate: rm.expiryDate,
          meetingCount: rm.meetingCount, status: rm.status,
          matchingManager: rm.matchingManager },
      ],
      statusHistory: [
        { date: rm.joinDate, from: '-', to: '신규', reason: '재가입 계약 체결', processor: '인포팀' },
        { date: new Date(new Date(rm.joinDate).getTime() + 14*86400000).toISOString(), from: '신규', to: '활동', reason: '서류 인증 완료 및 활동 승인', processor: '인증팀' },
        { date: rm.expiryDate, from: '활동', to: '만료', reason: '계약기간 만료 자동 처리', processor: '시스템' },
        { date: '2026-06-01T09:00:00Z', from: '만료', to: '리콜대기', reason: '리콜 대상 선별 완료', processor: '영업기획' },
        ...(rm._esignStatus === '발송완료' ? [{ date: rm._esignSentAt || '2026-06-01', from: '리콜대기', to: '리콜대기', reason: '기간연장 신청서 ' + (rm._esignMethod||'이메일') + ' 발송', processor: 'CS팀' }] : []),
        ...(rm._esignStatus === '서명완료' ? [
          { date: rm._esignSentAt || '2026-06-01', from: '리콜대기', to: '리콜대기', reason: '기간연장 신청서 ' + (rm._esignMethod||'이메일') + ' 발송', processor: 'CS팀' },
          { date: rm._esignSignedAt || '2026-06-03', from: '리콜대기', to: '리콜대기', reason: '기간연장 신청서 서명완료', processor: '회원(전자서명)' },
        ] : []),
        ...(rm.status === '리콜' ? [{ date: rm._esignSignedAt || '2026-06-03', from: '리콜대기', to: '리콜', reason: '리콜 활동 전환 승인', processor: '전략기획' }] : []),
      ],
      payments: [
        { no: 1, date: new Date(new Date(rm.joinDate).getTime() - 20*86400000).toISOString(), method: '카드', amount: 5000000, category: '준회원 가입금', status: '완료', note: '2가입 최초결제' },
        { no: 2, date: rm.joinDate, method: '계좌이체', amount: 5000000, category: '정회원 전환금', status: '완료', note: '2가입 잔금' },
      ],
      contactLogs: [
        { date: rm.expiryDate, type: '전화', content: '만료 안내 통화, 리콜 대상 검토', processor: rm.matchingManager },
        { date: '2026-06-01', type: '전화', content: '리콜 서비스 안내 및 기간연장 의향 확인', processor: rm.matchingManager },
      ],
      specialNotes: [
        { no: 1, date: '2026.06.01', writer: '영업기획', type: '관리', content: '리콜 대상 선별 — 계약 ' + cm + '개월 / 만남 ' + rm.meetingCount + '회 / 연장 ' + ext + '개월 산정', important: true },
        ...(rm._esignStatus ? [{ no: 2, date: '2026.06.02', writer: rm.matchingManager, type: '관리', content: '기간연장 신청서 발송 (' + (rm._esignMethod||'이메일') + ', 문서: ' + rm._esignDocId + ')', important: true }] : []),
        ...(rm._esignStatus === '서명완료' ? [{ no: 3, date: '2026.06.03', writer: rm.matchingManager, type: '관리', content: '회원 전자서명 완료 확인', important: false }] : []),
      ],
    });
  });
} else {
  // ── Supabase 모드: DB에서 데이터 로드 ──
  try {
    const { supabase } = await import('../services/supabase.js');

    const { data, error } = await supabase
      .from('regulars')
      .select('*')
      .order('join_date', { ascending: false });

    if (!error && data) {
      data.forEach(row => MockRegulars.push(toCamel(row)));
      console.log(`[Regulars] Supabase에서 ${data.length}건 로드 완료`);
    } else {
      console.error('[Regulars] Supabase 로드 실패:', error);
    }
  } catch (e) {
    console.error('[Regulars] Supabase 연결 오류:', e);
  }
}

