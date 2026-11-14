// 05 주거트래커 공통: 지원 기록 초기값, 브라우저 저장, 단계와 날짜 계산
// 공고와 날짜는 shared/sample-data.js 값만 사용합니다. (AGENTS.md 6장)
// 여기 있는 지원 기록(보드 칸, 단계별 결과, 기록일, 메모)은 05에서만 쓰는 시연용 예시입니다.
(function () {
  const S = window.SAMPLE;
  const STORE = 'phg-tracker-records';   // 05 전용 저장 키
  const STAR = 'phg-calendar-stars';     // 스크랩 공통 키 (AGENTS.md 3장)
  const DAY = 86400000;

  // 보드 칸: 0~4는 진행 단계, 5는 종료
  const COLS = ['접수 전', '접수 완료', '서류 · 심사', '당첨 발표 대기', '계약 · 입주', '종료'];

  // 단계별 결과 선택지. ok: go 다음 단계, wait 예비, end 종료, done 입주 완료
  const OPT = [
    [{ l: '접수 완료', ok: 'go' }, { l: '미접수', ok: 'end', res: '미접수' }],
    [{ l: '대상', ok: 'go' }, { l: '비대상', ok: 'end', res: '서류심사 비대상' }],
    [{ l: '서류 제출 완료', ok: 'go' }, { l: '서류 미제출', ok: 'end', res: '서류 미제출' }],
    [{ l: '당첨', ok: 'go' }, { l: '예비 입주자', ok: 'wait', res: '예비 입주자' }, { l: '미선정', ok: 'end', res: '미선정' }],
    [{ l: '계약 완료', ok: 'go' }, { l: '계약 포기', ok: 'end', res: '지원 중단' }],
    [{ l: '입주 완료', ok: 'done', res: '입주 완료' }, { l: '지원 중단', ok: 'end', res: '지원 중단' }]
  ];
  const END = [{ l: '입주 완료', ok: 'done', res: '입주 완료' }, { l: '미선정 · 비대상', ok: 'end', res: '미선정 · 비대상' }, { l: '지원 중단', ok: 'end', res: '지원 중단' }];

  // 세부 단계가 없는 공고에 쓰는 기본 단계 이름 (접수 일정만 공고 데이터에서 가져옵니다)
  const BASE_STEPS = ['청약 접수', '서류심사 대상자 발표', '서류 제출 · 자격 심사', '당첨자 발표', '계약', '입주'];

  // 시연용 지원 기록 초기값
  const SEED = {
    'gyeongnam-youth-2026': { col: 0 },
    'jecheon-yeongcheon': { col: 0 },
    'gwacheon-s12': { col: 1, steps: { 0: { result: '접수 완료', at: '2026-11-10', memo: '' } } },
    'sh-youth-buy-2026-1': {
      col: 3,
      docs: [true, true, true, true],
      steps: {
        0: { result: '접수 완료', at: '2026-07-15', memo: '마감 하루 전에 인터넷으로 접수했다. 신청한 주택은 마포구에 있는 거!' },
        1: { result: '대상', at: '2026-07-20', memo: '16시에 홈페이지에서 확인. 서류 제출 안내 문자도 받음.' },
        2: { result: '서류 제출 완료', at: '2026-07-27', memo: '소득 증빙 서류 발급에 3일 걸림. 다음엔 미리 떼 둘 것.', extra: [{ k: '제출한 서류', v: '4개 (주민등록등본 외 3개)' }] }
      }
    }
  };
  const DOCS = ['주민등록등본', '가족관계증명서', '소득 증빙 서류', '[공고별 추가 서류]'];

  // 날짜
  const parse = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const TODAY = parse(S.today);
  const pad = (n) => (n < 10 ? '0' : '') + n;
  const md = (s) => s.slice(5).replace('-', '.');
  const ymd = (s) => s.replace(/-/g, '.');
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  const days = (s) => Math.round((parse(s) - TODAY) / DAY);
  const ddText = (s) => { if (!s) return '일정 미정'; const d = days(s); return d > 0 ? 'D-' + d : (d === 0 ? 'D-day' : '기간 지남'); };
  const atText = (s) => md(s) + '(' + WD[parse(s).getDay()] + ') 기록';
  const range = (a, b) => {
    if (!a) return '일정 미정';
    if (!b || a === b) return md(a);
    return md(a) + ' ~ ' + (a.slice(0, 4) === b.slice(0, 4) ? md(b) : ymd(b));
  };

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // 공고 목록: 보드는 notices 3개 + trackedNotices 1개
  const notices = (S.notices || []).concat(S.trackedNotices || []);
  const byId = {};
  notices.forEach((n) => { byId[n.id] = n; });
  const orgShort = (org) => org.split(' ')[0];

  // 공고의 6단계: trackedNotices는 steps를 그대로, 나머지는 접수 일정만 채웁니다.
  function stepsOf(n) {
    if (n.steps && n.steps.length) {
      return n.steps.map((s) => {
        const time = (s.text.match(/\d{1,2}:\d{2}/) || [''])[0];
        let date = range(s.start, s.end);
        if (/^\s*~/.test(s.text)) date = s.text.replace(/20\d\d\.\s*/, '').trim();
        else if (s.start === s.end && time) date += ' ' + time;
        const extra = s.sub ? s.sub.map((x) => ({ k: x.label, v: x.text })) : [{ k: '공식 일정', v: s.text }];
        return { title: s.label, start: s.start, end: s.end, date, extra, sub: s.sub || null };
      });
    }
    return BASE_STEPS.map((title, k) => {
      if (k === 0) {
        const text = ymd(n.apply.start) + ' ~ ' + ymd(n.apply.end);
        return { title, start: n.apply.start, end: n.apply.end, date: range(n.apply.start, n.apply.end), extra: [{ k: '공식 일정', v: text }], sub: null };
      }
      return { title, start: null, end: null, date: '일정 미정', extra: [{ k: '공식 일정', v: '공고문 확인 필요' }], sub: null };
    });
  }

  // 보드 칸 → 지금 단계 번호 (계약 · 입주 칸은 계약을 기록하면 입주 단계로)
  function curStep(rec) {
    if (rec.col >= 5) return -1;
    if (rec.col === 4) return rec.steps && rec.steps[4] ? 5 : 4;
    return rec.col;
  }

  // 저장
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function readJSON(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } }
  function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 저장소를 쓸 수 없으면 이번 화면에서만 유지 */ } }

  let stars = readJSON(STAR);
  let data = readJSON(STORE);
  if (new URLSearchParams(location.search).get('reset') === '1') data = null;
  if (!data || !data.records) {
    // 처음 들어오면 초기 기록을 넣고, 초기 공고를 스크랩 목록에 한 번만 추가합니다.
    // 스크랩 저장값이 없을 때는 04 일정 대시보드의 기본값(과천 S12)과 같은 상태에서 시작합니다.
    data = { v: 1, records: clone(SEED) };
    stars = stars || { 'gwacheon-s12': true };
    Object.keys(SEED).forEach((id) => { stars[id] = true; });
    writeJSON(STAR, stars);
    writeJSON(STORE, data);
  }
  stars = stars || {};

  const T = {
    S, COLS, OPT, END, DOCS, TODAY, notices, byId,
    md, ymd, days, ddText, atText, range, esc, orgShort, stepsOf, curStep,
    todayKey: S.today,
    isStarred: (id) => !!stars[id],
    unstar(id) {
      stars = readJSON(STAR) || stars;
      delete stars[id];
      writeJSON(STAR, stars);
      delete data.records[id];
      writeJSON(STORE, data);
    },
    // 스크랩한 공고의 기록. 기록이 없으면 접수 전 칸에서 시작합니다.
    record(id) {
      if (!data.records[id]) data.records[id] = { col: 0 };
      const r = data.records[id];
      r.steps = r.steps || {};
      return r;
    },
    save() { writeJSON(STORE, data); },
    // 단계 기록 지우기: from 번호 이상의 단계 결과와 메모를 지웁니다.
    clearFrom(rec, from) { Object.keys(rec.steps || {}).forEach((k) => { if (Number(k) >= from) delete rec.steps[k]; }); },
    source() {
      return '공고 정보 출처: 마이홈포털, LH청약플러스, SH인터넷청약시스템, 각 공급기관 모집공고, ' + ymd(S.today) + ' 기준. 지원 기록은 시연용 예시입니다.';
    }
  };
  window.TRACKER = T;
})();
