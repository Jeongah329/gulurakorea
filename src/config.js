/**
 * API 키 설정.
 *
 * 값은 .env 파일(gitignore 대상)에서 읽습니다. 저장소에는 절대 실제 키를 커밋하지 마세요.
 * .env.example 을 복사해 .env 를 만들고 각자 발급받은 키를 채워 넣으면 됩니다.
 *
 * 주의:
 *  - Vite 의 VITE_ 접두사 변수는 빌드 결과물(브라우저 번들)에 그대로 들어갑니다.
 *    즉 "저장소에 안 올린다"는 것이지 "브라우저에서 안 보인다"는 뜻이 아닙니다.
 *  - Kakao JavaScript 키는 도메인 제한이 걸리므로 노출을 전제로 설계된 키입니다.
 *  - data.go.kr 인증키와 Kakao REST 키는 서버 보관이 원칙입니다.
 *    실서비스에서는 VITE_TOUR_PROXY / VITE_KAKAO_PROXY 에 자체 프록시 주소를 넣고
 *    키 자체는 서버에만 두세요.
 */
const env = (typeof import.meta !== "undefined" && import.meta.env) || {};

export default {
  tourKey:     env.VITE_TOUR_API_KEY     || "",
  tourProxy:   env.VITE_TOUR_PROXY       || "",
  kakaoJs:     env.VITE_KAKAO_JS_KEY     || "",
  kakaoRest:   env.VITE_KAKAO_REST_KEY   || "",
  kakaoNative: env.VITE_KAKAO_NATIVE_KEY || "",
  kakaoProxy:  env.VITE_KAKAO_PROXY      || "",
  /* 초대 링크에 쓸 서비스 주소. 미리보기 파일이나 로컬에서 열어도 항상 실서비스를 가리킨다. */
  siteUrl:     env.VITE_SITE_URL         || "https://gulura-korea.netlify.app",
};
