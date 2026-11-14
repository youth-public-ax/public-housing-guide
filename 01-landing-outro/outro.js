// 01 아웃 페이지(입주 완료): 05 상세 지원 현황에서 outro.html?id=공고id 로 들어옵니다. (IA.md 4장)
// id가 없거나 sample-data.js에 없는 값이면 공고 정보 없이 축하 화면만 보여줍니다.
(function () {
  const S = window.SAMPLE || { notices: [], today: '' };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => s.split('-').join('.');
  const md = (s) => { const p = s.split('-'); return Number(p[1]) + '.' + Number(p[2]); };

  // 링크 공유 환경에서는 주소 뒤 #공고id 도 받습니다. 예: outro.html#gwacheon-s12
  const id = new URLSearchParams(location.search).get('id') || location.hash.slice(1) || null;
  const n = S.notices.find((x) => x.id === id);

  if (n) {
    $('doneText').innerHTML = '<strong>' + esc(n.name) + '</strong>의 신청부터 계약까지 모든 과정을 마쳤습니다. 그동안 기록한 과정을 정리해 드립니다.';
    $('applyPeriod').textContent = md(n.apply.start) + '~' + md(n.apply.end);
    $('noticeInfo').innerHTML = [
      ['공고명', esc(n.name)],
      ['유형', esc(n.type)],
      ['공급 기관', esc(n.org)],
      ['지역', esc(n.region)],
      ['임대 조건', esc(n.rent)],
      ['공고 원문', '<a href="' + esc(n.link) + '" target="_blank" rel="noopener">공고 원문 사이트에서 확인하기</a>']
    ].map((r) => '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>').join('');
  } else {
    $('noticeBox').hidden = true;
  }

  // 스크랩 상태: 모든 기능이 같은 저장 키를 씁니다. (AGENTS.md 3장)
  let others = 0;
  try {
    const star = JSON.parse(localStorage.getItem('phg-calendar-stars')) || {};
    others = Object.keys(star).filter((k) => star[k] && k !== id).length;
  } catch (e) { /* 저장소를 쓸 수 없으면 0건으로 봅니다 */ }
  if (others > 0) {
    $('nextTitle').textContent = '아직 진행 중인 공고가 ' + others + '건 있습니다';
    $('nextText').textContent = '지원 트래킹 보드에서 남은 공고의 다음 할 일을 확인해 보세요.';
  }

  // 체크리스트 진행 수 (기록은 저장하지 않습니다)
  const boxes = Array.from(document.querySelectorAll('#checklist input'));
  const count = () => { $('checkCount').textContent = boxes.filter((b) => b.checked).length + ' / ' + boxes.length + ' 완료'; };
  boxes.forEach((b) => b.addEventListener('change', count));
  count();

  if (S.today) $('source').textContent = '공고 정보 출처: 마이홈포털, LH청약플러스, 각 공급기관 모집공고, ' + fmt(S.today) + ' 기준.';
})();
