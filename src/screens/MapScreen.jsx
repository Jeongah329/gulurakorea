/**
 * 지도 탭 — 실제 경계 지도와 타일 보드
 */
import React, { useState, useMemo, useEffect } from "react";
import { BOARD, SIDO_ACCENT, SIDO_FULL } from "../data/board.js";
import { SIDO_ORDER, TOLL } from "../data/constants.js";
import { SIGUNGU, boardCode, outlineOf } from "../lib/sigungu.js";
import { Lg } from "../ui/primitives.jsx";
import { S } from "../ui/styles.js";

/* ───────── 지도 (실제 경계 / 타일 보드) ───────── */
export function MapScreen({ownership,ownerColor,memberById,members,room,createRoom,joinRoom,openShare,leaveRoom,score,memberScore,ownedCount,myRegionCount,activeTrip,flash,myName,onNameChange,pendingJoinCode,clearPendingJoin,online,locks,useLockCard,hasLockCard,homeSet,homeCand,claimHome}){
  const [view,setView] = useState("real");
  const [joining,setJoining] = useState(()=>!!pendingJoinCode);
  const [codeInput,setCodeInput] = useState(()=>pendingJoinCode||"");
  const [busy,setBusy] = useState(false);
  const activeSgg = activeTrip?.sgg;

  // 초대 링크(?join=코드)로 들어온 경우: 코드를 자동 입력만 하고, 참여는 버튼을 눌러야 진행된다
  useEffect(()=>{
    if(pendingJoinCode){ setJoining(true); setCodeInput(pendingJoinCode); }
  },[pendingJoinCode]);

  async function handleCreate(){
    if(!myName.trim()){ flash("닉네임을 입력해 주세요"); return; }
    setBusy(true);
    try{ await createRoom(); } finally { setBusy(false); }
  }
  async function handleJoin(){
    if(!myName.trim()){ flash("닉네임을 입력해 주세요"); return; }
    if(!codeInput.trim()){ flash("코드를 입력해 주세요"); return; }
    setBusy(true);
    try{ await joinRoom(codeInput); clearPendingJoin?.(); } finally { setBusy(false); }
  }
  return (<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={S.boardHead}>
      <div><p style={{fontSize:12,color:"var(--ink-soft)"}}>정복한 지역</p><p style={{fontFamily:"'HiKR',sans-serif",fontSize:26,color:"var(--ink)"}}>{ownedCount}<span style={{fontSize:15,color:"var(--ink-soft)"}}> 곳</span></p></div>
      <div style={{textAlign:"right"}}><p style={{fontSize:12,color:"var(--ink-soft)"}}>점령 점수</p><p style={{fontFamily:"'HiKR',sans-serif",fontSize:26,color:"var(--stamp)"}}>{score}</p></div>
    </div>
    <div style={S.viewSwitch}>
      <button onClick={()=>setView("real")} style={{...S.viewBtn,...(view==="real"?S.viewOn:{})}}>지도</button>
      <button onClick={()=>setView("tiles")} style={{...S.viewBtn,...(view==="tiles"?S.viewOn:{})}}>타일</button>
    </div>

    {!homeSet && (
      <div style={S.homeCard}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <span style={{fontSize:18}}>📍</span>
          <b style={{fontSize:14,color:"var(--ink)"}}>출발 지역을 정해주세요</b>
        </div>
        <p style={{fontSize:12,color:"var(--ink-soft)",lineHeight:1.55,marginBottom:11}}>
          지금 계신 지역 한 곳을 조건 없이 내 땅으로 드려요. 여기서부터 전국을 넓혀가면 됩니다.
        </p>
        {homeCand ? (
          <button onClick={()=>claimHome(homeCand)} style={{...S.roomPrimary,width:"100%"}}>
            {homeCand.sido===homeCand.name ? homeCand.name : `${homeCand.sido} ${homeCand.name}`}에서 시작하기
          </button>
        ) : (
          <p style={{fontSize:12,color:"var(--ink-soft)"}}>현재 위치를 확인하는 중이에요. 위치 권한을 허용해 주세요.</p>
        )}
      </div>
    )}
    {view==="real" ? <RealMap {...{ownership,ownerColor,memberById,activeSgg}}/> : <TileBoard {...{ownership,ownerColor,memberById,members,room,activeSgg,locks,useLockCard,hasLockCard}}/>}

    <div style={S.legend}>{members.map(m=><Lg key={m.id} c={m.color} t={m.id==="me"?"나":m.name}/>)}<Lg c="var(--paper-2)" t="미점령" border/></div>

    {!room ? (
      <div style={S.roomCard}><p style={{fontFamily:"'HiKR',sans-serif",fontSize:15,color:"var(--ink)",marginBottom:4}}>친구와 같은 게임판</p>
        <p style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:12,lineHeight:1.5}}>방을 만들어 친구를 초대하면 한 지도에서 영토를 두고 경쟁해요. 친구 땅에 도착하면 통행료를 냅니다.</p>
        {!online && <p style={{fontSize:11,color:"var(--stamp)",marginBottom:10,lineHeight:1.5}}>⚠ 온라인 방 기능이 아직 꺼져 있어요 (Firebase 설정 필요 · README 참고)</p>}
        <p style={{fontSize:11.5,color:"var(--ink-soft)",marginBottom:6}}>방에서 쓸 닉네임</p>
        <input value={myName} onChange={e=>onNameChange(e.target.value.slice(0,10))} placeholder="닉네임 입력" maxLength={10} style={{...S.codeInput,width:"100%",marginBottom:10,boxSizing:"border-box"}}/>
        {!joining ? (
          <div style={{display:"flex",gap:8}}><button onClick={handleCreate} disabled={busy} style={{...S.roomPrimary,opacity:busy?.6:1}}>{busy?"만드는 중…":"방 만들기"}</button><button onClick={()=>setJoining(true)} disabled={busy} style={S.roomGhost}>코드로 참여</button></div>
        ) : (
          <div>
            <p style={{fontSize:11.5,color:"var(--ink-soft)",marginBottom:6}}>{pendingJoinCode ? "초대 코드가 자동으로 입력됐어요 · 확인 후 참여를 눌러주세요" : "친구에게 받은 방 코드를 입력하세요"}</p>
            <div style={{display:"flex",gap:8}}>
              <input value={codeInput} onChange={e=>setCodeInput(e.target.value.toUpperCase())} placeholder="예: KR-7C2A" maxLength={8} style={S.codeInput}/>
              <button onClick={handleJoin} disabled={busy} style={{...S.roomPrimary,flex:"none",padding:"13px 20px",opacity:busy?.6:1}}>{busy?"참여 중…":"참여"}</button>
            </div>
            <button onClick={()=>{setJoining(false);setCodeInput("");clearPendingJoin?.();}} disabled={busy} style={{...S.roomGhost,marginTop:8,width:"100%"}}>취소</button>
          </div>
        )}</div>
    ) : (
      <div style={S.roomCard}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}><div><p style={{fontSize:11.5,color:"var(--ink-soft)"}}>방 코드</p><p style={{fontFamily:"'HiKR',sans-serif",fontSize:18,color:"var(--ink)",letterSpacing:1}}>{room.code}</p></div><button onClick={openShare} style={S.inviteBtn}>친구 초대</button></div>
        <p style={{fontSize:11,color:"var(--ink-soft)",marginBottom:8}}>방 안 순위 · 점수 우선, 동점 시 정복 곳수</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{
          [...members].map(m=>({m,sc:memberScore(m.id),rg:myRegionCount(m.id)}))
            .sort((a,b)=> b.sc-a.sc || b.rg-a.rg)
            .map((row,idx)=>{ const m=row.m; const lead=idx===0; const isMe=m.id==="me";
              return (<div key={m.id} style={{...S.memberRow, ...(lead?{border:"1.5px solid var(--gold)",background:"rgba(227,169,44,.07)"}:{}), ...(isMe&&!lead?{border:"1.5px solid var(--me)"}:{})}}>
                <span style={{width:20,textAlign:"center",fontFamily:"'HiKR',sans-serif",fontSize:13,color:"var(--ink-soft)"}}>{idx+1}</span>
                <div style={{position:"relative",width:24,height:24}}>
                  <span style={{width:24,height:24,borderRadius:"50%",background:m.color,display:"grid",placeItems:"center",color:"#fff",fontSize:11,fontWeight:800}}>{(isMe?"나":m.name)[0]}</span>
                  {lead && <span style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",fontSize:14}}>👑</span>}
                </div>
                <span style={{fontSize:13.5,fontWeight:800,color:isMe?"var(--me)":"var(--ink)"}}>{isMe?"나":m.name}</span>
                <span style={{marginLeft:"auto",fontFamily:"'HiKR',sans-serif",fontSize:15,color:"var(--ink)"}}>{row.sc}</span>
                <span style={{fontSize:11,color:"var(--ink-soft)",width:38,textAlign:"right"}}>{row.rg}곳</span>
              </div>);
            })
        }</div>
        <button onClick={leaveRoom} style={{...S.roomGhost,marginTop:12,width:"100%"}}>방 나가기</button></div>)}
  </div>);
}

export function RealMap({ownership,ownerColor,memberById,activeSgg}){
  const [sel,setSel] = useState(null);   // 선택된 게임판 코드
  const selOwner = sel ? ownership[sel] : null;
  /* 게임판 코드별로 폴리곤을 묶는다. 서울·수원처럼 합쳐진 곳은 여러 조각이 한 덩어리가 된다. */
  const shapes = useMemo(()=>{
    const g = {};
    SIGUNGU.forEach(f=>{
      const bc = boardCode(f.code);
      const e = g[bc] || (g[bc] = { code:bc, sido:f.sido, name:f.name, parts:[] });
      e.parts.push(f.d);
    });
    /* 이름은 게임판 타일 기준으로 맞춘다. 서울 강동구가 아니라 서울로 보여야 한다 */
    BOARD.forEach(t=>{ if(g[t.code]){ g[t.code].sido = t.sido; g[t.code].name = t.name; } });
    return Object.values(g).map(e=>({ ...e, d: outlineOf(e.parts) }));
  },[]);
  const selGroup = sel ? shapes.find(g=>g.code===sel) : null;
  return (
    <div style={S.mapCard}>
      <svg viewBox="-8 -8 636 674" style={{width:"100%",height:"auto",display:"block"}}>
        {/* 1단계 — 면만 칠한다. 선이 없으니 합쳐진 지역 안쪽에 구 경계가 보이지 않는다 */}
        {shapes.map(g=>{
          const owner = ownership[g.code];
          const fill = owner ? ownerColor(owner) : "#FFFFFF";
          const active = boardCode(activeSgg||"")===g.code;
          return <path key={g.code} className={active?"mapBlink":""} d={g.d} fill={fill}
                       stroke={fill} strokeWidth={0.6} onClick={()=>setSel(g.code)} style={{cursor:"pointer"}}/>;
        })}
        {/* 2단계 — 경계선. 합쳐진 지역은 조각마다 선을 그리지 않고 덩어리 테두리만 남긴다 */}
        {shapes.map(g=>{
          const active = boardCode(activeSgg||"")===g.code;
          const on = sel===g.code;
          return <path key={"o"+g.code} d={g.d} fill="none" pointerEvents="none"
                       stroke={on?"#16223F":active?"#F2913C":"rgba(70,70,90,.35)"}
                       strokeWidth={on||active?1.6:0.4}/>;
        })}
      </svg>
      {selGroup && (<div style={S.selBar}><b style={{color:"var(--ink)"}}>{selGroup.sido===selGroup.name ? selGroup.name : `${selGroup.sido} ${selGroup.name}`}</b>
        <span style={{marginLeft:8,fontSize:12.5,color:"var(--ink-soft)"}}>{selOwner==="me"?"나의 영토":selOwner?`${memberById(selOwner)?.name}님의 영토`:"미점령"}</span>
        {selOwner && selOwner!=="me" && <span style={{marginLeft:"auto",fontSize:11.5,color:"var(--stamp)",fontWeight:700}}>통행료 {TOLL}🪙</span>}</div>)}
      <p style={{fontSize:11,color:"var(--ink-soft)",textAlign:"center",margin:"2px 0 2px"}}>인증한 시·군·구가 내 색으로 칠해져요 · 지역을 탭해보세요</p>
    </div>
  );
}

export function TileBoard({ownership,ownerColor,memberById,members,room,activeSgg,locks={},useLockCard,hasLockCard}){
  const [open,setOpen] = useState(()=>new Set());   // 펼쳐진 시·도
  const toggle = (sd)=> setOpen(prev=>{ const n=new Set(prev); n.has(sd)?n.delete(sd):n.add(sd); return n; });
  const groups = useMemo(()=>{
    const g={}; BOARD.forEach(t=>{(g[t.sido]=g[t.sido]||[]).push(t);});
    return SIDO_ORDER.filter(sd=>g[sd]).map(sd=>({sido:sd,tiles:g[sd]}));
  },[]);
  const names = members.map(m=>m.id==="me"?"나":m.name).join(" · ");
  return (
    <div style={S.boardDark}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>📖</span><span style={S.boardTitle}>우리 게임판</span></div>
          <p style={S.boardSub}>{names} · {members.length}명 {room?"경쟁 중":"플레이"}</p>
        </div>
        {room && <span style={S.livePill}><span style={S.liveDot}/> LIVE · 시즌 1</span>}
      </div>
      <div style={S.boardLegend}>
        <span><i style={{...S.boardLegendDot,border:"2px solid #FFD23F"}}/>내가 점령</span>
        <span><i style={{...S.boardLegendDot,border:"2px solid rgba(255,255,255,.25)"}}/>비어 있음</span>
        <span>☀️ ×2 인구감소지역 · 점수 2배</span>
        <span>🔒 잠금 · 도전 1회 방어</span>
      </div>
      {groups.map(g=>{
        const total=g.tiles.length;
        const mine=g.tiles.filter(t=>ownership[t.code]==="me").length;
        const expanded = open.has(g.sido) || g.tiles.some(t=>t.code===activeSgg);
        return (<div key={g.sido} style={{marginBottom:expanded?20:8}}>
          <button onClick={()=>toggle(g.sido)} style={S.boardSidoRow}>
            <span style={{width:4,height:17,borderRadius:3,background:SIDO_ACCENT[g.sido]||"#888"}}/>
            <span style={S.boardSido}>{SIDO_FULL[g.sido]||g.sido}</span>
            <span style={S.boardCount}>{mine}/{total} 점령</span>
            <span style={{marginLeft:"auto",fontSize:12,color:"#8A93AD"}}>{expanded?"▲":"▼"}</span>
          </button>
          {expanded && <div style={S.bGrid}>
            {g.tiles.map(t=>{
              const owner=ownership[t.code]; const isMe=owner==="me";
              const mem = owner&&!isMe? memberById(owner):null;
              /* 테두리: 내가 점령 = 금색, 다른 사람 = 그 사람 색, 나머지 = 무채색 */
              const accent = isMe?"#FFD23F":mem?mem.color:"rgba(255,255,255,.08)";
              const owned = isMe||mem;
              const pts = t.depop? t.pt*2 : t.pt;
              const active = t.code===activeSgg;
              const locked = !!locks[t.code];
              const canLock = isMe && hasLockCard && !locked;
              return (<div key={t.code} className={active?"tileBlink":""}
                onClick={canLock? ()=>useLockCard(t.code) : undefined}
                style={{...S.bTile, border:`2px solid ${active?"#F2913C":accent}`, cursor:canLock?"pointer":"default",
                background: owned? `${accent}22` : "#18233A"}}>
                {locked && <span style={{position:"absolute",top:6,right:7,fontSize:12}}>🔒</span>}
                {active && <span style={S.bLive}>여행 중</span>}
                {t.depop && <span style={S.bSun}>☀️</span>}
                {owned && <span style={{...S.bBadge,background:isMe?"#FFD23F":mem.color,color:isMe?"#16223F":"#fff"}}>{isMe?"나":mem.name}</span>}
                <div style={{fontSize:24,textAlign:"center",marginTop:t.depop||owned?7:2}}>{t.icon}</div>
                <div style={{textAlign:"center",marginTop:5}}>
                  <span style={{fontSize:12.5,fontWeight:800,color:"#EAEFFA"}}>{t.name}</span>
                  {t.depop && <span style={{fontSize:11,fontWeight:800,color:"#E3A92C"}}> ×2</span>}
                </div>
                <div style={{textAlign:"center",fontSize:11,fontWeight:700,color:t.depop?"#E3A92C":"#8A93AD",marginTop:2}}>{pts}pt</div>
              </div>);
            })}
          </div>}
        </div>);
      })}
    </div>
  );
}
