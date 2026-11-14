# 화면 목록

| 순서 | 파일 | 화면 이름 | 들어오는 곳 | 나가는 곳 | 상태 값 |
|---|---|---|---|---|---|
| 1 | index.html | 지원 트래킹 보드 | 왼쪽 메뉴 지원 트래킹 보드, 04 일정 대시보드 지금 챙길 공고, application-detail.html 뒤로가기 | application-detail.html?id=&from=board (공고 카드), ../04-schedule-calendar/index.html (카드의 다음 일정) | reset=1 (시연 기록 초기화) |
| 2 | application-detail.html | 상세 지원 현황 | index.html 공고 카드, 03 공고 상세 세그먼트 [지원 현황] | ../03-notice-summary/notice-detail.html?id=&from= (세그먼트 [공고 상세], 스크랩 해제), index.html 또는 ../04-schedule-calendar/index.html (뒤로가기, from 값 기준), ../01-landing-outro/outro.html (입주 완료 기록), ../04-schedule-calendar/index.html (다른 공고 보기) | id=공고 id, from=board 또는 calendar |

## 화면 안의 요소

| 화면 | 요소 | 동작 |
|---|---|---|
| index.html | 결과 기록 창 | 카드를 다음 단계로 끌어 놓으면 지금 단계 결과와 메모를 기록합니다. 이전 단계로 끌어 놓으면 되돌리기 확인 창을 띄웁니다. |
| index.html | 종료 아코디언 | 미선정, 비대상, 지원 중단, 입주 완료 공고를 접어 둡니다. 카드를 끌어 놓으면 종료하고, 종료 칸 카드를 다시 끌어 진행 칸으로 되돌릴 수 있습니다. |
| application-detail.html | 단계 타임라인 | 단계를 누르면 오른쪽에 지나온 단계는 기록, 지금 단계는 결과 입력, 앞으로 할 단계는 공식 일정을 보여줍니다. |
| application-detail.html | 스크랩 해제 확인 창 | 해제하면 스크랩과 지원 기록을 지우고 공고 상세로 이동합니다. |

## 데이터

- 공고와 날짜: shared/sample-data.js의 notices 3개와 trackedNotices 1개를 씁니다. D-day는 SAMPLE.today 기준으로 계산합니다.
- 세부 단계가 없는 notices 공고는 접수 일정만 채우고 나머지 단계는 '일정 미정'으로 표시합니다.
- 지원 기록 초기값: tracker.js의 SEED (05 전용 시연 데이터)
- 저장 키: phg-tracker-records (05 전용 지원 기록), phg-calendar-stars (스크랩, 공통)
- 보드에는 스크랩한 공고만 표시합니다. 05에 처음 들어오면 초기 공고 4개를 스크랩 목록에 한 번 추가합니다.
- application-detail.html은 id가 없으면 sh-youth-buy-2026-1을 보여주고, 스크랩하지 않은 공고는 공고 상세로 이동합니다.
