# 화면 목록

담당: sion

| 순서 | 파일 | 화면 이름 | 들어오는 곳 | 나가는 곳 | 상태 값 |
|---|---|---|---|---|---|
| 1 | index.html | 공고 추가 (링크 · 텍스트 붙여넣기 · 직접 입력, 분석 진행) | 왼쪽 메뉴 + 공고 추가, ../04-schedule-calendar/index.html (공고 링크로 바로 추가) | review.html, notice-detail.html (스크랩한 공고), ../04-schedule-calendar/index.html | state=loading (분석 중), state=fail (링크를 읽지 못함) |
| 2 | review.html | AI 공고 카드 확인 · 저장 | index.html | notice-detail.html?id=&from=calendar (저장하면 자동 스크랩), index.html | id=공고 id |
| 3 | notice-detail.html | 공고 상세 (AI 정리, 용어 풀이, AI 설명 패널) | ../04-schedule-calendar/index.html (공고 상세 보기), ../05-housing-tracker/application-detail.html (세그먼트 공고 상세), review.html | ../05-housing-tracker/application-detail.html?id=&from= (세그먼트 지원 현황), 뒤로 가기: from=calendar 이면 ../04-schedule-calendar/index.html, from=board 이면 ../05-housing-tracker/index.html | id=공고 id, from=calendar 또는 board |

- 공고 상세와 상세 지원 현황의 연결, 스크랩과 세그먼트 컨트롤 동작은 IA.md 3장을 따릅니다.
- 스크랩하지 않은 공고는 세그먼트의 지원 현황 칸이 잠겨 보이고, 누르면 스크랩한 뒤 상세 지원 현황으로 이동합니다. 스크랩을 해제하면 확인 창을 띄웁니다.
- 스크랩 상태는 브라우저 저장 키 phg-calendar-stars를 씁니다.
- 용어 풀이와 AI 설명 패널은 별도 화면이 아니라 notice-detail.html, review.html 안의 패널입니다. 밑줄 단어는 notice-data.js의 용어 사전에서 찾아 자동으로 표시합니다.
- AI 분석과 답변은 시연용 예시입니다. 공고 추가에서는 어떤 링크를 넣어도 예시 공고(gyeongnam-youth-2026)로 결과를 보여줍니다.
- 공고는 shared/sample-data.js의 notices와 trackedNotices에서 찾습니다. 공고에 steps(공고문 세부 단계)가 있으면 그 일정을 그대로 보여주고, 오늘 날짜로 지남 · 진행 중 · 다음 일정을 표시합니다. 예: notice-detail.html?id=sh-youth-buy-2026-1
- steps가 없는 공고의 접수 이후 일정은 notice-data.js에 예시 값으로 두었고 화면에 (예시)로 표시합니다.
