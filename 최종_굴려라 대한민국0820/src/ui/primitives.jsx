/**
 * 공통 UI 조각 — 섹션 / 지표 / 주사위 / 봉투 / 스플래시
 */
import React from "react";
import { S } from "./styles.js";

export function Section({title,sub,children}){return (<section style={S.section}><div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}><h3 style={S.secTitle}>{title}</h3>{sub && <span style={{fontSize:11.5,color:"var(--ink-soft)"}}>{sub}</span>}</div>{children}</section>);}

export function Meta({k,v,hi}){return (<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:11,color:"var(--ink-soft)",marginBottom:3}}>{k}</div><div style={{fontFamily:"'HiKR',sans-serif",fontSize:17,color:hi?"var(--stamp)":"var(--ink)"}}>{v}</div></div>);}

export function Stat({k,v,c}){return <div style={S.stat}><div style={{fontFamily:"'HiKR',sans-serif",fontSize:24,color:c}}>{v}</div><div style={{fontSize:11,color:"var(--ink-soft)",marginTop:2}}>{k}</div></div>;}

export function Row({k,v,hi}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0"}}><span style={{fontSize:13,color:"var(--ink-soft)"}}>{k}</span><span style={{fontFamily:hi?"'HiKR',sans-serif":"'MiceGothic',sans-serif",fontSize:hi?19:14,fontWeight:hi?400:700,color:hi?"var(--stamp)":"var(--ink)"}}>{v}</span></div>;}

export function Chk({ok,t}){return <span style={{display:"flex",alignItems:"center",gap:4,fontSize:11.5,fontWeight:700,color:ok?"var(--sea)":"var(--ink-soft)",background:ok?"rgba(30,142,138,.1)":"var(--paper-2)",padding:"4px 9px",borderRadius:8}}>{ok?"✓":"–"} {t}</span>;}

export function Lg({c,t,border}){return <span style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,color:"var(--ink-soft)"}}><span style={{width:14,height:14,borderRadius:4,background:c,boxShadow:border?"inset 0 0 0 1.5px var(--line)":"none"}}/>{t}</span>;}

export function DieFace({ n, size=64 }) {
  const P = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]}[n]||[4];
  return (<div style={{width:size,height:size,background:"var(--paper)",borderRadius:size*0.22,boxShadow:"0 8px 0 rgba(20,33,58,.18), inset 0 0 0 2px rgba(20,33,58,.10)",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gridTemplateRows:"1fr 1fr 1fr",padding:size*0.13}}>
    {Array.from({length:9}).map((_,i)=>(<div key={i} style={{display:"grid",placeItems:"center"}}><span style={{width:"58%",height:"58%",borderRadius:"50%",background:P.includes(i)?"var(--ink)":"transparent"}}/></div>))}</div>);
}

export function Envelope({ opening, themes, dist, dur, relaxed }){
  const burst = Array.from({length:20}).map((_,i)=>{
    const a=(i/20)*Math.PI*2 + (i%3)*0.28;
    const r=58+((i*37)%54);
    return { tx:Math.cos(a)*r, ty:Math.sin(a)*r-26, d:0.3+(i%7)*0.06, sz:i%4===0?9:i%3===0?5:7,
             c:i%3===0?"var(--gold)":i%3===1?"#FFF3CE":"#FFD98A" };
  });
  return (<div style={S.envWrap}><div style={S.envBody}><p style={S.envLabel}>목적지 봉인</p><h3 style={S.envTitle}>어디로 가게 될까요?</h3>
    {!opening && (<><div style={S.hintRow}>{themes.map((h,i)=><span key={i} style={S.hintChip}>{h}</span>)}{dist&&<span style={S.hintChip}>{dist}</span>}{dur&&<span style={S.hintChip}>{dur}</span>}</div>{relaxed && <p style={S.relax}>딱 맞는 곳이 없어 테마를 넓혔어요</p>}</>)}</div>
    <div style={S.envFlap} className={opening?"flap-open":""}/><div style={S.envSeal} className={opening?"seal-crack":""}>출발</div>
    {opening && (<><div style={S.flash} className="flash"/><span className="magic-ring" style={{position:"absolute",top:46,left:"50%",width:120,height:120,borderRadius:"50%",border:"2px solid rgba(255,226,150,.85)",pointerEvents:"none",zIndex:4}}/>{burst.map((b,i)=>(<span key={i} className="burst" style={{"--tx":`${b.tx}px`,"--ty":`${b.ty}px`,animationDelay:`${b.d}s`,position:"absolute",top:40,left:"50%",width:b.sz,height:b.sz,borderRadius:"50%",background:b.c,boxShadow:`0 0 ${b.sz+4}px rgba(255,215,120,.9)`,pointerEvents:"none",zIndex:6}}/>))}</>)}</div>);
}

/* ───────── 로고 주사위 ───────── */
export function DiceLogo({size=30}){
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{display:"block"}}>
      <g transform="rotate(-13 10 20)">
        <rect x="1.5" y="12" width="15.5" height="15.5" rx="4.4" fill="var(--stamp)"/>
        <circle cx="6.6" cy="17.1" r="1.6" fill="var(--paper)"/>
        <circle cx="12" cy="22.5" r="1.6" fill="var(--paper)"/>
      </g>
      <g transform="rotate(10 21 12)">
        <rect x="13" y="3" width="17" height="17" rx="4.8" fill="var(--paper)" stroke="var(--stamp)" strokeWidth="1.7"/>
        <circle cx="18.2" cy="8.2" r="1.75" fill="var(--stamp)"/>
        <circle cx="24.8" cy="8.2" r="1.75" fill="var(--stamp)"/>
        <circle cx="18.2" cy="14.8" r="1.75" fill="var(--stamp)"/>
        <circle cx="24.8" cy="14.8" r="1.75" fill="var(--stamp)"/>
      </g>
    </svg>
  );
}

/* ───────── 인트로 스플래시 ───────── */
export function Splash({onStart}){
  return (
    <div className="app-splash" style={S.splash}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 26px",textAlign:"center"}}>
        <span style={S.splashEyebrow}>주사위로 떠나는 랜덤 국내여행</span>
        <h1 style={S.splashTitle}>대한민국</h1>
        <h1 style={S.splashTitle2}>부루마블</h1>
        <div style={{margin:"20px 0 16px"}}><SplashArt/></div>
        <p style={S.splashSub}>주사위를 굴리면 목적지가 봉투에 담겨 배정돼요. 현장에서 인증해 전국을 점령하고, 소멸 위기 지역은 2배 점수 황금 타일로 차지하세요.</p>
      </div>
      <div style={{padding:"0 26px 30px"}}>
        <button onClick={onStart} style={S.splashBtn}>여행 시작 🧳</button>
        <p style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,.72)",marginTop:12}}>전국 시·군·구 땅따먹기 · 시즌 1</p>
      </div>
    </div>
  );
}

export function SplashArt(){
  return (
    <svg width="200" height="148" viewBox="0 0 200 148">
      <path d="M100 8 L108 42 L142 32 L116 56 L150 72 L112 72 L120 112 L100 82 L80 112 L88 72 L50 72 L84 56 L58 32 L92 42 Z" fill="#FFD23F" opacity="0.22"/>
      <g transform="translate(38,54) rotate(-8)">
        <rect width="64" height="46" rx="6" fill="#F4EDDF"/>
        <path d="M0 4 L64 4 L32 30 Z" fill="#E2D6BC"/>
        <circle cx="32" cy="17" r="11" fill="#131F3C"/>
        <text x="32" y="21" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">출발</text>
      </g>
      <g transform="translate(112,58) rotate(10)">
        <rect width="48" height="48" rx="11" fill="#fff"/>
        <circle cx="14" cy="14" r="5" fill="#16223F"/><circle cx="34" cy="14" r="5" fill="#16223F"/>
        <circle cx="24" cy="24" r="5" fill="#16223F"/>
        <circle cx="14" cy="34" r="5" fill="#16223F"/><circle cx="34" cy="34" r="5" fill="#16223F"/>
      </g>
      <g transform="translate(150,28)">
        <path d="M12 0 C5 0 0 5 0 12 C0 21 12 32 12 32 C12 32 24 21 24 12 C24 5 19 0 12 0 Z" fill="#1E8E8A"/>
        <circle cx="12" cy="12" r="4.5" fill="#fff"/>
      </g>
      <g fill="#FFE08A">
        <path d="M28 22 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"/>
        <path d="M176 92 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"/>
      </g>
    </svg>
  );
}
