/**
 * 기록 탭 — 순위 경쟁 대신 현황판
 *  ① 우리 방 영토 현황 (전국 251곳 중 몇 곳)
 *  ② 방 구성원별 땅 개수 (땅따먹기 결과 그대로)
 *  ③ 내 기록
 */
import React, { useMemo } from "react";
import { S } from "../ui/styles.js";
import { BOARD, SIDO_ACCENT, SIDO_FULL } from "../data/board.js";
import { SIDO_ORDER } from "../data/constants.js";

const TOTAL = BOARD.length;

export function RankScreen({ownership,members,memberById,myRegionCount,memberScore,room,trips,locks}){
  const stat = useMemo(()=>{
    const owned = Object.keys(ownership).filter(k=>ownership[k]);
    const mine  = owned.filter(k=>ownership[k]==="me");
    const bySido = {};
    BOARD.forEach(t=>{
      const s=(bySido[t.sido]=bySido[t.sido]||{total:0,mine:0,room:0});
      s.total++;
      if(ownership[t.code]==="me") { s.mine++; s.room++; }
      else if(ownership[t.code]) s.room++;
    });
    const depopVisited = BOARD.filter(t=>t.depop && ownership[t.code]==="me").length;
    const sidoRows = SIDO_ORDER.filter(sd=>bySido[sd]).map(sd=>({sido:sd,...bySido[sd]}));
    const topSido = [...sidoRows].sort((a,b)=>b.mine-a.mine)[0];
    return { roomOwned:owned.length, mine:mine.length, sidoRows, depopVisited, topSido };
  },[ownership]);

  const roster = useMemo(()=>{
    return members.map(m=>({
      id:m.id, name:m.id==="me"?"나":m.name, color:m.color,
      land:myRegionCount(m.id), score:memberScore(m.id), isMe:m.id==="me",
    })).sort((a,b)=> b.land-a.land || b.score-a.score);
  },[members,ownership]);

  const lockCount = Object.keys(locks||{}).filter(k=>ownership[k]==="me").length;
  const pct = (n)=> Math.round(n/TOTAL*1000)/10;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* ① 우리 방 영토 현황 */}
      <div style={S.rankHero}>
        <p style={{fontSize:12,color:"var(--ink-soft)"}}>
          {room ? `우리 방 영토 · ${room.code}` : "나의 영토"}
        </p>
        <div style={{display:"flex",alignItems:"baseline",gap:5}}>
          <span style={{fontFamily:"'HiKR',sans-serif",fontSize:42,color:"var(--stamp)"}}>{stat.roomOwned}</span>
          <span style={{fontSize:17,fontWeight:800,color:"var(--ink)"}}>곳</span>
          <span style={{marginLeft:"auto",fontSize:12,color:"var(--ink-soft)"}}>전국 {TOTAL}곳 중 {pct(stat.roomOwned)}%</span>
        </div>
        <div style={{height:8,borderRadius:5,background:"var(--paper-2)",marginTop:12,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.max(1.5,stat.roomOwned/TOTAL*100)}%`,background:"var(--stamp)",borderRadius:5}}/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <span style={S.rankMetric}>내 땅 <b style={{color:"var(--ink)"}}>{stat.mine}곳</b></span>
          {lockCount>0 && <span style={S.rankMetric}>🔒 잠금 <b style={{color:"var(--ink)"}}>{lockCount}곳</b></span>}
          <span style={S.rankMetric}>☀️ 인구감소지역 <b style={{color:"var(--ink)"}}>{stat.depopVisited}곳</b></span>
        </div>
      </div>

      {/* ② 방 구성원별 땅 */}
      <div>
        <h3 style={{...S.secTitle,marginBottom:10}}>{room?"우리 방 땅따먹기":"내 영토"}</h3>
        {roster.length<=1 && !room && (
          <p style={S.empty}>친구를 초대하면 같은 지도에서 땅을 두고 겨룰 수 있어요.</p>
        )}
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

      {/* ③ 시·도별 채움 */}
      <div>
        <h3 style={{...S.secTitle,marginBottom:10}}>시·도별 채움</h3>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {stat.sidoRows.map(r=>(
            <div key={r.sido} style={{display:"flex",alignItems:"center",gap:9}}>
              <span style={{width:74,fontSize:12,fontWeight:700,color:"var(--ink)"}}>{SIDO_FULL[r.sido]||r.sido}</span>
              <span style={{flex:1,height:7,borderRadius:4,background:"var(--paper-2)",overflow:"hidden"}}>
                <span style={{display:"block",height:"100%",width:`${r.room/r.total*100}%`,background:SIDO_ACCENT[r.sido]||"#888",borderRadius:4}}/>
              </span>
              <span style={{fontSize:11,color:"var(--ink-soft)",width:48,textAlign:"right"}}>{r.room}/{r.total}</span>
            </div>
          ))}
        </div>
      </div>

      <p style={S.dataNote}>
        땅은 먼저 다녀온 사람이 갖습니다. 남의 땅에 걸렸을 때 미션 3개를 모두 인증하면 그 땅을 가져오고,
        하나라도 놓치면 통행료만 내고 돌아옵니다. 타일 잠금 카드를 내 땅에 걸어두면 도전 한 번을 막아줍니다.
        {stat.topSido && stat.topSido.mine>0 && ` 지금 내 땅이 가장 많은 곳은 ${SIDO_FULL[stat.topSido.sido]||stat.topSido.sido}(${stat.topSido.mine}곳)입니다.`}
      </p>
    </div>
  );
}
