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
import { fetchMySave, publishSave, publishScore, removeMyRecord } from "./api/leaderboard.js";
import { clearLocal, loadLocal, migrate, pickSave, saveLocal, today } from "./lib/save.js";
import { HOME_ORIGIN, enrichDestination, fetchDestinations } from "./api/tourApi.js";
import { DAILY_ROLLS, DEV_PASSCODE, DIST_STEPS, ME, PERSONAL_CARDS, ROOM_CARDS, TOLL, methodFor } from "./data/constants.js";
import { SAMPLE_POOL } from "./data/sampleDestinations.js";
import { SIGUNGU, boardCode, sggFromAddr } from "./lib/sigungu.js";
import { BOARD } from "./data/board.js";
import { CardUseSheet } from "./overlays/CardUseSheet.jsx";
import { SettingsSheet } from "./overlays/SettingsSheet.jsx";
import { ShopSheet } from "./overlays/ShopSheet.jsx";
import { LoginSheet } from "./overlays/LoginSheet.jsx";
import { DevPanel } from "./overlays/DevPanel.jsx";
import { signOutUser, watchUser } from "./api/auth.js";
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
  /* 브라우저에 저장된 기록 — 모든 상태의 초기값으로 쓰이므로 가장 먼저 읽는다 */
  const boot = (()=>{ try{ return loadLocal(getMyId()) || {}; }catch(e){ return {}; } })();
  const [tab,setTab] = useState("main");
  const [members,setMembers] = useState([ME]);
  const [room,setRoom] = useState(null);
  const [ownership,setOwnership] = useState(boot.ownership || {}); // 게임판 코드 -> memberId
  const [homeSet,setHomeSet] = useState(!!boot.homeSet);   // 출발 지역을 정했는지
  const [homeCand,setHomeCand] = useState(null);  // 현재 위치로 찾은 출발 지역 후보
  const [homeCode,setHomeCode] = useState(boot.homeCode || null);  // 출발 지역으로 받은 게임판 코드
  const [previewShortlist,setPreviewShortlist] = useState([]); // 🔍 미리 보기로 확인한 후보 3곳
  const [settingsOpen,setSettingsOpen] = useState(false);
  const [settingsView,setSettingsView] = useState("main");
  const [shopOpen,setShopOpen] = useState(false);
  /* 개발자 도구 — 로고 5연속 탭 또는 ?dev=1 */
  const [devUnlocked,setDevUnlocked] = useState(false);  // 암호까지 통과했는지
  const [devOpen,setDevOpen] = useState(false);
  const devTap = useRef({ n:0, t:0 });

  /* 로고를 2초 안에 5번 누르면 암호를 묻고, 맞아야 개발자 도구가 열린다.
     제출용 빌드에서 일반 사용자에게 노출되지 않게 하기 위한 장치다. */
  function tapLogo(){
    if(devUnlocked){ setDevOpen(true); return; }
    const now = Date.now();
    const d = devTap.current;
    d.n = (now - d.t < 2000) ? d.n + 1 : 1;
    d.t = now;
    if(d.n < 5) return;
    d.n = 0;
    const input = window.prompt("");
    if(input === DEV_PASSCODE){ setDevUnlocked(true); setDevOpen(true); flash("🛠 개발자 도구"); }
  }
  const [user,setUser] = useState(null);            // 구글 로그인 사용자
  const [loginAsk,setLoginAsk] = useState(null);    // "room" | "rank" — 로그인 요청 사유
  const [pendingJoinCode,setPendingJoinCode] = useState("");
  const [anonId] = useState(()=>getMyId());
  const myId = user ? user.uid : anonId;   // 로그인하면 구글 uid 를 식별자로 쓴다
  const [myName,setMyNameState] = useState(()=>getMyName());
  useEffect(()=>watchUser(async u=>{
    setUser(u);
    if(!u) return;
    if(!getMyName() && u.name){ setMyNameState(u.name.slice(0,10)); persistMyName(u.name.slice(0,10)); }
    /* 익명으로 쌓아둔 기록을 계정으로 옮기고, 계정에 남아 있던 기록이 있으면 불러온다 */
    migrate(anonId, u.uid);
    let data = loadLocal(u.uid);
    if(!data){ data = await fetchMySave(u.uid); if(data) saveLocal(u.uid, data); }
    if(data) applySave(data);
  }),[]);

  /* 저장된 기록을 화면 상태로 되돌린다 */
  function applySave(d){
    if(!d) return;
    if(d.ownership) setOwnership(d.ownership);
    if(typeof d.score==="number") setScore(d.score);
    if(typeof d.coins==="number") setCoins(d.coins);
    /* 저장된 기록을 되돌릴 때도 날짜가 지났으면 새로 채운다 */
    if(d.rollDay && d.rollDay !== today()){ setRollDay(today()); setRollsLeft(DAILY_ROLLS); }
    else if(typeof d.rollsLeft==="number") setRollsLeft(d.rollsLeft);
    if(d.inventory) setInventory(d.inventory);
    if(d.roomCards) setRoomCards(d.roomCards);
    if(d.cards) setCards(d.cards);
    if(d.trips) setTrips(d.trips);
    if(d.protectedRegions) setProtectedRegions(d.protectedRegions);
    if(typeof d.homeSet==="boolean") setHomeSet(d.homeSet);
    if(d.homeCode!==undefined) setHomeCode(d.homeCode);
    if(d.throneRegion!==undefined) setThroneRegion(d.throneRegion);
    if(typeof d.rushCharges==="number") setRushCharges(d.rushCharges);
    if(typeof d.boostAdjacent==="boolean") setBoostAdjacent(d.boostAdjacent);
    if(typeof d.nationalActive==="boolean") setNationalActive(d.nationalActive);
    if(d.themes) setThemes(d.themes);
    if(typeof d.distIdx==="number") setDistIdx(d.distIdx);
    if(d.duration) setDuration(d.duration);
    if(d.budget) setBudget(d.budget);
  }
  const [avatar,setAvatarState] = useState(()=>{
    try{ return window.localStorage.getItem("gulura_player_avatar") || ""; }catch(e){ return ""; }
  });
  const [trips,setTrips] = useState(boot.trips || []);
  const [cards,setCards] = useState(boot.cards || []);
  /* 주사위는 매일 자정에 5회로 채워진다. 마지막으로 채운 날짜를 함께 저장해 둔다. */
  const [rollDay,setRollDay] = useState(boot.rollDay || today());
  const [rollsLeft,setRollsLeft] = useState(()=>
    (boot.rollDay && boot.rollDay !== today()) ? DAILY_ROLLS : (boot.rollsLeft ?? DAILY_ROLLS));
  const [score,setScore] = useState(boot.score || 0);
  const [coins,setCoins] = useState(boot.coins || 0);   // 출발 지역을 정해야 120코인이 들어온다
  const [inventory,setInventory] = useState(boot.inventory || []); // 개인 카드 보유함
  const [roomCards,setRoomCards] = useState(boot.roomCards || []); // 방 카드 보유함
  const [boostAdjacent,setBoostAdjacent] = useState(!!boot.boostAdjacent); // 🧭 인접 지역 예약
  const [rushCharges,setRushCharges] = useState(boot.rushCharges || 0); // 🔥 여행 러시 잔여 사용 횟수
  const [nationalActive,setNationalActive] = useState(!!boot.nationalActive); // 🗺️ 전국 랜덤 예약
  const [reveals,setReveals] = useState([]); // 📢 공개 여행지 — [{who,where}]
  const [protectedRegions,setProtectedRegions] = useState(boot.protectedRegions || []); // 🛡️ 점령 보호된 게임판 코드 (방에서는 Firestore 공유)
  const [throneRegion,setThroneRegion] = useState(boot.throneRegion || null); // 👑 왕좌의 지역 sgg 코드
  const [choices,setChoices] = useState([]); // 🔍/🗺️ 카드로 고른 후보 목적지들
  const [chooseMode,setChooseMode] = useState(null); // 'preview' | 'select'
  const [appliedBoosts,setAppliedBoosts] = useState([]); // 이번 뽑기에 실제로 적용된 카드 효과(배지 표시용)
  const [cardSheet,setCardSheet] = useState(null); // {card, kind} — 마이 탭에서 여는 통일된 카드 사용 시트
  const [toast,setToast] = useState(null);
  const [themes,setThemes] = useState(boot.themes || ["sea"]);
  const [distIdx,setDistIdx] = useState(boot.distIdx ?? 2);
  const [duration,setDuration] = useState(boot.duration || "당일치기");
  const [budget,setBudget] = useState(boot.budget || "mid");
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
      /* 내 색(ME.color)은 항상 나에게 쓰이므로, 같은 색을 쓰는 상대는 다른 색으로 바꿔 보여준다.
         방을 만든 사람이 팔레트 첫 색을 받는 탓에 참여자 화면에서 나와 방장이 같은 색으로 보이던 문제. */
      const OTHER = ["#8B6FE0","#34B5D6","#E39A3B","#E0608B","#5FA8E0","#C7A23B","#6FBF7A"];
      const taken = new Set([ME.color]);
      const remote = Object.entries(data.members||{})
        .filter(([pid])=>pid!==myId)
        .map(([pid,m])=>{
          let c = m.color || "#999";
          if(taken.has(c)) c = OTHER.find(x=>!taken.has(x)) || `hsl(${[...pid].reduce((h,ch)=>(h*31+ch.charCodeAt(0))>>>0,0)%360},55%,55%)`;
          taken.add(c);
          return { id:pid, name:m.name||"친구", color:c, score:m.score||0 };
        });
      setMembers([ME, ...remote]);
    }, (err)=>{ flash("연결이 끊겼어요 · " + ((err&&err.message)||err)); });
    return unsub;
  },[room?.code]);
  useEffect(()=>{
    if(!room?.code || !isFirebaseConfigured) return;
    syncScore(room.code, myId, score);
  },[score, room?.code]);
  /* 자정이 지나면 주사위를 다시 채운다.
     1분마다 날짜를 확인하고, 화면을 다시 켰을 때도 곧바로 확인한다. */
  useEffect(()=>{
    function refill(){
      const d = today();
      if(d === rollDay) return;
      setRollDay(d); setRollsLeft(DAILY_ROLLS);
      flash(`🎲 새로운 하루 · 주사위 ${DAILY_ROLLS}회가 채워졌어요`);
    }
    const timer = setInterval(refill, 60000);
    const onWake = ()=>{ if(document.visibilityState==="visible") refill(); };
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    refill();
    return ()=>{ clearInterval(timer); document.removeEventListener("visibilitychange", onWake); window.removeEventListener("focus", onWake); };
  },[rollDay]);

  /* 게임 기록 자동 저장 — 브라우저에 항상, 로그인했으면 계정에도 */
  const saveState = { score,coins,ownership,homeSet,homeCode,inventory,roomCards,cards,trips,
    rollsLeft,rollDay,protectedRegions,throneRegion,boostAdjacent,nationalActive,rushCharges,
    themes,distIdx,duration,budget };
  useEffect(()=>{
    const data = pickSave(saveState);
    saveLocal(myId, data);
    if(!user) return;
    const t = setTimeout(()=>publishSave(user.uid, data), 2000);
    return ()=>clearTimeout(t);
  },[score,coins,ownership,homeSet,homeCode,inventory,roomCards,cards,trips,
     rollsLeft,rollDay,protectedRegions,throneRegion,boostAdjacent,nationalActive,rushCharges,
     themes,distIdx,duration,budget,myId,user]);

  /* 명예의 전당 — 방과 무관하게 내 점수를 전체 순위표에 올린다 */
  useEffect(()=>{
    if(!isFirebaseConfigured || !user || score<=0) return;
    const myTiles = Object.keys(ownership).filter(k=>ownership[k]==="me");
    const t = setTimeout(()=>publishScore(myId, myName, score, ownedCount, myTiles), 1200);
    return ()=>clearTimeout(t);
  },[score, myName, user]);
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
    const distCap = nationalActive ? 9999 : DIST_STEPS[distIdx].cap;
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
    if(nationalActive) b.push({icon:"🗺️",label:"전국 랜덤 적용중"});
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
    setBoostAdjacent(false);

    const wait = Math.max(0, 1150 - (Date.now()-t0));
    setTimeout(()=>{
      clearInterval(rollTimer.current); setDieN(Math.floor(Math.random()*6)+1);
      setCandidate(pick); setRelaxedMsg(relaxed);
      setAppliedBoosts(usedBoosts); setNationalActive(false);
      if(usedBoosts.length) flash(usedBoosts.map(b=>`${b.icon} ${b.label}`).join(" · "));
      setPhase("sealed");
    }, wait);
  }
  /* 봉투를 열 때 카드를 준다. 열지 않고 다시 굴리면 카드는 주어지지 않는다. */
  function depart(){
    setPhase("opening");
    setTimeout(()=>{ dropRandomCard(); setPhase("revealed"); }, 1900);
  }

  /* ───────── 개인 카드 — 🔍 미리보기 / 🗺️ 지역 선택권 : 사전 후보 선택 ───────── */
  async function plannedRoll(n){
    const usedBoosts = boostBadges(); // 미리보기/선택권도 거리무시·인접지역 카드와 함께 쓸 수 있어요
    setPhase("choosing"); setChoices([]); setAppliedBoosts(usedBoosts);
    const { pool, source, error } = await drawPool();
    setApiStatus({ mode:source, msg:error||"" });
    setBoostAdjacent(false);
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
    setBoostAdjacent(false);
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
  /* 🎲 주사위 하나 더 — 오늘 남은 굴리기 기회를 1회 늘린다 */
  function useExtraRollCard(){
    if(!takePersonalCard("extra_roll")) return;
    setRollsLeft(r=>r+1);
    flash("🎲 주사위 기회가 1회 늘었어요");
  }

  /* 🎫 여행 패스 — 이번 목적지를 취소하고 주사위 기회를 1회 돌려받는다.
     봉투 단계든 출발한 뒤든 쓸 수 있지만, 인증을 시작한 여행은 포기할 수 없다. */
  function useTravelPassCard(){
    const started = activeTrip && activeTrip.missions.some(m=>m.done);
    if(started){ flash("이미 인증을 시작한 여행은 포기할 수 없어요"); return; }
    if(!candidate && !activeTrip){ flash("취소할 목적지가 없어요"); return; }
    if(!takePersonalCard("pass")) return;
    setActiveTrip(null); setVerifyOpen(false); setRollsLeft(r=>r+1);
    resetToMain();
    flash("🎫 이번 목적지를 취소하고 기회를 돌려받았어요");
  }
  /* 🔍 미리 보기 — 후보 3곳을 미리 보여주고, 봉투를 열면 그 셋 중 하나가 나온다 */
  function usePreviewCard(){
    if(phase!=="main" && phase!=="sealed"){ flash("봉투를 열기 전까지만 사용할 수 있어요"); return; }
    if(!takePersonalCard("preview")) return;
    setCandidate(null); setDroppedCard(null);
    flash("🔍 후보 3곳을 찾는 중…"); setChooseMode("preview"); plannedRoll(3);
  }
  /* 미리 보기에서 확인만 하고 봉투로 넘어간다 — 셋 중 하나가 무작위로 배정된다 */
  async function sealFromPreview(){
    const list = choices.slice();
    if(!list.length) return;
    const pick = await finalizePick(list[Math.floor(Math.random()*list.length)]);
    setPreviewShortlist(list.map(c=>`${c.sido} ${c.sigungu}`));
    setCandidate(pick); setChoices([]); setChooseMode(null); setPhase("sealed");
  }
  /* 🗺️ 지역 선택권 — 같은 단계에서 쓸 수 있고 후보를 8곳까지 펼친다 */
  function useSelectCard(){
    if(phase!=="main" && phase!=="sealed"){ flash("봉투를 열기 전까지만 사용할 수 있어요"); return; }
    if(!takePersonalCard("select")) return;
    setCandidate(null); setDroppedCard(null);
    flash("🗺️ 조건에 맞는 지역을 모으는 중…"); setChooseMode("select"); plannedRoll(8);
  }
  function useAdjacentCard(){ if(!takePersonalCard("adjacent")) return; setBoostAdjacent(true); flash("🧭 다음 주사위는 내 영토 인접 지역 위주로 나와요"); }
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
      const started = activeTrip && activeTrip.missions.some(m=>m.done);
      if(started){ flash("🎲 이미 인증을 시작한 여행은 건드리지 않아요"); }
      else if(candidate && (phase==="sealed"||phase==="revealed")){ flash("🎲 아직 출발하지 않은 여행자들의 지역이 재배정돼요"); redrawCandidate(); }
      else flash("🎲 아직 출발하지 않은 인원이 없어 조용히 지나갔어요");
    }
    else if(id==="reveal"){
      /* 방에 다른 사람이 있으면 전원, 없으면 한 명분만 공개한다 */
      const others = members.filter(m=>m.id!=="me");
      const list = (others.length ? others : [{name:"친구"}]).map(m=>{
        const spot = SAMPLE_POOL[Math.floor(Math.random()*SAMPLE_POOL.length)];
        return { who:m.name, where:`${spot.sido} ${spot.sigungu}` };
      });
      setReveals(list);
      flash(`📢 ${list.length===1?`${list[0].who}님이`:"여행자들이"} 노리는 지역이 지도에 표시됐어요`);
    }
    else if(id==="throne"){
      const cands = BOARD.filter(t=>ownership[t.code]!=="me");
      const t = cands[Math.floor(Math.random()*cands.length)];
      if(t){ setThroneRegion(t.code); flash(`👑 ${t.sido} ${t.name}이(가) 왕좌의 지역이 됐어요 · 최초 점령 +150점`); }
      else flash("👑 왕좌로 삼을 지역을 찾지 못했어요");
    }
    else if(id==="national"){ setNationalActive(true); flash("🗺️ 다음 여행은 전국에서 뽑혀요"); }
    else if(id==="rush"){ setRushCharges(c=>c+1); flash("🔥 여행 러시! 다음 점령 코인이 1.5배가 돼요"); }
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
  function resetToMain(){ setPhase("main"); setCandidate(null); setDroppedCard(null); setRelaxedMsg(false); setChoices([]); setChooseMode(null); setAppliedBoosts([]); setPreviewShortlist([]); }
  function setMissionDone(idx,payload){ setActiveTrip(t=>{ const ms=t.missions.map((m,i)=>i===idx?{...m,done:true,...payload}:m); return {...t,missions:ms}; }); }

  function applyConquer(){
    const t = activeTrip; if(!t) return null;
    const doneCount = t.missions.filter(m=>m.done).length;
    const perfect = doneCount===t.missions.length;
    let base, label, boosted=false, throneHit=false, challengeResult=null;
    if(t.outcome==="conquer"){
      base=t.depop?200:100;
      /* ⭐ 점령 보너스는 들고 있으면 자동으로 쓰인다 */
      const autoBonus = hasPersonalCard("bonus");
      if(autoBonus || rushCharges>0){ base=Math.round(base*1.5); boosted=true; }
      if(throneRegion && boardCode(t.sgg)===throneRegion){ base+=150; throneHit=true; }
      setOwnership(o=>({...o,[boardCode(t.sgg)]:"me"}));
      if(room?.code) syncOwnership(room.code, myId, boardCode(t.sgg));
      let coinGain = t.depop?60:30;
      if(rushCharges>0) coinGain = Math.round(coinGain*1.5);   // 🔥 여행 러시 — 코인 1.5배
      if(throneHit) coinGain += 150;                            // 👑 왕좌의 지역 — 코인 +150
      label=`${t.sigungu} 점령`; setCoins(c=>c+coinGain);
      if(autoBonus) takePersonalCard("bonus");
      if(rushCharges>0) setRushCharges(c=>Math.max(0,c-1));
      if(throneHit) setThroneRegion(null);
    }
    else if(t.outcome==="toll"){
      const f=memberById(t.tollFriend);
      const bc=boardCode(t.sgg);
      if(t.locked){
        /* 상대가 🛡️ 점령 보호를 걸어둔 땅 — 도전이 막히고 통행료도 없다. 보호는 이때 풀린다 */
        /* 보호된 땅은 빼앗기지 않는다. 보호는 풀리지 않고 그대로 유지된다. */
        base=40; label=`${f?.name||"상대"}님 점령 보호 · 이 땅은 빼앗을 수 없어요`;
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
    /* 미션 점수는 전부 인증했을 때만 준다. 하나라도 빠지면 0점. */
    const bonus = perfect ? doneCount*20 : 0;
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
    if(!user){ setLoginAsk("room"); return; }
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
    if(!user){ setLoginAsk("room"); return; }
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
    setHomeSet(true); setHomeCode(place.code);
    setCoins(c=>c+120);
    flash(`${place.name} · 출발 지역으로 등록했어요 · 🪙 120 지급`);
  }
  function updateMyName(n){ setMyNameState(n); persistMyName(n); }

  /* 카드 상점 — 코인으로 개인 카드를 산다 */
  function buyCard(card, price){
    if(coins < price){ flash("코인이 모자라요"); return; }
    setCoins(c=>c-price);
    setInventory(inv=>[...inv, { id:card.id, name:card.name, icon:card.icon, desc:card.desc, when:card.when }]);
    flash(`${card.icon} ${card.name}을(를) 샀어요`);
  }

  /* 프로필 사진 — 브라우저에만 저장한다. 빈 값을 넣으면 기본 아이콘으로 돌아간다. */
  function updateAvatar(dataUrl){
    setAvatarState(dataUrl || "");
    try{
      if(dataUrl) window.localStorage.setItem("gulura_player_avatar", dataUrl);
      else window.localStorage.removeItem("gulura_player_avatar");
    }catch(e){ flash("사진이 너무 커서 저장하지 못했어요"); }
  }

  /* 출발 지역 다시 정하기 — 기존에 받은 한 칸을 반납하고 지도 탭에서 새로 고르게 한다 */
  function changeHome(){
    if(room?.code){ flash("방에 참여 중일 때는 바꿀 수 없어요"); return; }
    setOwnership(o=>{ const n={...o}; if(homeCode && n[homeCode]==="me") delete n[homeCode]; return n; });
    setHomeCode(null); setHomeSet(false); setSettingsOpen(false); setTab("map");
    flash("지도 탭에서 출발 지역을 다시 골라 주세요");
  }

  /* 탈퇴 — 브라우저에 남은 기록과 참여 중인 방의 내 기록을 지운다 */
  function deleteAll(reason){
    if(reason) { try{ console.info("[탈퇴 사유]", reason); }catch(e){} }
    try{
      if(room?.code) leaveRoomOnline(room.code, myId);
      removeMyRecord(myId);
      clearLocal(myId); clearLocal(anonId);
      window.localStorage.removeItem("gulura_player_id");
      window.localStorage.removeItem("gulura_player_name");
      window.localStorage.removeItem("gulura_player_avatar");
    }catch(e){}
    setTimeout(()=>{ try{ window.location.replace(String(window.location.origin)+"/"); }catch(e){ window.location.reload(); } }, 150);
  }

  function leaveRoom(){ if(room?.code) leaveRoomOnline(room.code, myId); setMembers([ME]); setRoom(null); setRoomCards([]); setThroneRegion(null); setOwnership(o=>{ const n={}; Object.entries(o).forEach(([k,v])=>{ if(v==="me") n[k]=v; }); return n; }); flash("방에서 나왔어요"); }
  function resetDemo(){
    setMembers([ME]); setRoom(null); setOwnership({}); setTrips([]); setCards([]); setRollsLeft(DAILY_ROLLS); setRollDay(today()); setScore(0); setCoins(0);
    setHomeSet(false); setHomeCode(null); setProtectedRegions([]);
    clearLocal(myId);
    setInventory([]); setRoomCards([]); setBoostAdjacent(false); setNationalActive(false); setReveals([]);
    setRushCharges(0); setProtectedRegions([]); setThroneRegion(null); setChoices([]); setChooseMode(null);
    setAppliedBoosts([]); setActiveTrip(null); setVerifyOpen(false); resetToMain(); setTab("main");
  }

  return (
    <div className="app-root" style={S.root}>
      <style>{CSS}</style>
      <div className="app-shell" style={S.phone}>
        {!started ? <Splash onStart={()=>setStarted(true)}/> : (<>
        <header className="app-bar" style={S.appbar}>
          <div onClick={tapLogo} style={{display:"flex",alignItems:"center",gap:8,cursor:"default"}}><DiceLogo/><span style={S.wordmark}>굴러라 대한민국</span></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={S.coinPill}>🪙 {coins}</div>
            <button onClick={()=>setShopOpen(true)} aria-label="카드 상점" style={S.shopBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>
                <path d="M2.5 3h2.2l2.3 11.2a1.8 1.8 0 0 0 1.8 1.4h8.6a1.8 1.8 0 0 0 1.8-1.4L21 7H6"/>
              </svg>
            </button>
            <button onClick={()=>{ setSettingsView("main"); setSettingsOpen(true); }} aria-label="설정" style={S.gearBtn}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3.2"/>
                <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.11a1.6 1.6 0 0 0-1.05-1.46 1.6 1.6 0 0 0-1.76.32l-.7.07a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.11A1.6 1.6 0 0 0 4.6 8.9a1.6 1.6 0 0 0-.33-1.76l-.06-.07a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 8.87 4.6 1.6 1.6 0 0 0 9.87 3.13V3a2 2 0 1 1 4 0v.11a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.33 1.77V9a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.11a1.6 1.6 0 0 0-1.46 1z"/>
              </svg>
            </button>
          </div>
        </header>
        <main style={S.body} className="app-body scroll">
          {tab==="main" && <MainScreen {...{themes,toggleTheme,distIdx,setDistIdx,duration,setDuration,budget,setBudget,rollsLeft,rollDice,activeTrip,openVerify:()=>setVerifyOpen(true),finishTrip,origin,apiStatus,
            boostAdjacent,bonusActive:hasPersonalCard("bonus"),rushCharges,nationalActive,previewShortlist}}/>}
          {tab==="map" && <MapScreen {...{ownership,ownerColor,memberById,members,room,createRoom,joinRoom,openShare:()=>setShareOpen(true),leaveRoom,score,memberScore,ownedCount,myRegionCount,activeTrip,flash,
            protectedRegions,throneRegion,hasProtectCard:hasPersonalCard("protect"),useProtectionCard,
            rushCharges,reveals,
            myName,onNameChange:updateMyName,pendingJoinCode,clearPendingJoin:()=>setPendingJoinCode(""),online:isFirebaseConfigured,homeSet,homeCand,claimHome}}/>}
          {tab==="rank" && <RankScreen {...{ownership,members,memberById,myRegionCount,memberScore,room,trips,locks:protectedRegions,myId,myName,score,online:isFirebaseConfigured,signedIn:!!user,onNeedLogin:()=>setLoginAsk("rank")}}/>}
          {tab==="my" && <MyScreen {...{score,coins,inventory,roomCards,ownedCount,trips,cards,room,resetDemo,apiStatus,origin,openCard,bonusActive:hasPersonalCard("bonus"),rushCharges,boostAdjacent,nationalActive,activeTrip,myName,avatar,onEditProfile:()=>{ setSettingsView("account"); setSettingsOpen(true); }}}/>}
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
            hasReroll:hasPersonalCard("reroll"),useRerollCard,
            hasPreview:hasPersonalCard("preview"),hasSelect:hasPersonalCard("select"),usePreviewCard,useSelectCard,
            choices,chooseMode,chooseCandidate,cancelChoosing,sealFromPreview,previewShortlist}}/>)}

        {verifyOpen && activeTrip && (<VerifyFlow trip={activeTrip} onMissionDone={setMissionDone} onMissionPlace={setMissionPlace} onDone={()=>setVerifyOpen(false)} memberById={memberById} flash={flash}
          hasExemptCard={hasPersonalCard("mission_exempt")} useMissionExemptCard={useMissionExemptCard} devMode={devUnlocked}/>)}
        {result && activeTrip && (<ResultOverlay trip={activeTrip} result={result} onClose={closeResult}/>)}
        {shareOpen && (<ShareModal room={room} onClose={()=>setShareOpen(false)} flash={flash}/>)}
        {shopOpen && (<ShopSheet coins={coins} onBuy={buyCard} onClose={()=>setShopOpen(false)} flash={flash}/>)}
        {settingsOpen && (<SettingsSheet
          key={settingsView} initialView={settingsView}
          onClose={()=>setSettingsOpen(false)}
          myName={myName} onNameChange={updateMyName}
          avatar={avatar} onAvatarChange={updateAvatar}
          user={user} onSignIn={()=>setLoginAsk("room")} onSignOut={async()=>{ await signOutUser(); flash("로그아웃했어요"); }}
          room={room} leaveRoom={leaveRoom}
          homeLabel={homeCode ? (BOARD.find(b=>b.code===homeCode)?.name || "설정됨") : null}
          canChangeHome={!room} onChangeHome={changeHome}
          resetDemo={resetDemo} onDeleteAll={deleteAll} flash={flash}/>)}
        {cardSheet && (<CardUseSheet card={cardSheet.card} kind={cardSheet.kind} onClose={closeCard}
          phase={phase} candidate={candidate} activeTrip={activeTrip} ownedRegions={ownedProtectableRegions()}
          goToMain={()=>setTab("main")} goToMap={()=>setTab("map")}
          goToMission={()=>{ setTab("main"); setVerifyOpen(true); }}
          actions={{ reroll:useRerollCard, pass:useTravelPassCard, preview:usePreviewCard, select:useSelectCard,
            adjacent:useAdjacentCard, extra_roll:useExtraRollCard,
            mission_exempt:useMissionExemptCard, protect:useProtectionCard, room:useRoomCard }}/>)}
        {devOpen && (<DevPanel onClose={()=>setDevOpen(false)} flash={flash}
          state={{ rollsLeft, coins, score, ownedCount }}
          actions={{
            addRolls:(n)=>setRollsLeft(r=>r+n),
            setRolls:(n)=>setRollsLeft(n),
            addCoins:(n)=>setCoins(c=>c+n),
            setCoins:(n)=>setCoins(n),
            addScore:(n)=>setScore(v=>v+n),
            setScore:(n)=>setScore(n),
            grantRandom:(n=1)=>{
              setOwnership(o=>{
                const next={...o};
                const free=BOARD.filter(t=>!next[t.code]);
                for(let i=0;i<n && free.length;i++){
                  const k=Math.floor(Math.random()*free.length);
                  next[free[k].code]="me"; free.splice(k,1);
                }
                return next;
              });
              flash(`${n}곳 점령 처리`);
            },
            clearOwnership:()=>{ setOwnership({}); setHomeSet(false); setHomeCode(null); flash("점령 기록을 비웠어요"); },
            giveCard:(c,kind)=>{ if(kind==="room") setRoomCards(v=>[...v,c]); else setInventory(v=>[...v,c]); },
            giveAllCards:()=>{ setInventory(v=>[...v,...PERSONAL_CARDS]); setRoomCards(v=>[...v,...ROOM_CARDS]); flash("카드를 전부 지급했어요"); },
            clearCards:()=>{ setInventory([]); setRoomCards([]); flash("카드를 비웠어요"); },
            rewindDay:()=>{ setRollDay("2000-01-01"); flash("날짜를 어제로 돌렸어요 · 곧 자정 충전이 돕니다"); },
            resetHome:()=>{ setHomeSet(false); setHomeCode(null); setDevOpen(false); setTab("map"); flash("지도 탭에서 출발 지역을 다시 골라 주세요"); },
          }}/>)}
        {loginAsk && (<LoginSheet reason={loginAsk} flash={flash}
          onClose={()=>setLoginAsk(null)} onDone={()=>setLoginAsk(null)}/>)}
        {toast && <div style={S.toast} className="toast-in">{toast}</div>}
      </div>
    </div>
  );
}
