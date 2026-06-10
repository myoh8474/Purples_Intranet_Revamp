/* compat/mock-associates.js — MockAssociates를 전역 노출
   Supabase / Mock 자동 전환 지원 */
var BRANCH_LIST = ['본사','경기','부산','대구','대전','광주'];
var BRANDS = ['퍼플스','디노블','르매리'];
var BLOODS = ['A','B','O','AB'];
var RELIGIONS_LIST = ['무교','기독교','천주교','불교','기타'];
var HOBBIES_LIST = ['등산','독서','운동','영화','여행','요리','음악','골프','테니스','수영','카페탐방','사진'];
var CHANNELS = [
  '가입비견적','결혼테스트','글ON','구글커플','네이버예약','네이버커플',
  '기간만료(재컨텍)','기타','당근커플','렌딩-두두','무료맞선권','무료상담',
  '블라인드커플','사주궁합운세','실시간상담','이상형매칭','인스타리어',
  '자녀결혼','카카오커플','카카오톡','커플테스타','타겟팅','파티신청',
  'MBTI테스트','SNS기타','TV광고',
];
var ASSOC_STATUSES = ['컨텍전','부재중(미컨텍)','장기상담(컨텍)','낮음(컨텍)','보통(컨텍)','높음(컨텍)','가입보류(컨텍)','방문상담','가입중','변경','기간만료(재컨텍)'];
var CONSULTANTS = ['김지은','박서연','이하나','정민수','최유리','한소희','강다연','윤채영','임서진','조예린'];
var EDUCATIONS = ['고졸','전문대졸','대졸','석사','박사'];
var JOBS = ['회사원','공무원','전문직','자영업','프리랜서','교육직','의료직','금융직','IT/개발','연구직'];
var REGIONS = ['서울','부산','대구','광주','인천','대전','울산','경기','강원','세종','충북','충남','경북','경남','전북','전남','제주'];
var NAMES_M = ['김민준','이서준','박도윤','최하준','정우진','강건우','조현우','윤태민','임지호','한성민','송재원','오승현','배준서','류민재','남동현'];
var NAMES_F = ['김서연','이하은','박지유','최수아','정채원','강예린','조윤서','윤다인','임소율','한나윤','송하린','오서윤','배민지','류지안','남수빈'];

function regionToBranch(region) {
  var map = {
    '서울':'본사','인천':'본사','경기':'경기','강원':'경기',
    '부산':'부산','울산':'부산','경남':'부산',
    '대구':'대구','경북':'대구',
    '대전':'대전','세종':'대전','충북':'대전','충남':'대전',
    '광주':'광주','전북':'광주','전남':'광주','제주':'광주',
  };
  return map[region] || '본사';
}
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomPhone() { return '010' + String(Math.floor(Math.random()*90000000)+10000000); }

var MockAssociates = [];
var _mockDataReady = false;

/**
 * Supabase에서 데이터 로드 (비 ES 모듈용)
 */
function _loadFromSupabase() {
  var SUPABASE_URL = 'https://zjqeveciussillyvzyzz.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcWV2ZWNpdXNzaWxseXZ6eXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTYyNjQsImV4cCI6MjA5NDY5MjI2NH0.HnCHN6Z0YfsLOUTm7gHhr3wVaieYImm3sfab6jMepM0';

  return fetch(SUPABASE_URL + '/rest/v1/associate_mem?select=*&order=find_date.desc', {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
    }
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    MockAssociates.length = 0;
    data.forEach(function(row) {
      MockAssociates.push({
        id: row.id,
        name: row.uname,
        phone: row.tel_hand,
        phone2: row.tel_eto || '',
        gender: row.sex,
        birthDate: row.birthday,
        age: row.birthday ? Formatters.age(row.birthday) : '',
        education: row.school,
        school: row.school_name,
        job: row.job_name,
        company: row.office,
        region: row.live_local,
        branch: row.branch,
        brand: row.brand,
        maritalStatus: row.married,
        status: row.state,
        channel: row.etc,
        consultant: row.course,
        registeredAt: row.find_date,
        distributedAt: row.input_date,
        lastContactAt: row.last_counsel,
        email: row.email || '',
        telHome: row.tel_home || '',
        telOffice: row.tel_office || '',
        height: row.height || 0,
        weight: row.weight || 0,
        bloodType: row.bloodtype || '',
        children: row.children || '',
        religion: row.religion || '',
        hobby: row.hobby || '',
        hope: row.hope || '',
        memo: row.memo,
        duplicateEntries: [],
        contactHistory: [],
        sales: [],
      });
    });
    _mockDataReady = true;
    console.log('[compat] Supabase에서 준회원 ' + data.length + '건 로드 완료');
  })
  .catch(function(err) {
    console.error('[compat] Supabase 로드 실패, MockData 사용:', err);
    _generateMockData();
  });
}

/**
 * Mock 데이터 생성 (기존 로직)
 */
function _generateMockData() {
  MockAssociates.length = 0;
  var ASSOC_STATUSES_DIST = ['부재중(미컨텍)','장기상담(컨텍)','낮음(컨텍)','보통(컨텍)','높음(컨텍)','가입보류(컨텍)','방문상담','가입중'];
  var SCHOOLS_L = ['서울대','연세대','고려대','성균관대','한양대','경희대','중앙대','건국대','이화여대','숙명여대','서강대','홍익대','국민대','세종대','숭실대'];
  var COMPANIES_L = ['삼성전자','LG전자','현대자동차','SK하이닉스','네이버','카카오','쿠팡','배달의민족','토스','당근','라인','NHN','한화','포스코','CJ'];
  var idSeq = 1;

  // 1. 분배 완료 회원 (30명) — 각 매니저에 3명씩
  for (var ci = 0; ci < CONSULTANTS.length; ci++) {
    var mgr = CONSULTANTS[ci];
    for (var j = 0; j < 3; j++) {
      var gender = Math.random() > 0.45 ? '여' : '남';
      var names = gender === '남' ? NAMES_M : NAMES_F;
      var birth = randomDate(new Date(1985,0,1), new Date(2000,11,31));
      var regDate = randomDate(new Date(2025,10,1), new Date(2026,3,15));
      var distDate = new Date(regDate.getTime() + Math.random() * 3 * 86400000);
      var lastContact = new Date(distDate.getTime() + Math.random() * 30 * 86400000);
      var region = randomPick(REGIONS);
      MockAssociates.push({
        id: idSeq++,
        name: randomPick(names), phone: randomPhone(), gender: gender,
        birthDate: birth.toISOString(), age: Formatters.age(birth.toISOString()),
        education: randomPick(EDUCATIONS), school: randomPick(SCHOOLS_L),
        job: randomPick(JOBS), company: randomPick(COMPANIES_L),
        region: region, branch: regionToBranch(region), brand: randomPick(BRANDS),
        maritalStatus: Math.random() > 0.15 ? '초혼' : '재혼',
        status: randomPick(ASSOC_STATUSES_DIST),
        channel: randomPick(CHANNELS),
        consultant: mgr,
        distMethod: Math.random() > 0.4 ? '자동분배' : '수동분배',
        registeredAt: regDate.toISOString(),
        distributedAt: distDate.toISOString(),
        lastContactAt: lastContact.toISOString(),
        height: gender === '남' ? (170 + Math.floor(Math.random() * 15)) : (155 + Math.floor(Math.random() * 15)),
        weight: gender === '남' ? (65 + Math.floor(Math.random() * 20)) : (45 + Math.floor(Math.random() * 15)),
        bloodType: randomPick(BLOODS), children: Math.random() > 0.85 ? '있음' : '없음',
        religion: randomPick(RELIGIONS_LIST), hobby: randomPick(HOBBIES_LIST),
        hope: '', email: '', telHome: '', telOffice: '', phone2: '',
        duplicateEntries: [],
        contactHistory: [{ date: lastContact.toISOString(), type: '통화', content: '초기 상담 진행.', result: '상담중' }],
        sales: [],
      });
    }
  }

  // 2. 미분배 신규 유입 DB (15명)
  var NEW_DB = [
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
  for (var ni = 0; ni < NEW_DB.length; ni++) {
    var nd = NEW_DB[ni];
    var nr = randomPick(REGIONS);
    MockAssociates.push({
      id: idSeq++,
      name: nd.name, phone: nd.phone, gender: nd.gender,
      birthDate: nd.birth + 'T00:00:00.000Z', age: Formatters.age(nd.birth + 'T00:00:00.000Z'),
      education: nd.edu, school: '-', job: '-', company: '-',
      region: nr, branch: regionToBranch(nr), brand: randomPick(BRANDS),
      maritalStatus: '초혼', status: '컨텍전', channel: nd.channel,
      consultant: '', registeredAt: new Date().toISOString(),
      distributedAt: '', lastContactAt: '',
      height: nd.gender === '남' ? (170 + Math.floor(Math.random() * 15)) : (155 + Math.floor(Math.random() * 15)),
      weight: nd.gender === '남' ? (65 + Math.floor(Math.random() * 20)) : (45 + Math.floor(Math.random() * 15)),
      bloodType: randomPick(BLOODS), children: '없음', religion: randomPick(RELIGIONS_LIST),
      hobby: randomPick(HOBBIES_LIST), hope: '', email: '', telHome: '', telOffice: '', phone2: '',
      duplicateEntries: [], contactHistory: [], sales: [],
    });
  }

  // 3. 소스외 대상 (4명)
  var SOURCEOUT = [
    { name: '조민수', phone: '01088990011', gender: '남', birth: '1992-05-20', edu: '고졸', channel: '무료상담' },
    { name: '한동진', phone: '01099001122', gender: '남', birth: '1994-12-03', edu: '고졸', channel: '커플테스타' },
    { name: '김영수', phone: '01011223344', gender: '남', birth: '1958-04-10', edu: '대졸', channel: '자녀결혼' },
    { name: '박진영', phone: '0201234', gender: '남', birth: '1991-06-15', edu: '대졸', channel: '기타' },
  ];
  for (var si = 0; si < SOURCEOUT.length; si++) {
    var sd = SOURCEOUT[si];
    var sr = randomPick(REGIONS);
    MockAssociates.push({
      id: idSeq++,
      name: sd.name, phone: sd.phone, gender: sd.gender,
      birthDate: sd.birth + 'T00:00:00.000Z', age: Formatters.age(sd.birth + 'T00:00:00.000Z'),
      education: sd.edu, school: '-', job: '-', company: '-',
      region: sr, branch: regionToBranch(sr), brand: randomPick(BRANDS),
      maritalStatus: '초혼', status: '컨텍전', channel: sd.channel,
      consultant: '', registeredAt: new Date().toISOString(),
      distributedAt: '', lastContactAt: '',
      height: 0, weight: 0, bloodType: '', children: '', religion: '', hobby: '', hope: '',
      email: '', telHome: '', telOffice: '', phone2: '',
      duplicateEntries: [], contactHistory: [], sales: [],
    });
  }

  // 4. 중복 회원 (2명)
  var DUP = [
    { name: '김서연B', phone: MockAssociates[0] ? MockAssociates[0].phone : '01012345678', gender: '여', birth: '1993-02-14', edu: '대졸', channel: '카카오톡' },
    { name: '최수아B', phone: MockAssociates[1] ? MockAssociates[1].phone : '01098765432', gender: '여', birth: '1995-07-19', edu: '대졸', channel: '네이버커플' },
  ];
  for (var di = 0; di < DUP.length; di++) {
    var dd = DUP[di];
    var dr = randomPick(REGIONS);
    MockAssociates.push({
      id: idSeq++,
      name: dd.name, phone: dd.phone, gender: dd.gender,
      birthDate: dd.birth + 'T00:00:00.000Z', age: Formatters.age(dd.birth + 'T00:00:00.000Z'),
      education: dd.edu, school: '-', job: '-', company: '-',
      region: dr, branch: regionToBranch(dr), brand: randomPick(BRANDS),
      maritalStatus: '초혼', status: '컨텍전', channel: dd.channel,
      consultant: '', registeredAt: new Date().toISOString(),
      distributedAt: '', lastContactAt: '',
      height: 0, weight: 0, bloodType: '', children: '', religion: '', hobby: '', hope: '',
      email: '', telHome: '', telOffice: '', phone2: '',
      duplicateEntries: [], contactHistory: [], sales: [],
    });
  }

  // 5. 재컨텍 대상 (5명) — 기간만료 후 재유입
  var RECONTACT = [
    { name: '장윤정', phone: '01077112233', gender: '여', birth: '1991-08-14', edu: '대졸', pastMgr: '김지은', pastProgram: '실버(에메랄드)', meetings: 5, totalPay: 3500000, claim: false },
    { name: '오동현', phone: '01088223344', gender: '남', birth: '1987-02-28', edu: '석사', pastMgr: '정민수', pastProgram: '골드(사파이어)', meetings: 8, totalPay: 5800000, claim: true },
    { name: '한지민', phone: '01099334455', gender: '여', birth: '1993-12-05', edu: '대졸', pastMgr: '최유리', pastProgram: '브론즈', meetings: 2, totalPay: 1200000, claim: false },
    { name: '신동욱', phone: '01011445566', gender: '남', birth: '1989-06-17', edu: '박사', pastMgr: '한소희', pastProgram: '플래티늄(루비)', meetings: 12, totalPay: 9500000, claim: false },
    { name: '류하영', phone: '01022556677', gender: '여', birth: '1995-10-22', edu: '전문대졸', pastMgr: '강다연', pastProgram: '전문직', meetings: 3, totalPay: 2000000, claim: true },
  ];
  for (var ri = 0; ri < RECONTACT.length; ri++) {
    var rd = RECONTACT[ri];
    var rr = randomPick(REGIONS);
    MockAssociates.push({
      id: idSeq++,
      name: rd.name, phone: rd.phone, gender: rd.gender,
      birthDate: rd.birth + 'T00:00:00.000Z', age: Formatters.age(rd.birth + 'T00:00:00.000Z'),
      education: rd.edu, school: '-', job: '-', company: '-',
      region: rr, branch: regionToBranch(rr), brand: randomPick(BRANDS),
      maritalStatus: '초혼', status: '컨텍전',
      channel: '기간만료(재컨텍)',
      consultant: '', registeredAt: new Date().toISOString(),
      distributedAt: '', lastContactAt: '',
      height: rd.gender === '남' ? (170 + Math.floor(Math.random() * 15)) : (155 + Math.floor(Math.random() * 15)),
      weight: rd.gender === '남' ? (65 + Math.floor(Math.random() * 20)) : (45 + Math.floor(Math.random() * 15)),
      bloodType: randomPick(BLOODS), children: '없음', religion: randomPick(RELIGIONS_LIST),
      hobby: randomPick(HOBBIES_LIST), hope: '', email: '', telHome: '', telOffice: '', phone2: '',
      pastConsultant: rd.pastMgr,
      pastProgram: rd.pastProgram,
      pastMeetings: rd.meetings,
      pastTotalPayment: rd.totalPay,
      pastClaim: rd.claim,
      duplicateEntries: [], contactHistory: [], sales: [],
    });
  }

  // localStorage에서 분배 변경 내역 복원
  try {
    var saved = JSON.parse(localStorage.getItem('purples_dist_changes') || '{}');
    var keys = Object.keys(saved);
    for (var ki = 0; ki < keys.length; ki++) {
      var mid = parseInt(keys[ki]);
      for (var mi = 0; mi < MockAssociates.length; mi++) {
        if (MockAssociates[mi].id === mid) {
          var changes = saved[keys[ki]];
          for (var ck in changes) { MockAssociates[mi][ck] = changes[ck]; }
          break;
        }
      }
    }
        if (keys.length > 0) console.log('[compat] localStorage에서 분배 변경 ' + keys.length + '건 복원');
  } catch(e) {}

  _mockDataReady = true;
  console.log('[compat] Mock 데이터 ' + MockAssociates.length + '명 생성 완료');
}

// ── 즉시 초기화: Mock 데이터를 동기 생성 ──
_generateMockData();
