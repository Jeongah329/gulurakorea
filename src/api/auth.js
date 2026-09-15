/**
 * 구글 로그인
 *
 * 로그인은 선택입니다. 혼자 플레이는 로그인 없이 그대로 되고,
 * 방(멀티플레이)과 명예의 전당처럼 여러 사람이 얽히는 기능에서만 요구합니다.
 *
 * 로그인하면 플레이어 식별자가 브라우저에 저장된 익명 아이디 대신
 * 구글 계정의 uid 가 되어, 기기를 바꿔도 기록이 이어집니다.
 */
import { app, isFirebaseConfigured } from "../firebase";
import {
  GoogleAuthProvider, getAuth, onAuthStateChanged,
  signInWithPopup, signInWithRedirect, signOut,
} from "firebase/auth";

let _auth = null;
export function auth() {
  if (!isFirebaseConfigured || !app) return null;
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

/* 로그인 상태가 바뀔 때마다 알려준다. 해제 함수를 돌려준다. */
export function watchUser(cb) {
  const a = auth();
  if (!a) { cb(null); return () => {}; }
  return onAuthStateChanged(a, u => cb(u ? {
    uid: u.uid,
    name: u.displayName || "",
    email: u.email || "",
    photo: u.photoURL || "",
  } : null));
}

/**
 * 구글 계정으로 로그인.
 * 팝업이 막히는 브라우저(인앱 브라우저 등)에서는 같은 창 이동 방식으로 넘어간다.
 */
export async function signInGoogle() {
  const a = auth();
  if (!a) throw new Error("Firebase 설정이 필요해요");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const res = await signInWithPopup(a, provider);
    return res.user;
  } catch (e) {
    const code = (e && e.code) || "";
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(a, provider);
      return null;
    }
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return null;
    }
    throw e;
  }
}

export async function signOutUser() {
  const a = auth();
  if (a) await signOut(a);
}
