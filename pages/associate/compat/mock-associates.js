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
var CONSULTANTS = ['이지연','김민희','박수정','최영미','한소영','정다은','서윤아','강미래','윤하나','오세은'];
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
  for (var i = 0; i < 25; i++) {
    var gender = Math.random() > 0.45 ? '여' : '남';
    var names = gender === '남' ? NAMES_M : NAMES_F;
    var birth = randomDate(new Date(1985,0,1), new Date(2000,11,31));
    var regDate = randomDate(new Date(2025,6,1), new Date(2026,3,15));
    var distDate = new Date(regDate.getTime() + Math.random() * 3 * 86400000);
    var lastContact = new Date(distDate.getTime() + Math.random() * 30 * 86400000);
    var region = randomPick(REGIONS);
    MockAssociates.push({
      id: i + 1,
      name: randomPick(names),
      phone: randomPhone(),
      gender: gender,
      birthDate: birth.toISOString(),
      age: Formatters.age(birth.toISOString()),
      education: randomPick(EDUCATIONS),
      school: randomPick(['서울대','연세대','고려대','성균관대','한양대','경희대','중앙대','건국대','이화여대','숙명여대']),
      job: randomPick(JOBS),
      company: randomPick(['삼성전자','LG전자','현대자동차','SK하이닉스','네이버','카카오','쿠팡','배민','토스','당근']),
      region: region,
      branch: regionToBranch(region),
      brand: randomPick(BRANDS),
      maritalStatus: Math.random() > 0.15 ? '초혼' : '재혼',
      status: randomPick(ASSOC_STATUSES.slice(0, 8)),
      channel: randomPick(CHANNELS),
      consultant: randomPick(CONSULTANTS),
      registeredAt: regDate.toISOString(),
      distributedAt: distDate.toISOString(),
      lastContactAt: lastContact.toISOString(),
      height: gender === '남' ? (170 + Math.floor(Math.random() * 15)) : (155 + Math.floor(Math.random() * 15)),
      weight: gender === '남' ? (65 + Math.floor(Math.random() * 20)) : (45 + Math.floor(Math.random() * 15)),
      bloodType: randomPick(BLOODS),
      children: Math.random() > 0.85 ? '있음' : '없음',
      religion: randomPick(RELIGIONS_LIST),
      hobby: randomPick(HOBBIES_LIST),
      hope: '', email: '', telHome: '', telOffice: '', phone2: '',
      duplicateEntries: [],
      contactHistory: [
        { date: lastContact.toISOString(), type: '통화', content: '초기 상담 진행. 관심도 높음.', result: '상담중' },
      ],
      sales: [],
    });
  }
  _mockDataReady = true;
}
