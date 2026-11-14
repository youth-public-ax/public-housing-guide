// 05 상세 지원 현황: 공고 하나의 단계 타임라인, 준비 서류, 결과 기록
// 주소: application-detail.html?id=<공고 id>&from=<board|calendar>
(function () {
  const T = window.TRACKER;
  const $ = (id) => document.getElementById(id);
  const esc = T.esc;

  const params = new URLSearchParams(location.search);
  const id = params.get('id') || 'sh-youth-buy-2026-1';
  const from = params.get('from');
  const fromQ = from ? '&from=' + encodeURIComponent(from) : '';
  const noticeHref = '../03-notice-summary/notice-detail.html?id=' + encodeURIComponent(id) + fromQ;

  // 뒤로 가기: 일정 대시보드에서 왔으면 04로, 그 밖에는 지원 트래킹 보드로 (IA.md 3-2)
  $('back').href = from === 'calendar' ? '../04-schedule-calendar/index.html' : 'index.html';
  $('source').textContent = T.source();

  const n = T.byId[id];
  if (!n) {
    $('content').hidden = true;
    $('notFound').hidden = false;
    return;
  }
  // 상세 지원 현황은 스크랩한 공고만 열 수 있습니다. (IA.md 3-1)
  if (!T.isStarred(id)) { location.replace(noticeHref); return; }

  const rec = T.record(id);
  rec.docs = rec.docs || T.DOCS.map(() => false);
  const steps = T.stepsOf(n);
  const st = { sel: null, pick: 0, editing: false, err: false };

  const stepState = (k) => {
    const cur = T.curStep(rec);
    if (cur < 0) return rec.steps[k] ? 'done' : 'todo';
    return k < cur ? 'done' : (k === cur ? 'cur' : 'todo');
  };
  const defaultSel = () => {
    const cur = T.curStep(rec);
    if (cur >= 0) return cur;
    const keys = Object.keys(rec.steps).map(Number);
    return keys.length ? Math.max.apply(null, keys) : 0;
  };

  // 공고 헤더
  function renderHead() {
    document.title = n.name + ' 지원 현황 | 공공주거 길잡이';
    $('nType').textContent = n.type;
    $('nOrg').textContent = n.org + ' · ' + n.region;
    $('nName').textContent = n.name;
    $('nApply').textContent = T.range(n.apply.start, n.apply.end);
    $('nLink').href = n.link;
    $('segNotice').href = noticeHref;
    const cur = T.curStep(rec);
    const pill = $('pill');
    if (cur < 0) {
      $('nDday').textContent = '· ' + (rec.res || '종료');
      pill.textContent = '종료 · ' + (rec.res || '종료');
      pill.classList.add('ended');
    } else {
      const s = steps[cur];
      const dd = T.ddText(s.end);
      $('nDday').textContent = '· ' + s.title + ' ' + dd;
      pill.textContent = T.COLS[rec.col] + ' ' + dd;
      pill.classList.remove('ended');
    }
  }

  const ICON_DONE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  const ICON_CUR = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>';
  const STATE_LABEL = { done: '지나온 단계', cur: '지금 단계', todo: '앞으로 할 단계' };

  // 단계 타임라인
  function renderSteps() {
    $('steps').innerHTML = steps.map((s, k) => {
      const ss = stepState(k);
      const on = k === st.sel;
      const r = rec.steps[k];
      const dot = ss === 'done' ? '<span class="tk-dot done">' + ICON_DONE + '</span>' : (ss === 'cur' ? '<span class="tk-dot cur">' + ICON_CUR + '</span>' : '<span class="tk-dot todo"></span>');
      const line = k < steps.length - 1 ? '<span class="tk-line' + (ss === 'done' ? ' done' : '') + '"></span>' : '';
      return '<li>' +
        '<div class="tk-tl-dotrow"><button type="button" class="tk-dot-btn' + (on && ss !== 'cur' ? ' sel' : '') + '" data-k="' + k + '" aria-label="' + esc(s.title + ', ' + STATE_LABEL[ss] + ', 기록 보기') + '" aria-pressed="' + on + '">' + dot + '</button>' + line + '</div>' +
        '<button type="button" class="tk-step-btn ' + ss + (on ? ' sel' : '') + '" data-k="' + k + '" tabindex="-1" aria-hidden="true">' +
        (ss === 'cur' ? '<span class="now">지금 단계</span>' : '') +
        '<strong>' + esc(s.title) + '</strong><span class="date">' + esc(s.date) + '</span>' +
        (r && r.result ? '<span class="res">' + esc(r.result) + '</span>' : '') +
        '</button></li>';
    }).join('');
  }

  // 준비 서류
  function renderDocs() {
    const done = rec.docs.filter(Boolean).length;
    $('docsCount').textContent = done + ' / ' + T.DOCS.length + ' 준비';
    $('docs').innerHTML = T.DOCS.map((d, k) => '<label class="tk-doc"><input type="checkbox" data-k="' + k + '"' + (rec.docs[k] ? ' checked' : '') + '><span>' + esc(d) + '</span></label>').join('');
  }

  const kv = (rows) => '<div class="tk-kv">' + rows.map((x) => '<div><span>' + esc(x.k) + '</span><strong>' + esc(x.v) + '</strong></div>').join('') + '</div>';

  // 다음 단계 안내 (결과로 '진행'을 고른 경우)
  function nextInfo(k) {
    const nx = steps[k + 1];
    if (!nx) return '';
    const head = nx.title + ' ' + nx.date + (nx.end ? ' · ' + T.ddText(nx.start) : '');
    const sub = nx.sub ? nx.sub.map((x) => x.label + ' ' + T.range(x.start, x.end)).join(' · ') : (nx.extra[0] ? nx.extra[0].v : '');
    return '<div class="tk-msg"><strong>' + esc(head) + '</strong><span>' + esc(sub) + '</span></div>';
  }

  // 오른쪽 결과 기록 칸
  function renderPanel() {
    const k = st.sel;
    const s = steps[k];
    const ss = stepState(k);
    const r = rec.steps[k];
    const box = $('panel');

    if (ss === 'cur') {
      $('panelTitle').textContent = s.title + ' 결과';
      const opts = T.OPT[k];
      const o = opts[st.pick];
      let msg = '';
      if (o && o.ok === 'go') msg = nextInfo(k);
      else if (o && o.ok === 'wait') msg = '<div class="tk-msg"><strong>예비 입주자로 대기합니다</strong><span>계약 안내를 받으면 계약 · 입주 일정을 기록해 주세요.</span></div>';
      else if (o && o.ok === 'end') msg = '<div class="tk-msg"><strong>이번 공고를 마무리합니다.</strong><a href="../04-schedule-calendar/index.html">지금 모집 중인 다른 공고 보기 →</a></div>';
      else if (o && o.ok === 'done') msg = '<div class="tk-msg"><strong>입주를 축하합니다</strong><span>지금까지의 기록은 그대로 남습니다.</span></div>';
      box.innerHTML = '<div class="tk-panel-body">' +
        '<div class="tk-opts" style="grid-template-columns: repeat(3, minmax(0, 1fr))">' +
        opts.map((x, i) => '<button type="button" class="tk-opt" data-pick="' + i + '" aria-pressed="' + (st.pick === i) + '">' + esc(x.l) + '</button>').join('') + '</div>' +
        msg +
        '<label class="tk-field">메모 (선택)<textarea id="memo" placeholder="예: 당첨 안내 문자 받음">' + esc(r && r.memo) + '</textarea></label>' +
        (st.err ? '<span class="tk-err" role="alert">결과를 먼저 골라 주세요.</span>' : '') +
        '<button type="button" class="tk-save" id="saveRec">기록 저장</button></div>';
      return;
    }

    if (ss === 'done') {
      $('panelTitle').textContent = s.title + ' 기록';
      const rows = s.extra.concat((r && r.extra) || []);
      if (st.editing) {
        box.innerHTML = '<div class="tk-panel-body">' +
          '<div class="tk-res-row"><span class="tk-res-chip">' + esc((r && r.result) || '기록 없음') + '</span></div>' +
          '<label class="tk-field">메모 (선택)<textarea id="memo">' + esc(r && r.memo) + '</textarea></label>' +
          '<div class="tk-actions"><button type="button" class="tk-btn" id="editCancel">취소</button><button type="button" class="tk-btn primary" id="editSave">저장</button></div></div>';
        return;
      }
      box.innerHTML = '<div class="tk-panel-body">' +
        '<div class="tk-res-row"><span class="tk-res-chip">' + esc((r && r.result) || '기록 없음') + '</span>' + (r && r.at ? '<span class="at">' + esc(T.atText(r.at)) + '</span>' : '') + '</div>' +
        kv(rows) +
        '<div class="tk-memo"><span>내 메모</span>' + (r && r.memo ? '<p>' + esc(r.memo) + '</p>' : '<p class="none">남긴 메모가 없습니다.</p>') + '</div>' +
        (r ? '<button type="button" class="tk-small-btn" id="editRec">기록 수정</button>' : '') + '</div>';
      return;
    }

    // 앞으로 할 단계
    $('panelTitle').textContent = s.title;
    const hint = k === 4 ? '당첨으로 기록하면 이 단계가 열리고, 계약 D-day가 표시됩니다.'
      : (k === 5 ? '계약을 마치면 입주 날짜를 기록할 수 있습니다.' : '앞 단계 결과를 기록하면 이 단계가 열립니다.');
    box.innerHTML = '<div class="tk-panel-body">' + kv(s.extra) + '<p class="tk-hint">' + esc(T.curStep(rec) < 0 ? '종료된 공고입니다. 보드에서 카드를 다시 옮기면 이어서 기록할 수 있습니다.' : hint) + '</p></div>';
  }

  function render() {
    if (st.sel === null) st.sel = defaultSel();
    renderHead();
    renderSteps();
    renderDocs();
    renderPanel();
  }

  // 기록 저장: 지금 단계 결과를 남기고 보드 칸을 함께 옮깁니다.
  function saveRecord() {
    const k = st.sel;
    const o = T.OPT[k][st.pick];
    if (!o) { st.err = true; renderPanel(); return; }
    const memo = ($('memo') && $('memo').value.trim()) || '';
    rec.steps[k] = { result: o.res || o.l, at: T.todayKey, memo };
    if (o.ok === 'go') {
      delete rec.res;
      if (k < 4) rec.col = k + 1;      // 계약 단계(4)를 마치면 같은 칸에서 입주 단계로
    } else if (o.ok === 'wait') {
      rec.res = o.res;
    } else {
      rec.col = 5;
      rec.res = o.res;
    }
    T.save();
    // 입주 완료를 기록하면 아웃 페이지로 이동합니다. (IA.md 4장)
    if (o.ok === 'done') { location.href = '../01-landing-outro/outro.html'; return; }
    st.sel = defaultSel();
    st.pick = 0;
    st.err = false;
    render();
  }

  // 이벤트
  $('steps').addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]');
    if (!b) return;
    st.sel = Number(b.dataset.k);
    st.pick = 0;
    st.editing = false;
    st.err = false;
    render();
    const again = $('steps').querySelector('.tk-dot-btn[data-k="' + st.sel + '"]');
    if (again) again.focus();
  });
  $('docs').addEventListener('change', (e) => {
    const k = Number(e.target.dataset.k);
    rec.docs[k] = e.target.checked;
    T.save();
    renderDocs();
    const again = $('docs').querySelector('[data-k="' + k + '"]');
    if (again) again.focus();
  });
  $('panel').addEventListener('click', (e) => {
    const p = e.target.closest('[data-pick]');
    if (p) {
      const memo = $('memo') ? $('memo').value : '';
      st.pick = Number(p.dataset.pick);
      st.err = false;
      renderPanel();
      if ($('memo')) $('memo').value = memo;
      const again = $('panel').querySelector('[data-pick="' + st.pick + '"]');
      if (again) again.focus();
      return;
    }
    if (e.target.id === 'saveRec') saveRecord();
    if (e.target.id === 'editRec') { st.editing = true; renderPanel(); }
    if (e.target.id === 'editCancel') { st.editing = false; renderPanel(); }
    if (e.target.id === 'editSave') {
      const r = rec.steps[st.sel];
      if (r) r.memo = $('memo').value.trim();
      T.save();
      st.editing = false;
      renderPanel();
    }
  });

  // 스크랩 해제 확인 창
  const confirmBox = $('confirm');
  $('star').addEventListener('click', () => { confirmBox.hidden = false; $('cCancel').focus(); });
  $('cCancel').addEventListener('click', () => { confirmBox.hidden = true; $('star').focus(); });
  confirmBox.addEventListener('click', (e) => { if (e.target === confirmBox) confirmBox.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !confirmBox.hidden) confirmBox.hidden = true; });
  $('cOk').addEventListener('click', () => { T.unstar(id); location.href = noticeHref; });

  render();
})();
