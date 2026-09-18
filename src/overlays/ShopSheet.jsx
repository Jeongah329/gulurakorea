/**
 * 카드 상점 — 코인으로 개인 카드를 산다.
 * 코인은 점령할 때 쌓이고 통행료로 빠져나가는 소모성 자원이라 상점 화폐로 쓴다.
 * (점수는 명예의 전당 순위 기준이라 쓰면 순위가 내려가므로 쓰지 않는다)
 */
import React, { useState } from "react";
import { CARD_PRICE, PERSONAL_CARDS, PERSONAL_CARD_WHEN_LABEL, ROOM_CARDS } from "../data/constants.js";
import { CARD_USE_MS, CardUseOverlay } from "../ui/primitives.jsx";
import { S } from "../ui/styles.js";

/* 방 카드의 "모두 한 번 더"는 개인 카드와 id 가 같아 가격을 따로 찾는다 */
function priceOf(card, kind) {
  if (kind === "room") return CARD_PRICE["room_" + card.id] ?? CARD_PRICE[card.id];
  return CARD_PRICE[card.id];
}

export function ShopSheet({ coins, onBuy, onClose, inRoom, flash }) {
  const [fx, setFx] = useState(null);
  const [confirm, setConfirm] = useState(null);

  function buy(card, kind) {
    const price = priceOf(card, kind);
    if (coins < price) { flash("코인이 모자라요"); return; }
    if (kind === "room" && !inRoom) { flash("방에 참여 중일 때 살 수 있어요"); return; }
    setConfirm(null);
    setFx({ icon: card.icon, label: `${card.name} 구매 중…` });
    setTimeout(() => { onBuy(card, price, kind); setFx(null); }, CARD_USE_MS);
  }

  if (confirm) {
    const price = priceOf(confirm, confirm._kind);
    const roomLocked = confirm._kind === "room" && !inRoom;
    const enough = coins >= price && !roomLocked;
    return (
      <div className="modal-scrim" style={S.modalScrim} onClick={() => setConfirm(null)}>
        <div style={{ ...S.sheet, maxWidth: 330, textAlign: "center", padding: "24px 20px 18px" }}
          onClick={e => e.stopPropagation()} className="sheet-in scroll">
          <span style={{ fontSize: 38 }}>{confirm.icon}</span>
          <b style={{ display: "block", fontSize: 17, color: "var(--ink)", margin: "10px 0 6px" }}>{confirm.name}</b>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 4 }}>{confirm.desc}</p>
          <p style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 16 }}>
            {confirm._kind === "room" ? "방 카드 · 방에 참여 중일 때 사용" : PERSONAL_CARD_WHEN_LABEL[confirm.when]}
          </p>
          <div style={S.shopPriceRow}>
            <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>가격</span>
            <b style={{ marginLeft: "auto", fontFamily: "'HiKR',sans-serif", fontSize: 18, color: "var(--ink)" }}>🪙 {price}</b>
          </div>
          <p style={{ fontSize: 11.5, color: enough ? "var(--ink-soft)" : "#D64545", margin: "8px 0 14px" }}>
            {roomLocked ? "방에 참여 중일 때 살 수 있어요"
              : enough ? `사고 나면 ${coins - price}코인이 남아요` : `${price - coins}코인이 모자라요`}
          </p>
          <button disabled={!enough} onClick={() => buy(confirm, confirm._kind)}
            style={{ ...S.roomPrimary, width: "100%", opacity: enough ? 1 : .45, cursor: enough ? "pointer" : "default" }}>
            구매하기
          </button>
          <button onClick={() => setConfirm(null)} style={S.setCancelBtn}>취소</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-scrim" style={S.modalScrim} onClick={onClose}>
      <div style={S.sheet} onClick={e => e.stopPropagation()} className="sheet-in scroll">
        {fx && <CardUseOverlay icon={fx.icon} label={fx.label} />}
        <div style={S.setHead}>
          <span style={{ minWidth: 52 }} />
          <b style={{ fontSize: 15, color: "var(--ink)", whiteSpace: "nowrap" }}>카드 상점</b>
          <button onClick={onClose} style={S.setBack}>닫기</button>
        </div>

        <div style={S.shopCoin}>
          <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>보유 코인</span>
          <b style={{ marginLeft: "auto", fontFamily: "'HiKR',sans-serif", fontSize: 22, color: "var(--ink)" }}>🪙 {coins}</b>
        </div>
        <p style={S.dropRateNote}>
          코인은 지역을 점령할 때 쌓여요. 일반 지역 30코인, 인구감소지역 60코인이고 통행료로도 쓰입니다.
        </p>

        {[["개인 카드", PERSONAL_CARDS, "personal"], ["방 카드", ROOM_CARDS, "room"]].map(([title, list, kind]) => (
          <div key={kind} style={{ marginBottom: 14 }}>
            <p style={S.shopGroupTitle}>
              {kind === "room" ? "👥 " : "🧑 "}{title}
              {kind === "room" && !inRoom && <span style={{ fontWeight: 600, color: "var(--ink-soft)" }}> · 방에 참여해야 사용 가능</span>}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {list.map(card => {
                const price = priceOf(card, kind);
                const enough = coins >= price && !(kind === "room" && !inRoom);
                return (
                  <button key={kind + card.id} onClick={() => setConfirm({ ...card, _kind: kind })} style={S.shopRow}>
                    <span style={{ fontSize: 22, width: 30, textAlign: "center" }}>{card.icon}</span>
                    <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <b style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", display: "block" }}>{card.name}</b>
                      <span style={{ fontSize: 11.5, color: "var(--ink-soft)", display: "block", marginTop: 2 }}>{card.desc}</span>
                    </span>
                    <span style={{ ...S.shopPrice, opacity: enough ? 1 : .45 }}>🪙 {price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
