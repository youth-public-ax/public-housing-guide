# 화면 목록

담당: sungyoon

| 순서 | 파일 | 화면 이름 | 들어오는 곳 | 나가는 곳 | 상태 값 |
|---|---|---|---|---|---|
| 1 | index.html | 자가진단 시작 | 왼쪽 메뉴 자가진단 | question.html | 없음 |
| 2 | question.html | 자가진단 질문 | index.html, result.html | result.html, index.html | q=문항 번호 (예: question.html?q=5) |
| 3 | result.html | 자가진단 결과 | question.html, 재방문 시 왼쪽 메뉴 | question.html | state=empty (맞는 공고 없음) |

재방문 시 결과 화면이 바로 열리는 동작은 시연에서 result.html로 직접 이동해 보여줍니다.
