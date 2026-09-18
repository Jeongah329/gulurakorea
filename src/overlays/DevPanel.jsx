/**
 * 개발자 도구 — 테스트용 히든 패널
 *
 * 여는 방법
 *  상단 로고를 2초 안에 5번 연속으로 탭한 뒤, 뜨는 입력창에 암호를 넣는다.
 *  암호는 data/constants.js 의 DEV_PASSCODE 에 있다.
 *
 * 일반 사용자에게는 어떤 흔적도 보이지 않습니다.
 * 공모전 심사나 실서비스 전에 빼려면 App.jsx 에서 DevPanel 렌더 부분만 지우면 됩니다.
 */
import React, { useState } from "react";
import { DAILY_ROLLS, PERSONAL_CARDS, ROOM_CARDS } from "../data/constants.js";
import { S } from "../ui/styles.js";

function Row({ label, children }) {
  return (
    <div style={S.devRow}>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink)", flex: 1 }}>{label}</span>
      <span style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>{children}</span>
    </div>
  );
}

export function DevPanel({ onClose, state, actions, flash }) {
  const [view, setView] = useState("main");   // main | cards

  const B = ({ onClick, children }) => (
    <button onClick={onClick} style={S.devBtn}>{children}</button>
  );

  if (view === "cards") {
    return (
      <div className="modal-scrim" style={S.devScrim} onClick={onClose}>
        <div style={S.sheet} onClick={e => e.stopPropagation()} className="sheet-in scroll">
          <div style={S.setHead}>
            <button onClick={() => setView("main")} style={S.setBack}>‹ 뒤로</button>
            <b style={{ fontSize: 15, color: "var(--ink)", whiteSpace: "nowrap" }}>카드 지급</b>
            <button onClick={onClose} style={S.setBack}>닫기</button>
          </div>
          <p style={S.devNote}>누르면 그 카드가 인벤토리에 1장 들어갑니다.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {PERSONAL_CARDS.map(c => (
              <button key={c.id} style={S.shopRow} onClick={() => { actions.giveCard(c, "personal"); flash(`${c.icon} ${c.name} 지급`); }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{c.icon}</span>
                <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>개인</span>
              </button>
            ))}
            {ROOM_CARDS.map(c => (
              <button key={c.id} style={S.shopRow} onClick={() => { actions.giveCard(c, "room"); flash(`${c.icon} ${c.name} 지급`); }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{c.icon}</span>
                <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "var(--sea)" }}>방</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-scrim" style={S.devScrim} onClick={onClose}>
      <div style={S.sheet} onClick={e => e.stopPropagation()} className="sheet-in scroll">
        <div style={S.setHead}>
          <span style={{ minWidth: 52 }} />
          <b style={{ fontSize: 15, color: "var(--ink)", whiteSpace: "nowrap" }}>🛠 개발자 도구</b>
          <button onClick={onClose} style={S.setBack}>닫기</button>
        </div>

        <p style={S.devNote}>
          테스트용 화면입니다. 일반 사용자에게는 보이지 않아요.
          한 번 열면 이 세션 동안은 로고를 한 번만 눌러도 다시 열립니다.
        </p>

        <div style={S.devGroup}>
          <Row label={`주사위 (남은 ${state.rollsLeft}회)`}>
            <B onClick={() => actions.addRolls(1)}>+1</B>
            <B onClick={() => actions.addRolls(5)}>+5</B>
            <B onClick={() => actions.setRolls(DAILY_ROLLS)}>{DAILY_ROLLS}회로</B>
            <B onClick={() => actions.setRolls(99)}>99회</B>
          </Row>
          <Row label={`코인 (${state.coins})`}>
            <B onClick={() => actions.addCoins(100)}>+100</B>
            <B onClick={() => actions.addCoins(1000)}>+1000</B>
            <B onClick={() => actions.setCoins(0)}>0</B>
          </Row>
          <Row label={`점수 (${state.score})`}>
            <B onClick={() => actions.addScore(100)}>+100</B>
            <B onClick={() => actions.addScore(1000)}>+1000</B>
            <B onClick={() => actions.setScore(0)}>0</B>
          </Row>
        </div>

        <div style={S.devGroup}>
          <Row label={`점령 (${state.ownedCount}곳)`}>
            <B onClick={actions.grantRandom}>무작위 1곳</B>
            <B onClick={() => actions.grantRandom(10)}>10곳</B>
            <B onClick={actions.clearOwnership}>전부 해제</B>
          </Row>
          <Row label="카드">
            <B onClick={() => setView("cards")}>골라서 지급</B>
            <B onClick={actions.giveAllCards}>전부 1장씩</B>
            <B onClick={actions.clearCards}>비우기</B>
          </Row>
        </div>

        <div style={S.devGroup}>
          <Row label="날짜">
            <B onClick={actions.rewindDay}>어제로 (자정 충전 시험)</B>
          </Row>
          <Row label="출발 지역">
            <B onClick={actions.resetHome}>다시 정하기</B>
          </Row>
        </div>

        <p style={S.devNote}>
          여기서 바꾼 값도 그대로 저장됩니다. 처음 상태로 되돌리려면 설정의 기록 초기화를 쓰세요.
        </p>
      </div>
    </div>
  );
}
