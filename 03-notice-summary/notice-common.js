// 03 AI 공고 설명 공통 함수: 주소 값, 공고 찾기, D-day, 스크랩 저장, 용어 밑줄
(function () {
  const S = window.SAMPLE;
  const AI = window.NOTICE_AI;
  const STORE = 'phg-calendar-stars'; // 모든 기능이 같은 저장 키를 씁니다. (IA.md)
  const DAY = 86400000;

  const parse = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const md = (s) => { const p = s.split('-'); return p[1] + '.' + p[2]; };
  const TODAY = parse(S.today);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function params() {
    const p = new URLSearchParams(location.search);
    return { id: p.get('id'), from: p.get('from'), state: p.get('state') };
  }

  function notice(id) {
    const n = S.notices.find((x) => x.id === id) || S.notices[0];
    const a = parse(n.apply.start);
    const b = parse(n.apply.end);
    let dday;
    if (TODAY < a) dday = '접수 D-' + Math.round((a - TODAY) / DAY);
    else if (TODAY <= b) { const d = Math.round((b - TODAY) / DAY); dday = d === 0 ? '오늘 마감' : '마감 D-' + d; }
    else dday = '접수 마감';
    const applyText = md(n.apply.start) + ' ~ ' + md(n.apply.end);
    const endP = n.apply.end.split('-');
    return Object.assign({}, n, AI.notices[n.id] || {}, {
      dday, applyText,
      applyEndText: Number(endP[1]) + '월 ' + Number(endP[2]) + '일'
    });
  }

  // 스크랩: 저장된 값이 없으면 일정 대시보드와 같은 기본값(과천 S12 등록)을 씁니다.
  function readStars() {
    try { const v = JSON.parse(localStorage.getItem(STORE)); if (v) return v; } catch (e) { /* 무시 */ }
    return { 'gwacheon-s12': true };
  }
  function writeStars(v) { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) { /* 무시 */ } }
  function isScrapped(id) { return !!readStars()[id]; }
  function setScrap(id, on) {
    const v = readStars();
    if (on) v[id] = true; else delete v[id];
    writeStars(v);
  }

  // 용어 밑줄: 컨테이너 안 글자에서 사전 단어를 찾아 버튼으로 감쌉니다.
  function underlineTerms(root, onPick) {
    const list = AI.terms.slice().sort((a, b) => b.term.length - a.term.length);
    const pattern = new RegExp('(' + list.map((t) => t.term.replace(/[()[\]]/g, '\\$&')).join('|') + ')', 'g');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!pattern.test(node.nodeValue)) return;
      pattern.lastIndex = 0;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(pattern).forEach((part) => {
        const t = list.find((x) => x.term === part);
        if (t) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'term';
          b.textContent = part;
          b.dataset.term = part;
          b.addEventListener('click', () => onPick(t, b));
          frag.appendChild(b);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  window.NOTICE = { esc, params, notice, isScrapped, setScrap, underlineTerms };
})();
