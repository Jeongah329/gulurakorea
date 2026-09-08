/**
 * 카카오맵 렌더 컴포넌트
 */
import React, { useState, useRef, useEffect } from "react";
import { loadKakaoSdk } from "../api/kakao.js";
import { S, CSS } from './styles';

/* 카카오맵 컴포넌트 — 로드 실패 시 사유를 보여주는 대체 박스 */
export function KakaoMap({ lat, lng, title, height = 160, level = 5 }) {
  const ref = useRef(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    let dead = false;
    if (!isFinite(lat) || !isFinite(lng)) { setErr("좌표 정보가 없는 목적지예요"); return; }
    setErr("");
    loadKakaoSdk().then(kakao => {
      if (dead || !ref.current) return;
      const center = new kakao.maps.LatLng(lat, lng);
      const map = new kakao.maps.Map(ref.current, { center, level });
      const marker = new kakao.maps.Marker({ position: center });
      marker.setMap(map);
      const label = String(title || "").replace(/[<>"'&]/g, "");
      if (label) {
        new kakao.maps.InfoWindow({
          content: '<div style="padding:5px 9px;font-size:12px;font-weight:700;white-space:nowrap">' + label + '</div>',
        }).open(map, marker);
      }
      map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
    }).catch(e => { if (!dead) setErr(String((e && e.message) || e)); });
    return () => { dead = true; };
  }, [lat, lng, title, level]);

  if (err) return (<div style={{ ...S.mapFallback, height }}><span style={{ fontSize: 20 }}>🗺️</span><span style={{ fontWeight: 800 }}>카카오맵을 불러오지 못했어요</span><span style={{ opacity: .8 }}>{err}</span></div>);
  return <div ref={ref} style={{ width: "100%", height, borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", background: "var(--paper-2)" }} />;
}
