/**
 * 로그인 안내 시트 — 방 만들기·참여, 명예의 전당에서 로그인을 요구할 때 띄운다.
 */
import React, { useState } from "react";
import { signInGoogle } from "../api/auth.js";
import { S } from "../ui/styles.js";

const REASON_TEXT = {
  room: {
    title: "로그인이 필요합니다",
    body: "친구와 같은 방에서 땅을 두고 겨루려면 로그인이 필요해요. 기기를 바꿔도 점령한 지역과 점수가 그대로 이어집니다.",
  },
  rank: {
    title: "로그인이 필요합니다",
    body: "명예의 전당은 여행자 전체가 함께 올라가는 순위표예요. 내 기록을 올리고 순위를 보려면 로그인해 주세요.",
  },
};

export function LoginSheet({ reason = "room", onClose, onDone, flash }) {
  const [busy, setBusy] = useState(false);
  const t = REASON_TEXT[reason] || REASON_TEXT.room;

  async function go() {
    setBusy(true);
    try {
      const u = await signInGoogle();
      if (u) { flash(`${u.displayName || "여행자"}님, 환영해요`); onDone && onDone(u); }
    } catch (e) {
      flash("로그인에 실패했어요 · " + ((e && e.message) || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-scrim" style={S.modalScrim} onClick={onClose}>
      <div style={{ ...S.sheet, maxWidth: 340, textAlign: "center", padding: "26px 22px 20px" }}
        onClick={e => e.stopPropagation()} className="sheet-in scroll">
        <span style={{ fontSize: 40 }}>🔐</span>
        <b style={{ display: "block", fontSize: 17, color: "var(--ink)", margin: "12px 0 8px" }}>{t.title}</b>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.7, marginBottom: 18 }}>{t.body}</p>

        <button disabled={busy} onClick={go} style={{ ...S.googleBtn, opacity: busy ? .6 : 1 }}>
          <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-4H24v7.6h12c-.2 2-1.5 5-4.4 7l6.7 5.2C42.2 36.2 45 30.6 45 24z"/>
            <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.4c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7.1 5.5C8 40.9 15.4 46 24 46z"/>
            <path fill="#FBBC05" d="M11.5 28.4c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4l-7.1-5.5C2.9 17 2 20.4 2 24s.9 7 2.4 9.9l7.1-5.5z"/>
            <path fill="#EA4335" d="M24 10.6c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.9 4.3 29.9 2 24 2 15.4 2 8 7.1 4.4 14.1l7.1 5.5c1.8-5.3 6.7-9 12.5-9z"/>
          </svg>
          {busy ? "로그인 중…" : "구글 계정으로 계속하기"}
        </button>

        <button onClick={onClose} style={S.setCancelBtn}>나중에 하기</button>
        <p style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.6, marginTop: 6 }}>
          로그인해도 혼자 플레이는 지금 그대로예요. 닉네임과 점수만 다른 여행자에게 보입니다.
        </p>
      </div>
    </div>
  );
}
