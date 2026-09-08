import { useState } from "react";
import { createInvite } from "../api/invite";
import { getAnonUserId, getAnonUserName, setAnonUserName } from "../utils/anonUser";

export default function InviteButton() {
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState(null);

  // 닉네임이 없으면 물어보고 저장 (최초 1회만)
  function ensureUserName() {
    let name = getAnonUserName();
    if (!name) {
      const input = window.prompt("초대장에 표시할 닉네임을 입력해주세요");
      name = setAnonUserName(input || "여행자");
    }
    return name;
  }

  // 초대 생성 (버튼 최초 클릭 시 1회, 이후엔 캐시된 링크 재사용)
  async function ensureInvite() {
    if (inviteUrl) return inviteUrl;
    setLoading(true);
    try {
      const userId = getAnonUserId();
      const userName = ensureUserName();
      const { inviteUrl: url } = await createInvite(userId, userName);
      setInviteUrl(url);
      return url;
    } finally {
      setLoading(false);
    }
  }

  async function shareToKakao() {
    const url = await ensureInvite();
    const userName = getAnonUserName();

    if (!window.Kakao) {
      alert("카카오 SDK 로딩에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "팔도정복에서 같이 여행해요!",
        description: `${userName}님이 초대장을 보냈어요`,
        imageUrl: `${window.location.origin}/og-image.png`,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        { title: "초대 수락하기", link: { mobileWebUrl: url, webUrl: url } },
      ],
    });
  }

  async function shareNative() {
    const url = await ensureInvite();
    const userName = getAnonUserName();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "팔도정복 친구 초대",
          text: `${userName}님이 같이 여행 게임 하자고 초대했어요!`,
          url,
        });
      } catch {
        // 사용자가 공유 취소 - 별도 처리 불필요
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었어요!");
    }
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={shareToKakao} disabled={loading}>
        카카오톡으로 초대
      </button>
      <button onClick={shareNative} disabled={loading}>
        다른 앱으로 공유
      </button>
    </div>
  );
}