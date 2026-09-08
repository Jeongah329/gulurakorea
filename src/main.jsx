import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import InviteAccept from "./components/InviteAccept.jsx";

// /invite/코드 로 접속했으면 초대 수락 화면을, 아니면 평소대로 App을 렌더
const isInviteRoute = window.location.pathname.startsWith("/invite/");

/**
 * 최상위 에러 바운더리.
 * 이게 없으면 렌더링 중 에러가 하나만 나도 화면 전체가 "빈 화면"으로 사라지고
 * 콘솔을 열지 않는 한 원인을 알 수 없습니다. 대신 실제 에러 메시지를 화면에 보여줍니다.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[App crashed]", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100%", padding: 20, background: "#23304d", color: "#fff",
          fontFamily: "system-ui, sans-serif", boxSizing: "border-box",
        }}>
          <h2 style={{ marginTop: 0 }}>⚠️ 화면 렌더링 중 오류가 발생했어요</h2>
          <p style={{ opacity: .85, fontSize: 13, lineHeight: 1.6 }}>
            아래 메시지를 그대로 복사해서 알려주시면 원인을 바로 찾을 수 있어요.
          </p>
          <pre style={{
            whiteSpace: "pre-wrap", wordBreak: "break-word", background: "rgba(0,0,0,.35)",
            padding: 12, borderRadius: 8, fontSize: 12, lineHeight: 1.5,
          }}>
            {String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: 12, padding: "10px 16px", borderRadius: 8, border: "none", background: "#4C7FCF", color: "#fff", fontWeight: 700 }}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isInviteRoute ? <InviteAccept /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);