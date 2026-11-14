// 시연용 공통 예시 데이터입니다. 모든 기능이 같은 값을 사용합니다. (AGENTS.md 6장)
// 공고 정보 출처: 마이홈포털, LH청약플러스, 각 공급기관 모집공고 (2026.11.10 기준)
// 영상 제작 전에 각 공고 원문과 한 번 더 대조합니다.
window.SAMPLE = {
  // 시연 기준일: D-day와 접수 상태는 이 날짜로 계산합니다.
  today: '2026-11-10',

  // 예시 사용자: 경기 지역 입주를 희망하는 미혼 1인 청년
  user: {
    age: '만 19~39세',
    region: '경기',
    household: '미혼 1인 가구',
    homeless: '본인과 세대원 모두 무주택',
    income: '월 381만원 이하 (도시근로자 월평균소득 100% 이하)',
    asset: '2억 5,100만원 이하',
    job: '직장인, 사회초년생',
    savings: '잘 모르겠습니다',
    interest: ['행복주택', '청년 매입임대']
  },

  notices: [
    {
      id: 'gwacheon-s12',
      name: '과천지식정보타운 S12블록 행복주택 입주자 모집',
      type: '행복주택',
      org: 'LH 한국토지주택공사',
      region: '경기 과천시',
      apply: { start: '2026-11-10', end: '2026-11-12' },
      rent: '16A형 보증금 6,192만원, 월 24만 7,680원 (청년, 소득 있음)',
      link: 'https://apply.lh.or.kr'
    },
    {
      id: 'jecheon-yeongcheon',
      name: '제천 영천동 행복주택 추가(예비)입주자 모집',
      type: '행복주택',
      org: '충북개발공사',
      region: '충북 제천시',
      apply: { start: '2026-11-09', end: '2026-11-19' },
      rent: '33A형 보증금 1,414만 8,000원, 월 11만 3,180원 (청년, 소득 있음)',
      link: 'https://www.myhome.go.kr'
    },
    {
      id: 'gyeongnam-youth-2026',
      name: '2026년도 청년매입임대주택 입주자 모집 (진주시, 김해시)',
      type: '청년 매입임대',
      org: '경남개발공사',
      region: '경남 진주시, 김해시',
      apply: { start: '2026-11-16', end: '2026-11-18' },
      rent: '2, 3순위 보증금 200만원, 월 약 23만원 (시세 50%)',
      link: 'https://www.myhome.go.kr'
    }
  ],

  // 공고 상세(03 notice-detail.html)와 상세 지원 현황(05 application-detail.html)에서 쓰는 공고입니다.
  // 접수가 끝난 뒤 진행 중인 공고라 자가진단(02)과 일정 대시보드(04)의 notices에는 넣지 않습니다.
  // 출처: SH인터넷청약시스템 주택임대 공고 (2026.6.26 공고, 2026.11.14 확인)
  trackedNotices: [
    {
      id: 'sh-youth-buy-2026-1',
      name: '2026년 1차 청년 매입임대주택 입주자 모집공고',
      type: '청년 매입임대',
      org: 'SH 서울주택도시개발공사',
      region: '서울',
      posted: '2026-06-26',
      apply: { start: '2026-07-13', end: '2026-07-15' },
      rent: '주택별 상이 (공고문 주택목록 참조)',
      link: 'https://www.i-sh.co.kr/app/lay2/program/S48T1581C563/www/brd/m_247/view.do?multi_itm_seq=2&seq=306214',
      // 세부 진행 단계: start, end는 날짜 계산용이고 text는 공고문 표기 그대로입니다.
      steps: [
        { key: 'apply', label: '인터넷 청약신청', start: '2026-07-13', end: '2026-07-15', text: '2026. 7. 13.(월) 10:00 ~ 7. 15.(수) 17:00' },
        { key: 'doc-announce', label: '서류심사대상자 발표', start: '2026-07-20', end: '2026-07-20', text: '2026. 7. 20.(월) 16:00 예정' },
        { key: 'doc-review', label: '서류심사대상자 입주자격 심사', start: '2026-07-20', end: '2026-11-30', text: '~ 2026. 11월' },
        { key: 'winner', label: '당첨자 및 예비자 발표', start: '2026-11-20', end: '2026-11-20', text: '2026. 11. 20.(금) 16:00 예정' },
        {
          key: 'contract', label: '당첨자 계약', start: '2026-12-07', end: '2026-12-10', text: '2026. 12. 7.(월) ~ 12. 10.(목)',
          sub: [
            { label: '온라인(전자)계약 기간', start: '2026-12-07', end: '2026-12-09', text: '2026. 12. 7.(월) ~ 12. 9.(수)' },
            { label: '방문 계약 기간', start: '2026-12-10', end: '2026-12-10', text: '2026. 12. 10.(목)' }
          ]
        },
        { key: 'move-in', label: '입주기간', start: '2026-12-28', end: '2027-02-25', text: '2026. 12. 28.(월) ~ 2027. 2. 25.(목)' }
      ]
    }
  ]
};
