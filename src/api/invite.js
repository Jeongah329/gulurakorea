import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const INVITES = "invites";

// 8자리 랜덤 초대 코드 생성 (충돌 방지를 위해 대문자+숫자 조합)
function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 헷갈리는 문자(0,O,1,I) 제외
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * 초대 생성 - 초대자 정보와 함께 Firestore에 저장하고 공유용 URL 반환
 * @param {string} inviterId - 초대하는 사람의 유저 ID
 * @param {string} inviterName - 초대하는 사람의 닉네임 (카톡 메시지에 표시)
 */
export async function createInvite(inviterId, inviterName) {
  const code = generateCode();

  const docRef = await addDoc(collection(db, INVITES), {
    code,
    inviterId,
    inviterName,
    inviteeId: null,
    status: "pending", // pending -> accepted
    createdAt: serverTimestamp(),
    acceptedAt: null,
  });

  const inviteUrl = `${window.location.origin}/invite/${code}`;

  return { id: docRef.id, code, inviteUrl };
}

/**
 * 초대 코드로 초대 정보 조회 (수락 페이지에서 사용)
 */
export async function getInviteByCode(code) {
  const q = query(collection(db, INVITES), where("code", "==", code));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * 초대 수락 처리
 * @param {string} inviteDocId - Firestore 문서 ID
 * @param {string} inviteeId - 수락하는 사람의 유저 ID
 */
export async function acceptInvite(inviteDocId, inviteeId) {
  const inviteRef = doc(db, INVITES, inviteDocId);
  const inviteSnap = await getDoc(inviteRef);

  if (!inviteSnap.exists()) {
    throw new Error("존재하지 않는 초대입니다.");
  }

  const data = inviteSnap.data();

  if (data.status === "accepted") {
    throw new Error("이미 수락된 초대입니다.");
  }

  if (data.inviterId === inviteeId) {
    throw new Error("본인이 만든 초대는 수락할 수 없습니다.");
  }

  await updateDoc(inviteRef, {
    inviteeId,
    status: "accepted",
    acceptedAt: serverTimestamp(),
  });

  return { ...data, inviteeId, status: "accepted" };
}

/**
 * 특정 유저가 보낸 모든 초대 목록 조회 (내 초대 현황 보기용)
 */
export async function getMyInvites(inviterId) {
  const q = query(collection(db, INVITES), where("inviterId", "==", inviterId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
