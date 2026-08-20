/**
 * 앱 셸 — 전역 상태, 게임 진행, 탭 라우팅
 */
import React, { useState, useRef, useEffect } from "react";
import { kakaoRegionAny, kakaoRouteUrl } from "./api/kakao.js";
import { HOME_ORIGIN, enrichDestination, fetchDestinations } from "./api/tourApi.js";
import { DIST_STEPS, EVENT_CARDS, FRIEND_POOL, ME, THEME_LABELS, TOLL, methodFor } from "./data/constants.js";
import { SAMPLE_POOL } from "./data/sampleDestinations.js";
import { ResultOverlay } from "./overlays/ResultOverlay.jsx";
import { ShareModal } from "./overlays/ShareModal.jsx";
import { VerifyFlow } from "./overlays/VerifyFlow.jsx";
import { MainScreen } from "./screens/MainScreen.jsx";
import { MapScreen } from "./screens/MapScreen.jsx";
import { MyScreen } from "./screens/MyScreen.jsx";
import { RankScreen } from "./screens/RankScreen.jsx";
import { KakaoMap } from "./ui/KakaoMap.jsx";
import { DiceLogo, DieFace, Envelope, Meta, Splash } from "./ui/primitives.jsx";
import { CSS, S } from "./ui/styles.js";

/* ───────── 메인 앱 ───────── */
export default function App(){
  const [tab,setTab] = useState("main");
  const [members,setMembers] = useState([ME]);
  const [room,setRoom] = useState(null);
  const [ownership,setOwnership] = useState({}); // sggCode -> memberId (홈 서울은 sido 검사로 처리)
  const [trips,setTrips] = useState([]);
  const [cards,setCards] = useState([]);
  const [rollsLeft,setRollsLeft] = useState(5);
  const [score,setScore] = useState(0);
  const [coins,setCoins] = useState(120);
  const [inventory,setInventory] = useState([]);
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
  const [useExempt,setUseExempt] = useState(false);
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
    setStarted(true); joinRoom(code); setTab("map");
    try{ window.history.replaceState({}, "", window.location.pathname); }catch(e){}
  },[]);
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
      },
      ()=>{}, { enableHighAccuracy:false, timeout:7000, maximumAge:600000 });
  },[]);
  function flash(msg){ setToast(msg); setTimeout(()=>setToast(null),2300); }
  const memberById = (id)=> members.find(m=>m.id===id);
  const ownerColor = (id)=> id? (memberById(id)?.color||"var(--paper-2)") : "var(--paper-2)";
  const ownedCount = Object.values(ownership).filter(v=>v==="me").length + 1; // +1: 서울 홈
  const myRegionCount = (id)=> Object.values(ownership).filter(v=>v===id).length + (id==="me"?1:0);
  const memberScore = (id)=> id==="me" ? score : (memberById(id)?.score||0);
  const myRoomScore = members.reduce((s,m)=> s + memberScore(m.id), 0);
  const myRoomRegions = members.reduce((s,m)=> s + myRegionCount(m.id), 0);
  const toggleTheme = (t)=> setThemes(p=> p.includes(t)? p.filter(x=>x!==t) : [...p,t]);

  async function rollDice(){
    if(rollsLeft<=0) return;
    const t0 = Date.now();
    setRollsLeft(r=>r-1); setDroppedCard(null); setUseExempt(false); setPhase("rolling");
    clearInterval(rollTimer.current);
    rollTimer.current = setInterval(()=> setDieN(Math.floor(Math.random()*6)+1), 80);

    let pick=null, relaxed=false, source="sample", error=null;
    try{
      const r = await fetchDestinations({ themes, distCap: DIST_STEPS[distIdx].cap, origin: originRef.current });
      relaxed = r.relaxed; source = r.source; error = r.error;
      pick = r.pool[Math.floor(Math.random()*r.pool.length)] || null;
      if(pick && pick.source==="tourapi"){
        try { pick = await enrichDestination(pick); }
        catch(e){ pick = Object.assign({}, pick, {
          overview: pick.addr || (pick.sido+" "+pick.sigungu),
          missions: [{n:pick.title+" 도착 인증",t:"명소"},{n:pick.sigungu+" 로컬 맛집",t:"맛집"},{n:pick.sigungu+" 골목 산책",t:"체험"}],
        }); }
      }
    }catch(e){ error = String((e&&e.message)||e); }

    if(!pick){ pick = SAMPLE_POOL[Math.floor(Math.random()*SAMPLE_POOL.length)]; source="sample"; relaxed=true; }
    setApiStatus({ mode:source, msg:error||"" });

    const wait = Math.max(0, 1150 - (Date.now()-t0));
    setTimeout(()=>{
      clearInterval(rollTimer.current); setDieN(Math.floor(Math.random()*6)+1);
      setCandidate(pick); setRelaxedMsg(relaxed);
      if(Math.random()<0.35){ const card = EVENT_CARDS[Math.floor(Math.random()*EVENT_CARDS.length)]; setDroppedCard(card); setInventory(inv=>[...inv,card]); }
      setPhase("sealed");
    }, wait);
  }
  function depart(){ setPhase("opening"); setTimeout(()=> setPhase("revealed"), 1900); }

  const destOwner = candidate ? ownership[candidate.sgg] : undefined;
  const tollDue = candidate && destOwner && destOwner!=="me";
  const hasExempt = inventory.some(c=>c.id==="toll");

  function startTrip(){
    if(!candidate) return;
    const outcome = destOwner==="me" ? "revisit" : tollDue ? "toll" : "conquer";
    setActiveTrip({ ...candidate, outcome, tollFriend: tollDue?destOwner:null, useExempt,
      missions: candidate.missions.map(m=>({ ...m, method:methodFor(m.t), done:false, receipt:null, gps:null })) });
    setPhase("main"); setCandidate(null); setDroppedCard(null); setUseExempt(false); setTab("main"); setVerifyOpen(true);
  }
  function resetToMain(){ setPhase("main"); setCandidate(null); setDroppedCard(null); setRelaxedMsg(false); setUseExempt(false); }
  function setMissionDone(idx,payload){ setActiveTrip(t=>{ const ms=t.missions.map((m,i)=>i===idx?{...m,done:true,...payload}:m); return {...t,missions:ms}; }); }

  function applyConquer(){
    const t = activeTrip; if(!t) return null;
    const doneCount = t.missions.filter(m=>m.done).length;
    const perfect = doneCount===t.missions.length;
    let base, label;
    if(t.outcome==="conquer"){ base=t.depop?200:100; setOwnership(o=>({...o,[t.sgg]:"me"})); label=`${t.sigungu} 점령`; setCoins(c=>c+(t.depop?60:30)); }
    else if(t.outcome==="toll"){ base=40; const f=memberById(t.tollFriend);
      if(t.useExempt && inventory.some(c=>c.id==="toll")){ setInventory(inv=>{const i=inv.findIndex(c=>c.id==="toll");return inv.filter((_,k)=>k!==i);}); label=`${f?.name}님 땅 통과(면제권)`; }
      else { setCoins(c=>Math.max(0,c-TOLL)); label=`통행료 ${TOLL}🪙 지불`; } }
    else { base=50; label="내 영토 재방문"; }
    const bonus = doneCount*20 + (perfect?30:0);
    const total = base+bonus;
    setScore(s=>s+total);
    const newCards = t.missions.filter(m=>m.done).map(m=>({ title:m.n, place:`${t.sido} ${t.sigungu}`, type:m.method==="receipt"?"영수증":"인증샷", grad:t.grad, depop:t.depop }));
    setCards(c=>[...newCards,...c]);
    setTrips(tp=>[{title:t.title,sido:t.sido,sigungu:t.sigungu,depop:t.depop,outcome:t.outcome,verified:doneCount,score:total},...tp]);
    return { label, base, bonus, total, doneCount, perfect, cardsGained:newCards.length, outcome:t.outcome };
  }
  function finishTrip(){ const res=applyConquer(); if(res){ setResult(res); setVerifyOpen(false); } }
  function closeResult(){ setResult(null); setActiveTrip(null); setTab("map"); }
  function joinRoom(code){
    const c = (code||"").trim().toUpperCase() || "KR-"+Math.random().toString(36).slice(2,6).toUpperCase();
    setMembers([ME, ...FRIEND_POOL]); setRoom({ code:c });
    setOwnership(o=>{ const n={...o}; FRIEND_POOL.forEach(f=> f.tiles.forEach(t=>{ if(!n[t]) n[t]=f.id; })); return n; });
    flash(`방 참여 완료 · ${c}`);
  }

  function createRoom(){
    const code = "KR-"+Math.random().toString(36).slice(2,6).toUpperCase();
    setMembers([ME]); setRoom({ code });
    flash(`방 생성됨 · 코드 ${code} · 친구를 초대하세요`);
  }
  function inviteFriends(){
    setMembers(ms=>{ const ids=new Set(ms.map(m=>m.id)); return [...ms, ...FRIEND_POOL.filter(f=>!ids.has(f.id))]; });
    setOwnership(o=>{ const n={...o}; FRIEND_POOL.forEach(f=> f.tiles.forEach(t=>{ if(!n[t]) n[t]=f.id; })); return n; });
    flash("은하 · 정아님이 방에 참여했어요");
  }
  function leaveRoom(){ setMembers([ME]); setRoom(null); setOwnership(o=>{ const n={}; Object.entries(o).forEach(([k,v])=>{ if(v==="me") n[k]=v; }); return n; }); flash("방에서 나왔어요"); }
  function resetDemo(){ setMembers([ME]); setRoom(null); setOwnership({}); setTrips([]); setCards([]); setRollsLeft(5); setScore(0); setCoins(120); setInventory([]); setActiveTrip(null); setVerifyOpen(false); resetToMain(); setTab("main"); }

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
          {tab==="main" && <MainScreen {...{themes,toggleTheme,distIdx,setDistIdx,duration,setDuration,budget,setBudget,rollsLeft,rollDice,activeTrip,openVerify:()=>setVerifyOpen(true),finishTrip,origin,apiStatus}}/>}
          {tab==="map" && <MapScreen {...{ownership,ownerColor,memberById,members,room,createRoom,joinRoom,openShare:()=>setShareOpen(true),leaveRoom,score,memberScore,ownedCount,myRegionCount,activeTrip,flash}}/>}
          {tab==="rank" && <RankScreen {...{myRoomScore,myRoomRegions,room,memberCount:members.length}}/>}
          {tab==="my" && <MyScreen {...{score,coins,inventory,ownedCount,trips,cards,room,resetDemo,apiStatus,origin}}/>}
        </main>
        <nav className="app-nav" style={S.tabbar}>
          {[["main","🎲","메인"],["map","🗺️","지도"],["rank","🏆","랭킹"],["my","👤","마이"]].map(([id,ic,lb])=>(
            <button key={id} onClick={()=>setTab(id)} style={{...S.tab,...(tab===id?S.tabOn:{})}}>
              <span style={{fontSize:20,filter:tab===id?"none":"grayscale(1) opacity(.55)"}}>{ic}</span>
              <span style={{fontSize:11,fontWeight:tab===id?800:600}}>{lb}</span></button>))}
        </nav>
        </>)}

        {phase!=="main" && (
          <div style={S.overlay} className="overlay-in app-overlay">
            {phase==="rolling" && (<div style={{textAlign:"center"}}><div className="die-shake"><DieFace n={dieN} size={92}/></div><p style={S.olHint}>목적지를 봉투에 담는 중…</p></div>)}
            {phase==="sealed" && candidate && (
              <div style={{textAlign:"center",width:"100%"}} className="pop-in">
                {droppedCard && (<div style={S.cardDrop} className="card-drop"><span style={{fontSize:22}}>{droppedCard.icon}</span><div style={{textAlign:"left"}}><div style={{fontSize:11,color:"var(--gold)",fontWeight:800}}>이벤트 카드 획득!</div><div style={{fontSize:13,fontWeight:700,color:"var(--paper)"}}>{droppedCard.name}</div></div></div>)}
                <Envelope opening={false} themes={relaxedMsg?["조건 완화됨"]:themes.map(t=>THEME_LABELS[t])} dist={DIST_STEPS[distIdx].label} dur={duration} relaxed={relaxedMsg}/>
                <div style={{display:"flex",gap:10,marginTop:18,width:"100%"}}>
                  <button onClick={rollDice} disabled={rollsLeft<=0} style={{...S.btnGhost,opacity:rollsLeft<=0?.4:1}}>다시 굴리기 · {rollsLeft}회</button>
                  <button onClick={depart} style={S.btnDepart}>출발 ✦ 봉투 열기</button></div>
                <p style={S.olSub}>출발하면 목적지가 확정돼요</p></div>)}
            {phase==="opening" && candidate && (<div style={{textAlign:"center",width:"100%"}}><Envelope opening={true} themes={[]} dist="" dur="" relaxed={false}/><p style={{color:"var(--paper)",opacity:.85,marginTop:22,fontSize:14}}>봉인을 여는 중…</p></div>)}
            {phase==="revealed" && candidate && (
              <div style={{width:"100%"}} className="reveal-in">
                <p style={{textAlign:"center",color:"var(--paper)",opacity:.7,fontSize:13,marginBottom:10}}>당신의 목적지는…</p>
                <div style={S.destCard}>
                  <div style={{...S.destImg, background: candidate.image ? `linear-gradient(180deg, rgba(10,18,36,0) 40%, rgba(10,18,36,.62) 100%), url(${candidate.image}) center/cover no-repeat` : `linear-gradient(135deg, ${candidate.grad[0]}, ${candidate.grad[1]})`}}>
                    {candidate.depop && <span style={S.goldTag}>★ 황금 타일 · 2배 점수</span>}
                    <div style={S.destImgInner}><span style={{fontSize:13,opacity:.9}}>{candidate.sido} · {candidate.sigungu}</span><h2 style={S.destName}>{candidate.title}</h2></div></div>
                  <div style={{padding:"15px 18px"}}>
                    {tollDue ? (<div style={{...S.ownBanner,background:"rgba(242,145,60,.12)",border:"1px solid rgba(242,145,60,.5)"}}><span style={{fontSize:18}}>🚧</span><div style={{flex:1,textAlign:"left"}}><b style={{color:"var(--stamp)",fontSize:13}}>{memberById(destOwner)?.name}님의 영토</b><div style={{fontSize:12,color:"var(--ink-soft)"}}>통행료 {TOLL}코인 발생</div></div>{hasExempt && <button onClick={()=>setUseExempt(v=>!v)} style={{...S.exemptBtn,...(useExempt?S.exemptOn:{})}}>🎫 {useExempt?"사용 중":"사용"}</button>}</div>)
                     : destOwner==="me" ? (<div style={{...S.ownBanner,background:"rgba(30,142,138,.10)",border:"1px solid rgba(30,142,138,.35)"}}><span style={{fontSize:18}}>🏠</span><span style={{fontSize:13,color:"var(--ink)",fontWeight:700}}>내 영토 재방문 · +50점</span></div>)
                     : (<div style={{...S.ownBanner,background:"rgba(227,169,44,.12)",border:"1px solid rgba(227,169,44,.45)"}}><span style={{fontSize:18}}>🚩</span><span style={{fontSize:13,color:"var(--ink)",fontWeight:700}}>미점령 지역 · 인증하면 {candidate.depop?200:100}점</span></div>)}
                    <p style={S.overview}>{candidate.overview}</p>
                    {isFinite(candidate.lat) && isFinite(candidate.lng) && (<div style={{marginTop:12}}>
                      <KakaoMap lat={candidate.lat} lng={candidate.lng} title={candidate.title} height={150} level={5}/>
                      <a href={kakaoRouteUrl(candidate)} target="_blank" rel="noreferrer" style={S.routeBtn}>🚗 카카오맵으로 길찾기</a>
                    </div>)}
                    <div style={S.metaRow}><Meta k="거리" v={`${candidate.distanceKm}km`}/><Meta k="일정" v={duration}/><Meta k="기본 점수" v={`+${destOwner==="me"?50:tollDue?40:(candidate.depop?200:100)}`} hi/></div>
                    <p style={S.missionHead}>도착하면 인증할 미션</p>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>{candidate.missions.map((m,i)=>(<div key={i} style={S.mission}><span style={S.missionTag}>{m.t}</span><span style={{fontSize:13.5,color:"var(--ink)"}}>{m.n}</span><span style={{marginLeft:"auto",flexShrink:0,whiteSpace:"nowrap",fontSize:11.5,color:"var(--ink-soft)"}}>{methodFor(m.t)==="receipt"?"🧾 영수증":"📍 GPS"}</span></div>))}</div>
                  </div></div>
                <div style={{display:"flex",gap:10,marginTop:16}}><button onClick={resetToMain} style={S.btnGhost}>나중에</button><button onClick={startTrip} style={S.btnDepart}>여행 시작하기</button></div></div>)}
          </div>)}

        {verifyOpen && activeTrip && (<VerifyFlow trip={activeTrip} onMissionDone={setMissionDone} onDone={()=>setVerifyOpen(false)} memberById={memberById} flash={flash}/>)}
        {result && activeTrip && (<ResultOverlay trip={activeTrip} result={result} onClose={closeResult}/>)}
        {shareOpen && (<ShareModal room={room} onClose={()=>setShareOpen(false)} onAccept={()=>{ inviteFriends(); setShareOpen(false); }} flash={flash}/>)}
        {toast && <div style={S.toast} className="toast-in">{toast}</div>}
      </div>
    </div>
  );
}
