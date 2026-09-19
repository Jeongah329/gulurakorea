/**
 * 명예의 전당 — 방과 무관한 전체 순위표
 *
 * Firestore 구조
 *   players/{playerId} = { name, score, regions, updatedAt }
 *
 * rooms 컬렉션과 분리해 둔 이유는 방 문서가 방 참여자만 볼 수 있는 데이터인 반면
 * 이쪽은 전체 공개 데이터이기 때문입니다. rooms.js 는 건드리지 않습니다.
 */
import { db } from "../firebase";
import {
  collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc,
} from "firebase/firestore";

const PLAYERS = "players";

/* 내 점수를 전체 순위표에 올린다. 닉네임과 점수, 점령한 지역 수만 기록한다. */
export async function publishScore(myId, name, score, regions, tiles) {
  if (!db || !myId) return;
  try {
    await setDoc(
      doc(db, PLAYERS, String(myId)),
      {
        name: String(name || "여행자").slice(0, 10),
        score: Number(score) || 0,
        regions: Number(regions) || 0,
        tiles: Array.isArray(tiles) ? tiles.slice(0, 300).map(String) : [],
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (e) {
    console.warn("[leaderboard] 점수 등록 실패", e);
  }
}

/* 점수 상위 N명을 가져온다. */
export async function fetchTopPlayers(n = 20) {
  if (!db) return [];
  try {
    const q = query(collection(db, PLAYERS), orderBy("score", "desc"), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("[leaderboard] 순위 조회 실패", e);
    return [];
  }
}

/* 내 등수를 구한다. 상위 목록 안에 없으면 null 을 돌려준다. */
export function rankOf(list, myId) {
  const i = list.findIndex(p => p.id === myId);
  return i < 0 ? null : i + 1;
}

/* 탈퇴 시 전체 순위표에서 내 기록을 지운다. */
export async function removeMyRecord(myId) {
  if (!db || !myId) return;
  try { await deleteDoc(doc(db, PLAYERS, String(myId))); }
  catch (e) { console.warn("[leaderboard] 기록 삭제 실패", e); }
}

/* 모든 이용자가 점령한 게임판 칸을 하나로 합쳐 돌려준다. */
export async function fetchAllTiles(max = 500) {
  if (!db) return null;
  try {
    const snap = await getDocs(query(collection(db, PLAYERS), limit(max)));
    const set = new Set();
    snap.docs.forEach(d => (d.data().tiles || []).forEach(t => set.add(String(t))));
    return { tiles: set, players: snap.size };
  } catch (e) {
    console.warn("[leaderboard] 전체 점령 현황 조회 실패", e);
    return null;
  }
}

/* 로그인 계정에 저장해 둔 게임 기록을 가져온다. 기기를 바꿨을 때 복구용이다. */
export async function fetchMySave(myId) {
  if (!db || !myId) return null;
  try {
    const snap = await getDoc(doc(db, PLAYERS, String(myId)));
    if (!snap.exists()) return null;
    const d = snap.data();
    return d && d.save ? d.save : null;
  } catch (e) {
    console.warn("[leaderboard] 기록 조회 실패", e);
    return null;
  }
}

/* 게임 기록을 계정에 저장한다. 순위표에 쓰는 문서에 함께 담는다. */
export async function publishSave(myId, save) {
  if (!db || !myId || !save) return;
  try { await setDoc(doc(db, PLAYERS, String(myId)), { save, updatedAt: serverTimestamp() }, { merge: true }); }
  catch (e) { console.warn("[leaderboard] 기록 저장 실패", e); }
}

/**
 * 닉네임이 이미 다른 사람이 쓰고 있는지 확인한다.
 *
 * 순위표(players)는 누구나 읽을 수 있어 별도 저장소나 보안 규칙 없이 확인할 수 있다.
 * 대소문자와 앞뒤 공백만 다른 이름도 같은 이름으로 본다.
 */
export async function isNameTaken(name, myId) {
  if (!db) return false;
  const want = String(name || "").trim().toLowerCase();
  if (!want) return false;
  try {
    const snap = await getDocs(query(collection(db, PLAYERS), limit(500)));
    return snap.docs.some(
      (d) => d.id !== String(myId) && String(d.data().name || "").trim().toLowerCase() === want,
    );
  } catch (e) {
    console.warn("[leaderboard] 닉네임 확인 실패", e);
    return false;          // 확인하지 못하면 막지 않는다
  }
}
