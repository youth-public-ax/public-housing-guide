# 화면 목록

담당: seungbeom

| 순서 | 파일 | 화면 이름 | 들어오는 곳 | 나가는 곳 | 상태 값 |
|---|---|---|---|---|---|
| 1 | index.html | 일정 대시보드 (월간 캘린더, 공고 요약, 공급 기관 필터) | 왼쪽 메뉴 일정 대시보드 | ../03-notice-summary/notice-detail.html?id=&from=calendar (공고 요약의 공고 상세 보기), ../05-housing-tracker/index.html (지금 챙길 공고), ../03-notice-summary/index.html (공고 링크로 바로 추가) | state=first (첫 방문, 스크랩한 공고 없음) |

- 캘린더에는 shared/sample-data.js 공고의 접수 시작, 접수 중, 접수 마감 일정을 표시합니다.
- 공고 옆 ☆를 누르면 스크랩되고(★), 스크랩 상태는 이 브라우저에만 저장됩니다.
- 캘린더나 오른쪽 일정 목록에서 공고를 누르면 오른쪽에 공고 요약이 열립니다. 별도 화면이 아니라 index.html 안의 패널입니다.
- 상단 필터: 일정 유형, 공급 기관(전체와 sample-data.js의 기관), 스크랩한 공고만 보기.
