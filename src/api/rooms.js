/**
 * 실시간 온라인 방(멀티플레이어) — Firestore 연동
 *
 * 데이터 모델: rooms/{code} 문서 하나에 방 전체 상태를 저장합니다.
 *   {
 *     code, createdAt, hostId,
 *     members: { [playerId]: { name, color, score, joinedAt } },
 *     ownership: { [sggCode]: playerId }
 *   }
 *
 * 코드를 문서 ID로 그대로 쓰기 때문에 "코드로 참여"가 곧 "그 문서를 구독"하는 것과
 * 같습니다. 실제 사람이 링크나 코드로 들어오면 Firestore에 자신을 멤버로 추가하고,
 * 방에 있는 모든 사람이 onSnapshot으로 그 변화를 실시간으로 받습니다 — 더 이상
 * 고정된 가짜 친구(FRIEND_POOL)를 채워 넣는 데모가 아닙니다.
 */
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteField,
  serverTimestamp,
} from "firebase/firestore";

const ROOMS = "rooms";

const PALETTE = ["#2EB872", "#8B6FE0", "#34B5D6", "#E39A3B", "#E0608B", "#5FA8E0", "#C7A23B", "#6FBF7A"];

/* ───────── 내 신원 (기기별로 로컬에 저장되는 익명 ID + 닉네임) ───────── */
export function getMyId() {
  if (typeof window === "undefined") return "guest";
  try {
    let id = window.localStorage.getItem("gulura_player_id");
    if (!id) {
      id = "p_" + (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());
      window.localStorage.setItem("gulura_player_id", id);
    }
    return id;
  } catch (e) {
    return "guest_" + Math.random().toString(36).slice(2, 8);
  }
}

export function getMyName() {
  if (typeof window === "undefined") return "여행자";
  try {
    return window.localStorage.getItem("gulura_player_name") || "";
  } catch (e) {
    return "";
  }
}

export function setMyName(name) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem("gulura_player_name", name); } catch (e) {}
}

function colorFor(playerId, existingColors) {
  const used = new Set(existingColors || []);
  const free = PALETTE.find((c) => !used.has(c));
  if (free) return free;
  // 팔레트가 다 떨어지면 ID를 해시해서 그럴듯한 색을 만든다
  let h = 0;
  for (let i = 0; i < playerId.length; i++) h = (h * 31 + playerId.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 55%, 55%)`;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 헷갈리는 0,O,1,I 제외
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "KR-" + s;
}

/**
 * 새 방 생성. 코드 충돌 시 재시도.
 * initialOwnership: 방을 만들기 전 혼자 플레이하며 정복해 둔 타일을 그대로 가져간다.
 */
export async function createRoomOnline(myId, myName, initialOwnership = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const ref = doc(db, ROOMS, code);
    const existing = await getDoc(ref);
    if (existing.exists()) continue; // 드물지만 코드가 겹치면 다시 생성

    const ownership = {};
    Object.keys(initialOwnership).forEach((k) => { ownership[k] = myId; });

    await setDoc(ref, {
      code,
      createdAt: serverTimestamp(),
      hostId: myId,
      members: {
        [myId]: { name: myName || "나", color: PALETTE[0], score: 0, joinedAt: Date.now() },
      },
      ownership,
    });
    return code;
  }
  throw new Error("방 코드를 생성하지 못했습니다. 다시 시도해 주세요.");
}

/**
 * 코드로 실제 방에 참여. 존재하지 않으면 에러를 던진다.
 * 참여 전 혼자 정복해 둔 타일은 내 소유로 합쳐서 들어간다.
 */
export async function joinRoomOnline(code, myId, myName, initialOwnership = {}) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) throw new Error("코드를 입력해 주세요.");
  const ref = doc(db, ROOMS, normalized);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("해당 코드의 방을 찾을 수 없어요. 코드를 다시 확인해 주세요.");

  const data = snap.data();
  const members = data.members || {};
  const existingColors = Object.values(members).map((m) => m.color);

  const patch = {};
  if (!members[myId]) {
    patch[`members.${myId}`] = {
      name: myName || "여행자",
      color: colorFor(myId, existingColors),
      score: 0,
      joinedAt: Date.now(),
    };
  } else if (myName && members[myId].name !== myName) {
    patch[`members.${myId}.name`] = myName;
  }
  Object.keys(initialOwnership).forEach((sgg) => {
    if (!data.ownership || !data.ownership[sgg]) patch[`ownership.${sgg}`] = myId;
  });

  if (Object.keys(patch).length) await updateDoc(ref, patch);
  return normalized;
}

/** 방 상태를 실시간 구독. unsubscribe 함수를 반환. */
export function subscribeRoom(code, onChange, onError) {
  const ref = doc(db, ROOMS, code);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) { onChange(null); return; }
      onChange({ code, ...snap.data() });
    },
    (err) => { if (onError) onError(err); }
  );
}

/** 내가 새로 정복한 타일 하나를 방 전체에 반영 */
export async function syncOwnership(code, myId, sggCode) {
  if (!code || !sggCode) return;
  const ref = doc(db, ROOMS, code);
  await updateDoc(ref, { [`ownership.${sggCode}`]: myId }).catch(() => {});
}

/** 내 점수를 방 전체에 반영 */
export async function syncScore(code, myId, score) {
  if (!code) return;
  const ref = doc(db, ROOMS, code);
  await updateDoc(ref, { [`members.${myId}.score`]: score }).catch(() => {});
}

/** 방 나가기 — 내 멤버 항목만 제거 (다른 사람 데이터는 그대로 남는다) */
export async function leaveRoomOnline(code, myId) {
  if (!code) return;
  const ref = doc(db, ROOMS, code);
  await updateDoc(ref, { [`members.${myId}`]: deleteField() }).catch(() => {});
}
