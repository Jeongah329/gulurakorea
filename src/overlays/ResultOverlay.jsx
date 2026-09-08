/**
 * 점령 결과 오버레이
 */
import React from "react";
import { Row } from "../ui/primitives.jsx";
import { S } from "../ui/styles.js";

export function ResultOverlay({ trip, result, onClose }){
  return (
    <div style={S.vfScreen} className="overlay-in app-result">
      <div style={{flex:1,overflowY:"auto",padding:"24px 22px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{textAlign:"center"}} className="reveal-in">
          <div style={{...S.resultBadge,background:`linear-gradient(135deg,${trip.grad[0]},${trip.grad[1]})`}}>{trip.depop?"★":"✓"}</div>
          <h2 style={{fontFamily:"'HiKR',sans-serif",fontSize:25,color:"var(--ink)",marginTop:16}}>{result.label}!</h2>
          <p style={{fontSize:13,color:"var(--ink-soft)",marginTop:4}}>{trip.sido} {trip.sigungu} · {trip.title}</p>
          <div style={S.tally}>
            <Row k={trip.outcome==="conquer"?"점령 점수":trip.outcome==="toll"?"방문 점수":"재방문 점수"} v={`+${result.base}`}/>
            <Row k={`미션 인증 ${result.doneCount}건`} v={`+${result.doneCount*20}`}/>
            {result.perfect && <Row k="퍼펙트 보너스" v="+30"/>}
            <div style={S.tallyDiv}/>
            <Row k="총 획득" v={`+${result.total}점`} hi/>
          </div>
          {result.cardsGained>0 && <p style={{fontSize:12.5,color:"var(--sea)",fontWeight:700,marginTop:14}}>🎴 인증 카드 {result.cardsGained}장 획득</p>}
        </div>
      </div>
      <div style={S.vfFoot}><button onClick={onClose} style={S.vfPrimary}>지도에서 확인</button></div>
    </div>
  );
}
