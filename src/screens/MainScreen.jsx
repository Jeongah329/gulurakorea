/**
 * 메인 탭 — 조건 선택과 주사위
 */
import React from "react";
import { BUDGETS, DIST_STEPS, DURATIONS, THEME_LABELS, THEME_LIST } from "../data/constants.js";
import { Section } from "../ui/primitives.jsx";
import { S } from "../ui/styles.js";

/* ───────── 메인 ───────── */
export function MainScreen({themes,toggleTheme,distIdx,setDistIdx,duration,setDuration,budget,setBudget,rollsLeft,rollDice,activeTrip,openVerify,finishTrip,origin,apiStatus,
  boostIgnoreDist,boostAdjacent,bonusActive,rushCharges}){
  const pending = [
    boostIgnoreDist && {icon:"📍",label:"거리 무시 예약됨"},
    boostAdjacent && {icon:"🧭",label:"인접 지역 예약됨"},
    bonusActive && {icon:"⭐",label:"점령 보너스 예약됨"},
    rushCharges>0 && {icon:"🔥",label:`여행 러시 ${rushCharges}회 대기`},
  ].filter(Boolean);
  return (<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={S.hello}>
      <p style={{fontSize:13,color:"var(--ink-soft)"}}>오늘의 출발지</p>
      <p style={{fontFamily:"'HiKR',sans-serif",fontSize:22,color:"var(--ink)"}}>📍 {origin.label}</p>
      {origin.sub && <p style={{fontSize:12,color:"var(--ink-soft)",fontWeight:600,marginTop:2}}>{origin.sub}</p>}
      <div style={S.apiPill}>
        <span style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:apiStatus.mode==="live"?"#2EB872":apiStatus.mode==="sample"?"var(--gold)":"var(--line)"}}/>
        <span>{apiStatus.mode==="live" ? "TourAPI 4.0 실시간 연결됨" : apiStatus.mode==="sample" ? ("샘플 데이터 사용 중 · "+(apiStatus.msg||"API 응답 없음")) : "TourAPI 4.0 대기 중 · 주사위를 굴리면 조회합니다"}</span>
      </div>
    </div>
    {pending.length>0 && <div style={S.pendingRow}>{pending.map((p,i)=><span key={i} style={S.pendingTag}>{p.icon} {p.label}</span>)}</div>}
    {activeTrip ? (
      <ActiveTripCard trip={activeTrip} openVerify={openVerify} finishTrip={finishTrip}/>
    ) : (<>
      <Section title="테마" sub="끌리는 분위기를 골라요 (복수 선택)"><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{THEME_LIST.map(t=><button key={t} onClick={()=>toggleTheme(t)} style={{...S.chip,...(themes.includes(t)?S.chipOn:{})}}>{THEME_LABELS[t]}</button>)}</div></Section>
      <Section title="이동거리" sub={`${DIST_STEPS[distIdx].label} · ${DIST_STEPS[distIdx].sub}`}><input type="range" min={0} max={3} value={distIdx} onChange={e=>setDistIdx(+e.target.value)} className="range" style={{width:"100%"}}/><div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>{DIST_STEPS.map((d,i)=><span key={i} style={{fontSize:11,fontWeight:i===distIdx?800:500,color:i===distIdx?"var(--stamp)":"var(--ink-soft)"}}>{d.label}</span>)}</div></Section>
      <Section title="여행 기간"><div style={{display:"flex",gap:8}}>{DURATIONS.map(d=><button key={d} onClick={()=>setDuration(d)} style={{...S.segBtn,...(duration===d?S.segOn:{})}}>{d}</button>)}</div></Section>
      <Section title="예산" sub="교통·숙박 포함 예상 경비"><div style={{display:"flex",gap:8}}>{BUDGETS.map(b=><button key={b.v} onClick={()=>setBudget(b.v)} style={{...S.segBtn,...(budget===b.v?S.segOn:{})}}>{b.label}</button>)}</div></Section>
      <button onClick={rollDice} disabled={rollsLeft<=0} style={{...S.rollBtn,opacity:rollsLeft<=0?.5:1}}><span style={{fontSize:26}}>🎲</span><span>{rollsLeft>0?"주사위 굴리기":"오늘 기회 소진"}</span><span style={S.rollCount}>남은 {rollsLeft}/5</span></button>
      <p style={{textAlign:"center",fontSize:12,color:"var(--ink-soft)",marginTop:-6}}>목적지는 출발 전까지 봉투 안에 숨겨져요</p>
    </>)}
  </div>);
}

export function ActiveTripCard({trip,openVerify,finishTrip}){
  const done = trip.missions.filter(m=>m.done).length;
  const allDone = trip.missions.every(m=>m.done);
  const arrivalDone = trip.missions.find(m=>m.t==="명소")?.done;
  const finishLabel = trip.outcome==="conquer"?"미션 완료 · 이 지역 점령하기":trip.outcome==="toll"?"미션 완료 · 방문 완료하기":"미션 완료 · 재방문 완료";
  return (
    <div style={S.tripCard}>
      <div style={S.tripStatus}><span className="blink-dot" style={S.tripDot}/> 여행 중 · 미점령</div>
      <div style={{...S.tripImg,background:`linear-gradient(135deg,${trip.grad[0]},${trip.grad[1]})`}}>
        {trip.depop && <span style={S.goldTag}>★ 황금 타일 ×2</span>}
        <div style={S.tripImgInner}><span style={{fontSize:12,opacity:.9}}>{trip.sido} · {trip.sigungu}</span><h2 style={{...S.destName,fontSize:23}}>{trip.title}</h2></div>
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontFamily:"'HiKR',sans-serif",fontSize:14,color:"var(--ink)"}}>도착 미션</span>
          <span style={{fontSize:12,color:"var(--ink-soft)"}}>{done}/3 인증</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {trip.missions.map((m,i)=>(<div key={i} style={S.tripMission}>
            <span style={{fontSize:15}}>{m.done?"✅":m.method==="receipt"?"🧾":"📍"}</span>
            <span style={{fontSize:13,fontWeight:700,color:m.done?"var(--ink-soft)":"var(--ink)",textDecoration:m.done?"line-through":"none"}}>{m.n}</span>
            <span style={S.tripTag}>{m.t}</span>
            <span style={{marginLeft:"auto",fontSize:11,color:m.done?"var(--sea)":"var(--ink-soft)",fontWeight:700}}>{m.done?"인증됨":m.method==="receipt"?"영수증":"GPS"}</span>
          </div>))}
        </div>
        {allDone
          ? <button onClick={finishTrip} style={{...S.tripPrimary,marginTop:14}}>{finishLabel}</button>
          : <button onClick={openVerify} style={{...S.tripPrimary,marginTop:14,background:"var(--ink)",boxShadow:"0 5px 0 #0c1730"}}>{arrivalDone?"이어서 인증하기":"도착 인증하기"} →</button>}
      </div>
    </div>
  );
}
