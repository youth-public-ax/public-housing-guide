// 01 랜딩 페이지: 모집 현황과 '지금 챙길 공고' 예시를 shared/sample-data.js 값으로 채웁니다. (AGENTS.md 6장)
(function () {
  const S = window.SAMPLE;
  if (!S) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const parse = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const fmt = (s) => s.split('-').join('.');
  const md = (s) => { const p = s.split('-'); return Number(p[1]) + '.' + Number(p[2]); };
  const DAY = 86400000;
  const TODAY = parse(S.today);
  const diff = (s) => Math.round((parse(s) - TODAY) / DAY);

  // 접수 상태: 시연 기준일로 계산합니다.
  const items = S.notices.map((n) => {
    const toStart = diff(n.apply.start);
    const toEnd = diff(n.apply.end);
    let status, dday, small, sortKey;
    if (toStart > 0) { status = '접수 예정'; dday = 'D-' + toStart; small = '접수 시작'; sortKey = 100 + toStart; }
    else if (toEnd >= 0) { status = '접수 중'; dday = toEnd === 0 ? 'D-day' : 'D-' + toEnd; small = '접수 마감'; sortKey = toEnd; }
    else { status = '접수 마감'; dday = '마감'; small = ''; sortKey = 999; }
    return { n, status, dday, small, sortKey, urgent: status === '접수 중' && toEnd <= 2 };
  }).sort((a, b) => a.sortKey - b.sortKey);

  const open = items.filter((i) => i.status === '접수 중');
  const soon = items.filter((i) => i.status === '접수 예정');

  $('previewTitle').textContent = open.length ? '지금 접수 중인 공고 ' + open.length + '건' : '곧 열리는 공고';
  $('previewDate').textContent = fmt(S.today) + ' 기준';
  $('previewList').innerHTML = items.filter((i) => i.status !== '접수 마감').map((i) =>
    '<li class="preview-item">' +
      '<span class="dday' + (i.urgent ? ' urgent' : '') + '"><b>' + esc(i.dday) + '</b><small>' + esc(i.small) + '</small></span>' +
      '<div><span class="pi-tags"><em>' + esc(i.status) + '</em>' + esc(i.n.type) + ' · ' + esc(i.n.region) + '</span>' +
      '<strong>' + esc(i.n.name) + '</strong>' +
      '<span>접수 ' + md(i.n.apply.start) + '~' + md(i.n.apply.end) + ' · ' + esc(i.n.org) + '</span></div>' +
    '</li>'
  ).join('');

  const first = open[0];
  $('previewFoot').textContent = first
    ? (first.urgent ? '마감이 얼마 남지 않았습니다. ' : '') + '가장 먼저 마감되는 공고는 ' + md(first.n.apply.end) + '에 접수를 마칩니다.'
    : (soon.length ? '접수 예정 공고 ' + soon.length + '건이 곧 열립니다.' : '');
  if (!first) $('ctaTitle').innerHTML = '곧 접수가 열리는 공고가 있습니다.<br>미리 확인해 두세요.';

  $('source').textContent = '공고 정보 출처: 마이홈포털, LH청약플러스, 각 공급기관 모집공고, ' + fmt(S.today) + ' 기준. 시연 기준일은 ' + fmt(S.today) + '이며, 공고 내용은 변경될 수 있습니다.';
})();

// 상단 메뉴: '이렇게 도와드려요', '자주 묻는 질문'을 누르면 랜딩에서 그 구역만 단독으로 보여줍니다.
// 주소 뒤의 값(#situations, #faq)으로 전환하며, '홈'(#top)이나 값이 없으면 랜딩 전체를 보여줍니다.
(function () {
  const SOLO = ['situations', 'faq'];
  const main = document.getElementById('main');
  const links = [...document.querySelectorAll('.topnav a[data-section]')];
  if (!main || !links.length) return;
  const blocks = [...main.children];
  const apply = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    const solo = SOLO.includes(h) ? h : null;
    blocks.forEach((b) => { b.hidden = solo ? b.id !== solo : false; });
    const cur = solo || 'top';
    links.forEach((a) => { if (a.dataset.section === cur) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    if (solo || h === "top" || h === "") window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', apply);
  apply();
})();
