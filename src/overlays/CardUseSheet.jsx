/**
 * 카드 사용 시트 — 마이 탭에서 모든 개인/방 카드를 하나의 통일된 방식으로 사용합니다.
 * 즉시 사용 가능한 카드는 바로 적용하고, 대상 선택이 필요한 카드(미션 면제·점령 보호)는
 * 이 시트 안에서 바로 선택할 수 있게 하며, 지금 사용할 수 없는 카드는 이유와 다음 행동을 안내합니다.
 * 실제로 효과가 적용되는 순간에는 카드가 뒤집히며 반짝이는 "사용 중" 연출이 재생된 뒤 완료 화면으로 넘어갑니다.
 */
import React, { useEffect, useRef, useState } from "react";
import { CARD_USE_MS, CardUseOverlay } from "../ui/primitives.jsx";
import { S } from "../ui/styles.js";

const USE_MS = CARD_USE_MS; // 카드 뒤집힘 애니메이션 재생 시간과 맞춘 지연

export function CardUseSheet({ card, kind, onClose, phase, candidate, activeTrip, ownedRegions=[], inRoom, actions, goToMain, goToMap, goToMission }){
  const [done,setDone] = useState(null);
  const [using,setUsing] = useState(null); // { label } — 재생 중인 사용 연출
  const timerRef = useRef(null);
  useEffect(()=>()=>clearTimeout(timerRef.current),[]);
  if(!card) return null;

  function closeAll(){ clearTimeout(timerRef.current); setDone(null); setUsing(null); onClose(); }

  // 효과를 실제로 적용하는 지점 — 연출이 끝난 뒤 fn()을 호출해 상태를 바꾸고 완료 화면으로 전환
  /* fn 이 문구를 돌려주면 그 문구를 완료 팝업에 띄운다.
     방 카드처럼 실제로 무슨 일이 일어났는지가 카드마다 다른 경우에 쓴다. */
  function playUse(fn, msg){
    setUsing({ label: msg });
    timerRef.current = setTimeout(()=>{
      const res = fn && fn();
      setUsing(null);
      setDone(typeof res === "string" && res ? res : msg);
    }, USE_MS);
  }
  // 미리보기/지역 선택권처럼 시트를 닫고 다른 화면(뽑기 오버레이)으로 넘어가야 하는 경우
  function playUseAndClose(fn){
    setUsing({ label: `${card.name} 사용 중…` });
    timerRef.current = setTimeout(()=>{ fn && fn(); closeAll(); }, USE_MS);
  }

  let body;

  if(kind==="room"){
    body = inRoom ? (<>
      <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14}}>{card.desc}</p>
      <button style={S.roomPrimary} onClick={()=>playUse(()=>actions.room(card.id), `${card.name} 사용 중…`)}>지금 사용하기</button>
    </>) : (<>
      <p style={S.sheetWarn}>방 카드는 방에 참여 중일 때만 쓸 수 있어요. 지도 탭에서 방을 만들거나 코드로 참여해 주세요.</p>
      <button style={S.roomPrimary} onClick={()=>{ closeAll(); goToMap && goToMap(); }}>지도 탭으로 가기</button>
    </>);
  } else {
    switch(card.id){
      case "reroll": {
        const usable = !!candidate && phase==="revealed";
        body = usable ? (<>
          <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14}}>{card.desc}</p>
          <button style={S.roomPrimary} onClick={()=>playUse(actions.reroll, "카드를 사용했어요")}>지금 사용하기</button>
        </>) : (<>
          <p style={S.sheetWarn}>봉투를 연 뒤, 목적지가 공개된 화면에서 사용할 수 있어요.</p>
          <button style={S.roomPrimary} onClick={()=>{ closeAll(); goToMain(); }}>메인 탭으로 가기</button>
        </>);
        break;
      }
      case "pass": {
        const started = activeTrip && activeTrip.missions.some(m=>m.done);
        const usable = !started && (!!candidate || !!activeTrip);
        body = usable ? (<>
          <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14}}>{card.desc}</p>
          <button style={S.roomPrimary} onClick={()=>playUse(actions.pass, "이번 목적지를 취소했어요")}>지금 사용하기</button>
        </>) : (
          <p style={S.sheetWarn}>
            {started ? "이미 인증을 시작한 여행은 포기할 수 없어요."
                     : "취소할 목적지가 있을 때 사용할 수 있어요."}
          </p>
        );
        break;
      }
      case "preview":
      case "select": {
        const usable = phase==="main" || phase==="sealed";
        body = usable ? (<>
          <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14}}>{card.desc}</p>
          <button style={S.roomPrimary} onClick={()=>playUseAndClose(card.id==="preview"?actions.preview:actions.select)}>지금 사용하기</button>
        </>) : (
          <p style={S.sheetWarn}>봉투를 열기 전까지만 사용할 수 있어요. 진행 중인 뽑기를 마무리한 뒤 다시 시도해 주세요.</p>
        );
        break;
      }
      case "extra_roll": {
        body = (<>
          <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14}}>{card.desc}</p>
          <button style={S.roomPrimary} onClick={()=>playUse(actions.extra_roll, "주사위 기회가 1회 늘었어요")}>지금 사용하기</button>
        </>);
        break;
      }
      case "adjacent": {
        const fn = actions.adjacent;
        body = (<>
          <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14}}>{card.desc}</p>
          <button style={S.roomPrimary} onClick={()=>playUse(fn, "다음 주사위/점령에 적용돼요")}>지금 사용하기</button>
        </>);
        break;
      }
      case "mission_exempt": {
        const missions = activeTrip ? activeTrip.missions.map((m,i)=>({...m,i})).filter(m=>!m.done && m.t!=="명소") : [];
        body = !activeTrip ? (
          <p style={S.sheetWarn}>진행 중인 여행이 있을 때, 미션 인증 중에 사용할 수 있어요.</p>
        ) : missions.length>0 ? (<>
          <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14}}>
            인증 화면에서 면제할 미션 옆의 🧳 면제권 버튼을 눌러 주세요.
          </p>
          <button style={S.roomPrimary} onClick={()=>{ closeAll(); goToMission && goToMission(); }}>미션 인증 화면으로 가기</button>
        </>) : missions.length===0 ? (
          <p style={S.sheetWarn}>지금은 면제할 수 있는 미션이 없어요.</p>
        ) : (<>
          <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:10}}>면제할 미션을 선택하세요</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {missions.map(m=>(
              <button key={m.i} style={S.sheetOption} onClick={()=>playUse(()=>actions.mission_exempt(m.i), `"${m.n}" 미션을 면제했어요`)}>{m.n}</button>
            ))}
          </div>
        </>);
        break;
      }
      case "protect": {
        body = ownedRegions.length===0 ? (
          <p style={S.sheetWarn}>보호할 수 있는 내 영토가 없어요. 먼저 지역을 점령해 보세요.</p>
        ) : (<>
          <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14}}>
            방에 참여 중일 때만 쓸 수 있어요. 지도에서 보호할 내 땅을 누른 뒤 🛡️ 보호 사용 버튼을 눌러 주세요.
          </p>
          <button style={S.roomPrimary} onClick={()=>{ closeAll(); goToMap && goToMap(); }}>지도 탭으로 가기</button>
        </>);
        break;
      }
      case "bonus":
        body = (<>
          <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:10}}>{card.desc}</p>
          <p style={S.sheetWarn}>따로 쓰지 않아도 돼요. 가지고 있으면 다음 점령 때 저절로 쓰입니다.</p>
        </>);
        break;
      default:
        body = <p style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6}}>{card.desc}</p>;
    }
  }

  return using ? (
    // 팝업 시트 대신 화면 정중앙에 카드 애니메이션만 표시
    <CardUseOverlay icon={card.icon} label={using.label}/>
  ) : (
    <div className="modal-scrim" style={S.modalScrim} onClick={closeAll}>
      <div style={S.sheet} onClick={e=>e.stopPropagation()} className="sheet-in scroll">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <span style={{fontSize:26}}>{card.icon}</span>
          <div>
            <div style={{fontFamily:"'HiKR',sans-serif",fontSize:17,color:"var(--ink)"}}>{card.name}</div>
          </div>
        </div>
        {done ? (
          <div style={{textAlign:"center",padding:"6px 0 4px"}}>
            <div style={{fontSize:30,marginBottom:8}}>✅</div>
            <p style={{fontSize:13.5,fontWeight:700,color:"var(--ink)",marginBottom:16}}>{done}</p>
            <button style={S.roomPrimary} onClick={closeAll}>확인</button>
          </div>
        ) : (<>
          {body}
          <button style={{...S.roomGhost,width:"100%",marginTop:10}} onClick={closeAll}>닫기</button>
        </>)}
      </div>
    </div>
  );
}
