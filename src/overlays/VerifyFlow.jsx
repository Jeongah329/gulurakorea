/**
 * 도착 인증 · 미션 인증 오버레이
 */
import React, { useEffect, useState, useRef } from "react";
import { kakaoRouteUrl } from "../api/kakao.js";
import { verifyArrivalReal, verifyGps, verifyReceipt } from "../api/verification.js";
import { TOLL } from "../data/constants.js";
import { KakaoMap } from "../ui/KakaoMap.jsx";
import { CARD_USE_MS, CardUseOverlay, Chk } from "../ui/primitives.jsx";
import { S } from "../ui/styles.js";

export function VerifyFlow({ trip, onMissionDone, onMissionPlace, onDone, memberById, flash, hasExemptCard, useMissionExemptCard }){
  const arrivalIdx = trip.missions.findIndex(m=>m.t==="명소");
  const [step,setStep] = useState(trip.missions[arrivalIdx]?.done?1:0);
  const [scanning,setScanning] = useState(false);
  const [parsed,setParsed] = useState(null);
  const [locating,setLocating] = useState(false);
  const [locMsg,setLocMsg] = useState("");
  const fileRef = useRef(null); const pendRef = useRef(-1); const exemptTimer = useRef(null);
  const [exemptFx,setExemptFx] = useState(null); // {idx,name} — 🧳 미션 면제 카드 사용 연출
  useEffect(()=>()=>clearTimeout(exemptTimer.current),[]);
  function playExempt(idx,name){
    setExemptFx({ idx, name });
    exemptTimer.current = setTimeout(()=>{ useMissionExemptCard(idx); setExemptFx(null); }, CARD_USE_MS);
  }
  const [pickerIdx,setPickerIdx] = useState(-1);   // 장소 고르기 목록이 열린 미션 번호
  const arrival = trip.missions[arrivalIdx];
  const others = trip.missions.map((m,i)=>({...m,i})).filter(o=>o.i!==arrivalIdx);
  const friend = trip.tollFriend? memberById(trip.tollFriend):null;
  const doneCount = trip.missions.filter(m=>m.done).length;
  const allDone = trip.missions.every(m=>m.done);
  const pool = (t)=> (trip.missionPool && trip.missionPool[t]) || [];

  async function doArrival(){
    setLocating(true); setLocMsg("");
    try{
      const r = await verifyArrivalReal(trip, 300);
      if(r.ok){ onMissionDone(arrivalIdx,{gps:r}); flash(r.dist!=null?`도착 확인 · ${r.dist}m`:"도착 확인 · 행정구역 일치"); setTimeout(()=>setStep(1),600); }
      else setLocMsg(r.reason);
    }catch(e){ setLocMsg(String((e&&e.message)||e)); }
    setLocating(false);
  }
  function demoArrival(){ const r=verifyGps(); onMissionDone(arrivalIdx,{gps:{...r,mode:"demo"}}); setLocMsg(""); flash(`(데모) 도착 확인 · 반경 ${r.dist}m`); setTimeout(()=>setStep(1),600); }
  async function doGps(i){
    setLocating(true);
    try{
      const r = await verifyArrivalReal(trip, 3000);
      if(r.ok){ onMissionDone(i,{gps:r}); flash(r.dist!=null?`인증 완료 · ${r.dist}m`:"인증 완료 · 행정구역 일치"); }
      else flash(r.reason);
    }catch(e){ flash(String((e&&e.message)||e)); }
    setLocating(false);
  }
  function demoGps(i){ const r=verifyGps(); onMissionDone(i,{gps:{...r,mode:"demo"}}); flash(`(데모) 인증 완료 · 반경 ${r.dist}m`); }
  function pickReceipt(i){ pendRef.current=i; fileRef.current?.click(); }
  async function onFile(e){
    const i=pendRef.current; if(i<0) return;
    const file = e.target.files?.[0];
    if(!file) return;
    setScanning(true); setParsed(null);
    try{
      const data = await verifyReceipt(trip, file);
      setParsed({ idx:i, data });
    }catch(err){
      flash("영수증 인식에 실패했어요 · 사진을 다시 찍어 주세요 · " + String((err&&err.message)||err));
    }finally{
      setScanning(false);
      e.target.value = ""; // 같은 파일 재선택 가능하도록 초기화
    }
  }
  function acceptReceipt(force){ if(!force && !Object.values(parsed.data.checks).every(Boolean)){ flash("검증 실패 항목이 있어요"); return; } onMissionDone(parsed.idx,{receipt:parsed.data}); setParsed(null); }

  return (
    <div style={S.vfScreen} className="overlay-in app-verify">
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
            <span style={{fontSize:18}}>{trip.locked?"🔒":"⚔️"}</span><div style={{flex:1}}><b style={{color:"var(--stamp)",fontSize:13}}>{friend?.name}님의 영토 · 도전</b><div style={{fontSize:12,color:"var(--ink-soft)"}}>
              {trip.locked ? "타일 잠금이 걸려 있어요 · 이번 도전은 막혀요"
                : `미션 3개를 모두 인증하면 이 땅을 가져와요 · 실패하면 통행료 ${TOLL}🪙`}
            </div></div>
          </div>)}

        {step===0 && (<>
          <div style={{...S.destImg,borderRadius:16,marginBottom:16,background: trip.image ? `linear-gradient(180deg, rgba(10,18,36,0) 40%, rgba(10,18,36,.62) 100%), url(${trip.image}) center/cover no-repeat` : `linear-gradient(135deg,${trip.grad[0]},${trip.grad[1]})`}}>
            {trip.depop && <span style={S.goldTag}>★ 황금 타일</span>}
            <div style={S.destImgInner}><span style={{fontSize:12,opacity:.9}}>도착 미션</span><h3 style={{...S.destName,fontSize:19}}>{arrival.n}</h3></div>
          </div>
          {isFinite(trip.lat) && isFinite(trip.lng) && (<div style={{marginBottom:14}}>
            <KakaoMap lat={trip.lat} lng={trip.lng} title={trip.title} height={170} level={4}/>
            <a href={kakaoRouteUrl(trip)} target="_blank" rel="noreferrer" style={S.routeBtn}>🚗 카카오맵으로 길찾기</a>
          </div>)}
          <p style={{fontSize:13.5,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:18}}>목적지에 도착했다면 현재 위치로 도착을 인증하세요. GPS 좌표와 카카오 행정구역을 함께 대조하며, 반경 300m 안에서만 인증돼요.</p>
          {!arrival.done ? (<>
            <button onClick={doArrival} disabled={locating} style={{...S.vfPrimary,opacity:locating?.6:1}}>{locating?"위치 확인 중…":"📍 현재 위치로 도착 인증"}</button>
            {locMsg && (<div style={S.locFail}><b style={{color:"var(--stamp)"}}>인증되지 않았어요</b><span>{locMsg}</span>
              <button onClick={demoArrival} style={S.demoBtn}>(데모) 도착했다고 가정하고 진행 →</button></div>)}
          </>) : (<div style={S.doneNote}>{arrival.gps?.mode==="demo"?"✅ (데모) 도착 확인":"✅ 도착 확인"}{arrival.gps?.dist!=null?` · 반경 ${arrival.gps.dist}m`:""}{arrival.gps?.region?` · ${arrival.gps.region.full}`:""}</div>)}
        </>)}

        {step===1 && (<>
          <p style={{fontFamily:"'HiKR',sans-serif",fontSize:15,color:"var(--ink)"}}>추가 미션 <span style={{fontSize:12,fontFamily:"'MiceGothic',sans-serif",color:"var(--ink-soft)",fontWeight:600}}>· 인증당 +20점</span></p>
          <p style={{fontSize:12.5,color:"var(--ink-soft)",margin:"4px 0 14px"}}>맛집은 영수증, 체험은 위치로 인증해요. 모두 인증하면 메인에서 점령할 수 있어요.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {others.map(m=>(<div key={m.i} style={{...S.vCard,...(m.done?S.vCardDone:{})}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{m.exempt?"🧳":m.done?"✅":m.method==="receipt"?"🧾":"📍"}</span>
                <div style={{flex:1}}><span style={{fontSize:14,fontWeight:800,color:"var(--ink)"}}>{m.n}</span>
                  <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{m.done?(m.method==="receipt"?`${m.receipt.store} · ${m.receipt.amount.toLocaleString()}원`:`반경 ${m.gps.dist}m 인증`):(m.method==="receipt"?"영수증으로 인증":"위치로 인증")}</div></div>
                {!m.done && <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                  <button onClick={()=>m.method==="receipt"?pickReceipt(m.i):doGps(m.i)} disabled={locating} style={{...S.vBtn,opacity:locating&&m.method!=="receipt"?.6:1}}>{m.method==="receipt"?"영수증":(locating?"확인 중…":"위치 확인")}</button>
                  {m.method!=="receipt" && <button onClick={()=>demoGps(m.i)} style={S.demoMini}>데모</button>}
                  {hasExemptCard && <button disabled={!!exemptFx} onClick={()=>playExempt(m.i,m.n)} style={{...S.demoMini,opacity:exemptFx?.6:1}}>🧳 면제권</button>}
                </div>}
              </div>

              {/* 주변 후보 고르기 — TourAPI 주변 목록에서 직접 선택 */}
              {!m.done && (pool(m.t).length>0) && (
                <button onClick={()=>setPickerIdx(pickerIdx===m.i?-1:m.i)} style={S.swapBtn}>
                  {pickerIdx===m.i ? "닫기" : `다른 곳 고르기 · 주변 ${pool(m.t).length}곳`}
                </button>)}
              {!m.done && pickerIdx===m.i && (
                <div style={S.placeList} className="pop-in">
                  {pool(m.t).map(pl=>{
                    const on = m.place && m.place.contentid===pl.contentid;
                    return (
                      <button key={pl.contentid} onClick={()=>{ onMissionPlace(m.i,pl); setPickerIdx(-1); flash(pl.name+"(으)로 바꿨어요"); }}
                        style={{...S.placeItem,...(on?S.placeItemOn:{})}}>
                        <span style={{...S.placeThumb,...(pl.image?{background:`url(${pl.image}) center/cover no-repeat`}:{})}}>{pl.image?"":(m.t==="맛집"?"🍽":"🚶")}</span>
                        <span style={{flex:1,textAlign:"left",minWidth:0}}>
                          <b style={{fontSize:13,color:"var(--ink)",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pl.name}</b>
                          <span style={{fontSize:11,color:"var(--ink-soft)",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {pl.distM!=null?`${pl.distM<1000?pl.distM+"m":(pl.distM/1000).toFixed(1)+"km"} · `:""}{pl.addr||"주소 정보 없음"}
                          </span>
                        </span>
                        {on && <span style={{fontSize:12,color:"var(--sea)",fontWeight:800}}>선택됨</span>}
                      </button>);
                  })}
                </div>)}

              {scanning && pendRef.current===m.i && <div style={S.scanBox}><span className="spin" style={{fontSize:16}}>◌</span> 영수증 분석 중… (OCR)</div>}
            </div>))}
          </div>
          {parsed && (<div style={S.receipt} className="pop-in">
            <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px dashed var(--line)",paddingBottom:8,marginBottom:8}}><b style={{color:"var(--ink)"}}>{parsed.data.store}</b><span style={{fontSize:12,color:"var(--ink-soft)"}}>{parsed.data.datetime}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--ink-soft)",marginBottom:10}}><span>{parsed.data.sido} {parsed.data.sigungu}</span><b style={{color:"var(--ink)"}}>{parsed.data.amount.toLocaleString()}원</b></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}><Chk ok={parsed.data.checks.region} t="목적지 지역 일치"/><Chk ok={parsed.data.checks.recent} t="최근 영수증"/><Chk ok={parsed.data.checks.biz} t="사업자 진위"/><Chk ok={parsed.data.checks.unique} t="중복 아님"/></div>
            {parsed.data.bizNote && <p style={{fontSize:11,color:"var(--ink-soft)",lineHeight:1.5,marginBottom:10}}>ⓘ {parsed.data.bizNote}</p>}
            <button onClick={()=>acceptReceipt(false)} style={S.acceptBtn}>이 영수증으로 인증</button>
            {!Object.values(parsed.data.checks).every(Boolean) && <button onClick={()=>acceptReceipt(true)} style={{...S.demoBtn,marginTop:8,width:"100%"}}>(데모) 검증 무시하고 진행 →</button>}</div>)}
        </>)}
      </div>

      {step===0 && arrival.done && (<div style={S.vfFoot}><button onClick={()=>setStep(1)} style={S.vfPrimary}>다음 · 미션 인증</button></div>)}
      {step===1 && (<div style={S.vfFoot}><button onClick={onDone} style={S.vfPrimary}>{allDone?"인증 완료 — 메인에서 점령하기":`인증 완료 · ${doneCount}/3`}</button></div>)}
    {exemptFx && <CardUseOverlay icon="🧳" label={`"${exemptFx.name}" 면제 중…`}/>}
    </div>
  );
}
