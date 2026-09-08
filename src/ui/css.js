/**
 * 전역 CSS — 웹폰트, 애니메이션, PC 레이아웃
 */
import hikrWoff2 from "../assets/fonts/HiKR-ExtraBold.woff2";

export const CSS = `
@font-face{font-family:'MiceGothic';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-01@1.0/MICEGothic.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'MiceGothic';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-01@1.0/MICEGothic%20Bold.woff2') format('woff2');font-weight:700;font-display:swap}
@font-face{font-family:'HiKR';src:url(${hikrWoff2}) format('woff2');font-weight:100 900;font-style:normal;font-display:swap}
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
