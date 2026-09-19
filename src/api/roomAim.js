/**
 * 📢 공개 여행지 — 방 사람들이 지금 어디를 노리는지 실제로 공유한다.
 *
 * 예전에는 표본 목록에서 아무 곳이나 골라 "친구가 노리는 지역"이라고 꾸며 보여줬다.
 * 근거 없는 정보였기 때문에, 각자가 자기 목적지를 방에 올리고 그 값만 읽도록 바꿨다.
 *
 * rooms.js 는 친구가 작성한 파일이라 건드리지 않고 이 파일에 따로 둔다.
 * 저장 위치는 rooms/{code}.members.{playerId}.aim 이며 최상위 필드가 아니라
 * members 맵 안쪽이라 기존 보안 규칙 그대로 쓸 수 있다.
 */
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const ROOMS = "rooms";

/* 내가 지금 노리는 지역을 방에 올린다. 없으면 빈 문자열로 지운다. */
export async function syncAim(code, myId, aim) {
  if (!db || !code || !myId) return;
  try {
    await updateDoc(doc(db, ROOMS, String(code).toUpperCase()), {
      [`members.${myId}.aim`]: String(aim || "").slice(0, 30),
    });
  } catch (e) {
    /* 방이 사라졌거나 권한이 없으면 조용히 넘어간다 */
  }
}

/**
 * 방에 들어갈 때 내가 이미 가진 땅을 한 번에 올린다.
 *
 * 방 문서의 ownership 은 방 전체가 공유하는 하나의 지도라,
 * 내가 혼자 플레이로 모은 땅을 올리지 않으면 방에 들어가는 순간
 * 화면에서 사라져 버린다. 이미 다른 사람이 가진 칸은 건드리지 않는다.
 */
export async function pushMyTiles(code, myId, tiles, taken = {}) {
  if (!db || !code || !myId || !tiles || !tiles.length) return;
  const patch = {};
  tiles.forEach((t) => { if (!taken[t]) patch[`ownership.${t}`] = myId; });
  if (!Object.keys(patch).length) return;
  try { await updateDoc(doc(db, ROOMS, String(code).toUpperCase()), patch); }
  catch (e) { console.warn("[room] 내 영토 공유 실패", e); }
}

/**
 * 방 카드 효과를 같은 방 사람들에게 전달한다.
 *
 * 방 문서의 members.{playerId}.event 에 최근 이벤트 하나를 적어 두면,
 * 방을 구독 중인 다른 사람들이 그 값을 읽어 각자 효과를 적용한다.
 * members 안쪽이라 기존 보안 규칙을 그대로 쓸 수 있다.
 */
export async function broadcastEvent(code, myId, type, payload = {}) {
  if (!db || !code || !myId) return;
  const ev = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    type: String(type),
    at: Date.now(),
    ...payload,
  };
  try {
    await updateDoc(doc(db, ROOMS, String(code).toUpperCase()), {
      [`members.${myId}.event`]: ev,
    });
  } catch (e) {
    console.warn("[room] 카드 효과 전달 실패", e);
  }
}
