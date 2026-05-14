/* ========================================
   더미 데이터 — 통계 (ES Module)
   ======================================== */

export const MockMonthlySales = [
  { month: '7월', value: 82000000 }, { month: '8월', value: 95000000 },
  { month: '9월', value: 88000000 }, { month: '10월', value: 102000000 },
  { month: '11월', value: 98000000 }, { month: '12월', value: 115000000 },
  { month: '1월', value: 91000000 }, { month: '2월', value: 108000000 },
  { month: '3월', value: 120000000 }, { month: '4월', value: 105000000 },
];

export const MockTodos = [
  { text: '김서연 회원 방문상담 14:00', done: false, priority: 'critical' },
  { text: '이하은 회원 서류 검토', done: false, priority: 'high' },
  { text: '매칭 제안서 3건 발송', done: false, priority: 'medium' },
  { text: '신규 유입 DB 분배', done: true, priority: 'high' },
  { text: '주간 실적 보고서 작성', done: false, priority: 'low' },
];

export const MockStats = {
  managerRanking: [
    { name: '이지연', contacts: 45, meetings: 12, conversions: 5, rate: '41.7%' },
    { name: '김민희', contacts: 38, meetings: 10, conversions: 4, rate: '40.0%' },
    { name: '박수정', contacts: 42, meetings: 9, conversions: 3, rate: '33.3%' },
    { name: '최영미', contacts: 35, meetings: 8, conversions: 3, rate: '37.5%' },
    { name: '한소영', contacts: 30, meetings: 7, conversions: 2, rate: '28.6%' },
  ],
  statusDistribution: {
    associate: [
      { label: '컨텍전', value: 45, color: '#3b82f6' },
      { label: '상담진행', value: 82, color: '#f59e0b' },
      { label: '방문상담', value: 18, color: '#8b5cf6' },
      { label: '가입진행', value: 12, color: '#10b981' },
      { label: '진행불가', value: 23, color: '#ef4444' },
      { label: 'DB정리/만료', value: 15, color: '#6b7280' },
    ],
    regular: [
      { label: '활동', value: 45, color: 'var(--status-green)' },
      { label: '교제', value: 12, color: 'var(--status-pink)' },
      { label: '보류', value: 8, color: 'var(--status-amber)' },
      { label: '만료', value: 15, color: 'var(--status-gray)' },
      { label: '성혼', value: 5, color: 'var(--gold-500)' },
    ],
  },
  matchingStats: {
    totalSent: 156, accepted: 48, rejected: 72, pending: 36,
    successRate: '30.8%', avgDays: 4.2,
  },
  safeNumbers: [
    { id: 1, male: '박서준', female: '김하늘', number: '0507-1234-5678', status: '활성', issuedAt: '2026-04-15' },
    { id: 2, male: '이정훈', female: '최수아', number: '0507-2345-6789', status: '활성', issuedAt: '2026-04-20' },
    { id: 3, male: '정민호', female: '한유진', number: '0507-3456-7890', status: '회수', issuedAt: '2026-03-10', revokedAt: '2026-04-05' },
  ],
  dating: [
    { id: 1, male: '박서준', female: '김하늘', status: '임시교제', startDate: '2026-04-10', dayCount: 19, dueDate: '2026-05-01' },
    { id: 2, male: '이정훈', female: '최수아', status: '교제', startDate: '2026-03-15', dayCount: 45 },
    { id: 3, male: '정민호', female: '한유진', status: '파기', startDate: '2026-02-20', endDate: '2026-03-25' },
  ],
  contracts: [
    { id: 1, memberName: '박서준', program: '다이아', contractType: '횟수제', joinDate: '2026-01-15', expiryDate: '2027-01-15', status: '활동', remainMeetings: 8 },
    { id: 2, memberName: '김하늘', program: '골드', contractType: '기간제', joinDate: '2026-02-10', expiryDate: '2027-02-10', status: '활동', remainDays: 287 },
    { id: 3, memberName: '이정훈', program: '사파이어', contractType: '인증제', joinDate: '2026-03-05', expiryDate: '2027-03-05', status: '인증중', remainDays: 310 },
    { id: 4, memberName: '최수아', program: '골드', contractType: '횟수제', joinDate: '2026-03-20', expiryDate: '2027-03-20', status: '활동', remainMeetings: 5 },
    { id: 5, memberName: '정민호', program: '프로(전문직)', contractType: '인증제', joinDate: '2026-01-08', expiryDate: '2027-07-08', status: '활동', remainDays: 435 },
  ],
};

export const MockNotifications = [
  { icon: '', title: '신규 유입', desc: '김민준 — 네이버커플 채널', time: '5분 전', type: 'info' },
  { icon: '', title: '정회원 전환', desc: '박지유 — 골드 프로그램', time: '15분 전', type: 'success' },
  { icon: '', title: '매칭 수락', desc: '이서준 ♥ 최수아', time: '30분 전', type: 'success' },
  { icon: '', title: '서류 미비', desc: '강예린 — 재직증명서 미제출', time: '1시간 전', type: 'warning' },
  { icon: '', title: '미팅 예정', desc: '한성민 — 오후 3시 방문상담', time: '2시간 전', type: 'info' },
  { icon: '', title: '만료 임박', desc: '조윤서 — 약정 만료 7일 전', time: '3시간 전', type: 'warning' },
];
