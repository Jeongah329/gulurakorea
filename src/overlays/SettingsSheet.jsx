/**
 * 설정 시트 — 계정 · 게임 · 정보 · 지원 · 탈퇴
 */
import React, { useEffect, useRef, useState } from "react";
import CFG from "../config.js";
import { APP_VERSION } from "../data/constants.js";
import { isNameTaken } from "../api/leaderboard.js";
import { S } from "../ui/styles.js";

function Group({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={S.setGroupTitle}>{title}</p>
      <div className="set-group" style={S.setGroup}>{children}</div>
    </div>
  );
}

function Row({ label, hint, right, onClick, danger }) {
  const clickable = typeof onClick === "function";
  return (
    <button
      onClick={clickable ? onClick : undefined}
      style={{ ...S.setRow, cursor: clickable ? "pointer" : "default" }}
    >
      <span style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
        <b style={{ fontSize: 13.5, fontWeight: 800, color: danger ? "#D64545" : "var(--ink)", display: "block" }}>{label}</b>
        {hint && <span style={{ fontSize: 11.5, color: "var(--ink-soft)", display: "block", marginTop: 2, lineHeight: 1.5 }}>{hint}</span>}
      </span>
      {right && <span style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: 10, flexShrink: 0 }}>{right}</span>}
      {clickable && !right && <span style={{ fontSize: 14, color: "var(--ink-soft)", marginLeft: 8 }}>›</span>}
    </button>
  );
}

export function SettingsSheet({
  onClose, myName, onNameChange, myId, avatar, onAvatarChange, room, leaveRoom,
  homeLabel, canChangeHome, onChangeHome,
  resetDemo, onDeleteAll, flash, initialView, user, onSignIn, onSignOut,
}) {
  const [view, setView] = useState(initialView || "main");   // main | account | name | doc | quit
  const [doc, setDoc] = useState(null);
  const [name, setName] = useState(myName || "");
  const [nameBusy, setNameBusy] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'reset' | 'quit'
  const [copyFail, setCopyFail] = useState(false);   // 복사가 막힌 환경에서 직접 고르도록
  const [reason, setReason] = useState("");     // 탈퇴 사유
  const [reasonEtc, setReasonEtc] = useState("");
  const [geo, setGeo] = useState("확인 중");
  const fileRef = useRef(null);

  /* 프로필 사진 — 정사각형 256px로 줄여서 브라우저에 저장한다 */
  function pickAvatar(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\//.test(f.type)) { flash("이미지 파일만 올릴 수 있어요"); return; }
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => flash("사진을 읽지 못했어요");
    reader.onload = () => {
      img.onerror = () => flash("이미지를 열지 못했어요");
      img.onload = () => {
        try {
          const S2 = 256, c = document.createElement("canvas");
          c.width = S2; c.height = S2;
          const side = Math.min(img.width, img.height);
          const ctx = c.getContext("2d");
          if (!ctx) { flash("이 브라우저에서는 사진을 처리할 수 없어요"); return; }
          ctx.drawImage(img, (img.width-side)/2, (img.height-side)/2, side, side, 0, 0, S2, S2);
          onAvatarChange(c.toDataURL("image/jpeg", 0.82));
          flash("프로필 사진을 바꿨어요");
        } catch (err) {
          flash("사진을 저장하지 못했어요");
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(f);
  }

  const QUIT_REASONS = [
    "여행을 자주 가지 않아요",
    "가고 싶은 지역이 잘 안 나와요",
    "인증 과정이 번거로워요",
    "같이 할 친구가 없어요",
    "오류가 자주 생겨요",
    "기타",
  ];

  /* 설정이 열려 있는 동안 뒤 화면 스크롤을 막는다 */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const y = window.scrollY;
    document.body.classList.add("modal-open");
    return () => { document.body.classList.remove("modal-open"); window.scrollTo(0, y); };
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) { setGeo("확인 불가"); return; }
    navigator.permissions.query({ name: "geolocation" })
      .then(r => setGeo({ granted: "허용됨", denied: "차단됨", prompt: "미설정" }[r.state] || r.state))
      .catch(() => setGeo("확인 불가"));
  }, []);

  const SHARE_URL = String(CFG.siteUrl || "").replace(/\/+$/, "") + "/";

  /* 클립보드 복사 — 최신 API가 막힌 환경(비보안 접속 등)에서는 예전 방식으로 넘어간다 */
  async function copyLink() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(SHARE_URL);
        setCopyFail(false);
        flash("링크를 클립보드에 복사했어요");
        return;
      }
      const ta = document.createElement("textarea");
      ta.value = SHARE_URL;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) { setCopyFail(false); flash("링크를 클립보드에 복사했어요"); }
      else { setCopyFail(true); flash("복사가 막혀 있어요 · 주소를 길게 눌러 복사해 주세요"); }
    } catch (e) {
      setCopyFail(true);
      flash("복사가 막혀 있어요 · 주소를 길게 눌러 복사해 주세요");
    }
  }

  function openContact() {
    if (!CFG.contactFormUrl) { flash("문의 폼 주소가 아직 등록되지 않았어요"); return; }
    /* 새 창으로만 연다.
       noopener 를 주면 창이 정상적으로 열려도 window.open 이 null 을 돌려주는데,
       그걸 실패로 보고 현재 창까지 이동시키는 바람에 창이 두 개 열렸다.
       열렸는지는 확인하지 않고, 차단된 경우에만 안내한다. */
    const w = window.open(CFG.contactFormUrl, "_blank");
    if (w) { try { w.opener = null; } catch (e) {} }
    else flash("새 창이 차단됐어요 · 브라우저에서 팝업을 허용해 주세요");
  }

  const DOCS = {
    terms: {
      title: "이용약관",
      body: `이 서비스는 한국관광콘텐츠랩 활용 공모전 출품작으로 제작된 비영리 시험 서비스입니다.

1. 서비스 성격
주사위로 뽑힌 국내 여행지를 실제로 방문하고 인증해 지역을 점령하는 게임입니다. 공모전 심사와 시연을 목적으로 운영되며 사전 공지 없이 중단될 수 있습니다.

2. 이용자의 책임
여행 중 발생하는 이동, 안전, 비용에 대한 책임은 이용자 본인에게 있습니다. 목적지는 무작위로 배정되므로 기상, 교통, 개방 시간 등을 직접 확인한 뒤 이동해 주세요.

3. 인증
도착 인증은 단말 위치 정보를 기준으로 합니다. 위치를 조작해 인증하는 행위는 제한될 수 있습니다.

4. 데이터
게임 기록은 사전 공지 없이 초기화될 수 있습니다.

5. 저작물
관광지 정보와 이미지는 한국관광공사 TourAPI에서 제공받아 표시합니다. 각 저작물의 권리는 원저작자에게 있습니다.`,
    },
    privacy: {
      title: "개인정보처리방침",
      body: `이 서비스는 회원가입과 로그인을 받지 않습니다. 이름, 연락처, 이메일 등 개인을 식별할 수 있는 정보를 수집하지 않습니다.

1. 수집하는 정보
· 익명 식별자 — 브라우저에 저장되는 무작위 문자열입니다. 로그인하지 않았을 때 참여자를 구분하는 데만 쓰입니다.
· 구글 계정 정보 — 로그인을 선택한 경우에만 계정 고유번호와 이메일, 프로필 이름을 받습니다. 기기를 바꿔도 기록을 이어주기 위한 용도이며, 이메일은 다른 이용자에게 보이지 않습니다.
· 닉네임 — 이용자가 직접 입력한 값입니다.
· 위치 정보 — 도착 인증과 목적지 추천에 사용합니다. 인증 시점의 좌표를 그때만 사용하며 서버에 따로 저장하지 않습니다.
· 게임 기록 — 점수, 점령한 지역, 인증 카드입니다.

2. 저장 위치
게임 기록은 브라우저 안에 저장됩니다. 방에 참여하면 닉네임, 점수, 점령한 지역이 Google Firebase Firestore에 저장되어 같은 방 참여자에게 공유됩니다.
또한 점수가 생기면 명예의 전당(전체 순위표)에 닉네임과 점수, 점령한 지역 수가 등록되어 모든 이용자에게 공개됩니다. 공개를 원하지 않으시면 설정의 탈퇴로 기록을 삭제할 수 있습니다.

3. 보관과 삭제
설정의 탈퇴를 누르면 브라우저에 저장된 기록과 참여 중인 방의 내 기록이 삭제됩니다. 브라우저 데이터를 지워도 같은 결과가 됩니다.

4. 위치 권한
브라우저 설정에서 언제든 위치 권한을 끌 수 있습니다. 권한을 끄면 도착 인증 기능은 사용할 수 없습니다.

5. 제3자 제공
수집한 정보를 광고나 마케팅 목적으로 제3자에게 제공하지 않습니다.`,
    },
    credit: {
      title: "만든 사람",
      body: `굴러라 대한민국
주사위로 떠나는 랜덤 국내여행
2026 한국관광콘텐츠랩 활용 공모전 출품작

공공데이터
· 한국관광공사 국문 관광정보 서비스(TourAPI 4.0)
  지역 기반 관광정보, 위치 기반 관광정보, 공통정보 조회를 사용해
  목적지 후보와 주변 미션 장소, 소개글과 대표 이미지를 가져옵니다.
· 행정안전부 인구감소지역 지정 자료
  황금 타일(2배 점수) 판정에 사용합니다.
· 전국 시·군·구 행정구역 경계 데이터
  땅따먹기 지도를 그리는 데 사용합니다.

연동 서비스
· 카카오맵 — 지도 표시, 길찾기, 행정구역 대조
· 카카오톡 공유 — 친구 초대 링크 전송
· Google Firebase — 온라인 방, 명예의 전당, 기록 저장, 로그인

만든 기술
React · Vite · Firebase Firestore`,
    },
  };

  /* 문서 보기 */
  if (view === "doc" && doc) {
    return (
      <div className="modal-scrim" style={S.modalScrim} onClick={onClose}>
        <div style={S.sheet} onClick={e => e.stopPropagation()} className="sheet-in scroll">
          <div style={S.setHead}>
            <button onClick={() => setView("main")} style={S.setBack}>‹ 뒤로</button>
            <b style={{ fontSize: 15, color: "var(--ink)", whiteSpace: "nowrap" }}>{DOCS[doc].title}</b>
            <span style={{ minWidth: 52 }} />
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{DOCS[doc].body}</p>
        </div>
      </div>
    );
  }

  /* 닉네임 변경 */
  if (view === "name") {
    return (
      <div className="modal-scrim" style={S.modalScrim} onClick={onClose}>
        <div style={S.sheet} onClick={e => e.stopPropagation()} className="sheet-in scroll">
          <div style={S.setHead}>
            <button onClick={() => setView(initialView === "account" ? "account" : "main")} style={S.setBack}>‹ 뒤로</button>
            <b style={{ fontSize: 15, color: "var(--ink)", whiteSpace: "nowrap" }}>닉네임 바꾸기</b>
            <span style={{ minWidth: 52 }} />
          </div>
          <input value={name} maxLength={10} placeholder="닉네임 입력 (최대 10자)"
            onChange={e => setName(e.target.value.slice(0, 10))}
            style={{ ...S.codeInput, width: "100%", boxSizing: "border-box", marginBottom: 12 }} />
          <p style={{ fontSize: 11.5, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 12px 2px" }}>
            다른 여행자가 쓰고 있는 닉네임은 쓸 수 없어요.
          </p>
          <button
            disabled={nameBusy}
            onClick={async () => {
              const v = name.trim();
              if (!v) { flash("닉네임을 입력해 주세요"); return; }
              if (v === (myName || "")) { setView(initialView === "account" ? "account" : "main"); return; }
              setNameBusy(true);
              const taken = await isNameTaken(v, myId);
              setNameBusy(false);
              if (taken) { flash("이미 쓰고 있는 닉네임이에요 · 다른 이름을 골라 주세요"); return; }
              onNameChange(v); flash("닉네임을 바꿨어요");
              setView(initialView === "account" ? "account" : "main");
            }}
            style={{ ...S.roomPrimary, width: "100%", opacity: nameBusy ? .6 : 1 }}>
            {nameBusy ? "확인 중…" : "저장"}
          </button>
        </div>
      </div>
    );
  }

  /* 탈퇴 1단계 — 사유 선택 */
  if (view === "quit" && !confirm) {
    const ready = reason && (reason !== "기타" || reasonEtc.trim());
    return (
      <div className="modal-scrim" style={S.modalScrim} onClick={onClose}>
        <div style={S.sheet} onClick={e => e.stopPropagation()} className="sheet-in scroll">
          <div style={S.setHead}>
            <button onClick={() => setView("main")} style={S.setBack}>‹ 뒤로</button>
            <b style={{ fontSize: 15, color: "var(--ink)", whiteSpace: "nowrap" }}>탈퇴</b>
            <span style={{ minWidth: 52 }} />
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.7, textAlign: "center", marginBottom: 18 }}>
            여기까지 함께해 주셔서 고맙습니다.{"\n"}아쉬웠던 점을 남겨 주시면 더 나은 서비스를 만드는 데 쓰겠습니다.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
            {QUIT_REASONS.map(r => (
              <button key={r} onClick={() => setReason(r)}
                style={{ ...S.setReason, ...(reason === r ? S.setReasonOn : {}) }}>
                <span style={{ ...S.setRadio, ...(reason === r ? S.setRadioOn : {}) }} />
                <span style={{ fontSize: 13, color: "var(--ink)" }}>{r}</span>
              </button>
            ))}
          </div>
          {reason === "기타" && (
            <input value={reasonEtc} maxLength={60} placeholder="어떤 점이 아쉬우셨나요"
              onChange={e => setReasonEtc(e.target.value.slice(0, 60))}
              style={{ ...S.codeInput, width: "100%", boxSizing: "border-box", marginBottom: 14 }} />
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("main")} style={S.setGhostBtn}>이전</button>
            <button disabled={!ready} onClick={() => setConfirm("quit")}
              style={{ ...S.setDangerBtn, flex: 1, opacity: ready ? 1 : .45, cursor: ready ? "pointer" : "default" }}>
              탈퇴하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* 확인 창 */
  if (confirm) {
    const isQuit = confirm === "quit";
    return (
      <div className="modal-scrim" style={S.modalScrim} onClick={() => setConfirm(null)}>
        <div style={{ ...S.sheet, maxWidth: 320, textAlign: "center", padding: "26px 22px 18px" }}
          onClick={e => e.stopPropagation()} className="sheet-in scroll">
          <span style={S.setDangerIcon}>🗑</span>
          <b style={{ display: "block", fontSize: 17, color: "var(--ink)", margin: "14px 0 8px" }}>
            {isQuit ? "정말 탈퇴하시겠어요?" : "기록을 초기화할까요?"}
          </b>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 18 }}>
            {isQuit
              ? "탈퇴 버튼 선택 시, 계정은 삭제되며 복구되지 않습니다. 점령한 지역과 인증 카드도 함께 사라집니다."
              : "점수와 점령한 지역, 카드가 모두 사라집니다. 되돌릴 수 없어요."}
          </p>
          <button
            onClick={() => { setConfirm(null); onClose(); isQuit ? onDeleteAll(reason === "기타" ? reasonEtc.trim() : reason) : resetDemo(); }}
            style={S.setDangerBtn}>{isQuit ? "탈퇴" : "초기화"}</button>
          <button onClick={() => setConfirm(null)} style={S.setCancelBtn}>취소</button>
        </div>
      </div>
    );
  }

  /* 계정 — 프로필 연필에서 바로 들어오는 화면 */
  if (view === "account") {
    return (
      <div className="modal-scrim" style={S.modalScrim} onClick={onClose}>
        <div style={S.sheet} onClick={e => e.stopPropagation()} className="sheet-in scroll">
          <input ref={fileRef} type="file" accept="image/*" onChange={pickAvatar}
            onClick={e => e.stopPropagation()} style={{ display: "none" }} />
          <div style={S.setHead}>
            <button onClick={() => setView("main")} style={S.setBack}>‹ 뒤로</button>
            <b style={{ fontSize: 15, color: "var(--ink)", whiteSpace: "nowrap" }}>프로필 수정</b>
            <button onClick={onClose} style={S.setBack}>닫기</button>
          </div>
          <Group title="계정">
            <Row label="프로필 사진" hint="정사각형으로 잘라 브라우저에만 저장돼요"
              right={<span style={{ ...S.avatarSm, ...(avatar ? { background: `url(${avatar}) center/cover no-repeat` } : {}) }}>{avatar ? "" : "👤"}</span>}
              onClick={() => fileRef.current && fileRef.current.click()} />
            {avatar && <Row label="프로필 사진 지우기" hint="기본 아이콘으로 돌아가요"
              onClick={() => { onAvatarChange(""); flash("기본 아이콘으로 바꿨어요"); }} />}
            <Row label="닉네임 바꾸기" hint="방에서 친구에게 보이는 이름이에요"
              right={myName || "미설정"} onClick={() => setView("name")} />
            <Row label="출발 지역 변경"
              hint={canChangeHome
                ? "처음에 받은 지역을 다시 정할 수 있어요"
                : "방에 참여 중일 때는 바꿀 수 없어요. 방에서 나간 뒤 변경해 주세요"}
              right={homeLabel || "미설정"}
              onClick={canChangeHome ? onChangeHome : undefined} />
          </Group>
        </div>
      </div>
    );
  }

  /* 메인 */
  return (
    <div className="modal-scrim" style={S.modalScrim} onClick={onClose}>
      <div style={S.sheet} onClick={e => e.stopPropagation()} className="sheet-in scroll">
        <input ref={fileRef} type="file" accept="image/*" onChange={pickAvatar}
          onClick={e => e.stopPropagation()} style={{ display: "none" }} />
        <div style={S.setHead}>
          <span style={{ minWidth: 52 }} />
          <b style={{ fontSize: 15, color: "var(--ink)", whiteSpace: "nowrap" }}>설정</b>
          <button onClick={onClose} style={S.setBack}>닫기</button>
        </div>

        <Group title="계정">
          <Row label={user ? "로그인됨" : "구글 계정으로 로그인"}
            hint={user ? (user.email || "기록이 계정에 이어져요") : "방과 명예의 전당을 쓰려면 로그인이 필요해요"}
            right={user ? "로그아웃" : undefined}
            onClick={user ? onSignOut : onSignIn} />
          <Row label="프로필 사진" hint="정사각형으로 잘라 브라우저에만 저장돼요"
            right={<span style={{ position: "relative", display: "inline-block" }}>
              <span style={{ ...S.avatarSm, ...(avatar ? { background: `url(${avatar}) center/cover no-repeat` } : {}) }}>{avatar ? "" : "👤"}</span>
            </span>}
            onClick={() => fileRef.current && fileRef.current.click()} />
          {avatar && <Row label="프로필 사진 지우기" hint="기본 아이콘으로 돌아가요"
            onClick={() => { onAvatarChange(""); flash("기본 아이콘으로 바꿨어요"); }} />}
          <Row label="닉네임 바꾸기" hint="방에서 친구에게 보이는 이름이에요"
            right={myName || "미설정"} onClick={() => setView("name")} />
          <Row label="출발 지역 변경"
            hint={canChangeHome
              ? "처음에 받은 지역을 다시 정할 수 있어요"
              : "방에 참여 중일 때는 바꿀 수 없어요. 방에서 나간 뒤 변경해 주세요"}
            right={homeLabel || "미설정"}
            onClick={canChangeHome ? onChangeHome : undefined} />
        </Group>

        <Group title="게임">
          <Row label="방 나가기"
            hint={room ? "내가 점령한 지역은 그대로 남아요" : "참여 중인 방이 없어요"}
            right={room ? room.code : "—"}
            onClick={room ? () => { leaveRoom(); onClose(); } : undefined} />
          <Row label="기록 초기화" hint="점수와 점령한 지역, 카드를 처음 상태로 되돌려요"
            onClick={() => setConfirm("reset")} />
        </Group>

        <Group title="정보">
          <Row label="위치 권한" hint="도착 인증에 필요해요. 브라우저 주소창의 자물쇠 아이콘에서 바꿀 수 있어요" right={geo} />
          <Row label="데이터 저장 안내"
            hint="혼자 할 때는 브라우저에만 저장돼요. 방에 들어가면 닉네임과 점령 기록이 같은 방 친구에게 공유됩니다. 브라우저 기록을 지우면 게임 기록도 사라져요" />
          <Row label="버전" right={APP_VERSION} />
        </Group>

        <Group title="지원">
          <Row label="문의하기" hint="버그 제보나 의견을 남겨주세요 · 구글 폼으로 연결돼요" right="열기" onClick={openContact} />
          <Row label="앱 공유하기" hint={SHARE_URL} right="복사" onClick={copyLink} />
          {copyFail && (
            <div style={S.copyFallback}>
              <p style={{ fontSize: 11.5, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 8 }}>
                이 환경에서는 자동 복사가 막혀 있어요. 아래 주소를 눌러 전체 선택한 뒤 복사해 주세요.
              </p>
              <input readOnly value={SHARE_URL}
                onFocus={e => e.target.select()} onClick={e => e.target.select()}
                style={{ ...S.codeInput, width: "100%", boxSizing: "border-box", fontSize: 12.5 }} />
            </div>
          )}
          <Row label="이용약관" onClick={() => { setDoc("terms"); setView("doc"); }} />
          <Row label="개인정보처리방침" onClick={() => { setDoc("privacy"); setView("doc"); }} />
          <Row label="만든 사람" onClick={() => { setDoc("credit"); setView("doc"); }} />
        </Group>

        <Group title=" ">
          <Row danger label="탈퇴" hint="기록이 모두 삭제되며 복구되지 않아요" onClick={() => setView("quit")} />
        </Group>
      </div>
    </div>
  );
}
