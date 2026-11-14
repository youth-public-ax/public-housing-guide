// 03 공고 추가: 입력 → 분석 진행(시연용) → review.html
// 상태 값: ?state=loading (분석 중 화면 고정), ?state=fail (링크를 읽지 못한 화면)
(function () {
  const { esc, params, notice } = window.NOTICE;
  const S = window.SAMPLE;
  const $ = (id) => document.getElementById(id);
  const p = params();

  // 시연에서는 어떤 링크를 넣어도 이 예시 공고로 분석 결과를 보여줍니다.
  const DEMO_ID = 'gyeongnam-youth-2026';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 탭 전환
  const tabs = ['link', 'text', 'manual'];
  function selectTab(name) {
    tabs.forEach((t) => {
      $('tab-' + t).setAttribute('aria-selected', String(t === name));
      $('panel-' + t).hidden = t !== name;
    });
    $('formMsg').textContent = '';
  }
  tabs.forEach((t) => $('tab-' + t).addEventListener('click', () => selectTab(t)));

  // 분석 진행 표시
  const NAMES = ['공고 불러오기', 'AI 분석', '카드로 정리'];
  function showSteps(cur, fail) {
    $('progress').hidden = false;
    $('failBox').hidden = !fail;
    $('steps').innerHTML = NAMES.map((name, i) => {
      let cls = '';
      let st = '대기';
      if (fail && i === 0) { cls = 'fail'; st = '실패'; }
      else if (!fail && i < cur) { cls = 'done'; st = '완료'; }
      else if (!fail && i === cur) { cls = 'active'; st = '진행 중'; }
      return '<div class="step ' + cls + '"><strong>' + name + '</strong><span>' + st + '</span></div>';
    }).join('');
  }

  function analyze() {
    const go = () => { location.href = 'review.html?id=' + DEMO_ID; };
    if (reduce) { showSteps(3, false); go(); return; }
    let i = 0;
    showSteps(0, false);
    const timer = setInterval(() => {
      i += 1;
      showSteps(i, false);
      if (i >= 3) { clearInterval(timer); setTimeout(go, 500); }
    }, 900);
  }

  $('panel-link').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$('url').value.trim()) { $('formMsg').textContent = '공고 주소를 입력해 주세요.'; $('url').focus(); return; }
    analyze();
  });
  $('panel-text').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$('text').value.trim()) { $('formMsg').textContent = '공고 내용을 붙여넣어 주세요.'; $('text').focus(); return; }
    analyze();
  });
  $('panel-manual').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$('mName').value.trim()) { $('formMsg').textContent = '공고명을 입력해 주세요.'; $('mName').focus(); return; }
    location.href = 'review.html?id=' + DEMO_ID;
  });

  if (p.state === 'loading') showSteps(1, false);
  if (p.state === 'fail') showSteps(0, true);

  // 스크랩한 공고 목록
  let stars = {};
  try { stars = JSON.parse(localStorage.getItem('phg-calendar-stars')) || { 'gwacheon-s12': true }; } catch (e) { stars = { 'gwacheon-s12': true }; }
  const mine = S.notices.filter((n) => stars[n.id]).map((n) => notice(n.id));
  $('scrapList').innerHTML = mine.length
    ? mine.map((n) => '<a class="list-link" href="notice-detail.html?id=' + encodeURIComponent(n.id) + '&from=calendar"><span><small>' + esc(n.org) + ', ' + esc(n.type) + '</small><strong>' + esc(n.name) + '</strong></span><em>' + esc(n.dday) + '</em></a>').join('')
    : '<p class="ns-note">스크랩한 공고가 없습니다.</p>';
})();
