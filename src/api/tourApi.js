/**
 * 한국관광공사 TourAPI 4.0 (KorService2) 연동
 */
import CFG from "../config.js";
import { DEPOP_SET } from "../data/depopulated.js";
import { SAMPLE_POOL } from "../data/sampleDestinations.js";
import { haversineKm } from "../lib/geo.js";
import { sggFromAddr, shortSgg } from "../lib/sigungu.js";
import { stripTags } from "../lib/text.js";

/* ═══════════════════════════════════════════════════════════
   TourAPI 4.0 · 한국관광공사 국문 관광정보 서비스 (KorService2)
   https://apis.data.go.kr/B551011/KorService2
   ─ 사용 오퍼레이션
     · areaBasedList2      지역기반 관광정보 목록
     · locationBasedList2  좌표기반 주변 관광정보 (미션 생성용)
     · detailCommon2       콘텐츠 공통정보 (overview / 대표이미지)
   ═══════════════════════════════════════════════════════════ */
export const TOUR_BASE = "https://apis.data.go.kr/B551011/KorService2";

export const TOUR_CFG = {
  key: CFG.tourKey || "0bf54343e288b4b60ab5cbd7f063ab23791ed410c8855990cba319a33bc3af18",
  app: "PaltoJeongbok",
  proxy: CFG.tourProxy, // CORS 우회 프록시 prefix. 비워두면 브라우저에서 직접 호출.
};

export const HOME_ORIGIN = { lat: 37.5665, lng: 126.9780, label: "서울 중구", sub: "기본 출발지 · 위치 권한을 허용하면 실제 위치로 바뀝니다" };

/* TourAPI areaCode ↔ 시도 (+ 시도 중심 좌표: 거리 조건 1차 필터용) */
export const TOUR_AREAS = [
  { code:"1",  sido:"서울", lat:37.5665, lng:126.9780 },
  { code:"2",  sido:"인천", lat:37.4563, lng:126.7052 },
  { code:"3",  sido:"대전", lat:36.3504, lng:127.3845 },
  { code:"4",  sido:"대구", lat:35.8714, lng:128.6014 },
  { code:"5",  sido:"광주", lat:35.1595, lng:126.8526 },
  { code:"6",  sido:"부산", lat:35.1796, lng:129.0756 },
  { code:"7",  sido:"울산", lat:35.5384, lng:129.3114 },
  { code:"8",  sido:"세종", lat:36.4801, lng:127.2890 },
  { code:"31", sido:"경기", lat:37.4138, lng:127.5183 },
  { code:"32", sido:"강원", lat:37.8228, lng:128.1555 },
  { code:"33", sido:"충북", lat:36.8000, lng:127.7000 },
  { code:"34", sido:"충남", lat:36.5184, lng:126.8000 },
  { code:"35", sido:"경북", lat:36.4919, lng:128.8889 },
  { code:"36", sido:"경남", lat:35.4606, lng:128.2132 },
  { code:"37", sido:"전북", lat:35.7175, lng:127.1530 },
  { code:"38", sido:"전남", lat:34.8679, lng:126.9910 },
  { code:"39", sido:"제주", lat:33.4996, lng:126.5312 },
];

/* TourAPI 분류코드/제목 → 앱의 5가지 테마로 분류 */
export const THEME_KW = {
  sea:     ["해수욕장","해변","해안","바다","포구","등대","선착장","방파제","해상","어촌","해양","비치","항구","섬"],
  nature:  ["계곡","폭포","호수","수목원","동굴","자연","저수지","습지","생태","숲","공원","정원","둘레길","산림","등산","고원","목장","꽃","약수"],
  history: ["사찰","서원","향교","고택","궁","산성","왕릉","고분","유적","박물관","기념관","문화재","한옥","고인돌","역사","서당","전통","서원"],
  city:    ["거리","시장","타워","야경","광장","골목","쇼핑","백화점","스카이","벽화","카페","전망대"],
  food:    ["맛집","식당","먹거리","음식","횟집","국밥","한정식"],
};

export function classifyThemes(it) {
  const set = new Set();
  const c1 = it.cat1 || "", c2 = it.cat2 || "", ct = String(it.contenttypeid || "");
  if (c1 === "A01") set.add("nature");
  if (c1 === "A02") {
    if (c2 === "A0201" || c2 === "A0206") set.add("history");
    if (c2 === "A0205" || c2 === "A0204") set.add("city");
    if (c2 === "A0202" || c2 === "A0203") set.add("nature");
  }
  if (c1 === "A03") set.add("nature");
  if (c1 === "A04") set.add("city");
  if (c1 === "A05" || ct === "39") set.add("food");
  if (ct === "14") set.add("history");
  if (ct === "15") set.add("city");
  const title = String(it.title || "");
  Object.keys(THEME_KW).forEach(t => { if (THEME_KW[t].some(w => title.includes(w))) set.add(t); });
  if (!set.size) set.add("nature");
  const PRIORITY = ["sea","history","food","city","nature"];
  return PRIORITY.filter(t => set.has(t));
}

export const THEME_GRAD = {
  sea:["#3AA8C1","#1E6F8E"], nature:["#4CA36B","#24704A"], history:["#C2704A","#8A4326"],
  city:["#8B6FC8","#55408C"], food:["#DDA03C","#A96E17"],
};

/* 공통 호출기: JSON 파싱 + data.go.kr XML 오류응답 해석 + 타임아웃 */
export async function tourGet(op, params, timeoutMs = 9000) {
  const q = new URLSearchParams(Object.assign({
    serviceKey: TOUR_CFG.key, MobileOS: "ETC", MobileApp: TOUR_CFG.app, _type: "json",
  }, params));
  const raw = TOUR_BASE + "/" + op + "?" + q.toString();
  const url = TOUR_CFG.proxy ? TOUR_CFG.proxy + encodeURIComponent(raw) : raw;
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = setTimeout(() => ctrl && ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl ? ctrl.signal : undefined, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    if (text.trim().startsWith("<")) {
      const m = text.match(/<returnAuthMsg>([^<]*)<\/returnAuthMsg>/) || text.match(/<errMsg>([^<]*)<\/errMsg>/);
      throw new Error(m ? "인증키/파라미터 오류 · " + m[1] : "XML 오류 응답");
    }
    const json = JSON.parse(text);
    const header = json && json.response && json.response.header;
    if (header && header.resultCode && header.resultCode !== "0000") {
      throw new Error(header.resultCode + " " + (header.resultMsg || ""));
    }
    const items = json && json.response && json.response.body && json.response.body.items;
    if (!items || items === "") return [];
    const it = items.item;
    return Array.isArray(it) ? it : (it ? [it] : []);
  } finally { clearTimeout(timer); }
}

/* 시도별 목록 캐시 (한 세션 동안 재호출 안 함) */
export const tourCache = new Map();

export function tourAreaPool(areaCode) {
  if (tourCache.has(areaCode)) return tourCache.get(areaCode);
  const listOf = (ct, rows) =>
    tourGet("areaBasedList2", { areaCode, contentTypeId: ct, numOfRows: rows, pageNo: "1", arrange: "O" })
      .catch(() => tourGet("areaBasedList2", { areaCode, contentTypeId: ct, numOfRows: rows, pageNo: "1" }));
  const p = Promise.all([ listOf("12", "100"), listOf("14", "50").catch(() => []) ]).then(r => r[0].concat(r[1]));
  tourCache.set(areaCode, p);
  p.catch(() => tourCache.delete(areaCode));
  return p;
}

export function buildDest(it, origin) {
  const area = TOUR_AREAS.find(a => a.code === String(it.areacode));
  const sg = sggFromAddr(it.addr1, area && area.sido);
  if (!sg) return null;
  const lat = parseFloat(it.mapy), lng = parseFloat(it.mapx);
  if (!isFinite(lat) || !isFinite(lng)) return null;
  const title = stripTags(it.title);
  if (!title) return null;
  const themes = classifyThemes(it);
  return {
    contentid: String(it.contentid),
    contenttypeid: String(it.contenttypeid || "12"),
    title, sido: sg.sido, sigungu: shortSgg(sg.name), sgg: sg.code,
    themes, depop: DEPOP_SET.has(sg.sido + "|" + sg.name),
    lat, lng, addr: it.addr1 || "",
    image: it.firstimage || it.firstimage2 || "",
    grad: THEME_GRAD[themes[0]] || ["#4C7FCF", "#2A4E92"],
    distanceKm: Math.round(haversineKm(origin, { lat, lng })),
    overview: "", missions: [], source: "tourapi",
  };
}

/* 데이터 접근 계층 — TourAPI 우선, 실패 시 샘플 폴백 */
export async function fetchDestinations({ themes, distCap, origin }) {
  const org = origin || HOME_ORIGIN;
  try {
    if (!TOUR_CFG.key) throw new Error("인증키 미설정");
    const scored = TOUR_AREAS.map(a => Object.assign({}, a, { d: haversineKm(org, a) })).sort((x, y) => x.d - y.d);
    let cands = distCap >= 9999 ? scored : scored.filter(a => a.d <= distCap + 90);
    if (!cands.length) cands = scored.slice(0, 3);
    const picks = cands.slice().sort(() => Math.random() - 0.5).slice(0, Math.min(3, cands.length));
    const lists = await Promise.all(picks.map(a => tourAreaPool(a.code).catch(() => [])));
    const items = [].concat.apply([], lists);
    if (!items.length) throw new Error("응답 결과 0건");

    const seen = new Set();
    const all = items.map(it => buildDest(it, org)).filter(d => {
      if (!d || seen.has(d.contentid)) return false;
      seen.add(d.contentid); return true;
    });
    if (!all.length) throw new Error("변환 가능한 목적지 없음");

    let relaxed = false;
    let pool = all.filter(d => d.distanceKm <= distCap);
    if (themes.length) {
      const t = pool.filter(d => d.themes.some(x => themes.includes(x)));
      if (t.length) pool = t; else relaxed = true;
    }
    if (!pool.length) { pool = all; relaxed = true; }
    return { pool, relaxed, source: "live", error: null };
  } catch (e) {
    let relaxed = false;
    let pool = SAMPLE_POOL.filter(d => d.distanceKm <= distCap);
    if (themes.length) {
      const t = pool.filter(d => d.themes.some(x => themes.includes(x)));
      if (t.length) pool = t; else relaxed = true;
    }
    if (!pool.length) { pool = SAMPLE_POOL.slice(); relaxed = true; }
    return { pool, relaxed, source: "sample", error: String((e && e.message) || e) };
  }
}

/* 확정된 목적지 1건만 상세 조회 — overview + 주변 맛집·체험으로 미션 3종 생성 */
export async function enrichDestination(d) {
  if (!d || d.source !== "tourapi") return d;
  const near = (ct, rows) => tourGet("locationBasedList2", {
    mapX: String(d.lng), mapY: String(d.lat), radius: "10000",
    contentTypeId: ct, numOfRows: rows, pageNo: "1", arrange: "E",
  }).catch(() => []);
  const r = await Promise.all([
    tourGet("detailCommon2", { contentId: d.contentid }).catch(() => []),
    near("39", "30"),
    near("12", "30"),
  ]);
  const c = r[0][0] || {};

  /* 주변 목록 → 사용자가 고를 수 있는 후보 리스트로 정리 (가까운 순, 최대 8곳) */
  const toPlaces = (arr) => {
    const seen = new Set();
    return (arr || [])
      .filter(x => x && x.title && String(x.contentid) !== d.contentid)
      .map(x => {
        const name = stripTags(x.title);
        const m = parseFloat(x.dist);
        return {
          contentid: String(x.contentid),
          name,
          addr: x.addr1 || "",
          distM: isFinite(m) ? Math.round(m) : null,
          image: x.firstimage || x.firstimage2 || "",
          lat: parseFloat(x.mapy), lng: parseFloat(x.mapx),
        };
      })
      .filter(x => {
        if (!x.name || seen.has(x.name)) return false;
        seen.add(x.name); return true;
      })
      .sort((a, b) => (a.distM ?? 1e9) - (b.distM ?? 1e9))
      .slice(0, 8);
  };
  const foods = toPlaces(r[1]), plays = toPlaces(r[2]);

  let ov = stripTags(c.overview);
  if (ov.length > 190) ov = ov.slice(0, 188) + "…";
  return Object.assign({}, d, {
    overview: ov || (d.addr ? d.addr + " · 한국관광공사 관광정보 등록지" : d.sido + " " + d.sigungu + "의 관광지입니다."),
    image: d.image || c.firstimage || "",
    missionPool: { "맛집": foods, "체험": plays },
    missions: [
      { n: d.title + " 도착 인증", t: "명소" },
      { n: foods[0] ? foods[0].name + " 맛보기" : d.sigungu + " 로컬 맛집", t: "맛집",
        place: foods[0] || null },
      { n: plays[0] ? plays[0].name + " 둘러보기" : d.sigungu + " 골목 산책", t: "체험",
        place: plays[0] || null },
    ],
  });
}
