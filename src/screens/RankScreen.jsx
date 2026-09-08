/**
 * 랭킹 탭
 */
import React, { useMemo } from "react";
import { S } from "../ui/styles.js";
import { NATIONAL_ROOMS } from "../data/constants.js";

/* ───────── 랭킹 ───────── */
export function RankScreen({myRoomScore,myRoomRegions,room,memberCount}){
  const medal=["🥇","🥈","🥉"];
  const ranked = useMemo(()=>{
    const ours = { id:"mine", name: room?`우리 방 (${room.code})`:"나의 방", score:myRoomScore, regions:myRoomRegions, isMe:true, members:memberCount };
    const list=[...NATIONAL_ROOMS, ours];
    list.sort((a,b)=> b.score-a.score || b.regions-a.regions);
    let rank=0,pS=null,pR=null;
    return list.map((p,i)=>{ if(p.score!==pS||p.regions!==pR){ rank=i+1; pS=p.score; pR=p.regions; } return {...p,rank}; });
  },[myRoomScore,myRoomRegions,room,memberCount]);
  const me = ranked.find(p=>p.isMe);
  const top3 = ranked.slice(0,3);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={S.rankHero}>
        <p style={{fontSize:12,color:"var(--ink-soft)"}}>우리 방 전국 순위 {room?`· ${memberCount}명`:"· 솔로"}</p>
        <div style={{display:"flex",alignItems:"baseline",gap:5}}>
          <span style={{fontFamily:"'HiKR',sans-serif",fontSize:42,color:"var(--stamp)"}}>{me.rank}</span>
          <span style={{fontSize:17,fontWeight:800,color:"var(--ink)"}}>위</span>
          <span style={{marginLeft:"auto",fontSize:12,color:"var(--ink-soft)"}}>전체 {ranked.length}개 방 중</span>
        </div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <span style={S.rankMetric}>점수 합 <b style={{color:"var(--ink)"}}>{me.score}</b></span>
          <span style={S.rankMetric}>정복 합 <b style={{color:"var(--ink)"}}>{me.regions}곳</b></span>
        </div>
      </div>

      <div style={S.podium}>
        {[top3[1],top3[0],top3[2]].map((p,idx)=>{ if(!p) return <div key={idx} style={{flex:1}}/>;
          const h=p.rank===1?100:p.rank===2?78:62;
          return (<div key={p.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",gap:3}}>
            <div style={{fontSize:24}}>{medal[p.rank-1]}</div>
            <div style={{fontSize:11.5,fontWeight:800,color:p.isMe?"var(--stamp)":"var(--ink)",textAlign:"center",lineHeight:1.2}}>{p.name}</div>
            <div style={{...S.podBar,height:h,background:p.isMe?"var(--stamp)":p.rank===1?"var(--gold)":"var(--ink-soft)"}}>
              <span style={{fontFamily:"'HiKR',sans-serif",fontSize:18,color:"#fff"}}>{p.score}</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,.9)"}}>{p.regions}곳</span>
            </div>
          </div>);
        })}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {ranked.slice(0,5).map(p=><RankRow key={p.id} p={p} medal={medal}/>)}
        {me.rank>5 && (<><div style={{textAlign:"center",color:"var(--ink-soft)",fontSize:15,lineHeight:1}}>⋯</div><RankRow p={me} medal={medal}/></>)}
      </div>
      <p style={S.dataNote}>전국 랭킹은 방끼리 경쟁해요. 방 구성원들의 점수 합이 1순위, 동점이면 점령 지역 수 합으로 순위가 갈립니다.</p>
    </div>
  );
}

export function RankRow({p,medal}){
  return (<div style={{...S.rankRow, ...(p.isMe?{border:"1.5px solid var(--stamp)",background:"rgba(19,31,60,.06)"}:{})}}>
    <span style={{width:26,textAlign:"center",fontFamily:"'HiKR',sans-serif",fontSize:15,color:p.rank<=3?"var(--gold)":"var(--ink-soft)"}}>{p.rank<=3?medal[p.rank-1]:p.rank}</span>
    <span style={{fontSize:13.5,fontWeight:800,color:p.isMe?"var(--stamp)":"var(--ink)"}}>{p.name}</span>
    <span style={{marginLeft:"auto",fontFamily:"'HiKR',sans-serif",fontSize:16,color:"var(--ink)"}}>{p.score}</span>
    <span style={{fontSize:11,color:"var(--ink-soft)",width:42,textAlign:"right"}}>{p.regions}곳</span>
  </div>);
}
