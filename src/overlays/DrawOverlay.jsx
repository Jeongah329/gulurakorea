/**
 * 주사위 · 봉투 · 목적지 공개 오버레이
 * 메인 화면 전체를 덮는 추첨 연출 부분입니다.
 */
import React, { useEffect, useRef, useState } from "react";
import { kakaoRouteUrl } from "../api/kakao.js";
import { DIST_STEPS, THEME_LABELS, TOLL, methodFor } from "../data/constants.js";
import { KakaoMap } from "../ui/KakaoMap.jsx";
import { CARD_USE_MS, CardUseOverlay, DieFace, Envelope, Meta } from "../ui/primitives.jsx";
import { S } from "../ui/styles.js";

export function DrawOverlay({ phase, dieN, candidate, droppedCard, relaxedMsg, themes, distIdx,
  duration, rollsLeft, rollDice, depart, destOwner, tollDue,
  memberById, resetToMain, startTrip, appliedBoosts=[],
  hasReroll, hasPass, useRerollCard, useTravelPassCard,
  choices, chooseMode, chooseCandidate, cancelChoosing }){
  const [fx,setFx] = useState(null); // {icon,label,fn} — 🔄/🎫 카드 사용 연출 재생 중
  const timerRef = useRef(null);
  useEffect(()=>()=>clearTimeout(timerRef.current),[]);
  // 연출이 끝난 뒤 실제로 카드 효과를 적용함
  function playCard(icon,label,fn){
    setFx({ icon, label });
    timerRef.current = setTimeout(()=>{ fn(); setFx(null); }, CARD_USE_MS);
  }
  const cardButtons = (hasReroll || hasPass) && (
    <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}>
      {hasReroll && <button disabled={!!fx} onClick={()=>playCard("🔄","지역을 다시 배정하는 중…",useRerollCard)} style={{...S.cardPill,opacity:fx?.6:1}}>🔄 지역 변경권 사용</button>}
      {hasPass && <button disabled={!!fx} onClick={()=>playCard("🎫","이번 지역을 포기하는 중…",useTravelPassCard)} style={{...S.cardPill,opacity:fx?.6:1}}>🎫 여행 패스 사용</button>}
    </div>
  );
  const appliedRow = appliedBoosts.length>0 && (
    <div style={S.appliedRow}>{appliedBoosts.map((b,i)=><span key={i} style={S.appliedTag}>{b.icon} {b.label}</span>)}</div>
  );
  return (
                  <div style={S.overlay} className="overlay-in app-overlay">
            {fx && <CardUseOverlay icon={fx.icon} label={fx.label}/>}
            {phase==="rolling" && (<div style={{textAlign:"center"}}><div className="die-shake"><DieFace n={dieN} size={92}/></div><p style={S.olHint}>목적지를 봉투에 담는 중…</p></div>)}
            {phase==="choosing" && (
              <div style={{textAlign:"center",width:"100%"}} className="pop-in">
                <p style={{color:"var(--paper)",fontSize:15,fontWeight:800,marginBottom:4}}>{chooseMode==="preview"?"🔍 후보 3곳 중 하나를 선택하세요":"🗺️ 원하는 지역을 직접 선택하세요"}</p>
                <p style={{color:"var(--paper)",opacity:.6,fontSize:12,marginBottom:16}}>고른 지역이 바로 확정돼요 · 주사위 기회는 소모되지 않아요</p>
                {appliedRow}
                {choices.length===0 ? (<p style={{color:"var(--paper)",opacity:.7,fontSize:13}}>후보를 찾는 중…</p>) : (
                  <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:"56vh",overflowY:"auto"}} className="scroll">
                    {choices.map((c,i)=>(
                      <button key={i} onClick={()=>chooseCandidate(c)} style={{...S.choiceCard, background:`linear-gradient(135deg, ${c.grad[0]}, ${c.grad[1]})`}}>
                        <div style={{textAlign:"left"}}>
                          <div style={{fontSize:11.5,opacity:.85,color:"#fff"}}>{c.sido} · {c.sigungu}{c.depop?" · ★ 황금타일":""}</div>
                          <div style={{fontSize:15.5,fontWeight:800,color:"#fff"}}>{c.title}</div>
                        </div>
                        <span style={{fontSize:12,color:"#fff",opacity:.9,flexShrink:0}}>{c.distanceKm}km</span>
                      </button>))}
                  </div>)}
                <button onClick={cancelChoosing} style={{...S.btnGhost,marginTop:16,width:"100%"}}>취소</button>
              </div>)}
            {phase==="sealed" && candidate && (
              <div style={{textAlign:"center",width:"100%"}} className="pop-in">
                {droppedCard && (<div style={S.cardDrop} className="card-drop"><span style={{fontSize:22}}>{droppedCard.icon}</span><div style={{textAlign:"left"}}><div style={{fontSize:11,color:"var(--gold)",fontWeight:800}}>{droppedCard.kind==="room"?"방 카드 획득!":"개인 카드 획득!"}</div><div style={{fontSize:13,fontWeight:700,color:"var(--paper)"}}>{droppedCard.name}</div></div></div>)}
                {appliedRow}
                <Envelope opening={false} themes={relaxedMsg?["조건 완화됨"]:themes.map(t=>THEME_LABELS[t])} dist={DIST_STEPS[distIdx].label} dur={duration} relaxed={relaxedMsg}/>
                <div style={{display:"flex",gap:10,marginTop:18,width:"100%"}}>
                  <button onClick={rollDice} disabled={rollsLeft<=0} style={{...S.btnGhost,opacity:rollsLeft<=0?.4:1}}>다시 굴리기 · {rollsLeft}회</button>
                  <button onClick={depart} style={S.btnDepart}>출발 ✦ 봉투 열기</button></div>
                {cardButtons}
                <p style={S.olSub}>출발하면 목적지가 확정돼요</p></div>)}
            {phase==="opening" && candidate && (<div style={{textAlign:"center",width:"100%"}}><Envelope opening={true} themes={[]} dist="" dur="" relaxed={false}/><p style={{color:"var(--paper)",opacity:.85,marginTop:22,fontSize:14}}>봉인을 여는 중…</p></div>)}
            {phase==="revealed" && candidate && (
              <div style={{width:"100%"}} className="reveal-in">
                <p style={{textAlign:"center",color:"var(--paper)",opacity:.7,fontSize:13,marginBottom:10}}>당신의 목적지는…</p>
                {appliedBoosts.length>0 && <div style={{...S.appliedRow,marginBottom:10}}>{appliedBoosts.map((b,i)=><span key={i} style={S.appliedTag}>{b.icon} {b.label}</span>)}</div>}
                <div style={S.destCard}>
                  <div style={{...S.destImg, background: candidate.image ? `linear-gradient(180deg, rgba(10,18,36,0) 40%, rgba(10,18,36,.62) 100%), url(${candidate.image}) center/cover no-repeat` : `linear-gradient(135deg, ${candidate.grad[0]}, ${candidate.grad[1]})`}}>
                    {candidate.depop && <span style={S.goldTag}>★ 황금 타일 · 2배 점수</span>}
                    <div style={S.destImgInner}><span style={{fontSize:13,opacity:.9}}>{candidate.sido} · {candidate.sigungu}</span><h2 style={S.destName}>{candidate.title}</h2></div></div>
                  <div style={{padding:"15px 18px"}}>
                    {tollDue ? (<div style={{...S.ownBanner,background:"rgba(242,145,60,.12)",border:"1px solid rgba(242,145,60,.5)"}}><span style={{fontSize:18}}>🚧</span><div style={{flex:1,textAlign:"left"}}><b style={{color:"var(--stamp)",fontSize:13}}>{memberById(destOwner)?.name}님의 영토</b><div style={{fontSize:12,color:"var(--ink-soft)"}}>통행료 {TOLL}코인 발생</div></div></div>)
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
                {cardButtons}
                <div style={{display:"flex",gap:10,marginTop:16}}><button onClick={resetToMain} style={S.btnGhost}>나중에</button><button onClick={startTrip} style={S.btnDepart}>여행 시작하기</button></div></div>)}
          </div>
  );
}
