  import { useEffect, useState } from "react";
import { getInviteByCode, acceptInvite } from "../api/invite";
import { getAnonUserId, getAnonUserName, setAnonUserName } from "../utils/anonUser";

/**
 * URL 예: https://사이트주소/invite/ABC12345
 * 이 컴포넌트는 code를 URL에서 직접 파싱해서 동작 (라우터 라이브러리 불필요)
 */
export default function InviteAccept({ onDone }) {
  const [status, setStatus] = useState("loading"); // loading | ready | accepted | error | self | already
  const [invite, setInvite] = useState(null);
  const [message, setMessage] = useState("");

  const code = window.location.pathname.split("/invite/")[1];

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setMessage("잘못된 초대 링크예요.");
      return;
    }

    getInviteByCode(code)
      .then((data) => {
        if (!data) {
          setStatus("error");
          setMessage("존재하지 않는 초대예요. 링크를 다시 확인해주세요.");
          return;
        }
        if (data.status === "accepted") {
          setStatus("already");
          setMessage("이미 수락된 초대예요.");
          return;
        }
        setInvite(data);
        setStatus("ready");
      })
      .catch(() => {
        setStatus("error");
        setMessage("초대 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      });
  }, [code]);

  async function handleAccept() {
    const myId = getAnonUserId();

    if (invite.inviterId === myId) {
      setStatus("self");
      setMessage("본인이 만든 초대는 수락할 수 없어요.");
      return;
    }

    let myName = getAnonUserName();
    if (!myName) {
      const input = window.prompt("초대 수락 전, 사용할 닉네임을 입력해주세요");
      myName = setAnonUserName(input || "여행자");
    }

    setStatus("loading");
    try {
      await acceptInvite(invite.id, myId);
      setStatus("accepted");
      setMessage(`${invite.inviterName}님의 초대를 수락했어요!`);
    } catch (e) {
      setStatus("error");
      setMessage(String((e && e.message) || e));
    }
  }

  function goHome() {
    // 라우터 없이 홈으로: 경로 정리 후 앱 재진입
    window.history.replaceState({}, "", "/");
    if (onDone) onDone();
    else window.location.href = "/";
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center",
    }}>
      {status === "loading" && <p>초대 정보를 확인하는 중이에요...</p>}

      {status === "ready" && (
        <>
          <h2 style={{ fontWeight: 800 }}>{invite.inviterName}님이 초대했어요</h2>
          <p>팔도정복에서 같이 여행을 시작해볼까요?</p>
          <button onClick={handleAccept} style={{ padding: "12px 24px", fontWeight: 700 }}>
            초대 수락하기
          </button>
        </>
      )}

      {status === "accepted" && (
        <>
          <p style={{ fontWeight: 700 }}>{message}</p>
          <button onClick={goHome} style={{ padding: "12px 24px" }}>시작하기</button>
        </>
      )}

      {(status === "error" || status === "self" || status === "already") && (
        <>
          <p style={{ fontWeight: 700 }}>{message}</p>
          <button onClick={goHome} style={{ padding: "12px 24px" }}>홈으로 가기</button>
        </>
      )}
    </div>
  );
}
