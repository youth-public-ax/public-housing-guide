// 04 일정 대시보드: 월간 캘린더, 별표 등록, 공고 요약, 공급 기관 필터
// 공고와 날짜는 shared/sample-data.js 값을 사용합니다. (AGENTS.md 6장)
(function () {
  const S = window.SAMPLE;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => (n < 10 ? '0' : '') + n;
  const key = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parse = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const fmt = (s) => { const p = s.split('-'); return p[0] + '.' + p[1] + '.' + p[2]; };
  const md = (s) => { const p = s.split('-'); return Number(p[1]) + '.' + Number(p[2]); };
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  const DAY = 86400000;

  // 상태 값: ?state=first 이면 등록한 공고가 없는 첫 방문 화면
  const params = new URLSearchParams(location.search);
  const firstVisit = params.get('state') === 'first';

  const TODAY = parse(S.today);
  const TYPES = {
    start: { ch: '시', label: '접수 시작', cls: 't-start' },
    ing: { ch: '중', label: '접수 중', cls: 't-ing' },
    end: { ch: '마', label: '접수 마감', cls: 't-end' }
  };

  // 기관 이름의 첫 단어를 필터 이름으로 사용합니다. 예: 'LH 한국토지주택공사' → 'LH'
  const orgShort = (org) => org.split(' ')[0];
  // 캘린더 칸에는 '과천 행복주택'처럼 지역 + 유형으로 짧게 표시합니다.
  const placeOf = (region) => (region.split(' ')[1] || region).split(',')[0].replace(/(시|군|구)$/, '');
  const notices = S.notices.map((n) => Object.assign({}, n, { orgShort: orgShort(n.org), place: placeOf(n.region) }));
  const byId = {};
  notices.forEach((n) => { byId[n.id] = n; });

  // 날짜별 일정 만들기: 접수 시작일, 접수 기간 중, 접수 마감일
  const EVENTS = {};
  notices.forEach((n) => {
    const a = parse(n.apply.start);
    const b = parse(n.apply.end);
    for (let t = a.getTime(); t <= b.getTime(); t += DAY) {
      const d = new Date(t);
      const type = t === a.getTime() ? 'start' : (t === b.getTime() ? 'end' : 'ing');
      (EVENTS[key(d)] = EVENTS[key(d)] || []).push({ id: n.id, type });
    }
  });

  // 등록(별표) 상태: 이 브라우저에만 저장합니다.
  const STORE = 'phg-calendar-stars';
  let star = {};
  if (!firstVisit) {
    star = { 'gwacheon-s12': true };
    try { const saved = JSON.parse(localStorage.getItem(STORE)); if (saved) star = saved; } catch (e) { /* 저장소를 쓸 수 없으면 기본값 사용 */ }
  }
  const saveStar = () => { if (firstVisit) return; try { localStorage.setItem(STORE, JSON.stringify(star)); } catch (e) { /* 무시 */ } };

  const state = {
    year: TODAY.getFullYear(),
    month: TODAY.getMonth(),
    sel: key(TODAY),
    off: {},
    org: 'all',
    starOnly: false,
    open: firstVisit ? null : 'gwacheon-s12'
  };

  const visible = (e) => !state.off[e.type] && (state.org === 'all' || byId[e.id].orgShort === state.org) && (!state.starOnly || star[e.id]);
  const eventsOn = (k) => (EVENTS[k] || []).filter(visible);
  const ddayOf = (s) => { const diff = Math.round((parse(s) - TODAY) / DAY); return diff > 0 ? 'D-' + diff : (diff === 0 ? 'D-day' : '마감'); };

  function toggleStar(id) {
    star[id] = !star[id];
    if (!star[id]) delete star[id];
    saveStar();
    render();
  }

  function renderLegend() {
    $('legend').innerHTML = Object.keys(TYPES).map((k) => {
      const t = TYPES[k];
      return '<button type="button" class="' + t.cls + '" data-type="' + k + '" aria-pressed="' + (!state.off[k]) + '"><span class="badge">' + t.ch + '</span>' + t.label + '</button>';
    }).join('');
  }

  function renderOrgs() {
    const orgs = ['all'].concat(Array.from(new Set(notices.map((n) => n.orgShort))));
    $('orgFilter').innerHTML = orgs.map((o) => '<button type="button" data-org="' + esc(o) + '" aria-pressed="' + (state.org === o) + '">' + (o === 'all' ? '전체' : esc(o)) + '</button>').join('');
    $('starOnly').setAttribute('aria-pressed', String(state.starOnly));
  }

  function renderDays() {
    $('monthTitle').textContent = state.year + '년 ' + (state.month + 1) + '월';
    const first = new Date(state.year, state.month, 1);
    const start = new Date(state.year, state.month, 1 - first.getDay());
    const last = new Date(state.year, state.month + 1, 0);
    const cells = Math.ceil((first.getDay() + last.getDate()) / 7) * 7;
    let html = '';
    for (let i = 0; i < cells; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const k = key(d);
      const inMonth = d.getMonth() === state.month;
      const list = inMonth ? eventsOn(k) : [];
      const past = d < TODAY;
      const cls = ['day'];
      if (!inMonth) cls.push('out');
      if (d.getDay() === 0) cls.push('sun');
      if (k === key(TODAY)) cls.push('today');
      if (k === state.sel && k !== key(TODAY)) cls.push('selected');
      const label = (d.getMonth() + 1) + '월 ' + d.getDate() + '일, 일정 ' + list.length + '개';
      html += '<div class="' + cls.join(' ') + '">';
      html += '<span class="day-top"><button type="button" class="day-num" data-day="' + k + '" aria-label="' + label + '">' + d.getDate() + '</button>';
      html += '<span class="day-more">' + (list.length > 4 ? '+' + (list.length - 4) : '') + '</span></span>';
      list.slice(0, 4).forEach((e) => {
        const n = byId[e.id];
        const t = TYPES[e.type];
        const on = !!star[e.id];
        html += '<span class="chip' + (past ? ' past' : '') + '">';
        html += '<button type="button" class="chip-star" data-star="' + e.id + '" aria-pressed="' + on + '" aria-label="' + esc(n.name) + (on ? ' 등록 해제' : ' 내 캘린더에 등록') + '">' + (on ? '★' : '☆') + '</button>';
        html += '<button type="button" class="chip-open ' + t.cls + (on ? ' on' : '') + (state.open === e.id ? ' active' : '') + '" data-open="' + e.id + '" data-day="' + k + '" aria-label="' + esc(n.name) + ' ' + t.label + ', 요약 보기"><span class="badge">' + t.ch + '</span><span class="name">' + esc(n.place) + ' ' + esc(n.type) + '</span></button>';
        html += '</span>';
      });
      html += '</div>';
    }
    $('days').innerHTML = html;
  }

  function renderSummary() {
    const box = $('summary');
    const n = state.open && byId[state.open];
    if (!n) { box.hidden = true; box.innerHTML = ''; return; }
    const on = !!star[n.id];
    const dd = ddayOf(n.apply.end);
    box.hidden = false;
    box.innerHTML =
      '<div class="summary-head"><div>' +
      '<span class="summary-meta"><span class="org-tag">' + esc(n.orgShort) + '</span>' + esc(n.type) + (on ? '<span class="star-mark">★ 등록됨</span>' : '') + '</span>' +
      '<h2>' + esc(n.name) + '</h2></div>' +
      '<button type="button" class="close-btn" data-close aria-label="공고 요약 닫기"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
      '<dl>' +
      '<dt>공급 기관</dt><dd>' + esc(n.org) + '</dd>' +
      '<dt>지역</dt><dd>' + esc(n.region) + '</dd>' +
      '<dt>접수 기간</dt><dd>' + md(n.apply.start) + ' ~ ' + md(n.apply.end) + '<span class="dday">' + dd + '</span></dd>' +
      '<dt>임대 조건</dt><dd>' + esc(n.rent) + '</dd>' +
      '</dl>' +
      '<div class="summary-actions">' +
      '<button type="button" class="star-btn" data-star="' + n.id + '" aria-pressed="' + on + '">' + (on ? '★ 등록 해제' : '☆ 내 캘린더에 등록') + '</button>' +
      '<a class="detail-btn" href="../05-housing-tracker/index.html">공고 상세 보기</a>' +
      '</div>' +
      '<a class="summary-link" href="' + esc(n.link) + '" target="_blank" rel="noopener">공고 원문 사이트에서 확인하기</a>' +
      '<span class="summary-note">최종 신청 자격은 공고문과 공급 기관에서 확인하시기 바랍니다.</span>';
  }

  function renderDayPanel() {
    const d = parse(state.sel);
    const isToday = state.sel === key(TODAY);
    const label = (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + WD[d.getDay()] + ')';
    $('dayTitle').textContent = (isToday ? '오늘 · ' : '') + label;
    const list = eventsOn(state.sel);
    $('dayCount').textContent = list.length + '개';
    if (!list.length) {
      $('dayList').innerHTML = '<p class="empty">이날은 표시할 일정이 없습니다.</p>';
      return;
    }
    const past = d < TODAY;
    $('dayList').innerHTML = list.map((e) => {
      const n = byId[e.id];
      const t = TYPES[e.type];
      return '<button type="button" class="ev ' + t.cls + (past ? ' past' : '') + '" data-open="' + e.id + '">' +
        '<span class="ev-body"><span class="ev-name">' + (star[e.id] ? '<span class="star-mark">★ </span>' : '') + esc(n.name) + '</span>' +
        '<span class="ev-sub"><span class="tag">' + t.label + '</span>' + esc(n.orgShort) + ' · 마감 ' + md(n.apply.end) + '</span></span>' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A85" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>';
    }).join('');
  }

  function renderTodo() {
    const box = $('todo');
    const mine = notices.filter((n) => star[n.id]);
    if (!mine.length) {
      box.hidden = false;
      box.innerHTML = '<h2>등록한 공고가 없습니다</h2>' +
        '<div class="first-visit"><p class="empty">캘린더의 공고 옆 ☆를 누르면 내 캘린더에 등록되고, 접수 마감이 가까운 공고를 여기에서 알려드립니다.</p>' +
        '<a class="btn btn-primary" href="../03-notice-summary/index.html">공고 링크로 바로 추가</a></div>';
      return;
    }
    // 요약 카드가 열려 있으면 공간을 위해 숨깁니다.
    box.hidden = !!(state.open && byId[state.open]);
    const items = mine
      .filter((n) => parse(n.apply.end) >= TODAY)
      .sort((a, b) => parse(a.apply.end) - parse(b.apply.end));
    box.innerHTML = '<h2>지금 챙길 공고</h2>' + (items.length
      ? items.map((n) => '<button type="button" class="todo-item" data-open="' + n.id + '"><span>접수 마감 ' + md(n.apply.end) + ' · ' + esc(n.type) + ' ' + esc(n.region) + '</span><strong>' + ddayOf(n.apply.end) + '</strong></button>').join('')
      : '<p class="empty">접수 중인 등록 공고가 없습니다.</p>');
  }

  function render() {
    renderLegend();
    renderOrgs();
    renderDays();
    renderSummary();
    renderDayPanel();
    renderTodo();
  }

  // 이벤트 위임
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('button');
    if (!el) return;
    if (el.dataset.star) { toggleStar(el.dataset.star); return; }
    if (el.dataset.open) {
      state.open = el.dataset.open;
      if (el.dataset.day) state.sel = el.dataset.day;
      render();
      return;
    }
    if (el.hasAttribute('data-close')) { state.open = null; render(); return; }
    if (el.dataset.day) { state.sel = el.dataset.day; render(); return; }
    if (el.dataset.type) { state.off[el.dataset.type] = !state.off[el.dataset.type]; render(); return; }
    if (el.dataset.org) { state.org = el.dataset.org; render(); return; }
    if (el.id === 'starOnly') { state.starOnly = !state.starOnly; render(); return; }
    if (el.id === 'prevMonth' || el.id === 'nextMonth') {
      const d = new Date(state.year, state.month + (el.id === 'prevMonth' ? -1 : 1), 1);
      state.year = d.getFullYear(); state.month = d.getMonth();
      render();
      return;
    }
    if (el.id === 'todayBtn') {
      state.year = TODAY.getFullYear(); state.month = TODAY.getMonth(); state.sel = key(TODAY);
      render();
    }
  });

  $('source').textContent = '공고 정보 출처: 마이홈포털, LH청약플러스, 각 공급기관 모집공고, ' + fmt(S.today) + ' 기준. 시연 기준일은 ' + fmt(S.today) + '이며, 공고 내용은 변경될 수 있습니다.';
  render();
})();
