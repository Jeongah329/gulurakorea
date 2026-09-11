/**
 * 251개 시·군·구 경계 데이터와 주소 → 시군구 매칭
 */
import SIGUNGU_DATA from "../../data/sigungu_data.json";

/* 시·군·구 실제 경계 (행정구역 GeoJSON → SVG path 변환). 빌드 시 주입됨. */
export const SIGUNGU = SIGUNGU_DATA;

export const SIGUNGU_BY_SIDO = SIGUNGU.reduce((m, s) => { (m[s.sido] = m[s.sido] || []).push(s); return m; }, {});

/* "창원시성산구" → "창원 성산구", "강릉시" → "강릉", "영도구" → "영도구" */
export function shortSgg(name) {
  let n = String(name || "").replace(/^(.+시)(.+구)$/, "$1 $2").replace(/시 /, " ");
  return n.replace(/(시|군)$/, "") || name;
}

/* TourAPI addr1 문자열 → 실제 시·군·구 경계 데이터(SIGUNGU) 매칭 */
export function sggFromAddr(addr, sidoHint) {
  const parts = String(addr || "").trim().split(/\s+/);
  const cands = SIGUNGU_BY_SIDO[sidoHint] || SIGUNGU;
  const j1 = parts[1] || "", j2 = parts[2] || "";
  let hit = cands.find(s => s.name === j1 + j2);
  if (!hit) hit = cands.find(s => s.name === j1);
  if (!hit && j1) hit = cands.find(s => s.name.startsWith(j1) || j1.startsWith(s.name));
  if (!hit && cands.length === 1) hit = cands[0];
  return hit || null;
}

/* 게임판 기준 코드.
   · 특별시·광역시 7곳은 자치구를 나누지 않고 시 단위 한 칸
   · 일반구를 둔 시(수원·성남·창원·청주 등)도 시 단위 한 칸 */
/* 독도 — 행정구역상 울릉군이지만 게임판에서는 한 칸으로 따로 둔다 */
export const DOKDO_CODE = "37900";

export const METRO = { "11":"11000","21":"21000","22":"22000","23":"23000","24":"24000","25":"25000","26":"26000" };

/* 일반구를 가진 시 — 자치구를 나누지 않고 시 한 칸으로 묶는다 */
export const CITY_MERGE = {
  "31011":"31011",
  "31012":"31011",
  "31013":"31011",
  "31014":"31011",
  "31021":"31021",
  "31022":"31021",
  "31023":"31021",
  "31041":"31041",
  "31042":"31041",
  "31051":"31051",
  "31052":"31051",
  "31053":"31051",
  "31091":"31091",
  "31092":"31091",
  "31101":"31101",
  "31103":"31101",
  "31104":"31101",
  "31191":"31191",
  "31192":"31191",
  "31193":"31191",
  "33011":"33011",
  "33012":"33011",
  "34011":"34011",
  "34012":"34011",
  "35011":"35011",
  "35012":"35011",
  "37011":"37011",
  "37012":"37011",
  "38111":"38111",
  "38112":"38111",
  "38113":"38111",
  "38114":"38111",
  "38115":"38111",
};

export function boardCode(code){
  const c = String(code || "");
  if (c === DOKDO_CODE) return DOKDO_CODE;
  return METRO[c.slice(0,2)] || CITY_MERGE[c] || c;
}

/* ── 합쳐진 지역의 외곽선 계산 ──────────────────────────────
   조각들을 그대로 겹쳐 그리면 안쪽 구 경계선이 그대로 보인다.
   두 조각이 맞닿은 변은 정확히 두 번 나타나므로, 두 번 나온 변을 지우고
   한 번만 나온 변을 이어 붙이면 덩어리 바깥 테두리만 남는다. */
function parseRings(dstr){
  return String(dstr || "").split("M").filter(Boolean).map(seg=>{
    const pts=[]; const re=/(-?\d+\.?\d*),(-?\d+\.?\d*)/g; let m;
    while((m=re.exec(seg))) pts.push([Math.round(+m[1]*10)/10, Math.round(+m[2]*10)/10]);
    return pts;
  }).filter(r=>r.length>2);
}
const ptKey = (p)=> p[0]+","+p[1];

export function outlineOf(dList){
  if (!dList || dList.length === 0) return "";
  if (dList.length === 1) return dList[0];
  const cnt=new Map(), store=new Map();
  dList.forEach(ds=> parseRings(ds).forEach(r=>{
    for(let i=0;i<r.length;i++){
      const a=r[i], b=r[(i+1)%r.length];
      const ka=ptKey(a), kb=ptKey(b);
      if(ka===kb) continue;
      const k = ka<kb ? ka+"|"+kb : kb+"|"+ka;
      cnt.set(k,(cnt.get(k)||0)+1); store.set(k,[a,b]);
    }
  }));
  const adj=new Map();
  cnt.forEach((n,k)=>{
    if(n!==1) return;
    const [a,b]=store.get(k), ka=ptKey(a), kb=ptKey(b);
    if(!adj.has(ka)) adj.set(ka,[]);
    if(!adj.has(kb)) adj.set(kb,[]);
    adj.get(ka).push(b); adj.get(kb).push(a);
  });
  const used=new Set(); const chains=[];
  adj.forEach((_,start)=>{
    if(used.has(start)) return;
    const chain=[]; let cur=start, prev=null;
    while(cur && !used.has(cur)){
      used.add(cur);
      const xy=cur.split(",");
      chain.push(xy[0]+","+xy[1]);
      const nb=(adj.get(cur)||[]).map(ptKey).find(k=>!used.has(k) && k!==prev);
      prev=cur; cur=nb;
    }
    if(chain.length>2) chains.push(chain);
  });
  if(!chains.length) return dList.join(" ");
  return chains.map(c=>"M"+c.join(" ")+"Z").join(" ");
}
