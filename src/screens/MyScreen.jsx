/**
 * 마이 탭 — 기록과 카드
 */
import React, { useState } from "react";
import { PERSONAL_CARD_WHEN_LABEL } from "../data/constants.js";
import { Section, Stat } from "../ui/primitives.jsx";
import { S } from "../ui/styles.js";

const COLL_ICON = { "영수증":"🧾", "인증샷":"📷", "면제":"🧳" };

/* ───────── 마이페이지 ───────── */
export function MyScreen({score,coins,inventory,roomCards=[],ownedCount,trips,cards,room,resetDemo,apiStatus,origin,openCard,bonusActive,rushCharges,boostIgnoreDist,boostAdjacent}){
  const [showAllCards,setShowAllCards] = useState(false);
  const shownCards = showAllCards ? cards : cards.slice(0,3);
  return (<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={S.profile}><div style={S.avatar}>👤</div><div><p style={{fontFamily:"'HiKR',sans-serif",fontSize:18,color:"var(--ink)"}}>여행자 #0427</p><p style={{fontSize:12,color:"var(--ink-soft)"}}>{origin?.label||"출발 지역 미설정"}{room?` · 방 ${room.code}`:""}</p></div></div>
    <div style={S.statRow}><Stat k="점령 점수" v={score} c="var(--stamp)"/><Stat k="여행 코인" v={coins} c="var(--gold)"/><Stat k="정복 지역" v={ownedCount} c="var(--sea)"/></div>
    <div style={S.section}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8}}><h3 style={S.secTitle}>인증 카드</h3><span style={{fontSize:11.5,color:"var(--ink-soft)"}}>{cards.length}장</span></div>
        {cards.length>3 && <button onClick={()=>setShowAllCards(v=>!v)} style={S.moreBtn}>{showAllCards?"접기":"더보기"}</button>}
      </div>
      {cards.length===0 ? <p style={S.empty}>도착 인증을 완료하면 인증샷·영수증 카드가 쌓여요.</p> :
        <div style={{display:"flex",flexDirection:"column",gap:6}}>{shownCards.map((c,i)=>(
          <div key={i} style={S.collRow}>
            <span style={{...S.collDot,background:`linear-gradient(135deg,${c.grad[0]},${c.grad[1]})`}}>{COLL_ICON[c.type]||"📷"}</span>
            <span style={{flex:1,minWidth:0}}>
              <b style={{fontSize:12.5,fontWeight:800,color:"var(--ink)",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</b>
              <span style={{fontSize:10.5,color:"var(--ink-soft)"}}>{c.place}</span>
            </span>
            {c.depop && <span style={{color:"var(--gold)",fontSize:13}}>★</span>}
          </div>))}</div>}
    </div>
    <Section title="개인 카드" sub={`${inventory.length}장`}>
      {(bonusActive || rushCharges>0 || boostIgnoreDist || boostAdjacent) && (
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {boostIgnoreDist && <span style={S.cardTag}>📍 다음 주사위 거리 무시 예약됨</span>}
          {boostAdjacent && <span style={S.cardTag}>🧭 다음 주사위 인접 지역 예약됨</span>}
          {bonusActive && <span style={S.cardTag}>⭐ 다음 점령 보너스 적용 예정</span>}
          {rushCharges>0 && <span style={S.cardTag}>🔥 여행 러시 {rushCharges}회 대기 중</span>}
        </div>
      )}
      {inventory.length===0 ? <p style={S.empty}>주사위를 굴리면 가끔 개인 카드가 떨어져요.</p> :
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{inventory.map((c,i)=>(
          <div key={i} style={S.cardRow}>
            <span style={{fontSize:22}}>{c.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,fontWeight:800,color:"var(--ink)"}}>{c.name}</div>
              <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{c.desc}</div>
              <div style={{marginTop:3}}><span style={S.cardTag}>{PERSONAL_CARD_WHEN_LABEL[c.when]||"사용"}</span></div>
            </div>
            <button onClick={()=>openCard(c,"personal")} style={S.cardActBtn}>사용</button>
          </div>
        ))}</div>}
    </Section>
    {(room || roomCards.length>0) && (
      <Section title="방 카드" sub={`${roomCards.length}장`}>
        {roomCards.length===0 ? <p style={S.empty}>방 안에서 주사위를 굴리면 가끔 방 카드가 떨어져요.</p> :
          <div style={{display:"flex",flexDirection:"column",gap:8}}>{roomCards.map((c,i)=>(
            <div key={i} style={S.cardRow}>
              <span style={{fontSize:22}}>{c.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13.5,fontWeight:800,color:"var(--ink)"}}>{c.name}</div>
                <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{c.desc}</div>
              </div>
              <button onClick={()=>openCard(c,"room")} style={S.cardActBtn}>사용</button>
            </div>
          ))}</div>}
      </Section>
    )}
    <Section title="여행 기록" sub={`${trips.length}회`}>
      {trips.length===0 ? <p style={S.empty}>첫 여행을 시작해 보세요.</p> :
        trips.map((t,i)=>(<div key={i} style={S.tripRow}><span style={{width:8,height:8,borderRadius:"50%",background:t.outcome==="conquer"?(t.depop?"var(--gold)":"var(--stamp)"):t.outcome==="toll"?"var(--ink-soft)":"var(--sea)"}}/><span style={{fontSize:13.5,fontWeight:700,color:"var(--ink)"}}>{t.title}</span><span style={{fontSize:12,color:"var(--ink-soft)"}}>{t.sido} {t.sigungu}</span><span style={{marginLeft:"auto",fontSize:11.5,color:"var(--ink-soft)"}}>{t.verified}/3 · +{t.score}</span></div>))}
    </Section>
  </div>);
}

