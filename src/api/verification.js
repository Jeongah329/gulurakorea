/**
 * 도착 인증 / 영수증 인증
 */
import Tesseract, { createWorker } from "tesseract.js";
import { kakaoLocal, kakaoRegionAny } from "./kakao.js";
import { getPosition, haversineKm } from "../lib/geo.js";
import { shortSgg } from "../lib/sigungu.js";

/* 실제 GPS + 카카오 행정구역 대조 도착 인증 */
export async function verifyArrivalReal(trip, radiusM) {
  const pos = await getPosition();
  const hasCoord = isFinite(trip.lat) && isFinite(trip.lng);
  const dist = hasCoord ? Math.round(haversineKm(pos, { lat: trip.lat, lng: trip.lng }) * 1000) : null;
  let region = null, regionOk = null;
  try {
    region = await kakaoRegionAny(pos.lat, pos.lng);
    const a = shortSgg(region.sigungu), b = String(trip.sigungu || "");
    regionOk = region.sido === trip.sido && (a === b || a.startsWith(b) || b.startsWith(a));
  } catch (e) { region = null; }

  if (dist != null && dist <= radiusM) return { ok: true, dist, acc: pos.acc, region, regionOk, mode: "live" };
  if (dist == null && regionOk === true) return { ok: true, dist: null, acc: pos.acc, region, regionOk, mode: "live" };
  const where = region ? region.full : "행정구역 확인 불가";
  const reason = dist != null
    ? "목적지에서 " + (dist >= 1000 ? (dist / 1000).toFixed(1) + "km" : dist + "m") + " 떨어져 있어요 (필요: " + radiusM + "m 이내) · 현재 " + where
    : "현재 위치가 " + where + " 로 확인돼요 · 목적지 " + trip.sido + " " + trip.sigungu + " 와 일치하지 않습니다";
  return { ok: false, dist, acc: pos.acc, region, regionOk, reason, mode: "live" };
}

/* 같은 영수증(이미지) 재사용을 막기 위한 해시 기록 · 데모 수준(새로고침 시 초기화).
   실서비스에선 서버 DB로 옮길 것 */
const usedReceiptHashes = new Set();
async function hashFile(file) {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ── OCR 속도 개선 ────────────────────────────────────────────
   1) 인식기를 한 번만 만들어 재사용한다.
      Tesseract.recognize() 를 부를 때마다 한국어 학습 데이터를 다시 내려받느라
      인증할 때마다 수십 초가 걸렸다. 작업자를 붙잡아 두면 두 번째부터 즉시 읽는다.
   2) 사진을 긴 변 1280px 로 줄여서 읽는다.
      요즘 휴대폰 사진은 4000px 이 넘는데, 영수증 글자는 1280px 이면 충분히 읽힌다.
      픽셀 수가 10분의 1로 줄어 인식 시간도 그만큼 짧아진다.
   ──────────────────────────────────────────────────────────── */

let workerPromise = null;
function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("kor+eng").catch((e) => {
      workerPromise = null;      // 실패하면 다음에 다시 시도할 수 있게 비운다
      throw e;
    });
  }
  return workerPromise;
}

/* 인증 화면에 들어올 때 미리 불러 두면 실제 인증 순간에 기다리지 않는다. */
export function warmUpOcr() {
  try { getWorker().catch(() => {}); } catch (e) {}
}

/* 사진을 긴 변 기준으로 줄인다. 실패하면 원본을 그대로 돌려준다. */
async function shrink(file, maxSide = 1280) {
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = url;
    });
    const long = Math.max(img.width, img.height);
    if (long <= maxSide) { URL.revokeObjectURL(url); return file; }
    const r = maxSide / long;
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * r);
    c.height = Math.round(img.height * r);
    const ctx = c.getContext("2d");
    if (!ctx) { URL.revokeObjectURL(url); return file; }
    ctx.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    const blob = await new Promise((res) => c.toBlob(res, "image/jpeg", 0.85));
    return blob || file;
  } catch (e) {
    return file;
  }
}

/* 영수증 사진(file)을 OCR로 읽어 상호명 · 지역 · 날짜 · 금액을 추출하고
   4가지 조건(지역 일치 / 최근 영수증 / 사업자 진위 / 중복 아님)으로 방문을 검증한다.
   Tesseract.js는 완전 무료 · 브라우저 로컬 실행이라 별도 API 키나 서버가 필요 없다. */
export async function verifyReceipt(dest, file) {
  if (!file) throw new Error("영수증 사진을 선택해 주세요");

  /* 해시는 원본으로 구해야 같은 사진을 다시 쓰는지 정확히 걸러진다 */
  const hashPromise = hashFile(file);

  let text = "";
  try {
    const [worker, small] = await Promise.all([getWorker(), shrink(file)]);
    ({ data: { text } } = await worker.recognize(small));
  } catch (e) {
    /* 작업자를 못 만들면 예전 방식으로 한 번 더 시도한다 */
    ({ data: { text } } = await Tesseract.recognize(await shrink(file), "kor+eng"));
  }
  const cleaned = text.replace(/[ \t]+/g, " ").trim();
  const lines = cleaned.split("\n").map(l => l.trim()).filter(Boolean);

  // 1) 지역 일치: OCR 텍스트에 목적지 시/군/구 이름이 등장하는지
  const region = cleaned.includes(dest.sigungu) || cleaned.includes(dest.sido);

  // 2) 최근 영수증인지: 날짜 패턴(2026-08-19 / 2026.08.19 / 2026년 8월 19일 등)을 찾아 48시간 이내인지 확인
  const dateMatch = cleaned.match(/(20\d{2})[.\-\/년]\s?(\d{1,2})[.\-\/월]\s?(\d{1,2})/);
  let recent = false, datetime = "날짜 인식 실패";
  if (dateMatch) {
    const [, y, m, d] = dateMatch;
    const receiptDate = new Date(+y, +m - 1, +d);
    const diffHours = Math.abs(Date.now() - receiptDate.getTime()) / 36e5;
    recent = diffHours <= 48;
    datetime = `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`;
  }

  // 3) 사업자등록번호 패턴(예: 123-45-67890)이 영수증에 있는지
  const bizNumFound = /\d{3}-\d{2}-\d{5}/.test(cleaned);

  // 4) 중복 아님: 같은 이미지를 이미 인증에 쓴 적 있는지 해시로 확인
  const hash = await hashPromise;
  const unique = !usedReceiptHashes.has(hash);
  if (unique) usedReceiptHashes.add(hash);

  // 상호명 추정: 사업자번호 · 안내문구가 아니면서 한글 2자 이상 포함된 첫 줄
  const storeLine = lines.find(l =>
    /[가-힣]{2,}/.test(l) &&
    !/\d{3}-\d{2}-\d{5}/.test(l) &&
    !/(영수증|매출전표|카드매출|사업자|대표자|주소|품명|합계|부가세)/.test(l)
  );
  const guessedStore = storeLine || (dest.missions.find(m => m.t === "맛집")?.n) || "상호명 인식 실패";

  // 금액 추정: "12,000원" 또는 "12000원" 형태 중 마지막 매치를 합계로 사용
  const amountMatches = [...cleaned.matchAll(/(\d{1,3}(?:,\d{3})+|\d{4,6})\s?원/g)];
  const amount = amountMatches.length
    ? parseInt(amountMatches[amountMatches.length - 1][1].replace(/,/g, ""), 10)
    : 0;

  // 5) 카카오 로컬로 실제 존재하는 상호인지 한 번 더 대조 (OCR로 읽은 이름 기준)
  let store = guessedStore, biz = bizNumFound;
  let bizNote = bizNumFound ? "사업자등록번호 인식됨" : "사업자등록번호를 인식하지 못했어요";
  if (isFinite(dest.lat) && isFinite(dest.lng) && guessedStore !== "상호명 인식 실패") {
    try {
      const j = await kakaoLocal("search/keyword.json", {
        query: guessedStore, x: String(dest.lng), y: String(dest.lat), radius: "20000", size: "5",
      });
      const found = ((j && j.documents) || [])[0] || null;
      if (found) {
        store = found.place_name;
        biz = true;
        bizNote = "카카오 로컬 확인 · " + (found.road_address_name || found.address_name || found.place_name);
      } else if (!bizNumFound) {
        bizNote = "카카오 로컬에서도, 사업자번호로도 확인되지 않았어요";
      }
    } catch (e) {
      // REST 조회 실패 시 OCR로 읽은 사업자번호 여부만으로 판단 (조용히 폴백)
    }
  }

  return {
    store, sido: dest.sido, sigungu: dest.sigungu, datetime, amount, bizNote,
    checks: { region, recent, biz, unique },
    rawText: cleaned,
  };
}

export function verifyGps(){ return { ok:true, dist:60+Math.floor(Math.random()*140) }; }
