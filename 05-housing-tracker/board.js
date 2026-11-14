// 05 지원 트래킹 보드: 스크랩한 공고를 단계별 칸반으로 보여주고, 끌어서 옮기면 결과를 기록합니다.
(function () {
  const T = window.TRACKER;
  const $ = (id) => document.getElementById(id);
  const esc = T.esc;
  const ST = T.COLS;

  const state = { drag: null, over: null, modal: null, pick: null, err: false, endOpen: false, toast: '' };
  let toastTimer = null;

  // 스크랩한 공고만 보드에 올립니다. (IA.md 1장)
  const tracked = () => T.notices.filter((n) => T.isStarred(n.id)).map((n) => ({ n, rec: T.record(n.id) }));

  // 카드에 보여줄 D-day: 지금 단계의 마감일 기준
  function ddOf(n, rec) {
    const steps = T.stepsOf(n);
    const s = steps[T.curStep(rec)];
    return T.ddText(s && s.end);
  }
  function ddClass(dd) {
    if (dd === 'D-day' || /^D-[0-4]$/.test(dd)) return 'tk-dd urgent';
    if (dd === '일정 미정' || dd === '기간 지남') return 'tk-dd none';
    return 'tk-dd';
  }
  const detailHref = (id) => 'application-detail.html?id=' + encodeURIComponent(id) + '&from=board';

  function flash(msg) {
    state.toast = msg;
    const el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; state.toast = ''; }, 3000);
  }

  // 끌어 놓기
  function bindDrag(el, id) {
    el.addEventListener('dragstart', (e) => {
      try { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; } catch (err) { /* 무시 */ }
      state.drag = id;
      el.classList.add('dragging');
      renderEndHint();
    });
    el.addEventListener('dragend', () => {
      state.drag = null; state.over = null;
      el.classList.remove('dragging');
      markHot();
      renderEndHint();
    });
  }
  function bindDrop(el, k) {
    el.addEventListener('dragover', (e) => { e.preventDefault(); if (state.over !== k) { state.over = k; markHot(); } });
    el.addEventListener('dragleave', (e) => { if (!el.contains(e.relatedTarget) && state.over === k) { state.over = null; markHot(); } });
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      let id = state.drag;
      if (!id) { try { id = e.dataTransfer.getData('text/plain'); } catch (err) { id = null; } }
      state.drag = null; state.over = null;
      markHot();
      if (id) openMove(id, k);
    });
  }
  function markHot() {
    document.querySelectorAll('[data-col]').forEach((el) => {
      el.classList.toggle('hot', !!state.drag && state.over === Number(el.dataset.col));
    });
  }

  function cardHtml(n, rec, k) {
    const dd = ddOf(n, rec);
    const tag = rec.res || '';
    return '<article class="tk-card" draggable="true" data-id="' + esc(n.id) + '" aria-label="' + esc(n.name + ', ' + ST[k] + ', 끌어서 다른 단계로 옮길 수 있음') + '">' +
      '<span class="tk-org">' + esc(T.orgShort(n.org)) + '</span>' +
      '<a class="tk-name" href="' + detailHref(n.id) + '" draggable="false">' + esc(n.name) + '</a>' +
      '<a class="' + ddClass(dd) + '" href="../04-schedule-calendar/index.html" draggable="false" aria-label="' + esc('다음 일정 ' + dd + ', 일정 대시보드에서 보기') + '">' + esc(dd) + '</a>' +
      (tag ? '<span class="tk-tag">' + esc(tag) + '</span>' : '') +
      '</article>';
  }

  function render() {
    $('basis').textContent = 'D-day 기준 ' + T.md(T.todayKey) + ' · 예시 데이터';
    $('source').textContent = T.source();
    const all = tracked();

    $('cols').innerHTML = ST.slice(0, 5).map((title, k) => {
      const list = all.filter((x) => x.rec.col === k);
      return '<section class="tk-col" data-col="' + k + '" aria-label="' + esc(title) + '">' +
        '<div class="tk-col-head"><strong>' + esc(title) + '</strong><span class="tk-count">' + list.length + '</span></div>' +
        list.map((x) => cardHtml(x.n, x.rec, k)).join('') +
        (list.length ? '' : '<p class="tk-empty">이 단계의 공고가 없습니다</p>') +
        '</section>';
    }).join('');
    document.querySelectorAll('#cols [data-col]').forEach((el) => bindDrop(el, Number(el.dataset.col)));
    document.querySelectorAll('#cols .tk-card').forEach((el) => bindDrag(el, el.dataset.id));

    const ended = all.filter((x) => x.rec.col === 5);
    $('endCount').textContent = ended.length;
    $('endBtn').setAttribute('aria-expanded', state.endOpen ? 'true' : 'false');
    const ul = $('endList');
    ul.hidden = !state.endOpen;
    ul.innerHTML = ended.length ? ended.map((x) => '<li class="tk-row" draggable="true" data-id="' + esc(x.n.id) + '" aria-label="' + esc(x.n.name + ', 종료, 끌어서 다른 단계로 옮길 수 있음') + '">' +
      '<span class="tk-org">' + esc(T.orgShort(x.n.org)) + '</span>' +
      '<a href="' + detailHref(x.n.id) + '" draggable="false">' + esc(x.n.name) + '</a>' +
      '<span class="res">' + esc(x.rec.res || '종료') + '</span></li>').join('')
      : '<li class="tk-row-empty">종료된 공고가 없습니다</li>';
    ul.querySelectorAll('.tk-row').forEach((el) => bindDrag(el, el.dataset.id));
    renderEndHint();
  }
  function renderEndHint() {
    $('endHint').textContent = state.drag ? '여기에 놓으면 종료됩니다' : (state.endOpen ? '' : '카드를 여기로 끌어 놓으면 종료할 수 있습니다');
  }

  // 결과 기록 창
  function openMove(id, to) {
    const rec = T.record(id);
    const from = rec.col;
    if (to === from) return;
    state.modal = { id, from, to };
    state.pick = null;
    state.err = false;
    $('mMemo').value = '';
    renderModal();
    $('modal').hidden = false;
    const first = $('modal').querySelector('.tk-opt, #mBackOk');
    if (first) first.focus();
  }
  function closeModal() {
    state.modal = null;
    $('modal').hidden = true;
  }
  const optsFor = (m) => (m.to < m.from ? [] : (m.to === 5 ? T.END : T.OPT[m.from]));

  function renderModal() {
    const m = state.modal;
    if (!m) return;
    const n = T.byId[m.id];
    const rec = T.record(m.id);
    const back = m.to < m.from;
    const toEnd = m.to === 5;
    const opts = optsFor(m);
    const picked = state.pick !== null && opts[state.pick] ? opts[state.pick] : null;
    const ok = picked ? picked.ok : null;

    $('mKicker').textContent = n.name + ' · ' + ST[m.from] + ' → ' + ST[m.to];
    $('mTitle').textContent = back ? (m.from === 5 ? '종료를 취소하고 다시 진행할까요?' : '이전 단계로 옮길까요?') : (toEnd ? '이 공고를 종료할까요?' : '‘' + ST[m.from] + '’ 결과를 기록해 주세요');
    $('mBack').hidden = !back;
    $('mFwd').hidden = back;

    if (back) {
      $('mBody').textContent = m.from === 5
        ? '‘' + ST[m.to] + '’ 단계로 되돌립니다. 기록해 둔 종료 결과(' + (rec.res || '종료') + ')는 지워집니다.'
        : '‘' + ST[m.from] + '’에서 ‘' + ST[m.to] + '’ 단계로 되돌립니다. 되돌린 단계 이후에 기록한 결과와 메모는 지워집니다.';
      $('mBackOk').textContent = m.from === 5 ? '다시 진행하기' : '이전 단계로 옮기기';
      return;
    }

    const box = $('mOpts');
    box.style.gridTemplateColumns = 'repeat(' + Math.max(opts.length, 1) + ', minmax(0, 1fr))';
    box.innerHTML = opts.map((o, k) => '<button type="button" class="tk-opt" role="radio" data-k="' + k + '" aria-checked="' + (state.pick === k) + '">' + esc(o.l) + '</button>').join('');

    let t = '';
    let b = '';
    if (ok === 'go') {
      t = '‘' + ST[m.to] + '’ 단계로 옮깁니다';
      b = m.to > m.from + 1 ? '중간 단계는 기록 없이 넘어갑니다. 카드에는 새 단계의 D-day가 표시됩니다.' : '카드에는 새 단계의 D-day가 표시됩니다.';
    } else if (ok === 'wait') {
      t = '예비 입주자로 기록합니다';
      b = '카드는 ‘당첨 발표 대기’에 그대로 둡니다. 계약 안내를 받으면 다시 옮겨 주세요.';
    } else if (ok === 'end') {
      t = '이번 공고는 여기서 마무리됩니다';
      b = '카드는 ‘종료’ 칸으로 옮겨집니다. 스크랩은 유지되므로 남긴 기록을 언제든 다시 볼 수 있습니다.';
    } else if (ok === 'done') {
      t = '입주를 축하합니다';
      b = '카드는 ‘종료’ 칸으로 옮겨지고, 지금까지의 기록은 그대로 남습니다.';
    }
    $('mMsg').hidden = !picked;
    $('mMsgTitle').textContent = t;
    $('mMsgBody').textContent = b;
    $('mErr').hidden = !state.err;
    const btn = $('mFwdOk');
    btn.setAttribute('aria-disabled', picked ? 'false' : 'true');
    btn.textContent = ok === 'wait' ? '예비로 기록하기' : (ok === 'end' || ok === 'done' ? '기록하고 종료로 옮기기' : '기록하고 옮기기');
  }

  function confirmBack() {
    const m = state.modal;
    if (!m) return;
    const rec = T.record(m.id);
    rec.col = m.to;
    delete rec.res;
    T.clearFrom(rec, m.to);
    T.save();
    closeModal();
    render();
    flash('‘' + ST[m.to] + '’ 단계로 되돌렸습니다');
  }
  function confirmFwd() {
    const m = state.modal;
    if (!m) return;
    const opts = optsFor(m);
    if (state.pick === null || !opts[state.pick]) { state.err = true; renderModal(); return; }
    const o = opts[state.pick];
    const rec = T.record(m.id);
    // 지금 단계의 결과를 기록합니다. 종료 칸으로 옮길 때는 종료 결과만 남깁니다.
    const step = T.curStep(rec);
    if (step >= 0 && m.to !== 5) rec.steps[step] = { result: o.res || o.l, at: T.todayKey, memo: $('mMemo').value.trim() };
    let dest = m.to;
    if (o.ok === 'wait') { dest = m.from; rec.res = o.res; }
    else if (o.ok === 'end' || o.ok === 'done') {
      dest = 5; rec.res = o.res;
      if (step >= 0) rec.steps[step] = { result: o.res, at: T.todayKey, memo: $('mMemo').value.trim() };
    } else { delete rec.res; }
    rec.col = dest;
    T.save();
    closeModal();
    render();
    flash(o.ok === 'wait' ? '예비 입주자로 기록했습니다' : '‘' + ST[dest] + '’ 단계로 옮겼습니다');
  }

  // 이벤트
  $('endBtn').addEventListener('click', () => { state.endOpen = !state.endOpen; render(); });
  bindDrop($('endZone'), 5);
  $('endZone').dataset.col = '5';
  $('mOpts').addEventListener('click', (e) => {
    const b = e.target.closest('.tk-opt');
    if (!b) return;
    state.pick = Number(b.dataset.k);
    state.err = false;
    renderModal();
    const again = $('mOpts').querySelector('[data-k="' + state.pick + '"]');
    if (again) again.focus();
  });
  $('mFwdOk').addEventListener('click', confirmFwd);
  $('mBackOk').addEventListener('click', confirmBack);
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
  $('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.modal) closeModal(); });

  render();
})();
