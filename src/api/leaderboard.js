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
  collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc,
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
