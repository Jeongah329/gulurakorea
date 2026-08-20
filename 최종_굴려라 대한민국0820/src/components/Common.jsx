import React from "react";
import { S } from "../styles/styles.js";

export function Row({k,v,hi}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0"}}><span style={{fontSize:13,color:"var(--ink-soft)"}}>{k}</span><span style={{fontFamily:hi?"'HiKR',sans-serif":"'MiceGothic',sans-serif",fontSize:hi?19:14,fontWeight:hi?400:700,color:hi?"var(--stamp)":"var(--ink)"}}>{v}</span></div>;}
export function Chk({ok,t}){return <span style={{display:"flex",alignItems:"center",gap:4,fontSize:11.5,fontWeight:700,color:ok?"var(--sea)":"var(--ink-soft)",background:ok?"rgba(30,142,138,.1)":"var(--paper-2)",padding:"4px 9px",borderRadius:8}}>{ok?"✓":"–"} {t}</span>;}
