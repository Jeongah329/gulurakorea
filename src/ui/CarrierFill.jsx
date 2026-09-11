/**
 * 캐리어(여행 가방) 모양 점령도 게이지 — 참고 이미지 스타일(둥근 손잡이 + 세로 그립 라인 + 사각 다리)
 * percent(0~100)만큼 몸통 안쪽이 차오르고, 표면이 계속 찰랑거리는 물결 애니메이션.
 */
import React, { useId } from "react";

export function CarrierFill({ percent = 0, color = "var(--stamp)", size = 46, delay = 0 }) {
  const uid = useId();
  const clipId = "cClip-" + uid;
  const gradId = "cGrad-" + uid;
  const p = Math.max(0, Math.min(100, percent));
  const h = Math.round((size * 78) / 60);

  return (
    <svg width={size} height={h} viewBox="0 0 60 78" style={{ flexShrink: 0, overflow: "visible" }}>
      <defs>
        {/* 몸통만 클립 — 손잡이는 채워지지 않아요 */}
        <clipPath id={clipId}>
          <rect x="8" y="18" width="44" height="52" rx="10" />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="18%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* 빈 몸통 배경 (은은한 상단 음영으로 입체감) */}
      <rect x="8" y="18" width="44" height="52" rx="10" fill="var(--paper-2)" />
      <rect x="8" y="18" width="44" height="10" rx="10" fill="rgba(0,0,0,.05)" />

      {/* 점령도만큼 튀어오르듯 차오르며 계속 찰랑이는 액체 (몸통 안에서만) */}
      <g clipPath={`url(#${clipId})`}>
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center bottom",
            transform: `scaleY(${p / 100})`,
            transition: `transform 1.35s cubic-bezier(.34,1.56,.5,1) ${delay}ms`,
          }}
        >
          <rect x="6" y="18" width="48" height="54" fill={`url(#${gradId})`} />
          <g fill={color}>
            <path d="M-60,14 C-45,9.5 -45,18.5 -30,14 C-15,9.5 -15,18.5 0,14 C15,9.5 15,18.5 30,14 C45,9.5 45,18.5 60,14 C75,9.5 75,18.5 90,14 C105,9.5 105,18.5 120,14 L120,24 L-60,24 Z">
              <animateTransform attributeName="transform" type="translate" values="0 0;-60 0" dur="2.6s" repeatCount="indefinite" additive="sum" />
              <animateTransform attributeName="transform" type="translate" values="0 0;0 -0.7;0 0" dur="2.1s" repeatCount="indefinite" additive="sum" />
            </path>
          </g>
          <g fill="#fff" opacity="0.28">
            <path d="M-60,15 C-42,18.5 -42,11.5 -24,15 C-6,18.5 -6,11.5 12,15 C30,18.5 30,11.5 48,15 C66,18.5 66,11.5 84,15 C102,18.5 102,11.5 120,15 L120,18 L-60,18 Z">
              <animateTransform attributeName="transform" type="translate" values="0 0;60 0" dur="3.3s" repeatCount="indefinite" additive="sum" />
            </path>
          </g>
        </g>
      </g>

      {/* 유리질 광택 (좌측 세로 하이라이트) */}
      <rect x="11" y="24" width="6" height="42" rx="3" fill="rgba(255,255,255,.32)" />

      {/* 손잡이 + 연결 기둥 (채워지지 않는 영역) */}
      <line x1="24" y1="10" x2="24" y2="19" stroke="var(--line)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="36" y1="10" x2="36" y2="19" stroke="var(--line)" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="20" y="2" width="20" height="10" rx="5" fill="var(--paper)" stroke="var(--line)" strokeWidth="1.8" />

      {/* 몸통 윤곽선 (맨 위) */}
      <rect x="8" y="18" width="44" height="52" rx="10" fill="none" stroke="var(--line)" strokeWidth="1.8" />

      {/* 세로 그립 라인 3개 — 테두리만 그려서 안쪽 액체가 비쳐 보임 */}
      <rect x="16" y="28" width="4" height="32" rx="2" fill="none" stroke="var(--line)" strokeWidth="1.8" />
      <rect x="28" y="28" width="4" height="32" rx="2" fill="none" stroke="var(--line)" strokeWidth="1.8" />
      <rect x="40" y="28" width="4" height="32" rx="2" fill="none" stroke="var(--line)" strokeWidth="1.8" />

      {/* 다리 */}
      <rect x="16" y="66" width="8" height="8" rx="2" fill="var(--paper)" stroke="var(--line)" strokeWidth="1.6" />
      <rect x="36" y="66" width="8" height="8" rx="2" fill="var(--paper)" stroke="var(--line)" strokeWidth="1.6" />
    </svg>
  );
}
