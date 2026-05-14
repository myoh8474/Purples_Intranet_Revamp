/* ========================================
   유틸리티 — 포맷터 (ES Module)
   ======================================== */

export const Formatters = {
  date(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },
  shortDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  },
  money(num) {
    if (!num && num !== 0) return '-';
    return new Intl.NumberFormat('ko-KR').format(num) + '원';
  },
  phone(p) {
    if (!p) return '-';
    return p.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  },
  age(birthDate) {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  },
  statusBadge(status, type) {
    const map = type === 'associate' ? {
      '컨텍전': 'blue', '부재중(미컨텍)': 'amber', '부재중': 'amber',
      '장기상담(컨텍)': 'orange', '장기상담': 'orange',
      '낮음(컨텍)': 'red', '컨텍중(낮음)': 'red',
      '보통(컨텍)': 'purple', '중간(컨텍)': 'purple', '컨텍중(보통)': 'purple',
      '높음(컨텍)': 'green', '컨텍중(높음)': 'green',
      '가입보류(컨텍)': 'orange', '가입보류': 'orange',
      '방문상담': 'green-dark', '가입중': 'purple-dark', '가입진행예정': 'purple-dark',
      '가입완료': 'green-dark', '기간만료(재컨텍)': 'gray',
      '변경': 'gray', '중복': 'gray', '불가': 'red',
    } : {
      '신규': 'blue', '인증중': 'blue', '활동대기': 'amber', '활동': 'green',
      '임시교제': 'pink', '교제': 'pink', '외부교제': 'pink',
      '약정보류': 'amber', '임시보류': 'orange', '장기보류': 'orange', '강제보류': 'red',
      '약정만료': 'gray', '자동만료': 'gray', '만료': 'gray', '기타만료': 'gray',
      '탈회진행': 'red', '탈회': 'red', '결혼예정': 'purple-dark', '성혼': 'gold',
    };
    const color = map[status] || 'gray';
    return `<span class="badge badge--${color} badge--dot">${status}</span>`;
  },
};
