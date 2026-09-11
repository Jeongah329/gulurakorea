/**
 * 앱 셸 — 전역 상태, 게임 진행, 탭 라우팅
 */
import React, { useState, useRef, useEffect } from "react";
import { kakaoRegionAny } from "./api/kakao.js";
import {
  createRoomOnline, getMyId, getMyName, joinRoomOnline,
  leaveRoomOnline, setMyName as persistMyName, subscribeRoom, syncLock, syncOwnership, syncScore,
} from "./api/rooms.js";
import { isFirebaseConfigured } from "./firebase.js";
import { HOME_ORIGIN, enrichDestination, fetchDestinations } from "./api/tourApi.js";
import { DIST_STEPS, ME, PERSONAL_CARDS, ROOM_CARDS, TOLL, methodFor } from "./data/constants.js";
import { SAMPLE_POOL } from "./data/sampleDestinations.js";
import { SIGUNGU, boardCode, sggFromAddr } from "./lib/sigungu.js";
import { BOARD } from "./data/board.js";
import { CardUseSheet } from "./overlays/CardUseSheet.jsx";
import { DrawOverlay } from "./overlays/DrawOverlay.jsx";
import { ResultOverlay } from "./overlays/ResultOverlay.jsx";
import { ShareModal } from "./overlays/ShareModal.jsx";
import { VerifyFlow } from "./overlays/VerifyFlow.jsx";
import { MainScreen } from "./screens/MainScreen.jsx";
import { MapScreen } from "./screens/MapScreen.jsx";
import { MyScreen } from "./screens/MyScreen.jsx";
import { RankScreen } from "./screens/RankScreen.jsx";
import { DiceLogo, Splash } from "./ui/primitives.jsx";
import { CSS, S } from "./ui/styles.js";

/* ───────── 메인 앱 ───────── */
export default function App(){
  const [tab,setTab] = useState("main");
  const [members,setMembers] = useState([ME]);
  const [room,setRoom] = useState(null);
  const [ownership,setOwnership] = useState({}); // 게임판 코드 -> memberId
  const [homeSet,setHomeSet] = useState(false);   // 출발 지역을 정했는지
  const [homeCand,setHomeCand] = useState(null);  // 현재 위치로 찾은 출발 지역 후보
  const [pendingJoinCode,setPendingJoinCode] = useState("");
  const [myId] = useState(()=>getMyId());
  const [myName,setMyNameState] = useState(()=>getMyName());
  const [trips,setTrips] = useState([]);
  const [cards,setCards] = useState([]);
  const [rollsLeft,setRollsLeft] = useState(5);
  const [score,setScore] = useState(0);
  const [coins,setCoins] = useState(120);
  const [inventory,setInventory] = useState([]); // 개인 카드 보유함
  const [roomCards,setRoomCards] = useState([]); // 방 카드 보유함
  const [boostIgnoreDist,setBoostIgnoreDist] = useState(false); // 📍 거리 무시 예약
  const [boostAdjacent,setBoostAdjacent] = useState(false); // 🧭 인접 지역 예약
  const [bonusActive,setBonusActive] = useState(false); // ⭐ 점령 보너스 예약
  const [rushCharges,setRushCharges] = useState(0); // 🔥 여행 러시 잔여 사용 횟수
  const [protectedRegions,setProtectedRegions] = useState([]); // 🛡️ 점령 보호된 게임판 코드 (방에서는 Firestore 공유)
  const [throneRegion,setThroneRegion] = useState(null); // 👑 왕좌의 지역 sgg 코드
  const [choices,setChoices] = useState([]); // 🔍/🗺️ 카드로 고른 후보 목적지들
  const [chooseMode,setChooseMode] = useState(null); // 'preview' | 'select'
  const [appliedBoosts,setAppliedBoosts] = useState([]); // 이번 뽑기에 실제로 적용된 카드 효과(배지 표시용)
  const [cardSheet,setCardSheet] = useState(null); // {card, kind} — 마이 탭에서 여는 통일된 카드 사용 시트
  const [toast,setToast] = useState(null);
  const [themes,setThemes] = useState(["sea"]);
  const [distIdx,setDistIdx] = useState(2);
  const [duration,setDuration] = useState("당일치기");
  const [budget,setBudget] = useState("mid");
  const [phase,setPhase] = useState("main");
  const [dieN,setDieN] = useState(1);
  const [candidate,setCandidate] = useState(null);
  const [relaxedMsg,setRelaxedMsg] = useState(false);
  const [droppedCard,setDroppedCard] = useState(null);
  const [activeTrip,setActiveTrip] = useState(null);
  const [verifyOpen,setVerifyOpen] = useState(false);
  const [result,setResult] = useState(null);
  const [started,setStarted] = useState(false);
  const [shareOpen,setShareOpen] = useState(false);
  const [origin,setOrigin] = useState(HOME_ORIGIN);
  const [apiStatus,setApiStatus] = useState({ mode:"idle", msg:"" });
  const originRef = useRef(HOME_ORIGIN);
  const rollTimer = useRef(null);

  useEffect(()=>()=>clearInterval(rollTimer.current),[]);
  useEffect(()=>{
    if(typeof window==="undefined" || !window.location) return;
    let code = "";
    try{ code = (new URLSearchParams(window.location.search).get("join")||"").trim().toUpperCase(); }catch(e){}
    if(!code) return;
    setStarted(true); setTab("map"); setPendingJoinCode(code);
    try{ window.history.replaceState({}, "", window.location.pathname); }catch(e){}
  },[]);
  useEffect(()=>{
    if(!room?.code || !isFirebaseConfigured) return;
    const unsub = subscribeRoom(room.code, (data)=>{
      if(!data){ flash("방이 종료됐어요"); setRoom(null); setMembers([ME]); return; }
      const mapped = {};
      Object.entries(data.ownership||{}).forEach(([sgg,pid])=>{ mapped[sgg] = pid===myId ? "me" : pid; });
      setOwnership(mapped);
      setProtectedRegions(Object.keys(data.locks||{}));
      const remote = Object.entries(data.members||{})
        .filter(([pid])=>pid!==myId)
        .map(([pid,m])=>({ id:pid, name:m.name||"친구", color:m.color||"#999", score:m.score||0 }));
      setMembers([ME, ...remote]);
    }, (err)=>{ flash("연결이 끊겼어요 · " + ((err&&err.message)||err)); });
    return unsub;
  },[room?.code]);
  useEffect(()=>{
    if(!room?.code || !isFirebaseConfigured) return;
    syncScore(room.code, myId, score);
  },[score, room?.code]);
  useEffect(()=>{
    if(typeof navigator==="undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (p)=>{
        const lat=p.coords.latitude, lng=p.coords.longitude;
        let o = { lat, lng, label:"위치 확인됨", sub:`${lat.toFixed(4)}, ${lng.toFixed(4)} · 지명 조회 실패` };
        try{
          const r = await kakaoRegionAny(lat,lng);
          const place = [r.sido, r.sigungu].filter(Boolean).join(" ");
          o = { lat, lng, label: place || "위치 확인됨", sub: (r.dong ? r.dong + " · " : "") + "GPS 기준" };
        }catch(e){
          const why = String((e && e.message) || e);
          o.sub = `${lat.toFixed(4)}, ${lng.toFixed(4)} · 지명 조회 실패 — ${why.length > 110 ? why.slice(0,108) + "…" : why}`;
        }
        originRef.current=o; setOrigin(o);
        try{
          const r2 = await kakaoRegionAny(lat,lng);
          const hit = sggFromAddr([r2.sido,r2.sigungu].filter(Boolean).join(" "), r2.sido);
          if(hit){
            const bc = boardCode(hit.code);
            const tile = BOARD.find(t=>t.code===bc);
            setHomeCand({ code: bc, sido: tile?tile.sido:hit.sido, name: tile?tile.name:hit.name });
          }
        }catch(e){}
      },
      ()=>{}, { enableHighAccuracy:false, timeout:7000, maximumAge:600000 });
  },[]);
  function flash(msg){ setToast(msg); setTimeout(()=>setToast(null),2300); }
  const memberById = (id)=> members.find(m=>m.id===id);
  const ownerColor = (id)=> id? (memberById(id)?.color||"var(--paper-2)") : "var(--paper-2)";
  const ownedCount = Object.values(ownership).filter(v=>v==="me").length;
  const myRegionCount = (id)=> Object.values(ownership).filter(v=>v===id).length;
  const memberScore = (id)=> id==="me" ? score : (memberById(id)?.score||0);
  const myRoomScore = members.reduce((s,m)=> s + memberScore(m.id), 0);
  const myRoomRegions = members.reduce((s,m)=> s + myRegionCount(m.id), 0);
  const toggleTheme = (t)=> setThemes(p=> p.includes(t)? p.filter(x=>x!==t) : [...p,t]);

  // 내가 점령한 지역들이 속한 시·도 집합 (서울 홈 포함) — 🧭 인접 지역 카드용
  function ownedSidoSet(){
    const set = new Set();
    Object.keys(ownership).forEach(code=>{ if(ownership[code]!=="me") return; const t=BOARD.find(b=>b.code===code); if(t) set.add(t.sido); });
    return set;
  }
  function filterAdjacent(pool){
    const sidos = ownedSidoSet();
    const f = pool.filter(d=>sidos.has(d.sido));
    return f.length ? f : null;
  }
  async function drawPool(){
    const distCap = boostIgnoreDist ? 9999 : DIST_STEPS[distIdx].cap;
    let relaxed=false, source="sample", error=null, pool=[];
    try{
      const r = await fetchDestinations({ themes, distCap, origin: originRef.current });
      relaxed=r.relaxed; source=r.source; error=r.error; pool=r.pool;
    }catch(e){ error=String((e&&e.message)||e); }
    if(!pool.length){ pool=SAMPLE_POOL; source="sample"; relaxed=true; }
    if(boostAdjacent){ const adj=filterAdjacent(pool); if(adj) pool=adj; else relaxed=true; }
    return { pool, relaxed, source, error };
  }
  async function finalizePick(pick){
    if(pick && pick.source==="tourapi"){
      try { pick = await enrichDestination(pick); }
      catch(e){ pick = Object.assign({}, pick, {
        overview: pick.addr || (pick.sido+" "+pick.sigungu),
        missions: [{n:pick.title+" 도착 인증",t:"명소"},{n:pick.sigungu+" 로컬 맛집",t:"맛집"},{n:pick.sigungu+" 골목 산책",t:"체험"}],
      }); }
    }
    return pick;
  }
  function dropRandomCard(){
    if(Math.random()<0.35){
      const card = PERSONAL_CARDS[Math.floor(Math.random()*PERSONAL_CARDS.length)];
      const dropped = {...card, kind:"personal"};
      setDroppedCard(dropped); setInventory(inv=>[...inv,card]);
    } else if(room && Math.random()<0.18){
      const card = ROOM_CARDS[Math.floor(Math.random()*ROOM_CARDS.length)];
      const dropped = {...card, kind:"room"};
      setDroppedCard(dropped); setRoomCards(inv=>[...inv,card]);
    }
  }
  function boostBadges(){
    const b=[];
    if(boostIgnoreDist) b.push({icon:"📍",label:"거리 무시 적용됨"});
    if(boostAdjacent) b.push({icon:"🧭",label:"인접 지역 적용됨"});
    return b;
  }
  async function rollDice(){
    if(rollsLeft<=0) return;
    const t0 = Date.now();
    const usedBoosts = boostBadges(); // 이번 굴리기에 실제 소모될 카드 효과를 미리 기록
    setRollsLeft(r=>r-1); setDroppedCard(null); setAppliedBoosts([]); setPhase("rolling");
    clearInterval(rollTimer.current);
    rollTimer.current = setInterval(()=> setDieN(Math.floor(Math.random()*6)+1), 80);

    const { pool, relaxed, source, error } = await drawPool();
    let pick = await finalizePick(pool[Math.floor(Math.random()*pool.length)] || null);
    if(!pick){ pick = SAMPLE_POOL[Math.floor(Math.random()*SAMPLE_POOL.length)]; }
    setApiStatus({ mode:source, msg:error||"" });
    setBoostIgnoreDist(false); setBoostAdjacent(false);

    const wait = Math.max(0, 1150 - (Date.now()-t0));
    setTimeout(()=>{
      clearInterval(rollTimer.current); setDieN(Math.floor(Math.random()*6)+1);
      setCandidate(pick); setRelaxedMsg(relaxed);
      dropRandomCard();
      setAppliedBoosts(usedBoosts);
      if(usedBoosts.length) flash(usedBoosts.map(b=>`${b.icon} ${b.label}`).join(" · "));
      setPhase("sealed");
    }, wait);
  }
  function depart(){ setPhase("opening"); setTimeout(()=> setPhase("revealed"), 1900); }

  /* ───────── 개인 카드 — 🔍 미리보기 / 🗺️ 지역 선택권 : 사전 후보 선택 ───────── */
  async function plannedRoll(n){
    const usedBoosts = boostBadges(); // 미리보기/선택권도 거리무시·인접지역 카드와 함께 쓸 수 있어요
    setPhase("choosing"); setChoices([]); setAppliedBoosts(usedBoosts);
    const { pool, source, error } = await drawPool();
    setApiStatus({ mode:source, msg:error||"" });
    setBoostIgnoreDist(false); setBoostAdjacent(false);
    const shuffled = pool.slice().sort(()=>Math.random()-0.5);
    setChoices(shuffled.slice(0, Math.min(n, shuffled.length)));
    if(usedBoosts.length) flash(usedBoosts.map(b=>`${b.icon} ${b.label}`).join(" · "));
  }
  async function chooseCandidate(pick){
    const final = await finalizePick(pick);
    setCandidate(final); setChoices([]); setChooseMode(null); setDroppedCard(null);
    setPhase("opening"); setTimeout(()=> setPhase("revealed"), 1900);
  }
  function cancelChoosing(){ setPhase("main"); setChoices([]); setChooseMode(null); setAppliedBoosts([]); }

  /* ───────── 개인 카드 사용 핸들러 ───────── */
  function takePersonalCard(id){ let ok=false; setInventory(inv=>{ const i=inv.findIndex(c=>c.id===id); if(i<0) return inv; ok=true; return inv.filter((_,k)=>k!==i); }); return ok; }
  const hasPersonalCard = (id)=> inventory.some(c=>c.id===id);

  async function redrawCandidate(){
    setBoostIgnoreDist(false); setBoostAdjacent(false);
    const { pool, relaxed, source, error } = await drawPool();
    let pick = await finalizePick(pool[Math.floor(Math.random()*pool.length)] || null);
    if(!pick) pick = SAMPLE_POOL[Math.floor(Math.random()*SAMPLE_POOL.length)];
    setApiStatus({ mode:source, msg:error||"" });
    setCandidate(pick); setRelaxedMsg(relaxed);
  }
  function useRerollCard(){
    if(!candidate){ flash("주사위를 굴린 뒤 봉투 단계에서 사용할 수 있어요"); return; }
    if(!takePersonalCard("reroll")) return;
    flash("🔄 지역을 다시 배정했어요"); redrawCandidate();
  }
  function useTravelPassCard(){
    if(!candidate){ flash("주사위를 굴린 뒤 봉투 단계에서 사용할 수 있어요"); return; }
    if(!takePersonalCard("pass")) return;
    setRollsLeft(r=>r+1); flash("🎫 이번 지역을 포기하고 기회를 돌려받았어요"); resetToMain();
  }
  function usePreviewCard(){
    if(phase!=="main"){ flash("주사위 진행 중에는 사용할 수 없어요"); return; }
    if(!takePersonalCard("preview")) return;
    flash("🔍 후보 3곳을 찾는 중…"); plannedRoll(3); setChooseMode("preview");
  }
  function useSelectCard(){
    if(phase!=="main"){ flash("주사위 진행 중에는 사용할 수 없어요"); return; }
    if(!takePersonalCard("select")) return;
    flash("🗺️ 조건에 맞는 지역을 모으는 중…"); plannedRoll(8); setChooseMode("select");
  }
  function useIgnoreDistCard(){ if(!takePersonalCard("ignore_dist")) return; setBoostIgnoreDist(true); flash("📍 다음 주사위엔 거리 제한이 사라져요"); }
  function useAdjacentCard(){ if(!takePersonalCard("adjacent")) return; setBoostAdjacent(true); flash("🧭 다음 주사위는 내 영토 인접 지역 위주로 나와요"); }
  function useBonusCard(){ if(!takePersonalCard("bonus")) return; setBonusActive(true); flash("⭐ 다음 점령 점수가 늘어나요"); }
  /* 주변 후보 목록에서 미션 장소를 바꿈 (인증 전에만 가능) */
  function setMissionPlace(idx,place){
    setActiveTrip(t=>{
      const ms=t.missions.map((m,i)=>{
        if(i!==idx || m.done) return m;
        const suffix = m.t==="맛집" ? " 맛보기" : " 둘러보기";
        return {...m, n: place.name + suffix, place};
      });
      return {...t,missions:ms};
    });
  }
  function useMissionExemptCard(idx){
    if(!takePersonalCard("mission_exempt")) return;
    setMissionDone(idx,{exempt:true}); flash("🧳 미션 하나를 면제했어요");
  }
  // 🛡️ 점령 보호 카드 — 시트에서 바로 고를 수 있는 내 영토 목록(이미 보호된 곳은 제외)
  function ownedProtectableRegions(){
    return BOARD.filter(t=> ownership[t.code]==="me" && !protectedRegions.includes(t.code))
      .map(t=>({ code:t.code, name:t.name, sido:t.sido }));
  }
  function openCard(card, kind){ setCardSheet({ card, kind }); }
  function closeCard(){ setCardSheet(null); }
  function useProtectionCard(sgg, isMine){
    if(ownership[sgg]!=="me"){ flash("내가 점령한 지역만 보호할 수 있어요"); return; }
    if(protectedRegions.includes(sgg)){ flash("이미 보호된 지역이에요"); return; }
    if(!takePersonalCard("protect")) return;
    setProtectedRegions(p=>[...p,sgg]);
    if(room?.code) syncLock(room.code, sgg, true);
    flash("🛡️ 이 지역을 보호했어요 · 도전 한 번을 막아줘요");
  }
  /* ───────── 방 카드 사용 핸들러 ───────── */
  function useRoomCard(id){
    let ok=false; setRoomCards(rc=>{ const i=rc.findIndex(c=>c.id===id); if(i<0) return rc; ok=true; return rc.filter((_,k)=>k!==i); });
    if(!ok) return;
    if(id==="extra_roll"){ setRollsLeft(r=>r+1); flash("🎁 모두에게 주사위 기회가 1회씩 추가됐어요!"); }
    else if(id==="chaos"){
      if(candidate && (phase==="sealed"||phase==="revealed")){ flash("🎲 아직 출발하지 않은 여행자들의 지역이 재배정돼요"); redrawCandidate(); }
      else flash("🎲 아직 출발하지 않은 인원이 없어 조용히 지나갔어요");
    }
    else if(id==="national"){ setDistIdx(3); flash("🗺️ 이번 판, 방 전체 거리 제한이 사라졌어요"); }
    else if(id==="reveal"){
      const spot = SAMPLE_POOL[Math.floor(Math.random()*SAMPLE_POOL.length)];
      const friend = members.find(m=>m.id!=="me");
      flash(`📢 ${friend?.name||"친구"}님은 ${spot.sido} ${spot.sigungu} 근처를 노리는 중이에요`);
    }
    else if(id==="throne"){
      const cands = BOARD.filter(t=>ownership[t.code]!=="me");
      const t = cands[Math.floor(Math.random()*cands.length)];
      if(t){ setThroneRegion(t.code); flash(`👑 ${t.sido} ${t.name}이(가) 왕좌의 지역이 됐어요 · 최초 점령 +150점`); }
      else flash("👑 왕좌로 삼을 지역을 찾지 못했어요");
    }
    else if(id==="rush"){ setRushCharges(c=>c+1); flash("🔥 여행 러시! 다음 점령 점수가 크게 올라요"); }
  }

  const destOwner = candidate ? ownership[boardCode(candidate.sgg)] : undefined;
  const tollDue = candidate && destOwner && destOwner!=="me";

  function startTrip(){
    if(!candidate) return;
    const outcome = destOwner==="me" ? "revisit" : tollDue ? "toll" : "conquer";
    const protectedTile = protectedRegions.includes(boardCode(candidate.sgg));
    setActiveTrip({ ...candidate, outcome, locked: protectedTile, tollFriend: tollDue?destOwner:null,
      missions: candidate.missions.map(m=>({ ...m, method:methodFor(m.t), done:false, receipt:null, gps:null })) });
    setPhase("main"); setCandidate(null); setDroppedCard(null); setTab("main"); setVerifyOpen(true);
  }
  function resetToMain(){ setPhase("main"); setCandidate(null); setDroppedCard(null); setRelaxedMsg(false); setChoices([]); setChooseMode(null); setAppliedBoosts([]); }
  function setMissionDone(idx,payload){ setActiveTrip(t=>{ const ms=t.missions.map((m,i)=>i===idx?{...m,done:true,...payload}:m); return {...t,missions:ms}; }); }

  function applyConquer(){
    const t = activeTrip; if(!t) return null;
    const doneCount = t.missions.filter(m=>m.done).length;
    const perfect = doneCount===t.missions.length;
    let base, label, boosted=false, throneHit=false, challengeResult=null;
    if(t.outcome==="conquer"){
      base=t.depop?200:100;
      if(bonusActive || rushCharges>0){ base=Math.round(base*1.5); boosted=true; }
      if(throneRegion && boardCode(t.sgg)===throneRegion){ base+=150; throneHit=true; }
      setOwnership(o=>({...o,[boardCode(t.sgg)]:"me"}));
      if(room?.code) syncOwnership(room.code, myId, boardCode(t.sgg));
      label=`${t.sigungu} 점령`; setCoins(c=>c+(t.depop?60:30));
      if(bonusActive) setBonusActive(false);
      if(rushCharges>0) setRushCharges(c=>Math.max(0,c-1));
      if(throneHit) setThroneRegion(null);
    }
    else if(t.outcome==="toll"){
      const f=memberById(t.tollFriend);
      const bc=boardCode(t.sgg);
      if(t.locked){
        /* 상대가 🛡️ 점령 보호를 걸어둔 땅 — 도전이 막히고 통행료도 없다. 보호는 이때 풀린다 */
        base=40; label=`${f?.name||"상대"}님 점령 보호 · 도전 실패`;
        setProtectedRegions(p=>p.filter(c=>c!==bc));
        if(room?.code) syncLock(room.code, bc, false);
        challengeResult="blocked";
      } else if(perfect){
        /* 미션 3개 완주 = 도전 성공, 땅을 빼앗는다 */
        base=t.depop?200:100;
        setOwnership(o=>({...o,[bc]:"me"}));
        if(room?.code) syncOwnership(room.code, myId, bc);
        label=`${f?.name||"상대"}님 땅 탈환 · ${t.sigungu} 점령`;
        setCoins(c=>c+(t.depop?60:30));
        challengeResult="win";
      } else {
        base=40; setCoins(c=>Math.max(0,c-TOLL)); label=`통행료 ${TOLL}🪙 지불`;
        challengeResult="fail";
      }
    }
    else { base=50; label="내 영토 재방문"; }
    if(throneHit) label += " · 👑 왕좌 보너스";
    else if(boosted) label += " · ⭐ 보너스 적용";
    const bonus = doneCount*20 + (perfect?30:0);
    const total = base+bonus;
    setScore(s=>s+total);
    const newCards = t.missions.filter(m=>m.done).map(m=>({ title:m.n, place:`${t.sido} ${t.sigungu}`, type:m.exempt?"면제":m.method==="receipt"?"영수증":"인증샷", grad:t.grad, depop:t.depop }));
    setCards(c=>[...newCards,...c]);
    setTrips(tp=>[{title:t.title,sido:t.sido,sigungu:t.sigungu,depop:t.depop,outcome:t.outcome,verified:doneCount,score:total},...tp]);
    return { label, base, bonus, total, doneCount, perfect, challengeResult, cardsGained:newCards.length, outcome:t.outcome };
  }
  function finishTrip(){ const res=applyConquer(); if(res){ setResult(res); setVerifyOpen(false); } }
  function closeResult(){ setResult(null); setActiveTrip(null); setTab("map"); }
  function grantWelcomeRoomCard(){
    const card = ROOM_CARDS[Math.floor(Math.random()*ROOM_CARDS.length)];
    setRoomCards(rc=>[...rc,card]);
  }
  async function joinRoom(code){
    if(!isFirebaseConfigured){ flash("온라인 방 기능을 쓰려면 Firebase 설정이 필요해요"); return; }
    try{
      const mine = {}; Object.entries(ownership).forEach(([k,v])=>{ if(v==="me") mine[k]=v; });
      const joined = await joinRoomOnline(code, myId, myName, mine);
      setRoom({ code: joined });
      grantWelcomeRoomCard();
      flash(`방 참여 완료 · ${joined} · 방 카드 1장 획득`);
    }catch(e){ flash((e&&e.message)||"참여에 실패했어요"); }
  }

  async function createRoom(){
    if(!isFirebaseConfigured){ flash("온라인 방 기능을 쓰려면 Firebase 설정이 필요해요"); return; }
    try{
      const mine = {}; Object.entries(ownership).forEach(([k,v])=>{ if(v==="me") mine[k]=v; });
      const code = await createRoomOnline(myId, myName, mine);
      setRoom({ code });
      grantWelcomeRoomCard();
      flash(`방 생성됨 · 코드 ${code} · 친구를 초대하세요 · 방 카드 1장 획득`);
    }catch(e){ flash((e&&e.message)||"방 생성에 실패했어요"); }
  }

  /* 출발 지역 — 조건 없이 한 곳을 내 땅으로 준다 */
  function claimHome(place){
    if(!place || homeSet) return;
    setOwnership(o=> o[place.code] ? o : ({...o,[place.code]:"me"}));
    if(room?.code) syncOwnership(room.code, myId, place.code);
    setHomeSet(true);
    flash(`${place.name} · 출발 지역으로 등록했어요`);
  }
  function updateMyName(n){ setMyNameState(n); persistMyName(n); }

  function leaveRoom(){ if(room?.code) leaveRoomOnline(room.code, myId); setMembers([ME]); setRoom(null); setRoomCards([]); setThroneRegion(null); setOwnership(o=>{ const n={}; Object.entries(o).forEach(([k,v])=>{ if(v==="me") n[k]=v; }); return n; }); flash("방에서 나왔어요"); }
  function resetDemo(){
    setMembers([ME]); setRoom(null); setOwnership({}); setTrips([]); setCards([]); setRollsLeft(5); setScore(0); setCoins(120);
    setInventory([]); setRoomCards([]); setBoostIgnoreDist(false); setBoostAdjacent(false); setBonusActive(false);
    setRushCharges(0); setProtectedRegions([]); setThroneRegion(null); setChoices([]); setChooseMode(null);
    setAppliedBoosts([]); setActiveTrip(null); setVerifyOpen(false); resetToMain(); setTab("main");
  }

  return (
    <div className="app-root" style={S.root}>
      <style>{CSS}</style>
      <div className="app-shell" style={S.phone}>
        {!started ? <Splash onStart={()=>setStarted(true)}/> : (<>
        <header className="app-bar" style={S.appbar}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><DiceLogo/><span style={S.wordmark}>대한민국 부루마블</span></div>
          <div style={S.coinPill}>🪙 {coins}</div>
        </header>
        <main style={S.body} className="app-body scroll">
          {tab==="main" && <MainScreen {...{themes,toggleTheme,distIdx,setDistIdx,duration,setDuration,budget,setBudget,rollsLeft,rollDice,activeTrip,openVerify:()=>setVerifyOpen(true),finishTrip,origin,apiStatus,
            boostIgnoreDist,boostAdjacent,bonusActive,rushCharges}}/>}
          {tab==="map" && <MapScreen {...{ownership,ownerColor,memberById,members,room,createRoom,joinRoom,openShare:()=>setShareOpen(true),leaveRoom,score,memberScore,ownedCount,myRegionCount,activeTrip,flash,
            protectedRegions,throneRegion,hasProtectCard:hasPersonalCard("protect"),useProtectionCard,
            myName,onNameChange:updateMyName,pendingJoinCode,clearPendingJoin:()=>setPendingJoinCode(""),online:isFirebaseConfigured,homeSet,homeCand,claimHome}}/>}
          {tab==="rank" && <RankScreen {...{ownership,members,memberById,myRegionCount,memberScore,room,trips,locks:protectedRegions}}/>}
          {tab==="my" && <MyScreen {...{score,coins,inventory,roomCards,ownedCount,trips,cards,room,resetDemo,apiStatus,origin,openCard,bonusActive,rushCharges,boostIgnoreDist,boostAdjacent}}/>}
        </main>
        <nav className="app-nav" style={S.tabbar}>
          {[["main","🎲","메인"],["map","🗺️","지도"],["rank","🏆","랭킹"],["my","👤","마이"]].map(([id,ic,lb])=>(
            <button key={id} onClick={()=>setTab(id)} style={{...S.tab,...(tab===id?S.tabOn:{})}}>
              <span style={{fontSize:20,filter:tab===id?"none":"grayscale(1) opacity(.55)"}}>{ic}</span>
              <span style={{fontSize:11,fontWeight:tab===id?800:600}}>{lb}</span></button>))}
        </nav>
        </>)}

        {phase!=="main" && (
          <DrawOverlay {...{phase,dieN,candidate,droppedCard,relaxedMsg,themes,distIdx,duration,
            rollsLeft,rollDice,depart,destOwner,tollDue,
            memberById,resetToMain,startTrip,appliedBoosts,
            hasReroll:hasPersonalCard("reroll"),hasPass:hasPersonalCard("pass"),useRerollCard,useTravelPassCard,
            choices,chooseMode,chooseCandidate,cancelChoosing}}/>)}

        {verifyOpen && activeTrip && (<VerifyFlow trip={activeTrip} onMissionDone={setMissionDone} onMissionPlace={setMissionPlace} onDone={()=>setVerifyOpen(false)} memberById={memberById} flash={flash}
          hasExemptCard={hasPersonalCard("mission_exempt")} useMissionExemptCard={useMissionExemptCard}/>)}
        {result && activeTrip && (<ResultOverlay trip={activeTrip} result={result} onClose={closeResult}/>)}
        {shareOpen && (<ShareModal room={room} onClose={()=>setShareOpen(false)} flash={flash}/>)}
        {cardSheet && (<CardUseSheet card={cardSheet.card} kind={cardSheet.kind} onClose={closeCard}
          phase={phase} candidate={candidate} activeTrip={activeTrip} ownedRegions={ownedProtectableRegions()}
          goToMain={()=>setTab("main")}
          actions={{ reroll:useRerollCard, pass:useTravelPassCard, preview:usePreviewCard, select:useSelectCard,
            ignore_dist:useIgnoreDistCard, adjacent:useAdjacentCard, bonus:useBonusCard,
            mission_exempt:useMissionExemptCard, protect:useProtectionCard, room:useRoomCard }}/>)}
        {toast && <div style={S.toast} className="toast-in">{toast}</div>}
      </div>
    </div>
  );
}
