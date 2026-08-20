/**
 * 인라인 스타일 객체와 전역 CSS
 */
import hikrWoff2 from "../assets/fonts/HiKR-ExtraBold.woff2";
import hikrWoff from "../assets/fonts/HiKR-ExtraBold.woff";
/* ───────── 스타일 ───────── */
export const S = {
  root:{minHeight:"100vh",background:"#23304d",display:"flex",justifyContent:"center",alignItems:"flex-start",fontFamily:"'MiceGothic',system-ui,sans-serif"},
  phone:{position:"relative",width:"100%",maxWidth:440,minHeight:"100vh",background:"var(--paper)",display:"flex",flexDirection:"column",overflow:"hidden"},
  appbar:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",borderBottom:"1px solid var(--line)"},
  logoDie:{fontSize:22,color:"var(--ink)"}, wordmark:{fontFamily:"'HiKR',sans-serif",fontSize:16,color:"var(--ink)",letterSpacing:.3},
  coinPill:{background:"var(--ink)",color:"var(--paper)",fontSize:13,fontWeight:800,padding:"6px 12px",borderRadius:20},
  body:{flex:1,overflowY:"auto",padding:"18px 18px 92px"},
  tabbar:{position:"absolute",bottom:0,left:0,right:0,display:"flex",background:"var(--paper)",borderTop:"1px solid var(--line)",padding:"8px 0 10px"},
  tab:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",color:"var(--ink-soft)"}, tabOn:{color:"var(--ink)"},
  hello:{padding:"4px 2px 2px"}, section:{background:"var(--paper-2)",borderRadius:16,padding:"15px"},
  secTitle:{fontFamily:"'HiKR',sans-serif",fontSize:15,color:"var(--ink)"},
  chip:{padding:"9px 15px",borderRadius:20,border:"1.5px solid var(--line)",background:"var(--paper)",color:"var(--ink-soft)",fontSize:13.5,fontWeight:700,cursor:"pointer"},
  chipOn:{background:"var(--sea)",color:"#fff",border:"1.5px solid var(--sea)"},
  segBtn:{flex:1,padding:"11px 6px",borderRadius:12,border:"1.5px solid var(--line)",background:"var(--paper)",color:"var(--ink-soft)",fontSize:13,fontWeight:700,cursor:"pointer"},
  segOn:{background:"var(--ink)",color:"var(--paper)",border:"1.5px solid var(--ink)"},
  rollBtn:{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"var(--stamp)",color:"#fff",border:"none",borderRadius:18,padding:"18px",fontFamily:"'HiKR',sans-serif",fontSize:19,cursor:"pointer",boxShadow:"0 6px 0 var(--stamp-deep)",marginTop:4},
  rollCount:{fontFamily:"'MiceGothic',sans-serif",fontSize:12,fontWeight:700,background:"rgba(255,255,255,.22)",padding:"3px 9px",borderRadius:20},
  activeBanner:{display:"flex",alignItems:"center",gap:12,background:"var(--ink)",border:"none",borderRadius:16,padding:"12px 14px",cursor:"pointer",boxShadow:"0 6px 18px rgba(22,34,63,.25)"},
  activeThumb:{width:46,height:46,borderRadius:12,flexShrink:0},
  overlay:{position:"absolute",inset:0,background:"radial-gradient(120% 90% at 50% 0%, #1b2b4d 0%, #0d1730 70%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 22px",zIndex:30},
  olHint:{color:"var(--paper)",opacity:.8,marginTop:24,fontSize:14}, olSub:{color:"var(--paper)",opacity:.55,fontSize:12,marginTop:12,textAlign:"center"},
  envWrap:{position:"relative",width:"100%",perspective:"900px"},
  envBody:{position:"relative",background:"var(--paper)",borderRadius:14,padding:"84px 20px 22px",boxShadow:"0 24px 60px rgba(0,0,0,.5)",overflow:"hidden"},
  envFlap:{position:"absolute",top:0,left:0,right:0,height:50,borderRadius:"14px 14px 0 0",background:"var(--paper-2)",clipPath:"polygon(0 0,100% 0,50% 100%)",transformOrigin:"top center",zIndex:3},
  envSeal:{position:"absolute",top:24,left:"50%",marginLeft:-23,width:46,height:46,borderRadius:"50%",background:"var(--stamp)",color:"#fff",display:"grid",placeItems:"center",fontFamily:"'HiKR',sans-serif",fontSize:13,boxShadow:"0 4px 10px rgba(0,0,0,.3)",zIndex:5,border:"2px solid #fff"},
  envLabel:{fontSize:11,color:"var(--stamp)",fontWeight:800,letterSpacing:1,textAlign:"center"},
  envTitle:{fontFamily:"'HiKR',sans-serif",fontSize:21,color:"var(--ink)",textAlign:"center",margin:"6px 0 12px"},
  hintRow:{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}, hintChip:{fontSize:11.5,fontWeight:700,color:"var(--ink-soft)",background:"var(--paper-2)",padding:"5px 10px",borderRadius:20},
  relax:{fontSize:11.5,color:"var(--ink-soft)",textAlign:"center",marginTop:10},
  flash:{position:"absolute",inset:-40,background:"radial-gradient(circle at 50% 18%, rgba(255,245,210,.95), transparent 60%)",zIndex:4,pointerEvents:"none"},
  cardDrop:{display:"flex",alignItems:"center",gap:10,background:"rgba(227,169,44,.14)",border:"1px solid rgba(227,169,44,.5)",borderRadius:12,padding:"9px 13px",marginBottom:14,width:"fit-content",marginLeft:"auto",marginRight:"auto"},
  btnGhost:{flex:1,padding:"15px",borderRadius:14,border:"1.5px solid rgba(244,237,223,.4)",background:"transparent",color:"var(--paper)",fontSize:14,fontWeight:700,cursor:"pointer"},
  btnDepart:{flex:1.4,padding:"15px",borderRadius:14,border:"none",background:"var(--stamp)",color:"#fff",fontFamily:"'HiKR',sans-serif",fontSize:16,cursor:"pointer",boxShadow:"0 5px 0 var(--stamp-deep)"},
  destCard:{background:"var(--paper)",borderRadius:18,overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)"},
  destImg:{position:"relative",height:150,display:"flex",alignItems:"flex-end"}, destImgInner:{padding:"16px 18px",color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.4)",width:"100%"},
  destName:{fontFamily:"'HiKR',sans-serif",fontSize:27,marginTop:2,lineHeight:1.1},
  goldTag:{position:"absolute",top:12,right:12,background:"var(--gold)",color:"var(--ink)",fontSize:11,fontWeight:800,padding:"5px 10px",borderRadius:20,boxShadow:"0 3px 8px rgba(0,0,0,.25)"},
  ownBanner:{display:"flex",alignItems:"center",gap:10,borderRadius:12,padding:"10px 12px",marginBottom:12},
  exemptBtn:{background:"var(--paper-2)",border:"1.5px solid var(--line)",borderRadius:10,padding:"7px 10px",fontSize:11.5,fontWeight:800,color:"var(--ink-soft)",cursor:"pointer"},
  exemptOn:{background:"var(--gold)",color:"var(--ink)",border:"1.5px solid var(--gold)"},
  overview:{fontSize:13.5,lineHeight:1.6,color:"var(--ink-soft)"},
  metaRow:{display:"flex",gap:8,margin:"14px 0",padding:"12px 0",borderTop:"1px solid var(--line)",borderBottom:"1px solid var(--line)"},
  missionHead:{fontFamily:"'HiKR',sans-serif",fontSize:14,color:"var(--ink)",margin:"4px 0 10px"},
  mission:{display:"flex",alignItems:"center",gap:10,background:"var(--paper-2)",borderRadius:12,padding:"11px 13px"},
  missionTag:{flexShrink:0,whiteSpace:"nowrap",fontSize:10.5,fontWeight:800,color:"var(--sea)",background:"rgba(30,142,138,.12)",padding:"3px 7px",borderRadius:6},
  modalScrim:{position:"absolute",inset:0,background:"rgba(13,23,48,.55)",display:"flex",alignItems:"flex-end",zIndex:50},
  sheet:{background:"var(--paper)",width:"100%",maxHeight:"92%",overflowY:"auto",borderRadius:"22px 22px 0 0",padding:"10px 18px 22px",boxShadow:"0 -10px 40px rgba(0,0,0,.4)"},
  sheetGrab:{width:42,height:5,borderRadius:5,background:"var(--line)",margin:"0 auto 14px"},
  vCard:{background:"var(--paper-2)",borderRadius:14,padding:"12px 13px"}, vCardDone:{background:"rgba(30,142,138,.08)",border:"1px solid rgba(30,142,138,.3)"},
  reqBadge:{fontSize:10,fontWeight:800,color:"#fff",background:"var(--stamp)",padding:"2px 7px",borderRadius:6},
  vfScreen:{position:"absolute",inset:0,background:"var(--paper)",zIndex:55,display:"flex",flexDirection:"column"},
  vfHead:{padding:"16px 18px 12px",borderBottom:"1px solid var(--line)"},
  vfClose:{background:"none",border:"none",color:"var(--ink-soft)",fontSize:13,fontWeight:700,cursor:"pointer"},
  stepper:{display:"flex",alignItems:"center",marginTop:14},
  stepDot:{width:22,height:22,borderRadius:"50%",background:"var(--paper-2)",color:"var(--ink-soft)",fontSize:11,fontWeight:800,display:"grid",placeItems:"center",flexShrink:0},
  stepDotOn:{background:"var(--stamp)",color:"#fff"},
  vfBody:{flex:1,overflowY:"auto",padding:"16px 18px"},
  vfFoot:{padding:"12px 18px 18px",borderTop:"1px solid var(--line)",background:"var(--paper)"},
  vfPrimary:{width:"100%",padding:"16px",borderRadius:14,border:"none",background:"var(--stamp)",color:"#fff",fontFamily:"'HiKR',sans-serif",fontSize:16,cursor:"pointer",boxShadow:"0 5px 0 var(--stamp-deep)"},
  doneNote:{background:"rgba(30,142,138,.1)",border:"1px solid rgba(30,142,138,.3)",borderRadius:12,padding:"15px",textAlign:"center",fontSize:13.5,fontWeight:700,color:"var(--sea)"},
  resultBadge:{width:84,height:84,borderRadius:"50%",display:"grid",placeItems:"center",margin:"0 auto",fontSize:38,color:"#fff",boxShadow:"0 12px 30px rgba(0,0,0,.2)"},
  tally:{background:"var(--paper-2)",borderRadius:14,padding:"10px 16px",marginTop:18,textAlign:"left"},
  tallyDiv:{height:1,background:"var(--line)",margin:"6px 0"},
  vBtn:{background:"var(--ink)",color:"var(--paper)",border:"none",borderRadius:10,padding:"9px 13px",fontSize:12.5,fontWeight:700,cursor:"pointer",flexShrink:0},
  scanBox:{marginTop:10,display:"flex",alignItems:"center",gap:8,fontSize:12.5,fontWeight:700,color:"var(--ink-soft)",background:"var(--paper)",borderRadius:10,padding:"10px 12px"},
  receipt:{background:"#fff",border:"1px solid var(--line)",borderRadius:14,padding:"14px",marginTop:12,boxShadow:"0 8px 24px rgba(0,0,0,.08)"},
  acceptBtn:{width:"100%",padding:"12px",borderRadius:11,border:"none",background:"var(--sea)",color:"#fff",fontWeight:800,fontSize:13.5,cursor:"pointer"},
  conquerBtn:{width:"100%",marginTop:16,padding:"16px",borderRadius:14,border:"none",background:"var(--stamp)",color:"#fff",fontFamily:"'HiKR',sans-serif",fontSize:16,cursor:"pointer",boxShadow:"0 5px 0 var(--stamp-deep)"},
  laterBtn:{width:"100%",marginTop:8,padding:"12px",borderRadius:12,border:"none",background:"none",color:"var(--ink-soft)",fontSize:13,fontWeight:700,cursor:"pointer"},
  boardHead:{display:"flex",justifyContent:"space-between",alignItems:"flex-end",background:"var(--paper-2)",borderRadius:16,padding:"16px 18px"},
  viewSwitch:{display:"flex",gap:6,background:"var(--paper-2)",borderRadius:12,padding:4},
  viewBtn:{flex:1,padding:"10px",borderRadius:9,border:"none",background:"transparent",color:"var(--ink-soft)",fontSize:13,fontWeight:700,cursor:"pointer"},
  viewOn:{background:"var(--paper)",color:"var(--ink)",boxShadow:"0 2px 6px rgba(0,0,0,.08)"},
  mapCard:{background:"var(--paper-2)",borderRadius:18,padding:"10px 8px 8px"},
  selBar:{display:"flex",alignItems:"center",background:"var(--paper)",borderRadius:12,padding:"10px 13px",margin:"2px 6px 4px"},
  tileGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8},
  boardDark:{background:"#0C1326",borderRadius:18,padding:"16px 14px 18px"},
  boardTitle:{fontFamily:"'HiKR',sans-serif",fontSize:20,color:"#F2F5FB"},
  boardSub:{fontSize:12.5,color:"#8A93AD",marginTop:5},
  livePill:{display:"inline-flex",alignItems:"center",gap:6,border:"1px solid rgba(242,145,60,.55)",color:"#F2913C",fontSize:11.5,fontWeight:800,padding:"6px 12px",borderRadius:20,whiteSpace:"nowrap"},
  liveDot:{width:7,height:7,borderRadius:"50%",background:"#F2913C"},
  boardSido:{fontSize:15,fontWeight:800,color:"#ECF0F8"},
  boardCount:{fontSize:12,color:"#8A93AD"},
  bGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8},
  bTile:{position:"relative",borderRadius:14,padding:"12px 8px 10px",minHeight:96},
  bSun:{position:"absolute",top:7,left:8,fontSize:12},
  bBadge:{position:"absolute",top:7,right:7,color:"#fff",fontSize:9.5,fontWeight:800,padding:"2px 7px",borderRadius:8},
  bLive:{position:"absolute",top:7,right:7,color:"#fff",background:"#F2913C",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:8},
  codeInput:{flex:1,padding:"13px 14px",borderRadius:12,border:"1.5px solid var(--line)",background:"var(--paper)",color:"var(--ink)",fontSize:15,fontWeight:700,letterSpacing:1,outline:"none",fontFamily:"'MiceGothic',sans-serif"},
  tripCard:{background:"var(--paper)",border:"2px solid var(--stamp)",borderRadius:18,overflow:"hidden",boxShadow:"0 8px 24px rgba(19,31,60,.15)"},
  tripStatus:{display:"flex",alignItems:"center",gap:7,background:"var(--stamp)",color:"#fff",fontSize:12,fontWeight:800,padding:"8px 14px"},
  tripDot:{width:8,height:8,borderRadius:"50%",background:"#fff"},
  tripImg:{position:"relative",height:120,display:"flex",alignItems:"flex-end"},
  tripImgInner:{padding:"14px 16px",color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.4)",width:"100%"},
  tripMission:{display:"flex",alignItems:"center",gap:8,background:"var(--paper-2)",borderRadius:10,padding:"9px 11px"},
  tripTag:{fontSize:10,fontWeight:800,color:"var(--sea)",background:"rgba(30,142,138,.12)",padding:"2px 6px",borderRadius:5},
  tripPrimary:{width:"100%",padding:"15px",borderRadius:14,border:"none",background:"var(--stamp)",color:"#fff",fontFamily:"'HiKR',sans-serif",fontSize:15.5,cursor:"pointer",boxShadow:"0 5px 0 var(--stamp-deep)"},
  splash:{position:"absolute",inset:0,zIndex:80,display:"flex",flexDirection:"column",background:"radial-gradient(130% 85% at 50% 0%, #25406F 0%, #131F3C 52%, #0B1426 100%)"},
  splashEyebrow:{fontSize:12,fontWeight:800,color:"#FFE3B0",letterSpacing:1,marginBottom:12},
  splashTitle:{fontFamily:"'HiKR',sans-serif",fontSize:46,lineHeight:1,color:"#fff",letterSpacing:1},
  splashTitle2:{fontFamily:"'HiKR',sans-serif",fontSize:46,lineHeight:1.04,color:"#FFD23F",letterSpacing:1},
  splashSub:{fontSize:13,lineHeight:1.7,color:"rgba(255,255,255,.93)",maxWidth:300},
  splashBtn:{width:"100%",padding:"17px",borderRadius:16,border:"none",background:"#fff",color:"var(--stamp)",fontFamily:"'HiKR',sans-serif",fontSize:18,cursor:"pointer",boxShadow:"0 6px 0 rgba(0,0,0,.18)"},
  rankHero:{background:"var(--paper)",border:"1px solid var(--line)",borderRadius:16,padding:"16px 18px",boxShadow:"0 4px 16px rgba(22,34,63,.05)"},
  rankMetric:{flex:1,background:"var(--paper-2)",borderRadius:10,padding:"8px 12px",fontSize:12.5,color:"var(--ink-soft)",fontWeight:600},
  podium:{display:"flex",alignItems:"flex-end",gap:10,background:"var(--paper)",border:"1px solid var(--line)",borderRadius:16,padding:"16px 14px 0",minHeight:150},
  podBar:{width:"100%",borderRadius:"10px 10px 0 0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1},
  rankRow:{display:"flex",alignItems:"center",gap:10,background:"var(--paper)",border:"1px solid var(--line)",borderRadius:12,padding:"11px 13px"},
  moreBtn:{background:"var(--paper-2)",border:"1px solid var(--line)",borderRadius:20,padding:"5px 13px",fontSize:12,fontWeight:800,color:"var(--ink)",cursor:"pointer"},
  shareCode:{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"var(--paper-2)",borderRadius:14,padding:"14px"},
  shareBtn:{flex:2,padding:"14px",borderRadius:12,border:"none",background:"var(--stamp)",color:"#fff",fontFamily:"'HiKR',sans-serif",fontSize:15,cursor:"pointer"},
  shareGhost:{flex:1,padding:"14px",borderRadius:12,border:"1.5px solid var(--line)",background:"var(--paper)",color:"var(--ink)",fontSize:13,fontWeight:800,cursor:"pointer"},
  shareTargets:{display:"flex",justifyContent:"center",gap:12,margin:"16px 0 14px"},
  shareTarget:{width:46,height:46,borderRadius:"50%",border:"1px solid var(--line)",background:"var(--paper-2)",fontSize:20,cursor:"pointer"},
  shareDemo:{width:"100%",padding:"12px",borderRadius:12,border:"1px dashed var(--ink-soft)",background:"transparent",color:"var(--ink-soft)",fontSize:12.5,fontWeight:700,cursor:"pointer"},
  tile:{position:"relative",overflow:"hidden",background:"var(--paper-2)",border:"2px solid var(--line)",borderRadius:12,padding:"11px 12px",minHeight:62},
  legend:{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",padding:"2px 0"},
  roomCard:{background:"var(--paper-2)",borderRadius:16,padding:"16px"},
  roomPrimary:{flex:1,padding:"13px",borderRadius:12,border:"none",background:"var(--stamp)",color:"#fff",fontFamily:"'HiKR',sans-serif",fontSize:15,cursor:"pointer",boxShadow:"0 4px 0 var(--stamp-deep)"},
  roomGhost:{flex:1,padding:"13px",borderRadius:12,border:"1.5px solid var(--line)",background:"var(--paper)",color:"var(--ink)",fontSize:13.5,fontWeight:700,cursor:"pointer"},
  inviteBtn:{background:"var(--ink)",color:"var(--paper)",border:"none",borderRadius:10,padding:"9px 14px",fontSize:12.5,fontWeight:700,cursor:"pointer"},
  memberRow:{display:"flex",alignItems:"center",gap:10,background:"var(--paper)",borderRadius:10,padding:"9px 12px"},
  tripRow:{display:"flex",alignItems:"center",gap:8,padding:"11px 2px",borderBottom:"1px solid var(--line)"},
  profile:{display:"flex",alignItems:"center",gap:13,background:"var(--paper-2)",borderRadius:16,padding:"15px 16px"},
  avatar:{width:50,height:50,borderRadius:"50%",background:"var(--ink)",display:"grid",placeItems:"center",fontSize:22},
  statRow:{display:"flex",gap:8}, stat:{flex:1,background:"var(--paper-2)",borderRadius:14,padding:"15px 6px",textAlign:"center"},
  empty:{fontSize:12.5,color:"var(--ink-soft)",padding:"6px 2px"},
  collCard:{background:"var(--paper)",border:"1px solid var(--line)",borderRadius:12,overflow:"hidden"},
  collImg:{position:"relative",height:74,display:"flex",alignItems:"flex-start",padding:7},
  collType:{fontSize:10,fontWeight:800,color:"#fff",background:"rgba(0,0,0,.3)",padding:"3px 7px",borderRadius:8}, collGold:{position:"absolute",top:7,right:8,color:"var(--gold)",fontSize:14},
  invCard:{display:"flex",alignItems:"center",gap:12,background:"var(--paper)",border:"1.5px solid var(--line)",borderRadius:12,padding:"11px 13px"},
  dataNote:{fontSize:11,lineHeight:1.6,color:"var(--ink-soft)",background:"var(--paper-2)",borderRadius:12,padding:"12px 13px"},
  apiPill:{display:"inline-flex",alignItems:"center",gap:7,marginTop:9,fontSize:11.5,fontWeight:700,padding:"6px 11px",borderRadius:20,border:"1px solid var(--line)",background:"var(--paper-2)",color:"var(--ink-soft)",lineHeight:1.3},
  apiLabel:{fontSize:11.5,fontWeight:800,color:"var(--ink-soft)"},
  shareLink:{marginTop:8,padding:"10px 12px",borderRadius:10,background:"var(--paper-2)",border:"1px solid var(--line)",fontSize:11,color:"var(--ink-soft)",wordBreak:"break-all",lineHeight:1.5,fontFamily:"ui-monospace,SFMono-Regular,Menlo,monospace"},
  mapFallback:{width:"100%",borderRadius:14,border:"1px dashed var(--line)",background:"var(--paper-2)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,textAlign:"center",padding:"0 16px",fontSize:11.5,color:"var(--ink-soft)",lineHeight:1.5},
  routeBtn:{display:"block",textAlign:"center",marginTop:8,padding:"11px",borderRadius:12,background:"#FEE500",color:"#191600",fontSize:13,fontWeight:800,textDecoration:"none"},
  locFail:{marginTop:12,display:"flex",flexDirection:"column",gap:6,background:"rgba(242,145,60,.10)",border:"1px solid rgba(242,145,60,.45)",borderRadius:12,padding:"12px 13px",fontSize:12.5,color:"var(--ink-soft)",lineHeight:1.5},
  demoBtn:{marginTop:4,padding:"10px",borderRadius:10,border:"1px dashed var(--line)",background:"transparent",color:"var(--ink-soft)",fontSize:12,fontWeight:700,cursor:"pointer"},
  demoMini:{padding:"3px 9px",borderRadius:8,border:"1px dashed var(--line)",background:"transparent",color:"var(--ink-soft)",fontSize:10.5,fontWeight:700,cursor:"pointer"},
  apiInput:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:10,border:"1.5px solid var(--line)",background:"var(--paper)",color:"var(--ink)",fontSize:12,fontFamily:"ui-monospace,SFMono-Regular,Menlo,monospace"},
  apiBtn:{padding:"11px",borderRadius:12,border:"none",background:"var(--ink)",color:"var(--paper)",fontSize:13,fontWeight:800,cursor:"pointer"},
  reset:{background:"none",border:"1.5px solid var(--line)",borderRadius:12,padding:"12px",color:"var(--ink-soft)",fontSize:13,fontWeight:700,cursor:"pointer"},
  toast:{position:"absolute",bottom:84,left:"50%",transform:"translateX(-50%)",background:"var(--ink)",color:"var(--paper)",fontSize:13,fontWeight:700,padding:"11px 18px",borderRadius:24,boxShadow:"0 8px 24px rgba(0,0,0,.3)",zIndex:60,whiteSpace:"nowrap"},
};

export const CSS = `
@font-face{font-family:'MiceGothic';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-01@1.0/MICEGothic.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'MiceGothic';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-01@1.0/MICEGothic%20Bold.woff2') format('woff2');font-weight:700;font-display:swap}
@font-face{font-family:'HiKR';src:url(${hikrWoff2}) format('woff2'),url(${hikrWoff}) format('woff');font-weight:100 900;font-style:normal;font-display:swap}
:root{--paper:#F4EDDF;--paper-2:#EAE0CB;--ink:#16223F;--ink-soft:#5A668A;--stamp:#131F3C;--stamp-deep:#0B1426;--me:#2EB872;--live:#F2913C;--gold:#E3A92C;--sea:#1E8E8A;--line:rgba(22,34,63,.13);}
*{box-sizing:border-box;margin:0;-webkit-tap-highlight-color:transparent}
html,body,#root{font-family:'MiceGothic',system-ui,sans-serif}
button,input,select,textarea{font-family:inherit}
button:focus-visible{outline:2.5px solid var(--ink);outline-offset:2px}
.scroll::-webkit-scrollbar,.sheet::-webkit-scrollbar{width:0}
.range{-webkit-appearance:none;height:6px;border-radius:6px;background:var(--paper);outline:none}
.range::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:var(--stamp);cursor:pointer;box-shadow:0 3px 8px rgba(19,31,60,.4);border:3px solid #fff}
.range::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:var(--stamp);border:3px solid #fff;cursor:pointer}
@keyframes shake{0%,100%{transform:rotate(-14deg) translateY(0)}25%{transform:rotate(12deg) translateY(-10px)}50%{transform:rotate(-8deg) translateY(4px)}75%{transform:rotate(10deg) translateY(-6px)}}
.die-shake{display:inline-block;animation:shake .28s linear infinite}
@keyframes spink{to{transform:rotate(360deg)}}.spin{display:inline-block;animation:spink .8s linear infinite}
@keyframes olin{from{opacity:0}to{opacity:1}}.overlay-in{animation:olin .25s ease}
@keyframes popin{from{opacity:0;transform:scale(.9) translateY(14px)}to{opacity:1;transform:none}}.pop-in{animation:popin .4s cubic-bezier(.2,.9,.3,1.2)}
@keyframes revealin{0%{opacity:0;transform:translateY(26px) scale(.96)}100%{opacity:1;transform:none}}.reveal-in{animation:revealin .5s cubic-bezier(.2,.9,.3,1.1)}
@keyframes carddrop{0%{opacity:0;transform:translateY(-20px) rotate(-6deg)}100%{opacity:1;transform:none}}.card-drop{animation:carddrop .5s ease}
@keyframes flapopen{0%{transform:rotateX(0deg)}18%{transform:rotateX(6deg)}70%{transform:rotateX(-158deg)}100%{transform:rotateX(-170deg)}}.flap-open{animation:flapopen 1.05s cubic-bezier(.34,.02,.2,1) forwards}
@keyframes sealcrack{0%{transform:scale(1);opacity:1;filter:blur(0)}35%{transform:scale(1.16);opacity:1;filter:blur(0)}100%{transform:scale(.45);opacity:0;filter:blur(7px)}}.seal-crack{animation:sealcrack .85s cubic-bezier(.3,0,.2,1) forwards}
@keyframes flashk{0%{opacity:0;transform:scale(.55)}45%{opacity:.9;transform:scale(1.05)}100%{opacity:0;transform:scale(1.75)}}.flash{animation:flashk 1.8s cubic-bezier(.2,.7,.3,1) forwards;animation-delay:.3s}
@keyframes burstk{0%{opacity:0;transform:translate(-50%,0) scale(.2) rotate(0deg)}18%{opacity:1;transform:translate(calc(-50% + var(--tx)*.25),calc(var(--ty)*.25)) scale(1) rotate(40deg)}100%{opacity:0;transform:translate(calc(-50% + var(--tx)),var(--ty)) scale(.15) rotate(200deg)}}.burst{animation:burstk 1.6s cubic-bezier(.15,.6,.3,1) forwards}
@keyframes ringk{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}25%{opacity:.55}100%{opacity:0;transform:translate(-50%,-50%) scale(2.4)}}.magic-ring{animation:ringk 1.5s cubic-bezier(.2,.7,.3,1) forwards;animation-delay:.32s}
@keyframes sheetin{from{transform:translateY(40px);opacity:.6}to{transform:none;opacity:1}}.sheet-in{animation:sheetin .3s cubic-bezier(.2,.9,.3,1)}
@keyframes toastin{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}.toast-in{animation:toastin .25s ease}
@keyframes mapblinkk{0%,100%{fill:#fff}50%{fill:#FCE2C2}}
.mapBlink{animation:mapblinkk 1.1s ease-in-out infinite}
@keyframes tileblinkk{0%,100%{box-shadow:0 0 0 0 rgba(242,145,60,.6)}50%{box-shadow:0 0 0 5px rgba(242,145,60,.18)}}
.tileBlink{animation:tileblinkk 1.1s ease-in-out infinite}
@keyframes blinkdot{0%,100%{opacity:1}50%{opacity:.2}}
.blink-dot{animation:blinkdot 1s ease-in-out infinite}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important}}
/* ── PC 웹 레이아웃 (1024px 이상) ── 모바일은 기존 세로형 유지 */
@media(min-width:1024px){
  /* 앱 액자 제거 — 일반 웹사이트처럼 화면 전체를 씀 */
  .app-root{
    background:var(--paper)!important;
    align-items:stretch!important;padding:0!important;display:block!important;
  }
  .app-shell{
    max-width:none!important;width:100%!important;
    height:auto!important;min-height:100vh!important;
    border-radius:0!important;box-shadow:none!important;overflow:visible!important;
  }
  /* 헤더·탭은 넓게, 본문은 조금 좁게 잡아 글줄이 늘어지지 않게 */
  .app-bar,.app-nav{
    padding-left:max(28px,calc((100% - 1120px)/2))!important;
    padding-right:max(28px,calc((100% - 1120px)/2))!important;
  }
  .app-body{
    padding:44px 24px 90px!important;
    flex:none!important;overflow:visible!important;
  }
  /* zoom 으로 글씨·요소를 20% 키우고 폭은 좁혀 세로로 길어지게 */
  .app-body > *{max-width:520px;margin:0 auto;zoom:1.2}
  /* DOM 순서상 탭이 본문 뒤에 있어 아래로 내려가므로 순서를 재지정 */
  .app-bar{order:1}
  .app-nav{order:2}
  .app-body{order:3}
  .app-bar{
    position:sticky;top:0;z-index:95;
    height:74px;box-sizing:border-box;
    padding-top:0!important;padding-bottom:0!important;
    background:var(--paper);border-bottom:none!important;
  }
  .app-nav{
    position:sticky!important;top:74px;z-index:94;
    justify-content:center!important;
    padding:0 24px!important;gap:8px;
    border-top:none!important;border-bottom:1px solid var(--line);
    background:var(--paper)!important;
  }
  .app-nav button{
    flex:0 0 auto!important;flex-direction:row!important;
    align-items:center!important;gap:9px!important;
    padding:16px 18px 14px;border-bottom:3px solid transparent;
  }
  .app-nav button span:first-child{font-size:21px!important}
  .app-nav button span:last-child{font-size:15px!important}
  .app-nav button:hover{background:rgba(22,34,63,.04)}

  /* 시작 화면 — 버튼이 화면 폭만큼 늘어나지 않도록 */
  .app-splash{position:fixed!important}
  .app-splash > div{max-width:520px;width:100%;margin:0 auto}
  .app-splash > div:last-child{padding-bottom:56px!important}

  /* 전체를 덮는 화면들 — 상단 로고·탭 아래에서 시작 */
  .app-shell > .overlay-in{position:fixed!important}
  .app-overlay{top:0!important;z-index:130!important}
  .app-verify{top:127px!important}
  .app-overlay{
    justify-content:flex-start!important;overflow-y:auto!important;
    padding:36px 24px!important;
  }
  /* margin:auto — 내용이 짧으면 세로 가운데, 길면 위에서부터 스크롤 */
  .app-overlay > *{width:100%;max-width:430px;margin:auto;flex:0 0 auto;zoom:1.2}
  .app-verify > *{width:100%;max-width:430px;margin-left:auto!important;margin-right:auto!important;zoom:1.2}
}

`;
