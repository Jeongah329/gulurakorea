import React, { useState, useRef } from "react";
import { TOLL } from "../data/gameData.js";
import { verifyReceipt, verifyGps } from "../lib/verification.js";
import { S } from "../styles/styles.js";
import { Chk } from "./Common.jsx";

export function VerifyFlow({ trip, onMissionDone, onDone, memberById, flash }){
  const arrivalIdx = trip.missions.findIndex(m=>m.t==="명소");
  const [step,setStep] = useState(trip.missions[arrivalIdx]?.done?1:0);
  const [scanning,setScanning] = useState(false);
  const [parsed,setParsed] = useState(null);
  const fileRef = useRef(null); const pendRef = useRef(-1);
  const arrival = trip.missions[arrivalIdx];
  const others = trip.missions.map((m,i)=>({...m,i})).filter(o=>o.i!==arrivalIdx);
  const friend = trip.tollFriend? memberById(trip.tollFriend):null;
  const doneCount = trip.missions.filter(m=>m.done).length;
  const allDone = trip.missions.every(m=>m.done);

  async function doArrival(){ const r=await verifyGps(); onMissionDone(arrivalIdx,{gps:r}); flash(`도착 확인 · 반경 ${r.dist}m`); setTimeout(()=>setStep(1),600); }
  async function doGps(i){ const r=await verifyGps(); onMissionDone(i,{gps:r}); flash(`인증 완료 · 반경 ${r.dist}m`); }
  function pickReceipt(i){ pendRef.current=i; fileRef.current?.click(); }
  async function onFile(e){
    const i=pendRef.current; if(i<0) return;
    const file = e.target.files?.[0];
    if(!file) return;
    setScanning(true); setParsed(null);
    try {
      const data = await verifyReceipt(trip, file);
      setParsed({ idx:i, data });
    } catch(err) {
      flash("영수증 인식에 실패했어요 · 사진을 다시 찍어주세요");
    } finally {
      setScanning(false);
      e.target.value = ""; // 같은 파일 재선택 가능하도록 초기화
    }
  }
  function acceptReceipt(){ if(!Object.values(parsed.data.checks).every(Boolean)){ flash("영수증 검증 실패 · 다시 시도"); return; } onMissionDone(parsed.idx,{receipt:parsed.data}); setParsed(null); }

  return (
    <div style={S.vfScreen} className="overlay-in">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{display:"none"}}/>
      <div style={S.vfHead}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:"var(--ink-soft)"}}>{trip.sido} · {trip.sigungu}</span>
          <button onClick={onDone} style={S.vfClose}>나중에</button>
        </div>
        <h2 style={{fontFamily:"'HiKR',sans-serif",fontSize:21,color:"var(--ink)",marginTop:2}}>{trip.title}</h2>
        <div style={S.stepper}>
          {["도착 인증","미션 인증"].map((lb,i)=>(
            <React.Fragment key={i}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{...S.stepDot,...(i<=step?S.stepDotOn:{})}}>{i<step?"✓":i+1}</span>
                <span style={{fontSize:11.5,fontWeight:i===step?800:600,color:i===step?"var(--ink)":"var(--ink-soft)"}}>{lb}</span>
              </div>
              {i<1 && <span style={{flex:1,height:2,background:i<step?"var(--stamp)":"var(--line)",margin:"0 6px"}}/>}
            </React.Fragment>))}
        </div>
      </div>

      <div style={S.vfBody} className="scroll">
        {trip.outcome==="toll" && step<2 && (
          <div style={{...S.ownBanner,background:"rgba(242,145,60,.12)",border:"1px solid rgba(242,145,60,.5)",marginBottom:14}}>
            <span style={{fontSize:18}}>🚧</span><div style={{flex:1}}><b style={{color:"var(--stamp)",fontSize:13}}>{friend?.name}님의 영토</b><div style={{fontSize:12,color:"var(--ink-soft)"}}>통행료 {TOLL}🪙{trip.useExempt?" · 면제권 적용":" 발생"}</div></div>
          </div>)}

        {step===0 && (<>
          <div style={{...S.destImg,borderRadius:16,background:`linear-gradient(135deg,${trip.grad[0]},${trip.grad[1]})`,marginBottom:16}}>
            {trip.depop && <span style={S.goldTag}>★ 황금 타일</span>}
            <div style={S.destImgInner}><span style={{fontSize:12,opacity:.9}}>도착 미션</span><h3 style={{...S.destName,fontSize:19}}>{arrival.n}</h3></div>
          </div>
          <p style={{fontSize:13.5,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:18}}>목적지에 도착했다면 현재 위치로 도착을 인증하세요. 반경 200m 안에서만 인증되며, 도착 인증이 끝나야 점령할 수 있어요.</p>
          {!arrival.done ? (<button onClick={doArrival} style={S.vfPrimary}>📍 현재 위치로 도착 인증</button>)
                         : (<div style={S.doneNote}>✅ 도착 확인 · 반경 {arrival.gps?.dist}m 이내</div>)}
        </>)}

        {step===1 && (<>
          <p style={{fontFamily:"'HiKR',sans-serif",fontSize:15,color:"var(--ink)"}}>추가 미션 <span style={{fontSize:12,fontFamily:"'MiceGothic',sans-serif",color:"var(--ink-soft)",fontWeight:600}}>· 인증당 +20점</span></p>
          <p style={{fontSize:12.5,color:"var(--ink-soft)",margin:"4px 0 14px"}}>맛집은 영수증, 체험은 위치로 인증해요. 모두 인증하면 메인에서 점령할 수 있어요.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {others.map(m=>(<div key={m.i} style={{...S.vCard,...(m.done?S.vCardDone:{})}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{m.done?"✅":m.method==="receipt"?"🧾":"📍"}</span>
                <div style={{flex:1}}><span style={{fontSize:14,fontWeight:800,color:"var(--ink)"}}>{m.n}</span>
                  <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{m.done?(m.method==="receipt"?`${m.receipt.store} · ${m.receipt.amount.toLocaleString()}원`:`반경 ${m.gps.dist}m 인증`):(m.method==="receipt"?"영수증으로 인증":"위치로 인증")}</div></div>
                {!m.done && <button onClick={()=>m.method==="receipt"?pickReceipt(m.i):doGps(m.i)} style={S.vBtn}>{m.method==="receipt"?"영수증":"위치 확인"}</button>}
              </div>
              {scanning && pendRef.current===m.i && <div style={S.scanBox}><span className="spin" style={{fontSize:16}}>◌</span> 영수증 분석 중… (OCR)</div>}
            </div>))}
          </div>
          {parsed && (<div style={S.receipt} className="pop-in">
            <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px dashed var(--line)",paddingBottom:8,marginBottom:8}}><b style={{color:"var(--ink)"}}>{parsed.data.store}</b><span style={{fontSize:12,color:"var(--ink-soft)"}}>{parsed.data.datetime}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--ink-soft)",marginBottom:10}}><span>{parsed.data.sido} {parsed.data.sigungu}</span><b style={{color:"var(--ink)"}}>{parsed.data.amount.toLocaleString()}원</b></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}><Chk ok={parsed.data.checks.region} t="목적지 지역 일치"/><Chk ok={parsed.data.checks.recent} t="최근 영수증"/><Chk ok={parsed.data.checks.biz} t="사업자 진위"/><Chk ok={parsed.data.checks.unique} t="중복 아님"/></div>
            <button onClick={acceptReceipt} style={S.acceptBtn}>이 영수증으로 인증</button></div>)}
        </>)}
      </div>

      {step===0 && arrival.done && (<div style={S.vfFoot}><button onClick={()=>setStep(1)} style={S.vfPrimary}>다음 · 미션 인증</button></div>)}
      {step===1 && (<div style={S.vfFoot}><button onClick={onDone} style={S.vfPrimary}>{allDone?"인증 완료 — 메인에서 점령하기":`인증 완료 · ${doneCount}/3`}</button></div>)}
    </div>
  );
}
