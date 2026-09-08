/**
 * Firebase 초기화
 *
 * 값은 .env(VITE_FIREBASE_*)에서 읽고, 없으면 아래 기본값을 씁니다.
 * Firebase 웹 설정값은 브라우저에 노출되는 것을 전제로 만들어진 값이며,
 * 실제 보안은 Firestore 보안 규칙에서 걸어야 합니다.
 */
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const env = (typeof import.meta !== "undefined" && import.meta.env) || {};

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY             || "AIzaSyDOuXeaUygSM0xY5jgTHYDRr_98Xx4EA0Q",
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN         || "gulura-korea.firebaseapp.com",
  projectId:         env.VITE_FIREBASE_PROJECT_ID          || "gulura-korea",
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET      || "gulura-korea.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "638406745210",
  appId:             env.VITE_FIREBASE_APP_ID              || "1:638406745210:web:7a9bce9df78a3f10812fc3",
  measurementId:     env.VITE_FIREBASE_MEASUREMENT_ID      || "G-36VVQ7RVLH",
};

/**
 * 설정값이 비어 있으면 initializeApp 이 예외를 던져 앱 전체가 하얀 화면이 됩니다.
 * 온라인 방 기능만 끄고 나머지(주사위·지도 등)는 정상 동작하도록 분리해 둡니다.
 */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let _app = null;
let _db = null;
if (isFirebaseConfigured) {
  try {
    _app = initializeApp(firebaseConfig);
    _db = getFirestore(_app);
  } catch (e) {
    console.error("[firebase] 초기화 실패", e);
  }
}

export const app = _app;
export const db = _db;
