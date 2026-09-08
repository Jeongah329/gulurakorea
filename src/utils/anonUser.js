const ID_KEY = "palto_anon_user_id";
const NAME_KEY = "palto_anon_user_name";

// UUID가 없는 구형 브라우저 대비 fallback 포함
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "anon-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

/**
 * 이 브라우저의 고유 유저 ID를 반환. 없으면 새로 만들어서 저장.
 * 로그인 시스템이 생기면 이 함수 내부만 실제 auth uid로 교체하면 됨.
 */
export function getAnonUserId() {
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

/**
 * 저장된 닉네임 반환 (없으면 null)
 */
export function getAnonUserName() {
  return localStorage.getItem(NAME_KEY);
}

/**
 * 닉네임 저장
 */
export function setAnonUserName(name) {
  const trimmed = String(name || "").trim();
  if (trimmed) localStorage.setItem(NAME_KEY, trimmed);
  return trimmed;
}
