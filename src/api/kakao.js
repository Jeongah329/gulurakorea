/**
 * 카카오 Maps SDK / Local REST / 공유 SDK 연동
 */
import CFG from "../config.js";

/* ═══════════════════════════════════════════════════════════
   Kakao Developers 연동
   · Maps JavaScript SDK  — 목적지 지도 / 마커
   · Local REST API       — coord2regioncode(행정구역 대조), keyword(상호 확인)
   · Kakao JS SDK Share   — 친구 초대 카카오톡 공유
   ⚠ JS 키는 공개 전제(도메인 제한)로 클라이언트에 둡니다.
     REST 키는 원래 서버 보관용입니다. 배포 시 proxy 경유로 옮기세요.
   ═══════════════════════════════════════════════════════════ */
export const KAKAO_CFG = {
  js:     CFG.kakaoJs     || "6e27633fb5456228af25c9378c67121e",
  rest:   CFG.kakaoRest   || "b245592bb740223891be7e06088a6372",
  native: CFG.kakaoNative || "cfa0c5f456244e1da6b4775ec2e9eb96",
  proxy:  CFG.kakaoProxy, // REST 호출 프록시 prefix
};

export const SIDO_SHORT = {
  "서울특별시":"서울","부산광역시":"부산","대구광역시":"대구","인천광역시":"인천",
  "광주광역시":"광주","대전광역시":"대전","울산광역시":"울산","세종특별자치시":"세종",
  "경기도":"경기","강원도":"강원","강원특별자치도":"강원","충청북도":"충북","충청남도":"충남",
  "전라북도":"전북","전북특별자치도":"전북","전라남도":"전남","전남특별자치도":"전남",
  "경상북도":"경북","경상남도":"경남","제주특별자치도":"제주",
};

/* Maps SDK 동적 로더 (autoload=false → kakao.maps.load 콜백 대기) */
let kakaoSdkPromise = null;

export function loadKakaoSdk() {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.reject(new Error("브라우저 환경이 아닙니다"));
  if (window.kakao && window.kakao.maps && window.kakao.maps.Map) return Promise.resolve(window.kakao);
  if (kakaoSdkPromise) return kakaoSdkPromise;
  kakaoSdkPromise = new Promise((resolve, reject) => {
    if (!KAKAO_CFG.js) { reject(new Error("JavaScript 키가 설정되지 않았습니다")); return; }
    const ID = "kakao-maps-sdk";
    let el = document.getElementById(ID);
    const timer = setTimeout(() => reject(new Error("SDK 로드 타임아웃 · 플랫폼 도메인 등록을 확인하세요")), 12000);
    const onReady = () => {
      try { window.kakao.maps.load(() => { clearTimeout(timer); resolve(window.kakao); }); }
      catch (e) { clearTimeout(timer); reject(new Error("SDK 초기화 실패 · " + ((e && e.message) || e))); }
    };
    const onFail = () => { clearTimeout(timer); reject(new Error("SDK 로드 실패 · 도메인 미등록 또는 키 오류")); };
    if (!el) {
      el = document.createElement("script");
      el.id = ID; el.async = true;
      el.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=" + KAKAO_CFG.js + "&autoload=false&libraries=services";
      el.addEventListener("load", onReady);
      el.addEventListener("error", onFail);
      document.head.appendChild(el);
    } else if (window.kakao && window.kakao.maps) { onReady(); }
    else { el.addEventListener("load", onReady); el.addEventListener("error", onFail); }
  });
  kakaoSdkPromise.catch(() => { kakaoSdkPromise = null; });
  return kakaoSdkPromise;
}

/* Local REST API 공통 호출기 */
export async function kakaoLocal(path, params, timeoutMs = 8000) {
  if (!KAKAO_CFG.rest) throw new Error("REST 키가 설정되지 않았습니다");
  const raw = "https://dapi.kakao.com/v2/local/" + path + "?" + new URLSearchParams(params).toString();
  const url = KAKAO_CFG.proxy ? KAKAO_CFG.proxy + encodeURIComponent(raw) : raw;
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = setTimeout(() => ctrl && ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Authorization: "KakaoAK " + KAKAO_CFG.rest },
      signal: ctrl ? ctrl.signal : undefined,
    });
    if (!res.ok) throw new Error("HTTP " + res.status + (res.status === 401 ? " · REST 키 확인" : res.status === 403 ? " · 사용 권한/도메인 확인" : ""));
    return await res.json();
  } finally { clearTimeout(timer); }
}

/* 좌표 → 행정구역 (도착 인증 대조용) */
export async function kakaoRegionOf(lat, lng) {
  const j = await kakaoLocal("geo/coord2regioncode.json", { x: String(lng), y: String(lat) });
  const docs = (j && j.documents) || [];
  const doc = docs.find(d => d.region_type === "B") || docs[0];
  if (!doc) throw new Error("행정구역 조회 결과 없음");
  return {
    sido: SIDO_SHORT[doc.region_1depth_name] || doc.region_1depth_name,
    sigungu: doc.region_2depth_name || "",
    dong: doc.region_3depth_name || "",
    code: doc.code, full: doc.address_name,
  };
}

/* 좌표 → 행정구역 · Maps SDK 경로 (CORS 영향 없음) */
export function kakaoRegionViaSdk(lat, lng, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    loadKakaoSdk().then(kakao => {
      const svc = kakao.maps.services;
      if (!svc || !svc.Geocoder) { reject(new Error("services 라이브러리가 로드되지 않았습니다")); return; }
      let settled = false;
      const timer = setTimeout(() => { if (!settled) { settled = true; reject(new Error("SDK 역지오코딩 타임아웃")); } }, timeoutMs);
      new svc.Geocoder().coord2RegionCode(lng, lat, (res, status) => {
        if (settled) return;
        settled = true; clearTimeout(timer);
        if (status !== svc.Status.OK || !res || !res.length) { reject(new Error("SDK 응답 " + status)); return; }
        const doc = res.find(d => d.region_type === "B") || res[0];
        resolve({
          sido: SIDO_SHORT[doc.region_1depth_name] || doc.region_1depth_name,
          sigungu: doc.region_2depth_name || "",
          dong: doc.region_3depth_name || "",
          code: doc.code, full: doc.address_name, via: "SDK",
        });
      });
    }).catch(reject);
  });
}

/* SDK 우선, 실패 시 REST 폴백 */
export async function kakaoRegionAny(lat, lng) {
  try { return await kakaoRegionViaSdk(lat, lng); }
  catch (e1) {
    try { const r = await kakaoRegionOf(lat, lng); r.via = "REST"; return r; }
    catch (e2) {
      throw new Error("SDK: " + ((e1 && e1.message) || e1) + " / REST: " + ((e2 && e2.message) || e2));
    }
  }
}

export function kakaoRouteUrl(d) {
  const name = encodeURIComponent(String(d.title || "목적지").replace(/,/g, " "));
  return "https://map.kakao.com/link/to/" + name + "," + d.lat + "," + d.lng;
}

/* Kakao JS SDK (공유) */
let kakaoSharePromise = null;

/* 키를 바꾼 뒤 SDK 를 다시 로드하기 위해 캐시를 비운다 */
export function resetKakaoSdkCache() {
  kakaoSdkPromise = null;
  kakaoSharePromise = null;
}

export function loadKakaoShare() {
  if (typeof window === "undefined") return Promise.reject(new Error("브라우저 환경이 아닙니다"));
  if (window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()) return Promise.resolve(window.Kakao);
  if (kakaoSharePromise) return kakaoSharePromise;
  kakaoSharePromise = new Promise((resolve, reject) => {
    const ID = "kakao-js-sdk";
    const init = () => {
      try {
        if (!window.Kakao) throw new Error("SDK 객체 없음");
        if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_CFG.js);
        resolve(window.Kakao);
      } catch (e) { reject(new Error("초기화 실패 · " + ((e && e.message) || e))); }
    };
    if (window.Kakao) { init(); return; }
    const el = document.createElement("script");
    el.id = ID; el.async = true;
    el.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    el.integrity = ""; el.crossOrigin = "anonymous";
    el.addEventListener("load", init);
    el.addEventListener("error", () => reject(new Error("Kakao JS SDK 로드 실패")));
    document.head.appendChild(el);
  });
  kakaoSharePromise.catch(() => { kakaoSharePromise = null; });
  return kakaoSharePromise;
}

/* 초대 링크: 현재 배포 주소 + ?join=코드 */
export function inviteLink(code) {
  /* 기준 주소는 config.siteUrl 로 고정한다.
     예전에는 현재 페이지 주소로 만들었는데, 미리보기 파일(file://)이나
     로컬 개발 서버에서 공유하면 친구가 못 여는 링크가 만들어졌다. */
  let base = CFG.siteUrl;
  if (typeof window !== "undefined" && window.location && /^https?:$/.test(window.location.protocol)) {
    base = window.location.origin + window.location.pathname;
  }
  try {
    const u = new URL(base);
    u.hash = ""; u.search = "";
    u.searchParams.set("join", code);
    return u.toString();
  } catch (e) {
    return CFG.siteUrl + "?join=" + encodeURIComponent(code);
  }
}

/* 카카오톡 공유 카드에 들어갈 이미지.
   카카오 서버가 직접 받아가므로 반드시 공개된 절대 주소여야 한다. */
export function shareImage(){
  return CFG.siteUrl.replace(/\/+$/, "") + "/og.png";
}
