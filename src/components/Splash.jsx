import React from "react";
import { S } from "../styles/styles.js";

export function Splash({onStart}){
  return (
    <div style={S.splash}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 26px",textAlign:"center"}}>
        <span style={S.splashEyebrow}>주사위로 떠나는 랜덤 국내여행</span>
        <h1 style={S.splashTitle}>대한민국</h1>
        <h1 style={S.splashTitle2}>대한민국</h1>
        <div style={{margin:"20px 0 16px"}}><SplashArt/></div>
        <p style={S.splashSub}>주사위를 굴리면 목적지가 봉투에 담겨 배정돼요. 현장에서 인증해 전국을 점령하고, 소멸 위기 지역은 2배 점수 황금 타일로 차지하세요.</p>
      </div>
      <div style={{padding:"0 26px 30px"}}>
        <button onClick={onStart} style={S.splashBtn}>여행 시작 🧳</button>
        <p style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,.72)",marginTop:12}}>전국 시·군·구 땅따먹기</p>
      </div>
    </div>
  );
}
export function SplashArt(){
  return (
    <svg width="200" height="148" viewBox="0 0 200 148">
      <path d="M100 8 L108 42 L142 32 L116 56 L150 72 L112 72 L120 112 L100 82 L80 112 L88 72 L50 72 L84 56 L58 32 L92 42 Z" fill="#FFD23F" opacity="0.22"/>
      <g transform="translate(38,54) rotate(-8)">
        <rect width="64" height="46" rx="6" fill="#F4EDDF"/>
        <path d="M0 4 L64 4 L32 30 Z" fill="#E2D6BC"/>
        <circle cx="32" cy="17" r="11" fill="#131F3C"/>
        <text x="32" y="21" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">출발</text>
      </g>
      <g transform="translate(112,58) rotate(10)">
        <rect width="48" height="48" rx="11" fill="#fff"/>
        <circle cx="14" cy="14" r="5" fill="#16223F"/><circle cx="34" cy="14" r="5" fill="#16223F"/>
        <circle cx="24" cy="24" r="5" fill="#16223F"/>
        <circle cx="14" cy="34" r="5" fill="#16223F"/><circle cx="34" cy="34" r="5" fill="#16223F"/>
      </g>
      <g transform="translate(150,28)">
        <path d="M12 0 C5 0 0 5 0 12 C0 21 12 32 12 32 C12 32 24 21 24 12 C24 5 19 0 12 0 Z" fill="#1E8E8A"/>
        <circle cx="12" cy="12" r="4.5" fill="#fff"/>
      </g>
      <g fill="#FFE08A">
        <path d="M28 22 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"/>
        <path d="M176 92 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"/>
      </g>
    </svg>
  );
}

