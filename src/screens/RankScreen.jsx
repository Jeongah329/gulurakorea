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
    /* 채운 비율 순 정렬 — 같으면 곳 수, 그다음 전국 순서 */
    const ranked = [...sidoRows].sort((a,b)=> (b.room/b.total)-(a.room/a.total) || b.room-a.room);
    const top10 = ranked.slice(0,10);
    const rest = ranked.slice(10).filter(r=>r.room===0);
    const topSido = [...sidoRows].sort((a,b)=>b.mine-a.mine)[0];
    return { roomOwned:owned.length, mine:mine.length, sidoRows, top10, rest, depopVisited, topSido };
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

      {/* ③ 시·도 TOP 10 — 채운 비율 순 */}
      <div>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:12}}>
          <h3 style={{...S.secTitle,margin:0}}>시·도 TOP 10</h3>
          <span style={{fontSize:11.5,color:"var(--ink-soft)"}}>채운 비율 순</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {stat.top10.map((r,i)=>{
            const color = SIDO_ACCENT[r.sido] || "#888";
            const minePct = r.mine/r.total*100;
            const otherPct = (r.room-r.mine)/r.total*100;
            return (
              <div key={r.sido} style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{...S.topRank,...(i<3?{background:color,color:"#fff"}:{})}}>{i+1}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:5}}>
                    <span style={{fontSize:12.5,fontWeight:800,color:"var(--ink)"}}>{SIDO_FULL[r.sido]||r.sido}</span>
                    <span style={{fontSize:11,color:"var(--ink-soft)"}}>{r.room}/{r.total}곳</span>
                    <span style={{marginLeft:"auto",fontFamily:"'HiKR',sans-serif",fontSize:15,color:r.room?color:"var(--ink-soft)"}}>
                      {Math.round(r.room/r.total*100)}%
                    </span>
                  </div>
                  <div style={S.topTrack}>
                    <span style={{display:"block",height:"100%",width:`${minePct}%`,background:"#E3A92C",float:"left"}}/>
                    <span style={{display:"block",height:"100%",width:`${otherPct}%`,background:color,opacity:.55,float:"left"}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:14,marginTop:12,fontSize:11,color:"var(--ink-soft)"}}>
          <span><i style={{...S.boardLegendDot,background:"#E3A92C"}}/>내가 점령</span>
          <span><i style={{...S.boardLegendDot,background:"var(--ink-soft)",opacity:.55}}/>다른 사람</span>
          <span><i style={{...S.boardLegendDot,background:"var(--paper-2)"}}/>비어 있음</span>
        </div>
        {stat.rest.length>0 && (
          <p style={{fontSize:11.5,color:"var(--ink-soft)",marginTop:12,lineHeight:1.6}}>
            아직 발길이 닿지 않은 곳 · {stat.rest.map(r=>SIDO_FULL[r.sido]||r.sido).join(" · ")}
          </p>
        )}
      </div>

      <p style={S.dataNote}>
        땅은 먼저 다녀온 사람이 갖습니다. 남의 땅에 걸렸을 때 미션 3개를 모두 인증하면 그 땅을 가져오고,
        하나라도 놓치면 통행료만 내고 돌아옵니다. 타일 잠금 카드를 내 땅에 걸어두면 도전 한 번을 막아줍니다.
        {stat.topSido && stat.topSido.mine>0 && ` 지금 내 땅이 가장 많은 곳은 ${SIDO_FULL[stat.topSido.sido]||stat.topSido.sido}(${stat.topSido.mine}곳)입니다.`}
      </p>
    </div>
  );
}
