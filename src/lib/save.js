/**
 * 게임 기록 저장
 *
 * 지금까지 점수·영토·카드가 브라우저 메모리에만 있어서 새로고침하면 사라졌다.
 * 아래 두 곳에 저장해 그 문제를 없앤다.
 *
 *  1) 브라우저(localStorage) — 로그인 여부와 상관없이 항상 저장. 즉시 복구된다.
 *  2) Firestore players/{uid} — 로그인했을 때만. 기기를 바꿔도 이어진다.
 *
 * 저장 키는 사용자별로 나눈다. 로그아웃하고 다른 계정으로 들어와도 섞이지 않는다.
 */
const PREFIX = "gulura_save_";
const VERSION = 1;

/* 저장할 항목만 골라 담는다. 화면 상태(탭, 모달 등)는 저장하지 않는다. */
export function pickSave(s) {
  return {
    v: VERSION,
    score: s.score, coins: s.coins,
    ownership: s.ownership,
    homeSet: s.homeSet, homeCode: s.homeCode,
    inventory: s.inventory, roomCards: s.roomCards,
    roomCode: s.roomCode,
    cards: s.cards, trips: s.trips,
    rollsLeft: s.rollsLeft, rollDay: s.rollDay,
    protectedRegions: s.protectedRegions,
    throneRegion: s.throneRegion,
    boostAdjacent: s.boostAdjacent, lastSido: s.lastSido,
    nationalActive: s.nationalActive,
    rushCharges: s.rushCharges,
    themes: s.themes, distIdx: s.distIdx, duration: s.duration, budget: s.budget,
    savedAt: Date.now(),
  };
}

export function saveLocal(id, data) {
  if (!id) return;
  try { window.localStorage.setItem(PREFIX + id, JSON.stringify(data)); }
  catch (e) { /* 용량 초과 등은 무시한다 */ }
}

export function loadLocal(id) {
  if (!id) return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + id);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && d.v === VERSION ? d : null;
  } catch (e) { return null; }
}

export function clearLocal(id) {
  try { window.localStorage.removeItem(PREFIX + id); } catch (e) {}
}

/* 익명으로 쌓은 기록을 로그인 계정으로 옮긴다. 계정 쪽에 이미 기록이 있으면 건드리지 않는다. */
export function migrate(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return null;
  const mine = loadLocal(fromId);
  if (!mine) return null;
  if (loadLocal(toId)) return null;
  saveLocal(toId, mine);
  clearLocal(fromId);
  return mine;
}

/* 오늘 날짜를 YYYY-MM-DD 로. 자정이 지나면 값이 바뀐다. */
export function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
