/**
 * 친구 초대 — 링크 / 카카오톡 공유
 */
import React from "react";
import { inviteLink, loadKakaoShare, shareImage } from "../api/kakao.js";
import { S } from "../ui/styles.js";

export function ShareModal({ room, onClose, flash }){
  const code = room?.code || "";
  const link = inviteLink(code);
  function share(){
    if(typeof navigator!=="undefined" && navigator.share){ navigator.share({title:"대한민국 부루마블", text:`방 코드 ${code} 로 함께 전국을 점령해요!`, url:link}).catch(()=>{}); }
    else { try{ navigator.clipboard.writeText(link); }catch(e){} flash("초대 링크가 복사되었어요"); }
  }
  function copy(){ try{ navigator.clipboard.writeText(link); }catch(e){} flash("초대 링크 복사 완료 · 친구가 링크를 열면 코드가 자동으로 입력돼요"); }
  async function shareKakao(){
    try{
      const Kakao = await loadKakaoShare();
      if(!Kakao.Share || typeof Kakao.Share.sendDefault!=="function") throw new Error("공유 API를 사용할 수 없습니다 · Kakao Developers 콘솔에서 '카카오톡 공유'가 활성화돼 있는지 확인하세요");
      Kakao.Share.sendDefault({
        objectType:"feed",
        content:{
          title:"대한민국 부루마블",
          description:`${code} 방에 초대되었어요. 링크를 열면 초대 코드가 자동으로 입력돼요.`,
          imageUrl: shareImage(),
          imageWidth: 1200, imageHeight: 630,
          link:{ mobileWebUrl:link, webUrl:link },
        },
        buttons:[{ title:"코드 입력하고 참여하기", link:{ mobileWebUrl:link, webUrl:link } }],
      });
    }catch(e){
      // 흔한 원인: JavaScript 키의 "Web 플랫폼" 도메인에 현재 배포 주소가 등록돼 있지 않거나,
      // 카카오 개발자 콘솔에서 "카카오톡 공유" 제품이 활성화돼 있지 않은 경우입니다.
      flash("카카오톡 공유 실패 · " + ((e&&e.message)||e) + " · 대신 링크를 복사할게요");
      copy();
    }
  }
  return (
    <div style={S.modalScrim} onClick={onClose}><div style={S.sheet} onClick={e=>e.stopPropagation()} className="sheet-in">
      <div style={S.sheetGrab}/>
      <h3 style={{fontFamily:"'HiKR',sans-serif",fontSize:19,color:"var(--ink)",textAlign:"center"}}>친구 초대</h3>
      <p style={{fontSize:12.5,color:"var(--ink-soft)",textAlign:"center",margin:"4px 0 16px"}}>아래 링크나 코드를 친구에게 공유하세요</p>
      <div style={S.shareCode}><span style={{fontSize:11,color:"var(--ink-soft)"}}>방 코드</span><span style={{fontFamily:"'HiKR',sans-serif",fontSize:22,color:"var(--ink)",letterSpacing:1}}>{code}</span></div>
      <div style={S.shareLink}>{link}</div>
      <p style={{fontSize:11,color:"var(--ink-soft)",lineHeight:1.6,marginTop:6}}>이 링크로 들어오면 초대 코드가 자동으로 입력된 상태로 뜨고, 친구가 참여 버튼을 눌러야 방에 들어옵니다.</p>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={shareKakao} style={{...S.shareBtn,background:"#FEE500",color:"#191600"}}>💬 카카오톡으로 초대</button>
        <button onClick={copy} style={S.shareGhost}>링크 복사</button>
      </div>
      <button onClick={share} style={{...S.shareGhost,width:"100%",marginTop:8}}>📤 다른 앱으로 공유</button>
      <div style={S.shareTargets}>{["💬","✉️","🔗","📷"].map((ic,i)=><button key={i} onClick={share} style={S.shareTarget}>{ic}</button>)}</div>
      <button onClick={onClose} style={{...S.roomGhost,marginTop:8,width:"100%"}}>닫기</button>
    </div></div>
  );
}
