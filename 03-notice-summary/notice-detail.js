// 03 공고 상세: notice-detail.html?id=공고ID&from=calendar|board (IA.md 3장)
(function () {
  const { esc, params, notice, isScrapped, setScrap, underlineTerms } = window.NOTICE;
  const AI = window.NOTICE_AI;
  const $ = (id) => document.getElementById(id);

  const p = params();
  const n = notice(p.id);
  const from = p.from === 'board' ? 'board' : 'calendar';
  const q = '?id=' + encodeURIComponent(n.id) + '&from=' + from;
  const trackerUrl = '../05-housing-tracker/application-detail.html' + q;

  // 뒤로 가기: 처음 들어온 곳으로 (IA.md 3-2)
  if (from === 'board') {
    $('back').href = '../05-housing-tracker/index.html';
    $('back').textContent = '← 지원 트래킹 보드';
  }

  // 공고 헤더
  document.title = n.name + ' | 공공주거 길잡이';
  $('type').textContent = n.type;
  $('orgRegion').textContent = n.org + ', ' + n.region;
  $('name').textContent = n.name;
  $('apply').textContent = n.applyText;
  $('dday').textContent = n.dday;
  $('origin').href = n.link;

  // AI 정리 본문
  $('summary').textContent = n.summary || '';
  $('elig').innerHTML = (n.eligibility || []).map((x) => '<li>' + esc(x) + '</li>').join('');
  if (n.steps) {
    // shared/sample-data.js의 공고문 세부 단계를 그대로 보여줍니다.
    const tag = { past: '지남', now: '진행 중', next: '다음 일정' };
    $('schedule').innerHTML = n.steps.map((s) => {
      const t = tag[s.state] ? ' <span class="step-tag ' + s.state + '">' + tag[s.state] + '</span>' : '';
      const sub = (s.sub || []).map((x) => '<dt class="sub-step">' + esc(x.label) + '</dt><dd class="sub-step">' + esc(x.text) + '</dd>').join('');
      return '<dt class="st-' + s.state + '">' + esc(s.label) + t + '</dt><dd class="st-' + s.state + '">' + esc(s.text) + '</dd>' + sub;
    }).join('');
    $('schedule').classList.add('stacked');
    $('scheduleNote').textContent = '공고문 표기 그대로입니다. 날짜는 공급 기관 사정으로 바뀔 수 있습니다.';
  } else {
    $('schedule').innerHTML = '<dt>청약 접수</dt><dd><strong>' + esc(n.applyText) + '</strong></dd>' +
      AI.steps.map((s, i) => '<dt>' + esc(s) + '</dt><dd>' + esc((n.schedule || [])[i] || '공고문 확인') + ' <span class="example">(예시)</span></dd>').join('');
  }
  $('rent').textContent = n.rent;
  $('areaNote').textContent = n.area ? n.area + '의 숫자는 전용면적을 뜻합니다.' : '주택형별 금액은 공고문에서 확인하세요.';
  $('docs').innerHTML = (n.docs || []).map((x) => '<li>' + esc(x) + '</li>').join('');
  $('source').textContent = '출처: ' + (n.source || '') + ' · 최종 자격과 일정은 공고문과 공급 기관에서 확인해야 합니다.';

  // AI 설명 패널 + 밑줄 용어
  const panel = window.mountAiPanel($('aiPanel'), n);
  underlineTerms($('content'), (t, btn) => panel.showTerm(t, btn));

  // 스크랩과 세그먼트 컨트롤 (IA.md 3-1)
  function renderScrap() {
    const on = isScrapped(n.id);
    $('scrapBtn').setAttribute('aria-pressed', String(on));
    $('scrapIcon').textContent = on ? '★' : '☆';
    $('scrapLabel').textContent = on ? '스크랩됨' : '스크랩';
    $('segOpen').hidden = !on;
    $('segOpen').href = trackerUrl;
    $('segLocked').hidden = on;
    $('segHint').textContent = on
      ? '스크랩한 공고입니다. 지원 현황에서 단계와 서류를 기록합니다.'
      : '스크랩하면 지원 현황이 열립니다.';
  }

  $('scrapBtn').addEventListener('click', () => {
    if (isScrapped(n.id)) { $('dialog').hidden = false; $('dialogCancel').focus(); }
    else { setScrap(n.id, true); renderScrap(); }
  });
  // 잠긴 칸을 누르면 스크랩한 뒤 상세 지원 현황으로 이동합니다.
  $('segLocked').addEventListener('click', () => {
    setScrap(n.id, true);
    location.href = trackerUrl;
  });

  const closeDialog = () => { $('dialog').hidden = true; $('scrapBtn').focus(); };
  $('dialogCancel').addEventListener('click', closeDialog);
  $('dialogOk').addEventListener('click', () => {
    setScrap(n.id, false);
    // 05 지원 기록 삭제는 05 담당 저장 키가 정해지면 여기서 함께 지웁니다.
    closeDialog();
    renderScrap();
  });
  $('dialog').addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDialog(); });

  renderScrap();
})();
