/**
 * 기록 탭 — 순위 경쟁 대신 현황판
 *  ① 우리 방 정복 현황 (전국 몇 곳)
 *  ② 시·도별 채움 — 캐리어 게이지, 채운 비율 순
 *  ③ 방 구성원별 땅 개수 (땅따먹기 결과 그대로)
 */
import React, { useEffect, useMemo, useState } from "react";
import { S } from "../ui/styles.js";
import { BOARD, SIDO_ACCENT, SIDO_FULL } from "../data/board.js";
import { SIDO_ORDER } from "../data/constants.js";
import { CarrierFill } from "../ui/CarrierFill.jsx";

const TOTAL = BOARD.length;

export function RankScreen({ownership,members,memberById,myRegionCount,memberScore,room,trips,locks}){
  const [animate,setAnimate] = useState(false);
  useEffect(()=>{ setAnimate(false); const t=setTimeout(()=>setAnimate(true),60); return ()=>clearTimeout(t); },[ownership]);

  const stat = useMemo(()=>{
    const owned = Object.keys(ownership).filter(k=>ownership[k]);
    const mine  = owned.filter(k=>ownership[k]==="me");
    const bySido = {};
    BOARD.forEach(t=>{
      const s=(bySido[t.sido]=bySido[t.sido]||{total:0,mine:0,room:0});
      s.total++;
      if(ownership[t.code]==="me"){ s.mine++; s.room++; }
      else if(ownership[t.code]) s.room++;
    });
    const depopVisited = BOARD.filter(t=>t.depop && ownership[t.code]==="me").length;
    const rows = SIDO_ORDER.filter(sd=>bySido[sd]).map(sd=>({sido:sd,...bySido[sd], pct: bySido[sd].room/bySido[sd].total*100}));
    const ranked = [...rows].sort((a,b)=> b.pct-a.pct || b.room-a.room);
    return {
      roomOwned: owned.length, mine: mine.length, depopVisited,
      top10: ranked.slice(0,10),
      empty: ranked.slice(10).filter(r=>r.room===0),
    };
  },[ownership]);

  const roster = useMemo(()=> members.map(m=>({
      id:m.id, name:m.id==="me"?"나":m.name, color:m.color,
      land:myRegionCount(m.id), score:memberScore(m.id), isMe:m.id==="me",
    })).sort((a,b)=> b.land-a.land || b.score-a.score),
  [members,ownership]);

  const lockCount = (locks||[]).filter(k=>ownership[k]==="me").length;
  const roomPct = Math.round(stat.roomOwned/TOTAL*1000)/10;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* ① 우리 방 정복 현황 */}
      <div style={S.rankHero}>
        <p style={{fontSize:12,color:"var(--ink-soft)"}}>{room ? `우리 방 정복 현황 · ${room.code}` : "나의 정복 현황"}</p>
        <div style={{display:"flex",alignItems:"baseline",gap:5}}>
          <span style={{fontFamily:"'HiKR',sans-serif",fontSize:42,color:"var(--stamp)"}}>{stat.roomOwned}</span>
          <span style={{fontSize:17,fontWeight:800,color:"var(--ink)"}}>곳</span>
          <span style={{marginLeft:"auto",fontSize:12,color:"var(--ink-soft)"}}>전국 {TOTAL}곳 중 {roomPct}%</span>
        </div>
        <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
          <span style={S.rankMetric}>내 땅 <b style={{color:"var(--ink)"}}>{stat.mine}곳</b></span>
          {lockCount>0 && <span style={S.rankMetric}>🛡️ 보호 <b style={{color:"var(--ink)"}}>{lockCount}곳</b></span>}
          <span style={S.rankMetric}>☀️ 인구감소지역 <b style={{color:"var(--ink)"}}>{stat.depopVisited}곳</b></span>
        </div>
      </div>

      {/* ② 시·도별 채움 — 캐리어 */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <p style={{fontSize:13,fontWeight:800,color:"var(--ink)",margin:0}}>🧳 시·도별 채움 TOP 10</p>
        <p style={{fontSize:11,color:"var(--ink-soft)",margin:"0 0 2px"}}>
          캐리어는 그 시·도의 시·군을 얼마나 점령했는지만큼 차올라요
        </p>
        {stat.top10.map((r,i)=>{
          const color = SIDO_ACCENT[r.sido] || "var(--gold)";
          const hasMine = r.mine>0;
          return (
            <div key={r.sido} style={{...S.rankRow, ...(hasMine?{border:"1.5px solid var(--stamp)",background:"rgba(19,31,60,.06)"}:{})}}>
              <span style={{width:20,textAlign:"center",fontFamily:"'HiKR',sans-serif",fontSize:14,color:i<3?"var(--gold)":"var(--ink-soft)"}}>{i+1}</span>
              <CarrierFill percent={animate?r.pct:0} color={color} size={44} delay={i*80}/>
              <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:0,flex:1}}>
                <span style={{fontSize:13,fontWeight:800,color:"var(--ink)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {SIDO_FULL[r.sido]||r.sido}
                </span>
                <span style={{fontSize:11,color:"var(--ink-soft)"}}>
                  {r.room}/{r.total}곳{hasMine?` · 내 땅 ${r.mine}곳`:""}
                </span>
              </div>
              <span style={{fontFamily:"'HiKR',sans-serif",fontSize:18,color:r.room?"var(--ink)":"var(--ink-soft)"}}>{Math.round(r.pct)}%</span>
            </div>
          );
        })}
        {stat.empty.length>0 && (
          <p style={{fontSize:11.5,color:"var(--ink-soft)",marginTop:4,lineHeight:1.6}}>
            아직 발길이 닿지 않은 곳 · {stat.empty.map(r=>SIDO_FULL[r.sido]||r.sido).join(" · ")}
          </p>
        )}
      </div>

      {/* ③ 방 구성원별 땅 */}
      <div>
        <h3 style={{...S.secTitle,marginBottom:10}}>{room?"우리 방 땅따먹기":"내 영토"}</h3>
        {!room && <p style={S.empty}>친구를 초대하면 같은 지도에서 땅을 두고 겨룰 수 있어요.</p>}
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {roster.map(p=>(
            <div key={p.id} style={{...S.rankRow,...(p.isMe?{border:"1.5px solid var(--stamp)",background:"rgba(19,31,60,.06)"}:{})}}>
              <span style={{width:10,height:10,borderRadius:3,background:p.isMe?"#FFD23F":p.color}}/>
              <span style={{fontSize:13.5,fontWeight:800,color:p.isMe?"var(--stamp)":"var(--ink)"}}>{p.name}</span>
              <span style={{marginLeft:"auto",fontFamily:"'HiKR',sans-serif",fontSize:16,color:"var(--ink)"}}>{p.land}</span>
              <span style={{fontSize:11,color:"var(--ink-soft)",width:42,textAlign:"right"}}>곳</span>
            </div>
          ))}
        </div>
      </div>

      <p style={S.dataNote}>
        땅은 먼저 다녀온 사람이 갖습니다. 남의 땅에 걸렸을 때 미션 3개를 모두 인증하면 그 땅을 가져오고,
        하나라도 놓치면 통행료만 내고 돌아옵니다. 점령 보호 카드를 내 땅에 걸어두면 도전 한 번을 막아줍니다.
      </p>
    </div>
  );
}
