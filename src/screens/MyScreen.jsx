/**
 * 마이 탭 — 인증 카드와 API 연동 패널
 */
import React, { useState } from "react";
import { KAKAO_CFG, kakaoRegionOf, loadKakaoSdk } from "../api/kakao.js";
import { TOUR_CFG, tourCache, tourGet } from "../api/tourApi.js";
import { APP_VERSION, PERSONAL_CARD_WHEN_LABEL } from "../data/constants.js";
import { stripTags } from "../lib/text.js";
import { Section, Stat } from "../ui/primitives.jsx";
import { S } from "../ui/styles.js";

const COLL_ICON = { "영수증":"🧾", "인증샷":"📷", "면제":"🧳" };

/* ───────── 마이페이지 ───────── */
export function MyScreen({score,coins,inventory,roomCards=[],ownedCount,trips,cards,room,resetDemo,apiStatus,origin,openCard,bonusActive,rushCharges,boostIgnoreDist,boostAdjacent}){
  const [showAllCards,setShowAllCards] = useState(false);
  const shownCards = showAllCards ? cards : cards.slice(0,4);
  return (<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={S.profile}><div style={S.avatar}>👤</div><div><p style={{fontFamily:"'HiKR',sans-serif",fontSize:18,color:"var(--ink)"}}>여행자 #0427</p><p style={{fontSize:12,color:"var(--ink-soft)"}}>{origin?.label||"출발 지역 미설정"} · {room?`방 ${room.code}`:"솔로 플레이"}</p></div></div>
    <div style={S.statRow}><Stat k="점령 점수" v={score} c="var(--stamp)"/><Stat k="여행 코인" v={coins} c="var(--gold)"/><Stat k="정복 지역" v={ownedCount} c="var(--sea)"/></div>
    <div style={S.section}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8}}><h3 style={S.secTitle}>인증 카드</h3><span style={{fontSize:11.5,color:"var(--ink-soft)"}}>{cards.length}장</span></div>
        {cards.length>=5 && <button onClick={()=>setShowAllCards(v=>!v)} style={S.moreBtn}>{showAllCards?"접기":"더보기"}</button>}
      </div>
      {cards.length===0 ? <p style={S.empty}>도착 인증을 완료하면 인증샷·영수증 카드가 쌓여요.</p> :
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{shownCards.map((c,i)=>(<div key={i} style={S.collCard}><div style={{...S.collImg,background:`linear-gradient(135deg,${c.grad[0]},${c.grad[1]})`}}><span style={S.collType}>{COLL_ICON[c.type]||"📷"} {c.type}</span>{c.depop && <span style={S.collGold}>★</span>}</div><div style={{padding:"8px 9px"}}><div style={{fontSize:12,fontWeight:800,color:"var(--ink)",lineHeight:1.2}}>{c.title}</div><div style={{fontSize:10.5,color:"var(--ink-soft)",marginTop:2}}>{c.place}</div></div></div>))}</div>}
    </div>
    <Section title="개인 카드" sub={`${inventory.length}장`}>
      {(bonusActive || rushCharges>0 || boostIgnoreDist || boostAdjacent) && (
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {boostIgnoreDist && <span style={S.cardTag}>📍 다음 주사위 거리 무시 예약됨</span>}
          {boostAdjacent && <span style={S.cardTag}>🧭 다음 주사위 인접 지역 예약됨</span>}
          {bonusActive && <span style={S.cardTag}>⭐ 다음 점령 보너스 적용 예정</span>}
          {rushCharges>0 && <span style={S.cardTag}>🔥 여행 러시 {rushCharges}회 대기 중</span>}
        </div>
      )}
      {inventory.length===0 ? <p style={S.empty}>주사위를 굴리면 가끔 개인 카드가 떨어져요.</p> :
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{inventory.map((c,i)=>(
          <div key={i} style={S.cardRow}>
            <span style={{fontSize:22}}>{c.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,fontWeight:800,color:"var(--ink)"}}>{c.name}</div>
              <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{c.desc}</div>
              <div style={{marginTop:3}}><span style={S.cardTag}>{PERSONAL_CARD_WHEN_LABEL[c.when]||"사용"}</span></div>
            </div>
            <button onClick={()=>openCard(c,"personal")} style={S.cardActBtn}>사용</button>
          </div>
        ))}</div>}
    </Section>
    {(room || roomCards.length>0) && (
      <Section title="방 카드" sub={`${roomCards.length}장`}>
        {roomCards.length===0 ? <p style={S.empty}>방 안에서 주사위를 굴리면 가끔 방 카드가 떨어져요.</p> :
          <div style={{display:"flex",flexDirection:"column",gap:8}}>{roomCards.map((c,i)=>(
            <div key={i} style={S.cardRow}>
              <span style={{fontSize:22}}>{c.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13.5,fontWeight:800,color:"var(--ink)"}}>{c.name}</div>
                <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{c.desc}</div>
              </div>
              <button onClick={()=>openCard(c,"room")} style={S.cardActBtn}>사용</button>
            </div>
          ))}</div>}
      </Section>
    )}
    <Section title="여행 기록" sub={`${trips.length}회`}>
      {trips.length===0 ? <p style={S.empty}>첫 여행을 시작해 보세요.</p> :
        trips.map((t,i)=>(<div key={i} style={S.tripRow}><span style={{width:8,height:8,borderRadius:"50%",background:t.outcome==="conquer"?(t.depop?"var(--gold)":"var(--stamp)"):t.outcome==="toll"?"var(--ink-soft)":"var(--sea)"}}/><span style={{fontSize:13.5,fontWeight:700,color:"var(--ink)"}}>{t.title}</span><span style={{fontSize:12,color:"var(--ink-soft)"}}>{t.sido} {t.sigungu}</span><span style={{marginLeft:"auto",fontSize:11.5,color:"var(--ink-soft)"}}>{t.verified}/3 · +{t.score}</span></div>))}
    </Section>
    <ApiPanel apiStatus={apiStatus} origin={origin}/>
    <p style={S.dataNote}>ⓘ 지도는 실제 행정구역 경계(시·군·구) 데이터입니다. 목적지·미션·대표이미지는 한국관광공사 TourAPI 4.0(KorService2)에서 실시간 조회하며, 호출 실패 시 내장 샘플로 자동 폴백합니다. 도착 인증은 단말 GPS와 카카오 Local API(coord2regioncode)를 대조하고, 지도·길찾기는 카카오맵 SDK를 씁니다. 영수증 이미지 판독(OCR)과 국세청 사업자 진위 확인은 모의 동작이며, 상호 존재 확인만 카카오 로컬 검색으로 실제 조회합니다.</p>
    <button onClick={resetDemo} style={S.reset}>데모 초기화</button>
  </div>);
}

export function ApiPanel({apiStatus,origin}){
  const [open,setOpen] = useState(false);
  const [keyDraft,setKeyDraft] = useState(TOUR_CFG.key);
  const [proxyDraft,setProxyDraft] = useState(TOUR_CFG.proxy);
  const [testing,setTesting] = useState(false);
  const [testMsg,setTestMsg] = useState("");
  const [kOpen,setKOpen] = useState(false);
  const [kJs,setKJs] = useState(KAKAO_CFG.js);
  const [kRest,setKRest] = useState(KAKAO_CFG.rest);
  const [kProxy,setKProxy] = useState(KAKAO_CFG.proxy);
  const [kTesting,setKTesting] = useState(false);
  const [kMsg,setKMsg] = useState("");
  async function runKakaoTest(){
    setKTesting(true); setKMsg("");
    KAKAO_CFG.js = kJs.trim(); KAKAO_CFG.rest = kRest.trim(); KAKAO_CFG.proxy = kProxy.trim();
    resetKakaoSdkCache();
    const lines = [];
    try{ await loadKakaoSdk(); lines.push("✅ Maps SDK 로드 성공"); }
    catch(e){ lines.push("❌ Maps SDK · " + ((e&&e.message)||e)); }
    try{ const r = await kakaoRegionOf(37.5665,126.9780); lines.push("✅ Local REST 성공 · 서울시청 → " + r.full); }
    catch(e){ lines.push("❌ Local REST · " + ((e&&e.message)||e)); }
    setKMsg(lines.join("\n")); setKTesting(false);
  }
  async function runTest(){
    setTesting(true); setTestMsg("");
    TOUR_CFG.key = keyDraft.trim(); TOUR_CFG.proxy = proxyDraft.trim(); tourCache.clear();
    try{
      const items = await tourGet("areaBasedList2",{areaCode:"32",contentTypeId:"12",numOfRows:"1",pageNo:"1",arrange:"O"});
      setTestMsg(items.length ? ("연결 성공 · 응답 예시 「"+stripTags(items[0].title)+"」") : "응답은 정상이나 결과가 0건입니다");
    }catch(e){ setTestMsg("연결 실패 · "+((e&&e.message)||e)); }
    setTesting(false);
  }
  const dotColor = apiStatus.mode==="live"?"#2EB872":apiStatus.mode==="sample"?"var(--gold)":"var(--line)";
  return (<div style={S.section}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <h3 style={S.secTitle}>TourAPI 연동</h3>
      <button onClick={()=>setOpen(v=>!v)} style={S.moreBtn}>{open?"접기":"설정"}</button>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
      <span style={{width:8,height:8,borderRadius:"50%",background:dotColor,flexShrink:0}}/>
      <span style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>
        {apiStatus.mode==="live"?"실시간 연결됨":apiStatus.mode==="sample"?"샘플 폴백 중":"대기 중"}
      </span>
      <span style={{marginLeft:"auto",fontSize:11.5,color:"var(--ink-soft)"}}>KorService2 · {APP_VERSION}</span>
    </div>
    {apiStatus.msg && <p style={{fontSize:11.5,color:"var(--ink-soft)",lineHeight:1.5}}>사유: {apiStatus.msg}</p>}
    <p style={{fontSize:11.5,color:"var(--ink-soft)",lineHeight:1.5,marginTop:2}}>기준 좌표: {origin.label} ({origin.lat.toFixed(4)}, {origin.lng.toFixed(4)})</p>
    {open && (<div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
      <label style={S.apiLabel}>일반 인증키 (data.go.kr)</label>
      <input value={keyDraft} onChange={e=>setKeyDraft(e.target.value)} placeholder="serviceKey" style={S.apiInput}/>
      <label style={S.apiLabel}>CORS 프록시 prefix (선택)</label>
      <input value={proxyDraft} onChange={e=>setProxyDraft(e.target.value)} placeholder="예: https://내서버/proxy?url=" style={S.apiInput}/>
      <button onClick={runTest} disabled={testing} style={{...S.apiBtn,opacity:testing?.6:1}}>{testing?"확인 중…":"연결 테스트"}</button>
      {testMsg && <p style={{fontSize:12,color:"var(--ink)",lineHeight:1.5}}>{testMsg}</p>}
      <p style={{fontSize:11,color:"var(--ink-soft)",lineHeight:1.6}}>브라우저에서 apis.data.go.kr을 직접 호출하면 CORS로 차단될 수 있습니다. 실제 배포 시에는 인증키를 서버에 두고 자체 프록시를 경유하세요.</p>
    </div>)}

    <div style={{height:1,background:"var(--line)",margin:"14px 0"}}/>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
      <h3 style={S.secTitle}>카카오 연동</h3>
      <button onClick={()=>setKOpen(v=>!v)} style={S.moreBtn}>{kOpen?"접기":"설정"}</button>
    </div>
    <p style={{fontSize:11.5,color:"var(--ink-soft)",lineHeight:1.6}}>지도·마커·길찾기(Maps SDK), 도착 인증 행정구역 대조와 상호 확인(Local REST), 친구 초대 공유(JS SDK)에 사용합니다.</p>
    <p style={{fontSize:11.5,color:"var(--ink-soft)",lineHeight:1.7,marginTop:6,fontFamily:"ui-monospace,SFMono-Regular,Menlo,monospace"}}>
      빌드 {APP_VERSION} · 실행 도메인 {typeof window!=="undefined" ? window.location.origin : "-"}<br/>
      JS 키 {keyState(KAKAO_CFG.js)} · REST 키 {keyState(KAKAO_CFG.rest)} · TourAPI 키 {keyState(TOUR_CFG.key)}
    </p>
    {kOpen && (<div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
      <label style={S.apiLabel}>JavaScript 키</label>
      <input value={kJs} onChange={e=>setKJs(e.target.value)} style={S.apiInput}/>
      <label style={S.apiLabel}>REST API 키</label>
      <input value={kRest} onChange={e=>setKRest(e.target.value)} style={S.apiInput}/>
      <label style={S.apiLabel}>REST 프록시 prefix (선택)</label>
      <input value={kProxy} onChange={e=>setKProxy(e.target.value)} placeholder="예: https://내서버/kakao?url=" style={S.apiInput}/>
      <button onClick={runKakaoTest} disabled={kTesting} style={{...S.apiBtn,opacity:kTesting?.6:1}}>{kTesting?"확인 중…":"연결 테스트"}</button>
      {kMsg && <p style={{fontSize:12,color:"var(--ink)",lineHeight:1.6,whiteSpace:"pre-line"}}>{kMsg}</p>}
      <p style={{fontSize:11,color:"var(--ink-soft)",lineHeight:1.6}}>· Maps/JS SDK는 카카오 개발자 콘솔 &gt; 플랫폼 &gt; Web 에 현재 도메인이 등록돼 있어야 동작합니다.<br/>· REST 키는 원래 서버 보관용입니다. 배포 시에는 키를 서버에 두고 위 프록시를 경유하세요.<br/>· 네이티브 앱 키({KAKAO_CFG.native.slice(0,6)}…)는 iOS/Android 빌드 시 사용합니다.</p>
    </div>)}
  </div>);
}

export function keyState(v){ return v ? (v.slice(0,6) + "…" + v.length + "자") : "미설정"; }
