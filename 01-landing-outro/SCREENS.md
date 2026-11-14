# 화면 목록

담당: gyeongeun

| 순서 | 파일 | 화면 이름 | 들어오는 곳 | 나가는 곳 | 상태 값 |
|---|---|---|---|---|---|
| 1 | index.html | 랜딩 페이지 (지금 접수 중인 공고, 상황별 시작 안내, 용어 풀이 예시, 자주 묻는 질문) | ../index.html (시연 시작), outro.html (처음으로) | ../04-schedule-calendar/index.html (공고 보러 가기, 지금 모집 중인 공고 보기), ../03-notice-summary/index.html (보고 있는 공고문이 있어요), ../05-housing-tracker/index.html (상황 카드) | 없음 |
| 2 | about.html | 서비스 소개 (대상, 기능 4가지 상세, 이용 흐름, 운영 원칙) | index.html (상단 메뉴, 하단 링크) | index.html (로고, 상단 메뉴 이렇게 도와드려요 · 자주 묻는 질문), ../04-schedule-calendar/index.html, ../05-housing-tracker/index.html | 없음 |
| 3 | outro.html | 입주 완료 (아웃 페이지) | ../05-housing-tracker/application-detail.html (입주 완료 기록) | index.html (처음으로), ../04-schedule-calendar/index.html, ../05-housing-tracker/index.html | id=공고 id (예: outro.html?id=gwacheon-s12), id가 없으면 공고 정보 없이 표시 |

- 랜딩 페이지에는 왼쪽 메뉴가 없습니다. 주요 버튼은 일정 대시보드로 연결하고, '지금 어떤 상황이신가요?' 카드는 상황에 맞는 기능의 index.html로 연결합니다.
- 02 자가진단은 왼쪽 메뉴에서만 진입하므로(AGENTS.md 3장), 랜딩 페이지의 자가진단 상황 카드는 링크 없이 '왼쪽 메뉴의 자가진단'으로 안내만 합니다.
- '지금 챙길 공고' 예시와 모집 현황은 shared/sample-data.js 공고와 시연 기준일로 계산합니다.
- 아웃 페이지의 '진행 중인 공고 N건'은 스크랩 저장 키(phg-calendar-stars)에서 현재 공고를 뺀 수입니다.
- 아웃 페이지의 입주 후 체크리스트는 화면에서만 체크되며 저장하지 않습니다.
- 서비스 소개의 기능별 예시 화면은 실제 화면 캡처가 아니라 HTML로 그린 그림이며, 자가진단으로는 링크하지 않습니다.
- 일러스트(assets/*.svg)는 이 프로젝트를 위해 직접 그린 그림이며 외부 이미지를 쓰지 않습니다. 장식용이라 대체 텍스트를 비워 둡니다.
- 랜딩 페이지와 서비스 소개는 같은 상단 메뉴(홈, 서비스 소개, 이렇게 도와드려요, 자주 묻는 질문, 공고 보러 가기)를 씁니다. 좁은 화면에서도 메뉴 글자는 숨기지 않고, 지금 보고 있는 구역의 메뉴를 굵게 표시합니다.
- 입주 완료 화면 상단 메뉴에도 홈(index.html)을 두어, 어느 화면에서든 서비스 홈으로 돌아갈 수 있습니다.
