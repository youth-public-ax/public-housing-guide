// AI 설명 패널: 핵심 요약, 용어 풀이, 추천 질문
// 시연용입니다. 실제 서비스에서는 공고 원문을 근거로 AI가 답합니다.
(function () {
  const { esc } = window.NOTICE;
  const AI = window.NOTICE_AI;

  window.mountAiPanel = function (wrap, n) {
    let mode = { kind: 'auto' };
    let open = true;
    let pressed = null;

    const autoLines = n.applyClosed && n.steps
      ? [
        n.region + '에서 공급하는 ' + n.type + '입니다. 접수(' + n.applyText + ')는 끝났습니다.',
        n.nowStep ? '지금은 ‘' + n.nowStep.label + '’ 단계입니다.' : '지금은 다음 발표를 기다리는 단계입니다.',
        n.nextStep ? '다음 일정은 ‘' + n.nextStep.label + '’, ' + n.nextStep.text + '입니다.' : '남은 일정은 공고문에서 확인하세요.'
      ]
      : [
        n.region + '에서 공급하는 ' + n.type + '입니다.',
        '접수는 ' + n.applyText + '이고, 오늘 기준 ' + n.dday + '입니다.',
        '임대 조건 예시는 ' + n.rent.split(' (')[0] + '입니다.'
      ];

    function body() {
      if (mode.kind === 'term') {
        const t = mode.t;
        return '<button type="button" class="ai-back" data-act="back">← 이 공고 핵심 3줄로</button>' +
          '<div class="ai-body">' +
          '<span class="src-badge' + (t.source === 'ai' ? ' ai' : '') + '">' + (t.source === 'ai' ? 'AI 설명 · 이 공고 문맥 기준' : '용어 사전') + '</span>' +
          '<h3>' + esc(t.term) + '</h3>' +
          '<p class="easy">' + esc(t.easy) + '</p>' +
          '<div class="ai-ex"><span>예를 들면</span>' + esc(t.example) + '</div></div>';
      }
      if (mode.kind === 'q') {
        const x = AI.questions[mode.i];
        return '<button type="button" class="ai-back" data-act="back">← 이 공고 핵심 3줄로</button>' +
          '<div class="ai-body">' +
          '<p class="bubble-q">' + esc(x.q) + '</p>' +
          '<p class="bubble-a">' + esc(x.a(n, n)) + '</p>' +
          '<span class="label">근거 · ' + esc(x.src) + '</span></div>';
      }
      if (mode.kind === 'free') {
        return '<button type="button" class="ai-back" data-act="back">← 이 공고 핵심 3줄로</button>' +
          '<div class="ai-body"><p class="bubble-q">' + esc(mode.q) + '</p>' +
          '<p class="bubble-a">시연 화면에서는 아래 추천 질문에만 답변합니다. 실제 서비스에서는 공고 원문을 근거로 답변합니다.</p></div>';
      }
      return '<div class="ai-body"><span class="label">이 공고 핵심 3줄</span>' +
        autoLines.map((l) => '<p class="ai-line">' + esc(l) + '</p>').join('') + '</div>';
    }

    function render() {
      if (!open) {
        wrap.innerHTML = '<button type="button" class="ai-open" data-act="open"><span>AI</span>AI 설명 열기</button>';
        return;
      }
      wrap.innerHTML =
        '<aside class="ai-panel" aria-label="AI 설명">' +
        '<div class="ai-head"><strong><span class="ai-dot" aria-hidden="true">AI</span>AI 설명</strong>' +
        '<button type="button" class="ai-min" data-act="close" aria-label="AI 설명 접기"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button></div>' +
        '<div aria-live="polite">' + body() + '</div>' +
        '<div class="ai-chips">이런 질문을 할 수 있습니다<div>' +
        AI.questions.map((x, i) => '<button type="button" data-q="' + i + '">' + esc(x.q) + '</button>').join('') +
        '</div></div>' +
        '<form class="ai-ask" data-act="ask"><label class="sr-only" for="askInput">공고에 대해 질문하기</label>' +
        '<input id="askInput" type="text" placeholder="이 공고에 대해 물어보세요">' +
        '<button type="submit" aria-label="질문 보내기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>' +
        '<p class="ns-note">AI 설명은 틀릴 수 있습니다. 정확한 내용은 공고 원문과 공급 기관 안내를 확인하세요.</p>' +
        '</aside>';
    }

    function setPressed(btn) {
      if (pressed) pressed.setAttribute('aria-pressed', 'false');
      pressed = btn;
      if (btn) btn.setAttribute('aria-pressed', 'true');
    }

    wrap.addEventListener('click', (e) => {
      const el = e.target.closest('[data-act], [data-q]');
      if (!el) return;
      if (el.dataset.q !== undefined) { mode = { kind: 'q', i: Number(el.dataset.q) }; setPressed(null); }
      else if (el.dataset.act === 'back') { mode = { kind: 'auto' }; setPressed(null); }
      else if (el.dataset.act === 'close') open = false;
      else if (el.dataset.act === 'open') open = true;
      else return;
      render();
    });
    wrap.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = wrap.querySelector('#askInput').value.trim();
      if (!v) return;
      mode = { kind: 'free', q: v };
      setPressed(null);
      render();
    });

    render();
    return {
      showTerm(t, btn) { mode = { kind: 'term', t }; open = true; setPressed(btn); render(); }
    };
  };
})();
